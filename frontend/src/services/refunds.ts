import { apiRequest } from "./api";

// ── Types ───────────────────────────────────────────────
export interface RefundItem {
  id: number;
  external_id: string;
  platform: string;
  status: "refunded" | "chargeback";
  amount: number;
  customer_email: string | null;
  product_name: string | null;
  product_id: number | null;
  created_at: string | null;
  reason_code: string | null;
  reason_text: string | null;
}

export interface RefundsSummary {
  total_refunds: number;
  refunded: number;
  chargebacks: number;
  refund_amount: number;
  chargeback_amount: number;
  refund_rate: number;
  with_reason: number;
  without_reason: number;
}

export interface ReasonStat {
  code: string;
  count: number;
}

interface RefundListResponse {
  items: RefundItem[];
  total: number;
  page: number;
  per_page: number;
}

// ── Reason codes & labels ──────────────────────────────
export const REFUND_REASON_OPTIONS = [
  { code: "product_different", label: "O produto é diferente do que eu achei" },
  { code: "not_as_described", label: "O produto não corresponde à descrição" },
  { code: "didnt_like", label: "Não gostei do produto" },
  { code: "too_expensive", label: "Achei caro para o valor entregue" },
  { code: "duplicate_purchase", label: "Compra duplicada" },
  { code: "fraud", label: "Considerado fraude / não reconheço a compra" },
  { code: "technical_issues", label: "Problemas técnicos de acesso" },
  { code: "other", label: "Outro motivo" },
] as const;

export const reasonLabels: Record<string, string> = Object.fromEntries(
  REFUND_REASON_OPTIONS.map((r) => [r.code, r.label])
);

// ── API calls ──────────────────────────────────────────
export async function fetchRefunds(
  params: Record<string, string | number | undefined>
): Promise<RefundListResponse> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") qs.set(k, String(v));
  });
  return apiRequest<RefundListResponse>(`/refunds/list?${qs.toString()}`);
}

export async function fetchRefundsSummary(
  params: Record<string, string | number | undefined>
): Promise<RefundsSummary> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") qs.set(k, String(v));
  });
  return apiRequest<RefundsSummary>(`/refunds/summary?${qs.toString()}`);
}

export async function fetchReasonStats(
  params: Record<string, string | number | undefined>
): Promise<ReasonStat[]> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") qs.set(k, String(v));
  });
  return apiRequest<ReasonStat[]>(`/refunds/reasons/stats?${qs.toString()}`);
}

export async function saveRefundReason(payload: {
  transaction_id: number;
  reason_code: string;
  reason_text?: string | null;
}): Promise<{ id: number }> {
  return apiRequest("/refunds/reasons", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
