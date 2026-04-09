// ── API response types ──────────────────────────────────────

export interface CustomerAPI {
  id: number;
  external_id: string | null;
  platform: "kiwify" | "payt" | "api" | null;
  name: string | null;
  email: string;
  phone: string | null;
  cpf: string | null;
  total_spent: number;
  total_orders: number;
  products: string[];
  first_purchase_at: string | null;
  last_purchase_at: string | null;
  created_at: string | null;
}

export interface CustomersListResponse {
  total: number;
  page: number;
  per_page: number;
  items: CustomerAPI[];
}

export interface CustomersSummary {
  total_customers: number;
  total_orders: number;
  total_spent: number;
  unique_products: number;
  avg_ticket: number;
}

export interface CustomersFilterOptions {
  products: { id: number; name: string }[];
  platforms: { value: string; label: string }[];
  campaigns: string[];
  sources: string[];
  accounts: { slug: string; name: string; platform: string }[];
}
