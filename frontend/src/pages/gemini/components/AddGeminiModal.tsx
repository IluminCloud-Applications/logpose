import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RiSearchLine, RiCheckLine } from "@remixicon/react";
import { fetchGeminiModels, type GeminiModelAPI } from "@/services/integrations";

interface AddGeminiModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (name: string, apiKey: string, model: string) => void;
  isLoading?: boolean;
}

export function AddGeminiModal({ open, onOpenChange, onAdd, isLoading }: AddGeminiModalProps) {
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gemini-2.0-flash-lite");
  const [models, setModels] = useState<GeminiModelAPI[]>([]);
  const [modelSearch, setModelSearch] = useState("");
  const [loadingModels, setLoadingModels] = useState(false);
  const [showModels, setShowModels] = useState(false);

  // Ao digitar a API key, busca modelos
  useEffect(() => {
    if (apiKey.length < 10) {
      setModels([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoadingModels(true);
      try {
        const result = await fetchGeminiModels(apiKey);
        setModels(result);
      } catch {
        setModels([]);
      } finally {
        setLoadingModels(false);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [apiKey]);

  const filteredModels = models.filter((m) =>
    m.id.toLowerCase().includes(modelSearch.toLowerCase()) ||
    m.name.toLowerCase().includes(modelSearch.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !apiKey.trim() || !model.trim()) return;
    onAdd(name.trim(), apiKey.trim(), model.trim());
    handleClose(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) {
      setName(""); setApiKey(""); setModel("gemini-2.0-flash-lite");
      setModelSearch(""); setModels([]); setShowModels(false);
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Adicionar Chave Gemini</DialogTitle>
          <DialogDescription>
            Insira o nome, a API Key e selecione o modelo desejado
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gemini-name">Nome de Identificação</Label>
            <Input
              id="gemini-name"
              placeholder="Ex: Minha Chave Principal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gemini-apikey">API Key</Label>
            <Input
              id="gemini-apikey"
              type="password"
              placeholder="Cole a API Key do Google AI Studio"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label>Modelo</Label>
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between font-mono text-xs"
                onClick={() => setShowModels(!showModels)}
                disabled={loadingModels || models.length === 0}
              >
                {loadingModels ? "Carregando modelos..." : model}
                <RiSearchLine className="size-3.5 ml-2 opacity-50" />
              </Button>
              {showModels && models.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-48 overflow-auto">
                  <div className="p-2">
                    <Input
                      placeholder="Buscar modelo..."
                      value={modelSearch}
                      onChange={(e) => setModelSearch(e.target.value)}
                      className="h-8 text-xs"
                      autoComplete="off"
                    />
                  </div>
                  <div className="px-1 pb-1">
                    {filteredModels.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-accent flex items-center justify-between"
                        onClick={() => { setModel(m.id); setShowModels(false); setModelSearch(""); }}
                      >
                        <span className="font-mono">{m.id}</span>
                        {m.id === model && <RiCheckLine className="size-3.5 text-primary" />}
                      </button>
                    ))}
                    {filteredModels.length === 0 && (
                      <p className="text-xs text-muted-foreground px-2 py-2">
                        Nenhum modelo encontrado
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Como obter a API Key
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Acesse o Google AI Studio → Get API Key → Create API Key → Copie e cole no campo acima.
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
