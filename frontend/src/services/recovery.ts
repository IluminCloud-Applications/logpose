import { apiRequest } from "./api";

// ── Types ───────────────────────────────────────────────
export interface RecoveryRow {
  id: number;
  date: string | null;
  customerName: string;
  customerEmail: string;
  product: string;
  type: "abandoned_cart" | "declined_card" | "unpaid_pix" | "trial";
  amount: number;
  recovered: boolean;
  channel: string;
  recoveredAt: string | null;
}

export interface ChannelConfig {
  channel: string;
  keyword: string;
}

// ── Channel Config ──────────────────────────────────────
export async function fetchChannelConfigs(): Promise<ChannelConfig[]> {
  return apiRequest<ChannelConfig[]>("/recovery/config");
}

export async function updateChannelConfigs(
  configs: ChannelConfig[],
): Promise<ChannelConfig[]> {
  return apiRequest<ChannelConfig[]>("/recovery/config", {
    method: "PUT",
    body: { configs },
  });
}

// ── Recoveries ──────────────────────────────────────────
export interface RecoveryListResponse {
  items: RecoveryRow[];
  total: number;
  page: number;
  per_page: number;
}

export async function fetchRecoveries(params: {
  preset: string;
  dateStart?: string;
  dateEnd?: string;
  typeFilter?: string;
  statusFilter?: string;
  channelFilter?: string;
  search?: string;
  page?: number;
  perPage?: number;
}): Promise<RecoveryListResponse> {
  const qs = new URLSearchParams({ preset: params.preset });
  if (params.dateStart) qs.set("date_start", params.dateStart);
  if (params.dateEnd) qs.set("date_end", params.dateEnd);
  if (params.typeFilter) qs.set("type_filter", params.typeFilter);
  if (params.statusFilter) qs.set("status_filter", params.statusFilter);
  if (params.channelFilter) qs.set("channel_filter", params.channelFilter);
  if (params.search) qs.set("search", params.search);
  qs.set("page", String(params.page ?? 1));
  qs.set("per_page", String(params.perPage ?? 12));
  return apiRequest<RecoveryListResponse>(`/recovery/list?${qs.toString()}`);
}
