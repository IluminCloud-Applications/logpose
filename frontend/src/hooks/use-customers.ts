import { useState, useEffect, useCallback } from "react";
import type { CustomerAPI, CustomersSummary, CustomersFilterOptions } from "@/types/customer";
import type { DateRangeState } from "@/components/DateRangeFilter";
import {
  fetchCustomers, fetchCustomersSummary, fetchCustomersFilterOptions,
} from "@/services/customers";
import { useCachedQuery } from "./useCachedQuery";

export interface CustomersFilters {
  dateRange: DateRangeState;
  platform: string;
  productId: string;
  campaign: string;
  src: string;
  accountSlug: string;
  search: string;
}

export const defaultCustomersFilters: CustomersFilters = {
  dateRange: { preset: "today", startDate: "", endDate: "" },
  platform: "all",
  productId: "all",
  campaign: "all",
  src: "",
  accountSlug: "all",
  search: "",
};

export function useCustomers() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<CustomersFilters>(defaultCustomersFilters);
  const [filterOptions, setFilterOptions] = useState<CustomersFilterOptions>({
    products: [], platforms: [], campaigns: [], sources: [], accounts: [],
  });

  const buildParams = useCallback(() => {
    const p: Record<string, unknown> = {
      preset: filters.dateRange.preset,
      page,
      per_page: 12,
    };
    if (filters.dateRange.preset === "custom") {
      p.start_date = filters.dateRange.startDate;
      p.end_date = filters.dateRange.endDate;
    }
    if (filters.platform !== "all") p.platform = filters.platform;
    if (filters.productId !== "all") p.product_id = Number(filters.productId);
    if (filters.campaign !== "all") p.campaign = filters.campaign;
    if (filters.src) p.src = filters.src;
    if (filters.accountSlug !== "all") p.account_slug = filters.accountSlug;
    if (filters.search) p.search = filters.search;
    return p;
  }, [filters, page]);

  const params = buildParams();

  const buildSummaryParams = useCallback(() => {
    const p: Record<string, unknown> = {
      preset: filters.dateRange.preset,
    };
    if (filters.dateRange.preset === "custom") {
      p.start_date = filters.dateRange.startDate;
      p.end_date = filters.dateRange.endDate;
    }
    if (filters.platform !== "all") p.platform = filters.platform;
    if (filters.productId !== "all") p.product_id = Number(filters.productId);
    if (filters.campaign !== "all") p.campaign = filters.campaign;
    if (filters.accountSlug !== "all") p.account_slug = filters.accountSlug;
    if (filters.search) p.search = filters.search;
    return p;
  }, [filters]);

  const { data: listData, isLoading: loading, reload: reloadList } = useCachedQuery<{
    items: CustomerAPI[];
    total: number;
  }>({
    cachePrefix: "customers-list",
    params,
    queryFn: () => fetchCustomers(params as Record<string, string | number | undefined>),
  });

  const sumParams = buildSummaryParams();
  const { data: summary, reload: reloadSummary } = useCachedQuery<CustomersSummary>({
    cachePrefix: "customers-summary",
    params: sumParams,
    queryFn: () => fetchCustomersSummary(sumParams as Record<string, string | number | undefined>),
  });

  useEffect(() => {
    fetchCustomersFilterOptions().then(setFilterOptions).catch(() => {});
  }, []);

  const updateFilters = (next: CustomersFilters) => {
    setPage(1);
    setFilters(next);
  };

  const reload = useCallback(async () => {
    await Promise.all([reloadList(), reloadSummary()]);
  }, [reloadList, reloadSummary]);

  return {
    customers: listData?.items ?? [],
    summary,
    filterOptions,
    total: listData?.total ?? 0,
    page,
    setPage,
    loading,
    filters,
    updateFilters,
    reload,
  };
}

