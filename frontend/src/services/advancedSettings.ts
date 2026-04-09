import { apiRequest } from "./api";

export interface AdvancedFeatures {
  stripe_enabled: boolean;
}

export interface ResetSalesResult {
  success: boolean;
  deleted: {
    transactions: number;
    recoveries: number;
    customers: number;
    customer_products: number;
  };
}

export async function fetchAdvancedFeatures(): Promise<AdvancedFeatures> {
  return apiRequest<AdvancedFeatures>("/advanced-settings/features");
}

export async function updateAdvancedFeatures(
  features: AdvancedFeatures
): Promise<AdvancedFeatures> {
  return apiRequest<AdvancedFeatures>("/advanced-settings/features", {
    method: "PUT",
    body: features,
  });
}

export async function resetSales(): Promise<ResetSalesResult> {
  return apiRequest<ResetSalesResult>("/advanced-settings/reset-sales", {
    method: "DELETE",
  });
}
