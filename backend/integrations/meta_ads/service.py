"""
Serviço principal que orquestra todas as buscas da Meta Ads.
Ponto de entrada único para a camada de API.
Usa asyncio.gather para paralelizar e cache para evitar chamadas duplicadas.
"""
import asyncio
import logging

from integrations.meta_ads.client import MetaAdsClient
from integrations.meta_ads.campaigns import fetch_campaigns
from integrations.meta_ads.adsets import fetch_adsets
from integrations.meta_ads.ads import fetch_ads
from integrations.meta_ads.account import fetch_account_insights
from integrations.meta_ads.cache import (
    get_cached, set_cached, build_cache_key,
)
from integrations.meta_ads.schemas import (
    CampaignInsights,
    AdSetInsights,
    AdInsights,
    AccountInsightsSummary,
)

logger = logging.getLogger(__name__)

# TTL do cache em segundos (5 minutos)
CACHE_TTL = 300


class MetaAdsService:
    """
    Fachada para toda integração com Meta Ads.
    Usa cache + paralelização para minimizar chamadas à API.
    """

    def __init__(self, access_token: str, account_id: str):
        self.client = MetaAdsClient(access_token, account_id)
        self._account_id = account_id

    async def get_campaigns(
        self, date_start: str, date_end: str,
    ) -> list[CampaignInsights]:
        key = build_cache_key(
            self._account_id, "campaigns", date_start, date_end,
        )
        cached = get_cached(key)
        if cached is not None:
            return cached
        result = await fetch_campaigns(self.client, date_start, date_end)
        set_cached(key, result, CACHE_TTL)
        return result

    async def get_adsets(
        self, date_start: str, date_end: str,
    ) -> list[AdSetInsights]:
        key = build_cache_key(
            self._account_id, "adsets", date_start, date_end,
        )
        cached = get_cached(key)
        if cached is not None:
            return cached
        result = await fetch_adsets(self.client, date_start, date_end)
        set_cached(key, result, CACHE_TTL)
        return result

    async def get_ads(
        self, date_start: str, date_end: str,
    ) -> list[AdInsights]:
        key = build_cache_key(
            self._account_id, "ads", date_start, date_end,
        )
        cached = get_cached(key)
        if cached is not None:
            return cached
        result = await fetch_ads(self.client, date_start, date_end)
        set_cached(key, result, CACHE_TTL)
        return result

    async def get_all_levels(
        self, date_start: str, date_end: str,
    ) -> tuple[list[CampaignInsights], list[AdSetInsights], list[AdInsights]]:
        """
        Busca campanhas, adsets e ads em paralelo.
        Usa cache individual para cada nível.
        Reduz tempo total de resposta significativamente.
        """
        campaigns, adsets, ads = await asyncio.gather(
            self.get_campaigns(date_start, date_end),
            self.get_adsets(date_start, date_end),
            self.get_ads(date_start, date_end),
        )
        return campaigns, adsets, ads

    async def get_account_summary(
        self, date_start: str, date_end: str,
    ) -> AccountInsightsSummary:
        key = build_cache_key(
            self._account_id, "account", date_start, date_end,
        )
        cached = get_cached(key)
        if cached is not None:
            return cached
        result = await fetch_account_insights(
            self.client, date_start, date_end,
        )
        set_cached(key, result, CACHE_TTL)
        return result

    async def close(self):
        await self.client.close()
