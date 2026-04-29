"""
Endpoint principal para criar campanhas completas.
Recebe JSON + arquivos multipart e orquestra toda a criação.
Suporta campaign_count: cria N campanhas idênticas (cada uma com adset_count conjuntos).
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
    Cria campanha(s) completa(s): Campaign → Ad Sets → Ads.
    campaign_count define quantas campanhas idênticas criar (padrão: 1).
    Cada campanha terá adset_count conjuntos, cada conjunto com todos os ads.
    """
    try:
        data = json.loads(payload)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Payload JSON inválido")

    account = db.query(FacebookAccount).filter(
        FacebookAccount.id == data.get("account_id")
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Conta Facebook não encontrada")

    token = account.access_token
    act_id = account.account_id
    errors: list[str] = []
    publish_active = data.get("publish_active", False)
    status = "ACTIVE" if publish_active else "PAUSED"

    campaign_count = max(1, int(data.get("campaign_count", 1)))
    adset_count = max(1, int(data.get("adset_count", 1)))

    # Pré-lê todos os arquivos em memória (multipart só pode ser lido uma vez)
    file_bytes_list: list[tuple[bytes, str, bool]] = []
    for f in files:
        raw = await f.read()
        ext = (f.filename or "").rsplit(".", 1)[-1].lower()
        is_video = f".{ext}" in VIDEO_EXTENSIONS
        file_bytes_list.append((raw, f.filename or f"media_{len(file_bytes_list)}", is_video))

    total_ads_created = 0
    first_campaign_id: str | None = None
    first_adset_id: str | None = None

    for camp_i in range(campaign_count):
        camp_label = f"[Camp {camp_i + 1}/{campaign_count}]"

        # Sufixo numérico apenas quando há mais de 1 campanha
        campaign_name = data["campaign_name"]
        if campaign_count > 1:
            campaign_name = f"{campaign_name} #{camp_i + 1:02d}"

        camp_result = await create_campaign(
            access_token=token,
            account_id=act_id,
            name=campaign_name,
            daily_budget_reais=data["daily_budget"],
            bid_strategy=data.get("bid_strategy", "VOLUME"),
            status=status,
        )

        if not camp_result["success"]:
            errors.append(f"{camp_label} Erro na campanha: {camp_result['error']}")
            continue

        campaign_id = camp_result["campaign_id"]
        logger.info(f"{camp_label} Campanha criada: {campaign_id}")

        if first_campaign_id is None:
            first_campaign_id = campaign_id

        # Criar adset_count conjuntos dentro desta campanha
        for adset_i in range(adset_count):
            adset_label = f"{camp_label}[CJ {adset_i + 1}/{adset_count}]"

            adset_name = data.get("adset_name", "Conjunto")
            if adset_count > 1:
                adset_name = f"{adset_name} #{adset_i + 1:02d}"

            targeting = dict(data.get("targeting", {}))
            ig_actor_id = data.get("instagram_actor_id")

            if not ig_actor_id or ig_actor_id == "none":
                targeting["publisher_platforms"] = ["facebook", "audience_network", "messenger"]

            adset_result = await create_adset(
                access_token=token,
                account_id=act_id,
                campaign_id=campaign_id,
                name=adset_name,
                bid_strategy=data.get("bid_strategy", "VOLUME"),
                bid_amount=data.get("bid_amount"),
                roas_floor=data.get("roas_floor"),
                pixel_id=data["pixel_id"],
                start_time=data["start_time"],
                targeting=targeting,
                status=status,
            )

            if not adset_result["success"]:
                errors.append(f"{adset_label} Erro no conjunto: {adset_result['error']}")
                continue

            adset_id = adset_result["adset_id"]
            logger.info(f"{adset_label} Conjunto criado: {adset_id}")

            if first_adset_id is None:
                first_adset_id = adset_id

            # Criar todos os ads dentro deste conjunto
            ads_created = await _create_ads_batch(
                token=token,
                act_id=act_id,
                adset_id=adset_id,
                ads=data.get("ads", []),
                file_bytes_list=file_bytes_list,
                page_id=data.get("page_id", ""),
                instagram_actor_id=ig_actor_id,
                status=status,
                errors=errors,
                label=adset_label,
            )
            total_ads_created += ads_created

    return CampaignCreateResponse(
        success=len(errors) == 0,
        campaign_id=first_campaign_id,
        adset_id=first_adset_id,
        campaigns_created=campaign_count,
        ads_created=total_ads_created,
        errors=errors,
    )


async def _create_ads_batch(
    token: str,
    act_id: str,
    adset_id: str,
    ads: list[dict],
    file_bytes_list: list[tuple[bytes, str, bool]],
    page_id: str,
    instagram_actor_id: str | None,
    status: str,
    errors: list[str],
    label: str = "",
) -> int:
    """Cria múltiplos ads com upload de mídia para um dado adset_id."""
    created_count = 0

    for i, ad_data in enumerate(ads):
        media_index = ad_data.get("media_index", i)
        if media_index >= len(file_bytes_list):
            errors.append(f"{label} AD {i+1}: Arquivo de mídia não encontrado")
            continue

        file_bytes, filename, is_video = file_bytes_list[media_index]
        media_result = await _upload_media(token, act_id, file_bytes, filename, is_video)

        if not media_result["success"]:
            errors.append(f"{label} AD {i+1}: Upload falhou — {media_result['error']}")
            continue

        link = ad_data.get("link", "")
        url_tags = _build_url_tags(
            ad_data.get("utm_params", ""),
            ad_data.get("extra_params", ""),
        )

        creative_result = await create_ad_creative(
            access_token=token, account_id=act_id,
            name=ad_data.get("name", f"AD {str(i+1).zfill(2)}"),
            page_id=page_id, instagram_actor_id=instagram_actor_id,
            link=link, primary_text=ad_data.get("primary_text", ""),
            headline=ad_data.get("headline", ""),
            description=ad_data.get("description", ""),
            cta_type=ad_data.get("cta_type", "SHOP_NOW"),
            image_hash=media_result.get("image_hash"),
            video_id=media_result.get("video_id"),
            url_tags=url_tags,
        )

        if not creative_result["success"]:
            errors.append(f"{label} AD {i+1}: Creative falhou — {creative_result['error']}")
            continue

        ad_result = await create_ad(
            access_token=token, account_id=act_id,
            name=ad_data.get("name", f"AD {str(i+1).zfill(2)}"),
            adset_id=adset_id, creative_id=creative_result["creative_id"],
            status=status,
        )

        if ad_result["success"]:
            created_count += 1
        else:
            errors.append(f"{label} AD {i+1}: {ad_result['error']}")

    return created_count


async def _upload_media(token, act_id, file_bytes: bytes, filename: str, is_video: bool) -> dict:
    if is_video:
        return await upload_video(token, act_id, file_bytes, filename)
    return await upload_image(token, act_id, file_bytes, filename)


def _build_url_tags(utm_params: str | dict = "", extra_params: str = "") -> str:
    """Constrói url_tags string (UTM + extra params). Não inclui o link base."""
    if isinstance(utm_params, dict):
        utm_str = "&".join(f"{k}={v}" for k, v in utm_params.items() if v)
    else:
        utm_str = str(utm_params).strip() if utm_params else ""

    parts = [p for p in [utm_str, extra_params.strip()] if p]
    return "&".join(parts)
