import { useState, useCallback } from "react";
import type { DashboardOverview } from "@/types/dashboard";
import type { CompanySettings } from "@/types/company";
import { fetchDashboardOverview } from "@/services/dashboard";
import { fetchCompanySettings } from "@/services/company";
import { useCachedQuery } from "./useCachedQuery";

export type DatePreset = "today" | "7d" | "14d" | "30d" | "90d" | "all" | "custom";

export interface DashboardFilters {
  datePreset: DatePreset;
  dateStart: string;
  dateEnd: string;
  product: string;
  platform: string;
  accountSlug: string;
  taxEnabled: boolean;
  opCostsEnabled: boolean;
}

export const dashboardFilterDefaults: DashboardFilters = {
  datePreset: "today",
  dateStart: "",
  dateEnd: "",
  product: "all",
  platform: "all",
  accountSlug: "all",
  taxEnabled: false,
  opCostsEnabled: false,
};

export function useDashboard() {
  const [filters, setFilters] = useState<DashboardFilters>(dashboardFilterDefaults);

  const buildParams = useCallback(() => {
    const p: Record<string, unknown> = {
      preset: filters.datePreset,
    };
    if (filters.datePreset === "custom") {
      p.start_date = filters.dateStart;
      p.end_date = filters.dateEnd;
    }
    if (filters.platform !== "all") p.platform = filters.platform;
    if (filters.product !== "all") p.product_id = Number(filters.product);
    if (filters.accountSlug !== "all") p.account_slug = filters.accountSlug;
    return p;
  }, [filters]);

  const params = buildParams();

  const { data, isLoading: loading, reload } = useCachedQuery<DashboardOverview>({
    cachePrefix: "dashboard",
    params,
    queryFn: () => fetchDashboardOverview(params as Record<string, string | number | undefined>),
  });

  const { data: settings } = useCachedQuery<CompanySettings>({
    cachePrefix: "company-settings",
    queryFn: fetchCompanySettings,
  });

  return { data, settings, loading, filters, setFilters, reload };
}
