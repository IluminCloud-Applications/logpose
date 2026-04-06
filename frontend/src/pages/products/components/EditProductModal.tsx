import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProductAliasManager } from "./ProductAliasManager";

interface EditProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { name: string; logo_url?: string | null }) => void;
  initialName: string;
  initialLogoUrl: string | null;
  productId: number | null;
}

export function EditProductModal({
  open, onOpenChange, onSave, initialName, initialLogoUrl, productId,
}: EditProductModalProps) {
  const [name, setName] = useState(initialName);
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setLogoUrl(initialLogoUrl ?? "");
    }
  }, [open, initialName, initialLogoUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onSave({ name: name.trim(), logo_url: logoUrl.trim() || null });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Produto</DialogTitle>
          <DialogDescription>
            Altere o nome, logo ou nomes na plataforma do produto.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-prod-name">Nome do Produto</Label>
            <Input
              id="edit-prod-name"
              placeholder="Ex: Ebook Fitness"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-prod-logo">Logo do Produto (URL)</Label>
            <Input
              id="edit-prod-logo"
              placeholder="https://exemplo.com/logo.png"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
            {logoUrl.trim() && (
              <div className="flex items-center justify-center p-3 rounded-lg border border-border/50 bg-muted/30">
                <img
                  src={logoUrl}
                  alt="Preview"
                  className="max-h-16 max-w-full object-contain rounded"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                  onLoad={(e) => (e.currentTarget.style.display = 'block')}
                />
              </div>
            )}
          </div>

          {/* Aliases — dentro do form, aparece antes do footer */}
          {productId && (
            <>
              <Separator />
              <ProductAliasManager productId={productId} />
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={!name.trim() || loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
