import { useState, useEffect, useMemo } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RiCheckLine, RiSearchLine, RiVideoLine, RiPlayLine } from "@remixicon/react";
import { fetchVturbPlayers, type VturbPlayer } from "@/services/campaigns";

interface DefineVideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignName: string;
  currentVideoId?: string;
  onSave: (referenceId: string, referenceLabel: string) => Promise<void>;
}

function formatDuration(seconds: number): string {
  if (!seconds) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatPlays(n: number | undefined | null): string {
  const val = n ?? 0;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}k`;
  return String(val);
}

export function DefineVideoModal({
  open, onOpenChange, campaignName,
  currentVideoId, onSave,
}: DefineVideoModalProps) {
  const [players, setPlayers] = useState<VturbPlayer[]>([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setSearch("");
    fetchVturbPlayers()
      .then(setPlayers)
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    if (open && currentVideoId) setSelectedId(currentVideoId);
    else setSelectedId("");
  }, [open, currentVideoId]);

  const filtered = useMemo(() => {
    const list = !search
      ? [...players]
      : players.filter((p) => {
          const q = search.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.id.toLowerCase().includes(q) ||
            p.account_name.toLowerCase().includes(q)
          );
        });
    return list.sort((a, b) => (b.plays_30d ?? 0) - (a.plays_30d ?? 0));
  }, [players, search]);

  const handleSave = async () => {
    if (!selectedId) return;
    const player = players.find((p) => p.id === selectedId);
    if (!player) return;
    setSaving(true);
    await onSave(player.id, player.name);
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Definir Vídeo</DialogTitle>
          <DialogDescription className="truncate">
            {campaignName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, ID ou conta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              autoFocus
              autoComplete="off"
            />
          </div>

          {search && (
            <p className="text-xs text-muted-foreground">
              {filtered.length} de {players.length} vídeos
            </p>
          )}

          <div className="max-h-[300px] overflow-y-auto space-y-1 border rounded-md p-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">Carregando vídeos...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <RiVideoLine className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  {players.length === 0
                    ? "Nenhuma conta VTurb conectada"
                    : "Nenhum vídeo encontrado"}
                </p>
              </div>
            ) : (
              filtered.map((p) => {
                const isSelected = p.id === selectedId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedId(p.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-2 min-w-0 ${
                      isSelected
                        ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-2 w-full min-w-0 flex-1">
                      <div className="mt-0.5 sm:mt-0 shrink-0">
                        {isSelected ? (
                           <RiCheckLine className="size-4" />
                        ) : (
                           <div className="size-4" /> 
                        )}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-medium break-words line-clamp-2 leading-tight" title={p.name}>
                          {p.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground mt-0.5 leading-tight" title={`${p.account_name} · ID: ${p.id}`}>
                          {p.account_name} · ID: {p.id.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 pl-6 sm:pl-0 shrink-0">
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <RiPlayLine className="size-3" />
                        {formatPlays(p.plays_30d)}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {formatDuration(p.duration)}
                      </Badge>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!selectedId || saving}>
            {saving ? "Salvando..." : "Definir Vídeo"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
