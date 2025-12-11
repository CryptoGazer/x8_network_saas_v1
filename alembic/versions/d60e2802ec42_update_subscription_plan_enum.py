"""update_subscription_plan_enum

Revision ID: d60e2802ec42
Revises: e7f2ec314303
Create Date: 2025-12-10 23:12:42.792059

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd60e2802ec42'
down_revision: Union[str, Sequence[str], None] = 'e7f2ec314303'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - Update subscription plan enum values."""
    # First, convert the column to text to allow intermediate values
    op.execute("ALTER TABLE subscriptions ALTER COLUMN plan TYPE text")

    # Update existing data: rename 'basic' to 'single', 'pro' to 'double' if they exist
    op.execute("UPDATE subscriptions SET plan = 'single' WHERE plan = 'basic'")
    op.execute("UPDATE subscriptions SET plan = 'double' WHERE plan = 'pro'")

    # Add new enum values to the type
    op.execute("ALTER TYPE subscriptionplan ADD VALUE IF NOT EXISTS 'single'")
    op.execute("ALTER TYPE subscriptionplan ADD VALUE IF NOT EXISTS 'double'")
    op.execute("ALTER TYPE subscriptionplan ADD VALUE IF NOT EXISTS 'growth'")

    # Convert the column back to the enum type
    op.execute("ALTER TABLE subscriptions ALTER COLUMN plan TYPE subscriptionplan USING plan::subscriptionplan")


def downgrade() -> None:
    """Downgrade schema - Revert subscription plan enum values."""
    # Convert to text for intermediate updates
    op.execute("ALTER TABLE subscriptions ALTER COLUMN plan TYPE text")

    # Revert data changes
    op.execute("UPDATE subscriptions SET plan = 'basic' WHERE plan = 'single'")
    op.execute("UPDATE subscriptions SET plan = 'pro' WHERE plan = 'double'")
    op.execute("UPDATE subscriptions SET plan = 'free' WHERE plan = 'growth'")

    # Convert back to enum
    op.execute("ALTER TABLE subscriptions ALTER COLUMN plan TYPE subscriptionplan USING plan::subscriptionplan")
