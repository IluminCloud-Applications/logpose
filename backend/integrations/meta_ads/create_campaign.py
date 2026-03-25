"""
Criação de campanha na Meta Marketing API.
CBO (Campaign Budget Optimization) com orçamento diário.
"""
import logging

logger = logging.getLogger(__name__)

# Mapeamento de estratégias de lance (UI → API)
BID_STRATEGY_MAP = {
    "VOLUME": "LOWEST_COST_WITHOUT_CAP",
    "BID_CAP": "LOWEST_COST_WITH_BID_CAP",
    "COST_CAP": "COST_CAP",
    "ROAS": "LOWEST_COST_WITH_MIN_ROAS",
}


async def create_campaign(
    access_token: str,
    account_id: str,
    name: str,
    daily_budget_reais: float,
    bid_strategy: str,
    status: str = "PAUSED",
) -> dict:
    """
    Cria uma campanha CBO com objetivo de vendas.
    
    Args:
        access_token: Token de acesso da conta
        account_id: ID da conta (com ou sem act_)
        name: Nome da campanha
        daily_budget_reais: Orçamento diário em Reais
        bid_strategy: VOLUME | BID_CAP | COST_CAP | ROAS
        status: ACTIVE ou PAUSED
    
    Returns:
        {"success": True, "campaign_id": "123"} ou {"success": False, "error": "..."}
    """
    from integrations.meta_ads.client import GRAPH_API_BASE
    import httpx

    act_id = account_id if account_id.startswith("act_") else f"act_{account_id}"
    budget_cents = int(daily_budget_reais * 100)
    api_bid_strategy = BID_STRATEGY_MAP.get(bid_strategy, "LOWEST_COST_WITHOUT_CAP")

    url = f"{GRAPH_API_BASE}/{act_id}/campaigns"
    data = {
        "access_token": access_token,
        "name": name,
        "objective": "OUTCOME_SALES",
        "status": status,
        "special_ad_categories": "NONE",
        "daily_budget": str(budget_cents),
        "bid_strategy": api_bid_strategy,
    }

    logger.info(f"Criando campanha: {name} | Budget: R${daily_budget_reais} | Strategy: {bid_strategy}")
    logger.info(f"Payload campanha: {data}")

    async with httpx.AsyncClient(timeout=30.0) as http:
        response = await http.post(url, data=data)

        if response.status_code == 200:
            result = response.json()
            campaign_id = result.get("id")
            logger.info(f"Campanha criada: {campaign_id}")
            return {"success": True, "campaign_id": campaign_id}

        # Parsear erro
        try:
            body = response.json()
            error_msg = body.get("error", {}).get("message", f"Erro {response.status_code}")
            error_code = body.get("error", {}).get("code", "N/A")
            error_subcode = body.get("error", {}).get("error_subcode", "N/A")
            logger.error(f"Erro ao criar campanha: {error_msg} (code={error_code}, subcode={error_subcode})")
            logger.error(f"Response body: {body}")
        except Exception:
            error_msg = f"Erro {response.status_code} da Meta API"
            logger.error(f"Erro ao criar campanha (não JSON): {response.text}")

        return {"success": False, "error": error_msg}
