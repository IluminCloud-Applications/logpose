"""
API para predefinições de visualização customizadas (presets).
O usuário cria, lista e deleta presets de colunas.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database.core.connection import get_db
from database.models.campaign_preset import CampaignPreset
from api.auth.deps import get_current_user

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


class PresetCreate(BaseModel):
    name: str
    columns: list[str]


class PresetResponse(BaseModel):
    id: int
    name: str
    columns: list[str]
    created_at: str | None = None

    class Config:
        from_attributes = True


@router.get("/presets", response_model=list[PresetResponse])
def list_presets(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    presets = db.query(CampaignPreset).order_by(CampaignPreset.id).all()
    return [
        PresetResponse(
            id=p.id,
            name=p.name,
            columns=p.columns,
            created_at=p.created_at.isoformat() if p.created_at else None,
        )
        for p in presets
    ]


@router.post("/presets", response_model=PresetResponse, status_code=201)
def create_preset(
    payload: PresetCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    if not payload.name.strip() or len(payload.columns) < 2:
        raise HTTPException(status_code=400, detail="Nome e pelo menos 2 colunas são obrigatórios")

    preset = CampaignPreset(
        name=payload.name.strip(),
        columns=payload.columns,
    )
    db.add(preset)
    db.commit()
    db.refresh(preset)

    return PresetResponse(
        id=preset.id,
        name=preset.name,
        columns=preset.columns,
        created_at=preset.created_at.isoformat() if preset.created_at else None,
    )


@router.put("/presets/{preset_id}", response_model=PresetResponse)
def update_preset(
    preset_id: int,
    payload: PresetCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    preset = db.query(CampaignPreset).filter(CampaignPreset.id == preset_id).first()
    if not preset:
        raise HTTPException(status_code=404, detail="Predefinição não encontrada")

    if not payload.name.strip() or len(payload.columns) < 2:
        raise HTTPException(status_code=400, detail="Nome e pelo menos 2 colunas são obrigatórios")

    preset.name = payload.name.strip()
    preset.columns = payload.columns
    db.commit()
    db.refresh(preset)

    return PresetResponse(
        id=preset.id,
        name=preset.name,
        columns=preset.columns,
        created_at=preset.created_at.isoformat() if preset.created_at else None,
    )


@router.delete("/presets/{preset_id}", status_code=204)
def delete_preset(
    preset_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    preset = db.query(CampaignPreset).filter(CampaignPreset.id == preset_id).first()
    if not preset:
        raise HTTPException(status_code=404, detail="Predefinição não encontrada")
    db.delete(preset)
    db.commit()
