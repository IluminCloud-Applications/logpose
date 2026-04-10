"""
Helper centralizado para filtro de produto por nome.

Resolve o product_id para uma lista de nomes (nome canônico + aliases),
permitindo que o filtro funcione com `product_name IN (lista)`.

Isso garante que transações vindas via webhook (com nomes diferentes)
sejam corretamente filtradas junto com as importadas via CSV.
"""
from sqlalchemy.orm import Session
from database.models.product import Product
from database.models.product_alias import ProductAlias
from database.models.product_items import Upsell


def get_product_names_for_filter(db: Session, product_id: int) -> list[str]:
    """
    Retorna lista de nomes do produto: nome canônico + todos os aliases.
    Usar com `Transaction.product_name.in_(lista)`.
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return []

    aliases = (
        db.query(ProductAlias.alias)
        .filter(ProductAlias.product_id == product_id)
        .all()
    )

    names = [product.name] + [a.alias for a in aliases]
    return names


def get_upsell_name_for_filter(db: Session, upsell_id: int) -> str | None:
    """
    Retorna o nome do upsell para filtrar transações via ILIKE (contains).
    Upsells podem ter nomes parciais, ex: 'Cofre Secreto - PMJ',
    enquanto a transação registra 'Cofre Secreto - PMJ | Ivana [147]'.
    Usar com `Transaction.product_name.ilike(f"%{nome}%")`.
    """
    upsell = db.query(Upsell).filter(Upsell.id == upsell_id).first()
    if not upsell:
        return None
    return upsell.name
