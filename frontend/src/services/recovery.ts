import { apiRequest } from "./api";

// ── Types ───────────────────────────────────────────────
export interface RecoveryRow {
  id: string;
  date: string | null;
  customerName: string;
  customerEmail: string;
  product: string;
  type: "abandoned_cart" | "declined_card" | "unpaid_pix" | "trial" | "unidentified";
  amount: number;
  recovered: boolean;
  channel: string;
  recoveredAt: string | null;
}

export interface ChannelConfig {
  channel: string;
  keyword: string;
  label?: string | null;
  is_custom?: boolean;
}

export interface CustomChannelPayload {
  name: string;
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

export async function createCustomChannel(
  payload: CustomChannelPayload,
): Promise<ChannelConfig> {
  return apiRequest<ChannelConfig>("/recovery/config/custom", {
    method: "POST",
    body: payload,
  });
}

export async function deleteCustomChannel(channel: string): Promise<void> {
  await apiRequest<void>(`/recovery/config/custom/${channel}`, {
    method: "DELETE",
  });
}

// ── Recoveries ──────────────────────────────────────────
export interface RecoveryListResponse {
  items: RecoveryRow[];
  total: number;
  page: number;
  per_page: number;
}

export interface RecoverySummary {
  total: number;
  recovered: number;
  pending: number;
  recovery_rate: number;
  recovered_amount: number;
  lost_amount: number;
  by_channel: {
    whatsapp: number;
    email: number;
    sms: number;
    back_redirect: number;
    other: number;
    [key: string]: number;
  };
}

export async function fetchRecoveries(params: {
  preset: string;
  dateStart?: string;
  dateEnd?: string;
  typeFilter?: string;
  statusFilter?: string;
  channelFilter?: string;
  productId?: string;
  upsellId?: string;
  search?: string;
  accountSlug?: string;
  page?: number;
  perPage?: number;
}): Promise<RecoveryListResponse> {
  const qs = new URLSearchParams({ preset: params.preset });
  if (params.dateStart) qs.set("date_start", params.dateStart);
  if (params.dateEnd) qs.set("date_end", params.dateEnd);
  if (params.typeFilter) qs.set("type_filter", params.typeFilter);
  if (params.statusFilter) qs.set("status_filter", params.statusFilter);
  if (params.channelFilter) qs.set("channel_filter", params.channelFilter);
  if (params.productId) qs.set("product_id", params.productId);
  if (params.upsellId) qs.set("upsell_id", params.upsellId);
  if (params.search) qs.set("search", params.search);
  if (params.accountSlug) qs.set("account_slug", params.accountSlug);
  qs.set("page", String(params.page ?? 1));
  qs.set("per_page", String(params.perPage ?? 12));
  return apiRequest<RecoveryListResponse>(`/recovery/list?${qs.toString()}`);
}

export async function fetchRecoverySummary(params: {
  preset: string;
  dateStart?: string;
  dateEnd?: string;
  typeFilter?: string;
  statusFilter?: string;
  channelFilter?: string;
  productId?: string;
  upsellId?: string;
  search?: string;
  accountSlug?: string;
}): Promise<RecoverySummary> {
  const qs = new URLSearchParams({ preset: params.preset });
  if (params.dateStart) qs.set("date_start", params.dateStart);
  if (params.dateEnd) qs.set("date_end", params.dateEnd);
  if (params.typeFilter) qs.set("type_filter", params.typeFilter);
  if (params.statusFilter) qs.set("status_filter", params.statusFilter);
  if (params.channelFilter) qs.set("channel_filter", params.channelFilter);
  if (params.productId) qs.set("product_id", params.productId);
  if (params.upsellId) qs.set("upsell_id", params.upsellId);
  if (params.search) qs.set("search", params.search);
  if (params.accountSlug) qs.set("account_slug", params.accountSlug);
  return apiRequest<RecoverySummary>(`/recovery/summary?${qs.toString()}`);
}
