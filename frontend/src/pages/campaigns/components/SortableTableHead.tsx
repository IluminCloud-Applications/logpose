import { RiArrowDownLine } from "@remixicon/react";
import { TableHead } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { columnDescriptions } from "./columnDescriptions";
import { sortableColumns, type SortKey } from "./useCampaignSort";
import { cn } from "@/lib/utils";

interface SortableTableHeadProps {
  colKey: string;
  label: string;
  sortKey: SortKey;
  onSort: (col: string) => void;
  className?: string;
}

export function SortableTableHead({
  colKey,
  label,
  sortKey,
  onSort,
  className,
}: SortableTableHeadProps) {
  const description = columnDescriptions[colKey];
  const isSortable = colKey in sortableColumns;
  const isActive = sortKey === colKey;

  const handleClick = () => {
    if (isSortable) onSort(colKey);
  };

  const content = (
    <div
      className={cn(
        "inline-flex items-center gap-1",
        isSortable && "cursor-pointer select-none hover:text-foreground transition-colors",
      )}
      onClick={handleClick}
    >
      <span>{label}</span>
      {isSortable && (
        <RiArrowDownLine
          className={cn(
            "size-3 transition-opacity",
            isActive ? "opacity-100 text-foreground" : "opacity-0 group-hover:opacity-40",
          )}
        />
      )}
    </div>
  );

  if (!description) {
    return (
      <TableHead className={cn("group", className)}>
        {content}
      </TableHead>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TableHead className={cn("group", className)}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs whitespace-pre-line text-xs">
            {description}
          </TooltipContent>
        </TableHead>
      </Tooltip>
    </TooltipProvider>
  );
}
