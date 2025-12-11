from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class ChannelPlatform(str, Enum):
    WHATSAPP = "WhatsApp"
    TELEGRAM = "Telegram"
    INSTAGRAM = "Instagram"
    FACEBOOK = "Facebook"
    EMAIL = "Email"
    TIKTOK = "TikTok"


class ChannelStatus(str, Enum):
    DISCONNECTED = "disconnected"
    CONNECTING = "connecting"
    CONNECTED = "connected"
    ERROR = "error"


class AvailableChannels(BaseModel):
    """Channels available based on the user's subscription plan"""
    whatsapp: bool
    telegram: bool
    instagram: bool
    facebook: bool
    email: bool
    tiktok: bool
    stripe_connect: bool = True  # Always available
    google_calendar: bool = True  # Always available


class ChannelIntegrationBase(BaseModel):
    platform: ChannelPlatform
    company_id: int


class WhatsAppConnectRequest(BaseModel):
    company_id: int
    business_number: str = Field(..., description="WhatsApp Business phone number")


class WhatsAppQRResponse(BaseModel):
    qr_code: str = Field(..., description="Base64 encoded QR code image")
    session_id: str
    expires_at: datetime


class WhatsAppStatusResponse(BaseModel):
    status: ChannelStatus
    connected: bool
    phone_number: Optional[str] = None
    error: Optional[str] = None


class GoogleCalendarAuthRequest(BaseModel):
    company_id: int


class GoogleCalendarAuthResponse(BaseModel):
    auth_url: str


class GoogleCalendarCallbackRequest(BaseModel):
    code: str
    state: str


class GoogleCalendarStatusResponse(BaseModel):
    connected: bool
    calendar_email: Optional[str] = None
    last_sync: Optional[datetime] = None


class ChannelIntegrationResponse(BaseModel):
    id: int
    company_id: int
    user_id: int
    platform: ChannelPlatform
    status: ChannelStatus
    is_active: bool
    platform_account_id: Optional[str] = None
    platform_account_name: Optional[str] = None
    last_error: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class IntegrationListResponse(BaseModel):
    available_channels: AvailableChannels
    connected_integrations: List[ChannelIntegrationResponse]
    current_plan: str = Field(..., description="User's current subscription plan")
    trial_end_date: Optional[datetime] = Field(None, description="Trial end date for FREE plan")
    days_left: Optional[int] = Field(None, description="Days left in trial for FREE plan")
    channel_limit: Optional[int] = Field(None, description="Maximum number of channels for BASIC plan (None = unlimited)")
    is_enterprise: bool = Field(default=False, description="Whether user is on Enterprise plan (needs special setup)")
