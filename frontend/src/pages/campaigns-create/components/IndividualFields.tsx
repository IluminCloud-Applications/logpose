import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AdFormData } from "../hooks/useCampaignForm";
import { CTA_OPTIONS, DEFAULT_UTM_PARAMS } from "../utils/defaults";

interface IndividualFieldsProps {
  ad: AdFormData;
  showExtra: boolean;
  onToggleExtra: (v: boolean) => void;
  onUpdate: (data: Partial<AdFormData>) => void;
  onLinkChange: (value: string) => void;
  hasQueryParams: (url: string) => boolean;
}

export function IndividualFields({
  ad, showExtra, onToggleExtra, onUpdate, onLinkChange, hasQueryParams,
}: IndividualFieldsProps) {
  return (
    <>
      {/* Texto Principal */}
      <div className="space-y-1.5">
        <Label className="text-xs">Texto Principal</Label>
        <Textarea
          placeholder="O texto que aparece acima da mídia do anúncio..."
          value={ad.primary_text}
          onChange={(e) => onUpdate({ primary_text: e.target.value })}
          rows={3}
        />
      </div>

      {/* Título + Descrição */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Título</Label>
          <Input
            placeholder="Título do anúncio"
            value={ad.headline}
            onChange={(e) => onUpdate({ headline: e.target.value })}
            autoComplete="off"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Descrição</Label>
          <Input
            placeholder="Descrição abaixo do título"
            value={ad.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            autoComplete="off"
          />
        </div>
      </div>

      {/* Link de Destino */}
      <div className="space-y-1.5">
        <Label className="text-xs">Link de Destino</Label>
        <Input
          placeholder="https://suaoferta.com"
          value={ad.link}
          onChange={(e) => onLinkChange(e.target.value)}
          autoComplete="off"
        />
        {hasQueryParams(ad.link) && (
          <p className="text-xs text-orange-500">
            Parâmetros removidos. Use "Parâmetros Adicionais" abaixo.
          </p>
        )}
        <p className="text-[10px] text-muted-foreground">
          Apenas a URL base. Parâmetros ?x=x devem ser adicionados em "Parâmetros Adicionais".
        </p>
      </div>

      {/* CTA */}
      <div className="space-y-1.5">
        <Label className="text-xs">CTA (Botão de Ação)</Label>
        <Select
          value={ad.cta_type}
          onValueChange={(v) => onUpdate({ cta_type: v })}
        >
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CTA_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* UTM Params */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Parâmetros UTM</Label>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground">Parâmetros Adicionais</span>
            <Switch
              checked={showExtra}
              onCheckedChange={(v) => {
                onToggleExtra(v);
                if (!v) onUpdate({ extra_params: "" });
              }}
              className="scale-75"
            />
          </div>
        </div>
        <Textarea
          className="font-mono text-xs leading-relaxed bg-muted/50"
          value={DEFAULT_UTM_PARAMS}
          rows={3}
          disabled
          readOnly
        />
        <p className="text-[10px] text-muted-foreground">
          Padrão fixo com macros do Facebook. Sempre incluído automaticamente.
        </p>

        {showExtra && (
          <div className="space-y-1.5 pt-1">
            <Label className="text-xs">Parâmetros Adicionais</Label>
            <Input
              className="font-mono text-xs"
              placeholder="src=cloaker&token=abc123"
              value={ad.extra_params}
              onChange={(e) => onUpdate({ extra_params: e.target.value })}
              autoComplete="off"
            />
            <p className="text-[10px] text-muted-foreground">
              Serão adicionados ao final da URL (ex: cloaker, src, tracking externo).
            </p>
          </div>
        )}
      </div>
    </>
  );
}
