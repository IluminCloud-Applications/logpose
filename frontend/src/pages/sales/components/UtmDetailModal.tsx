import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import type { SaleAPI } from "@/types/sale";

interface UtmDetailModalProps {
  sale: SaleAPI | null;
  onClose: () => void;
}

export function UtmDetailModal({ sale, onClose }: UtmDetailModalProps) {
  if (!sale) return null;

  const details = [
    { label: "UTM Source", value: sale.utm_source || "—" },
    { label: "UTM Campaign", value: sale.utm_campaign || "—" },
    { label: "UTM Medium", value: sale.utm_medium || "—" },
    { label: "UTM Content", value: sale.utm_content || "—" },
    { label: "SRC", value: sale.src || "—" },
  ];

  return (
    <Dialog open={!!sale} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Rastreamento da Venda</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Transação
            </p>
            <p className="mt-0.5 text-sm font-medium font-mono">{sale.external_id}</p>
          </div>

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

          {sale.order_bumps && Array.isArray(sale.order_bumps) && sale.order_bumps.length > 0 && (
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Order Bumps
              </p>
              <div className="space-y-1">
                {sale.order_bumps.map((ob: any, i: number) => (
                  <p key={i} className="text-xs">
                    {ob.name || ob.product?.name || "Order Bump"} — R$ {((ob.product?.price || ob.price || 0) / 100).toFixed(2)}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
