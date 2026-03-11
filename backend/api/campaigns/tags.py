from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database.core.connection import get_db
from database.models.campaign_tag import CampaignTag
from api.auth.deps import get_current_user

router = APIRouter(prefix="/campaigns", tags=["campaign-tags"])


class TagsPayload(BaseModel):
    campaign_id: str
    tags: list[str]


class TagsResponse(BaseModel):
    campaign_id: str
    tags: list[str]

    class Config:
        from_attributes = True


@router.get("/tags", response_model=list[TagsResponse])
def list_all_tags(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Retorna todas as campaign_tags salvas."""
    rows = db.query(CampaignTag).all()
    return [
        TagsResponse(
            campaign_id=r.campaign_id,
            tags=[t.strip() for t in r.tags.split(",") if t.strip()],
        )
        for r in rows
    ]


@router.put("/tags", response_model=TagsResponse)
def save_tags(
    payload: TagsPayload,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Cria ou atualiza as tags de uma campanha."""
    tags_str = ",".join([t.strip() for t in payload.tags if t.strip()])
    row = db.query(CampaignTag).filter(
        CampaignTag.campaign_id == payload.campaign_id
    ).first()

    if row:
        row.tags = tags_str
    else:
        row = CampaignTag(campaign_id=payload.campaign_id, tags=tags_str)
        db.add(row)

    db.commit()
    db.refresh(row)
    return TagsResponse(
        campaign_id=row.campaign_id,
        tags=[t.strip() for t in row.tags.split(",") if t.strip()],
    )
