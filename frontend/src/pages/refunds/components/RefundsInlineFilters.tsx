import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RiCloseLine } from "@remixicon/react";
import type { RefundsFilters } from "@/hooks/useRefunds";

interface RefundsInlineFiltersProps {
  filters: RefundsFilters;
  onFiltersChange: (f: RefundsFilters) => void;
  onClose: () => void;
}

export function RefundsInlineFilters({
  filters, onFiltersChange, onClose,
}: RefundsInlineFiltersProps) {
  return (
    <Card className="border-border/40 animate-in slide-in-from-top-2 duration-200">
      <CardContent className="pt-4 pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Filtros avançados</span>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <RiCloseLine className="size-4" />
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Tipo</Label>
            <Select
              value={filters.status}
              onValueChange={(v) => onFiltersChange({ ...filters, status: v })}
            >
              <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="refunded">Reembolso</SelectItem>
                <SelectItem value="chargeback">Chargeback</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Motivo registrado</Label>
            <Select
              value={filters.hasReason}
              onValueChange={(v) => onFiltersChange({ ...filters, hasReason: v })}
            >
              <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="yes">Com motivo</SelectItem>
                <SelectItem value="no">Sem motivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
