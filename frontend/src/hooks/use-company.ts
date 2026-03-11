import { useState, useCallback } from "react";
import type { CompanySettings, CompanyDashboard } from "@/types/company";
import {
  fetchCompanySettings, updateCompanySettings, fetchCompanyDashboard,
} from "@/services/company";
import { useCachedQuery } from "./useCachedQuery";
import { invalidateCacheByPrefix } from "@/lib/queryCache";

export function useCompany() {
  const [saving, setSaving] = useState(false);

  const {
    data: settings,
    isLoading: settingsLoading,
    reload: reloadSettings,
  } = useCachedQuery<CompanySettings>({
    cachePrefix: "company-settings",
    queryFn: fetchCompanySettings,
  });

  const {
    data: dashboard,
    isLoading: dashboardLoading,
    reload: reloadDashboard,
  } = useCachedQuery<CompanyDashboard>({
    cachePrefix: "company-dashboard",
    queryFn: fetchCompanyDashboard,
  });

  const loading = settingsLoading || dashboardLoading;

  const reload = useCallback(async () => {
    await Promise.all([reloadSettings(), reloadDashboard()]);
  }, [reloadSettings, reloadDashboard]);

  const saveSettings = async (next: CompanySettings) => {
    setSaving(true);
    try {
      await updateCompanySettings(next);
      // Invalidate caches that depend on company settings
      invalidateCacheByPrefix("company-settings");
      invalidateCacheByPrefix("dashboard");
      await reloadSettings();
    } catch {
      // handled by api interceptor
    } finally {
      setSaving(false);
    }
  };

  return { settings, dashboard, loading, saving, saveSettings, reload };
}
