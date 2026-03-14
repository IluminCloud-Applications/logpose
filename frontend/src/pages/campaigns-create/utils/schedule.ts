/**
 * Utilidades de timezone São Paulo para agendamento de campanhas.
 */

/**
 * Retorna a próxima meia-noite no timezone de São Paulo (America/Sao_Paulo).
 */
export function getNextMidnightSP(): string {
  const now = new Date();

  const spTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
  );

  const nextDay = new Date(spTime);
  nextDay.setDate(nextDay.getDate() + 1);
  nextDay.setHours(0, 0, 0, 0);

  const year = nextDay.getFullYear();
  const month = String(nextDay.getMonth() + 1).padStart(2, "0");
  const day = String(nextDay.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}T00:00:00-03:00`;
}

/**
 * Formata uma data ISO para display amigável: dd/mm/yyyy, hh:mm (24h).
 */
export function formatScheduleDisplay(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Sao_Paulo",
    });
  } catch {
    return isoDate;
  }
}

/**
 * Converte ISO date para inputs separados de date (yyyy-mm-dd) e time (HH:mm).
 */
export function toScheduleInputs(isoDate: string): { date: string; time: string } {
  try {
    const d = new Date(isoDate);
    const sp = new Date(
      d.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
    );
    const year = sp.getFullYear();
    const month = String(sp.getMonth() + 1).padStart(2, "0");
    const day = String(sp.getDate()).padStart(2, "0");
    const hours = String(sp.getHours()).padStart(2, "0");
    const minutes = String(sp.getMinutes()).padStart(2, "0");

    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}`,
    };
  } catch {
    return { date: "", time: "00:00" };
  }
}

/**
 * Converte inputs de date (yyyy-mm-dd) e time (HH:mm) para ISO com timezone SP.
 */
export function fromScheduleInputs(date: string, time: string): string {
  if (!date) return getNextMidnightSP();
  const t = time || "00:00";
  return `${date}T${t}:00-03:00`;
}

/**
 * Legado: formata data para input datetime-local.
 */
export function toDatetimeLocal(isoDate: string): string {
  const { date, time } = toScheduleInputs(isoDate);
  return date ? `${date}T${time}` : "";
}

/**
 * Legado: converte datetime-local para ISO com timezone SP.
 */
export function fromDatetimeLocal(value: string): string {
  if (!value) return getNextMidnightSP();
  return `${value}:00-03:00`;
}
