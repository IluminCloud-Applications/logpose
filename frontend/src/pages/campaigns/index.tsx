import { useState, useMemo } from "react";
import { CampaignsHeader } from "./components/CampaignsHeader";
import { CampaignsTable } from "./components/CampaignsTable";
import { BottleneckTabs } from "./components/BottleneckTabs";
import { CampaignsKpis } from "./components/CampaignsKpis";
import { PresetDrawer } from "./components/PresetDrawer";
import { KpiColorsDrawer } from "./components/KpiColorsDrawer";
import { KpiColorsProvider } from "./components/KpiColorsContext";
import {
  defaultCampaignFilters,
  type CampaignFilterState,
} from "./components/CampaignsInlineFilters";
import { defaultPresets, type ColumnPreset } from "./components/columnPresets";
import type { BlurState } from "./components/BlurToggle";
import { QuickFiltersBadges } from "@/components/QuickFiltersBadges";
import { AddValueFilterPopover } from "@/components/AddValueFilterPopover";
import { useCampaigns, useCampaignPresets } from "@/hooks/useCampaigns";
import { useCampaignTags } from "@/hooks/useCampaignTags";
import { useCampaignMarkers } from "@/hooks/useCampaignMarkers";
import { useVturbAccounts } from "@/hooks/useVturbAccounts";
import { campaignToMetricRow } from "./components/mappers";
import type { CampaignData } from "@/services/campaigns";
import { CampaignsLoading } from "./components/CampaignsLoading";
import { getDefaultDateRange, computeDateRange } from "./components/dateHelpers";
import { useQuickFilters } from "./components/useQuickFilters";
import type { ValueFilter } from "@/components/ValueFiltersSection";
import { useCampaignPageData } from "@/hooks/useCampaignPageData";
import { useKpiColors } from "@/hooks/useKpiColors";

export default function CampaignsPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<CampaignFilterState>(defaultCampaignFilters);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [blur, setBlur] = useState<BlurState>({ name: false, values: false, hideUnidentified: false });

  const { tagsMap, allUniqueTags, updateTags } = useCampaignTags();
  const { markersMap, saveMarker } = useCampaignMarkers();
  const { accounts: vturbAccounts } = useVturbAccounts();
  const hasVturb = vturbAccounts.length > 0;
  const { kpiColors, save: saveKpiColors } = useKpiColors();

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
    accounts: fbAccounts, activeAccountId, setSelectedAccountId,
    toggle, changeBudget, reload,
  } = useCampaigns(dateStart, dateEnd);

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
      if (!isUnidentified) {
        if (filters.status !== "all" && c.status !== filters.status) return false;
        if (filters.objective !== "all" && c.objective !== filters.objective) return false;
        if (filters.tag !== "all") {
          const cTags = tagsMap[c.id] || [];
          if (!cTags.includes(filters.tag)) return false;
        }
        // Marker-based filters
        const cMarkers = markersMap[c.id];
        if (filters.product !== "all") {
          if (!cMarkers?.product || cMarkers.product.reference_id !== filters.product) return false;
        }
        if (filters.platform !== "all") {
          if (!cMarkers?.platform || cMarkers.platform.reference_id !== filters.platform) return false;
        }
        if (filters.video !== "all") {
          if (!cMarkers?.video || cMarkers.video.reference_id !== filters.video) return false;
        }
        if (filters.checkout !== "all") {
          if (!cMarkers?.checkout || cMarkers.checkout.reference_id !== filters.checkout) return false;
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
  }, [allRows, search, filters, tagsMap, markersMap]);

  const quickFilters = useQuickFilters({
    filters,
    accounts: fbAccounts,
    markersMap,
    tags: allUniqueTags,
  });

  const handleFilterChange = (key: string, value: string) => {
    if (key === "dateRange") {
      if (value.startsWith("custom|")) {
        const [, start, end] = value.split("|");
        setFilters((p) => ({ ...p, dateRange: { preset: "custom" as any, startDate: start, endDate: end } }));
        setDateStart(start);
        setDateEnd(end);
      } else {
        setFilters((p) => ({ ...p, dateRange: { preset: value as any, startDate: "", endDate: "" } }));
        const range = computeDateRange(value);
        setDateStart(range.start);
        setDateEnd(range.end);
      }
    } else if (key === "status") setFilters((p) => ({ ...p, status: value }));
    else if (key === "objective") setFilters((p) => ({ ...p, objective: value }));
    else if (key === "account") {
      setFilters((p) => ({ ...p, account: value }));
      setSelectedAccountId(value === "all" ? undefined : Number(value));
    }
    else if (key === "product") setFilters((p) => ({ ...p, product: value }));
    else if (key === "platform") setFilters((p) => ({ ...p, platform: value }));
    else if (key === "video") setFilters((p) => ({ ...p, video: value }));
    else if (key === "checkout") setFilters((p) => ({ ...p, checkout: value }));
    else if (key === "tag") setFilters((p) => ({ ...p, tag: value }));
    else if (key.startsWith("vf_")) {
      const id = key.replace("vf_", "");
      setFilters((p) => ({ ...p, valueFilters: p.valueFilters.filter((f) => f.id !== id) }));
    }
  };

  const addValueFilter = (vf: ValueFilter) => {
    setFilters((p) => ({ ...p, valueFilters: [...p.valueFilters, vf] }));
  };

  const metricsForKpi = filtered.map(campaignToMetricRow);

  // Registra dados da página para a AI
  useCampaignPageData(filtered, filters, dateStart, dateEnd);

  return (
    <div className="flex flex-col gap-6 p-6">
      <CampaignsHeader
        search={search}
        onSearchChange={setSearch}
        presets={allPresets}
        activePresetId={activePresetId}
        onPresetChange={setActivePresetId}
        onCreatePreset={() => setDrawerOpen(true)}
        blur={blur}
        onBlurChange={setBlur}
        onRefresh={reload}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <CampaignsKpis data={metricsForKpi} />
      <div className="flex flex-wrap items-center gap-2">
        <QuickFiltersBadges filters={quickFilters} onChange={handleFilterChange} />
        <AddValueFilterPopover onAdd={addValueFilter} />
      </div>
      {isLoading ? (
        <CampaignsLoading />
      ) : error ? (
        <div className="text-center py-12 text-destructive">{error}</div>
      ) : activePresetId === "gargalos" ? (
        <BottleneckTabs data={filtered} hasVturb={hasVturb} dateStart={dateStart} dateEnd={dateEnd} />
      ) : (
        <KpiColorsProvider value={kpiColors}>
          <CampaignsTable
            data={filtered}
            columns={activePreset.columns}
            blur={blur}
            tagsMap={tagsMap}
            markersMap={markersMap}
            onToggle={toggle}
            onBudgetChange={changeBudget}
            onSaveTags={async (id, tags) => { await updateTags(id, tags); }}
            onSaveMarker={async (id, type, refId, refLabel) => {
              await saveMarker(id, type, refId, refLabel);
            }}
            accountId={activeAccountId}
          />
        </KpiColorsProvider>
      )}
      <PresetDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onSave={async (preset: ColumnPreset) => { await addPreset(preset.name, preset.columns); }}
      />
      <KpiColorsDrawer
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        kpiColors={kpiColors}
        onSave={saveKpiColors}
      />
    </div>
  );
}
