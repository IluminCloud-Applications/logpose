from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional

from database.core.timezone import now_sp, SP_ZONE

from database.core.connection import get_db
from database.models.transaction import Transaction, TransactionStatus, PaymentPlatform
from api.auth.deps import get_current_user
from api.dashboard.aggregations import (
    _daily_revenue, _platform_dist, _hourly_sales,
)
from api.dashboard.meta_data import (
    fetch_meta_account_summary, fetch_meta_campaigns_for_dashboard,
)
from api.dashboard.kpis import calc_kpis
from api.dashboard.top_campaigns import build_top_campaigns
from api.products.alias_helper import get_product_names_for_filter, get_upsell_name_for_filter

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _parse_date_range(preset: str, start: Optional[str], end: Optional[str]):
    now = now_sp()
    if preset == "today":
        return now.replace(hour=0, minute=0, second=0, microsecond=0), now
    elif preset == "yesterday":
        yesterday = now - timedelta(days=1)
        return yesterday.replace(hour=0, minute=0, second=0, microsecond=0), yesterday.replace(hour=23, minute=59, second=59, microsecond=999999)
    elif preset == "3d":
        return now - timedelta(days=3), now
    elif preset == "7d":
        return now - timedelta(days=7), now
    elif preset == "14d":
        return now - timedelta(days=14), now
    elif preset == "30d":
        return now - timedelta(days=30), now
    elif preset == "90d":
        return now - timedelta(days=90), now
    elif preset == "custom" and start and end:
        try:
            s = datetime.strptime(start, "%Y-%m-%d")
            e = datetime.strptime(end, "%Y-%m-%d").replace(
                hour=23, minute=59, second=59
            )
            return s, e
        except ValueError:
            return None, None
    return None, None


def _apply_filters(query, db, preset, start, end, platform, product_id, account_slug=None, upsell_id=None):
    d_start, d_end = _parse_date_range(preset, start, end)
    if d_start:
        query = query.filter(Transaction.created_at >= d_start)
    if d_end:
        query = query.filter(Transaction.created_at <= d_end)
    if platform and platform != "all":
        try:
            query = query.filter(Transaction.platform == PaymentPlatform(platform))
        except ValueError:
            pass
    if upsell_id:
        upsell_name = get_upsell_name_for_filter(db, upsell_id)
        if upsell_name:
            query = query.filter(Transaction.product_name.ilike(f"%{upsell_name}%"))
    elif product_id:
        names = get_product_names_for_filter(db, product_id)
        if names:
            query = query.filter(Transaction.product_name.in_(names))
    if account_slug and account_slug != "all":
        query = query.filter(Transaction.webhook_slug == account_slug)
    return query


def _date_range_strings(preset, start, end):
    """Retorna date strings YYYY-MM-DD para a Meta API."""
    d_start, d_end = _parse_date_range(preset, start, end)
    if not d_start or not d_end:
        now = now_sp()
        d_start = now - timedelta(days=30)
        d_end = now
    return d_start.strftime("%Y-%m-%d"), d_end.strftime("%Y-%m-%d")


@router.get("/overview")
async def dashboard_overview(
    preset: str = Query("30d"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    platform: Optional[str] = Query(None),
    product_id: Optional[int] = Query(None),
    upsell_id: Optional[int] = Query(None),
    account_slug: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    base = db.query(Transaction)
    base = _apply_filters(base, db, preset, start_date, end_date, platform, product_id, account_slug, upsell_id=upsell_id)

    # Datas formatadas para a Meta API
    ds, de = _date_range_strings(preset, start_date, end_date)

    # Buscar dados da Meta Ads em paralelo
    meta_summary = await fetch_meta_account_summary(db, ds, de)
    meta_campaigns = await fetch_meta_campaigns_for_dashboard(db, ds, de)

    # KPIs com dados da Meta
    kpis = calc_kpis(base, meta_summary)

    # Daily revenue com spend diário da Meta
    daily = _daily_revenue(base, db, meta_campaigns, ds, de)

    platforms = _platform_dist(base, db)
    top_campaigns = build_top_campaigns(base, meta_campaigns)
    hourly = _hourly_sales(base, db)

    return {
        "kpis": kpis,
        "daily_revenue": daily,
        "platform_distribution": platforms,
        "top_campaigns": top_campaigns,
        "hourly_sales": hourly,
    }
