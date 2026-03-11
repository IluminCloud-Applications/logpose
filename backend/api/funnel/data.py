from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime

from database.core.connection import get_db
from database.models.product import Product
from database.models.product_items import OrderBump, Upsell
from database.models.transaction import Transaction, TransactionStatus
from database.models.facebook_account import FacebookAccount
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

    fb_data = await _get_fb_metrics(db, dt_start, dt_end)
    products = db.query(Product).order_by(Product.id).all()

    result = []
    for product in products:
        sales = _count_sales(db, product.id, dt_start, dt_end)
        ob_count = _count_order_bumps(db, product.id, dt_start, dt_end)
        upsell_stages = _get_upsell_stages(db, product.id, dt_start, dt_end)

        stages = [
            {"name": "Alcance", "value": fb_data.get("impressions", 0)},
            {"name": "Cliques", "value": fb_data.get("clicks", 0)},
            {"name": "Landing Page Views", "value": fb_data.get("lpv", 0)},
            {"name": "Iniciação de Compra", "value": fb_data.get("checkout", 0)},
            {"name": "Vendas", "value": sales},
        ]

        if ob_count > 0:
            stages.append({"name": "Order Bump", "value": ob_count})

        stages.extend(upsell_stages)

        result.append({
            "productId": str(product.id),
            "productName": product.name,
            "stages": stages,
        })

    return result


async def _get_fb_metrics(
    db: Session,
    dt_start: datetime | None,
    dt_end: datetime | None,
) -> dict:
    accounts = db.query(FacebookAccount).all()
    if not accounts:
        return {"impressions": 0, "clicks": 0, "lpv": 0, "checkout": 0}

    meta_start = date_to_meta_format(dt_start) if dt_start else "2020-01-01"
    meta_end = date_to_meta_format(dt_end) if dt_end else date_to_meta_format(datetime.now())

    return await fetch_facebook_aggregated(accounts, meta_start, meta_end)


def _count_sales(
    db: Session, product_id: int,
    dt_start: datetime | None, dt_end: datetime | None,
) -> int:
    q = db.query(Transaction).filter(
        Transaction.product_id == product_id,
        Transaction.status == TransactionStatus.APPROVED,
    )
    if dt_start:
        q = q.filter(Transaction.created_at >= dt_start)
    if dt_end:
        q = q.filter(Transaction.created_at <= dt_end)
    return q.count()


def _count_order_bumps(
    db: Session, product_id: int,
    dt_start: datetime | None, dt_end: datetime | None,
) -> int:
    ob_ids = db.query(OrderBump.external_id).filter(
        OrderBump.product_id == product_id,
        OrderBump.external_id.isnot(None),
    ).all()
    ob_codes = {r[0] for r in ob_ids}
    if not ob_codes:
        return 0

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
    for txn in q.all():
        if not isinstance(txn.order_bumps, list):
            continue
        for ob_data in txn.order_bumps:
            code = ob_data.get("code") or ob_data.get("product", {}).get("code", "")
            if code in ob_codes:
                count += 1
                break
    return count


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
            stages.append({"name": f"Upsell {i}", "value": 0})
            continue

        upsell_product = db.query(Product).filter(
            Product.external_id == up.external_id,
        ).first()

        if not upsell_product:
            stages.append({"name": up.name or f"Upsell {i}", "value": 0})
            continue

        q = db.query(Transaction).filter(
            Transaction.product_id == upsell_product.id,
            Transaction.status == TransactionStatus.APPROVED,
        )
        if dt_start:
            q = q.filter(Transaction.created_at >= dt_start)
        if dt_end:
            q = q.filter(Transaction.created_at <= dt_end)

        stages.append({
            "name": up.name or f"Upsell {i}",
            "value": q.count(),
        })
    return stages
