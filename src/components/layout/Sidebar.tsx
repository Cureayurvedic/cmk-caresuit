import { NavLink, useLocation } from "react-router-dom";
import {
  ClipboardList,
  BarChart3,
  ReceiptText,
  Activity,
  Building2,
  ChevronRight,
  Menu,
  Settings,
  ArrowLeft,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSidebar } from "@/contexts/SidebarContext";
import { useReports, REPORT_TREE } from "@/contexts/ReportsContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    label: "Reports",
    icon: BarChart3,
    path: "/reports",
    color: "text-emerald-400",
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
  const { isCollapsed, toggleSidebar, isMobileOpen, closeMobileSidebar } = useSidebar();
  const {
    activeCategory,
    setActiveCategory,
    selectedReportId,
    setSelectedReportId,
    collapsedCategories,
    toggleCategory,
    sidebarFilterSearch,
    setSidebarFilterSearch,
    showReportsSidebar,
    handleBackToMainMenu,
    handleOpenReportsMenu,
    filteredTree,
  } = useReports();

  const isReportsRoute = location.pathname.startsWith("/reports");
  const isShowingReportsMenu = isReportsRoute && showReportsSidebar;

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      <div
        onClick={closeMobileSidebar}
        className={cn(
          "fixed inset-0 bg-slate-950/60 z-30 md:hidden transition-opacity duration-300",
          isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      <aside
        className={cn(
          "fixed top-0 left-0 h-full flex flex-col z-40 transition-all duration-300 select-none",
          isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        )}
        style={{
          width: "var(--sidebar-width)",
          background: "hsl(var(--sidebar-bg))",
          borderRight: "1px solid hsl(var(--sidebar-border))",
        }}
      >
      {/* Header Section */}
      <div
        className={cn(
          "flex items-center border-b border-white/10 transition-all duration-300 bg-slate-950/60",
          isCollapsed ? "justify-center px-0 h-14" : "px-3 gap-2 h-16"
        )}
      >
        {isShowingReportsMenu ? (
          /* Reports Mode Header */
          isCollapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToMainMenu}
                  className="h-9 w-9 text-blue-400 hover:text-white hover:bg-blue-900/50"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                Back to Main Menu
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex-1 flex items-center justify-between min-w-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToMainMenu}
                className="flex items-center gap-1 bg-blue-950/80 text-blue-300 border-blue-700/60 hover:bg-blue-900 hover:text-white text-xs h-7 px-2.5 font-semibold transition-all"
                title="Return to Main Menu Sidebar"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </Button>
              <div className="flex items-center gap-1.5 min-w-0 overflow-hidden px-1">
                <BarChart3 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span className="font-extrabold text-xs text-white uppercase tracking-wider truncate">
                  Reports
                </span>
                <Badge
                  variant="outline"
                  className="bg-blue-900/40 text-blue-300 border-blue-700/50 text-[9px] px-1 h-4 font-mono hidden sm:inline-flex"
                >
                  v50.24
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/10 flex-shrink-0"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          )
        ) : (
          /* Main Menu Header */
          <>
            {!isCollapsed && (
              <div className="flex-1 flex items-center justify-center h-full py-2">
                <div className="w-full h-full flex items-center justify-center px-1 overflow-hidden">
                  <img
                    src="/cmk_caresuit_logo.png"
                    alt="CMK CareSuite"
                    className="w-full h-full object-contain scale-[1.15]"
                  />
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 flex-shrink-0"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>

      {/* Main Content Area */}
      {isShowingReportsMenu ? (
        /* ─── REPORTS SUB-SIDEBAR MODE ────────────────────────────────────────── */
        <div className="flex-1 flex flex-col min-h-0">
          {/* Quick Search inside Sidebar */}
          {!isCollapsed && (
            <div className="p-2 border-b border-white/10 bg-slate-950/40">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={sidebarFilterSearch}
                  onChange={(e) => setSidebarFilterSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-md pl-8 pr-2 py-1 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Tree Menu List */}
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-1">
              {filteredTree.map((group) => {
                const isCatCollapsed = collapsedCategories[group.category];
                const Icon = group.icon;
                const isCategoryActive = activeCategory === group.category;

                return (
                  <div key={group.category} className="space-y-0.5">
                    {/* Category Header */}
                    <button
                      onClick={() => {
                        setActiveCategory(group.category);
                        toggleCategory(group.category);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between py-1.5 rounded-md text-xs font-bold transition-colors",
                        isCollapsed ? "justify-center px-1" : "px-2.5",
                        isCategoryActive
                          ? "bg-blue-950/80 text-blue-300 border border-blue-800/60"
                          : "hover:bg-white/5 text-slate-300"
                      )}
                      title={isCollapsed ? group.category : undefined}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {!isCollapsed && (
                          <span className="font-mono text-slate-400 font-black text-[11px]">
                            {isCatCollapsed ? "+" : "−"}
                          </span>
                        )}
                        <Icon
                          className={cn(
                            "h-3.5 w-3.5 flex-shrink-0",
                            isCategoryActive ? "text-blue-400" : "text-slate-400"
                          )}
                        />
                        {!isCollapsed && <span className="truncate">{group.category}</span>}
                      </div>
                      {!isCollapsed && (
                        <Badge className="bg-slate-800/80 text-[10px] text-slate-400 border-none px-1.5 h-4">
                          {group.items.length}
                        </Badge>
                      )}
                    </button>

                    {/* Tree Items */}
                    {!isCatCollapsed && (
                      <div
                        className={cn(
                          "space-y-0.5 mt-0.5",
                          !isCollapsed && "pl-3 ml-2 border-l border-white/10"
                        )}
                      >
                        {group.items.map((item) => {
                          const isSelected = selectedReportId === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setSelectedReportId(item.id);
                                setActiveCategory(item.category);
                              }}
                              className={cn(
                                "w-full flex items-center justify-between py-1.5 rounded text-left text-xs font-medium transition-all",
                                isCollapsed ? "justify-center px-1" : "px-2",
                                isSelected
                                  ? "bg-blue-600 text-white font-bold shadow-xs translate-x-0.5"
                                  : "hover:bg-white/10 text-slate-300 hover:text-white"
                              )}
                              title={item.name}
                            >
                              <span className="truncate pr-1">
                                {isCollapsed ? item.name.slice(0, 3) : `• ${item.name}`}
                              </span>
                              {isSelected && !isCollapsed && (
                                <ChevronRight className="h-3 w-3 text-white flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Bottom Module Switcher */}
          {!isCollapsed && (
            <div className="p-2 border-t border-white/10 bg-slate-950/60 space-y-1">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-1 py-0.5">
                Report Modules
              </div>
              <div className="grid grid-cols-3 gap-1">
                {(["Registration", "ATD", "Billing"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      const firstItem = REPORT_TREE.find((g) => g.category === cat)?.items[0];
                      if (firstItem) setSelectedReportId(firstItem.id);
                    }}
                    className={cn(
                      "px-1.5 py-1 rounded text-[10px] font-bold text-center transition-colors truncate",
                      activeCategory === cat
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ─── STANDARD MAIN MENU MODE ─────────────────────────────────────────── */
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
                        onClick={() => {
                          closeMobileSidebar();
                          if (item.path === "/reports") {
                            handleOpenReportsMenu();
                          }
                        }}
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
                      <TooltipContent
                        side="right"
                        className="z-50 bg-slate-800 text-white border-slate-700"
                      >
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
                          onClick={closeMobileSidebar}
                          className={({ isActive }) =>
                            cn(
                              "block px-3 py-1.5 text-xs rounded-md transition-colors truncate",
                              isActive
                                ? "text-white bg-white/10"
                                : "text-white/50 hover:text-white/80 hover:bg-white/5"
                            )
                          }
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
      )}

      {/* Bottom Profile Section */}
      <div className="p-3 border-t border-white/10 bg-slate-950/40">
        <div
          className={cn(
            "flex items-center rounded-lg hover:bg-white/5 cursor-pointer transition-all duration-300",
            isCollapsed ? "justify-center p-1" : "gap-3 px-2 py-1.5"
          )}
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-xs">
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
    </>
  );
}
