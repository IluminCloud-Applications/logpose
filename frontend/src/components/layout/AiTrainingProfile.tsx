import { useEffect, useState } from "react";
import { RiMessageAi3Line } from "@remixicon/react";
import { fetchAiTrainingLevel, type AiTrainingLevel } from "@/services/integrations";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const LEVEL_CONFIG: Record<string, { color: string; glow: string; emoji: string }> = {
  "Sem dados":     { color: "from-zinc-400 to-zinc-500",     glow: "shadow-zinc-400/20",     emoji: "🔘" },
  "Iniciante":     { color: "from-red-400 to-orange-400",    glow: "shadow-orange-400/20",   emoji: "🌱" },
  "Aprendendo":    { color: "from-orange-400 to-amber-400",  glow: "shadow-amber-400/20",    emoji: "📚" },
  "Intermediária": { color: "from-amber-400 to-yellow-400",  glow: "shadow-yellow-400/20",   emoji: "⚡" },
  "Avançada":      { color: "from-yellow-400 to-emerald-400",glow: "shadow-emerald-400/20",  emoji: "🧠" },
  "Quase lá":      { color: "from-emerald-400 to-cyan-400",  glow: "shadow-cyan-400/20",     emoji: "🚀" },
  "Treinada":      { color: "from-cyan-400 to-blue-500",     glow: "shadow-blue-500/30",     emoji: "✨" },
};

export function AiTrainingProfile() {
  const [data, setData] = useState<AiTrainingLevel | null>(null);

  useEffect(() => {
    fetchAiTrainingLevel()
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return null;

  const config = LEVEL_CONFIG[data.level] || LEVEL_CONFIG["Sem dados"];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="mx-2 mb-2 rounded-xl bg-sidebar-accent/50 border border-sidebar-border p-3 cursor-default">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2.5">
              <div className={`rounded-lg p-1.5 bg-gradient-to-br ${config.color} shadow-md ${config.glow}`}>
                <RiMessageAi3Line className="size-3.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-sidebar-foreground leading-tight">
                  LOG POSE AI
                </p>
                <p className="text-[10px] text-sidebar-foreground/50 leading-tight">
                  {config.emoji} {data.level}
                </p>
              </div>
              <span className="text-[11px] font-bold tabular-nums text-sidebar-foreground/80">
                {data.percentage}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="relative h-1.5 rounded-full bg-sidebar-foreground/10 overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${config.color} transition-all duration-1000 ease-out`}
                style={{ width: `${data.percentage}%` }}
              />
              {data.percentage === 100 && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[220px] flex flex-col gap-1">
          <p className="text-xs font-medium">Nível de Treinamento da AI</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            A AI aprende com suas ações nas campanhas (escalar, pausar, ajustar orçamento). 
            Quanto mais ela aprende, melhores são as recomendações.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
