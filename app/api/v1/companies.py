from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.db.session import get_db
from app.schemas.company import Company as CompanySchema, CompanyCreate, CompanyUpdate
from app.core.deps import get_current_user
from app.models.user import User
from app.models.company import Company
from app.models.channel import Channel
from app.core.config import settings
import random
import string
import httpx

router = APIRouter(prefix="/api/v1/companies", tags=["companies"])


def generate_company_id(prefix: str = "COMP") -> str:
    random_num = ''.join(random.choices(string.digits, k=3))
    return f"{prefix}{random_num}"


async def create_supabase_table(company_name: str, product_type: str) -> None:
    """
    Create a table in Supabase based on company name and product type.
    Table name format: "{company_name} Product" or "{company_name} Service"

    Note: This requires direct database access. For Supabase, you would typically:
    1. Use the Supabase database connection string with asyncpg
    2. Or use Supabase's database webhooks/functions
    3. Or manually create tables via Supabase Dashboard

    For now, this creates a metadata entry that can be used to track
    which tables should exist for each company.
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        # Supabase not configured, skip table creation
        return

    # Construct table name with space as specified
    table_name = f"{company_name} {product_type}"

    # Log the table that should be created
    # In production, you would:
    # 1. Connect to Supabase PostgreSQL directly using asyncpg
    # 2. Execute CREATE TABLE statement
    # 3. Set up Row Level Security policies

    # For now, store metadata about the table
    try:
        # Insert a record into a metadata table via Supabase REST API
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.SUPABASE_URL}/rest/v1/company_tables",
                headers={
                    "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                },
                json={
                    "table_name": table_name,
                    "company_name": company_name,
                    "product_type": product_type,
                    "created_at": "now()"
                },
                timeout=10.0
            )

            # If the company_tables metadata table doesn't exist, this will fail silently
            # The table creation can be handled separately via Supabase migrations or manual setup

    except Exception as e:
        # Log error but don't fail company creation
        # The actual table creation should be handled via Supabase migrations or manually
        print(f"Info: Table metadata for '{table_name}' not stored. Create table manually in Supabase: {str(e)}")
        print(f"Table to create: {table_name}")


@router.get("", response_model=List[CompanySchema])
async def list_companies(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Company).where(Company.user_id == current_user.id)
    )
    companies = result.scalars().all()

    companies_data = []
    for company in companies:
        result_channels = await db.execute(
            select(Channel).where(Channel.company_id == company.id)
        )
        channels = result_channels.scalars().all()

        company_dict = CompanySchema.model_validate(company).model_dump()
        company_dict["channels"] = [ch.platform.value for ch in channels]
        companies_data.append(CompanySchema(**company_dict))

    return companies_data


@router.post("", response_model=CompanySchema, status_code=status.HTTP_201_CREATED)
async def create_company(
    company_data: CompanyCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    company_id = generate_company_id()

    company = Company(
        company_id=company_id,
        name=company_data.name,
        product_type=company_data.product_type,
        user_id=current_user.id
    )

    db.add(company)
    await db.flush()
    await db.refresh(company)

    # Create Supabase table if product_type is "product" or "service"
    # Convert to capitalized form for table name
    if company_data.product_type.lower() in ["product", "service"]:
        # Capitalize first letter for table name: "Product" or "Service"
        table_suffix = company_data.product_type.capitalize()
        await create_supabase_table(company_data.name, table_suffix)

    company_dict = CompanySchema.model_validate(company).model_dump()
    company_dict["channels"] = []

    return CompanySchema(**company_dict)


@router.get("/{company_id}", response_model=CompanySchema)
async def get_company(
    company_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Company).where(
            Company.id == company_id,
            Company.user_id == current_user.id
        )
    )
    company = result.scalar_one_or_none()

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )

    result_channels = await db.execute(
        select(Channel).where(Channel.company_id == company.id)
    )
    channels = result_channels.scalars().all()

    company_dict = CompanySchema.model_validate(company).model_dump()
    company_dict["channels"] = [ch.platform.value for ch in channels]

    return CompanySchema(**company_dict)


@router.patch("/{company_id}", response_model=CompanySchema)
async def update_company(
    company_id: int,
    company_update: CompanyUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Company).where(
            Company.id == company_id,
            Company.user_id == current_user.id
        )
    )
    company = result.scalar_one_or_none()

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )

    if company_update.name is not None:
        company.name = company_update.name
    if company_update.product_type is not None:
        company.product_type = company_update.product_type
    if company_update.status is not None:
        company.status = company_update.status

    await db.flush()
    await db.refresh(company)

    result_channels = await db.execute(
        select(Channel).where(Channel.company_id == company.id)
    )
    channels = result_channels.scalars().all()

    company_dict = CompanySchema.model_validate(company).model_dump()
    company_dict["channels"] = [ch.platform.value for ch in channels]

    return CompanySchema(**company_dict)


@router.delete("/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_company(
    company_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Company).where(
            Company.id == company_id,
            Company.user_id == current_user.id
        )
    )
    company = result.scalar_one_or_none()

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )

    await db.delete(company)
    return None
