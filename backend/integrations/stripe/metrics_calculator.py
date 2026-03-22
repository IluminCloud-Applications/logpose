from datetime import datetime


def _months_between(start_ts: int, end_ts: int) -> float:
    """Calcula número de meses entre dois timestamps."""
    start = datetime.utcfromtimestamp(start_ts)
    end = datetime.utcfromtimestamp(end_ts)
    diff = (end.year - start.year) * 12 + (end.month - start.month)
    return max(diff, 0)


def _calc_mrr(active_subs: list) -> float:
    """Calcula MRR a partir das assinaturas ativas."""
    mrr = 0.0
    for sub in active_subs:
        for item in sub.get("items", {}).get("data", []):
            amount = (item.price.unit_amount or 0) / 100
            interval = item.price.recurring.interval if item.price.recurring else "month"
            count = item.price.recurring.interval_count if item.price.recurring else 1
            qty = item.quantity or 1

            if interval == "year":
                mrr += (amount * qty) / (12 * count)
            elif interval == "month":
                mrr += (amount * qty) / count
            elif interval == "week":
                mrr += (amount * qty * 4.33) / count
            elif interval == "day":
                mrr += (amount * qty * 30) / count
    return mrr


def _calc_trials(trialing_subs: list, active_subs: list, canceled_subs: list) -> dict:
    """Calcula métricas de trial."""
    trial_count = len(trialing_subs)
    trial_potential_value = 0.0
    for sub in trialing_subs:
        for item in sub.get("items", {}).get("data", []):
            amount = (item.price.unit_amount or 0) / 100
            qty = item.quantity or 1
            trial_potential_value += amount * qty

    trials_that_converted = [
        s for s in active_subs if s.get("trial_start") is not None
    ]
    trials_total_ever = trial_count + len(trials_that_converted) + len(
        [s for s in canceled_subs if s.get("trial_start") is not None]
    )

    conversion_rate = (
        (len(trials_that_converted) / trials_total_ever * 100)
        if trials_total_ever > 0 else 0.0
    )
    churn_rate = 100 - conversion_rate if trials_total_ever > 0 else 0.0

    return {
        "count": trial_count,
        "potential_value": round(trial_potential_value, 2),
        "conversion_rate": round(conversion_rate, 1),
        "churn_rate": round(churn_rate, 1),
    }


def calculate_metrics(
    all_subs: list, ts_from: int, ts_to: int, now: int
) -> dict:
    """Calcula todas as métricas a partir da lista de subscriptions."""
    active_subs = [s for s in all_subs if s.status == "active"]
    trialing_subs = [s for s in all_subs if s.status == "trialing"]
    canceled_subs = [s for s in all_subs if s.status == "canceled"]

    mrr = _calc_mrr(active_subs)
    active_customers = len(active_subs)

    new_customers = len([
        s for s in active_subs if ts_from <= s.created <= ts_to
    ])

    canceled_in_period = [
        s for s in canceled_subs
        if s.get("canceled_at") and ts_from <= s.canceled_at <= ts_to
    ]

    total_start = active_customers + len(canceled_in_period)
    churn_rate = (
        (len(canceled_in_period) / total_start * 100)
        if total_start > 0 else 0.0
    )

    ticket_medio = mrr / active_customers if active_customers > 0 else 0.0

    # LTV = Ticket Médio / Churn Rate mensal
    monthly_churn = churn_rate / 100
    ltv = ticket_medio / monthly_churn if monthly_churn > 0 else ticket_medio * 120

    avg_tenure = (
        sum(_months_between(s.created, now) for s in active_subs) / len(active_subs)
        if active_subs else 0.0
    )

    avg_cancel_months = (
        sum(
            _months_between(s.created, s.get("canceled_at", s.created))
            for s in canceled_subs
        ) / len(canceled_subs)
        if canceled_subs else 0.0
    )

    return {
        "mrr": round(mrr, 2),
        "arr": round(mrr * 12, 2),
        "ltv": round(ltv, 2),
        "trials": _calc_trials(trialing_subs, active_subs, canceled_subs),
        "renewal_rate": round(100 - churn_rate, 1),
        "cancellation_rate": round(churn_rate, 1),
        "ticket_medio": round(ticket_medio, 2),
        "active_customers": active_customers,
        "new_customers_month": new_customers,
        "avg_tenure_months": round(avg_tenure, 1),
        "avg_cancel_months": round(avg_cancel_months, 1),
        "churn_rate": round(churn_rate, 1),
        "total_canceled_period": len(canceled_in_period),
    }
