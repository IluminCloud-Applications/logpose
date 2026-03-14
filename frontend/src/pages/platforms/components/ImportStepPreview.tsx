import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  RiArrowLeftLine, RiLoader4Line, RiShoppingCart2Line,
  RiUser3Line, RiMoneyDollarCircleLine, RiArrowUpLine,
  RiAddLine,
} from "@remixicon/react";
import type { ImportPreviewResponse, ProductConfig, ProductType } from "@/types/import";
import type { ProductAPI } from "@/types/product";
import { fetchProducts } from "@/services/products";

interface Props {
  preview: ImportPreviewResponse;
  onExecute: (configs: ProductConfig[]) => void;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
}

export function ImportStepPreview({ preview, onExecute, onBack, isLoading, error }: Props) {
  const [existingProducts, setExistingProducts] = useState<ProductAPI[]>([]);

  useEffect(() => {
    fetchProducts().then(setExistingProducts).catch(() => {});
  }, []);

  const [configs, setConfigs] = useState<Record<string, {
    type: ProductType;
    parent: string | null;
    productId: number | null;
  }>>(() => {
    const initial: Record<string, { type: ProductType; parent: string | null; productId: number | null }> = {};
    preview.products.forEach((p) => {
      initial[p.name] = { type: "frontend", parent: null, productId: null };
    });
    return initial;
  });

  const frontendProducts = Object.entries(configs)
    .filter(([, c]) => c.type === "frontend")
    .map(([name]) => name);

  const updateType = (name: string, type: ProductType) => {
    setConfigs((prev) => ({
      ...prev,
      [name]: { type, parent: type === "frontend" ? null : prev[name]?.parent ?? null, productId: prev[name]?.productId ?? null },
    }));
  };

  const updateParent = (name: string, parent: string) => {
    setConfigs((prev) => ({ ...prev, [name]: { ...prev[name], parent } }));
  };

  const updateProductId = (name: string, value: string) => {
    const productId = value === "new" ? null : Number(value);
    setConfigs((prev) => ({ ...prev, [name]: { ...prev[name], productId } }));
  };

  const canExecute = Object.entries(configs).every(([, c]) =>
    c.type === "frontend" || (c.parent && c.parent !== ""),
  ) && frontendProducts.length > 0;

  const handleExecute = () => {
    const productConfigs: ProductConfig[] = Object.entries(configs).map(([name, c]) => ({
      name,
      type: c.type,
      parent_product_name: c.parent,
      product_id: c.productId,
    }));
    onExecute(productConfigs);
  };

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-5">
      {/* KPIs resumidos */}
      <div className="grid grid-cols-3 gap-3">
        <KpiCard icon={<RiShoppingCart2Line className="size-4" />} label="Transações" value={preview.approved_count} />
        <KpiCard icon={<RiUser3Line className="size-4" />} label="Clientes" value={preview.unique_customers} />
        <KpiCard icon={<RiMoneyDollarCircleLine className="size-4" />} label="Receita" value={fmt(preview.total_revenue)} />
      </div>

      {preview.refunded_count > 0 && (
        <p className="text-xs text-muted-foreground">
          + {preview.refunded_count} reembolsos e {preview.pending_count} pendentes/recusados
        </p>
      )}

      {/* Product config list */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Produtos detectados ({preview.products.length})</p>
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {preview.products.map((product) => {
            const config = configs[product.name];
            return (
              <ProductConfigCard
                key={product.name}
                product={product}
                config={config}
                frontendProducts={frontendProducts}
                existingProducts={existingProducts}
                onUpdateType={(type) => updateType(product.name, type)}
                onUpdateParent={(parent) => updateParent(product.name, parent)}
                onUpdateProductId={(value) => updateProductId(product.name, value)}
                fmt={fmt}
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
            <>Importar {preview.total_rows} registros</>
          )}
        </Button>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────

interface ProductConfigCardProps {
  product: ImportPreviewResponse["products"][number];
  config: { type: ProductType; parent: string | null; productId: number | null };
  frontendProducts: string[];
  existingProducts: ProductAPI[];
  onUpdateType: (type: ProductType) => void;
  onUpdateParent: (parent: string) => void;
  onUpdateProductId: (value: string) => void;
  fmt: (v: number) => string;
}

function ProductConfigCard({
  product, config, frontendProducts, existingProducts,
  onUpdateType, onUpdateParent, onUpdateProductId, fmt,
}: ProductConfigCardProps) {
  return (
    <div className="rounded-lg border border-border/50 p-3 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{product.name}</p>
          <p className="text-[11px] text-muted-foreground">
            {product.sales_count} vendas · {fmt(product.total_revenue)} · Ticket {fmt(product.ticket)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Select value={config?.type} onValueChange={(v) => onUpdateType(v as ProductType)}>
          <SelectTrigger className="h-8 text-xs w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="frontend">Frontend</SelectItem>
            <SelectItem value="upsell">Upsell</SelectItem>
            <SelectItem value="order_bump">Order Bump</SelectItem>
          </SelectContent>
        </Select>

        {config?.type !== "frontend" && (
          <Select value={config?.parent ?? ""} onValueChange={onUpdateParent}>
            <SelectTrigger className="h-8 text-xs flex-1">
              <SelectValue placeholder="Produto pai..." />
            </SelectTrigger>
            <SelectContent>
              {frontendProducts
                .filter((n) => n !== product.name)
                .map((n) => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}

        {config?.type === "frontend" && (
          <Select
            value={config.productId ? String(config.productId) : "new"}
            onValueChange={onUpdateProductId}
          >
            <SelectTrigger className="h-8 text-xs flex-1">
              <SelectValue placeholder="Vincular a produto..." />
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

        {config?.type === "upsell" && (
          <Badge className="text-[10px] h-6 bg-blue-500/10 text-blue-600 border-blue-500/20">
            <RiArrowUpLine className="size-3 mr-0.5" /> Upsell
          </Badge>
        )}
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3 text-center">
      <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}
