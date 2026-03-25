import { useMemo } from "react";
import type { QuickFilter } from "@/components/QuickFiltersBadges";
import { objectiveLabels, bidStrategyLabels } from "./dateHelpers";
import type { CampaignFilterState } from "./CampaignsInlineFilters";
import type { MarkerMap } from "@/hooks/useCampaignMarkers";

interface QuickFiltersOptions {
  filters: CampaignFilterState;
  accounts: { id: number; label: string }[];
  markersMap: MarkerMap;
  tags: string[];
}

const datePresetLabels: Record<string, string> = {
  today: "Hoje", yesterday: "Ontem", "3d": "3 dias", "7d": "7 dias",
  "30d": "30 dias", "90d": "90 dias", all: "1 Ano",
};

function formatCustomLabel(startDate: string, endDate: string): string {
  if (!startDate || !endDate) return "Personalizado";
  const fmt = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  return `${fmt(startDate)} — ${fmt(endDate)}`;
}

/** Extract unique marker options from the markersMap for a given marker type */
function extractMarkerOptions(
  markersMap: MarkerMap,
  type: "video" | "checkout" | "product",
): { value: string; label: string }[] {
  const seen = new Map<string, string>();
  for (const markers of Object.values(markersMap)) {
    const m = markers[type];
    if (m) seen.set(m.reference_id, m.reference_label);
  }
  return Array.from(seen.entries()).map(([value, label]) => ({ value, label }));
}

export function useQuickFilters({ filters, accounts, markersMap, tags }: QuickFiltersOptions) {
  return useMemo<QuickFilter[]>(() => {
    const datePreset = filters.dateRange.preset;
    const dateLabel = datePreset === "custom"
      ? formatCustomLabel(filters.dateRange.startDate, filters.dateRange.endDate)
      : (datePresetLabels[datePreset] ?? "Hoje");

    const productOptions = extractMarkerOptions(markersMap, "product");
    const videoOptions = extractMarkerOptions(markersMap, "video");
    const checkoutOptions = extractMarkerOptions(markersMap, "checkout");

    const list: QuickFilter[] = [
      {
        key: "dateRange",
        label: "Hoje",
        value: datePreset,
        isActive: true,
        options: [],
        defaultValue: "today",
        extra: { startDate: filters.dateRange.startDate, endDate: filters.dateRange.endDate, displayLabel: dateLabel },
      },
      {
        key: "status",
        label: "Status",
        value: filters.status,
        isActive: true,
        defaultValue: "active",
        options: [
          { value: "all", label: "Todos" },
          { value: "active", label: "Ativa" },
          { value: "paused", label: "Pausada" },
          { value: "completed", label: "Finalizada" },
        ],
      },
      {
        key: "objective",
        label: "Objetivo",
        value: filters.objective,
        isActive: true,
        defaultValue: "sales",
        options: [
          { value: "all", label: "Todos" },
          ...Object.entries(objectiveLabels).map(([v, l]) => ({ value: v, label: l })),
        ],
      },
      {
        key: "bidStrategy",
        label: "Lance",
        value: filters.bidStrategy,
        isActive: filters.bidStrategy !== "all",
        defaultValue: "all",
        options: [
          { value: "all", label: "Todos" },
          ...Object.entries(bidStrategyLabels).map(([v, l]) => ({ value: v, label: l })),
        ],
      },
      {
        key: "budgetType",
        label: "Orçamento",
        value: filters.budgetType,
        isActive: filters.budgetType !== "all",
        defaultValue: "all",
        options: [
          { value: "all", label: "Todos" },
          { value: "CBO", label: "CBO" },
          { value: "ABO", label: "ABO" },
        ],
      },
      {
        key: "account",
        label: "Conta",
        value: filters.account,
        isActive: filters.account !== "all",
        options: [
          { value: "all", label: "Todas" },
          ...accounts.map((a) => ({ value: String(a.id), label: a.label })),
        ],
      },
    ];

    // Product filter (only shows if there are products defined)
    if (productOptions.length > 0) {
      list.push({
        key: "product",
        label: "Produto",
        value: filters.product,
        isActive: filters.product !== "all",
        options: [
          { value: "all", label: "Todos" },
          ...productOptions,
        ],
      });
    }

    // Video filter (only shows if there are videos defined)
    if (videoOptions.length > 0) {
      list.push({
        key: "video",
        label: "Vídeo",
        value: filters.video,
        isActive: filters.video !== "all",
        options: [
          { value: "all", label: "Todos" },
          ...videoOptions,
        ],
      });
    }

    // Checkout filter (only shows if there are checkouts defined)
    if (checkoutOptions.length > 0) {
      list.push({
        key: "checkout",
        label: "Checkout",
        value: filters.checkout,
        isActive: filters.checkout !== "all",
        options: [
          { value: "all", label: "Todos" },
          ...checkoutOptions,
        ],
      });
    }

    // Tag filter
    list.push({
      key: "tag",
      label: "Tag",
      value: filters.tag,
      isActive: filters.tag !== "all",
      options: [
        { value: "all", label: "Todas" },
        ...tags.map((t) => ({ value: t, label: t })),
      ],
    });

    // Value filters
    filters.valueFilters.forEach((vf) => {
      if (vf.value) {
        const op = vf.operator === "gte" ? "≥" : "≤";
        list.push({
          key: `vf_${vf.id}`,
          label: `${vf.metric} ${op} ${vf.value}`,
          value: vf.value,
          isActive: true,
          options: [],
        });
      }
    });

    return list;
  }, [filters, accounts, markersMap, tags]);
}
