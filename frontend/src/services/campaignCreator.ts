import { apiRequest } from "./api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// ─── Types ────────────────────────────────────────────────────────────

export interface PixelData {
  id: string;
  name: string;
  last_fired_time?: string;
}

export interface InstagramAccount {
  id: string;
  username: string;
  profile_pic?: string;
}

export interface PageData {
  id: string;
  name: string;
  picture?: { data?: { url?: string } };
}

export interface InterestData {
  id: string;
  name: string;
  audience_size: number;
}

export interface CampaignCreateResult {
  success: boolean;
  campaign_id?: string;
  adset_id?: string;
  campaigns_created?: number;
  ads_created: number;
  errors: string[];
}

// ─── Fetch helpers ────────────────────────────────────────────────────

export async function fetchPixels(accountId: number): Promise<PixelData[]> {
  const res = await apiRequest<{ pixels: PixelData[] }>(
    `/campaigns/create/pixels?account_id=${accountId}`
  );
  return res.pixels;
}

export interface PagesResponse {
  pages: PageData[];
  instagram_accounts: InstagramAccount[];
}

export async function fetchPages(accountId: number): Promise<PagesResponse> {
  return apiRequest<PagesResponse>(
    `/campaigns/create/pages?account_id=${accountId}`
  );
}

export async function searchInterests(
  accountId: number,
  query: string
): Promise<InterestData[]> {
  const res = await apiRequest<{ interests: InterestData[] }>(
    `/campaigns/create/interests?account_id=${accountId}&q=${encodeURIComponent(query)}`
  );
  return res.interests;
}

// ─── Publish ──────────────────────────────────────────────────────────

export async function publishCampaign(
  payload: Record<string, unknown>,
  files: File[]
): Promise<CampaignCreateResult> {
  // Mock mode — intercept before hitting the real API
  if (sessionStorage.getItem("mock_mode") === "true") {
    await new Promise((r) => setTimeout(r, 800));
    return {
      success: true,
      campaign_id: "mock_camp_" + Date.now(),
      adset_id: "mock_adset_" + Date.now(),
      campaigns_created: (payload.campaign_count as number) || 1,
      ads_created: Array.isArray(payload.ads) ? (payload.ads as unknown[]).length : 1,
      errors: [],
    };
  }

  const formData = new FormData();
  formData.append("payload", JSON.stringify(payload));
  files.forEach((file) => formData.append("files", file));

  const token = document.cookie
    .split("; ")
    .find((c) => c.startsWith("access_token="))
    ?.split("=")[1];

  const url = `${API_BASE_URL}/campaigns/create/publish`;
  const response = await fetch(url, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Erro" }));
    throw new Error(err.detail || "Falha ao publicar campanha");
  }

  return response.json();
}

// ─── Export / Import ──────────────────────────────────────────────────

export async function exportCampaign(
  data: Record<string, unknown>
): Promise<void> {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "campaign_export.json";
  a.click();
  URL.revokeObjectURL(url);
}

export async function importCampaign(
  data: Record<string, unknown>
): Promise<{ success: boolean; data: Record<string, unknown> }> {
  return apiRequest("/campaigns/create/import", {
    method: "POST",
    body: data,
  });
}
