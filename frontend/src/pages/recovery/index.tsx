import { useState, useEffect, useCallback } from "react";
import { RecoveryHeader } from "./components/RecoveryHeader";
import { RecoveryInlineFilters } from "./components/RecoveryInlineFilters";
import { RecoveryKpis } from "./components/RecoveryKpis";
import { RecoveryTable } from "./components/RecoveryTable";
import { ConfigDrawer } from "./components/ConfigDrawer";
import { useRecoveries } from "@/hooks/useRecoveries";
import { useChannelConfigs } from "@/hooks/useChannelConfigs";
import type { DateRangeState } from "@/components/DateRangeFilter";

export default function RecoveryPage() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRangeState>({
    preset: "today", startDate: "", endDate: "",
  });
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  const { data, total, page, setPage, resetPage, isLoading, reload } = useRecoveries({
    preset: dateRange.preset,
    dateStart: dateRange.preset === "custom" ? dateRange.startDate : undefined,
    dateEnd: dateRange.preset === "custom" ? dateRange.endDate : undefined,
    typeFilter,
    statusFilter,
    channelFilter,
    search: search || undefined,
  });

  useEffect(() => {
    resetPage();
  }, [typeFilter, statusFilter, channelFilter, dateRange, search, resetPage]);

  const { configs, isSaving, save } = useChannelConfigs();

  const handleSaveConfig = useCallback(async (updated: import("@/services/recovery").ChannelConfig[]) => {
    await save(updated);
    await reload();
  }, [save, reload]);

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
          onClose={() => setFiltersOpen(false)}
        />
      )}

      <RecoveryKpis data={data} />
      <RecoveryTable
        data={data}
        isLoading={isLoading}
        total={total}
        page={page}
        onPageChange={setPage}
      />
      <ConfigDrawer
        open={configOpen}
        onOpenChange={setConfigOpen}
        configs={configs}
        onSave={handleSaveConfig}
        isSaving={isSaving}
      />
    </div>
  );
}
