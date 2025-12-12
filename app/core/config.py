from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    SYNC_DATABASE_URL: str = "postgresql://app:app@localhost:5432/app"

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Application
    PROJECT_NAME: str = "x8-network"
    API_V1_PREFIX: str = "/api/v1"
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5175"]

    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # Email/SMTP (for 2FA)
    SMTP_HOST: str = "localhost"  # Default to localhost (dev mode)
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = "your-email@gmail.com"
    SMTP_PASSWORD: str = "trqy jhpy myww gugt"
    SMTP_FROM_EMAIL: str = "flowbilling@gmail.com"
    SMTP_USE_TLS: bool = True

    # OAuth Settings
    GOOGLE_CLIENT_ID: str = "1096103510849-lpc4ugqk8fk6fj1a64dt0l8qhtoud0lv.apps.googleusercontent.com"
    GOOGLE_CLIENT_SECRET: str = "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"
    FACEBOOK_CLIENT_ID: str = "1398602075315685"
    FACEBOOK_CLIENT_SECRET: str = "0fd3d9197864692d126611fbfabfd786"

    # OAuth Redirect URIs
    FRONTEND_URL: str = "http://localhost:5175"
    BACKEND_URL: str = "http://localhost:8000"

    # Supabase (for CSV/XLSX import data storage)
    SUPABASE_URL: str = "https://vjilbesdtpwywzpstutp.supabase.co"
    SUPABASE_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqaWxiZXNkdHB3eXd6cHN0dXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MjA1MDksImV4cCI6MjA3MTI5NjUwOX0.8SFtqMmFZ3PLSaTYBs54VJb7LlT7ceGJaCy8p0UGrSU"
    SUPABASE_SERVICE_ROLE_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqaWxiZXNkdHB3eXd6cHN0dXRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTcyMDUwOSwiZXhwIjoyMDcxMjk2NTA5fQ.A04PMVgh4I2I_l7kn-a7m4JJxcbQtg8EfXeqYcheWDE"

    # WAHA (WhatsApp HTTP API) Configuration
    WAHA_API_URL: str = "https://waha.iwnfvihwdf.xyz"
    WAHA_API_KEY: str = "c2bee5dc177747cc947beddf35c72e62"
    WAHA_WEBHOOK_URL: str = ""

    # Google Calendar API Configuration
    GOOGLE_CALENDAR_REDIRECT_URI: str = "http://localhost:8000/api/v1/integrations/google-calendar/callback"

    # n8n AI FAQ Chatbot Configuration
    N8N_AI_FAQ_URL: str = ""
    N8N_AI_FAQ_API_KEY: str = ""
    N8N_AI_FAQ_WEBHOOK_SECRET: str = ""

    # Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    class Config:
        env_file = "app/.env"
        case_sensitive = True
        extra = "ignore"

    def parse_cors_origins(self) -> List[str]:
        if isinstance(self.BACKEND_CORS_ORIGINS, str):
            try:
                return json.loads(self.BACKEND_CORS_ORIGINS)
            except json.JSONDecodeError:
                return [self.BACKEND_CORS_ORIGINS]
        return self.BACKEND_CORS_ORIGINS


settings = Settings()
