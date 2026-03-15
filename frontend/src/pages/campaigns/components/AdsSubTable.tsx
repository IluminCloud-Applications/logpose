import {
  Table, TableBody, TableCell, TableHeader, TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import type { CampaignAdData } from "@/services/campaigns";
import { allColumns } from "./columnPresets";
import { getCellValue } from "./campaignCellHelpers";
import { adToMetricRow } from "./mappers";
import { useKpiColorsContext } from "./KpiColorsContext";
import { TooltipTableHead } from "./TooltipTableHead";

interface AdsSubTableProps {
  ads: CampaignAdData[];
  columns: string[];
  onToggle: (entityId: string, entityType: "campaign" | "adset" | "ad", active: boolean) => Promise<void>;
}

export function AdsSubTable({ ads, columns, onToggle }: AdsSubTableProps) {
  const visibleCols = columns.filter((c) => c !== "name");
  const kpiColors = useKpiColorsContext();

  if (ads.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-2 pl-20">
        Nenhum anúncio encontrado.
      </p>
    );
  }

  return (
    <div className="bg-muted/10 border-t border-border/20">
      <Table>
        <TableHeader>
          <TableRow className="text-[10px]">
            <TooltipTableHead colKey="name" label="Anúncio" className="pl-20 min-w-[180px]" />
            {visibleCols.map((col) => (
              <TooltipTableHead key={col} colKey={col} label={allColumns[col] || col} className="text-right" />
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {ads.map((ad) => {
            const row = adToMetricRow(ad);
            return (
              <TableRow key={ad.id} className="text-xs">
                <TableCell className="pl-20">
                  <div className="flex items-center gap-2">
                    <Switch
                      size="sm"
                      className="after:pointer-events-none"
                      checked={ad.status === "active"}
                      onCheckedChange={async (checked) => {
                        await onToggle(ad.id, "ad", checked);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                    <span className="font-medium truncate max-w-[180px] block" title={ad.name}>
                      {ad.name}
                    </span>
                  </div>
                </TableCell>
                {visibleCols.map((col) => (
                  <TableCell key={col} className="text-right tabular-nums">
                    {getCellValue(row, col, kpiColors)}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
