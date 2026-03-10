"""
Helpers para parsear dados de actions/action_values
retornados pela Meta Marketing API.
"""
from typing import Any


def extract_action_value(
    actions: list[dict[str, Any]] | None,
    action_type: str,
) -> float:
    """
    Extrai o value de um action_type específico da lista de actions.
    Ex: extract_action_value(actions, "landing_page_view") -> 3980.0
    """
    if not actions:
        return 0.0
    for action in actions:
        if action.get("action_type") == action_type:
            return float(action.get("value", 0))
    return 0.0


def safe_float(value: Any, default: float = 0.0) -> float:
    """Converte para float com segurança."""
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def safe_int(value: Any, default: int = 0) -> int:
    """Converte para int com segurança."""
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return default


def calc_connect_rate(
    landing_page_views: int,
    clicks: int,
) -> float:
    """
    Taxa de conexão = LPV / Clicks * 100
    Indica % de clicks que realmente carregaram a landing page.
    """
    if clicks <= 0:
        return 0.0
    return round((landing_page_views / clicks) * 100, 1)


def calc_profit(revenue: float, spend: float) -> float:
    """Lucro simples = receita - investimento."""
    return round(revenue - spend, 2)
