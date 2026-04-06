"""
Tool universal que executa múltiplas consultas em um único request.
Reduz o consumo de API do Gemini para 2 calls por pergunta (decidir + responder).
"""
import asyncio
from langchain_core.tools import tool
from datetime import datetime, timedelta

from database.core.connection import SessionLocal
from database.core.timezone import now_sp, SP_ZONE
from database.models.transaction import Transaction, TransactionStatus
from database.models.facebook_account import FacebookAccount
from integrations.meta_ads.service import MetaAdsService
from api.dashboard.kpis import calc_kpis
from api.campaigns.helpers import (
    parse_utm_campaign, parse_utm_content, safe_division,
)


def _get_fb_credentials(db):
    """Obtém credenciais da primeira conta Facebook configurada."""
    account = db.query(FacebookAccount).first()
    if not account:
        return None, None
    return account.access_token, account.account_id


async def _fetch_meta_data(access_token, account_id, ds, de, level="campaign"):
    """Busca dados do Meta Ads de forma async."""
    service = MetaAdsService(access_token, account_id)
    try:
        if level == "adset":
            return await service.get_adsets(ds, de)
        elif level == "ad":
            return await service.get_ads(ds, de)
        elif level == "account":
            return await service.get_account_summary(ds, de)
        else:
            return await service.get_campaigns(ds, de)
    finally:
        await service.close()


def _run_meta(access_token, account_id, ds, de, level="campaign"):
    """Executa busca Meta Ads de forma sync-safe dentro de FastAPI."""
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    coro = _fetch_meta_data(access_token, account_id, ds, de, level)

    if loop and loop.is_running():
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor() as pool:
            return pool.submit(asyncio.run, coro).result()
    else:
        return asyncio.run(coro)


def _parse_dates(query: dict):
    """Extrai date_start e date_end do query dict."""
    ds = query.get("date_start", "")
    de = query.get("date_end", "")
    now = now_sp()

    if ds and de:
        try:
            start = datetime.strptime(ds, "%Y-%m-%d")
            end = datetime.strptime(de, "%Y-%m-%d").replace(
                hour=23, minute=59, second=59
            )
            return start, end
        except ValueError:
            pass

    days = int(query.get("days_back", 30))
    return now - timedelta(days=days), now


_HANDLER_CACHE = {}


def _get_handlers():
    if _HANDLER_CACHE:
        return _HANDLER_CACHE

    from ai.tools.handlers import (
        _handle_creatives, _handle_recovery, _handle_funnel,
    )
    from ai.tools.handlers_db import (
        _handle_products, _handle_customers, _handle_refunds,
    )

    _HANDLER_CACHE.update({
        "transactions": _handle_transactions,
        "kpis": _handle_kpis,
        "meta_campaigns": _handle_meta_campaigns,
        "creatives": _handle_creatives,
        "recovery": _handle_recovery,
        "funnel": _handle_funnel,
        "products": _handle_products,
        "customers": _handle_customers,
        "refunds": _handle_refunds,
    })
    return _HANDLER_CACHE


# ── Handlers inline ─────────────────────────────────────────────────

def _handle_transactions(db, date_start, date_end, **kwargs):
    status_filter = kwargs.get("status", "")
    utm = kwargs.get("utm_campaign", "")

    query = db.query(Transaction).filter(
        Transaction.created_at >= date_start,
        Transaction.created_at <= date_end,
    )
    if status_filter:
        try:
            query = query.filter(
                Transaction.status == TransactionStatus(status_filter)
            )
        except ValueError:
            pass
    if utm:
        query = query.filter(Transaction.utm_campaign.ilike(f"%{utm}%"))

    rows = query.limit(500).all()
    approved = [t for t in rows if t.status == TransactionStatus.APPROVED]
    pending = [t for t in rows if t.status == TransactionStatus.PENDING]
    refunded = [t for t in rows if t.status == TransactionStatus.REFUNDED]
    cbs = [t for t in rows if t.status == TransactionStatus.CHARGEBACK]
    trials = [t for t in rows if t.status == TransactionStatus.TRIAL]

    revenue = sum(t.amount for t in approved)
    avg = revenue / len(approved) if approved else 0
    rate = (len(approved) / len(rows) * 100) if rows else 0

    return (
        f"Total: {len(rows)} | Aprovadas: {len(approved)} "
        f"(R$ {revenue:,.2f}) | Pendentes: {len(pending)} | "
        f"Reembolsos: {len(refunded)} | Chargebacks: {len(cbs)} | "
        f"Trials: {len(trials)} | "
        f"Ticket: R$ {avg:,.2f} | Aprovação: {rate:.1f}%"
    )


def _handle_kpis(db, date_start, date_end, **kwargs):
    base = db.query(Transaction).filter(
        Transaction.created_at >= date_start,
        Transaction.created_at <= date_end,
    )
    ds = date_start.strftime("%Y-%m-%d")
    de = date_end.strftime("%Y-%m-%d")

    meta_summary = None
    token, acct_id = _get_fb_credentials(db)
    if token:
        try:
            meta_summary = _run_meta(token, acct_id, ds, de, "account")
        except Exception:
            pass

    k = calc_kpis(base, meta_summary)
    return (
        f"Revenue: R${k['total_revenue']:,.2f} | "
        f"Spend: R${k['total_spend']:,.2f} | "
        f"Profit: R${k['profit']:,.2f} | ROAS: {k['roas']}x | "
        f"CPA: R${k['cpa']:,.2f} | Ticket: R${k['average_ticket']:,.2f} | "
        f"Margem: {k['profit_margin']}% | "
        f"Vendas: {k['total_sales']} | "
        f"Chargebacks: {k['chargeback_count']} ({k['chargeback_rate']}%)"
    )


def _handle_meta_campaigns(db, date_start, date_end, **kwargs):
    level = kwargs.get("level", "campaign")
    status_filter = kwargs.get("status", "all")
    token, acct_id = _get_fb_credentials(db)
    if not token:
        return "Sem conta Facebook Ads."

    ds = date_start.strftime("%Y-%m-%d")
    de = date_end.strftime("%Y-%m-%d")
    data = _run_meta(token, acct_id, ds, de, level)

    if not data:
        return f"Sem dados de {level}."

    if status_filter == "active":
        data = [i for i in data if getattr(i, "status", "") == "active"]

    if not data:
        return f"Sem dados de {level} (filtro: {status_filter})."

    data.sort(key=lambda x: x.spend, reverse=True)
    lines = []
    for item in data[:15]:
        st = "(ATIVA) 🟢" if getattr(item, "status", "") == "active" else "(DESATIVADA) 🟡"
        lines.append(
            f"{st} [ID:{item.id}] {item.name} | "
            f"Budget: R${item.budget:,.0f} | Spend: R${item.spend:,.2f} | "
            f"Clicks: {item.clicks} | CPC: R${item.cpc:,.2f} | "
            f"CTR: {item.ctr:.2f}% | LPV: {item.landing_page_views} | "
            f"Init Checkout: {item.initiate_checkout}"
        )
    total = sum(i.spend for i in data)
    lines.append(f"Total spend: R${total:,.2f} | Total: {len(data)}")
    return "\n".join(lines)
