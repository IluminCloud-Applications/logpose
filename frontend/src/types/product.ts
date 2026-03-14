// ── API response types ──────────────────────────────────────

export interface ProductAPI {
  id: number;
  name: string;
  created_at: string | null;
}

export interface CheckoutAPI {
  id: number;
  product_id: number;
  url: string;
  price: number;
  platform: "kiwify" | "payt";
  created_at: string | null;
}

export interface OrderBumpAPI {
  id: number;
  product_id: number;
  external_id: string | null;
  name: string;
  price: number;
  created_at: string | null;
}

export interface UpsellAPI {
  id: number;
  product_id: number;
  external_id: string | null;
  name: string;
  price: number;
  created_at: string | null;
}

// ── Stats types ─────────────────────────────────────────────

export interface CheckoutStats {
  id: number;
  url: string;
  price: number;
  sales: number;
  revenue: number;
  abandons: number;
  conversion_rate: number;
}

export interface OrderBumpStats {
  id: number;
  external_id: string | null;
  name: string;
  price: number;
  sales: number;
  revenue: number;
  conversion_rate: number;
}

export interface UpsellStats {
  id: number;
  external_id: string | null;
  name: string;
  price: number;
  sales: number;
  revenue: number;
  conversion_rate: number;
}

export interface ProductStats {
  product_id: number;
  checkouts: CheckoutStats[];
  order_bumps: OrderBumpStats[];
  upsells: UpsellStats[];
}

// ── Merged / view type ──────────────────────────────────────

export interface ProductView {
  id: number;
  name: string;
  checkouts: CheckoutView[];
  orderBumps: OrderBumpView[];
  upsells: UpsellView[];
}

export interface CheckoutView {
  id: number;
  url: string;
  price: number;
  platform: "kiwify" | "payt";
  sales: number;
  revenue: number;
  abandons: number;
  conversionRate: number;
}

export interface OrderBumpView {
  id: number;
  externalId: string | null;
  name: string;
  price: number;
  sales: number;
  revenue: number;
  conversionRate: number;
}

export interface UpsellView {
  id: number;
  externalId: string | null;
  name: string;
  price: number;
  sales: number;
  revenue: number;
  conversionRate: number;
}
