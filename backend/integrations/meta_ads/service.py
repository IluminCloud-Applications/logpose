"""
Serviço principal que orquestra todas as buscas da Meta Ads.
Ponto de entrada único para a camada de API.
"""
from integrations.meta_ads.client import MetaAdsClient
from integrations.meta_ads.campaigns import fetch_campaigns
from integrations.meta_ads.adsets import fetch_adsets
from integrations.meta_ads.ads import fetch_ads
from integrations.meta_ads.account import fetch_account_insights
from integrations.meta_ads.schemas import (
    CampaignInsights,
    AdSetInsights,
    AdInsights,
    AccountInsightsSummary,
)


class MetaAdsService:
    """
    Fachada para toda integração com Meta Ads.
    Recebe access_token + account_id, cria o client e
    expõe métodos para buscar dados por nível.
    """

    def __init__(self, access_token: str, account_id: str):
        self.client = MetaAdsClient(access_token, account_id)

    async def get_campaigns(
        self, date_start: str, date_end: str,
    ) -> list[CampaignInsights]:
        return await fetch_campaigns(
            self.client, date_start, date_end,
        )

    async def get_adsets(
        self, date_start: str, date_end: str,
    ) -> list[AdSetInsights]:
        return await fetch_adsets(
            self.client, date_start, date_end,
        )

    async def get_ads(
        self, date_start: str, date_end: str,
    ) -> list[AdInsights]:
        return await fetch_ads(
            self.client, date_start, date_end,
        )

    async def get_account_summary(
        self, date_start: str, date_end: str,
    ) -> AccountInsightsSummary:
        return await fetch_account_insights(
            self.client, date_start, date_end,
        )

    async def close(self):
        await self.client.close()
