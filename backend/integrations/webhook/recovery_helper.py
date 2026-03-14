from sqlalchemy.orm import Session

from integrations.webhook.schemas import StandardizedWebhookEvent
from database.models.customer import Customer
from database.models.transaction import TransactionStatus
from database.models.recovery import Recovery, RecoveryType, RecoveryChannel
from database.models.recovery_channel_config import RecoveryChannelConfig
from database.core.timezone import now_sp


def classify_recovery_channel(
    src: str | None, db: Session,
) -> RecoveryChannel:
    """Classifica o canal de recuperação baseado no src e nas configs salvas."""
    if not src:
        return RecoveryChannel.OTHER

    configs = db.query(RecoveryChannelConfig).all()
    src_lower = src.lower()
    for cfg in configs:
        if cfg.keyword and cfg.keyword.lower() in src_lower:
            try:
                return RecoveryChannel(cfg.channel)
            except ValueError:
                pass
    return RecoveryChannel.OTHER


def classify_recovery_type(event: StandardizedWebhookEvent) -> RecoveryType:
    """Classifica o tipo de recuperação baseado nos dados do evento."""
    if event.amount == 0:
        return RecoveryType.ABANDONED_CART
    return RecoveryType.ABANDONED_CART


def create_recovery_if_pending(
    db: Session,
    event: StandardizedWebhookEvent,
    customer: Customer,
):
    """Cria um registro de recuperação se a transação é pendente."""
    if event.status != TransactionStatus.PENDING:
        return

    existing = db.query(Recovery).filter(
        Recovery.customer_email == event.customer_email,
        Recovery.product_name == event.product_name,
        Recovery.recovered.is_(False),
    ).first()

    if existing:
        return

    channel = classify_recovery_channel(event.src, db)
    recovery_type = classify_recovery_type(event)

    recovery = Recovery(
        customer_id=customer.id,
        customer_name=event.customer_name,
        customer_email=event.customer_email,
        product_name=event.product_name,
        type=recovery_type,
        amount=event.amount,
        recovered=False,
        channel=channel,
        src=event.src,
    )
    db.add(recovery)


def mark_recovery_as_recovered(
    db: Session,
    customer_email: str,
    product_name: str,
):
    """Marca uma recovery pendente como recuperada quando a venda é aprovada."""
    pending_recovery = db.query(Recovery).filter(
        Recovery.customer_email == customer_email,
        Recovery.product_name == product_name,
        Recovery.recovered.is_(False),
    ).first()
    if pending_recovery:
        pending_recovery.recovered = True
        pending_recovery.recovered_at = now_sp()
