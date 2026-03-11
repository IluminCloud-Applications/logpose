import { useState, useCallback } from "react";
import { useCachedQuery } from "./useCachedQuery";
import {
  fetchRecoveries,
  type RecoveryListResponse,
} from "@/services/recovery";

interface UseRecoveriesOptions {
  preset: string;
  dateStart?: string;
  dateEnd?: string;
  typeFilter: string;
  statusFilter: string;
  channelFilter: string;
  search?: string;
}

export function useRecoveries(opts: UseRecoveriesOptions) {
  const [page, setPage] = useState(1);

  const params = {
    preset: opts.preset,
    dateStart: opts.dateStart,
    dateEnd: opts.dateEnd,
    typeFilter: opts.typeFilter,
    statusFilter: opts.statusFilter,
    channelFilter: opts.channelFilter,
    search: opts.search,
    page,
    perPage: 12,
  };

  const { data, isLoading, reload } = useCachedQuery<RecoveryListResponse>({
    cachePrefix: "recoveries",
    params,
    queryFn: () => fetchRecoveries(params),
  });

  const updatePage = useCallback((p: number) => {
    setPage(p);
  }, []);

  // Reset page when filters change
  const resetPage = useCallback(() => {
    setPage(1);
  }, []);

  return {
    data: data?.items ?? [],
    total: data?.total ?? 0,
    page,
    setPage: updatePage,
    resetPage,
    isLoading,
    reload,
  };
}
