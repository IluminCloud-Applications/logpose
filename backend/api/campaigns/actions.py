"""
Registra ações do usuário em campanhas para aprendizado da AI.
Chamado internamente pelos endpoints de toggle e budget.
"""
from sqlalchemy.orm import Session

from database.models.campaign_action import CampaignAction, ActionType


def record_campaign_action(
    db: Session,
    entity_id: str,
    entity_type: str,
    entity_name: str,
    action_type: ActionType,
    metrics: dict,
    budget_before: float | None = None,
    budget_after: float | None = None,
) -> CampaignAction:
    """Grava snapshot da ação + métricas no banco."""
    action = CampaignAction(
        entity_id=entity_id,
        entity_type=entity_type,
        entity_name=entity_name,
        action_type=action_type,
        budget_before=budget_before,
        budget_after=budget_after,
        spend=metrics.get("spend", 0),
        revenue=metrics.get("revenue", 0),
        profit=metrics.get("profit", 0),
        sales=metrics.get("sales", 0),
        roas=metrics.get("roas", 0),
        cpa=metrics.get("cpa", 0),
        cpc=metrics.get("cpc", 0),
        ctr=metrics.get("ctr", 0),
        clicks=metrics.get("clicks", 0),
        impressions=metrics.get("impressions", 0),
        connect_rate=metrics.get("connect_rate", 0),
    )
    db.add(action)
    db.commit()
    db.refresh(action)
    return action


def fetch_learning_data(db: Session, limit_per_type: int = 30) -> str:
    """
    Busca os registros de ações mais recentes para contexto da AI.
    Retorna as 30 mais recentes de cada tipo de ação.
    """
    action_types = [
        ActionType.BUDGET_INCREASE,
        ActionType.BUDGET_DECREASE,
        ActionType.PAUSE,
    ]

    sections = []

    for action_type in action_types:
        rows = (
            db.query(CampaignAction)
            .filter(CampaignAction.action_type == action_type)
            .order_by(CampaignAction.created_at.desc())
            .limit(limit_per_type)
            .all()
        )

        if not rows:
            continue

        label = _action_label(action_type)
        lines = [f"## {label} ({len(rows)} registros)"]

        for r in rows:
            line = (
                f"- {r.entity_name} ({r.entity_type}) | "
                f"Data: {r.created_at.strftime('%d/%m %H:%M') if r.created_at else '?'}"
            )

            if r.budget_before is not None and r.budget_after is not None:
                line += f" | Orçamento: R${r.budget_before:.0f} → R${r.budget_after:.0f}"

            line += (
                f" | Gastos: R${r.spend:.2f}"
                f" | Vendas: {r.sales}"
                f" | Faturamento: R${r.revenue:.2f}"
                f" | Lucro: R${r.profit:.2f}"
                f" | ROAS: {r.roas:.2f}x"
                f" | CPA: R${r.cpa:.2f}"
                f" | CTR: {r.ctr:.2f}%"
            )
            lines.append(line)

        sections.append("\n".join(lines))

    if not sections:
        return ""

    return "\n\n".join(sections)


def _action_label(action_type: ActionType) -> str:
    return {
        ActionType.BUDGET_INCREASE: "📈 Aumentos de Orçamento",
        ActionType.BUDGET_DECREASE: "📉 Reduções de Orçamento",
        ActionType.PAUSE: "⏸️ Campanhas Pausadas",
        ActionType.ACTIVATE: "▶️ Campanhas Ativadas",
    }.get(action_type, str(action_type))
