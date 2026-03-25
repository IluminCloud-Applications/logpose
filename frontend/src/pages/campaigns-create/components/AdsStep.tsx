import { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { CampaignFormState, AdFormData, BulkEditData } from "../hooks/useCampaignForm";
import { AdCard } from "./AdCard";
import { BulkEditPanel } from "./BulkEditPanel";
import { IndividualEditPanel } from "./IndividualEditPanel";
import { RiUploadCloud2Line } from "@remixicon/react";

interface AdsStepProps {
  form: CampaignFormState;
  onUpdate: <K extends keyof CampaignFormState>(key: K, value: CampaignFormState[K]) => void;
  onAddAd: (file: File) => void;
  onUpdateAd: (index: number, data: Partial<AdFormData>) => void;
  onRemoveAd: (index: number) => void;
  onUpdateBulk: (data: Partial<BulkEditData>) => void;
}

export function AdsStep({ form, onUpdate, onAddAd, onUpdateAd, onRemoveAd, onUpdateBulk }: AdsStepProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      files.forEach((file) => {
        if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
          onAddAd(file);
        }
      });
    },
    [onAddAd]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      files.forEach((file) => onAddAd(file));
      e.target.value = "";
    },
    [onAddAd]
  );

  return (
    <div className="space-y-4">
      {/* Toggle batch mode */}
      <Card>
        <CardContent className="py-4 flex items-center justify-between">
          <div>
            <Label className="font-medium">Modo em Massa</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              {form.batchMode
                ? "Mesmo texto, título, link e UTM para todos os criativos"
                : "Personalize cada criativo individualmente via tabs"
              }
            </p>
          </div>
          <Switch
            checked={form.batchMode}
            onCheckedChange={(v) => onUpdate("batchMode", v)}
          />
        </CardContent>
      </Card>

      {/* Upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
        onClick={() => document.getElementById("media-upload")?.click()}
      >
        <RiUploadCloud2Line className="size-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm font-medium">Arraste imagens ou vídeos aqui</p>
        <p className="text-xs text-muted-foreground mt-1">
          ou clique para selecionar • JPG, PNG, MP4, MOV
        </p>
        <input
          id="media-upload"
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileInput}
        />
      </div>

      {/* Edit panel — bulk ou individual */}
      {form.batchMode ? (
        <BulkEditPanel form={form} onUpdateBulk={onUpdateBulk} />
      ) : (
        form.ads.length > 0 && (
          <IndividualEditPanel form={form} onUpdateAd={onUpdateAd} />
        )
      )}

      {/* Grid de criativos — thumbnail-only */}
      {form.ads.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">
              {form.ads.length} criativo{form.ads.length > 1 ? "s" : ""} adicionado{form.ads.length > 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {form.ads.map((ad, index) => (
                <AdCard
                  key={index}
                  ad={ad}
                  index={index}
                  onUpdate={(data) => onUpdateAd(index, data)}
                  onRemove={() => onRemoveAd(index)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
