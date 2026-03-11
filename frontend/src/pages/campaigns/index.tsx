import { useState, useMemo } from "react";
import { CampaignsHeader } from "./components/CampaignsHeader";
import { CampaignsTable } from "./components/CampaignsTable";
import { BottleneckTable } from "./components/BottleneckTable";
import { CampaignsKpis } from "./components/CampaignsKpis";
import { PresetDrawer } from "./components/PresetDrawer";
import {
  CampaignsInlineFilters,
  defaultCampaignFilters,
  type CampaignFilterState,
} from "./components/CampaignsInlineFilters";
import { defaultPresets, type ColumnPreset } from "./components/columnPresets";
import type { BlurState } from "./components/BlurToggle";
import { QuickFiltersBadges, type QuickFilter } from "@/components/QuickFiltersBadges";
import { getDateRangeLabel, defaultDateRange } from "@/components/DateRangeFilter";
import { useCampaigns, useCampaignPresets, useCampaignFilterOptions } from "@/hooks/useCampaigns";
import { useCampaignTags } from "@/hooks/useCampaignTags";
import { useVturbAccounts } from "@/hooks/useVturbAccounts";
import { campaignToMetricRow } from "./components/mappers";
import type { CampaignData } from "@/services/campaigns";
import { CampaignsLoading } from "./components/CampaignsLoading";
import {
  getDefaultDateRange, computeDateRange, platformLabels, objectiveLabels,
} from "./components/dateHelpers";

export default function CampaignsPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<CampaignFilterState>(defaultCampaignFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [blur, setBlur] = useState<BlurState>({ name: false, values: false, hideUnidentified: false });

  const { tagsMap, allUniqueTags, updateTags } = useCampaignTags();
  const { filterOptions } = useCampaignFilterOptions();
  const { accounts: vturbAccounts } = useVturbAccounts();
  const hasVturb = vturbAccounts.length > 0;

  const { presets: dbPresets, addPreset } = useCampaignPresets();
  const allPresets: ColumnPreset[] = useMemo(() => {
    const fromDb = dbPresets.map((p) => ({ id: String(p.id), name: p.name, columns: p.columns }));
    return [...defaultPresets, ...fromDb];
  }, [dbPresets]);
  const [activePresetId, setActivePresetId] = useState(defaultPresets[0].id);
  const activePreset = allPresets.find((p) => p.id === activePresetId) || allPresets[0];

  const defaultDR = getDefaultDateRange();
  const [dateStart, setDateStart] = useState(defaultDR.start);
  const [dateEnd, setDateEnd] = useState(defaultDR.end);

  const {
    campaigns, unidentified, isLoading, error,
    activeAccountId, toggle, changeBudget,
  } = useCampaigns(dateStart, dateEnd);

  const handleDateRangeChange = (dr: typeof filters.dateRange) => {
    setFilters((p) => ({ ...p, dateRange: dr }));
    const range = computeDateRange(dr.preset, dr.startDate, dr.endDate);
    setDateStart(range.start);
    setDateEnd(range.end);
  };

  const allRows = useMemo(() => {
    const rows: CampaignData[] = [...campaigns];
    if (unidentified && unidentified.sales > 0 && !blur.hideUnidentified) {
      rows.push(unidentified);
    }
    return rows;
  }, [campaigns, unidentified, blur.hideUnidentified]);

  const filtered = useMemo(() => {
    return allRows.filter((c) => {
      const isUnidentified = c.status === "unidentified";
      if (!c.name.toLowerCase().includes(search.toLowerCase())) return false;
      // Unidentified ignora filtros de status e tag (só oculta pelo toggle)
      if (!isUnidentified) {
        if (filters.status !== "all" && c.status !== filters.status) return false;
        if (filters.objective !== "all" && c.objective !== filters.objective) return false;
        if (filters.tag !== "all") {
          const cTags = tagsMap[c.id] || [];
          if (!cTags.includes(filters.tag)) return false;
        }
      }
      for (const vf of filters.valueFilters) {
        const num = parseFloat(vf.value);
        if (isNaN(num)) continue;
        const row = campaignToMetricRow(c);
        const fieldMap: Record<string, number> = {
          spend: row.spend, revenue: row.revenue, profit: row.profit,
          roas: row.roas, cpa: row.cpa, sales: row.sales,
        };
        const fieldVal = fieldMap[vf.metric];
        if (fieldVal === undefined) continue;
        if (vf.operator === "gte" ? fieldVal < num : fieldVal > num) return false;
      }
      return true;
    });
  }, [allRows, search, filters, tagsMap]);

  const quickFilters: QuickFilter[] = [
    {
      key: "status",
      label: "Status",
      value: filters.status,
      isActive: filters.status !== "all",
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
      isActive: filters.objective !== "all",
      options: [
        { value: "all", label: "Todos" },
        ...Object.entries(objectiveLabels).map(([v, l]) => ({ value: v, label: l })),
      ],
    },
  ];

  if (filters.product !== "all") {
    quickFilters.push({ key: "product", label: filters.product, value: filters.product, isActive: true, options: [] });
  }
  if (filters.platform !== "all") {
    quickFilters.push({ key: "platform", label: platformLabels[filters.platform] || filters.platform, value: filters.platform, isActive: true, options: [] });
  }
  if (filters.tag !== "all") {
    quickFilters.push({ key: "tag", label: `Tag: ${filters.tag}`, value: filters.tag, isActive: true, options: [] });
  }
  if (filters.dateRange.preset !== "today") {
    quickFilters.push({ key: "dateRange", label: getDateRangeLabel(filters.dateRange), value: filters.dateRange.preset, isActive: true, options: [] });
  }
  filters.valueFilters.forEach((vf) => {
    if (vf.value) {
      const op = vf.operator === "gte" ? "≥" : "≤";
      quickFilters.push({ key: `vf_${vf.id}`, label: `${vf.metric} ${op} ${vf.value}`, value: vf.value, isActive: true, options: [] });
    }
  });

  const handleFilterChange = (key: string, value: string) => {
    if (key === "status") setFilters((p) => ({ ...p, status: value }));
    else if (key === "objective") setFilters((p) => ({ ...p, objective: value }));
    else if (key === "product") setFilters((p) => ({ ...p, product: "all" }));
    else if (key === "platform") setFilters((p) => ({ ...p, platform: "all" }));
    else if (key === "tag") setFilters((p) => ({ ...p, tag: "all" }));
    else if (key === "dateRange") {
      setFilters((p) => ({ ...p, dateRange: defaultDateRange }));
      const d = getDefaultDateRange();
      setDateStart(d.start);
      setDateEnd(d.end);
    } else if (key.startsWith("vf_")) {
      const id = key.replace("vf_", "");
      setFilters((p) => ({ ...p, valueFilters: p.valueFilters.filter((f) => f.id !== id) }));
    }
  };

  const metricsForKpi = filtered.map(campaignToMetricRow);

  return (
    <div className="flex flex-col gap-6 p-6">
      <CampaignsHeader
        search={search}
        onSearchChange={setSearch}
        onToggleFilters={() => setFiltersOpen((p) => !p)}
        filtersOpen={filtersOpen}
        presets={allPresets}
        activePresetId={activePresetId}
        onPresetChange={setActivePresetId}
        onCreatePreset={() => setDrawerOpen(true)}
        blur={blur}
        onBlurChange={setBlur}
        dateRange={filters.dateRange}
        onDateRangeChange={handleDateRangeChange}
      />
      {filtersOpen && (
        <CampaignsInlineFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClose={() => setFiltersOpen(false)}
          availableTags={allUniqueTags}
          availableProducts={filterOptions.products}
          availablePlatforms={filterOptions.platforms}
        />
      )}
      <CampaignsKpis data={metricsForKpi} />
      <QuickFiltersBadges filters={quickFilters} onChange={handleFilterChange} />
      {isLoading ? (
        <CampaignsLoading />
      ) : error ? (
        <div className="text-center py-12 text-destructive">{error}</div>
      ) : activePresetId === "gargalos" ? (
        <BottleneckTable data={filtered} hasVturb={hasVturb} />
      ) : (
        <CampaignsTable
          data={filtered}
          columns={activePreset.columns}
          blur={blur}
          tagsMap={tagsMap}
          onToggle={toggle}
          onBudgetChange={changeBudget}
          onSaveTags={async (id, tags) => { await updateTags(id, tags); }}
          accountId={activeAccountId}
        />
      )}
      <PresetDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onSave={async (preset: ColumnPreset) => { await addPreset(preset.name, preset.columns); }}
      />
    </div>
  );
}
