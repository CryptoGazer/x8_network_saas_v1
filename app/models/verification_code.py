from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from datetime import datetime, timedelta, timezone
from app.db.session import Base


class VerificationCode(Base):
    __tablename__ = "verification_codes"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True, nullable=False)
    code = Column(String, nullable=False)
    is_used = Column(Boolean, default=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def is_expired(self) -> bool:
        return datetime.now(timezone.utc) > self.expires_at

    def is_valid(self) -> bool:
        return not self.is_used and not self.is_expired()
