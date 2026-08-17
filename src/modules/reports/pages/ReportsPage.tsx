import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  Search,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  ChevronRight,
  ChevronDown,
  Building2,
  DollarSign,
  TrendingUp,
  CreditCard,
  Wallet,
  Users,
  BedDouble,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  X,
  Plus,
  Minus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getRevenueReport,
  getCollectionsReport,
  getBillRegisterReport,
  getAtdCensusReport,
  getOutstandingReport,
  getRefundsCreditReport,
  RevenueReportData,
  CollectionsReportData,
  BillRegisterReportData,
  AtdCensusReportData,
  OutstandingReportData,
  RefundsCreditReportData
} from "@/api/reportsApi";

// ─── REPORT TREE STRUCTURE ───────────────────────────────────────────────────
interface ReportTreeItem {
  id: string;
  name: string;
  category: "Registration" | "ATD" | "Billing";
  description: string;
}

interface ReportCategoryGroup {
  category: "Registration" | "ATD" | "Billing";
  icon: any;
  items: ReportTreeItem[];
}

const REPORT_TREE: ReportCategoryGroup[] = [
  {
    category: "Registration",
    icon: Users,
    items: [
      { id: "Registration List", name: "Registration List", category: "Registration", description: "Comprehensive list of registered outpatients and inpatients" },
      { id: "Registration Report", name: "Registration Report", category: "Registration", description: "Daily & monthly patient registration volume analysis" },
    ],
  },
  {
    category: "ATD",
    icon: Building2,
    items: [
      { id: "Admission Form", name: "Admission Form", category: "ATD", description: "IP admission summaries, demographic intake and initial orders" },
      { id: "Admission Report", name: "Admission Report", category: "ATD", description: "Inpatient admission census, doctor and ward distributions" },
      { id: "Patient Transfer", name: "Patient Transfer", category: "ATD", description: "Bed and ward transfer logs with timestamps and reasons" },
      { id: "Admitted List As On Date", name: "Admitted List As On Date", category: "ATD", description: "Live active in-hospital census as of selected date" },
      { id: "Discharge Report", name: "Discharge Report", category: "ATD", description: "Discharged patient statistics, average length of stay" },
      { id: "Bed Occupancy Details", name: "Bed Occupancy Details", category: "ATD", description: "Ward-wise bed utilization, vacancy and occupancy rates" },
    ],
  },
  {
    category: "Billing",
    icon: DollarSign,
    items: [
      { id: "Cash Collection", name: "Cash Collection", category: "Billing", description: "Daily counter receipts breakdown by cash, card, UPI and cheque" },
      { id: "Credit Collection", name: "Credit Collection", category: "Billing", description: "Insurance, TPA and corporate company settlement receipts" },
      { id: "OP Visit", name: "OP Visit", category: "Billing", description: "Outpatient consultations, doctor fees and department traffic" },
      { id: "Bill Register", name: "Bill Register", category: "Billing", description: "Master invoice log for all OP and IP bills with settlement status" },
      { id: "Deposit Exhaust", name: "Deposit Exhaust", category: "Billing", description: "Advance deposit consumption against active inpatient bills" },
      { id: "InvestigationWise Census", name: "InvestigationWise Census", category: "Billing", description: "Lab, Radiology and Diagnostics service utilization counts" },
      { id: "Outstanding", name: "Outstanding", category: "Billing", description: "Aging ledger of unpaid balances from patients and payers" },
      { id: "Discharge Without Billing", name: "Discharge Without Billing", category: "Billing", description: "Discharged patients with unsettled final bills" },
      { id: "Discount Report", name: "Discount Report", category: "Billing", description: "Authorized billing waivers, concessions and courtesy discounts" },
      { id: "Revenue", name: "Revenue", category: "Billing", description: "Consolidated hospital gross, net revenue by department/doctor" },
      { id: "IP TAT", name: "IP TAT", category: "Billing", description: "Inpatient billing turnaround time from discharge order to final bill" },
      { id: "Bill Cancelled", name: "Bill Cancelled", category: "Billing", description: "Cancelled invoice audit trail with authorization reasons" },
      { id: "Refund", name: "Refund", category: "Billing", description: "Patient deposit and excess payment refund disbursement log" },
      { id: "Credit Note Report", name: "Credit Note Report", category: "Billing", description: "Credit notes issued with authorized reasons and adjustments" },
      { id: "Advance Collection Reports", name: "Advance Collection Reports", category: "Billing", description: "Patient advance receipts, adjusted balances and deposits" },
    ],
  },
];

export default function ReportsPage() {
  // ─── Navigation State ────────────────────────────────────────────────────────
  const [activeCategory, setActiveCategory] = useState<"Registration" | "ATD" | "Billing">("Billing");
  const [selectedReportId, setSelectedReportId] = useState<string>("Revenue");
  const [collapsedCategories, setCollapsedCategories] = useState<{ [key: string]: boolean }>({
    Registration: false,
    ATD: false,
    Billing: false,
  });
  const [sidebarFilterSearch, setSidebarFilterSearch] = useState("");

  // ─── Filter Parameters State ─────────────────────────────────────────────────
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [location, setLocation] = useState<string>("-- ALL --");
  const [isExportChecked, setIsExportChecked] = useState(false);
  const [isCompanyWiseChecked, setIsCompanyWiseChecked] = useState(false);
  const [tableSearchTerm, setTableSearchTerm] = useState("");

  // Dynamic Radio Grouping based on Report
  const [groupByDimension, setGroupByDimension] = useState<string>("Department");

  // ─── Live Report Data State ──────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [revenueData, setRevenueData] = useState<RevenueReportData | null>(null);
  const [collectionsData, setCollectionsData] = useState<CollectionsReportData | null>(null);
  const [billRegisterData, setBillRegisterData] = useState<BillRegisterReportData | null>(null);
  const [atdCensusData, setAtdCensusData] = useState<AtdCensusReportData | null>(null);
  const [outstandingData, setOutstandingData] = useState<OutstandingReportData | null>(null);
  const [refundsCreditData, setRefundsCreditData] = useState<RefundsCreditReportData | null>(null);

  // ─── Print Modal State ───────────────────────────────────────────────────────
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Toggle Category Collapsing in Sidebar
  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  // ─── FETCH REPORT FROM API ───────────────────────────────────────────────────
  const fetchReportData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (selectedReportId === "Revenue" || selectedReportId === "Discount Report" || selectedReportId === "IP TAT") {
        const data = await getRevenueReport({
          fromDate,
          toDate,
          location,
          groupBy: groupByDimension,
          companyWise: isCompanyWiseChecked,
        });
        setRevenueData(data);
      } else if (
        selectedReportId === "Cash Collection" ||
        selectedReportId === "Credit Collection" ||
        selectedReportId === "Advance Collection Reports"
      ) {
        const mode = selectedReportId === "Cash Collection" ? "Cash" : selectedReportId === "Credit Collection" ? "CreditNote" : "all";
        const data = await getCollectionsReport({
          fromDate,
          toDate,
          mode,
          groupBy: groupByDimension,
        });
        setCollectionsData(data);
      } else if (
        selectedReportId === "Bill Register" ||
        selectedReportId === "Bill Cancelled" ||
        selectedReportId === "OP Visit" ||
        selectedReportId === "InvestigationWise Census" ||
        selectedReportId === "Discharge Without Billing"
      ) {
        const status = selectedReportId === "Bill Cancelled" ? "Cancelled" : "all";
        const type = selectedReportId === "OP Visit" ? "OP" : "Both";
        const data = await getBillRegisterReport({
          fromDate,
          toDate,
          type,
          status,
        });
        setBillRegisterData(data);
      } else if (
        selectedReportId === "Admission Report" ||
        selectedReportId === "Admission Form" ||
        selectedReportId === "Patient Transfer" ||
        selectedReportId === "Admitted List As On Date" ||
        selectedReportId === "Discharge Report" ||
        selectedReportId === "Bed Occupancy Details" ||
        selectedReportId === "Registration List" ||
        selectedReportId === "Registration Report"
      ) {
        const status =
          selectedReportId === "Discharge Report"
            ? "Discharged"
            : selectedReportId === "Admitted List As On Date"
            ? "Open"
            : "all";
        const data = await getAtdCensusReport({
          fromDate,
          toDate,
          status,
        });
        setAtdCensusData(data);
      } else if (selectedReportId === "Outstanding" || selectedReportId === "Deposit Exhaust") {
        const data = await getOutstandingReport({ fromDate, toDate });
        setOutstandingData(data);
      } else if (selectedReportId === "Refund" || selectedReportId === "Credit Note Report") {
        const data = await getRefundsCreditReport();
        setRefundsCreditData(data);
      }
    } catch (err) {
      console.error("Failed to generate report from API:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedReportId, fromDate, toDate, location, groupByDimension, isCompanyWiseChecked]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Set default group dimension when report changes
  useEffect(() => {
    if (selectedReportId === "Revenue") setGroupByDimension("Department");
    else if (selectedReportId === "Cash Collection") setGroupByDimension("Payment Mode");
    else if (selectedReportId === "Bill Register") setGroupByDimension("Department");
    else if (selectedReportId === "Admission Report") setGroupByDimension("Ward");
  }, [selectedReportId]);

  // Filter tree items by search
  const filteredTree = useMemo(() => {
    if (!sidebarFilterSearch.trim()) return REPORT_TREE;
    return REPORT_TREE.map((grp) => ({
      ...grp,
      items: grp.items.filter((it) =>
        it.name.toLowerCase().includes(sidebarFilterSearch.toLowerCase())
      ),
    })).filter((grp) => grp.items.length > 0);
  }, [sidebarFilterSearch]);

  // Export to CSV
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `Report Name: ${selectedReportId}\r\n`;
    csvContent += `Generated On: ${new Date().toLocaleString()}\r\n`;
    csvContent += `From: ${fromDate} To: ${toDate}\r\n\r\n`;

    if (revenueData && selectedReportId === "Revenue") {
      csvContent += "Dimension,Bills,Gross Amt,Discount Amt,Net Amt,Collected Amt,Outstanding Amt\r\n";
      revenueData.data.forEach((row) => {
        csvContent += `"${row.name}",${row.billCount},${row.grossAmt},${row.discountAmt},${row.netAmt},${row.collectedAmt},${row.outstandingAmt}\r\n`;
      });
    } else if (collectionsData) {
      csvContent += "Payment Mode / Category,Transactions,Total Amount,Cash,Card,UPI,Other\r\n";
      collectionsData.data.forEach((row) => {
        csvContent += `"${row.name}",${row.count},${row.amount},${row.cashAmt},${row.cardAmt},${row.upiAmt},${row.otherAmt}\r\n`;
      });
    } else if (billRegisterData) {
      csvContent += "Invoice No,Date,UHID,Patient Name,Type,Company,Gross,Discount,Net,Balance,Status\r\n";
      billRegisterData.invoices.forEach((inv) => {
        csvContent += `"${inv.invoiceNo}","${inv.date}","${inv.uhid}","${inv.patientName}","${inv.type}","${inv.company}",${inv.grossAmt},${inv.discountAmt},${inv.netAmt},${inv.balance},"${inv.status}"\r\n`;
      });
    } else if (atdCensusData) {
      csvContent += "UHID,IP No,Patient Name,Gender/Age,Bed No,Doctor,Status,Company,Date\r\n";
      atdCensusData.patients.forEach((p) => {
        csvContent += `"${p.uhid}","${p.ipNo}","${p.name}","${p.genderAge}","${p.bedNo}","${p.doctor}","${p.status}","${p.company}","${p.regDate}"\r\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedReportId.replace(/\s+/g, "_")}_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-[calc(100vh-56px)] bg-slate-100 overflow-hidden font-sans text-slate-800">
      
      {/* ─── LEFT REPORTS TREE SIDEBAR (MATCHING SCREENSHOT) ────────────────── */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 text-slate-300 select-none">
        
        {/* Sidebar Header */}
        <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-400" />
            <span className="font-extrabold text-xs text-white uppercase tracking-wider">Reports Center</span>
          </div>
          <Badge variant="outline" className="bg-blue-900/40 text-blue-300 border-blue-700/50 text-[10px] h-5 font-mono">
            v50.24
          </Badge>
        </div>

        {/* Quick Search inside Sidebar */}
        <div className="p-2 border-b border-slate-800/80 bg-slate-900/50">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search reports..."
              value={sidebarFilterSearch}
              onChange={(e) => setSidebarFilterSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-md pl-8 pr-2 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Tree Menu List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
          {filteredTree.map((group) => {
            const isCollapsed = collapsedCategories[group.category];
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
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-bold transition-colors ${
                    isCategoryActive
                      ? "bg-blue-950/60 text-blue-300"
                      : "hover:bg-slate-800/60 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 font-black">
                      {isCollapsed ? "+" : "−"}
                    </span>
                    <Icon className={`h-3.5 w-3.5 ${isCategoryActive ? "text-blue-400" : "text-slate-400"}`} />
                    <span>{group.category}</span>
                  </div>
                  <Badge className="bg-slate-800 text-[10px] text-slate-400 border-none px-1.5 h-4">
                    {group.items.length}
                  </Badge>
                </button>

                {/* Tree Items */}
                {!isCollapsed && (
                  <div className="pl-4 ml-2 border-l border-slate-800 space-y-0.5 mt-0.5">
                    {group.items.map((item) => {
                      const isSelected = selectedReportId === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSelectedReportId(item.id);
                            setActiveCategory(item.category);
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left text-xs font-medium transition-all ${
                            isSelected
                              ? "bg-blue-600 text-white font-bold shadow-xs translate-x-1"
                              : "hover:bg-slate-800/40 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <span className="truncate pr-1">• {item.name}</span>
                          {isSelected && <ChevronRight className="h-3 w-3 text-white flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar Bottom Domain Module Switcher */}
        <div className="p-2 border-t border-slate-800 bg-slate-950/70 space-y-1">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-2 py-1">
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
                className={`px-2 py-1.5 rounded text-[11px] font-bold text-center transition-colors truncate ${
                  activeCategory === cat
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── MAIN REPORT VIEW & PARAMETER PANEL ─────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        
        {/* Top Session / Hospital Info Header Bar (Exact match to screenshot) */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white px-4 py-2 flex items-center justify-between text-xs border-b border-blue-950 shadow-2xs flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-blue-200 tracking-wide">CMK CareSuite Reporting Portal</span>
            <span className="text-slate-300 text-[11px]">
              Welcome! <strong className="text-white">Dr. Admin</strong> — CMK HEALTHCARE PVT. LTD. (17/08/2026 16:05)
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-blue-200 font-mono">
            <span>IP: 49.36.179.105</span>
            <span>Server: DBSERVER-01</span>
            <span className="bg-blue-950/60 px-2 py-0.5 rounded text-emerald-400 font-bold">ONLINE</span>
          </div>
        </div>

        {/* Top Domain Switcher Tabs */}
        <div className="bg-white border-b border-slate-200 px-4 pt-2 flex items-center gap-2 flex-shrink-0 shadow-2xs">
          {(["Registration", "ATD", "Billing"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                const firstItem = REPORT_TREE.find((g) => g.category === cat)?.items[0];
                if (firstItem) setSelectedReportId(firstItem.id);
              }}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeCategory === cat
                  ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-md"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {cat === "Registration" && <Users className="h-3.5 w-3.5" />}
              {cat === "ATD" && <Building2 className="h-3.5 w-3.5" />}
              {cat === "Billing" && <DollarSign className="h-3.5 w-3.5" />}
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* Parameter & Filter Box (Matching Screenshot) */}
        <div className="p-4 bg-white border-b border-slate-200 shadow-2xs flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-800">{selectedReportId}</h1>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[11px] font-bold">
                {activeCategory} Report
              </Badge>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportCSV}
                className="h-8 gap-1.5 text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border-slate-300 shadow-2xs"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                Export CSV
              </Button>

              <Button
                size="sm"
                onClick={() => setIsPrintModalOpen(true)}
                className="h-8 gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white shadow-2xs"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Report
              </Button>

              <Button
                size="sm"
                onClick={fetchReportData}
                disabled={isLoading}
                className="h-8 gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                Generate
              </Button>
            </div>
          </div>

          {/* Form Criteria Inputs Row (Exact match to screenshot) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-medium">
            
            {/* Date Pickers */}
            <div className="lg:col-span-4 flex items-center gap-2">
              <div className="flex items-center gap-1.5 flex-1">
                <Label className="text-[11px] font-bold text-slate-600 whitespace-nowrap">From Date:</Label>
                <div className="relative flex-1">
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="h-7 text-xs bg-white border-slate-300 px-2 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-1">
                <Label className="text-[11px] font-bold text-slate-600 whitespace-nowrap">To Date:</Label>
                <div className="relative flex-1">
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="h-7 text-xs bg-white border-slate-300 px-2 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Location Selector */}
            <div className="lg:col-span-3 flex items-center gap-2">
              <Label className="text-[11px] font-bold text-slate-600 whitespace-nowrap">Location:</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="h-7 text-xs flex-1 bg-white border-slate-300">
                  <SelectValue placeholder="-- ALL --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-- ALL --">-- ALL --</SelectItem>
                  <SelectItem value="CMK HEALTHCARE PVT. LTD.">CMK HEALTHCARE PVT. LTD.</SelectItem>
                  <SelectItem value="Main OPD Wing">Main OPD Wing</SelectItem>
                  <SelectItem value="Inpatient Ward Floor 2">Inpatient Ward Floor 2</SelectItem>
                  <SelectItem value="Emergency Block">Emergency Block</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Checkboxes */}
            <div className="lg:col-span-5 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-bold">
                  <input
                    type="checkbox"
                    checked={isExportChecked}
                    onChange={(e) => setIsExportChecked(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                  />
                  <span>Export</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-bold">
                  <input
                    type="checkbox"
                    checked={isCompanyWiseChecked}
                    onChange={(e) => setIsCompanyWiseChecked(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                  />
                  <span>Company Wise</span>
                </label>
              </div>

              {/* Date Presets */}
              <div className="flex items-center gap-1">
                {[
                  { label: "Today", days: 0 },
                  { label: "7D", days: 7 },
                  { label: "30D", days: 30 },
                  { label: "This Month", days: "month" },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      const end = new Date();
                      let start = new Date();
                      if (preset.days === "month") {
                        start = new Date(end.getFullYear(), end.getMonth(), 1);
                      } else {
                        start.setDate(end.getDate() - (preset.days as number));
                      }
                      setFromDate(start.toISOString().split("T")[0]);
                      setToDate(end.toISOString().split("T")[0]);
                    }}
                    className="px-2 py-0.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[10px] font-bold text-slate-600"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grouping / Dimension Radio Options (Matching Screenshot) */}
            <div className="lg:col-span-12 pt-2 border-t border-slate-200/80 flex items-center gap-6 flex-wrap">
              <span className="text-slate-500 font-bold text-[11px]">Dimension Breakdown:</span>
              
              {selectedReportId === "Revenue" && (
                <div className="flex items-center gap-4">
                  {["Department", "Doctor", "Speciality", "Bed Category", "Ward/Floor"].map((dim) => (
                    <label key={dim} className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="radio"
                        name="revenue_dim"
                        value={dim}
                        checked={groupByDimension === dim}
                        onChange={() => setGroupByDimension(dim)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>{dim}</span>
                    </label>
                  ))}
                </div>
              )}

              {selectedReportId === "Cash Collection" && (
                <div className="flex items-center gap-4">
                  {["Payment Mode", "Cashier", "Department", "Shift"].map((dim) => (
                    <label key={dim} className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="radio"
                        name="coll_dim"
                        value={dim}
                        checked={groupByDimension === dim}
                        onChange={() => setGroupByDimension(dim)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>{dim}</span>
                    </label>
                  ))}
                </div>
              )}

              {selectedReportId === "Bill Register" && (
                <div className="flex items-center gap-4">
                  {["Department", "Doctor", "Company", "Type"].map((dim) => (
                    <label key={dim} className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="radio"
                        name="reg_dim"
                        value={dim}
                        checked={groupByDimension === dim}
                        onChange={() => setGroupByDimension(dim)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>{dim}</span>
                    </label>
                  ))}
                </div>
              )}

              {selectedReportId === "Admission Report" && (
                <div className="flex items-center gap-4">
                  {["Ward", "Doctor", "Payer", "Bed Category"].map((dim) => (
                    <label key={dim} className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="radio"
                        name="adm_dim"
                        value={dim}
                        checked={groupByDimension === dim}
                        onChange={() => setGroupByDimension(dim)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>{dim}</span>
                    </label>
                  ))}
                </div>
              )}

              {selectedReportId !== "Revenue" &&
                selectedReportId !== "Cash Collection" &&
                selectedReportId !== "Bill Register" &&
                selectedReportId !== "Admission Report" && (
                  <div className="flex items-center gap-4">
                    {["Standard Summary", "Detailed Audit", "Doctor Wise"].map((dim) => (
                      <label key={dim} className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700">
                        <input
                          type="radio"
                          name="gen_dim"
                          value={dim}
                          checked={groupByDimension === dim}
                          onChange={() => setGroupByDimension(dim)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span>{dim}</span>
                      </label>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* ─── LIVE REPORT CONTENT & DATA GRID ──────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Dynamic Table Card */}
          <Card className="bg-white border-slate-200 shadow-2xs overflow-hidden">
            <CardHeader className="p-3 border-b border-slate-100 bg-slate-50/70 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xs font-black text-slate-800 uppercase tracking-wide">
                  {selectedReportId} — Grouped by {groupByDimension}
                </CardTitle>
                <Badge variant="outline" className="bg-white text-slate-600 text-[10px] font-mono">
                  {fromDate} to {toDate}
                </Badge>
              </div>

              {/* In-table Search */}
              <div className="relative w-56">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Filter table rows..."
                  value={tableSearchTerm}
                  onChange={(e) => setTableSearchTerm(e.target.value)}
                  className="h-7 text-xs pl-8 pr-2 bg-white border-slate-300"
                />
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[500px]">
                
                {/* ─── 1. REVENUE REPORT TABLE ───────────────────────────────── */}
                {selectedReportId === "Revenue" && revenueData && (
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold sticky top-0 z-10 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2.5">Dimension / Group ({groupByDimension})</th>
                        <th className="px-3 py-2.5 text-center">Bills Count</th>
                        <th className="px-3 py-2.5 text-right">Gross Amount</th>
                        <th className="px-3 py-2.5 text-right">Discounts</th>
                        <th className="px-3 py-2.5 text-right">Net Revenue</th>
                        <th className="px-3 py-2.5 text-right">Settled / Collected</th>
                        <th className="px-3 py-2.5 text-right">Outstanding</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {revenueData.data
                        .filter((r) => r.name.toLowerCase().includes(tableSearchTerm.toLowerCase()))
                        .map((row, idx) => (
                          <tr key={idx} className="hover:bg-blue-50/40">
                            <td className="px-4 py-2.5 font-bold text-slate-800 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                              {row.name}
                            </td>
                            <td className="px-3 py-2.5 text-center font-mono font-bold text-blue-600">{row.billCount}</td>
                            <td className="px-3 py-2.5 text-right font-mono">₹{row.grossAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                            <td className="px-3 py-2.5 text-right font-mono text-amber-600">₹{row.discountAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                            <td className="px-3 py-2.5 text-right font-mono font-bold text-blue-700">₹{row.netAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                            <td className="px-3 py-2.5 text-right font-mono text-emerald-600 font-bold">₹{row.collectedAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                            <td className="px-3 py-2.5 text-right font-mono text-rose-600 font-bold">₹{row.outstandingAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300 sticky bottom-0">
                      <tr>
                        <td className="px-4 py-2.5 uppercase">TOTAL</td>
                        <td className="px-3 py-2.5 text-center font-mono">{revenueData.summary.totalBills}</td>
                        <td className="px-3 py-2.5 text-right font-mono">₹{revenueData.summary.totalGross.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-amber-700">₹{revenueData.summary.totalDiscount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-blue-700">₹{revenueData.summary.totalNet.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-emerald-700">₹{revenueData.summary.totalCollected.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-rose-700">₹{revenueData.summary.totalOutstanding.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </tfoot>
                  </table>
                )}

                {/* ─── 2. COLLECTIONS & CASHBOOK REPORT TABLE ─────────────────── */}
                {(selectedReportId === "Cash Collection" || selectedReportId === "Credit Collection" || selectedReportId === "Advance Collection Reports") && collectionsData && (
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold sticky top-0 z-10 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2.5">Category / Payment Mode</th>
                        <th className="px-3 py-2.5 text-center">Receipts Count</th>
                        <th className="px-3 py-2.5 text-right">Cash Share</th>
                        <th className="px-3 py-2.5 text-right">Card Share</th>
                        <th className="px-3 py-2.5 text-right">UPI Share</th>
                        <th className="px-3 py-2.5 text-right">Other / Cheque</th>
                        <th className="px-3 py-2.5 text-right">Total Collection</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {collectionsData.data
                        .filter((r) => r.name.toLowerCase().includes(tableSearchTerm.toLowerCase()))
                        .map((row, idx) => (
                          <tr key={idx} className="hover:bg-blue-50/40">
                            <td className="px-4 py-2.5 font-bold text-slate-800 flex items-center gap-2">
                              <Wallet className="h-3.5 w-3.5 text-blue-500" />
                              {row.name}
                            </td>
                            <td className="px-3 py-2.5 text-center font-mono font-bold">{row.count}</td>
                            <td className="px-3 py-2.5 text-right font-mono">₹{row.cashAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                            <td className="px-3 py-2.5 text-right font-mono">₹{row.cardAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                            <td className="px-3 py-2.5 text-right font-mono">₹{row.upiAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                            <td className="px-3 py-2.5 text-right font-mono">₹{row.otherAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                            <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-600">₹{row.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300 sticky bottom-0">
                      <tr>
                        <td className="px-4 py-2.5 uppercase">TOTAL COLLECTIONS</td>
                        <td className="px-3 py-2.5 text-center font-mono">{collectionsData.totalTransactions}</td>
                        <td className="px-3 py-2.5 text-right font-mono">₹{collectionsData.data.reduce((s, r) => s + r.cashAmt, 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2.5 text-right font-mono">₹{collectionsData.data.reduce((s, r) => s + r.cardAmt, 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2.5 text-right font-mono">₹{collectionsData.data.reduce((s, r) => s + r.upiAmt, 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2.5 text-right font-mono">₹{collectionsData.data.reduce((s, r) => s + r.otherAmt, 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-emerald-700">₹{collectionsData.totalCollection.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </tfoot>
                  </table>
                )}

                {/* ─── 3. BILL REGISTER REPORT TABLE ─────────────────────────── */}
                {(selectedReportId === "Bill Register" || selectedReportId === "Bill Cancelled" || selectedReportId === "OP Visit" || selectedReportId === "InvestigationWise Census" || selectedReportId === "Discharge Without Billing") && billRegisterData && (
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold sticky top-0 z-10 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2.5">Invoice #</th>
                        <th className="px-3 py-2.5">Date</th>
                        <th className="px-3 py-2.5">UHID</th>
                        <th className="px-3 py-2.5">Patient Name</th>
                        <th className="px-3 py-2.5">Type</th>
                        <th className="px-3 py-2.5">Doctor</th>
                        <th className="px-3 py-2.5">Company</th>
                        <th className="px-3 py-2.5 text-right">Net Amount</th>
                        <th className="px-3 py-2.5 text-right">Balance</th>
                        <th className="px-3 py-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {billRegisterData.invoices
                        .filter(
                          (inv) =>
                            inv.invoiceNo.toLowerCase().includes(tableSearchTerm.toLowerCase()) ||
                            inv.patientName.toLowerCase().includes(tableSearchTerm.toLowerCase()) ||
                            inv.uhid.toLowerCase().includes(tableSearchTerm.toLowerCase())
                        )
                        .map((inv, idx) => (
                          <tr key={idx} className="hover:bg-blue-50/40">
                            <td className="px-4 py-2.5 font-mono font-bold text-blue-600">{inv.invoiceNo}</td>
                            <td className="px-3 py-2.5 text-slate-500 font-mono">{new Date(inv.date).toLocaleDateString("en-GB")}</td>
                            <td className="px-3 py-2.5 font-mono font-semibold text-slate-800">{inv.uhid}</td>
                            <td className="px-3 py-2.5 font-bold text-slate-800">{inv.patientName}</td>
                            <td className="px-3 py-2.5">
                              <Badge variant="outline" className={`text-[10px] font-bold ${inv.type === "IP" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
                                {inv.type}
                              </Badge>
                            </td>
                            <td className="px-3 py-2.5 text-slate-600">{inv.doctorName}</td>
                            <td className="px-3 py-2.5 text-slate-600">{inv.company}</td>
                            <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900">₹{inv.netAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                            <td className="px-3 py-2.5 text-right font-mono font-bold text-rose-600">₹{inv.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                            <td className="px-3 py-2.5 text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${inv.status === "Settled" ? "bg-emerald-100 text-emerald-800" : inv.status === "Cancelled" ? "bg-slate-200 text-slate-700" : "bg-rose-100 text-rose-800"}`}>
                                {inv.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}

                {/* ─── 4. ATD & REGISTRATION CENSUS TABLE ─────────────────────── */}
                {(selectedReportId === "Admission Report" || selectedReportId === "Admission Form" || selectedReportId === "Patient Transfer" || selectedReportId === "Admitted List As On Date" || selectedReportId === "Discharge Report" || selectedReportId === "Bed Occupancy Details" || selectedReportId === "Registration List" || selectedReportId === "Registration Report") && atdCensusData && (
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold sticky top-0 z-10 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2.5">UHID</th>
                        <th className="px-3 py-2.5">IP / Visit No</th>
                        <th className="px-3 py-2.5">Patient Name</th>
                        <th className="px-3 py-2.5">Gender / Age</th>
                        <th className="px-3 py-2.5">Bed / Room</th>
                        <th className="px-3 py-2.5">Attending Doctor</th>
                        <th className="px-3 py-2.5">Company / Payer</th>
                        <th className="px-3 py-2.5">Date</th>
                        <th className="px-3 py-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {atdCensusData.patients
                        .filter(
                          (p) =>
                            p.name.toLowerCase().includes(tableSearchTerm.toLowerCase()) ||
                            p.uhid.toLowerCase().includes(tableSearchTerm.toLowerCase())
                        )
                        .map((p, idx) => (
                          <tr key={idx} className="hover:bg-blue-50/40">
                            <td className="px-4 py-2.5 font-mono font-bold text-blue-600">{p.uhid}</td>
                            <td className="px-3 py-2.5 font-mono text-slate-600">{p.ipNo}</td>
                            <td className="px-3 py-2.5 font-bold text-slate-800">{p.name}</td>
                            <td className="px-3 py-2.5 text-slate-500">{p.genderAge}</td>
                            <td className="px-3 py-2.5 font-semibold text-slate-700">{p.bedNo}</td>
                            <td className="px-3 py-2.5 text-slate-700 font-semibold">{p.doctor}</td>
                            <td className="px-3 py-2.5 text-slate-600">{p.company}</td>
                            <td className="px-3 py-2.5 font-mono text-slate-500">{new Date(p.regDate).toLocaleDateString("en-GB")}</td>
                            <td className="px-3 py-2.5 text-center">
                              <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}

                {/* ─── 5. OUTSTANDING AGING TABLE ────────────────────────────── */}
                {(selectedReportId === "Outstanding" || selectedReportId === "Deposit Exhaust") && outstandingData && (
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold sticky top-0 z-10 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2.5">Aging Bucket</th>
                        <th className="px-3 py-2.5 text-center">Invoices Count</th>
                        <th className="px-3 py-2.5 text-right">Outstanding Amount</th>
                        <th className="px-3 py-2.5 text-right">Share (%)</th>
                        <th className="px-3 py-2.5 text-center">Risk Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {outstandingData.buckets.map((b, idx) => {
                        const pct = outstandingData.totalOutstanding > 0 ? ((b.amount / outstandingData.totalOutstanding) * 100).toFixed(1) : 0;
                        return (
                          <tr key={idx} className="hover:bg-blue-50/40">
                            <td className="px-4 py-2.5 font-bold text-slate-800">{b.range}</td>
                            <td className="px-3 py-2.5 text-center font-mono font-bold">{b.count}</td>
                            <td className="px-3 py-2.5 text-right font-mono font-bold text-rose-600">₹{b.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                            <td className="px-3 py-2.5 text-right font-mono font-bold">{pct}%</td>
                            <td className="px-3 py-2.5 text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${b.range === "90+ Days" ? "bg-rose-100 text-rose-800" : b.range === "61-90 Days" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>
                                {b.range === "90+ Days" ? "High Risk" : b.range === "61-90 Days" ? "Medium" : "Normal"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300 sticky bottom-0">
                      <tr>
                        <td className="px-4 py-2.5 uppercase">TOTAL RECEIVABLE</td>
                        <td className="px-3 py-2.5 text-center font-mono">{outstandingData.totalPendingInvoices}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-rose-700">₹{outstandingData.totalOutstanding.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2.5 text-right font-mono">100.0%</td>
                        <td className="px-3 py-2.5 text-center font-mono">-</td>
                      </tr>
                    </tfoot>
                  </table>
                )}

              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── PRINT PREVIEW MODAL (OFFICIAL HOSPITAL LETTERHEAD) ─────────────── */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header Actions */}
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="h-4 w-4 text-blue-400" />
                <span className="font-bold text-sm">Print Preview — {selectedReportId} Report</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => window.print()}
                  className="h-8 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-1"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print Now
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Printable Report Document */}
            <div className="p-8 overflow-y-auto font-serif text-slate-900 bg-white space-y-6">
              
              {/* Hospital Header */}
              <div className="border-b-2 border-slate-900 pb-4 text-center">
                <h1 className="text-2xl font-black tracking-wide text-slate-900 uppercase">
                  CMK HEALTHCARE PVT. LTD.
                </h1>
                <p className="text-xs font-sans text-slate-600 mt-0.5">
                  Plot No. 12-A, Institutional Area, Sector 62, New Delhi, Delhi 110092
                </p>
                <p className="text-xs font-sans text-slate-500">
                  NABH & NABL Accredited | GSTIN: 07AAAAC1234F1Z8 | Tel: +91 11 4988 5000
                </p>
              </div>

              {/* Report Metadata */}
              <div className="flex items-center justify-between text-xs font-sans border-b border-slate-200 pb-2">
                <div>
                  <h2 className="text-sm font-bold uppercase text-slate-800">{selectedReportId} Analysis Report</h2>
                  <p className="text-slate-500">Breakdown: <strong>{groupByDimension}</strong> | Location: <strong>{location}</strong></p>
                </div>
                <div className="text-right text-slate-600">
                  <p>Period: <strong>{fromDate}</strong> to <strong>{toDate}</strong></p>
                  <p>Generated: <strong>{new Date().toLocaleString()}</strong></p>
                </div>
              </div>

              {/* Data Table Printout */}
              <table className="w-full text-xs font-sans border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="border border-slate-300 p-2 text-left">Group / Dimension</th>
                    <th className="border border-slate-300 p-2 text-center">Count</th>
                    <th className="border border-slate-300 p-2 text-right">Gross (₹)</th>
                    <th className="border border-slate-300 p-2 text-right">Discount (₹)</th>
                    <th className="border border-slate-300 p-2 text-right">Net Revenue (₹)</th>
                    <th className="border border-slate-300 p-2 text-right">Outstanding (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData?.data.map((row, i) => (
                    <tr key={i} className="border-b border-slate-200">
                      <td className="border border-slate-300 p-2 font-bold">{row.name}</td>
                      <td className="border border-slate-300 p-2 text-center">{row.billCount}</td>
                      <td className="border border-slate-300 p-2 text-right font-mono">{row.grossAmt.toFixed(2)}</td>
                      <td className="border border-slate-300 p-2 text-right font-mono">{row.discountAmt.toFixed(2)}</td>
                      <td className="border border-slate-300 p-2 text-right font-mono font-bold">{row.netAmt.toFixed(2)}</td>
                      <td className="border border-slate-300 p-2 text-right font-mono text-rose-600">{row.outstandingAmt.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                    <td className="border border-slate-300 p-2 uppercase">TOTAL HOSPITAL SUMMARY</td>
                    <td className="border border-slate-300 p-2 text-center">{revenueData?.summary.totalBills || 0}</td>
                    <td className="border border-slate-300 p-2 text-right font-mono">{revenueData?.summary.totalGross.toFixed(2) || "0.00"}</td>
                    <td className="border border-slate-300 p-2 text-right font-mono">{revenueData?.summary.totalDiscount.toFixed(2) || "0.00"}</td>
                    <td className="border border-slate-300 p-2 text-right font-mono">{revenueData?.summary.totalNet.toFixed(2) || "0.00"}</td>
                    <td className="border border-slate-300 p-2 text-right font-mono">{revenueData?.summary.totalOutstanding.toFixed(2) || "0.00"}</td>
                  </tr>
                </tfoot>
              </table>

              {/* Signatures */}
              <div className="pt-12 flex items-center justify-between text-xs font-sans">
                <div className="text-center">
                  <div className="w-40 border-b border-slate-400 mb-1"></div>
                  <p className="font-bold">Prepared By</p>
                  <p className="text-slate-500">Billing Executive</p>
                </div>
                <div className="text-center">
                  <div className="w-40 border-b border-slate-400 mb-1"></div>
                  <p className="font-bold">Verified By</p>
                  <p className="text-slate-500">Accounts Manager</p>
                </div>
                <div className="text-center">
                  <div className="w-40 border-b border-slate-400 mb-1"></div>
                  <p className="font-bold">Authorized Signatory</p>
                  <p className="text-slate-500">Medical Superintendent</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
