import { useState } from "react";
import { RefundsHeader } from "./components/RefundsHeader";
import { RefundsKpis } from "./components/RefundsKpis";
import { RefundsTable } from "./components/RefundsTable";
import { RefundsInlineFilters } from "./components/RefundsInlineFilters";
import { TopReasonsCard } from "./components/TopReasonsCard";
import { ReasonModal } from "./components/ReasonModal";
import { useRefunds } from "@/hooks/useRefunds";
import type { RefundItem } from "@/services/refunds";

export default function RefundsPage() {
  const {
    refunds, total, summary, reasonStats,
    page, setPage, loading, filters, updateFilters, reload,
  } = useRefunds();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RefundItem | null>(null);

  return (
    <div className="flex flex-col gap-6 p-6">
      <RefundsHeader
        search={filters.search}
        onSearchChange={(v) => updateFilters({ ...filters, search: v })}
        onToggleFilters={() => setFiltersOpen((p) => !p)}
        filtersOpen={filtersOpen}
        dateRange={filters.dateRange}
        onDateRangeChange={(v) => updateFilters({ ...filters, dateRange: v })}
      />

      {filtersOpen && (
        <RefundsInlineFilters
          filters={filters}
          onFiltersChange={updateFilters}
          onClose={() => setFiltersOpen(false)}
        />
      )}

      <RefundsKpis summary={summary ?? undefined} loading={loading} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <RefundsTable
          data={refunds}
          loading={loading}
          total={total}
          page={page}
          onPageChange={setPage}
          onAddReason={setSelectedItem}
        />
        <TopReasonsCard data={reasonStats} />
      </div>

      <ReasonModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onSaved={reload}
      />
    </div>
  );
}
