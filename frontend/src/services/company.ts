import { apiRequest } from "./api";
import type { CompanySettings, CompanyDashboard, KpiColorsConfig, AiInstructions } from "@/types/company";

export async function fetchCompanySettings(): Promise<CompanySettings> {
  return apiRequest<CompanySettings>("/company/settings");
}

export async function updateCompanySettings(
  settings: CompanySettings
): Promise<CompanySettings> {
  return apiRequest<CompanySettings>("/company/settings", {
    method: "PUT",
    body: {
      tax_rate: settings.tax_rate,
      operational_costs: settings.operational_costs,
    },
  });
}

export async function fetchCompanyDashboard(year?: number): Promise<CompanyDashboard> {
  const q = year ? `?year=${year}` : "";
  return apiRequest<CompanyDashboard>(`/company/dashboard${q}`);
}

export async function fetchKpiColors(): Promise<KpiColorsConfig> {
  return apiRequest<KpiColorsConfig>("/company/kpi-colors");
}

export async function updateKpiColors(
  colors: KpiColorsConfig
): Promise<KpiColorsConfig> {
  return apiRequest<KpiColorsConfig>("/company/kpi-colors", {
    method: "PUT",
    body: colors,
  });
}

export async function fetchAiInstructions(): Promise<AiInstructions> {
  return apiRequest<AiInstructions>("/company/ai-instructions");
}

export async function updateAiInstructions(
  instructions: AiInstructions
): Promise<AiInstructions> {
  return apiRequest<AiInstructions>("/company/ai-instructions", {
    method: "PUT",
    body: instructions,
  });
}
