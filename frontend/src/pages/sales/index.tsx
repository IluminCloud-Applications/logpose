import { SalesHeader } from "./components/SalesHeader";
import { SalesKpis } from "./components/SalesKpis";
import { SalesTable } from "./components/SalesTable";
import { SalesInlineFilters } from "./components/SalesInlineFilters";
import { useSales } from "@/hooks/use-sales";
import { useState } from "react";

export default function SalesPage() {
  const { sales, summary, filterOptions, total, page, setPage, loading, filters, updateFilters, reload } = useSales();
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 p-6">
      <SalesHeader
        search={filters.search}
        onSearchChange={(v) => updateFilters({ ...filters, search: v })}
        onToggleFilters={() => setFiltersOpen((p) => !p)}
        filtersOpen={filtersOpen}
        dateRange={filters.dateRange}
        onDateRangeChange={(v) => updateFilters({ ...filters, dateRange: v })}
      />

      {filtersOpen && (
        <SalesInlineFilters
          filters={filters}
          onFiltersChange={updateFilters}
          onClose={() => setFiltersOpen(false)}
          filterOptions={filterOptions}
        />
      )}

      <SalesKpis summary={summary} loading={loading} />

      <SalesTable
        data={sales}
        loading={loading}
        total={total}
        page={page}
        onPageChange={setPage}
        onSaleDeleted={reload}
      />
    </div>
  );
}
