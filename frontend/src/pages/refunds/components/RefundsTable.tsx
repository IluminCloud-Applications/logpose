import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RiEditLine, RiCheckboxCircleLine } from "@remixicon/react";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationBar } from "@/components/PaginationBar";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";
import type { RefundItem } from "@/services/refunds";
import { reasonLabels } from "@/services/refunds";

interface RefundsTableProps {
  data: RefundItem[];
  loading: boolean;
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  onAddReason: (item: RefundItem) => void;
}

const platformColors: Record<string, string> = {
  kiwify: "bg-chart-1/15 text-chart-1 border-chart-1/20",
  payt: "bg-chart-2/15 text-chart-2 border-chart-2/20",
};

export function RefundsTable({
  data, loading, total, page, onPageChange, onAddReason,
}: RefundsTableProps) {
  return (
    <Card className="border-border/40 premium-table">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Plataforma</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead className="text-center w-[60px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    Nenhum reembolso encontrado
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <RefundRow key={item.id} item={item} onAddReason={onAddReason} />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <PaginationBar
          total={total}
          page={page}
          onPageChange={onPageChange}
          label="reembolsos"
        />
      </CardContent>
    </Card>
  );
}

function RefundRow({ item, onAddReason }: { item: RefundItem; onAddReason: (i: RefundItem) => void }) {
  const isChargeback = item.status === "chargeback";
  const platform = platformColors[item.platform] ?? "";

  return (
    <TableRow>
      <TableCell className="tabular-nums whitespace-nowrap text-muted-foreground">
        {item.created_at
          ? new Date(item.created_at).toLocaleString("pt-BR", {
              day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
            })
          : "—"}
      </TableCell>
      <TableCell className="font-medium max-w-[160px] truncate">
        {item.product_name || "—"}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={`text-[10px] font-medium border ${platform}`}>
          {item.platform === "kiwify" ? "Kiwify" : "PayT"}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={`text-[10px] font-medium ${
            isChargeback
              ? "bg-destructive/15 text-destructive border-transparent"
              : "bg-orange-500/15 text-orange-600 border-transparent"
          }`}
        >
          {isChargeback ? "Chargeback" : "Reembolso"}
        </Badge>
      </TableCell>
      <TableCell className="text-right tabular-nums font-medium">
        R$ {item.amount.toFixed(2)}
      </TableCell>
      <TableCell className="text-muted-foreground max-w-[160px] truncate">
        {item.customer_email || "—"}
      </TableCell>
      <TableCell className="max-w-[180px]">
        {item.reason_code ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 text-[var(--color-success)]">
                <RiCheckboxCircleLine className="size-3.5 shrink-0" />
                <span className="text-xs truncate">
                  {reasonLabels[item.reason_code] || item.reason_code}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs font-medium">
                {reasonLabels[item.reason_code] || item.reason_code}
              </p>
              {item.reason_text && (
                <p className="text-xs text-muted-foreground mt-0.5">{item.reason_text}</p>
              )}
            </TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-xs text-muted-foreground">Sem motivo</span>
        )}
      </TableCell>
      <TableCell className="text-center">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onAddReason(item)}
          className="hover:bg-primary/10"
        >
          <RiEditLine className="size-4 text-muted-foreground" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
