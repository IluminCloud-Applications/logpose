from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import re

from database.core.connection import get_db
from database.models.recovery_channel_config import RecoveryChannelConfig
from api.auth.deps import get_current_user

router = APIRouter(prefix="/recovery/config", tags=["recovery-config"])

# Padrões iniciais (não podem ser removidos pelo usuário)
DEFAULT_CONFIGS = {
    "whatsapp": ("WhatsApp", "zap"),
    "email": ("Email", "email"),
    "sms": ("SMS", "sms"),
    "back_redirect": ("BackRedirect", "back"),
}


class ChannelConfigResponse(BaseModel):
    channel: str
    keyword: str
    label: str | None = None
    is_custom: bool = False

    class Config:
        from_attributes = True


class ChannelConfigUpdate(BaseModel):
    configs: list[ChannelConfigResponse]


class CustomChannelCreate(BaseModel):
    name: str    # label amigável, ex: "IA de Recuperação"
    keyword: str  # valor do src a buscar


def _slugify(text: str) -> str:
    """Converte nome em slug para usar como channel key."""
    slug = re.sub(r"[^\w\s-]", "", text.lower())
    slug = re.sub(r"[\s_-]+", "_", slug).strip("_")
    return f"custom_{slug}"


def _ensure_defaults(db: Session) -> None:
    """Garante que as configurações padrão existam."""
    existing = db.query(RecoveryChannelConfig).all()
    existing_channels = {c.channel for c in existing}

    for channel, (label, keyword) in DEFAULT_CONFIGS.items():
        if channel not in existing_channels:
            db.add(RecoveryChannelConfig(
                channel=channel, keyword=keyword,
                label=label, is_custom=False,
            ))

    if len(existing_channels) < len(DEFAULT_CONFIGS):
        db.commit()


@router.get("", response_model=list[ChannelConfigResponse])
def get_channel_configs(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    _ensure_defaults(db)
    configs = db.query(RecoveryChannelConfig).order_by(
        RecoveryChannelConfig.id
    ).all()
    return configs


@router.put("", response_model=list[ChannelConfigResponse])
def update_channel_configs(
    payload: ChannelConfigUpdate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    for item in payload.configs:
        existing = db.query(RecoveryChannelConfig).filter(
            RecoveryChannelConfig.channel == item.channel
        ).first()

        if existing:
            existing.keyword = item.keyword
            if item.label:
                existing.label = item.label
        else:
            db.add(RecoveryChannelConfig(
                channel=item.channel, keyword=item.keyword,
                label=item.label, is_custom=item.is_custom,
            ))

    db.commit()
    configs = db.query(RecoveryChannelConfig).order_by(
        RecoveryChannelConfig.id
    ).all()
    return configs


@router.post("/custom", response_model=ChannelConfigResponse, status_code=201)
def create_custom_channel(
    payload: CustomChannelCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Cria um canal personalizado definido pelo usuário."""
    channel_key = _slugify(payload.name)

    # Evita duplicatas
    existing = db.query(RecoveryChannelConfig).filter(
        RecoveryChannelConfig.channel == channel_key
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Canal com este nome já existe.")

    new_cfg = RecoveryChannelConfig(
        channel=channel_key,
        keyword=payload.keyword,
        label=payload.name,
        is_custom=True,
    )
    db.add(new_cfg)
    db.commit()
    db.refresh(new_cfg)
    return new_cfg


@router.delete("/custom/{channel}", status_code=204)
def delete_custom_channel(
    channel: str,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Remove um canal personalizado. Canais padrão não podem ser removidos."""
    cfg = db.query(RecoveryChannelConfig).filter(
        RecoveryChannelConfig.channel == channel
    ).first()

    if not cfg:
        raise HTTPException(status_code=404, detail="Canal não encontrado.")
    if not cfg.is_custom:
        raise HTTPException(status_code=403, detail="Canais padrão não podem ser removidos.")

    db.delete(cfg)
    db.commit()
