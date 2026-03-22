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
  RiTeamLine,
  RiRepeatLine,
  RiBankCardLine,
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
import { AiTrainingProfile } from "./AiTrainingProfile";
import { getStoredUser } from "@/services/auth";
import type { RemixiconComponentType } from "@remixicon/react";

type UserRole = "owner" | "admin" | "viewer";

interface NavItem {
  title: string;
  icon: RemixiconComponentType;
  url: string;
  roles?: UserRole[]; // if omitted, visible to all
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Análise",
    items: [
      { title: "Dashboard", icon: RiDashboardLine, url: "/dashboard" },
      { title: "Campanhas", icon: RiMegaphoneLine, url: "/campaigns" },
      { title: "Empresa", icon: RiBuildingLine, url: "/company" },
      { title: "Assinatura", icon: RiRepeatLine, url: "/subscriptions" },
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
      { title: "Produtos", icon: RiBox1Line, url: "/products", roles: ["owner", "admin"] },
      { title: "Funil", icon: RiFlowChart, url: "/funnel" },
    ],
  },
  {
    label: "Integrações",
    items: [
      { title: "Plataformas", icon: RiWalletLine, url: "/platforms", roles: ["owner", "admin"] },
      { title: "Facebook Ads", icon: RiMetaLine, url: "/facebook-ads", roles: ["owner", "admin"] },
      { title: "VTurb", icon: RiPlayCircleLine, url: "/vturb", roles: ["owner", "admin"] },
      { title: "Stripe", icon: RiBankCardLine, url: "/stripe", roles: ["owner", "admin"] },
      { title: "Gemini API", icon: RiGeminiLine, url: "/gemini", roles: ["owner", "admin"] },
    ],
  },
  {
    label: "Gestão",
    items: [
      { title: "Usuários", icon: RiTeamLine, url: "/users", roles: ["owner", "admin"] },
    ],
  },
];

function filterNavGroups(groups: NavGroup[], role: UserRole): NavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.roles || item.roles.includes(role)),
    }))
    .filter((group) => group.items.length > 0);
}

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getStoredUser();
  const role: UserRole = user?.role ?? "owner";

  const visibleGroups = filterNavGroups(navGroups, role);

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
        {visibleGroups.map((group) => (
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
        <AiTrainingProfile />
        <SidebarUser />
      </SidebarFooter>
    </Sidebar>
  );
}
