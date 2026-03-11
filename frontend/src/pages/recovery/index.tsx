import { useState, useEffect } from "react";
import { RecoveryHeader } from "./components/RecoveryHeader";
import { RecoveryKpis } from "./components/RecoveryKpis";
import { RecoveryTable } from "./components/RecoveryTable";
import { ConfigDrawer } from "./components/ConfigDrawer";
import { useRecoveries } from "@/hooks/useRecoveries";
import { useChannelConfigs } from "@/hooks/useChannelConfigs";
import type { DatePreset } from "@/components/DateFilter";

export default function RecoveryPage() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [datePreset, setDatePreset] = useState<DatePreset>("today");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [configOpen, setConfigOpen] = useState(false);

  const { data, total, page, setPage, resetPage, isLoading } = useRecoveries({
    preset: datePreset,
    dateStart: datePreset === "custom" ? dateStart : undefined,
    dateEnd: datePreset === "custom" ? dateEnd : undefined,
    typeFilter,
    statusFilter,
    channelFilter,
  });

  // Reset page when filters change
  useEffect(() => {
    resetPage();
  }, [typeFilter, statusFilter, channelFilter, datePreset, dateStart, dateEnd, resetPage]);

  const { configs, isSaving, save } = useChannelConfigs();

  return (
    <div className="flex flex-col gap-6 p-6">
      <RecoveryHeader
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        channelFilter={channelFilter}
        onChannelChange={setChannelFilter}
        datePreset={datePreset}
        dateStart={dateStart}
        dateEnd={dateEnd}
        onDatePresetChange={setDatePreset}
        onDateStartChange={setDateStart}
        onDateEndChange={setDateEnd}
        onOpenConfig={() => setConfigOpen(true)}
      />
      <RecoveryKpis data={data} />
      <RecoveryTable
        data={data}
        isLoading={isLoading}
        total={total}
        page={page}
        onPageChange={setPage}
      />
      <ConfigDrawer
        open={configOpen}
        onOpenChange={setConfigOpen}
        configs={configs}
        onSave={save}
        isSaving={isSaving}
      />
    </div>
  );
}
