import {
  Select, SelectContent, SelectGroup, SelectItem,
  SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { UpsellOption } from "@/types/sale";

interface ProductSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  products: { id: number; name: string }[];
  upsells?: UpsellOption[];
  className?: string;
}

/**
 * Select de produto com suporte a upsells agrupados.
 *
 * Valores:
 * - "all" → sem filtro
 * - "{product_id}" → filtrar por produto
 * - "upsell-{upsell_id}" → filtrar por upsell
 */
export function ProductSelect({
  value, onValueChange, products, upsells = [], className,
}: ProductSelectProps) {
  // Agrupar upsells por product_id
  const upsellsByProduct = upsells.reduce<Record<number, UpsellOption[]>>(
    (acc, u) => {
      if (!acc[u.product_id]) acc[u.product_id] = [];
      acc[u.product_id].push(u);
      return acc;
    },
    {},
  );

  const hasUpsells = upsells.length > 0;

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className ?? "h-9 w-full"}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos</SelectItem>

        {/* Produtos */}
        {hasUpsells ? (
          <>
            <SelectGroup>
              <SelectLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/60 px-2">
                Produtos
              </SelectLabel>
              {products.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectGroup>

            {/* Upsells agrupados por produto */}
            <SelectGroup>
              <SelectLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/60 px-2">
                Upsells
              </SelectLabel>
              {products.map((p) => {
                const productUpsells = upsellsByProduct[p.id];
                if (!productUpsells?.length) return null;
                return productUpsells.map((u) => (
                  <SelectItem key={`upsell-${u.id}`} value={`upsell-${u.id}`}>
                    <span className="flex items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground/50">{p.name} ›</span>
                      {u.name}
                    </span>
                  </SelectItem>
                ));
              })}
            </SelectGroup>
          </>
        ) : (
          products.map((p) => (
            <SelectItem key={p.id} value={String(p.id)}>
              {p.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
