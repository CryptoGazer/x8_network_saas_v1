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
    EMAIL = "Email"
    TIKTOK = "TikTok"


class ChannelStatus(str, enum.Enum):
    DISCONNECTED = "disconnected"
    CONNECTING = "connecting"
    CONNECTED = "connected"
    ERROR = "error"


class Channel(Base):
    __tablename__ = "channels"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    platform = Column(SQLEnum(ChannelPlatform), nullable=False)
    is_active = Column(Boolean, default=True)
    status = Column(SQLEnum(ChannelStatus), default=ChannelStatus.DISCONNECTED)

    # Platform-specific identifiers
    platform_account_id = Column(String, nullable=True)  # WhatsApp number, Telegram username, etc.
    platform_account_name = Column(String, nullable=True)

    # Configuration stored as JSON
    config = Column(JSON, nullable=True)

    # API credentials (encrypted in production)
    api_token = Column(String, nullable=True)
    api_key = Column(String, nullable=True)
    refresh_token = Column(String, nullable=True)  # For OAuth flows

    # QR code data for WhatsApp (temporary)
    qr_code = Column(String, nullable=True)
    qr_code_expires_at = Column(DateTime(timezone=True), nullable=True)

    # Error tracking
    last_error = Column(String, nullable=True)
    error_count = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    company = relationship("Company", back_populates="channels")
