import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
  LogOut,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSidebar } from "@/contexts/SidebarContext";
import { useIsAdmin } from "@/contexts/AuthContext";
import { useReports, REPORT_TREE } from "@/contexts/ReportsContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const NAV_ITEMS = [
  {
    label: "Registration",
    icon: ClipboardList,
    path: "/registration",
    sub: [
      { label: "Registration Form", path: "/registration/demographics" },
      { label: "Patient Search", path: "/registration/search" },
    ],
  },
  {
    label: "Billing",
    icon: ReceiptText,
    path: "/billing",
  },
  {
    label: "Reports",
    icon: BarChart3,
    path: "/reports",
  },
  {
    label: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

export default function Sidebar() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
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
  
  const isAdmin = useIsAdmin();

  const isReportsRoute = location.pathname.startsWith("/reports");
  const isShowingReportsMenu = isReportsRoute && showReportsSidebar;

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      <div
        onClick={closeMobileSidebar}
        className={cn(
          "fixed inset-0 bg-slate-900/60 z-30 md:hidden transition-opacity duration-300",
          isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      <aside
        className={cn(
          "fixed top-0 left-0 h-full flex flex-col z-40 transition-all duration-300 select-none bg-[#0B1B4F] border-r border-blue-900/40 shadow-xl",
          isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        )}
        style={{
          width: "var(--sidebar-width)",
        }}
      >
        {/* Header Section */}
        <div
          className={cn(
            "flex items-center border-b border-blue-900/40 transition-all duration-300 bg-[#07133F]",
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
                    className="h-9 w-9 text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-[#0B1B4F] text-white border-blue-800">
                  Back to Main Menu
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="flex-1 flex items-center justify-between min-w-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBackToMainMenu}
                  className="flex items-center gap-1 bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs h-7 px-2.5 font-semibold transition-all"
                  title="Return to Main Menu Sidebar"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </Button>
                <div className="flex items-center gap-1.5 min-w-0 overflow-hidden px-1">
                  <BarChart3 className="h-4 w-4 text-white flex-shrink-0" />
                  <span className="font-extrabold text-xs text-white uppercase tracking-wider truncate">
                    Reports
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-white/15 text-white border-white/20 text-[9px] px-1 h-4 font-mono hidden sm:inline-flex"
                  >
                    v50.24
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="h-7 w-7 text-white hover:bg-white/10 flex-shrink-0"
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
                  <div className="w-full h-full flex items-center justify-center px-2 py-1 bg-white/95 rounded-lg shadow-xs overflow-hidden">
                    <img
                      src="/cmk-logo.png"
                      alt="CMK HealthCare"
                      className="w-full h-full object-contain max-h-10"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes("cmk_caresuit_logo")) {
                          target.src = "/cmk_caresuit_logo.png";
                        }
                      }}
                    />
                  </div>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-8 w-8 text-white hover:bg-white/10 flex-shrink-0"
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
              <div className="p-2 border-b border-blue-900/40 bg-[#07133F]">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-300" />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={sidebarFilterSearch}
                    onChange={(e) => setSidebarFilterSearch(e.target.value)}
                    className="w-full bg-[#0B1B4F]/90 border border-blue-800/50 rounded-md pl-8 pr-2 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 font-medium transition-colors"
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
                            ? "bg-blue-600 text-white font-extrabold shadow-sm"
                            : "hover:bg-white/10 text-slate-200"
                        )}
                        title={isCollapsed ? group.category : undefined}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {!isCollapsed && (
                            <span className="font-mono font-black text-[11px] text-white">
                              {isCatCollapsed ? "+" : "−"}
                            </span>
                          )}
                          <Icon className="h-3.5 w-3.5 flex-shrink-0 text-white" />
                          {!isCollapsed && <span className="truncate">{group.category}</span>}
                        </div>
                        {!isCollapsed && (
                          <Badge
                            className={cn(
                              "text-[10px] border-none px-1.5 h-4",
                              isCategoryActive ? "bg-white/20 text-white" : "bg-white/10 text-slate-200"
                            )}
                          >
                            {group.items.length}
                          </Badge>
                        )}
                      </button>

                      {/* Tree Items */}
                      {!isCatCollapsed && (
                        <div
                          className={cn(
                            "space-y-0.5 mt-0.5",
                            !isCollapsed && "pl-3 ml-2 border-l border-white/15"
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
                                  "w-full flex items-center justify-between py-1.5 rounded text-left text-xs font-semibold transition-all",
                                  isCollapsed ? "justify-center px-1" : "px-2",
                                  isSelected
                                    ? "bg-blue-600 text-white font-bold shadow-xs translate-x-0.5"
                                    : "hover:bg-white/10 text-slate-300"
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
              <div className="p-2 border-t border-blue-900/40 bg-[#07133F] space-y-1">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-1 py-0.5">
                  Report Modules
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {(["Registration", "Billing"] as const).map((cat) => (
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
                          : "bg-white/10 hover:bg-white/20 text-slate-200"
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
            <nav className="px-3 space-y-1">
              {!isCollapsed && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 py-2 mt-1 truncate transition-all duration-300">
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
                                ? "bg-white/25 text-white"
                                : "bg-white/10 group-hover:bg-white/20 text-slate-200 group-hover:text-white"
                            )}
                          >
                            <Icon
                              className={cn(
                                "h-4 w-4",
                                isActive ? "text-white" : "text-slate-200 group-hover:text-white"
                              )}
                            />
                          </div>
                          {!isCollapsed && (
                            <>
                              <span className="flex-1 text-[13px] truncate">{item.label}</span>
                              {isActive && (
                                <ChevronRight className="h-3.5 w-3.5 text-white/80 flex-shrink-0" />
                              )}
                            </>
                          )}
                        </NavLink>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent
                          side="right"
                          className="z-50 bg-[#0B1B4F] text-white border-blue-800"
                        >
                          {item.label}
                        </TooltipContent>
                      )}
                    </Tooltip>

                    {/* Sub items for Registration */}
                    {isActive && item.sub && !isCollapsed && (
                      <div className="mt-1 ml-8 space-y-0.5 transition-all duration-300 overflow-hidden">
                        {item.sub.map((subItem) => (
                          <NavLink
                            key={subItem.path}
                            to={subItem.path}
                            onClick={closeMobileSidebar}
                            className={({ isActive }) =>
                              cn(
                                "block px-3 py-1.5 text-xs rounded-md transition-colors truncate font-semibold",
                                isActive
                                  ? "text-white bg-blue-600 font-bold shadow-xs"
                                  : "text-slate-300 hover:text-white hover:bg-white/10"
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
        <div className="p-3 border-t border-blue-900/40 bg-[#07133F] relative">
          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute bottom-[calc(100%-8px)] left-3 mb-2 w-[calc(100%-24px)] bg-[#0B1B4F] border border-blue-900/50 rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 origin-bottom-left">
                <div className="p-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate("/login");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-md transition-colors font-bold text-left"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span>Sign out</span>}
                  </button>
                </div>
              </div>
            </>
          )}
          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={cn(
              "flex items-center rounded-lg hover:bg-white/10 cursor-pointer transition-all duration-300 relative z-50",
              isCollapsed ? "justify-center p-1" : "gap-3 px-2 py-1.5"
            )}
          >
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black flex-shrink-0 shadow-xs">
              DR
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1 overflow-hidden transition-all duration-300">
                <p className="text-white text-xs font-bold truncate">Dr. Admin</p>
                <p className="text-blue-300 text-[10px] font-semibold truncate">Administrator</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
