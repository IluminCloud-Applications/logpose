"""
Tool: Analisa o funil de conversão por campanha.
"""
import asyncio
from langchain_core.tools import tool
from datetime import timedelta
from collections import defaultdict

from database.core.connection import SessionLocal
from database.core.timezone import now_sp
from database.models.transaction import Transaction, TransactionStatus
from database.models.facebook_account import FacebookAccount
from integrations.meta_ads.service import MetaAdsService
from api.campaigns.helpers import parse_utm_campaign, safe_division


@tool
def query_conversion_funnel(days_back: int = 30) -> str:
    """Analisa o funil de conversão: cliques → visualizações → checkouts → vendas.
    Identifica onde está o gargalo de conversão em cada campanha.
    Use para encontrar problemas de conversão e gargalos.

    Args:
        days_back: Quantidade de dias para trás (default 30)
    """
    db = SessionLocal()
    try:
        now = now_sp()
        date_start = now - timedelta(days=days_back)
        ds = date_start.strftime("%Y-%m-%d")
        de = now.strftime("%Y-%m-%d")

        account = db.query(FacebookAccount).first()
        if not account:
            return "⚠️ Nenhuma conta do Facebook Ads configurada."

        service = MetaAdsService(account.access_token, account.account_id)
        loop = asyncio.new_event_loop()
        try:
            campaigns = loop.run_until_complete(service.get_campaigns(ds, de))
        finally:
            loop.run_until_complete(service.close())
            loop.close()

        # Buscar transações aprovadas
        approved_txs = (
            db.query(Transaction)
            .filter(
                Transaction.created_at >= date_start,
                Transaction.status == TransactionStatus.APPROVED,
            )
            .all()
        )

        by_id: dict[str, list] = defaultdict(list)
        for tx in approved_txs:
            _, camp_id = parse_utm_campaign(tx.utm_campaign)
            if camp_id:
                by_id[camp_id].append(tx)

        lines = [f"📈 Funil de Conversão ({days_back} dias):\n"]
        active = [c for c in campaigns if c.status == "active" and c.spend > 0]
        active.sort(key=lambda x: x.spend, reverse=True)

        for camp in active[:10]:
            sales = len(by_id.get(camp.id, []))
            click_to_lpv = safe_division(camp.landing_page_views, camp.clicks) * 100
            lpv_to_init = safe_division(camp.initiate_checkout, camp.landing_page_views) * 100
            init_to_sale = safe_division(sales, camp.initiate_checkout) * 100 if camp.initiate_checkout else 0

            # Identificar gargalo
            bottleneck = ""
            if click_to_lpv < 50:
                bottleneck = "⚠️ Gargalo: Click → LP (página lenta ou público errado)"
            elif lpv_to_init < 10:
                bottleneck = "⚠️ Gargalo: LP → Checkout (VSL ou oferta fraca)"
            elif init_to_sale < 20:
                bottleneck = "⚠️ Gargalo: Checkout → Venda (checkout com fricção)"

            lines.append(
                f"🔹 {camp.name}\n"
                f"   Clicks: {camp.clicks} → LPV: {camp.landing_page_views} "
                f"({click_to_lpv:.1f}%) → Checkout: {camp.initiate_checkout} "
                f"({lpv_to_init:.1f}%) → Vendas: {sales} ({init_to_sale:.1f}%)\n"
                f"   {bottleneck}" if bottleneck else
                f"🔹 {camp.name}\n"
                f"   Clicks: {camp.clicks} → LPV: {camp.landing_page_views} "
                f"({click_to_lpv:.1f}%) → Checkout: {camp.initiate_checkout} "
                f"({lpv_to_init:.1f}%) → Vendas: {sales} ({init_to_sale:.1f}%)\n"
                f"   ✅ Funil saudável"
            )

        return "\n".join(lines) if len(lines) > 1 else "Nenhuma campanha ativa com gastos."
    finally:
        db.close()
