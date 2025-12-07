from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    RefreshTokenRequest,
    Token,
    SendVerificationCodeRequest,
    VerifyCodeRequest,
    CompleteRegistrationRequest
)
from app.schemas.user import User as UserSchema
from app.services.auth import authenticate_user, create_user, generate_tokens, refresh_access_token
from app.services.email import create_verification_code, verify_code, send_verification_email
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/send-verification-code", status_code=status.HTTP_200_OK)
async def send_verification_code(
    request: SendVerificationCodeRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Step 1 of registration: Send verification code to email.
    """
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == request.email))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Generate and send verification code
    code = await create_verification_code(db, request.email)
    await send_verification_email(request.email, code)

    return {
        "message": "Verification code sent to email",
        "email": request.email
    }


@router.post("/verify-code", status_code=status.HTTP_200_OK)
async def verify_verification_code(
    request: VerifyCodeRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Step 2 of registration: Verify the code sent to email.
    """
    is_valid = await verify_code(db, request.email, request.code)

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code"
        )

    return {
        "message": "Code verified successfully",
        "email": request.email
    }


@router.post("/complete-registration", response_model=Token, status_code=status.HTTP_201_CREATED)
async def complete_registration(
    request: CompleteRegistrationRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Step 3 of registration: Complete registration after verifying code.
    This verifies the code again and creates the user account.
    """
    # Verify the code one more time
    is_valid = await verify_code(db, request.email, request.code)

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code"
        )

    # Create user
    user = await create_user(
        db=db,
        email=request.email,
        password=request.password,
        full_name=request.full_name,
        role=request.role,
        manager_id=request.manager_id
    )

    await db.commit()

    tokens = generate_tokens(user.id)
    return tokens


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(
    request: RegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Legacy registration endpoint (without 2FA).
    Kept for backward compatibility.
    """
    user = await create_user(
        db=db,
        email=request.email,
        password=request.password,
        full_name=request.full_name,
        role=request.role,
        manager_id=request.manager_id
    )

    await db.commit()

    tokens = generate_tokens(user.id)
    return tokens


@router.post("/login", response_model=Token)
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    user = await authenticate_user(db, request.email, request.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    tokens = generate_tokens(user.id)
    return tokens


@router.post("/refresh", response_model=Token)
async def refresh_token(
    request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
):
    tokens = await refresh_access_token(db, request.refresh_token)
    return tokens


@router.get("/me", response_model=UserSchema)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user  # Now includes role, subscription_tier, etc.
