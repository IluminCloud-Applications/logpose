import { apiRequest } from "./api";
import type {
  ProductAPI, CheckoutAPI, OrderBumpAPI, UpsellAPI,
  ProductStats, ProductView, CheckoutView, OrderBumpView, UpsellView,
} from "@/types/product";

// ── Products CRUD ───────────────────────────────────────────

export async function fetchProducts(): Promise<ProductAPI[]> {
  return apiRequest<ProductAPI[]>("/products");
}

export async function createProduct(data: {
  name: string;
  logo_url?: string | null;
}): Promise<ProductAPI> {
  return apiRequest<ProductAPI>("/products", { method: "POST", body: data });
}

export async function deleteProduct(id: number): Promise<void> {
  return apiRequest(`/products/${id}`, { method: "DELETE" });
}

export async function updateProduct(
  id: number,
  data: { name?: string; logo_url?: string | null },
): Promise<ProductAPI> {
  return apiRequest<ProductAPI>(`/products/${id}`, { method: "PUT", body: data });
}

// ── Items CRUD ──────────────────────────────────────────────

export async function createCheckout(
  productId: number,
  data: { url: string; price: number; platform: string; checkout_code?: string | null; name?: string | null },
): Promise<CheckoutAPI> {
  return apiRequest(`/products/${productId}/checkouts`, { method: "POST", body: data });
}

export async function deleteCheckout(productId: number, itemId: number): Promise<void> {
  return apiRequest(`/products/${productId}/checkouts/${itemId}`, { method: "DELETE" });
}

export async function updateCheckout(
  productId: number, itemId: number,
  data: { url?: string; price?: number; platform?: string; checkout_code?: string | null; name?: string | null },
): Promise<CheckoutAPI> {
  return apiRequest(`/products/${productId}/checkouts/${itemId}`, { method: "PUT", body: data });
}

export async function createOrderBump(productId: number, data: { external_id?: string; name: string; price: number }): Promise<OrderBumpAPI> {
  return apiRequest(`/products/${productId}/order-bumps`, { method: "POST", body: data });
}

export async function deleteOrderBump(productId: number, itemId: number): Promise<void> {
  return apiRequest(`/products/${productId}/order-bumps/${itemId}`, { method: "DELETE" });
}

export async function updateOrderBump(
  productId: number, itemId: number,
  data: { external_id?: string; name?: string; price?: number },
): Promise<OrderBumpAPI> {
  return apiRequest(`/products/${productId}/order-bumps/${itemId}`, { method: "PUT", body: data });
}

export async function createUpsell(productId: number, data: { external_id?: string; name: string; price: number }): Promise<UpsellAPI> {
  return apiRequest(`/products/${productId}/upsells`, { method: "POST", body: data });
}

export async function deleteUpsell(productId: number, itemId: number): Promise<void> {
  return apiRequest(`/products/${productId}/upsells/${itemId}`, { method: "DELETE" });
}

export async function updateUpsell(
  productId: number, itemId: number,
  data: { external_id?: string; name?: string; price?: number },
): Promise<UpsellAPI> {
  return apiRequest(`/products/${productId}/upsells/${itemId}`, { method: "PUT", body: data });
}

// ── Fetch items for a product ───────────────────────────────

export async function fetchCheckouts(productId: number): Promise<CheckoutAPI[]> {
  return apiRequest(`/products/${productId}/checkouts`);
}

export async function fetchOrderBumps(productId: number): Promise<OrderBumpAPI[]> {
  return apiRequest(`/products/${productId}/order-bumps`);
}

export async function fetchUpsells(productId: number): Promise<UpsellAPI[]> {
  return apiRequest(`/products/${productId}/upsells`);
}

// ── Stats ───────────────────────────────────────────────────

export async function fetchProductStats(): Promise<ProductStats[]> {
  return apiRequest<ProductStats[]>("/products/stats");
}

// ── Aliases ─────────────────────────────────────────────────

export interface AliasAPI {
  id: number;
  product_id: number;
  alias: string;
  created_at: string | null;
}

export async function fetchAliases(productId: number): Promise<AliasAPI[]> {
  return apiRequest<AliasAPI[]>(`/products/${productId}/aliases`);
}

export async function createAlias(productId: number, alias: string): Promise<AliasAPI> {
  return apiRequest<AliasAPI>(`/products/${productId}/aliases`, {
    method: "POST",
    body: { alias },
  });
}

export async function deleteAlias(productId: number, aliasId: number): Promise<void> {
  return apiRequest(`/products/${productId}/aliases/${aliasId}`, { method: "DELETE" });
}

// ── Merge products + items + stats into view models ─────────

export async function fetchProductsWithStats(): Promise<ProductView[]> {
  const [products, stats] = await Promise.all([
    fetchProducts(),
    fetchProductStats(),
  ]);

  const views: ProductView[] = [];

  for (const product of products) {
    const [checkoutsRaw, obRaw, upsellsRaw] = await Promise.all([
      fetchCheckouts(product.id),
      fetchOrderBumps(product.id),
      fetchUpsells(product.id),
    ]);

    const productStat = stats.find((s) => s.product_id === product.id);

    const checkouts: CheckoutView[] = checkoutsRaw.map((c) => {
      const stat = productStat?.checkouts.find((s) => s.id === c.id);
      return {
        id: c.id, url: c.url, price: c.price, platform: c.platform,
        checkoutCode: c.checkout_code, name: c.name,
        sales: stat?.sales ?? 0, revenue: stat?.revenue ?? 0,
        abandons: stat?.abandons ?? 0, conversionRate: stat?.conversion_rate ?? 0,
      };
    });

    const orderBumps: OrderBumpView[] = obRaw.map((ob) => {
      const stat = productStat?.order_bumps.find((s) => s.id === ob.id);
      return {
        id: ob.id, externalId: ob.external_id, name: ob.name, price: ob.price,
        sales: stat?.sales ?? 0, revenue: stat?.revenue ?? 0,
        conversionRate: stat?.conversion_rate ?? 0,
      };
    });

    const upsells: UpsellView[] = upsellsRaw.map((up) => {
      const stat = productStat?.upsells.find((s) => s.id === up.id);
      return {
        id: up.id, externalId: up.external_id, name: up.name, price: up.price,
        sales: stat?.sales ?? 0, revenue: stat?.revenue ?? 0,
        conversionRate: stat?.conversion_rate ?? 0,
      };
    });

    views.push({
      id: product.id,
      name: product.name,
      logoUrl: product.logo_url,
      checkouts,
      orderBumps,
      upsells,
    });
  }

  return views;
}
