from sqlalchemy import Column, Integer, String, Text
from database.core.connection import Base


class CampaignTag(Base):
    """
    Tags customizadas que o usuário associa às campanhas do Facebook.
    Armazena campaign_id (do Facebook) + tags como texto separado por vírgula.
    """
    __tablename__ = "campaign_tags"

    id = Column(Integer, primary_key=True, autoincrement=True)
    campaign_id = Column(String(100), unique=True, nullable=False, index=True)
    tags = Column(Text, nullable=False, default="")
