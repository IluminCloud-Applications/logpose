from sqlalchemy import Column, Integer, String, Float, DateTime
from database.core.connection import Base
from database.core.timezone import CREATED_AT_DEFAULT, UPDATED_AT_DEFAULT


class Customer(Base):
    """
    Armazena dados dos clientes que realizaram compras.
    Dados chegam via webhook das plataformas de pagamento.
    """
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    cpf = Column(String(20), nullable=True)
    total_spent = Column(Float, default=0.0)
    total_orders = Column(Integer, default=0)
    first_purchase_at = Column(DateTime, nullable=True)
    last_purchase_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=CREATED_AT_DEFAULT)
    updated_at = Column(
        DateTime,
        server_default=UPDATED_AT_DEFAULT,
        onupdate=UPDATED_AT_DEFAULT,
    )
