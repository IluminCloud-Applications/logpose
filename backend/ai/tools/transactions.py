"""
Tool: Busca transações (vendas) filtradas por período, status, campanha ou produto.
"""
from langchain_core.tools import tool
from datetime import datetime, timedelta

from database.core.connection import SessionLocal
from database.core.timezone import now_sp
from database.models.transaction import Transaction, TransactionStatus


@tool
def query_transactions(
    days_back: int = 30,
    status: str = "",
    utm_campaign: str = "",
) -> str:
    """Busca transações (vendas) filtradas por período e status.
    Use para responder sobre faturamento, vendas, ticket médio, chargebacks.

    Args:
        days_back: Quantidade de dias para trás (default 30)
        status: Filtrar por status: approved, refunded, chargeback, pending, trial (vazio = todos)
        utm_campaign: Filtrar por campanha específica (vazio = todas)
    """
    db = SessionLocal()
    try:
        now = now_sp()
        date_start = now - timedelta(days=days_back)

        query = db.query(Transaction).filter(Transaction.created_at >= date_start)

        if status:
            try:
                query = query.filter(Transaction.status == TransactionStatus(status))
            except ValueError:
                pass

        if utm_campaign:
            query = query.filter(Transaction.utm_campaign.ilike(f"%{utm_campaign}%"))

        rows = query.order_by(Transaction.created_at.desc()).limit(500).all()

        approved = [t for t in rows if t.status == TransactionStatus.APPROVED]
        pending = [t for t in rows if t.status == TransactionStatus.PENDING]
        refunded = [t for t in rows if t.status == TransactionStatus.REFUNDED]
        chargebacks = [t for t in rows if t.status == TransactionStatus.CHARGEBACK]
        trials = [t for t in rows if t.status == TransactionStatus.TRIAL]

        total_revenue = sum(t.amount for t in approved)
        avg_ticket = total_revenue / len(approved) if approved else 0

        return (
            f"📊 Transações dos últimos {days_back} dias:\n"
            f"Total de transações: {len(rows)}\n"
            f"Aprovadas: {len(approved)} (R$ {total_revenue:,.2f})\n"
            f"Pendentes: {len(pending)} (R$ {sum(t.amount for t in pending):,.2f})\n"
            f"Reembolsadas: {len(refunded)} (R$ {sum(t.amount for t in refunded):,.2f})\n"
            f"Chargebacks: {len(chargebacks)} (R$ {sum(t.amount for t in chargebacks):,.2f})\n"
            f"Trials: {len(trials)} (R$ {sum(t.amount for t in trials):,.2f})\n"
            f"Ticket médio: R$ {avg_ticket:,.2f}\n"
            f"Taxa de aprovação: {(len(approved)/len(rows)*100):.1f}%\n"
            if rows else "Nenhuma transação encontrada no período."
        )
    finally:
        db.close()
