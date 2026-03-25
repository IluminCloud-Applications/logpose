import { apiRequest } from "./api";

export interface AdvancedFeatures {
  stripe_enabled: boolean;
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
