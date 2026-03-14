import { useEffect, useState } from "react";
import { DashboardHeader } from "./components/DashboardHeader";
import { KpiGrid } from "./components/KpiGrid";
import { RevenueChart } from "./components/RevenueChart";
import { PlatformChart } from "./components/PlatformChart";
import { TopCampaigns } from "./components/TopCampaigns";
import { HourlySalesChart } from "./components/HourlySalesChart";
import { GlobalFilterBar } from "@/components/layout/GlobalFilterBar";
import { useDashboard } from "@/hooks/use-dashboard";
import { fetchCustomersFilterOptions } from "@/services/customers";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data, settings, loading, filters, setFilters, reload } = useDashboard();
  const [products, setProducts] = useState<{ id: number; name: string }[]>([]);
  const [platforms, setPlatforms] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    fetchCustomersFilterOptions().then((opt) => {
      setProducts(opt.products);
      if (opt.platforms) setPlatforms(opt.platforms);
    }).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader onRefresh={reload} />
      <GlobalFilterBar
        filters={filters}
        onFiltersChange={setFilters}
        settings={settings}
        products={products}
        platforms={platforms}
      />
      {loading || !data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <>
          <KpiGrid
            kpis={data.kpis}
            taxEnabled={filters.taxEnabled}
            taxRate={settings?.tax_rate ?? 0}
            opCostsEnabled={filters.opCostsEnabled}
            opCostsTotal={settings?.operational_costs.reduce((s, c) => s + c.amount, 0) ?? 0}
          />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RevenueChart data={data.daily_revenue} />
            </div>
            <PlatformChart data={data.platform_distribution} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <TopCampaigns data={data.top_campaigns} />
            <HourlySalesChart data={data.hourly_sales} />
          </div>
        </>
      )}
    </div>
  );
}
