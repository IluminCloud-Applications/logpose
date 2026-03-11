import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RiEyeLine } from "@remixicon/react";
import type { SaleAPI } from "@/types/sale";
import { UtmDetailModal } from "./UtmDetailModal";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationBar } from "@/components/PaginationBar";

const statusConfig: Record<string, { label: string; className: string }> = {
  approved: { label: "Aprovada", className: "bg-[var(--color-success)]/15 text-[var(--color-success)] border-transparent" },
  refunded: { label: "Reembolso", className: "" },
  chargeback: { label: "Chargeback", className: "bg-destructive/15 text-destructive border-transparent" },
  pending: { label: "Pendente", className: "" },
};

const platformColors: Record<string, string> = {
  kiwify: "bg-chart-1/15 text-chart-1 border-chart-1/20",
  payt: "bg-chart-2/15 text-chart-2 border-chart-2/20",
};

interface SalesTableProps {
  data: SaleAPI[];
  loading: boolean;
  total: number;
  page: number;
  onPageChange: (page: number) => void;
}

export function SalesTable({ data, loading, total, page, onPageChange }: SalesTableProps) {
  const [selectedSale, setSelectedSale] = useState<SaleAPI | null>(null);

  return (
    <>
      <Card className="border-border/40 premium-table">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Plataforma</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-center w-[60px]">UTMs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      Nenhuma venda encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((sale) => {
                    const status = statusConfig[sale.status] ?? { label: sale.status, className: "" };
                    const platform = platformColors[sale.platform] ?? "";
                    return (
                      <TableRow key={sale.id}>
                        <TableCell className="tabular-nums whitespace-nowrap text-muted-foreground">
                          {sale.created_at
                            ? new Date(sale.created_at).toLocaleString("pt-BR", {
                                day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                              })
                            : "—"}
                        </TableCell>
                        <TableCell className="font-medium max-w-[160px] truncate">
                          {sale.product_name || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] font-medium border ${platform}`}>
                            {sale.platform === "kiwify" ? "Kiwify" : "PayT"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] font-medium ${status.className}`}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-medium">
                          R$ {sale.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-[160px] truncate">
                          {sale.customer_email || "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost" size="icon-sm"
                            onClick={() => setSelectedSale(sale)}
                            className="hover:bg-primary/10"
                          >
                            <RiEyeLine className="size-4 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <PaginationBar
            total={total}
            page={page}
            onPageChange={onPageChange}
            label="transações"
          />
        </CardContent>
      </Card>
      <UtmDetailModal sale={selectedSale} onClose={() => setSelectedSale(null)} />
    </>
  );
}
