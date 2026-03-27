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

function formatCurrency(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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

  const getStage = (f: FunnelProduct, stageName: string) => {
    return f.stages.find((s) => s.name === stageName);
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
                <TableHead className="min-w-[160px] sticky left-0 bg-muted/30 z-10">
                  Produto
                </TableHead>
                {allStages.map((stage) => (
                  <TableHead key={stage} className="text-right min-w-[120px]">
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
                  {allStages.map((stageName) => {
                    const stage = getStage(f, stageName);
                    return (
                      <TableCell key={stageName} className="text-right tabular-nums text-sm">
                        {stage ? (
                          <div className="flex flex-col items-end">
                            <span className="font-medium">
                              {formatNumber(stage.value)}
                            </span>
                            {stage.revenue != null && stage.revenue > 0 && (
                              <span className="text-[10px] text-primary font-medium">
                                {formatCurrency(stage.revenue)}
                              </span>
                            )}
                          </div>
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
