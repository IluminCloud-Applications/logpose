import { useState } from "react";
import { CompanyHeader } from "./components/CompanyHeader";
import { CompanyKpis } from "./components/CompanyKpis";
import { MonthlyChart } from "./components/MonthlyChart";
import { GrowthForecast } from "./components/GrowthForecast";
import { SettingsDrawer } from "./components/SettingsDrawer";
import { useCompany } from "@/hooks/use-company";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompanyPage() {
  const { settings, dashboard, loading, saving, saveSettings, reload } = useCompany();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (loading || !settings || !dashboard) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-[340px] w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <CompanyHeader onOpenSettings={() => setDrawerOpen(true)} onRefresh={reload} />
      <CompanyKpis
        data={dashboard.monthly}
        settings={settings}
        totalSalesCount={dashboard.total_sales}
        uniqueCustomersCount={dashboard.unique_customers}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MonthlyChart data={dashboard.monthly} settings={settings} />
        </div>
        <GrowthForecast
          data={dashboard.monthly}
          settings={settings}
        />
      </div>

      <SettingsDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        settings={settings}
        onSettingsChange={saveSettings}
        saving={saving}
      />
    </div>
  );
}
