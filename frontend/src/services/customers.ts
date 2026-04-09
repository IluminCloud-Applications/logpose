import { apiRequest } from "./api";
import type {
  CustomersListResponse, CustomersSummary, CustomersFilterOptions,
} from "@/types/customer";

interface CustomersQueryParams {
  preset?: string;
  start_date?: string;
  end_date?: string;
  platform?: string;
  product_id?: number;
  campaign?: string;
  src?: string;
  search?: string;
  account_slug?: string;
  page?: number;
  per_page?: number;
}

function buildQuery(params: CustomersQueryParams): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  if (entries.length === 0) return "";
  return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&");
}

export async function fetchCustomers(params: CustomersQueryParams): Promise<CustomersListResponse> {
  return apiRequest<CustomersListResponse>(`/customers${buildQuery(params)}`);
}

export async function fetchCustomersSummary(params: CustomersQueryParams): Promise<CustomersSummary> {
  return apiRequest<CustomersSummary>(`/customers/summary${buildQuery(params)}`);
}

export async function fetchCustomersFilterOptions(): Promise<CustomersFilterOptions> {
  return apiRequest<CustomersFilterOptions>("/customers/filter-options");
}
