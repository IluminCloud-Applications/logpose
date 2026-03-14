"""
Tool: Retorna os KPIs principais do negócio combinando transações com Meta Ads.
"""
import asyncio
from langchain_core.tools import tool
from datetime import timedelta

from database.core.connection import SessionLocal
from database.core.timezone import now_sp
from database.models.transaction import Transaction
from database.models.facebook_account import FacebookAccount
from integrations.meta_ads.service import MetaAdsService
from api.dashboard.kpis import calc_kpis


@tool
def query_kpis(days_back: int = 30) -> str:
    """Retorna KPIs principais: revenue, spend, profit, ROAS, CPA, ticket médio.
    Use para responder sobre saúde financeira, performance geral do negócio.

    Args:
        days_back: Quantidade de dias para trás (default 30)
    """
    db = SessionLocal()
    try:
        now = now_sp()
        date_start = now - timedelta(days=days_back)
        ds = date_start.strftime("%Y-%m-%d")
        de = now.strftime("%Y-%m-%d")

        base = db.query(Transaction).filter(Transaction.created_at >= date_start)

        # Buscar Meta Ads summary
        meta_summary = None
        account = db.query(FacebookAccount).first()
        if account:
            service = MetaAdsService(account.access_token, account.account_id)
            loop = asyncio.new_event_loop()
            try:
                meta_summary = loop.run_until_complete(
                    service.get_account_summary(ds, de)
                )
            finally:
                loop.run_until_complete(service.close())
                loop.close()

        kpis = calc_kpis(base, meta_summary)

        return (
            f"📊 KPIs dos últimos {days_back} dias:\n"
            f"💰 Faturamento: R$ {kpis['total_revenue']:,.2f}\n"
            f"📢 Investimento (Ads): R$ {kpis['total_spend']:,.2f}\n"
            f"💵 Lucro: R$ {kpis['profit']:,.2f}\n"
            f"📈 ROAS: {kpis['roas']}x\n"
            f"🎯 CPA: R$ {kpis['cpa']:,.2f}\n"
            f"🎫 Ticket Médio: R$ {kpis['average_ticket']:,.2f}\n"
            f"📊 Margem de Lucro: {kpis['profit_margin']}%\n"
            f"🔄 Taxa de Conversão: {kpis['conversion_rate']}%\n"
            f"🛒 Vendas Totais: {kpis['total_sales']}\n"
            f"⚠️ Chargebacks: {kpis['chargeback_count']} "
            f"(R$ {kpis['chargeback_amount']:,.2f} — {kpis['chargeback_rate']}%)\n"
            f"↩️ Reembolsos: {kpis['refunded_count']}"
        )
    finally:
        db.close()
