from sqlalchemy import Column, Integer, String, DateTime
from database.core.connection import Base
from database.core.timezone import CREATED_AT_DEFAULT


class FacebookAccount(Base):
    """
    Conta do Facebook Ads conectada.
    Armazena access_token para consumir a API de métricas.
    """
    __tablename__ = "facebook_accounts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    label = Column(String(255), nullable=False)
    account_id = Column(String(100), unique=True, nullable=False)
    access_token = Column(String(500), nullable=False)
    created_at = Column(DateTime, server_default=CREATED_AT_DEFAULT)
