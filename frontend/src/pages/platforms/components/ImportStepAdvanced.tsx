import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RiArrowLeftLine, RiLoader4Line, RiScissorsCutLine, RiGroupLine,
} from "@remixicon/react";
import type {
  ImportPreviewResponse, ProductConfig, SmartGroupConfig,
} from "@/types/import";
import type { ProductAPI } from "@/types/product";
import { fetchProducts } from "@/services/products";
import { SmartGroupCard } from "./SmartGroupCard";

interface Props {
  preview: ImportPreviewResponse;
  onExecute: (configs: ProductConfig[]) => void;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
}

/** Aplica o separador aos nomes e retorna o nome canônico (parte antes do sep) */
function extractGroupName(name: string, sep: string): string {
  if (!sep) return name;
  const idx = name.indexOf(sep);
  return idx > 0 ? name.substring(0, idx).trim() : name.trim();
}

export function ImportStepAdvanced({ preview, onExecute, onBack, isLoading, error }: Props) {
  const [sep, setSep] = useState("|");
  const [existingProducts, setExistingProducts] = useState<ProductAPI[]>([]);
  const [groups, setGroups] = useState<SmartGroupConfig[]>([]);

  useEffect(() => {
    fetchProducts().then(setExistingProducts).catch(() => {});
  }, []);

  // Reagrupar sempre que o separador muda
  useEffect(() => {
    const groupMap = new Map<string, string[]>();
    preview.products.forEach((p) => {
      const key = extractGroupName(p.name, sep);
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key)!.push(p.name);
    });

    setGroups((prev) => {
      return Array.from(groupMap.entries()).map(([groupName, originalNames]) => {
        const existing = prev.find((g) => g.groupName === groupName);
        return {
          groupName,
          originalNames,
          type: existing?.type ?? "frontend",
          parentGroups: existing?.parentGroups ?? [],
          product_id: existing?.product_id ?? null,
        };
      });
    });
  }, [sep, preview.products]);

  // Todos os nomes de grupos são candidatos a pai (independente do tipo atual)
  const allGroupNames = useMemo(
    () => groups.map((g) => g.groupName),
    [groups],
  );

  // Usado apenas para validar o canExecute
  const frontendGroups = useMemo(
    () => groups.filter((g) => g.type === "frontend").map((g) => g.groupName),
    [groups],
  );

  const updateGroup = (groupName: string, patch: Partial<SmartGroupConfig>) => {

    setGroups((prev) =>
      prev.map((g) =>
        g.groupName === groupName ? { ...g, ...patch } : g,
      ),
    );
  };

  const canExecute =
    groups.length > 0 &&
    frontendGroups.length > 0 &&
    groups.every((g) => g.type === "frontend" || g.parentGroups.length > 0);

  const handleExecute = () => {
    const configs: ProductConfig[] = [];

    groups.forEach((group) => {
      group.originalNames.forEach((origName) => {
        configs.push({
          name: origName,                    // nome original do CSV (chave de lookup)
          display_name: group.groupName,     // nome canônico para criação do produto
          type: group.type,
          parent_product_name: group.parentGroups[0] ?? null,
          parent_product_names: group.parentGroups.length > 0 ? group.parentGroups : null,
          product_id: group.product_id,
        });
      });
    });

    onExecute(configs);
  };

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // Calcular agregados por grupo
  const groupStats = useMemo(() => {
    const stats = new Map<string, { sales: number; revenue: number }>();
    preview.products.forEach((p) => {
      const key = extractGroupName(p.name, sep);
      const cur = stats.get(key) ?? { sales: 0, revenue: 0 };
      stats.set(key, {
        sales: cur.sales + p.sales_count,
        revenue: cur.revenue + p.total_revenue,
      });
    });
    return stats;
  }, [preview.products, sep]);

  return (
    <div className="space-y-4">
      {/* Separador */}
      <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3 space-y-2.5">
        <div className="flex items-center gap-2">
          <RiScissorsCutLine className="size-4 text-primary shrink-0" />
          <p className="text-sm font-semibold">Separador de nome</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Produtos com mesmo prefixo serão agrupados em um único produto.
          Ex: <span className="font-mono bg-muted px-1 rounded">Mentoria | Paola [127]</span> → <span className="font-mono bg-muted px-1 rounded">Mentoria</span>
        </p>
        <div className="flex gap-2 items-center">
          <div className="w-24">
            <Input
              value={sep}
              onChange={(e) => setSep(e.target.value)}
              placeholder="|"
              className="h-8 text-center font-mono text-sm"
              maxLength={5}
            />
          </div>
          <Badge variant="secondary" className="gap-1">
            <RiGroupLine className="size-3" />
            {groups.length} grupo{groups.length !== 1 ? "s" : ""} detectado{groups.length !== 1 ? "s" : ""}
            {groups.length !== preview.products.length && (
              <span className="text-muted-foreground ml-1">
                ({preview.products.length} produto{preview.products.length !== 1 ? "s" : ""} agrupado{preview.products.length !== 1 ? "s" : ""})
              </span>
            )}
          </Badge>
        </div>
      </div>

      {/* Lista de grupos */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Grupos de produtos ({groups.length})
        </Label>
        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
          {groups.map((group) => {
            const stats = groupStats.get(group.groupName);
            return (
              <SmartGroupCard
                key={group.groupName}
                group={group}
                stats={stats ?? { sales: 0, revenue: 0 }}
                frontendGroups={allGroupNames}
                existingProducts={existingProducts}
                fmt={fmt}
                onChange={(patch: Partial<SmartGroupConfig>) => updateGroup(group.groupName, patch)}
              />
            );
          })}
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md p-2">{error}</p>
      )}

      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} disabled={isLoading} className="gap-1.5">
          <RiArrowLeftLine className="size-4" /> Voltar
        </Button>
        <Button onClick={handleExecute} disabled={!canExecute || isLoading} className="flex-1 gap-2">
          {isLoading ? (
            <><RiLoader4Line className="size-4 animate-spin" /> Importando...</>
          ) : (
            <>Importar {preview.total_rows} registros (modo avançado)</>
          )}
        </Button>
      </div>
    </div>
  );
}
