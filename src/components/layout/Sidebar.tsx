import { NavLink, useLocation } from "react-router-dom";
import {
  ClipboardList,
  BarChart3,
  ReceiptText,
  Activity,
  Building2,
  Heart,
  ChevronRight,
  Menu,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSidebar } from "@/contexts/SidebarContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  {
    label: "Registration",
    icon: ClipboardList,
    path: "/registration",
    color: "text-blue-400",
    sub: [
      { label: "Demographics", path: "/registration/demographics" },
      { label: "Patient Search", path: "/registration/search" },
    ],
  },
  {
    label: "Reports",
    icon: BarChart3,
    path: "/reports",
    color: "text-emerald-400",
  },
  {
    label: "Billing",
    icon: ReceiptText,
    path: "/billing",
    color: "text-amber-400",
  },
  {
    label: "ATD",
    icon: Activity,
    path: "/atd",
    color: "text-rose-400",
  },
  {
    label: "Ward Management",
    icon: Building2,
    path: "/wards",
    color: "text-purple-400",
  },
  {
    label: "Settings",
    icon: Settings,
    path: "/settings",
    color: "text-slate-400",
  },
];

export default function Sidebar() {
  const location = useLocation();
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <aside
      className="fixed top-0 left-0 h-full flex flex-col z-40 transition-all duration-300"
      style={{
        width: "var(--sidebar-width)",
        background: "hsl(var(--sidebar-bg))",
        borderRight: "1px solid hsl(var(--sidebar-border))",
      }}
    >
      {/* Logo */}
      <div className={cn("flex items-center border-b border-white/10 h-14", isCollapsed ? "justify-center px-0" : "px-4 gap-3")}>
        {!isCollapsed && (
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-primary shadow-lg">
            <Heart className="h-4 w-4 text-white fill-white" />
          </div>
        )}
        {!isCollapsed && (
          <div className="min-w-0 flex-1 overflow-hidden transition-all duration-300">
            <p className="text-white font-bold text-sm tracking-wide leading-none truncate">
              CMK
            </p>
            <p className="text-blue-300 text-[10px] font-medium tracking-widest uppercase mt-0.5 truncate">
              CareSuite
            </p>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 flex-shrink-0">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 py-3">
        <nav className="px-3 space-y-0.5">
          {!isCollapsed && (
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 px-3 py-2 mt-1 truncate transition-all duration-300">
              Main Menu
            </p>
          )}

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(item.path + "/");

            return (
              <div key={item.path}>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <NavLink
                      to={item.path}
                      className={cn(
                        "nav-item group",
                        isActive && "active",
                        isCollapsed && "justify-center px-0"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-lg transition-colors flex-shrink-0",
                          isActive
                            ? "bg-white/20"
                            : "bg-white/5 group-hover:bg-white/10"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4",
                            isActive ? "text-white" : item.color
                          )}
                        />
                      </div>
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-[13px] truncate">{item.label}</span>
                          {isActive && (
                            <ChevronRight className="h-3.5 w-3.5 text-white/60 flex-shrink-0" />
                          )}
                        </>
                      )}
                    </NavLink>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right" className="z-50 bg-slate-800 text-white border-slate-700">
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>

                {/* Sub items for Registration */}
                {isActive && item.sub && !isCollapsed && (
                  <div className="mt-0.5 ml-10 space-y-0.5 transition-all duration-300 overflow-hidden">
                    {item.sub.map((subItem) => (
                      <NavLink
                        key={subItem.path}
                        to={subItem.path}
                        className={({ isActive }) => cn(
                          "block px-3 py-1.5 text-xs rounded-md transition-colors truncate",
                          isActive
                            ? "text-white bg-white/10"
                            : "text-white/50 hover:text-white/80 hover:bg-white/5"
                        )}
                      >
                        {subItem.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Bottom */}
      <div className="p-4 border-t border-white/10">
        <div className={cn("flex items-center rounded-lg hover:bg-white/5 cursor-pointer transition-all duration-300", isCollapsed ? "justify-center p-1" : "gap-3 px-2 py-2")}>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            DR
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1 overflow-hidden transition-all duration-300">
              <p className="text-white text-xs font-semibold truncate">Dr. Admin</p>
              <p className="text-white/40 text-[10px] truncate">Administrator</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
