/**
 * Formata valores monetários de forma compacta para caber em cards.
 * Ex: 1234 -> "R$ 1.234", 12345 -> "R$ 12,3 mil", 1234567 -> "R$ 1,23 M"
 */
export function fmtCompact(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 1_000_000_000) {
    return `${sign}R$ ${(abs / 1_000_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}R$ ${(abs / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} M`;
  }
  if (abs >= 100_000) {
    return `${sign}R$ ${(abs / 1_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`;
  }

  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Formato completo sempre com 2 casas decimais.
 */
export function fmtFull(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

/**
 * Formata número grande de forma compacta (sem símbolo de moeda).
 * Ex: 12345 -> "12,3 mil", 1234567 -> "1,23 M"
 */
export function fmtNumber(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 1_000_000_000) {
    return `${sign}${(abs / 1_000_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} M`;
  }
  if (abs >= 100_000) {
    return `${sign}${(abs / 1_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`;
  }

  return value.toLocaleString("pt-BR");
}
