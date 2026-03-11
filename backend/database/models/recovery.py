from sqlalchemy import (
    Column, Integer, String, Float, DateTime,
    Enum, Boolean, ForeignKey,
)
from database.core.connection import Base
from database.core.timezone import CREATED_AT_DEFAULT, UPDATED_AT_DEFAULT
import enum


class RecoveryType(str, enum.Enum):
    ABANDONED_CART = "abandoned_cart"
    DECLINED_CARD = "declined_card"
    UNPAID_PIX = "unpaid_pix"


class RecoveryChannel(str, enum.Enum):
    WHATSAPP = "whatsapp"
    EMAIL = "email"
    SMS = "sms"
    BACK_REDIRECT = "back_redirect"
    OTHER = "other"


class Recovery(Base):
    """
    Tentativas de recuperação de vendas perdidas.
    Ex: carrinho abandonado, pix não pago, cartão recusado.
    """
    __tablename__ = "recoveries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(
        Integer, ForeignKey("customers.id"), nullable=True, index=True
    )
    customer_name = Column(String(255), nullable=True)
    customer_email = Column(String(255), nullable=True, index=True)
    product_name = Column(String(255), nullable=True)
    type = Column(Enum(RecoveryType), nullable=False)
    amount = Column(Float, nullable=False)
    recovered = Column(Boolean, default=False)
    channel = Column(Enum(RecoveryChannel), nullable=True)
    src = Column(String(255), nullable=True)
    recovered_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=CREATED_AT_DEFAULT)
    updated_at = Column(
        DateTime,
        server_default=UPDATED_AT_DEFAULT,
        onupdate=UPDATED_AT_DEFAULT,
    )
