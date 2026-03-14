import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { CampaignFormState } from "../hooks/useCampaignForm";
import {
  BID_STRATEGY_OPTIONS,
  needsBidValue,
  bidPlaceholder,
  bidFieldLabel,
  bidFieldDescription,
} from "../utils/defaults";
import { generateCampaignName } from "../utils/naming";
import { RiLightbulbLine, RiQuestionLine } from "@remixicon/react";

interface CampaignStepProps {
  form: CampaignFormState;
  onUpdate: <K extends keyof CampaignFormState>(key: K, value: CampaignFormState[K]) => void;
}

export function CampaignStep({ form, onUpdate }: CampaignStepProps) {
  const suggestedName = generateCampaignName(
    form.campaignName.split(" | ")[1] || form.campaignName,
    form.bidStrategy,
    form.dailyBudget
  );

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Configurar Campanha</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Nome */}
        <div className="space-y-2">
          <Label>Nome da Campanha</Label>
          <Input
            placeholder="Ex: Oferta Black Friday"
            value={form.campaignName}
            onChange={(e) => onUpdate("campaignName", e.target.value)}
            autoComplete="off"
          />
          {form.campaignName && (
            <button
              onClick={() => onUpdate("campaignName", suggestedName)}
              className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              <RiLightbulbLine className="size-3.5" />
              Sugestão: {suggestedName}
            </button>
          )}
        </div>

        {/* Orçamento diário */}
        <div className="space-y-2">
          <Label>Orçamento Diário (R$)</Label>
          <Input
            type="number"
            min={1}
            step={0.01}
            placeholder="Ex: 100.00"
            value={form.dailyBudget || ""}
            onChange={(e) => onUpdate("dailyBudget", parseFloat(e.target.value) || 0)}
            autoComplete="off"
          />
          <p className="text-xs text-muted-foreground">
            CBO — O orçamento será distribuído automaticamente entre os conjuntos.
          </p>
        </div>

        {/* Estratégia de Lance — Tab Buttons */}
        <div className="space-y-2">
          <Label>Estratégia de Lance</Label>
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-muted/50 rounded-lg">
            {BID_STRATEGY_OPTIONS.map((opt) => (
              <div key={opt.value} className="relative">
                <button
                  onClick={() => onUpdate("bidStrategy", opt.value)}
                  className={`
                    w-full px-3 py-2 rounded-md text-xs font-medium transition-all duration-200
                    ${form.bidStrategy === opt.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                    }
                  `}
                >
                  {opt.label}
                </button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="absolute top-0.5 right-0.5 p-0.5 rounded-full opacity-50 hover:opacity-100 transition-opacity">
                      <RiQuestionLine className="size-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="flex flex-col items-start max-w-xs text-left">
                    <span className="font-medium">{opt.label}</span>
                    <span>{opt.tooltip}</span>
                  </TooltipContent>
                </Tooltip>
              </div>
            ))}
          </div>
        </div>

        {/* Valor do lance (condicional) — label e descrição diferenciados */}
        {needsBidValue(form.bidStrategy) && (
          <div className="space-y-2">
            <Label>{bidFieldLabel(form.bidStrategy)}</Label>
            <Input
              type="number"
              min={0.01}
              step={0.01}
              placeholder={bidPlaceholder(form.bidStrategy)}
              value={
                form.bidStrategy === "ROAS"
                  ? form.roasFloor ?? ""
                  : form.bidAmount ?? ""
              }
              onChange={(e) => {
                const val = parseFloat(e.target.value) || null;
                if (form.bidStrategy === "ROAS") {
                  onUpdate("roasFloor", val);
                } else {
                  onUpdate("bidAmount", val);
                }
              }}
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              {bidFieldDescription(form.bidStrategy)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
