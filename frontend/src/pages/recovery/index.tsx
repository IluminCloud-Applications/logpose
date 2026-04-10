import { useState, useEffect, useCallback } from "react";
import { RecoveryHeader } from "./components/RecoveryHeader";
import { RecoveryInlineFilters } from "./components/RecoveryInlineFilters";
import { RecoveryKpis } from "./components/RecoveryKpis";
import { RecoveryTable } from "./components/RecoveryTable";
import { ConfigDrawer } from "./components/ConfigDrawer";
import { useRecoveries } from "@/hooks/useRecoveries";
import { useChannelConfigs } from "@/hooks/useChannelConfigs";
import { fetchSalesFilterOptions } from "@/services/sales";
import type { DateRangeState } from "@/components/DateRangeFilter";
import type { ChannelConfig, CustomChannelPayload } from "@/services/recovery";
import type { SalesFilterOptions } from "@/types/sale";

export default function RecoveryPage() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [accountFilter, setAccountFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRangeState>({
    preset: "today", startDate: "", endDate: "",
  });
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState<SalesFilterOptions>({
    products: [], upsells: [], campaigns: [], platforms: [], accounts: [],
  });

  useEffect(() => {
    fetchSalesFilterOptions().then(setFilterOptions).catch(() => {});
  }, []);

  const { data, total, page, setPage, resetPage, isLoading, summary, reload } = useRecoveries({
    preset: dateRange.preset,
    dateStart: dateRange.preset === "custom" ? dateRange.startDate : undefined,
    dateEnd: dateRange.preset === "custom" ? dateRange.endDate : undefined,
    typeFilter,
    statusFilter,
    channelFilter,
    productId: productFilter,
    search: search || undefined,
    accountSlug: accountFilter,
  });

  useEffect(() => {
    resetPage();
  }, [typeFilter, statusFilter, channelFilter, productFilter, accountFilter, dateRange, search, resetPage]);

  const { configs, isSaving, save, addCustom, removeCustom } = useChannelConfigs();

  const handleSaveConfig = useCallback(async (updated: ChannelConfig[]) => {
    await save(updated);
    await reload();
  }, [save, reload]);

  const handleAddCustom = useCallback(async (payload: CustomChannelPayload) => {
    await addCustom(payload);
    await reload();
  }, [addCustom, reload]);

  const handleRemoveCustom = useCallback(async (channel: string) => {
    await removeCustom(channel);
    await reload();
  }, [removeCustom, reload]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <RecoveryHeader
        search={search}
        onSearchChange={setSearch}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onToggleFilters={() => setFiltersOpen((p) => !p)}
        filtersOpen={filtersOpen}
        onOpenConfig={() => setConfigOpen(true)}
      />

      {filtersOpen && (
        <RecoveryInlineFilters
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          channelFilter={channelFilter}
          onChannelChange={setChannelFilter}
          productFilter={productFilter}
          onProductChange={setProductFilter}
          accountFilter={accountFilter}
          onAccountChange={setAccountFilter}
          products={filterOptions.products}
          upsells={filterOptions.upsells}
          accounts={filterOptions.accounts}
          onClose={() => setFiltersOpen(false)}
          channelConfigs={configs}
        />
      )}

      <RecoveryKpis summary={summary} loading={isLoading} />
      <RecoveryTable
        data={data}
        isLoading={isLoading}
        total={total}
        page={page}
        onPageChange={setPage}
        channelConfigs={configs}
      />
      <ConfigDrawer
        open={configOpen}
        onOpenChange={setConfigOpen}
        configs={configs}
        onSave={handleSaveConfig}
        onAddCustom={handleAddCustom}
        onRemoveCustom={handleRemoveCustom}
        isSaving={isSaving}
      />
    </div>
  );
}
