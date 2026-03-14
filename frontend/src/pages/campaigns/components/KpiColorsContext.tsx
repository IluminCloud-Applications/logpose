import { createContext, useContext } from "react";
import type { KpiColorsConfig } from "@/types/company";

const KpiColorsContext = createContext<KpiColorsConfig | null>(null);

export const KpiColorsProvider = KpiColorsContext.Provider;

export function useKpiColorsContext(): KpiColorsConfig | null {
  return useContext(KpiColorsContext);
}
