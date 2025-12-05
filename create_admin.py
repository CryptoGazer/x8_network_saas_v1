"""
Script to create an admin user for the X8 Network SaaS platform.
Usage: python create_admin.py
"""
import asyncio
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash


async def create_admin_user():
    """Create an admin user if one doesn't exist."""
    async with AsyncSessionLocal() as session:
        # Check if admin already exists
        result = await session.execute(
            select(User).where(User.role == UserRole.ADMIN)
        )
        existing_admin = result.scalar_one_or_none()

        if existing_admin:
            print(f"Admin user already exists: {existing_admin.email}")
            return

        # Create new admin user
        admin = User(
            email='admin@x8work.com',
            hashed_password=get_password_hash('admin123'),
            full_name='System Admin',
            role=UserRole.ADMIN,
            is_superuser=True,
            is_active=True
        )

        session.add(admin)
        await session.commit()
        await session.refresh(admin)

        print(f"Admin user created successfully!")
        print(f"Email: {admin.email}")
        print(f"Password: admin123")
        print(f"Role: {admin.role.value}")
        print(f"ID: {admin.id}")
        print("\nPlease change the password after first login!")


if __name__ == "__main__":
    asyncio.run(create_admin_user())
