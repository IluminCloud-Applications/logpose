import { RiShoppingCartLine, RiSettings3Line } from "@remixicon/react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DateFilter, type DatePreset } from "@/components/DateFilter";

interface RecoveryHeaderProps {
  typeFilter: string;
  onTypeChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  channelFilter: string;
  onChannelChange: (value: string) => void;
  datePreset: DatePreset;
  dateStart: string;
  dateEnd: string;
  onDatePresetChange: (preset: DatePreset) => void;
  onDateStartChange: (value: string) => void;
  onDateEndChange: (value: string) => void;
  onOpenConfig: () => void;
}

export function RecoveryHeader({
  typeFilter, onTypeChange,
  statusFilter, onStatusChange,
  channelFilter, onChannelChange,
  datePreset, dateStart, dateEnd,
  onDatePresetChange, onDateStartChange, onDateEndChange,
  onOpenConfig,
}: RecoveryHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2.5">
            <RiShoppingCartLine className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Recuperação</h1>
            <p className="text-sm text-muted-foreground">
              Carrinhos abandonados, cartões recusados e PIX não pagos
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DateFilter
            preset={datePreset}
            dateStart={dateStart}
            dateEnd={dateEnd}
            onPresetChange={onDatePresetChange}
            onDateStartChange={onDateStartChange}
            onDateEndChange={onDateEndChange}
          />
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="h-9 w-[130px] text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="recovered">Recuperado</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="size-9"
            onClick={onOpenConfig}
            title="Configurar canais de recuperação"
          >
            <RiSettings3Line className="size-4" />
          </Button>
        </div>
      </div>

      {/* Tabs de tipo */}
      <Tabs value={typeFilter} onValueChange={onTypeChange}>
        <TabsList className="h-9">
          <TabsTrigger value="all" className="text-xs px-4">Todos</TabsTrigger>
          <TabsTrigger value="abandoned_cart" className="text-xs px-4">Carrinho</TabsTrigger>
          <TabsTrigger value="declined_card" className="text-xs px-4">Cartão</TabsTrigger>
          <TabsTrigger value="unpaid_pix" className="text-xs px-4">PIX</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Tabs de canal */}
      <Tabs value={channelFilter} onValueChange={onChannelChange}>
        <TabsList className="h-9">
          <TabsTrigger value="all" className="text-xs px-4">Todas</TabsTrigger>
          <TabsTrigger value="whatsapp" className="text-xs px-4">WhatsApp</TabsTrigger>
          <TabsTrigger value="email" className="text-xs px-4">Email</TabsTrigger>
          <TabsTrigger value="sms" className="text-xs px-4">SMS</TabsTrigger>
          <TabsTrigger value="back_redirect" className="text-xs px-4">BackRedirect</TabsTrigger>
          <TabsTrigger value="other" className="text-xs px-4">Outras</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
