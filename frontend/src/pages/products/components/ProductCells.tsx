import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { RiExternalLinkLine, RiArrowUpSLine, RiHashtag } from "@remixicon/react";
import { PlatformLogo } from "@/components/PlatformLogo";

// ── Checkout Identifier Cell ────────────────────────────────

export function CheckoutIdentifierCell({ url, checkoutCode, platform, name }: {
  url: string; checkoutCode: string | null; platform: "kiwify" | "payt"; name: string | null;
}) {
  const handleOpen = (e: React.MouseEvent) => {
    if (!url) return;
    e.stopPropagation();
    const href = url.startsWith("http") ? url : `https://${url}`;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  if (platform === "payt" && checkoutCode) {
    return (
      <div className="flex flex-col gap-0.5 max-w-[220px]">
        {name && (
          <span className="text-xs font-medium truncate" title={name}>{name}</span>
        )}
        <div className="flex items-center gap-1.5">
          <RiHashtag className="size-3.5 shrink-0 text-primary" />
          <span className="font-mono text-xs font-medium">{checkoutCode}</span>
        </div>
        {url && (
          <div className="flex items-center gap-1.5 pl-5">
            <button type="button" onClick={handleOpen} title="Abrir checkout" className="shrink-0 rounded p-0.5 hover:bg-muted/60 transition-colors">
              <RiExternalLinkLine className="size-3 text-muted-foreground hover:text-primary transition-colors" />
            </button>
            <span className="font-mono text-[10px] text-muted-foreground truncate">{url}</span>
          </div>
        )}
      </div>
    );
  }

  if (name) {
    return (
      <div className="flex flex-col gap-0.5 max-w-[220px]">
        <span className="text-xs font-medium truncate" title={name}>{name}</span>
        {url && (
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={handleOpen} title="Abrir checkout" className="shrink-0 rounded p-0.5 hover:bg-muted/60 transition-colors">
              <RiExternalLinkLine className="size-3 text-muted-foreground hover:text-primary transition-colors" />
            </button>
            <span className="font-mono text-[10px] text-muted-foreground truncate">{url}</span>
          </div>
        )}
      </div>
    );
  }

  return <UrlCell url={url} />;
}

// ── URL Cell ────────────────────────────────────────────────

function UrlCell({ url }: { url: string }) {
  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const href = url.startsWith("http") ? url : `https://${url}`;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex items-center gap-1.5 max-w-[220px]">
      <button type="button" onClick={handleOpen} title="Abrir checkout" className="shrink-0 rounded p-0.5 hover:bg-muted/60 transition-colors">
        <RiExternalLinkLine className="size-3.5 text-muted-foreground hover:text-primary transition-colors" />
      </button>
      <span className="font-mono text-xs truncate">{url}</span>
    </div>
  );
}

// ── Platform Cell ───────────────────────────────────────────

export function PlatformCell({ platform }: { platform: "kiwify" | "payt" }) {
  return (
    <Badge variant="outline" className="text-[10px] gap-1 py-0.5">
      <PlatformLogo platform={platform} size="sm" showLabel={false} />
      {platform === "payt" ? "PayT" : "Kiwify"}
    </Badge>
  );
}

// ── Conversion Cell ─────────────────────────────────────────

export function ConversionCell({ rate }: { rate: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-[var(--color-success)] font-medium">
      <RiArrowUpSLine className="size-3.5" />
      {rate.toFixed(1)}%
    </span>
  );
}

// ── Product Avatar ──────────────────────────────────────────

export function ProductAvatar({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  const [imgError, setImgError] = useState(false);

  if (logoUrl && !imgError) {
    return (
      <div className="flex size-11 items-center justify-center rounded-xl bg-muted/30 shadow-sm overflow-hidden">
        <img
          src={logoUrl}
          alt={name}
          className="size-11 object-contain"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 shadow-sm">
      <span className="text-lg font-bold text-primary">
        {name.charAt(0)}
      </span>
    </div>
  );
}

// ── KPI Pill ────────────────────────────────────────────────

export function KpiPill({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="text-right">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`text-sm font-bold tabular-nums ${accent ? "text-primary" : ""}`}>{value}</p>
    </div>
  );
}
