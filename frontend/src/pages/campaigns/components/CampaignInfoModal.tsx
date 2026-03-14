import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RiVideoLine, RiShoppingBag2Line, RiBox3Line, RiStoreLine,
  RiExternalLinkLine, RiAlertLine, RiPriceTag3Line,
} from "@remixicon/react";
import type { CampaignMarkerAPI } from "@/services/campaigns";

interface CampaignInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignName: string;
  tags?: string[];
  videoMarker?: CampaignMarkerAPI;
  checkoutMarker?: CampaignMarkerAPI;
  productMarker?: CampaignMarkerAPI;
  platformMarker?: CampaignMarkerAPI;
}

function buildVturbUrl(videoId: string): string {
  return `https://app.vturb.com/players/${videoId}/edit`;
}

export function CampaignInfoModal({
  open, onOpenChange, campaignName, tags = [],
  videoMarker, checkoutMarker, productMarker, platformMarker,
}: CampaignInfoModalProps) {
  const hasVideo = !!videoMarker;
  const hasCheckout = !!checkoutMarker;
  const hasProduct = !!productMarker;
  const hasPlatform = !!platformMarker;
  const hasTags = tags.length > 0;
  const hasAny = hasVideo || hasCheckout || hasProduct || hasPlatform || hasTags;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Informações da Campanha</DialogTitle>
          <DialogDescription className="break-all">
            {campaignName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <InfoSection
            icon={<RiVideoLine className="size-4" />}
            label="Vídeo VTurb"
            hasData={hasVideo}
            emptyText="Nenhum vídeo definido"
          >
            {hasVideo && videoMarker && (
              <InfoCard
                title={videoMarker.reference_label}
                subtitle={`ID: ${videoMarker.reference_id}`}
                actionLabel="Abrir no VTurb"
                actionUrl={buildVturbUrl(videoMarker.reference_id)}
              />
            )}
          </InfoSection>

          <InfoSection
            icon={<RiShoppingBag2Line className="size-4" />}
            label="Checkout"
            hasData={hasCheckout}
            emptyText="Nenhum checkout definido"
          >
            {hasCheckout && checkoutMarker && (
              <InfoCard
                title={checkoutMarker.reference_label}
                subtitle={`ID: ${checkoutMarker.reference_id}`}
                actionLabel="Abrir Checkout"
                actionUrl={extractCheckoutUrl(checkoutMarker.reference_label)}
              />
            )}
          </InfoSection>

          <InfoSection
            icon={<RiBox3Line className="size-4" />}
            label="Produto"
            hasData={hasProduct}
            emptyText="Nenhum produto definido"
          >
            {hasProduct && productMarker && (
              <InfoCard
                title={productMarker.reference_label}
                subtitle={`ID: ${productMarker.reference_id}`}
              />
            )}
          </InfoSection>

          <InfoSection
            icon={<RiStoreLine className="size-4" />}
            label="Plataforma"
            hasData={hasPlatform}
            emptyText="Nenhuma plataforma definida"
          >
            {hasPlatform && platformMarker && (
              <InfoCard
                title={platformMarker.reference_label}
                subtitle={platformMarker.reference_id}
              />
            )}
          </InfoSection>

          <InfoSection
            icon={<RiPriceTag3Line className="size-4" />}
            label="Tags"
            hasData={hasTags}
            emptyText="Nenhuma tag adicionada"
          >
            {hasTags && (
              <div className="flex flex-wrap gap-1.5 pl-6">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs px-2 py-0.5 font-normal break-all"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </InfoSection>

          {!hasAny && (
            <div className="flex flex-col items-center justify-center py-6 gap-2 text-muted-foreground">
              <RiAlertLine className="size-8 opacity-40" />
              <p className="text-sm">
                Nenhuma informação definida para esta campanha.
              </p>
              <p className="text-xs">
                Use o botão direito na campanha para definir vídeo, checkout, produto e plataforma.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────

interface InfoSectionProps {
  icon: React.ReactNode;
  label: string;
  hasData: boolean;
  emptyText: string;
  children: React.ReactNode;
}

function InfoSection({ icon, label, hasData, emptyText, children }: InfoSectionProps) {
  return (
    <div className="rounded-lg border border-border/50 p-3.5 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
        <Badge
          variant={hasData ? "default" : "secondary"}
          className="text-[10px] px-1.5 py-0 h-4 ml-auto"
        >
          {hasData ? "Definido" : "Pendente"}
        </Badge>
      </div>
      {hasData ? children : (
        <p className="text-xs text-muted-foreground pl-6">{emptyText}</p>
      )}
    </div>
  );
}

interface InfoCardProps {
  title: string;
  subtitle: string;
  actionLabel?: string;
  actionUrl?: string | null;
}

function InfoCard({ title, subtitle, actionLabel, actionUrl }: InfoCardProps) {
  return (
    <div className="flex items-center justify-between gap-3 pl-6 overflow-hidden">
      <div className="flex flex-col min-w-0 overflow-hidden flex-1">
        <span className="text-sm font-medium truncate block" title={title}>
          {title}
        </span>
        <span className="text-[11px] text-muted-foreground truncate block">
          {subtitle}
        </span>
      </div>
      {actionLabel && actionUrl && (
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5 text-xs whitespace-nowrap"
          onClick={() => window.open(actionUrl, "_blank")}
        >
          <RiExternalLinkLine className="size-3.5" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────

function extractCheckoutUrl(referenceLabel: string): string | null {
  const parts = referenceLabel.split(" → ");
  if (parts.length >= 2) {
    const url = parts[parts.length - 1].trim();
    if (url.startsWith("http")) return url;
  }
  return null;
}
