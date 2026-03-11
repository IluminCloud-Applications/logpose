import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import type { CampaignAdData } from "@/services/campaigns";
import { allColumns } from "./columnPresets";
import { getCellValue } from "./campaignCellHelpers";
import { adToMetricRow } from "./mappers";

interface AdsSubTableProps {
  ads: CampaignAdData[];
  columns: string[];
  onToggle: (entityId: string, entityType: "campaign" | "adset" | "ad", active: boolean) => Promise<void>;
}

export function AdsSubTable({ ads, columns, onToggle }: AdsSubTableProps) {
  const visibleCols = columns.filter((c) => c !== "name");

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
            <TableHead className="pl-20 min-w-[180px]">Anúncio</TableHead>
            {visibleCols.map((col) => (
              <TableHead key={col} className="text-right">
                {allColumns[col] || col}
              </TableHead>
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
                      checked={ad.status === "active"}
                      onCheckedChange={async (checked) => {
                        await onToggle(ad.id, "ad", checked);
                      }}
                    />
                    <span className="font-medium truncate max-w-[180px] block" title={ad.name}>
                      {ad.name}
                    </span>
                  </div>
                </TableCell>
                {visibleCols.map((col) => (
                  <TableCell key={col} className="text-right tabular-nums">
                    {getCellValue(row, col)}
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
