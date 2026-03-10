from sqlalchemy import (
    Column, Integer, String, DateTime,
    Enum, ForeignKey,
)
from database.core.connection import Base
from database.core.timezone import CREATED_AT_DEFAULT
import enum


class WebhookPlatform(str, enum.Enum):
    KIWIFY = "kiwify"
    PAYT = "payt"


class WebhookEndpoint(Base):
    """
    Endpoints de webhook criados para receber dados
    das plataformas de pagamento (Kiwify, PayT).
    O UUID gerado no frontend vira o slug da URL.
    """
    __tablename__ = "webhook_endpoints"

    id = Column(Integer, primary_key=True, autoincrement=True)
    slug = Column(String(50), unique=True, nullable=False)
    platform = Column(Enum(WebhookPlatform), nullable=False)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=CREATED_AT_DEFAULT)
