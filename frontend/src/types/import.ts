// ── Preview Response ────────────────────────────────────────

export interface DetectedCheckout {
  code: string | null;
  name: string;
}

export interface DetectedProduct {
  name: string;
  external_id: string;
  ticket: number;
  sales_count: number;
  total_revenue: number;
  checkouts: DetectedCheckout[];
}

export interface ImportPreviewResponse {
  platform: string;
  total_rows: number;
  approved_count: number;
  refunded_count: number;
  pending_count: number;
  unique_customers: number;
  total_revenue: number;
  products: DetectedProduct[];
}

// ── Product Config (enviado no execute) ─────────────────────

export type ProductType = "frontend" | "upsell" | "order_bump";

export interface ProductConfig {
  name: string;           // nome original do CSV (chave de lookup)
  display_name: string | null;  // nome canônico para criação do produto (modo avançado)
  type: ProductType;
  parent_product_name: string | null;
  parent_product_names: string[] | null; // modo avançado: múltiplos pais
  product_id: number | null;
}

// Modo avançado: configuração de um grupo de produtos
export interface SmartGroupConfig {
  /** Nome canônico do produto (após split) */
  groupName: string;
  /** Nomes originais do CSV que fazem parte desse grupo */
  originalNames: string[];
  type: ProductType;
  /** Para upsell/order_bump: lista de grupos pai (nomes canônicos) */
  parentGroups: string[];
  product_id: number | null;
}


// ── Execute Result ──────────────────────────────────────────

export interface ImportResultResponse {
  products_created: number;
  customers_created: number;
  transactions_created: number;
  upsells_created: number;
  order_bumps_created: number;
  skipped_duplicates: number;
  errors: string[];
}

// ── Import modal state ──────────────────────────────────────

export type ImportStep = "platform" | "preview" | "result";

export type ImportPlatform = "kiwify" | "payt";
