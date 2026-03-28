from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from database.core.connection import get_db
from database.models.recovery import Recovery
from database.models.customer import Customer
from database.models.transaction import Transaction, TransactionStatus
from database.models.recovery_channel_config import RecoveryChannelConfig
from api.auth.deps import get_current_user
from api.funnel.date_helpers import resolve_date_range

router = APIRouter(prefix="/recovery", tags=["recovery"])


def _get_channel_configs(db: Session) -> list[RecoveryChannelConfig]:
    return db.query(RecoveryChannelConfig).all()


def _classify_src(src: str | None, configs: list[RecoveryChannelConfig]) -> str:
    """Classifica canal baseado no src usando as configs salvas."""
    if not src:
        return "other"
    src_lower = src.lower()
    for cfg in configs:
        if cfg.keyword and cfg.keyword.lower() in src_lower:
            return cfg.channel
    return "other"


def _build_approved_with_src_query(db: Session, configs, dt_start, dt_end):
    """
    Busca transações APPROVED que tenham src correspondente a alguma
    keyword configurada. Essas são vendas recuperadas via canais.
    """
    if not configs:
        return None

    keyword_filters = []
    for cfg in configs:
        if cfg.keyword:
            keyword_filters.append(
                func.lower(Transaction.src).contains(cfg.keyword.lower())
            )

    if not keyword_filters:
        return None

    q = db.query(Transaction, Customer.name).outerjoin(
        Customer, Transaction.customer_id == Customer.id,
    ).filter(
        Transaction.status == TransactionStatus.APPROVED,
        Transaction.src.isnot(None),
        Transaction.src != "",
        or_(*keyword_filters),
    )

    if dt_start:
        q = q.filter(Transaction.created_at >= dt_start)
    if dt_end:
        q = q.filter(Transaction.created_at <= dt_end)

    return q


def _build_pending_query(db: Session, dt_start, dt_end):
    """Busca recoveries que ainda estão pendentes (não recuperadas)."""
    q = db.query(Recovery).filter(Recovery.recovered.is_(False))

    if dt_start:
        q = q.filter(Recovery.created_at >= dt_start)
    if dt_end:
        q = q.filter(Recovery.created_at <= dt_end)

    return q


@router.get("/list")
def list_recoveries(
    preset: str = Query("30d"),
    date_start: str | None = Query(None),
    date_end: str | None = Query(None),
    type_filter: str = Query("all"),
    status_filter: str = Query("all"),
    channel_filter: str = Query("all"),
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=200),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    dt_start, dt_end = resolve_date_range(preset, date_start, date_end)
    configs = _get_channel_configs(db)

    items = []

    # ── Pendentes (da tabela recoveries) ──
    if status_filter in ("all", "pending"):
        pending_q = _build_pending_query(db, dt_start, dt_end)
        if type_filter != "all":
            pending_q = pending_q.filter(Recovery.type == type_filter)
        if search:
            term = f"%{search}%"
            pending_q = pending_q.filter(
                or_(
                    Recovery.customer_name.ilike(term),
                    Recovery.customer_email.ilike(term),
                )
            )
        for r in pending_q.all():
            channel = _classify_src(r.src, configs)
            if channel_filter != "all" and channel != channel_filter:
                continue
            items.append(_recovery_to_row(r, channel))

    # ── Recuperados (transações aprovadas com src matching) ──
    if status_filter in ("all", "recovered"):
        approved_q = _build_approved_with_src_query(
            db, configs, dt_start, dt_end,
        )
        if approved_q is not None:
            if search:
                term = f"%{search}%"
                approved_q = approved_q.filter(
                    or_(
                        Transaction.customer_email.ilike(term),
                        Transaction.product_name.ilike(term),
                    )
                )
            for tx, customer_name in approved_q.all():
                channel = _classify_src(tx.src, configs)
                if channel_filter != "all" and channel != channel_filter:
                    continue
                items.append(_tx_to_row(tx, channel, customer_name))

    # ── Ordenar por data (mais recente primeiro) ──
    items.sort(key=lambda x: x.get("date") or "", reverse=True)

    total = len(items)
    start = (page - 1) * per_page
    paginated = items[start: start + per_page]

    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "items": paginated,
    }


def _recovery_to_row(r: Recovery, channel: str) -> dict:
    return {
        "id": f"r-{r.id}",
        "date": r.created_at.isoformat() if r.created_at else None,
        "customerName": r.customer_name or "—",
        "customerEmail": r.customer_email or "—",
        "product": r.product_name or "—",
        "type": r.type.value if r.type else "abandoned_cart",
        "amount": r.amount,
        "recovered": False,
        "channel": channel,
        "recoveredAt": None,
    }


def _tx_to_row(tx: Transaction, channel: str, customer_name: str | None = None) -> dict:
    return {
        "id": f"t-{tx.id}",
        "date": tx.created_at.isoformat() if tx.created_at else None,
        "customerName": customer_name or tx.customer_email or "—",
        "customerEmail": tx.customer_email or "—",
        "product": tx.product_name or "—",
        "type": "unidentified",
        "amount": tx.amount,
        "recovered": True,
        "channel": channel,
        "recoveredAt": tx.created_at.isoformat() if tx.created_at else None,
    }
