import { useState, useEffect, useMemo } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RiCheckLine, RiSearchLine, RiBox3Line } from "@remixicon/react";
import { fetchProducts } from "@/services/products";
import type { ProductAPI } from "@/types/product";

interface DefineProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignName: string;
  currentProductId?: string;
  onSave: (referenceId: string, referenceLabel: string) => Promise<void>;
}

export function DefineProductModal({
  open, onOpenChange, campaignName,
  currentProductId, onSave,
}: DefineProductModalProps) {
  const [products, setProducts] = useState<ProductAPI[]>([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setSearch("");
    fetchProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    if (open && currentProductId) setSelectedId(currentProductId);
    else setSelectedId("");
  }, [open, currentProductId]);

  const platformLabels: Record<string, string> = {
    kiwify: "Kiwify",
    payt: "PayT",
  };

  const filtered = useMemo(() => {
    if (!search) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.platform.toLowerCase().includes(q),
    );
  }, [products, search]);

  const handleSave = async () => {
    if (!selectedId) return;
    const product = products.find((p) => String(p.id) === selectedId);
    if (!product) return;
    setSaving(true);
    await onSave(String(product.id), product.name);
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Definir Produto</DialogTitle>
          <DialogDescription className="truncate">
            {campaignName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              autoFocus
              autoComplete="off"
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-1 border rounded-md p-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">Carregando produtos...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <RiBox3Line className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  {products.length === 0 ? "Nenhum produto cadastrado" : "Nenhum produto encontrado"}
                </p>
              </div>
            ) : (
              filtered.map((p) => {
                const isSelected = String(p.id) === selectedId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedId(String(p.id))}
                    className={`w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors ${
                      isSelected
                        ? "bg-primary/10 text-primary border border-primary/30"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isSelected && <RiCheckLine className="size-4 shrink-0" />}
                      <span className="truncate font-medium flex-1">{p.name}</span>
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        {platformLabels[p.platform] ?? p.platform}
                      </Badge>
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        R$ {p.ticket.toFixed(0)}
                      </Badge>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!selectedId || saving}>
            {saving ? "Salvando..." : "Definir Produto"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
