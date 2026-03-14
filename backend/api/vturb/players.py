import httpx
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from database.core.connection import get_db
from database.models.vturb_account import VturbAccount
from api.auth.deps import get_current_user

router = APIRouter(prefix="/vturb", tags=["vturb"])

VTURB_API_BASE = "https://analytics.vturb.net"


def _build_headers(api_key: str) -> dict:
    return {"X-Api-Token": api_key, "X-Api-Version": "v1"}


def _fetch_plays(api_key: str) -> dict[str, int]:
    """
    Busca total de plays (started) dos últimos 30 dias
    via POST /events/total_by_company_players.
    Retorna dict {player_id: total_plays}.
    """
    now = datetime.utcnow()
    end = f"{now.strftime('%Y-%m-%d')} 23:59:59 UTC"
    start = f"{(now - timedelta(days=30)).strftime('%Y-%m-%d')} 00:00:00 UTC"

    try:
        resp = httpx.post(
            f"{VTURB_API_BASE}/events/total_by_company_players",
            headers=_build_headers(api_key),
            json={
                "events": ["started"],
                "start_date": start,
                "end_date": end,
            },
            timeout=20,
        )
        if resp.status_code != 200:
            return {}

        data = resp.json()
        plays_map: dict[str, int] = {}
        for item in data:
            pid = item.get("player_id", "")
            if item.get("event") == "started":
                plays_map[pid] = item.get("total", 0)
        return plays_map
    except Exception:
        return {}


@router.get("/players")
def list_players(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """
    Lista todos os players de todas as contas VTurb cadastradas.
    Inclui total de plays dos últimos 30 dias para cada player.
    """
    accounts = db.query(VturbAccount).all()
    if not accounts:
        return []

    all_players = []

    for account in accounts:
        try:
            resp = httpx.get(
                f"{VTURB_API_BASE}/players/list",
                headers=_build_headers(account.api_key),
                timeout=15,
            )
            if resp.status_code != 200:
                continue

            players = resp.json()
            plays_map = _fetch_plays(account.api_key)

            for p in players:
                pid = p.get("id", "")
                all_players.append({
                    "id": pid,
                    "name": p.get("name", "Sem nome"),
                    "duration": p.get("duration", 0),
                    "pitch_time": p.get("pitch_time", 0),
                    "created_at": p.get("created_at", ""),
                    "account_name": account.name,
                    "plays_30d": plays_map.get(pid, 0),
                })
        except Exception:
            continue

    return all_players
