import { useState, useCallback } from "react";
import { RiRefreshLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface RefreshButtonProps {
  onRefresh: () => Promise<void>;
  label?: string;
}

export function RefreshButton({ onRefresh, label = "Atualizar dados" }: RefreshButtonProps) {
  const [spinning, setSpinning] = useState(false);

  const handleClick = useCallback(async () => {
    if (spinning) return;
    setSpinning(true);
    try {
      await onRefresh();
    } finally {
      // Keep spinning for at least 600ms so the animation feels smooth
      setTimeout(() => setSpinning(false), 600);
    }
  }, [onRefresh, spinning]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="size-9 shrink-0"
            onClick={handleClick}
            disabled={spinning}
          >
            <RiRefreshLine
              className={cn(
                "size-4 transition-transform duration-500",
                spinning && "animate-spin",
              )}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
