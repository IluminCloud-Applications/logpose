from typing import Any, Dict, Optional
import logging
from integrations.webhook.schemas import StandardizedWebhookEvent
from database.models.transaction import TransactionStatus, PaymentPlatform

logger = logging.getLogger(__name__)


def parse_api_webhook(payload: Dict[str, Any]) -> Optional[StandardizedWebhookEvent]:
    """
    Parser para a integração via API direta.
    O payload já deve ser enviado no formato padronizado (StandardizedWebhookEvent),
    portanto apenas valida e converte os campos sem nenhuma transformação.

    POST /api/webhook/api/{slug}
    Body: ver example_api.json na raiz do projeto
    """
    try:
        status_raw = payload.get("status", "")
        try:
            status = TransactionStatus(status_raw.lower())
        except ValueError:
            logger.warning(f"Status desconhecido recebido via API: '{status_raw}'. Usando PENDING.")
            status = TransactionStatus.PENDING

        return StandardizedWebhookEvent(
            external_id=str(payload.get("external_id", "")),
            platform=PaymentPlatform.API,
            status=status,
            amount=float(payload.get("amount", 0.0)),
            product_external_id=str(payload.get("product_external_id", "")),
            product_name=str(payload.get("product_name", "")),
            customer_email=payload.get("customer_email", ""),
            customer_name=payload.get("customer_name"),
            customer_cpf=payload.get("customer_cpf"),
            customer_phone=payload.get("customer_phone"),
            utm_source=payload.get("utm_source"),
            utm_medium=payload.get("utm_medium"),
            utm_campaign=payload.get("utm_campaign"),
            utm_content=payload.get("utm_content"),
            utm_term=payload.get("utm_term"),
            src=payload.get("src"),
            checkout_url=payload.get("checkout_url"),
            order_bumps=payload.get("order_bumps", []),
        )

    except Exception as e:
        logger.error(f"Erro ao parsear webhook via API direta: {e}", exc_info=True)
        return None
