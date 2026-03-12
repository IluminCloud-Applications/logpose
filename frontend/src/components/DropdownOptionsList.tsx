import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { QuickFilterOption } from "./QuickFiltersBadges";

interface DropdownOptionsListProps {
  options: QuickFilterOption[];
  currentValue: string;
  resetValue?: string;
  onSelect: (value: string) => void;
}

export function DropdownOptionsList({
  options,
  currentValue,
  resetValue = "all",
  onSelect,
}: DropdownOptionsListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Show all options — resetValue is used only for toggle-off (deselect)
  const visibleOptions = options;

  useEffect(() => {
    listRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, visibleOptions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      const opt = visibleOptions[focusedIndex];
      onSelect(opt.value === currentValue ? resetValue : opt.value);
    }
  };

  return (
    <div
      ref={listRef}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className="outline-none"
    >
      {visibleOptions.map((opt, idx) => {
        const isSelected = opt.value === currentValue;
        const isFocused = idx === focusedIndex;
        return (
          <button
            key={opt.value}
            onClick={() => onSelect(isSelected ? resetValue : opt.value)}
            className={cn(
              "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs transition-colors",
              isSelected
                ? "bg-primary/10 text-primary font-medium"
                : "text-foreground hover:bg-muted",
              isFocused && "bg-muted"
            )}
          >
            <span className={cn(
              "size-1.5 rounded-full shrink-0",
              isSelected ? "bg-primary" : "bg-transparent"
            )} />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
