import { apiRequest } from "./api";
import type { SalesListResponse, SalesSummary, SalesFilterOptions } from "@/types/sale";

interface SalesQueryParams {
  preset?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  platform?: string;
  product_id?: number;
  upsell_id?: number;
  campaign?: string;
  search?: string;
  account_slug?: string;
  page?: number;
  per_page?: number;
}

function buildQuery(params: SalesQueryParams): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  if (entries.length === 0) return "";
  return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&");
}

export async function fetchTransactions(params: SalesQueryParams): Promise<SalesListResponse> {
  return apiRequest<SalesListResponse>(`/sales/transactions${buildQuery(params)}`);
}

export async function fetchSalesSummary(params: SalesQueryParams): Promise<SalesSummary> {
  return apiRequest<SalesSummary>(`/sales/summary${buildQuery(params)}`);
}

export async function fetchSalesFilterOptions(): Promise<SalesFilterOptions> {
  return apiRequest<SalesFilterOptions>("/sales/filter-options");
}

export async function deleteSale(transactionId: number): Promise<void> {
  return apiRequest<void>(`/sales/transactions/${transactionId}`, { method: "DELETE" });
}
