import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RiCircleFill, RiEyeLine, RiEyeOffLine } from "@remixicon/react";
import type { CampaignData } from "@/services/campaigns";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface BottleneckTableProps {
  data: CampaignData[];
  hasVturb: boolean;
}

interface FunnelStage {
  label: string;
  getValue: (c: CampaignData) => number;
  getRate: (c: CampaignData) => number;
  rateLabel: string;
  requiresVturb?: boolean;
}

const allFunnelStages: FunnelStage[] = [
  {
    label: "Cliques",
    getValue: (c) => c.clicks,
    getRate: (c) => c.ctr,
    rateLabel: "CTR",
  },
  {
    label: "LPV",
    getValue: (c) => c.landing_page_views,
    getRate: (c) => c.clicks > 0 ? (c.landing_page_views / c.clicks) * 100 : 0,
    rateLabel: "Connect",
  },
  {
    label: "Plays VSL",
    getValue: (c) => (c as CampaignData & { plays_vsl?: number }).plays_vsl ?? 0,
    getRate: (c) => {
      const plays = (c as CampaignData & { plays_vsl?: number }).plays_vsl ?? 0;
      return c.landing_page_views > 0 ? (plays / c.landing_page_views) * 100 : 0;
    },
    rateLabel: "Play",
    requiresVturb: true,
  },
  {
    label: "Checkout",
    getValue: (c) => c.initiate_checkout,
    getRate: (c) => c.landing_page_views > 0 ? (c.initiate_checkout / c.landing_page_views) * 100 : 0,
    rateLabel: "Conv.",
  },
  {
    label: "Vendas",
    getValue: (c) => c.sales,
    getRate: (c) => c.initiate_checkout > 0 ? (c.sales / c.initiate_checkout) * 100 : 0,
    rateLabel: "Conv.",
  },
];

export function BottleneckTable({ data, hasVturb }: BottleneckTableProps) {
  const [showLosses, setShowLosses] = useState(false);
  const funnelStages = allFunnelStages.filter((s) => !s.requiresVturb || hasVturb);

  return (
    <Card className="border-border/40 premium-table">
      <CardContent className="p-0">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/40">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Funil de Conversão
          </span>
          <Button
            variant={showLosses ? "default" : "outline"}
            size="xs"
            onClick={() => setShowLosses(!showLosses)}
            className="gap-1.5"
          >
            {showLosses ? <RiEyeOffLine className="size-3" /> : <RiEyeLine className="size-3" />}
            {showLosses ? "Ocultar Perdas" : "Mostrar Perdas"}
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[220px]">Campanha</TableHead>
                {funnelStages.map((stage) => (
                  <TableHead key={stage.label} className="text-right">
                    {stage.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((c) => (
                <BottleneckRow key={c.id} campaign={c} showLosses={showLosses} funnelStages={funnelStages} />
              ))}
            </TableBody>
            <BottleneckFooter data={data} funnelStages={funnelStages} />
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function BottleneckRow({ campaign, showLosses, funnelStages }: { campaign: CampaignData; showLosses: boolean; funnelStages: FunnelStage[] }) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2.5">
          <RiCircleFill className={cn("size-2 shrink-0",
            campaign.status === "active" ? "text-[var(--color-success)]" :
            campaign.status === "paused" ? "text-destructive" : "text-muted-foreground"
          )} />
          <span className="font-medium">{campaign.name}</span>
        </div>
      </TableCell>
      {funnelStages.map((stage, i) => {
        const value = stage.getValue(campaign);
        const rate = stage.getRate(campaign);
        const prevValue = i > 0 ? funnelStages[i - 1].getValue(campaign) : 0;
        const lost = i > 0 ? prevValue - value : 0;
        const lostPct = i > 0 && prevValue > 0 ? (lost / prevValue) * 100 : 0;

        return (
          <TableCell key={stage.label} className="text-right tabular-nums">
            <FunnelCell
              value={value} rate={rate} rateLabel={stage.rateLabel}
              lost={lost} lostPct={lostPct} showLoss={showLosses && i > 0}
            />
          </TableCell>
        );
      })}
    </TableRow>
  );
}

function FunnelCell({
  value, rate, rateLabel, lost, lostPct, showLoss,
}: {
  value: number; rate: number; rateLabel: string;
  lost: number; lostPct: number; showLoss: boolean;
}) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <div className="flex items-center gap-1.5">
        <span className="font-medium">{value.toLocaleString("pt-BR")}</span>
        <span className="text-[10px] text-muted-foreground/70">|</span>
        <span className="text-xs text-muted-foreground">
          {rate.toFixed(1)}%
          <span className="text-[10px] ml-0.5 opacity-60">{rateLabel}</span>
        </span>
      </div>
      {showLoss && lost > 0 && (
        <span className="text-[10px] text-destructive font-medium animate-in fade-in slide-in-from-top-1 duration-200">
          −{lost.toLocaleString("pt-BR")} ({lostPct.toFixed(1)}%)
        </span>
      )}
    </div>
  );
}

function BottleneckFooter({ data, funnelStages }: { data: CampaignData[]; funnelStages: FunnelStage[] }) {
  return (
    <TableFooter>
      <TableRow className="bg-muted/40 font-semibold">
        <TableCell>Total ({data.length})</TableCell>
        {funnelStages.map((stage) => {
          const total = data.reduce((s, c) => s + stage.getValue(c), 0);
          return (
            <TableCell key={stage.label} className="text-right tabular-nums">
              {total.toLocaleString("pt-BR")}
            </TableCell>
          );
        })}
      </TableRow>
    </TableFooter>
  );
}
