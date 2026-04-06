import { useState, useEffect } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { fetchAliases, createAlias, deleteAlias, type AliasAPI } from "@/services/products";

interface ProductAliasManagerProps {
  productId: number;
}

export function ProductAliasManager({ productId }: ProductAliasManagerProps) {
  const [aliases, setAliases] = useState<AliasAPI[]>([]);
  const [newAlias, setNewAlias] = useState("");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAliases();
  }, [productId]);

  const loadAliases = async () => {
    setLoading(true);
    try {
      const data = await fetchAliases(productId);
      setAliases(data);
    } catch {
      setError("Erro ao carregar nomes na plataforma.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    const trimmed = newAlias.trim();
    if (!trimmed) return;
    setAdding(true);
    setError(null);
    try {
      const created = await createAlias(productId, trimmed);
      setAliases((prev) => [...prev, created]);
      setNewAlias("");
    } catch (e: unknown) {
      const msg = (e as { detail?: string })?.detail;
      setError(msg ?? "Erro ao adicionar nome.");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (aliasId: number) => {
    try {
      await deleteAlias(productId, aliasId);
      setAliases((prev) => prev.filter((a) => a.id !== aliasId));
    } catch {
      setError("Erro ao remover nome.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>Nomes na Plataforma</Label>
        <p className="text-xs text-muted-foreground">
          Adicione os nomes exatos que chegam via webhook ou plataforma para este produto.
          Eles serão incluídos no filtro automaticamente.
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Ex: Produto X | Vendedor Y"
          value={newAlias}
          onChange={(e) => setNewAlias(e.target.value)}
          onKeyDown={handleKeyDown}
          className="text-sm"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAdd}
          disabled={!newAlias.trim() || adding}
          className="shrink-0"
        >
          {adding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-1">
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Carregando...</span>
        </div>
      ) : aliases.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {aliases.map((a) => (
            <Badge
              key={a.id}
              variant="secondary"
              className="flex items-center gap-1.5 pr-1.5 text-xs font-normal max-w-full"
            >
              <span className="truncate max-w-[240px]">{a.alias}</span>
              <button
                type="button"
                onClick={() => handleDelete(a.id)}
                className="ml-0.5 rounded-full hover:text-destructive transition-colors shrink-0"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">
          Nenhum nome cadastrado.
        </p>
      )}
    </div>
  );
}
