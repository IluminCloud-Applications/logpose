import { apiRequest } from "./api";
import type { CompanySettings, CompanyDashboard } from "@/types/company";

export async function fetchCompanySettings(): Promise<CompanySettings> {
  return apiRequest<CompanySettings>("/company/settings");
}

export async function updateCompanySettings(
  settings: CompanySettings
): Promise<CompanySettings> {
  return apiRequest<CompanySettings>("/company/settings", {
    method: "PUT",
    body: JSON.stringify({
      tax_rate: settings.tax_rate,
      operational_costs: settings.operational_costs,
    }),
  });
}

export async function fetchCompanyDashboard(year?: number): Promise<CompanyDashboard> {
  const q = year ? `?year=${year}` : "";
  return apiRequest<CompanyDashboard>(`/company/dashboard${q}`);
}
