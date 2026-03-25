import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiImageLine, RiFilmLine } from "@remixicon/react";
import type { CampaignFormState, AdFormData } from "../hooks/useCampaignForm";
import { IndividualTabBar } from "./IndividualTabBar";
import { IndividualFields } from "./IndividualFields";

interface IndividualEditPanelProps {
  form: CampaignFormState;
  onUpdateAd: (index: number, data: Partial<AdFormData>) => void;
}

/** Extrai URL base sem query params */
function stripQueryParams(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    const idx = url.indexOf("?");
    return idx >= 0 ? url.slice(0, idx) : url;
  }
}

function hasQueryParams(url: string): boolean {
  return url.includes("?");
}

export function IndividualEditPanel({ form, onUpdateAd }: IndividualEditPanelProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [showExtra, setShowExtra] = useState(false);

  // Garante que a tab ativa não ultrapasse o número de ads
  useEffect(() => {
    if (activeTab >= form.ads.length && form.ads.length > 0) {
      setActiveTab(form.ads.length - 1);
    }
  }, [form.ads.length, activeTab]);

  const currentAd = form.ads[activeTab];

  // Quando troca de tab, preenche campos vazios com dados do primeiro criativo
  const handleTabChange = useCallback((newIndex: number) => {
    if (newIndex === activeTab || newIndex >= form.ads.length) return;
    const target = form.ads[newIndex];
    const source = form.ads[0];
    if (source && newIndex > 0) {
      const patch: Partial<AdFormData> = {};
      if (!target.primary_text && source.primary_text) patch.primary_text = source.primary_text;
      if (!target.headline && source.headline) patch.headline = source.headline;
      if (!target.description && source.description) patch.description = source.description;
      if (!target.link && source.link) patch.link = source.link;
      if (!target.cta_type || target.cta_type === "LEARN_MORE") patch.cta_type = source.cta_type;
      if (!target.extra_params && source.extra_params) patch.extra_params = source.extra_params;
      if (Object.keys(patch).length > 0) onUpdateAd(newIndex, patch);
    }
    setActiveTab(newIndex);
  }, [activeTab, form.ads, onUpdateAd]);

  const handleLinkChange = useCallback((value: string) => {
    if (hasQueryParams(value)) {
      onUpdateAd(activeTab, { link: stripQueryParams(value) });
    } else {
      onUpdateAd(activeTab, { link: value });
    }
  }, [activeTab, onUpdateAd]);

  const handleUpdate = useCallback((data: Partial<AdFormData>) => {
    onUpdateAd(activeTab, data);
  }, [activeTab, onUpdateAd]);

  const mediaIcon = useMemo(() => {
    if (!currentAd) return null;
    return currentAd.media_type === "video"
      ? <RiFilmLine className="size-3.5" />
      : <RiImageLine className="size-3.5" />;
  }, [currentAd?.media_type]);

  if (!currentAd || form.ads.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          Edição Individual
          <span className="text-xs font-normal text-muted-foreground">
            Personalize cada criativo separadamente
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tab bar */}
        <IndividualTabBar
          ads={form.ads}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Preview thumbnail + tipo */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
          <div className="shrink-0 w-16 h-16 rounded-md overflow-hidden bg-muted">
            {currentAd.media_type === "video" ? (
              <video src={currentAd.preview_url} className="w-full h-full object-cover" muted playsInline />
            ) : (
              <img src={currentAd.preview_url} alt={`AD ${String(activeTab + 1).padStart(2, "0")}`} className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              {mediaIcon}
              <span>{currentAd.media_type === "video" ? "Vídeo" : "Imagem"}</span>
            </div>
            <input
              className="w-full text-sm font-medium bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none transition-colors"
              placeholder={`AD ${String(activeTab + 1).padStart(2, "0")}`}
              value={currentAd.name}
              onChange={(e) => handleUpdate({ name: e.target.value })}
            />
          </div>
        </div>

        {/* Campos do criativo */}
        <IndividualFields
          ad={currentAd}
          showExtra={showExtra}
          onToggleExtra={setShowExtra}
          onUpdate={handleUpdate}
          onLinkChange={handleLinkChange}
          hasQueryParams={hasQueryParams}
        />
      </CardContent>
    </Card>
  );
}
