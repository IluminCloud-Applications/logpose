import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CampaignFormState } from "../hooks/useCampaignForm";
import { BID_STRATEGY_OPTIONS, CTA_OPTIONS, bidFieldLabel } from "../utils/defaults";
import { formatScheduleDisplay } from "../utils/schedule";
import { RiRocketLine, RiMegaphoneLine, RiFocus2Line, RiBrushLine } from "@remixicon/react";

interface ReviewStepProps {
  form: CampaignFormState;
}

export function ReviewStep({ form }: ReviewStepProps) {
  const strategyLabel =
    BID_STRATEGY_OPTIONS.find((o) => o.value === form.bidStrategy)?.label ?? form.bidStrategy;
  const genderLabel = form.gender === 1 ? "Masculino" : form.gender === 2 ? "Feminino" : "Todos";
  const firstAd = form.ads[0];
  const ctaLabel = CTA_OPTIONS.find((o) => o.value === firstAd?.cta_type)?.label ?? firstAd?.cta_type;

  return (
    <div className="space-y-4">
      {/* Resumo */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center gap-3 text-sm">
            <RiRocketLine className="size-5 text-primary" />
            <div>
              <p className="font-semibold">
                Estrutura: 1-{form.adsetCount}-{form.ads.length} — 1 campanha, {form.adsetCount} conjunto{form.adsetCount > 1 ? "s" : ""}, {form.ads.length} anúncio{form.ads.length > 1 ? "s" : ""} cada
              </p>
              <p className="text-muted-foreground text-xs mt-0.5">
                Tudo será criado como PAUSADO. Ative quando estiver pronto.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campanha */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <RiMegaphoneLine className="size-4" /> Campanha
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 text-sm">
          <Row label="Nome" value={form.campaignName} />
          <Row label="Orçamento Diário" value={`R$ ${form.dailyBudget.toFixed(2)}`} />
          <Row label="Estratégia" value={strategyLabel} />
          {form.bidAmount && (
            <Row label={bidFieldLabel(form.bidStrategy)} value={`R$ ${form.bidAmount.toFixed(2)}`} />
          )}
          {form.roasFloor && <Row label="ROAS Mínimo" value={`${form.roasFloor}x`} />}
          {form.videoLabel && <Row label="Vídeo" value={form.videoLabel} />}
          {form.checkoutLabel && <Row label="Checkout" value={form.checkoutLabel} />}
          {form.productLabel && <Row label="Produto" value={form.productLabel} />}
          {form.platformLabel && <Row label="Plataforma" value={form.platformLabel} />}
        </CardContent>
      </Card>

      {/* Conjunto */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <RiFocus2Line className="size-4" /> Conjunto de Anúncios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 text-sm">
          <Row label="Nome" value={form.adsetName} />
          <Row label="Pixel" value={form.pixelId} />
          <Row label="Programação" value={formatScheduleDisplay(form.startTime)} />
          <Row label="Idade" value={`${form.ageMin} — ${form.ageMax === 65 ? "65+" : form.ageMax}`} />
          <Row label="Gênero" value={genderLabel} />
          {form.interests.length > 0 && (
            <div className="flex items-start gap-2 py-1">
              <span className="text-muted-foreground w-28 shrink-0">Interesses</span>
              <div className="flex flex-wrap gap-1">
                {form.interests.map((i) => (
                  <Badge key={i.id} variant="secondary" className="text-xs">{i.name}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Anúncios */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <RiBrushLine className="size-4" /> Anúncios ({form.ads.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 text-sm">
          {firstAd && (
            <>
              <Row label="CTA" value={ctaLabel} />
              <Row label="Link" value={firstAd.link || "—"} />
              {firstAd.extra_params && <Row label="Params Extra" value={firstAd.extra_params} />}
              <Row label="Texto" value={truncate(firstAd.primary_text, 80)} />
              <Row label="Título" value={firstAd.headline || "—"} />
            </>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            {form.ads.map((ad, i) => (
              <div key={i} className="w-16 h-16 rounded overflow-hidden border bg-muted">
                {ad.media_type === "video" ? (
                  <video src={ad.preview_url} className="w-full h-full object-cover" muted />
                ) : (
                  <img src={ad.preview_url} className="w-full h-full object-cover" alt="" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="text-muted-foreground w-28 shrink-0">{label}</span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  );
}

function truncate(str: string, max: number): string {
  if (!str) return "—";
  return str.length > max ? str.slice(0, max) + "..." : str;
}
