from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database.core.connection import get_db
from database.models.recovery_channel_config import RecoveryChannelConfig
from api.auth.deps import get_current_user

router = APIRouter(prefix="/recovery/config", tags=["recovery-config"])

# Padrões iniciais
DEFAULT_CONFIGS = {
    "whatsapp": "zap",
    "email": "email",
    "sms": "sms",
    "back_redirect": "back",
}


class ChannelConfigResponse(BaseModel):
    channel: str
    keyword: str

    class Config:
        from_attributes = True


class ChannelConfigUpdate(BaseModel):
    configs: list[ChannelConfigResponse]


def _ensure_defaults(db: Session) -> None:
    """Garante que as configurações padrão existam."""
    existing = db.query(RecoveryChannelConfig).all()
    existing_channels = {c.channel for c in existing}

    for channel, keyword in DEFAULT_CONFIGS.items():
        if channel not in existing_channels:
            db.add(RecoveryChannelConfig(channel=channel, keyword=keyword))

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
        else:
            db.add(RecoveryChannelConfig(
                channel=item.channel, keyword=item.keyword,
            ))

    db.commit()

    configs = db.query(RecoveryChannelConfig).order_by(
        RecoveryChannelConfig.id
    ).all()
    return configs
