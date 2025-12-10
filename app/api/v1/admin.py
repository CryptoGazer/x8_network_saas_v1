from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from app.db.session import get_db
from app.schemas.user import User as UserSchema
from app.core.deps import get_current_admin
from app.models.user import User, UserRole

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])

@router.get("/managers", response_model=List[UserSchema])
async def get_all_managers(
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get all managers with statistics"""
    result = await db.execute(
        select(User).where(User.role == UserRole.MANAGER)
    )
    managers = result.scalars().all()
    return managers

@router.get("/clients", response_model=List[UserSchema])
async def get_all_clients(
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get all clients (non-confidential data)"""
    result = await db.execute(
        select(User).where(User.role == UserRole.CLIENT)
    )
    clients = result.scalars().all()
    return clients

@router.get("/stats")
async def get_system_stats(
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get system-wide statistics with subscription details"""
    from app.models.user import SubscriptionTier
    from datetime import datetime, timezone

    # Count managers
    manager_count = await db.scalar(
        select(func.count()).select_from(User).where(User.role == UserRole.MANAGER)
    )

    # Count clients with paid subscriptions (not trial)
    clients_with_subscription = await db.scalar(
        select(func.count()).select_from(User).where(
            User.role == UserRole.CLIENT,
            User.subscription_tier.in_([SubscriptionTier.BASIC, SubscriptionTier.PRO, SubscriptionTier.ENTERPRISE])
        )
    )

    # Get clients on trial
    trial_clients_result = await db.execute(
        select(User).where(
            User.role == UserRole.CLIENT,
            User.subscription_tier == SubscriptionTier.TRIAL
        )
    )
    trial_clients = trial_clients_result.scalars().all()

    # Get clients with paid subscriptions for renewal tracking
    paid_clients_result = await db.execute(
        select(User).where(
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
        "total_managers": manager_count,
        "clients_with_subscription": clients_with_subscription,
        "clients_on_trial": len(trial_clients),
        "trial_clients": trial_clients_list,
        "paid_clients": paid_clients_list
    }
