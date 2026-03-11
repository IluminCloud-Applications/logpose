import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { FunnelProduct } from "@/services/funnel";

function formatNumber(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return v.toLocaleString("pt-BR");
}

function getAllStages(funnels: FunnelProduct[]): string[] {
  const stageSet = new Set<string>();
  funnels.forEach((f) => f.stages.forEach((s) => stageSet.add(s.name)));
  return Array.from(stageSet);
}

interface FunnelStatsProps {
  funnels: FunnelProduct[];
}

export function FunnelStats({ funnels }: FunnelStatsProps) {
  const allStages = getAllStages(funnels);

  const getStageValue = (f: FunnelProduct, stageName: string): number | null => {
    return f.stages.find((s) => s.name === stageName)?.value ?? null;
  };

  return (
    <Card className="border-border/40 premium-table">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Comparativo de Etapas por Produto</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[160px] sticky left-0 bg-muted/30 z-10">Produto</TableHead>
                {allStages.map((stage) => (
                  <TableHead key={stage} className="text-right min-w-[100px]">
                    {stage}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {funnels.map((f) => (
                <TableRow key={f.productId}>
                  <TableCell className="font-medium text-sm sticky left-0 bg-card z-10">
                    {f.productName}
                  </TableCell>
                  {allStages.map((stage) => {
                    const val = getStageValue(f, stage);
                    return (
                      <TableCell key={stage} className="text-right tabular-nums text-sm">
                        {val !== null ? (
                          <span className="font-medium">{formatNumber(val)}</span>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
