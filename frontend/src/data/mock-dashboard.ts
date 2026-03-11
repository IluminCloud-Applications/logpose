// Mock data for dashboard KPIs
export const kpiData = {
  totalRevenue: 127450.0,
  totalSpend: 42150.0,
  profit: 85300.0,
  roas: 3.02,
  profitMargin: 66.9,
  totalSales: 847,
  cpa: 49.76,
  chargebackRate: 2.1,
  chargebackAmount: 2676.45,
  averageTicket: 150.47,
  conversionRate: 4.2,
  totalClicks: 20166,
};

// Mock data for daily revenue chart
export const dailyRevenueData = [
  { date: "2026-02-01", revenue: 3200, spend: 1100, profit: 2100 },
  { date: "2026-02-02", revenue: 4100, spend: 1350, profit: 2750 },
  { date: "2026-02-03", revenue: 2800, spend: 980, profit: 1820 },
  { date: "2026-02-04", revenue: 5200, spend: 1700, profit: 3500 },
  { date: "2026-02-05", revenue: 4800, spend: 1600, profit: 3200 },
  { date: "2026-02-06", revenue: 3900, spend: 1280, profit: 2620 },
  { date: "2026-02-07", revenue: 6100, spend: 2000, profit: 4100 },
  { date: "2026-02-08", revenue: 5500, spend: 1800, profit: 3700 },
  { date: "2026-02-09", revenue: 4300, spend: 1420, profit: 2880 },
  { date: "2026-02-10", revenue: 3600, spend: 1200, profit: 2400 },
  { date: "2026-02-11", revenue: 4700, spend: 1550, profit: 3150 },
  { date: "2026-02-12", revenue: 5800, spend: 1900, profit: 3900 },
  { date: "2026-02-13", revenue: 4200, spend: 1380, profit: 2820 },
  { date: "2026-02-14", revenue: 7200, spend: 2400, profit: 4800 },
  { date: "2026-02-15", revenue: 3100, spend: 1050, profit: 2050 },
  { date: "2026-02-16", revenue: 4500, spend: 1480, profit: 3020 },
  { date: "2026-02-17", revenue: 5000, spend: 1650, profit: 3350 },
  { date: "2026-02-18", revenue: 3800, spend: 1250, profit: 2550 },
  { date: "2026-02-19", revenue: 6500, spend: 2150, profit: 4350 },
  { date: "2026-02-20", revenue: 4900, spend: 1620, profit: 3280 },
  { date: "2026-02-21", revenue: 5300, spend: 1750, profit: 3550 },
  { date: "2026-02-22", revenue: 4100, spend: 1350, profit: 2750 },
  { date: "2026-02-23", revenue: 3700, spend: 1220, profit: 2480 },
  { date: "2026-02-24", revenue: 5600, spend: 1850, profit: 3750 },
  { date: "2026-02-25", revenue: 4400, spend: 1450, profit: 2950 },
  { date: "2026-02-26", revenue: 6800, spend: 2250, profit: 4550 },
  { date: "2026-02-27", revenue: 5100, spend: 1680, profit: 3420 },
  { date: "2026-02-28", revenue: 4600, spend: 1520, profit: 3080 },
];

// Mock data for platform distribution (pie chart)
export const platformData = [
  { name: "Kiwify", value: 78500, sales: 523, fill: "var(--color-chart-1)" },
  { name: "PayT", value: 48950, sales: 324, fill: "var(--color-chart-2)" },
];

// Mock data for top campaigns
export const topCampaigns = [
  {
    name: "Campaign - Ebook Fitness",
    spend: 8500,
    revenue: 28400,
    sales: 189,
    roas: 3.34,
    cpa: 44.97,
  },
  {
    name: "Campaign - Curso Marketing",
    spend: 12300,
    revenue: 35200,
    sales: 234,
    roas: 2.86,
    cpa: 52.56,
  },
  {
    name: "Campaign - Mentoria Premium",
    spend: 6200,
    revenue: 24800,
    sales: 124,
    roas: 4.0,
    cpa: 50.0,
  },
];

// Mock data for hourly performance
export const hourlyData = [
  { hour: "00h", sales: 12, revenue: 1800 },
  { hour: "02h", sales: 5, revenue: 750 },
  { hour: "04h", sales: 3, revenue: 450 },
  { hour: "06h", sales: 8, revenue: 1200 },
  { hour: "08h", sales: 22, revenue: 3300 },
  { hour: "10h", sales: 45, revenue: 6750 },
  { hour: "12h", sales: 38, revenue: 5700 },
  { hour: "14h", sales: 52, revenue: 7800 },
  { hour: "16h", sales: 61, revenue: 9150 },
  { hour: "18h", sales: 72, revenue: 10800 },
  { hour: "20h", sales: 85, revenue: 12750 },
  { hour: "22h", sales: 44, revenue: 6600 },
];
