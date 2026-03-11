from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime

from database.core.connection import get_db
from database.models.recovery import Recovery
from database.models.recovery_channel_config import RecoveryChannelConfig
from api.auth.deps import get_current_user
from api.funnel.date_helpers import resolve_date_range

router = APIRouter(prefix="/recovery", tags=["recovery"])


def _classify_channel(
    src: str | None,
    configs: list[RecoveryChannelConfig],
) -> str:
    """Classifica o canal baseado no src da transação origin."""
    if not src:
        return "other"

    src_lower = src.lower()
    for cfg in configs:
        if cfg.keyword and cfg.keyword.lower() in src_lower:
            return cfg.channel
    return "other"


@router.get("/list")
def list_recoveries(
    preset: str = Query("30d"),
    date_start: str | None = Query(None),
    date_end: str | None = Query(None),
    type_filter: str = Query("all"),
    status_filter: str = Query("all"),
    channel_filter: str = Query("all"),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    dt_start, dt_end = resolve_date_range(preset, date_start, date_end)
    configs = db.query(RecoveryChannelConfig).all()

    q = db.query(Recovery).order_by(Recovery.created_at.desc())

    if dt_start:
        q = q.filter(Recovery.created_at >= dt_start)
    if dt_end:
        q = q.filter(Recovery.created_at <= dt_end)

    if type_filter != "all":
        q = q.filter(Recovery.type == type_filter)

    if status_filter == "recovered":
        q = q.filter(Recovery.recovered.is_(True))
    elif status_filter == "pending":
        q = q.filter(Recovery.recovered.is_(False))

    recoveries = q.all()

    result = []
    for r in recoveries:
        # Classificação do canal pelo campo `channel` do recovery ou pelo src
        # Se tiver channel definido, usa. Senão, classifica pelo src original.
        channel = r.channel.value if r.channel else "other"

        # Re-classifica baseado no campo src (se existir no contexto)
        # Como o recovery não tem src direto, usamos o channel existente
        # mas podemos expandir futuramente

        row = _to_response(r, channel)

        if channel_filter != "all" and row["channel"] != channel_filter:
            continue

        result.append(row)

    return result


def _to_response(r: Recovery, channel: str) -> dict:
    return {
        "id": r.id,
        "date": r.created_at.isoformat() if r.created_at else None,
        "customerName": r.customer_name or "—",
        "customerEmail": r.customer_email or "—",
        "product": r.product_name or "—",
        "type": r.type.value if r.type else "abandoned_cart",
        "amount": r.amount,
        "recovered": r.recovered,
        "channel": channel,
        "recoveredAt": (
            r.recovered_at.isoformat() if r.recovered_at else None
        ),
    }
