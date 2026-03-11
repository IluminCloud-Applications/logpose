import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { TopCampaign } from "@/types/dashboard";

function fmt(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
}

interface TopCampaignsProps {
  data: TopCampaign[];
}

export function TopCampaigns({ data }: TopCampaignsProps) {
  if (data.length === 0) {
    return (
      <Card className="border-border/40">
        <CardContent className="flex items-center justify-center h-[200px] text-muted-foreground">
          Sem campanhas no período
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Top Campanhas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4">
        {data.slice(0, 3).map((campaign, index) => (
          <div
            key={campaign.name}
            className="group flex items-center justify-between rounded-lg border border-transparent p-3 transition-all duration-200 hover:border-border hover:bg-muted/50"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                #{index + 1}
              </span>
              <div className="min-w-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm font-medium truncate max-w-[180px]">
                      {campaign.name}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[320px]">
                    <p className="text-xs">{campaign.name}</p>
                  </TooltipContent>
                </Tooltip>
                <p className="text-xs text-muted-foreground">
                  {campaign.sales} vendas
                  {campaign.spend > 0 ? ` · Invest. ${fmt(campaign.spend)}` : ""}
                  {campaign.cpa > 0 ? ` · CPA ${fmt(campaign.cpa)}` : ""}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0 ml-3">
              <p className="text-sm font-semibold tabular-nums">
                {fmt(campaign.revenue)}
              </p>
              <div className="flex items-center gap-2 justify-end">
                {campaign.profit !== 0 && (
                  <p
                    className={cn(
                      "text-xs font-medium tabular-nums",
                      campaign.profit >= 0
                        ? "text-[var(--color-success)]"
                        : "text-destructive"
                    )}
                  >
                    {campaign.profit >= 0 ? "+" : ""}{fmt(campaign.profit)}
                  </p>
                )}
                {campaign.roas > 0 && (
                  <p
                    className={cn(
                      "text-xs font-medium tabular-nums",
                      campaign.roas >= 3
                        ? "text-[var(--color-success)]"
                        : campaign.roas >= 2
                        ? "text-[var(--color-warning)]"
                        : "text-destructive"
                    )}
                  >
                    {campaign.roas.toFixed(2)}x
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
