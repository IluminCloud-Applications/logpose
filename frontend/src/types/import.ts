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
  name: string;
  type: ProductType;
  parent_product_name: string | null;
  product_id: number | null;  // ID de produto existente para vincular
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
