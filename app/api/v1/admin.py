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
    """Get system-wide statistics"""
    # Count users by role
    manager_count = await db.scalar(
        select(func.count()).select_from(User).where(User.role == UserRole.MANAGER)
    )
    client_count = await db.scalar(
        select(func.count()).select_from(User).where(User.role == UserRole.CLIENT)
    )

    return {
        "total_managers": manager_count,
        "total_clients": client_count,
        "total_users": manager_count + client_count + 1  # +1 for admin
    }
