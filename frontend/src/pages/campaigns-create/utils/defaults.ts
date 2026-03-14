/**
 * UTM parameters padrão para campanhas do LOG POSE.
 * Formato idêntico ao Facebook Ads — campo único.
 */
export const DEFAULT_UTM_PARAMS =
  "utm_source=FB&utm_campaign={{campaign.name}}|{{campaign.id}}&utm_medium={{adset.name}}|{{adset.id}}&utm_content={{ad.name}}|{{ad.id}}&utm_term={{placement}}";

/** CTA padrão para novos anúncios */
export const DEFAULT_CTA = "LEARN_MORE";

/**
 * Opções de CTA disponíveis para anúncios.
 */
export const CTA_OPTIONS = [
  { value: "SHOP_NOW", label: "Comprar Agora" },
  { value: "LEARN_MORE", label: "Saiba Mais" },
  { value: "SIGN_UP", label: "Cadastre-se" },
  { value: "SUBSCRIBE", label: "Inscreva-se" },
  { value: "CONTACT_US", label: "Fale Conosco" },
  { value: "GET_OFFER", label: "Obter Oferta" },
  { value: "ORDER_NOW", label: "Peça Agora" },
];

/**
 * Opções de estratégia de lance.
 */
export const BID_STRATEGY_OPTIONS = [
  {
    value: "VOLUME",
    label: "Volume",
    description: "Maximizar resultados ao menor custo",
    tooltip:
      "Modelo padrão. A Meta vai buscar o máximo de vendas possível pelo orçamento definido, gastando todo o valor diário para encontrar o maior volume de conversões ao menor custo.",
  },
  {
    value: "BID_CAP",
    label: "Bid Cap",
    description: "Lance máximo por leilão",
    tooltip:
      "Você define o lance máximo que a Meta pode dar no leilão para exibir seu anúncio. Ela nunca vai ultrapassar esse valor no leilão, mas pode entregar menos resultados se o lance for baixo demais.",
  },
  {
    value: "COST_CAP",
    label: "Cost Cap",
    description: "CPA alvo por conversão",
    tooltip:
      "Você define o custo por aquisição (CPA) alvo que deseja alcançar. A Meta vai otimizar para entregar conversões com custo médio próximo desse valor. Pode ultrapassar pontualmente, mas mantém a média.",
  },
  {
    value: "ROAS",
    label: "ROAS",
    description: "Retorno mínimo sobre investimento",
    tooltip:
      "A Meta otimiza para atingir o retorno mínimo sobre investimento em anúncios. Ex: ROAS 2.0 = para cada R$1 investido, buscar R$2 em receita.",
  },
];

/**
 * Precisa de valor extra de lance?
 */
export function needsBidValue(strategy: string): boolean {
  return ["BID_CAP", "COST_CAP", "ROAS"].includes(strategy);
}

/**
 * Label do campo de lance baseado na estratégia.
 */
export function bidFieldLabel(strategy: string): string {
  if (strategy === "ROAS") return "ROAS Mínimo";
  if (strategy === "COST_CAP") return "CPA Alvo (R$)";
  return "Lance Máximo (R$)";
}

/**
 * Placeholder do campo de lance baseado na estratégia.
 */
export function bidPlaceholder(strategy: string): string {
  if (strategy === "ROAS") return "Ex: 2.5 (250% ROAS)";
  if (strategy === "COST_CAP") return "Ex: 50.00 (CPA alvo)";
  return "Ex: 15.00 (lance máximo)";
}

/**
 * Descrição auxiliar do campo de lance baseado na estratégia.
 */
export function bidFieldDescription(strategy: string): string {
  if (strategy === "ROAS")
    return "Ex: 2.5 = a Meta buscará pelo menos 250% de retorno.";
  if (strategy === "COST_CAP")
    return "CPA alvo: a Meta tentará manter o custo médio por aquisição próximo deste valor.";
  return "Lance máximo: a Meta nunca dará um lance acima deste valor no leilão para exibir seu anúncio.";
}
