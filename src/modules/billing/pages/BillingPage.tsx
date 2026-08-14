import { useState, useEffect, useCallback, useMemo } from "react";
import { ReceiptText, DollarSign, TrendingUp, Clock, Search, Filter, ArrowRight, ShieldCheck, X, Plus, Trash2, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast-notification";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getInvoices, settleInvoice, cancelInvoice, InvoiceData } from "@/api/billingApi";

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface BillingPatient {
  uhid: string;
  ipNo: string;
  patientName: string;
  genderAge: string;
  admissionDate: string;
  bedNo: string;
  billingCategory: string;
  doctor: string;
  encounterStatus: string;
  company: string;
  mobileNo: string;
  type: "Registration" | "Admission" | "Discharge But Not Bill" | "Discharge";
  isMlc?: boolean;
  isVip?: boolean;
}

export type InvoiceActivity = InvoiceData;

// ─── Initial Mock Data ────────────────────────────────────────────────────────
const INITIAL_PATIENTS: BillingPatient[] = [
  {
    uhid: "222",
    ipNo: "21/3",
    patientName: "Mr. Somesh Kumar",
    genderAge: "Male/28 Yr",
    admissionDate: "2026-08-11T16:30:00",
    bedNo: "GEN-01",
    billingCategory: "GENERAL WARD / DELUXE ROOM",
    doctor: "Abhishek Bansal 2273",
    encounterStatus: "Open",
    company: "CASH / CASH",
    mobileNo: "9695960777",
    type: "Admission",
    isMlc: false,
    isVip: false,
  },
  {
    uhid: "44",
    ipNo: "21/2",
    patientName: "Mr. Demo Patient",
    genderAge: "Male/35 Yr",
    admissionDate: "2026-08-01T20:49:00",
    bedNo: "DLX-02",
    billingCategory: "DELUXE ROOM / DELUXE ROOM",
    doctor: "D K DAS 2268",
    encounterStatus: "Marked For Discharged",
    company: "CASH / CASH",
    mobileNo: "2587413550",
    type: "Admission",
    isMlc: false,
    isVip: true,
  },
  {
    uhid: "105",
    ipNo: "21/8",
    patientName: "Mrs. Anita Sharma",
    genderAge: "Female/42 Yr",
    admissionDate: "2026-08-12T10:15:00",
    bedNo: "ICU-04",
    billingCategory: "ICU / SPECIAL CATEGORY",
    doctor: "Rajesh Malhotra 1104",
    encounterStatus: "Pharmacy Clearance",
    company: "TATA AIG Insurance",
    mobileNo: "9812457890",
    type: "Admission",
    isMlc: true,
    isVip: false,
  },
  {
    uhid: "303",
    ipNo: "21/9",
    patientName: "Master Rohan Verma",
    genderAge: "Male/12 Yr",
    admissionDate: "2026-08-13T08:30:00",
    bedNo: "PED-02",
    billingCategory: "PEDIATRIC / GENERAL",
    doctor: "Sania Mirza 2231",
    encounterStatus: "Bill Prepared",
    company: "CASH / CASH",
    mobileNo: "9876543210",
    type: "Discharge",
    isMlc: false,
    isVip: false,
  }
];

const STATS = [
  { label: "Today's Revenue", value: "₹1,24,500", icon: DollarSign, trend: "+12%", color: "text-emerald-500", bg: "bg-emerald-50" },
  { label: "Pending Bills", value: "23", icon: Clock, trend: "4 overdue", color: "text-amber-500", bg: "bg-amber-50" },
  { label: "This Month", value: "₹18,50,000", icon: TrendingUp, trend: "+8%", color: "text-blue-500", bg: "bg-blue-50" },
  { label: "Total Invoices", value: "342", icon: ReceiptText, trend: "Today: 18", color: "text-purple-500", bg: "bg-purple-50" },
];

export default function BillingPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<string>("Patient Lists");
  const [activeSubTab, setActiveSubTab] = useState<string>("Invoice Details");

  // State Management
  const [patients, setPatients] = useState<BillingPatient[]>(INITIAL_PATIENTS);
  const [invoices, setInvoices] = useState<InvoiceActivity[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [printInvoiceData, setPrintInvoiceData] = useState<InvoiceActivity | null>(null);

  // Filters State
  const [patientSearch, setPatientSearch] = useState("");
  const [patientSearchOn, setPatientSearchOn] = useState("Patient Name");
  const [patientTypeFilter, setPatientTypeFilter] = useState<string>("Admission");
  const [patientStatusFilter, setPatientStatusFilter] = useState("all");

  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("all"); // all, settled, unsettled

  // Settlement Modal State
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceActivity | null>(null);
  
  // Patient Search Modal State
  const [isPatientSearchModalOpen, setIsPatientSearchModalOpen] = useState(false);
  const [modalSearchTerm, setModalSearchTerm] = useState("");

  // Create OP Visit Form State
  const [opUhid, setOpUhid] = useState("");
  const [opStatus, setOpStatus] = useState("Open");
  const [opPayerType, setOpPayerType] = useState("");
  const [opPayer, setOpPayer] = useState("");
  const [opSponsor, setOpSponsor] = useState("");
  const [opNetwork, setOpNetwork] = useState("");
  const [opDoctor, setOpDoctor] = useState("");

  // OP Billing states
  const [opBillingUhid, setOpBillingUhid] = useState("");
  const [opBillingVisitNo, setOpBillingVisitNo] = useState("");
  const [opBillingYear, setOpBillingYear] = useState("26-27");
  const [opBillingType, setOpBillingType] = useState("Credit");
  const [opBillingPayerType, setOpBillingPayerType] = useState("Insurance");
  const [opBillingPayer, setOpBillingPayer] = useState("");
  const [opBillingSponsor, setOpBillingSponsor] = useState("");
  const [opBillingNetwork, setOpBillingNetwork] = useState("");
  const [opBillingDoctor, setOpBillingDoctor] = useState("");
  const [opBillingReferredType, setOpBillingReferredType] = useState("SELF");
  const [opBillingReferredName, setOpBillingReferredName] = useState("");
  const [opBillingSubTab, setOpBillingSubTab] = useState("Service");
  const [opBillingPaymentRows, setOpBillingPaymentRows] = useState<Array<{
    mode: string;
    amount: number;
    balance: number;
    date: string;
    bankName: string;
    beneficiaryName: string;
    refNo: string;
    description: string;
    cardSwipingValue: number;
  }>>([{ mode: "Cash", amount: 0, balance: 0, date: new Date().toLocaleDateString("en-GB"), bankName: "", beneficiaryName: "", refNo: "", description: "", cardSwipingValue: 0 }]);
  const [opBillingNarration, setOpBillingNarration] = useState("");

  // IP Billing states
  const [ipBillingUhid, setIpBillingUhid] = useState("");
  const [ipBillingSubTab, setIpBillingSubTab] = useState("Department Wise");
  const [ipBillingType, setIpBillingType] = useState("Cash");
  const [ipBillingPayer, setIpBillingPayer] = useState("");
  const [ipBillingSponsor, setIpBillingSponsor] = useState("");
  const [ipBillingNetwork, setIpBillingNetwork] = useState("");
  const [ipBillingConsultant, setIpBillingConsultant] = useState("");
  const [ipBillingCategory, setIpBillingCategory] = useState("");
  
  // Payment split grid state
  const [paymentRows, setPaymentRows] = useState<Array<{
    mode: string;
    amount: number;
    balance: number;
    date: string;
    bankName: string;
    beneficiaryName: string;
    refNo: string;
    description: string;
    cardSwipingValue: number;
  }>>([{ mode: "Cash", amount: 0, balance: 0, date: new Date().toLocaleDateString("en-GB"), bankName: "", beneficiaryName: "", refNo: "", description: "", cardSwipingValue: 0 }]);
  const [settlementNotes, setSettlementNotes] = useState("");

  // Add row to payment modes table
  const addPaymentRow = () => {
    setPaymentRows([...paymentRows, { mode: "-Select-", amount: 0, balance: 0, date: new Date().toLocaleDateString("en-GB"), bankName: "", beneficiaryName: "", refNo: "", description: "", cardSwipingValue: 0 }]);
  };

  const removePaymentRow = (index: number) => {
    const updated = paymentRows.filter((_, idx) => idx !== index);
    setPaymentRows(updated);
  };

  const updatePaymentField = (index: number, field: string, value: any) => {
    const updated = paymentRows.map((row, idx) => {
      if (idx === index) {
        return { ...row, [field]: value };
      }
      return row;
    });
    setPaymentRows(updated);
  };

  const fetchInvoices = useCallback(async () => {
    setIsLoadingInvoices(true);
    try {
      const data = await getInvoices({
        search: invoiceSearch,
        status: invoiceStatusFilter,
      });
      setInvoices(data.invoices || []);
    } catch (err: any) {
      console.error("Failed to fetch invoices:", err);
      setInvoices([]);
    } finally {
      setIsLoadingInvoices(false);
    }
  }, [invoiceSearch, invoiceStatusFilter]);

  useEffect(() => {
    if (activeTab === "Master Activity List") {
      fetchInvoices();
    }
  }, [activeTab, fetchInvoices]);

  const handleOpenSettlement = (invoice: InvoiceActivity) => {
    setSelectedInvoice(invoice);
    const amount = Math.abs(invoice.balance);
    setSettlementNotes("");
    setPaymentRows([{ mode: "Cash", amount, balance: 0, date: new Date().toLocaleDateString("en-GB"), bankName: "", beneficiaryName: "", refNo: "", description: "", cardSwipingValue: 0 }]);
    setIsSettleModalOpen(true);
  };

  const handleCancelInvoice = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this invoice?")) return;
    try {
      await cancelInvoice(id);
      toast.success("Invoice Cancelled", "Invoice status successfully updated to Cancelled.");
      fetchInvoices();
    } catch (err: any) {
      toast.error("Failed to Cancel Invoice", err.message || "Something went wrong.");
    }
  };

  const handleSaveOpVisit = () => {
    if (!opUhid.trim()) {
      toast.error("Required Field", "Please enter a valid UHID.");
      return;
    }
    if (!opDoctor || opDoctor === "-Select-") {
      toast.error("Required Field", "Please select a doctor.");
      return;
    }

    toast.success("OP Visit Created", `Successfully created OP visit for UHID ${opUhid} with doctor ${opDoctor}.`);
    setOpUhid("");
    setOpPayerType("");
    setOpPayer("");
    setOpSponsor("");
    setOpNetwork("");
    setOpDoctor("");
  };

  const addOpBillingPaymentRow = () => {
    setOpBillingPaymentRows([...opBillingPaymentRows, { mode: "-Select-", amount: 0, balance: 0, date: new Date().toLocaleDateString("en-GB"), bankName: "", beneficiaryName: "", refNo: "", description: "", cardSwipingValue: 0 }]);
  };

  const removeOpBillingPaymentRow = (index: number) => {
    if (opBillingPaymentRows.length === 1) return;
    setOpBillingPaymentRows(opBillingPaymentRows.filter((_, idx) => idx !== index));
  };

  const handleSaveOpBilling = () => {
    if (!opBillingUhid.trim()) {
      toast.error("Required Field", "Please enter a valid UHID.");
      return;
    }
    if (!opBillingDoctor || opBillingDoctor === "-Select-") {
      toast.error("Required Field", "Please select a doctor.");
      return;
    }

    toast.success("OP Invoice Saved", `OP Invoice for UHID ${opBillingUhid} has been successfully generated.`);
    setOpBillingUhid("");
    setOpBillingVisitNo("");
    setOpBillingPayer("");
    setOpBillingSponsor("");
    setOpBillingNetwork("");
    setOpBillingDoctor("");
    setOpBillingNarration("");
    setOpBillingPaymentRows([{ mode: "Cash", amount: 0, balance: 0, date: new Date().toLocaleDateString("en-GB"), bankName: "", beneficiaryName: "", refNo: "", description: "", cardSwipingValue: 0 }]);
  };

  const handleSaveSettlement = async () => {
    if (!selectedInvoice) return;

    const totalPaid = paymentRows.reduce((sum, r) => sum + Number(r.amount || 0), 0);
    if (totalPaid <= 0) {
      toast.error("Invalid Amount", "Please specify a split receipt amount greater than 0.");
      return;
    }

    const isRefund = selectedInvoice.status === "Refundable" || selectedInvoice.balance < 0;
    if (isRefund && !settlementNotes.trim()) {
      toast.error("Required Field", "Please fill the required Notes/Remarks for the refund.");
      return;
    }

    try {
      await settleInvoice({
        invoiceId: selectedInvoice.id,
        payments: paymentRows.map((r) => {
          let type = "Settlement";
          if (r.mode === "CreditNote") type = "CreditNote";
          else if (r.mode === "TDS") type = "TDS";
          else if (isRefund) {
            type = "Refund";
          }

          return {
            mode: r.mode === "CreditNote" || r.mode === "TDS" ? r.mode : r.mode,
            amount: r.amount,
            bankName: r.bankName === "-Select-" ? undefined : r.bankName,
            beneficiaryName: r.beneficiaryName === "-Select-" ? undefined : r.beneficiaryName,
            refNo: r.refNo,
            type,
            notes: isRefund ? settlementNotes : undefined,
          };
        }),
      });

      toast.success(
        isRefund ? "Refund Saved Successfully!" : "Receipt Saved Successfully!",
        isRefund 
          ? `Processed refund of ₹${totalPaid} on Invoice ${selectedInvoice.invoiceNo}.`
          : `Processed receipt settlement of ₹${totalPaid} on Invoice ${selectedInvoice.invoiceNo}.`
      );
      setIsSettleModalOpen(false);
      setSelectedInvoice(null);
      fetchInvoices();
    } catch (err: any) {
      toast.error("Settlement Failed", err.message || "Something went wrong.");
    }
  };

  // Filter handlers
  const filteredPatients = patients.filter((p) => {
    // filter type
    if (patientTypeFilter && p.type !== patientTypeFilter) return false;
    
    // filter status
    if (patientStatusFilter !== "all" && p.encounterStatus !== patientStatusFilter) return false;

    // filter search
    if (patientSearch) {
      const term = patientSearch.toLowerCase();
      if (patientSearchOn === "Patient Name") return p.patientName.toLowerCase().includes(term);
      if (patientSearchOn === "UHID") return p.uhid.includes(term);
      if (patientSearchOn === "IP No.") return p.ipNo.includes(term);
      if (patientSearchOn === "Mobile #") return p.mobileNo.includes(term);
      if (patientSearchOn === "Bed No") return p.bedNo.toLowerCase().includes(term);
      if (patientSearchOn === "Doctor Name") return p.doctor.toLowerCase().includes(term);
      if (patientSearchOn === "Company") return p.company.toLowerCase().includes(term);
      if (patientSearchOn === "Patient Address") return p.patientName.toLowerCase().includes(term);
    }
    return true;
  });

  const filteredInvoices = invoices.filter((inv) => {
    // filter status
    if (invoiceStatusFilter === "settled" && inv.status !== "Settled") return false;
    if (invoiceStatusFilter === "unsettled" && inv.status !== "Outstanding") return false;

    // filter search
    if (invoiceSearch) {
      const term = invoiceSearch.toLowerCase();
      return (
        inv.patientName.toLowerCase().includes(term) ||
        inv.uhid.includes(term) ||
        inv.invoiceNo.toLowerCase().includes(term)
      );
    }
    return true;
  });

  // Dynamic patient lookup for OP Billing
  const opBillingPatientInfo = useMemo(() => {
    if (opBillingUhid.trim() === "2710") {
      return {
        name: "Mr. Raj Pal Yadav",
        genderAge: "Male/70 Yr",
        address: "ETAH UTTAR PRADESH",
        doctor: "Dr. Sameer Sen 3105",
        payerType: "Direct Patient",
        payer: "CASH",
        sponsor: "CASH",
        network: "Select"
      };
    }
    
    const found = patients.find(p => p.uhid === opBillingUhid.trim());
    if (found) {
      return {
        name: found.patientName,
        genderAge: `${found.gender || "Male"}/${found.age || "35"} Yr`,
        address: "NEW DELHI, INDIA",
        doctor: found.doctor.includes("Bansal") ? "Dr. Abhishek Bansal 2273" : "Dr. Sameer Sen 3105",
        payerType: found.company ? "Corporate" : "Direct Patient",
        payer: found.company || "CASH",
        sponsor: found.company || "CASH",
        network: "Select"
      };
    }

    return null;
  }, [opBillingUhid, patients]);

  useEffect(() => {
    if (opBillingPatientInfo) {
      setOpBillingPayerType(opBillingPatientInfo.payerType);
      setOpBillingPayer(opBillingPatientInfo.payer);
      setOpBillingSponsor(opBillingPatientInfo.sponsor);
      setOpBillingDoctor(opBillingPatientInfo.doctor);
      setOpBillingNetwork(opBillingPatientInfo.network);
    } else {
      setOpBillingPayerType("Insurance");
      setOpBillingPayer("");
      setOpBillingSponsor("");
      setOpBillingDoctor("");
      setOpBillingNetwork("");
    }
  }, [opBillingPatientInfo]);

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-slate-50/60 p-5 space-y-4 overflow-y-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Billing & Payments</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage patient transactions, activity lists, and settlement receipts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-2">
            <ReceiptText className="h-4 w-4" />
            New OP Visit
          </Button>
        </div>
      </div>



      {/* Billing Modules Horizontal sub-navigation tabs */}
      <div className="border-b border-slate-200 bg-white px-4 pt-2.5 rounded-t-xl flex-shrink-0 flex items-center overflow-x-auto gap-2">
        {[
          "Patient Lists",
          "Master Activity List",
          "Create OP Visit",
          "OP Order",
          "OP Billing",
          "IP Billing",
          "Refund",
          "Advance Collection",
          "Credit Note",
          "Intimation",
          "UnBilled Orders"
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              if (
                tab === "Patient Lists" || 
                tab === "Master Activity List" || 
                tab === "Create OP Visit" ||
                tab === "OP Billing" ||
                tab === "IP Billing"
              ) {
                setActiveTab(tab);
              } else {
                toast.success(`${tab} Pressed`, "Tab placeholder activated successfully.");
              }
            }}
            className={`h-8 border-b-2 px-3 pb-1 text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Dynamic Content Cards */}
      <div className="flex-1 min-h-0 flex flex-col">
        {activeTab === "Patient Lists" && (
          <Card className="flex-1 flex flex-col overflow-hidden">
            {/* Table Header Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 select-none flex-shrink-0">
              <span>Patient Lists</span>
              <div className="flex items-center gap-4 text-[11px] font-semibold">
                <span className="text-red-500">Total Record(s) Found - {filteredPatients.length}</span>
                <span className="text-red-500">Discharge Intimation - 0</span>
                <span className="text-blue-600">Marked For Discharge (0)</span>
                <div className="flex items-center gap-1.5 ml-2">
                  <Button
                    variant="outline"
                    size="xs"
                    className="h-6 px-3 bg-blue-600 hover:bg-blue-700 border-blue-600 text-white font-bold"
                    onClick={() => {}}
                  >
                    Filter
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    className="h-6 px-3 bg-blue-600 hover:bg-blue-700 border-blue-600 text-white font-bold"
                    onClick={() => {
                      setPatientSearch("");
                      setPatientStatusFilter("all");
                      setPatientTypeFilter("Admission");
                    }}
                  >
                    Clear Filter
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    className="h-6 px-3 bg-blue-600 hover:bg-blue-700 border-blue-600 text-white font-bold"
                    onClick={() => {}}
                  >
                    Excel Export
                  </Button>
                </div>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="p-3 border-b border-slate-100 bg-white flex-shrink-0 flex items-center justify-between flex-wrap gap-4 text-xs font-medium text-slate-700">
              <div className="flex items-center gap-6 flex-wrap">
                {/* Status Dropdown */}
                <div className="flex items-center gap-2">
                  <span>Status</span>
                  <Select value={patientStatusFilter} onValueChange={setPatientStatusFilter}>
                    <SelectTrigger className="h-7 text-xs w-44 bg-white border-slate-200">
                      <SelectValue placeholder="Select All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Select All</SelectItem>
                      <SelectItem value="Open" className="bg-[#abbfda]/40 hover:bg-[#abbfda]/60">Open</SelectItem>
                      <SelectItem value="Marked For Discharged" className="bg-[#fffee0] hover:bg-[#fffee0]/80">Marked For Discharged</SelectItem>
                      <SelectItem value="Sent For Billing" className="bg-[#eedaff] hover:bg-[#eedaff]/80">Sent For Billing</SelectItem>
                      <SelectItem value="Pharmacy Clearance" className="bg-[#d8fcd0] hover:bg-[#d8fcd0]/80">Pharmacy Clearance</SelectItem>
                      <SelectItem value="File Received" className="bg-[#fcd09a] hover:bg-[#fcd09a]/80">File Received</SelectItem>
                      <SelectItem value="Send to TPA for Approval" className="bg-[#badafc] hover:bg-[#badafc]/80">Send to TPA for Approval</SelectItem>
                      <SelectItem value="Bill Prepared" className="bg-[#fcd0d0] hover:bg-[#fcd0d0]/80">Bill Prepared</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Search On dropdown + query input */}
                <div className="flex items-center gap-2">
                  <span>Search On</span>
                  <Select value={patientSearchOn} onValueChange={setPatientSearchOn}>
                    <SelectTrigger className="h-7 text-xs w-36 bg-white border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UHID">UHID</SelectItem>
                      <SelectItem value="IP No.">IP No.</SelectItem>
                      <SelectItem value="Mobile #">Mobile #</SelectItem>
                      <SelectItem value="Patient Name">Patient Name</SelectItem>
                      <SelectItem value="Bed No">Bed No</SelectItem>
                      <SelectItem value="Doctor Name">Doctor Name</SelectItem>
                      <SelectItem value="Admission Date">Admission Date</SelectItem>
                      <SelectItem value="Company">Company</SelectItem>
                      <SelectItem value="Father Name">Father Name</SelectItem>
                      <SelectItem value="Mother Name">Mother Name</SelectItem>
                      <SelectItem value="Patient Address">Patient Address</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    className="h-7 text-xs w-44 bg-white border-slate-200 px-2"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    placeholder=""
                  />
                </div>
              </div>

              {/* Radio Group */}
              <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-700">
                {[
                  { value: "Registration", label: "Registration" },
                  { value: "Admission", label: "Admission" },
                  { value: "Discharge But Not Bill", label: "Discharge But Not Bill" },
                  { value: "Discharge", label: "Discharge" }
                ].map((item) => (
                  <label key={item.value} className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="patient-type"
                      checked={patientTypeFilter === item.value}
                      onChange={() => setPatientTypeFilter(item.value)}
                      className="h-3.5 w-3.5 text-primary border-slate-300 focus:ring-0"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto flex-1 bg-white">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2.5 font-bold">UHID</th>
                    <th className="px-4 py-2.5 font-bold">IP No.</th>
                    <th className="px-4 py-2.5 font-bold">Patient Name</th>
                    <th className="px-4 py-2.5 font-bold">Gender/Age</th>
                    <th className="px-4 py-2.5 font-bold">Admission Date</th>
                    <th className="px-4 py-2.5 font-bold">Bed No</th>
                    <th className="px-4 py-2.5 font-bold">Bed/Billing Category</th>
                    <th className="px-4 py-2.5 font-bold">Doctor</th>
                    <th className="px-4 py-2.5 font-bold">Encounter Status</th>
                    <th className="px-4 py-2.5 font-bold">Company</th>
                    <th className="px-4 py-2.5 font-bold">MobileNo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((p) => {
                      const isDiffCategory = p.billingCategory && p.billingCategory.includes("/") &&
                        p.billingCategory.split("/")[0].trim() !== p.billingCategory.split("/")[1].trim();
                      
                      let rowBgClass = "hover:bg-slate-50/50";
                      if (p.isMlc) rowBgClass = "bg-red-50/40 hover:bg-red-50/60";
                      else if (p.isVip) rowBgClass = "bg-cyan-50/40 hover:bg-cyan-50/60";
                      else if (p.type === "Discharge") rowBgClass = "bg-orange-50/20 hover:bg-orange-50/40";

                      return (
                        <tr key={p.uhid} className={`transition-colors ${rowBgClass}`}>
                          <td className="px-4 py-3 font-mono text-primary">{p.uhid}</td>
                          <td className="px-4 py-3 text-emerald-700 font-semibold underline cursor-pointer">{p.ipNo}</td>
                          <td className="px-4 py-3 font-bold text-slate-800">{p.patientName}</td>
                          <td className="px-4 py-3 text-slate-500">{p.genderAge}</td>
                          <td className="px-4 py-3 text-slate-600">
                            {new Date(p.admissionDate).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                          </td>
                          <td className="px-4 py-3 text-slate-800">{p.bedNo}</td>
                          <td className={`px-4 py-3 text-[10px] truncate max-w-[150px] font-semibold ${
                            isDiffCategory ? "bg-[#f6efe7] border-l-2 border-[#d7bba0] text-[#7c5e3d]" : "text-slate-500"
                          }`}>
                            {p.billingCategory}
                          </td>
                          <td className="px-4 py-3 text-slate-600 text-[10px]">{p.doctor}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded border ${
                              p.encounterStatus === "Open"
                                ? "bg-[#abbfda] text-slate-800 border-[#94adc9]"
                                : p.encounterStatus === "Marked For Discharged"
                                ? "bg-[#fffee0] text-amber-900 border-[#eae8b3]"
                                : p.encounterStatus === "Sent For Billing"
                                ? "bg-[#eedaff] text-purple-950 border-[#dac0f3]"
                                : p.encounterStatus === "Pharmacy Clearance"
                                ? "bg-[#d8fcd0] text-emerald-950 border-[#bfebb6]"
                                : p.encounterStatus === "File Received"
                                ? "bg-[#fcd09a] text-orange-950 border-[#e9bc83]"
                                : p.encounterStatus === "Send to TPA for Approval"
                                ? "bg-[#badafc] text-blue-950 border-[#a2c8ec]"
                                : p.encounterStatus === "Bill Prepared"
                                ? "bg-[#fcd0d0] text-red-950 border-[#ecb5b5]"
                                : "bg-slate-100 text-slate-700 border-slate-300"
                            }`}>
                              {p.encounterStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-[10px]">{p.company}</td>
                          <td className="px-4 py-3 text-slate-600">{p.mobileNo}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={11} className="px-4 py-12 text-center text-slate-400">
                        No patient encounters found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Legend Bar */}
            <div className="border-t border-slate-200 px-4 py-2.5 bg-slate-50 text-[10px] text-slate-600 flex items-center gap-4 flex-wrap select-none flex-shrink-0">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] mr-1">Legend:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 bg-red-100 border border-red-300 rounded"></span>
                <span>MLC Patient</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 bg-cyan-100 border border-cyan-300 rounded"></span>
                <span>VIP Patient</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 bg-orange-100 border border-orange-300 rounded"></span>
                <span>Discharge Patient</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 bg-[#f6efe7] border border-[#d7bba0] rounded"></span>
                <span>Diff Bed/Bill Category</span>
              </div>
            </div>
          </Card>
        )}
        {activeTab === "Create OP Visit" && (
          <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-none">
            {/* Header bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-[#cee6f8] text-xs font-bold text-slate-700 flex-shrink-0 select-none">
              <span className="text-sm font-bold text-slate-800">Create OP Visit</span>
              
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-800 text-[11px]">UHID</span>
                <Input 
                  type="text" 
                  value={opUhid} 
                  onChange={(e) => setOpUhid(e.target.value)} 
                  className="h-6 text-xs w-48 bg-white border-slate-300 font-mono font-bold" 
                  placeholder=""
                />
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setOpUhid("");
                    setOpStatus("Open");
                    setOpPayerType("");
                    setOpPayer("");
                    setOpSponsor("");
                    setOpNetwork("");
                    setOpDoctor("");
                  }} 
                  className="h-7 text-xs bg-white text-slate-700 border-slate-300 hover:bg-slate-50 px-4 font-bold"
                >
                  New
                </Button>
                <Button 
                  onClick={handleSaveOpVisit}
                  size="sm" 
                  className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-4"
                >
                  Save
                </Button>
              </div>
            </div>

            {/* Layout body */}
            <div className="p-6 bg-white grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-y-auto">
              {/* Patient Details */}
              <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-white shadow-xs">
                <h4 className="text-xs font-bold text-[#7c5e3d] border-b pb-2 uppercase tracking-wide">Patient Details</h4>
                <div className="flex flex-col items-center justify-center py-4 space-y-5">
                  <div className="w-32 h-32 rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden shadow-inner">
                    <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                      <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-5 text-xs font-bold text-slate-700 pt-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="radio" 
                        name="op-status" 
                        value="Open" 
                        checked={opStatus === "Open"} 
                        onChange={() => setOpStatus("Open")} 
                        className="h-3.5 w-3.5 text-primary border-slate-300 focus:ring-0" 
                      />
                      <span>Open</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="radio" 
                        name="op-status" 
                        value="Closed" 
                        checked={opStatus === "Closed"} 
                        onChange={() => setOpStatus("Closed")} 
                        className="h-3.5 w-3.5 text-primary border-slate-300 focus:ring-0" 
                      />
                      <span>Closed</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Payer Details */}
              <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-white shadow-xs">
                <h4 className="text-xs font-bold text-[#7c5e3d] border-b pb-2 uppercase tracking-wide">Payer Details</h4>
                <div className="space-y-4 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="w-16 flex-shrink-0 text-slate-500">Type</span>
                    <Input 
                      value={opPayerType} 
                      onChange={(e) => setOpPayerType(e.target.value)} 
                      className="h-7 text-xs flex-1 bg-white border-slate-200" 
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-16 flex-shrink-0 text-slate-500">Payer</span>
                    <Input 
                      value={opPayer} 
                      onChange={(e) => setOpPayer(e.target.value)} 
                      className="h-7 text-xs flex-1 bg-white border-slate-200" 
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-16 flex-shrink-0 text-slate-500">Sponsor</span>
                    <Input 
                      value={opSponsor} 
                      onChange={(e) => setOpSponsor(e.target.value)} 
                      className="h-7 text-xs flex-1 bg-white border-slate-200" 
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-16 flex-shrink-0 text-slate-500">Network</span>
                    <Input 
                      value={opNetwork} 
                      onChange={(e) => setOpNetwork(e.target.value)} 
                      className="h-7 text-xs flex-1 bg-white border-slate-200" 
                    />
                  </div>
                </div>
              </div>

              {/* Doctor Details */}
              <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-white shadow-xs">
                <h4 className="text-xs font-bold text-[#7c5e3d] border-b pb-2 uppercase tracking-wide">Doctor Details</h4>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <span className="w-16 flex-shrink-0 text-slate-500">Doctor<span className="text-red-500">*</span></span>
                  <Select value={opDoctor || "-Select-"} onValueChange={setOpDoctor}>
                    <SelectTrigger className="h-7 text-xs flex-1 bg-white border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-Select-">-Select-</SelectItem>
                      <SelectItem value="Dr. Abhishek Bansal 2273">Dr. Abhishek Bansal 2273</SelectItem>
                      <SelectItem value="Dr. Sameer Sen 3105">Dr. Sameer Sen 3105</SelectItem>
                      <SelectItem value="Dr. Ritu Sharma 1092">Dr. Ritu Sharma 1092</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === "OP Billing" && (
          <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-none">
            {/* Header bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-[#cee6f8] text-xs font-bold text-slate-700 flex-shrink-0 select-none">
              <div className="flex items-center gap-6">
                <span className="text-sm font-bold text-slate-800">OP Invoice</span>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-md px-2 py-0.5 shadow-2xs">
                    <Button 
                      variant="link"
                      onClick={() => setIsPatientSearchModalOpen(true)}
                      className="font-bold text-blue-700 hover:underline text-[10px] p-0 h-auto flex-shrink-0"
                    >
                      UHID
                    </Button>
                    <Input 
                      type="text" 
                      value={opBillingUhid} 
                      onChange={(e) => setOpBillingUhid(e.target.value)} 
                      className="h-5 text-xs w-24 border-0 p-0 shadow-none font-mono font-bold focus-visible:ring-0 focus-visible:ring-offset-0" 
                    />
                    <Button 
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 hover:bg-slate-100 flex-shrink-0 text-slate-400 hover:text-slate-600 p-0"
                      onClick={() => setIsPatientSearchModalOpen(true)}
                    >
                      <Search className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button className="h-6 text-[10px] bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5">
                    Notes
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-[11px]">Visit No</span>
                  <Select value={opBillingVisitNo || "1"} onValueChange={setOpBillingVisitNo}>
                    <SelectTrigger className="h-6 text-xs bg-white border-slate-300 w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Visit-1 (14/08/2026)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setOpBillingUhid("");
                    setOpBillingVisitNo("");
                    setOpBillingPayer("");
                    setOpBillingSponsor("");
                    setOpBillingNetwork("");
                    setOpBillingDoctor("");
                    setOpBillingNarration("");
                    setOpBillingPaymentRows([{ mode: "Cash", amount: 0, balance: 0, date: new Date().toLocaleDateString("en-GB"), bankName: "", beneficiaryName: "", refNo: "", description: "", cardSwipingValue: 0 }]);
                  }} 
                  className="h-7 text-xs bg-white text-slate-700 border-slate-300 hover:bg-slate-50 px-4 font-bold"
                >
                  New
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs bg-white text-slate-700 border-slate-300 hover:bg-slate-50 px-4 font-bold"
                >
                  Print
                </Button>
                <Button 
                  onClick={handleSaveOpBilling}
                  size="sm" 
                  className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-4"
                >
                  Save
                </Button>
              </div>
            </div>

            {/* Layout Header Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 flex-shrink-0">
              {/* Column 1 */}
              <div className="border border-slate-200 rounded-xl p-3 bg-white flex items-center gap-4 h-28 shadow-xs">
                <div className="w-16 h-16 flex-shrink-0 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-300 overflow-hidden shadow-inner">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1 py-1">
                  {opBillingPatientInfo ? (
                    <>
                      <div className="font-bold text-slate-800 text-xs truncate">{opBillingPatientInfo.name}</div>
                      <div className="text-[10px] text-slate-500 font-semibold">{opBillingPatientInfo.genderAge}</div>
                      <div className="text-[9px] text-[#7c5e3d] font-bold truncate uppercase">{opBillingPatientInfo.address}</div>
                    </>
                  ) : (
                    <div className="text-slate-400 italic text-[11px]">Enter UHID to view details</div>
                  )}
                </div>
              </div>

              {/* Column 2 */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2.5 shadow-xs">
                <h4 className="font-bold text-[#7c5e3d] uppercase tracking-wide text-[10px] border-b pb-1.5 mb-1.5">Invoice Details</h4>
                <div className="space-y-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Year</span>
                    <Select value={opBillingYear} onValueChange={setOpBillingYear}>
                      <SelectTrigger className="h-6 w-28 text-xs bg-white border-slate-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="26-27">26-27</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Type</span>
                    <Select value={opBillingType} onValueChange={setOpBillingType}>
                      <SelectTrigger className="h-6 w-28 text-xs bg-white border-slate-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Credit">Credit</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 underline cursor-pointer">Invoice#</span>
                    <span className="font-mono text-slate-500">-</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Date</span>
                    <span className="text-slate-700 font-mono">14/08/2026 15:15</span>
                  </div>
                </div>
              </div>

              {/* Column 3 */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2.5 shadow-xs">
                <div className="flex justify-between items-center border-b pb-1.5 mb-1.5">
                  <h4 className="font-bold text-[#7c5e3d] uppercase tracking-wide text-[10px]">Payer Details</h4>
                  <span className="text-[10px] text-red-600 font-bold">Payer validity: 31/12/2099</span>
                </div>
                <div className="space-y-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Type <span className="text-red-500">*</span></span>
                    <Select value={opBillingPayerType} onValueChange={setOpBillingPayerType}>
                      <SelectTrigger className="h-6 w-28 text-xs bg-white border-slate-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Insurance">Insurance</SelectItem>
                        <SelectItem value="Corporate">Corporate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Payer <span className="text-red-500">*</span></span>
                    <Select value={opBillingPayer} onValueChange={setOpBillingPayer}>
                      <SelectTrigger className="h-6 w-28 text-xs bg-white border-slate-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Select">Select</SelectItem>
                        <SelectItem value="Star Health">Star Health</SelectItem>
                        <SelectItem value="HDFC Ergo">HDFC Ergo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Sponsor <span className="text-red-500">*</span></span>
                    <Input 
                      value={opBillingSponsor} 
                      onChange={(e) => setOpBillingSponsor(e.target.value)} 
                      className="h-6 w-28 text-xs bg-slate-50 border-slate-200" 
                      placeholder="CASH"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Network</span>
                    <Select value={opBillingNetwork} onValueChange={setOpBillingNetwork}>
                      <SelectTrigger className="h-6 w-28 text-xs bg-white border-slate-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Select">Select</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Column 4 */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2.5 shadow-xs">
                <h4 className="font-bold text-[#7c5e3d] uppercase tracking-wide text-[10px] border-b pb-1.5 mb-1.5">Other Details</h4>
                <div className="space-y-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Prescribing Doctor <span className="text-red-500">*</span></span>
                    <Select value={opBillingDoctor} onValueChange={setOpBillingDoctor}>
                      <SelectTrigger className="h-6 w-28 text-xs bg-white border-slate-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dr. Abhishek Bansal 2273">Dr. Abhishek Bansal 2273</SelectItem>
                        <SelectItem value="Dr. Sameer Sen 3105">Dr. Sameer Sen 3105</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Referred Type</span>
                    <Select value={opBillingReferredType} onValueChange={setOpBillingReferredType}>
                      <SelectTrigger className="h-6 w-28 text-xs bg-white border-slate-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SELF">SELF</SelectItem>
                        <SelectItem value="DOCTOR">DOCTOR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Referred by Name</span>
                    <Select value={opBillingReferredName} onValueChange={setOpBillingReferredName}>
                      <SelectTrigger className="h-6 w-28 text-xs bg-white border-slate-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Select">Select</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-tab Navigation */}
            <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-100 bg-white flex-shrink-0 select-none">
              <div className="flex items-center gap-1">
                {[
                  "Service",
                  "Payment",
                  "Adjustment",
                  "Outstanding",
                  "Checklist",
                  "Patient Diagnosis Entry"
                ].map((subTab) => (
                  <button
                    key={subTab}
                    onClick={() => setOpBillingSubTab(subTab)}
                    className={`h-7 px-3 text-xs font-bold rounded-md transition-colors ${
                      opBillingSubTab === subTab
                        ? "bg-blue-600 text-white font-bold"
                        : "bg-transparent text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {subTab}
                  </button>
                ))}
              </div>
              <Button className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-3">
                Get Consultation Visit
              </Button>
            </div>

            {/* Sub-tab Views */}
            {opBillingSubTab === "Service" && (
              <div className="flex-1 bg-white p-6 overflow-y-auto flex flex-col justify-center items-center text-slate-400 font-medium">
                <span className="text-red-500 font-bold text-sm">No Order Found.</span>
              </div>
            )}

            {opBillingSubTab === "Payment" && (
              <div className="flex-1 bg-white p-6 overflow-y-auto flex flex-col gap-4">
                <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[9px]">
                    <tr>
                      <th className="px-3 py-2">Mode</th>
                      <th className="px-3 py-2 text-right">Amount</th>
                      <th className="px-3 py-2 text-right">Balance</th>
                      <th className="px-3 py-2 text-center">Date (dd/MM/YYYY)</th>
                      <th className="px-3 py-2">Bank Name</th>
                      <th className="px-3 py-2">Beneficiary Name</th>
                      <th className="px-3 py-2">Reference No</th>
                      <th className="px-3 py-2">Description/Card Holder Name</th>
                      <th className="px-3 py-2 text-right">Card Swiping Value</th>
                      <th className="px-3 py-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                    {opBillingPaymentRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2.5">
                          <Select 
                            value={row.mode} 
                            onValueChange={(val) => {
                              const updated = [...opBillingPaymentRows];
                              updated[idx].mode = val;
                              setOpBillingPaymentRows(updated);
                            }}
                          >
                            <SelectTrigger className="h-6 w-24 text-[10px] bg-white border-slate-200"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Cash">Cash</SelectItem>
                              <SelectItem value="Card">Card</SelectItem>
                              <SelectItem value="UPI">UPI</SelectItem>
                              <SelectItem value="Cheque">Cheque</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-3 py-2.5">
                          <Input 
                            type="number" 
                            value={row.amount || ""} 
                            onChange={(e) => {
                              const updated = [...opBillingPaymentRows];
                              updated[idx].amount = Number(e.target.value);
                              setOpBillingPaymentRows(updated);
                            }}
                            className="h-6 text-right w-20 text-[10px] bg-white border-slate-200 font-bold font-mono" 
                          />
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-[10px] text-slate-500 font-bold">₹{row.balance.toFixed(2)}</td>
                        <td className="px-3 py-2.5">
                          <Input 
                            type="text" 
                            value={row.date} 
                            onChange={(e) => {
                              const updated = [...opBillingPaymentRows];
                              updated[idx].date = e.target.value;
                              setOpBillingPaymentRows(updated);
                            }}
                            className="h-6 text-center w-24 text-[10px] bg-white border-slate-200 font-mono" 
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <Select 
                            value={row.bankName || "-Select-"} 
                            onValueChange={(val) => {
                              const updated = [...opBillingPaymentRows];
                              updated[idx].bankName = val;
                              setOpBillingPaymentRows(updated);
                            }}
                          >
                            <SelectTrigger className="h-6 w-28 text-[10px] bg-white border-slate-200"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="-Select-">-Select-</SelectItem>
                              <SelectItem value="SBI">State Bank of India</SelectItem>
                              <SelectItem value="HDFC">HDFC Bank</SelectItem>
                              <SelectItem value="ICICI">ICICI Bank</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-3 py-2.5">
                          <Select 
                            value={row.beneficiaryName || "-Select-"} 
                            onValueChange={(val) => {
                              const updated = [...opBillingPaymentRows];
                              updated[idx].beneficiaryName = val;
                              setOpBillingPaymentRows(updated);
                            }}
                          >
                            <SelectTrigger className="h-6 w-28 text-[10px] bg-white border-slate-200"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="-Select-">-Select-</SelectItem>
                              <SelectItem value="CMK Pvt Ltd">CMK Pvt Ltd</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-3 py-2.5">
                          <Input 
                            type="text" 
                            value={row.refNo} 
                            onChange={(e) => {
                              const updated = [...opBillingPaymentRows];
                              updated[idx].refNo = e.target.value;
                              setOpBillingPaymentRows(updated);
                            }}
                            className="h-6 w-24 text-[10px] bg-white border-slate-200 font-mono" 
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <Input 
                            type="text" 
                            value={row.description} 
                            onChange={(e) => {
                              const updated = [...opBillingPaymentRows];
                              updated[idx].description = e.target.value;
                              setOpBillingPaymentRows(updated);
                            }}
                            className="h-6 w-44 text-[10px] bg-white border-slate-200" 
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <Input 
                            type="number" 
                            value={row.cardSwipingValue || ""} 
                            onChange={(e) => {
                              const updated = [...opBillingPaymentRows];
                              updated[idx].cardSwipingValue = Number(e.target.value);
                              setOpBillingPaymentRows(updated);
                            }}
                            className="h-6 text-right w-20 text-[10px] bg-white border-slate-200 font-mono" 
                          />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeOpBillingPaymentRow(idx)}
                            className="h-5 w-5 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={10} className="px-3 py-2.5">
                        <button 
                          onClick={addOpBillingPaymentRow} 
                          className="text-blue-600 hover:text-blue-800 text-[11px] font-bold flex items-center gap-1"
                        >
                          <span>+ Add Row</span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="flex flex-col md:flex-row items-start gap-6 border border-slate-100 rounded-xl p-4 bg-slate-50/50 mt-2">
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-700 py-1">
                    <span className="text-slate-500">Co-Payment Paid By</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name="co-payment" defaultChecked className="h-3.5 w-3.5 text-primary border-slate-300 focus:ring-0" />
                      <span>Patient</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name="co-payment" className="h-3.5 w-3.5 text-primary border-slate-300 focus:ring-0" />
                      <span>Company</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-2 flex-1 w-full text-xs font-bold text-slate-700">
                    <span className="w-48 text-slate-500">Consultant Change Remarks</span>
                    <Input className="h-7 text-xs flex-1 bg-white border-slate-200" placeholder="" />
                  </div>
                </div>
              </div>
            )}

            {opBillingSubTab === "Adjustment" && (
              <div className="flex-1 bg-white p-6 overflow-y-auto flex flex-col justify-start items-start gap-4">
                <div className="text-xs font-bold text-slate-700">Total Advance: ₹0.00</div>
                <span className="text-red-500 font-bold text-sm">No Record Found.</span>
              </div>
            )}

            {["Outstanding", "Checklist", "Patient Diagnosis Entry"].includes(opBillingSubTab) && (
              <div className="flex-1 bg-white p-6 overflow-y-auto flex flex-col justify-center items-center text-slate-400 font-medium">
                <span className="text-red-500 font-bold text-sm">No Record Found.</span>
              </div>
            )}

            {/* Bottom details footer bar */}
            <div className="p-5 border-t border-slate-200 bg-[#e3f2fd]/60 grid grid-cols-1 md:grid-cols-3 gap-6 flex-shrink-0 text-xs font-semibold text-slate-700 select-none">
              {/* Left side */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 bg-white/60 p-2 rounded-lg border border-slate-100 shadow-2xs">
                  <div>Treatment / Available Limit: <span className="font-mono">0.00 / 0.00</span></div>
                  <div>Advance / Outstanding: <span className="font-mono">0.00 / 0.00</span></div>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Narration</span>
                  <textarea 
                    value={opBillingNarration}
                    onChange={(e) => setOpBillingNarration(e.target.value)}
                    className="w-full h-16 text-xs p-2 bg-white border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-0" 
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button className="h-6 text-[10px] bg-red-500 hover:bg-red-600 text-white font-bold px-2.5 rounded-md">Approval Required</Button>
                  <Button className="h-6 text-[10px] bg-blue-500 hover:bg-blue-600 text-white font-bold px-2.5 rounded-md">Excluded Service</Button>
                  <Button className="h-6 text-[10px] bg-blue-500 hover:bg-blue-600 text-white font-bold px-2.5 rounded-md">Refunded Service</Button>
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" className="h-3.5 w-3.5 rounded text-primary border-slate-300 focus:ring-0" />
                    <span>E-mail Result</span>
                  </label>
                  
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Reporting DateTime</span>
                    <Input type="text" defaultValue="14/08/2026 00:00" className="h-6 w-32 bg-white text-center font-mono text-[10px]" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">PAN No.</span>
                    <Input type="text" className="h-6 w-20 bg-white" />
                  </div>
                </div>
              </div>

              {/* Middle side */}
              <div className="space-y-2.5 bg-white/40 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Currency</span>
                  <Select defaultValue="INR">
                    <SelectTrigger className="h-6 w-32 text-xs bg-white border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="INR">INR</SelectItem></SelectContent>
                  </Select>
                </div>
                {[
                  { label: "Received", val: "0.00" },
                  { label: "Rate", val: "1.00" },
                  { label: "Conv.Amt", val: "0.00" },
                  { label: "Charge", val: "0.00" },
                  { label: "Discount", val: "0.00" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-slate-500">{item.label}</span>
                    <Input type="text" defaultValue={item.val} className="h-6 w-32 text-right font-mono font-bold" />
                  </div>
                ))}
              </div>

              {/* Right side */}
              <div className="space-y-2.5 bg-[#e3f2fd]/40 p-3 rounded-xl border border-blue-100 shadow-2xs">
                {[
                  { label: "Net Amt", val: "0.00" },
                  { label: "Deductable Amt", val: "0.00" },
                  { label: "Received", val: "0.00" },
                  { label: "Advance", val: "0.00" },
                  { label: "Balance", val: "0.00" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-slate-600 font-bold">{item.label}</span>
                    <Input type="text" defaultValue={item.val} className="h-6 w-32 text-right font-mono font-bold text-slate-800 bg-white border-blue-200" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
        {activeTab === "Master Activity List" && (
          <Card className="flex-1 flex flex-col overflow-hidden">
            {/* Filters bar */}
            <div className="p-4 border-b border-slate-100 bg-white flex-shrink-0 text-xs font-semibold text-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3.5 items-center">
                {/* Column 1 */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2">
                    <span className="w-20 flex-shrink-0">UHID</span>
                    <div className="flex items-center gap-1 flex-1">
                      <Input
                        placeholder=""
                        className="h-7 text-xs w-full bg-white border-slate-200"
                        value={invoiceSearch}
                        onChange={(e) => setInvoiceSearch(e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 bg-blue-600 hover:bg-blue-700 text-white border-blue-600 font-bold flex-shrink-0"
                        onClick={() => setIsPatientSearchModalOpen(true)}
                      >
                        <Search className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 bg-blue-600 hover:bg-blue-700 text-white border-blue-600 font-bold flex-shrink-0"
                        onClick={() => {
                          setInvoiceSearch("");
                          fetchInvoices();
                        }}
                      >
                        R
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-20 flex-shrink-0">Facility</span>
                    <Select defaultValue="CMK">
                      <SelectTrigger className="h-7 text-xs flex-1 bg-white border-slate-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CMK">CMK HEALTHCARE PVT. LTD.</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-20 flex-shrink-0">Patient Type</span>
                    <Select defaultValue="Both">
                      <SelectTrigger className="h-7 text-xs flex-1 bg-white border-slate-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Both">Both</SelectItem>
                        <SelectItem value="OP">OP</SelectItem>
                        <SelectItem value="IP">IP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2">
                    <span className="w-20 flex-shrink-0">Bill No</span>
                    <Input
                      placeholder=""
                      className="h-7 text-xs flex-1 bg-white border-slate-200"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-20 flex-shrink-0">Payer Type</span>
                    <Select defaultValue="Select All">
                      <SelectTrigger className="h-7 text-xs flex-1 bg-white border-slate-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Select All">Select All</SelectItem>
                        <SelectItem value="Direct Patient">Direct Patient</SelectItem>
                        <SelectItem value="Company">Company</SelectItem>
                        <SelectItem value="Insurance">Insurance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-20 flex-shrink-0">Print As</span>
                    <div className="flex items-center gap-4 py-1 flex-1">
                      <label className="flex items-center gap-1 cursor-pointer select-none">
                        <input type="radio" name="print-as" defaultChecked className="h-3.5 w-3.5 text-primary border-slate-300" />
                        <span>Summary</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer select-none">
                        <input type="radio" name="print-as" className="h-3.5 w-3.5 text-primary border-slate-300" />
                        <span>Detail</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Column 3 */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2">
                    <span className="w-20 flex-shrink-0">Date Range</span>
                    <Select defaultValue="Date Range">
                      <SelectTrigger className="h-7 text-xs flex-1 bg-white border-slate-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Today">Today</SelectItem>
                        <SelectItem value="Yesterday">Yesterday</SelectItem>
                        <SelectItem value="Last Week">Last Week</SelectItem>
                        <SelectItem value="Last Two Week">Last Two Week</SelectItem>
                        <SelectItem value="This Month">This Month</SelectItem>
                        <SelectItem value="Last One Month">Last One Month</SelectItem>
                        <SelectItem value="Last Year">Last Year</SelectItem>
                        <SelectItem value="Date Range">Date Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-20 flex-shrink-0">Payer</span>
                    <Select defaultValue="Select All">
                      <SelectTrigger className="h-7 text-xs flex-1 bg-white border-slate-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Select All">Select All</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-20 flex-shrink-0"></span>
                    <div className="flex items-center gap-4 py-1 flex-1">
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input type="checkbox" className="h-3.5 w-3.5 rounded text-primary border-slate-300" />
                        <span>Patient</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input type="checkbox" className="h-3.5 w-3.5 rounded text-primary border-slate-300" />
                        <span>Refundable</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Column 4 */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2">
                    <span className="w-20 flex-shrink-0">From</span>
                    <div className="flex items-center gap-1.5 flex-1">
                      <Input
                        type="text"
                        defaultValue="13/08/2026"
                        className="h-7 text-xs flex-1 bg-white border-slate-200 text-center"
                      />
                      <span className="text-slate-400">To</span>
                      <Input
                        type="text"
                        defaultValue="13/08/2026"
                        className="h-7 text-xs flex-1 bg-white border-slate-200 text-center"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-20 flex-shrink-0">Sponsor</span>
                    <Select defaultValue="Select All">
                      <SelectTrigger className="h-7 text-xs flex-1 bg-white border-slate-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Select All">Select All</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="w-20 flex-shrink-0">Search For</span>
                      <Select value={invoiceStatusFilter} onValueChange={setInvoiceStatusFilter}>
                        <SelectTrigger className="h-7 text-xs flex-1 bg-white border-slate-200"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Select All</SelectItem>
                          <SelectItem value="settled">Settled</SelectItem>
                          <SelectItem value="unsettled">UnSettled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={fetchInvoices} size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700 border-blue-600 text-white font-bold px-5">
                      Search
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Horizontal Sub-Tabs bar for Master Activity List */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-bold text-slate-700 select-none flex-shrink-0">
              <div className="flex items-center gap-1">
                {[
                  "Invoice Details",
                  "Receipt Details",
                  "Advance Details",
                  "Selected Invoice"
                ].map((subTab) => (
                  <button
                    key={subTab}
                    onClick={() => setActiveSubTab(subTab)}
                    className={`h-7 px-3 rounded-md transition-colors ${
                      subTab === activeSubTab
                        ? "bg-blue-600 text-white font-bold"
                        : "bg-transparent text-slate-600 hover:bg-slate-200/50"
                    }`}
                  >
                    {subTab}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4 text-[11px] font-semibold">
                <span className="text-slate-600">Total Advance Available: 0.00</span>
                <span className="text-slate-600">Selected Invoice Amount: 0.00 (0)</span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto flex-1 bg-white">
              {activeSubTab === "Invoice Details" && (
                <table className="w-full text-xs text-left">
                  <thead className="text-[10px] text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200 sticky top-0 z-10 font-bold">
                    <tr>
                      <th className="px-3 py-2.5">Company</th>
                      <th className="px-3 py-2.5">UHID</th>
                      <th className="px-3 py-2.5">Patient</th>
                      <th className="px-3 py-2.5">Enc#</th>
                      <th className="px-3 py-2.5">Type</th>
                      <th className="px-3 py-2.5">Invoice#</th>
                      <th className="px-3 py-2.5">Date</th>
                      <th className="px-3 py-2.5 text-right">NetAmt</th>
                      <th className="px-3 py-2.5 text-right">Patient</th>
                      <th className="px-3 py-2.5 text-right">Payer</th>
                      <th className="px-3 py-2.5 text-right">Adjusted</th>
                      <th className="px-3 py-2.5 text-right">Refund</th>
                      <th className="px-3 py-2.5 text-right">Cr.Note</th>
                      <th className="px-3 py-2.5 text-right">Balance</th>
                      <th className="px-3 py-2.5 text-center">Status</th>
                      <th className="px-3 py-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                    {isLoadingInvoices ? (
                      <tr>
                        <td colSpan={16} className="px-3 py-12 text-center text-slate-400">
                          Loading invoice details from database...
                        </td>
                      </tr>
                    ) : filteredInvoices.length > 0 ? (
                      filteredInvoices.map((inv) => (
                        <tr key={inv.id} className={`hover:bg-slate-50/40 ${inv.isCancelled ? "opacity-60 bg-slate-100" : ""}`}>
                          <td className="px-3 py-3 text-[10px] font-semibold">{inv.company}</td>
                          <td className="px-3 py-3 font-mono">{inv.uhid}</td>
                          <td className="px-3 py-3 font-bold text-slate-800">{inv.patientName}</td>
                          <td className="px-3 py-3 text-slate-500">{inv.encNo}</td>
                          <td className="px-3 py-3 font-bold text-center">{inv.type}</td>
                          <td className="px-3 py-3 font-mono text-emerald-800 font-bold">{inv.invoiceNo}</td>
                          <td className="px-3 py-3 text-slate-500">{new Date(inv.date).toLocaleDateString()}</td>
                          <td className="px-3 py-3 text-right font-bold text-slate-800">₹{inv.netAmt.toFixed(2)}</td>
                          <td className="px-3 py-3 text-right text-slate-500">₹{inv.paidPatient.toFixed(2)}</td>
                          <td className="px-3 py-3 text-right text-slate-500">₹{inv.paidPayer.toFixed(2)}</td>
                          <td className="px-3 py-3 text-right text-slate-500">₹{inv.adjusted.toFixed(2)}</td>
                          <td className="px-3 py-3 text-right text-slate-500">₹{inv.refund.toFixed(2)}</td>
                          <td className="px-3 py-3 text-right text-red-500">₹{inv.creditNote.toFixed(2)}</td>
                          <td className="px-3 py-3 text-right font-bold text-slate-800">₹{inv.balance.toFixed(2)}</td>
                          <td className="px-3 py-3 text-center">
                            {inv.isCancelled ? (
                              <span className="inline-block w-4 h-4 bg-slate-400 rounded shadow-xs" title="Cancelled"></span>
                            ) : inv.status === "Settled" ? (
                              <span className="inline-block w-4 h-4 bg-emerald-500 rounded shadow-xs" title="Settled"></span>
                            ) : inv.status === "Refundable" ? (
                              <span
                                className="inline-block w-4 h-4 bg-amber-500 rounded shadow-xs cursor-pointer animate-pulse"
                                title="Refundable"
                                onClick={() => handleOpenSettlement(inv)}
                              ></span>
                            ) : (
                              <span
                                className="inline-block w-4 h-4 bg-red-500 rounded shadow-xs cursor-pointer animate-pulse"
                                title="Outstanding"
                                onClick={() => handleOpenSettlement(inv)}
                              ></span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <div className="flex items-center justify-center gap-1.5 w-28 mx-auto">
                              {/* Settle/Refund Button slot */}
                              <div className="w-14 flex justify-center flex-shrink-0">
                                {!inv.isCancelled && inv.balance !== 0 ? (
                                  <Button
                                    variant="outline"
                                    size="xs"
                                    className={`h-6 text-[10px] py-0 px-2 font-medium w-full ${
                                      inv.status === "Refundable"
                                        ? "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700 font-bold"
                                        : "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 font-bold"
                                    }`}
                                    onClick={() => handleOpenSettlement(inv)}
                                  >
                                    {inv.status === "Refundable" ? "Refund" : "Settle"}
                                  </Button>
                                ) : (
                                  <div className="w-14 h-6 flex-shrink-0" />
                                )}
                              </div>

                              {/* Cancel/Delete Button slot */}
                              <div className="w-6 flex justify-center flex-shrink-0">
                                {!inv.isCancelled ? (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-red-500 hover:bg-red-50 flex-shrink-0"
                                    title="Cancel Invoice"
                                    onClick={() => handleCancelInvoice(inv.id)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                ) : (
                                  <div className="w-6 h-6 flex-shrink-0" />
                                )}
                              </div>

                              {/* Print Button slot */}
                              <div className="w-6 flex justify-center flex-shrink-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-slate-500 hover:bg-slate-100 flex-shrink-0"
                                  title="Print Invoice"
                                  onClick={() => setPrintInvoiceData(inv)}
                                >
                                  <Printer className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={16} className="px-3 py-12 text-center text-slate-400">
                          No record found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {activeSubTab === "Receipt Details" && (() => {
                const receiptDetailsList = filteredInvoices.flatMap((inv) =>
                  (inv.receipts || []).map((rec) => ({
                    id: rec.id,
                    company: inv.company,
                    uhid: inv.uhid,
                    patientName: inv.patientName,
                    receiptNo: rec.id ? `REC-${rec.id.slice(0, 8).toUpperCase()}` : "REC-N/A",
                    date: rec.createdAt ? new Date(rec.createdAt).toLocaleDateString() : new Date(inv.date).toLocaleDateString(),
                    invoiceType: inv.type,
                    grossAmt: inv.netAmt,
                    adjusted: rec.type === "Settlement" ? rec.amount : 0,
                    refund: rec.type === "Refund" ? rec.amount : 0,
                    balance: inv.balance,
                    status: inv.status,
                  }))
                );

                return (
                  <table className="w-full text-xs text-left">
                    <thead className="text-[10px] text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200 sticky top-0 z-10 font-bold">
                      <tr>
                        <th className="px-3 py-2.5">Company</th>
                        <th className="px-3 py-2.5">UHID</th>
                        <th className="px-3 py-2.5">Patient</th>
                        <th className="px-3 py-2.5">Receipt#</th>
                        <th className="px-3 py-2.5">Date</th>
                        <th className="px-3 py-2.5">InvoiceType</th>
                        <th className="px-3 py-2.5 text-right">Gross Amt</th>
                        <th className="px-3 py-2.5 text-right">Adjusted</th>
                        <th className="px-3 py-2.5 text-right">Refund</th>
                        <th className="px-3 py-2.5 text-right">Balance</th>
                        <th className="px-3 py-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                      {receiptDetailsList.length > 0 ? (
                        receiptDetailsList.map((rec, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/40">
                            <td className="px-3 py-3 text-[10px] font-semibold">{rec.company}</td>
                            <td className="px-3 py-3 font-mono">{rec.uhid}</td>
                            <td className="px-3 py-3 font-bold text-slate-800">{rec.patientName}</td>
                            <td className="px-3 py-3 font-mono text-blue-800 font-bold">{rec.receiptNo}</td>
                            <td className="px-3 py-3 text-slate-500">{rec.date}</td>
                            <td className="px-3 py-3 font-bold text-center">{rec.invoiceType}</td>
                            <td className="px-3 py-3 text-right">₹{rec.grossAmt.toFixed(2)}</td>
                            <td className="px-3 py-3 text-right text-emerald-600">₹{rec.adjusted.toFixed(2)}</td>
                            <td className="px-3 py-3 text-right text-amber-600">₹{rec.refund.toFixed(2)}</td>
                            <td className="px-3 py-3 text-right font-bold">₹{rec.balance.toFixed(2)}</td>
                            <td className="px-3 py-3 text-center">
                              {rec.status === "Settled" ? (
                                <span className="inline-block w-4 h-4 bg-emerald-500 rounded shadow-xs" title="Settled"></span>
                              ) : rec.status === "Refundable" ? (
                                <span className="inline-block w-4 h-4 bg-amber-500 rounded shadow-xs" title="Refundable"></span>
                              ) : (
                                <span className="inline-block w-4 h-4 bg-red-500 rounded shadow-xs" title="Outstanding"></span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={11} className="px-3 py-12 text-center text-red-500 font-bold">
                            No Record Found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                );
              })()}

              {activeSubTab === "Advance Details" && (
                <table className="w-full text-xs text-left">
                  <thead className="text-[10px] text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200 sticky top-0 z-10 font-bold">
                    <tr>
                      <th className="px-3 py-2.5">Company</th>
                      <th className="px-3 py-2.5">UHID</th>
                      <th className="px-3 py-2.5">Patient</th>
                      <th className="px-3 py-2.5">Enc#</th>
                      <th className="px-3 py-2.5">Advance#</th>
                      <th className="px-3 py-2.5">Date</th>
                      <th className="px-3 py-2.5 text-right">Advance Amt</th>
                      <th className="px-3 py-2.5 text-right">Adjusted</th>
                      <th className="px-3 py-2.5 text-right">Refund</th>
                      <th className="px-3 py-2.5 text-right">Balance</th>
                      <th className="px-3 py-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={11} className="px-3 py-12 text-center text-red-500 font-bold">
                        No Record Found.
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}

              {activeSubTab === "Selected Invoice" && (
                <table className="w-full text-xs text-left">
                  <thead className="text-[10px] text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200 sticky top-0 z-10 font-bold">
                    <tr>
                      <th className="px-3 py-2.5">Company</th>
                      <th className="px-3 py-2.5">UHID</th>
                      <th className="px-3 py-2.5">Patient</th>
                      <th className="px-3 py-2.5">Enc#</th>
                      <th className="px-3 py-2.5">Type</th>
                      <th className="px-3 py-2.5">Invoice#</th>
                      <th className="px-3 py-2.5">Date</th>
                      <th className="px-3 py-2.5 text-right">NetAmt</th>
                      <th className="px-3 py-2.5 text-right">Patient</th>
                      <th className="px-3 py-2.5 text-right">Payer</th>
                      <th className="px-3 py-2.5 text-right">Adjusted</th>
                      <th className="px-3 py-2.5 text-right">Refund</th>
                      <th className="px-3 py-2.5 text-right">Cr.Note</th>
                      <th className="px-3 py-2.5 text-right">Balance</th>
                      <th className="px-3 py-2.5 text-center">Status</th>
                      <th className="px-3 py-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={16} className="px-3 py-12 text-center text-red-500 font-bold">
                        No Record Found.
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>

            {/* Status Legend Bar */}
            <div className="border-t border-slate-200 px-4 py-2.5 bg-slate-50 text-[10px] text-slate-600 flex items-center justify-end gap-4 select-none flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 bg-emerald-500 rounded-sm"></span>
                <span>Settled</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 bg-red-500 rounded-sm"></span>
                <span>Outstanding</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 bg-amber-500 rounded-sm"></span>
                <span>Refundable</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 bg-slate-400 rounded-sm"></span>
                <span>Cancelled</span>
              </div>
            </div>
          </Card>
        )}

        {/* ========================================= */}
        {/*           IP BILLING TAB VIEW            */}
        {/* ========================================= */}
        {activeTab === "IP Billing" && (
          <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-none bg-white">
            {/* Header bar */}
            <div className="flex items-center justify-between px-6 py-2 border-b border-slate-200 bg-[#cee6f8]">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-800 text-sm">IP Invoice</span>
                <div className="flex items-center gap-1">
                  <Search className="w-4 h-4 text-slate-600 ml-1" />
                  <Select defaultValue="IP No">
                    <SelectTrigger className="h-7 w-28 text-xs bg-white border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IP No">IP No</SelectItem>
                      <SelectItem value="UHID">UHID</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative">
                    <Input 
                      className="h-7 w-32 text-xs bg-white border-slate-200 pl-2 pr-8 font-mono" 
                      placeholder="" 
                      value={ipBillingUhid}
                      onChange={(e) => setIpBillingUhid(e.target.value)}
                    />
                    <button 
                      onClick={() => setIsPatientSearchModalOpen(true)}
                      className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-700"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button className="h-7 px-4 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded shadow-sm">
                  Notes
                </Button>
                <div className="flex items-center gap-1.5 ml-4">
                  <Button variant="outline" className="h-7 px-4 bg-white text-slate-700 hover:bg-slate-50 border-slate-300 text-xs font-bold shadow-sm">
                    Discharge
                  </Button>
                  <Button variant="outline" className="h-7 px-4 bg-white text-slate-700 hover:bg-slate-50 border-slate-300 text-xs font-bold shadow-sm">
                    New
                  </Button>
                  <Button className="h-7 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm border-blue-600">
                    Save
                  </Button>
                  <Button variant="outline" className="h-7 px-4 bg-white text-slate-700 hover:bg-slate-50 border-slate-300 text-xs font-bold shadow-sm">
                    Print
                  </Button>
                </div>
              </div>
            </div>

            {/* Grid Sections */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border-b border-slate-200 bg-white">
              
              {/* Patient Details */}
              <div className="p-4 border-r border-slate-200">
                <h3 className="font-bold text-slate-700 text-xs mb-3">Patient Details</h3>
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                    <img src="/images/patient_avatar.png" alt="Patient" className="w-12 h-12 opacity-50" />
                  </div>
                  <div className="flex flex-col flex-1 space-y-1 mt-1 text-xs">
                    {ipBillingPatientInfo ? (
                      <>
                        <div className="font-bold text-slate-800 text-xs truncate">{ipBillingPatientInfo.name}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">{ipBillingPatientInfo.genderAge}</div>
                        <div className="text-[9px] text-[#7c5e3d] font-bold truncate uppercase">{ipBillingPatientInfo.address}</div>
                      </>
                    ) : (
                      <>
                        <div className="font-bold text-slate-400 text-xs truncate">Select Patient</div>
                        <div className="text-[10px] text-slate-300 font-semibold">Gender/Age</div>
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs font-semibold w-16">IP Status</span>
                    <span className="text-slate-800 text-xs font-bold"></span>
                  </div>
                  <div className="flex gap-2">
                    <Button className="h-6 px-3 bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-bold rounded shadow-sm flex-1">Audit Bill</Button>
                    <Button className="h-6 px-3 bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-bold rounded shadow-sm flex-1">Bill Prepared</Button>
                  </div>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="p-4 border-r border-slate-200 flex flex-col justify-center">
                <h3 className="font-bold text-slate-700 text-xs mb-3">Invoice Details</h3>
                <div className="space-y-1.5">
                  <div className="flex items-center">
                    <span className="text-slate-500 text-xs font-semibold w-24">IP No.</span>
                    <span className="text-slate-800 text-xs font-bold truncate">{ipBillingUhid ? `IP-26-${ipBillingUhid}` : ""}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-slate-500 text-xs font-semibold w-24">Type</span>
                    <Select value={ipBillingType} onValueChange={setIpBillingType}>
                      <SelectTrigger className="h-6 w-32 text-xs bg-white border-slate-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Credit">Credit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center">
                    <span className="text-blue-500 text-xs font-semibold w-24 underline cursor-pointer">Invoice No</span>
                    <span className="text-slate-800 text-xs font-bold truncate"></span>
                  </div>
                  <div className="flex items-center mt-3 pt-2">
                    <span className="text-slate-500 text-xs font-semibold w-24">Inv. Date</span>
                    <span className="text-[#B94F70] text-[11px] font-bold tracking-wider">{new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '')}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-slate-500 text-xs font-semibold w-24">Admission</span>
                    <span className="text-slate-800 text-xs font-bold"></span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-slate-500 text-xs font-semibold w-24">Discharge Date</span>
                    <span className="text-slate-800 text-xs font-bold"></span>
                  </div>
                </div>
              </div>

              {/* Payor Details */}
              <div className="p-4 border-r border-slate-200 flex flex-col justify-center">
                <h3 className="font-bold text-slate-700 text-xs mb-3">Payor Details</h3>
                <div className="space-y-1.5">
                  <div className="flex items-center">
                    <span className="text-slate-500 text-xs font-semibold w-32">Payer</span>
                    <span className="text-slate-800 text-xs font-bold truncate flex-1">{ipBillingPayer}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-slate-500 text-xs font-semibold w-32">Sponsor</span>
                    <span className="text-slate-800 text-xs font-bold truncate flex-1">{ipBillingSponsor}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-slate-500 text-xs font-semibold w-32">Network</span>
                    <span className="text-slate-800 text-xs font-bold truncate flex-1">{ipBillingNetwork}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-slate-500 text-xs font-semibold w-32">Consultant</span>
                    <span className="text-slate-800 text-xs font-bold truncate flex-1">{ipBillingConsultant}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-slate-500 text-xs font-semibold w-32">BillCategory /Bed No.</span>
                    <span className="text-slate-800 text-xs font-bold truncate flex-1">{ipBillingCategory}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-slate-500 text-xs font-semibold w-32">PAN No.</span>
                    <Input className="h-6 w-40 text-xs bg-white border-slate-200 px-2" value={ipBillingPatientInfo?.pan || ""} readOnly />
                  </div>
                </div>
              </div>

              {/* Other Detail */}
              <div className="p-4 flex flex-col justify-center">
                <h3 className="font-bold text-slate-700 text-xs mb-3">Other Detail</h3>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-xs font-semibold">Treatment/Available Limit</span>
                    <span className="text-[#B94F70] text-xs font-bold text-right tracking-wider">0.00 / 0.00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-xs font-semibold">Advance</span>
                    <span className="text-slate-800 text-xs font-bold text-right tracking-wider"></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-xs font-semibold">Receivable/Refundable</span>
                    <span className="text-blue-500 text-xs font-bold text-right tracking-wider">0.00</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2">
                    <span className="text-slate-500 text-xs font-semibold">Net Bill Amt</span>
                    <span className="text-blue-500 text-xs font-bold text-right tracking-wider">0.00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-tabs Section */}
            <div className="flex flex-col flex-1 bg-slate-50/50">
              <div className="flex items-center gap-0 border-b border-[#cee6f8] px-4 pt-2">
                {["Department Wise", "Checklist"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setIpBillingSubTab(tab)}
                    className={`px-4 py-1.5 text-xs font-bold transition-all duration-200 border-t border-l border-r rounded-t-lg ${
                      ipBillingSubTab === tab 
                        ? "bg-[#cee6f8] text-blue-800 border-[#cee6f8]" 
                        : "bg-white text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex-1 bg-white flex flex-col">
                {ipBillingSubTab === "Department Wise" && (
                   <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
                      <span className="text-slate-400 font-bold text-sm">No Record Found.</span>
                   </div>
                )}
                {ipBillingSubTab === "Checklist" && (
                   <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
                      <span className="text-slate-400 font-bold text-sm">No Checklist Available.</span>
                   </div>
                )}
              </div>
            </div>

            {/* Footer Summary Bar */}
            <div className="border-t border-slate-200 bg-[#cee6f8]/40 p-4 shrink-0 mt-auto">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[10px] font-bold">Discount Authorized By:</span>
                    <Select>
                      <SelectTrigger className="h-6 w-32 text-[10px] bg-white border-slate-200"><SelectValue placeholder="[Select]" /></SelectTrigger>
                      <SelectContent><SelectItem value="none">None</SelectItem></SelectContent>
                    </Select>
                    <span className="text-slate-500 text-[10px] font-bold">(%)</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <span className="text-slate-500 text-[10px] font-bold w-16">Remarks:</span>
                    <Select>
                      <SelectTrigger className="h-6 flex-1 text-[10px] bg-white border-slate-200"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent><SelectItem value="none">None</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[10px] font-bold w-24">Facilitator Name</span>
                    <Input className="h-6 flex-1 text-[10px] bg-white border-slate-200" />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[10px] font-bold w-24">Package Name:</span>
                    <div className="flex-1 h-6"></div>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <span className="text-slate-500 text-[10px] font-bold w-16 invisible">Discount</span>
                    <Select>
                      <SelectTrigger className="h-6 w-24 text-[10px] bg-white border-slate-200"><SelectValue placeholder="Discount On" /></SelectTrigger>
                      <SelectContent><SelectItem value="none">None</SelectItem></SelectContent>
                    </Select>
                    <Input className="h-6 w-24 text-[10px] bg-white border-slate-200" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[10px] font-bold w-24">Billing Currency</span>
                    <div className="flex-1 h-6"></div>
                  </div>
               </div>
            </div>
          </Card>
        )}
      </div>

      {/* Settlement (Receipt) Dialog Modal */}
      {isSettleModalOpen && selectedInvoice && (() => {
        const isRefund = selectedInvoice.status === "Refundable" || selectedInvoice.balance < 0;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 animate-fade-in">
            <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#cee6f8] flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white text-blue-600 shadow-xs">
                    <ReceiptText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{isRefund ? "Settlement (Refund)" : "Settlement (Receipt)"}</h3>
                    <p className="text-xs text-slate-600 font-mono">Invoice No: {selectedInvoice.invoiceNo}</p>
                  </div>
                </div>
                <button onClick={() => setIsSettleModalOpen(false)} className="p-1 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
                {/* Ledger Summary Grid in 3x3 layout */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-[#eaf4fc]/30 text-xs">
                  <div className="grid grid-cols-3 divide-x divide-slate-200 border-b border-slate-200 bg-white">
                    <div className="p-2.5 flex items-center justify-between">
                      <span className="text-slate-500 font-bold w-24">UHID</span>
                      <span className="font-bold text-slate-800 flex-1">{selectedInvoice.uhid}</span>
                    </div>
                    <div className="p-2.5 flex items-center justify-between">
                      <span className="text-slate-500 font-bold w-24">Encounter</span>
                      <span className="font-bold text-slate-800 flex-1">{selectedInvoice.encNo}</span>
                    </div>
                    <div className="p-2.5 flex items-center justify-between">
                      <span className="text-slate-500 font-bold w-24">Patient Name</span>
                      <span className="font-bold text-slate-800 flex-1">{selectedInvoice.patientName}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 divide-x divide-slate-200 border-b border-slate-200 bg-white">
                    <div className="p-2.5 flex items-center justify-between">
                      <span className="text-slate-500 font-bold w-24">Bill No</span>
                      <span className="font-mono text-slate-800 flex-1">{selectedInvoice.invoiceNo}</span>
                    </div>
                    <div className="p-2.5 flex items-center justify-between">
                      <span className="text-slate-500 font-bold w-24">Date On</span>
                      <span className="text-slate-800 flex-1">{new Date(selectedInvoice.date).toLocaleDateString("en-GB")}</span>
                    </div>
                    <div className="p-2.5 flex items-center justify-between">
                      <span className="text-slate-500 font-bold w-24">Payer</span>
                      <span className="text-slate-800 flex-1">{selectedInvoice.company}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 divide-x divide-slate-200 bg-white">
                    <div className="p-2.5 flex items-center justify-between">
                      <span className="text-slate-500 font-bold w-24">Advance</span>
                      <Input className="h-6 text-xs w-28 bg-white border-slate-200 py-0" placeholder="" />
                    </div>
                    <div className="p-2.5 flex items-center justify-between">
                      <span className="text-slate-500 font-bold w-24">Amt To Adjust</span>
                      <span className="font-bold text-slate-800 flex-1">₹{selectedInvoice.netAmt.toFixed(2)}</span>
                    </div>
                    <div className="p-2.5 flex items-center justify-between">
                      <span className="text-slate-500 font-bold w-24">Balance</span>
                      <span className="font-bold text-slate-800 flex-1">₹{Math.abs(selectedInvoice.balance).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Details Header */}
                <div className="space-y-3">
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-1.5 font-bold text-slate-700">
                    <span>Details</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 pb-2">
                    <span>{isRefund ? "Refund Amount" : "Receipt Amount"}</span>
                    <Input
                      type="number"
                      className="h-7 text-xs w-36 bg-white border-slate-200 font-bold"
                      value={Math.abs(selectedInvoice.balance)}
                      disabled
                    />
                    {isRefund ? (
                      <button className="text-blue-600 hover:underline text-[11px] font-bold" onClick={() => toast.success("Advance Generated", "Advance credit processed.")}>Generate Advance</button>
                    ) : (
                      <button className="text-blue-600 hover:underline text-[11px] font-bold">Show Previous Receipt</button>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Payment Split Modes</h4>
                    <Button variant="outline" size="xs" onClick={addPaymentRow} className="h-7 text-[10px] gap-1 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 font-bold">
                      <Plus className="h-3.5 w-3.5" /> Add Split Row
                    </Button>
                  </div>

                  {/* Modes Table Grid */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="text-[10px] text-slate-500 uppercase bg-[#cee6f8]/40 border-b border-slate-200 font-bold text-slate-700">
                        <tr>
                          <th className="px-2 py-2 w-28">Mode</th>
                          <th className="px-2 py-2 w-24">Amount</th>
                          <th className="px-2 py-2 w-20">Balance</th>
                          <th className="px-2 py-2 w-28 text-center">Date (dd/MM/YYYY)</th>
                          <th className="px-2 py-2 w-32">Bank Name</th>
                          <th className="px-2 py-2 w-36">Beneficiary Name</th>
                          <th className="px-2 py-2 w-28">Reference No</th>
                          <th className="px-2 py-2 w-40">Description/Card Holder</th>
                          <th className="px-2 py-2 w-24 text-right">Swiping Value</th>
                          <th className="px-2 py-2 text-center w-8"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paymentRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/20 text-xs">
                            <td className="p-1">
                              <Select value={row.mode} onValueChange={(val) => updatePaymentField(idx, "mode", val)}>
                                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="-Select-">-Select-</SelectItem>
                                  <SelectItem value="Cash">Cash</SelectItem>
                                  <SelectItem value="Card">Card</SelectItem>
                                  <SelectItem value="UPI">UPI</SelectItem>
                                  <SelectItem value="Cheque">Cheque</SelectItem>
                                  <SelectItem value="CreditNote">Credit Note</SelectItem>
                                  <SelectItem value="TDS">TDS</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-1">
                              <Input
                                type="number"
                                className="h-7 text-xs font-semibold"
                                value={row.amount || ""}
                                onChange={(e) => updatePaymentField(idx, "amount", Number(e.target.value))}
                                placeholder="0.00"
                              />
                            </td>
                            <td className="p-1 text-center font-bold text-slate-700">
                              {Math.max(0, Math.abs(selectedInvoice.balance) - row.amount).toFixed(0)}
                            </td>
                            <td className="p-1">
                              <Input
                                type="text"
                                className="h-7 text-xs text-center"
                                value={row.date}
                                onChange={(e) => updatePaymentField(idx, "date", e.target.value)}
                              />
                            </td>
                            <td className="p-1">
                              <Select value={row.bankName || "-Select-"} onValueChange={(val) => updatePaymentField(idx, "bankName", val)}>
                                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="-Select-">-Select-</SelectItem>
                                  <SelectItem value="HDFC Bank">HDFC Bank</SelectItem>
                                  <SelectItem value="ICICI Bank">ICICI Bank</SelectItem>
                                  <SelectItem value="SBI Bank">SBI Bank</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-1">
                              <Select value={row.beneficiaryName || "-Select-"} onValueChange={(val) => updatePaymentField(idx, "beneficiaryName", val)}>
                                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="-Select-">-Select-</SelectItem>
                                  <SelectItem value="CMK Main Receipt">CMK Main Receipt</SelectItem>
                                  <SelectItem value="CMK Branch Account">CMK Branch Account</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-1">
                              <Input
                                type="text"
                                className="h-7 text-xs"
                                value={row.refNo}
                                onChange={(e) => updatePaymentField(idx, "refNo", e.target.value)}
                                placeholder=""
                              />
                            </td>
                            <td className="p-1">
                              <Input
                                type="text"
                                className="h-7 text-xs"
                                value={row.description}
                                onChange={(e) => updatePaymentField(idx, "description", e.target.value)}
                                placeholder=""
                              />
                            </td>
                            <td className="p-1">
                              <Input
                                type="number"
                                className="h-7 text-xs text-right"
                                value={row.cardSwipingValue || ""}
                                onChange={(e) => updatePaymentField(idx, "cardSwipingValue", Number(e.target.value))}
                                placeholder="0"
                              />
                            </td>
                            <td className="p-1 text-center">
                              {paymentRows.length > 1 ? (
                                <button onClick={() => removePaymentRow(idx)} className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between items-center text-xs font-semibold bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-slate-500">Total Amount:</span>
                    <span className="text-slate-800 text-sm">
                      ₹{paymentRows.reduce((sum, r) => sum + Number(r.amount || 0), 0).toFixed(2)}
                    </span>
                  </div>

                  {isRefund && (
                    <div className="flex justify-end pt-3">
                      <div className="w-1/2 space-y-1.5 text-right">
                        <label className="text-xs font-bold text-slate-600 block text-left">Notes*</label>
                        <textarea
                          className="w-full h-20 text-xs border border-slate-200 rounded-lg p-2.5 bg-white text-left focus:ring-0 focus:outline-none"
                          value={settlementNotes}
                          onChange={(e) => setSettlementNotes(e.target.value)}
                          placeholder="Enter notes here..."
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end px-6 py-3 border-t border-slate-100 bg-slate-50 gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" onClick={() => setIsSettleModalOpen(false)}>
                  Close
                </Button>
                <Button variant="success" size="sm" onClick={handleSaveSettlement} className="gap-1 font-bold">
                  <ShieldCheck className="h-4 w-4" /> {isRefund ? "Save Refund" : "Save Receipt"}
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Printable Invoice Dialog Modal */}
      {printInvoiceData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50 flex-shrink-0">
              <span className="font-bold text-slate-800 text-sm">Print Invoice Preview</span>
              <button onClick={() => setPrintInvoiceData(null)} className="p-1 rounded-md text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div id="printable-area" className="p-8 space-y-6 overflow-y-auto max-h-[70vh] bg-white text-slate-800 text-xs">
              <div className="text-center border-b pb-4">
                <h2 className="text-lg font-bold">CMK HEALTHCARE PVT. LTD.</h2>
                <p className="text-slate-500">12, Main Street, Delhi, India</p>
                <p className="text-slate-500">Phone: +91 9876543210</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>Patient Name:</strong> {printInvoiceData.patientName}</p>
                  <p><strong>UHID:</strong> {printInvoiceData.uhid}</p>
                  <p><strong>Encounter No:</strong> {printInvoiceData.encNo}</p>
                </div>
                <div className="text-right">
                  <p><strong>Invoice No:</strong> {printInvoiceData.invoiceNo}</p>
                  <p><strong>Date:</strong> {new Date(printInvoiceData.date).toLocaleDateString()}</p>
                  <p><strong>Company:</strong> {printInvoiceData.company}</p>
                </div>
              </div>
              <table className="w-full border-t border-b py-2 text-left">
                <thead>
                  <tr className="border-b">
                    <th className="py-2">Description</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2">Hospital Service Charges ({printInvoiceData.type})</td>
                    <td className="py-2 text-right">₹{printInvoiceData.netAmt.toFixed(2)}</td>
                  </tr>
                  {printInvoiceData.adjusted > 0 && (
                    <tr>
                      <td className="py-2 text-slate-500 font-semibold">Less: Amount Settled</td>
                      <td className="py-2 text-right text-emerald-600">-₹{printInvoiceData.adjusted.toFixed(2)}</td>
                    </tr>
                  )}
                  {printInvoiceData.creditNote > 0 && (
                    <tr>
                      <td className="py-2 text-slate-500 font-semibold">Less: Credit Note applied</td>
                      <td className="py-2 text-right text-purple-600">-₹{printInvoiceData.creditNote.toFixed(2)}</td>
                    </tr>
                  )}
                  {printInvoiceData.tdsAmt > 0 && (
                    <tr>
                      <td className="py-2 text-slate-500 font-semibold">Less: TDS Deductions</td>
                      <td className="py-2 text-right text-blue-600">-₹{printInvoiceData.tdsAmt.toFixed(2)}</td>
                    </tr>
                  )}
                  {printInvoiceData.refund > 0 && (
                    <tr>
                      <td className="py-2 text-slate-500 font-semibold">Add: Refunds processed</td>
                      <td className="py-2 text-right text-amber-600">+₹{printInvoiceData.refund.toFixed(2)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="flex justify-between items-center text-sm font-bold pt-2">
                <span>Net Outstanding Balance:</span>
                <span className={printInvoiceData.balance < 0 ? "text-amber-600" : "text-slate-800"}>
                  ₹{printInvoiceData.balance.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-slate-50">
              <Button variant="outline" size="sm" onClick={() => setPrintInvoiceData(null)}>
                Close
              </Button>
              <Button size="sm" className="gap-1 font-bold" onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> Print Receipt
              </Button>
            </div>
          </div>
        </div>
      )}

      {isPatientSearchModalOpen && (() => {
        const MODAL_PATIENTS = [
          { uhid: "2711", name: "Mr. Haula Khan",     genderAge: "Male/65 Yr",   regDate: "12/08/2026 7:19PM",  company: "CASH", mobile: "9818456584", dob: "12/08/1961", address: "MANGOL PURI",           father: "S K Khan"    },
          { uhid: "2710", name: "Mr. Raj Pal Yadav",  genderAge: "Male/70 Yr",   regDate: "10/08/2026 4:29PM",  company: "CASH", mobile: "8384858875", dob: "10/08/1956", address: "JAI ESAR",               father: "R P Yadav"   },
          { uhid: "2709", name: "Mr. Jumrati",        genderAge: "Male/63 Yr",   regDate: "03/08/2026 3:05PM",  company: "CASH", mobile: "9960378464", dob: "03/08/1963", address: "MAYUR VIHAR PHASE -1",   father: "Jumrati Sr"  },
          { uhid: "2708", name: "Mrs. Vandana",       genderAge: "Female/40 Yr", regDate: "31/07/2026 6:54PM",  company: "CASH", mobile: "8076185091", dob: "31/07/1986", address: "CR PARK",                father: "A K Sharma"  },
          { uhid: "2707", name: "Ms. Shipra Shukla",  genderAge: "Female/54 Yr", regDate: "31/07/2026 6:30PM",  company: "CASH", mobile: "9988810517", dob: "31/07/1972", address: "T-74B MALVIYA NAGAR",    father: "S N Shukla"  },
          { uhid: "2706", name: "Mrs. Aniti Masood",  genderAge: "Female/48 Yr", regDate: "22/07/2026 1:15PM",  company: "CASH", mobile: "9834780801", dob: "22/07/1978", address: "A113 HARIDAUS NADAR KI A ROAD A.M.U.", father: "" },
          { uhid: "2705", name: "Mrs. Krishna Bala",  genderAge: "Female/48 Yr", regDate: "25/07/2026 6:56PM",  company: "CASH", mobile: "7838777894", dob: "25/07/1978", address: "GHAZIABAD",              father: ""            },
          { uhid: "2704", name: "Mr. Naresh Jain",    genderAge: "Male/75 Yr",   regDate: "25/07/2026 2:01PM",  company: "CASH", mobile: "9310489390", dob: "25/07/1951", address: "SECTOR 85 GURGAON",      father: ""            },
          { uhid: "2703", name: "Mrs. Anita Gupta",   genderAge: "Female/55 Yr", regDate: "22/07/2026 7:20PM",  company: "CASH", mobile: "9710137225", dob: "22/07/1971", address: "HAROBOND ENCLAVE CHATTARPUR", father: ""       },
          { uhid: "2702", name: "Ms. Anita Singh",    genderAge: "Female/24 Yr", regDate: "21/07/2026 7:15PM",  company: "CASH", mobile: "8562872490", dob: "21/07/2002", address: "F-42 BLOCK F KALKAJI",   father: ""            },
          { uhid: "222",  name: "Mr. Somesh Kumar",   genderAge: "Male/28 Yr",   regDate: "11/08/2026 4:30PM",  company: "CASH", mobile: "9695960777", dob: "11/08/1998", address: "DELHI SECTOR 4",         father: "Dinesh Kumar"},
        ];

        const filtered = MODAL_PATIENTS.filter(p =>
          !modalSearchTerm ||
          p.uhid.includes(modalSearchTerm) ||
          p.name.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
          p.mobile.includes(modalSearchTerm)
        );

        return (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-[2px] overflow-y-auto animate-fade-in">
            <div className="w-full max-w-7xl bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col my-4 mx-4">

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-[#cee6f8] rounded-t-xl flex-shrink-0">
                <span className="font-bold text-slate-800 text-sm">Patient Details</span>
                <div className="flex items-center gap-1.5">
                  <Button variant="outline" size="sm" className="h-7 px-3 bg-white text-slate-700 hover:bg-slate-50 border-slate-300 text-xs font-bold">
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setModalSearchTerm("")} className="h-7 px-3 bg-white text-slate-700 hover:bg-slate-50 border-slate-300 text-xs font-bold">
                    Clear Filter
                  </Button>
                  <Button size="sm" onClick={() => setIsPatientSearchModalOpen(false)} className="h-7 px-3 bg-blue-600 hover:bg-blue-700 text-white border-blue-600 text-xs font-bold">
                    Close
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-3 text-xs">

                {/* Row 1: Facility + Entry Site + Radio groups */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 w-14 flex-shrink-0">Facility</span>
                    <Select defaultValue="CMK">
                      <SelectTrigger className="h-7 text-xs w-44 bg-white border-slate-200"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="CMK">CMK HEALTHCARE PVT. LTD.</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 w-16 flex-shrink-0">Entry Site</span>
                    <Select defaultValue="All">
                      <SelectTrigger className="h-7 text-xs w-28 bg-white border-slate-200"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="All">ALL</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-4 font-semibold text-slate-700">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name="modal-search-scope" defaultChecked className="h-3.5 w-3.5" />
                      <span>Search on Criteria</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name="modal-search-scope" className="h-3.5 w-3.5" />
                      <span>Search All (Date Range)</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-4 font-semibold text-slate-700">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name="modal-filter" defaultChecked className="h-3.5 w-3.5" />
                      <span>Registration</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name="modal-filter" className="h-3.5 w-3.5" />
                      <span>Encounter</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name="modal-filter" className="h-3.5 w-3.5" />
                      <span>Discharge</span>
                    </label>
                  </div>
                </div>

                {/* Row 2: Search fields – Row 1 of 2 */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-2">
                  {[
                    { label: "UHID",         isMain: true },
                    { label: "IP No.",       isMain: false },
                    { label: "Patient Name", isMain: false },
                    { label: "Date of Birth",isMain: false },
                    { label: "Phone",        isMain: false },
                  ].map(({ label, isMain }) => (
                    <div key={label} className="flex flex-col gap-0.5">
                      <span className="text-slate-500 font-semibold text-[10px] uppercase tracking-wide">{label}</span>
                      <Input
                        className="h-7 text-xs bg-white border-slate-200"
                        value={isMain ? modalSearchTerm : ""}
                        onChange={isMain ? (e) => setModalSearchTerm(e.target.value) : undefined}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-2">
                  {["Mobile #", "Bed No", "E-Mail Id", "Company", "Passport No"].map(label => (
                    <div key={label} className="flex flex-col gap-0.5">
                      <span className="text-slate-500 font-semibold text-[10px] uppercase tracking-wide">{label}</span>
                      <Input className="h-7 text-xs bg-white border-slate-200" />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-2">
                  {["Identity No", "Old Reg No", "Mother Name", "Father Name", "Privilege Card"].map(label => (
                    <div key={label} className="flex flex-col gap-0.5">
                      <span className="text-slate-500 font-semibold text-[10px] uppercase tracking-wide">{label}</span>
                      <Input className="h-7 text-xs bg-white border-slate-200" />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-2">
                  <div className="flex flex-col gap-0.5 col-span-2">
                    <span className="text-slate-500 font-semibold text-[10px] uppercase tracking-wide">Address</span>
                    <Input className="h-7 text-xs bg-white border-slate-200" />
                  </div>
                </div>

                {/* Patient Table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#cee6f8]/40 border-b border-slate-200 font-bold text-slate-700">
                      <tr>
                        <th className="px-3 py-2 text-center w-14">Select</th>
                        <th className="px-3 py-2">UHID</th>
                        <th className="px-3 py-2">Patient Name</th>
                        <th className="px-3 py-2">Gender/Age</th>
                        <th className="px-3 py-2">Registration Date</th>
                        <th className="px-3 py-2">Company</th>
                        <th className="px-3 py-2">MobileNo</th>
                        <th className="px-3 py-2">DOB</th>
                        <th className="px-3 py-2 max-w-[160px]">PatientAddress</th>
                        <th className="px-3 py-2">Father Name</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-600 bg-white">
                      {filtered.map((p) => {
                        const handleSelect = () => {
                          if (activeTab === "OP Billing") {
                            setOpBillingUhid(p.uhid);
                          } else if (activeTab === "IP Billing") {
                            setIpBillingUhid(p.uhid);
                          } else {
                            setInvoiceSearch(p.uhid);
                          }
                          setIsPatientSearchModalOpen(false);
                          toast.success("Patient Selected", `${p.name} (UHID: ${p.uhid}) loaded successfully.`);
                        };
                        return (
                          <tr
                            key={p.uhid}
                            onClick={handleSelect}
                            className="hover:bg-blue-50 cursor-pointer group"
                          >
                            <td className="px-3 py-2 text-center">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleSelect(); }}
                                className="text-blue-600 font-bold hover:underline text-[11px]"
                              >
                                Select
                              </button>
                            </td>
                            <td className="px-3 py-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleSelect(); }}
                                className="font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                              >
                                {p.uhid}
                              </button>
                            </td>
                            <td className="px-3 py-2 font-bold text-slate-800 group-hover:text-blue-700">{p.name}</td>
                            <td className="px-3 py-2 text-slate-500">{p.genderAge}</td>
                            <td className="px-3 py-2 text-slate-500">{p.regDate}</td>
                            <td className="px-3 py-2">{p.company}</td>
                            <td className="px-3 py-2 text-slate-500">{p.mobile}</td>
                            <td className="px-3 py-2 text-slate-500">{p.dob}</td>
                            <td className="px-3 py-2 truncate max-w-[160px]">{p.address}</td>
                            <td className="px-3 py-2 text-slate-500">{p.father}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 pt-1">
                  <div className="flex items-center gap-1">
                    <button className="w-6 h-6 rounded border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-400">‹‹</button>
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <button
                        key={n}
                        className={`w-6 h-6 rounded border flex items-center justify-center font-bold ${n === 1 ? "bg-blue-600 text-white border-blue-600" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"}`}
                      >
                        {n}
                      </button>
                    ))}
                    <button className="w-6 h-6 rounded border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-400">››</button>
                  </div>
                  <span className="text-slate-400 italic">100 items in 10 pages</span>
                </div>

                {/* Patient Information footer */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide block mb-1">Name :</span>
                    <span className="text-slate-700 font-bold text-xs"></span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide block mb-1">Address :</span>
                    <span className="text-slate-700 text-xs"></span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide block mb-1">Kin :</span>
                    <span className="text-slate-700 text-xs"></span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
