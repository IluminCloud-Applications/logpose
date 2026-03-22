"""
Handlers: creatives, recovery, funnel (Meta Ads + transações).
"""
from collections import defaultdict

from database.models.transaction import Transaction, TransactionStatus
from database.models.recovery import Recovery, RecoveryType
from api.campaigns.helpers import (
    parse_utm_content, parse_utm_campaign, safe_division,
)
from ai.tools.universal import _get_fb_credentials, _run_meta


def _handle_creatives(db, date_start, date_end, **kwargs):
    sort_by = kwargs.get("sort_by", "roas")
    limit = int(kwargs.get("limit", 10))

    token, acct_id = _get_fb_credentials(db)
    if not token:
        return "Nenhuma conta Facebook Ads configurada."

    ds = date_start.strftime("%Y-%m-%d")
    de = date_end.strftime("%Y-%m-%d")
    ads = _run_meta(token, acct_id, ds, de, "ad")

    approved = (
        db.query(Transaction)
        .filter(
            Transaction.created_at >= date_start,
            Transaction.created_at <= date_end,
            Transaction.status == TransactionStatus.APPROVED,
        )
        .all()
    )

    by_id: dict[str, list] = defaultdict(list)
    by_name: dict[str, list] = defaultdict(list)
    for tx in approved:
        ad_name, ad_id = parse_utm_content(tx.utm_content)
        if ad_id:
            by_id[ad_id].append(tx)
        elif ad_name:
            by_name[ad_name.lower()].append(tx)

    results = []
    for ad in ads:
        txs = by_id.get(ad.id, []) or by_name.get(ad.name.lower(), [])
        sales = len(txs)
        revenue = sum(t.amount for t in txs)
        profit = revenue - ad.spend
        roas = safe_division(revenue, ad.spend)
        cpa = safe_division(ad.spend, sales) if sales > 0 else 0
        if ad.spend > 0:
            results.append({
                "name": ad.name, "status": ad.status,
                "spend": ad.spend, "sales": sales, "revenue": revenue,
                "profit": profit, "roas": roas, "cpa": cpa,
            })

    reverse = sort_by != "cpa"
    results.sort(key=lambda x: x.get(sort_by, 0), reverse=reverse)

    if not results[:limit]:
        return "Nenhum criativo com gastos."

    lines = []
    for i, r in enumerate(results[:limit], 1):
        st = "🟢" if r["status"] == "active" else "🟡"
        lines.append(
            f"{i}. {st} {r['name']} | Vendas: {r['sales']} | "
            f"Revenue: R${r['revenue']:,.2f} | Spend: R${r['spend']:,.2f} | "
            f"ROAS: {r['roas']}x | CPA: R${r['cpa']:,.2f} | "
            f"Profit: R${r['profit']:,.2f}"
        )
    return "\n".join(lines)


def _handle_recovery(db, date_start, date_end, **kwargs):
    recoveries = (
        db.query(Recovery)
        .filter(Recovery.created_at >= date_start, Recovery.created_at <= date_end)
        .all()
    )
    if not recoveries:
        return "Nenhum dado de recuperação."

    names = {
        "abandoned_cart": "Carrinho Abandonado",
        "declined_card": "Cartão Recusado",
        "unpaid_pix": "PIX Não Pago",
    }
    lines = []
    total_lost = total_rec = 0
    for rtype in RecoveryType:
        items = [r for r in recoveries if r.type == rtype.value]
        if not items:
            continue
        rec = [r for r in items if r.recovered]
        lost = sum(r.amount for r in items)
        recov = sum(r.amount for r in rec)
        total_lost += lost
        total_rec += recov
        rate = round(len(rec) / len(items) * 100, 1)
        lines.append(
            f"{names.get(rtype.value, rtype.value)}: {len(items)} | "
            f"Valor: R${lost:,.2f} | Recuperado: R${recov:,.2f} ({rate}%)"
        )
    lines.append(
        f"TOTAL: Perdido R${total_lost:,.2f} | "
        f"Recuperado R${total_rec:,.2f} | "
        f"Pendente R${(total_lost - total_rec):,.2f}"
    )
    return "\n".join(lines)


def _handle_funnel(db, date_start, date_end, **kwargs):
    token, acct_id = _get_fb_credentials(db)
    if not token:
        return "Nenhuma conta Facebook Ads configurada."

    ds = date_start.strftime("%Y-%m-%d")
    de = date_end.strftime("%Y-%m-%d")
    campaigns = _run_meta(token, acct_id, ds, de, "campaign")

    approved = (
        db.query(Transaction)
        .filter(
            Transaction.created_at >= date_start,
            Transaction.created_at <= date_end,
            Transaction.status == TransactionStatus.APPROVED,
        )
        .all()
    )
    by_id: dict[str, list] = defaultdict(list)
    for tx in approved:
        _, camp_id = parse_utm_campaign(tx.utm_campaign)
        if camp_id:
            by_id[camp_id].append(tx)

    active = [c for c in campaigns if c.status == "active" and c.spend > 0]
    active.sort(key=lambda x: x.spend, reverse=True)

    lines = []
    for c in active[:10]:
        sales = len(by_id.get(c.id, []))
        c2l = safe_division(c.landing_page_views, c.clicks) * 100
        l2i = safe_division(c.initiate_checkout, c.landing_page_views) * 100
        i2s = safe_division(sales, c.initiate_checkout) * 100 if c.initiate_checkout else 0

        btl = "✅ Funil OK"
        if c2l < 50:
            btl = "⚠️ Click→LP"
        elif l2i < 10:
            btl = "⚠️ LP→Checkout"
        elif i2s < 20:
            btl = "⚠️ Checkout→Venda"

        lines.append(
            f"{c.name} | Clicks:{c.clicks}→LPV:{c.landing_page_views} "
            f"({c2l:.0f}%)→Checkout:{c.initiate_checkout} ({l2i:.0f}%)"
            f"→Vendas:{sales} ({i2s:.0f}%) | {btl}"
        )
    return "\n".join(lines) if lines else "Sem campanhas ativas."
