import { useState } from "react";
import { PlatformsHeader } from "./components/PlatformsHeader";
import { PlatformsTable } from "./components/PlatformsTable";
import { CreateWebhookModal } from "./components/CreateWebhookModal";
import { ImportModal } from "./components/ImportModal";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { useWebhooks } from "@/hooks/useWebhooks";
import type { WebhookEndpointAPI } from "@/services/integrations";

export default function PlatformsPage() {
  const { endpoints, isLoading, addWebhook, removeWebhook } = useWebhooks();
  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<WebhookEndpointAPI | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (platform: "kiwify" | "payt", name: string) => {
    try {
      setIsCreating(true);
      await addWebhook(platform, name);
      setModalOpen(false);
    } catch {
      alert("Erro ao criar webhook");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteClick = (endpoint: WebhookEndpointAPI) => {
    setDeleteTarget(endpoint);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await removeWebhook(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      alert("Erro ao excluir webhook");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <PlatformsHeader
        onCreateNew={() => setModalOpen(true)}
        onImport={() => setImportOpen(true)}
      />
      <PlatformsTable
        endpoints={endpoints}
        isLoading={isLoading}
        onDelete={handleDeleteClick}
      />
      <CreateWebhookModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onCreate={handleCreate}
        isLoading={isCreating}
      />
      <ImportModal
        open={importOpen}
        onOpenChange={setImportOpen}
      />
      <ConfirmDeleteModal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Excluir Webhook"
        description={`Tem certeza que deseja excluir o webhook "${deleteTarget?.name}"? A URL deixará de funcionar e os dados não poderão ser recuperados.`}
      />
    </div>
  );
}
