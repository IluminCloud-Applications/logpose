import {
  RiDashboardLine,
  RiMegaphoneLine,
  RiLineChartLine,
  RiGroupLine,
  RiShoppingCartLine,
  RiBox1Line,
  RiFlowChart,
  RiWalletLine,
  RiMetaLine,
  RiPlayCircleLine,
  RiBuildingLine,
  RiRefundLine,
  RiGeminiLine,
  RiAddCircleLine,
} from "@remixicon/react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { SidebarNavGroup } from "./SidebarNavGroup";
import { SidebarUser } from "./SidebarUser";

const navGroups = [
  {
    label: "Análise",
    items: [
      { title: "Dashboard", icon: RiDashboardLine, url: "/dashboard" },
      { title: "Campanhas", icon: RiMegaphoneLine, url: "/campaigns" },
      { title: "Criar Campanha", icon: RiAddCircleLine, url: "/campaigns/create" },
      { title: "Empresa", icon: RiBuildingLine, url: "/company" },
    ],
  },
  {
    label: "Comercial",
    items: [
      { title: "Vendas", icon: RiLineChartLine, url: "/sales" },
      { title: "Clientes", icon: RiGroupLine, url: "/customers" },
      { title: "Reembolsos", icon: RiRefundLine, url: "/refunds" },
      { title: "Recuperação", icon: RiShoppingCartLine, url: "/recovery" },
    ],
  },
  {
    label: "Produtos",
    items: [
      { title: "Produtos", icon: RiBox1Line, url: "/products" },
      { title: "Funil", icon: RiFlowChart, url: "/funnel" },
    ],
  },
  {
    label: "Integrações",
    items: [
      { title: "Plataformas", icon: RiWalletLine, url: "/platforms" },
      { title: "Facebook Ads", icon: RiMetaLine, url: "/facebook-ads" },
      { title: "VTurb", icon: RiPlayCircleLine, url: "/vturb" },
      { title: "Gemini API", icon: RiGeminiLine, url: "/gemini" },
    ],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Sidebar
      variant="floating"
      collapsible="none"
      className="rounded-xl overflow-hidden h-full"
    >
      <SidebarHeader className="px-3 pt-3 pb-1">
        <img
          src="/logo_dark.webp"
          alt="LOG POSE"
          className="h-12 w-auto object-contain"
        />
      </SidebarHeader>
      <SidebarContent className="px-2 gap-0">
        {navGroups.map((group) => (
          <SidebarNavGroup
            key={group.label}
            label={group.label}
            items={group.items}
            currentPath={location.pathname}
            onNavigate={(url: string) => navigate(url)}
          />
        ))}
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarUser />
      </SidebarFooter>
    </Sidebar>
  );
}
