from sqlalchemy import Column, Integer, String, JSON, DateTime
from database.core.connection import Base
from database.core.timezone import CREATED_AT_DEFAULT


class CampaignPreset(Base):
    """
    Predefinições de visualização customizadas pelo usuário.
    Salva nome e colunas visíveis.
    """
    __tablename__ = "campaign_presets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    columns = Column(JSON, nullable=False)
    created_at = Column(DateTime, server_default=CREATED_AT_DEFAULT)
