import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

function DashboardLayoutContent() {
  const { isCollapsed } = useSidebar();

  return (
    <div className={cn("min-h-screen bg-background transition-all duration-300", isCollapsed && "sidebar-collapsed")}>
      <Sidebar />
      <Header />
      <main
        className="min-h-screen pt-14 transition-all duration-300"
        style={{ marginLeft: "var(--sidebar-width)" }}
      >
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <DashboardLayoutContent />
    </SidebarProvider>
  );
}

