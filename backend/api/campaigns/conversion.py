"""
Dados de conversão/financeiro por campanha.
Retorna breakdown de transações: approved, pending, refunded, chargeback
para cada campanha (por UTM matching).
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from collections import defaultdict

from database.core.connection import get_db
from database.models.transaction import Transaction, TransactionStatus
from api.auth.deps import get_current_user
from api.campaigns.helpers import parse_utm_campaign

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


@router.get("/conversion")
def campaign_conversion_data(
    date_start: str = Query(...),
    date_end: str = Query(...),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Retorna métricas de conversão por campanha."""
    transactions = db.query(Transaction).filter(
        Transaction.created_at >= date_start,
        Transaction.created_at <= f"{date_end} 23:59:59",
        Transaction.utm_campaign.isnot(None),
        Transaction.utm_campaign != "",
    ).all()

    # Group by campaign
    by_campaign: dict[str, list[Transaction]] = defaultdict(list)
    for tx in transactions:
        _name, camp_id = parse_utm_campaign(tx.utm_campaign)
        key = camp_id if camp_id else (_name or "unknown")
        by_campaign[key].append(tx)

    results = []
    for campaign_key, txs in by_campaign.items():
        approved = [t for t in txs if t.status == TransactionStatus.APPROVED]
        pending = [t for t in txs if t.status == TransactionStatus.PENDING]
        refunded = [t for t in txs if t.status == TransactionStatus.REFUNDED]
        chargeback = [t for t in txs if t.status == TransactionStatus.CHARGEBACK]
        trial = [t for t in txs if t.status == TransactionStatus.TRIAL]

        total = len(txs)
        approved_revenue = sum(t.amount for t in approved)
        pending_revenue = sum(t.amount for t in pending)
        refunded_revenue = sum(t.amount for t in refunded)
        chargeback_revenue = sum(t.amount for t in chargeback)
        trial_revenue = sum(t.amount for t in trial)
        lost_total = len(pending) + len(refunded) + len(chargeback)

        results.append({
            "campaign_id": campaign_key,
            "total_transactions": total,
            "approved_count": len(approved),
            "approved_revenue": approved_revenue,
            "pending_count": len(pending),
            "pending_revenue": pending_revenue,
            "refunded_count": len(refunded),
            "refunded_revenue": refunded_revenue,
            "chargeback_count": len(chargeback),
            "chargeback_revenue": chargeback_revenue,
            "trial_count": len(trial),
            "trial_revenue": trial_revenue,
            "approval_rate": round((len(approved) / total) * 100, 1) if total > 0 else 0,
            "recovery_rate": round((len(pending) / total) * 100, 1) if total > 0 else 0,
            "loss_rate": round((lost_total / total) * 100, 1) if total > 0 else 0,
        })

    return results
