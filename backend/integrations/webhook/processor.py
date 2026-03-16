import logging
from sqlalchemy.orm import Session

from integrations.webhook.schemas import StandardizedWebhookEvent
from database.models.customer import Customer
from database.models.transaction import Transaction, TransactionStatus
from database.models.product import Product
from database.models.customer_product import CustomerProduct
from database.core.timezone import now_sp
from integrations.webhook.recovery_helper import (
    create_recovery_if_pending,
    mark_recovery_as_recovered,
)

logger = logging.getLogger(__name__)


def get_saopaulo_time():
    """Helper para pegar o tempo exato de São Paulo."""
    return now_sp()


def process_webhook_event(db: Session, event: StandardizedWebhookEvent):
    """
    Processa um evento padronizado de webhook, atualizando as tabelas:
    1. Customer (cria ou atualiza saldos se for compra aprovada)
    2. Transaction (registra a transação com suas utms)
    3. CustomerProduct (libera o produto para o usuário se não tinha e se for aprovada)
    4. Recovery (cria registro de recuperação se for pendente)
    """
    logger.info(f"Processando webhook event: {event.external_id} | Status: {event.status}")
    
    # -------------------------------------------------------------
    # 1. PROCESSAMENTO DO CUSTOMER
    # -------------------------------------------------------------
    customer = db.query(Customer).filter(Customer.email == event.customer_email).first()
    
    if not customer:
        customer = Customer(
            email=event.customer_email,
            name=event.customer_name,
            cpf=event.customer_cpf,
            phone=event.customer_phone,
            total_spent=0.0,
            total_orders=0
        )
        db.add(customer)
        db.flush()
    else:
        if event.customer_name and not customer.name:
            customer.name = event.customer_name
        if event.customer_cpf and not customer.cpf:
            customer.cpf = event.customer_cpf
        if event.customer_phone and not customer.phone:
            customer.phone = event.customer_phone

    # -------------------------------------------------------------
    # 2. SE A TRANSAÇÃO JÁ EXISTIR
    # -------------------------------------------------------------
    existing_tx = db.query(Transaction).filter(Transaction.external_id == event.external_id).first()
    
    if existing_tx:
        logger.info(f"Transação {event.external_id} já existia. Status: {existing_tx.status} -> {event.status}")
        is_newly_approved = existing_tx.status != TransactionStatus.APPROVED and event.status == TransactionStatus.APPROVED
        is_newly_refunded = existing_tx.status == TransactionStatus.APPROVED and event.status in [TransactionStatus.REFUNDED, TransactionStatus.CHARGEBACK]
        
        existing_tx.status = event.status
        
        if is_newly_approved:
            customer.total_spent += event.amount
            customer.total_orders += 1
            customer.last_purchase_at = get_saopaulo_time()
            if not customer.first_purchase_at:
                customer.first_purchase_at = customer.last_purchase_at
            mark_recovery_as_recovered(db, event.customer_email, event.product_name)
                
        elif is_newly_refunded:
            customer.total_spent -= existing_tx.amount
            customer.total_orders -= 1
            if customer.total_orders < 0:
                customer.total_orders = 0
            if customer.total_spent < 0:
                customer.total_spent = 0.0

        create_recovery_if_pending(db, event, customer)
        db.commit()
        return existing_tx
    
    # -------------------------------------------------------------
    # 3. TRANSAÇÃO NOVA
    # -------------------------------------------------------------
    if event.status == TransactionStatus.APPROVED:
        customer.total_spent += event.amount
        customer.total_orders += 1
        customer.last_purchase_at = get_saopaulo_time()
        if not customer.first_purchase_at:
            customer.first_purchase_at = customer.last_purchase_at

    product = db.query(Product).filter(Product.name == event.product_name).first()
    product_id_to_save = product.id if product else None
    
    new_tx = Transaction(
        external_id=event.external_id,
        platform=event.platform,
        status=event.status,
        amount=event.amount,
        customer_id=customer.id,
        product_id=product_id_to_save,
        product_name=event.product_name,
        customer_email=customer.email,
        utm_source=event.utm_source,
        utm_medium=event.utm_medium,
        utm_campaign=event.utm_campaign,
        utm_content=event.utm_content,
        utm_term=event.utm_term,
        src=event.src,
        checkout_url=event.checkout_url,
        order_bumps=event.order_bumps
    )
    db.add(new_tx)
    
    # -------------------------------------------------------------
    # 4. LIBERAR ACESSO AO PRODUTO (Junction CustomerProduct)
    # -------------------------------------------------------------
    if product and event.status == TransactionStatus.APPROVED:
        already_has = db.query(CustomerProduct).filter(
            CustomerProduct.customer_id == customer.id,
            CustomerProduct.product_id == product.id
        ).first()
        
        if not already_has:
            new_cp = CustomerProduct(
                customer_id=customer.id,
                product_id=product.id,
            )
            db.add(new_cp)

    # -------------------------------------------------------------
    # 5. CRIAR RECOVERY SE PENDENTE
    # -------------------------------------------------------------
    create_recovery_if_pending(db, event, customer)
    
    db.commit()
    logger.info(f"Webhook processado com sucesso. Transação: {new_tx.id}")
    return new_tx
