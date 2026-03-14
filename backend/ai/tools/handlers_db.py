"""
Handlers: products, customers, refunds (baseados em banco de dados).
"""
from collections import defaultdict

from database.models.transaction import Transaction, TransactionStatus
from database.models.customer import Customer
from database.models.product import Product
from database.models.refund_reason import RefundReason


def _handle_products(db, date_start, date_end, **kwargs):
    products = db.query(Product).all()
    if not products:
        return "Nenhum produto cadastrado."

    lines = []
    for p in products:
        approved = (
            db.query(Transaction)
            .filter(
                Transaction.product_id == p.id,
                Transaction.status == TransactionStatus.APPROVED,
                Transaction.created_at >= date_start,
                Transaction.created_at <= date_end,
            )
            .all()
        )
        rev = sum(t.amount for t in approved)
        s = len(approved)
        avg = rev / s if s > 0 else 0
        lines.append(
            f"{p.name} | Ticket: R${p.ticket:,.2f} | "
            f"CPA Ideal: R${p.ideal_cpa or 0:,.2f} | "
            f"Vendas: {s} | Revenue: R${rev:,.2f} | Ticket Real: R${avg:,.2f}"
        )
    return "\n".join(lines)


def _handle_customers(db, date_start, date_end, **kwargs):
    limit = int(kwargs.get("limit", 10))
    total = db.query(Customer).count()
    new = db.query(Customer).filter(Customer.created_at >= date_start).count()
    top = (
        db.query(Customer)
        .order_by(Customer.total_spent.desc())
        .limit(limit)
        .all()
    )
    lines = [f"Total: {total} | Novos no período: {new}"]
    for i, c in enumerate(top, 1):
        lines.append(
            f"{i}. {c.name or c.email} | "
            f"Gasto: R${c.total_spent:,.2f} | Pedidos: {c.total_orders}"
        )
    return "\n".join(lines)


def _handle_refunds(db, date_start, date_end, **kwargs):
    refunded = (
        db.query(Transaction)
        .filter(
            Transaction.created_at >= date_start,
            Transaction.created_at <= date_end,
            Transaction.status.in_([
                TransactionStatus.REFUNDED, TransactionStatus.CHARGEBACK,
            ]),
        )
        .all()
    )
    if not refunded:
        return "Nenhum reembolso ou chargeback no período. ✅"

    ref_c = len([t for t in refunded if t.status == TransactionStatus.REFUNDED])
    cb_c = len([t for t in refunded if t.status == TransactionStatus.CHARGEBACK])
    ref_v = sum(t.amount for t in refunded if t.status == TransactionStatus.REFUNDED)
    cb_v = sum(t.amount for t in refunded if t.status == TransactionStatus.CHARGEBACK)

    reasons = db.query(RefundReason).filter(
        RefundReason.created_at >= date_start
    ).all()
    by_reason: dict[str, int] = defaultdict(int)
    for r in reasons:
        by_reason[r.reason_text or r.reason_code] += 1

    lines = [
        f"Reembolsos: {ref_c} (R${ref_v:,.2f}) | "
        f"Chargebacks: {cb_c} (R${cb_v:,.2f}) | "
        f"Total perdido: R${(ref_v + cb_v):,.2f}"
    ]
    if by_reason:
        sorted_r = sorted(by_reason.items(), key=lambda x: x[1], reverse=True)
        lines.append("Motivos: " + " | ".join(
            f"{r}: {c}x" for r, c in sorted_r[:5]
        ))
    return "\n".join(lines)
