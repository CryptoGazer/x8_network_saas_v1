"""
Script to create test users (managers and clients) for the X8 Network SaaS platform.
Usage: python create_test_users.py
"""
import asyncio
from datetime import datetime, timedelta
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.models.user import User, UserRole, SubscriptionTier
from app.core.security import get_password_hash


async def create_test_users():
    """Create test manager and client users."""
    async with AsyncSessionLocal() as session:
        # Create test manager
        manager_result = await session.execute(
            select(User).where(User.email == 'manager@x8work.com')
        )
        manager = manager_result.scalar_one_or_none()

        if not manager:
            manager = User(
                email='manager@x8work.com',
                hashed_password=get_password_hash('manager123'),
                full_name='Test Manager',
                role=UserRole.MANAGER,
                is_superuser=False,
                is_active=True
            )
            session.add(manager)
            await session.flush()
            print(f"Manager created: {manager.email}")
        else:
            print(f"Manager already exists: {manager.email}")

        # Create test clients assigned to the manager
        clients_data = [
            {
                'email': 'client1@test.com',
                'name': 'Test Client 1',
                'tier': SubscriptionTier.BASIC
            },
            {
                'email': 'client2@test.com',
                'name': 'Test Client 2',
                'tier': SubscriptionTier.PRO
            },
            {
                'email': 'client3@test.com',
                'name': 'Test Client 3',
                'tier': SubscriptionTier.TRIAL
            }
        ]

        for client_data in clients_data:
            client_result = await session.execute(
                select(User).where(User.email == client_data['email'])
            )
            client = client_result.scalar_one_or_none()

            if not client:
                client = User(
                    email=client_data['email'],
                    hashed_password=get_password_hash('client123'),
                    full_name=client_data['name'],
                    role=UserRole.CLIENT,
                    subscription_tier=client_data['tier'],
                    manager_id=manager.id,
                    trial_ends_at=datetime.utcnow() + timedelta(days=7) if client_data['tier'] == SubscriptionTier.TRIAL else None,
                    subscription_ends_at=datetime.utcnow() + timedelta(days=30) if client_data['tier'] != SubscriptionTier.TRIAL else None,
                    is_superuser=False,
                    is_active=True
                )
                session.add(client)
                print(f"Client created: {client_data['email']} (Manager: {manager.email})")
            else:
                print(f"Client already exists: {client_data['email']}")

        await session.commit()
        print("\n=== Test Users Created Successfully ===")
        print("\nManager Account:")
        print(f"  Email: manager@x8work.com")
        print(f"  Password: manager123")
        print("\nClient Accounts:")
        print(f"  Email: client1@test.com | Password: client123 | Tier: Basic")
        print(f"  Email: client2@test.com | Password: client123 | Tier: Pro")
        print(f"  Email: client3@test.com | Password: client123 | Tier: Trial")


if __name__ == "__main__":
    asyncio.run(create_test_users())
