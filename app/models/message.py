from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.session import Base


class MessageType(str, enum.Enum):
    TYPE1 = "type1"
    TYPE2 = "type2"
    TYPE3 = "type3"


class MessageStatus(str, enum.Enum):
    NO_PAYMENT_LINK = "no_payment_link"
    PAYMENT_LINK_SENT = "payment_link_sent"
    PAID = "paid"


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)

    channel = Column(String, nullable=False)
    message_type = Column(SQLEnum(MessageType), nullable=False)
    status = Column(SQLEnum(MessageStatus), default=MessageStatus.NO_PAYMENT_LINK)

    content = Column(Text, nullable=True)
    external_id = Column(String, nullable=True)

    sent_at = Column(DateTime(timezone=True), nullable=True)
    received_at = Column(DateTime(timezone=True), nullable=True)
    response_time_seconds = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    company = relationship("Company", back_populates="messages")
