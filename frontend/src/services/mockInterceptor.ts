import { kpiData, dailyRevenueData, platformData, topCampaigns, hourlyData } from "../data/mock-dashboard";
import { campaignsData } from "../data/mock-campaigns";
import { adSetsData } from "../data/mock-adsets";
import { adsData } from "../data/mock-ads";
import { salesData } from "../data/mock-sales";
import { customersData } from "../data/mock-customers";
import { productsData } from "../data/mock-products";
import { funnelData } from "../data/mock-funnel";
import { recoveryData } from "../data/mock-recovery";
import { monthlyFinancialData, defaultCompanySettings, calcCompanyKpis } from "../data/mock-company";

export async function getMockData(endpoint: string, _options?: any): Promise<any> {
  // Mock delay to simulate network
  await new Promise((resolve) => setTimeout(resolve, 500));

  const [path] = endpoint.split("?");

  if (path === "/dashboard/overview") {
    return {
      kpis: {
        total_revenue: kpiData.totalRevenue,
        total_spend: kpiData.totalSpend,
        profit: kpiData.profit,
        total_sales: kpiData.totalSales,
        average_ticket: kpiData.averageTicket,
        cpa: kpiData.cpa,
        roas: kpiData.roas,
        profit_margin: kpiData.profitMargin,
        conversion_rate: kpiData.conversionRate,
        total_clicks: kpiData.totalClicks,
        chargeback_amount: kpiData.chargebackAmount,
        chargeback_rate: kpiData.chargebackRate,
        refunded_count: 45,
        chargeback_count: 22,
      },
      daily_revenue: dailyRevenueData,
      platform_distribution: platformData,
      top_campaigns: topCampaigns.map(c => ({
        name: c.name,
        spend: c.spend,
        revenue: c.revenue,
        sales: c.sales,
        profit: c.revenue - c.spend,
        roas: c.roas,
        cpa: c.cpa,
      })),
      hourly_sales: hourlyData,
    };
  }

  if (path === "/campaigns/data") {
    const mapAd = (ad: any) => ({
      id: ad.id,
      ad_set_id: ad.adSetId,
      name: ad.name,
      status: ad.status,
      budget: ad.budget,
      spend: ad.spend,
      clicks: ad.clicks,
      impressions: ad.impressions,
      cpc: ad.cpc,
      ctr: ad.ctr,
      landing_page_views: ad.landingPageViews,
      initiate_checkout: ad.initiateCheckout,
      connect_rate: ad.connectRate,
      sales: ad.sales,
      revenue: ad.revenue,
      profit: ad.profit,
      roas: ad.roas,
      cpa: ad.cpa,
      no_id_sales: Math.floor((ad.sales || 0) * 0.1),
      plays_vsl: Math.floor((ad.landingPageViews || 0) * 0.42),
      play_rate: ad.landingPageViews ? 42.0 : 0,
    });

    const mapAdSet = (as_: any) => ({
      id: as_.id,
      campaign_id: as_.campaignId,
      name: as_.name,
      status: as_.status,
      budget: as_.budget,
      spend: as_.spend,
      clicks: as_.clicks,
      impressions: as_.impressions,
      cpc: as_.cpc,
      ctr: as_.ctr,
      landing_page_views: as_.landingPageViews,
      initiate_checkout: as_.initiateCheckout,
      connect_rate: as_.connectRate,
      sales: as_.sales,
      revenue: as_.revenue,
      profit: as_.profit,
      roas: as_.roas,
      cpa: as_.cpa,
      no_id_sales: Math.floor((as_.sales || 0) * 0.1),
      plays_vsl: Math.floor((as_.landingPageViews || 0) * 0.42),
      play_rate: as_.landingPageViews ? 42.0 : 0,
      ads: adsData.filter((ad) => ad.adSetId === as_.id).map(mapAd),
    });

    const mapCampaign = (c: any, i: number) => ({
      ...c,
      // objective, bid_strategy, budget_type, account_id, account_name come from mock data
      landing_page_views: c.landingPageViews,
      initiate_checkout: c.initiateCheckout,
      connect_rate: c.connectRate,
      no_id_sales: Math.floor((c.sales || 0) * 0.1),
      plays_vsl: Math.floor((c.landingPageViews || 0) * 0.42),
      play_rate: c.landingPageViews ? 42.5 + i : 0,
      adsets: adSetsData.filter((as_) => as_.campaignId === c.id).map(mapAdSet),
    });

    return {
      campaigns: campaignsData.filter((c) => c.id !== "unidentified").map((c, i) => mapCampaign(c, i)),
      unidentified: mapCampaign(campaignsData.find((c) => c.id === "unidentified") || {}, 99),
    };
  }

  if (path === "/campaigns/conversion") {
    return campaignsData.filter(c => c.id !== "unidentified").map(c => ({
      campaign_id: c.id,
      total_transactions: c.sales + 40,
      approved_count: c.sales,
      approved_revenue: c.revenue,
      pending_count: 20,
      pending_revenue: 1500,
      refunded_count: 15,
      refunded_revenue: 800,
      chargeback_count: 5,
      chargeback_revenue: 400,
      trial_count: 0,
      trial_revenue: 0,
      approval_rate: 85.5,
      recovery_rate: 12.0,
      loss_rate: 2.5,
    }));
  }

  if (path.startsWith("/sales")) {
    if (path.includes("summary")) {
      return {
        total: salesData.length,
        approved: salesData.filter(s => s.status === 'approved').length,
        refunded: salesData.filter(s => s.status === 'refunded').length,
        chargebacks: salesData.filter(s => s.status === 'chargeback').length,
        pending: salesData.filter(s => s.status === 'pending').length,
        trial: salesData.filter(s => s.status === 'trial').length,
        revenue: 25400,
        avg_ticket: 297,
      };
    }
    if (path.includes("filter-options")) {
      return {
        products: [{ id: 1, name: "Produto Mock" }],
        platforms: [{ value: "kiwify", label: "Kiwify" }],
        accounts: [
          { slug: "act_123456789", name: "Log Pose - Oficial", platform: "facebook" },
          { slug: "act_987654321", name: "Log Pose - Secundária", platform: "facebook" }
        ],
        upsells: [],
        campaigns: ["Campanha Mock"]
      };
    }
    const mappedSales = salesData.map((s, i) => ({
      ...s,
      id: i + 1,
      external_id: s.id,
      customer_email: s.customerEmail,
      product_name: s.product,
      product_id: 1,
      utm_campaign: s.utmCampaign,
      utm_content: s.utmContent,
      utm_medium: s.utmMedium,
      utm_source: s.utmSource,
      webhook_slug: null,
      checkout_url: null,
      order_bumps: [],
      created_at: s.date
    }));
    return { items: mappedSales, total: mappedSales.length, page: 1, per_page: 20 };
  }

  if (path.startsWith("/customers")) {
    if (path.includes("summary")) {
       return { 
         total_customers: customersData.length, 
         total_orders: customersData.reduce((acc, c) => acc + c.totalOrders, 0),
         total_spent: customersData.reduce((acc, c) => acc + c.totalSpent, 0),
         unique_products: 3,
         avg_ticket: customersData.reduce((acc, c) => acc + c.totalSpent, 0) / customersData.reduce((acc, c) => acc + c.totalOrders, 0)
       };
    }
    if (path.includes("filter-options")) {
      return {
        products: [{ id: 1, name: "Produto Mock" }],
        platforms: [{ value: "kiwify", label: "Kiwify" }],
        accounts: [
          { slug: "act_123456789", name: "Log Pose - Oficial", platform: "facebook" },
          { slug: "act_987654321", name: "Log Pose - Secundária", platform: "facebook" }
        ],
        upsells: []
      };
    }
    const mappedCustomers = customersData.map(c => ({
      ...c,
      total_spent: c.totalSpent,
      total_orders: c.totalOrders,
      first_purchase_at: c.firstPurchase,
      last_purchase_at: c.lastPurchase
    }));
    return { items: mappedCustomers, total: mappedCustomers.length, page: 1, per_page: 20 };
  }

  if (path.startsWith("/products")) {
    const parts = path.split("/").filter(Boolean);
    
    if (parts.length === 1) {
      return productsData.map((p: any, i: number) => ({
        id: i + 1,
        name: p.name,
        logo_url: null,
      }));
    }
    
    if (parts.length === 3 && parts[2] === "checkouts") {
      const productIdIndex = parseInt(parts[1]) - 1;
      const product = productsData[productIdIndex];
      return product ? product.checkouts.map((c: any, i: number) => ({
        id: i + 1,
        url: c.url,
        price: c.price,
        platform: c.platform || "kiwify",
        checkout_code: null,
        name: c.id,
      })) : [];
    }

    if (parts.length === 3 && parts[2] === "order-bumps") {
      const pId = parseInt(parts[1]) - 1;
      return productsData[pId]?.orderBumps.map((ob: any, i: number) => ({
        id: i + 1, product_id: pId + 1, external_id: ob.id, name: ob.name, price: ob.price, created_at: null
      })) || [];
    }
    if (parts.length === 3 && parts[2] === "upsells") {
      const pId = parseInt(parts[1]) - 1;
      return productsData[pId]?.upsells.map((up: any, i: number) => ({
        id: i + 1, product_id: pId + 1, external_id: up.id, name: up.name, price: up.price, created_at: null
      })) || [];
    }
    if (parts.length === 2 && parts[1] === "stats") {
      return productsData.map((p: any, i: number) => ({
        product_id: i + 1,
        checkouts: p.checkouts.map((c: any, ci: number) => ({
          id: ci + 1, url: c.url, price: c.price, name: c.url, sales: c.sales, revenue: c.revenue, abandons: c.abandons, conversion_rate: c.conversionRate
        })),
        order_bumps: p.orderBumps.map((ob: any, oi: number) => ({
          id: oi + 1, external_id: ob.id, name: ob.name, price: ob.price, sales: ob.sales, revenue: ob.revenue, conversion_rate: ob.conversionRate
        })),
        upsells: p.upsells.map((up: any, ui: number) => ({
          id: ui + 1, external_id: up.id, name: up.name, price: up.price, sales: up.sales, revenue: up.revenue, conversion_rate: up.conversionRate
        }))
      }));
    }

    return productsData;
  }

  if (path.startsWith("/funnel")) {
    if (path.includes("recovery-data")) {
      return funnelData.map(f => ({
        ...f,
        stages: [
          { name: "Eventos Gerados", value: f.stages[3]?.value || 100 },
          { name: "Mensagens Enviadas", value: Math.floor((f.stages[3]?.value || 100) * 0.8) },
          { name: "Recuperados", value: Math.floor((f.stages[3]?.value || 100) * 0.15), revenue: Math.floor((f.stages[3]?.value || 100) * 0.15) * 197 }
        ]
      }));
    }
    return funnelData;
  }

  if (path.startsWith("/recovery")) {
    if (path.includes("summary")) {
       return { 
         total: 195,
         recovered: 30,
         pending: 165,
         recovery_rate: 15.38,
         recovered_amount: 15000,
         lost_amount: 45000,
         by_channel: {
           whatsapp: 18,
           email: 5,
           sms: 2,
           back_redirect: 3,
           other: 2
         }
       };
    }
    if (path.includes("list")) {
      return { items: recoveryData, total: recoveryData.length, page: 1, per_page: 20 };
    }
  }

  if (path.startsWith("/company")) {
    if (path.includes("settings")) {
      return {
        tax_rate: defaultCompanySettings.taxRate,
        operational_costs: defaultCompanySettings.operationalCosts,
      };
    }
    if (path.includes("dashboard")) {
      return {
        year: 2026,
        monthly: monthlyFinancialData.map(m => ({
          ...m,
          losses: 0
        })),
        total_sales: 847,
        unique_customers: 523,
      };
    }
    if (path.includes("kpi-colors")) {
      return {
        roas: null,
        cpa: null,
        ctr: null,
        cpc: null
      };
    }
    if (path.includes("ai-instructions")) {
      return {
        metrics: {
          roas: null,
          cpa: null,
          cpc: null,
          connect_rate: null
        },
        additional_prompt: ""
      };
    }
  }

  if (path.startsWith("/refunds")) {
    if (path.includes("summary")) {
      return {
        total_refunds: 145, refunded: 100, chargebacks: 45,
        refund_amount: 15400, chargeback_amount: 8500,
        refund_rate: 3.2, with_reason: 80, without_reason: 65
      };
    }
    if (path.includes("reasons/stats")) {
      return [
        { code: "didnt_like", count: 40 },
        { code: "too_expensive", count: 20 },
        { code: "technical_issues", count: 15 },
        { code: "not_as_described", count: 5 }
      ];
    }
    if (path.includes("list")) {
      return {
        items: [
          { id: 1, external_id: "REF-001", platform: "kiwify", status: "refunded", amount: 197, customer_email: "cliente1@email.com", product_name: "Ebook Fitness", product_id: 1, created_at: "2026-03-01T10:00:00", reason_code: "didnt_like", reason_text: "Não gostei" },
          { id: 2, external_id: "CB-002", platform: "payt", status: "chargeback", amount: 297, customer_email: "cliente2@email.com", product_name: "Curso Marketing", product_id: 2, created_at: "2026-03-02T14:30:00", reason_code: null, reason_text: null }
        ],
        total: 2, page: 1, per_page: 10
      };
    }
  }

  if (path.startsWith("/subscriptions")) {
    if (path.includes("metrics")) {
      return {
        mrr: 15500, arr: 186000, ltv: 850,
        trials: { count: 45, potential_value: 4500, conversion_rate: 65, churn_rate: 35 },
        renewal_rate: 85, cancellation_rate: 15, ticket_medio: 97,
        active_customers: 160, new_customers_month: 20,
        avg_tenure_months: 8.5, avg_cancel_months: 2.1, churn_rate: 10, total_canceled_period: 15
      };
    }
    if (path.includes("mrr-history")) {
      return {
        mrr_history: [
          { month: "Jan", mrr: 12000, new_mrr: 2000, churned_mrr: 500, net_mrr: 1500 },
          { month: "Fev", mrr: 13500, new_mrr: 2500, churned_mrr: 1000, net_mrr: 1500 },
          { month: "Mar", mrr: 15500, new_mrr: 3000, churned_mrr: 1000, net_mrr: 2000 }
        ]
      };
    }
    if (path.includes("products")) {
      return [{ id: "prod_1", name: "Assinatura VIP" }];
    }
  }

  if (path.startsWith("/stripe")) {
    if (path.includes("accounts")) {
      return [{ id: 1, name: "Stripe Principal", api_key: "sk_test_***", created_at: "2026-01-10T10:00:00" }];
    }
  }

  if (path === "/vturb/players") {
    return [
      { id: "vt1", name: "VSL Principal", duration: 1200, pitch_time: 900, created_at: "2026-01-15T00:00:00", account_name: "Conta 1", plays_30d: 4500 },
      { id: "vt2", name: "Upsell Video", duration: 600, pitch_time: 300, created_at: "2026-02-10T00:00:00", account_name: "Conta 1", plays_30d: 1200 }
    ];
  }

  if (path === "/facebook/accounts") {
    return [
      { id: 1, label: "Log Pose - Oficial", account_id: "act_123456789", access_token: "mock_token_1", created_at: "2026-01-01T00:00:00" },
      { id: 2, label: "Log Pose - Secundária", account_id: "act_987654321", access_token: "mock_token_2", created_at: "2026-02-01T00:00:00" },
    ];
  }

  if (path.startsWith("/users")) {
    return [
      { id: 1, name: "Admin", email: "admin@logpose.com", role: "owner", status: "active", invite_token: null, created_at: "2026-01-01T00:00:00" },
      { id: 2, name: "Gestor", email: "gestor@logpose.com", role: "admin", status: "active", invite_token: null, created_at: "2026-02-01T00:00:00" }
    ];
  }


  if (path === "/ai/training-level") {
    return {
      count: 920,
      percentage: 92,
      level: "Quase lá",
      max_records: 1000,
    };
  }

  // Return undefined to fallback to normal fetch if endpoint is not mocked
  return undefined;
}
