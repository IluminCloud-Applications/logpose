from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from datetime import datetime

from database.core.connection import get_db
from database.models.product import Product
from database.models.product_alias import ProductAlias
from database.models.transaction import Transaction
from api.auth.deps import get_current_user

router = APIRouter(prefix="/products", tags=["product-aliases"])


class AliasCreate(BaseModel):
    alias: str


class AliasResponse(BaseModel):
    id: int
    product_id: int
    alias: str
    created_at: datetime | None = None

    class Config:
        from_attributes = True


@router.get("/{product_id}/aliases", response_model=list[AliasResponse])
def list_aliases(
    product_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Retorna todos os aliases de um produto."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    aliases = (
        db.query(ProductAlias)
        .filter(ProductAlias.product_id == product_id)
        .order_by(ProductAlias.created_at.asc())
        .all()
    )
    return aliases


@router.post("/{product_id}/aliases", response_model=AliasResponse, status_code=201)
def create_alias(
    product_id: int,
    payload: AliasCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Adiciona um alias ao produto."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    alias_str = payload.alias.strip()
    if not alias_str:
        raise HTTPException(status_code=400, detail="Alias não pode ser vazio")

    existing = db.query(ProductAlias).filter(
        ProductAlias.product_id == product_id,
        ProductAlias.alias == alias_str,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Alias já cadastrado neste produto")

    alias = ProductAlias(product_id=product_id, alias=alias_str)
    db.add(alias)
    db.commit()
    db.refresh(alias)
    return alias


@router.delete("/{product_id}/aliases/{alias_id}", status_code=204)
def delete_alias(
    product_id: int,
    alias_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Remove um alias do produto."""
    alias = db.query(ProductAlias).filter(
        ProductAlias.id == alias_id,
        ProductAlias.product_id == product_id,
    ).first()
    if not alias:
        raise HTTPException(status_code=404, detail="Alias não encontrado")

    db.delete(alias)
    db.commit()


@router.get("/{product_id}/detect-aliases")
def detect_aliases(
    product_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """
    Detecta nomes automáticos nas transações que iniciam com o nome canônico do produto
    mas são diferentes dele — sugerindo-os como aliases candidatos.

    Exclui nomes que já são o nome canônico ou já estão cadastrados como alias.
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    # Nomes já registrados (canônico + aliases existentes)
    existing_aliases = (
        db.query(ProductAlias.alias)
        .filter(ProductAlias.product_id == product_id)
        .all()
    )
    excluded_names = {product.name} | {a.alias for a in existing_aliases}

    # Buscar nomes distintos nas transações que começam com o nome canônico
    pattern = f"{product.name}%"
    rows = (
        db.query(Transaction.product_name)
        .filter(
            Transaction.product_name.isnot(None),
            func.lower(Transaction.product_name).like(func.lower(pattern)),
            Transaction.product_name != product.name,
        )
        .distinct()
        .all()
    )

    detected = [
        r.product_name for r in rows
        if r.product_name and r.product_name not in excluded_names
    ]

    return {"detected": detected}

