import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  RiDashboardLine,
  RiMegaphoneLine,
  RiBuildingLine,
  RiMoreLine,
  RiMessageAi3Line,
  RiShoppingCartLine,
  RiGroupLine,
  RiRefundLine,
  RiLoopLeftLine,
  RiBox3Line,
  RiFilter2Line,
} from "@remixicon/react";
import { MoreDropdown } from "./MobileMoreDropdown";

const NAV_ITEMS = [
  { label: "Dashboard", icon: RiDashboardLine, path: "/dashboard" },
  { label: "Campanhas", icon: RiMegaphoneLine, path: "/campaigns" },
  { label: "IA", icon: RiMessageAi3Line, path: "__ai__", isAI: true },
  { label: "Empresa", icon: RiBuildingLine, path: "/company" },
  { label: "Mais", icon: RiMoreLine, path: "__more__", isMore: true },
];

export const MORE_ITEMS = [
  { label: "Vendas", icon: RiShoppingCartLine, path: "/sales" },
  { label: "Clientes", icon: RiGroupLine, path: "/customers" },
  { label: "Reembolsos", icon: RiRefundLine, path: "/refunds" },
  { label: "Recuperação", icon: RiLoopLeftLine, path: "/recovery" },
  { label: "Produtos", icon: RiBox3Line, path: "/products" },
  { label: "Funil", icon: RiFilter2Line, path: "/funnel" },
];

const MORE_PATHS = MORE_ITEMS.map((item) => item.path);

interface MobileBottomNavProps {
  onOpenAI: () => void;
}

export function MobileBottomNav({ onOpenAI }: MobileBottomNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const isMoreActive = MORE_PATHS.some((p) =>
    location.pathname.startsWith(p)
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    }
    if (isMoreOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMoreOpen]);

  const handleMoreItemClick = (path: string) => {
    navigate(path);
    setIsMoreOpen(false);
  };

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-50 md:hidden">
      <div className="flex items-center justify-around rounded-2xl bg-card/95 backdrop-blur-xl border border-border/50 shadow-xl px-2 py-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            !item.isAI &&
            !item.isMore &&
            location.pathname.startsWith(item.path);
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

          if (item.isMore) {
            return (
              <div key={item.label} ref={moreRef} className="relative">
                <MoreDropdown
                  isOpen={isMoreOpen}
                  items={MORE_ITEMS}
                  currentPath={location.pathname}
                  onItemClick={handleMoreItemClick}
                />
                <button
                  onClick={() => setIsMoreOpen((prev) => !prev)}
                  className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-colors ${
                    isMoreActive || isMoreOpen
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon
                    className={`size-5 ${
                      isMoreActive || isMoreOpen ? "text-primary" : ""
                    }`}
                  />
                  <span
                    className={`text-[10px] mt-0.5 ${
                      isMoreActive || isMoreOpen
                        ? "font-semibold"
                        : "font-medium"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              </div>
            );
          }

          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className={`size-5 ${isActive ? "text-primary" : ""}`} />
              <span
                className={`text-[10px] mt-0.5 ${
                  isActive ? "font-semibold" : "font-medium"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
