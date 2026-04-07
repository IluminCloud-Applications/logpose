from typing import Any, Dict, Optional
import logging
from integrations.webhook.schemas import StandardizedWebhookEvent
from database.models.transaction import TransactionStatus, PaymentPlatform

logger = logging.getLogger(__name__)

def _map_status(status: str, payment_status: str) -> TransactionStatus:
    """
    Na PayT, o evento de cancelamento costuma ter status "canceled" e o motivo
    fica em payment_status ("chargeback", "refunded", "refused").
    Se o payment_status vier vazio, avaliamos apenas o status raiz.
    """
    st = payment_status.lower() if payment_status else status.lower()

    if st == "paid" or status.lower() == "paid":
        return TransactionStatus.APPROVED
    elif st == "refunded":
        return TransactionStatus.REFUNDED
    elif st in ["chargeback", "dispute"]:
        return TransactionStatus.CHARGEBACK
    elif st == "trial":
        return TransactionStatus.TRIAL
    
    # cartões recusados, pix gerados sem pagar, abandonos
    return TransactionStatus.PENDING


def parse_payt_webhook(payload: Dict[str, Any]) -> Optional[StandardizedWebhookEvent]:
    """
    Parsea o payload bruto da PayT e retorna o formato padronizado.
    """
    try:
        # Extrair status
        root_status = payload.get("status", "")
        # Em cancelamentos, o real (refunded/chargeback) pode estar no payment_status
        payment_status = payload.get("transaction", {}).get("payment_status", "")
        
        status = _map_status(root_status, payment_status)
        
        # Tratar o ID principal (prioridade para transaction_id, mas se não tiver usa cart_id ou fallback)
        tx_id = payload.get("transaction_id")
        if not tx_id:
            tx_id = payload.get("cart_id", "")
        
        # Amount: buscar comissão do producer (quanto vamos receber), não total_price (quanto o cliente pagou)
        amount_cents = 0.0
        commissions = payload.get("commission", [])
        for comm in commissions:
            if comm.get("type") == "producer":
                amount_cents = comm.get("amount", 0.0)
                break
            
        amount = float(amount_cents) / 100.0

        product = payload.get("product", {})
        customer = payload.get("customer", {})
        
        # Para Rastreamento: link.sources ou link.query_params ou origin.query_params
        link = payload.get("link", {})
        sources = link.get("sources", {})
        # As vezes eles jogam nos arrays originais invés de string
        def extract_param(key: str) -> Optional[str]:
            val = None
            if isinstance(sources, dict):
                val = sources.get(key)
                
            if not val:
                qp = link.get("query_params", {})
                if isinstance(qp, dict):
                    val = qp.get(key)
                    
            return str(val) if val else None

        return StandardizedWebhookEvent(
            external_id=str(tx_id),
            platform=PaymentPlatform.PAYT,
            status=status,
            amount=amount,
            product_external_id=product.get("code", ""),
            product_name=product.get("name", ""),
            customer_email=customer.get("email", ""),
            customer_name=customer.get("name", ""),
            customer_cpf=customer.get("doc", ""),
            customer_phone=customer.get("phone", ""),
            utm_source=extract_param("utm_source"),
            utm_medium=extract_param("utm_medium"),
            utm_campaign=extract_param("utm_campaign"),
            utm_content=extract_param("utm_content"),
            utm_term=extract_param("utm_term"),
            src=extract_param("src") or extract_param("sck"),
            checkout_url=link.get("url"),
            order_bumps=payload.get("order_bumps", [])
        )

    except Exception as e:
        logger.error(f"Erro ao parsear webhook da PayT: {e}", exc_info=True)
        return None
