"""add_stripe_customer_id_to_users

Revision ID: 3194c30ed9ba
Revises: fb3fb3885ff7
Create Date: 2025-12-10 11:30:30.937821

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3194c30ed9ba'
down_revision: Union[str, Sequence[str], None] = 'fb3fb3885ff7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('users', sa.Column('stripe_customer_id', sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'stripe_customer_id')
