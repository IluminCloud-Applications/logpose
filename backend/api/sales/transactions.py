from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from typing import Optional

from database.core.connection import get_db
from database.models.transaction import Transaction, TransactionStatus, PaymentPlatform
from database.models.product import Product
from api.auth.deps import get_current_user

router = APIRouter(prefix="/sales", tags=["sales"])


def _parse_date_range(preset: str, start: Optional[str], end: Optional[str]):
    """Converte preset + custom dates em datetime range."""
    now = datetime.now(timezone.utc)

    if preset == "today":
        return now.replace(hour=0, minute=0, second=0, microsecond=0), now
    elif preset == "7d":
        return now - timedelta(days=7), now
    elif preset == "30d":
        return now - timedelta(days=30), now
    elif preset == "90d":
        return now - timedelta(days=90), now
    elif preset == "custom" and start and end:
        try:
            s = datetime.strptime(start, "%Y-%m-%d").replace(tzinfo=timezone.utc)
            e = datetime.strptime(end, "%Y-%m-%d").replace(
                hour=23, minute=59, second=59, tzinfo=timezone.utc
            )
            return s, e
        except ValueError:
            return None, None

    return None, None  # "all" — sem filtro de data


@router.get("/transactions")
def list_transactions(
    preset: str = Query("all"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    platform: Optional[str] = Query(None),
    product_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    query = db.query(Transaction)

    # Date filter
    date_start, date_end = _parse_date_range(preset, start_date, end_date)
    if date_start:
        query = query.filter(Transaction.created_at >= date_start)
    if date_end:
        query = query.filter(Transaction.created_at <= date_end)

    # Status filter
    if status and status != "all":
        try:
            query = query.filter(Transaction.status == TransactionStatus(status))
        except ValueError:
            pass

    # Platform filter
    if platform and platform != "all":
        try:
            query = query.filter(Transaction.platform == PaymentPlatform(platform))
        except ValueError:
            pass

    # Product filter
    if product_id:
        query = query.filter(Transaction.product_id == product_id)

    # Search by email
    if search:
        query = query.filter(Transaction.customer_email.ilike(f"%{search}%"))

    total = query.count()

    transactions = (
        query.order_by(Transaction.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "items": [_serialize(t) for t in transactions],
    }


@router.get("/summary")
def sales_summary(
    preset: str = Query("all"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    platform: Optional[str] = Query(None),
    product_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """KPIs agregados com os mesmos filtros da listagem."""
    query = db.query(Transaction)

    date_start, date_end = _parse_date_range(preset, start_date, end_date)
    if date_start:
        query = query.filter(Transaction.created_at >= date_start)
    if date_end:
        query = query.filter(Transaction.created_at <= date_end)
    if status and status != "all":
        try:
            query = query.filter(Transaction.status == TransactionStatus(status))
        except ValueError:
            pass
    if platform and platform != "all":
        try:
            query = query.filter(Transaction.platform == PaymentPlatform(platform))
        except ValueError:
            pass
    if product_id:
        query = query.filter(Transaction.product_id == product_id)
    if search:
        query = query.filter(Transaction.customer_email.ilike(f"%{search}%"))

    total = query.count()
    approved = query.filter(Transaction.status == TransactionStatus.APPROVED).count()
    refunded = query.filter(Transaction.status == TransactionStatus.REFUNDED).count()
    chargebacks = query.filter(Transaction.status == TransactionStatus.CHARGEBACK).count()
    pending = query.filter(Transaction.status == TransactionStatus.PENDING).count()

    revenue = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.id.in_([t.id for t in query.filter(Transaction.status == TransactionStatus.APPROVED).all()])
    ).scalar()

    avg_ticket = (float(revenue) / approved) if approved > 0 else 0

    return {
        "total": total,
        "approved": approved,
        "refunded": refunded,
        "chargebacks": chargebacks,
        "pending": pending,
        "revenue": float(revenue),
        "avg_ticket": round(avg_ticket, 2),
    }


@router.get("/filter-options")
def filter_options(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Retorna opções dinâmicas para os selects de filtro."""
    products = db.query(Product.id, Product.name).order_by(Product.name).all()
    campaigns = (
        db.query(Transaction.utm_campaign)
        .filter(Transaction.utm_campaign.isnot(None), Transaction.utm_campaign != "")
        .distinct()
        .all()
    )
    platforms = (
        db.query(Transaction.platform)
        .filter(Transaction.platform.isnot(None))
        .distinct()
        .all()
    )

    platform_labels = {"kiwify": "Kiwify", "payt": "PayT"}

    return {
        "products": [{"id": p.id, "name": p.name} for p in products],
        "campaigns": [c[0] for c in campaigns],
        "platforms": [
            {"value": p[0].value, "label": platform_labels.get(p[0].value, p[0].value)}
            for p in platforms
        ],
    }


def _serialize(t: Transaction) -> dict:
    return {
        "id": t.id,
        "external_id": t.external_id,
        "platform": t.platform.value,
        "status": t.status.value,
        "amount": t.amount,
        "customer_email": t.customer_email,
        "product_name": t.product_name,
        "product_id": t.product_id,
        "utm_source": t.utm_source,
        "utm_medium": t.utm_medium,
        "utm_campaign": t.utm_campaign,
        "utm_content": t.utm_content,
        "src": t.src,
        "checkout_url": t.checkout_url,
        "order_bumps": t.order_bumps,
        "created_at": t.created_at.isoformat() if t.created_at else None,
    }
