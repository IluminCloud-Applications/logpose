/**
 * Exporta uma campanha existente da tabela como JSON
 * no formato compatível com a importação do Campaign Creator.
 * Busca detalhes completos (targeting, pixel, page, ads) via API do Facebook.
 */
import type { CampaignData } from "@/services/campaigns";
import { fetchCampaignExportDetails } from "@/services/campaigns";
import type { MarkerMap } from "@/hooks/useCampaignMarkers";
import { toast } from "sonner";

interface ExportOptions {
  campaign: CampaignData;
  markersMap: MarkerMap;
  accountId?: number;
}

/**
 * Exporta a campanha como arquivo JSON para download.
 * Busca detalhes completos (targeting, pixel, page, ads) na API do Facebook
 * e monta o JSON no formato compatível com a importação do Campaign Creator.
 */
export async function handleExportCampaignFromTable(options: ExportOptions) {
  const { campaign, markersMap, accountId } = options;

  if (!accountId) {
    toast.error("Selecione uma conta de anúncio para exportar.");
    return;
  }

  const loadingToast = toast.loading("Exportando campanha...");

  try {
    // Buscar detalhes completos da campanha via Facebook API
    const details = await fetchCampaignExportDetails(campaign.id, accountId);
    const markers = markersMap[campaign.id] || {};

    // Montar payload de exportação
    const firstAdsetName = campaign.adsets[0]?.name ?? "";
    const payload = buildExportPayload(campaign, details, markers, firstAdsetName);

    // Gerar download
    downloadJson(payload, campaign.name);

    toast.dismiss(loadingToast);
    toast.success("Campanha exportada! Importe na página de Criar Campanha.");
  } catch (error) {
    toast.dismiss(loadingToast);
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    toast.error(`Falha ao exportar: ${msg}`);
  }
}

/**
 * Monta o payload de exportação combinando dados da tabela + detalhes do Facebook.
 */
function buildExportPayload(
  campaign: CampaignData,
  details: Awaited<ReturnType<typeof fetchCampaignExportDetails>>,
  markers: MarkerMap[string],
  firstAdsetName: string,
): Record<string, unknown> {
  // Usar os ads do Facebook (com textos reais) se disponíveis
  const ads = details.ads.length > 0
    ? details.ads.map((ad) => ({
        name: ad.name,
        primary_text: ad.primary_text,
        headline: ad.headline,
        description: ad.description,
        link: ad.link,
        utm_params: ad.utm_params,
        extra_params: ad.extra_params,
        cta_type: ad.cta_type,
        media_type: ad.media_type,
      }))
    : [];

  return {
    version: "1.0",
    campaign_name: `${campaign.name} - Copy`,
    daily_budget: campaign.budget,
    bid_strategy: details.bid_strategy || "VOLUME",
    bid_amount: details.bid_amount,
    roas_floor: details.roas_floor,
    adset_name: firstAdsetName,
    adset_count: campaign.adsets.length || 1,
    pixel_id: details.pixel_id,
    start_time: details.start_time,
    targeting: details.targeting,
    page_id: details.page_id,
    instagram_actor_id: details.instagram_actor_id,
    video_id: markers?.video?.reference_id ?? "",
    video_label: markers?.video?.reference_label ?? "",
    checkout_id: markers?.checkout?.reference_id ?? "",
    checkout_label: markers?.checkout?.reference_label ?? "",
    product_id: markers?.product?.reference_id ?? "",
    product_label: markers?.product?.reference_label ?? "",
    ads,
    batch_mode: true,
  };
}

/**
 * Gera download do JSON com nome sanitizado.
 */
function downloadJson(payload: Record<string, unknown>, campaignName: string) {
  const safeName = campaignName
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 50);

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `campaign_${safeName}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
