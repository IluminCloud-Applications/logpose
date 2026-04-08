from typing import Optional
from pydantic import BaseModel, EmailStr
from database.models.transaction import TransactionStatus, PaymentPlatform

class StandardizedWebhookEvent(BaseModel):
    """
    Schema padronizado que toda integração de webhook (PayT, Kiwify)
    deve retornar após parsear o payload bruto recebido da plataforma.
    """
    external_id: str
    platform: PaymentPlatform
    status: TransactionStatus
    amount: float
    
    original_status: Optional[str] = None
    payment_method: Optional[str] = None
    payment_status: Optional[str] = None

    # Dados do produto
    product_external_id: str
    product_name: str
    
    # Dados do cliente
    customer_external_id: Optional[str] = None
    customer_email: EmailStr
    customer_name: Optional[str] = None
    customer_cpf: Optional[str] = None
    customer_phone: Optional[str] = None
    
    # Rastreamento / UTMs
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    utm_content: Optional[str] = None
    utm_term: Optional[str] = None
    src: Optional[str] = None

    # Detalhes complementares
    checkout_url: Optional[str] = None
    order_bumps: list[dict] = []
