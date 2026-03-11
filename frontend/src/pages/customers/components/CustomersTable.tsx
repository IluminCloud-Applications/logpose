import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RiEyeLine } from "@remixicon/react";
import type { CustomerAPI } from "@/types/customer";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationBar } from "@/components/PaginationBar";

function fmt(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function maskCpf(cpf: string | null): string {
  if (!cpf || cpf.length < 6) return cpf || "—";
  return `***.${cpf.slice(3, 6)}.***-${cpf.slice(-2)}`;
}

interface CustomersTableProps {
  data: CustomerAPI[];
  loading: boolean;
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  onViewCustomer: (customer: CustomerAPI) => void;
}

export function CustomersTable({ data, loading, total, page, onPageChange, onViewCustomer }: CustomersTableProps) {

  return (
    <Card className="border-border/40 premium-table">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Primeira Compra</TableHead>
                <TableHead className="text-right">Total Gasto</TableHead>
                <TableHead className="text-right">Pedidos</TableHead>
                <TableHead className="text-center">Ações</TableHead>
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
                    Nenhum cliente encontrado
                  </TableCell>
                </TableRow>
              ) : (
                data.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="font-medium text-sm">{customer.name || "—"}</div>
                      <div className="text-sm text-muted-foreground">{customer.email}</div>
                    </TableCell>
                    <TableCell className="tabular-nums">{customer.phone || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{maskCpf(customer.cpf)}</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground whitespace-nowrap">
                      {fmtDate(customer.first_purchase_at)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {fmt(customer.total_spent)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {customer.total_orders}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost" size="icon-sm"
                        onClick={() => onViewCustomer(customer)}
                      >
                        <RiEyeLine className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

          <PaginationBar
            total={total}
            page={page}
            onPageChange={onPageChange}
            label="clientes"
          />
      </CardContent>
    </Card>
  );
}
