from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from database.core.connection import get_db
from database.models.product import Product
from database.models.product_items import Checkout, OrderBump, Upsell
from api.auth.deps import get_current_user

router = APIRouter(prefix="/products", tags=["products"])


class ProductCreate(BaseModel):
    name: str
    logo_url: str | None = None


class ProductUpdate(BaseModel):
    name: str | None = None
    logo_url: str | None = None


class ProductResponse(BaseModel):
    id: int
    name: str
    logo_url: str | None = None
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
    existing = db.query(Product).filter(
        Product.name == payload.name
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Produto com esse nome já existe")

    product = Product(name=payload.name, logo_url=payload.logo_url)
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
    if payload.logo_url is not None:
        product.logo_url = payload.logo_url

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
    db.query(Checkout).filter(Checkout.product_id == product_id).delete()
    db.query(OrderBump).filter(OrderBump.product_id == product_id).delete()
    db.query(Upsell).filter(Upsell.product_id == product_id).delete()
    db.delete(product)
    db.commit()


def _to_response(p: Product) -> ProductResponse:
    return ProductResponse(
        id=p.id,
        name=p.name,
        logo_url=p.logo_url,
        created_at=p.created_at,
    )
