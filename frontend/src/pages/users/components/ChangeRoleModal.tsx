import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { User } from "@/services/users";

interface ChangeRoleModalProps {
  user: User | null;
  onClose: () => void;
  onChangeRole: (userId: number, role: string) => Promise<void>;
}

export function ChangeRoleModal({ user, onClose, onChangeRole }: ChangeRoleModalProps) {
  const [role, setRole] = useState("viewer");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) setRole(user.role);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await onChangeRole(user.id, role);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Alterar Nível de Acesso</DialogTitle>
          <DialogDescription>
            Altere o nível de <span className="font-medium text-foreground">{user?.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="change-role">Novo Nível</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="change-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Visualizador</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {role === "viewer"
                ? "Poderá apenas visualizar os dados do dashboard."
                : "Terá acesso completo, exceto gerenciar o owner."}
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading || role === user?.role}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
