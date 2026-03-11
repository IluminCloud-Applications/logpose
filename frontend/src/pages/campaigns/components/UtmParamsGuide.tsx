import { useState } from "react";
import { RiCodeLine, RiFileCopyLine, RiCheckLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

const UTM_TEMPLATE =
  "utm_source=FB&utm_campaign={{campaign.name}}|{{campaign.id}}&utm_medium={{adset.name}}|{{adset.id}}&utm_content={{ad.name}}|{{ad.id}}&utm_term={{placement}}";

const PARAMS = [
  {
    key: "utm_source",
    value: "FB",
    desc: "Identifica a origem (Facebook)",
  },
  {
    key: "utm_campaign",
    value: "{{campaign.name}}|{{campaign.id}}",
    desc: "Nome + ID da campanha",
  },
  {
    key: "utm_medium",
    value: "{{adset.name}}|{{adset.id}}",
    desc: "Nome + ID do conjunto",
  },
  {
    key: "utm_content",
    value: "{{ad.name}}|{{ad.id}}",
    desc: "Nome + ID do anúncio",
  },
  {
    key: "utm_term",
    value: "{{placement}}",
    desc: "Onde o anúncio apareceu",
  },
];

export function UtmParamsGuide() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(UTM_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Popover>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="size-9">
                <RiCodeLine className="size-4" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Parâmetros UTM</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent align="end" className="w-[420px] p-0">
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold">Parâmetros UTM</h4>
              <p className="text-[11px] text-muted-foreground">
                Configure no Facebook Ads · Compatível com{" "}
                <span className="font-semibold text-foreground/70">UTMify</span>
              </p>
            </div>
            <Button
              variant={copied ? "default" : "outline"}
              size="sm"
              onClick={handleCopy}
              className="gap-1.5 text-xs h-8"
            >
              {copied ? (
                <>
                  <RiCheckLine className="size-3.5" />
                  Copiado!
                </>
              ) : (
                <>
                  <RiFileCopyLine className="size-3.5" />
                  Copiar
                </>
              )}
            </Button>
          </div>

          {/* Full template (copyable block) */}
          <button
            onClick={handleCopy}
            className="w-full text-left rounded-lg bg-muted/70 border border-border/50
                       p-3 text-[11px] font-mono leading-relaxed text-foreground/80
                       break-all cursor-pointer hover:border-primary/40 hover:bg-muted
                       transition-colors group"
          >
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-sans font-medium block mb-1.5">
              Clique para copiar
            </span>
            {UTM_TEMPLATE}
          </button>

          {/* Param breakdown */}
          <div className="space-y-1">
            {PARAMS.map((p) => (
              <div
                key={p.key}
                className="flex items-start gap-2 rounded-md px-2 py-1.5
                           hover:bg-muted/40 transition-colors"
              >
                <code className="shrink-0 text-[11px] font-semibold text-primary bg-primary/10 rounded px-1.5 py-0.5">
                  {p.key}
                </code>
                <div className="min-w-0">
                  <p className="text-[11px] font-mono text-foreground/70 truncate">
                    {p.value}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Tip */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5">
            <p className="text-[10px] text-primary/80 leading-relaxed">
              <strong>Dica:</strong> O formato <code className="font-semibold">name|id</code>{" "}
              permite rastrear vendas pelo ID da campanha, mesmo se o nome mudar.
              Vendas sem ID são rastreadas pelo nome (fallback).
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
