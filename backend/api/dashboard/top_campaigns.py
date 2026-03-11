"""
Top campanhas do dashboard: cruza Meta Ads com transações.
Reutiliza a lógica de merge de campanhas.
"""
from collections import defaultdict
from typing import Optional

from database.models.transaction import Transaction, TransactionStatus
from integrations.meta_ads.schemas import CampaignInsights
from api.campaigns.helpers import parse_utm_campaign, safe_division


def build_top_campaigns(
    base,
    meta_campaigns: list[CampaignInsights],
    limit: int = 5,
) -> list[dict]:
    """
    Monta top campanhas cruzando Meta Ads com transações.
    Se não houver Meta Ads, faz fallback para transações puras.
    """
    if not meta_campaigns:
        return _top_campaigns_from_db(base, limit)

    return _top_campaigns_merged(base, meta_campaigns, limit)


def _top_campaigns_merged(
    base,
    meta_campaigns: list[CampaignInsights],
    limit: int,
) -> list[dict]:
    """Cruza campanhas da Meta com transações por utm_campaign."""
    approved = base.filter(
        Transaction.status == TransactionStatus.APPROVED,
    ).all()

    # Agrupar transações por campaign_id e campaign_name
    by_id: dict[str, list] = defaultdict(list)
    by_name: dict[str, list] = defaultdict(list)

    for tx in approved:
        camp_name, camp_id = parse_utm_campaign(tx.utm_campaign)
        if camp_id:
            by_id[camp_id].append(tx)
        elif camp_name:
            by_name[camp_name.lower()].append(tx)

    results = []
    for camp in meta_campaigns:
        # Match por ID primeiro, depois por nome
        txs = by_id.get(camp.id, [])
        if not txs:
            txs = by_name.get(camp.name.lower(), [])

        revenue = sum(t.amount for t in txs)
        sales = len(txs)
        profit = revenue - camp.spend
        roas = safe_division(revenue, camp.spend)
        cpa = safe_division(camp.spend, sales) if sales > 0 else 0

        results.append({
            "name": camp.name,
            "spend": camp.spend,
            "revenue": revenue,
            "sales": sales,
            "profit": profit,
            "roas": roas,
            "cpa": cpa,
        })

    # Ordenar por revenue desc e limitar
    results.sort(key=lambda x: x["revenue"], reverse=True)
    return results[:limit]


def _top_campaigns_from_db(base, limit: int) -> list[dict]:
    """Fallback: top campanhas apenas por transações (sem Meta Ads)."""
    from sqlalchemy import func

    approved = base.filter(
        Transaction.status == TransactionStatus.APPROVED,
        Transaction.utm_campaign.isnot(None),
        Transaction.utm_campaign != "",
    )
    rows = (
        approved.with_entities(
            Transaction.utm_campaign,
            func.sum(Transaction.amount).label("revenue"),
            func.count(Transaction.id).label("sales"),
        )
        .group_by(Transaction.utm_campaign)
        .order_by(func.sum(Transaction.amount).desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "name": r.utm_campaign,
            "spend": 0,
            "revenue": float(r.revenue or 0),
            "sales": int(r.sales or 0),
            "profit": float(r.revenue or 0),
            "roas": 0,
            "cpa": 0,
        }
        for r in rows
    ]
