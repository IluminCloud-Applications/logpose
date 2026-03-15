import type { CampaignFormState, AdFormData } from "../hooks/useCampaignForm";
import { exportCampaign } from "@/services/campaignCreator";
import { toast } from "sonner";

/**
 * Serializa o formulário para export JSON.
 */
export function buildExportPayload(form: CampaignFormState): Record<string, unknown> {
  return {
    version: "1.0",
    campaign_name: form.campaignName,
    daily_budget: form.dailyBudget,
    bid_strategy: form.bidStrategy,
    bid_amount: form.bidAmount,
    roas_floor: form.roasFloor,
    adset_name: form.adsetName,
    adset_count: form.adsetCount,
    pixel_id: form.pixelId,
    start_time: form.startTime,
    targeting: {
      age_min: form.ageMin, age_max: form.ageMax,
      genders: form.gender, interests: form.interests,
    },
    page_id: form.pageId,
    instagram_actor_id: form.instagramActorId,
    video_id: form.videoId,
    video_label: form.videoLabel,
    checkout_id: form.checkoutId,
    checkout_label: form.checkoutLabel,
    product_id: form.productId,
    product_label: form.productLabel,
    ads: form.ads.map((a) => ({
      name: a.name, primary_text: a.primary_text, headline: a.headline,
      description: a.description, link: a.link, utm_params: a.utm_params,
      extra_params: a.extra_params, cta_type: a.cta_type, media_type: a.media_type,
    })),
    batch_mode: form.batchMode,
    bulk_data: form.bulkData,
  };
}

/**
 * Exporta campanha como JSON download.
 */
export function handleExportCampaign(form: CampaignFormState) {
  exportCampaign(buildExportPayload(form));
  toast.success("Campanha exportada!");
}

/**
 * Aplica dados de uma campanha (JSON parsed) ao formulário.
 * Reutilizável para import de arquivo e duplicação via navigation state.
 */
export function applyDataToForm(
  data: Record<string, unknown>,
  updateField: <K extends keyof CampaignFormState>(key: K, value: CampaignFormState[K]) => void,
) {
  updateField("campaignName", (data.campaign_name as string) ?? "");
  updateField("dailyBudget", (data.daily_budget as number) ?? 0);
  updateField("bidStrategy", (data.bid_strategy as string) ?? "VOLUME");
  updateField("bidAmount", (data.bid_amount as number | null) ?? null);
  updateField("roasFloor", (data.roas_floor as number | null) ?? null);
  updateField("adsetName", (data.adset_name as string) ?? "");
  updateField("adsetCount", (data.adset_count as number) ?? 1);
  updateField("pixelId", (data.pixel_id as string) ?? "");
  updateField("startTime", (data.start_time as string) ?? "");
  updateField("videoId", (data.video_id as string) ?? "");
  updateField("videoLabel", (data.video_label as string) ?? "");
  updateField("checkoutId", (data.checkout_id as string) ?? "");
  updateField("checkoutLabel", (data.checkout_label as string) ?? "");
  updateField("productId", (data.product_id as string) ?? "");
  updateField("productLabel", (data.product_label as string) ?? "");

  const targeting = data.targeting as Record<string, unknown> | undefined;
  if (targeting) {
    updateField("ageMin", (targeting.age_min as number) ?? 18);
    updateField("ageMax", (targeting.age_max as number) ?? 65);
    updateField("gender", (targeting.genders as number) ?? 0);
    updateField("interests", (targeting.interests as CampaignFormState["interests"]) ?? []);
  }

  updateField("pageId", (data.page_id as string) ?? "");
  updateField("instagramActorId", (data.instagram_actor_id as string) ?? "");

  // Import ads (sem file — precisam ser adicionados manualmente)
  if (Array.isArray(data.ads) && data.ads.length > 0) {
    const importedAds: AdFormData[] = data.ads.map((a: Record<string, unknown>) => ({
      name: (a.name as string) ?? "",
      primary_text: (a.primary_text as string) ?? "",
      headline: (a.headline as string) ?? "",
      description: (a.description as string) ?? "",
      link: (a.link as string) ?? "",
      utm_params: (a.utm_params as string) ?? "",
      extra_params: (a.extra_params as string) ?? "",
      cta_type: (a.cta_type as string) ?? "LEARN_MORE",
      media_type: ((a.media_type as string) ?? "image") as "image" | "video",
      file: null,
      preview_url: "",
    }));
    updateField("ads", importedAds);
  }

  if (data.batch_mode !== undefined) {
    updateField("batchMode", Boolean(data.batch_mode));
  }

  // Import bulkData
  if (data.bulk_data) {
    const bulk = data.bulk_data as Record<string, string>;
    updateField("bulkData", {
      primary_text: bulk.primary_text ?? "",
      headline: bulk.headline ?? "",
      description: bulk.description ?? "",
      link: bulk.link ?? "",
      extra_params: bulk.extra_params ?? "",
      cta_type: bulk.cta_type ?? "LEARN_MORE",
    });
  } else if (Array.isArray(data.ads) && data.ads.length > 0) {
    const firstAd = data.ads[0] as Record<string, string>;
    updateField("bulkData", {
      primary_text: firstAd.primary_text ?? "",
      headline: firstAd.headline ?? "",
      description: firstAd.description ?? "",
      link: firstAd.link ?? "",
      extra_params: firstAd.extra_params ?? "",
      cta_type: firstAd.cta_type ?? "LEARN_MORE",
    });
  }

  // Selecionar conta de anúncio se disponível
  if (data.account_id) {
    updateField("accountId", data.account_id as number);
  }
}

/**
 * Importa campanha de arquivo JSON e aplica ao formulário.
 */
export function handleImportCampaign(
  updateField: <K extends keyof CampaignFormState>(key: K, value: CampaignFormState[K]) => void
) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      applyDataToForm(data, updateField);
      toast.success("Campanha importada! Revise os dados e adicione as mídias.");
    } catch {
      toast.error("Arquivo JSON inválido");
    }
  };
  input.click();
}

