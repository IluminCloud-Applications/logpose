"""
Endpoint principal para criar campanhas completas.
Recebe JSON + arquivos multipart e orquestra toda a criação.
"""
import json
import logging
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session

from database.core.connection import get_db
from database.models.facebook_account import FacebookAccount
from api.auth.deps import get_current_user
from api.campaigns_create.schemas import CampaignCreateResponse
from integrations.meta_ads.create_campaign import create_campaign
from integrations.meta_ads.create_adset import create_adset
from integrations.meta_ads.create_ad import create_ad_creative, create_ad
from integrations.meta_ads.upload_media import upload_image, upload_video

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/campaigns/create",
    tags=["campaign-creator"],
)

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm"}


@router.post("/publish", response_model=CampaignCreateResponse)
async def publish_campaign(
    payload: str = Form(...),
    files: list[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """
    Cria campanha completa: Campaign → Ad Set → Ads.
    Recebe payload JSON como Form field + arquivos como multipart.
    """
    try:
        data = json.loads(payload)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Payload JSON inválido")

    # Busca conta Facebook
    account = db.query(FacebookAccount).filter(
        FacebookAccount.id == data.get("account_id")
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Conta Facebook não encontrada")

    token = account.access_token
    act_id = account.account_id
    errors: list[str] = []

    # 1. Criar campanha
    camp_result = await create_campaign(
        access_token=token,
        account_id=act_id,
        name=data["campaign_name"],
        daily_budget_reais=data["daily_budget"],
        bid_strategy=data.get("bid_strategy", "VOLUME"),
    )

    if not camp_result["success"]:
        return CampaignCreateResponse(
            success=False,
            errors=[f"Erro na campanha: {camp_result['error']}"],
        )

    campaign_id = camp_result["campaign_id"]

    # 2. Criar Ad Set
    adset_result = await create_adset(
        access_token=token,
        account_id=act_id,
        campaign_id=campaign_id,
        name=data["adset_name"],
        bid_strategy=data.get("bid_strategy", "VOLUME"),
        bid_amount=data.get("bid_amount"),
        roas_floor=data.get("roas_floor"),
        pixel_id=data["pixel_id"],
        start_time=data["start_time"],
        targeting=data.get("targeting", {}),
    )

    if not adset_result["success"]:
        errors.append(f"Erro no conjunto: {adset_result['error']}")
        return CampaignCreateResponse(
            success=False, campaign_id=campaign_id, errors=errors,
        )

    adset_id = adset_result["adset_id"]

    # 3. Criar Ads
    ads = data.get("ads", [])
    ads_created = await _create_ads_batch(
        token, act_id, adset_id, ads, files,
        data.get("page_id", ""),
        data.get("instagram_actor_id"),
        errors,
    )

    return CampaignCreateResponse(
        success=len(errors) == 0,
        campaign_id=campaign_id,
        adset_id=adset_id,
        ads_created=ads_created,
        errors=errors,
    )


async def _create_ads_batch(
    token: str,
    act_id: str,
    adset_id: str,
    ads: list[dict],
    files: list[UploadFile],
    page_id: str,
    instagram_actor_id: str | None,
    errors: list[str],
) -> int:
    """Cria múltiplos ads com upload de mídia."""
    created_count = 0

    for i, ad_data in enumerate(ads):
        media_index = ad_data.get("media_index", i)
        file = files[media_index] if media_index < len(files) else None

        if not file:
            errors.append(f"AD {i+1}: Arquivo de mídia não encontrado")
            continue

        # Upload
        file_bytes = await file.read()
        ext = (file.filename or "").rsplit(".", 1)[-1].lower()
        is_video = f".{ext}" in VIDEO_EXTENSIONS

        media_result = await _upload_media(token, act_id, file_bytes, file.filename or f"media_{i}", is_video)

        if not media_result["success"]:
            errors.append(f"AD {i+1}: Upload falhou — {media_result['error']}")
            continue

        # URL com UTM params
        link = _build_link(ad_data.get("link", ""), ad_data.get("utm_params", {}))

        # Creative
        creative_result = await create_ad_creative(
            access_token=token, account_id=act_id,
            name=ad_data.get("name", f"Criativo {i+1}"),
            page_id=page_id, instagram_actor_id=instagram_actor_id,
            link=link, primary_text=ad_data.get("primary_text", ""),
            headline=ad_data.get("headline", ""),
            description=ad_data.get("description", ""),
            cta_type=ad_data.get("cta_type", "SHOP_NOW"),
            image_hash=media_result.get("image_hash"),
            video_id=media_result.get("video_id"),
        )

        if not creative_result["success"]:
            errors.append(f"AD {i+1}: Creative falhou — {creative_result['error']}")
            continue

        # Ad
        ad_result = await create_ad(
            access_token=token, account_id=act_id,
            name=ad_data.get("name", f"Ad {i+1}"),
            adset_id=adset_id, creative_id=creative_result["creative_id"],
        )

        if ad_result["success"]:
            created_count += 1
        else:
            errors.append(f"AD {i+1}: {ad_result['error']}")

    return created_count


async def _upload_media(token, act_id, file_bytes, filename, is_video) -> dict:
    if is_video:
        return await upload_video(token, act_id, file_bytes, filename)
    return await upload_image(token, act_id, file_bytes, filename)


def _build_link(base_url: str, utm_params: dict) -> str:
    if not utm_params or not base_url:
        return base_url
    separator = "&" if "?" in base_url else "?"
    params = "&".join(f"{k}={v}" for k, v in utm_params.items() if v)
    return f"{base_url}{separator}{params}" if params else base_url
