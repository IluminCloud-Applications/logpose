import os
import httpx
from typing import Any

# Versão da Graph API via ENV (padrão v25.0)
GRAPH_API_VERSION = os.getenv("META_GRAPH_API_VERSION", "v25.0")
GRAPH_API_BASE = f"https://graph.facebook.com/{GRAPH_API_VERSION}"

# Timeout padrão para requests (em segundos)
DEFAULT_TIMEOUT = 30.0


class MetaAdsClient:
    """
    HTTP client para a Meta Marketing API (Graph API).
    Usa httpx.AsyncClient para requests assíncronos.
    """

    def __init__(self, access_token: str, account_id: str):
        self.access_token = access_token
        # Garante que o account_id tem o prefixo act_
        self.account_id = (
            account_id if account_id.startswith("act_")
            else f"act_{account_id}"
        )
        self._client = httpx.AsyncClient(timeout=DEFAULT_TIMEOUT)

    async def _get(
        self,
        endpoint: str,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Faz GET na Graph API com paginação automática."""
        url = f"{GRAPH_API_BASE}/{endpoint}"
        request_params = {"access_token": self.access_token}
        if params:
            request_params.update(params)

        response = await self._client.get(url, params=request_params)
        response.raise_for_status()
        return response.json()

    async def _get_all_pages(
        self,
        endpoint: str,
        params: dict[str, Any] | None = None,
    ) -> list[dict[str, Any]]:
        """
        Busca todas as páginas de resultado (paginação automática).
        Retorna lista com todos os resultados concatenados.
        Se a próxima página falhar (400/cursor expirado), retorna o que já coletou.
        """
        import logging
        logger = logging.getLogger(__name__)

        all_data: list[dict[str, Any]] = []
        url = f"{GRAPH_API_BASE}/{endpoint}"
        request_params = {"access_token": self.access_token}
        if params:
            request_params.update(params)

        while url:
            try:
                response = await self._client.get(url, params=request_params)
                response.raise_for_status()
            except httpx.HTTPStatusError as e:
                # Cursor expirado ou inválido — retorna o que já coletou
                logger.warning(
                    f"Paginação parou com status {e.response.status_code} "
                    f"({len(all_data)} itens coletados). Endpoint: {endpoint}"
                )
                break

            data = response.json()
            all_data.extend(data.get("data", []))

            # Próxima página (cursor-based pagination)
            paging = data.get("paging", {})
            url = paging.get("next")
            # Na próxima iteração, os params já estão na URL next
            request_params = None

        return all_data

    async def close(self):
        await self._client.aclose()
