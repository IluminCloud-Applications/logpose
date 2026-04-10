/**
 * Utilitário para parsear o valor do filtro de produto.
 * 
 * Valores possíveis:
 * - "all" → sem filtro
 * - "123" → product_id=123
 * - "upsell-456" → upsell_id=456
 */

export interface ProductFilterParams {
  product_id?: number;
  upsell_id?: number;
}

export function parseProductFilterValue(value: string): ProductFilterParams {
  if (value === "all") return {};

  if (value.startsWith("upsell-")) {
    return { upsell_id: Number(value.replace("upsell-", "")) };
  }

  return { product_id: Number(value) };
}
