"""add_company_type_column

Revision ID: fb3fb3885ff7
Revises: 0e95aeed1180
Create Date: 2025-12-10 11:22:22.831336

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fb3fb3885ff7'
down_revision: Union[str, Sequence[str], None] = '0e95aeed1180'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create enum type for company_type
    op.execute("CREATE TYPE companytype AS ENUM ('product', 'service')")

    # Add company_type column with default value 'product'
    op.add_column('companies', sa.Column('company_type', sa.Enum('product', 'service', name='companytype'), nullable=False, server_default='product'))


def downgrade() -> None:
    """Downgrade schema."""
    # Drop the column
    op.drop_column('companies', 'company_type')

    # Drop the enum type
    op.execute("DROP TYPE companytype")
