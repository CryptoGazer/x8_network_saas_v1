from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.db.session import get_db
from app.schemas.subscription import Subscription as SubscriptionSchema, SubscriptionCreate
from app.core.deps import get_current_user
from app.models.user import User
from app.models.subscription import Subscription

router = APIRouter(prefix="/api/v1/subscriptions", tags=["subscriptions"])


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


@router.post("/checkout", response_model=dict)
async def create_checkout_session(
    subscription_data: SubscriptionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return {
        "message": "Stripe checkout not implemented yet",
        "plan": subscription_data.plan,
        "amount": subscription_data.amount
    }


@router.post("/webhook")
async def stripe_webhook(db: AsyncSession = Depends(get_db)):
    return {"message": "Stripe webhook not implemented yet"}
