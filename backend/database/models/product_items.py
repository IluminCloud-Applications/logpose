from sqlalchemy import (
    Column, Integer, String, Float, DateTime,
    ForeignKey, Enum,
)
from database.core.connection import Base
from database.core.timezone import CREATED_AT_DEFAULT
import enum


class CheckoutPlatform(str, enum.Enum):
    KIWIFY = "kiwify"
    PAYT = "payt"


class Checkout(Base):
    """
    URL de checkout vinculada a um produto.
    Cada checkout pertence a uma plataforma (Kiwify, PayT).
    """
    __tablename__ = "checkouts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(
        Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True
    )
    url = Column(String(500), nullable=True, default="")
    price = Column(Float, nullable=False, default=0.0)
    platform = Column(Enum(CheckoutPlatform), nullable=False)
    checkout_code = Column(String(255), nullable=True, index=True)
    name = Column(String(255), nullable=True)
    created_at = Column(DateTime, server_default=CREATED_AT_DEFAULT)



class OrderBump(Base):
    """
    Order bump vinculado a um produto.
    """
    __tablename__ = "order_bumps"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(
        Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True
    )
    external_id = Column(String(255), nullable=True)
    name = Column(String(255), nullable=False)
    price = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, server_default=CREATED_AT_DEFAULT)


class Upsell(Base):
    """
    Upsell vinculado a um produto.
    """
    __tablename__ = "upsells"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(
        Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True
    )
    external_id = Column(String(255), nullable=True)
    name = Column(String(255), nullable=False)
    price = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, server_default=CREATED_AT_DEFAULT)
