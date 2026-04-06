from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from datetime import datetime, timedelta
from typing import Optional

from database.core.connection import get_db
from database.models.customer import Customer
from database.models.customer_product import CustomerProduct
from database.models.product import Product
from database.models.transaction import Transaction, TransactionStatus, PaymentPlatform
from database.core.timezone import now_sp, SP_ZONE
from api.auth.deps import get_current_user
from api.products.alias_helper import get_product_names_for_filter

router = APIRouter(prefix="/customers", tags=["customers"])


def _parse_date_range(preset: str, start: Optional[str], end: Optional[str]):
    now = now_sp()
    if preset == "today":
        return now.replace(hour=0, minute=0, second=0, microsecond=0), now
    elif preset == "yesterday":
        yesterday = now - timedelta(days=1)
        return yesterday.replace(hour=0, minute=0, second=0, microsecond=0), yesterday.replace(hour=23, minute=59, second=59, microsecond=999999)
    elif preset == "3d":
        return now - timedelta(days=3), now
    elif preset == "7d":
        return now - timedelta(days=7), now
    elif preset == "30d":
        return now - timedelta(days=30), now
    elif preset == "90d":
        return now - timedelta(days=90), now
    elif preset == "custom" and start and end:
        try:
            s = datetime.strptime(start, "%Y-%m-%d").replace(tzinfo=SP_ZONE)
            e = datetime.strptime(end, "%Y-%m-%d").replace(
                hour=23, minute=59, second=59, tzinfo=SP_ZONE
            )
            return s, e
        except ValueError:
            return None, None
    return None, None


@router.get("")
def list_customers(
    preset: str = Query("all"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    platform: Optional[str] = Query(None),
    product_id: Optional[int] = Query(None),
    campaign: Optional[str] = Query(None),
    src: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    query = db.query(Customer)

    # Date filter on first_purchase_at
    date_start, date_end = _parse_date_range(preset, start_date, end_date)
    if date_start:
        query = query.filter(Customer.first_purchase_at >= date_start)
    if date_end:
        query = query.filter(Customer.first_purchase_at <= date_end)

    # Platform filter: customers that have transactions on a given platform
    if platform and platform != "all":
        try:
            plat = PaymentPlatform(platform)
            customer_ids = db.query(Transaction.customer_id).filter(
                Transaction.platform == plat,
                Transaction.customer_id.isnot(None),
            ).distinct().subquery()
            query = query.filter(Customer.id.in_(db.query(customer_ids)))
        except ValueError:
            pass

    # Product filter: customers with transactions matching product (name + aliases)
    if product_id:
        names = get_product_names_for_filter(db, product_id)
        if names:
            tx_customer_ids = db.query(Transaction.customer_id).filter(
                Transaction.product_name.in_(names),
                Transaction.customer_id.isnot(None),
            ).distinct().subquery()
            query = query.filter(Customer.id.in_(db.query(tx_customer_ids)))

    # Campaign filter (utm_campaign): customers with transactions matching campaign
    if campaign and campaign != "all":
        camp_ids = db.query(Transaction.customer_id).filter(
            Transaction.utm_campaign == campaign,
            Transaction.customer_id.isnot(None),
        ).distinct().subquery()
        query = query.filter(Customer.id.in_(db.query(camp_ids)))

    # SRC filter: customers with transactions matching src
    if src:
        src_ids = db.query(Transaction.customer_id).filter(
            Transaction.src.ilike(f"%{src}%"),
            Transaction.customer_id.isnot(None),
        ).distinct().subquery()
        query = query.filter(Customer.id.in_(db.query(src_ids)))

    # Search by name, email, or cpf
    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                Customer.name.ilike(term),
                Customer.email.ilike(term),
                Customer.cpf.ilike(term),
                Customer.phone.ilike(term),
            )
        )

    total = query.count()
    customers = (
        query.order_by(Customer.last_purchase_at.desc().nullslast())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    items = []
    for c in customers:
        products = _get_customer_products(db, c.id)
        items.append(_serialize(c, products))

    return {"total": total, "page": page, "per_page": per_page, "items": items}


@router.get("/summary")
def customers_summary(
    preset: str = Query("all"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    query = db.query(Customer)

    date_start, date_end = _parse_date_range(preset, start_date, end_date)
    if date_start:
        query = query.filter(Customer.first_purchase_at >= date_start)
    if date_end:
        query = query.filter(Customer.first_purchase_at <= date_end)

    total = query.count()
    total_orders = db.query(func.coalesce(func.sum(Customer.total_orders), 0)).filter(
        Customer.id.in_([c.id for c in query.all()])
    ).scalar()
    total_spent = db.query(func.coalesce(func.sum(Customer.total_spent), 0)).filter(
        Customer.id.in_([c.id for c in query.all()])
    ).scalar()

    # Unique products across all matching customers
    customer_ids = [c.id for c in query.all()]
    unique_products = 0
    if customer_ids:
        unique_products = db.query(func.count(func.distinct(CustomerProduct.product_id))).filter(
            CustomerProduct.customer_id.in_(customer_ids)
        ).scalar() or 0

    avg_ticket = (float(total_spent) / int(total_orders)) if total_orders and int(total_orders) > 0 else 0

    return {
        "total_customers": total,
        "total_orders": int(total_orders),
        "total_spent": float(total_spent),
        "unique_products": unique_products,
        "avg_ticket": round(avg_ticket, 2),
    }

def _get_customer_products(db: Session, customer_id: int) -> list[str]:
    rows = (
        db.query(Product.name)
        .join(CustomerProduct, CustomerProduct.product_id == Product.id)
        .filter(CustomerProduct.customer_id == customer_id)
        .all()
    )
    return [r[0] for r in rows]


def _serialize(c: Customer, products: list[str]) -> dict:
    return {
        "id": c.id,
        "name": c.name,
        "email": c.email,
        "phone": c.phone,
        "cpf": c.cpf,
        "total_spent": c.total_spent or 0,
        "total_orders": c.total_orders or 0,
        "products": products,
        "first_purchase_at": c.first_purchase_at.isoformat() if c.first_purchase_at else None,
        "last_purchase_at": c.last_purchase_at.isoformat() if c.last_purchase_at else None,
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }
