export interface CustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  totalSpent: number;
  totalOrders: number;
  products: string[];
  firstPurchase: string;
  lastPurchase: string;
}

export const customersData: CustomerRow[] = [
  {
    id: "CUS-001",
    name: "João Silva",
    email: "joao.silva@gmail.com",
    phone: "(11) 99123-4567",
    cpf: "***.***.***-12",
    totalSpent: 691,
    totalOrders: 3,
    products: ["Ebook Fitness Premium", "Curso Marketing Digital"],
    firstPurchase: "2026-01-15",
    lastPurchase: "2026-03-09",
  },
  {
    id: "CUS-002",
    name: "Maria Oliveira",
    email: "maria.oliveira@hotmail.com",
    phone: "(21) 98765-4321",
    cpf: "***.***.***-34",
    totalSpent: 297,
    totalOrders: 1,
    products: ["Curso Marketing Digital"],
    firstPurchase: "2026-03-05",
    lastPurchase: "2026-03-05",
  },
  {
    id: "CUS-003",
    name: "Pedro Santos",
    email: "pedro.santos@yahoo.com",
    phone: "(31) 97654-3210",
    cpf: "***.***.***-56",
    totalSpent: 994,
    totalOrders: 2,
    products: ["Mentoria Premium"],
    firstPurchase: "2026-02-10",
    lastPurchase: "2026-03-09",
  },
  {
    id: "CUS-004",
    name: "Camila Rocha",
    email: "camila.rocha@gmail.com",
    phone: "(41) 96543-2109",
    cpf: "***.***.***-78",
    totalSpent: 97,
    totalOrders: 1,
    products: ["PLR Bundle Pack"],
    firstPurchase: "2026-03-09",
    lastPurchase: "2026-03-09",
  },
  {
    id: "CUS-005",
    name: "Lucas Ferreira",
    email: "lucas.ferreira@gmail.com",
    phone: "(51) 95432-1098",
    cpf: "***.***.***-90",
    totalSpent: 344,
    totalOrders: 2,
    products: ["Ebook Fitness Premium", "Lançamento VIP"],
    firstPurchase: "2026-02-20",
    lastPurchase: "2026-03-09",
  },
  {
    id: "CUS-006",
    name: "Fernanda Costa",
    email: "fernanda.costa@gmail.com",
    phone: "(61) 94321-0987",
    cpf: "***.***.***-01",
    totalSpent: 147,
    totalOrders: 1,
    products: ["Lançamento VIP"],
    firstPurchase: "2026-03-08",
    lastPurchase: "2026-03-08",
  },
  {
    id: "CUS-007",
    name: "Roberto Lima",
    email: "roberto.lima@outlook.com",
    phone: "(71) 93210-9876",
    cpf: "***.***.***-23",
    totalSpent: 497,
    totalOrders: 1,
    products: ["Mentoria Premium"],
    firstPurchase: "2026-03-08",
    lastPurchase: "2026-03-08",
  },
  {
    id: "CUS-008",
    name: "Ana Martins",
    email: "ana.martins@gmail.com",
    phone: "(81) 92109-8765",
    cpf: "***.***.***-45",
    totalSpent: 494,
    totalOrders: 2,
    products: ["Ebook Fitness Premium", "Curso Marketing Digital"],
    firstPurchase: "2026-01-22",
    lastPurchase: "2026-03-07",
  },
];
