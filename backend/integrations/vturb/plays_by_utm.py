"""
Busca unique plays do VTurb por UTM campaign para cruzar com campanhas do Meta.
Usa a API /traffic_origin/stats para obter plays agrupados por utm_campaign.
"""
import asyncio
import logging

from sqlalchemy.orm import Session

from database.models.vturb_account import VturbAccount
from database.models.campaign_marker import CampaignMarker, MarkerType
from integrations.vturb.client import VturbClient

logger = logging.getLogger(__name__)


async def fetch_vturb_plays_by_campaign(
    db: Session,
    date_start: str,
    date_end: str,
    campaign_ids: list[str],
    campaign_names: list[str],
) -> dict[str, int]:
    """
    Busca unique plays do VTurb agrupados por utm_campaign.
    Retorna dict: { campaign_id_or_name: unique_plays }.

    Estratégia:
    1. Busca todos os markers do tipo VIDEO
    2. Para cada player marcado, chama traffic_origin/stats com query_key=utm_campaign
    3. Faz match do grouped_field com campaign_id primeiro, depois campaign_name
    4. Soma os plays de todos os players para cada campanha
    """
    # 1. Buscar markers de VIDEO
    markers = db.query(CampaignMarker).filter(
        CampaignMarker.marker_type == MarkerType.VIDEO,
    ).all()

    if not markers:
        return {}

    # IDs únicos de players
    player_ids = list({m.reference_id for m in markers})

    # 2. Buscar contas VTurb
    accounts = db.query(VturbAccount).all()
    if not accounts:
        return {}

    # 3. Buscar players e seus durations para cada conta
    plays_by_campaign: dict[str, int] = {}

    for account in accounts:
        client = VturbClient(account.api_key)
        try:
            # Buscar lista de players para obter durations
            all_players = await client.get_players()
            player_duration_map = {
                p.get("id", ""): p.get("duration", 60)
                for p in all_players
            }

            # Buscar stats por utm_campaign para cada player marcado
            tasks = []
            valid_pids = []
            for pid in player_ids:
                duration = player_duration_map.get(pid)
                if duration is None:
                    continue
                valid_pids.append(pid)
                tasks.append(
                    _safe_fetch_traffic_stats(
                        client, pid, date_start, date_end, duration,
                    )
                )

            if tasks:
                results = await asyncio.gather(*tasks)
                for pid, stats_list in zip(valid_pids, results):
                    _match_plays_to_campaigns(
                        stats_list,
                        campaign_ids,
                        campaign_names,
                        plays_by_campaign,
                    )
        except Exception as e:
            logger.error(f"Erro ao buscar plays do VTurb: {e}")
        finally:
            await client.close()

    return plays_by_campaign


async def _safe_fetch_traffic_stats(
    client: VturbClient,
    player_id: str,
    date_start: str,
    date_end: str,
    video_duration: int,
) -> list[dict]:
    """Busca traffic stats sem propagar exceções."""
    try:
        return await client.get_traffic_origin_stats(
            player_id=player_id,
            query_key="utm_campaign",
            start_date=date_start,
            end_date=date_end,
            video_duration=video_duration,
        )
    except Exception as e:
        logger.warning(
            f"Erro ao buscar traffic stats do player {player_id}: {e}"
        )
        return []


def _match_plays_to_campaigns(
    stats_list: list[dict],
    campaign_ids: list[str],
    campaign_names: list[str],
    plays_by_campaign: dict[str, int],
) -> None:
    """
    Faz match dos plays retornados pelo VTurb com campanhas.
    Tenta match por ID primeiro, depois por nome.
    """
    # Index para lookup rápido
    id_set = set(campaign_ids)
    name_lower_map = {n.lower(): n for n in campaign_names if n}

    for stat in stats_list:
        grouped_field = stat.get("grouped_field", "")
        if not grouped_field:
            continue

        unique_plays = (
            stat.get("total_started_session_uniq")
            or stat.get("total_started", 0)
        )
        if not unique_plays:
            continue

        # Match por ID (ex: utm_campaign=120241214658420762)
        if grouped_field in id_set:
            plays_by_campaign[grouped_field] = (
                plays_by_campaign.get(grouped_field, 0) + unique_plays
            )
            continue

        # Match por nome (case-insensitive)
        matched_name = name_lower_map.get(grouped_field.lower())
        if matched_name:
            plays_by_campaign[matched_name] = (
                plays_by_campaign.get(matched_name, 0) + unique_plays
            )
