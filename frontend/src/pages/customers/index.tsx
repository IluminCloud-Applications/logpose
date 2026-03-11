import { useState } from "react";
import { CustomersHeader } from "./components/CustomersHeader";
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

  return (
    <div className="flex flex-col gap-6 p-6">
      <CustomersHeader
        filters={filters}
        onFiltersChange={updateFilters}
        filterOptions={filterOptions}
      />
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
