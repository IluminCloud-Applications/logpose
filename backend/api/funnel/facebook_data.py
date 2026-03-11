import logging
from integrations.meta_ads.service import MetaAdsService
from database.models.facebook_account import FacebookAccount

logger = logging.getLogger(__name__)


async def fetch_facebook_aggregated(
    accounts: list[FacebookAccount],
    date_start: str,
    date_end: str,
) -> dict:
    """
    Busca insights de todas as contas do Facebook e soma
    as métricas (impressions, clicks, lpv, initiate_checkout).
    Se alguma conta falhar, ignora e soma as demais.
    """
    totals = {"impressions": 0, "clicks": 0, "lpv": 0, "checkout": 0}

    for account in accounts:
        try:
            service = MetaAdsService(account.access_token, account.account_id)
            summary = await service.get_account_summary(date_start, date_end)
            await service.close()

            totals["impressions"] += summary.impressions
            totals["clicks"] += summary.clicks
            totals["lpv"] += summary.landing_page_views
            totals["checkout"] += summary.initiate_checkout

        except Exception as e:
            logger.warning(
                f"Falha ao buscar dados do Facebook para {account.label}: {e}"
            )
            continue

    return totals
