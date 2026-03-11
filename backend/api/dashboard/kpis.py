"""
Cálculo dos KPIs do dashboard com dados de transações + Meta Ads.
"""
from typing import Optional

from database.models.transaction import Transaction, TransactionStatus
from integrations.meta_ads.schemas import AccountInsightsSummary


def calc_kpis(base, meta_summary: Optional[AccountInsightsSummary]) -> dict:
    """
    Calcula KPIs combinando transações do DB com métricas da Meta Ads.
    
    Transações: revenue, sales, chargebacks, refunds, ticket médio
    Meta Ads: spend, clicks, impressions → profit, ROAS, CPA, conversion_rate
    """
    all_rows = base.all()
    approved = [t for t in all_rows if t.status == TransactionStatus.APPROVED]
    refunded = [t for t in all_rows if t.status == TransactionStatus.REFUNDED]
    chargebacks = [t for t in all_rows if t.status == TransactionStatus.CHARGEBACK]

    total_revenue = sum(t.amount for t in approved)
    total_sales = len(approved)
    chargeback_amount = sum(t.amount for t in chargebacks)
    avg_ticket = total_revenue / total_sales if total_sales > 0 else 0
    chargeback_rate = (
        (len(chargebacks) / total_sales * 100) if total_sales > 0 else 0
    )

    # Dados da Meta Ads
    total_spend = meta_summary.spend if meta_summary else 0
    total_clicks = meta_summary.clicks if meta_summary else 0

    # Métricas calculadas
    profit = total_revenue - total_spend
    roas = round(total_revenue / total_spend, 2) if total_spend > 0 else 0
    cpa = round(total_spend / total_sales, 2) if total_sales > 0 else 0
    profit_margin = round((profit / total_revenue) * 100, 2) if total_revenue > 0 else 0
    conversion_rate = (
        round((total_sales / total_clicks) * 100, 2) if total_clicks > 0 else 0
    )

    return {
        "total_revenue": total_revenue,
        "total_spend": total_spend,
        "profit": profit,
        "total_sales": total_sales,
        "average_ticket": round(avg_ticket, 2),
        "cpa": cpa,
        "roas": roas,
        "profit_margin": round(profit_margin, 2),
        "conversion_rate": conversion_rate,
        "total_clicks": total_clicks,
        "chargeback_amount": chargeback_amount,
        "chargeback_rate": round(chargeback_rate, 2),
        "refunded_count": len(refunded),
        "chargeback_count": len(chargebacks),
    }
