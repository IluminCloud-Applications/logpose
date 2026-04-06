"""
Declaração da tool universal que a AI chama para buscar todos os dados.
"""
from langchain_core.tools import tool
from database.core.connection import SessionLocal
from ai.tools.universal import _parse_dates, _get_handlers


@tool
def query_business_data(queries: list[dict]) -> str:
    """Busca múltiplos dados do negócio em uma única chamada.
    Envie uma lista de consultas e receba todos os resultados de volta.

    Cada consulta tem o formato:
    {
        "call": "tipo_da_consulta",
        "date_start": "YYYY-MM-DD",  (opcional, default últimos 30 dias)
        "date_end": "YYYY-MM-DD",    (opcional, default hoje)
        "days_back": 30,             (alternativa a date_start/end)
        ... parâmetros extras do tipo
    }

    Tipos disponíveis (call):
    - "transactions": vendas/transações (extras: status, utm_campaign)
    - "kpis": KPIs principais (revenue, spend, profit, ROAS, CPA)
    - "meta_campaigns": campanhas do Meta Ads (extras: level=campaign|adset|ad, status=active|all)
    - "creatives": melhores criativos/anúncios (extras: sort_by=roas|sales|cpa, limit)
    - "recovery": recuperação de vendas (carrinho abandonado, pix, cartão)
    - "funnel": funil de conversão por campanha (identifica gargalos)
    - "products": performance por produto
    - "customers": base de clientes e top compradores (extras: limit)
    - "refunds": motivos de reembolso e chargebacks

    Exemplo de uso:
    [
        {"call": "kpis", "days_back": 7},
        {"call": "kpis", "days_back": 30},
        {"call": "creatives", "days_back": 30, "sort_by": "roas", "limit": 5},
        {"call": "recovery", "days_back": 30}
    ]

    Args:
        queries: Lista de consultas a executar
    """
    handlers = _get_handlers()
    db = SessionLocal()

    try:
        results = []
        for i, q in enumerate(queries):
            call_type = q.get("call", "")
            handler = handlers.get(call_type)

            if not handler:
                results.append(
                    f"[{i+1}] ❌ Tipo '{call_type}' não existe. "
                    f"Use: {', '.join(handlers.keys())}"
                )
                continue

            date_start, date_end = _parse_dates(q)

            # Passar parâmetros extras (tudo que não é call/dates)
            extras = {
                k: v for k, v in q.items()
                if k not in ("call", "date_start", "date_end", "days_back")
            }

            try:
                label = q.get("call", "")
                period = q.get("date_start", "") or f"últimos {q.get('days_back', 30)} dias"
                result = handler(db, date_start, date_end, **extras)
                results.append(
                    f"[{i+1}] 📊 {label.upper()} ({period}):\n{result}"
                )
            except Exception as e:
                results.append(f"[{i+1}] ⚠️ Erro em {call_type}: {str(e)}")

        return "\n\n".join(results)
    finally:
        db.close()
