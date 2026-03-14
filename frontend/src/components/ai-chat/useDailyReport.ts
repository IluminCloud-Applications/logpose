import { useState, useEffect, useRef } from "react";
import { geminiDailyReport } from "@/services/integrations";

const REPORT_TIMESTAMP_KEY = "logpose-daily-report-ts";
const REPORT_CACHE_KEY = "logpose-daily-report-cache";
const ONE_HOUR_MS = 60 * 60 * 1000;
const MIN_SPEND = 50; // R$50 mínimo de gastos
const MIN_HOUR = 8; // Só gera após 08:00

interface DailyReportState {
  report: string | null;
  isLoading: boolean;
  shouldAutoOpen: boolean;
}

/**
 * Hook que gerencia o relatório diário automático da AI.
 * - Verifica se já gerou nas últimas 1 hora
 * - Só gera se for após 08:00
 * - Só gera se tiver ao menos R$50 de gastos
 * - Retorna o relatório + flag para auto-abrir o bubble
 */
export function useDailyReport(isConfigured: boolean) {
  const [state, setState] = useState<DailyReportState>({
    report: null,
    isLoading: false,
    shouldAutoOpen: false,
  });
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (!isConfigured || hasTriggered.current) return;

    // Verificar horário mínimo (08:00)
    const now = new Date();
    if (now.getHours() < MIN_HOUR) return;

    // Verificar se já gerou nas últimas 1 hora
    const lastTs = localStorage.getItem(REPORT_TIMESTAMP_KEY);
    if (lastTs) {
      const elapsed = Date.now() - parseInt(lastTs, 10);
      if (elapsed < ONE_HOUR_MS) {
        // Carregar do cache
        const cached = localStorage.getItem(REPORT_CACHE_KEY);
        if (cached) {
          setState({ report: cached, isLoading: false, shouldAutoOpen: false });
        }
        return;
      }
    }

    hasTriggered.current = true;
    generateReport();
  }, [isConfigured]);

  const generateReport = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const result = await geminiDailyReport();

      // Verificar se atingiu o gasto mínimo
      if (result.spend_today < MIN_SPEND) {
        setState({ report: null, isLoading: false, shouldAutoOpen: false });
        return;
      }

      // Salvar cache e timestamp
      localStorage.setItem(REPORT_TIMESTAMP_KEY, String(Date.now()));
      localStorage.setItem(REPORT_CACHE_KEY, result.response);

      setState({
        report: result.response,
        isLoading: false,
        shouldAutoOpen: true,
      });
    } catch {
      setState({ report: null, isLoading: false, shouldAutoOpen: false });
    }
  };

  const clearAutoOpen = () => {
    setState((prev) => ({ ...prev, shouldAutoOpen: false }));
  };

  return { ...state, clearAutoOpen };
}
