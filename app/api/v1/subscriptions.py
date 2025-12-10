from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.db.session import get_db
from app.schemas.subscription import Subscription as SubscriptionSchema, SubscriptionCreate
from app.core.deps import get_current_user
from app.models.user import User
from app.models.subscription import Subscription, SubscriptionStatus
from app.core.config import settings
import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY

router = APIRouter(prefix="/api/v1/subscriptions", tags=["subscriptions"])

# Define subscription plans with pricing (in cents)
SUBSCRIPTION_PLANS = {
    "single": {
        "name": "Single Plan",
        "amount": 999,  # $9.99
        "currency": "usd",
        "description": "1 channel access"
    },
    "double": {
        "name": "Double Plan",
        "amount": 1999,  # $19.99
        "currency": "usd",
        "description": "2 channels access"
    },
    "growth": {
        "name": "Growth Plan",
        "amount": 4999,  # $49.99
        "currency": "usd",
        "description": "6 channels (all available channels)"
    },
    "special": {
        "name": "Special Offer",
        "amount": 2999,  # $29.99
        "currency": "usd",
        "description": "Special promotional plan"
    }
}


@router.get("", response_model=List[SubscriptionSchema])
async def list_subscriptions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Subscription).where(Subscription.user_id == current_user.id)
    )
    subscriptions = result.scalars().all()
    return subscriptions


@router.get("/active", response_model=SubscriptionSchema)
async def get_active_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from app.models.subscription import SubscriptionStatus

    result = await db.execute(
        select(Subscription).where(
            Subscription.user_id == current_user.id,
            Subscription.status == SubscriptionStatus.ACTIVE
        )
    )
    subscription = result.scalar_one_or_none()

    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active subscription found"
        )

    return subscription


@router.post("/create-payment-link", response_model=dict)
async def create_payment_link(
    plan_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a Stripe payment link for a subscription plan.
    Plan IDs: single, double, growth, special
    """
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables."
        )

    if plan_id not in SUBSCRIPTION_PLANS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid plan ID. Available plans: {', '.join(SUBSCRIPTION_PLANS.keys())}"
        )

    plan = SUBSCRIPTION_PLANS[plan_id]

    try:
        # Create or get Stripe customer
        stripe_customer_id = None
        if current_user.stripe_customer_id:
            stripe_customer_id = current_user.stripe_customer_id
        else:
            customer = stripe.Customer.create(
                email=current_user.email,
                name=current_user.full_name,
                metadata={
                    "user_id": str(current_user.id)
                }
            )
            stripe_customer_id = customer.id

            # Update user with Stripe customer ID
            current_user.stripe_customer_id = stripe_customer_id
            await db.commit()

        # Create a Stripe Price for this plan
        price = stripe.Price.create(
            currency=plan["currency"],
            unit_amount=plan["amount"],
            recurring={"interval": "month"},
            product_data={
                "name": plan["name"],
                "description": plan["description"]
            }
        )

        # Create payment link
        payment_link = stripe.PaymentLink.create(
            line_items=[{
                "price": price.id,
                "quantity": 1
            }],
            after_completion={
                "type": "redirect",
                "redirect": {
                    "url": f"{settings.FRONTEND_URL}/dashboard?payment=success&plan={plan_id}"
                }
            },
            metadata={
                "user_id": str(current_user.id),
                "plan_id": plan_id
            }
        )

        return {
            "payment_link_url": payment_link.url,
            "plan": plan_id,
            "amount": plan["amount"] / 100,  # Convert cents to dollars
            "currency": plan["currency"]
        }

    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Handle Stripe webhook events for payment confirmations.
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    if not settings.STRIPE_WEBHOOK_SECRET:
        # For development without webhook secret, just process the event
        event = stripe.Event.construct_from(
            await request.json(), stripe.api_key
        )
    else:
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid payload")
        except stripe.error.SignatureVerificationError:
            raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle the event
    if event.type == "checkout.session.completed":
        session = event.data.object
        await handle_successful_payment(session, db)

    elif event.type == "customer.subscription.created":
        subscription = event.data.object
        await handle_subscription_created(subscription, db)

    elif event.type == "customer.subscription.updated":
        subscription = event.data.object
        await handle_subscription_updated(subscription, db)

    elif event.type == "customer.subscription.deleted":
        subscription = event.data.object
        await handle_subscription_cancelled(subscription, db)

    return {"status": "success"}


async def handle_successful_payment(session, db: AsyncSession):
    """Handle successful payment from Stripe."""
    user_id = int(session.metadata.get("user_id"))
    plan_id = session.metadata.get("plan_id")

    if not user_id or not plan_id:
        return

    # Get user
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        return

    # Create or update subscription
    result = await db.execute(
        select(Subscription).where(
            Subscription.user_id == user_id,
            Subscription.status == SubscriptionStatus.ACTIVE
        )
    )
    existing_subscription = result.scalar_one_or_none()

    plan_info = SUBSCRIPTION_PLANS.get(plan_id)

    if existing_subscription:
        # Update existing subscription
        existing_subscription.plan = plan_id
        existing_subscription.amount = plan_info["amount"] / 100
        existing_subscription.currency = plan_info["currency"]
        existing_subscription.status = SubscriptionStatus.ACTIVE
    else:
        # Create new subscription
        new_subscription = Subscription(
            user_id=user_id,
            plan=plan_id,
            status=SubscriptionStatus.ACTIVE,
            stripe_customer_id=session.customer,
            stripe_subscription_id=session.subscription,
            amount=plan_info["amount"] / 100,
            currency=plan_info["currency"]
        )
        db.add(new_subscription)

    await db.commit()


async def handle_subscription_created(subscription, db: AsyncSession):
    """Handle when a subscription is created in Stripe."""
    customer_id = subscription.customer
    subscription_id = subscription.id

    # Find user by Stripe customer ID
    result = await db.execute(
        select(User).where(User.stripe_customer_id == customer_id)
    )
    user = result.scalar_one_or_none()

    if not user:
        return

    # Update subscription with Stripe subscription ID
    result = await db.execute(
        select(Subscription).where(
            Subscription.user_id == user.id,
            Subscription.status == SubscriptionStatus.ACTIVE
        )
    )
    user_subscription = result.scalar_one_or_none()

    if user_subscription:
        user_subscription.stripe_subscription_id = subscription_id
        await db.commit()


async def handle_subscription_updated(subscription, db: AsyncSession):
    """Handle when a subscription is updated in Stripe."""
    subscription_id = subscription.id

    result = await db.execute(
        select(Subscription).where(
            Subscription.stripe_subscription_id == subscription_id
        )
    )
    user_subscription = result.scalar_one_or_none()

    if user_subscription:
        # Update status based on Stripe subscription status
        if subscription.status == "active":
            user_subscription.status = SubscriptionStatus.ACTIVE
        elif subscription.status == "canceled":
            user_subscription.status = SubscriptionStatus.CANCELLED
        elif subscription.status == "past_due":
            user_subscription.status = SubscriptionStatus.EXPIRED

        await db.commit()


async def handle_subscription_cancelled(subscription, db: AsyncSession):
    """Handle when a subscription is cancelled in Stripe."""
    subscription_id = subscription.id

    result = await db.execute(
        select(Subscription).where(
            Subscription.stripe_subscription_id == subscription_id
        )
    )
    user_subscription = result.scalar_one_or_none()

    if user_subscription:
        user_subscription.status = SubscriptionStatus.CANCELLED
        from datetime import datetime
        user_subscription.cancelled_at = datetime.utcnow()
        await db.commit()
