import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RiAddLine, RiDeleteBinLine, RiPencilLine } from "@remixicon/react";
import { ProductTable } from "./ProductTable";
import { PlatformLogo } from "@/components/PlatformLogo";
import {
  CheckoutIdentifierCell, PlatformCell, ConversionCell,
  ProductAvatar, KpiPill,
} from "./ProductCells";
import type { ProductView } from "@/types/product";

function fmt(v: number): string {
  return v.toLocaleString("pt-BR", {
    style: "currency", currency: "BRL", minimumFractionDigits: 0,
  });
}

interface ProductAccordionProps {
  product: ProductView;
  onAddItem: (productId: number) => void;
  onEditProduct: (product: ProductView) => void;
  onDeleteProduct: (productId: number) => void;
  onEditItem: (item: { productId: number; itemId: number; type: "checkout" | "orderBump" | "upsell" }) => void;
}

export function ProductAccordion({ product, onAddItem, onEditProduct, onDeleteProduct, onEditItem }: ProductAccordionProps) {
  const totalSales = product.checkouts.reduce((s, c) => s + c.sales, 0);
  const totalRevenue = product.checkouts.reduce((s, c) => s + c.revenue, 0);
  const obRevenue = product.orderBumps.reduce((s, c) => s + c.revenue, 0);
  const upRevenue = product.upsells.reduce((s, c) => s + c.revenue, 0);
  const grandTotal = totalRevenue + obRevenue + upRevenue;

  const platforms = [...new Set(product.checkouts.map((c) => c.platform))];

  return (
    <Card className="group/card border-border/40 overflow-hidden hover:border-border/60 transition-colors">
      <Accordion type="single" collapsible>
        <AccordionItem value={String(product.id)} className="border-none">
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/20 transition-colors">
            <div className="flex items-center justify-between w-full pr-3">
              <div className="flex items-center gap-4">
                <ProductAvatar name={product.name} logoUrl={product.logoUrl} />
                <div className="text-left">
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold text-sm">{product.name}</span>
                    <button
                      type="button"
                      className="relative z-10 opacity-0 group-hover/card:opacity-100 transition-opacity p-1 rounded-md hover:bg-muted/60"
                      onClick={(e) => { e.stopPropagation(); e.preventDefault(); onEditProduct(product); }}
                      title="Editar produto"
                    >
                      <RiPencilLine className="size-3.5 text-muted-foreground" />
                    </button>
                    {platforms.map((p) => (
                      <Badge key={p} variant="outline" className="text-[10px] font-medium border border-border/50 gap-1 px-2 py-0.5">
                        <PlatformLogo platform={p} size="sm" />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{product.checkouts.length} checkouts</span>
                  </div>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-8 text-right">
                <KpiPill label="Vendas" value={String(totalSales)} />
                <KpiPill label="Total" value={fmt(grandTotal)} accent />
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5">
            <ProductAccordionContent product={product} onAddItem={onAddItem} onDeleteProduct={onDeleteProduct} onEditItem={onEditItem} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

// ── Accordion internal content ──────────────────────────────

function ProductAccordionContent({
  product, onAddItem, onDeleteProduct, onEditItem,
}: {
  product: ProductView;
  onAddItem: (id: number) => void;
  onDeleteProduct: (id: number) => void;
  onEditItem: (item: { productId: number; itemId: number; type: "checkout" | "orderBump" | "upsell" }) => void;
}) {
  return (
    <div className="space-y-5 pt-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Itens do Produto
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs"
            onClick={(e) => { e.stopPropagation(); onAddItem(product.id); }}
          >
            <RiAddLine className="size-3.5" /> Adicionar
          </Button>
          <Button variant="outline" size="sm"
            className="gap-1.5 text-xs text-destructive hover:bg-destructive/10"
            onClick={(e) => { e.stopPropagation(); onDeleteProduct(product.id); }}
          >
            <RiDeleteBinLine className="size-3.5" /> Excluir
          </Button>
        </div>
      </div>

      <ProductTable
        title="Checkouts"
        columns={["Identificação", "Plataforma", "Preço", "Vendas", "Faturamento", "Abandonos", "Conversão"]}
        rows={product.checkouts.map((c) => [
          <CheckoutIdentifierCell key={c.id} url={c.url} checkoutCode={c.checkoutCode} platform={c.platform} name={c.name} />,
          <PlatformCell key={`p-${c.id}`} platform={c.platform} />,
          fmt(c.price), String(c.sales), fmt(c.revenue),
          String(c.abandons), `${c.conversionRate.toFixed(1)}%`,
        ])}
        rowIds={product.checkouts.map((c) => c.id)}
        onRowEdit={(id) => onEditItem({ productId: product.id, itemId: id, type: "checkout" })}
      />
      {product.orderBumps.length > 0 && (
        <ProductTable
          title="Order Bumps"
          columns={["Nome", "Preço", "Vendas", "Faturamento", "Conversão"]}
          rows={product.orderBumps.map((o) => [
            o.name, fmt(o.price), String(o.sales), fmt(o.revenue),
            <ConversionCell key={o.id} rate={o.conversionRate} />,
          ])}
          rowIds={product.orderBumps.map((o) => o.id)}
          onRowEdit={(id) => onEditItem({ productId: product.id, itemId: id, type: "orderBump" })}
        />
      )}
      {product.upsells.length > 0 && (
        <ProductTable
          title="Upsells"
          columns={["Nome", "Preço", "Vendas", "Faturamento", "Conversão"]}
          rows={product.upsells.map((u) => [
            u.name, fmt(u.price), String(u.sales), fmt(u.revenue),
            <ConversionCell key={u.id} rate={u.conversionRate} />,
          ])}
          rowIds={product.upsells.map((u) => u.id)}
          onRowEdit={(id) => onEditItem({ productId: product.id, itemId: id, type: "upsell" })}
        />
      )}
    </div>
  );
}
