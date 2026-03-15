import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRowActions } from "./UserRowActions";
import type { User } from "@/services/users";

interface UsersTableProps {
  data: User[];
  loading: boolean;
  currentUserId: number;
  currentUserRole: string;
  onResetPassword: (user: User) => void;
  onChangeRole: (user: User) => void;
  onDelete: (user: User) => void;
}

const roleLabels: Record<string, string> = {
  owner: "Owner",
  admin: "Administrador",
  viewer: "Visualizador",
};

const roleColors: Record<string, string> = {
  owner: "bg-amber-500/15 text-amber-600 border-amber-500/20",
  admin: "bg-chart-1/15 text-chart-1 border-chart-1/20",
  viewer: "bg-chart-2/15 text-chart-2 border-chart-2/20",
};

const statusLabels: Record<string, string> = {
  active: "Ativo",
  pending: "Pendente",
};

const statusColors: Record<string, string> = {
  active: "bg-[var(--color-success)]/15 text-[var(--color-success)] border-transparent",
  pending: "bg-orange-500/15 text-orange-600 border-transparent",
};

export function UsersTable({
  data, loading, currentUserId, currentUserRole,
  onResetPassword, onChangeRole, onDelete,
}: UsersTableProps) {
  return (
    <Card className="border-border/40 premium-table">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Nível</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="tabular-nums">Criado em</TableHead>
                <TableHead className="text-center w-[60px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              ) : (
                data.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    currentUserId={currentUserId}
                    currentUserRole={currentUserRole}
                    onResetPassword={onResetPassword}
                    onChangeRole={onChangeRole}
                    onDelete={onDelete}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function UserRow({
  user, currentUserId, currentUserRole, onResetPassword, onChangeRole, onDelete,
}: {
  user: User;
  currentUserId: number;
  currentUserRole: string;
  onResetPassword: (u: User) => void;
  onChangeRole: (u: User) => void;
  onDelete: (u: User) => void;
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">{user.name}</TableCell>
      <TableCell className="text-muted-foreground">
        {user.email || <span className="italic">Aguardando convite</span>}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={`text-[10px] font-medium border ${roleColors[user.role]}`}>
          {roleLabels[user.role]}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={`text-[10px] font-medium ${statusColors[user.status]}`}>
          {statusLabels[user.status]}
        </Badge>
      </TableCell>
      <TableCell className="tabular-nums text-muted-foreground whitespace-nowrap">
        {user.created_at
          ? new Date(user.created_at).toLocaleDateString("pt-BR", {
              day: "2-digit", month: "2-digit", year: "2-digit",
            })
          : "—"}
      </TableCell>
      <TableCell className="text-center">
        <UserRowActions
          user={user}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          onResetPassword={() => onResetPassword(user)}
          onChangeRole={() => onChangeRole(user)}
          onDelete={() => onDelete(user)}
        />
      </TableCell>
    </TableRow>
  );
}
