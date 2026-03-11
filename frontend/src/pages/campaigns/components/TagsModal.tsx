import { useState, useEffect, type KeyboardEvent } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RiCloseLine } from "@remixicon/react";

interface TagsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignName: string;
  campaignId: string;
  currentTags: string[];
  onSave: (campaignId: string, tags: string[]) => Promise<void>;
  isLoading?: boolean;
}

export function TagsModal({
  open, onOpenChange, campaignName, campaignId,
  currentTags, onSave, isLoading,
}: TagsModalProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (open) setTags([...currentTags]);
  }, [open, currentTags]);

  const addTag = (raw: string) => {
    const parts = raw.split(",").map((t) => t.trim()).filter(Boolean);
    const newTags = parts.filter((t) => !tags.includes(t));
    if (newTags.length > 0) setTags((prev) => [...prev, ...newTags]);
    setInputValue("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) addTag(inputValue);
    }
  };

  const handleSave = async () => {
    await onSave(campaignId, tags);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Tags da Campanha</DialogTitle>
          <DialogDescription className="truncate">
            {campaignName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Label>Tags</Label>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-2 border rounded-md bg-muted/30 max-h-[120px] overflow-y-auto">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 pr-1 text-xs">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-0.5 rounded-full hover:bg-foreground/10 p-0.5 transition-colors"
                  >
                    <RiCloseLine className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <Input
            placeholder="Digite a tag e pressione Enter"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => { if (inputValue.trim()) addTag(inputValue); }}
            disabled={isLoading}
          />
          <p className="text-[10px] text-muted-foreground">
            Separe por <kbd className="px-1 py-0.5 bg-muted rounded text-[9px] font-mono">vírgula</kbd> ou pressione <kbd className="px-1 py-0.5 bg-muted rounded text-[9px] font-mono">Enter</kbd> para adicionar.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar Tags"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
