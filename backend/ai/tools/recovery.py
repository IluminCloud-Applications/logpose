"""
Tool: Busca dados de recuperação de vendas perdidas.
"""
from langchain_core.tools import tool
from datetime import timedelta

from database.core.connection import SessionLocal
from database.core.timezone import now_sp
from database.models.recovery import Recovery, RecoveryType


@tool
def query_recovery_data(days_back: int = 30) -> str:
    """Busca dados de recuperação: carrinhos abandonados, pix não pagos, cartões recusados.
    Mostra valores perdidos e taxa de recuperação.
    Use para responder sobre dinheiro perdido e oportunidades de recuperação.

    Args:
        days_back: Quantidade de dias para trás (default 30)
    """
    db = SessionLocal()
    try:
        now = now_sp()
        date_start = now - timedelta(days=days_back)

        recoveries = (
            db.query(Recovery)
            .filter(Recovery.created_at >= date_start)
            .all()
        )

        if not recoveries:
            return "Nenhum dado de recuperação encontrado no período."

        by_type = {}
        for rtype in RecoveryType:
            items = [r for r in recoveries if r.type == rtype]
            recovered = [r for r in items if r.recovered]
            total_lost = sum(r.amount for r in items)
            total_recovered = sum(r.amount for r in recovered)
            by_type[rtype.value] = {
                "total": len(items),
                "recovered": len(recovered),
                "lost_value": total_lost,
                "recovered_value": total_recovered,
                "rate": round((len(recovered) / len(items) * 100), 1) if items else 0,
            }

        total_all = sum(v["total"] for v in by_type.values())
        total_lost = sum(v["lost_value"] for v in by_type.values())
        total_recovered = sum(v["recovered_value"] for v in by_type.values())

        type_names = {
            "abandoned_cart": "🛒 Carrinho Abandonado",
            "declined_card": "💳 Cartão Recusado",
            "unpaid_pix": "📱 PIX Não Pago",
        }

        lines = [f"🔄 Recuperação de Vendas ({days_back} dias):\n"]
        for key, data in by_type.items():
            if data["total"] == 0:
                continue
            name = type_names.get(key, key)
            lines.append(
                f"{name}: {data['total']} ocorrências\n"
                f"   Valor total: R$ {data['lost_value']:,.2f}\n"
                f"   Recuperado: {data['recovered']} "
                f"(R$ {data['recovered_value']:,.2f}) — {data['rate']}%"
            )

        lines.append(
            f"\n📊 Resumo:\n"
            f"Total de oportunidades: {total_all}\n"
            f"Valor total perdido: R$ {total_lost:,.2f}\n"
            f"Valor recuperado: R$ {total_recovered:,.2f}\n"
            f"Valor ainda pendente: R$ {(total_lost - total_recovered):,.2f}"
        )
        return "\n".join(lines)
    finally:
        db.close()
