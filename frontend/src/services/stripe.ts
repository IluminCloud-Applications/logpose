import { apiRequest } from "./api";

// ─── Stripe Accounts ─────────────────────────────────────────────────

export interface StripeAccountAPI {
  id: number;
  name: string;
  api_key: string;
  created_at: string | null;
}

export async function fetchStripeAccounts(): Promise<StripeAccountAPI[]> {
  return apiRequest<StripeAccountAPI[]>("/stripe/accounts");
}

export async function createStripeAccount(
  name: string,
  apiKey: string
): Promise<StripeAccountAPI> {
  return apiRequest<StripeAccountAPI>("/stripe/accounts", {
    method: "POST",
    body: { name, api_key: apiKey },
  });
}

export async function deleteStripeAccount(id: number): Promise<void> {
  await apiRequest(`/stripe/accounts/${id}`, { method: "DELETE" });
}

// ─── Subscription Metrics ────────────────────────────────────────────

export interface TrialMetrics {
  count: number;
  potential_value: number;
  conversion_rate: number;
  churn_rate: number;
}

export interface SubscriptionMetrics {
  mrr: number;
  arr: number;
  ltv: number;
  trials: TrialMetrics;
  renewal_rate: number;
  cancellation_rate: number;
  ticket_medio: number;
  active_customers: number;
  new_customers_month: number;
  avg_tenure_months: number;
  avg_cancel_months: number;
  churn_rate: number;
  total_canceled_period: number;
}

export interface StripeProduct {
  id: string;
  name: string;
}

export interface MrrHistoryPoint {
  month: string;
  mrr: number;
  new_mrr: number;
  churned_mrr: number;
  net_mrr: number;
}

export async function fetchSubscriptionMetrics(params: {
  date_from?: string;
  date_to?: string;
  product_id?: string;
}): Promise<SubscriptionMetrics> {
  const searchParams = new URLSearchParams();
  if (params.date_from) searchParams.set("date_from", params.date_from);
  if (params.date_to) searchParams.set("date_to", params.date_to);
  if (params.product_id) searchParams.set("product_id", params.product_id);

  const qs = searchParams.toString();
  return apiRequest<SubscriptionMetrics>(
    `/subscriptions/metrics${qs ? `?${qs}` : ""}`
  );
}

export async function fetchMrrHistory(
  months = 12
): Promise<{ mrr_history: MrrHistoryPoint[] }> {
  return apiRequest<{ mrr_history: MrrHistoryPoint[] }>(
    `/subscriptions/mrr-history?months=${months}`
  );
}

export async function fetchStripeProducts(): Promise<StripeProduct[]> {
  return apiRequest<StripeProduct[]>("/subscriptions/products");
}

