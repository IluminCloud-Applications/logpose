import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface AddStripeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (name: string, apiKey: string) => void;
  isLoading?: boolean;
}

export function AddStripeModal({ open, onOpenChange, onAdd, isLoading }: AddStripeModalProps) {
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !apiKey.trim()) return;
    onAdd(name.trim(), apiKey.trim());
    setName("");
    setApiKey("");
  };

  const handleClose = (v: boolean) => {
    if (!v) { setName(""); setApiKey(""); }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Adicionar Conta Stripe</DialogTitle>
          <DialogDescription>
            Insira o nome de identificação e a Secret Key do Stripe
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stripe-name">Nome de Identificação</Label>
            <Input
              id="stripe-name"
              placeholder="Ex: Stripe Produção"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stripe-apikey">Secret Key</Label>
            <Input
              id="stripe-apikey"
              type="password"
              placeholder="sk_live_..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="off"
            />
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Como obter a Secret Key
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Acesse o Stripe Dashboard → Developers → API Keys → Copie a Secret Key
              (sk_live_...) e cole no campo acima.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Verificando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
