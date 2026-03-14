import { useState, useEffect, useCallback } from "react";
import type { KpiColorsConfig } from "@/types/company";
import { fetchKpiColors, updateKpiColors } from "@/services/company";
import { toast } from "sonner";

const DEFAULT_KPI_COLORS: KpiColorsConfig = {
  roas: {
    green: { min: 3 },
    yellow: { min: 2, max: 3 },
    red: { max: 2 },
  },
  cpa: null,
  ctr: null,
  cpc: null,
};

export function useKpiColors() {
  const [kpiColors, setKpiColors] = useState<KpiColorsConfig>(DEFAULT_KPI_COLORS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchKpiColors()
      .then((data) => setKpiColors(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const save = useCallback(async (colors: KpiColorsConfig) => {
    try {
      const updated = await updateKpiColors(colors);
      setKpiColors(updated);
      toast.success("Cores dos KPIs atualizadas");
    } catch {
      toast.error("Erro ao salvar cores dos KPIs");
    }
  }, []);

  return { kpiColors, isLoading, save };
}
