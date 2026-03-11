import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlatformLogo } from "@/components/PlatformLogo";

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: {
    name: string; externalId: string; ticket: number; idealCpa: number; platform: "kiwify" | "payt";
  }) => void;
}

export function AddProductModal({ open, onOpenChange, onAdd }: AddProductModalProps) {
  const [name, setName] = useState("");
  const [externalId, setExternalId] = useState("");
  const [ticket, setTicket] = useState("");
  const [idealCpa, setIdealCpa] = useState("");
  const [platform, setPlatform] = useState<"kiwify" | "payt" | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !externalId || !ticket || !platform) return;
    setLoading(true);
    try {
      await onAdd({
        name, externalId, ticket: Number(ticket), idealCpa: Number(idealCpa) || 0, platform,
      });
      reset();
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setName(""); setExternalId(""); setTicket(""); setIdealCpa(""); setPlatform(null);
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Novo Produto</DialogTitle>
          <DialogDescription>Cadastre o produto e seu CPA ideal</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Plataforma</Label>
            <div className="grid grid-cols-2 gap-3">
              {(["kiwify", "payt"] as const).map((p) => (
                <button key={p} type="button" onClick={() => setPlatform(p)} className={cn(
                  "flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-all cursor-pointer",
                  platform === p ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                )}>
                  <PlatformLogo platform={p} size="lg" showLabel={false} />
                  <span className="text-sm font-semibold">{p === "payt" ? "PayT" : "Kiwify"}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="prod-name">Nome do Produto</Label>
              <Input id="prod-name" placeholder="Ex: Ebook Fitness" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-id">ID do Produto</Label>
              <Input id="prod-id" placeholder="Ex: KW-12345" value={externalId} onChange={(e) => setExternalId(e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="prod-ticket">Ticket (R$)</Label>
              <Input id="prod-ticket" type="number" placeholder="197" value={ticket} onChange={(e) => setTicket(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-cpa">CPA Ideal (R$)</Label>
              <Input id="prod-cpa" type="number" placeholder="45" value={idealCpa} onChange={(e) => setIdealCpa(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>Cancelar</Button>
            <Button type="submit" disabled={!name || !externalId || !ticket || !platform || loading}>
              {loading ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
