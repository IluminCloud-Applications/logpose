import { useState, useEffect } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  RiWhatsappLine, RiMailLine, RiMessage2Line,
  RiArrowGoBackLine, RiCheckLine,
} from "@remixicon/react";
import type { ChannelConfig } from "@/services/recovery";

const CHANNEL_META: Record<string, { label: string; icon: typeof RiWhatsappLine; desc: string }> = {
  whatsapp: { label: "WhatsApp", icon: RiWhatsappLine, desc: "Se o src contiver este valor" },
  email: { label: "Email", icon: RiMailLine, desc: "Se o src contiver este valor" },
  sms: { label: "SMS", icon: RiMessage2Line, desc: "Se o src contiver este valor" },
  back_redirect: { label: "BackRedirect", icon: RiArrowGoBackLine, desc: "Se o src contiver este valor" },
};

interface ConfigDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  configs: ChannelConfig[];
  onSave: (configs: ChannelConfig[]) => Promise<void>;
  isSaving: boolean;
}

export function ConfigDrawer({
  open, onOpenChange, configs, onSave, isSaving,
}: ConfigDrawerProps) {
  const [draft, setDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    const map: Record<string, string> = {};
    configs.forEach((c) => { map[c.channel] = c.keyword; });
    setDraft(map);
  }, [configs]);

  const handleChange = (channel: string, keyword: string) => {
    setDraft((prev) => ({ ...prev, [channel]: keyword }));
  };

  const handleSave = async () => {
    const updated = Object.entries(draft).map(([channel, keyword]) => ({
      channel, keyword,
    }));
    await onSave(updated);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[380px] sm:w-[420px]">
        <SheetHeader>
          <SheetTitle>Configuração de Canais</SheetTitle>
          <SheetDescription>
            Defina qual valor o campo <code className="text-xs bg-muted px-1 rounded">src</code> deve
            conter para classificar cada canal de recuperação.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 py-6 px-6">
          {Object.entries(CHANNEL_META).map(([key, meta]) => {
            const Icon = meta.icon;
            return (
              <div key={key} className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1.5">
                  <Icon className="size-3.5" />
                  {meta.label}
                </Label>
                <Input
                  value={draft[key] || ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={`Ex: ${key}`}
                  className="h-9 text-sm"
                  disabled={isSaving}
                />
                <p className="text-[10px] text-muted-foreground">
                  {meta.desc}: <code className="bg-muted px-1 rounded">{draft[key] || "—"}</code>
                </p>
              </div>
            );
          })}

          <div className="rounded-lg bg-muted/50 p-3 mt-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Como funciona
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              O campo <code className="bg-muted px-1 rounded text-[10px]">src</code> da transação de
              origem é comparado com os valores acima. O que não for identificado será classificado
              como <strong>Outro</strong>.
            </p>
          </div>
        </div>

        <SheetFooter>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full gap-1.5"
          >
            <RiCheckLine className="size-4" />
            {isSaving ? "Salvando..." : "Salvar Configuração"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
