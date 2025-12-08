from app.db.session import Base
from app.models.user import User
from app.models.company import Company
from app.models.subscription import Subscription
from app.models.message import Message
from app.models.channel import Channel
from app.models.verification_code import VerificationCode

# Import all models here so Alembic can detect them
__all__ = ["Base", "User", "Company", "Subscription", "Message", "Channel", "VerificationCode"]
