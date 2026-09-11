import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Users, DollarSign } from "lucide-react";

export interface ReportTreeItem {
  id: string;
  name: string;
  category: "Registration" | "Billing";
  description: string;
}

export interface ReportCategoryGroup {
  category: "Registration" | "Billing";
  icon: any;
  items: ReportTreeItem[];
}

export const REPORT_TREE: ReportCategoryGroup[] = [
  {
    category: "Registration",
    icon: Users,
    items: [
      { id: "Registration List", name: "Registration List", category: "Registration", description: "Comprehensive list of registered patient demographics" },
      { id: "Registration Report", name: "Registration Report", category: "Registration", description: "Daily & monthly patient registration volume analysis" },
    ],
  },
  {
    category: "Billing",
    icon: DollarSign,
    items: [
      { id: "Cash Collection", name: "Cash Collection", category: "Billing", description: "Daily counter receipts breakdown by cash, card, UPI and cheque" },
      { id: "Credit Collection", name: "Credit Collection", category: "Billing", description: "Insurance, TPA and corporate company settlement receipts" },
      { id: "OP Visit", name: "OP Visit", category: "Billing", description: "Outpatient consultations, doctor fees and department traffic" },
      { id: "Bill Register", name: "Bill Register", category: "Billing", description: "Master invoice log for all bills with settlement status" },
      { id: "Outstanding", name: "Outstanding", category: "Billing", description: "Aging ledger of unpaid balances from patients and payers" },
      { id: "Discount Report", name: "Discount Report", category: "Billing", description: "Authorized billing waivers, concessions and courtesy discounts" },
      { id: "Revenue", name: "Revenue", category: "Billing", description: "Consolidated hospital gross and net revenue" },
      { id: "Bill Cancelled", name: "Bill Cancelled", category: "Billing", description: "Cancelled invoice audit trail with authorization reasons" },
      { id: "Refund", name: "Refund", category: "Billing", description: "Patient deposit and excess payment refund disbursement log" },
      { id: "Credit Note Report", name: "Credit Note Report", category: "Billing", description: "Credit notes issued with authorized reasons and adjustments" },
      { id: "Advance Collection Reports", name: "Advance Collection Reports", category: "Billing", description: "Patient advance receipts, adjusted balances and deposits" },
    ],
  },
];

interface ReportsContextType {
  activeCategory: "Registration" | "Billing";
  setActiveCategory: (cat: "Registration" | "Billing") => void;
  selectedReportId: string;
  setSelectedReportId: (id: string) => void;
  collapsedCategories: { [key: string]: boolean };
  toggleCategory: (cat: string) => void;
  sidebarFilterSearch: string;
  setSidebarFilterSearch: (query: string) => void;
  showReportsSidebar: boolean;
  setShowReportsSidebar: (show: boolean) => void;
  handleBackToMainMenu: () => void;
  handleOpenReportsMenu: () => void;
  filteredTree: ReportCategoryGroup[];
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState<"Registration" | "Billing">("Registration");
  const [selectedReportId, setSelectedReportId] = useState<string>("Registration List");
  const [collapsedCategories, setCollapsedCategories] = useState<{ [key: string]: boolean }>({
    Registration: false,
    Billing: false,
  });
  const [sidebarFilterSearch, setSidebarFilterSearch] = useState("");
  const [showReportsSidebar, setShowReportsSidebar] = useState(true);

  // Synchronize reports sidebar visibility when navigating to /reports
  useEffect(() => {
    if (location.pathname.startsWith("/reports")) {
      setShowReportsSidebar(true);
    } else {
      setShowReportsSidebar(false);
    }
  }, [location.pathname]);

  const toggleCategory = useCallback((cat: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }, []);

  const handleBackToMainMenu = useCallback(() => {
    setShowReportsSidebar(false);
  }, []);

  const handleOpenReportsMenu = useCallback(() => {
    setShowReportsSidebar(true);
  }, []);

  const filteredTree = React.useMemo(() => {
    if (!sidebarFilterSearch.trim()) return REPORT_TREE;
    return REPORT_TREE.map((grp) => ({
      ...grp,
      items: grp.items.filter((it) =>
        it.name.toLowerCase().includes(sidebarFilterSearch.toLowerCase())
      ),
    })).filter((grp) => grp.items.length > 0);
  }, [sidebarFilterSearch]);

  return (
    <ReportsContext.Provider
      value={{
        activeCategory,
        setActiveCategory,
        selectedReportId,
        setSelectedReportId,
        collapsedCategories,
        toggleCategory,
        sidebarFilterSearch,
        setSidebarFilterSearch,
        showReportsSidebar,
        setShowReportsSidebar,
        handleBackToMainMenu,
        handleOpenReportsMenu,
        filteredTree,
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports() {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error("useReports must be used within a ReportsProvider");
  }
  return context;
}
