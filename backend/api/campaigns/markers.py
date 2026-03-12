from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database.core.connection import get_db
from database.models.campaign_marker import CampaignMarker, MarkerType
from api.auth.deps import get_current_user

router = APIRouter(prefix="/campaigns", tags=["campaign-markers"])


class MarkerPayload(BaseModel):
    campaign_id: str
    marker_type: str  # "video" | "checkout"
    reference_id: str
    reference_label: str


class MarkerResponse(BaseModel):
    id: int
    campaign_id: str
    marker_type: str
    reference_id: str
    reference_label: str

    class Config:
        from_attributes = True


@router.get("/markers", response_model=list[MarkerResponse])
def list_markers(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    rows = db.query(CampaignMarker).all()
    return [
        MarkerResponse(
            id=r.id,
            campaign_id=r.campaign_id,
            marker_type=r.marker_type.value,
            reference_id=r.reference_id,
            reference_label=r.reference_label,
        )
        for r in rows
    ]


@router.put("/markers", response_model=MarkerResponse)
def upsert_marker(
    payload: MarkerPayload,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    m_type = MarkerType(payload.marker_type)

    row = db.query(CampaignMarker).filter(
        CampaignMarker.campaign_id == payload.campaign_id,
        CampaignMarker.marker_type == m_type,
    ).first()

    if row:
        row.reference_id = payload.reference_id
        row.reference_label = payload.reference_label
    else:
        row = CampaignMarker(
            campaign_id=payload.campaign_id,
            marker_type=m_type,
            reference_id=payload.reference_id,
            reference_label=payload.reference_label,
        )
        db.add(row)

    db.commit()
    db.refresh(row)
    return MarkerResponse(
        id=row.id,
        campaign_id=row.campaign_id,
        marker_type=row.marker_type.value,
        reference_id=row.reference_id,
        reference_label=row.reference_label,
    )


@router.delete("/markers/{marker_id}", status_code=204)
def delete_marker(
    marker_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    row = db.query(CampaignMarker).filter(
        CampaignMarker.id == marker_id
    ).first()
    if not row:
        raise HTTPException(status_code=404, detail="Marcador não encontrado")
    db.delete(row)
    db.commit()
