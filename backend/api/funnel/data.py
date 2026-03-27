from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime

from database.core.timezone import now_sp
from database.core.connection import get_db
from database.models.product import Product
from database.models.product_items import OrderBump, Upsell
from database.models.transaction import Transaction, TransactionStatus
from database.models.facebook_account import FacebookAccount
from database.models.campaign_marker import CampaignMarker, MarkerType
from api.auth.deps import get_current_user
from api.funnel.date_helpers import resolve_date_range, date_to_meta_format
from api.funnel.facebook_data import fetch_facebook_aggregated

router = APIRouter(prefix="/funnel", tags=["funnel"])


@router.get("/data")
async def get_funnel_data(
    preset: str = Query("30d"),
    date_start: str | None = Query(None),
    date_end: str | None = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    dt_start, dt_end = resolve_date_range(preset, date_start, date_end)
    products = db.query(Product).order_by(Product.id).all()

    meta_start = date_to_meta_format(dt_start) if dt_start else "2020-01-01"
    meta_end = date_to_meta_format(dt_end) if dt_end else date_to_meta_format(now_sp())
    accounts = db.query(FacebookAccount).all()

    result = []
    for product in products:
        campaign_ids = _get_product_campaign_ids(db, str(product.id))
        fb = await _get_fb_for_product(accounts, meta_start, meta_end, campaign_ids)

        sales_count, sales_revenue = _count_sales(db, product.id, dt_start, dt_end)
        ob_count, ob_revenue = _count_order_bumps(db, product.id, dt_start, dt_end)
        upsell_stages = _get_upsell_stages(db, product.id, dt_start, dt_end)

        stages = [
            _make_stage("Alcance", fb.get("impressions", 0), meta={
                "impressions": fb.get("impressions", 0),
                "ctr": fb.get("ctr", 0),
                "cpm": fb.get("cpm", 0),
                "spend": fb.get("spend", 0),
            }),
            _make_stage("Cliques", fb.get("clicks", 0), meta={
                "ctr": fb.get("ctr", 0),
                "cpc": fb.get("cpc", 0),
                "spend": fb.get("spend", 0),
            }),
            _make_stage("Landing Page Views", fb.get("lpv", 0)),
            _make_stage("Iniciação de Compra", fb.get("checkout", 0)),
            _make_stage("Vendas", sales_count, revenue=sales_revenue),
        ]

        if ob_count > 0:
            stages.append(_make_stage("Order Bump", ob_count, revenue=ob_revenue))

        # Upsells já vem ordenados por vendas (desc)
        stages.extend(upsell_stages)

        result.append({
            "productId": str(product.id),
            "productName": product.name,
            "stages": stages,
        })

    return result


def _make_stage(
    name: str, value: int,
    revenue: float | None = None,
    meta: dict | None = None,
) -> dict:
    stage = {"name": name, "value": value}
    if revenue is not None:
        stage["revenue"] = round(revenue, 2)
    if meta:
        stage["meta"] = meta
    return stage


def _get_product_campaign_ids(db: Session, product_id: str) -> list[str]:
    markers = db.query(CampaignMarker).filter(
        CampaignMarker.marker_type == MarkerType.PRODUCT,
        CampaignMarker.reference_id == product_id,
    ).all()
    return [m.campaign_id for m in markers]


async def _get_fb_for_product(
    accounts: list, meta_start: str, meta_end: str,
    campaign_ids: list[str],
) -> dict:
    if not accounts:
        return {"impressions": 0, "clicks": 0, "lpv": 0, "checkout": 0, "spend": 0}

    ids_filter = campaign_ids if campaign_ids else None
    return await fetch_facebook_aggregated(accounts, meta_start, meta_end, ids_filter)


def _count_sales(
    db: Session, product_id: int,
    dt_start: datetime | None, dt_end: datetime | None,
) -> tuple[int, float]:
    q = db.query(
        func.count(Transaction.id),
        func.coalesce(func.sum(Transaction.amount), 0),
    ).filter(
        Transaction.product_id == product_id,
        Transaction.status == TransactionStatus.APPROVED,
    )
    if dt_start:
        q = q.filter(Transaction.created_at >= dt_start)
    if dt_end:
        q = q.filter(Transaction.created_at <= dt_end)
    count, revenue = q.one()
    return count, float(revenue)


def _count_order_bumps(
    db: Session, product_id: int,
    dt_start: datetime | None, dt_end: datetime | None,
) -> tuple[int, float]:
    ob_ids = db.query(OrderBump.external_id).filter(
        OrderBump.product_id == product_id,
        OrderBump.external_id.isnot(None),
    ).all()
    ob_codes = {r[0] for r in ob_ids}
    if not ob_codes:
        return 0, 0.0

    q = db.query(Transaction).filter(
        Transaction.product_id == product_id,
        Transaction.status == TransactionStatus.APPROVED,
        Transaction.order_bumps.isnot(None),
    )
    if dt_start:
        q = q.filter(Transaction.created_at >= dt_start)
    if dt_end:
        q = q.filter(Transaction.created_at <= dt_end)

    count = 0
    revenue = 0.0
    for txn in q.all():
        if not isinstance(txn.order_bumps, list):
            continue
        for ob_data in txn.order_bumps:
            code = ob_data.get("code") or ob_data.get("product", {}).get("code", "")
            if code in ob_codes:
                count += 1
                revenue += float(ob_data.get("amount", 0) or ob_data.get("price", 0) or 0)
                break
    return count, revenue


def _get_upsell_stages(
    db: Session, product_id: int,
    dt_start: datetime | None, dt_end: datetime | None,
) -> list[dict]:
    upsells = db.query(Upsell).filter(
        Upsell.product_id == product_id,
    ).order_by(Upsell.id).all()

    stages = []
    for i, up in enumerate(upsells, 1):
        if not up.external_id:
            stages.append(_make_stage(up.name or f"Upsell {i}", 0, revenue=0))
            continue

        q = db.query(
            func.count(Transaction.id),
            func.coalesce(func.sum(Transaction.amount), 0),
        ).filter(
            Transaction.product_name == up.name,
            Transaction.status == TransactionStatus.APPROVED,
        )
        if dt_start:
            q = q.filter(Transaction.created_at >= dt_start)
        if dt_end:
            q = q.filter(Transaction.created_at <= dt_end)

        count, rev = q.one()
        stages.append(_make_stage(
            up.name or f"Upsell {i}", count, revenue=float(rev),
        ))

    # Ordenar upsells por vendas (desc)
    stages.sort(key=lambda s: s["value"], reverse=True)
    return stages
