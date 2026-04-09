// ── API response types ──────────────────────────────────────

export interface SaleAPI {
  id: number;
  external_id: string;
  platform: "kiwify" | "payt";
  status: "approved" | "refunded" | "chargeback" | "pending" | "trial";
  amount: number;
  customer_email: string | null;
  product_name: string | null;
  product_id: number | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  src: string | null;
  webhook_slug: string | null;
  checkout_url: string | null;
  order_bumps: unknown[] | null;
  created_at: string | null;
}

export interface SalesListResponse {
  total: number;
  page: number;
  per_page: number;
  items: SaleAPI[];
}

export interface SalesSummary {
  total: number;
  approved: number;
  refunded: number;
  chargebacks: number;
  pending: number;
  trial: number;
  revenue: number;
  avg_ticket: number;
}

export interface AccountOption {
  slug: string;
  name: string;
  platform: string;
}

export interface SalesFilterOptions {
  products: { id: number; name: string }[];
  campaigns: string[];
  platforms: { value: string; label: string }[];
  accounts: AccountOption[];
}
