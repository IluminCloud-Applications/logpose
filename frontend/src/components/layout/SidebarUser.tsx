import { RiLogoutBoxLine, RiExpandUpDownLine, RiSunLine, RiMoonLine, RiUserLine, RiSettings3Line } from "@remixicon/react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { logout, getStoredUser } from "@/services/auth";

export function SidebarUser() {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const user = getStoredUser();

  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const initials = user?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "CA";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-white/20 text-sidebar-foreground text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium text-[13px]">
                  {user?.name || "Admin"}
                </span>
                <span className="truncate text-[11px] text-sidebar-foreground/60">
                  {user?.role === "owner" ? "Owner" : user?.role === "admin" ? "Administrador" : user?.role === "viewer" ? "Visualizador" : ""}
                </span>
              </div>
              <RiExpandUpDownLine className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.name || "Admin"}</span>
                  <a
                    href="https://ilumin.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-xs text-muted-foreground hover:text-primary transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Powered by Ilumin
                  </a>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user?.role === "owner" && (
              <DropdownMenuItem onClick={() => navigate("/advanced-settings")}>
                <RiSettings3Line className="size-4" />
                Opções Avançadas
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <RiUserLine className="size-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsDark(!isDark)}>
              {isDark ? <RiSunLine className="size-4" /> : <RiMoonLine className="size-4" />}
              {isDark ? "Modo Claro" : "Modo Escuro"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <RiLogoutBoxLine className="size-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
