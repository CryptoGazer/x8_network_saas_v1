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
import random
import string

router = APIRouter(prefix="/api/v1/companies", tags=["companies"])


def generate_company_id(prefix: str = "COMP") -> str:
    random_num = ''.join(random.choices(string.digits, k=3))
    return f"{prefix}{random_num}"


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
