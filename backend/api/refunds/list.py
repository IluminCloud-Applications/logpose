"""
API de reembolsos: lista transações com status refunded/chargeback
e permite registrar motivos.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from datetime import datetime, timedelta
from typing import Optional

from database.core.connection import get_db
from database.models.transaction import Transaction, TransactionStatus, PaymentPlatform
from database.models.refund_reason import RefundReason
from database.models.product import Product
from database.core.timezone import now_sp, SP_ZONE
from api.auth.deps import get_current_user

router = APIRouter(prefix="/refunds", tags=["refunds"])

REFUND_STATUSES = [TransactionStatus.REFUNDED, TransactionStatus.CHARGEBACK]


def _parse_date_range(preset: str, start: Optional[str], end: Optional[str]):
    now = now_sp()
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
            s = datetime.strptime(start, "%Y-%m-%d").replace(tzinfo=SP_ZONE)
            e = datetime.strptime(end, "%Y-%m-%d").replace(
                hour=23, minute=59, second=59, tzinfo=SP_ZONE
            )
            return s, e
        except ValueError:
            return None, None
    return None, None


@router.get("/list")
def list_refunds(
    preset: str = Query("30d"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    platform: Optional[str] = Query(None),
    product_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    has_reason: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=200),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    query = db.query(Transaction).filter(
        Transaction.status.in_(REFUND_STATUSES)
    )

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
        term = f"%{search}%"
        query = query.filter(
            or_(
                Transaction.customer_email.ilike(term),
                Transaction.product_name.ilike(term),
            )
        )

    # Filter by reason presence
    if has_reason == "yes":
        query = query.filter(
            Transaction.id.in_(db.query(RefundReason.transaction_id))
        )
    elif has_reason == "no":
        query = query.filter(
            ~Transaction.id.in_(db.query(RefundReason.transaction_id))
        )

    total = query.count()

    transactions = (
        query.order_by(Transaction.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    # Buscar reasons para essas transações
    tx_ids = [t.id for t in transactions]
    reasons_map = {}
    if tx_ids:
        reasons = db.query(RefundReason).filter(
            RefundReason.transaction_id.in_(tx_ids)
        ).all()
        reasons_map = {r.transaction_id: r for r in reasons}

    items = [_serialize(t, reasons_map.get(t.id)) for t in transactions]

    return {"total": total, "page": page, "per_page": per_page, "items": items}


def _serialize(t: Transaction, reason: RefundReason | None) -> dict:
    return {
        "id": t.id,
        "external_id": t.external_id,
        "platform": t.platform,
        "status": t.status,
        "amount": t.amount,
        "customer_email": t.customer_email,
        "product_name": t.product_name,
        "product_id": t.product_id,
        "created_at": t.created_at.isoformat() if t.created_at else None,
        "reason_code": reason.reason_code if reason else None,
        "reason_text": reason.reason_text if reason else None,
    }


@router.get("/summary")
def refunds_summary(
    preset: str = Query("30d"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """KPIs de reembolso no período."""
    date_start, date_end = _parse_date_range(preset, start_date, end_date)

    base = db.query(Transaction)
    if date_start:
        base = base.filter(Transaction.created_at >= date_start)
    if date_end:
        base = base.filter(Transaction.created_at <= date_end)

    total_sales = base.filter(
        Transaction.status == TransactionStatus.APPROVED
    ).count()
    refunded_q = base.filter(Transaction.status == TransactionStatus.REFUNDED)
    chargeback_q = base.filter(Transaction.status == TransactionStatus.CHARGEBACK)

    refunded = refunded_q.count()
    chargeback = chargeback_q.count()
    total_refunds = refunded + chargeback

    refund_amount = db.query(
        func.coalesce(func.sum(Transaction.amount), 0)
    ).filter(
        Transaction.id.in_([t.id for t in refunded_q.all()])
    ).scalar()

    chargeback_amount = db.query(
        func.coalesce(func.sum(Transaction.amount), 0)
    ).filter(
        Transaction.id.in_([t.id for t in chargeback_q.all()])
    ).scalar()

    total_with_sales = total_sales + total_refunds
    refund_rate = (total_refunds / total_with_sales * 100) if total_with_sales > 0 else 0

    # Contagem com motivo registrado
    with_reason = db.query(func.count(RefundReason.id)).filter(
        RefundReason.transaction_id.in_(
            base.filter(Transaction.status.in_(REFUND_STATUSES))
            .with_entities(Transaction.id)
        )
    ).scalar() or 0

    return {
        "total_refunds": total_refunds,
        "refunded": refunded,
        "chargebacks": chargeback,
        "refund_amount": float(refund_amount),
        "chargeback_amount": float(chargeback_amount),
        "refund_rate": round(refund_rate, 1),
        "with_reason": with_reason,
        "without_reason": total_refunds - with_reason,
    }


@router.get("/reasons/stats")
def reason_stats(
    preset: str = Query("30d"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Top motivos de reembolso no período."""
    date_start, date_end = _parse_date_range(preset, start_date, end_date)

    base_ids = db.query(Transaction.id).filter(
        Transaction.status.in_(REFUND_STATUSES)
    )
    if date_start:
        base_ids = base_ids.filter(Transaction.created_at >= date_start)
    if date_end:
        base_ids = base_ids.filter(Transaction.created_at <= date_end)

    rows = (
        db.query(RefundReason.reason_code, func.count(RefundReason.id))
        .filter(RefundReason.transaction_id.in_(base_ids))
        .group_by(RefundReason.reason_code)
        .order_by(func.count(RefundReason.id).desc())
        .all()
    )

    return [{"code": code, "count": count} for code, count in rows]
