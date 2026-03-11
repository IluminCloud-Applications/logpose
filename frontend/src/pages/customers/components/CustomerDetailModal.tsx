import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { CustomerAPI } from "@/types/customer";

function fmt(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

interface CustomerDetailModalProps {
  customer: CustomerAPI | null;
  onClose: () => void;
}

export function CustomerDetailModal({ customer, onClose }: CustomerDetailModalProps) {
  if (!customer) return null;

  const details = [
    { label: "Nome", value: customer.name || "—" },
    { label: "Email", value: customer.email },
    { label: "Telefone", value: customer.phone || "—" },
    { label: "CPF", value: customer.cpf || "—" },
    { label: "Total Gasto", value: fmt(customer.total_spent) },
    { label: "Pedidos", value: String(customer.total_orders) },
    { label: "Primeira Compra", value: fmtDate(customer.first_purchase_at) },
    { label: "Última Compra", value: fmtDate(customer.last_purchase_at) },
  ];

  return (
    <Dialog open={!!customer} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Cliente</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {details.map((d) => (
              <div key={d.label} className="rounded-lg bg-muted/50 p-3">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {d.label}
                </p>
                <p className="mt-0.5 text-sm font-medium break-all">{d.value}</p>
              </div>
            ))}
          </div>

          {customer.products.length > 0 && (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Produtos Comprados
              </p>
              <div className="flex flex-wrap gap-1.5">
                {customer.products.map((product) => (
                  <Badge key={product} variant="secondary" className="text-xs">
                    {product}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
