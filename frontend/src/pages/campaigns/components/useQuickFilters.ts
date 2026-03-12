import { useMemo } from "react";
import type { QuickFilter } from "@/components/QuickFiltersBadges";
import { objectiveLabels } from "./dateHelpers";
import type { CampaignFilterState } from "./CampaignsInlineFilters";

interface QuickFiltersOptions {
  filters: CampaignFilterState;
  products: { id: number; name: string }[];
  platforms: { value: string; label: string }[];
  tags: string[];
}

const datePresetLabels: Record<string, string> = {
  today: "Hoje", yesterday: "Ontem", "3d": "3 dias", "7d": "7 dias",
  "30d": "30 dias", "90d": "90 dias", all: "Máximo",
};

function formatCustomLabel(startDate: string, endDate: string): string {
  if (!startDate || !endDate) return "Personalizado";
  const fmt = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  return `${fmt(startDate)} — ${fmt(endDate)}`;
}

export function useQuickFilters({ filters, products, platforms, tags }: QuickFiltersOptions) {
  return useMemo<QuickFilter[]>(() => {
    const datePreset = filters.dateRange.preset;
    const dateLabel = datePreset === "custom"
      ? formatCustomLabel(filters.dateRange.startDate, filters.dateRange.endDate)
      : (datePresetLabels[datePreset] ?? "Hoje");

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
        key: "product",
        label: "Produto",
        value: filters.product,
        isActive: filters.product !== "all",
        options: [
          { value: "all", label: "Todos" },
          ...products.map((p) => ({ value: p.name, label: p.name })),
        ],
      },
      {
        key: "platform",
        label: "Plataforma",
        value: filters.platform,
        isActive: filters.platform !== "all",
        options: [
          { value: "all", label: "Todas" },
          ...platforms.map((p) => ({ value: p.value, label: p.label })),
        ],
      },
      {
        key: "tag",
        label: "Tag",
        value: filters.tag,
        isActive: filters.tag !== "all",
        options: [
          { value: "all", label: "Todas" },
          ...tags.map((t) => ({ value: t, label: t })),
        ],
      },
    ];

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
  }, [filters, products, platforms, tags]);
}
