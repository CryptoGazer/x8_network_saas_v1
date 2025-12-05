from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.session import Base


class ProductType(str, enum.Enum):
    SERVICE = "Service"
    PRODUCT = "Product"
    BOTH = "Both"


class CompanyStatus(str, enum.Enum):
    ACTIVE = "Active"
    INACTIVE = "Inactive"
    SUSPENDED = "Suspended"


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    product_type = Column(SQLEnum(ProductType), default=ProductType.SERVICE)
    status = Column(SQLEnum(CompanyStatus), default=CompanyStatus.ACTIVE)

    total_messages = Column(Integer, default=0)
    type1_count = Column(Integer, default=0)
    type2_count = Column(Integer, default=0)
    type2_unpaid = Column(Integer, default=0)
    type3_count = Column(Integer, default=0)
    type3_paid = Column(Integer, default=0)
    avg_response_time = Column(Integer, default=0)

    subscription_ends = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="companies")
    channels = relationship("Channel", back_populates="company", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="company", cascade="all, delete-orphan")
