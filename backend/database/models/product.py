from sqlalchemy import Column, Integer, String, Text, DateTime
from database.core.connection import Base
from database.core.timezone import CREATED_AT_DEFAULT, UPDATED_AT_DEFAULT


class Product(Base):
    """
    Produto cadastrado pelo CEO.
    Um produto pode ter checkouts em múltiplas plataformas.
    """
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False, unique=True)
    logo_url = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=CREATED_AT_DEFAULT)
    updated_at = Column(
        DateTime,
        server_default=UPDATED_AT_DEFAULT,
        onupdate=UPDATED_AT_DEFAULT,
    )
