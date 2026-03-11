import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ItemType = "checkout" | "orderBump" | "upsell";

export interface NewItemData {
  type: ItemType;
  externalId: string;
  name: string;
  price: number;
}

interface AddItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: NewItemData) => void;
  productName: string;
}

const typeConfig: Record<ItemType, { label: string; desc: string; idLabel: string; idPlaceholder: string }> = {
  checkout: {
    label: "Checkout",
    desc: "URL de checkout do produto",
    idLabel: "URL do Checkout",
    idPlaceholder: "Ex: https://pay.kiwify.com.br/...",
  },
  orderBump: {
    label: "Order Bump",
    desc: "Oferta complementar no checkout",
    idLabel: "ID do Produto (Order Bump)",
    idPlaceholder: "Ex: R3A674",
  },
  upsell: {
    label: "Upsell",
    desc: "Oferta pós-compra",
    idLabel: "ID do Produto (Upsell)",
    idPlaceholder: "Ex: RB8MM6",
  },
};

export function AddItemModal({ open, onOpenChange, onAdd, productName }: AddItemModalProps) {
  const [type, setType] = useState<ItemType | null>(null);
  const [externalId, setExternalId] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !externalId.trim()) return;
    setLoading(true);
    try {
      await onAdd({
        type,
        externalId: externalId.trim(),
        name: name.trim(),
        price: Number(price) || 0,
      });
      reset();
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setType(null); setExternalId(""); setName(""); setPrice("");
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Adicionar Item</DialogTitle>
          <DialogDescription>
            Adicione um checkout, order bump ou upsell para <strong>{productName}</strong>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Tipo</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["checkout", "orderBump", "upsell"] as const).map((t) => (
                <button
                  key={t} type="button" onClick={() => setType(t)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-all cursor-pointer",
                    type === t ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                  )}
                >
                  <span className="text-xs font-semibold">{typeConfig[t].label}</span>
                  <span className="text-[9px] text-muted-foreground text-center leading-tight">
                    {typeConfig[t].desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {type && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="space-y-2">
                <Label htmlFor="item-id">{typeConfig[type].idLabel}</Label>
                <Input
                  id="item-id" placeholder={typeConfig[type].idPlaceholder}
                  value={externalId} onChange={(e) => setExternalId(e.target.value)}
                  className="font-mono" required
                />
              </div>

              {type !== "checkout" && (
                <div className="space-y-2">
                  <Label htmlFor="item-name">Nome</Label>
                  <Input id="item-name" placeholder="Ex: E-book Receitas" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="item-price">Preço (R$)</Label>
                <Input id="item-price" type="number" placeholder="0" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!type || !externalId.trim() || loading}>
              {loading ? "Adicionando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
