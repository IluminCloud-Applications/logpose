import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter,
} from "@/components/ui/table";
import { RiCircleFill } from "@remixicon/react";
import type { CampaignData, CampaignConversionData } from "@/services/campaigns";
import { cn } from "@/lib/utils";
import { fmt, fmtMoney, RateBadge } from "./conversionHelpers";

interface ConversionTableProps {
  campaigns: CampaignData[];
  conversionData: CampaignConversionData[];
}

export function ConversionTable({ campaigns, conversionData }: ConversionTableProps) {
  const convMap = new Map<string, CampaignConversionData>();
  conversionData.forEach((c) => convMap.set(c.campaign_id, c));

  const rows = campaigns
    .filter((c) => convMap.has(c.id))
    .map((c) => ({ campaign: c, conv: convMap.get(c.id)! }));

  const totals = rows.reduce(
    (acc, { conv }) => ({
      total: acc.total + conv.total_transactions,
      approved: acc.approved + conv.approved_count,
      pending: acc.pending + conv.pending_count,
      refunded: acc.refunded + conv.refunded_count,
      chargeback: acc.chargeback + conv.chargeback_count,
      trial: acc.trial + conv.trial_count,
      lostRev: acc.lostRev + conv.pending_revenue + conv.refunded_revenue + conv.chargeback_revenue,
    }),
    { total: 0, approved: 0, pending: 0, refunded: 0, chargeback: 0, trial: 0, lostRev: 0 },
  );
  const ttlApproval = totals.total > 0 ? (totals.approved / totals.total) * 100 : 0;
  const ttlLost = totals.pending + totals.refunded + totals.chargeback;
  const ttlLossRate = totals.total > 0 ? (ttlLost / totals.total) * 100 : 0;

  return (
    <Card className="border-border/40 premium-table">
      <CardContent className="p-0">
        <div className="flex items-center px-4 py-2.5 border-b border-border/40">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Conversão & Financeiro
          </span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[160px]">Campanha</TableHead>
                <TableHead className="text-right">Gerados</TableHead>
                <TableHead className="text-right">Aprovados</TableHead>
                <TableHead className="text-right">Pendentes</TableHead>
                <TableHead className="text-right">Reembolsos</TableHead>
                <TableHead className="text-right">Chargebacks</TableHead>
                <TableHead className="text-right">Trials</TableHead>
                <TableHead className="text-right">Aprovação</TableHead>
                <TableHead className="text-right">Perda</TableHead>
                <TableHead className="text-right">Perdido R$</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                    Nenhuma transação encontrada no período
                  </TableCell>
                </TableRow>
              ) : (
                rows.map(({ campaign, conv }) => (
                  <ConversionRow key={campaign.id} campaign={campaign} conv={conv} />
                ))
              )}
            </TableBody>
            {rows.length > 0 && (
              <TableFooter>
                <TableRow className="bg-muted/40 font-semibold">
                  <TableCell>Total ({rows.length})</TableCell>
                  <TableCell className="text-right tabular-nums">{fmt(totals.total)}</TableCell>
                  <TableCell className="text-right tabular-nums">{fmt(totals.approved)}</TableCell>
                  <TableCell className="text-right tabular-nums">{fmt(totals.pending)}</TableCell>
                  <TableCell className="text-right tabular-nums">{fmt(totals.refunded)}</TableCell>
                  <TableCell className="text-right tabular-nums">{fmt(totals.chargeback)}</TableCell>
                  <TableCell className="text-right tabular-nums">{fmt(totals.trial)}</TableCell>
                  <TableCell className="text-right"><RateBadge rate={ttlApproval} good={ttlApproval >= 70} /></TableCell>
                  <TableCell className="text-right"><RateBadge rate={ttlLossRate} good={ttlLossRate < 15} /></TableCell>
                  <TableCell className="text-right tabular-nums text-destructive">
                    {totals.lostRev > 0 ? fmtMoney(totals.lostRev) : "—"}
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function ConversionRow({ campaign, conv }: { campaign: CampaignData; conv: CampaignConversionData }) {
  const lost = conv.pending_count + conv.refunded_count + conv.chargeback_count;
  const lossRate = conv.total_transactions > 0 ? (lost / conv.total_transactions) * 100 : 0;
  const lostRev = conv.pending_revenue + conv.refunded_revenue + conv.chargeback_revenue;

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2.5">
          <RiCircleFill className={cn("size-2 shrink-0",
            campaign.status === "active" ? "text-[var(--color-success)]" :
            campaign.status === "paused" ? "text-destructive" : "text-muted-foreground"
          )} />
          <span className="font-medium truncate max-w-[200px]" title={campaign.name}>{campaign.name}</span>
        </div>
      </TableCell>
      <TableCell className="text-right tabular-nums font-medium">{fmt(conv.total_transactions)}</TableCell>
      <CountCell count={conv.approved_count} revenue={conv.approved_revenue} />
      <CountCell count={conv.pending_count} revenue={conv.pending_revenue} color="text-amber-500" />
      <CountCell count={conv.refunded_count} revenue={conv.refunded_revenue} color="text-destructive" />
      <CountCell count={conv.chargeback_count} revenue={conv.chargeback_revenue} color="text-destructive" />
      <CountCell count={conv.trial_count} revenue={conv.trial_revenue} color="text-chart-3" />
      <TableCell className="text-right"><RateBadge rate={conv.approval_rate} good={conv.approval_rate >= 70} /></TableCell>
      <TableCell className="text-right"><RateBadge rate={lossRate} good={lossRate < 15} /></TableCell>
      <TableCell className="text-right tabular-nums">
        {lostRev > 0 ? (
          <span className="text-destructive font-medium">{fmtMoney(lostRev)}</span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </TableCell>
    </TableRow>
  );
}

function CountCell({ count, revenue, color = "" }: { count: number; revenue: number; color?: string }) {
  return (
    <TableCell className="text-right tabular-nums">
      <div className="flex flex-col items-end">
        <span className={cn("font-medium", count > 0 && color)}>{fmt(count)}</span>
        {count > 0 && (
          <span className={cn("text-[10px] opacity-70", color || "text-muted-foreground")}>
            {fmtMoney(revenue)}
          </span>
        )}
      </div>
    </TableCell>
  );
}
