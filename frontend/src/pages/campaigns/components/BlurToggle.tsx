import { useState } from "react";
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

export interface BlurState {
  name: boolean;
  values: boolean;
  hideUnidentified: boolean;
}

interface BlurToggleProps {
  blur: BlurState;
  onBlurChange: (blur: BlurState) => void;
}

export function BlurToggle({ blur, onBlurChange }: BlurToggleProps) {
  const [open, setOpen] = useState(false);
  const isActive = blur.name || blur.values || blur.hideUnidentified;

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
      <DropdownMenuContent align="end" className="p-3 space-y-3 w-[220px]">
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
            onCheckedChange={(v) =>
              onBlurChange({ ...blur, hideUnidentified: v === true })
            }
          />
          <Label
            htmlFor="hide-unidentified"
            className="text-sm cursor-pointer"
          >
            Vendas não identificadas
          </Label>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
