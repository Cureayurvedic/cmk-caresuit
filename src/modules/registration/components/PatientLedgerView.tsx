import { useState, useEffect, useRef, useMemo } from "react";
import {
  X,
  User,
  Phone,
  AlertCircle,
  Shield,
  CreditCard,
  Building2,
  Printer,
  FileText,
  Wallet,
  Receipt,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  PlusCircle,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PatientData } from "@/api/patientApi";
import {
  getInvoices,
  getAdvances,
  getReceipts,
  InvoiceData,
  AdvanceData,
} from "@/api/billingApi";
import {
  BillingInvoicePrint,
  BillingInvoicePrintData,
} from "@/modules/billing/components/BillingInvoicePrint";
import {
  PatientReceiptPrint,
  ReceiptPrintData,
} from "./PatientReceiptPrint";

interface PatientLedgerViewProps {
  patient: PatientData;
  onClose: () => void;
}

type TabType = "statement" | "invoices" | "advances" | "demographics";

export default function PatientLedgerView({ patient, onClose }: PatientLedgerViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("statement");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [advances, setAdvances] = useState<AdvanceData[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);

  // Print targets
  const [printInvoiceData, setPrintInvoiceData] = useState<BillingInvoicePrintData | null>(null);
  const [printReceiptData, setPrintReceiptData] = useState<ReceiptPrintData | null>(null);

  const printInvoiceRef = useRef<HTMLDivElement>(null);
  const printReceiptRef = useRef<HTMLDivElement>(null);

  const triggerPrintInvoice = useReactToPrint({
    contentRef: printInvoiceRef,
    documentTitle: `Invoice_${printInvoiceData?.invoiceNo || "Document"}`,
  });

  const triggerPrintReceipt = useReactToPrint({
    contentRef: printReceiptRef,
    documentTitle: `Receipt_${printReceiptData?.receiptNo || "Document"}`,
  });

  // Handle printing a specific invoice
  const handlePrintSpecificInvoice = (inv: InvoiceData | any) => {
    const formattedData: BillingInvoicePrintData = {
      invoiceNo: inv.invoiceNo,
      date: inv.date || inv.createdAt,
      type: inv.type || "OP",
      uhid: inv.uhid || patient.uhid || "",
      patientName: inv.patientName || getFullName(),
      genderAge: `${patient.gender || "N/A"} / ${patient.age ? `${patient.age} Y` : "N/A"}`,
      guardianName: patient.guardianName || "N/A",
      mobile: patient.mobile || "N/A",
      address: patient.address || "N/A",
      company: inv.company || patient.payer || "CASH",
      doctorName: inv.doctorName || "Dr. D K DAS",
      grossAmt: inv.grossAmt ?? inv.netAmt,
      discountAmt: inv.discountAmt ?? 0,
      netAmt: inv.netAmt || 0,
      received: (inv.paidPatient || 0) + (inv.paidPayer || 0),
      adjusted: inv.adjusted || 0,
      creditNote: inv.creditNote || 0,
      balance: inv.balance ?? 0,
      itemsJson: inv.itemsJson || JSON.stringify([
        { code: "SRV-01", name: "OP Consultation & Medical Treatment", qty: 1, rate: inv.netAmt, amount: inv.netAmt, netAmt: inv.netAmt }
      ]),
      narration: inv.remarks || "Hospital Outpatient Services",
    };

    setPrintInvoiceData(formattedData);
    setTimeout(() => {
      triggerPrintInvoice();
    }, 100);
  };

  // Handle printing a specific receipt or advance deposit
  const handlePrintSpecificReceipt = (recOrAdv: any, type: "SETTLEMENT" | "ADVANCE") => {
    const formattedReceipt: ReceiptPrintData = {
      receiptNo: recOrAdv.receiptNo || recOrAdv.advanceNo || `REC-${Date.now()}`,
      receiptDate: recOrAdv.date || recOrAdv.createdAt || new Date().toISOString(),
      uhid: recOrAdv.uhid || patient.uhid || "",
      patientName: recOrAdv.patientName || getFullName(),
      genderAge: `${patient.gender || "N/A"} / ${patient.age ? `${patient.age} Y` : "N/A"}`,
      mobile: patient.mobile || "N/A",
      guardianName: patient.guardianName || "N/A",
      address: patient.address || "N/A",
      hcf: patient.hcf || "CMK Main",
      receiptType: type,
      invoiceNo: recOrAdv.invoiceNo || undefined,
      mode: recOrAdv.mode || "Cash",
      amount: recOrAdv.amount || 0,
      bankName: recOrAdv.bankName || undefined,
      refNo: recOrAdv.refNo || undefined,
      remarks: recOrAdv.notes || recOrAdv.purpose || (type === "ADVANCE" ? "Advance Deposit Collected" : `Bill Payment for ${recOrAdv.invoiceNo || "Services"}`),
      balanceRemaining: recOrAdv.balanceAmount ?? undefined,
    };

    setPrintReceiptData(formattedReceipt);
    setTimeout(() => {
      triggerPrintReceipt();
    }, 100);
  };

  // Fetch live billing data for this patient
  const fetchLedgerData = async () => {
    if (!patient.uhid) return;
    setIsLoading(true);
    try {
      const [invRes, advRes, recRes] = await Promise.allSettled([
        getInvoices({ uhid: patient.uhid, limit: 200 }),
        getAdvances({ uhid: patient.uhid }),
        getReceipts({ uhid: patient.uhid, limit: 200 }),
      ]);

      if (invRes.status === "fulfilled") {
        setInvoices(invRes.value.invoices || []);
      }
      if (advRes.status === "fulfilled") {
        setAdvances(advRes.value || []);
      }
      if (recRes.status === "fulfilled") {
        setReceipts(recRes.value.receipts || []);
      }
    } catch (err) {
      console.error("Failed to load patient financial ledger:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerData();
  }, [patient.uhid]);

  // Combine invoices, receipts, advances into chronological passbook
  const ledgerEntries = useMemo(() => {
    const items: Array<{
      id: string;
      date: string;
      type: "INVOICE" | "RECEIPT" | "ADVANCE";
      voucherNo: string;
      description: string;
      debit: number;
      credit: number;
      balance: number;
      modeOrStatus?: string;
      rawData: any;
    }> = [];

    // 1. Invoices (Billed - Debits)
    invoices.forEach((inv) => {
      items.push({
        id: `inv-${inv.id}`,
        date: inv.date || inv.createdAt,
        type: "INVOICE",
        voucherNo: inv.invoiceNo,
        description: `Bill ${inv.type} (${inv.company || "Self"}) - ${inv.doctorName || "General Services"}`,
        debit: inv.netAmt || 0,
        credit: 0,
        balance: 0,
        modeOrStatus: inv.status,
        rawData: inv,
      });
    });

    // 2. Advances (Deposited - Credits)
    advances.forEach((adv) => {
      items.push({
        id: `adv-${adv.id}`,
        date: adv.createdAt,
        type: "ADVANCE",
        voucherNo: adv.advanceNo,
        description: `Advance Deposit (${adv.mode || "Cash"})${adv.purpose ? ` - ${adv.purpose}` : ""}`,
        debit: 0,
        credit: adv.amount || 0,
        balance: 0,
        modeOrStatus: adv.status,
        rawData: adv,
      });
    });

    // 3. Receipts / Bill Settlement Payments (Credits)
    receipts.forEach((rec) => {
      items.push({
        id: `rec-${rec.id}`,
        date: rec.date || rec.createdAt,
        type: "RECEIPT",
        voucherNo: rec.receiptNo,
        description: `Receipt Payment (${rec.mode || "Cash"}) against Bill ${rec.invoiceNo || "OP/IP"}`,
        debit: 0,
        credit: rec.amount || 0,
        balance: 0,
        modeOrStatus: rec.mode,
        rawData: rec,
      });
    });

    // Sort chronologically ascending
    items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Compute running balance
    let currentBalance = 0;
    const computedItems = items.map((item) => {
      currentBalance = currentBalance + item.debit - item.credit;
      return {
        ...item,
        balance: currentBalance,
      };
    });

    return computedItems;
  }, [invoices, advances, receipts]);

  // Financial KPI totals
  const totalBilled = useMemo(
    () => invoices.reduce((acc, inv) => acc + (inv.netAmt || 0), 0),
    [invoices]
  );
  const totalPaid = useMemo(
    () => receipts.reduce((acc, rec) => acc + (rec.amount || 0), 0),
    [receipts]
  );
  const advanceBalance = useMemo(
    () => advances.reduce((acc, adv) => acc + (adv.balanceAmount || 0), 0),
    [advances]
  );
  const netOutstanding = useMemo(() => {
    return totalBilled - totalPaid - advanceBalance;
  }, [totalBilled, totalPaid, advanceBalance]);

  // Filtered entries for search inside ledger
  const filteredLedgerEntries = useMemo(() => {
    if (!searchTerm.trim()) return ledgerEntries;
    const term = searchTerm.toLowerCase();
    return ledgerEntries.filter(
      (e) =>
        e.voucherNo.toLowerCase().includes(term) ||
        e.description.toLowerCase().includes(term) ||
        e.type.toLowerCase().includes(term)
    );
  }, [ledgerEntries, searchTerm]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount && amount !== 0) return "₹0.00";
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getFullName = () => {
    if (patient.fullName) return patient.fullName;
    const parts = [patient.title, patient.firstName, patient.middleName, patient.lastName].filter(Boolean);
    return parts.join(" ");
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-white text-slate-800 overflow-hidden">
      {/* Hidden printable Invoice Component */}
      <div className="hidden">
        {printInvoiceData && (
          <BillingInvoicePrint ref={printInvoiceRef} invoice={printInvoiceData} />
        )}
        {printReceiptData && (
          <PatientReceiptPrint ref={printReceiptRef} receipt={printReceiptData} />
        )}
      </div>

      {/* ─── Top Header ─── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/80 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
            {patient.firstName ? patient.firstName[0].toUpperCase() : "P"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 text-base leading-snug">{getFullName()}</h3>
              <Badge variant={patient.status === "Active" ? "success" : "secondary"} className="text-[10px] px-2 py-0.5">
                {patient.status || "Active"}
              </Badge>
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] font-semibold px-2 py-0.5 inline-flex items-center gap-1">
                <Building2 className="w-3 h-3 text-indigo-500 shrink-0" />
                {patient.hcf || "CMK Main"}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
              <span className="font-mono font-semibold text-blue-700">UHID: {patient.uhid || "N/A"}</span>
              <span>•</span>
              <span>{patient.gender || "N/A"} / {patient.age ? `${patient.age} Y` : "N/A"}</span>
              <span>•</span>
              <span>Mob: {patient.mobile || "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {invoices.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePrintSpecificInvoice(invoices[0])}
              className="gap-1.5 text-xs font-semibold bg-white hover:bg-slate-50 border-slate-300 text-blue-700"
              title="Print Latest Invoice"
            >
              <Printer className="h-3.5 w-3.5 text-blue-600" />
              Print Latest Invoice
            </Button>
          )}
          {(receipts.length > 0 || advances.length > 0) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (receipts.length > 0) {
                  handlePrintSpecificReceipt(receipts[0], "SETTLEMENT");
                } else if (advances.length > 0) {
                  handlePrintSpecificReceipt(advances[0], "ADVANCE");
                }
              }}
              className="gap-1.5 text-xs font-semibold bg-white hover:bg-slate-50 border-slate-300 text-emerald-700"
              title="Print Latest Receipt"
            >
              <Printer className="h-3.5 w-3.5 text-emerald-600" />
              Print Receipt
            </Button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors ml-1"
            title="Close Ledger"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ─── Financial KPI Cards Bar ─── */}
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 flex-shrink-0">
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Billed</span>
            <FileText className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <p className="text-sm font-black text-slate-800 mt-1">{formatCurrency(totalBilled)}</p>
          <span className="text-[9.5px] text-slate-400 mt-0.5 block">{invoices.length} Invoices</span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Paid</span>
            <Receipt className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <p className="text-sm font-black text-emerald-700 mt-1">{formatCurrency(totalPaid)}</p>
          <span className="text-[9.5px] text-slate-400 mt-0.5 block">{receipts.length} Receipts</span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Advance</span>
            <Wallet className="h-3.5 w-3.5 text-purple-500" />
          </div>
          <p className="text-sm font-black text-purple-700 mt-1">{formatCurrency(advanceBalance)}</p>
          <span className="text-[9.5px] text-slate-400 mt-0.5 block">{advances.length} Advance Entries</span>
        </div>

        <div className={`p-3 rounded-lg border shadow-2xs ${netOutstanding > 0 ? "bg-rose-50/70 border-rose-200" : "bg-emerald-50/70 border-emerald-200"}`}>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Net Outstanding</span>
            {netOutstanding > 0 ? (
              <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            )}
          </div>
          <p className={`text-sm font-black mt-1 ${netOutstanding > 0 ? "text-rose-700" : "text-emerald-700"}`}>
            {formatCurrency(netOutstanding)}
          </p>
          <span className="text-[9.5px] font-semibold mt-0.5 block">
            {netOutstanding > 0 ? "Payment Due" : "Account Settled"}
          </span>
        </div>
      </div>

      {/* ─── Multi-Tab Navigation Bar ─── */}
      <div className="px-5 pt-2 bg-white border-b border-slate-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("statement")}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "statement"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Ledger Passbook ({ledgerEntries.length})
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "invoices"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab("advances")}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "advances"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Advances ({advances.length})
          </button>
          <button
            onClick={() => setActiveTab("demographics")}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "demographics"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Patient Dossier
          </button>
        </div>

        <div className="flex items-center gap-2 pb-1.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={fetchLedgerData}
            title="Refresh Financial Ledger"
            className="h-7 w-7 p-0 text-slate-500 hover:bg-slate-100"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
          </Button>
        </div>
      </div>

      {/* ─── Main Content Area (Scrollable Flex-1 Container) ─── */}
      <div className="flex-1 overflow-y-auto p-5 min-h-0 bg-slate-50/40">
        {/* TAB 1: LEDGER STATEMENT PASSBOOK */}
        {activeTab === "statement" && (
          <div className="space-y-3">
            {/* Search Filter inside Ledger */}
            <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Filter transactions by voucher, particulars, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8 text-xs bg-slate-50/50"
                />
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                Showing {filteredLedgerEntries.length} entries
              </span>
            </div>

            {/* Passbook Table */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100/90 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-3.5 py-2.5">Date</th>
                      <th className="px-3.5 py-2.5">Type</th>
                      <th className="px-3.5 py-2.5">Voucher / Ref</th>
                      <th className="px-3.5 py-2.5">Particulars / Details</th>
                      <th className="px-3.5 py-2.5 text-right">Debit (₹)</th>
                      <th className="px-3.5 py-2.5 text-right">Credit (₹)</th>
                      <th className="px-3.5 py-2.5 text-right">Running Balance (₹)</th>
                      <th className="px-3.5 py-2.5 text-center">Print</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-3.5 py-3"><div className="h-3 w-16 bg-slate-200 rounded" /></td>
                          <td className="px-3.5 py-3"><div className="h-4 w-16 bg-slate-200 rounded-full" /></td>
                          <td className="px-3.5 py-3"><div className="h-3 w-20 bg-slate-200 rounded" /></td>
                          <td className="px-3.5 py-3"><div className="h-3 w-40 bg-slate-200 rounded" /></td>
                          <td className="px-3.5 py-3"><div className="h-3 w-16 bg-slate-200 rounded ml-auto" /></td>
                          <td className="px-3.5 py-3"><div className="h-3 w-16 bg-slate-200 rounded ml-auto" /></td>
                          <td className="px-3.5 py-3"><div className="h-3 w-20 bg-slate-200 rounded ml-auto" /></td>
                          <td className="px-3.5 py-3 text-center"><div className="h-6 w-6 bg-slate-200 rounded mx-auto" /></td>
                        </tr>
                      ))
                    ) : filteredLedgerEntries.length > 0 ? (
                      filteredLedgerEntries.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-3.5 py-2.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                            {formatDate(item.date)}
                          </td>
                          <td className="px-3.5 py-2.5 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase ${
                                item.type === "INVOICE"
                                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                                  : item.type === "RECEIPT"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : "bg-purple-100 text-purple-800 border border-purple-200"
                              }`}
                            >
                              {item.type === "INVOICE" && <ArrowUpRight className="w-2.5 h-2.5 text-blue-600" />}
                              {item.type === "RECEIPT" && <ArrowDownLeft className="w-2.5 h-2.5 text-emerald-600" />}
                              {item.type === "ADVANCE" && <Wallet className="w-2.5 h-2.5 text-purple-600" />}
                              {item.type}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5 font-mono font-semibold text-slate-800 whitespace-nowrap">
                            {item.voucherNo}
                          </td>
                          <td className="px-3.5 py-2.5 text-slate-700 font-medium">
                            {item.description}
                          </td>
                          <td className="px-3.5 py-2.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                            {item.debit > 0 ? formatCurrency(item.debit) : "—"}
                          </td>
                          <td className="px-3.5 py-2.5 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                            {item.credit > 0 ? formatCurrency(item.credit) : "—"}
                          </td>
                          <td className="px-3.5 py-2.5 text-right font-mono font-black text-slate-900 whitespace-nowrap">
                            {formatCurrency(item.balance)}
                          </td>
                          <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200"
                              title={item.type === "INVOICE" ? "Print Official Bill Invoice" : "Print Official Money Receipt"}
                              onClick={() => {
                                if (item.type === "INVOICE") {
                                  handlePrintSpecificInvoice(item.rawData);
                                } else if (item.type === "RECEIPT") {
                                  handlePrintSpecificReceipt(item.rawData, "SETTLEMENT");
                                } else if (item.type === "ADVANCE") {
                                  handlePrintSpecificReceipt(item.rawData, "ADVANCE");
                                }
                              }}
                            >
                              <Printer className="h-3.5 w-3.5 mr-1" />
                              Print
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center py-10 text-slate-400">
                          <Receipt className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                          <p className="font-semibold text-slate-600">No financial transactions recorded</p>
                          <p className="text-xs mt-0.5">Transactions will appear automatically as bills or advances are collected.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {ledgerEntries.length > 0 && (
                    <tfoot className="bg-slate-100 font-bold border-t border-slate-200">
                      <tr>
                        <td colSpan={4} className="px-3.5 py-2.5 text-right uppercase text-[10px] text-slate-600 tracking-wider">
                          Ledger Totals &amp; Closing Balance:
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-mono text-xs text-slate-900">
                          {formatCurrency(totalBilled)}
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-mono text-xs text-emerald-700">
                          {formatCurrency(totalPaid + advanceBalance)}
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-mono text-xs font-black text-blue-900">
                          {formatCurrency(netOutstanding)}
                        </td>
                        <td className="px-3.5 py-2.5 text-center text-slate-400">•</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INVOICES TABLE */}
        {activeTab === "invoices" && (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100/90 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-3.5 py-2.5">Invoice No</th>
                    <th className="px-3.5 py-2.5">Date</th>
                    <th className="px-3.5 py-2.5">Type</th>
                    <th className="px-3.5 py-2.5">Doctor / Dept</th>
                    <th className="px-3.5 py-2.5 text-right">Net Amount</th>
                    <th className="px-3.5 py-2.5 text-right">Paid</th>
                    <th className="px-3.5 py-2.5 text-right">Balance</th>
                    <th className="px-3.5 py-2.5">Status</th>
                    <th className="px-3.5 py-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.length > 0 ? (
                    invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/80">
                        <td className="px-3.5 py-2.5 font-mono font-semibold text-blue-600">{inv.invoiceNo}</td>
                        <td className="px-3.5 py-2.5 font-mono text-slate-500">{formatDate(inv.date || inv.createdAt)}</td>
                        <td className="px-3.5 py-2.5">
                          <Badge variant="outline" className="text-[9px] font-bold py-0.2 px-1.5">
                            {inv.type}
                          </Badge>
                        </td>
                        <td className="px-3.5 py-2.5 text-slate-700">{inv.doctorName || "General"}</td>
                        <td className="px-3.5 py-2.5 text-right font-mono font-bold text-slate-900">{formatCurrency(inv.netAmt)}</td>
                        <td className="px-3.5 py-2.5 text-right font-mono font-bold text-emerald-700">{formatCurrency((inv.paidPatient || 0) + (inv.paidPayer || 0))}</td>
                        <td className="px-3.5 py-2.5 text-right font-mono font-bold text-rose-700">{formatCurrency(inv.balance)}</td>
                        <td className="px-3.5 py-2.5">
                          <Badge
                            variant={inv.status === "Settled" ? "success" : "warning"}
                            className="text-[9px] px-1.5 py-0.2"
                          >
                            {inv.status}
                          </Badge>
                        </td>
                        <td className="px-3.5 py-2.5 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2.5 text-xs font-bold text-blue-700 border-blue-200 hover:bg-blue-50 gap-1"
                            onClick={() => handlePrintSpecificInvoice(inv)}
                          >
                            <Printer className="h-3.5 w-3.5 text-blue-600" />
                            Print Bill
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-slate-400">
                        No invoices generated for this patient.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ADVANCE DEPOSITS */}
        {activeTab === "advances" && (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100/90 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-3.5 py-2.5">Advance No</th>
                    <th className="px-3.5 py-2.5">Date</th>
                    <th className="px-3.5 py-2.5">Mode</th>
                    <th className="px-3.5 py-2.5">Purpose / Remarks</th>
                    <th className="px-3.5 py-2.5 text-right">Collected Amount</th>
                    <th className="px-3.5 py-2.5 text-right">Adjusted</th>
                    <th className="px-3.5 py-2.5 text-right">Available Balance</th>
                    <th className="px-3.5 py-2.5">Status</th>
                    <th className="px-3.5 py-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {advances.length > 0 ? (
                    advances.map((adv) => (
                      <tr key={adv.id} className="hover:bg-slate-50/80">
                        <td className="px-3.5 py-2.5 font-mono font-semibold text-purple-600">{adv.advanceNo}</td>
                        <td className="px-3.5 py-2.5 font-mono text-slate-500">{formatDate(adv.createdAt)}</td>
                        <td className="px-3.5 py-2.5 text-slate-700 font-medium">{adv.mode || "Cash"}</td>
                        <td className="px-3.5 py-2.5 text-slate-600">{adv.purpose || "OP/IP Advance Deposit"}</td>
                        <td className="px-3.5 py-2.5 text-right font-mono font-bold text-slate-900">{formatCurrency(adv.amount)}</td>
                        <td className="px-3.5 py-2.5 text-right font-mono font-semibold text-slate-600">{formatCurrency(adv.adjustedAmount)}</td>
                        <td className="px-3.5 py-2.5 text-right font-mono font-bold text-purple-700">{formatCurrency(adv.balanceAmount)}</td>
                        <td className="px-3.5 py-2.5">
                          <Badge
                            variant={adv.status === "Active" ? "success" : "secondary"}
                            className="text-[9px] px-1.5 py-0.2"
                          >
                            {adv.status}
                          </Badge>
                        </td>
                        <td className="px-3.5 py-2.5 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2.5 text-xs font-bold text-purple-700 border-purple-200 hover:bg-purple-50 gap-1"
                            onClick={() => handlePrintSpecificReceipt(adv, "ADVANCE")}
                          >
                            <Printer className="h-3.5 w-3.5 text-purple-600" />
                            Print Receipt
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-slate-400">
                        No advance deposit records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: PATIENT DEMOGRAPHICS & DOSSIER */}
        {activeTab === "demographics" && (
          <div className="space-y-5">
            {/* Quick Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
              <div>
                <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block">Registration Type</span>
                <span className="font-semibold text-slate-800 block mt-0.5">{patient.registrationType || "New Registration"}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block">Branch / HCF</span>
                <span className="font-semibold text-indigo-700 block mt-0.5 flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-indigo-500" />
                  {patient.hcf || "CMK Main"}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block">Gender / Age</span>
                <span className="font-semibold text-slate-800 block mt-0.5">{patient.gender || "N/A"} / {patient.age ? `${patient.age} Y` : "N/A"}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block">Mobile Number</span>
                <span className="font-semibold text-slate-800 block mt-0.5">{patient.mobile || "N/A"}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block">Registration Date</span>
                <span className="font-semibold text-slate-800 block mt-0.5">{formatDate(patient.regDate)}</span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              {/* Personal Information */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-2.5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <User className="h-3.5 w-3.5 text-blue-500" />
                  Personal Info
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Attendant Relation &amp; Name</span>
                    <span className="font-semibold text-slate-800">{patient.guardianRelation || "Relation"} — {patient.guardianName || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Date of Birth</span>
                    <span className="font-semibold text-slate-800">{formatDate(patient.dob)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Marital Status</span>
                    <span className="font-semibold text-slate-800">{patient.maritalStatus || "Single"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email Address</span>
                    <span className="font-semibold text-slate-800 truncate block">{patient.email || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-2.5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <Phone className="h-3.5 w-3.5 text-emerald-500" />
                  Contact Details
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Address</span>
                    <span className="font-semibold text-slate-800 block whitespace-pre-wrap">{patient.address || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Country / State</span>
                    <span className="font-semibold text-slate-800">{patient.country || "India"} / {patient.state || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">City / Area / PIN</span>
                    <span className="font-semibold text-slate-800">
                      {[patient.districtCity, patient.area, patient.pinCode].filter(Boolean).join(", ") || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-2.5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                  Emergency Contact
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Contact Name</span>
                    <span className="font-semibold text-slate-800">{patient.emergencyName || "N/A"} ({patient.emergencyRelationship || "N/A"})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Contact Number</span>
                    <span className="font-semibold text-slate-800">{patient.emergencyContact || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Identity & Flags */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-2.5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <Shield className="h-3.5 w-3.5 text-purple-500" />
                  Identity &amp; Flags
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Aadhaar / PAN / Nationality</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {patient.aadhaarCard || "N/A"} / {patient.panNo || "N/A"} / {patient.nationality || "Indian"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {patient.isVip && <Badge variant="destructive" className="text-[8px] py-0 px-1.5">VIP</Badge>}
                    {patient.handleWithCare && <Badge className="text-[8px] py-0 px-1.5 bg-amber-500 text-white">Handle With Care</Badge>}
                    {patient.nameMasking && <Badge className="text-[8px] py-0 px-1.5 bg-slate-600 text-white">Name Masked</Badge>}
                  </div>
                </div>
              </div>

              {/* Payer & Referral */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-2.5 sm:col-span-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <CreditCard className="h-3.5 w-3.5 text-amber-500" />
                  Payer &amp; Referral Info
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Payer / Sponsor</span>
                    <span className="font-semibold text-slate-800 capitalize">{patient.payerType || "direct"} — {patient.payer || "CASH"} {patient.sponsor ? `(${patient.sponsor})` : ""}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Provider / HCF</span>
                    <span className="font-semibold text-slate-800">{patient.provider || "Self"} / {patient.hcf || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Footer Action Bar ─── */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs font-semibold bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
            onClick={() => (window.location.href = `/billing?uhid=${patient.uhid}`)}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Go To Billing Module
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs font-medium bg-white">
          Close Ledger
        </Button>
      </div>
    </div>
  );
}
