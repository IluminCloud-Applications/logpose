import type { RemixiconComponentType } from "@remixicon/react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  icon: RemixiconComponentType;
  url: string;
}

interface SidebarNavGroupProps {
  label: string;
  items: NavItem[];
  currentPath: string;
  onNavigate: (url: string) => void;
}

export function SidebarNavGroup({
  label,
  items,
  currentPath,
  onNavigate,
}: SidebarNavGroupProps) {
  return (
    <SidebarGroup className="py-0.5">
      <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50 px-3 mb-0">
        {label}
      </SidebarGroupLabel>
      <SidebarMenu className="gap-px">
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              isActive={currentPath === item.url}
              onClick={() => onNavigate(item.url)}
              className="cursor-pointer h-8 px-3 gap-2.5 text-[13px]"
            >
              <item.icon className="size-4" />
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
