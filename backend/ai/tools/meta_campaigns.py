"""
Tool: Busca métricas do Meta Ads (campanhas, conjuntos, anúncios).
"""
import asyncio
from langchain_core.tools import tool

from database.core.connection import SessionLocal
from database.models.facebook_account import FacebookAccount
from integrations.meta_ads.service import MetaAdsService
from database.core.timezone import now_sp
from datetime import timedelta


def _get_meta_service(db):
    """Obtém a primeira conta do Facebook configurada."""
    account = db.query(FacebookAccount).first()
    if not account:
        return None
    return MetaAdsService(account.access_token, account.account_id)


@tool
def query_meta_campaigns(
    days_back: int = 30,
    level: str = "campaign",
) -> str:
    """Busca métricas do Meta Ads: campanhas, conjuntos ou anúncios com spend, CPC, CTR.
    Use para responder sobre performance de campanhas, gastos, cliques, impressões.

    Args:
        days_back: Quantidade de dias para trás (default 30)
        level: Nível de detalhe: campaign, adset, ad
    """
    db = SessionLocal()
    try:
        service = _get_meta_service(db)
        if not service:
            return "⚠️ Nenhuma conta do Facebook Ads configurada."

        now = now_sp()
        date_end = now.strftime("%Y-%m-%d")
        date_start = (now - timedelta(days=days_back)).strftime("%Y-%m-%d")

        loop = asyncio.new_event_loop()
        try:
            if level == "adset":
                data = loop.run_until_complete(service.get_adsets(date_start, date_end))
            elif level == "ad":
                data = loop.run_until_complete(service.get_ads(date_start, date_end))
            else:
                data = loop.run_until_complete(service.get_campaigns(date_start, date_end))
        finally:
            loop.run_until_complete(service.close())
            loop.close()

        if not data:
            return f"Nenhum dado encontrado no nível '{level}' nos últimos {days_back} dias."

        # Ordena por spend desc
        data.sort(key=lambda x: x.spend, reverse=True)

        lines = [f"📊 Meta Ads — {level.upper()} (últimos {days_back} dias):\n"]
        total_spend = 0

        for item in data[:15]:
            total_spend += item.spend
            status_icon = "🟢" if item.status == "active" else "🟡"
            lines.append(
                f"{status_icon} {item.name}\n"
                f"   Spend: R$ {item.spend:,.2f} | Clicks: {item.clicks} | "
                f"CPC: R$ {item.cpc:,.2f} | CTR: {item.ctr:.2f}%\n"
                f"   LPV: {item.landing_page_views} | "
                f"Init Checkout: {item.initiate_checkout} | "
                f"Connect Rate: {item.connect_rate:.1f}%"
            )

        lines.append(f"\nTotal Spend: R$ {total_spend:,.2f}")
        lines.append(f"Total itens: {len(data)}")
        return "\n".join(lines)
    finally:
        db.close()
