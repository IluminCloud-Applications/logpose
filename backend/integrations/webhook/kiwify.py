from typing import Any, Dict, Optional
import logging
from integrations.webhook.schemas import StandardizedWebhookEvent
from database.models.transaction import TransactionStatus, PaymentPlatform

logger = logging.getLogger(__name__)

def _map_status(webhook_status: str) -> TransactionStatus:
    # Kiwify order_status or status
    status_map = {
        "paid": TransactionStatus.APPROVED,
        "refunded": TransactionStatus.REFUNDED,
        "chargedback": TransactionStatus.CHARGEBACK,
        "chargeback": TransactionStatus.CHARGEBACK,
        "waiting_payment": TransactionStatus.PENDING,
        "abandoned": TransactionStatus.PENDING,
        "refused": TransactionStatus.PENDING,
        "canceled": TransactionStatus.PENDING,
    }
    return status_map.get(webhook_status.lower(), TransactionStatus.PENDING)

def parse_kiwify_webhook(payload: Dict[str, Any]) -> Optional[StandardizedWebhookEvent]:
    """
    Parsea o payload bruto da Kiwify e retorna um formato padronizado.
    Lida com payloads diferentes (ex: order_approved vs abandono).
    """
    try:
        # Existe diferença brutal estrutural entre abandono e pago/recusado.
        
        # Abandono
        if payload.get("status") == "abandoned":
            status = _map_status("abandoned")
            return StandardizedWebhookEvent(
                external_id=payload.get("id", ""),
                platform=PaymentPlatform.KIWIFY,
                status=status,
                amount=0.0,  # abandono as vezes nao traz price total
                product_external_id=payload.get("product_id", ""),
                product_name=payload.get("product_name", ""),
                customer_email=payload.get("email", ""),
                customer_name=payload.get("name", ""),
                customer_cpf=payload.get("cpf", ""),
                customer_phone=payload.get("phone", ""),
                utm_source=None,
                utm_medium=None,
                utm_campaign=None,
                utm_content=None,
                src=None,
                checkout_url=f"https://pay.kiwify.com.br/{payload.get('checkout_link')}" if payload.get("checkout_link") else None,
                order_bumps=[]
            )

        # Paid, Refunded, Chargeback, Waiting_payment, etc..
        order_status = payload.get("order_status", "pending")
        status = _map_status(order_status)
        
        # Valor vem em centavos e pode vir de Commissions ou payment_merchant se diferente
        amount_cents = payload.get("Commissions", {}).get("charge_amount")
        if amount_cents is None:
            amount_cents = 0.0
        amount = float(amount_cents) / 100.0

        product_info = payload.get("Product", {})
        customer_info = payload.get("Customer", {})
        tracking = payload.get("TrackingParameters", {})

        return StandardizedWebhookEvent(
            external_id=payload.get("order_id", ""),
            platform=PaymentPlatform.KIWIFY,
            status=status,
            amount=amount,
            product_external_id=product_info.get("product_id", ""),
            product_name=product_info.get("product_name", ""),
            customer_email=customer_info.get("email", ""),
            customer_name=customer_info.get("full_name", ""),
            customer_cpf=customer_info.get("CPF", ""),
            customer_phone=customer_info.get("mobile", ""),
            utm_source=tracking.get("utm_source"),
            utm_medium=tracking.get("utm_medium"),
            utm_campaign=tracking.get("utm_campaign"),
            utm_content=tracking.get("utm_content"),
            utm_term=tracking.get("utm_term"),
            src=tracking.get("src") or tracking.get("sck"),
            checkout_url=f"https://pay.kiwify.com.br/{payload.get('checkout_link')}" if payload.get("checkout_link") else None,
            order_bumps=payload.get("order_bumps", [])
        )

    except Exception as e:
        logger.error(f"Erro ao parsear webhook da Kiwify: {e}", exc_info=True)
        return None
