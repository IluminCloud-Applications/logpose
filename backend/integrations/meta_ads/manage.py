"""
Funções de gerenciamento do Meta Ads via Graph API.
- Toggle status (ACTIVE/PAUSED) de campanhas, adsets e ads
- Update budget (daily_budget) de campanhas e adsets
"""
import logging
from integrations.meta_ads.client import GRAPH_API_BASE

logger = logging.getLogger(__name__)


async def toggle_entity_status(
    access_token: str,
    entity_id: str,
    entity_type: str,
    new_status: str,
) -> dict:
    """
    Altera o status de uma entidade (campaign, adset, ad).
    new_status: 'ACTIVE' ou 'PAUSED'
    Usa retry com backoff para rate limits.
    """
    return await _post_with_retry(
        access_token=access_token,
        entity_id=entity_id,
        params={"status": new_status},
        action_label=f"Toggle {entity_type} {entity_id}",
    )


async def update_budget(
    access_token: str,
    entity_id: str,
    entity_type: str,
    daily_budget_reais: float,
) -> dict:
    """
    Atualiza o orçamento diário de uma campanha (CBO) ou adset (ABO).
    Meta API espera o valor em centavos (int).
    """
    budget_cents = int(daily_budget_reais * 100)

    return await _post_with_retry(
        access_token=access_token,
        entity_id=entity_id,
        params={"daily_budget": str(budget_cents)},
        action_label=f"Budget {entity_type} {entity_id}",
    )


async def _post_with_retry(
    access_token: str,
    entity_id: str,
    params: dict,
    action_label: str,
    max_retries: int = 3,
) -> dict:
    """
    POST na Graph API com retry para rate limit.
    Parseia erro da Meta API para mensagem amigável.
    """
    import asyncio
    import httpx
    from integrations.meta_ads.client import DEFAULT_TIMEOUT, INITIAL_BACKOFF

    url = f"{GRAPH_API_BASE}/{entity_id}"
    post_data = {"access_token": access_token, **params}

    async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as http:
        for attempt in range(max_retries):
            response = await http.post(url, data=post_data)

            # Sucesso
            if response.status_code == 200:
                return {"success": True}

            # Parsear erro da Meta
            error_data = _parse_meta_error(response)

            # Rate limit -> retry com backoff
            if error_data["is_rate_limit"]:
                wait_time = INITIAL_BACKOFF * (2 ** attempt)
                logger.warning(
                    f"{action_label}: Rate limit (tentativa "
                    f"{attempt + 1}/{max_retries}). Aguardando {wait_time}s"
                )
                await asyncio.sleep(wait_time)
                continue

            # Outro erro -> retorna imediatamente
            logger.error(f"{action_label}: {error_data['message']}")
            return {"success": False, "error": error_data["message"]}

    # Todas as tentativas esgotadas
    logger.error(f"{action_label}: Rate limit persistente após {max_retries} tentativas")
    return {"success": False, "error": "Rate limit da Meta API. Tente novamente em alguns minutos."}


def _parse_meta_error(response) -> dict:
    """Parseia erro da Meta API para extrair mensagem e tipo."""
    try:
        body = response.json()
        error = body.get("error", {})
        code = error.get("code", 0)
        message = error.get("message", "")
        error_subcode = error.get("error_subcode", 0)

        is_rate_limit = code in (17, 32, 4) or response.status_code == 429

        return {
            "message": message or f"Erro {response.status_code} da Meta API",
            "code": code,
            "subcode": error_subcode,
            "is_rate_limit": is_rate_limit,
        }
    except Exception:
        return {
            "message": f"Erro {response.status_code} da Meta API (resposta não parseável)",
            "code": 0,
            "subcode": 0,
            "is_rate_limit": response.status_code == 429,
        }
