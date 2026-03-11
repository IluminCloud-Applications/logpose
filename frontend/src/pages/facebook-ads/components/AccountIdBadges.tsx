import { useState, useCallback, type KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RiCloseLine, RiAddCircleLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";

interface AccountIdBadgesProps {
  accountIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

export function AccountIdBadges({ accountIds, onChange, disabled }: AccountIdBadgesProps) {
  const [inputValue, setInputValue] = useState("");

  const addId = useCallback(() => {
    const val = inputValue.trim();
    if (!val) return;
    if (accountIds.includes(val)) {
      setInputValue("");
      return;
    }
    onChange([...accountIds, val]);
    setInputValue("");
  }, [inputValue, accountIds, onChange]);

  const removeId = (id: string) => {
    onChange(accountIds.filter((v) => v !== id));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addId();
    }
  };

  return (
    <div className="space-y-2">
      <Label>
        Ad Account ID
        {accountIds.length > 0 && (
          <span className="ml-1.5 text-xs text-muted-foreground">
            ({accountIds.length} {accountIds.length === 1 ? "conta" : "contas"})
          </span>
        )}
      </Label>

      {accountIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 border rounded-md bg-muted/30 max-h-[120px] overflow-y-auto">
          {accountIds.map((id) => (
            <Badge
              key={id}
              variant="secondary"
              className="gap-1 pr-1 text-xs font-mono"
            >
              {id}
              <button
                type="button"
                onClick={() => removeId(id)}
                className="ml-0.5 rounded-full hover:bg-foreground/10 p-0.5 transition-colors"
                disabled={disabled}
              >
                <RiCloseLine className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="act_XXXXXXXXXX"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="font-mono"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={addId}
          disabled={disabled || !inputValue.trim()}
          className="shrink-0"
        >
          <RiAddCircleLine className="size-4" />
        </Button>
      </div>

      <p className="text-[10px] text-muted-foreground">
        Pressione <kbd className="px-1 py-0.5 bg-muted rounded text-[9px] font-mono">Enter</kbd> ou clique no <span className="font-bold">+</span> para adicionar. Adicione múltiplas contas para cadastrá-las com o mesmo token.
      </p>
    </div>
  );
}
