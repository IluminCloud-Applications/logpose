import { useState } from "react";
import {
  Table, TableBody, TableCell, TableHeader, TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { RiArrowDownSFill, RiPencilLine } from "@remixicon/react";
import { cn } from "@/lib/utils";
import type { CampaignAdSetData } from "@/services/campaigns";
import { allColumns } from "./columnPresets";
import { getCellValue, fmt } from "./campaignCellHelpers";
import { AdsSubTable } from "./AdsSubTable";
import { adsetToMetricRow } from "./mappers";
import { useKpiColorsContext } from "./KpiColorsContext";
import { TooltipTableHead } from "./TooltipTableHead";
import { BudgetModal } from "./BudgetModal";

interface AdSetsSubTableProps {
  adSets: CampaignAdSetData[];
  columns: string[];
  onToggle: (entityId: string, entityType: "campaign" | "adset" | "ad", active: boolean) => Promise<void>;
  onBudgetChange: (entityId: string, entityType: "campaign" | "adset", dailyBudget: number, entityName?: string, budgetBefore?: number, metrics?: Record<string, number>) => Promise<void>;
}

export function AdSetsSubTable({ adSets, columns, onToggle, onBudgetChange }: AdSetsSubTableProps) {
  const [expandedAdSetId, setExpandedAdSetId] = useState<string | null>(null);
  const [budgetAdSet, setBudgetAdSet] = useState<CampaignAdSetData | null>(null);
  const visibleCols = columns.filter((c) => c !== "name");
  const kpiColors = useKpiColorsContext();

  if (adSets.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-3 px-4">
        Nenhum conjunto de anúncio encontrado.
      </p>
    );
  }

  const handleAdSetClick = (id: string) => {
    setExpandedAdSetId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="bg-muted/20 border-t border-border/30">
      <Table>
        <TableHeader>
          <TableRow className="text-xs">
            <TooltipTableHead colKey="name" label="Conjunto" className="pl-10 min-w-[180px]" />
            {visibleCols.map((col) => (
              <TooltipTableHead key={col} colKey={col} label={allColumns[col] || col} className="text-right" />
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {adSets.map((as_) => {
            const isExpanded = expandedAdSetId === as_.id;
            const isActive = as_.status === "active";
            const row = adsetToMetricRow(as_);
            const hasBudget = as_.budget > 0;

            return (
              <>
                <TableRow
                  key={as_.id}
                  className={cn(
                    "text-xs cursor-pointer transition-colors",
                    isExpanded && "bg-muted/20"
                  )}
                  onClick={() => handleAdSetClick(as_.id)}
                >
                  <TableCell className="pl-10">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <RiArrowDownSFill
                          className={cn(
                            "size-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
                            isExpanded ? "rotate-0" : "-rotate-90"
                          )}
                        />
                        <Switch
                          size="sm"
                          className="after:pointer-events-none"
                          checked={isActive}
                          onCheckedChange={async (checked) => {
                            await onToggle(as_.id, "adset", checked);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        />
                        <span className="font-medium truncate max-w-[200px] block" title={as_.name}>
                          {as_.name}
                        </span>
                      </div>
                      {hasBudget && (
                        <div className="flex items-center gap-1 pl-[3.25rem] relative z-10">
                          <span className="text-[10px] text-muted-foreground tabular-nums">
                            {fmt(as_.budget)}/dia
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); setBudgetAdSet(as_); }}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <RiPencilLine className="size-2.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  {visibleCols.map((col) => (
                    <TableCell key={col} className="text-right tabular-nums">
                      {getCellValue(row, col, kpiColors)}
                    </TableCell>
                  ))}
                </TableRow>
                {isExpanded && as_.ads.length > 0 && (
                  <TableRow key={`${as_.id}-ads`}>
                    <TableCell colSpan={visibleCols.length + 1} className="p-0">
                      <AdsSubTable
                        ads={as_.ads}
                        columns={columns}
                        onToggle={onToggle}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </>
            );
          })}
        </TableBody>
      </Table>

      {budgetAdSet && (
        <BudgetModal
          open={!!budgetAdSet}
          onOpenChange={(open) => { if (!open) setBudgetAdSet(null); }}
          campaignName={budgetAdSet.name}
          currentBudget={budgetAdSet.budget}
          onSave={async (newBudget) => {
            const a = budgetAdSet;
            await onBudgetChange(
              a.id, "adset", newBudget, a.name, a.budget,
              { spend: a.spend, revenue: a.revenue, profit: a.profit, sales: a.sales, roas: a.roas, cpa: a.cpa, cpc: a.cpc, ctr: a.ctr, clicks: a.clicks, impressions: a.impressions },
            );
            setBudgetAdSet(null);
          }}
        />
      )}
    </div>
  );
}

