import { useState } from "react";
import { UsersHeader } from "./components/UsersHeader";
import { UsersTable } from "./components/UsersTable";
import { InviteModal } from "./components/InviteModal";
import { InviteLinkModal } from "./components/InviteLinkModal";
import { ResetPasswordModal } from "./components/ResetPasswordModal";
import { ChangeRoleModal } from "./components/ChangeRoleModal";
import { DeleteUserModal } from "./components/DeleteUserModal";
import { useUsers } from "@/hooks/useUsers";
import { getStoredUser } from "@/services/auth";
import { toast } from "sonner";
import type { User } from "@/services/users";

export default function UsersPage() {
  const { users, loading, invite, changeRole, resetPassword, removeUser } = useUsers();
  const currentUser = getStoredUser();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState<{ token: string; name: string } | null>(null);
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [roleTarget, setRoleTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  // If role is missing (old session before roles), treat as owner (only the original admin would be logged in)
  const userRole = currentUser?.role ?? "owner";
  const canInvite = userRole === "owner" || userRole === "admin";

  const handleInvite = async (name: string, role: string) => {
    try {
      const result = await invite(name, role);
      setInviteOpen(false);
      setInviteLink({ token: result.invite_token, name });
      toast.success("Convite criado com sucesso");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar convite");
    }
  };

  const handleChangeRole = async (userId: number, role: string) => {
    try {
      await changeRole(userId, role);
      toast.success("Nível alterado com sucesso");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao alterar nível");
    }
  };

  const handleResetPassword = async (userId: number, pw: string, confirm: string) => {
    await resetPassword(userId, pw, confirm);
    toast.success("Senha redefinida com sucesso");
  };

  const handleDelete = async (userId: number) => {
    try {
      await removeUser(userId);
      toast.success("Usuário removido");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <UsersHeader onInvite={() => setInviteOpen(true)} canInvite={canInvite} />

      <UsersTable
        data={users}
        loading={loading}
        currentUserId={currentUser?.id ?? 0}
        currentUserRole={userRole}
        onResetPassword={setResetTarget}
        onChangeRole={setRoleTarget}
        onDelete={setDeleteTarget}
      />

      <InviteModal
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvite={handleInvite}
        currentUserRole={userRole}
      />

      <InviteLinkModal
        open={!!inviteLink}
        onOpenChange={(v) => !v && setInviteLink(null)}
        inviteToken={inviteLink?.token ?? ""}
        userName={inviteLink?.name ?? ""}
      />

      <ResetPasswordModal
        user={resetTarget}
        onClose={() => setResetTarget(null)}
        onReset={handleResetPassword}
      />

      <ChangeRoleModal
        user={roleTarget}
        onClose={() => setRoleTarget(null)}
        onChangeRole={handleChangeRole}
      />

      <DeleteUserModal
        user={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDelete={handleDelete}
      />
    </div>
  );
}
