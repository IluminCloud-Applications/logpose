import { useState, useMemo, useCallback } from "react";
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
import { useCampaignPrefetch } from "@/hooks/useCampaignPrefetch";

import { campaignToMetricRow } from "./components/mappers";
import type { CampaignData } from "@/services/campaigns";
import { CampaignsLoading } from "./components/CampaignsLoading";
import { filterCampaigns } from "./components/filterCampaigns";
import { getDefaultDateRange, computeDateRange } from "./components/dateHelpers";
import { useQuickFilters } from "./components/useQuickFilters";
import type { ValueFilter } from "@/components/ValueFiltersSection";
import { useCampaignPageData } from "@/hooks/useCampaignPageData";
import { useKpiColors } from "@/hooks/useKpiColors";
import { invalidateCacheByPrefix } from "@/lib/queryCache";

const DEFAULT_PRESET_IDS = defaultPresets.map((p) => p.id);

export default function CampaignsPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<CampaignFilterState>(defaultCampaignFilters);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<ColumnPreset | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [blur, setBlur] = useState<BlurState>({
    name: false, values: false, hideUnidentified: false, hiddenProducts: [],
  });

  const { tagsMap, allUniqueTags, updateTags } = useCampaignTags();
  const { markersMap, saveMarker } = useCampaignMarkers();
  const { accounts: vturbAccounts } = useVturbAccounts();
  const hasVturb = vturbAccounts.length > 0;
  const { kpiColors, save: saveKpiColors } = useKpiColors();

  const { presets: dbPresets, addPreset, editPreset, removePreset } = useCampaignPresets();
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
    toggle, changeBudget, silentReload,
  } = useCampaigns(dateStart, dateEnd);

  useCampaignPrefetch(activeAccountId);

  const handleRefresh = useCallback(async () => {
    invalidateCacheByPrefix("campaigns");
    await silentReload();
  }, [silentReload]);

  const unidentifiedProducts = unidentified?.products ?? [];

  const allRows = useMemo(() => {
    const rows: CampaignData[] = [...campaigns];
    if (!unidentified || unidentified.sales <= 0) return rows;
    if (blur.hideUnidentified) return rows;

    if (blur.hiddenProducts.length > 0 && unidentifiedProducts.length > 0) {
      const visibleProducts = unidentifiedProducts.filter(
        (p) => !blur.hiddenProducts.includes(p.name),
      );
      if (visibleProducts.length === 0) return rows;
      const filteredSales = visibleProducts.reduce((s, p) => s + p.sales, 0);
      const filteredRevenue = visibleProducts.reduce((s, p) => s + p.revenue, 0);
      rows.push({
        ...unidentified,
        sales: filteredSales,
        revenue: filteredRevenue,
        profit: filteredRevenue,
      });
    } else {
      rows.push(unidentified);
    }
    return rows;
  }, [campaigns, unidentified, blur.hideUnidentified, blur.hiddenProducts, unidentifiedProducts]);

  const filtered = useMemo(
    () => filterCampaigns(allRows, search, filters, tagsMap, markersMap),
    [allRows, search, filters, tagsMap, markersMap],
  );

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
    else if (key === "bidStrategy") setFilters((p) => ({ ...p, bidStrategy: value }));
    else if (key === "budgetType") setFilters((p) => ({ ...p, budgetType: value }));
    else if (key === "product") setFilters((p) => ({ ...p, product: value }));
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

  const handleSavePreset = async (preset: ColumnPreset) => {
    if (editingPreset) {
      await editPreset(Number(preset.id), preset.name, preset.columns);
    } else {
      await addPreset(preset.name, preset.columns);
    }
    setEditingPreset(null);
  };

  const handleEditPreset = (preset: ColumnPreset) => {
    setEditingPreset(preset);
    setDrawerOpen(true);
  };

  const handleDeletePreset = async (presetId: string) => {
    await removePreset(Number(presetId));
    if (activePresetId === presetId) {
      setActivePresetId(defaultPresets[0].id);
    }
  };

  const metricsForKpi = filtered.map(campaignToMetricRow);
  useCampaignPageData(filtered, filters, dateStart, dateEnd);

  return (
    <div className="flex flex-col gap-6 p-6 min-w-0">
      <CampaignsHeader
        search={search}
        onSearchChange={setSearch}
        presets={allPresets}
        activePresetId={activePresetId}
        onPresetChange={setActivePresetId}
        onCreatePreset={() => { setEditingPreset(null); setDrawerOpen(true); }}
        onEditPreset={handleEditPreset}
        onDeletePreset={handleDeletePreset}
        blur={blur}
        onBlurChange={setBlur}
        unidentifiedProducts={unidentifiedProducts}
        onRefresh={handleRefresh}
        onOpenSettings={() => setSettingsOpen(true)}
        defaultPresetIds={DEFAULT_PRESET_IDS}
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
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) setEditingPreset(null);
        }}
        onSave={handleSavePreset}
        editingPreset={editingPreset}
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
