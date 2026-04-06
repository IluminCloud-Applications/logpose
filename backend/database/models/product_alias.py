from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from database.core.connection import Base
from database.core.timezone import CREATED_AT_DEFAULT


class ProductAlias(Base):
    """
    Nomes alternativos de um produto.
    Usado para mapear o nome que vem no webhook (product_name)
    para o produto canônico cadastrado no sistema.

    Exemplo:
        produto.name = "Cofre Secreto - PMJ"
        alias = "Cofre Secreto - PMJ | Ivana Oliveira"
    """
    __tablename__ = "product_aliases"
    __table_args__ = (
        UniqueConstraint("product_id", "alias", name="uq_product_alias"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(
        Integer,
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    alias = Column(String(255), nullable=False, index=True)
    created_at = Column(DateTime, server_default=CREATED_AT_DEFAULT)
