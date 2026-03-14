"""
Tool: Retorna performance por produto.
"""
from langchain_core.tools import tool
from datetime import timedelta
from sqlalchemy import func

from database.core.connection import SessionLocal
from database.core.timezone import now_sp
from database.models.transaction import Transaction, TransactionStatus
from database.models.product import Product


@tool
def query_products(days_back: int = 30) -> str:
    """Retorna performance de vendas por produto: vendas, ticket, revenue.
    Use para responder qual produto vende mais, qual tem melhor margem.

    Args:
        days_back: Quantidade de dias para trás (default 30)
    """
    db = SessionLocal()
    try:
        now = now_sp()
        date_start = now - timedelta(days=days_back)

        products = db.query(Product).all()
        if not products:
            return "Nenhum produto cadastrado."

        lines = [f"🏷️ Performance de Produtos ({days_back} dias):\n"]

        for product in products:
            approved = (
                db.query(Transaction)
                .filter(
                    Transaction.product_id == product.id,
                    Transaction.status == TransactionStatus.APPROVED,
                    Transaction.created_at >= date_start,
                )
                .all()
            )
            revenue = sum(t.amount for t in approved)
            sales = len(approved)
            avg_ticket = revenue / sales if sales > 0 else 0

            lines.append(
                f"📦 {product.name}\n"
                f"   Vendas: {sales} | Revenue: R$ {revenue:,.2f} | "
                f"Ticket Real: R$ {avg_ticket:,.2f}"
            )

        return "\n".join(lines)
    finally:
        db.close()
