"""replace_product_type_and_company_type_with_shop_type

Revision ID: 405e5c14ef10
Revises: d60e2802ec42
Create Date: 2025-12-11 23:23:22.125370

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '405e5c14ef10'
down_revision: Union[str, Sequence[str], None] = 'd60e2802ec42'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add shop_type column as String
    op.add_column('companies', sa.Column('shop_type', sa.String(), nullable=True))

    # Migrate existing data: convert product_type enum values to shop_type strings
    # ProductType.SERVICE = "Service" -> shop_type = "service"
    # ProductType.PRODUCT = "Product" -> shop_type = "product"
    # Cast enum to text for comparison
    op.execute("""
        UPDATE companies
        SET shop_type = CASE
            WHEN product_type::text = 'Service' THEN 'service'
            WHEN product_type::text = 'Product' THEN 'product'
            ELSE 'service'
        END
    """)

    # Make shop_type NOT NULL after populating it
    op.alter_column('companies', 'shop_type', nullable=False)

    # Drop old columns
    op.drop_column('companies', 'product_type')
    op.drop_column('companies', 'company_type')

    # Drop the old enum types if they exist
    op.execute("DROP TYPE IF EXISTS producttype CASCADE")
    op.execute("DROP TYPE IF EXISTS companytype CASCADE")


def downgrade() -> None:
    """Downgrade schema."""
    # Recreate enum types
    op.execute("CREATE TYPE producttype AS ENUM ('Service', 'Product', 'Both')")
    op.execute("CREATE TYPE companytype AS ENUM ('product', 'service')")

    # Add back the old columns
    op.add_column('companies', sa.Column('product_type', sa.Enum('Service', 'Product', 'Both', name='producttype'), nullable=True))
    op.add_column('companies', sa.Column('company_type', sa.Enum('product', 'service', name='companytype'), nullable=True))

    # Migrate data back
    op.execute("""
        UPDATE companies
        SET product_type = CASE
            WHEN shop_type = 'service' THEN 'Service'
            WHEN shop_type = 'product' THEN 'Product'
            ELSE 'Service'
        END,
        company_type = CASE
            WHEN shop_type = 'service' THEN 'service'
            WHEN shop_type = 'product' THEN 'product'
            ELSE 'product'
        END
    """)

    # Make columns NOT NULL
    op.alter_column('companies', 'product_type', nullable=False)
    op.alter_column('companies', 'company_type', nullable=False)

    # Drop shop_type
    op.drop_column('companies', 'shop_type')
