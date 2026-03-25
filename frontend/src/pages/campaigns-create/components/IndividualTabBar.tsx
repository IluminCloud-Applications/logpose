import { cn } from "@/lib/utils";
import { RiImageLine, RiFilmLine } from "@remixicon/react";
import type { AdFormData } from "../hooks/useCampaignForm";

interface IndividualTabBarProps {
  ads: AdFormData[];
  activeTab: number;
  onTabChange: (index: number) => void;
}

export function IndividualTabBar({ ads, activeTab, onTabChange }: IndividualTabBarProps) {
  if (ads.length === 0) return null;

  return (
    <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
      {ads.map((ad, index) => {
        const isActive = index === activeTab;
        const isVideo = ad.media_type === "video";
        const label = ad.name || `AD ${String(index + 1).padStart(2, "0")}`;

        return (
          <button
            key={index}
            onClick={() => onTabChange(index)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap border",
              "hover:bg-accent/50 hover:text-foreground",
              isActive
                ? "bg-primary/10 border-primary/30 text-primary shadow-sm"
                : "bg-transparent border-transparent text-muted-foreground"
            )}
          >
            {/* Mini preview */}
            <div className="shrink-0 w-6 h-6 rounded overflow-hidden bg-muted">
              {isVideo ? (
                <video src={ad.preview_url} className="w-full h-full object-cover" muted playsInline />
              ) : (
                <img src={ad.preview_url} alt={label} className="w-full h-full object-cover" />
              )}
            </div>

            {/* Icon + label */}
            {isVideo
              ? <RiFilmLine className="size-3 shrink-0 opacity-60" />
              : <RiImageLine className="size-3 shrink-0 opacity-60" />
            }
            <span className="max-w-[120px] truncate">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
