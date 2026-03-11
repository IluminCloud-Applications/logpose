"""
Busca dados da Meta Ads para o dashboard.
Reutiliza MetaAdsService configurado em campanhas.
"""
import logging
from typing import Optional
from sqlalchemy.orm import Session

from database.models.facebook_account import FacebookAccount
from integrations.meta_ads.service import MetaAdsService
from integrations.meta_ads.schemas import AccountInsightsSummary, CampaignInsights

logger = logging.getLogger(__name__)


def get_fb_account(db: Session) -> Optional[FacebookAccount]:
    """Retorna a primeira conta FB configurada."""
    return db.query(FacebookAccount).first()


async def fetch_meta_account_summary(
    db: Session,
    date_start: str,
    date_end: str,
) -> Optional[AccountInsightsSummary]:
    """Busca métricas agregadas da conta Meta Ads."""
    fb = get_fb_account(db)
    if not fb:
        return None

    service = MetaAdsService(fb.access_token, fb.account_id)
    try:
        summary = await service.get_account_summary(date_start, date_end)
        return summary
    except Exception as e:
        logger.error(f"Erro ao buscar account summary da Meta: {e}")
        return None
    finally:
        await service.close()


async def fetch_meta_campaigns_for_dashboard(
    db: Session,
    date_start: str,
    date_end: str,
) -> list[CampaignInsights]:
    """Busca campanhas da Meta Ads para top campaigns do dashboard."""
    fb = get_fb_account(db)
    if not fb:
        return []

    service = MetaAdsService(fb.access_token, fb.account_id)
    try:
        campaigns = await service.get_campaigns(date_start, date_end)
        return campaigns
    except Exception as e:
        logger.error(f"Erro ao buscar campanhas da Meta: {e}")
        return []
    finally:
        await service.close()
