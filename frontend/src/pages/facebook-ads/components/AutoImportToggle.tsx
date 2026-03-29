import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RiSearchLine, RiLoader4Line, RiMagicLine } from "@remixicon/react";
import { discoverFacebookAccounts, type DiscoveredAccount } from "@/services/integrations";

interface AutoImportToggleProps {
  accessToken: string;
  onAccountsDiscovered: (accounts: DiscoveredAccount[]) => void;
  disabled?: boolean;
}

export function AutoImportToggle({
  accessToken,
  onAccountsDiscovered,
  disabled,
}: AutoImportToggleProps) {
  const [autoMode, setAutoMode] = useState(false);
  const [businessId, setBusinessId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundCount, setFoundCount] = useState<number | null>(null);

  const handleToggle = (checked: boolean) => {
    setAutoMode(checked);
    setError(null);
    setFoundCount(null);
    if (!checked) {
      setBusinessId("");
    }
  };

  const handleDiscover = async () => {
    if (!accessToken.trim() || !businessId.trim()) return;

    setIsSearching(true);
    setError(null);
    setFoundCount(null);

    try {
      const result = await discoverFacebookAccounts(
        accessToken.trim(),
        businessId.trim(),
      );

      if (result.accounts.length === 0) {
        setError("Nenhuma conta encontrada neste Business Manager");
        return;
      }

      setFoundCount(result.total);
      onAccountsDiscovered(result.accounts);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Erro ao buscar contas do BM"
      );
    } finally {
      setIsSearching(false);
    }
  };

  if (!autoMode) {
    return (
      <div className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2">
        <RiMagicLine className="size-4 text-blue-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <Label
            htmlFor="auto-import-toggle"
            className="text-sm font-medium cursor-pointer"
          >
            Importação Automática
          </Label>
          <p className="text-[11px] text-muted-foreground">
            Importe todas as contas de um Business Manager
          </p>
        </div>
        <Switch
          id="auto-import-toggle"
          checked={autoMode}
          onCheckedChange={handleToggle}
          disabled={disabled}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3 bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
      <div className="flex items-center gap-2">
        <RiMagicLine className="size-4 text-blue-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <Label
            htmlFor="auto-import-toggle"
            className="text-sm font-medium cursor-pointer"
          >
            Importação Automática
          </Label>
          <p className="text-[11px] text-muted-foreground">
            Importe todas as contas de um Business Manager
          </p>
        </div>
        <Switch
          id="auto-import-toggle"
          checked={autoMode}
          onCheckedChange={handleToggle}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bm-id" className="text-xs">
          Business Manager ID
        </Label>
        <div className="flex gap-2">
          <Input
            id="bm-id"
            placeholder="Ex: 123456789012345"
            value={businessId}
            onChange={(e) => setBusinessId(e.target.value)}
            disabled={disabled || isSearching}
            className="font-mono text-sm"
            autoComplete="off"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDiscover}
            disabled={
              disabled ||
              isSearching ||
              !businessId.trim() ||
              !accessToken.trim()
            }
            className="shrink-0 gap-1.5"
          >
            {isSearching ? (
              <RiLoader4Line className="size-3.5 animate-spin" />
            ) : (
              <RiSearchLine className="size-3.5" />
            )}
            {isSearching ? "Buscando..." : "Buscar"}
          </Button>
        </div>
      </div>

      {!accessToken.trim() && (
        <p className="text-[11px] text-amber-500">
          Preencha o Access Token acima primeiro
        </p>
      )}

      {error && (
        <p className="text-[11px] text-destructive">{error}</p>
      )}

      {foundCount !== null && (
        <p className="text-[11px] text-emerald-500 font-medium">
          ✓ {foundCount} {foundCount === 1 ? "conta encontrada" : "contas encontradas"} e adicionadas abaixo
        </p>
      )}
    </div>
  );
}
