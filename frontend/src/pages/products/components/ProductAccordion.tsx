import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RiExternalLinkLine, RiArrowUpSLine, RiAddLine, RiDeleteBinLine } from "@remixicon/react";
import { ProductTable } from "./ProductTable";
import { PlatformLogo } from "@/components/PlatformLogo";
import type { ProductView } from "@/types/product";

function fmt(v: number): string {
  return v.toLocaleString("pt-BR", {
    style: "currency", currency: "BRL", minimumFractionDigits: 0,
  });
}

interface ProductAccordionProps {
  product: ProductView;
  onAddItem: (productId: number) => void;
  onDeleteProduct: (productId: number) => void;
}

export function ProductAccordion({ product, onAddItem, onDeleteProduct }: ProductAccordionProps) {
  const totalSales = product.checkouts.reduce((s, c) => s + c.sales, 0);
  const totalRevenue = product.checkouts.reduce((s, c) => s + c.revenue, 0);
  const obRevenue = product.orderBumps.reduce((s, c) => s + c.revenue, 0);
  const upRevenue = product.upsells.reduce((s, c) => s + c.revenue, 0);
  const grandTotal = totalRevenue + obRevenue + upRevenue;
  const aov = totalSales > 0 ? grandTotal / totalSales : product.ticket;

  return (
    <Card className="border-border/40 overflow-hidden hover:border-border/60 transition-colors">
      <Accordion type="single" collapsible>
        <AccordionItem value={String(product.id)} className="border-none">
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/20 transition-colors">
            <div className="flex items-center justify-between w-full pr-3">
              <div className="flex items-center gap-4">
                <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 shadow-sm">
                  <span className="text-lg font-bold text-primary">
                    {product.name.charAt(0)}
                  </span>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold text-sm">{product.name}</span>
                    <Badge variant="outline" className="text-[10px] font-medium border border-border/50 gap-1 px-2 py-0.5">
                      <PlatformLogo platform={product.platform} size="sm" />
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded text-[10px]">
                      {product.externalId}
                    </span>
                    <span>Ticket {fmt(product.ticket)}</span>
                    {product.idealCpa > 0 && <span>CPA Ideal {fmt(product.idealCpa)}</span>}
                  </div>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-8 text-right">
                <KpiPill label="Vendas" value={String(totalSales)} />
                <KpiPill label="AOV" value={fmt(aov)} />
                <KpiPill label="Total" value={fmt(grandTotal)} accent />
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5">
            <div className="space-y-5 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Itens do Produto
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline" size="sm" className="gap-1.5 text-xs"
                    onClick={(e) => { e.stopPropagation(); onAddItem(product.id); }}
                  >
                    <RiAddLine className="size-3.5" />
                    Adicionar
                  </Button>
                  <Button
                    variant="outline" size="sm"
                    className="gap-1.5 text-xs text-destructive hover:bg-destructive/10"
                    onClick={(e) => { e.stopPropagation(); onDeleteProduct(product.id); }}
                  >
                    <RiDeleteBinLine className="size-3.5" />
                    Excluir
                  </Button>
                </div>
              </div>

              <ProductTable
                title="Checkouts"
                columns={["URL", "Preço", "Vendas", "Faturamento", "Abandonos", "Conversão"]}
                rows={product.checkouts.map((c) => [
                  <UrlCell key={c.id} url={c.url} />,
                  fmt(c.price), String(c.sales), fmt(c.revenue),
                  String(c.abandons), `${c.conversionRate.toFixed(1)}%`,
                ])}
              />
              {product.orderBumps.length > 0 && (
                <ProductTable
                  title="Order Bumps"
                  columns={["Nome", "Preço", "Vendas", "Faturamento", "Conversão"]}
                  rows={product.orderBumps.map((o) => [
                    o.name, fmt(o.price), String(o.sales), fmt(o.revenue),
                    <ConversionCell key={o.id} rate={o.conversionRate} />,
                  ])}
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
                />
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

function KpiPill({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="text-right">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`text-sm font-bold tabular-nums ${accent ? "text-primary" : ""}`}>{value}</p>
    </div>
  );
}

function UrlCell({ url }: { url: string }) {
  return (
    <div className="flex items-center gap-1.5 max-w-[220px]">
      <RiExternalLinkLine className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="font-mono text-xs truncate">{url}</span>
    </div>
  );
}

function ConversionCell({ rate }: { rate: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-[var(--color-success)] font-medium">
      <RiArrowUpSLine className="size-3.5" />
      {rate.toFixed(1)}%
    </span>
  );
}
