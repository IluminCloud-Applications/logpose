"""
Dashboard financeiro da empresa.
Agrega dados de transações + Meta Ads por mês para visão anual.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from database.core.connection import get_db
from database.models.transaction import Transaction, TransactionStatus
from database.core.timezone import now_sp
from api.auth.deps import get_current_user
from api.company.meta_spend import fetch_monthly_spend

router = APIRouter(prefix="/company", tags=["company-dashboard"])

MONTH_LABELS = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
]


@router.get("/dashboard")
async def get_dashboard(
    year: int = now_sp().year,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """
    Retorna dados financeiros mensais agregados de transactions + Meta Ads
    para montar gráficos e KPIs da empresa.
    """
    # Buscar spend mensal da Meta Ads
    meta_monthly = await fetch_monthly_spend(db, year)

    monthly = _build_monthly(db, year, meta_monthly)
    total_sales = _get_total_sales_count(db, year)
    unique_customers = _get_unique_customers_count(db, year)

    return {
        "year": year,
        "monthly": monthly,
        "total_sales": total_sales,
        "unique_customers": unique_customers,
    }


def _build_monthly(
    db: Session,
    year: int,
    meta_monthly: dict[int, dict],
) -> list[dict]:
    """Agrega revenue, losses e spend (Meta Ads) por mês."""
    revenue_map = _get_revenue_by_month(db, year)
    loss_map = _get_losses_by_month(db, year)

    result = []
    for i in range(12):
        month_num = i + 1
        month_str = f"{year}-{month_num:02d}"
        revenue = revenue_map.get(month_num, 0)
        losses = loss_map.get(month_num, 0)

        # Spend da Meta Ads para este mês
        meta = meta_monthly.get(month_num, {})
        spend = meta.get("spend", 0)

        profit = revenue - losses - spend

        result.append({
            "month": month_str,
            "label": MONTH_LABELS[i],
            "revenue": revenue,
            "losses": losses,
            "spend": spend,
            "profit": profit,
        })

    return result


def _get_revenue_by_month(db: Session, year: int) -> dict[int, float]:
    """Revenue by month (approved transactions)."""
    rows = (
        db.query(
            extract("month", Transaction.created_at).label("month"),
            func.coalesce(func.sum(Transaction.amount), 0).label("total"),
        )
        .filter(
            extract("year", Transaction.created_at) == year,
            Transaction.status == TransactionStatus.APPROVED,
        )
        .group_by(extract("month", Transaction.created_at))
        .all()
    )
    return {int(r.month): float(r.total) for r in rows}


def _get_losses_by_month(db: Session, year: int) -> dict[int, float]:
    """Refunds + chargebacks by month."""
    rows = (
        db.query(
            extract("month", Transaction.created_at).label("month"),
            func.coalesce(func.sum(Transaction.amount), 0).label("total"),
        )
        .filter(
            extract("year", Transaction.created_at) == year,
            Transaction.status.in_([
                TransactionStatus.REFUNDED,
                TransactionStatus.CHARGEBACK,
            ]),
        )
        .group_by(extract("month", Transaction.created_at))
        .all()
    )
    return {int(r.month): float(r.total) for r in rows}


def _get_total_sales_count(db: Session, year: int) -> int:
    return (
        db.query(func.count(Transaction.id))
        .filter(
            extract("year", Transaction.created_at) == year,
            Transaction.status == TransactionStatus.APPROVED,
        )
        .scalar() or 0
    )


def _get_unique_customers_count(db: Session, year: int) -> int:
    return (
        db.query(func.count(func.distinct(Transaction.customer_id)))
        .filter(
            extract("year", Transaction.created_at) == year,
            Transaction.status == TransactionStatus.APPROVED,
            Transaction.customer_id.isnot(None),
        )
        .scalar() or 0
    )
