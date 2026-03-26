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
    name: str                           # nome original do CSV (chave de lookup)
    display_name: str | None = None     # nome canônico para criação (modo avançado)
    type: str                           # frontend | upsell | order_bump
    parent_product_name: str | None = None        # legado / modo comum (1 pai)
    parent_product_names: list[str] | None = None  # modo avançado (N pais)
    product_id: int | None = None

    def get_parents(self) -> list[str]:
        """Retorna lista de pais independente do modo (único ou múltiplo)."""
        if self.parent_product_names:
            return self.parent_product_names
        if self.parent_product_name:
            return [self.parent_product_name]
        return []

    def get_canonical_name(self) -> str:
        """Retorna o nome canônico do produto (display_name se definido, senão name)."""
        return self.display_name if self.display_name else self.name


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
