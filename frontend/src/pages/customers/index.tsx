import { useState } from "react";
import { CustomersHeader } from "./components/CustomersHeader";
import { CustomersInlineFilters } from "./components/CustomersInlineFilters";
import { CustomersKpis } from "./components/CustomersKpis";
import { CustomersTable } from "./components/CustomersTable";
import { CustomerDetailModal } from "./components/CustomerDetailModal";
import { useCustomers } from "@/hooks/use-customers";
import type { CustomerAPI } from "@/types/customer";

export default function CustomersPage() {
  const {
    customers, summary, filterOptions, total, page, setPage,
    loading, filters, updateFilters,
  } = useCustomers();
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerAPI | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 p-6">
      <CustomersHeader
        search={filters.search}
        onSearchChange={(v) => updateFilters({ ...filters, search: v })}
        dateRange={filters.dateRange}
        onDateRangeChange={(v) => updateFilters({ ...filters, dateRange: v })}
        onToggleFilters={() => setFiltersOpen((p) => !p)}
        filtersOpen={filtersOpen}
      />

      {filtersOpen && (
        <CustomersInlineFilters
          filters={filters}
          onFiltersChange={updateFilters}
          onClose={() => setFiltersOpen(false)}
          filterOptions={filterOptions}
        />
      )}

      <CustomersKpis summary={summary} loading={loading} />
      <CustomersTable
        data={customers}
        loading={loading}
        total={total}
        page={page}
        onPageChange={setPage}
        onViewCustomer={setSelectedCustomer}
      />
      <CustomerDetailModal
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    </div>
  );
}
