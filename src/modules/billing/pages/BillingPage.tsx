import { useState } from "react";
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

interface InvoiceActivity {
  id: string;
  company: string;
  uhid: string;
  patientName: string;
  encNo: string;
  type: "OP" | "IP";
  invoiceNo: string;
  date: string;
  netAmt: number;
  paidPatient: number;
  paidPayer: number;
  adjusted: number;
  refund: number;
  creditNote: number;
  balance: number;
  status: "Outstanding" | "Settled";
}

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

const INITIAL_INVOICES: InvoiceActivity[] = [
  {
    id: "inv-1",
    company: "CASH / CASH",
    uhid: "3",
    patientName: "PatientName",
    encNo: "2",
    type: "OP",
    invoiceNo: "OPCA20/1",
    date: "2026-08-10",
    netAmt: 500,
    paidPatient: 500,
    paidPayer: 0,
    adjusted: 500,
    refund: 0,
    creditNote: -500,
    balance: 500,
    status: "Outstanding",
  },
  {
    id: "inv-2",
    company: "CASH / CASH",
    uhid: "13",
    patientName: "Mother Patient",
    encNo: "19/3",
    type: "IP",
    invoiceNo: "QIC20/1",
    date: "2026-08-09",
    netAmt: 4050,
    paidPatient: 4050,
    paidPayer: 0,
    adjusted: 4050,
    refund: 0,
    creditNote: 0,
    balance: 0,
    status: "Settled",
  },
  {
    id: "inv-3",
    company: "Star Health / Sponsor",
    uhid: "222",
    encNo: "21/3",
    patientName: "Mr. Somesh Kumar",
    type: "IP",
    invoiceNo: "IPCA26/3",
    date: "2026-08-12",
    netAmt: 15400,
    paidPatient: 2400,
    paidPayer: 10000,
    adjusted: 12400,
    refund: 0,
    creditNote: 0,
    balance: 3000,
    status: "Outstanding",
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

  // State Management
  const [patients, setPatients] = useState<BillingPatient[]>(INITIAL_PATIENTS);
  const [invoices, setInvoices] = useState<InvoiceActivity[]>(INITIAL_INVOICES);

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
  
  // Payment split grid state
  const [paymentRows, setPaymentRows] = useState<Array<{
    mode: string;
    amount: number;
    bankName: string;
    beneficiaryName: string;
    refNo: string;
  }>>([{ mode: "Cash", amount: 0, bankName: "", beneficiaryName: "", refNo: "" }]);

  // Add row to payment modes table
  const addPaymentRow = () => {
    setPaymentRows([...paymentRows, { mode: "-Select-", amount: 0, bankName: "", beneficiaryName: "", refNo: "" }]);
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

  const handleOpenSettlement = (invoice: InvoiceActivity) => {
    setSelectedInvoice(invoice);
    setPaymentRows([{ mode: "Cash", amount: invoice.balance, bankName: "", beneficiaryName: "", refNo: "" }]);
    setIsSettleModalOpen(true);
  };

  const handleSaveSettlement = () => {
    if (!selectedInvoice) return;

    const totalPaid = paymentRows.reduce((sum, r) => sum + Number(r.amount || 0), 0);
    if (totalPaid <= 0) {
      toast.error("Invalid Settlement", "Please specify a settlement amount greater than 0.");
      return;
    }

    if (totalPaid > selectedInvoice.balance) {
      toast.error("Excess Payment", `Total settlement amount exceeds the outstanding balance of ₹${selectedInvoice.balance}.`);
      return;
    }

    // Update local state
    const updatedInvoices = invoices.map((inv) => {
      if (inv.id === selectedInvoice.id) {
        const newBalance = inv.balance - totalPaid;
        return {
          ...inv,
          adjusted: inv.adjusted + totalPaid,
          balance: newBalance,
          status: newBalance <= 0 ? "Settled" : "Outstanding" as const
        };
      }
      return inv;
    });

    setInvoices(updatedInvoices);
    toast.success(
      "Receipt Saved Successfully!",
      `Settled ₹${totalPaid} on Invoice ${selectedInvoice.invoiceNo}.`
    );
    setIsSettleModalOpen(false);
    setSelectedInvoice(null);
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
              if (tab === "Patient Lists" || tab === "Master Activity List") {
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

        {activeTab === "Master Activity List" && (
          <Card className="flex-1 flex flex-col overflow-hidden">
            {/* Filters bar */}
            <div className="p-4 border-b border-slate-100 bg-white flex-shrink-0 text-xs font-semibold text-slate-700 space-y-3">
              {/* Row 1 */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-16">UHID</span>
                  <div className="flex items-center gap-1">
                    <Input
                      placeholder=""
                      className="h-7 text-xs w-32 bg-white border-slate-200"
                      value={invoiceSearch}
                      onChange={(e) => setInvoiceSearch(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 bg-blue-600 hover:bg-blue-700 text-white border-blue-600 font-bold"
                      onClick={() => setIsPatientSearchModalOpen(true)}
                    >
                      <Search className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-7 w-7 bg-blue-600 hover:bg-blue-700 text-white border-blue-600 font-bold">
                      R
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="w-16">Bill No</span>
                  <Input
                    placeholder=""
                    className="h-7 text-xs w-40 bg-white border-slate-200"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="w-20">Date Range</span>
                  <Select defaultValue="Date Range">
                    <SelectTrigger className="h-7 text-xs w-36 bg-white border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Date Range">Date Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span>From</span>
                  <Input
                    type="text"
                    defaultValue="13/08/2026"
                    className="h-7 text-xs w-28 bg-white border-slate-200 text-center"
                  />
                  <span>To</span>
                  <Input
                    type="text"
                    defaultValue="13/08/2026"
                    className="h-7 text-xs w-28 bg-white border-slate-200 text-center"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-16">Facility</span>
                  <Select defaultValue="CMK">
                    <SelectTrigger className="h-7 text-xs w-48 bg-white border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CMK">CMK HEALTHCARE PVT. LTD.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="w-16">Payer Type</span>
                  <Select defaultValue="Select All">
                    <SelectTrigger className="h-7 text-xs w-36 bg-white border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Select All">Select All</SelectItem>
                      <SelectItem value="Company">Company</SelectItem>
                      <SelectItem value="Direct">Direct</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="w-20">Payer</span>
                  <Select defaultValue="Select All">
                    <SelectTrigger className="h-7 text-xs w-36 bg-white border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Select All">Select All</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span>Sponsor</span>
                  <Select defaultValue="Select All">
                    <SelectTrigger className="h-7 text-xs w-36 bg-white border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Select All">Select All</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 3 */}
              <div className="flex items-center justify-between flex-wrap gap-4 pt-1">
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="w-16">Patient Type</span>
                    <Select defaultValue="Both">
                      <SelectTrigger className="h-7 text-xs w-48 bg-white border-slate-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Both">Both</SelectItem>
                        <SelectItem value="OP">OP</SelectItem>
                        <SelectItem value="IP">IP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-3">
                    <span>Print As</span>
                    <label className="flex items-center gap-1 cursor-pointer select-none">
                      <input type="radio" name="print-as" defaultChecked className="h-3.5 w-3.5 text-primary border-slate-300" />
                      <span>Summary</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer select-none">
                      <input type="radio" name="print-as" className="h-3.5 w-3.5 text-primary border-slate-300" />
                      <span>Detail</span>
                    </label>
                  </div>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input type="checkbox" className="h-3.5 w-3.5 rounded text-primary border-slate-300" />
                    <span>Patient</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input type="checkbox" className="h-3.5 w-3.5 rounded text-primary border-slate-300" />
                    <span>Refundable</span>
                  </label>

                  <div className="flex items-center gap-1.5">
                    <span>Search For</span>
                    <Select value={invoiceStatusFilter} onValueChange={setInvoiceStatusFilter}>
                      <SelectTrigger className="h-7 text-xs w-36 bg-white border-slate-200"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Select All</SelectItem>
                        <SelectItem value="settled">Settled</SelectItem>
                        <SelectItem value="unsettled">UnSettled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700 border-blue-600 text-white font-bold px-5">
                  Search
                </Button>
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
                    className={`h-7 px-3 rounded-md transition-colors ${
                      subTab === "Invoice Details"
                        ? "bg-blue-600 text-white"
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
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2.5 font-bold">Company</th>
                    <th className="px-3 py-2.5 font-bold">UHID</th>
                    <th className="px-3 py-2.5 font-bold">Patient</th>
                    <th className="px-3 py-2.5 font-bold">Enc#</th>
                    <th className="px-3 py-2.5 font-bold">Type</th>
                    <th className="px-3 py-2.5 font-bold">Invoice#</th>
                    <th className="px-3 py-2.5 font-bold">Date</th>
                    <th className="px-3 py-2.5 font-bold text-right">NetAmt</th>
                    <th className="px-3 py-2.5 font-bold text-right">Patient</th>
                    <th className="px-3 py-2.5 font-bold text-right">Payer</th>
                    <th className="px-3 py-2.5 font-bold text-right">Adjusted</th>
                    <th className="px-3 py-2.5 font-bold text-right">Refund</th>
                    <th className="px-3 py-2.5 font-bold text-right">Cr.Note</th>
                    <th className="px-3 py-2.5 font-bold text-right">Balance</th>
                    <th className="px-3 py-2.5 font-bold text-center">Status</th>
                    <th className="px-3 py-2.5 font-bold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/40">
                        <td className="px-3 py-3 text-[10px] font-semibold">{inv.company}</td>
                        <td className="px-3 py-3 font-mono">{inv.uhid}</td>
                        <td className="px-3 py-3 font-bold text-slate-800">{inv.patientName}</td>
                        <td className="px-3 py-3 text-slate-500">{inv.encNo}</td>
                        <td className="px-3 py-3 font-bold text-center">{inv.type}</td>
                        <td className="px-3 py-3 font-mono text-emerald-800 font-bold">{inv.invoiceNo}</td>
                        <td className="px-3 py-3 text-slate-500">{inv.date}</td>
                        <td className="px-3 py-3 text-right font-bold text-slate-800">₹{inv.netAmt.toFixed(2)}</td>
                        <td className="px-3 py-3 text-right text-slate-500">₹{inv.paidPatient.toFixed(2)}</td>
                        <td className="px-3 py-3 text-right text-slate-500">₹{inv.paidPayer.toFixed(2)}</td>
                        <td className="px-3 py-3 text-right text-slate-500">₹{inv.adjusted.toFixed(2)}</td>
                        <td className="px-3 py-3 text-right text-slate-500">₹{inv.refund.toFixed(2)}</td>
                        <td className="px-3 py-3 text-right text-red-500">₹{inv.creditNote.toFixed(2)}</td>
                        <td className="px-3 py-3 text-right font-bold text-slate-800">₹{inv.balance.toFixed(2)}</td>
                        <td className="px-3 py-3 text-center">
                          {inv.status === "Settled" ? (
                            <span className="inline-block w-4 h-4 bg-emerald-500 rounded shadow-xs" title="Settled"></span>
                          ) : (
                            <span
                              className="inline-block w-4 h-4 bg-red-500 rounded shadow-xs cursor-pointer animate-pulse"
                              title="Outstanding"
                              onClick={() => handleOpenSettlement(inv)}
                            ></span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {inv.balance > 0 ? (
                            <Button
                              variant="outline"
                              size="xs"
                              className="h-6 text-[10px] py-0 px-2 font-medium bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700"
                              onClick={() => handleOpenSettlement(inv)}
                            >
                              Settle
                            </Button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-semibold">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={16} className="px-3 py-12 text-center text-slate-400">
                        No activity details found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
            </div>
          </Card>
        )}
      </div>

      {/* Settlement (Receipt) Dialog Modal */}
      {isSettleModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 animate-fade-in">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <ReceiptText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Receipt Settlement</h3>
                  <p className="text-xs text-slate-500 font-mono">Invoice Ref: {selectedInvoice.invoiceNo}</p>
                </div>
              </div>
              <button onClick={() => setIsSettleModalOpen(false)} className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              {/* Ledger Summary Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 font-semibold text-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Patient / UHID</span>
                  <span className="text-xs block mt-0.5">{selectedInvoice.patientName} (UHID: {selectedInvoice.uhid})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Encounter No / Bill No</span>
                  <span className="text-xs block mt-0.5">{selectedInvoice.encNo} / {selectedInvoice.invoiceNo}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Net Invoice Amount</span>
                  <span className="text-xs block mt-0.5">₹{selectedInvoice.netAmt.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Outstanding Balance</span>
                  <span className="text-xs text-red-600 block mt-0.5">₹{selectedInvoice.balance.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Details Header Row */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Payment Settlement Modes</h4>
                  <Button variant="outline" size="xs" onClick={addPaymentRow} className="h-7 text-[10px] gap-1 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 font-bold">
                    <Plus className="h-3.5 w-3.5" /> Add Split Row
                  </Button>
                </div>

                {/* Modes Table Grid */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="text-[10px] text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2 font-semibold w-32">Mode</th>
                        <th className="px-3 py-2 font-semibold w-28">Amount</th>
                        <th className="px-3 py-2 font-semibold w-40">Bank Name</th>
                        <th className="px-3 py-2 font-semibold w-40">Beneficiary</th>
                        <th className="px-3 py-2 font-semibold">Reference / Card Ref</th>
                        <th className="px-2 py-2 font-semibold text-center w-10">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paymentRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/20">
                          <td className="p-2">
                            <Select value={row.mode} onValueChange={(val) => updatePaymentField(idx, "mode", val)}>
                              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="-Select-">-Select-</SelectItem>
                                <SelectItem value="Cash">Cash</SelectItem>
                                <SelectItem value="Card">Card</SelectItem>
                                <SelectItem value="UPI">UPI</SelectItem>
                                <SelectItem value="Cheque">Cheque</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              className="h-7 text-xs font-semibold"
                              value={row.amount || ""}
                              onChange={(e) => updatePaymentField(idx, "amount", Number(e.target.value))}
                              placeholder="0.00"
                            />
                          </td>
                          <td className="p-2">
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
                          <td className="p-2">
                            <Select value={row.beneficiaryName || "-Select-"} onValueChange={(val) => updatePaymentField(idx, "beneficiaryName", val)}>
                              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="-Select-">-Select-</SelectItem>
                                <SelectItem value="CMK Main Receipt">CMK Main Receipt</SelectItem>
                                <SelectItem value="CMK Branch Account">CMK Branch Account</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-2">
                            <Input
                              type="text"
                              className="h-7 text-xs"
                              value={row.refNo}
                              onChange={(e) => updatePaymentField(idx, "refNo", e.target.value)}
                              placeholder="UPI / Cheque / Card Ref"
                            />
                          </td>
                          <td className="p-2 text-center">
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
                  <span className="text-slate-500">Total Receipt Amount:</span>
                  <span className="text-slate-800 text-sm">
                    ₹{paymentRows.reduce((sum, r) => sum + Number(r.amount || 0), 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end px-6 py-3 border-t border-slate-100 bg-slate-50 gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={() => setIsSettleModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="success" size="sm" onClick={handleSaveSettlement} className="gap-1">
                <ShieldCheck className="h-4 w-4" /> Save Receipt
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Search Dialog Modal */}
      {isPatientSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 animate-fade-in">
          <div className="w-full max-w-6xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-[#cee6f8] flex-shrink-0">
              <span className="font-bold text-slate-800 text-sm">Patient Details</span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="xs" className="h-7 px-3 bg-white text-slate-700 hover:bg-slate-50 border-slate-300">
                  Filter
                </Button>
                <Button variant="outline" size="xs" className="h-7 px-3 bg-white text-slate-700 hover:bg-slate-50 border-slate-300" onClick={() => setModalSearchTerm("")}>
                  Clear Filter
                </Button>
                <Button variant="outline" size="xs" className="h-7 px-3 bg-blue-600 hover:bg-blue-700 text-white border-blue-600 font-bold" onClick={() => setIsPatientSearchModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Facility site row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="font-bold w-16">Facility</span>
                  <Select defaultValue="CMK">
                    <SelectTrigger className="h-7 text-xs flex-1 bg-white border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CMK">CMK HEALTHCARE PVT. LTD.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold w-16">Entry Site</span>
                  <Select defaultValue="All">
                    <SelectTrigger className="h-7 text-xs flex-1 bg-white border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">-- ALL --</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-4 pl-4">
                  <label className="flex items-center gap-1 cursor-pointer select-none font-bold">
                    <input type="radio" name="modal-search-scope" defaultChecked className="h-3.5 w-3.5 text-primary border-slate-300" />
                    <span>Search on Criteria</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer select-none font-bold">
                    <input type="radio" name="modal-search-scope" className="h-3.5 w-3.5 text-primary border-slate-300" />
                    <span>Search All (Date Range)</span>
                  </label>
                </div>
                <div className="flex items-center gap-4 pl-4 font-bold">
                  <label className="flex items-center gap-1 cursor-pointer select-none">
                    <input type="radio" name="modal-filter" defaultChecked className="h-3.5 w-3.5 text-primary border-slate-300" />
                    <span>Registration</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer select-none">
                    <input type="radio" name="modal-filter" className="h-3.5 w-3.5 text-primary border-slate-300" />
                    <span>Encounter</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer select-none">
                    <input type="radio" name="modal-filter" className="h-3.5 w-3.5 text-primary border-slate-300" />
                    <span>Discharge</span>
                  </label>
                </div>
              </div>

              {/* Form inputs grid */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <div className="space-y-1">
                  <span className="text-slate-500 font-semibold">UHID</span>
                  <Input className="h-7 text-xs bg-white border-slate-200" value={modalSearchTerm} onChange={(e) => setModalSearchTerm(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 font-semibold">IP No.</span>
                  <Input className="h-7 text-xs bg-white border-slate-200" />
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 font-semibold">Patient Name</span>
                  <Input className="h-7 text-xs bg-white border-slate-200" />
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 font-semibold">Date of Birth</span>
                  <Input className="h-7 text-xs bg-white border-slate-200" />
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 font-semibold">Phone</span>
                  <Input className="h-7 text-xs bg-white border-slate-200" />
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 font-semibold">Mobile #</span>
                  <Input className="h-7 text-xs bg-white border-slate-200" />
                </div>
              </div>

              {/* Patient Table Grid */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#cee6f8]/40 border-b border-slate-200 font-bold text-slate-700">
                    <tr>
                      <th className="px-3 py-2 text-center w-16">Select</th>
                      <th className="px-3 py-2">UHID</th>
                      <th className="px-3 py-2">Patient Name</th>
                      <th className="px-3 py-2">Gender/Age</th>
                      <th className="px-3 py-2">Registration Date</th>
                      <th className="px-3 py-2">Company</th>
                      <th className="px-3 py-2">MobileNo</th>
                      <th className="px-3 py-2">DOB</th>
                      <th className="px-3 py-2">PatientAddress</th>
                      <th className="px-3 py-2">Father Name</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-600 bg-white">
                    {[
                      { uhid: "2711", name: "Mr. Haula Khan", genderAge: "Male/65 Yr", regDate: "12/08/2026 7:19PM", company: "CASH", mobile: "9818456584", dob: "12/08/1961", address: "MANGOL PURI", father: "S K Khan" },
                      { uhid: "2710", name: "Mr. Raj Pal Yadav", genderAge: "Male/70 Yr", regDate: "10/08/2026 4:29PM", company: "CASH", mobile: "8384858875", dob: "10/08/1956", address: "JAI ESAR", father: "R P Yadav" },
                      { uhid: "2709", name: "Mr. Jumrati", genderAge: "Male/63 Yr", regDate: "03/08/2026 3:05PM", company: "CASH", mobile: "9960378464", dob: "03/08/1963", address: "MAYUR VIHAR PHASE -1", father: "Jumrati Sr" },
                      { uhid: "2708", name: "Mrs. Vandana", genderAge: "Female/40 Yr", regDate: "31/07/2026 6:54PM", company: "CASH", mobile: "8076185091", dob: "31/07/1986", address: "CR PARK", father: "A K Sharma" },
                      { uhid: "2707", name: "Ms. Shipra Shukla", genderAge: "Female/54 Yr", regDate: "31/07/2026 6:30PM", company: "CASH", mobile: "9988810517", dob: "31/07/1972", address: "T-74B MALVIYA NAGAR", father: "S N Shukla" },
                      { uhid: "222", name: "Mr. Somesh Kumar", genderAge: "Male/28 Yr", regDate: "11/08/2026 4:30PM", company: "CASH", mobile: "9695960777", dob: "11/08/1998", address: "DELHI SECTOR 4", father: "Dinesh Kumar" },
                      { uhid: "3", name: "PatientName", genderAge: "Male/32 Yr", regDate: "10/08/2026 11:15AM", company: "CASH", mobile: "9876543210", dob: "10/08/1994", address: "MAIN STREET 12", father: "FatherName" }
                    ]
                    .filter(p => !modalSearchTerm || p.uhid.includes(modalSearchTerm) || p.name.toLowerCase().includes(modalSearchTerm.toLowerCase()))
                    .map((p) => (
                      <tr key={p.uhid} className="hover:bg-slate-50/60">
                        <td className="p-2 text-center">
                          <button
                            onClick={() => {
                              setInvoiceSearch(p.uhid);
                              setIsPatientSearchModalOpen(false);
                              toast.success("Patient Selected", `UHID ${p.uhid} loaded into filters.`);
                            }}
                            className="text-blue-600 font-bold hover:underline"
                          >
                            Select
                          </button>
                        </td>
                        <td className="p-2 font-mono">{p.uhid}</td>
                        <td className="p-2 font-bold text-slate-800">{p.name}</td>
                        <td className="p-2 text-slate-500">{p.genderAge}</td>
                        <td className="p-2 text-slate-500">{p.regDate}</td>
                        <td className="p-2">{p.company}</td>
                        <td className="p-2 text-slate-500">{p.mobile}</td>
                        <td className="p-2 text-slate-500">{p.dob}</td>
                        <td className="p-2 truncate max-w-[150px]">{p.address}</td>
                        <td className="p-2 text-slate-500">{p.father}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
