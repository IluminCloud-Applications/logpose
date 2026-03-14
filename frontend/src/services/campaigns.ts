import { apiRequest } from "./api";

// ─── Types ────────────────────────────────────────────────────────────

export interface CampaignAdData {
  id: string;
  ad_set_id: string;
  name: string;
  status: string;
  budget: number;
  spend: number;
  clicks: number;
  impressions: number;
  cpc: number;
  ctr: number;
  landing_page_views: number;
  initiate_checkout: number;
  connect_rate: number;
  sales: number;
  revenue: number;
  profit: number;
  roas: number;
  cpa: number;
  no_id_sales: number;
  plays_vsl: number;
  play_rate: number;
}

export interface CampaignAdSetData {
  id: string;
  campaign_id: string;
  name: string;
  status: string;
  budget: number;
  spend: number;
  clicks: number;
  impressions: number;
  cpc: number;
  ctr: number;
  landing_page_views: number;
  initiate_checkout: number;
  connect_rate: number;
  sales: number;
  revenue: number;
  profit: number;
  roas: number;
  cpa: number;
  no_id_sales: number;
  plays_vsl: number;
  play_rate: number;
  ads: CampaignAdData[];
}

export interface CampaignData {
  id: string;
  name: string;
  status: string;
  objective: string;
  budget: number;
  spend: number;
  clicks: number;
  impressions: number;
  cpc: number;
  ctr: number;
  landing_page_views: number;
  initiate_checkout: number;
  connect_rate: number;
  sales: number;
  revenue: number;
  profit: number;
  roas: number;
  cpa: number;
  no_id_sales: number;
  plays_vsl: number;
  play_rate: number;
  adsets: CampaignAdSetData[];
}

export interface CampaignsResponse {
  campaigns: CampaignData[];
  unidentified: CampaignData;
}

export interface PresetAPI {
  id: number;
  name: string;
  columns: string[];
  created_at: string | null;
}

// ─── API Calls ────────────────────────────────────────────────────────

export async function fetchCampaignsData(
  dateStart: string,
  dateEnd: string,
  accountId?: number,
): Promise<CampaignsResponse> {
  const params = new URLSearchParams({
    date_start: dateStart,
    date_end: dateEnd,
  });
  if (accountId) params.set("account_id", String(accountId));
  return apiRequest<CampaignsResponse>(`/campaigns/data?${params}`);
}

export async function toggleCampaignStatus(
  accountId: number,
  entityId: string,
  entityType: "campaign" | "adset" | "ad",
  active: boolean,
): Promise<{ status: string; new_status: string }> {
  return apiRequest("/campaigns/toggle", {
    method: "POST",
    body: {
      account_id: accountId,
      entity_id: entityId,
      entity_type: entityType,
      active,
    },
  });
}

export async function updateBudget(
  accountId: number,
  entityId: string,
  entityType: "campaign" | "adset",
  dailyBudget: number,
): Promise<{ status: string; daily_budget: number }> {
  return apiRequest("/campaigns/budget", {
    method: "POST",
    body: {
      account_id: accountId,
      entity_id: entityId,
      entity_type: entityType,
      daily_budget: dailyBudget,
    },
  });
}

export async function fetchPresets(): Promise<PresetAPI[]> {
  return apiRequest<PresetAPI[]>("/campaigns/presets");
}

export async function createPreset(
  name: string,
  columns: string[],
): Promise<PresetAPI> {
  return apiRequest<PresetAPI>("/campaigns/presets", {
    method: "POST",
    body: { name, columns },
  });
}

export async function deletePreset(id: number): Promise<void> {
  await apiRequest(`/campaigns/presets/${id}`, { method: "DELETE" });
}

// ─── Tags ─────────────────────────────────────────────────────────────

export interface CampaignTagsAPI {
  campaign_id: string;
  tags: string[];
}

export async function fetchCampaignTags(): Promise<CampaignTagsAPI[]> {
  return apiRequest<CampaignTagsAPI[]>("/campaigns/tags");
}

export async function saveCampaignTags(
  campaignId: string,
  tags: string[],
): Promise<CampaignTagsAPI> {
  return apiRequest<CampaignTagsAPI>("/campaigns/tags", {
    method: "PUT",
    body: { campaign_id: campaignId, tags },
  });
}

// ─── Filter Options ───────────────────────────────────────────────────

export interface CampaignFilterOptionsAPI {
  products: { id: number; name: string }[];
  platforms: { value: string; label: string }[];
}

export async function fetchCampaignFilterOptions(): Promise<CampaignFilterOptionsAPI> {
  return apiRequest<CampaignFilterOptionsAPI>("/campaigns/filter-options");
}

// ─── Markers (Definir Vídeo / Checkout) ───────────────────────────────

export interface CampaignMarkerAPI {
  id: number;
  campaign_id: string;
  marker_type: "video" | "checkout" | "product" | "platform";
  reference_id: string;
  reference_label: string;
}

export async function fetchCampaignMarkers(): Promise<CampaignMarkerAPI[]> {
  return apiRequest<CampaignMarkerAPI[]>("/campaigns/markers");
}

export async function upsertCampaignMarker(data: {
  campaign_id: string;
  marker_type: "video" | "checkout" | "product" | "platform";
  reference_id: string;
  reference_label: string;
}): Promise<CampaignMarkerAPI> {
  return apiRequest<CampaignMarkerAPI>("/campaigns/markers", {
    method: "PUT",
    body: data,
  });
}

export async function deleteCampaignMarker(id: number): Promise<void> {
  return apiRequest(`/campaigns/markers/${id}`, { method: "DELETE" });
}

// ─── VTurb Players ────────────────────────────────────────────────────

export interface VturbPlayer {
  id: string;
  name: string;
  duration: number;
  pitch_time: number;
  created_at: string;
  account_name: string;
  plays_30d: number;
}

export async function fetchVturbPlayers(): Promise<VturbPlayer[]> {
  return apiRequest<VturbPlayer[]>("/vturb/players");
}

// ─── Campaign Conversion ──────────────────────────────────────────────

export interface CampaignConversionData {
  campaign_id: string;
  total_transactions: number;
  approved_count: number;
  approved_revenue: number;
  pending_count: number;
  pending_revenue: number;
  refunded_count: number;
  refunded_revenue: number;
  chargeback_count: number;
  chargeback_revenue: number;
  approval_rate: number;
  recovery_rate: number;
  loss_rate: number;
}

export async function fetchCampaignConversion(
  dateStart: string,
  dateEnd: string,
): Promise<CampaignConversionData[]> {
  const params = new URLSearchParams({ date_start: dateStart, date_end: dateEnd });
  return apiRequest<CampaignConversionData[]>(`/campaigns/conversion?${params}`);
}

