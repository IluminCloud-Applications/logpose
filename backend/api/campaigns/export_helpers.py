"""
Helpers de parsing para exportação de campanha.
Converte dados da Meta API para o formato de export do Campaign Creator.
"""
import logging

logger = logging.getLogger(__name__)


def parse_targeting(targeting: dict) -> dict:
    """Extrai targeting no formato do export."""
    age_min = targeting.get("age_min", 18)
    age_max = targeting.get("age_max", 65)

    genders_raw = targeting.get("genders", [])
    gender = genders_raw[0] if genders_raw else 0

    # Interesses: busca tanto interests quanto behaviors em flexible_spec
    interests = []
    for spec in targeting.get("flexible_spec", []):
        for interest in spec.get("interests", []):
            interests.append({
                "id": interest.get("id", ""),
                "name": interest.get("name", ""),
            })
        for behavior in spec.get("behaviors", []):
            interests.append({
                "id": behavior.get("id", ""),
                "name": behavior.get("name", ""),
            })

    return {
        "age_min": age_min,
        "age_max": age_max,
        "genders": gender,
        "interests": interests,
    }


def parse_bid_data(campaign: dict, adset: dict) -> dict:
    """Extrai bid strategy e amounts."""
    raw_strategy = (
        campaign.get("bid_strategy", "")
        or adset.get("bid_strategy", "")
    )

    strategy_map = {
        "LOWEST_COST_WITHOUT_CAP": "VOLUME",
        "LOWEST_COST_WITH_BID_CAP": "BID_CAP",
        "COST_CAP": "COST_CAP",
        "LOWEST_COST_WITH_MIN_ROAS": "ROAS",
    }
    normalized = strategy_map.get(raw_strategy, raw_strategy or "VOLUME")

    # bid_amount em centavos na Meta API
    bid_amount_raw = adset.get("bid_amount")
    bid_amount = round(int(bid_amount_raw) / 100, 2) if bid_amount_raw else None

    # ROAS floor de bid_constraints
    roas_floor = None
    constraints = adset.get("bid_constraints") or {}
    roas_avg = constraints.get("roas_average_floor")
    if roas_avg:
        roas_floor = round(int(roas_avg) / 100, 2)

    return {
        "bid_strategy": normalized,
        "bid_amount": bid_amount,
        "roas_floor": roas_floor,
    }


def parse_ad_creative(ad_name: str, creative: dict) -> dict:
    """
    Extrai dados do creative para export.
    Usa campos diretos (body, title) e object_story_spec para link.
    """
    # Campos diretos do creative
    primary_text = creative.get("body", "")
    headline = creative.get("title", "")
    url_tags = creative.get("url_tags", "")

    # Link e CTA vêm do object_story_spec
    story_spec = creative.get("object_story_spec", {})
    link_data = story_spec.get("link_data", {})
    video_data = story_spec.get("video_data", {})

    link = ""
    cta_type = "LEARN_MORE"
    media_type = "image"

    if video_data:
        link = video_data.get("link", "")
        cta = video_data.get("call_to_action", {})
        cta_type = cta.get("type", "LEARN_MORE")
        media_type = "video"
    elif link_data:
        link = link_data.get("link", "")
        cta = link_data.get("call_to_action", {})
        cta_type = cta.get("type", "LEARN_MORE")

    return {
        "name": ad_name,
        "primary_text": primary_text,
        "headline": headline,
        "description": "",
        "link": link,
        "utm_params": url_tags,
        "extra_params": "",
        "cta_type": cta_type,
        "media_type": media_type,
    }


def extract_page_and_instagram(creative: dict) -> tuple[str, str]:
    """Extrai page_id e instagram do creative."""
    story_spec = creative.get("object_story_spec", {})
    page_id = story_spec.get("page_id", "")
    # Meta retorna como instagram_user_id, não instagram_actor_id
    instagram = story_spec.get("instagram_user_id", "")
    return page_id, instagram
