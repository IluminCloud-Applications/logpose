from sqlalchemy import Column, Integer, String, DateTime
from database.core.connection import Base
from database.core.timezone import CREATED_AT_DEFAULT


class StripeAccount(Base):
    """
    Conta Stripe conectada.
    Armazena Secret Key para consumir dados de assinatura via API.
    """
    __tablename__ = "stripe_accounts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    api_key = Column(String(500), nullable=False)
    created_at = Column(DateTime, server_default=CREATED_AT_DEFAULT)
