import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface AddVturbModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (name: string, apiKey: string) => void;
  isLoading?: boolean;
}

export function AddVturbModal({ open, onOpenChange, onAdd, isLoading }: AddVturbModalProps) {
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
          <DialogTitle>Adicionar Conta VTurb</DialogTitle>
          <DialogDescription>
            Insira o nome de identificação e a API Key do VTurb Analytics
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vturb-name">Nome de Identificação</Label>
            <Input
              id="vturb-name"
              placeholder="Ex: Minha Conta VTurb"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vturb-apikey">API Key</Label>
            <Input
              id="vturb-apikey"
              type="password"
              placeholder="Cole a API Key do VTurb Analytics"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="off"
            />
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Como obter a API Key
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Acesse o VTurb → Configurações da Conta → API do Analytics → Pressione para
              gerar a chave → Copie e cole no campo acima.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adicionando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
