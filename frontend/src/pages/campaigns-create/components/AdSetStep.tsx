import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CampaignFormState } from "../hooks/useCampaignForm";
import type { PixelData, PageData, InterestData } from "@/services/campaignCreator";
import { generateAdSetName } from "../utils/naming";
import { RiLightbulbLine } from "@remixicon/react";
import { TargetingSection } from "./TargetingSection";
import { DateTimePicker } from "./DateTimePicker";

interface AdSetStepProps {
  form: CampaignFormState;
  onUpdate: <K extends keyof CampaignFormState>(key: K, value: CampaignFormState[K]) => void;
  pixels: PixelData[];
  pages: PageData[];
  interestResults: InterestData[];
  onSearchInterest: (query: string) => void;
}

export function AdSetStep({
  form, onUpdate, pixels, pages, interestResults, onSearchInterest,
}: AdSetStepProps) {
  const suggestedName = generateAdSetName(
    form.campaignName.split(" | ")[1] || form.campaignName,
    form.ageMin, form.ageMax, form.gender, form.interests.length > 0
  );

  const selectedPage = pages.find((p) => p.id === form.pageId);
  const igAccounts = selectedPage?.instagram_accounts ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Conjunto de Anúncios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nome do Conjunto + Quantidade */}
          <div className="grid grid-cols-[1fr_120px] gap-3">
            <div className="space-y-2">
              <Label>Nome do Conjunto</Label>
              <Input
                value={form.adsetName}
                onChange={(e) => onUpdate("adsetName", e.target.value)}
                placeholder="Ex: CJ | Oferta | Aberto | 18-65+ | All"
                autoComplete="off"
              />
              {form.campaignName && (
                <button
                  onClick={() => onUpdate("adsetName", suggestedName)}
                  className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80"
                >
                  <RiLightbulbLine className="size-3.5" />
                  Sugestão: {suggestedName}
                </button>
              )}
            </div>
            <div className="space-y-2">
              <Label>Qtd. Conjuntos</Label>
              <Input
                type="number"
                min={1}
                max={50}
                value={form.adsetCount}
                onChange={(e) => onUpdate("adsetCount", Math.max(1, parseInt(e.target.value) || 1))}
              />
              {form.adsetCount > 1 && (
                <p className="text-xs text-muted-foreground">
                  1-{form.adsetCount}-x
                </p>
              )}
            </div>
          </div>

          {/* Pixel | Página do Facebook | Instagram — side by side */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Pixel</Label>
              <Select value={form.pixelId} onValueChange={(v) => onUpdate("pixelId", v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {pixels.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Página do Facebook</Label>
              <Select value={form.pageId} onValueChange={(v) => onUpdate("pageId", v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {pages.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Instagram</Label>
              <Select
                value={form.instagramActorId || "none"}
                onValueChange={(v) => onUpdate("instagramActorId", v === "none" ? "" : v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem Instagram</SelectItem>
                  {igAccounts.map((ig) => (
                    <SelectItem key={ig.id} value={ig.id}>@{ig.username}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Programação — DateTimePicker (Calendar + Dropdowns 24h) */}
          <div className="space-y-2">
            <Label>Programação (Timezone São Paulo)</Label>
            <DateTimePicker
              value={form.startTime}
              onChange={(iso) => onUpdate("startTime", iso)}
            />
            <p className="text-xs text-muted-foreground">
              Padrão: próxima meia-noite. Selecione a data e hora de início.
            </p>
          </div>
        </CardContent>
      </Card>

      <TargetingSection
        form={form}
        onUpdate={onUpdate}
        interestResults={interestResults}
        onSearchInterest={onSearchInterest}
      />
    </div>
  );
}
