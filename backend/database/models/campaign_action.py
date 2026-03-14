"""
Tabela de ações do usuário em campanhas — registra quando o CEO
aumenta/diminui orçamento ou pausa campanhas, junto com as métricas
do momento da ação. Usado como "memória" para a AI aprender padrões.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum
from database.core.connection import Base
from database.core.timezone import now_sp
import enum


class ActionType(str, enum.Enum):
    BUDGET_INCREASE = "budget_increase"
    BUDGET_DECREASE = "budget_decrease"
    PAUSE = "pause"
    ACTIVATE = "activate"


class CampaignAction(Base):
    __tablename__ = "campaign_actions"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # Identificação
    entity_id = Column(String, nullable=False, index=True)
    entity_type = Column(String, nullable=False)  # campaign | adset | ad
    entity_name = Column(String, nullable=False)
    action_type = Column(Enum(ActionType), nullable=False, index=True)

    # Dados da ação de orçamento
    budget_before = Column(Float, nullable=True)
    budget_after = Column(Float, nullable=True)

    # Métricas no momento da ação (snapshot)
    spend = Column(Float, default=0)
    revenue = Column(Float, default=0)
    profit = Column(Float, default=0)
    sales = Column(Integer, default=0)
    roas = Column(Float, default=0)
    cpa = Column(Float, default=0)
    cpc = Column(Float, default=0)
    ctr = Column(Float, default=0)
    clicks = Column(Integer, default=0)
    impressions = Column(Integer, default=0)
    connect_rate = Column(Float, default=0)

    created_at = Column(DateTime(timezone=True), default=now_sp)
