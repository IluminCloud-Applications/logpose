"""
Busca unique views/plays do VTurb por UTM campaign para cruzar com campanhas do Meta.
Usa POST /traffic_origin/stats_by_day para obter stats agrupados por utm_campaign.

Busca de TODOS os players de todas as contas VTurb.
O tracking UTM é automático — VTurb registra os UTM params de cada sessão.
"""
import asyncio
import logging

from sqlalchemy.orm import Session

from database.models.vturb_account import VturbAccount
from integrations.vturb.client import VturbClient

logger = logging.getLogger(__name__)


async def fetch_vturb_stats_by_campaign(
    db: Session,
    date_start: str,
    date_end: str,
    campaign_ids: list[str],
    campaign_names: list[str],
) -> dict[str, dict[str, int]]:
    """
    Busca unique views e plays do VTurb agrupados por utm_campaign.
    Retorna dict: { campaign_id_or_name: {"views": int, "plays": int} }.

    Estratégia:
    1. Busca TODOS os players de todas as contas VTurb
    2. Para cada player, chama stats_by_day com query_keys=["utm_campaign"]
    3. Agrega por grouped_field (valor da UTM) somando unique plays por dia
    4. Match por campaign_id primeiro, depois por campaign_name
    """
    accounts = db.query(VturbAccount).all()
    logger.warning(f"[VTURB] === INICIO fetch_vturb_stats_by_campaign ===")
    logger.warning(f"[VTURB] contas={len(accounts)}, period={date_start}..{date_end}")
    logger.warning(f"[VTURB] campaign_ids (primeiros 5): {campaign_ids[:5]}")
    logger.warning(f"[VTURB] campaign_names (primeiros 5): {campaign_names[:5]}")
    if not accounts:
        logger.warning("[VTURB] Nenhuma conta VTurb configurada")
        return {}

    stats_by_campaign: dict[str, dict[str, int]] = {}

    for account in accounts:
        client = VturbClient(account.api_key)
        try:
            await _process_account(
                client, date_start, date_end,
                campaign_ids, campaign_names, stats_by_campaign,
            )
        except Exception as e:
            logger.error(f"Erro ao buscar plays do VTurb ({account.name}): {e}")
        finally:
            await client.close()

    logger.warning(
        f"[VTURB] === RESULTADO FINAL: {len(stats_by_campaign)} matches ==="
    )
    logger.warning(f"[VTURB] stats_map: {stats_by_campaign}")
    return stats_by_campaign


async def _process_account(
    client: VturbClient,
    date_start: str,
    date_end: str,
    campaign_ids: list[str],
    campaign_names: list[str],
    stats_by_campaign: dict[str, dict[str, int]],
) -> None:
    """Busca stats (views/plays) de todos os players de uma conta VTurb."""
    all_players = await client.get_players()
    if not all_players:
        logger.debug("Nenhum player encontrado na conta VTurb")
        return

    logger.warning(f"[VTURB] {len(all_players)} players encontrados. date={date_start}..{date_end}")

    # Buscar stats por utm_campaign para TODOS os players (paralelo)
    tasks = []
    valid_players = []
    skipped = 0
    for player in all_players:
        pid = player.get("id", "")
        duration = player.get("duration", 0)
        if not pid or not duration:
            skipped += 1
            continue
        valid_players.append(pid)
        tasks.append(
            _safe_fetch_stats_by_day(
                client, pid, date_start, date_end, duration,
            )
        )

    logger.warning(f"[VTURB] {len(tasks)} tasks criadas, {skipped} skipped (sem id/duration)")
    if not tasks:
        return

    results = await asyncio.gather(*tasks)
    for pid, day_stats in zip(valid_players, results):
        logger.warning(
            f"[VTURB] player {pid}: {len(day_stats)} records. "
            f"Fields: {[s.get('grouped_field', '?') for s in day_stats[:5]]}"
        )
        if day_stats:
            # Log raw keys from first record for debugging
            logger.warning(f"[VTURB] player {pid} raw keys: {list(day_stats[0].keys())}")
            logger.warning(f"[VTURB] player {pid} raw first: {day_stats[0]}")
        # Agregar por grouped_field (soma de todos os dias)
        aggregated = _aggregate_by_utm(day_stats)
        logger.warning(f"[VTURB] player {pid} aggregated: {aggregated}")
        _match_stats_to_campaigns(
            aggregated, campaign_ids, campaign_names, stats_by_campaign,
        )
        logger.warning(f"[VTURB] stats_by_campaign apos player {pid}: {stats_by_campaign}")


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
            query_keys=["utm_campaign", "utm_campain"],
            start_date=date_start,
            end_date=date_end,
            video_duration=video_duration,
        )
    except Exception as e:
        logger.warning(f"VTurb stats_by_day player {player_id}: {e}")
        return []


def _aggregate_by_utm(day_stats: list[dict]) -> dict[str, dict[str, int]]:
    """
    A API stats_by_day retorna 1 registro por dia/utm.
    Agrega somando unique views e plays de todos os dias para cada utm.
    """
    totals: dict[str, dict[str, int]] = {}
    for stat in day_stats:
        field = stat.get("grouped_field", "")
        if not field:
            continue

        plays = (
            stat.get("total_started_session_uniq")
            or stat.get("total_started", 0)
        )
        views = (
            stat.get("total_viewed_session_uniq")
            or stat.get("total_viewed", 0)
        )

        if field not in totals:
            totals[field] = {"views": 0, "plays": 0}

        totals[field]["plays"] += plays
        totals[field]["views"] += views

    return totals


def _normalize_utm(raw: str) -> str:
    """Normaliza UTM: decode URL-encoding e remove pipe+id."""
    from urllib.parse import unquote_plus
    decoded = unquote_plus(raw)
    # Se tem pipe, pegar apenas a parte do nome (antes do pipe)
    if "|" in decoded:
        decoded = decoded.rsplit("|", 1)[0]
    return decoded.strip()


def _extract_id_from_utm(raw: str) -> str | None:
    """Se o UTM tem formato nome|id, extrair o id."""
    if "|" in raw:
        return raw.rsplit("|", 1)[1].strip()
    return None


def _match_stats_to_campaigns(
    aggregated: dict[str, dict[str, int]],
    campaign_ids: list[str],
    campaign_names: list[str],
    stats_by_campaign: dict[str, dict[str, int]],
) -> None:
    """
    Faz match dos stats agrupados por UTM com campanhas.
    Normaliza UTMs para lidar com URL-encoding (+) e formato nome|id.
    """
    id_set = set(campaign_ids)
    name_lower_map = {n.lower(): n for n in campaign_names if n}

    def _add_stats(key: str, stats: dict[str, int]) -> None:
        if key not in stats_by_campaign:
            stats_by_campaign[key] = {"views": 0, "plays": 0}
        stats_by_campaign[key]["views"] += stats["views"]
        stats_by_campaign[key]["plays"] += stats["plays"]

    for utm_raw, stats in aggregated.items():
        # 1. Tentar match direto por ID
        if utm_raw in id_set:
            _add_stats(utm_raw, stats)
            logger.warning(f"[VTURB-MATCH] '{utm_raw}' → ID direto. {stats}")
            continue

        # 2. Extrair ID do formato nome|id
        extracted_id = _extract_id_from_utm(utm_raw)
        if extracted_id and extracted_id in id_set:
            _add_stats(extracted_id, stats)
            logger.warning(f"[VTURB-MATCH] '{utm_raw}' → ID via pipe ({extracted_id}). {stats}")
            continue

        # 3. Normalizar nome (decode URL + remover pipe)
        normalized = _normalize_utm(utm_raw)

        # 4. Tentar match por nome exato (case-insensitive)
        matched_name = name_lower_map.get(normalized.lower())
        if matched_name:
            _add_stats(matched_name, stats)
            logger.warning(f"[VTURB-MATCH] '{utm_raw}' → nome '{matched_name}'. {stats}")
            continue

        # 5. Tentar match pelo nome original sem decode
        matched_name = name_lower_map.get(utm_raw.lower())
        if matched_name:
            _add_stats(matched_name, stats)
            logger.warning(f"[VTURB-MATCH] '{utm_raw}' → nome raw '{matched_name}'. {stats}")
            continue

        logger.warning(f"[VTURB-MATCH] '{utm_raw[:60]}' → SEM MATCH. {stats}")
