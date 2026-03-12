"""
Busca unique plays do VTurb por UTM campaign para cruzar com campanhas do Meta.
Usa POST /traffic_origin/stats_by_day para obter plays agrupados por utm_campaign.

Busca de TODOS os players de todas as contas VTurb (não depende de markers).
O tracking UTM é automático — VTurb registra os UTM params de cada sessão.
"""
import asyncio
import logging

from sqlalchemy.orm import Session

from database.models.vturb_account import VturbAccount
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
    1. Busca TODOS os players de todas as contas VTurb
    2. Para cada player, chama stats_by_day com query_keys=["utm_campaign"]
    3. Agrega por grouped_field (valor da UTM) somando unique plays por dia
    4. Match por campaign_id primeiro, depois por campaign_name
    """
    accounts = db.query(VturbAccount).all()
    if not accounts:
        logger.debug("Nenhuma conta VTurb configurada")
        return {}

    plays_by_campaign: dict[str, int] = {}

    for account in accounts:
        client = VturbClient(account.api_key)
        try:
            await _process_account(
                client, date_start, date_end,
                campaign_ids, campaign_names, plays_by_campaign,
            )
        except Exception as e:
            logger.error(f"Erro ao buscar plays do VTurb ({account.name}): {e}")
        finally:
            await client.close()

    logger.info(
        f"VTurb plays: {len(plays_by_campaign)} matches. "
        f"Map: {plays_by_campaign}"
    )
    return plays_by_campaign


async def _process_account(
    client: VturbClient,
    date_start: str,
    date_end: str,
    campaign_ids: list[str],
    campaign_names: list[str],
    plays_by_campaign: dict[str, int],
) -> None:
    """Busca plays de todos os players de uma conta VTurb."""
    all_players = await client.get_players()
    if not all_players:
        logger.debug("Nenhum player encontrado na conta VTurb")
        return

    logger.info(f"VTurb: {len(all_players)} players encontrados")

    # Buscar stats por utm_campaign para TODOS os players (paralelo)
    tasks = []
    valid_players = []
    for player in all_players:
        pid = player.get("id", "")
        duration = player.get("duration", 0)
        if not pid or not duration:
            continue
        valid_players.append(pid)
        tasks.append(
            _safe_fetch_stats_by_day(
                client, pid, date_start, date_end, duration,
            )
        )

    if not tasks:
        return

    results = await asyncio.gather(*tasks)
    for pid, day_stats in zip(valid_players, results):
        if day_stats:
            logger.debug(
                f"VTurb player {pid}: {len(day_stats)} day records. "
                f"Fields: {set(s.get('grouped_field', '') for s in day_stats)}"
            )
        # Agregar por grouped_field (soma de todos os dias)
        aggregated = _aggregate_by_utm(day_stats)
        _match_plays_to_campaigns(
            aggregated, campaign_ids, campaign_names, plays_by_campaign,
        )


async def _safe_fetch_stats_by_day(
    client: VturbClient,
    player_id: str,
    date_start: str,
    date_end: str,
    video_duration: int,
) -> list[dict]:
    """Busca traffic stats_by_day sem propagar exceções."""
    try:
        return await client.get_traffic_origin_stats_by_day(
            player_id=player_id,
            # VTurb docs usam "utm_campain" (typo) em alguns endpoints
            # e "utm_campaign" em outros. Enviamos ambos para cobrir.
            query_keys=["utm_campaign", "utm_campain"],
            start_date=date_start,
            end_date=date_end,
            video_duration=video_duration,
        )
    except Exception as e:
        logger.warning(f"VTurb stats_by_day player {player_id}: {e}")
        return []


def _aggregate_by_utm(day_stats: list[dict]) -> dict[str, int]:
    """
    A API stats_by_day retorna 1 registro por dia/utm.
    Agrega somando unique plays de todos os dias para cada utm.
    """
    totals: dict[str, int] = {}
    for stat in day_stats:
        field = stat.get("grouped_field", "")
        if not field:
            continue
        plays = (
            stat.get("total_started_session_uniq")
            or stat.get("total_started", 0)
        )
        if plays:
            totals[field] = totals.get(field, 0) + plays
    return totals


def _match_plays_to_campaigns(
    aggregated: dict[str, int],
    campaign_ids: list[str],
    campaign_names: list[str],
    plays_by_campaign: dict[str, int],
) -> None:
    """
    Faz match dos plays agrupados por UTM com campanhas.
    Tenta match por ID primeiro, depois por nome.
    """
    id_set = set(campaign_ids)
    name_lower_map = {n.lower(): n for n in campaign_names if n}

    for utm_value, plays in aggregated.items():
        # Match por ID (ex: utm_campaign=120241214658420762)
        if utm_value in id_set:
            plays_by_campaign[utm_value] = (
                plays_by_campaign.get(utm_value, 0) + plays
            )
            continue

        # Match por nome (case-insensitive)
        matched_name = name_lower_map.get(utm_value.lower())
        if matched_name:
            plays_by_campaign[matched_name] = (
                plays_by_campaign.get(matched_name, 0) + plays
            )
