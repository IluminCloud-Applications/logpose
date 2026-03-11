from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from database.core.connection import get_db
from database.models.product import Product
from database.models.product_items import Checkout, OrderBump, Upsell
from api.auth.deps import get_current_user

router = APIRouter(prefix="/products/{product_id}", tags=["product-items"])


# ── Schemas ──────────────────────────────────────────────────

class CheckoutCreate(BaseModel):
    url: str
    price: float = 0.0

class CheckoutResponse(BaseModel):
    id: int
    product_id: int
    url: str
    price: float
    created_at: datetime | None = None
    class Config:
        from_attributes = True

class OrderBumpCreate(BaseModel):
    external_id: str | None = None
    name: str
    price: float = 0.0

class OrderBumpResponse(BaseModel):
    id: int
    product_id: int
    external_id: str | None
    name: str
    price: float
    created_at: datetime | None = None
    class Config:
        from_attributes = True

class UpsellCreate(BaseModel):
    external_id: str | None = None
    name: str
    price: float = 0.0

class UpsellResponse(BaseModel):
    id: int
    product_id: int
    external_id: str | None
    name: str
    price: float
    created_at: datetime | None = None
    class Config:
        from_attributes = True


# ── Helpers ──────────────────────────────────────────────────

def _get_product(product_id: int, db: Session) -> Product:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return product


# ── Checkout routes ──────────────────────────────────────────

@router.get("/checkouts", response_model=list[CheckoutResponse])
def list_checkouts(product_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    _get_product(product_id, db)
    return db.query(Checkout).filter(Checkout.product_id == product_id).all()


@router.post("/checkouts", response_model=CheckoutResponse, status_code=201)
def create_checkout(product_id: int, payload: CheckoutCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    _get_product(product_id, db)
    item = Checkout(product_id=product_id, url=payload.url, price=payload.price)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/checkouts/{item_id}", status_code=204)
def delete_checkout(product_id: int, item_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    item = db.query(Checkout).filter(Checkout.id == item_id, Checkout.product_id == product_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Checkout não encontrado")
    db.delete(item)
    db.commit()


# ── Order Bump routes ────────────────────────────────────────

@router.get("/order-bumps", response_model=list[OrderBumpResponse])
def list_order_bumps(product_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    _get_product(product_id, db)
    return db.query(OrderBump).filter(OrderBump.product_id == product_id).all()


@router.post("/order-bumps", response_model=OrderBumpResponse, status_code=201)
def create_order_bump(product_id: int, payload: OrderBumpCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    _get_product(product_id, db)
    item = OrderBump(product_id=product_id, external_id=payload.external_id, name=payload.name, price=payload.price)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/order-bumps/{item_id}", status_code=204)
def delete_order_bump(product_id: int, item_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    item = db.query(OrderBump).filter(OrderBump.id == item_id, OrderBump.product_id == product_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Order bump não encontrado")
    db.delete(item)
    db.commit()


# ── Upsell routes ────────────────────────────────────────────

@router.get("/upsells", response_model=list[UpsellResponse])
def list_upsells(product_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    _get_product(product_id, db)
    return db.query(Upsell).filter(Upsell.product_id == product_id).all()


@router.post("/upsells", response_model=UpsellResponse, status_code=201)
def create_upsell(product_id: int, payload: UpsellCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    _get_product(product_id, db)
    item = Upsell(product_id=product_id, external_id=payload.external_id, name=payload.name, price=payload.price)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/upsells/{item_id}", status_code=204)
def delete_upsell(product_id: int, item_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    item = db.query(Upsell).filter(Upsell.id == item_id, Upsell.product_id == product_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Upsell não encontrado")
    db.delete(item)
    db.commit()
