import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RiArrowLeftLine, RiArrowRightLine, RiRocketLine, RiDownloadLine, RiUploadLine } from "@remixicon/react";
import { useFacebookAccounts } from "@/hooks/useFacebookAccounts";
import { publishCampaign } from "@/services/campaignCreator";
import { useCampaignForm } from "./hooks/useCampaignForm";
import { usePixels, usePages, useInterestSearch } from "./hooks/useMetaData";
import { StepperNav } from "./components/StepperNav";
import { AccountStep } from "./components/AccountStep";
import { CampaignStep } from "./components/CampaignStep";
import { AdSetStep } from "./components/AdSetStep";
import { AdsStep } from "./components/AdsStep";
import { ReviewStep } from "./components/ReviewStep";
import { generateAdName } from "./utils/naming";
import { handleExportCampaign, handleImportCampaign, buildExportPayload } from "./utils/exportImport";

export default function CampaignsCreatePage() {
  const navigate = useNavigate();
  const [isPublishing, setIsPublishing] = useState(false);
  const { accounts, isLoading: accountsLoading } = useFacebookAccounts();
  const { form, currentStep, updateField, addAd, updateAd, removeAd, resetForm, nextStep, prevStep, goToStep } = useCampaignForm();
  const { pixels, load: loadPixels } = usePixels();
  const { pages, load: loadPages } = usePages();
  const { results: interests, search: searchInterest } = useInterestSearch();

  useEffect(() => {
    if (form.accountId) {
      loadPixels(form.accountId);
      loadPages(form.accountId);
    }
  }, [form.accountId, loadPixels, loadPages]);

  // Validação por step — define se o step está preenchido
  const isStepValid = useCallback((step: number): boolean => {
    if (step === 0) return !!form.accountId;
    if (step === 1) return !!form.campaignName && form.dailyBudget > 0;
    if (step === 2) return !!form.pixelId && !!form.pageId;
    if (step === 3) return form.ads.length > 0;
    return true;
  }, [form]);

  // Calcula o step máximo que o usuário pode acessar
  const maxReachedStep = useMemo(() => {
    for (let i = 0; i <= 4; i++) {
      if (!isStepValid(i)) return i;
    }
    return 4;
  }, [isStepValid]);

  // goToStep com validação — só permite ir a steps <= maxReachedStep
  const safeGoToStep = useCallback((step: number) => {
    if (step <= maxReachedStep) goToStep(step);
  }, [maxReachedStep, goToStep]);

  const handlePublish = useCallback(async () => {
    setIsPublishing(true);
    try {
      const files = form.ads.map((ad) => ad.file).filter(Boolean) as File[];
      const ads = form.ads.map((ad, i) => ({
        name: ad.name || generateAdName(form.campaignName, i),
        primary_text: ad.primary_text, headline: ad.headline,
        description: ad.description, link: ad.link, utm_params: ad.utm_params,
        extra_params: ad.extra_params, cta_type: ad.cta_type,
        media_type: ad.media_type, media_index: i,
      }));
      const payload = { ...buildExportPayload(form), account_id: form.accountId, ads };
      const result = await publishCampaign(payload, files);
      if (result.success) {
        toast.success(`Campanha criada! ${result.ads_created} anúncio(s) publicados.`);
        resetForm();
        navigate("/campaigns");
      } else {
        result.errors.forEach((err) => toast.error(err));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao publicar");
    } finally {
      setIsPublishing(false);
    }
  }, [form, resetForm, navigate]);

  return (
    <div className="flex flex-col gap-5 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/campaigns")}>
            <RiArrowLeftLine className="size-4 mr-1" /> Voltar
          </Button>
          <h1 className="text-xl font-bold">Nova Campanha</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleImportCampaign(updateField)}>
            <RiUploadLine className="size-4 mr-1" /> Importar
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExportCampaign(form)} disabled={!form.campaignName}>
            <RiDownloadLine className="size-4 mr-1" /> Exportar
          </Button>
        </div>
      </div>

      <StepperNav currentStep={currentStep} maxReachedStep={maxReachedStep} onStepClick={safeGoToStep} />

      <div className="min-h-[400px]">
        {currentStep === 0 && (
          <AccountStep accounts={accounts} selectedAccountId={form.accountId}
            onSelect={(id) => updateField("accountId", id)} onUpdate={updateField}
            form={form} isLoading={accountsLoading} />
        )}
        {currentStep === 1 && <CampaignStep form={form} onUpdate={updateField} />}
        {currentStep === 2 && (
          <AdSetStep form={form} onUpdate={updateField} pixels={pixels} pages={pages}
            interestResults={interests} onSearchInterest={(q) => form.accountId && searchInterest(form.accountId, q)} />
        )}
        {currentStep === 3 && (
          <AdsStep form={form} onUpdate={updateField} onAddAd={addAd} onUpdateAd={updateAd} onRemoveAd={removeAd} />
        )}
        {currentStep === 4 && <ReviewStep form={form} />}
      </div>

      <div className="flex justify-between pt-2 border-t">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
          <RiArrowLeftLine className="size-4 mr-1" /> Anterior
        </Button>
        {currentStep < 4 ? (
          <Button onClick={nextStep} disabled={!isStepValid(currentStep)}>
            Próximo <RiArrowRightLine className="size-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handlePublish} disabled={isPublishing} className="bg-primary">
            <RiRocketLine className="size-4 mr-1" />
            {isPublishing ? "Publicando..." : "Publicar Campanha"}
          </Button>
        )}
      </div>
    </div>
  );
}
