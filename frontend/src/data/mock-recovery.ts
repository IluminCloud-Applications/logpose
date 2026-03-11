export interface RecoveryRow {
  id: string;
  date: string;
  customerName: string;
  customerEmail: string;
  product: string;
  type: "abandoned_cart" | "declined_card" | "unpaid_pix";
  amount: number;
  recovered: boolean;
  channel: "whatsapp" | "email" | "other" | null;
}

export const recoveryData: RecoveryRow[] = [
  { id: "REC-001", date: "2026-03-09T15:30:00", customerName: "Carlos Souza", customerEmail: "carlos@gmail.com", product: "Ebook Fitness Premium", type: "abandoned_cart", amount: 197, recovered: true, channel: "whatsapp" },
  { id: "REC-002", date: "2026-03-09T14:20:00", customerName: "Ana Paula", customerEmail: "ana@hotmail.com", product: "Curso Marketing Digital", type: "declined_card", amount: 297, recovered: false, channel: null },
  { id: "REC-003", date: "2026-03-09T13:10:00", customerName: "Marcos Lima", customerEmail: "marcos@gmail.com", product: "Mentoria Premium", type: "unpaid_pix", amount: 497, recovered: true, channel: "email" },
  { id: "REC-004", date: "2026-03-09T12:00:00", customerName: "Julia Mendes", customerEmail: "julia@yahoo.com", product: "Ebook Fitness Premium", type: "abandoned_cart", amount: 197, recovered: true, channel: "whatsapp" },
  { id: "REC-005", date: "2026-03-09T11:30:00", customerName: "Rafael Costa", customerEmail: "rafael@gmail.com", product: "Curso Marketing Digital", type: "abandoned_cart", amount: 297, recovered: false, channel: null },
  { id: "REC-006", date: "2026-03-09T10:15:00", customerName: "Beatriz Alves", customerEmail: "bia@gmail.com", product: "PLR Bundle Pack", type: "declined_card", amount: 97, recovered: true, channel: "other" },
  { id: "REC-007", date: "2026-03-08T22:45:00", customerName: "Diego Santos", customerEmail: "diego@outlook.com", product: "Lançamento VIP", type: "unpaid_pix", amount: 147, recovered: false, channel: null },
  { id: "REC-008", date: "2026-03-08T20:30:00", customerName: "Fernanda Rocha", customerEmail: "fer@gmail.com", product: "Ebook Fitness Premium", type: "abandoned_cart", amount: 197, recovered: true, channel: "email" },
  { id: "REC-009", date: "2026-03-08T19:00:00", customerName: "Thiago Pereira", customerEmail: "thiago@gmail.com", product: "Mentoria Premium", type: "unpaid_pix", amount: 497, recovered: false, channel: null },
  { id: "REC-010", date: "2026-03-08T17:30:00", customerName: "Larissa Nunes", customerEmail: "lari@hotmail.com", product: "Curso Marketing Digital", type: "abandoned_cart", amount: 297, recovered: true, channel: "whatsapp" },
];
