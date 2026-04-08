from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from database.core.connection import get_db
from database.models.product import Product
from database.models.product_items import Upsell
from database.models.transaction import Transaction, TransactionStatus
from database.models.recovery import Recovery
from database.models.recovery_channel_config import RecoveryChannelConfig
from api.auth.deps import get_current_user
from api.funnel.date_helpers import resolve_date_range
from api.products.alias_helper import get_product_names_for_filter

router = APIRouter(prefix="/funnel", tags=["funnel"])


@router.get("/recovery-data")
def get_recovery_funnel_data(
    preset: str = Query("30d"),
    date_start: str | None = Query(None),
    date_end: str | None = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """
    Funil de recuperação por produto.
    Stages: Totais (perdidas) → Recuperados → Upsell 1 → Upsell 2 ...
    """
    dt_start, dt_end = resolve_date_range(preset, date_start, date_end)
    products = db.query(Product).order_by(Product.id).all()
    configs = _get_channel_configs(db)

    result = []
    for product in products:
        names = get_product_names_for_filter(db, product.id)
        total_count, total_amount = _count_total_lost(
            db, names, dt_start, dt_end,
        )
        recovered_count, recovered_amount = _count_recovered(
            db, names, configs, dt_start, dt_end,
        )
        upsell_stages = _count_recovered_upsells(
            db, product.id, configs, dt_start, dt_end,
        )

        stages = [
            _make_stage("Totais", total_count, revenue=total_amount),
            _make_stage("Recuperados", recovered_count, revenue=recovered_amount),
        ]
        stages.extend(upsell_stages)

        result.append({
            "productId": str(product.id),
            "productName": product.name,
            "stages": stages,
        })

    return result


def _make_stage(
    name: str, value: int,
    revenue: float | None = None,
) -> dict:
    stage = {"name": name, "value": value}
    if revenue is not None:
        stage["revenue"] = round(revenue, 2)
    return stage


def _get_channel_configs(db: Session) -> list[RecoveryChannelConfig]:
    return db.query(RecoveryChannelConfig).all()


def _get_keyword_filters(configs: list[RecoveryChannelConfig]):
    """Build SQLAlchemy OR filters for recovery src keywords."""
    filters = []
    for cfg in configs:
        if cfg.keyword:
            filters.append(
                func.lower(Transaction.src).contains(cfg.keyword.lower())
            )
    return filters


def _count_total_lost(
    db: Session, names: list[str],
    dt_start, dt_end,
) -> tuple[int, float]:
    """
    Total de vendas perdidas = recoveries pendentes
    + transações recuperadas (approved com src matching).
    """
    # Pendentes na tabela recoveries
    q_pending = db.query(
        func.count(Recovery.id),
        func.coalesce(func.sum(Recovery.amount), 0),
    )
    if names:
        q_pending = q_pending.filter(Recovery.product_name.in_(names))
    if dt_start:
        q_pending = q_pending.filter(Recovery.created_at >= dt_start)
    if dt_end:
        q_pending = q_pending.filter(Recovery.created_at <= dt_end)

    pending_count, pending_amount = q_pending.one()

    # Transações recuperadas (são vendas que foram "perdidas" e voltaram)
    configs = _get_channel_configs(db)
    rec_count, rec_amount = _count_recovered(
        db, names, configs, dt_start, dt_end,
    )

    total = int(pending_count) + rec_count
    total_amount = float(pending_amount) + rec_amount
    return total, total_amount


def _count_recovered(
    db: Session, names: list[str],
    configs: list[RecoveryChannelConfig],
    dt_start, dt_end,
) -> tuple[int, float]:
    """Vendas recuperadas = transações APPROVED com src matching keywords."""
    keyword_filters = _get_keyword_filters(configs)
    if not keyword_filters:
        return 0, 0.0

    q = db.query(
        func.count(Transaction.id),
        func.coalesce(func.sum(Transaction.amount), 0),
    ).filter(
        Transaction.status == TransactionStatus.APPROVED,
        Transaction.src.isnot(None),
        Transaction.src != "",
        or_(*keyword_filters),
    )
    if names:
        q = q.filter(Transaction.product_name.in_(names))
    if dt_start:
        q = q.filter(Transaction.created_at >= dt_start)
    if dt_end:
        q = q.filter(Transaction.created_at <= dt_end)

    count, amount = q.one()
    return int(count), float(amount)


def _count_recovered_upsells(
    db: Session, product_id: int,
    configs: list[RecoveryChannelConfig],
    dt_start, dt_end,
) -> list[dict]:
    """
    Upsells comprados por clientes que vieram de recuperação.
    Verifica se o upsell transaction tem src matching alguma keyword.
    """
    upsells = db.query(Upsell).filter(
        Upsell.product_id == product_id,
    ).order_by(Upsell.id).all()

    if not upsells:
        return []

    keyword_filters = _get_keyword_filters(configs)
    if not keyword_filters:
        return [_make_stage(up.name or f"Upsell {i}", 0, revenue=0)
                for i, up in enumerate(upsells, 1)]

    stages = []
    for i, up in enumerate(upsells, 1):
        if not up.external_id:
            stages.append(
                _make_stage(up.name or f"Upsell {i}", 0, revenue=0)
            )
            continue

        q = db.query(
            func.count(Transaction.id),
            func.coalesce(func.sum(Transaction.amount), 0),
        ).filter(
            Transaction.product_name == up.name,
            Transaction.status == TransactionStatus.APPROVED,
            Transaction.src.isnot(None),
            Transaction.src != "",
            or_(*keyword_filters),
        )
        if dt_start:
            q = q.filter(Transaction.created_at >= dt_start)
        if dt_end:
            q = q.filter(Transaction.created_at <= dt_end)

        count, rev = q.one()
        stages.append(
            _make_stage(up.name or f"Upsell {i}", int(count), revenue=float(rev))
        )

    stages.sort(key=lambda s: s["value"], reverse=True)
    return stages
