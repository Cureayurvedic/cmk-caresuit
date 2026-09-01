import { useState, useEffect, useRef } from "react";
import { Search, RefreshCw, HelpCircle, Settings, X, Loader2, User, Phone, Menu, Building2, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation, useNavigate } from "react-router-dom";
import { getPatients, PatientData } from "@/api/patientApi";
import { useSidebar } from "@/contexts/SidebarContext";
import { useBranch } from "@/contexts/BranchContext";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/registration": { title: "Registration", subtitle: "Demographics — New Registration" },
  "/registration/demographics": { title: "Registration", subtitle: "Demographics — New Registration" },
  "/registration/search": { title: "Registration", subtitle: "Patient Search" },
  "/reports": { title: "Reports", subtitle: "Analytics & Reports" },
  "/billing": { title: "Billing", subtitle: "Invoices & Payments" },
  "/atd": { title: "ATD", subtitle: "Admission, Transfer & Discharge — Bed Status Matrix" },
  "/wards": { title: "Ward Management", subtitle: "Beds & Wards" },
  "/settings": { title: "Settings", subtitle: "Configuration & Management" },
};

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleMobileSidebar } = useSidebar();
  const { activeBranch, setActiveBranch, branchesList } = useBranch();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Global Header Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PatientData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const handleGlobalRefresh = () => {
    setIsRefreshing(true);
    window.dispatchEvent(new CustomEvent("app:refresh"));
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch search results on typing
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsOpen(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setIsOpen(true);

    const timer = setTimeout(async () => {
      try {
        const res = await getPatients({ search: searchQuery.trim(), limit: 6 });
        setSearchResults(res.patients || []);
      } catch (err) {
        console.error("Global header search error:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      e.preventDefault();
      setIsOpen(false);
      navigate(`/registration/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectPatient = (p: PatientData) => {
    setIsOpen(false);
    setSearchQuery("");
    const targetUhid = p.uhid || p.fullName || "";
    
    if (location.pathname.startsWith("/billing")) {
      navigate(`/billing?uhid=${encodeURIComponent(targetUhid)}`);
    } else {
      navigate(`/registration/search?query=${encodeURIComponent(targetUhid)}`);
    }
  };

  const page = PAGE_TITLES[location.pathname] ?? {
    title: "CMK CareSuite",
    subtitle: "Professional Healthcare Management",
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="fixed top-0 right-0 z-30 flex h-14 items-center gap-2 md:gap-3 border-b bg-white/95 backdrop-blur-sm px-3 md:px-5 shadow-sm transition-all duration-300 left-0 md:left-[var(--sidebar-width)]">
      {/* Mobile Drawer Hamburger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMobileSidebar}
        className="md:hidden h-8 w-8 text-slate-700 hover:bg-slate-100 flex-shrink-0"
        title="Toggle Menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Page info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 md:gap-2 truncate">
          <h1 className="text-xs md:text-sm font-bold text-slate-800 truncate">{page.title}</h1>
          <span className="text-slate-300 hidden sm:inline">›</span>
          <span className="text-[11px] md:text-xs text-slate-500 truncate hidden sm:inline">{page.subtitle}</span>
        </div>
      </div>

      {/* Global Interactive Search */}
      <div ref={searchContainerRef} className="relative hidden md:flex items-center w-72">
        <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400 z-10" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => { if (searchQuery.trim()) setIsOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder="Search patients (Name, UHID, Mobile)..."
          className="pl-8 pr-7 h-8 text-xs bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 shadow-2xs font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => { setSearchQuery(""); setSearchResults([]); setIsOpen(false); }}
            className="absolute right-2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Search Results Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden z-50 animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="p-2 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between text-[11px] font-bold text-slate-600">
              <span>Patient Search Results</span>
              {isSearching && <Loader2 className="w-3 h-3 animate-spin text-blue-600" />}
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
              {isSearching && searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 font-medium flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" /> Searching database...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No matching patients found for <span className="font-bold text-slate-700">"{searchQuery}"</span>
                </div>
              ) : (
                searchResults.map((p) => {
                  const displayName = p.fullName || `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Patient";
                  return (
                    <div
                      key={p.id || p.uhid}
                      onClick={() => handleSelectPatient(p)}
                      className="p-2.5 hover:bg-blue-50/60 cursor-pointer transition-colors flex items-center justify-between group"
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors truncate">
                            {displayName}
                          </span>
                          {p.gender && (
                            <span className="text-[10px] text-slate-500 font-medium">
                              ({p.gender}{p.age ? `, ${p.age}Yr` : ""})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                          {p.mobile && <span className="flex items-center gap-0.5"><Phone className="w-2.5 h-2.5 text-slate-400" />{p.mobile}</span>}
                          {p.payer && <span className="truncate max-w-[120px] text-slate-400">{p.payer}</span>}
                        </div>
                      </div>

                      {p.uhid && (
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-mono text-[10px] font-bold shrink-0">
                          {p.uhid}
                        </Badge>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {searchQuery.trim() && (
              <div
                onClick={() => {
                  setIsOpen(false);
                  navigate(`/registration/search?query=${encodeURIComponent(searchQuery.trim())}`);
                }}
                className="p-2 bg-slate-50 border-t border-slate-100 text-center text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                View all results for "{searchQuery}" →
              </div>
            )}
          </div>
        )}
      </div>

      {/* Date/Time */}
      <div className="hidden lg:flex flex-col items-end text-right">
        <span className="text-xs font-semibold text-slate-700">{timeStr}</span>
        <span className="text-[10px] text-slate-400">{dateStr}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleGlobalRefresh}
          title="Refresh Module & Application Data"
          className="h-8 w-8 text-slate-500 hover:text-slate-700"
        >
          <RefreshCw className={`h-4 w-4 transition-transform ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700">
          <HelpCircle className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-500 hover:text-slate-700"
          onClick={() => navigate("/settings")}
        >
          <Settings className="h-4 w-4" />
        </Button>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        {/* Global Active Branch Switcher */}
        <div className="hidden sm:flex items-center gap-1.5 bg-blue-50/80 border border-blue-200/80 rounded-lg px-2.5 py-1">
          <Building2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
          <div className="flex flex-col text-left">
            <span className="text-[9px] font-extrabold uppercase text-blue-600 leading-none tracking-wider">Branch</span>
            <Select
              value={activeBranch}
              onValueChange={(val) => {
                if (val === "__create_branch__") {
                  navigate("/settings?tab=branches");
                } else {
                  setActiveBranch(val);
                }
              }}
            >
              <SelectTrigger title={activeBranch} className="h-4 p-0 border-0 shadow-none bg-transparent text-xs font-black text-slate-800 focus:ring-0 gap-1 max-w-[120px] sm:max-w-[180px]">
                <span className="truncate block"><SelectValue /></span>
              </SelectTrigger>
              <SelectContent align="end" className="bg-white border-slate-200 min-w-[200px]">
                {branchesList.map((b) => (
                  <SelectItem key={b} value={b} className="text-xs font-bold cursor-pointer">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      <span>{b}</span>
                    </div>
                  </SelectItem>
                ))}
                <SelectItem
                  value="__create_branch__"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50/70 hover:bg-blue-100/90 cursor-pointer mt-1 border-t border-slate-100 rounded-b-md"
                >
                  <div className="flex items-center gap-1.5 py-0.5 text-blue-600 font-extrabold">
                    <Plus className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <span>+ Create / Manage Branches</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2 cursor-pointer group pl-1">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
              DR
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-right">
            <p className="text-xs font-semibold text-slate-700 leading-none">Dr. Admin</p>
            <p className="text-[10px] text-blue-600 font-bold leading-none mt-0.5 truncate max-w-[80px] lg:max-w-[120px]" title={activeBranch}>{activeBranch}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
