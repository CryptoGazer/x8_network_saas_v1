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

# Add more manager-specific endpoints
