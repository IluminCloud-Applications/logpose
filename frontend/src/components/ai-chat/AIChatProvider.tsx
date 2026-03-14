import { useState, useEffect } from "react";
import { AIChatBubble } from "./AIChatBubble";
import { geminiChatStatus } from "@/services/integrations";

/**
 * Wrapper que só renderiza a AI bubble se houver API key configurada.
 * Faz check na montagem e cacheia o resultado.
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

  if (!checked || !isConfigured) return null;

  return <AIChatBubble />;
}
