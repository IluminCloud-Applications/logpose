import { RiCloseLine } from "@remixicon/react";

interface SelectedBadgeProps {
  icon: React.ReactNode;
  label: string;
  onClear: () => void;
  onClick: () => void;
}

export function SelectedBadge({ icon, label, onClear, onClick }: SelectedBadgeProps) {
  return (
    <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-primary/5 border-primary/20">
      <button
        onClick={onClick}
        className="flex items-center gap-2 flex-1 min-w-0 text-left"
      >
        <span className="text-primary shrink-0">{icon}</span>
        <span className="text-sm font-medium truncate">{label}</span>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onClear(); }}
        className="shrink-0 p-0.5 rounded hover:bg-destructive/10 hover:text-destructive transition-colors"
      >
        <RiCloseLine className="size-4" />
      </button>
    </div>
  );
}
