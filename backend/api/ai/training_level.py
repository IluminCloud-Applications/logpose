"""
Endpoint que retorna o nível de treinamento da AI
baseado na quantidade de ações registradas do CEO.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.core.connection import get_db
from database.models.campaign_action import CampaignAction
from api.auth.deps import get_current_user

router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/training-level")
def get_training_level(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Retorna nível de treinamento da AI (0-100%)."""
    count = db.query(CampaignAction).count()
    max_records = 90
    percentage = min(100, round((count / max_records) * 100))

    if count == 0:
        level = "Sem dados"
    elif count < 10:
        level = "Iniciante"
    elif count < 30:
        level = "Aprendendo"
    elif count < 50:
        level = "Intermediária"
    elif count < 70:
        level = "Avançada"
    elif count < 90:
        level = "Quase lá"
    else:
        level = "Treinada"

    return {
        "count": count,
        "percentage": percentage,
        "level": level,
        "max_records": max_records,
    }
