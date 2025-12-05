from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.session import Base


class ChannelPlatform(str, enum.Enum):
    WHATSAPP = "WhatsApp"
    TELEGRAM = "Telegram"
    INSTAGRAM = "Instagram"
    FACEBOOK = "Facebook"
    GMAIL = "Gmail"
    SMS = "SMS"


class Channel(Base):
    __tablename__ = "channels"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)

    platform = Column(SQLEnum(ChannelPlatform), nullable=False)
    is_active = Column(Boolean, default=True)

    # Configuration stored as JSON
    config = Column(JSON, nullable=True)

    # API credentials (encrypted in production)
    api_token = Column(String, nullable=True)
    api_key = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    company = relationship("Company", back_populates="channels")
