import { RiCloseLine, RiFilterOffLine } from "@remixicon/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ChannelConfig } from "@/services/recovery";
import type { AccountOption } from "@/types/sale";

// Canais padrão sempre exibidos
const DEFAULT_CHANNEL_OPTIONS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "back_redirect", label: "BackRedirect" },
  { value: "other", label: "Outras" },
];

const platformLabels: Record<string, string> = { kiwify: "Kiwify", payt: "PayT", api: "API" };

interface Product {
  id: number;
  name: string;
}

interface RecoveryInlineFiltersProps {
  typeFilter: string;
  onTypeChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  channelFilter: string;
  onChannelChange: (v: string) => void;
  productFilter: string;
  onProductChange: (v: string) => void;
  accountFilter: string;
  onAccountChange: (v: string) => void;
  products?: Product[];
  accounts?: AccountOption[];
  onClose: () => void;
  channelConfigs?: ChannelConfig[];
}

export function RecoveryInlineFilters({
  typeFilter, onTypeChange,
  statusFilter, onStatusChange,
  channelFilter, onChannelChange,
  productFilter, onProductChange,
  accountFilter, onAccountChange,
  products = [],
  accounts = [],
  onClose,
  channelConfigs = [],
}: RecoveryInlineFiltersProps) {
  const activeCount = [
    typeFilter !== "all",
    statusFilter !== "all",
    channelFilter !== "all",
    productFilter !== "all",
    accountFilter !== "all",
  ].filter(Boolean).length;

  const clearAll = () => {
    onTypeChange("all");
    onStatusChange("all");
    onChannelChange("all");
    onProductChange("all");
    onAccountChange("all");
  };

  const customOptions = channelConfigs
    .filter((c) => c.is_custom)
    .map((c) => ({ value: c.channel, label: c.label || c.channel }));

  const allChannelOptions = [...DEFAULT_CHANNEL_OPTIONS, ...customOptions];

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Tipo — full width */}
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-4">
          <Label className="text-xs">Tipo</Label>
          <Tabs value={typeFilter} onValueChange={onTypeChange}>
            <TabsList className="h-9 w-full">
              <TabsTrigger value="all" className="text-xs flex-1">Todos</TabsTrigger>
              <TabsTrigger value="abandoned_cart" className="text-xs flex-1">Carrinho</TabsTrigger>
              <TabsTrigger value="declined_card" className="text-xs flex-1">Cartão</TabsTrigger>
              <TabsTrigger value="unpaid_pix" className="text-xs flex-1">PIX</TabsTrigger>
              <TabsTrigger value="trial" className="text-xs flex-1">Trial</TabsTrigger>
              <TabsTrigger value="unidentified" className="text-xs flex-1">N/I</TabsTrigger>
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
              <SelectItem value="all">Todos</SelectItem>
              {allChannelOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Produto */}
        <div className="space-y-1.5">
          <Label className="text-xs">Produto</Label>
          <Select value={productFilter} onValueChange={onProductChange}>
            <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {products.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Conta */}
        <div className="space-y-1.5">
          <Label className="text-xs">Conta</Label>
          <Select value={accountFilter} onValueChange={onAccountChange}>
            <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as contas</SelectItem>
              {accounts.map((a) => (
                <SelectItem key={a.slug} value={a.slug}>
                  {a.name} ({platformLabels[a.platform] || a.platform})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
