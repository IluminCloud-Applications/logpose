import { useState, useEffect, useMemo } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { RiCheckLine, RiSearchLine } from "@remixicon/react";
import { fetchProducts, fetchCheckouts } from "@/services/products";
import type { ProductAPI, CheckoutAPI } from "@/types/product";

interface DefineCheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignName: string;
  currentCheckoutId?: string;
  onSave: (referenceId: string, referenceLabel: string) => Promise<void>;
}

export function DefineCheckoutModal({
  open, onOpenChange, campaignName,
  currentCheckoutId, onSave,
}: DefineCheckoutModalProps) {
  const [products, setProducts] = useState<ProductAPI[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [checkouts, setCheckouts] = useState<CheckoutAPI[]>([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    if (!selectedProductId) {
      setCheckouts([]);
      return;
    }
    setLoading(true);
    fetchCheckouts(Number(selectedProductId))
      .then(setCheckouts)
      .finally(() => setLoading(false));
  }, [selectedProductId]);

  useEffect(() => {
    if (open && currentCheckoutId) setSelectedId(currentCheckoutId);
    else setSelectedId("");
  }, [open, currentCheckoutId]);

  const filtered = useMemo(() => {
    if (!search) return checkouts;
    const q = search.toLowerCase();
    return checkouts.filter((c) => c.url.toLowerCase().includes(q));
  }, [checkouts, search]);

  const productName = products.find(
    (p) => String(p.id) === selectedProductId,
  )?.name;

  const handleSave = async () => {
    if (!selectedId) return;
    const checkout = checkouts.find((c) => String(c.id) === selectedId);
    if (!checkout) return;
    setSaving(true);
    const label = `${productName} → ${checkout.url}`;
    await onSave(String(checkout.id), label);
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Definir Checkout</DialogTitle>
          <DialogDescription className="truncate">
            {campaignName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Produto</Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o produto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProductId && (
            <>
              <div className="relative">
                <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar checkout..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="max-h-[200px] overflow-y-auto space-y-1 border rounded-md p-2">
                {loading ? (
                  <p className="text-sm text-muted-foreground p-2">Carregando...</p>
                ) : filtered.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-2">Nenhum checkout encontrado</p>
                ) : (
                  filtered.map((c) => {
                    const isSelected = String(c.id) === selectedId;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedId(String(c.id))}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
                          isSelected
                            ? "bg-primary/10 text-primary border border-primary/30"
                            : "hover:bg-muted"
                        }`}
                      >
                        {isSelected && <RiCheckLine className="size-4 shrink-0" />}
                        <span className="truncate flex-1">{c.url}</span>
                        <Badge variant="outline" className="shrink-0 text-[10px]">
                          R$ {c.price.toFixed(2)}
                        </Badge>
                      </button>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!selectedId || saving}>
            {saving ? "Salvando..." : "Definir Checkout"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
