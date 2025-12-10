from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.db.session import get_db
from app.schemas.user import User as UserSchema
from app.core.deps import get_current_manager, get_current_admin
from app.models.user import User, UserRole

router = APIRouter(prefix="/api/v1/managers", tags=["managers"])

@router.get("/clients", response_model=List[UserSchema])
async def get_my_clients(
    current_manager: User = Depends(get_current_manager),
    db: AsyncSession = Depends(get_db)
):
    """Get all clients assigned to this manager"""
    result = await db.execute(
        select(User).where(
            User.manager_id == current_manager.id,
            User.role == UserRole.CLIENT
        )
    )
    clients = result.scalars().all()
    return clients

@router.get("/clients/{client_id}", response_model=UserSchema)
async def get_client_details(
    client_id: int,
    current_manager: User = Depends(get_current_manager),
    db: AsyncSession = Depends(get_db)
):
    """Get specific client details (non-confidential)"""
    result = await db.execute(
        select(User).where(
            User.id == client_id,
            User.manager_id == current_manager.id,
            User.role == UserRole.CLIENT
        )
    )
    client = result.scalar_one_or_none()

    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found or not assigned to you"
        )

    return client


@router.get("/stats")
async def get_manager_stats(
    current_manager: User = Depends(get_current_manager),
    db: AsyncSession = Depends(get_db)
):
    """Get statistics for manager's assigned clients"""
    from app.models.user import SubscriptionTier
    from datetime import datetime, timezone
    from sqlalchemy import func

    # Count clients with paid subscriptions (not trial) for this manager
    clients_with_subscription = await db.scalar(
        select(func.count()).select_from(User).where(
            User.manager_id == current_manager.id,
            User.role == UserRole.CLIENT,
            User.subscription_tier.in_([SubscriptionTier.BASIC, SubscriptionTier.PRO, SubscriptionTier.ENTERPRISE])
        )
    )

    # Get clients on trial for this manager
    trial_clients_result = await db.execute(
        select(User).where(
            User.manager_id == current_manager.id,
            User.role == UserRole.CLIENT,
            User.subscription_tier == SubscriptionTier.TRIAL
        )
    )
    trial_clients = trial_clients_result.scalars().all()

    # Get clients with paid subscriptions for renewal tracking
    paid_clients_result = await db.execute(
        select(User).where(
            User.manager_id == current_manager.id,
            User.role == UserRole.CLIENT,
            User.subscription_tier.in_([SubscriptionTier.BASIC, SubscriptionTier.PRO, SubscriptionTier.ENTERPRISE])
        )
    )
    paid_clients = paid_clients_result.scalars().all()

    # Calculate trial clients with days remaining
    trial_clients_list = []
    for client in trial_clients:
        if client.trial_ends_at:
            days_remaining = (client.trial_ends_at - datetime.now(timezone.utc)).days
            trial_clients_list.append({
                "id": client.id,
                "email": client.email,
                "full_name": client.full_name,
                "days_remaining": max(0, days_remaining)
            })

    # Calculate paid clients with renewal dates
    paid_clients_list = []
    for client in paid_clients:
        if client.subscription_ends_at:
            days_until_renewal = (client.subscription_ends_at - datetime.now(timezone.utc)).days
            paid_clients_list.append({
                "id": client.id,
                "email": client.email,
                "full_name": client.full_name,
                "subscription_tier": client.subscription_tier,
                "days_until_renewal": max(0, days_until_renewal),
                "renewal_date": client.subscription_ends_at.isoformat()
            })

    return {
        "clients_with_subscription": clients_with_subscription,
        "clients_on_trial": len(trial_clients),
        "trial_clients": trial_clients_list,
        "paid_clients": paid_clients_list
    }


# Add more manager-specific endpoints
