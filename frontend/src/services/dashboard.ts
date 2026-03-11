import { apiRequest } from "./api";
import type { DashboardOverview } from "@/types/dashboard";

interface DashboardParams {
  preset?: string;
  start_date?: string;
  end_date?: string;
  platform?: string;
  product_id?: number;
}

function buildQuery(params: DashboardParams): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  if (entries.length === 0) return "";
  return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&");
}

export async function fetchDashboardOverview(params: DashboardParams): Promise<DashboardOverview> {
  return apiRequest<DashboardOverview>(`/dashboard/overview${buildQuery(params)}`);
}
