import { Bell, Search, RefreshCw, HelpCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLocation, useNavigate } from "react-router-dom";

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
    <header className="fixed top-0 right-0 z-30 flex h-14 items-center gap-3 border-b bg-white/95 backdrop-blur-sm px-5 shadow-sm transition-all duration-300"
      style={{ left: "var(--sidebar-width)" }}
    >
      {/* Page info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-bold text-slate-800">{page.title}</h1>
          <span className="text-slate-300">›</span>
          <span className="text-xs text-slate-500">{page.subtitle}</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative hidden md:flex items-center w-56">
        <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
        <Input
          placeholder="Search patients..."
          className="pl-8 h-8 text-xs bg-slate-50 border-slate-200"
        />
      </div>

      {/* Date/Time */}
      <div className="hidden lg:flex flex-col items-end text-right">
        <span className="text-xs font-semibold text-slate-700">{timeStr}</span>
        <span className="text-[10px] text-slate-400">{dateStr}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700">
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700 relative">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[9px]">
            3
          </Badge>
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

        <div className="flex items-center gap-2 cursor-pointer group">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
              DR
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-right">
            <p className="text-xs font-semibold text-slate-700 leading-none">Dr. Admin</p>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5">CMK Healthcare Pvt. Ltd.</p>
          </div>
        </div>
      </div>
    </header>
  );
}
