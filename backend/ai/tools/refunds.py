"""
Tool: Lista motivos de reembolso e chargebacks.
"""
from langchain_core.tools import tool
from datetime import timedelta
from collections import defaultdict

from database.core.connection import SessionLocal
from database.core.timezone import now_sp
from database.models.transaction import Transaction, TransactionStatus
from database.models.refund_reason import RefundReason


@tool
def query_refund_reasons(days_back: int = 30) -> str:
    """Lista motivos de reembolsos e chargebacks agrupados.
    Ajuda a identificar problemas no produto ou na oferta.
    Use para responder por que os clientes estão pedindo reembolso.

    Args:
        days_back: Quantidade de dias para trás (default 30)
    """
    db = SessionLocal()
    try:
        now = now_sp()
        date_start = now - timedelta(days=days_back)

        refunded = (
            db.query(Transaction)
            .filter(
                Transaction.created_at >= date_start,
                Transaction.status.in_([
                    TransactionStatus.REFUNDED,
                    TransactionStatus.CHARGEBACK,
                ]),
            )
            .all()
        )

        if not refunded:
            return "Nenhum reembolso ou chargeback no período. ✅"

        refund_count = len([t for t in refunded if t.status == TransactionStatus.REFUNDED])
        cb_count = len([t for t in refunded if t.status == TransactionStatus.CHARGEBACK])
        refund_value = sum(t.amount for t in refunded if t.status == TransactionStatus.REFUNDED)
        cb_value = sum(t.amount for t in refunded if t.status == TransactionStatus.CHARGEBACK)

        # Motivos cadastrados
        reasons = db.query(RefundReason).filter(
            RefundReason.created_at >= date_start
        ).all()

        by_reason: dict[str, int] = defaultdict(int)
        for r in reasons:
            label = r.reason_text or r.reason_code
            by_reason[label] += 1

        lines = [
            f"⚠️ Reembolsos e Chargebacks ({days_back} dias):\n"
            f"↩️ Reembolsos: {refund_count} (R$ {refund_value:,.2f})\n"
            f"🚨 Chargebacks: {cb_count} (R$ {cb_value:,.2f})\n"
            f"💸 Total perdido: R$ {(refund_value + cb_value):,.2f}"
        ]

        if by_reason:
            lines.append("\n📋 Motivos mais frequentes:")
            sorted_reasons = sorted(by_reason.items(), key=lambda x: x[1], reverse=True)
            for reason, count in sorted_reasons[:10]:
                lines.append(f"   • {reason}: {count}x")

        return "\n".join(lines)
    finally:
        db.close()
