from typing import Optional, Dict, Any
import httpx
from authlib.integrations.starlette_client import OAuth
from authlib.jose import jwt
from fastapi import HTTPException, status
from app.core.config import settings
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.services.auth import create_user, get_user_by_id
from app.core.security import create_access_token, create_refresh_token
from sqlalchemy import select
import secrets

# Initialize OAuth
oauth = OAuth()

# Configure Google OAuth
oauth.register(
    name='google',
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

# Configure Facebook OAuth
oauth.register(
    name='facebook',
    client_id=settings.FACEBOOK_CLIENT_ID,
    client_secret=settings.FACEBOOK_CLIENT_SECRET,
    authorize_url='https://www.facebook.com/v12.0/dialog/oauth',
    authorize_params=None,
    access_token_url='https://graph.facebook.com/v12.0/oauth/access_token',
    access_token_params=None,
    refresh_token_url=None,
    client_kwargs={'scope': 'email public_profile'},
)

# Apple OAuth configuration (manual)
APPLE_AUTHORIZE_URL = 'https://appleid.apple.com/auth/authorize'
APPLE_TOKEN_URL = 'https://appleid.apple.com/auth/token'
APPLE_JWKS_URL = 'https://appleid.apple.com/auth/keys'


async def get_google_user_info(token: str) -> Dict[str, Any]:
    """Fetch user info from Google"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            headers={'Authorization': f'Bearer {token}'}
        )
        response.raise_for_status()
        return response.json()


async def get_facebook_user_info(token: str) -> Dict[str, Any]:
    """Fetch user info from Facebook"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            'https://graph.facebook.com/me',
            params={
                'fields': 'id,name,email',
                'access_token': token
            }
        )
        response.raise_for_status()
        return response.json()


async def verify_apple_token(id_token: str) -> Dict[str, Any]:
    """Verify Apple ID token"""
    try:
        # Fetch Apple's public keys
        async with httpx.AsyncClient() as client:
            response = await client.get(APPLE_JWKS_URL)
            response.raise_for_status()
            jwks = response.json()

        # Decode and verify the token
        claims = jwt.decode(id_token, jwks)
        claims.validate()

        return claims
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Apple token: {str(e)}"
        )


async def get_or_create_oauth_user(
    db: AsyncSession,
    email: str,
    full_name: str,
    oauth_provider: str,
    oauth_id: str
) -> User:
    """Get existing user or create new one from OAuth data"""

    # Check if user exists by email
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user:
        return user

    # Create new user with a random secure password (OAuth users don't need it)
    random_password = secrets.token_urlsafe(32)

    user = await create_user(
        db=db,
        email=email,
        password=random_password,
        full_name=full_name,
        role="client"
    )

    await db.commit()
    await db.refresh(user)

    return user


async def handle_google_callback(db: AsyncSession, token: Dict[str, Any]) -> Dict[str, str]:
    """Handle Google OAuth callback"""
    try:
        # Get user info from Google
        user_info = await get_google_user_info(token['access_token'])

        # Get or create user
        user = await get_or_create_oauth_user(
            db=db,
            email=user_info['email'],
            full_name=user_info.get('name', ''),
            oauth_provider='google',
            oauth_id=user_info['id']
        )

        # Generate tokens
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Google OAuth failed: {str(e)}"
        )


async def handle_facebook_callback(db: AsyncSession, token: Dict[str, Any]) -> Dict[str, str]:
    """Handle Facebook OAuth callback"""
    try:
        # Get user info from Facebook
        user_info = await get_facebook_user_info(token['access_token'])

        if not user_info.get('email'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not provided by Facebook"
            )

        # Get or create user
        user = await get_or_create_oauth_user(
            db=db,
            email=user_info['email'],
            full_name=user_info.get('name', ''),
            oauth_provider='facebook',
            oauth_id=user_info['id']
        )

        # Generate tokens
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Facebook OAuth failed: {str(e)}"
        )


async def handle_apple_callback(db: AsyncSession, id_token: str) -> Dict[str, str]:
    """Handle Apple OAuth callback"""
    try:
        # Verify and decode the Apple ID token
        claims = await verify_apple_token(id_token)

        email = claims.get('email')
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not provided by Apple"
            )

        # Get or create user
        user = await get_or_create_oauth_user(
            db=db,
            email=email,
            full_name=claims.get('name', ''),
            oauth_provider='apple',
            oauth_id=claims['sub']
        )

        # Generate tokens
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Apple OAuth failed: {str(e)}"
        )
