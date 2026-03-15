import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TableHead } from "@/components/ui/table";
import { columnDescriptions } from "./columnDescriptions";
import { cn } from "@/lib/utils";

interface TooltipTableHeadProps {
  colKey: string;
  label: string;
  className?: string;
}

/**
 * TableHead simples com tooltip de descrição (sem ordenação).
 * Usado nas sub-tabelas de adsets e ads.
 */
export function TooltipTableHead({ colKey, label, className }: TooltipTableHeadProps) {
  const description = columnDescriptions[colKey];

  if (!description) {
    return <TableHead className={className}>{label}</TableHead>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TableHead className={cn("cursor-default", className)}>
          <TooltipTrigger asChild>
            <span>{label}</span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs whitespace-pre-line text-xs">
            {description}
          </TooltipContent>
        </TableHead>
      </Tooltip>
    </TooltipProvider>
  );
}
