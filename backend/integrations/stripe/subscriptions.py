import time
from datetime import datetime, timedelta

from integrations.stripe.client import get_stripe_client
from integrations.stripe.metrics_calculator import calculate_metrics


def _fetch_subs_by_status(client, status: str) -> list:
    """Busca todas as subscriptions com um status específico (paginado)."""
    all_subs = []
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

    return all_subs


def _fetch_all_subs(client) -> list:
    """Busca subscriptions de todos os status relevantes."""
    all_subs = []
    for status in ["active", "trialing", "past_due", "canceled", "unpaid"]:
        all_subs.extend(_fetch_subs_by_status(client, status))
    return all_subs


def compute_subscription_metrics(
    api_key: str,
    date_from: str | None = None,
    date_to: str | None = None,
    product_id: str | None = None,
) -> dict:
    """
    Calcula todas as métricas de assinatura a partir da Stripe API.
    Retorna dict com MRR, ARR, trials, churn, etc.
    """
    client = get_stripe_client(api_key)
    now = int(time.time())

    if date_from:
        ts_from = int(datetime.strptime(date_from, "%Y-%m-%d").timestamp())
    else:
        ts_from = int((datetime.utcnow() - timedelta(days=30)).timestamp())

    if date_to:
        ts_to = int(
            datetime.strptime(date_to, "%Y-%m-%d")
            .replace(hour=23, minute=59, second=59)
            .timestamp()
        )
    else:
        ts_to = now

    all_subs = _fetch_all_subs(client)

    # Filtrar por produto se especificado
    if product_id:
        all_subs = [
            s for s in all_subs
            if any(
                item.price.product == product_id
                for item in s.get("items", {}).get("data", [])
            )
        ]

    return calculate_metrics(all_subs, ts_from, ts_to, now)


def fetch_stripe_products(api_key: str) -> list[dict]:
    """Busca produtos cadastrados no Stripe para filtro."""
    client = get_stripe_client(api_key)
    products = []
    params: dict = {"limit": 100, "active": True}
    has_more = True
    starting_after = None

    while has_more:
        if starting_after:
            params["starting_after"] = starting_after
        result = client.products.list(params=params)
        for p in result.data:
            products.append({"id": p.id, "name": p.name})
        has_more = result.has_more
        if result.data:
            starting_after = result.data[-1].id

    return products
