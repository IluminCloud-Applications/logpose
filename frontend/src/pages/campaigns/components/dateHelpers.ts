/**
 * Retorna a data no formato YYYY-MM-DD usando timezone local (não UTC).
 * Usar toISOString() converte para UTC, causando datas erradas após 21h no Brasil.
 */
export function getDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getDefaultDateRange(): { start: string; end: string } {
  const today = getDateStr(new Date());
  return { start: today, end: today };
}

export function computeDateRange(preset: string, startDate?: string, endDate?: string) {
  if (preset === "custom" && startDate && endDate) {
    return { start: startDate, end: endDate };
  }
  const daysMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };
  const days = daysMap[preset];
  if (days) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return { start: getDateStr(d), end: getDateStr(new Date()) };
  }
  // today or fallback
  const today = getDateStr(new Date());
  return { start: today, end: today };
}

export const statusLabels: Record<string, string> = {
  active: "Ativa", paused: "Pausada", completed: "Finalizada",
};

export const platformLabels: Record<string, string> = {
  kiwify: "Kiwify", payt: "PayT",
};

export const objectiveLabels: Record<string, string> = {
  sales: "Vendas",
  traffic: "Tráfego",
  engagement: "Engajamento",
  leads: "Leads",
  awareness: "Reconhecimento",
  app_promotion: "App",
};
