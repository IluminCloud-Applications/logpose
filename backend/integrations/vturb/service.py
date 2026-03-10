import asyncio
import logging
from integrations.vturb.client import VturbClient
from integrations.vturb.schemas import VturbVideoStats

logger = logging.getLogger(__name__)


class VturbService:
    """
    Fachada para a integração com VTurb Analytics.
    Orquestra a busca de todos os vídeos da conta e coleta o stats de cada um.
    """

    def __init__(self, api_token: str):
        self.client = VturbClient(api_token)

    async def fetch_all_videos_stats(
        self, start_date: str, end_date: str
    ) -> list[VturbVideoStats]:
        """
        Principal método para retornar as estatísticas de todos os vídeos
        no período especificado.
        
        Fluxo:
        1. Lista todos os vídeos da conta (players/list)
        2. Para cada vídeo, efetua a consulta paralela de session stats.
        3. Concatena os resultados e formata pelo schema VturbVideoStats.
        """
        try:
            # 1. Busca todos os vídeos/players (opcionalmente usando o date range p/ filtro da VTurb)
            players = await self.client.get_players(
                start_date=start_date, end_date=end_date
            )
        except Exception as e:
            logger.error(f"Erro ao buscar players do VTurb: {e}")
            return []

        if not players:
            return []

        # 2. Busca stats em paralelo para cada player
        async def _fetch_player_stats(player: dict) -> VturbVideoStats:
            player_id = player.get("id", "")
            player_name = player.get("name", "Vídeo Sem Nome")

            try:
                stats = await self.client.get_session_stats(
                    player_id=player_id,
                    start_date=start_date,
                    end_date=end_date
                )
                
                # Conversões seguras
                def safe_float(v): return float(v) if v is not None else 0.0
                def safe_int(v): return int(v) if v is not None else 0
                
                return VturbVideoStats(
                    video_id=player_id,
                    video_name=player_name,
                    views=safe_int(stats.get("total_viewed", 0)),
                    plays=safe_int(stats.get("total_started", 0)),
                    clicks=safe_int(stats.get("total_clicked", 0)),
                    play_rate=safe_float(stats.get("play_rate", 0.0)),
                    engagement_rate=safe_float(stats.get("engagement_rate", 0.0))
                )
            except Exception as e:
                # O VTurb pode dar 400 em algum vídeo antigo sem stats no periodo,
                # retornamos os valores zerados neste caso.
                logger.warning(
                    f"Não foi possível buscar stats para o vídeo {player_id} ({player_name}): {e}"
                )
                return VturbVideoStats(
                    video_id=player_id,
                    video_name=player_name,
                )

        # Dispara todas as requests simultaneamente (I/O bound)
        tasks = [_fetch_player_stats(p) for p in players]
        results = await asyncio.gather(*tasks)

        # Filtra possíveis non-results, se aplicavel
        return list(results)

    async def close(self):
        await self.client.close()
