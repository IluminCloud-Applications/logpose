import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CampaignFormState, AdFormData } from "../hooks/useCampaignForm";
import { CTA_OPTIONS, DEFAULT_UTM_PARAMS } from "../utils/defaults";

interface BulkEditPanelProps {
  form: CampaignFormState;
  onUpdateAllAds: (data: Partial<AdFormData>) => void;
}

/** Extrai URL base sem query params */
function stripQueryParams(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    // Se não for URL válida, remove tudo depois de ?
    const idx = url.indexOf("?");
    return idx >= 0 ? url.slice(0, idx) : url;
  }
}

/** Verifica se URL contém query params */
function hasQueryParams(url: string): boolean {
  return url.includes("?");
}

export function BulkEditPanel({ form, onUpdateAllAds }: BulkEditPanelProps) {
  const firstAd = form.ads[0];
  if (!firstAd) return null;

  const [showExtra, setShowExtra] = useState(!!firstAd.extra_params);

  const handleLinkChange = (value: string) => {
    if (hasQueryParams(value)) {
      // Bloqueia: remove os params automaticamente
      onUpdateAllAds({ link: stripQueryParams(value) });
    } else {
      onUpdateAllAds({ link: value });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          Edição em Massa
          <span className="text-xs font-normal text-muted-foreground">
            Aplica para todos os {form.ads.length} criativos
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Texto Principal */}
        <div className="space-y-1.5">
          <Label className="text-xs">Texto Principal</Label>
          <Textarea
            placeholder="O texto que aparece acima da mídia do anúncio..."
            value={firstAd.primary_text}
            onChange={(e) => onUpdateAllAds({ primary_text: e.target.value })}
            rows={3}
          />
        </div>

        {/* Título + Descrição */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Título</Label>
            <Input
              placeholder="Título do anúncio"
              value={firstAd.headline}
              onChange={(e) => onUpdateAllAds({ headline: e.target.value })}
              autoComplete="off"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Descrição</Label>
            <Input
              placeholder="Descrição abaixo do título"
              value={firstAd.description}
              onChange={(e) => onUpdateAllAds({ description: e.target.value })}
              autoComplete="off"
            />
          </div>
        </div>

        {/* Link - bloqueia query params */}
        <div className="space-y-1.5">
          <Label className="text-xs">Link de Destino</Label>
          <Input
            placeholder="https://suaoferta.com"
            value={firstAd.link}
            onChange={(e) => handleLinkChange(e.target.value)}
            autoComplete="off"
          />
          {hasQueryParams(firstAd.link) && (
            <p className="text-xs text-orange-500">
              Parâmetros removidos. Use "Parâmetros Adicionais" abaixo.
            </p>
          )}
          <p className="text-[10px] text-muted-foreground">
            Apenas a URL base. Parâmetros ?x=x devem ser adicionados em "Parâmetros Adicionais".
          </p>
        </div>

        {/* CTA — full width */}
        <div className="space-y-1.5">
          <Label className="text-xs">CTA (Botão de Ação)</Label>
          <Select
            value={firstAd.cta_type}
            onValueChange={(v) => onUpdateAllAds({ cta_type: v })}
          >
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CTA_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* UTM Params — fixo e não editável */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Parâmetros UTM</Label>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground">Parâmetros Adicionais</span>
              <Switch
                checked={showExtra}
                onCheckedChange={(v) => {
                  setShowExtra(v);
                  if (!v) onUpdateAllAds({ extra_params: "" });
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

          {/* Parâmetros Adicionais — editável */}
          {showExtra && (
            <div className="space-y-1.5 pt-1">
              <Label className="text-xs">Parâmetros Adicionais</Label>
              <Input
                className="font-mono text-xs"
                placeholder="src=cloaker&token=abc123"
                value={firstAd.extra_params}
                onChange={(e) => onUpdateAllAds({ extra_params: e.target.value })}
                autoComplete="off"
              />
              <p className="text-[10px] text-muted-foreground">
                Serão adicionados ao final da URL (ex: cloaker, src, tracking externo).
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
