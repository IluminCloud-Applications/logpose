import { apiRequest } from "./api";

// ─── VTurb ───────────────────────────────────────────────────────────

export interface VturbAccountAPI {
  id: number;
  name: string;
  api_key: string;
  created_at: string | null;
}

export async function fetchVturbAccounts(): Promise<VturbAccountAPI[]> {
  return apiRequest<VturbAccountAPI[]>("/vturb/accounts");
}

export async function createVturbAccount(name: string, apiKey: string): Promise<VturbAccountAPI> {
  return apiRequest<VturbAccountAPI>("/vturb/accounts", {
    method: "POST",
    body: { name, api_key: apiKey },
  });
}

export async function deleteVturbAccount(id: number): Promise<void> {
  await apiRequest(`/vturb/accounts/${id}`, { method: "DELETE" });
}

// ─── Facebook Ads ────────────────────────────────────────────────────

export interface FacebookAccountAPI {
  id: number;
  label: string;
  account_id: string;
  access_token: string;
  created_at: string | null;
}

export async function fetchFacebookAccounts(): Promise<FacebookAccountAPI[]> {
  return apiRequest<FacebookAccountAPI[]>("/facebook/accounts");
}

export async function createFacebookAccount(
  label: string,
  accountId: string,
  accessToken: string
): Promise<FacebookAccountAPI> {
  return apiRequest<FacebookAccountAPI>("/facebook/accounts", {
    method: "POST",
    body: { label, account_id: accountId, access_token: accessToken },
  });
}

export async function deleteFacebookAccount(id: number): Promise<void> {
  await apiRequest(`/facebook/accounts/${id}`, { method: "DELETE" });
}

export async function bulkCreateFacebookAccounts(
  accounts: { label: string; account_id: string }[],
  accessToken: string
): Promise<FacebookAccountAPI[]> {
  return apiRequest<FacebookAccountAPI[]>("/facebook/accounts/bulk", {
    method: "POST",
    body: { accounts, access_token: accessToken },
  });
}

export interface DiscoveredAccount {
  account_id: string;
  name: string;
}

export interface DiscoverResponse {
  accounts: DiscoveredAccount[];
  total: number;
}

export async function discoverFacebookAccounts(
  accessToken: string,
  businessId: string
): Promise<DiscoverResponse> {
  return apiRequest<DiscoverResponse>("/facebook/accounts/discover", {
    method: "POST",
    body: { access_token: accessToken, business_id: businessId },
  });
}

// ─── Platforms (Webhooks) ────────────────────────────────────────────

export interface WebhookEndpointAPI {
  id: number;
  slug: string;
  platform: string;
  name: string;
  created_at: string | null;
}

export async function fetchWebhooks(): Promise<WebhookEndpointAPI[]> {
  return apiRequest<WebhookEndpointAPI[]>("/platforms/webhooks");
}

export async function createWebhook(
  platform: string,
  name: string
): Promise<WebhookEndpointAPI> {
  return apiRequest<WebhookEndpointAPI>("/platforms/webhooks", {
    method: "POST",
    body: { platform, name },
  });
}

export async function deleteWebhook(id: number): Promise<void> {
  await apiRequest(`/platforms/webhooks/${id}`, { method: "DELETE" });
}

// ─── Gemini AI ───────────────────────────────────────────────────────

export interface GeminiAccountAPI {
  id: number;
  name: string;
  api_key: string;
  model: string;
  created_at: string | null;
}

export interface GeminiModelAPI {
  id: string;
  name: string;
  description: string;
}

export async function fetchGeminiAccounts(): Promise<GeminiAccountAPI[]> {
  return apiRequest<GeminiAccountAPI[]>("/gemini/accounts");
}

export async function createGeminiAccount(
  name: string, apiKey: string, model: string
): Promise<GeminiAccountAPI> {
  return apiRequest<GeminiAccountAPI>("/gemini/accounts", {
    method: "POST",
    body: { name, api_key: apiKey, model },
  });
}

export async function updateGeminiAccountModel(
  id: number, model: string
): Promise<GeminiAccountAPI> {
  return apiRequest<GeminiAccountAPI>(`/gemini/accounts/${id}`, {
    method: "PATCH",
    body: { model },
  });
}

export async function deleteGeminiAccount(id: number): Promise<void> {
  await apiRequest(`/gemini/accounts/${id}`, { method: "DELETE" });
}

export async function fetchGeminiModels(apiKey: string): Promise<GeminiModelAPI[]> {
  return apiRequest<GeminiModelAPI[]>(`/gemini/models?api_key=${encodeURIComponent(apiKey)}`);
}

export async function geminiChatStatus(): Promise<{ configured: boolean; count: number }> {
  return apiRequest("/gemini/status");
}

export async function geminiChat(
  message: string,
  history: { role: string; content: string }[],
  accountId?: number,
  pageContext?: string,
): Promise<{ response: string }> {
  return apiRequest<{ response: string }>("/gemini/chat", {
    method: "POST",
    body: { message, history, account_id: accountId, page_context: pageContext },
  });
}

export async function geminiDailyReport(): Promise<{ response: string; spend_today: number }> {
  return apiRequest<{ response: string; spend_today: number }>("/gemini/daily-report", {
    method: "POST",
  });
}

export interface AiAction {
  action: string;
  entity_id: string;
  entity_type: string;
  entity_name: string;
  value?: number;
  current_budget?: number;
  metrics?: Record<string, number>;
}

export async function executeAiAction(data: AiAction): Promise<{ status: string; message: string }> {
  return apiRequest<{ status: string; message: string }>("/campaigns/ai-action", {
    method: "POST",
    body: data,
  });
}

// ─── AI Training ──────────────────────────────────────────────────────

export interface AiTrainingLevel {
  count: number;
  percentage: number;
  level: string;
  max_records: number;
}

export async function fetchAiTrainingLevel(): Promise<AiTrainingLevel> {
  return apiRequest<AiTrainingLevel>("/ai/training-level");
}
