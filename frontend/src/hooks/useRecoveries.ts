import { useState, useCallback } from "react";
import { useCachedQuery } from "./useCachedQuery";
import {
  fetchRecoveries, fetchRecoverySummary,
  type RecoveryListResponse, type RecoverySummary,
} from "@/services/recovery";

interface UseRecoveriesOptions {
  preset: string;
  dateStart?: string;
  dateEnd?: string;
  typeFilter: string;
  statusFilter: string;
  channelFilter: string;
  productId?: string;
  search?: string;
}

export function useRecoveries(opts: UseRecoveriesOptions) {
  const [page, setPage] = useState(1);

  const productId = opts.productId !== "all" ? opts.productId : undefined;

  const sharedParams = {
    preset: opts.preset,
    dateStart: opts.dateStart,
    dateEnd: opts.dateEnd,
    typeFilter: opts.typeFilter,
    statusFilter: opts.statusFilter,
    channelFilter: opts.channelFilter,
    productId,
    search: opts.search,
  };

  const listParams = { ...sharedParams, page, perPage: 12 };

  const { data, isLoading, reload: reloadList } = useCachedQuery<RecoveryListResponse>({
    cachePrefix: "recoveries",
    params: listParams,
    queryFn: () => fetchRecoveries(listParams),
  });

  const { data: summary, reload: reloadSummary } = useCachedQuery<RecoverySummary>({
    cachePrefix: "recoveries-summary",
    params: sharedParams,
    queryFn: () => fetchRecoverySummary(sharedParams),
  });

  const updatePage = useCallback((p: number) => {
    setPage(p);
  }, []);

  const resetPage = useCallback(() => {
    setPage(1);
  }, []);

  const reload = useCallback(async () => {
    await Promise.all([reloadList(), reloadSummary()]);
  }, [reloadList, reloadSummary]);

  return {
    data: data?.items ?? [],
    total: data?.total ?? 0,
    summary: summary ?? null,
    page,
    setPage: updatePage,
    resetPage,
    isLoading,
    reload,
  };
}
