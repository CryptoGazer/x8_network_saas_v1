from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.company import ProductType, CompanyStatus


class CompanyBase(BaseModel):
    name: str
    product_type: ProductType = ProductType.SERVICE


class CompanyCreate(CompanyBase):
    channels: List[str] = []  # List of channel IDs: whatsapp, telegram, instagram, facebook, gmail, tiktok
    plan: str = "free"  # User's subscription plan: free, single, double, growth, special


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    product_type: Optional[ProductType] = None
    status: Optional[CompanyStatus] = None


class Company(CompanyBase):
    id: int
    company_id: str
    user_id: int
    status: CompanyStatus
    total_messages: int
    type1_count: int
    type2_count: int
    type2_unpaid: int
    type3_count: int
    type3_paid: int
    avg_response_time: int
    subscription_ends: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    channels: List[str] = []

    class Config:
        from_attributes = True
