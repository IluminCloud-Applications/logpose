import { Button } from "@/components/ui/button";
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";

export const PER_PAGE = 12;

interface PaginationBarProps {
  total: number;
  page: number;
  perPage?: number;
  onPageChange: (page: number) => void;
  label?: string;
}

export function PaginationBar({
  total, page, perPage = PER_PAGE, onPageChange, label = "itens",
}: PaginationBarProps) {
  const totalPages = Math.ceil(total / perPage);

  if (totalPages <= 1) return null;

  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  // Generate visible page numbers (max 5 visible)
  const pages = generatePageNumbers(page, totalPages);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
      <span className="text-xs text-muted-foreground tabular-nums">
        {start}–{end} de {total} {label}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <RiArrowLeftSLine className="size-4" />
        </Button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="px-1 text-xs text-muted-foreground">
              …
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0 text-xs"
              onClick={() => onPageChange(p as number)}
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="icon-sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <RiArrowRightSLine className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function generatePageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  pages.push(total);
  return pages;
}
