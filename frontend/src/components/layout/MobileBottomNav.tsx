import { useLocation, useNavigate } from "react-router-dom";
import {
  RiDashboardLine,
  RiMegaphoneLine,
  RiBuildingLine,
  RiLineChartLine,
  RiMessageAi3Line,
} from "@remixicon/react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: RiDashboardLine, path: "/dashboard" },
  { label: "Campanhas", icon: RiMegaphoneLine, path: "/campaigns" },
  { label: "IA", icon: RiMessageAi3Line, path: "__ai__", isAI: true },
  { label: "Empresa", icon: RiBuildingLine, path: "/company" },
  { label: "Vendas", icon: RiLineChartLine, path: "/sales" },
];

interface MobileBottomNavProps {
  onOpenAI: () => void;
}

export function MobileBottomNav({ onOpenAI }: MobileBottomNavProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-50 md:hidden">
      <div className="flex items-center justify-around rounded-2xl bg-card/95 backdrop-blur-xl border border-border/50 shadow-xl px-2 py-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = !item.isAI && location.pathname.startsWith(item.path);
          const Icon = item.icon;

          if (item.isAI) {
            return (
              <button
                key={item.label}
                onClick={onOpenAI}
                className="flex flex-col items-center justify-center -mt-5 group"
              >
                <div className="rounded-full p-3 bg-primary text-primary-foreground shadow-lg shadow-primary/30 group-active:scale-90 transition-transform">
                  <Icon className="size-5" />
                </div>
                <span className="text-[10px] font-semibold mt-0.5 text-primary">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className={`size-5 ${isActive ? "text-primary" : ""}`} />
              <span className={`text-[10px] mt-0.5 ${isActive ? "font-semibold" : "font-medium"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
