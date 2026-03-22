import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlatformLogo } from "@/components/PlatformLogo";

interface CreateWebhookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (platform: "kiwify" | "payt" | "api", name: string) => void;
  isLoading?: boolean;
}

export function CreateWebhookModal({ open, onOpenChange, onCreate, isLoading }: CreateWebhookModalProps) {
  const [platform, setPlatform] = useState<"kiwify" | "payt" | "api" | null>(null);
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!platform || !name.trim()) return;
    onCreate(platform, name.trim());
    setPlatform(null);
    setName("");
  };

  const handleClose = (v: boolean) => {
    if (!v) { setPlatform(null); setName(""); }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Criar Endpoint</DialogTitle>
          <DialogDescription>
            Selecione a plataforma e dê um nome de identificação
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Plataforma</Label>
          <div className="grid grid-cols-3 gap-3">
              {(["kiwify", "payt", "api"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  disabled={isLoading}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg border-2 p-4 transition-all cursor-pointer",
                    platform === p
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <PlatformLogo platform={p} size="lg" showLabel={false} />
                  <span className="text-sm font-semibold">
                    {p === "payt" ? "PayT" : p === "kiwify" ? "Kiwify" : "API"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {p === "kiwify" ? "Produtos digitais" : p === "payt" ? "Gateway pagamento" : "Integração direta"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook-name">Nome de Identificação</Label>
            <Input
              id="webhook-name"
              placeholder="Ex: Kiwify Principal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="off"
            />
          </div>

          {platform && name && (
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                URL gerada
              </p>
              <code className="text-xs font-mono">
                /api/webhook/{platform}/{"<uuid>"}
              </code>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!platform || !name.trim() || isLoading}>
              {isLoading ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
