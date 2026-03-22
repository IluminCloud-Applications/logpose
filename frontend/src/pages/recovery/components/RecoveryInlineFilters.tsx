import { RiCloseLine, RiFilterOffLine } from "@remixicon/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RecoveryInlineFiltersProps {
  typeFilter: string;
  onTypeChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  channelFilter: string;
  onChannelChange: (v: string) => void;
  onClose: () => void;
}

export function RecoveryInlineFilters({
  typeFilter, onTypeChange,
  statusFilter, onStatusChange,
  channelFilter, onChannelChange,
  onClose,
}: RecoveryInlineFiltersProps) {
  const activeCount = [
    typeFilter !== "all",
    statusFilter !== "all",
    channelFilter !== "all",
  ].filter(Boolean).length;

  const clearAll = () => {
    onTypeChange("all");
    onStatusChange("all");
    onChannelChange("all");
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Filtros de Recuperação</h3>
          {activeCount > 0 && (
            <Badge className="bg-primary/15 text-primary border-transparent text-[10px] px-1.5 py-0">
              {activeCount} {activeCount === 1 ? "ativo" : "ativos"}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {activeCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs gap-1 text-muted-foreground hover:text-destructive">
              <RiFilterOffLine className="size-3.5" />
              Limpar
            </Button>
          )}
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <RiCloseLine className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {/* Tipo */}
        <div className="space-y-1.5">
          <Label className="text-xs">Tipo</Label>
          <Tabs value={typeFilter} onValueChange={onTypeChange}>
            <TabsList className="h-9 w-full">
              <TabsTrigger value="all" className="text-xs flex-1">Todos</TabsTrigger>
              <TabsTrigger value="abandoned_cart" className="text-xs flex-1">Carrinho</TabsTrigger>
              <TabsTrigger value="declined_card" className="text-xs flex-1">Cartão</TabsTrigger>
              <TabsTrigger value="unpaid_pix" className="text-xs flex-1">PIX</TabsTrigger>
              <TabsTrigger value="trial" className="text-xs flex-1">Trial</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <Label className="text-xs">Status</Label>
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="recovered">Recuperado</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Canal */}
        <div className="space-y-1.5">
          <Label className="text-xs">Canal</Label>
          <Select value={channelFilter} onValueChange={onChannelChange}>
            <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="back_redirect">BackRedirect</SelectItem>
              <SelectItem value="other">Outras</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
