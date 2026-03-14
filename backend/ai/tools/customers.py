"""
Tool: Analisa a base de clientes e padrões de compra.
"""
from langchain_core.tools import tool
from datetime import timedelta

from database.core.connection import SessionLocal
from database.core.timezone import now_sp
from database.models.customer import Customer


@tool
def query_customers(
    days_back: int = 30,
    sort_by: str = "total_spent",
    limit: int = 10,
) -> str:
    """Analisa a base de clientes: total, ticket médio global, melhores clientes.
    Use para responder sobre comportamento de compra e LTV.

    Args:
        days_back: Quantidade de dias para trás (default 30)
        sort_by: Ordenar por: total_spent, total_orders
        limit: Quantidade máxima de resultados (default 10)
    """
    db = SessionLocal()
    try:
        now = now_sp()
        date_start = now - timedelta(days=days_back)

        # Clientes do período
        new_customers = (
            db.query(Customer)
            .filter(Customer.created_at >= date_start)
            .count()
        )

        total_customers = db.query(Customer).count()

        # Top clientes
        order_col = (
            Customer.total_spent if sort_by == "total_spent"
            else Customer.total_orders
        )
        top = (
            db.query(Customer)
            .order_by(order_col.desc())
            .limit(limit)
            .all()
        )

        lines = [
            f"👥 Base de Clientes ({days_back} dias):\n"
            f"Total na base: {total_customers}\n"
            f"Novos no período: {new_customers}\n"
            f"\nTop {limit} por {sort_by}:"
        ]

        for i, c in enumerate(top, 1):
            lines.append(
                f"{i}. {c.name or c.email}\n"
                f"   Gasto total: R$ {c.total_spent:,.2f} | "
                f"Pedidos: {c.total_orders}"
            )

        return "\n".join(lines)
    finally:
        db.close()
