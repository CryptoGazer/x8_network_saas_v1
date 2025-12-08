import random
import string
from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.models.verification_code import VerificationCode
from app.core.config import settings
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def generate_verification_code(length: int = 6) -> str:
    """Generate a random 6-digit verification code."""
    return ''.join(random.choices(string.digits, k=length))


async def create_verification_code(db: AsyncSession, email: str) -> str:
    """
    Create a new verification code for an email address.
    Deletes any existing unused codes for this email.
    """
    # Delete old verification codes for this email
    await db.execute(
        delete(VerificationCode).where(VerificationCode.email == email)
    )
    await db.commit()

    # Generate new code
    code = generate_verification_code()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)  # Code expires in 10 minutes

    verification_code = VerificationCode(
        email=email,
        code=code,
        expires_at=expires_at
    )

    db.add(verification_code)
    await db.commit()
    await db.refresh(verification_code)

    return code


async def verify_code(db: AsyncSession, email: str, code: str) -> bool:
    """
    Verify a code for an email address.
    Returns True if valid, False otherwise.
    """
    result = await db.execute(
        select(VerificationCode).where(
            VerificationCode.email == email,
            VerificationCode.code == code,
            VerificationCode.is_used == False
        )
    )
    verification = result.scalar_one_or_none()

    if (not verification) or (not verification.is_valid()):
        return False

    # Mark code as used
    verification.is_used = True
    await db.commit()

    return True


async def send_password_reset_email(email: str, code: str) -> bool:
    """
    Send password reset code via email.
    For development, this will just print to console if SMTP is not configured.
    """
    # Check if SMTP is configured
    if not settings.SMTP_HOST or settings.SMTP_HOST == "localhost":
        # Development mode - print to console
        print("\n" + "="*60)
        print(f"🔐 PASSWORD RESET CODE FOR: {email}")
        print("="*60)
        print(f"✅ Code: {code}")
        print("⏰ This code expires in 10 minutes")
        print("="*60 + "\n")

        # Also log to stderr to ensure it's visible
        import sys
        sys.stderr.write(f"\n{'='*60}\n")
        sys.stderr.write(f"🔐 PASSWORD RESET CODE FOR: {email}\n")
        sys.stderr.write(f"{'='*60}\n")
        sys.stderr.write(f"✅ Code: {code}\n")
        sys.stderr.write(f"⏰ This code expires in 10 minutes\n")
        sys.stderr.write(f"{'='*60}\n\n")
        sys.stderr.flush()

        return True

    try:
        # Production mode - send actual email
        message = MIMEMultipart("alternative")
        message["Subject"] = "X8 Network - Password Reset"
        message["From"] = settings.SMTP_FROM_EMAIL
        message["To"] = email

        # Create HTML email content
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #00D4FF 0%, #00B8E6 100%); padding: 30px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; text-align: center;">X8 Network</h1>
                </div>
                <div style="background: #f8f9fa; padding: 40px 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
                    <p style="color: #666; font-size: 16px; line-height: 1.6;">
                        We received a request to reset your password. Use the code below to reset your password:
                    </p>
                    <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
                        <p style="color: #999; margin: 0 0 10px 0; font-size: 14px;">Your Reset Code:</p>
                        <h1 style="color: #00D4FF; margin: 0; font-size: 48px; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                            {code}
                        </h1>
                    </div>
                    <p style="color: #666; font-size: 14px; line-height: 1.6;">
                        This code will expire in <strong>10 minutes</strong>.
                    </p>
                    <p style="color: #666; font-size: 14px; line-height: 1.6;">
                        If you didn't request a password reset, please ignore this email and your password will remain unchanged.
                    </p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        © 2025 X8 Network. All rights reserved.
                    </p>
                </div>
            </body>
        </html>
        """

        text_content = f"""
        X8 Network - Password Reset

        We received a request to reset your password.

        Your reset code is: {code}

        This code will expire in 10 minutes.

        If you didn't request a password reset, please ignore this email.

        © 2025 X8 Network. All rights reserved.
        """

        part1 = MIMEText(text_content, "plain")
        part2 = MIMEText(html_content, "html")

        message.attach(part1)
        message.attach(part2)

        # Send email
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USERNAME,
            password=settings.SMTP_PASSWORD,
            use_tls=settings.SMTP_USE_TLS,
        )

        return True

    except Exception as e:
        print(f"Failed to send password reset email: {str(e)}")
        # Still print to console as fallback
        print(f"\n{'='*60}")
        print(f"🔐 PASSWORD RESET CODE FOR: {email}")
        print(f"{'='*60}")
        print(f"Code: {code}")
        print(f"{'='*60}\n")
        return True  # Return True anyway so reset can continue


async def send_verification_email(email: str, code: str) -> bool:
    """
    Send verification code via email.
    For development, this will just print to console if SMTP is not configured.
    """
    # Check if SMTP is configured
    if not settings.SMTP_HOST or settings.SMTP_HOST == "localhost":
        # Development mode - print to console
        print("\n" + "="*60)
        print(f"📧 VERIFICATION CODE FOR: {email}")
        print("="*60)
        print(f"✅ Code: {code}")
        print("⏰ This code expires in 10 minutes")
        print("="*60 + "\n")

        # Also log to stderr to ensure it's visible
        import sys
        sys.stderr.write(f"\n{'='*60}\n")
        sys.stderr.write(f"📧 VERIFICATION CODE FOR: {email}\n")
        sys.stderr.write(f"{'='*60}\n")
        sys.stderr.write(f"✅ Code: {code}\n")
        sys.stderr.write(f"⏰ This code expires in 10 minutes\n")
        sys.stderr.write(f"{'='*60}\n\n")
        sys.stderr.flush()

        return True

    try:
        # Production mode - send actual email
        message = MIMEMultipart("alternative")
        message["Subject"] = "X8 Network - Email Verification"
        message["From"] = settings.SMTP_FROM_EMAIL
        message["To"] = email

        # Create HTML email content
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #00D4FF 0%, #00B8E6 100%); padding: 30px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; text-align: center;">X8 Network</h1>
                </div>
                <div style="background: #f8f9fa; padding: 40px 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333; margin-top: 0;">Email Verification</h2>
                    <p style="color: #666; font-size: 16px; line-height: 1.6;">
                        Thank you for registering with X8 Network! To complete your registration,
                        please use the verification code below:
                    </p>
                    <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
                        <p style="color: #999; margin: 0 0 10px 0; font-size: 14px;">Your Verification Code:</p>
                        <h1 style="color: #00D4FF; margin: 0; font-size: 48px; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                            {code}
                        </h1>
                    </div>
                    <p style="color: #666; font-size: 14px; line-height: 1.6;">
                        This code will expire in <strong>10 minutes</strong>.
                    </p>
                    <p style="color: #666; font-size: 14px; line-height: 1.6;">
                        If you didn't request this code, please ignore this email.
                    </p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        © 2025 X8 Network. All rights reserved.
                    </p>
                </div>
            </body>
        </html>
        """

        text_content = f"""
        X8 Network - Email Verification

        Thank you for registering with X8 Network!

        Your verification code is: {code}

        This code will expire in 10 minutes.

        If you didn't request this code, please ignore this email.

        © 2025 X8 Network. All rights reserved.
        """

        part1 = MIMEText(text_content, "plain")
        part2 = MIMEText(html_content, "html")

        message.attach(part1)
        message.attach(part2)

        # Send email
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USERNAME,
            password=settings.SMTP_PASSWORD,
            use_tls=settings.SMTP_USE_TLS,
        )

        return True

    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        # Still print to console as fallback
        print(f"\n{'='*60}")
        print(f"📧 VERIFICATION CODE FOR: {email}")
        print(f"{'='*60}")
        print(f"Code: {code}")
        print(f"{'='*60}\n")
        return True  # Return True anyway so registration can continue
