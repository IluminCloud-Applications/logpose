import { useState, Fragment } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter,
} from "@/components/ui/table";
import type { CampaignData } from "@/services/campaigns";
import { allColumns } from "./columnPresets";
import { AdSetsSubTable } from "./AdSetsSubTable";
import { CampaignModals, type CampaignModalState } from "./CampaignModals";
import { CampaignNameCell } from "./CampaignNameCell";
import { CampaignContextMenu } from "./CampaignContextMenu";
import { cn } from "@/lib/utils";
import type { BlurState } from "./BlurToggle";
import { getCellValue, getFooterValue } from "./campaignCellHelpers";
import { campaignToMetricRow } from "./mappers";
import type { MarkerMap } from "@/hooks/useCampaignMarkers";

interface CampaignsTableProps {
  data: CampaignData[];
  columns: string[];
  blur?: BlurState;
  tagsMap?: Record<string, string[]>;
  markersMap?: MarkerMap;
  onToggle: (entityId: string, entityType: "campaign" | "adset" | "ad", active: boolean) => Promise<void>;
  onBudgetChange: (entityId: string, entityType: "campaign" | "adset", dailyBudget: number) => Promise<void>;
  onSaveTags?: (campaignId: string, tags: string[]) => Promise<void>;
  onSaveMarker?: (campaignId: string, type: "video" | "checkout" | "product" | "platform", refId: string, refLabel: string) => Promise<void>;
  accountId?: number;
}

export function CampaignsTable({
  data, columns,
  blur = { name: false, values: false, hideUnidentified: false },
  tagsMap = {}, markersMap = {},
  onToggle, onBudgetChange, onSaveTags, onSaveMarker,
}: CampaignsTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const ms: CampaignModalState = { open: false, campaign: null };
  const [budgetModal, setBudgetModal] = useState<CampaignModalState>(ms);
  const [tagsModal, setTagsModal] = useState<CampaignModalState>(ms);
  const [videoModal, setVideoModal] = useState<CampaignModalState>(ms);
  const [checkoutModal, setCheckoutModal] = useState<CampaignModalState>(ms);
  const [productModal, setProductModal] = useState<CampaignModalState>(ms);
  const [platformModal, setPlatformModal] = useState<CampaignModalState>(ms);
  const [infoModal, setInfoModal] = useState<CampaignModalState>(ms);

  const visibleCols = columns.filter((c) => c !== "name");
  const blurClass = "blur-sm select-none";

  const handleRowClick = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const openBudgetModal = (e: React.MouseEvent, campaign: CampaignData) => {
    e.stopPropagation();
    setBudgetModal({ open: true, campaign });
  };

  const metricsForFooter = data.map(campaignToMetricRow);

  return (
    <>
      <Card className="border-border/40 premium-table">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[320px]">
                    {allColumns.name}
                  </TableHead>
                  {visibleCols.map((col) => (
                    <TableHead key={col} className="text-right">
                      {allColumns[col] || col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((c) => {
                  const isUnidentified = c.status === "unidentified";
                  const isExpanded = expandedId === c.id;
                  const row = campaignToMetricRow(c);
                  const campaignTags = tagsMap[c.id] || [];

                  const rowContent = (
                    <TableRow
                      key={c.id}
                      className={cn(
                        "transition-colors",
                        isUnidentified
                          ? "bg-[var(--color-warning)]/5"
                          : "cursor-pointer",
                        isExpanded && !isUnidentified && "bg-muted/30"
                      )}
                      onClick={
                        isUnidentified ? undefined : () => handleRowClick(c.id)
                      }
                    >
                      <TableCell>
                        <CampaignNameCell
                          campaign={row}
                          isExpanded={isExpanded}
                          blurName={blur.name}
                          noIdSales={c.no_id_sales}
                          tags={campaignTags}
                          onEditBudget={(e) => openBudgetModal(e, c)}
                          onToggle={async (active) => {
                            await onToggle(c.id, "campaign", active);
                          }}
                        />
                      </TableCell>
                      {visibleCols.map((col) => (
                        <TableCell
                          key={col}
                          className={cn(
                            "text-right tabular-nums",
                            blur.values && blurClass
                          )}
                        >
                          {getCellValue(row, col)}
                        </TableCell>
                      ))}
                    </TableRow>
                  );

                  return (
                    <Fragment key={c.id}>
                      {isUnidentified ? rowContent : (
                        <CampaignContextMenu
                          key={`ctx-${c.id}`}
                          isActive={c.status === "active"}
                          onToggle={() => onToggle(c.id, "campaign", c.status !== "active")}
                          onEditBudget={() => setBudgetModal({ open: true, campaign: c })}
                          onEditTags={() => setTagsModal({ open: true, campaign: c })}
                          onDefineVideo={() => setVideoModal({ open: true, campaign: c })}
                          onDefineCheckout={() => setCheckoutModal({ open: true, campaign: c })}
                          onDefineProduct={() => setProductModal({ open: true, campaign: c })}
                          onDefinePlatform={() => setPlatformModal({ open: true, campaign: c })}
                          onViewInfo={() => setInfoModal({ open: true, campaign: c })}
                        >
                          {rowContent}
                        </CampaignContextMenu>
                      )}
                      {isExpanded && !isUnidentified && c.adsets.length > 0 && (
                        <TableRow key={`${c.id}-adsets`}>
                          <TableCell colSpan={visibleCols.length + 1} className="p-0">
                            <AdSetsSubTable
                              adSets={c.adsets}
                              columns={columns}
                              onToggle={onToggle}
                              onBudgetChange={onBudgetChange}
                            />
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
                    <TableCell
                      key={col}
                      className={cn(
                        "text-right tabular-nums",
                        blur.values && blurClass
                      )}
                    >
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
        platformModal={platformModal} setPlatformModal={setPlatformModal}
        infoModal={infoModal} setInfoModal={setInfoModal}
        tagsMap={tagsMap} markersMap={markersMap}
        onBudgetChange={onBudgetChange}
        onSaveTags={onSaveTags}
        onSaveMarker={onSaveMarker}
      />
    </>
  );
}
