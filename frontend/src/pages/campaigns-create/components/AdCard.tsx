import { RiCloseLine, RiFilmLine, RiImageLine } from "@remixicon/react";
import type { AdFormData } from "../hooks/useCampaignForm";

interface AdCardProps {
  ad: AdFormData;
  index: number;
  showFields: boolean;
  onUpdate: (data: Partial<AdFormData>) => void;
  onRemove: () => void;
}

export function AdCard({ ad, index, showFields, onUpdate, onRemove }: AdCardProps) {
  const isVideo = ad.media_type === "video";

  return (
    <div className="relative group border rounded-lg overflow-hidden bg-card hover:border-primary/30 transition-colors">
      {/* Preview */}
      <div className="relative aspect-video bg-muted flex items-center justify-center overflow-hidden">
        {isVideo ? (
          <video
            src={ad.preview_url}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
        ) : (
          <img
            src={ad.preview_url}
            alt={`Criativo ${index + 1}`}
            className="w-full h-full object-cover"
          />
        )}

        {/* Badge tipo */}
        <div className="absolute top-2 left-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 text-white text-xs">
            {isVideo ? <RiFilmLine className="size-3" /> : <RiImageLine className="size-3" />}
            {isVideo ? "Vídeo" : "Imagem"}
          </span>
        </div>

        {/* Botão remover */}
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
        >
          <RiCloseLine className="size-4" />
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <input
          className="w-full text-sm font-medium bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none transition-colors pb-1"
          placeholder={`Criativo ${index + 1}`}
          value={ad.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
        />

        {showFields && (
          <div className="mt-3 space-y-2">
            <input
              className="w-full text-xs bg-transparent border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Texto Principal"
              value={ad.primary_text}
              onChange={(e) => onUpdate({ primary_text: e.target.value })}
            />
            <input
              className="w-full text-xs bg-transparent border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Título"
              value={ad.headline}
              onChange={(e) => onUpdate({ headline: e.target.value })}
            />
            <input
              className="w-full text-xs bg-transparent border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Descrição"
              value={ad.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
            />
            <input
              className="w-full text-xs bg-transparent border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="https://suaoferta.com"
              value={ad.link}
              onChange={(e) => onUpdate({ link: e.target.value })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
