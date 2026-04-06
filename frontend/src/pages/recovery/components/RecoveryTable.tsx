import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RiCheckboxCircleLine, RiTimeLine } from "@remixicon/react";
import type { RecoveryRow, ChannelConfig } from "@/services/recovery";
import { PaginationBar } from "@/components/PaginationBar";

const typeLabels: Record<string, string> = {
  abandoned_cart: "Carrinho Abandonado",
  declined_card: "Cartão Recusado",
  unpaid_pix: "PIX Não Pago",
  trial: "Trial",
  unidentified: "Não Identificado",
};

const STATIC_CHANNEL_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  email: "Email",
  sms: "SMS",
  back_redirect: "BackRedirect",
  other: "Outro",
};

function buildChannelLabelMap(configs: ChannelConfig[]): Record<string, string> {
  const map = { ...STATIC_CHANNEL_LABELS };
  configs.forEach((c) => {
    if (c.label) map[c.channel] = c.label;
  });
  return map;
}

interface RecoveryTableProps {
  data: RecoveryRow[];
  isLoading: boolean;
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  channelConfigs?: ChannelConfig[];
}

function TableSkeleton() {
  return (
    <Card className="border-border/40 premium-table">
      <CardContent className="p-0">
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function RecoveryTable({ data, isLoading, total, page, onPageChange, channelConfigs = [] }: RecoveryTableProps) {
  const channelLabels = buildChannelLabelMap(channelConfigs);
  if (isLoading) return <TableSkeleton />;

  if (data.length === 0) {
    return (
      <Card className="border-border/40 border-dashed">
        <CardContent className="flex items-center justify-center py-16">
          <p className="text-sm text-muted-foreground">
            Nenhuma recuperação encontrada para os filtros selecionados.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 premium-table">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Canal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="tabular-nums whitespace-nowrap text-muted-foreground">
                    {row.date
                      ? new Date(row.date).toLocaleString("pt-BR", {
                          day: "2-digit", month: "2-digit",
                          hour: "2-digit", minute: "2-digit",
                        })
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{row.customerName}</div>
                    <div className="text-muted-foreground">{row.customerEmail}</div>
                  </TableCell>
                  <TableCell className="max-w-[160px] truncate">{row.product}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-medium">
                      {typeLabels[row.type] || row.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    R$ {row.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {row.recovered ? (
                      <div className="flex items-center gap-1.5 text-[var(--color-success)]">
                        <RiCheckboxCircleLine className="size-4" />
                        <span className="font-medium">Recuperado</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <RiTimeLine className="size-4" />
                        <span>Pendente</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {channelLabels[row.channel] || row.channel || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

          <PaginationBar
            total={total}
            page={page}
            onPageChange={onPageChange}
            label="recuperações"
          />
      </CardContent>
    </Card>
  );
}
