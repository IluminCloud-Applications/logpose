import { RiBox1Line, RiAddCircleLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";

interface ProductsHeaderProps {
  onAddProduct: () => void;
}

export function ProductsHeader({ onAddProduct }: ProductsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2.5">
          <RiBox1Line className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seus produtos, checkouts, order bumps e upsells
          </p>
        </div>
      </div>
      <Button onClick={onAddProduct} className="gap-1.5 h-9">
        <RiAddCircleLine className="size-4" />
        Novo Produto
      </Button>
    </div>
  );
}
