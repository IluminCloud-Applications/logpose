import { useState } from "react";
import { FacebookHeader } from "./components/FacebookHeader";
import { FacebookTable } from "./components/FacebookTable";
import { AddAccountModal } from "./components/AddAccountModal";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { useFacebookAccounts } from "@/hooks/useFacebookAccounts";
import type { FacebookAccountAPI } from "@/services/integrations";

export default function FacebookAdsPage() {
  const { accounts, isLoading, addAccount, bulkAddAccounts, removeAccount } = useFacebookAccounts();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FacebookAccountAPI | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [prefillToken, setPrefillToken] = useState<string | undefined>();

  const openAddModal = () => {
    setPrefillToken(undefined);
    setModalOpen(true);
  };

  const openDuplicateModal = (account: FacebookAccountAPI) => {
    setPrefillToken(account.access_token);
    setModalOpen(true);
  };

  const handleAdd = async (label: string, accountId: string, accessToken: string) => {
    try {
      setIsAdding(true);
      await addAccount(label, accountId, accessToken);
      setModalOpen(false);
    } catch {
      alert("Erro ao adicionar conta Facebook");
    } finally {
      setIsAdding(false);
    }
  };

  const handleBulkAdd = async (
    items: { label: string; account_id: string }[],
    accessToken: string
  ) => {
    try {
      setIsAdding(true);
      await bulkAddAccounts(items, accessToken);
      setModalOpen(false);
    } catch {
      alert("Erro ao adicionar contas Facebook");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteClick = (account: FacebookAccountAPI) => {
    setDeleteTarget(account);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await removeAccount(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      alert("Erro ao excluir conta Facebook");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <FacebookHeader onAddAccount={openAddModal} />
      <FacebookTable
        accounts={accounts}
        isLoading={isLoading}
        onDelete={handleDeleteClick}
        onDuplicate={openDuplicateModal}
      />
      <AddAccountModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onAdd={handleAdd}
        onBulkAdd={handleBulkAdd}
        isLoading={isAdding}
        prefillToken={prefillToken}
      />
      <ConfirmDeleteModal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Excluir conta Facebook"
        description={`Tem certeza que deseja excluir a conta "${deleteTarget?.label}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}
