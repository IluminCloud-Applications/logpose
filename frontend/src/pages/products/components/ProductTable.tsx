import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { ReactNode } from "react";

interface ProductTableProps {
  title: string;
  columns: string[];
  rows: ReactNode[][];
}

export function ProductTable({ title, columns, rows }: ProductTableProps) {
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <TableCell
                    key={cellIndex}
                    className={`${cellIndex > 0 ? "text-right tabular-nums" : "font-medium"}`}
                  >
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
