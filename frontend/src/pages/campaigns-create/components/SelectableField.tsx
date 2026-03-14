import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SelectedBadge } from "./SelectedBadge";

interface SelectableFieldProps {
  label: string;
  hint: string;
  icon: React.ReactNode;
  selectedId: string;
  selectedLabel: string;
  placeholder: string;
  onOpen: () => void;
  onClear: () => void;
}

export function SelectableField({
  label, hint, icon, selectedId, selectedLabel, placeholder, onOpen, onClear,
}: SelectableFieldProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {selectedId ? (
        <SelectedBadge
          icon={icon}
          label={selectedLabel}
          onClear={onClear}
          onClick={onOpen}
        />
      ) : (
        <Button
          variant="outline"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={onOpen}
        >
          {icon}
          {placeholder}
        </Button>
      )}
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
