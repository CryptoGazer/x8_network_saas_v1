from pydantic import BaseModel, EmailStr
from typing import Optional
from app.models.user import UserRole


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: int
    exp: int
    type: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole = UserRole.CLIENT
    manager_id: Optional[int] = None


class SendVerificationCodeRequest(BaseModel):
    email: EmailStr


class VerifyCodeRequest(BaseModel):
    email: EmailStr
    code: str


class CompleteRegistrationRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    code: str
    role: UserRole = UserRole.CLIENT
    manager_id: Optional[int] = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str
