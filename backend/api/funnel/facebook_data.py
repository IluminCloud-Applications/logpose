import logging
from integrations.meta_ads.service import MetaAdsService
from database.models.facebook_account import FacebookAccount

logger = logging.getLogger(__name__)


async def fetch_facebook_aggregated(
    accounts: list[FacebookAccount],
    date_start: str,
    date_end: str,
    campaign_ids: list[str] | None = None,
) -> dict:
    """
    Busca insights de todas as contas do Facebook e soma
    as métricas (reach, impressions, clicks, lpv, initiate_checkout, spend, ctr, cpm).
    Se campaign_ids for fornecido, filtra apenas essas campanhas.
    """
    totals = {
        "reach": 0, "impressions": 0, "clicks": 0,
        "lpv": 0, "checkout": 0, "spend": 0.0,
    }

    for account in accounts:
        try:
            service = MetaAdsService(account.access_token, account.account_id)

            if campaign_ids:
                metrics = await _fetch_filtered_by_campaigns(
                    service, date_start, date_end, campaign_ids,
                )
            else:
                summary = await service.get_account_summary(date_start, date_end)
                metrics = {
                    "reach": summary.impressions,
                    "impressions": summary.impressions,
                    "clicks": summary.clicks,
                    "lpv": summary.landing_page_views,
                    "checkout": summary.initiate_checkout,
                    "spend": summary.spend,
                }

            await service.close()

            for key in totals:
                totals[key] += metrics.get(key, 0)

        except Exception as e:
            logger.warning(
                f"Falha ao buscar dados do Facebook para {account.label}: {e}"
            )
            continue

    # Calcular CTR e CPM derivados
    totals["ctr"] = (
        (totals["clicks"] / totals["impressions"]) * 100
        if totals["impressions"] > 0 else 0
    )
    totals["cpm"] = (
        (totals["spend"] / totals["impressions"]) * 1000
        if totals["impressions"] > 0 else 0
    )
    totals["cpc"] = (
        totals["spend"] / totals["clicks"]
        if totals["clicks"] > 0 else 0
    )

    return totals


async def _fetch_filtered_by_campaigns(
    service: MetaAdsService,
    date_start: str,
    date_end: str,
    campaign_ids: list[str],
) -> dict:
    """Busca métricas somadas apenas das campanhas especificadas."""
    campaigns = await service.get_campaigns(date_start, date_end)

    filtered = [c for c in campaigns if c.id in set(campaign_ids)]
    result = {
        "reach": 0, "impressions": 0, "clicks": 0,
        "lpv": 0, "checkout": 0, "spend": 0.0,
    }

    for c in filtered:
        result["reach"] += c.impressions
        result["impressions"] += c.impressions
        result["clicks"] += c.clicks
        result["lpv"] += c.landing_page_views
        result["checkout"] += c.initiate_checkout
        result["spend"] += c.spend

    return result
