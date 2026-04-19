from sqlalchemy import (
    Column, Integer, String, Float, DateTime,
    Enum, ForeignKey, JSON, Text
)
from database.core.connection import Base
from database.core.timezone import CREATED_AT_DEFAULT, UPDATED_AT_DEFAULT
import enum


class TransactionStatus(str, enum.Enum):
    APPROVED = "approved"
    REFUNDED = "refunded"
    CHARGEBACK = "chargeback"
    PENDING = "pending"
    TRIAL = "trial"


class PaymentPlatform(str, enum.Enum):
    KIWIFY = "kiwify"
    PAYT = "payt"
    API = "api"


class Transaction(Base):
    """
    Cada venda/transação recebida via webhook.
    Liga ao customer (FK) e ao product (FK) para rastreamento.
    """
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    external_id = Column(String(255), unique=True, nullable=False)
    platform = Column(Enum(PaymentPlatform), nullable=False)
    status = Column(
        Enum(TransactionStatus),
        default=TransactionStatus.APPROVED,
    )
    amount = Column(Float, nullable=False)

    # FK para customer e product
    customer_id = Column(
        Integer, ForeignKey("customers.id"), nullable=True, index=True
    )
    product_id = Column(
        Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True, index=True
    )
    product_name = Column(String(255), nullable=True)
    customer_email = Column(String(255), nullable=True, index=True)

    # UTMs para rastreamento de origem
    utm_source = Column(Text, nullable=True)
    utm_medium = Column(Text, nullable=True)
    utm_campaign = Column(Text, nullable=True)
    utm_content = Column(Text, nullable=True)
    utm_term = Column(Text, nullable=True)
    src = Column(Text, nullable=True)

    # Identificação da conta (webhook endpoint slug)
    webhook_slug = Column(String(50), nullable=True, index=True)

    # Detalhes do carrinho / checkout
    checkout_url = Column(String(1024), nullable=True)
    order_bumps = Column(JSON, nullable=True)

    created_at = Column(DateTime, server_default=CREATED_AT_DEFAULT)
    updated_at = Column(
        DateTime,
        server_default=UPDATED_AT_DEFAULT,
        onupdate=UPDATED_AT_DEFAULT,
    )
