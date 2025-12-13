from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.models.company import Company
from app.models.channel import Channel, ChannelPlatform, ChannelStatus
from app.models.subscription import Subscription, SubscriptionPlan
from app.schemas.integration import (
    AvailableChannels,
    IntegrationListResponse,
    ChannelIntegrationResponse,
    WhatsAppConnectRequest,
    WhatsAppQRResponse,
    WhatsAppStatusResponse,
    GoogleCalendarAuthRequest,
    GoogleCalendarAuthResponse,
    GoogleCalendarCallbackRequest,
    GoogleCalendarStatusResponse,
)
import httpx
from app.core.config import settings
from datetime import datetime, timedelta
import secrets
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

router = APIRouter(prefix="/api/v1/integrations", tags=["integrations"])


# Plan-based channel availability mapping
# All plans can choose from any of the 6 channels, but with different limits
PLAN_CHANNELS = {
    SubscriptionPlan.FREE: {
        "whatsapp": True,
        "telegram": True,
        "instagram": True,
        "facebook": True,
        "email": True,
        "tiktok": True,
    },
    SubscriptionPlan.SINGLE: {
        "whatsapp": True,
        "telegram": True,
        "instagram": True,
        "facebook": True,
        "email": True,
        "tiktok": True,
    },
    SubscriptionPlan.DOUBLE: {
        "whatsapp": True,
        "telegram": True,
        "instagram": True,
        "facebook": True,
        "email": True,
        "tiktok": True,
    },
    SubscriptionPlan.GROWTH: {
        "whatsapp": True,
        "telegram": True,
        "instagram": True,
        "facebook": True,
        "email": True,
        "tiktok": True,
    },
    SubscriptionPlan.ENTERPRISE: {
        "whatsapp": True,
        "telegram": True,
        "instagram": True,
        "facebook": True,
        "email": True,
        "tiktok": True,
    },
}

# Channel selection limits per plan
PLAN_CHANNEL_LIMITS = {
    SubscriptionPlan.FREE: 1,  # Can select 1 of any 6 channels
    SubscriptionPlan.SINGLE: 1,  # Can select 1 of any 6 channels
    SubscriptionPlan.DOUBLE: 2,  # Can select 2 of any 6 channels
    SubscriptionPlan.GROWTH: 4,  # Can select 4 of any 6 channels
    SubscriptionPlan.ENTERPRISE: None,  # Unlimited (custom tariff)
}


async def get_user_subscription_plan(user_id: int, db: AsyncSession) -> SubscriptionPlan:
    """Get the user's current active subscription plan"""
    result = await db.execute(
        select(Subscription)
        .where(Subscription.user_id == user_id)
        .order_by(Subscription.created_at.desc())
    )
    subscription = result.scalar_one_or_none()

    if subscription:
        return subscription.plan
    return SubscriptionPlan.FREE


async def check_channel_limit(user_id: int, db: AsyncSession) -> None:
    """Check if user has reached their channel connection limit"""
    plan = await get_user_subscription_plan(user_id, db)
    limit = PLAN_CHANNEL_LIMITS.get(plan)

    if limit is not None:
        # Count connected channels
        result = await db.execute(
            select(Channel).where(
                Channel.user_id == user_id,
                Channel.status == ChannelStatus.CONNECTED
            )
        )
        connected_count = len(result.scalars().all())

        if connected_count >= limit:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Channel limit reached. Your {plan.value} plan allows maximum {limit} channels."
            )


@router.get("/available", response_model=IntegrationListResponse)
async def get_available_integrations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get available channels based on user's subscription plan and list of connected integrations
    """
    # Get user's subscription plan
    plan = await get_user_subscription_plan(current_user.id, db)

    # Get user's connected integrations
    result = await db.execute(
        select(Channel).where(Channel.user_id == current_user.id)
    )
    connected_channels = result.scalars().all()

    connected_integrations = [
        ChannelIntegrationResponse.model_validate(channel)
        for channel in connected_channels
    ]

    # Count connected messaging channels (not google_calendar or stripe)
    connected_count = len([
        ch for ch in connected_channels
        if ch.status == ChannelStatus.CONNECTED
    ])

    # Calculate trial end date and days left for FREE plan
    trial_end_date = None
    days_left = None
    trial_expired = False
    is_enterprise = False

    if plan == SubscriptionPlan.FREE:
        result = await db.execute(
            select(Subscription)
            .where(Subscription.user_id == current_user.id)
            .order_by(Subscription.created_at.desc())
        )
        subscription = result.scalar_one_or_none()
        if subscription and subscription.end_date:
            trial_end_date = subscription.end_date
            days_left = (subscription.end_date - datetime.utcnow()).days
            if days_left < 0:
                days_left = 0
                trial_expired = True

    # Determine available channels based on plan and current connections
    if trial_expired:
        # If trial expired, user cannot use any connections
        available_channels = AvailableChannels(
            whatsapp=False,
            telegram=False,
            instagram=False,
            facebook=False,
            email=False,
            tiktok=False
        )
    elif plan == SubscriptionPlan.ENTERPRISE:
        # Enterprise needs special setup - don't show channels as available
        is_enterprise = True
        available_channels = AvailableChannels(
            whatsapp=False,
            telegram=False,
            instagram=False,
            facebook=False,
            email=False,
            tiktok=False
        )
    elif plan == SubscriptionPlan.GROWTH:
        # Growth plan: can select 4 of any 6 channels
        # If already at limit (4 connected), disable all channels
        if connected_count >= 4:
            available_channels = AvailableChannels(
                whatsapp=False,
                telegram=False,
                instagram=False,
                facebook=False,
                email=False,
                tiktok=False
            )
        else:
            # Show all 6 channels as available until limit reached
            available_channels = AvailableChannels(
                whatsapp=True,
                telegram=True,
                instagram=True,
                facebook=True,
                email=True,
                tiktok=True
            )
    else:
        # For FREE, SINGLE, DOUBLE plans
        # Check if limit is reached
        limit = PLAN_CHANNEL_LIMITS.get(plan)
        if limit is not None and connected_count >= limit:
            available_channels = AvailableChannels(
                whatsapp=False,
                telegram=False,
                instagram=False,
                facebook=False,
                email=False,
                tiktok=False
            )
        else:
            # Show all 6 channels as available until limit reached
            channels_config = PLAN_CHANNELS.get(plan, PLAN_CHANNELS[SubscriptionPlan.FREE])
            available_channels = AvailableChannels(**channels_config)

    # Get channel limit for the plan
    channel_limit = PLAN_CHANNEL_LIMITS.get(plan)

    return IntegrationListResponse(
        available_channels=available_channels,
        connected_integrations=connected_integrations,
        current_plan=plan.value,
        trial_end_date=trial_end_date,
        days_left=days_left,
        channel_limit=channel_limit,
        is_enterprise=is_enterprise
    )


# ==================== WhatsApp Integration (WAHA) ====================

@router.post("/whatsapp/connect", response_model=WhatsAppQRResponse)
async def connect_whatsapp(
    request: WhatsAppConnectRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await check_channel_limit(current_user.id, db)

    if not settings.WAHA_API_URL or not settings.WAHA_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="WAHA service is not configured",
        )

    # Проверяем компанию
    result = await db.execute(
        select(Company).where(
            Company.id == request.company_id,
            Company.user_id == current_user.id,
        )
    )
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found",
        )

    # ВАЖНО: только default-сессия на Core
    session_id = "default"

    try:
        # 1) Стартуем default-сессию (DEPRECATED /api/sessions/start, но для Core норм)
        async with httpx.AsyncClient() as client:
            start_resp = await client.post(
                f"{settings.WAHA_API_URL}/api/sessions/start",
                headers={
                    "X-Api-Key": settings.WAHA_API_KEY,
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                json={
                    "name": session_id,
                    "config": {
                        "webhooks": [
                            {
                                "url": settings.WAHA_WEBHOOK_URL,
                                "events": ["message", "session.status"],
                            }
                        ]
                    },
                },
                timeout=30.0,
            )
            # если WAHA вернёт ошибку 4xx/5xx — тогда уже падаем
            start_resp.raise_for_status()

        # 2) Получаем QR в base64 для default
        async with httpx.AsyncClient() as client:
            qr_resp = await client.get(
                f"{settings.WAHA_API_URL}/api/{session_id}/auth/qr",
                headers={
                    "X-Api-Key": settings.WAHA_API_KEY,
                    # говорим WAHA: верни JSON с base64
                    "Accept": "application/json",
                },
                params={"format": "image"},
                timeout=30.0,
            )
            qr_resp.raise_for_status()
            qr_data = qr_resp.json()
            qr_base64 = qr_data.get("data", "")

        # 3) Сохраняем канал в БД
        result = await db.execute(
            select(Channel).where(
                Channel.company_id == request.company_id,
                Channel.platform == ChannelPlatform.WHATSAPP,
            )
        )
        channel = result.scalar_one_or_none()

        expires_at = datetime.utcnow() + timedelta(minutes=5)

        if channel:
            channel.status = ChannelStatus.CONNECTING
            channel.qr_code = qr_base64
            channel.qr_code_expires_at = expires_at
            channel.config = {"session_id": session_id}
            channel.platform_account_id = request.business_number
        else:
            channel = Channel(
                company_id=request.company_id,
                user_id=current_user.id,
                platform=ChannelPlatform.WHATSAPP,
                status=ChannelStatus.CONNECTING,
                qr_code=qr_base64,
                qr_code_expires_at=expires_at,
                config={"session_id": session_id},
                platform_account_id=request.business_number,
            )
            db.add(channel)

        await db.commit()
        await db.refresh(channel)

        return WhatsAppQRResponse(
            qr_code=qr_base64,
            session_id=session_id,
            expires_at=expires_at,
        )

    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to connect to WAHA service: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize WhatsApp connection: {str(e)}",
        )


@router.get("/whatsapp/status/{company_id}", response_model=WhatsAppStatusResponse)
async def get_whatsapp_status(
    company_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Check WhatsApp connection status
    """
    result = await db.execute(
        select(Channel).where(
            Channel.company_id == company_id,
            Channel.user_id == current_user.id,
            Channel.platform == ChannelPlatform.WHATSAPP
        )
    )
    channel = result.scalar_one_or_none()

    if not channel:
        return WhatsAppStatusResponse(
            status=ChannelStatus.DISCONNECTED,
            connected=False
        )

    # If we have a session, check status with WAHA
    if channel.config and "session_id" in channel.config:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{settings.WAHA_API_URL}/api/{channel.config['session_id']}/status",
                    headers={"X-Api-Key": settings.WAHA_API_KEY},
                    timeout=10.0
                )
                response.raise_for_status()
                status_data = response.json()

                # Update channel status based on WAHA response
                if status_data.get("status") == "WORKING":
                    channel.status = ChannelStatus.CONNECTED
                    channel.qr_code = None  # Clear QR code
                    await db.commit()
        except:
            pass  # Ignore errors, use cached status

    return WhatsAppStatusResponse(
        status=channel.status,
        connected=channel.status == ChannelStatus.CONNECTED,
        phone_number=channel.platform_account_id,
        error=channel.last_error
    )


@router.delete("/whatsapp/disconnect/{company_id}")
async def disconnect_whatsapp(
    company_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Disconnect WhatsApp integration
    """
    result = await db.execute(
        select(Channel).where(
            Channel.company_id == company_id,
            Channel.user_id == current_user.id,
            Channel.platform == ChannelPlatform.WHATSAPP
        )
    )
    channel = result.scalar_one_or_none()

    if not channel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="WhatsApp integration not found"
        )

    # Stop WAHA session if exists
    if channel.config and "session_id" in channel.config:
        try:
            async with httpx.AsyncClient() as client:
                await client.delete(
                    f"{settings.WAHA_API_URL}/api/{channel.config['session_id']}",
                    headers={"X-Api-Key": settings.WAHA_API_KEY},
                    timeout=10.0
                )
        except:
            pass  # Ignore errors

    # Delete the channel
    await db.delete(channel)
    await db.commit()

    return {"message": "WhatsApp disconnected successfully"}


# ==================== Google Calendar Integration ====================

@router.post("/google-calendar/auth", response_model=GoogleCalendarAuthResponse)
async def init_google_calendar_auth(
    request: GoogleCalendarAuthRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Initialize Google Calendar OAuth flow
    """
    # Check if company exists
    result = await db.execute(
        select(Company).where(
            Company.id == request.company_id,
            Company.user_id == current_user.id
        )
    )
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )

    # Create OAuth flow
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [settings.GOOGLE_CALENDAR_REDIRECT_URI]
            }
        },
        scopes=[
            "https://www.googleapis.com/auth/calendar",
            "https://www.googleapis.com/auth/userinfo.email"
        ]
    )
    flow.redirect_uri = settings.GOOGLE_CALENDAR_REDIRECT_URI

    # Generate state token for CSRF protection
    state = f"{current_user.id}:{request.company_id}:{secrets.token_urlsafe(16)}"

    auth_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        state=state,
        prompt="consent"
    )

    return GoogleCalendarAuthResponse(auth_url=auth_url)


@router.get("/google-calendar/callback")
async def google_calendar_callback(
    code: str,
    state: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Handle Google Calendar OAuth callback
    """
    try:
        # Parse state to get user_id and company_id
        parts = state.split(":")
        if len(parts) < 3:
            raise HTTPException(status_code=400, detail="Invalid state parameter")

        user_id = int(parts[0])
        company_id = int(parts[1])

        # Exchange code for tokens
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [settings.GOOGLE_CALENDAR_REDIRECT_URI]
                }
            },
            scopes=[
                "https://www.googleapis.com/auth/calendar",
                "https://www.googleapis.com/auth/userinfo.email"
            ]
        )
        flow.redirect_uri = settings.GOOGLE_CALENDAR_REDIRECT_URI
        flow.fetch_token(code=code)

        credentials = flow.credentials

        # Get user info
        service = build("oauth2", "v2", credentials=credentials)
        user_info = service.userinfo().get().execute()
        calendar_email = user_info.get("email")

        # Create or update channel
        result = await db.execute(
            select(Channel).where(
                Channel.company_id == company_id,
                Channel.user_id == user_id,
                Channel.platform == ChannelPlatform.EMAIL  # Using EMAIL for calendar
            )
        )
        channel = result.scalar_one_or_none()

        if channel:
            channel.status = ChannelStatus.CONNECTED
            channel.api_token = credentials.token
            channel.refresh_token = credentials.refresh_token
            channel.platform_account_id = calendar_email
            channel.platform_account_name = user_info.get("name")
            channel.config = {"calendar_connected": True}
        else:
            channel = Channel(
                company_id=company_id,
                user_id=user_id,
                platform=ChannelPlatform.EMAIL,
                status=ChannelStatus.CONNECTED,
                api_token=credentials.token,
                refresh_token=credentials.refresh_token,
                platform_account_id=calendar_email,
                platform_account_name=user_info.get("name"),
                config={"calendar_connected": True}
            )
            db.add(channel)

        await db.commit()

        # Redirect to frontend with success
        return {
            "message": "Google Calendar connected successfully",
            "redirect_url": f"{settings.FRONTEND_URL}/dashboard?calendar_connected=true"
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete Google Calendar authentication: {str(e)}"
        )


@router.get("/google-calendar/status/{company_id}", response_model=GoogleCalendarStatusResponse)
async def get_google_calendar_status(
    company_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get Google Calendar connection status
    """
    result = await db.execute(
        select(Channel).where(
            Channel.company_id == company_id,
            Channel.user_id == current_user.id,
            Channel.platform == ChannelPlatform.EMAIL,
            Channel.config.contains({"calendar_connected": True})
        )
    )
    channel = result.scalar_one_or_none()

    if not channel or channel.status != ChannelStatus.CONNECTED:
        return GoogleCalendarStatusResponse(connected=False)

    return GoogleCalendarStatusResponse(
        connected=True,
        calendar_email=channel.platform_account_id,
        last_sync=channel.updated_at
    )


# ==================== Placeholder Endpoints for Other Platforms ====================

@router.post("/telegram/connect")
async def connect_telegram(
    company_id: int,
    current_user: User = Depends(get_current_user)
):
    """Placeholder for Telegram integration"""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Telegram integration coming soon"
    )


@router.post("/instagram/connect")
async def connect_instagram(
    company_id: int,
    current_user: User = Depends(get_current_user)
):
    """Placeholder for Instagram integration"""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Instagram integration coming soon"
    )


@router.post("/facebook/connect")
async def connect_facebook(
    company_id: int,
    current_user: User = Depends(get_current_user)
):
    """Placeholder for Facebook integration"""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Facebook integration coming soon"
    )


@router.post("/tiktok/connect")
async def connect_tiktok(
    company_id: int,
    current_user: User = Depends(get_current_user)
):
    """Placeholder for TikTok integration"""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="TikTok integration coming soon"
    )


@router.post("/stripe/connect")
async def connect_stripe(
    company_id: int,
    current_user: User = Depends(get_current_user)
):
    """Placeholder for Stripe Connect integration"""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Stripe Connect integration coming soon"
    )
