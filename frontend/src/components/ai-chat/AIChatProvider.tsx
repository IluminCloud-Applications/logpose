import { useState, useEffect } from "react";
import { AIChatBubble } from "./AIChatBubble";
import { geminiChatStatus } from "@/services/integrations";
import { useDailyReport } from "./useDailyReport";

/**
 * Wrapper que só renderiza a AI bubble se houver API key configurada.
 * Gerencia o relatório diário automático.
 */
export function AIChatProvider() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    geminiChatStatus()
      .then((res) => {
        setIsConfigured(res.configured);
        setChecked(true);
      })
      .catch(() => setChecked(true));
  }, []);

  const {
    report,
    isLoading: reportLoading,
    shouldAutoOpen,
    clearAutoOpen,
  } = useDailyReport(isConfigured && checked);

  if (!checked || !isConfigured) return null;

  return (
    <AIChatBubble
      dailyReport={report}
      dailyReportLoading={reportLoading}
      shouldAutoOpen={shouldAutoOpen}
      onAutoOpened={clearAutoOpen}
    />
  );
}
