/**
 * Descrições detalhadas para cada coluna da tabela de campanhas.
 * Exibidas como tooltip ao passar o mouse sobre o cabeçalho.
 */
export const columnDescriptions: Record<string, string> = {
  name: "Nome da campanha conforme cadastrado na plataforma de anúncios.",
  spend:
    "Gastos\nValor total investido na campanha dentro do período selecionado.",
  sales:
    "Vendas\nQuantidade de vendas realizadas (conversões de compra) atribuídas a esta campanha.",
  revenue:
    "Faturamento\nReceita bruta total gerada pelas vendas da campanha.",
  profit:
    "Lucro\nFaturamento menos os gastos com anúncios. Representa a margem operacional da campanha.",
  roas:
    "Return On Ad Spend\nRetorno sobre o investimento em anúncios. Faturamento ÷ Gastos. Um ROAS de 2x significa que para cada R$1 gasto, R$2 retornaram.",
  cpa:
    "Custo Por Aquisição\nCusto médio para cada venda realizada. Gastos ÷ Vendas.",
  cpc:
    "Custo Por Clique\nValor médio pago por cada clique no anúncio. Gastos ÷ Cliques.",
  ctr:
    "Click Through Rate\nTaxa de cliques. Percentual de pessoas que viram o anúncio e clicaram. (Cliques ÷ Impressões) × 100.",
  clicks:
    "Cliques\nNúmero total de cliques recebidos nos anúncios da campanha.",
  impressions:
    "Impressões\nQuantidade de vezes que o anúncio foi exibido para os usuários.",
  lpv:
    "Landing Page Views\nVisualizações da página de destino. Quantidade de pessoas que chegaram à landing page após clicar no anúncio.",
  ic:
    "Initiate Checkout\nInício de checkout. Quantidade de usuários que iniciaram o processo de compra.",
  connectRate:
    "Connect Rate\nTaxa de conexão entre o clique e a Landing Page. Percentual de cliques que resultaram em visualização da LP. (LPV ÷ Cliques) × 100.",
  playsVsl:
    "Plays VSL\nQuantidade de reproduções do VSL (Video Sales Letter) na página de destino.",
  playRate:
    "Play Rate\nTaxa de reprodução do VSL. Percentual de visitantes da LP que iniciaram o vídeo. (Plays ÷ LPV) × 100.",
  checkoutConversion:
    "Conversão Checkout\nTaxa de conversão da LP para checkout. Percentual de visitantes que iniciaram o checkout. (IC ÷ LPV) × 100.",
  checkoutToSaleRate:
    "Conversão Venda\nTaxa de aprovação do checkout. Percentual de checkouts que se converteram em vendas. (Vendas ÷ IC) × 100.",
  budget:
    "Orçamento\nOrçamento diário definido para a campanha na plataforma de anúncios.",
};
