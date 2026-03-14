/**
 * Funções de nomenclatura automática para campanhas.
 */

/**
 * Gera nome padrão da campanha.
 * Formato: CBO | [Nome] | [Estratégia] | R$[Budget] | [DD/MM]
 */
export function generateCampaignName(
  name: string,
  strategy: string,
  budget: number,
  date?: Date
): string {
  const d = date ?? new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const budgetStr = budget > 0 ? `R$${budget}` : "R$0";
  const strategyLabel = strategy === "VOLUME" ? "Vol" : strategy;

  return `CBO | ${name || "Nova"} | ${strategyLabel} | ${budgetStr} | ${dd}/${mm}`;
}

/**
 * Gera nome padrão do conjunto de anúncios.
 * Formato: CJ | [Nome] | [Público] | [Idade] | [Gênero]
 */
export function generateAdSetName(
  name: string,
  ageMin: number,
  ageMax: number,
  gender: number,
  hasInterests: boolean
): string {
  const genderLabel = gender === 1 ? "M" : gender === 2 ? "F" : "All";
  const ageStr = `${ageMin}-${ageMax === 65 ? "65+" : ageMax}`;
  const publicLabel = hasInterests ? "Interesse" : "Aberto";

  return `CJ | ${name || "Nova"} | ${publicLabel} | ${ageStr} | ${genderLabel}`;
}

/**
 * Gera nome padrão do anúncio.
 * Formato: AD | [Nome] | Criativo [N]
 */
export function generateAdName(name: string, index: number): string {
  return `AD | ${name || "Nova"} | Criativo ${index + 1}`;
}
