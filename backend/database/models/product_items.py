from sqlalchemy import (
    Column, Integer, String, Float, DateTime,
    ForeignKey,
)
from database.core.connection import Base
from database.core.timezone import CREATED_AT_DEFAULT


class Checkout(Base):
    """
    URL de checkout vinculada a um produto.
    Cada produto pode ter vários checkouts ativos.
    """
    __tablename__ = "checkouts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(
        Integer, ForeignKey("products.id"), nullable=False, index=True
    )
    url = Column(String(500), nullable=False)
    price = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, server_default=CREATED_AT_DEFAULT)


class OrderBump(Base):
    """
    Order bump vinculado a um produto.
    """
    __tablename__ = "order_bumps"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(
        Integer, ForeignKey("products.id"), nullable=False, index=True
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
        Integer, ForeignKey("products.id"), nullable=False, index=True
    )
    external_id = Column(String(255), nullable=True)
    name = Column(String(255), nullable=False)
    price = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, server_default=CREATED_AT_DEFAULT)
