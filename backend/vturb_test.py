import asyncio
import sys
sys.path.append('.')

from database.core.connection import SessionLocal
from integrations.vturb.client import VturbClient
from database.models.vturb_account import VturbAccount
import httpx

async def get_details_of_400():
    db = SessionLocal()
    acc = db.query(VturbAccount).first()
    key = acc.api_key
    client = VturbClient(key)
    players = await client.get_players()
    pid = players[0]['id']
    dur = players[0]['duration']

    payload = {
        "player_id": pid,
        "query_keys": ["utm_campaign"],
        "start_date": "2026-03-01",
        "end_date": "2026-03-13",
        "video_duration": dur or 100
    }
    try:
        req = await client._client.post(
            "https://analytics.vturb.net/traffic_origin/stats_by_day",
            json=payload
        )
        req.raise_for_status()
        print("Success:", req.json())
    except httpx.HTTPStatusError as e:
        print("HTTP Error:", e.response.status_code)
        print("Response body:", e.response.text)

asyncio.run(get_details_of_400())
