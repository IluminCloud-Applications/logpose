import { useState, useEffect, useCallback } from "react";
import type { AiInstructions } from "@/types/company";
import { fetchAiInstructions, updateAiInstructions } from "@/services/company";
import { toast } from "sonner";

const DEFAULT_AI_INSTRUCTIONS: AiInstructions = {
  metrics: {
    roas: null,
    cpa: null,
    cpc: null,
    connect_rate: null,
  },
  additional_prompt: "",
};

export function useAiInstructions() {
  const [instructions, setInstructions] = useState<AiInstructions>(DEFAULT_AI_INSTRUCTIONS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAiInstructions()
      .then((data) => setInstructions(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const save = useCallback(async (data: AiInstructions) => {
    try {
      const updated = await updateAiInstructions(data);
      setInstructions(updated);
      toast.success("Instruções da AI atualizadas");
    } catch {
      toast.error("Erro ao salvar instruções da AI");
    }
  }, []);

  return { instructions, isLoading, save };
}
