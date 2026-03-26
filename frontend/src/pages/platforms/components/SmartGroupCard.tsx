import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  RiArrowDownSLine, RiArrowUpLine, RiAddLine, RiCloseLine,
} from "@remixicon/react";
import type { SmartGroupConfig, ProductType } from "@/types/import";
import type { ProductAPI } from "@/types/product";

interface Props {
  group: SmartGroupConfig;
  stats: { sales: number; revenue: number };
  frontendGroups: string[];
  existingProducts: ProductAPI[];
  fmt: (v: number) => string;
  onChange: (patch: Partial<SmartGroupConfig>) => void;
}

export function SmartGroupCard({
  group, stats, frontendGroups, existingProducts, fmt, onChange,
}: Props) {
  const [showParents, setShowParents] = useState(false);
  const [showVariants, setShowVariants] = useState(false);
  const isMultiGroup = group.originalNames.length > 1;

  const handleTypeChange = (type: ProductType) => {
    onChange({ type, parentGroups: type === "frontend" ? [] : group.parentGroups });
    if (type !== "frontend") setShowParents(true);
  };

  const addParent = (name: string) => {
    if (name && !group.parentGroups.includes(name)) {
      onChange({ parentGroups: [...group.parentGroups, name] });
    }
  };

  const removeParent = (name: string) => {
    onChange({ parentGroups: group.parentGroups.filter((p) => p !== name) });
  };

  const availableParents = frontendGroups.filter(
    (n) => n !== group.groupName && !group.parentGroups.includes(n),
  );

  const needsParent = group.type !== "frontend";
  const missingParent = needsParent && group.parentGroups.length === 0;

  return (
    <div className={`rounded-lg border overflow-hidden transition-colors ${missingParent ? "border-destructive/40" : "border-border/50"}`}>
      {/* Linha principal */}
      <div className="p-3 space-y-2">
        {/* Nome + badge variantes */}
        <div className="flex items-start gap-2 overflow-hidden">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-sm font-semibold truncate" title={group.groupName}>
                {group.groupName}
              </p>
              {isMultiGroup && (
                <Badge variant="secondary" className="text-[10px] h-5 shrink-0">
                  {group.originalNames.length} variantes
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {stats.sales} vendas · {fmt(stats.revenue)}
            </p>
          </div>
        </div>

        {/* Tipo + vínculo */}
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={group.type} onValueChange={(v) => handleTypeChange(v as ProductType)}>
            <SelectTrigger className="h-8 text-xs w-[130px] shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="frontend">Frontend</SelectItem>
              <SelectItem value="upsell">Upsell</SelectItem>
              <SelectItem value="order_bump">Order Bump</SelectItem>
            </SelectContent>
          </Select>

          {group.type === "frontend" && (
            <Select
              value={group.product_id ? String(group.product_id) : "new"}
              onValueChange={(v) => onChange({ product_id: v === "new" ? null : Number(v) })}
            >
              <SelectTrigger className="h-8 text-xs flex-1 min-w-0">
                <SelectValue placeholder="Vincular produto..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">
                  <span className="flex items-center gap-1">
                    <RiAddLine className="size-3" /> Criar novo produto
                  </span>
                </SelectItem>
                {existingProducts.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Botão para abrir seleção de pais */}
          {needsParent && (
            <button
              type="button"
              onClick={() => setShowParents((v) => !v)}
              className={`h-8 px-3 rounded-md text-xs font-medium flex items-center gap-1 border transition-colors shrink-0
                ${missingParent
                  ? "border-destructive/60 bg-destructive/5 text-destructive hover:bg-destructive/10"
                  : "border-border bg-muted/50 hover:bg-muted text-foreground"
                }`}
            >
              {group.type === "upsell" ? (
                <RiArrowUpLine className="size-3" />
              ) : (
                <RiAddLine className="size-3" />
              )}
              {group.parentGroups.length > 0
                ? `${group.parentGroups.length} pai${group.parentGroups.length > 1 ? "s" : ""}`
                : "Selecionar pai"}
              <RiArrowDownSLine className={`size-3 transition-transform ${showParents ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>

        {/* Tags dos pais selecionados */}
        {needsParent && group.parentGroups.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {group.parentGroups.map((parent) => (
              <span
                key={parent}
                className="flex items-center gap-1 text-[11px] bg-primary/10 text-primary rounded-full px-2.5 py-0.5 font-medium"
              >
                {parent}
                <button
                  type="button"
                  onClick={() => removeParent(parent)}
                  className="hover:text-destructive transition-colors ml-0.5"
                  aria-label={`Remover ${parent}`}
                >
                  <RiCloseLine className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Painel de seleção de pais — chips clicáveis (sem Radix Select) */}
        {needsParent && showParents && availableParents.length > 0 && (
          <div className="rounded-md border border-border/60 bg-muted/30 p-2 space-y-1.5">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide px-1">
              Adicionar produto pai
            </p>
            <div className="flex flex-wrap gap-1.5">
              {availableParents.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => addParent(name)}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-border/60 bg-background hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-colors font-medium truncate max-w-[200px]"
                  title={name}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        {needsParent && showParents && availableParents.length === 0 && (
          <p className="text-[11px] text-muted-foreground italic px-1">
            Todos os grupos já foram adicionados como pai.
          </p>
        )}
      </div>

      {/* Collapse das variantes */}
      {isMultiGroup && (
        <>
          <button
            type="button"
            onClick={() => setShowVariants((v) => !v)}
            className="w-full flex items-center justify-center gap-1 text-[11px] text-muted-foreground bg-muted/40 hover:bg-muted/70 py-1.5 transition-colors border-t border-border/40"
          >
            <RiArrowDownSLine
              className={`size-3.5 transition-transform ${showVariants ? "rotate-180" : ""}`}
            />
            {showVariants ? "Ocultar" : "Ver"} {group.originalNames.length} variantes agrupadas
          </button>
          {showVariants && (
            <div className="border-t border-border/30 bg-muted/20 px-3 py-2 space-y-1">
              {group.originalNames.map((name) => (
                <p key={name} className="text-[11px] text-muted-foreground truncate" title={name}>
                  · {name}
                </p>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
