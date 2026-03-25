import type { RemixiconComponentType } from "@remixicon/react";

interface MoreItem {
  label: string;
  icon: RemixiconComponentType;
  path: string;
}

interface MoreDropdownProps {
  isOpen: boolean;
  items: MoreItem[];
  currentPath: string;
  onItemClick: (path: string) => void;
}

export function MoreDropdown({
  isOpen,
  items,
  currentPath,
  onItemClick,
}: MoreDropdownProps) {
  return (
    <div
      className={`absolute bottom-full right-0 mb-2 transition-all duration-200 origin-bottom-right ${
        isOpen
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 translate-y-2 pointer-events-none"
      }`}
    >
      <div className="rounded-2xl bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl p-2 min-w-[180px]">
        {items.map((item) => {
          const isActive = currentPath.startsWith(item.path);
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              onClick={() => onItemClick(item.path)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <Icon className="size-4.5 shrink-0" />
              <span
                className={`text-sm ${
                  isActive ? "font-semibold" : "font-medium"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
