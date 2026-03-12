import httpx
from typing import Any

# URL base definida na documentação da VTurb
VTURB_API_BASE = "https://analytics.vturb.net"
DEFAULT_TIMEOUT = 30.0


class VturbClient:
    """
    HTTP client para a API Pública do VTurb Analytics.
    Usa httpx.AsyncClient para requests assíncronos.
    Autenticação via header X-Api-Token.
    """

    def __init__(self, api_token: str):
        self.api_token = api_token
        self._client = httpx.AsyncClient(
            timeout=DEFAULT_TIMEOUT,
            headers={"X-Api-Token": self.api_token}
        )

    async def get_players(
        self, start_date: str | None = None, end_date: str | None = None
    ) -> list[dict[str, Any]]:
        """
        [GET] /players/list
        Lista todos os players (vídeos) pertencentes à conta da empresa.
        """
        params = {}
        if start_date:
            params["start_date"] = start_date
        if end_date:
            params["end_date"] = end_date
            
        response = await self._client.get(
            f"{VTURB_API_BASE}/players/list",
            params=params
        )
        response.raise_for_status()
        return response.json()

    async def get_session_stats(
        self, player_id: str, start_date: str, end_date: str
    ) -> dict[str, Any]:
        """
        [POST] /sessions/stats
        Retorna as estatísticas de todas as sessões de um player (vídeo)
        em um determinado período. Inclui plays (started), views, clicks, etc.
        """
        payload = {
            "player_id": player_id,
            "start_date": start_date,
            "end_date": end_date
        }
        response = await self._client.post(
            f"{VTURB_API_BASE}/sessions/stats",
            json=payload
        )
        response.raise_for_status()
        return response.json()

    async def get_traffic_origin_stats(
        self,
        player_id: str,
        query_key: str,
        start_date: str,
        end_date: str,
        video_duration: int,
    ) -> list[dict]:
        """
        [POST] /traffic_origin/stats
        Retorna stats agrupados por um query_key (ex: utm_campaign).
        Cada item retornado tem 'grouped_field' com o valor da UTM
        e 'total_started_session_uniq' com unique plays.
        """
        payload = {
            "player_id": player_id,
            "query_key": query_key,
            "start_date": start_date,
            "end_date": end_date,
            "video_duration": video_duration,
        }
        response = await self._client.post(
            f"{VTURB_API_BASE}/traffic_origin/stats",
            json=payload,
        )
        response.raise_for_status()
        data = response.json()
        # Pode ser dict ou list dependendo da API
        if isinstance(data, dict):
            return [data]
        return data

    async def close(self):
        await self._client.aclose()
