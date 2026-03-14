import { useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { RiArrowDownSFill } from "@remixicon/react";
import { cn } from "@/lib/utils";
import type { CampaignAdSetData } from "@/services/campaigns";
import { allColumns } from "./columnPresets";
import { getCellValue } from "./campaignCellHelpers";
import { AdsSubTable } from "./AdsSubTable";
import { adsetToMetricRow } from "./mappers";
import { useKpiColorsContext } from "./KpiColorsContext";

interface AdSetsSubTableProps {
  adSets: CampaignAdSetData[];
  columns: string[];
  onToggle: (entityId: string, entityType: "campaign" | "adset" | "ad", active: boolean) => Promise<void>;
  onBudgetChange: (entityId: string, entityType: "campaign" | "adset", dailyBudget: number) => Promise<void>;
}

export function AdSetsSubTable({ adSets, columns, onToggle, onBudgetChange: _onBudgetChange }: AdSetsSubTableProps) {
  const [expandedAdSetId, setExpandedAdSetId] = useState<string | null>(null);
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
            <TableHead className="pl-10 min-w-[180px]">Conjunto</TableHead>
            {visibleCols.map((col) => (
              <TableHead key={col} className="text-right">
                {allColumns[col] || col}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {adSets.map((as_) => {
            const isExpanded = expandedAdSetId === as_.id;
            const isActive = as_.status === "active";
            const row = adsetToMetricRow(as_);

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
    </div>
  );
}
