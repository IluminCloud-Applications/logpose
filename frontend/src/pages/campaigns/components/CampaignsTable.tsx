import { useState, useCallback, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHeader, TableRow, TableFooter,
} from "@/components/ui/table";
import type { CampaignData } from "@/services/campaigns";
import { allColumns } from "./columnPresets";
import { AdSetsSubTable } from "./AdSetsSubTable";
import { CampaignModals, type CampaignModalState } from "./CampaignModals";
import { CampaignNameCell } from "./CampaignNameCell";
import { CampaignContextMenu } from "./CampaignContextMenu";
import { DeactivateConfirmModal, type DeactivateMetrics } from "./DeactivateConfirmModal";
import { findEntityMetrics } from "./entityHelpers";
import { cn } from "@/lib/utils";
import type { BlurState } from "./BlurToggle";
import { getCellValue, getFooterValue } from "./campaignCellHelpers";
import { campaignToMetricRow } from "./mappers";
import { SortableTableHead } from "./SortableTableHead";
import { useCampaignSort } from "./useCampaignSort";
import type { MarkerMap } from "@/hooks/useCampaignMarkers";
import { useKpiColorsContext } from "./KpiColorsContext";
import { handleExportCampaignFromTable } from "./exportCampaign";
import { handleDuplicateCampaign } from "./duplicateCampaign";

interface CampaignsTableProps {
  data: CampaignData[];
  columns: string[];
  blur?: BlurState;
  tagsMap?: Record<string, string[]>;
  markersMap?: MarkerMap;
  onToggle: (entityId: string, entityType: "campaign" | "adset" | "ad", active: boolean, entityName?: string, metrics?: Record<string, number>, budget?: number) => Promise<void>;
  onBudgetChange: (entityId: string, entityType: "campaign" | "adset", dailyBudget: number, entityName?: string, budgetBefore?: number, metrics?: Record<string, number>) => Promise<void>;
  onSaveTags?: (campaignId: string, tags: string[]) => Promise<void>;
  onSaveMarker?: (campaignId: string, type: "video" | "checkout" | "product" | "platform", refId: string, refLabel: string) => Promise<void>;
  accountId?: number;
}

interface DeactivateState {
  open: boolean;
  entityId: string;
  entityName: string;
  entityType: "campaign" | "adset" | "ad";
  metrics: DeactivateMetrics;
}

const emptyMetrics: DeactivateMetrics = {
  spend: 0, revenue: 0, profit: 0, roas: 0, cpa: 0, cpc: 0, ctr: 0, sales: 0, clicks: 0, impressions: 0, budget: 0,
};
const emptyDeactivate: DeactivateState = {
  open: false, entityId: "", entityName: "", entityType: "campaign", metrics: emptyMetrics,
};

export function CampaignsTable({
  data, columns,
  blur = { name: false, values: false, hideUnidentified: false },
  tagsMap = {}, markersMap = {},
  onToggle, onBudgetChange, onSaveTags, onSaveMarker,
  accountId,
}: CampaignsTableProps) {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const ms: CampaignModalState = { open: false, campaign: null };
  const [budgetModal, setBudgetModal] = useState<CampaignModalState>(ms);
  const [tagsModal, setTagsModal] = useState<CampaignModalState>(ms);
  const [videoModal, setVideoModal] = useState<CampaignModalState>(ms);
  const [checkoutModal, setCheckoutModal] = useState<CampaignModalState>(ms);
  const [productModal, setProductModal] = useState<CampaignModalState>(ms);
  const [infoModal, setInfoModal] = useState<CampaignModalState>(ms);
  const [deactivateModal, setDeactivateModal] = useState<DeactivateState>(emptyDeactivate);
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  const visibleCols = columns.filter((c) => c !== "name");
  const blurClass = "blur-sm select-none";
  const kpiColors = useKpiColorsContext();
  const { sorted: sortedData, sortKey, toggleSort } = useCampaignSort(data);

  /** Intercepts toggle: if deactivating, shows confirmation modal first. */
  const handleToggle = useCallback(
    async (entityId: string, entityType: "campaign" | "adset" | "ad", active: boolean) => {
      const found = findEntityMetrics(data, entityId, entityType);
      const metricsObj = found ? {
        spend: found.metrics.spend, revenue: found.metrics.revenue,
        profit: found.metrics.profit, sales: found.metrics.sales,
        roas: found.metrics.roas, cpa: found.metrics.cpa,
        cpc: found.metrics.cpc || 0, ctr: found.metrics.ctr || 0,
        clicks: found.metrics.clicks, impressions: found.metrics.impressions,
      } : undefined;

      if (active) {
        await onToggle(entityId, entityType, true, found?.name, metricsObj, found?.metrics.budget);
        return;
      }
      if (!found) { await onToggle(entityId, entityType, false); return; }
      setDeactivateModal({ open: true, entityId, entityName: found.name, entityType, metrics: found.metrics });
    }, [data, onToggle],
  );

  const confirmDeactivate = async () => {
    setDeactivateLoading(true);
    const m = deactivateModal.metrics;
    const metricsObj = {
      spend: m.spend, revenue: m.revenue, profit: m.profit,
      sales: m.sales, roas: m.roas, cpa: m.cpa,
      clicks: m.clicks, impressions: m.impressions,
    };
    try {
      await onToggle(
        deactivateModal.entityId, deactivateModal.entityType, false,
        deactivateModal.entityName, metricsObj, m.budget,
      );
    }
    finally { setDeactivateLoading(false); setDeactivateModal(emptyDeactivate); }
  };

  const metricsForFooter = sortedData.map(campaignToMetricRow);

  return (
    <>
      <Card className="border-border/40 premium-table">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead
                    colKey="name"
                    label={allColumns.name}
                    sortKey={sortKey}
                    onSort={toggleSort}
                    className="min-w-[320px]"
                  />
                  {visibleCols.map((col) => (
                    <SortableTableHead
                      key={col}
                      colKey={col}
                      label={allColumns[col] || col}
                      sortKey={sortKey}
                      onSort={toggleSort}
                      className="text-right"
                    />
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((c) => {
                  const isUnidentified = c.status === "unidentified";
                  const isExpanded = expandedId === c.id;
                  const row = campaignToMetricRow(c);
                  const tags = tagsMap[c.id] || [];

                  const rowContent = (
                    <TableRow
                      key={c.id}
                      className={cn("transition-colors", isUnidentified ? "bg-[var(--color-warning)]/5" : "cursor-pointer", isExpanded && !isUnidentified && "bg-muted/30")}
                      onClick={isUnidentified ? undefined : () => setExpandedId((p) => (p === c.id ? null : c.id))}
                    >
                      <TableCell>
                        <CampaignNameCell
                          campaign={row} isExpanded={isExpanded} blurName={blur.name}
                          noIdSales={c.no_id_sales} tags={tags}
                          onEditBudget={(e) => { e.stopPropagation(); setBudgetModal({ open: true, campaign: c }); }}
                          onToggle={(active) => handleToggle(c.id, "campaign", active)}
                        />
                      </TableCell>
                      {visibleCols.map((col) => (
                        <TableCell key={col} className={cn("text-right tabular-nums", blur.values && blurClass)}>
                          {getCellValue(row, col, kpiColors)}
                        </TableCell>
                      ))}
                    </TableRow>
                  );

                  return (
                    <Fragment key={c.id}>
                      {isUnidentified ? rowContent : (
                        <CampaignContextMenu
                          isActive={row.status === "active"}
                          onToggle={() => handleToggle(c.id, "campaign", row.status !== "active")}
                          onEditBudget={() => setBudgetModal({ open: true, campaign: c })}
                          onEditTags={() => setTagsModal({ open: true, campaign: c })}
                          onDefineVideo={() => setVideoModal({ open: true, campaign: c })}
                          onDefineCheckout={() => setCheckoutModal({ open: true, campaign: c })}
                          onDefineProduct={() => setProductModal({ open: true, campaign: c })}
                          onExportCampaign={() => handleExportCampaignFromTable({ campaign: c, markersMap, accountId })}
                          onDuplicateCampaign={() => handleDuplicateCampaign({ campaign: c, markersMap, accountId, navigate })}
                          onViewInfo={() => setInfoModal({ open: true, campaign: c })}
                        >{rowContent}</CampaignContextMenu>
                      )}
                      {isExpanded && !isUnidentified && c.adsets.length > 0 && (
                        <TableRow key={`${c.id}-adsets`}>
                          <TableCell colSpan={visibleCols.length + 1} className="p-0">
                            <AdSetsSubTable adSets={c.adsets} columns={columns} onToggle={handleToggle} onBudgetChange={onBudgetChange} />
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-muted/40 font-semibold">
                  <TableCell>Total ({data.length})</TableCell>
                  {visibleCols.map((col) => (
                    <TableCell key={col} className={cn("text-right tabular-nums", blur.values && blurClass)}>
                      {getFooterValue(metricsForFooter, col)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CampaignModals
        budgetModal={budgetModal} setBudgetModal={setBudgetModal}
        tagsModal={tagsModal} setTagsModal={setTagsModal}
        videoModal={videoModal} setVideoModal={setVideoModal}
        checkoutModal={checkoutModal} setCheckoutModal={setCheckoutModal}
        productModal={productModal} setProductModal={setProductModal}
        infoModal={infoModal} setInfoModal={setInfoModal}
        tagsMap={tagsMap} markersMap={markersMap}
        onBudgetChange={onBudgetChange} onSaveTags={onSaveTags} onSaveMarker={onSaveMarker}
      />

      <DeactivateConfirmModal
        open={deactivateModal.open}
        onOpenChange={(open) => { if (!open) setDeactivateModal(emptyDeactivate); }}
        entityName={deactivateModal.entityName}
        entityType={deactivateModal.entityType}
        metrics={deactivateModal.metrics}
        onConfirm={confirmDeactivate}
        loading={deactivateLoading}
      />
    </>
  );
}
