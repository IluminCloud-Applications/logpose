import logging
from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session

from database.core.connection import get_db
from database.models.webhook_endpoint import WebhookEndpoint, WebhookPlatform
from integrations.webhook.kiwify import parse_kiwify_webhook
from integrations.webhook.payt import parse_payt_webhook
from integrations.webhook.api_direct import parse_api_webhook
from integrations.webhook.processor import process_webhook_event
from integrations.webhook.test_emails import is_test_email

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhook", tags=["webhook-receiver"])

PARSERS = {
    WebhookPlatform.KIWIFY: parse_kiwify_webhook,
    WebhookPlatform.PAYT: parse_payt_webhook,
    WebhookPlatform.API: parse_api_webhook,
}


@router.post("/{platform}/{slug}")
async def receive_webhook(
    platform: str,
    slug: str,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Endpoint público que recebe os POSTs das plataformas de pagamento.
    Não requer autenticação — as plataformas enviam direto.
    URL: POST /api/webhook/kiwify/{slug} | /api/webhook/payt/{slug} | /api/webhook/api/{slug}
    """
    # Validar plataforma
    platform_lower = platform.lower()
    try:
        platform_enum = WebhookPlatform(platform_lower)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Plataforma '{platform}' inválida")

    # Buscar o endpoint pelo slug + plataforma
    endpoint = (
        db.query(WebhookEndpoint)
        .filter(
            WebhookEndpoint.slug == slug,
            WebhookEndpoint.platform == platform_enum,
        )
        .first()
    )

    if not endpoint:
        raise HTTPException(
            status_code=404,
            detail=f"Webhook endpoint '{slug}' não encontrado para '{platform}'",
        )

    # Ler o body do POST
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Payload JSON inválido")

    logger.info(f"Webhook recebido: {platform}/{slug} | Endpoint: {endpoint.name}")

    # Parsear com o parser correto
    parser = PARSERS.get(platform_enum)
    if not parser:
        raise HTTPException(status_code=400, detail="Parser não disponível")

    event = parser(payload)
    if not event:
        raise HTTPException(
            status_code=422,
            detail="Não foi possível processar o payload recebido",
        )

    # Ignorar emails de teste das plataformas (PayT: yoda@testsuser.com, Kiwify: johndoe@example.com)
    if is_test_email(event.customer_email):
        logger.info(f"Webhook ignorado: email de teste ({event.customer_email})")
        return {"status": "ok", "message": "Webhook de teste ignorado"}

    # Injetar o slug do endpoint para identificar a conta de origem
    event.webhook_slug = slug

    # Processar o evento (salvar transação, customer, etc.)
    process_webhook_event(db, event)

    return {"status": "ok", "message": "Webhook processado com sucesso"}
