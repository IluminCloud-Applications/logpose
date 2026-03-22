from sqlalchemy import Column, Integer, String, DateTime, Enum
from database.core.connection import Base
from database.core.timezone import CREATED_AT_DEFAULT
import enum


class MarkerType(str, enum.Enum):
    VIDEO = "video"
    CHECKOUT = "checkout"
    PRODUCT = "product"
    PLATFORM = "platform"


class CampaignMarker(Base):
    """
    Marcador que associa uma campanha a um vídeo (player VTurb)
    ou a um checkout (URL de checkout de um produto).
    """
    __tablename__ = "campaign_markers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    campaign_id = Column(String(100), nullable=False, index=True)
    marker_type = Column(Enum(MarkerType), nullable=False)
    # Para VIDEO: player_id do VTurb. Para CHECKOUT: id do checkout.
    reference_id = Column(String(255), nullable=False)
    # Nome legível para exibição rápida
    reference_label = Column(String(500), nullable=False, default="")
    created_at = Column(DateTime, server_default=CREATED_AT_DEFAULT)
