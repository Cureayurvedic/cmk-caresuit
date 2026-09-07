import React, { useState, useEffect, useCallback } from "react";
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
  Minus,
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
  RefundsCreditReportData,
} from "@/api/reportsApi";
import { getSettingsItems } from "@/api/settingsApi";
import { useBranch } from "@/contexts/BranchContext";
import { useReports, REPORT_TREE } from "@/contexts/ReportsContext";

export default function ReportsPage() {
  // ─── Navigation Context ──────────────────────────────────────────────────────
  const {
    activeCategory,
    setActiveCategory,
    selectedReportId,
    setSelectedReportId,
  } = useReports();

  // ─── Filter Parameters State ─────────────────────────────────────────────────
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1); // 1-day duration (Yesterday to Today)
    return d.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState<string>(
    () => new Date().toISOString().split("T")[0],
  );
  const { activeBranch } = useBranch();
  const [location, setLocation] = useState<string>(() => activeBranch || "-- ALL --");
  const [locationsList, setLocationsList] = useState<string[]>([
    "CMK Main",
    "CMK Branch 1",
    "CMK Branch 2",
  ]);
  const [isExportChecked, setIsExportChecked] = useState(false);
  const [isCompanyWiseChecked, setIsCompanyWiseChecked] = useState(false);
  const [tableSearchTerm, setTableSearchTerm] = useState("");

  useEffect(() => {
    if (activeBranch) {
      setLocation(activeBranch);
    }
  }, [activeBranch]);

  // Dynamically load Location list from Application Settings -> HCF Branches
  useEffect(() => {
    getSettingsItems("branches")
      .then((res) => {
        if (res.items && res.items.length > 0) {
          const fetchedNames = res.items.map((i) => i.value);
          setLocationsList(fetchedNames);
        }
      })
      .catch((err) => {
        console.warn("Failed to load dynamic HCF branches from settings:", err);
      });
  }, []);

  // Dynamic Radio Grouping based on Report
  const [groupByDimension, setGroupByDimension] =
    useState<string>("Department");

  // ─── Live Report Data State ──────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [revenueData, setRevenueData] = useState<RevenueReportData | null>(
    null,
  );
  const [collectionsData, setCollectionsData] =
    useState<CollectionsReportData | null>(null);
  const [billRegisterData, setBillRegisterData] =
    useState<BillRegisterReportData | null>(null);
  const [atdCensusData, setAtdCensusData] =
    useState<AtdCensusReportData | null>(null);
  const [outstandingData, setOutstandingData] =
    useState<OutstandingReportData | null>(null);
  const [refundsCreditData, setRefundsCreditData] =
    useState<RefundsCreditReportData | null>(null);

  // ─── Print Modal State ───────────────────────────────────────────────────────
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // ─── FETCH REPORT FROM API ───────────────────────────────────────────────────
  const fetchReportData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (
        selectedReportId === "Revenue" ||
        selectedReportId === "Discount Report" ||
        selectedReportId === "IP TAT"
      ) {
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
        const mode =
          selectedReportId === "Cash Collection"
            ? "Cash"
            : selectedReportId === "Credit Collection"
              ? "CreditNote"
              : "all";
        const data = await getCollectionsReport({
          fromDate,
          toDate,
          location,
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
        const status =
          selectedReportId === "Bill Cancelled" ? "Cancelled" : "all";
        const type = selectedReportId === "OP Visit" ? "OP" : "Both";
        const data = await getBillRegisterReport({
          fromDate,
          toDate,
          location,
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
          location,
          status,
        });
        setAtdCensusData(data);
      } else if (
        selectedReportId === "Outstanding" ||
        selectedReportId === "Deposit Exhaust"
      ) {
        const data = await getOutstandingReport({ fromDate, toDate, location });
        setOutstandingData(data);
      } else if (
        selectedReportId === "Refund" ||
        selectedReportId === "Credit Note Report"
      ) {
        const data = await getRefundsCreditReport();
        setRefundsCreditData(data);
      }
    } catch (err) {
      console.error("Failed to generate report from API:", err);
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedReportId,
    fromDate,
    toDate,
    location,
    groupByDimension,
    isCompanyWiseChecked,
  ]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Set default group dimension when report changes
  useEffect(() => {
    if (selectedReportId === "Revenue") setGroupByDimension("Department");
    else if (selectedReportId === "Cash Collection")
      setGroupByDimension("Payment Mode");
    else if (selectedReportId === "Bill Register")
      setGroupByDimension("Department");
    else if (selectedReportId === "Admission Report")
      setGroupByDimension("Ward");
  }, [selectedReportId]);

  // Export to CSV
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `Report Name: ${selectedReportId}\r\n`;
    csvContent += `Generated On: ${new Date().toLocaleString()}\r\n`;
    csvContent += `From: ${fromDate} To: ${toDate}\r\n\r\n`;

    if (revenueData && selectedReportId === "Revenue") {
      csvContent +=
        "Dimension,Bills,Gross Amt,Discount Amt,Net Amt,Collected Amt,Outstanding Amt\r\n";
      revenueData.data.forEach((row) => {
        csvContent += `"${row.name}",${row.billCount},${row.grossAmt},${row.discountAmt},${row.netAmt},${row.collectedAmt},${row.outstandingAmt}\r\n`;
      });
    } else if (
      collectionsData &&
      (selectedReportId === "Cash Collection" ||
        selectedReportId === "Credit Collection" ||
        selectedReportId === "Advance Collection Reports")
    ) {
      csvContent +=
        "Payment Mode / Category,Transactions,Total Amount,Cash,Card,UPI,Other\r\n";
      collectionsData.data.forEach((row) => {
        csvContent += `"${row.name}",${row.count},${row.amount},${row.cashAmt},${row.cardAmt},${row.upiAmt},${row.otherAmt}\r\n`;
      });
    } else if (
      billRegisterData &&
      (selectedReportId === "Bill Register" ||
        selectedReportId === "Bill Cancelled" ||
        selectedReportId === "OP Visit" ||
        selectedReportId === "InvestigationWise Census" ||
        selectedReportId === "Discharge Without Billing")
    ) {
      csvContent +=
        "Invoice No,Date,UHID,Patient Name,Type,Company,Gross,Discount,Net,Balance,Status\r\n";
      billRegisterData.invoices.forEach((inv) => {
        csvContent += `"${inv.invoiceNo}","${inv.date}","${inv.uhid}","${inv.patientName}","${inv.type}","${inv.company}",${inv.grossAmt},${inv.discountAmt},${inv.netAmt},${inv.balance},"${inv.status}"\r\n`;
      });
    } else if (
      atdCensusData &&
      (selectedReportId === "Admission Report" ||
        selectedReportId === "Admission Form" ||
        selectedReportId === "Patient Transfer" ||
        selectedReportId === "Admitted List As On Date" ||
        selectedReportId === "Discharge Report" ||
        selectedReportId === "Bed Occupancy Details" ||
        selectedReportId === "Registration List" ||
        selectedReportId === "Registration Report")
    ) {
      csvContent +=
        "UHID,IP No,Patient Name,Gender/Age,Bed No,Doctor,Status,Company,Date\r\n";
      atdCensusData.patients.forEach((p) => {
        csvContent += `"${p.uhid}","${p.ipNo}","${p.name}","${p.genderAge}","${p.bedNo}","${p.doctor}","${p.status}","${p.company}","${p.regDate}"\r\n`;
      });
    } else if (refundsCreditData && selectedReportId === "Credit Note Report") {
      csvContent +=
        "Credit Note No,Date,UHID,Patient Name,Invoice No,Reason,Authorized By,Amount\r\n";
      refundsCreditData.creditNotes.forEach((c) => {
        csvContent += `"${c.creditNoteNo}","${new Date(c.createdAt).toLocaleDateString("en-GB")}","${c.uhid}","${c.patientName}","${c.invoiceNo}","${c.reason}","${c.authorizedBy}",${c.amount}\r\n`;
      });
    } else if (refundsCreditData && selectedReportId === "Refund") {
      csvContent +=
        "Refund No,Date,UHID,Patient Name,Invoice No,Mode,Ref No,Reason,Authorized By,Status,Amount\r\n";
      refundsCreditData.refunds.forEach((r) => {
        csvContent += `"${r.refundNo}","${new Date(r.createdAt).toLocaleDateString("en-GB")}","${r.uhid}","${r.patientName}","${r.invoiceNo || "-"}","${r.mode}","${r.refNo || "-"}","${r.reason}","${r.authorizedBy}","${r.status}",${r.amount}\r\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${selectedReportId.replace(/\s+/g, "_")}_Report_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col flex-1 h-[calc(100vh-56px)] bg-slate-50 overflow-hidden font-sans text-slate-800">
      {/* ─── MAIN REPORT VIEW & PARAMETER PANEL ─────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {/* Top Session / Hospital Info Header Bar (Exact match to screenshot) */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white px-4 py-2 flex items-center justify-between text-xs border-b border-blue-950 shadow-2xs flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-blue-200 tracking-wide">
              CMK CareSuite Reporting Portal
            </span>
            <span className="text-slate-300 text-[11px]">
              Welcome! <strong className="text-white">Dr. Admin</strong> — CMK
              HEALTHCARE PVT. LTD. (17/08/2026 16:05)
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-blue-200 font-mono">
            <span>IP: 49.36.179.105</span>
            <span>Server: DBSERVER-01</span>
            <span className="bg-blue-950/60 px-2 py-0.5 rounded text-emerald-400 font-bold">
              ONLINE
            </span>
          </div>
        </div>

        {/* Top Domain Switcher Tabs */}
        <div className="bg-white border-b border-slate-200 px-4 pt-2 flex items-center gap-2 flex-shrink-0 shadow-2xs">
          {(["Registration", "Billing"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                const firstItem = REPORT_TREE.find((g) => g.category === cat)
                  ?.items[0];
                if (firstItem) setSelectedReportId(firstItem.id);
              }}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeCategory === cat
                  ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-md"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {cat === "Registration" && <Users className="h-3.5 w-3.5" />}
              {cat === "Billing" && <DollarSign className="h-3.5 w-3.5" />}
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* Parameter & Filter Box (Matching Screenshot) */}
        <div className="p-4 bg-white border-b border-slate-200 shadow-2xs flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-800">
                {selectedReportId}
              </h1>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[11px] font-bold">
                {activeCategory} Report
              </Badge>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
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
                onClick={fetchReportData}
                disabled={isLoading}
                className="h-8 gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
                />
                Generate
              </Button>
            </div>
          </div>

          {/* Form Criteria Inputs Row (Exact match to screenshot) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-medium">
            {/* Date Pickers */}
            <div className="lg:col-span-4 flex items-center gap-2">
              <div className="flex items-center gap-1.5 flex-1">
                <Label className="text-[11px] font-bold text-slate-600 whitespace-nowrap">
                  From Date:
                </Label>
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
                <Label className="text-[11px] font-bold text-slate-600 whitespace-nowrap">
                  To Date:
                </Label>
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
              <Label className="text-[11px] font-bold text-slate-600 whitespace-nowrap">
                Location:
              </Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="h-7 text-xs flex-1 bg-white border-slate-300">
                  <SelectValue placeholder="-- ALL --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-- ALL --">-- ALL --</SelectItem>
                  {locationsList.map((locName) => (
                    <SelectItem key={locName} value={locName}>
                      {locName}
                    </SelectItem>
                  ))}
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
                  { label: "1D (Yesterday-Today)", days: 1 },
                  { label: "Today", days: 0 },
                  { label: "7D", days: 7 },
                  { label: "30D", days: 30 },
                  { label: "This Month", days: "month" },
                ].map((preset) => {
                  const end = new Date();
                  let start = new Date();
                  if (preset.days === "month") {
                    start = new Date(end.getFullYear(), end.getMonth(), 1);
                  } else {
                    start.setDate(end.getDate() - (preset.days as number));
                  }
                  const startStr = start.toISOString().split("T")[0];
                  const endStr = end.toISOString().split("T")[0];
                  const isActive = fromDate === startStr && toDate === endStr;

                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setFromDate(startStr);
                        setToDate(endStr);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                        isActive
                          ? "bg-blue-600 text-white border border-blue-600 shadow-2xs"
                          : "bg-white hover:bg-slate-100 border border-slate-200 text-slate-600"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grouping / Dimension Radio Options (Matching Screenshot) */}
            <div className="lg:col-span-12 pt-2 border-t border-slate-200/80 flex items-center gap-6 flex-wrap">
              <span className="text-slate-500 font-bold text-[11px]">
                Dimension Breakdown:
              </span>

              {selectedReportId === "Revenue" && (
                <div className="flex items-center gap-4">
                  {[
                    "Department",
                    "Doctor",
                    "Speciality",
                    "Bed Category",
                    "Ward/Floor",
                  ].map((dim) => (
                    <label
                      key={dim}
                      className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700"
                    >
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
                  {["Payment Mode", "Cashier", "Department", "Shift"].map(
                    (dim) => (
                      <label
                        key={dim}
                        className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700"
                      >
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
                    ),
                  )}
                </div>
              )}

              {selectedReportId === "Bill Register" && (
                <div className="flex items-center gap-4">
                  {["Department", "Doctor", "Company", "Type"].map((dim) => (
                    <label
                      key={dim}
                      className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700"
                    >
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
                    <label
                      key={dim}
                      className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700"
                    >
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
                    {["Standard Summary", "Detailed Audit", "Doctor Wise"].map(
                      (dim) => (
                        <label
                          key={dim}
                          className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700"
                        >
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
                      ),
                    )}
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
                <Badge
                  variant="outline"
                  className="bg-white text-slate-600 text-[10px] font-mono"
                >
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
                        <th className="px-4 py-2.5">
                          Dimension / Group ({groupByDimension})
                        </th>
                        <th className="px-3 py-2.5 text-center">Bills Count</th>
                        <th className="px-3 py-2.5 text-right">Gross Amount</th>
                        <th className="px-3 py-2.5 text-right">Discounts</th>
                        <th className="px-3 py-2.5 text-right">Net Revenue</th>
                        <th className="px-3 py-2.5 text-right">
                          Settled / Collected
                        </th>
                        <th className="px-3 py-2.5 text-right">Outstanding</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {revenueData.data
                        .filter((r) =>
                          r.name
                            .toLowerCase()
                            .includes(tableSearchTerm.toLowerCase()),
                        )
                        .map((row, idx) => (
                          <tr key={idx} className="hover:bg-blue-50/40">
                            <td className="px-4 py-2.5 font-bold text-slate-800 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                              {row.name}
                            </td>
                            <td className="px-3 py-2.5 text-center font-mono font-bold text-blue-600">
                              {row.billCount}
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono">
                              ₹
                              {row.grossAmt.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono text-amber-600">
                              ₹
                              {row.discountAmt.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono font-bold text-blue-700">
                              ₹
                              {row.netAmt.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono text-emerald-600 font-bold">
                              ₹
                              {row.collectedAmt.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono text-rose-600 font-bold">
                              ₹
                              {row.outstandingAmt.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300 sticky bottom-0">
                      <tr>
                        <td className="px-4 py-2.5 uppercase">TOTAL</td>
                        <td className="px-3 py-2.5 text-center font-mono">
                          {revenueData.summary.totalBills}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono">
                          ₹
                          {revenueData.summary.totalGross.toLocaleString(
                            "en-IN",
                            { minimumFractionDigits: 2 },
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-amber-700">
                          ₹
                          {revenueData.summary.totalDiscount.toLocaleString(
                            "en-IN",
                            { minimumFractionDigits: 2 },
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-blue-700">
                          ₹
                          {revenueData.summary.totalNet.toLocaleString(
                            "en-IN",
                            { minimumFractionDigits: 2 },
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-emerald-700">
                          ₹
                          {revenueData.summary.totalCollected.toLocaleString(
                            "en-IN",
                            { minimumFractionDigits: 2 },
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-rose-700">
                          ₹
                          {revenueData.summary.totalOutstanding.toLocaleString(
                            "en-IN",
                            { minimumFractionDigits: 2 },
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                )}

                {/* ─── 2. COLLECTIONS & CASHBOOK REPORT TABLE ─────────────────── */}
                {(selectedReportId === "Cash Collection" ||
                  selectedReportId === "Credit Collection" ||
                  selectedReportId === "Advance Collection Reports") &&
                  collectionsData && (
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold sticky top-0 z-10 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-2.5">
                            Category / Payment Mode
                          </th>
                          <th className="px-3 py-2.5 text-center">
                            Receipts Count
                          </th>
                          <th className="px-3 py-2.5 text-right">Cash Share</th>
                          <th className="px-3 py-2.5 text-right">Card Share</th>
                          <th className="px-3 py-2.5 text-right">UPI Share</th>
                          <th className="px-3 py-2.5 text-right">
                            Other / Cheque
                          </th>
                          <th className="px-3 py-2.5 text-right">
                            Total Collection
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {collectionsData.data
                          .filter((r) =>
                            r.name
                              .toLowerCase()
                              .includes(tableSearchTerm.toLowerCase()),
                          )
                          .map((row, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/40">
                              <td className="px-4 py-2.5 font-bold text-slate-800 flex items-center gap-2">
                                <Wallet className="h-3.5 w-3.5 text-blue-500" />
                                {row.name}
                              </td>
                              <td className="px-3 py-2.5 text-center font-mono font-bold">
                                {row.count}
                              </td>
                              <td className="px-3 py-2.5 text-right font-mono">
                                ₹
                                {row.cashAmt.toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                              <td className="px-3 py-2.5 text-right font-mono">
                                ₹
                                {row.cardAmt.toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                              <td className="px-3 py-2.5 text-right font-mono">
                                ₹
                                {row.upiAmt.toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                              <td className="px-3 py-2.5 text-right font-mono">
                                ₹
                                {row.otherAmt.toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                              <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-600">
                                ₹
                                {row.amount.toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                      <tfoot className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300 sticky bottom-0">
                        <tr>
                          <td className="px-4 py-2.5 uppercase">
                            TOTAL COLLECTIONS
                          </td>
                          <td className="px-3 py-2.5 text-center font-mono">
                            {collectionsData.totalTransactions}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono">
                            ₹
                            {collectionsData.data
                              .reduce((s, r) => s + r.cashAmt, 0)
                              .toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono">
                            ₹
                            {collectionsData.data
                              .reduce((s, r) => s + r.cardAmt, 0)
                              .toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono">
                            ₹
                            {collectionsData.data
                              .reduce((s, r) => s + r.upiAmt, 0)
                              .toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono">
                            ₹
                            {collectionsData.data
                              .reduce((s, r) => s + r.otherAmt, 0)
                              .toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono text-emerald-700">
                            ₹
                            {collectionsData.totalCollection.toLocaleString(
                              "en-IN",
                              { minimumFractionDigits: 2 },
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  )}

                {/* ─── 3. BILL REGISTER REPORT TABLE ─────────────────────────── */}
                {(selectedReportId === "Bill Register" ||
                  selectedReportId === "Bill Cancelled" ||
                  selectedReportId === "OP Visit" ||
                  selectedReportId === "InvestigationWise Census" ||
                  selectedReportId === "Discharge Without Billing") &&
                  billRegisterData && (
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
                              (location === "-- ALL --" ||
                                !inv.hcf ||
                                inv.hcf === location) &&
                              (inv.invoiceNo
                                .toLowerCase()
                                .includes(tableSearchTerm.toLowerCase()) ||
                                inv.patientName
                                  .toLowerCase()
                                  .includes(tableSearchTerm.toLowerCase()) ||
                                inv.uhid
                                  .toLowerCase()
                                  .includes(tableSearchTerm.toLowerCase())),
                          )
                          .map((inv, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/40">
                              <td className="px-4 py-2.5 font-mono font-bold text-blue-600">
                                {inv.invoiceNo}
                              </td>
                              <td className="px-3 py-2.5 text-slate-500 font-mono">
                                {new Date(inv.date).toLocaleDateString("en-GB")}
                              </td>
                              <td className="px-3 py-2.5 font-mono font-semibold text-slate-800">
                                {inv.uhid}
                              </td>
                              <td className="px-3 py-2.5 font-bold text-slate-800">
                                {inv.patientName}
                              </td>
                              <td className="px-3 py-2.5">
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] font-bold ${inv.type === "IP" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}
                                >
                                  {inv.type}
                                </Badge>
                              </td>
                              <td className="px-3 py-2.5 text-slate-600">
                                {inv.doctorName}
                              </td>
                              <td className="px-3 py-2.5 text-slate-600">
                                {inv.company}
                              </td>
                              <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900">
                                ₹
                                {inv.netAmt.toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                              <td className="px-3 py-2.5 text-right font-mono font-bold text-rose-600">
                                ₹
                                {inv.balance.toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${inv.status === "Settled" ? "bg-emerald-100 text-emerald-800" : inv.status === "Cancelled" ? "bg-slate-200 text-slate-700" : "bg-rose-100 text-rose-800"}`}
                                >
                                  {inv.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}

                {/* ─── 4. ATD & REGISTRATION CENSUS TABLE ─────────────────────── */}
                {(selectedReportId === "Admission Report" ||
                  selectedReportId === "Admission Form" ||
                  selectedReportId === "Patient Transfer" ||
                  selectedReportId === "Admitted List As On Date" ||
                  selectedReportId === "Discharge Report" ||
                  selectedReportId === "Bed Occupancy Details" ||
                  selectedReportId === "Registration List" ||
                  selectedReportId === "Registration Report") &&
                  atdCensusData && (
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
                              (location === "-- ALL --" ||
                                !(p as any).hcf ||
                                (p as any).hcf === location) &&
                              (p.name
                                .toLowerCase()
                                .includes(tableSearchTerm.toLowerCase()) ||
                                p.uhid
                                  .toLowerCase()
                                  .includes(tableSearchTerm.toLowerCase())),
                          )
                          .map((p, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/40">
                              <td className="px-4 py-2.5 font-mono font-bold text-blue-600">
                                {p.uhid}
                              </td>
                              <td className="px-3 py-2.5 font-mono text-slate-600">
                                {p.ipNo}
                              </td>
                              <td className="px-3 py-2.5 font-bold text-slate-800">
                                {p.name}
                              </td>
                              <td className="px-3 py-2.5 text-slate-500">
                                {p.genderAge}
                              </td>
                              <td className="px-3 py-2.5 font-semibold text-slate-700">
                                {p.bedNo}
                              </td>
                              <td className="px-3 py-2.5 text-slate-700 font-semibold">
                                {p.doctor}
                              </td>
                              <td className="px-3 py-2.5 text-slate-600">
                                {p.company}
                              </td>
                              <td className="px-3 py-2.5 font-mono text-slate-500">
                                {new Date(p.regDate).toLocaleDateString(
                                  "en-GB",
                                )}
                              </td>
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
                {(selectedReportId === "Outstanding" ||
                  selectedReportId === "Deposit Exhaust") &&
                  outstandingData && (
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold sticky top-0 z-10 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-2.5">Aging Bucket</th>
                          <th className="px-3 py-2.5 text-center">
                            Invoices Count
                          </th>
                          <th className="px-3 py-2.5 text-right">
                            Outstanding Amount
                          </th>
                          <th className="px-3 py-2.5 text-right">Share (%)</th>
                          <th className="px-3 py-2.5 text-center">
                            Risk Level
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {outstandingData.buckets.map((b, idx) => {
                          const pct =
                            outstandingData.totalOutstanding > 0
                              ? (
                                  (b.amount /
                                    outstandingData.totalOutstanding) *
                                  100
                                ).toFixed(1)
                              : 0;
                          return (
                            <tr key={idx} className="hover:bg-blue-50/40">
                              <td className="px-4 py-2.5 font-bold text-slate-800">
                                {b.range}
                              </td>
                              <td className="px-3 py-2.5 text-center font-mono font-bold">
                                {b.count}
                              </td>
                              <td className="px-3 py-2.5 text-right font-mono font-bold text-rose-600">
                                ₹
                                {b.amount.toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                              <td className="px-3 py-2.5 text-right font-mono font-bold">
                                {pct}%
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${b.range === "90+ Days" ? "bg-rose-100 text-rose-800" : b.range === "61-90 Days" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}
                                >
                                  {b.range === "90+ Days"
                                    ? "High Risk"
                                    : b.range === "61-90 Days"
                                      ? "Medium"
                                      : "Normal"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300 sticky bottom-0">
                        <tr>
                          <td className="px-4 py-2.5 uppercase">
                            TOTAL RECEIVABLE
                          </td>
                          <td className="px-3 py-2.5 text-center font-mono">
                            {outstandingData.totalPendingInvoices}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono text-rose-700">
                            ₹
                            {outstandingData.totalOutstanding.toLocaleString(
                              "en-IN",
                              { minimumFractionDigits: 2 },
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono">
                            100.0%
                          </td>
                          <td className="px-3 py-2.5 text-center font-mono">
                            -
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  )}

                {/* ─── 6. CREDIT NOTE REPORT TABLE ────────────────────────────── */}
                {selectedReportId === "Credit Note Report" &&
                  refundsCreditData && (
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold sticky top-0 z-10 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-2.5">Credit Note No</th>
                          <th className="px-3 py-2.5">Date</th>
                          <th className="px-3 py-2.5">UHID</th>
                          <th className="px-3 py-2.5">Patient Name</th>
                          <th className="px-3 py-2.5">Invoice No</th>
                          <th className="px-3 py-2.5">Reason</th>
                          <th className="px-3 py-2.5">Authorized By</th>
                          <th className="px-3 py-2.5 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {refundsCreditData.creditNotes
                          .filter(
                            (c) =>
                              c.patientName
                                .toLowerCase()
                                .includes(tableSearchTerm.toLowerCase()) ||
                              c.creditNoteNo
                                .toLowerCase()
                                .includes(tableSearchTerm.toLowerCase()) ||
                              c.uhid
                                .toLowerCase()
                                .includes(tableSearchTerm.toLowerCase()),
                          )
                          .map((c, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/40">
                              <td className="px-4 py-2.5 font-mono font-bold text-blue-600">
                                {c.creditNoteNo}
                              </td>
                              <td className="px-3 py-2.5 font-mono text-slate-500">
                                {new Date(c.createdAt).toLocaleDateString(
                                  "en-GB",
                                )}
                              </td>
                              <td className="px-3 py-2.5 font-mono text-slate-600">
                                {c.uhid}
                              </td>
                              <td className="px-3 py-2.5 font-bold text-slate-800">
                                {c.patientName}
                              </td>
                              <td className="px-3 py-2.5 font-mono text-slate-600">
                                {c.invoiceNo}
                              </td>
                              <td className="px-3 py-2.5 text-slate-600">
                                {c.reason}
                              </td>
                              <td className="px-3 py-2.5 text-slate-700 font-semibold">
                                {c.authorizedBy}
                              </td>
                              <td className="px-3 py-2.5 text-right font-mono font-bold text-rose-600">
                                ₹
                                {c.amount.toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                      <tfoot className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300 sticky bottom-0">
                        <tr>
                          <td
                            colSpan={7}
                            className="px-4 py-2.5 uppercase font-bold text-slate-800"
                          >
                            TOTAL CREDIT NOTES
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono text-rose-700 font-bold">
                            ₹
                            {refundsCreditData.summary.totalCreditNotes.toLocaleString(
                              "en-IN",
                              { minimumFractionDigits: 2 },
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  )}

                {/* ─── 7. REFUND REPORT TABLE ─────────────────────────────────── */}
                {selectedReportId === "Refund" && refundsCreditData && (
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold sticky top-0 z-10 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2.5">Refund No</th>
                        <th className="px-3 py-2.5">Date</th>
                        <th className="px-3 py-2.5">UHID</th>
                        <th className="px-3 py-2.5">Patient Name</th>
                        <th className="px-3 py-2.5">Invoice No</th>
                        <th className="px-3 py-2.5">Mode</th>
                        <th className="px-3 py-2.5">Ref No</th>
                        <th className="px-3 py-2.5">Reason</th>
                        <th className="px-3 py-2.5">Authorized By</th>
                        <th className="px-3 py-2.5 text-center">Status</th>
                        <th className="px-3 py-2.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {refundsCreditData.refunds
                        .filter(
                          (r) =>
                            r.patientName
                              .toLowerCase()
                              .includes(tableSearchTerm.toLowerCase()) ||
                            r.refundNo
                              .toLowerCase()
                              .includes(tableSearchTerm.toLowerCase()) ||
                            r.uhid
                              .toLowerCase()
                              .includes(tableSearchTerm.toLowerCase()),
                        )
                        .map((r, idx) => (
                          <tr key={idx} className="hover:bg-blue-50/40">
                            <td className="px-4 py-2.5 font-mono font-bold text-blue-600">
                              {r.refundNo}
                            </td>
                            <td className="px-3 py-2.5 font-mono text-slate-500">
                              {new Date(r.createdAt).toLocaleDateString(
                                "en-GB",
                              )}
                            </td>
                            <td className="px-3 py-2.5 font-mono text-slate-600">
                              {r.uhid}
                            </td>
                            <td className="px-3 py-2.5 font-bold text-slate-800">
                              {r.patientName}
                            </td>
                            <td className="px-3 py-2.5 font-mono text-slate-600">
                              {r.invoiceNo || "-"}
                            </td>
                            <td className="px-3 py-2.5">{r.mode}</td>
                            <td className="px-3 py-2.5 font-mono text-slate-600">
                              {r.refNo || "-"}
                            </td>
                            <td className="px-3 py-2.5 text-slate-600">
                              {r.reason}
                            </td>
                            <td className="px-3 py-2.5 text-slate-700 font-semibold">
                              {r.authorizedBy}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                                {r.status}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono font-bold text-amber-600">
                              ₹
                              {r.amount.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300 sticky bottom-0">
                      <tr>
                        <td
                          colSpan={10}
                          className="px-4 py-2.5 uppercase font-bold text-slate-800"
                        >
                          TOTAL REFUNDS
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-amber-700 font-bold">
                          ₹
                          {refundsCreditData.summary.totalRefunds.toLocaleString(
                            "en-IN",
                            { minimumFractionDigits: 2 },
                          )}
                        </td>
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
                <span className="font-bold text-sm">
                  Print Preview — {selectedReportId} Report
                </span>
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
                  Plot No. 12-A, Institutional Area, Sector 62, New Delhi, Delhi
                  110092
                </p>
                <p className="text-xs font-sans text-slate-500">
                  NABH & NABL Accredited | GSTIN: 07AAAAC1234F1Z8 | Tel: +91 11
                  4988 5000
                </p>
              </div>

              {/* Report Metadata */}
              <div className="flex items-center justify-between text-xs font-sans border-b border-slate-200 pb-2">
                <div>
                  <h2 className="text-sm font-bold uppercase text-slate-800">
                    {selectedReportId} Analysis Report
                  </h2>
                  <p className="text-slate-500">
                    Breakdown: <strong>{groupByDimension}</strong> | Location:{" "}
                    <strong>{location}</strong>
                  </p>
                </div>
                <div className="text-right text-slate-600">
                  <p>
                    Period: <strong>{fromDate}</strong> to{" "}
                    <strong>{toDate}</strong>
                  </p>
                  <p>
                    Generated: <strong>{new Date().toLocaleString()}</strong>
                  </p>
                </div>
              </div>

              {/* Data Table Printout */}
              {selectedReportId === "Revenue" && revenueData && (
                <table className="w-full text-xs font-sans border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                      <th className="border border-slate-300 p-2 text-left">
                        Group / Dimension
                      </th>
                      <th className="border border-slate-300 p-2 text-center">
                        Count
                      </th>
                      <th className="border border-slate-300 p-2 text-right">
                        Gross (₹)
                      </th>
                      <th className="border border-slate-300 p-2 text-right">
                        Discount (₹)
                      </th>
                      <th className="border border-slate-300 p-2 text-right">
                        Net Revenue (₹)
                      </th>
                      <th className="border border-slate-300 p-2 text-right">
                        Outstanding (₹)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.data.map((row, i) => (
                      <tr key={i} className="border-b border-slate-200">
                        <td className="border border-slate-300 p-2 font-bold">
                          {row.name}
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          {row.billCount}
                        </td>
                        <td className="border border-slate-300 p-2 text-right font-mono">
                          {row.grossAmt.toFixed(2)}
                        </td>
                        <td className="border border-slate-300 p-2 text-right font-mono">
                          {row.discountAmt.toFixed(2)}
                        </td>
                        <td className="border border-slate-300 p-2 text-right font-mono font-bold">
                          {row.netAmt.toFixed(2)}
                        </td>
                        <td className="border border-slate-300 p-2 text-right font-mono text-rose-600">
                          {row.outstandingAmt.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                      <td className="border border-slate-300 p-2 uppercase">
                        TOTAL HOSPITAL SUMMARY
                      </td>
                      <td className="border border-slate-300 p-2 text-center">
                        {revenueData.summary.totalBills}
                      </td>
                      <td className="border border-slate-300 p-2 text-right font-mono">
                        {revenueData.summary.totalGross.toFixed(2)}
                      </td>
                      <td className="border border-slate-300 p-2 text-right font-mono">
                        {revenueData.summary.totalDiscount.toFixed(2)}
                      </td>
                      <td className="border border-slate-300 p-2 text-right font-mono">
                        {revenueData.summary.totalNet.toFixed(2)}
                      </td>
                      <td className="border border-slate-300 p-2 text-right font-mono">
                        {revenueData.summary.totalOutstanding.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}

              {(selectedReportId === "Cash Collection" ||
                selectedReportId === "Credit Collection" ||
                selectedReportId === "Advance Collection Reports") &&
                collectionsData && (
                  <table className="w-full text-xs font-sans border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                        <th className="border border-slate-300 p-2 text-left">
                          Category / Payment Mode
                        </th>
                        <th className="border border-slate-300 p-2 text-center">
                          Receipts Count
                        </th>
                        <th className="border border-slate-300 p-2 text-right">
                          Cash (₹)
                        </th>
                        <th className="border border-slate-300 p-2 text-right">
                          Card (₹)
                        </th>
                        <th className="border border-slate-300 p-2 text-right">
                          UPI (₹)
                        </th>
                        <th className="border border-slate-300 p-2 text-right">
                          Other (₹)
                        </th>
                        <th className="border border-slate-300 p-2 text-right">
                          Total Collection (₹)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {collectionsData.data.map((row, i) => (
                        <tr key={i} className="border-b border-slate-200">
                          <td className="border border-slate-300 p-2 font-bold">
                            {row.name}
                          </td>
                          <td className="border border-slate-300 p-2 text-center font-mono">
                            {row.count}
                          </td>
                          <td className="border border-slate-300 p-2 text-right font-mono">
                            {row.cashAmt.toFixed(2)}
                          </td>
                          <td className="border border-slate-300 p-2 text-right font-mono">
                            {row.cardAmt.toFixed(2)}
                          </td>
                          <td className="border border-slate-300 p-2 text-right font-mono">
                            {row.upiAmt.toFixed(2)}
                          </td>
                          <td className="border border-slate-300 p-2 text-right font-mono">
                            {row.otherAmt.toFixed(2)}
                          </td>
                          <td className="border border-slate-300 p-2 text-right font-mono font-bold text-emerald-600">
                            {row.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                        <td className="border border-slate-300 p-2 uppercase">
                          TOTAL SUMMARY
                        </td>
                        <td className="border border-slate-300 p-2 text-center font-mono">
                          {collectionsData.totalTransactions}
                        </td>
                        <td className="border border-slate-300 p-2 text-right font-mono">
                          {collectionsData.data
                            .reduce((s, r) => s + r.cashAmt, 0)
                            .toFixed(2)}
                        </td>
                        <td className="border border-slate-300 p-2 text-right font-mono">
                          {collectionsData.data
                            .reduce((s, r) => s + r.cardAmt, 0)
                            .toFixed(2)}
                        </td>
                        <td className="border border-slate-300 p-2 text-right font-mono">
                          {collectionsData.data
                            .reduce((s, r) => s + r.upiAmt, 0)
                            .toFixed(2)}
                        </td>
                        <td className="border border-slate-300 p-2 text-right font-mono">
                          {collectionsData.data
                            .reduce((s, r) => s + r.otherAmt, 0)
                            .toFixed(2)}
                        </td>
                        <td className="border border-slate-300 p-2 text-right font-mono font-bold text-emerald-700">
                          {collectionsData.totalCollection.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                )}

              {(selectedReportId === "Bill Register" ||
                selectedReportId === "Bill Cancelled" ||
                selectedReportId === "OP Visit" ||
                selectedReportId === "InvestigationWise Census" ||
                selectedReportId === "Discharge Without Billing") &&
                billRegisterData && (
                  <table className="w-full text-xs font-sans border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                        <th className="border border-slate-300 p-2 text-left">
                          Invoice No
                        </th>
                        <th className="border border-slate-300 p-2">Date</th>
                        <th className="border border-slate-300 p-2">UHID</th>
                        <th className="border border-slate-300 p-2">
                          Patient Name
                        </th>
                        <th className="border border-slate-300 p-2">Doctor</th>
                        <th className="border border-slate-300 p-2 text-right">
                          Net Amt (₹)
                        </th>
                        <th className="border border-slate-300 p-2 text-right">
                          Balance (₹)
                        </th>
                        <th className="border border-slate-300 p-2 text-center">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {billRegisterData.invoices.map((inv, i) => (
                        <tr key={i} className="border-b border-slate-200">
                          <td className="border border-slate-300 p-2 font-mono font-bold">
                            {inv.invoiceNo}
                          </td>
                          <td className="border border-slate-300 p-2 font-mono">
                            {new Date(inv.date).toLocaleDateString("en-GB")}
                          </td>
                          <td className="border border-slate-300 p-2 font-mono">
                            {inv.uhid}
                          </td>
                          <td className="border border-slate-300 p-2 font-bold">
                            {inv.patientName}
                          </td>
                          <td className="border border-slate-300 p-2">
                            {inv.doctorName || "-"}
                          </td>
                          <td className="border border-slate-300 p-2 text-right font-mono">
                            {inv.netAmt.toFixed(2)}
                          </td>
                          <td className="border border-slate-300 p-2 text-right font-mono">
                            {inv.balance.toFixed(2)}
                          </td>
                          <td className="border border-slate-300 p-2 text-center">
                            {inv.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                        <td
                          colSpan={5}
                          className="border border-slate-300 p-2 uppercase font-bold"
                        >
                          TOTAL REGISTER SUMMARY
                        </td>
                        <td className="border border-slate-300 p-2 text-right font-mono">
                          {billRegisterData.summary.totalAmount.toFixed(2)}
                        </td>
                        <td className="border border-slate-300 p-2 text-right font-mono">
                          {billRegisterData.summary.totalBalance.toFixed(2)}
                        </td>
                        <td className="border border-slate-300 p-2 text-center font-mono">
                          -
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                )}

              {(selectedReportId === "Admission Report" ||
                selectedReportId === "Admission Form" ||
                selectedReportId === "Patient Transfer" ||
                selectedReportId === "Admitted List As On Date" ||
                selectedReportId === "Discharge Report" ||
                selectedReportId === "Bed Occupancy Details" ||
                selectedReportId === "Registration List" ||
                selectedReportId === "Registration Report") &&
                atdCensusData && (
                  <table className="w-full text-xs font-sans border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                        <th className="border border-slate-300 p-2 text-left">
                          UHID
                        </th>
                        <th className="border border-slate-300 p-2">
                          IP / Visit No
                        </th>
                        <th className="border border-slate-300 p-2">
                          Patient Name
                        </th>
                        <th className="border border-slate-300 p-2">
                          Gender/Age
                        </th>
                        <th className="border border-slate-300 p-2">
                          Bed / Room
                        </th>
                        <th className="border border-slate-300 p-2">Doctor</th>
                        <th className="border border-slate-300 p-2 text-center">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {atdCensusData.patients.map((p, i) => (
                        <tr key={i} className="border-b border-slate-200">
                          <td className="border border-slate-300 p-2 font-mono font-bold">
                            {p.uhid}
                          </td>
                          <td className="border border-slate-300 p-2 font-mono">
                            {p.ipNo}
                          </td>
                          <td className="border border-slate-300 p-2 font-bold">
                            {p.name}
                          </td>
                          <td className="border border-slate-300 p-2">
                            {p.genderAge}
                          </td>
                          <td className="border border-slate-300 p-2 font-semibold">
                            {p.bedNo}
                          </td>
                          <td className="border border-slate-300 p-2">
                            {p.doctor}
                          </td>
                          <td className="border border-slate-300 p-2 text-center">
                            {p.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

              {(selectedReportId === "Outstanding" ||
                selectedReportId === "Deposit Exhaust") &&
                outstandingData && (
                  <table className="w-full text-xs font-sans border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                        <th className="border border-slate-300 p-2 text-left">
                          Aging Bucket
                        </th>
                        <th className="border border-slate-300 p-2 text-center">
                          Invoices Count
                        </th>
                        <th className="border border-slate-300 p-2 text-right">
                          Outstanding Amount (₹)
                        </th>
                        <th className="border border-slate-300 p-2 text-right">
                          Share (%)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {outstandingData.buckets.map((b, i) => {
                        const pct =
                          outstandingData.totalOutstanding > 0
                            ? (
                                (b.amount / outstandingData.totalOutstanding) *
                                100
                              ).toFixed(1)
                            : 0;
                        return (
                          <tr key={i} className="border-b border-slate-200">
                            <td className="border border-slate-300 p-2 font-bold">
                              {b.range}
                            </td>
                            <td className="border border-slate-300 p-2 text-center">
                              {b.count}
                            </td>
                            <td className="border border-slate-300 p-2 text-right font-mono text-rose-600">
                              ₹{b.amount.toFixed(2)}
                            </td>
                            <td className="border border-slate-300 p-2 text-right font-mono">
                              {pct}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                        <td className="border border-slate-300 p-2 uppercase font-bold">
                          TOTAL OUTSTANDING
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          {outstandingData.totalPendingInvoices}
                        </td>
                        <td className="border border-slate-300 p-2 text-right font-mono text-rose-700">
                          ₹{outstandingData.totalOutstanding.toFixed(2)}
                        </td>
                        <td className="border border-slate-300 p-2 text-right font-mono">
                          100.0%
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                )}

              {selectedReportId === "Credit Note Report" &&
                refundsCreditData && (
                  <table className="w-full text-xs font-sans border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                        <th className="border border-slate-300 p-2 text-left">
                          Credit Note No
                        </th>
                        <th className="border border-slate-300 p-2">Date</th>
                        <th className="border border-slate-300 p-2">UHID</th>
                        <th className="border border-slate-300 p-2">
                          Patient Name
                        </th>
                        <th className="border border-slate-300 p-2">
                          Invoice No
                        </th>
                        <th className="border border-slate-300 p-2">Reason</th>
                        <th className="border border-slate-300 p-2">
                          Authorized By
                        </th>
                        <th className="border border-slate-300 p-2 text-right">
                          Amount (₹)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {refundsCreditData.creditNotes.map((c, i) => (
                        <tr key={i} className="border-b border-slate-200">
                          <td className="border border-slate-300 p-2 font-mono font-bold text-blue-600">
                            {c.creditNoteNo}
                          </td>
                          <td className="border border-slate-300 p-2 font-mono">
                            {new Date(c.createdAt).toLocaleDateString("en-GB")}
                          </td>
                          <td className="border border-slate-300 p-2 font-mono">
                            {c.uhid}
                          </td>
                          <td className="border border-slate-300 p-2 font-bold">
                            {c.patientName}
                          </td>
                          <td className="border border-slate-300 p-2 font-mono">
                            {c.invoiceNo}
                          </td>
                          <td className="border border-slate-300 p-2">
                            {c.reason}
                          </td>
                          <td className="border border-slate-300 p-2 font-semibold">
                            {c.authorizedBy}
                          </td>
                          <td className="border border-slate-300 p-2 text-right font-mono text-rose-600 font-bold">
                            ₹{c.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                        <td
                          colSpan={7}
                          className="border border-slate-300 p-2 uppercase font-bold"
                        >
                          TOTAL CREDIT
                        </td>
                        <td className="border border-slate-300 p-2 text-right font-mono text-rose-700 font-bold">
                          ₹
                          {refundsCreditData.summary.totalCreditNotes.toFixed(
                            2,
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                )}

              {selectedReportId === "Refund" && refundsCreditData && (
                <table className="w-full text-xs font-sans border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                      <th className="border border-slate-300 p-2 text-left">
                        Refund No
                      </th>
                      <th className="border border-slate-300 p-2">Date</th>
                      <th className="border border-slate-300 p-2">UHID</th>
                      <th className="border border-slate-300 p-2">
                        Patient Name
                      </th>
                      <th className="border border-slate-300 p-2">
                        Invoice No
                      </th>
                      <th className="border border-slate-300 p-2">Mode</th>
                      <th className="border border-slate-300 p-2">Reason</th>
                      <th className="border border-slate-300 p-2">
                        Authorized By
                      </th>
                      <th className="border border-slate-300 p-2 text-right">
                        Amount (₹)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {refundsCreditData.refunds.map((r, i) => (
                      <tr key={i} className="border-b border-slate-200">
                        <td className="border border-slate-300 p-2 font-mono font-bold text-blue-600">
                          {r.refundNo}
                        </td>
                        <td className="border border-slate-300 p-2 font-mono">
                          {new Date(r.createdAt).toLocaleDateString("en-GB")}
                        </td>
                        <td className="border border-slate-300 p-2 font-mono">
                          {r.uhid}
                        </td>
                        <td className="border border-slate-300 p-2 font-bold">
                          {r.patientName}
                        </td>
                        <td className="border border-slate-300 p-2 font-mono">
                          {r.invoiceNo || "-"}
                        </td>
                        <td className="border border-slate-300 p-2">
                          {r.mode}
                        </td>
                        <td className="border border-slate-300 p-2">
                          {r.reason}
                        </td>
                        <td className="border border-slate-300 p-2 font-semibold">
                          {r.authorizedBy}
                        </td>
                        <td className="border border-slate-300 p-2 text-right font-mono text-amber-600 font-bold">
                          ₹{r.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                      <td
                        colSpan={8}
                        className="border border-slate-300 p-2 uppercase font-bold"
                      >
                        TOTAL REFUNDS
                      </td>
                      <td className="border border-slate-300 p-2 text-right font-mono text-amber-700 font-bold">
                        ₹{refundsCreditData.summary.totalRefunds.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}

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
