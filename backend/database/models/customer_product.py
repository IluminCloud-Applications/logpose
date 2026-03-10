from sqlalchemy import (
    Column, Integer, DateTime, ForeignKey,
    UniqueConstraint,
)
from database.core.connection import Base
from database.core.timezone import CREATED_AT_DEFAULT


class CustomerProduct(Base):
    """
    Relação N:N entre clientes e produtos.
    Registra quais produtos cada cliente já comprou.
    """
    __tablename__ = "customer_products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(
        Integer, ForeignKey("customers.id"), nullable=False, index=True
    )
    product_id = Column(
        Integer, ForeignKey("products.id"), nullable=False, index=True
    )
    created_at = Column(DateTime, server_default=CREATED_AT_DEFAULT)

    __table_args__ = (
        UniqueConstraint(
            "customer_id", "product_id",
            name="uq_customer_product"
        ),
    )
