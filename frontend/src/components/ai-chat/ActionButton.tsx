import { useState } from "react";
import {
  RiArrowUpLine, RiArrowDownLine, RiPauseLine, RiPlayLine, RiMoneyDollarCircleLine,
  RiCheckLine, RiLoader4Line,
} from "@remixicon/react";
import type { AiAction } from "@/services/integrations";

interface ActionButtonProps {
  action: AiAction;
  onExecute: (action: AiAction) => Promise<void>;
  disabled?: boolean;
}

const ACTION_CONFIG: Record<string, {
  icon: typeof RiArrowUpLine;
  label: (a: AiAction) => string;
  color: string;
  bgColor: string;
}> = {
  increase_budget: {
    icon: RiArrowUpLine,
    label: (a) => `Aumentar R$${a.value} → ${a.entity_name}`,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/30",
  },
  decrease_budget: {
    icon: RiArrowDownLine,
    label: (a) => `Diminuir R$${a.value} → ${a.entity_name}`,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 border-amber-200 dark:border-amber-500/30",
  },
  set_budget: {
    icon: RiMoneyDollarCircleLine,
    label: (a) => `Definir R$${a.value} → ${a.entity_name}`,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 border-blue-200 dark:border-blue-500/30",
  },
  pause: {
    icon: RiPauseLine,
    label: (a) => `Pausar → ${a.entity_name}`,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 border-red-200 dark:border-red-500/30",
  },
  activate: {
    icon: RiPlayLine,
    label: (a) => `Ativar → ${a.entity_name}`,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/30",
  },
};

export function ActionButton({ action, onExecute, disabled }: ActionButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const config = ACTION_CONFIG[action.action];
  if (!config) return null;

  const Icon = config.icon;

  const handleClick = async () => {
    if (status !== "idle") return;
    setStatus("loading");
    try {
      await onExecute(action);
      setStatus("done");
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  if (status === "done") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
        <RiCheckLine className="size-3.5" />
        <span>✅ Executado</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || status === "loading"}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-200 ${config.bgColor} ${config.color} ${
        status === "loading" ? "opacity-70 cursor-wait" : "cursor-pointer active:scale-[0.98]"
      }`}
    >
      {status === "loading" ? (
        <RiLoader4Line className="size-3.5 animate-spin" />
      ) : (
        <Icon className="size-3.5" />
      )}
      <span className="break-words text-left">
        {status === "error" ? "❌ Erro, tente novamente" : config.label(action)}
      </span>
    </button>
  );
}
