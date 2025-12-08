from typing import Optional
from fastapi import APIRouter, Depends, Request, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.db.session import get_db
from app.services.oauth import (
    oauth,
    handle_google_callback,
    handle_facebook_callback
)
from app.schemas.auth import Token
from app.core.config import settings

router = APIRouter(prefix="/api/v1/oauth", tags=["oauth"])


class OAuthCallbackRequest(BaseModel):
    code: str
    state: Optional[str] = None


# Google OAuth
@router.get("/google/login")
async def google_login(request: Request):
    """Initiate Google OAuth flow"""
    redirect_uri = f"{settings.BACKEND_URL}/api/v1/oauth/google/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback")
async def google_callback(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Handle Google OAuth callback"""
    try:
        # Get token from Google
        token = await oauth.google.authorize_access_token(request)

        # Handle the callback and create/login user
        tokens = await handle_google_callback(db, token)

        # Redirect to frontend with tokens
        frontend_url = f"{settings.FRONTEND_URL}/auth/callback"
        return RedirectResponse(
            url=f"{frontend_url}?access_token={tokens['access_token']}&refresh_token={tokens['refresh_token']}"
        )
    except Exception as e:
        # Redirect to frontend with error
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/auth/callback?error={str(e)}"
        )


@router.post("/google/callback", response_model=Token)
async def google_callback_post(
    code: str,
    db: AsyncSession = Depends(get_db)
):
    """Alternative POST endpoint for Google OAuth callback (for mobile apps)"""
    try:
        # Exchange code for token
        import httpx
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                'https://oauth2.googleapis.com/token',
                data={
                    'code': code,
                    'client_id': settings.GOOGLE_CLIENT_ID,
                    'client_secret': settings.GOOGLE_CLIENT_SECRET,
                    'redirect_uri': f"{settings.BACKEND_URL}/api/v1/oauth/google/callback",
                    'grant_type': 'authorization_code'
                }
            )
            token_response.raise_for_status()
            token = token_response.json()

        # Handle the callback and create/login user
        return await handle_google_callback(db, token)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Google OAuth failed: {str(e)}"
        )


# Facebook OAuth
@router.get("/facebook/login")
async def facebook_login(request: Request):
    """Initiate Facebook OAuth flow"""
    redirect_uri = f"{settings.BACKEND_URL}/api/v1/oauth/facebook/callback"
    return await oauth.facebook.authorize_redirect(request, redirect_uri)


@router.get("/facebook/callback")
async def facebook_callback(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Handle Facebook OAuth callback"""
    try:
        # Get token from Facebook
        token = await oauth.facebook.authorize_access_token(request)

        # Handle the callback and create/login user
        tokens = await handle_facebook_callback(db, token)

        # Redirect to frontend with tokens
        frontend_url = f"{settings.FRONTEND_URL}/auth/callback"
        return RedirectResponse(
            url=f"{frontend_url}?access_token={tokens['access_token']}&refresh_token={tokens['refresh_token']}"
        )
    except Exception as e:
        # Redirect to frontend with error
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/auth/callback?error={str(e)}"
        )


@router.post("/facebook/callback", response_model=Token)
async def facebook_callback_post(
    code: str,
    db: AsyncSession = Depends(get_db)
):
    """Alternative POST endpoint for Facebook OAuth callback"""
    try:
        # Exchange code for token
        import httpx
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                'https://graph.facebook.com/v12.0/oauth/access_token',
                data={
                    'code': code,
                    'client_id': settings.FACEBOOK_CLIENT_ID,
                    'client_secret': settings.FACEBOOK_CLIENT_SECRET,
                    'redirect_uri': f"{settings.BACKEND_URL}/api/v1/oauth/facebook/callback"
                }
            )
            token_response.raise_for_status()
            token = token_response.json()

        # Handle the callback and create/login user
        return await handle_facebook_callback(db, token)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Facebook OAuth failed: {str(e)}"
        )


# OAuth URLs endpoint for frontend
@router.get("/urls")
async def get_oauth_urls():
    """Get OAuth URLs for all providers"""
    return {
        "google": f"{settings.BACKEND_URL}/api/v1/oauth/google/login",
        "facebook": f"{settings.BACKEND_URL}/api/v1/oauth/facebook/login"
    }
