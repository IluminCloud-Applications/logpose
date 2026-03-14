"""
Tool: Identifica os melhores criativos (ads) cruzando Meta Ads com vendas.
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
from api.campaigns.helpers import parse_utm_content, safe_division


@tool
def query_best_creatives(
    days_back: int = 30,
    sort_by: str = "roas",
    limit: int = 10,
) -> str:
    """Identifica os melhores anúncios (criativos) por vendas, ROAS ou CPA.
    Cruza dados do Meta Ads com transações reais do banco.
    Use para responder qual criativo performa melhor.

    Args:
        days_back: Quantidade de dias para trás (default 30)
        sort_by: Ordenar por: roas, sales, cpa, profit
        limit: Quantidade máxima de resultados (default 10)
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
            ads = loop.run_until_complete(service.get_ads(ds, de))
        finally:
            loop.run_until_complete(service.close())
            loop.close()

        # Buscar transações aprovadas do período
        approved_txs = (
            db.query(Transaction)
            .filter(
                Transaction.created_at >= date_start,
                Transaction.status == TransactionStatus.APPROVED,
            )
            .all()
        )

        # Agrupar por ad (utm_content)
        by_ad_id: dict[str, list] = defaultdict(list)
        by_ad_name: dict[str, list] = defaultdict(list)
        for tx in approved_txs:
            ad_name, ad_id = parse_utm_content(tx.utm_content)
            if ad_id:
                by_ad_id[ad_id].append(tx)
            elif ad_name:
                by_ad_name[ad_name.lower()].append(tx)

        results = []
        for ad in ads:
            txs = by_ad_id.get(ad.id, []) or by_ad_name.get(ad.name.lower(), [])
            sales = len(txs)
            revenue = sum(t.amount for t in txs)
            profit = revenue - ad.spend
            roas = safe_division(revenue, ad.spend)
            cpa = safe_division(ad.spend, sales) if sales > 0 else 0

            results.append({
                "name": ad.name, "status": ad.status,
                "spend": ad.spend, "clicks": ad.clicks,
                "sales": sales, "revenue": revenue,
                "profit": profit, "roas": roas, "cpa": cpa,
            })

        # Ordenar
        reverse = sort_by != "cpa"
        results.sort(key=lambda x: x.get(sort_by, 0), reverse=reverse)
        results = [r for r in results if r["spend"] > 0][:limit]

        if not results:
            return "Nenhum criativo com gastos encontrado no período."

        lines = [f"🎯 Top {len(results)} criativos por {sort_by.upper()} ({days_back} dias):\n"]
        for i, r in enumerate(results, 1):
            icon = "🟢" if r["status"] == "active" else "🟡"
            lines.append(
                f"{i}. {icon} {r['name']}\n"
                f"   Vendas: {r['sales']} | Revenue: R$ {r['revenue']:,.2f} | "
                f"Spend: R$ {r['spend']:,.2f}\n"
                f"   ROAS: {r['roas']}x | CPA: R$ {r['cpa']:,.2f} | "
                f"Profit: R$ {r['profit']:,.2f}"
            )
        return "\n".join(lines)
    finally:
        db.close()
