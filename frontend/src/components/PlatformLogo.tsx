import { RiCodeSSlashLine } from "@remixicon/react";

const PLATFORM_CONFIG = {
  kiwify: { label: "Kiwify", logo: "/platforms/kiwify.webp", type: "image" as const },
  payt: { label: "PayT", logo: "/platforms/payt.webp", type: "image" as const },
  api: { label: "API", logo: null, type: "badge" as const },
} as const;

type Platform = keyof typeof PLATFORM_CONFIG;

interface PlatformLogoProps {
  platform: Platform;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const sizeMap = {
  sm: "size-4",
  md: "size-5",
  lg: "size-7",
};

const textMap = {
  sm: "text-[11px]",
  md: "text-xs",
  lg: "text-sm",
};

export function PlatformLogo({ platform, size = "md", showLabel = true }: PlatformLogoProps) {
  const config = PLATFORM_CONFIG[platform];

  if (config.type === "badge") {
    return (
      <div className="flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-0.5 font-bold tracking-widest uppercase ${textMap[size]} text-primary`}
        >
          <RiCodeSSlashLine className={sizeMap[size]} />
          {config.label}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <img
        src={config.logo!}
        alt={config.label}
        className={`${sizeMap[size]} object-contain`}
      />
      {showLabel && (
        <span className={`${textMap[size]} font-semibold`}>
          {config.label}
        </span>
      )}
    </div>
  );
}

export { PLATFORM_CONFIG, type Platform };
