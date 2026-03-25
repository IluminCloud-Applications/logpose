import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { RiPencilLine } from "@remixicon/react";
import type { ReactNode } from "react";

interface ProductTableProps {
  title: string;
  columns: string[];
  rows: ReactNode[][];
  rowIds?: number[];
  onRowEdit?: (id: number) => void;
}

export function ProductTable({ title, columns, rows, rowIds, onRowEdit }: ProductTableProps) {
  const hasActions = !!onRowEdit && !!rowIds;

  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
        {title}
      </h4>
      <div className="rounded-lg border border-border/40 overflow-hidden premium-table">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, i) => (
                <TableHead
                  key={col}
                  className={i > 0 ? "text-right" : ""}
                >
                  {col}
                </TableHead>
              ))}
              {hasActions && <TableHead className="w-10" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="group/row">
                {row.map((cell, cellIndex) => (
                  <TableCell
                    key={cellIndex}
                    className={`${cellIndex > 0 ? "text-right tabular-nums" : "font-medium"}`}
                  >
                    {cell}
                  </TableCell>
                ))}
                {hasActions && (
                  <TableCell className="w-10 text-center p-0">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onRowEdit(rowIds[rowIndex]); }}
                      className="opacity-0 group-hover/row:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-muted/60"
                      title="Editar"
                    >
                      <RiPencilLine className="size-3.5 text-muted-foreground hover:text-primary transition-colors" />
                    </button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
