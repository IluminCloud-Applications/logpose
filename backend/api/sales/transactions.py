from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Optional

from database.core.connection import get_db
from database.models.transaction import Transaction, TransactionStatus, PaymentPlatform
from database.models.product import Product
from database.core.timezone import now_sp, SP_ZONE
from api.auth.deps import get_current_user
from api.products.alias_helper import get_product_names_for_filter

router = APIRouter(prefix="/sales", tags=["sales"])


def _parse_date_range(preset: str, start: Optional[str], end: Optional[str]):
    """Converte preset + custom dates em datetime range."""
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


def _apply_filters(
    query, db, preset, start_date, end_date,
    status, platform, product_id, campaign, search,
):
    """Aplica filtros comuns de vendas à query."""
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
        names = get_product_names_for_filter(db, product_id)
        if names:
            query = query.filter(Transaction.product_name.in_(names))
    if campaign and campaign != "all":
        query = query.filter(Transaction.utm_campaign == campaign)
    if search:
        query = query.filter(Transaction.customer_email.ilike(f"%{search}%"))
    return query


@router.get("/transactions")
def list_transactions(
    preset: str = Query("all"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    platform: Optional[str] = Query(None),
    product_id: Optional[int] = Query(None),
    campaign: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    query = _apply_filters(
        db.query(Transaction), db, preset, start_date, end_date,
        status, platform, product_id, campaign, search,
    )
    total = query.count()
    transactions = (
        query.order_by(Transaction.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )
    return {
        "total": total, "page": page,
        "per_page": per_page,
        "items": [_serialize(t) for t in transactions],
    }


@router.get("/summary")
def sales_summary(
    preset: str = Query("all"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    platform: Optional[str] = Query(None),
    product_id: Optional[int] = Query(None),
    campaign: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """KPIs agregados — o status NAO filtra o resumo, apenas data/produto/plataforma/campanha."""
    # Ignora o filtro de status para que o resumo sempre exiba todos os status.
    query = _apply_filters(
        db.query(Transaction), db, preset, start_date, end_date,
        None, platform, product_id, campaign, search,
    )

    total = query.count()

    approved_q = query.filter(Transaction.status == TransactionStatus.APPROVED)
    approved = approved_q.count()
    refunded = query.filter(Transaction.status == TransactionStatus.REFUNDED).count()
    chargebacks = query.filter(Transaction.status == TransactionStatus.CHARGEBACK).count()
    pending = query.filter(Transaction.status == TransactionStatus.PENDING).count()
    trial = query.filter(Transaction.status == TransactionStatus.TRIAL).count()

    revenue = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.id.in_([t.id for t in approved_q.all()])
    ).scalar()

    avg_ticket = (float(revenue) / approved) if approved > 0 else 0

    return {
        "total": total, "approved": approved,
        "refunded": refunded, "chargebacks": chargebacks,
        "pending": pending, "trial": trial,
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

    platform_labels = {"kiwify": "Kiwify", "payt": "PayT", "api": "API"}

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
