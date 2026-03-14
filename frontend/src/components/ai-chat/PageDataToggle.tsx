import { RiDatabase2Line } from "@remixicon/react";
import type { PageDataSnapshot } from "@/contexts/PageDataContext";

interface PageDataToggleProps {
  snapshot: PageDataSnapshot | null;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

/**
 * Toggle compacto que aparece acima do input do chat.
 * Quando há dados da página disponíveis, mostra a opção de usá-los.
 */
export function PageDataToggle({ snapshot, enabled, onToggle }: PageDataToggleProps) {
  if (!snapshot) return null;

  return (
    <div className="px-3 pt-2 pb-0.5">
      <button
        onClick={() => onToggle(!enabled)}
        className={`
          w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] transition-all duration-200
          ${enabled
            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
            : "bg-muted/50 text-muted-foreground border border-transparent hover:bg-muted/80"
          }
        `}
      >
        <RiDatabase2Line className={`size-3.5 shrink-0 ${enabled ? "text-blue-500" : ""}`} />
        <span className="flex-1 text-left truncate">
          {enabled ? (
            <>
              <span className="font-medium">Usando dados:</span>{" "}
              <span className="opacity-80">{snapshot.filtersDescription}</span>
            </>
          ) : (
            "Usar dados da página atual"
          )}
        </span>
        <div
          className={`
            relative w-7 h-4 rounded-full transition-colors duration-200
            ${enabled ? "bg-blue-500" : "bg-muted-foreground/30"}
          `}
        >
          <div
            className={`
              absolute top-0.5 size-3 rounded-full bg-white shadow-sm transition-transform duration-200
              ${enabled ? "translate-x-3.5" : "translate-x-0.5"}
            `}
          />
        </div>
      </button>
    </div>
  );
}
