import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RiEyeLine, RiDeleteBinLine } from "@remixicon/react";
import type { SaleAPI } from "@/types/sale";
import { UtmDetailModal } from "./UtmDetailModal";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationBar } from "@/components/PaginationBar";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { deleteSale } from "@/services/sales";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; className: string }> = {
  approved: { label: "Aprovada", className: "bg-[var(--color-success)]/15 text-[var(--color-success)] border-transparent" },
  refunded: { label: "Reembolso", className: "" },
  chargeback: { label: "Chargeback", className: "bg-destructive/15 text-destructive border-transparent" },
  pending: { label: "Pendente", className: "" },
  trial: { label: "Trial", className: "bg-chart-3/15 text-chart-3 border-transparent" },
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
  onSaleDeleted?: () => void;
}

export function SalesTable({ data, loading, total, page, onPageChange, onSaleDeleted }: SalesTableProps) {
  const [selectedSale, setSelectedSale] = useState<SaleAPI | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SaleAPI | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteSale(deleteTarget.id);
      toast.success("Venda apagada", { description: "A venda e o cliente associado foram removidos." });
      setDeleteTarget(null);
      onSaleDeleted?.();
    } catch {
      toast.error("Erro", { description: "Não foi possível apagar a venda." });
    } finally {
      setIsDeleting(false);
    }
  };

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
                  <TableHead className="text-center w-[80px]">Ações</TableHead>
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
                        <SaleActions
                          sale={sale}
                          onViewUtm={setSelectedSale}
                          onDelete={setDeleteTarget}
                        />
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

      <ConfirmDeleteModal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Apagar venda"
        description="A venda e o cliente associado (se não tiver outras vendas) serão removidos permanentemente. Esta ação não pode ser desfeita."
      />
    </>
  );
}

/* ── Célula de ações extraída para manter a table limpa ── */
function SaleActions({
  sale,
  onViewUtm,
  onDelete,
}: {
  sale: SaleAPI;
  onViewUtm: (s: SaleAPI) => void;
  onDelete: (s: SaleAPI) => void;
}) {
  return (
    <TableCell className="text-center">
      <div className="flex items-center justify-center gap-1">
        <Button
          variant="ghost" size="icon-sm"
          onClick={() => onViewUtm(sale)}
          className="hover:bg-primary/10"
          title="Ver UTMs"
        >
          <RiEyeLine className="size-4 text-muted-foreground" />
        </Button>
        <Button
          variant="ghost" size="icon-sm"
          onClick={() => onDelete(sale)}
          className="hover:bg-destructive/10"
          title="Apagar venda"
        >
          <RiDeleteBinLine className="size-4 text-muted-foreground hover:text-destructive" />
        </Button>
      </div>
    </TableCell>
  );
}
