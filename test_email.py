"""
Test script to verify email configuration.
Usage: python test_email.py your-email@example.com
"""
import asyncio
import sys
from app.services.email import send_verification_email, generate_verification_code
from app.core.config import settings


async def test_email(recipient_email: str):
    """Test sending a verification email."""
    print("\n" + "="*60)
    print("Testing Email Configuration")
    print("="*60)
    print(f"\n📧 Configuration:")
    print(f"   SMTP Host: {settings.SMTP_HOST}")
    print(f"   SMTP Port: {settings.SMTP_PORT}")
    print(f"   SMTP Username: {settings.SMTP_USERNAME}")
    print(f"   SMTP From: {settings.SMTP_FROM_EMAIL}")
    print(f"   Use TLS: {settings.SMTP_USE_TLS}")

    if settings.SMTP_HOST == "localhost":
        print("\n⚠️  WARNING: SMTP_HOST is set to 'localhost'")
        print("   Emails will only be printed to console, not sent.")
        print("\n   To send real emails:")
        print("   1. Follow the guide in SETUP_REAL_EMAIL.md")
        print("   2. Update your .env file with SMTP settings")
        print("   3. Restart the backend server")
        print("="*60 + "\n")
        return

    print(f"\n📤 Sending test email to: {recipient_email}")

    # Generate test code
    test_code = generate_verification_code()

    try:
        success = await send_verification_email(recipient_email, test_code)

        if success:
            print("\n✅ Email sent successfully!")
            print(f"\n📨 Check your inbox at: {recipient_email}")
            print("   (Also check your spam/junk folder)")
            print(f"\n🔑 Test code was: {test_code}")
        else:
            print("\n❌ Failed to send email")
            print("   Check the error messages above")

    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        print("\n💡 Common issues:")
        print("   1. Invalid SMTP credentials")
        print("   2. 2FA not enabled (for Gmail)")
        print("   3. Need App Password (for Gmail)")
        print("   4. Firewall blocking port 587")
        print("\n   See SETUP_REAL_EMAIL.md for detailed setup instructions")

    print("\n" + "="*60 + "\n")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("\n❌ Error: Please provide a recipient email address")
        print("\nUsage: python test_email.py your-email@example.com")
        print("\nExample: python test_email.py john@example.com\n")
        sys.exit(1)

    recipient = sys.argv[1]

    if "@" not in recipient:
        print(f"\n❌ Error: '{recipient}' is not a valid email address\n")
        sys.exit(1)

    asyncio.run(test_email(recipient))
