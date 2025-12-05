"""Add user roles and subscription management

Revision ID: 29b95a95f904
Revises: 02caa2b5ef30
Create Date: 2025-12-05 12:59:59.405024

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '29b95a95f904'
down_revision: Union[str, Sequence[str], None] = '02caa2b5ef30'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create ENUMs first
    userrole = sa.Enum('CLIENT', 'MANAGER', 'ADMIN', name='userrole')
    subscriptiontier = sa.Enum('TRIAL', 'BASIC', 'PRO', 'ENTERPRISE', name='subscriptiontier')
    userrole.create(op.get_bind(), checkfirst=True)
    subscriptiontier.create(op.get_bind(), checkfirst=True)

    # Add columns with default value for existing rows
    op.add_column('users', sa.Column('role', userrole, nullable=False, server_default='CLIENT'))
    op.add_column('users', sa.Column('subscription_tier', subscriptiontier, nullable=True))
    op.add_column('users', sa.Column('trial_ends_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('users', sa.Column('subscription_ends_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('users', sa.Column('manager_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_users_manager_id', 'users', 'users', ['manager_id'], ['id'])

    # Remove server default after adding column
    op.alter_column('users', 'role', server_default=None)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('fk_users_manager_id', 'users', type_='foreignkey')
    op.drop_column('users', 'manager_id')
    op.drop_column('users', 'subscription_ends_at')
    op.drop_column('users', 'trial_ends_at')
    op.drop_column('users', 'subscription_tier')
    op.drop_column('users', 'role')

    # Drop ENUMs
    sa.Enum(name='subscriptiontier').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='userrole').drop(op.get_bind(), checkfirst=True)
