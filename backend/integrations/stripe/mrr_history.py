"""
Calcula histórico mensal do MRR e movimentação (new vs churned).
Análise baseada nas datas de criação e cancelamento das subscriptions.
"""
import time
from datetime import datetime
from collections import defaultdict

from integrations.stripe.client import get_stripe_client


def _sub_monthly_value(sub) -> float:
    """Extrai o valor mensal normalizado de uma subscription."""
    total = 0.0
    for item in sub.get("items", {}).get("data", []):
        amount = (item.price.unit_amount or 0) / 100
        interval = item.price.recurring.interval if item.price.recurring else "month"
        count = item.price.recurring.interval_count if item.price.recurring else 1
        qty = item.quantity or 1

        if interval == "year":
            total += (amount * qty) / (12 * count)
        elif interval == "month":
            total += (amount * qty) / count
        elif interval == "week":
            total += (amount * qty * 4.33) / count
        elif interval == "day":
            total += (amount * qty * 30) / count
    return total


def _ts_to_month_key(ts: int) -> str:
    """Unix timestamp → 'YYYY-MM'."""
    return datetime.utcfromtimestamp(ts).strftime("%Y-%m")


def compute_mrr_history(api_key: str, months: int = 12) -> dict:
    """
    Retorna evolução mensal do MRR e movimentação (new, churned, net).
    Gera dados dos últimos N meses.
    """
    client = get_stripe_client(api_key)

    # Busca todas as subs (ativas + canceladas)
    all_subs = []
    for status in ["active", "trialing", "past_due", "canceled", "unpaid"]:
        params: dict = {"limit": 100, "status": status}
        has_more = True
        starting_after = None
        while has_more:
            if starting_after:
                params["starting_after"] = starting_after
            result = client.subscriptions.list(params=params)
            all_subs.extend(result.data)
            has_more = result.has_more
            if result.data:
                starting_after = result.data[-1].id

    # Gerar lista de meses (últimos N meses)
    now = datetime.utcnow()
    month_keys = []
    for i in range(months - 1, -1, -1):
        y = now.year
        m = now.month - i
        while m <= 0:
            m += 12
            y -= 1
        month_keys.append(f"{y:04d}-{m:02d}")

    # Calcular dados por mês
    new_mrr_by_month = defaultdict(float)
    churned_mrr_by_month = defaultdict(float)

    for sub in all_subs:
        value = _sub_monthly_value(sub)
        created_month = _ts_to_month_key(sub.created)
        new_mrr_by_month[created_month] += value

        if sub.status == "canceled" and sub.get("canceled_at"):
            cancel_month = _ts_to_month_key(sub.canceled_at)
            churned_mrr_by_month[cancel_month] += value

    # Calcular MRR acumulado mês a mês
    mrr_history = []
    running_mrr = 0.0

    # Pegar todas as subs criadas antes do período para o MRR inicial
    first_month_ts = datetime.strptime(month_keys[0] + "-01", "%Y-%m-%d").timestamp()
    for sub in all_subs:
        if sub.created < first_month_ts:
            is_active_then = True
            if sub.status == "canceled" and sub.get("canceled_at"):
                if sub.canceled_at < first_month_ts:
                    is_active_then = False
            if is_active_then:
                running_mrr += _sub_monthly_value(sub)

    for month_key in month_keys:
        new_val = round(new_mrr_by_month.get(month_key, 0), 2)
        churned_val = round(churned_mrr_by_month.get(month_key, 0), 2)
        running_mrr += new_val - churned_val

        mrr_history.append({
            "month": month_key,
            "mrr": round(max(running_mrr, 0), 2),
            "new_mrr": new_val,
            "churned_mrr": churned_val,
            "net_mrr": round(new_val - churned_val, 2),
        })

    return {
        "mrr_history": mrr_history,
    }
