import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: { name: string; logo_url?: string | null }) => void;
}

export function AddProductModal({ open, onOpenChange, onAdd }: AddProductModalProps) {
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onAdd({ name: name.trim(), logo_url: logoUrl.trim() || null });
      reset();
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setName("");
    setLogoUrl("");
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Novo Produto</DialogTitle>
          <DialogDescription>
            Cadastre o produto e depois adicione checkouts por plataforma.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prod-name">Nome do Produto</Label>
            <Input
              id="prod-name"
              placeholder="Ex: Ebook Fitness"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prod-logo">Logo do Produto (URL)</Label>
            <Input
              id="prod-logo"
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>Cancelar</Button>
            <Button type="submit" disabled={!name.trim() || loading}>
              {loading ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
