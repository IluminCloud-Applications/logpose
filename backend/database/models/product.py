from sqlalchemy import (
    Column, Integer, String, Float, DateTime,
    Enum, ForeignKey,
)
from database.core.connection import Base
from database.core.timezone import CREATED_AT_DEFAULT, UPDATED_AT_DEFAULT
import enum


class ProductPlatform(str, enum.Enum):
    KIWIFY = "kiwify"
    PAYT = "payt"


class Product(Base):
    """
    Produto cadastrado pelo CEO.
    Contém ticket, CPA ideal e plataforma de pagamento.
    """
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    external_id = Column(String(255), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    ticket = Column(Float, nullable=False)
    ideal_cpa = Column(Float, nullable=True)
    platform = Column(Enum(ProductPlatform), nullable=False)
    created_at = Column(DateTime, server_default=CREATED_AT_DEFAULT)
    updated_at = Column(
        DateTime,
        server_default=UPDATED_AT_DEFAULT,
        onupdate=UPDATED_AT_DEFAULT,
    )
