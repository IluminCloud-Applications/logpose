import { useState, useMemo } from "react";
import { RiEyeLine, RiEyeOffLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import type { UnidentifiedProduct } from "@/services/campaigns";

export interface BlurState {
  name: boolean;
  values: boolean;
  hideUnidentified: boolean;
  /** Products to hide from unidentified sales (by name) */
  hiddenProducts: string[];
}

interface BlurToggleProps {
  blur: BlurState;
  onBlurChange: (blur: BlurState) => void;
  /** Products from unidentified sales */
  unidentifiedProducts?: UnidentifiedProduct[];
}

export function BlurToggle({ blur, onBlurChange, unidentifiedProducts = [] }: BlurToggleProps) {
  const [open, setOpen] = useState(false);
  const isActive = blur.name || blur.values || blur.hideUnidentified || blur.hiddenProducts.length > 0;

  const allProductNames = useMemo(
    () => unidentifiedProducts.map((p) => p.name),
    [unidentifiedProducts],
  );

  const handleUnidentifiedToggle = (checked: boolean) => {
    if (checked) {
      // Mark all products as hidden
      onBlurChange({ ...blur, hideUnidentified: true, hiddenProducts: [...allProductNames] });
    } else {
      // Unmark all
      onBlurChange({ ...blur, hideUnidentified: false, hiddenProducts: [] });
    }
  };

  const handleProductToggle = (productName: string, checked: boolean) => {
    let next: string[];
    if (checked) {
      next = [...blur.hiddenProducts, productName];
    } else {
      next = blur.hiddenProducts.filter((n) => n !== productName);
    }
    // If all are checked, mark parent too
    const allChecked = allProductNames.every((n) => next.includes(n));
    onBlurChange({ ...blur, hideUnidentified: allChecked, hiddenProducts: next });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={isActive ? "default" : "outline"}
          size="icon"
          className="size-9"
        >
          {isActive ? (
            <RiEyeOffLine className="size-4" />
          ) : (
            <RiEyeLine className="size-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="p-3 space-y-3 w-[260px]">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Ocultar dados
        </p>
        <div className="flex items-center gap-2">
          <Checkbox
            id="blur-name"
            checked={blur.name}
            onCheckedChange={(v) =>
              onBlurChange({ ...blur, name: v === true })
            }
          />
          <Label htmlFor="blur-name" className="text-sm cursor-pointer">
            Nome da campanha
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="blur-values"
            checked={blur.values}
            onCheckedChange={(v) =>
              onBlurChange({ ...blur, values: v === true })
            }
          />
          <Label htmlFor="blur-values" className="text-sm cursor-pointer">
            Valores
          </Label>
        </div>
        <DropdownMenuSeparator />
        <div className="flex items-center gap-2">
          <Checkbox
            id="hide-unidentified"
            checked={blur.hideUnidentified}
            onCheckedChange={(v) => handleUnidentifiedToggle(v === true)}
          />
          <Label
            htmlFor="hide-unidentified"
            className="text-sm cursor-pointer font-medium"
          >
            Vendas não identificadas
          </Label>
        </div>
        {/* Nested product list */}
        {allProductNames.length > 0 && (
          <div className="pl-6 space-y-2">
            {unidentifiedProducts.map((p) => (
              <div key={p.name} className="flex items-center gap-2">
                <Checkbox
                  id={`hide-product-${p.name}`}
                  checked={blur.hiddenProducts.includes(p.name)}
                  onCheckedChange={(v) => handleProductToggle(p.name, v === true)}
                />
                <Label
                  htmlFor={`hide-product-${p.name}`}
                  className="text-xs cursor-pointer text-muted-foreground"
                >
                  {p.name}
                  <span className="ml-1 text-[10px] opacity-60">({p.sales})</span>
                </Label>
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
