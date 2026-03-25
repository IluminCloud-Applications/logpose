from pydantic import BaseModel


class ImportRow(BaseModel):
    """Linha padronizada que ambos os parsers (Kiwify/PayT) produzem."""
    external_id: str
    status: str  # approved | refunded | chargeback | pending
    product_name: str
    product_external_id: str
    product_ticket: float
    amount: float
    customer_name: str | None = None
    customer_email: str
    customer_cpf: str | None = None
    customer_phone: str | None = None
    checkout_name: str | None = None
    checkout_code: str | None = None
    utm_source: str | None = None
    utm_medium: str | None = None
    utm_campaign: str | None = None
    utm_content: str | None = None
    utm_term: str | None = None
    src: str | None = None
    created_at: str | None = None


class DetectedCheckout(BaseModel):
    """Checkout detectado dentro de um produto no CSV/XLSX."""
    code: str | None = None
    name: str


class DetectedProduct(BaseModel):
    """Produto detectado no CSV/XLSX durante o preview."""
    name: str
    external_id: str
    ticket: float
    sales_count: int
    total_revenue: float
    checkouts: list[DetectedCheckout]


class ProductConfig(BaseModel):
    """Configuração do usuário para cada produto detectado."""
    name: str
    type: str  # frontend | upsell | order_bump
    parent_product_name: str | None = None
    product_id: int | None = None  # ID de produto existente para vincular


class ImportPreviewResponse(BaseModel):
    platform: str
    total_rows: int
    approved_count: int
    refunded_count: int
    pending_count: int
    unique_customers: int
    total_revenue: float
    products: list[DetectedProduct]


class ImportResultResponse(BaseModel):
    products_created: int
    customers_created: int
    transactions_created: int
    upsells_created: int
    order_bumps_created: int
    skipped_duplicates: int
    errors: list[str]
