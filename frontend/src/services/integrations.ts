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
