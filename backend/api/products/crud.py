from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from database.core.connection import get_db
from database.models.product import Product, ProductPlatform
from api.auth.deps import get_current_user

router = APIRouter(prefix="/products", tags=["products"])


class ProductCreate(BaseModel):
    name: str
    external_id: str
    ticket: float
    ideal_cpa: float | None = None
    platform: str  # "kiwify" | "payt"


class ProductUpdate(BaseModel):
    name: str | None = None
    ticket: float | None = None
    ideal_cpa: float | None = None


class ProductResponse(BaseModel):
    id: int
    external_id: str
    name: str
    ticket: float
    ideal_cpa: float | None
    platform: str
    created_at: datetime | None = None

    class Config:
        from_attributes = True


@router.get("", response_model=list[ProductResponse])
def list_products(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    products = db.query(Product).order_by(Product.id.desc()).all()
    return [_to_response(p) for p in products]


@router.post("", response_model=ProductResponse, status_code=201)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    platform_val = payload.platform.lower()
    if platform_val not in [p.value for p in ProductPlatform]:
        raise HTTPException(status_code=400, detail="Plataforma inválida")

    existing = db.query(Product).filter(
        Product.external_id == payload.external_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Produto com esse ID já existe")

    product = Product(
        name=payload.name,
        external_id=payload.external_id,
        ticket=payload.ticket,
        ideal_cpa=payload.ideal_cpa,
        platform=ProductPlatform(platform_val),
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return _to_response(product)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    if payload.name is not None:
        product.name = payload.name
    if payload.ticket is not None:
        product.ticket = payload.ticket
    if payload.ideal_cpa is not None:
        product.ideal_cpa = payload.ideal_cpa

    db.commit()
    db.refresh(product)
    return _to_response(product)


@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    db.delete(product)
    db.commit()


def _to_response(p: Product) -> ProductResponse:
    return ProductResponse(
        id=p.id,
        external_id=p.external_id,
        name=p.name,
        ticket=p.ticket,
        ideal_cpa=p.ideal_cpa,
        platform=p.platform.value,
        created_at=p.created_at,
    )
