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
  name: string; external_id: string; ticket: number; ideal_cpa: number | null; platform: string;
}): Promise<ProductAPI> {
  return apiRequest<ProductAPI>("/products", { method: "POST", body: data });
}

export async function deleteProduct(id: number): Promise<void> {
  return apiRequest(`/products/${id}`, { method: "DELETE" });
}

// ── Items CRUD ──────────────────────────────────────────────

export async function createCheckout(productId: number, data: { url: string; price: number }): Promise<CheckoutAPI> {
  return apiRequest(`/products/${productId}/checkouts`, { method: "POST", body: data });
}

export async function deleteCheckout(productId: number, itemId: number): Promise<void> {
  return apiRequest(`/products/${productId}/checkouts/${itemId}`, { method: "DELETE" });
}

export async function createOrderBump(productId: number, data: { external_id?: string; name: string; price: number }): Promise<OrderBumpAPI> {
  return apiRequest(`/products/${productId}/order-bumps`, { method: "POST", body: data });
}

export async function deleteOrderBump(productId: number, itemId: number): Promise<void> {
  return apiRequest(`/products/${productId}/order-bumps/${itemId}`, { method: "DELETE" });
}

export async function createUpsell(productId: number, data: { external_id?: string; name: string; price: number }): Promise<UpsellAPI> {
  return apiRequest(`/products/${productId}/upsells`, { method: "POST", body: data });
}

export async function deleteUpsell(productId: number, itemId: number): Promise<void> {
  return apiRequest(`/products/${productId}/upsells/${itemId}`, { method: "DELETE" });
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
        id: c.id, url: c.url, price: c.price,
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
      externalId: product.external_id,
      name: product.name,
      ticket: product.ticket,
      idealCpa: product.ideal_cpa ?? 0,
      platform: product.platform,
      checkouts,
      orderBumps,
      upsells,
    });
  }

  return views;
}
