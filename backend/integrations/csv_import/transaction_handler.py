import logging
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session

from integrations.csv_import.schemas import ImportRow, ImportResultResponse
from database.models.customer import Customer
from database.models.customer_product import CustomerProduct
from database.models.transaction import Transaction, TransactionStatus, PaymentPlatform
from database.models.product import Product

logger = logging.getLogger(__name__)

STATUS_MAP = {
    "approved": TransactionStatus.APPROVED,
    "refunded": TransactionStatus.REFUNDED,
    "chargeback": TransactionStatus.CHARGEBACK,
    "pending": TransactionStatus.PENDING,
}


def _parse_date(date_str: str | None) -> datetime | None:
    if not date_str:
        return None
    for fmt in ("%d/%m/%Y %H:%M:%S", "%d/%m/%Y"):
        try:
            return datetime.strptime(date_str.strip(), fmt)
        except ValueError:
            continue
    return None


def _get_saopaulo_time() -> datetime:
    return datetime.now(timezone.utc) - timedelta(hours=3)


def process_transactions(
    db: Session, rows: list[ImportRow], config_map: dict,
    product_db: dict[str, Product], platform_enum: PaymentPlatform,
    result: ImportResultResponse,
):
    """Cria Customers e Transactions para cada linha do CSV/XLSX."""
    for row in rows:
        if not row.customer_email:
            continue

        existing_tx = db.query(Transaction).filter(
            Transaction.external_id == row.external_id
        ).first()
        if existing_tx:
            result.skipped_duplicates += 1
            continue

        customer = _get_or_create_customer(db, row, result)
        status_enum = STATUS_MAP.get(row.status, TransactionStatus.PENDING)

        config = config_map.get(row.product_name)
        product_id = None
        if config and config.type == "frontend":
            p = product_db.get(row.product_name)
            product_id = p.id if p else None
        elif config and config.parent_product_name:
            p = product_db.get(config.parent_product_name)
            product_id = p.id if p else None

        tx = Transaction(
            external_id=row.external_id, platform=platform_enum,
            status=status_enum, amount=row.amount,
            customer_id=customer.id, product_id=product_id,
            product_name=row.product_name, customer_email=row.customer_email,
            utm_source=row.utm_source, utm_medium=row.utm_medium,
            utm_campaign=row.utm_campaign, utm_content=row.utm_content,
            utm_term=row.utm_term, src=row.src,
            checkout_url=row.checkout_code or row.checkout_name,
            created_at=_parse_date(row.created_at),
        )
        db.add(tx)

        if status_enum == TransactionStatus.APPROVED:
            customer.total_spent += row.amount
            customer.total_orders += 1
            now = _parse_date(row.created_at) or _get_saopaulo_time()
            customer.last_purchase_at = now
            if not customer.first_purchase_at:
                customer.first_purchase_at = now

            if product_id:
                _ensure_customer_product(db, customer.id, product_id)

        result.transactions_created += 1


def _get_or_create_customer(
    db: Session, row: ImportRow, result: ImportResultResponse,
) -> Customer:
    customer = db.query(Customer).filter(Customer.email == row.customer_email).first()
    if customer:
        if row.customer_name and not customer.name:
            customer.name = row.customer_name
        if row.customer_cpf and not customer.cpf:
            customer.cpf = row.customer_cpf
        if row.customer_phone and not customer.phone:
            customer.phone = row.customer_phone
        return customer

    customer = Customer(
        email=row.customer_email, name=row.customer_name,
        cpf=row.customer_cpf, phone=row.customer_phone,
        total_spent=0.0, total_orders=0,
    )
    db.add(customer)
    db.flush()
    result.customers_created += 1
    return customer


def _ensure_customer_product(db: Session, customer_id: int, product_id: int):
    exists = db.query(CustomerProduct).filter(
        CustomerProduct.customer_id == customer_id,
        CustomerProduct.product_id == product_id,
    ).first()
    if not exists:
        db.add(CustomerProduct(customer_id=customer_id, product_id=product_id))
        db.flush()
