import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export function DashboardLayout() {
  return (
    <SidebarProvider
      style={{ "--sidebar-width": "14.5rem" } as React.CSSProperties}
      className="h-screen"
    >
      <div className="flex flex-1 h-full p-2.5 gap-2.5">
        <AppSidebar />
        <SidebarInset className="overflow-auto flex-1">
          <div className="mx-auto w-full min-h-full rounded-xl border border-border/40 bg-background shadow-sm" style={{ maxWidth: "min(1600px, 100%)" }}>
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
