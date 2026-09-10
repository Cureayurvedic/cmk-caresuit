import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { BillingInvoicePrint, BillingInvoicePrintData } from "../components/BillingInvoicePrint";
import {
  ReceiptText,
  DollarSign,
  TrendingUp,
  Clock,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  X,
  Plus,
  Trash2,
  Printer,
  FileText,
  CreditCard,
  RotateCcw,
  Wallet,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  User,
  Phone,
  RefreshCw,
  Eye,
  FileCheck,
  UserPlus,
  ChevronDown,
  Stethoscope,
} from "lucide-react";
import AddDoctorModal from "@/components/AddDoctorModal";
import { ORTHOPEDICS_SERVICES } from "../data/orthopedicsServices";
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
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  settleInvoice,
  cancelInvoice,
  getBillingStats,
  getReceipts,
  getBillingPatients,
  getOpVisits,
  createOpVisit,
  getBillingOrders,
  createBillingOrder,
  billOrder,
  getAdvances,
  createAdvance,
  getCreditNotes,
  createCreditNote,
  getRefunds,
  createRefund,
  getIntimations,
  createIntimation,
  updateIntimation,
  seedBillingData,
  InvoiceData,
  ReceiptData,
  InvoiceItem,
  BillingStats,
  OpVisitData,
  BillingOrderData,
  AdvanceData,
  CreditNoteData,
  RefundData,
  InsuranceIntimationData,
} from "@/api/billingApi";
import { fetchDoctorsFromSettings, DEFAULT_DOCTORS } from "@/api/settingsApi";

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
  address?: string;
  fatherName?: string;
  photoUrl?: string;
  image?: string;
}

const INITIAL_PATIENTS: BillingPatient[] = [
  {
    uhid: "2710",
    ipNo: "OP-1",
    patientName: "Mr. Raj Pal Yadav",
    genderAge: "Male/70 Yr",
    admissionDate: "2026-08-10T16:29:00",
    bedNo: "OPD-01",
    billingCategory: "CONSULTATION / OPD",
    doctor: "Dr. Sameer Sen 3105",
    encounterStatus: "Open",
    company: "CASH / CASH",
    mobileNo: "8384858875",
    type: "Registration",
    address: "JAI ESAR, UTTAR PRADESH",
    fatherName: "R P Yadav",
    photoUrl:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80",
  },
  {
    uhid: "222",
    ipNo: "21/3",
    patientName: "Mr. Somesh Kumar",
    genderAge: "Male/28 Yr",
    admissionDate: "2026-08-11T16:30:00",
    bedNo: "GEN-01",
    billingCategory: "GENERAL WARD / DELUXE ROOM",
    doctor: "Dr. Abhishek Bansal 2273",
    encounterStatus: "Open",
    company: "Star Health Insurance",
    mobileNo: "9695960777",
    type: "Admission",
    address: "DELHI SECTOR 4",
    fatherName: "Dinesh Kumar",
    photoUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  },
  {
    uhid: "105",
    ipNo: "21/8",
    patientName: "Mrs. Anita Sharma",
    genderAge: "Female/42 Yr",
    admissionDate: "2026-08-12T10:15:00",
    bedNo: "ICU-04",
    billingCategory: "ICU / SPECIAL CATEGORY",
    doctor: "Dr. Rajesh Malhotra 1104",
    encounterStatus: "Bill Prepared",
    company: "HDFC ERGO Health",
    mobileNo: "9812457890",
    type: "Admission",
    address: "NOIDA SECTOR 62",
    fatherName: "S K Sharma",
    photoUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
  },
  {
    uhid: "44",
    ipNo: "21/2",
    patientName: "Mr. Demo Patient",
    genderAge: "Male/35 Yr",
    admissionDate: "2026-08-01T20:49:00",
    bedNo: "DLX-02",
    billingCategory: "DELUXE ROOM / DELUXE ROOM",
    doctor: "Dr. D K DAS 2268",
    encounterStatus: "Marked For Discharged",
    company: "CASH / CASH",
    mobileNo: "2587413550",
    type: "Admission",
    address: "GURGAON SECTOR 14",
    fatherName: "Demo Father",
    isVip: true,
    photoUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
  },
  {
    uhid: "303",
    ipNo: "21/9",
    patientName: "Master Rohan Verma",
    genderAge: "Male/12 Yr",
    admissionDate: "2026-08-13T08:30:00",
    bedNo: "PED-02",
    billingCategory: "PEDIATRIC / GENERAL",
    doctor: "Dr. Sania Mirza 2231",
    encounterStatus: "Bill Prepared",
    company: "CASH / CASH",
    mobileNo: "9876543210",
    type: "Discharge",
    address: "DELHI LAXMI NAGAR",
    fatherName: "Suresh Verma",
    photoUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
  },
];

interface SearchableServiceSelectProps {
  value: string;
  options: Array<{ code: string; name: string; dept?: string; rate?: number }>;
  onSelect: (service: { code: string; name: string; dept?: string; rate?: number }) => void;
  placeholder?: string;
}

function SearchableServiceSelect({
  value,
  options,
  onSelect,
  placeholder = "Select Service...",
}: SearchableServiceSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [coords, setCoords] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 480,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updateCoords = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dropdownHeight = 320;
      const spaceBelow = window.innerHeight - rect.bottom;
      const placeAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight;
      const top = placeAbove ? rect.top - dropdownHeight : rect.bottom + 2;
      const left = Math.min(rect.left, window.innerWidth - 490);
      setCoords({
        top: Math.max(10, top),
        left: Math.max(10, left),
        width: Math.max(rect.width, 480),
      });
    }
  }, []);

  const handleOpen = () => {
    updateCoords();
    setIsOpen(true);
    setSearchTerm("");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    const handleScrollOrResize = () => {
      if (isOpen) {
        updateCoords();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen, updateCoords]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase().trim();
    return options.filter(
      (opt) =>
        opt.name.toLowerCase().includes(term) ||
        (opt.code && opt.code.toLowerCase().includes(term))
    );
  }, [options, searchTerm]);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={handleOpen}
        className="h-6 w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded px-1.5 flex items-center justify-between focus:outline-none focus:border-blue-500 hover:border-slate-300 text-left truncate cursor-pointer"
      >
        <span className="truncate pr-1">
          {value || <span className="text-slate-400 font-normal">{placeholder}</span>}
        </span>
        <ChevronDown className="h-3 w-3 text-slate-400 flex-shrink-0" />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 99999,
            }}
            className="bg-white border border-slate-300 rounded-md shadow-2xl p-2 space-y-1.5"
          >
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search service by name or code (e.g. plaster, ACL, 103599)..."
                className="w-full h-7 pl-8 pr-7 text-xs font-medium border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs font-medium rounded border border-slate-100">
              {filtered.length === 0 ? (
                <div className="py-3 px-2 text-center text-slate-400 italic">
                  No matching service found.
                </div>
              ) : (
                filtered.map((s) => {
                  const isSelected = s.name === value;
                  return (
                    <div
                      key={s.code + s.name}
                      onClick={() => {
                        onSelect(s);
                        setIsOpen(false);
                        setSearchTerm("");
                      }}
                      className={`px-2.5 py-1.5 cursor-pointer flex items-center justify-between hover:bg-blue-50 transition-colors ${
                        isSelected ? "bg-blue-100/70 font-bold text-blue-900" : "text-slate-700"
                      }`}
                    >
                      <span className="truncate pr-2">{s.name}</span>
                      {s.dept !== "Orthopedics" && (
                        <span className="text-[10px] text-slate-500 font-mono flex-shrink-0 bg-slate-100 px-1.5 py-0.5 rounded font-semibold">
                          ₹{s.rate || 0}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            <div className="text-[10px] text-slate-500 text-right px-1 font-medium">
              Showing {filtered.length} of {options.length} services
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

interface SearchableDropdownProps {
  value: string;
  options: string[];
  onSelect: (val: string) => void;
  placeholder?: string;
  className?: string;
  width?: string;
}

function SearchableDropdown({
  value,
  options,
  onSelect,
  placeholder = "Select...",
  className = "",
  width = "w-48",
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [coords, setCoords] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 240,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updateCoords = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dropdownHeight = 260;
      const spaceBelow = window.innerHeight - rect.bottom;
      const placeAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight;
      const top = placeAbove ? rect.top - dropdownHeight : rect.bottom + 2;
      const left = Math.min(rect.left, window.innerWidth - 260);
      setCoords({
        top: Math.max(10, top),
        left: Math.max(10, left),
        width: Math.max(rect.width, 240),
      });
    }
  }, []);

  const handleOpen = () => {
    updateCoords();
    setIsOpen(true);
    setSearchTerm("");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    const handleScrollOrResize = () => {
      if (isOpen) {
        updateCoords();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen, updateCoords]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase().trim();
    return options.filter((opt) => opt.toLowerCase().includes(term));
  }, [options, searchTerm]);

  return (
    <div className={`relative ${width}`} ref={containerRef}>
      <button
        type="button"
        onClick={handleOpen}
        className={`h-6 w-full text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded px-2 flex items-center justify-between focus:outline-none focus:border-blue-500 hover:border-slate-400 text-left truncate cursor-pointer ${className}`}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 99999,
            }}
            className="bg-white border border-slate-300 rounded-md shadow-2xl overflow-hidden flex flex-col text-xs animate-in fade-in-50 duration-100"
          >
            <div className="p-1.5 border-b border-slate-200 bg-slate-50 flex items-center gap-1.5 sticky top-0 z-10">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to search..."
                className="w-full bg-white text-xs border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500 font-medium"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 font-medium">
              {filtered.length === 0 ? (
                <div className="p-3 text-center text-slate-400 italic">
                  No matching options
                </div>
              ) : (
                filtered.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onSelect(opt);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      value === opt ? "bg-blue-50/80 font-bold text-blue-700" : "text-slate-700"
                    }`}
                  >
                    <span className="truncate">{opt}</span>
                    {value === opt && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 ml-1" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

const SERVICE_CATALOG = [
  {
    code: "CON-01",
    name: "OPD Consultation - Senior Specialist",
    dept: "General OPD",
    rate: 700,
  },
  {
    code: "CON-02",
    name: "Emergency Consultation",
    dept: "General OPD",
    rate: 1000,
  },
  {
    code: "CON-03",
    name: "Super Specialist Consultation",
    dept: "General OPD",
    rate: 1200,
  },
  {
    code: "OTH-01",
    name: "Others",
    dept: "General OPD",
    rate: 0,
  },
  ...ORTHOPEDICS_SERVICES,
];

const MEDICAL_SPECIALISATIONS = [
  "All",
  "Anaesthesia",
  "ANESTHETIST",
  "Biochemistry",
  "BLOOD BANK",
  "Breast Oncology",
  "Breast Surgery",
  "Cardiac Anaesthesia",
  "Cardiology",
  "Cardiothoracic and Vascular Surgery",
  "Chest Physician",
  "Clinical Psychology",
  "Critical Care and Respiratory Medicine",
  "Dental & OMFS",
  "Dermatology",
  "Diet",
  "Emergency and Acute Care",
  "Endocrine Surgery",
  "Endocrinology",
  "ENT Surgery",
  "EYE SURGEON",
  "Gastroenterology",
  "General",
  "General & Minimal Access Surgery",
  "General Medicine",
  "General OPD",
  "General Physician",
  "General Surgery",
  "GI And Thoracic Oncology",
  "GI Surgery",
  "Gynae Oncology",
  "GYNAECOLOGIST",
  "Haematology",
  "Head And Neck Oncology",
  "Histopathology & Cytopathology",
  "Infection Control",
  "Internal Medicine",
  "Interventional Radiology",
  "IVF and Reproductive Medicine",
  "Joint Replacement Surgery",
  "Lab Medicine",
  "Lab Technician",
  "Laparoscopic/Minimal Access Surgical Oncology",
  "Laparoscopic Gynaecology & Foetal Medicine",
  "Medical Oncology",
  "MHC",
  "Microbiology",
  "Minimal Access Bariatric & GI Surgery",
  "Neonatology",
  "Nephrology",
  "Neuro Oncology",
  "NEURO PHYSICIAN",
  "NEURO SURGEON",
  "Neurology",
  "Neurosurgery",
  "Nurse",
  "Obstetrics and Gynaecology",
  "OMFS",
  "ONCOLOGIST",
  "Ophthalmology",
  "ORAL AND MAXILLOFACIAL SURGEON",
  "Orthopaedics",
  "Orthopedics",
  "Other",
  "Outside Referral",
  "OUTSOURCE DOCTOR",
  "Paediatric Cardiology",
  "Paediatric CTVS",
  "Paediatric Surgery",
  "Paediatrics and Neonatology",
  "Pain Management",
  "Pathology",
  "Pediatrics And Neonatology",
  "PSYCHATRIST",
  "physician",
  "PHYSICIAN MD MEDICINE",
  "Physiotherapy",
  "Plastic Surgery",
  "Psychiatry",
  "Quality Management",
  "RBA",
  "Radiation Oncology",
  "Radiology",
  "REFEREED",
  "Respiratory Medicine",
  "Rheumatology",
  "SPECIALITY CREATED IN KIRAN",
  "speech",
  "Speech Therapy",
  "Transfusion Medicine",
  "URO SURGEON",
  "UROLOGIST",
  "Urology",
  "Urology and Renal Transplant",
  "Vascular and Endovascular Surgery",
];

const ALL_DEPARTMENTS = Array.from(
  new Set(["General OPD", "Orthopedics", ...MEDICAL_SPECIALISATIONS.filter((s) => s !== "All")])
);

const DEFAULT_OPD_ITEM: InvoiceItem = {
  code: "CON-01",
  name: "OPD Consultation - Senior Specialist",
  dept: "General OPD",
  rate: 700,
  qty: 1,
  discountPercent: 0,
  discountAmt: 0,
  taxPercent: 0,
  netAmt: 700,
};

export default function BillingPage() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Map tab URL params to tab names
  const tabParamMap: Record<string, string> = {
    "patient-lists": "Patient Lists",
    "master-activity-list": "Master Activity List",
    "create-op-visit": "Create OP Visit",
    "op-billing": "OP Billing",
    "ip-billing": "IP Billing",
    refund: "Refund",
    "advance-collection": "Advance Collection",
    "credit-note": "Credit Note",
    intimation: "Intimation",
    "unbilled-orders": "UnBilled Orders",
  };

  const paramTabMap: Record<string, string> = {
    "Patient Lists": "patient-lists",
    "Master Activity List": "master-activity-list",
    "Create OP Visit": "create-op-visit",
    "OP Billing": "op-billing",
    "IP Billing": "ip-billing",
    Refund: "refund",
    "Advance Collection": "advance-collection",
    "Credit Note": "credit-note",
    Intimation: "intimation",
    "UnBilled Orders": "unbilled-orders",
  };

  const activeTabParam = searchParams.get("tab") || "op-billing";
  const activeTab = tabParamMap[activeTabParam] || "OP Billing";

  const setActiveTab = (tabName: string) => {
    const param = paramTabMap[tabName] || "op-billing";
    setSearchParams({ tab: param });
  };
  const [activeSubTab, setActiveSubTab] = useState<string>("Invoice Details");

  // Live Stats
  const [stats, setStats] = useState<BillingStats>({
    todayRevenue: 124500,
    monthRevenue: 1850000,
    pendingBillsCount: 23,
    totalInvoicesCount: 342,
    activeAdvanceBalance: 3000,
  });

  // Data Stores
  const [patients, setPatients] = useState<BillingPatient[]>(INITIAL_PATIENTS);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [visits, setVisits] = useState<OpVisitData[]>([]);
  const [orders, setOrders] = useState<BillingOrderData[]>([]);
  const [advances, setAdvances] = useState<AdvanceData[]>([]);
  const [creditNotes, setCreditNotes] = useState<CreditNoteData[]>([]);
  const [refunds, setRefunds] = useState<RefundData[]>([]);
  const [intimations, setIntimations] = useState<InsuranceIntimationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters State
  const [patientSearch, setPatientSearch] = useState("");
  const [patientSearchOn, setPatientSearchOn] = useState("Patient Name");
  const [patientTypeFilter, setPatientTypeFilter] =
    useState<string>("Admission");
  const [patientStatusFilter, setPatientStatusFilter] = useState("all");
  const [patientPageSize, setPatientPageSize] = useState(10);
  const [patientCurrentPage, setPatientCurrentPage] = useState(1);

  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("all");
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState("Both");

  // ─── Master Activity List Filter State ───────────────────────────────────────
  const [malUhid, setMalUhid] = useState("");
  const [malBillNo, setMalBillNo] = useState("");
  const [malDateRangePreset, setMalDateRangePreset] = useState("Date Range");
  const [malFromDate, setMalFromDate] = useState("");
  const [malToDate, setMalToDate] = useState("");
  const [malFacility, setMalFacility] = useState("CMK HEALTHCARE PVT. LTD.");
  const [malPayerType, setMalPayerType] = useState("Select All");
  const [malPayer, setMalPayer] = useState("Select All");
  const [malSponsor, setMalSponsor] = useState("Select All");
  const [malPatientType, setMalPatientType] = useState("Both");
  const [malPrintAs, setMalPrintAs] = useState<"Summary" | "Detail">("Summary");
  const [malPatientRefundableOnly, setMalPatientRefundableOnly] =
    useState(false);
  const [malSearchFor, setMalSearchFor] = useState("All Invoices");

  // In-table column filter inputs
  const [colFilterCompany, setColFilterCompany] = useState("");
  const [colFilterUhid, setColFilterUhid] = useState("");
  const [colFilterPatient, setColFilterPatient] = useState("");
  const [colFilterEnc, setColFilterEnc] = useState("");
  const [colFilterInvoiceNo, setColFilterInvoiceNo] = useState("");

  // Selected Invoices Multi-select
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);

  // Selected for modals
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(
    null,
  );
  const [printInvoiceData, setPrintInvoiceData] = useState<InvoiceData | null>(
    null,
  );
  const printInvoiceRef = useRef<HTMLDivElement>(null);
  const handlePrintInvoice = useReactToPrint({
    contentRef: printInvoiceRef,
    documentTitle: `Invoice_${printInvoiceData?.invoiceNo || "Receipt"}`,
  });
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [isPatientSearchModalOpen, setIsPatientSearchModalOpen] =
    useState(false);
  const [modalSearchTerm, setModalSearchTerm] = useState("");
  const [isInvoiceSearchModalOpen, setIsInvoiceSearchModalOpen] =
    useState(false);
  const [invoiceModalSearchTerm, setInvoiceModalSearchTerm] = useState("");

  // Advanced Search Modal States
  const [advSearchFields, setAdvSearchFields] = useState({
    uhid: "",
    bedNo: "",
    motherName: "",
    ipNo: "",
    email: "",
    fatherName: "",
    patientName: "",
    company: "",
    privilegeCard: "",
    dob: "",
    passportNo: "",
    address: "",
    phone: "",
    identityNo: "",
    mobileNo: "",
    oldRegNo: "",
    facility: "CMK HEALTHCARE PVT. LTD.",
    entrySite: "-- ALL --",
    searchType: "Search All (Date Range)",
    typeFilter: "all",
  });
  const [advPatients, setAdvPatients] = useState<any[]>([]);
  const [advTotalCount, setAdvTotalCount] = useState(0);
  const [advPage, setAdvPage] = useState(1);
  const [advIsLoading, setAdvIsLoading] = useState(false);

  // Settlement & Refund Modal States
  const [paymentRows, setPaymentRows] = useState<
    Array<{
      mode: string;
      amount: number;
      balance: number;
      date: string;
      bankName: string;
      beneficiaryName: string;
      refNo: string;
      description: string;
      cardSwipingValue: number;
    }>
  >([
    {
      mode: "Cash",
      amount: 0,
      balance: 0,
      date: new Date().toLocaleDateString("en-GB"),
      bankName: "",
      beneficiaryName: "",
      refNo: "",
      description: "",
      cardSwipingValue: 0,
    },
  ]);
  const [settlementNotes, setSettlementNotes] = useState("");
  const [availableDoctors, setAvailableDoctors] =
    useState<string[]>(DEFAULT_DOCTORS);
  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);
  const [doctorTargetField, setDoctorTargetField] = useState<
    "prescribing" | "opDoctor" | "orderDoctor" | null
  >(null);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [consultationSpecialisation, setConsultationSpecialisation] =
    useState("Orthopedics");
  const [consultationProvider, setConsultationProvider] =
    useState("Dr. D K DAS");
  const [consultationVisitType, setConsultationVisitType] = useState(
    "ORTHOPAEDIC CONSULTATION"
  );
  const [consultationGrid, setConsultationGrid] = useState<
    Array<{
      id: string;
      provider: string;
      visitType: string;
      dept: string;
      rate: number;
    }>
  >([
    {
      id: "1",
      provider: "Dr. D K DAS",
      visitType: "ORTHOPAEDIC CONSULTATION",
      dept: "Orthopedics",
      rate: 700,
    },
  ]);

  // ─── Create OP Visit Form State ──────────────────────────────────────────────
  const [opUhid, setOpUhid] = useState("");
  const [opPatientName, setOpPatientName] = useState("");
  const [opStatus, setOpStatus] = useState("Open");
  const [opPayerType, setOpPayerType] = useState("Direct Patient");
  const [opPayer, setOpPayer] = useState("CASH");
  const [opSponsor, setOpSponsor] = useState("CASH");
  const [opNetwork, setOpNetwork] = useState("Select");
  const [opDoctor, setOpDoctor] = useState("Dr. Abhishek Bansal 2273");
  const [opDepartment, setOpDepartment] = useState("General OPD");
  const [opVisitType, setOpVisitType] = useState<
    "New" | "Follow-up" | "Emergency"
  >("New");
  const [opFee, setOpFee] = useState<number>(500);

  // ─── OP Billing Form State ───────────────────────────────────────────────────
  const [opBillingUhid, setOpBillingUhid] = useState("");
  const [opBillingVisitNo, setOpBillingVisitNo] = useState("1");
  const [opBillingYear, setOpBillingYear] = useState("26-27");
  const [opBillingType, setOpBillingType] = useState("Cash");
  const [opBillingInvoiceNo, setOpBillingInvoiceNo] = useState("");
  const [opBillingDate, setOpBillingDate] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  });
  const [opBillingPayerType, setOpBillingPayerType] =
    useState("Direct Patient");
  const [opBillingPayer, setOpBillingPayer] = useState("CASH");
  const [opBillingSponsor, setOpBillingSponsor] = useState("CASH");
  const [opBillingNetwork, setOpBillingNetwork] = useState("");
  const [opBillingPrescribingDoctor, setOpBillingPrescribingDoctor] =
    useState("Dr. D K DAS");
  const [opBillingDoctor, setOpBillingDoctor] = useState("Dr. D K DAS");
  const [opBillingReferredType, setOpBillingReferredType] = useState("SELF");
  const [opBillingReferredName, setOpBillingReferredName] = useState("");
  const [opBillingSubTab, setOpBillingSubTab] = useState("Service");
  const [opBillingNarration, setOpBillingNarration] = useState("");
  const [opBillingCoPayBy, setOpBillingCoPayBy] = useState("Patient");
  const [opBillingReportingDateTime, setOpBillingReportingDateTime] = useState(
    () => new Date().toISOString().slice(0, 16),
  );
  const [opBillingPanNo, setOpBillingPanNo] = useState("");
  const [opBillingApprovalRequired, setOpBillingApprovalRequired] =
    useState(false);
  const [opBillingExcludedService, setOpBillingExcludedService] =
    useState(false);
  const [opBillingRefundedService, setOpBillingRefundedService] =
    useState(false);
  const [opBillingEmailResult, setOpBillingEmailResult] = useState(false);
  const [opBillingAvailableDeposit, setOpBillingAvailableDeposit] =
    useState<number>(0);
  const [opBillingAppliedDeposit, setOpBillingAppliedDeposit] =
    useState<number>(0);
  const [opBillingItems, setOpBillingItems] = useState<InvoiceItem[]>([
    DEFAULT_OPD_ITEM,
  ]);
  const [opBillingPaymentRows, setOpBillingPaymentRows] = useState<
    Array<{
      mode: string;
      amount: number;
      balance: number;
      date: string;
      bankName: string;
      beneficiaryName: string;
      refNo: string;
      description: string;
      cardSwipingValue: number;
    }>
  >([
    {
      mode: "Cash",
      amount: 0,
      balance: 0,
      date: new Date().toLocaleDateString("en-GB"),
      bankName: "",
      beneficiaryName: "",
      refNo: "",
      description: "",
      cardSwipingValue: 0,
    },
  ]);

  // ─── OP Order Form State ─────────────────────────────────────────────────────
  const [orderUhid, setOrderUhid] = useState("");
  const [orderDoctor, setOrderDoctor] = useState("Dr. Sameer Sen 3105");
  const [orderType, setOrderType] = useState("Lab");
  const [orderRemarks, setOrderRemarks] = useState("");
  const [orderItems, setOrderItems] = useState<InvoiceItem[]>([
    {
      code: "LAB-01",
      name: "Complete Blood Count (CBC)",
      dept: "Pathology",
      doctor: "Dr. Sameer Sen",
      rate: 350,
      qty: 1,
      discountPercent: 0,
      discountAmt: 0,
      netAmt: 350,
    },
  ]);

  // ─── IP Billing / Surgery Bill State (16 Standard Excel Heads) ─────────────
  const [ipBillingUhid, setIpBillingUhid] = useState("");
  const [ipPatientNameInput, setIpPatientNameInput] = useState("");
  const [ipAgeSexInput, setIpAgeSexInput] = useState("61/FEMALE");
  const [ipAddressInput, setIpAddressInput] = useState("");
  const [ipCrNoInput, setIpCrNoInput] = useState("");
  const [ipAdmissionDateInput, setIpAdmissionDateInput] = useState("13/04/2026");
  const [ipDischargeDateInput, setIpDischargeDateInput] = useState("18/04/2026");
  const [ipDischargeTimeInput, setIpDischargeTimeInput] = useState("03:00 PM");
  const [ipRoomNoInput, setIpRoomNoInput] = useState("311");
  const [ipConsultantDrInput, setIpConsultantDrInput] = useState("Dr. D K DAS");
  const [ipBillingPayer, setIpBillingPayer] = useState("CASH");
  const [ipDiscountAmtInput, setIpDiscountAmtInput] = useState<number | "">("");
  const [ipRemarks, setIpRemarks] = useState("");
  const [ipStatus, setIpStatus] = useState("Bill Prepared");

  const [ipSurgeryItems, setIpSurgeryItems] = useState<
    Array<{ sNo: number; name: string; qty?: string; desc?: string; qtyDesc: string; amount: number | "" }>
  >([
    { sNo: 1, name: "Registration Fee", qty: "1", desc: "", qtyDesc: "", amount: "" },
    { sNo: 2, name: "Room / Bed Charges (Per Day)", qty: "", desc: "", qtyDesc: "", amount: "" },
    { sNo: 3, name: "Hospital Consumables Charges", qty: "", desc: "", qtyDesc: "", amount: "" },
    { sNo: 4, name: "OT/Ward Consumable Charges", qty: "", desc: "", qtyDesc: "", amount: "" },
    { sNo: 5, name: "Pathology Investigation", qty: "", desc: "", qtyDesc: "", amount: "" },
    { sNo: 6, name: "Radiology Investigation", qty: "", desc: "", qtyDesc: "", amount: "" },
    { sNo: 7, name: "Cardiology Investigation", qty: "", desc: "", qtyDesc: "", amount: "" },
    { sNo: 8, name: "OT Charges", qty: "", desc: "", qtyDesc: "", amount: "" },
    { sNo: 9, name: "ICU Charges", qty: "", desc: "", qtyDesc: "", amount: "" },
    { sNo: 10, name: "Implant / Instrument Charges", qty: "", desc: "", qtyDesc: "", amount: "" },
    { sNo: 11, name: "Surgeon's Fee", qty: "", desc: "", qtyDesc: "", amount: "" },
    { sNo: 12, name: "Assistant Surgeon's Fee", qty: "", desc: "", qtyDesc: "", amount: "" },
    { sNo: 13, name: "Anesthetist Charges", qty: "", desc: "", qtyDesc: "", amount: "" },
    { sNo: 14, name: "Physiotherapy Charges", qty: "", desc: "", qtyDesc: "", amount: "" },
    { sNo: 15, name: "Consultation Fee Different Speciality", qty: "", desc: "", qtyDesc: "", amount: "" },
    { sNo: 16, name: "Miscellaneous /Other Charges", qty: "", desc: "", qtyDesc: "", amount: "" },
  ]);

  // ─── Patient Notes Modal States ──────────────────────────────────────────────
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [newNoteCategory, setNewNoteCategory] = useState<
    "General Note" | "Billing Flag" | "Clinical Alert" | "Special Instruction"
  >("Billing Flag");
  const [newNoteText, setNewNoteText] = useState("");
  const [patientNotesMap, setPatientNotesMap] = useState<
    Record<
      string,
      Array<{
        id: string;
        category: string;
        text: string;
        author: string;
        createdAt: string;
      }>
    >
  >({
    "UHID-2026-00005-7210": [
      {
        id: "1",
        category: "Billing Flag",
        text: "Insurance Pre-authorization approved for Niva Bupa Health Insurance.",
        author: "Dr. Admin",
        createdAt: "25/08/2026, 12:30",
      },
      {
        id: "2",
        category: "Clinical Alert",
        text: "Patient has history of hypertension. Monitor BP before procedures.",
        author: "Dr. Sameer Sen",
        createdAt: "25/08/2026, 11:15",
      },
    ],
    "UHID-2026-00001-2863": [
      {
        id: "101",
        category: "Billing Flag",
        text: "Deluxe ward bed rate approved @ ₹4,500/day. Advance deposit of ₹5,000 adjusted.",
        author: "Dr. Admin",
        createdAt: "25/08/2026, 13:10",
      },
      {
        id: "102",
        category: "Special Instruction",
        text: "Final IP settlement requires pharmacy clearance before discharge.",
        author: "Dr. Sameer Sen",
        createdAt: "25/08/2026, 09:30",
      },
    ],
  });

  const activePatientNotesUhid = (
    activeTab === "IP Billing" ? ipBillingUhid : opBillingUhid
  ).trim();

  const handleAddNote = () => {
    if (!activePatientNotesUhid) {
      toast.error(
        "No Patient Selected",
        "Please select a patient or IP No first.",
      );
      return;
    }
    if (!newNoteText.trim()) {
      toast.error("Empty Note", "Please type a note description.");
      return;
    }
    const currentUhid = activePatientNotesUhid;
    const existing = patientNotesMap[currentUhid] || [];
    const newEntry = {
      id: Date.now().toString(),
      category: newNoteCategory,
      text: newNoteText.trim(),
      author: "Dr. Admin",
      createdAt: new Date().toLocaleString("en-GB", {
        dateStyle: "short",
        timeStyle: "short",
      }),
    };
    setPatientNotesMap({
      ...patientNotesMap,
      [currentUhid]: [newEntry, ...existing],
    });
    setNewNoteText("");
    toast.success("Note Added", "Patient note created successfully.");
  };

  const handleRemoveNote = (uhid: string, noteId: string) => {
    const existing = patientNotesMap[uhid] || [];
    setPatientNotesMap({
      ...patientNotesMap,
      [uhid]: existing.filter((n) => n.id !== noteId),
    });
    toast.info("Note Removed", "Patient note deleted.");
  };

  // IP Billing Checklist States
  const [ipChecklistDoctor, setIpChecklistDoctor] = useState(true);
  const [ipChecklistPharmacy, setIpChecklistPharmacy] = useState(true);
  const [ipChecklistNursing, setIpChecklistNursing] = useState(true);
  const [ipChecklistAuditor, setIpChecklistAuditor] = useState(false);

  // ─── Audit Bill Modal State ────────────────────────────────────────────────
  const [isAuditBillModalOpen, setIsAuditBillModalOpen] = useState(false);
  const [auditBillRemarks, setAuditBillRemarks] = useState("");

  // ─── IP Discharge Modal State ──────────────────────────────────────────────
  const [isIpDischargeModalOpen, setIsIpDischargeModalOpen] = useState(false);
  const [ipDischargeMode, setIpDischargeMode] = useState<
    "pay_now" | "tpa_credit" | "credit_approval" | "refund"
  >("pay_now");
  const [ipDischargeSplitRows, setIpDischargeSplitRows] = useState<
    Array<{ mode: string; amount: number; refNo: string }>
  >([{ mode: "Cash", amount: 0, refNo: "" }]);
  const [ipDischargeRefNo, setIpDischargeRefNo] = useState("");
  const [ipDischargeNotes, setIpDischargeNotes] = useState("");

  // ─── Advance Collection Form State ───────────────────────────────────────────
  const [advUhid, setAdvUhid] = useState("");
  const [advAmount, setAdvAmount] = useState<number>(5000);
  const [advMode, setAdvMode] = useState("Cash");
  const [advBank, setAdvBank] = useState("");
  const [advRefNo, setAdvRefNo] = useState("");
  const [advPurpose, setAdvPurpose] = useState("Admission Deposit");

  // ─── Credit Note Form State ──────────────────────────────────────────────────
  const [cnInvoiceNo, setCnInvoiceNo] = useState("");
  const [cnUhid, setCnUhid] = useState("");
  const [cnAmount, setCnAmount] = useState<number>(500);
  const [cnReason, setCnReason] = useState("Chairman Courtesy Waiver");

  // ─── Refund Form State ───────────────────────────────────────────────────────
  const [refUhid, setRefUhid] = useState("");
  const [refInvoiceNo, setRefInvoiceNo] = useState("");
  const [refAmount, setRefAmount] = useState<number>(500);
  const [refMode, setRefMode] = useState("Cash");
  const [refReason, setRefReason] = useState("Excess Payment Return");

  // ─── Insurance Intimation Form State ─────────────────────────────────────────
  const [intUhid, setIntUhid] = useState("");
  const [intTpa, setIntTpa] = useState("Star Health & Allied Insurance");
  const [intPolicyNo, setIntPolicyNo] = useState("STAR-IND-2026-9901");
  const [intClaimNo, setIntClaimNo] = useState("CLM-ST-88741");
  const [intReqAmt, setIntReqAmt] = useState<number>(25000);
  const [intApprAmt, setIntApprAmt] = useState<number>(20000);
  const [intCoPay, setIntCoPay] = useState<number>(2500);

  // ─── Unbilled Orders Selection State ─────────────────────────────────────────
  const [selectedUnbilledOrders, setSelectedUnbilledOrders] = useState<
    string[]
  >([]);

  const [receiptsList, setReceiptsList] = useState<any[]>([]);

  // ─── DOCTORS FROM SETTINGS ──────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const loadDoctors = async () => {
      const docs = await fetchDoctorsFromSettings();
      if (isMounted && docs && docs.length > 0) {
        setAvailableDoctors(docs);
      }
    };
    loadDoctors();

    const handleSettingsUpdate = (e: Event) => {
      const customEvt = e as CustomEvent;
      if (
        !customEvt.detail?.category ||
        customEvt.detail.category === "doctors" ||
        customEvt.detail.category === "providers"
      ) {
        loadDoctors();
      }
    };

    window.addEventListener("cmk_settings_updated", handleSettingsUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("cmk_settings_updated", handleSettingsUpdate);
    };
  }, []);

  // ─── DATA FETCHING (FULL API-LEVEL FILTERING) ───────────────────────────────
  const loadAllBillingData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        statsRes,
        invRes,
        recRes,
        visRes,
        ordRes,
        advRes,
        crRes,
        refRes,
        intRes,
        patRes,
      ] = await Promise.allSettled([
        getBillingStats(),
        getInvoices({
          uhid: malUhid,
          billNo: malBillNo,
          type: malPatientType,
          facility: malFacility,
          payerType: malPayerType,
          payer: malPayer,
          sponsor: malSponsor,
          patientRefundable: malPatientRefundableOnly,
          searchFor: malSearchFor,
          fromDate: malFromDate,
          toDate: malToDate,
          colFilterCompany,
          colFilterUhid,
          colFilterPatient,
          colFilterEnc,
          colFilterInvoiceNo,
          search: invoiceSearch,
          limit: 150,
        }),
        getReceipts({
          uhid: malUhid || colFilterUhid,
          patientName: colFilterPatient,
          invoiceNo: malBillNo || colFilterInvoiceNo,
          fromDate: malFromDate,
          toDate: malToDate,
          limit: 150,
        }),
        getOpVisits({
          uhid: opUhid,
          payerType: opPayerType,
          payer: opPayer,
          sponsor: opSponsor,
        }),
        getBillingOrders({
          status: "all",
          orderType: "all",
        }),
        getAdvances({
          status: "all",
        }),
        getCreditNotes({
          uhid: cnUhid,
          invoiceNo: cnInvoiceNo,
        }),
        getRefunds({
          uhid: refUhid,
          invoiceNo: refInvoiceNo,
        }),
        getIntimations({
          uhid: intUhid,
        }),
        getBillingPatients({
          search: patientSearch,
          searchOn: patientSearchOn,
          type: patientTypeFilter,
          status: patientStatusFilter,
          limit: 150,
        }),
      ]);

      if (statsRes.status === "fulfilled") setStats(statsRes.value);
      if (invRes.status === "fulfilled")
        setInvoices(invRes.value.invoices || []);
      if (recRes.status === "fulfilled")
        setReceiptsList(recRes.value.receipts || []);
      if (visRes.status === "fulfilled") setVisits(visRes.value || []);
      if (ordRes.status === "fulfilled") setOrders(ordRes.value || []);
      if (advRes.status === "fulfilled") setAdvances(advRes.value || []);
      if (crRes.status === "fulfilled")
        setCreditNotes(crRes.value?.creditNotes || []);
      if (refRes.status === "fulfilled") setRefunds(refRes.value || []);
      if (intRes.status === "fulfilled") setIntimations(intRes.value || []);

      if (patRes.status === "fulfilled" && patRes.value) {
        const patList = Array.isArray(patRes.value)
          ? patRes.value
          : patRes.value.patients || [];
        if (patList.length > 0) {
          setPatients(patList);
        } else if (
          patList.length === 0 &&
          (patientSearch ||
            patientTypeFilter !== "Admission" ||
            patientStatusFilter !== "all")
        ) {
          setPatients([]);
        } else {
          setPatients(INITIAL_PATIENTS);
        }
      }
    } catch (err) {
      console.error("Failed to load billing data from API:", err);
    } finally {
      setIsLoading(false);
    }
  }, [
    malUhid,
    malBillNo,
    malPatientType,
    malFacility,
    malPayerType,
    malPayer,
    malSponsor,
    malPatientRefundableOnly,
    malSearchFor,
    malFromDate,
    malToDate,
    colFilterCompany,
    colFilterUhid,
    colFilterPatient,
    colFilterEnc,
    colFilterInvoiceNo,
    invoiceSearch,
    opUhid,
    opPayerType,
    opPayer,
    opSponsor,
    advUhid,
    cnUhid,
    cnInvoiceNo,
    refUhid,
    refInvoiceNo,
    intUhid,
    patientSearch,
    patientSearchOn,
    patientTypeFilter,
    patientStatusFilter,
  ]);

  useEffect(() => {
    loadAllBillingData();
  }, [loadAllBillingData]);

  const fetchAdvancedPatients = useCallback(
    async (pageNum: number = 1) => {
      setAdvIsLoading(true);
      setAdvPage(pageNum);
      try {
        const queryParams: any = {
          page: pageNum,
          limit: 10,
          uhid: advSearchFields.uhid || undefined,
          ipNo: advSearchFields.ipNo || undefined,
          fullName: advSearchFields.patientName || undefined,
          dateOfBirth: advSearchFields.dob || undefined,
          mobile: advSearchFields.mobileNo || undefined,
          email: advSearchFields.email || undefined,
          address: advSearchFields.address || undefined,
          payer: advSearchFields.company || undefined,
          guardianName: advSearchFields.fatherName || undefined,
        };

        if (
          advSearchFields.typeFilter &&
          advSearchFields.typeFilter !== "all"
        ) {
          queryParams.type = advSearchFields.typeFilter;
        }

        const res = await getBillingPatients(queryParams);
        setAdvPatients(res.patients || []);
        setAdvTotalCount(res.totalCount || 0);
      } catch (err: any) {
        console.error("Error fetching advanced patients:", err);
        toast.error("Error", "Failed to fetch patients.");
      } finally {
        setAdvIsLoading(false);
      }
    },
    [advSearchFields],
  );

  useEffect(() => {
    if (isPatientSearchModalOpen) {
      if (activeTab === "IP Billing") {
        setAdvSearchFields((prev) => ({ ...prev, typeFilter: "Admission" }));
      } else if (activeTab === "OP Billing") {
        setAdvSearchFields((prev) => ({ ...prev, typeFilter: "all" }));
      }
      fetchAdvancedPatients(1);
    }
  }, [isPatientSearchModalOpen, activeTab]);

  const displayAdvPatients = useMemo(() => {
    if (
      activeTab === "IP Billing" ||
      advSearchFields.typeFilter === "Admission" ||
      advSearchFields.typeFilter === "Discharge"
    ) {
      return advPatients.filter((p: any) => {
        // Exclude pure OP-only patients when searching for Inpatients in IP Billing
        const isPureOp =
          p.uhid === "UHID-2026-00005-7210" ||
          p.uhid === "UHID-2026-00004-5812" ||
          p.uhid === "UHID-2026-00003-4921" ||
          p.uhid === "UHID-2026-00002-3183" ||
          (p.registrationType === "OP" && !p.ipNo && !p.bedNo);
        if (
          isPureOp &&
          p.uhid !== "UHID-2026-00001-2863" &&
          p.uhid !== "UHID-2026-00006-1889"
        ) {
          return false;
        }
        return true;
      });
    }
    return advPatients;
  }, [advPatients, activeTab, advSearchFields.typeFilter]);

  // ─── PATIENT LOOKUPS ────────────────────────────────────────────────────────
  // ─── PATIENT & INVOICE LOOKUPS ──────────────────────────────────────────────
  const findPatientByUhid = (uhid: string) => {
    if (!uhid || !uhid.trim()) return null;
    const key = uhid.trim().toLowerCase();
    const foundInPatients =
      patients.find((p) => p.uhid.trim().toLowerCase() === key) ||
      advPatients.find((p) => p.uhid.trim().toLowerCase() === key) ||
      INITIAL_PATIENTS.find((p) => p.uhid.trim().toLowerCase() === key);
    if (foundInPatients) return foundInPatients;

    const foundInInvoice = invoices.find(
      (i) => i.uhid.trim().toLowerCase() === key,
    );
    if (foundInInvoice) {
      return {
        uhid: foundInInvoice.uhid,
        patientName: foundInInvoice.patientName,
        company: foundInInvoice.company,
        doctor: foundInInvoice.doctorName || "Dr. Admin",
        genderAge: "Male/30 Yr",
        mobileNo: "",
        type: "Admission" as const,
        ipNo: foundInInvoice.encNo || "",
        admissionDate: foundInInvoice.date || "",
        bedNo: "",
        billingCategory: foundInInvoice.type || "",
      };
    }
    return null;
  };

  const findInvoiceByNo = (invoiceNo: string) => {
    if (!invoiceNo || !invoiceNo.trim()) return null;
    const key = invoiceNo.trim().toLowerCase();
    return (
      invoices.find((i) => i.invoiceNo.trim().toLowerCase() === key) ||
      invoices.find((i) => i.invoiceNo.trim().toLowerCase().includes(key))
    );
  };

  // ─── REFUND & CREDIT NOTE LIVE AVAILABILITY CHECKS ──────────────────────────
  const refPatientMatch = useMemo(() => {
    const trimmed = refUhid.trim();
    if (!trimmed) return { status: "idle" as const, patient: null };
    const patient = findPatientByUhid(trimmed);
    if (patient) return { status: "found" as const, patient };
    return { status: "not_found" as const, patient: null };
  }, [refUhid, patients, advPatients, invoices]);

  const refInvoiceMatch = useMemo(() => {
    const trimmed = refInvoiceNo.trim();
    if (!trimmed)
      return { status: "idle" as const, invoice: null, uhidMatch: true };
    const invoice = findInvoiceByNo(trimmed);
    if (invoice) {
      const uhidMatch =
        !refUhid.trim() ||
        invoice.uhid.trim().toLowerCase() === refUhid.trim().toLowerCase();
      return { status: "found" as const, invoice, uhidMatch };
    }
    return { status: "not_found" as const, invoice: null, uhidMatch: false };
  }, [refInvoiceNo, refUhid, invoices]);

  const handleSelectRefundInvoice = (invNo: string) => {
    setRefInvoiceNo(invNo);
    const inv = findInvoiceByNo(invNo);
    if (inv) {
      if (
        !refUhid ||
        refUhid.trim().toLowerCase() !== inv.uhid.trim().toLowerCase()
      ) {
        setRefUhid(inv.uhid);
      }
      if (inv.netAmt > 0) {
        setRefAmount(inv.refund > 0 ? inv.refund : inv.netAmt);
      }
    }
  };

  const cnInvoiceMatch = useMemo(() => {
    const trimmed = cnInvoiceNo.trim();
    if (!trimmed)
      return { status: "idle" as const, invoice: null, uhidMatch: true };
    const invoice = findInvoiceByNo(trimmed);
    if (invoice) {
      const uhidMatch =
        !cnUhid.trim() ||
        invoice.uhid.trim().toLowerCase() === cnUhid.trim().toLowerCase();
      return { status: "found" as const, invoice, uhidMatch };
    }
    return { status: "not_found" as const, invoice: null, uhidMatch: false };
  }, [cnInvoiceNo, cnUhid, invoices]);

  const cnPatientMatch = useMemo(() => {
    const trimmed = cnUhid.trim();
    if (!trimmed) return { status: "idle" as const, patient: null };
    const patient = findPatientByUhid(trimmed);
    if (patient) return { status: "found" as const, patient };
    return { status: "not_found" as const, patient: null };
  }, [cnUhid, patients, advPatients, invoices]);

  const advPatientMatch = useMemo(() => {
    const trimmed = advUhid.trim();
    if (!trimmed) return { status: "idle" as const, patient: null };
    const patient = findPatientByUhid(trimmed);
    if (patient) return { status: "found" as const, patient };
    return { status: "not_found" as const, patient: null };
  }, [advUhid, patients, advPatients, invoices]);

  const intPatientMatch = useMemo(() => {
    const trimmed = intUhid.trim();
    if (!trimmed) return { status: "idle" as const, patient: null };
    const patient = findPatientByUhid(trimmed);
    if (patient) return { status: "found" as const, patient };
    return { status: "not_found" as const, patient: null };
  }, [intUhid, patients, advPatients, invoices]);

  const handleSelectCreditNoteInvoice = (invNo: string) => {
    setCnInvoiceNo(invNo);
    const inv = findInvoiceByNo(invNo);
    if (inv) {
      if (
        !cnUhid ||
        cnUhid.trim().toLowerCase() !== inv.uhid.trim().toLowerCase()
      ) {
        setCnUhid(inv.uhid);
      }
      if (inv.netAmt > 0) {
        setCnAmount(inv.balance > 0 ? inv.balance : inv.netAmt);
      }
    }
  };

  const opBillingPatientInfo = useMemo(() => {
    if (!opBillingUhid.trim()) return null;
    const found = findPatientByUhid(opBillingUhid);
    if (found) {
      return {
        name: found.patientName,
        genderAge: found.genderAge,
        address: found.address || "NEW DELHI, INDIA",
        doctor: found.doctor,
        payerType: "Direct Patient",
        payer: "CASH",
        sponsor: "CASH",
        image: found.photoUrl || found.image || null,
        network: "Select",
        mobile: found.mobileNo,
      };
    }
    return {
      name: `Patient (${opBillingUhid})`,
      genderAge: "Male/45 Yr",
      address: "DELHI, INDIA",
      doctor: "Dr. Sameer Sen 3105",
      payerType: "Direct Patient",
      payer: "CASH",
      sponsor: "CASH",
      network: "Select",
      mobile: "9876543210",
    };
  }, [opBillingUhid, patients]);

  const ipBillingPatientInfo = useMemo(() => {
    if (!ipBillingUhid.trim()) return null;
    const found = findPatientByUhid(ipBillingUhid);
    if (found) {
      return {
        name: found.patientName,
        genderAge: found.genderAge,
        address: found.address || "DELHI NCR",
        doctor: found.doctor,
        payer: found.company || "CASH",
        sponsor: found.company || "CASH",
        network: "TPA Network",
        category: found.billingCategory,
        pan: "ABCDE1234F",
        image: found.photoUrl || found.image || null,
        admissionDate: found.admissionDate,
      };
    }
    return null;
  }, [ipBillingUhid, patients]);

  const opVisitPatientInfo = useMemo(() => {
    if (!opUhid.trim()) return null;
    const found = findPatientByUhid(opUhid);
    if (found) {
      return {
        name: found.patientName,
        genderAge: found.genderAge,
        address: found.address || "DELHI, INDIA",
        doctor: found.doctor || "Dr. Abhishek Bansal 2273",
        payerType:
          found.company.includes("Insurance") || found.company.includes("Star")
            ? "Insurance"
            : "Direct Patient",
        payer: found.company || "CASH",
        sponsor: found.company || "CASH",
        network: "Select",
        mobile: found.mobileNo,
        image: found.photoUrl || found.image || null,
      };
    }
    return null;
  }, [opUhid, patients]);

  useEffect(() => {
    if (opVisitPatientInfo) {
      setOpPatientName(opVisitPatientInfo.name);
      setOpPayerType(opVisitPatientInfo.payerType);
      setOpPayer(opVisitPatientInfo.payer);
      setOpSponsor(opVisitPatientInfo.sponsor);
      setOpDoctor(opVisitPatientInfo.doctor);
    }
  }, [opVisitPatientInfo]);

  useEffect(() => {
    if (opBillingPatientInfo) {
      setOpBillingPayerType(opBillingPatientInfo.payerType);
      setOpBillingPayer(opBillingPatientInfo.payer);
      setOpBillingSponsor(opBillingPatientInfo.sponsor);
      setOpBillingDoctor(opBillingPatientInfo.doctor || "Dr. Sameer Sen 3105");
      if (opBillingPatientInfo.doctor) {
        const parts = opBillingPatientInfo.doctor.split(" ");
        if (parts.length > 1 && !isNaN(Number(parts[parts.length - 1]))) {
          setOpBillingPrescribingDoctor(parts.slice(0, -1).join(" "));
        } else {
          setOpBillingPrescribingDoctor(opBillingPatientInfo.doctor);
        }
      }
    }
  }, [opBillingPatientInfo]);

  const opBillingVisitOptions = useMemo(() => {
    if (!opBillingUhid.trim()) return ["1", "2", "3", "4", "5"];
    const patientVisits = visits.filter(
      (v) => v.uhid.toLowerCase() === opBillingUhid.trim().toLowerCase()
    );
    const visitNos = patientVisits.map((v) => v.visitNo).filter(Boolean);
    const defaults = ["1", "2", "3", "4", "5"];
    return Array.from(new Set([...visitNos, ...defaults]));
  }, [opBillingUhid, visits]);

  useEffect(() => {
    if (!opBillingUhid.trim()) return;
    const patientVisits = visits.filter(
      (v) => v.uhid.toLowerCase() === opBillingUhid.trim().toLowerCase()
    );
    if (patientVisits.length > 0) {
      const latest = patientVisits[patientVisits.length - 1];
      if (latest?.visitNo) {
        setOpBillingVisitNo(latest.visitNo);
      }
    }
  }, [opBillingUhid, visits]);

  useEffect(() => {
    if (ipBillingPatientInfo) {
      setIpPatientNameInput(ipBillingPatientInfo.name || "");
      if (ipBillingPatientInfo.payer) setIpBillingPayer(ipBillingPatientInfo.payer);
      if (ipBillingPatientInfo.doctor) setIpConsultantDrInput(ipBillingPatientInfo.doctor);
    }
  }, [ipBillingPatientInfo]);

  // Calculate OP Billing Totals
  const opGrossTotal = useMemo(() => {
    return opBillingItems.reduce(
      (sum, it) => sum + Number(it.rate || 0) * Number(it.qty || 1),
      0,
    );
  }, [opBillingItems]);

  const opDiscountTotal = useMemo(() => {
    return opBillingItems.reduce(
      (sum, it) => sum + Number(it.discountAmt || 0),
      0,
    );
  }, [opBillingItems]);

  const opNetPayable = useMemo(() => {
    return Math.max(0, opGrossTotal - opDiscountTotal);
  }, [opGrossTotal, opDiscountTotal]);

  const opTotalPaid = useMemo(() => {
    return opBillingPaymentRows.reduce(
      (sum, r) => sum + Number(r.amount || 0),
      0,
    );
  }, [opBillingPaymentRows]);

  const opBalance = useMemo(() => {
    return Math.max(0, opNetPayable - opTotalPaid);
  }, [opNetPayable, opTotalPaid]);

  // Calculate IP Billing Totals
  const ipGrossTotal = useMemo(() => {
    return ipSurgeryItems.reduce(
      (sum, it) => sum + (Number(it.amount) || 0),
      0,
    );
  }, [ipSurgeryItems]);

  const ipDiscountAmt = useMemo(() => {
    return Number(ipDiscountAmtInput || 0);
  }, [ipDiscountAmtInput]);

  const ipNetPayable = useMemo(() => {
    return Math.max(0, ipGrossTotal - ipDiscountAmt);
  }, [ipGrossTotal, ipDiscountAmt]);

  // ─── ACTION HANDLERS ────────────────────────────────────────────────────────

  // 1. Create OP Visit
  const handleSaveOpVisit = async () => {
    if (!opUhid.trim()) {
      toast.error("Required Field", "Please enter a valid Patient UHID.");
      return;
    }
    try {
      const patient = findPatientByUhid(opUhid);
      const visit = await createOpVisit({
        uhid: opUhid.trim(),
        patientName:
          opPatientName || patient?.patientName || `Patient ${opUhid}`,
        doctorName: opDoctor,
        department: opDepartment,
        payerType: opPayerType,
        payer: opPayer,
        sponsor: opSponsor,
        network: opNetwork,
        consultationFee: opFee,
        visitType: opVisitType,
        status: opStatus,
      });

      toast.success(
        "OP Visit Created",
        `Generated Visit ${visit.visitNo} for UHID ${opUhid}.`,
      );
      loadAllBillingData();
      setOpBillingUhid(opUhid);
      setActiveTab("OP Billing");
    } catch (err: any) {
      toast.error(
        "Visit Creation Failed",
        err.message || "Something went wrong.",
      );
    }
  };

  // 2. Add / Remove OP Billing Item
  const handleAddOpItem = (itemTemplate?: (typeof SERVICE_CATALOG)[0]) => {
    const item = itemTemplate || SERVICE_CATALOG[0];
    setOpBillingItems([
      ...opBillingItems,
      {
        code: item.code,
        name: item.name,
        dept: item.dept,
        doctor: opBillingDoctor,
        rate: item.rate,
        qty: 1,
        discountPercent: 0,
        discountAmt: 0,
        taxPercent: 0,
        netAmt: item.rate,
      },
    ]);
  };

  const handleRemoveOpItem = (index: number) => {
    if (opBillingItems.length === 1) return;
    setOpBillingItems(opBillingItems.filter((_, idx) => idx !== index));
  };

  const handleUpdateOpItem = (
    index: number,
    field: keyof InvoiceItem,
    val: any,
  ) => {
    const updated = [...opBillingItems];
    const current = { ...updated[index], [field]: val };

    if (field === "rate" || field === "qty" || field === "discountPercent") {
      const rate = Number(field === "rate" ? val : current.rate);
      const qty = Number(field === "qty" ? val : current.qty);
      const discPct = Number(
        field === "discountPercent" ? val : current.discountPercent || 0,
      );
      const gross = rate * qty;
      const discAmt = (gross * discPct) / 100;
      current.discountAmt = discAmt;
      current.netAmt = Math.max(0, gross - discAmt);
    }
    updated[index] = current;
    setOpBillingItems(updated);
  };

  // 3. Save OP Billing Invoice
  const handleSaveOpBilling = async (printImmediately = false) => {
    if (!opBillingUhid.trim()) {
      toast.error(
        "Required Field",
        "Please enter or select a valid Patient UHID.",
      );
      return;
    }

    try {
      const patient = findPatientByUhid(opBillingUhid);
      const invoice = await createInvoice({
        uhid: opBillingUhid.trim(),
        patientName:
          opBillingPatientInfo?.name ||
          patient?.patientName ||
          `Patient ${opBillingUhid}`,
        encNo: opBillingVisitNo || "1",
        type: "OP",
        company: opBillingPayer || "CASH / CASH",
        doctorName: consultationProvider || opBillingPrescribingDoctor || opBillingDoctor || "Dr. D K DAS",
        department: "OPD",
        grossAmt: opGrossTotal,
        discountAmt: opDiscountTotal,
        taxAmt: 0,
        netAmt: opNetPayable,
        items: opBillingItems,
        payments: opBillingPaymentRows
          .filter((p) => Number(p.amount) > 0)
          .map((p) => ({
            mode: p.mode,
            amount: Number(p.amount),
            bankName: p.bankName === "-Select-" ? undefined : p.bankName,
            beneficiaryName:
              p.beneficiaryName === "-Select-" ? undefined : p.beneficiaryName,
            refNo: p.refNo,
            cardSwipingValue: p.cardSwipingValue,
            description: p.description,
          })),
        remarks: opBillingNarration || "OPD Services Billed",
      });

      toast.success(
        "OP Invoice Generated",
        `Invoice ${invoice.invoiceNo} created successfully! Net: ₹${invoice.netAmt}`,
      );
      loadAllBillingData();

      if (printImmediately) {
        setPrintInvoiceData(invoice);
      } else {
        setActiveTab("Master Activity List");
      }
    } catch (err: any) {
      toast.error(
        "Invoice Generation Failed",
        err.message || "Failed to generate invoice.",
      );
    }
  };

  // 4. Save IP Billing Invoice (16 Standard Excel Sheet Items)
  const handleSaveIpBilling = async (printImmediately = false) => {
    const pName = ipPatientNameInput || ipBillingPatientInfo?.name || "Patient";
    const uhid = ipBillingUhid.trim() || ipCrNoInput || "IP-101";

    const subTotal = ipSurgeryItems.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );
    const discVal = Number(ipDiscountAmtInput || 0);
    const netTotal = Math.max(0, subTotal - discVal);

    try {
      const invoice = await createInvoice({
        uhid: uhid,
        patientName: pName,
        encNo: ipCrNoInput || "1",
        type: "IP",
        company: ipBillingPayer || "CASH",
        doctorName: ipConsultantDrInput || "Dr. D K DAS",
        department: "Inpatient Ward / Surgery",
        grossAmt: subTotal,
        discountAmt: discVal,
        taxAmt: 0,
        netAmt: netTotal,
        items: ipSurgeryItems.map((it) => ({
          sNo: it.sNo,
          code: `IP-${it.sNo}`,
          name: it.name,
          qtyDesc: it.qtyDesc,
          rate: Number(it.amount) || 0,
          qty: 1,
          netAmt: Number(it.amount) || 0,
          amount: Number(it.amount) || 0,
        })),
        payments: [
          {
            mode: "Cash",
            amount: netTotal,
            description: "IP Bill Settlement",
          },
        ],
        remarks: ipRemarks || "Bill For Surgery",
      });

      const printData: BillingInvoicePrintData = {
        invoiceNo: invoice.invoiceNo,
        date: new Date().toISOString(),
        type: "IP",
        uhid: uhid,
        patientName: pName,
        genderAge: ipAgeSexInput || "61/FEMALE",
        address: ipAddressInput || "-",
        company: ipBillingPayer || "CASH",
        doctorName: ipConsultantDrInput || "Dr. D K DAS",
        grossAmt: subTotal,
        discountAmt: discVal,
        netAmt: netTotal,
        balance: 0,
        itemsJson: JSON.stringify(ipSurgeryItems),
        narration: ipRemarks,
        admissionDate: ipAdmissionDateInput,
        dischargeDate: ipDischargeDateInput,
        dischargeTime: ipDischargeTimeInput,
        roomNo: ipRoomNoInput,
        crNo: ipCrNoInput || uhid,
      };

      toast.success(
        "IP Bill Saved",
        `Bill ${invoice.invoiceNo} successfully generated!`,
      );
      loadAllBillingData();

      if (printImmediately) {
        setPrintInvoiceData(printData as any);
      } else {
        setActiveTab("Master Activity List");
      }
    } catch (err: any) {
      toast.error(
        "IP Billing Failed",
        err.message || "Failed to generate IP invoice.",
      );
    }
  };

  // 5. Settlement / Receipt Modal handler
  const handleOpenSettlement = (inv: InvoiceData) => {
    setSelectedInvoice(inv);
    const amount = Math.abs(inv.balance);
    setSettlementNotes("");
    setPaymentRows([
      {
        mode: "Cash",
        amount,
        balance: 0,
        date: new Date().toLocaleDateString("en-GB"),
        bankName: "",
        beneficiaryName: "",
        refNo: "",
        description: "",
        cardSwipingValue: 0,
      },
    ]);
    setIsSettleModalOpen(true);
  };

  const handleSaveSettlement = async () => {
    if (!selectedInvoice) return;
    const totalPaid = paymentRows.reduce(
      (sum, r) => sum + Number(r.amount || 0),
      0,
    );
    if (totalPaid <= 0) {
      toast.error(
        "Invalid Amount",
        "Please specify a payment amount greater than 0.",
      );
      return;
    }

    const isRefund =
      selectedInvoice.status === "Refundable" || selectedInvoice.balance < 0;
    if (isRefund && !settlementNotes.trim()) {
      toast.error("Required Field", "Please fill in remarks for this refund.");
      return;
    }

    try {
      await settleInvoice({
        invoiceId: selectedInvoice.id,
        payments: paymentRows.map((r) => ({
          mode: r.mode,
          amount: Number(r.amount),
          bankName: r.bankName === "-Select-" ? undefined : r.bankName,
          beneficiaryName:
            r.beneficiaryName === "-Select-" ? undefined : r.beneficiaryName,
          refNo: r.refNo,
          type: isRefund
            ? "Refund"
            : r.mode === "CreditNote" || r.mode === "TDS"
              ? r.mode
              : "Settlement",
          notes: isRefund ? settlementNotes : r.description,
          cardSwipingValue: r.cardSwipingValue,
        })),
      });

      toast.success(
        isRefund ? "Refund Processed" : "Receipt Processed",
        `Successfully processed ₹${totalPaid} on Invoice ${selectedInvoice.invoiceNo}.`,
      );
      setIsSettleModalOpen(false);
      setSelectedInvoice(null);
      loadAllBillingData();
    } catch (err: any) {
      toast.error(
        "Settlement Failed",
        err.message || "Failed to process settlement.",
      );
    }
  };

  // 6. Cancel Invoice
  const handleCancelInvoice = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this invoice?"))
      return;
    try {
      await cancelInvoice(id);
      toast.success(
        "Invoice Cancelled",
        "Invoice status successfully marked as Cancelled.",
      );
      loadAllBillingData();
    } catch (err: any) {
      toast.error("Cancel Failed", err.message || "Failed to cancel invoice.");
    }
  };

  // 7. Save OP Order
  const handleSaveOrder = async (billImmediately = false) => {
    if (!orderUhid.trim()) {
      toast.error("Required Field", "Please enter or select a Patient UHID.");
      return;
    }
    try {
      const patient = findPatientByUhid(orderUhid);
      const order = await createBillingOrder({
        uhid: orderUhid.trim(),
        patientName: patient?.patientName || `Patient ${orderUhid}`,
        doctorName: orderDoctor,
        orderType,
        items: orderItems,
        remarks: orderRemarks,
      });

      toast.success(
        "Order Created",
        `Doctor order ${order.orderNo} created successfully!`,
      );

      if (billImmediately) {
        const inv = await billOrder(order.id, {
          company: patient?.company || "CASH / CASH",
        });
        toast.success(
          "Order Billed",
          `Converted Order ${order.orderNo} to Invoice ${inv.invoiceNo}!`,
        );
      }

      loadAllBillingData();
      setActiveTab(
        billImmediately ? "Master Activity List" : "UnBilled Orders",
      );
    } catch (err: any) {
      toast.error(
        "Order Creation Failed",
        err.message || "Failed to create order.",
      );
    }
  };

  // 8. Collect Advance
  const handleSaveAdvance = async () => {
    if (!advUhid.trim() || Number(advAmount) <= 0) {
      toast.error(
        "Required Fields",
        "Please provide a valid UHID and advance amount.",
      );
      return;
    }
    try {
      const patient = findPatientByUhid(advUhid);
      const adv = await createAdvance({
        uhid: advUhid.trim(),
        patientName: patient?.patientName || `Patient ${advUhid}`,
        amount: Number(advAmount),
        mode: advMode,
        bankName: advBank,
        refNo: advRefNo,
        purpose: advPurpose,
      });

      toast.success(
        "Advance Collected",
        `Generated Advance Receipt Voucher ${adv.advanceNo} for ₹${adv.amount}!`,
      );
      setAdvUhid("");
      setAdvAmount(5000);
      loadAllBillingData();
    } catch (err: any) {
      toast.error(
        "Advance Failed",
        err.message || "Failed to collect advance.",
      );
    }
  };

  // 9. Issue Credit Note
  const handleSaveCreditNote = async () => {
    if (!cnInvoiceNo.trim() || Number(cnAmount) <= 0 || !cnReason.trim()) {
      toast.error(
        "Required Fields",
        "Please enter Invoice No, Amount, and Reason.",
      );
      return;
    }

    const invObj = findInvoiceByNo(cnInvoiceNo);
    if (!invObj) {
      toast.error(
        "Invoice Not Available",
        `Invoice Number "${cnInvoiceNo}" was not found in the system database.`,
      );
      return;
    }

    if (
      cnUhid.trim() &&
      invObj.uhid.trim().toLowerCase() !== cnUhid.trim().toLowerCase()
    ) {
      toast.error(
        "Invoice Mismatch",
        `Invoice ${invObj.invoiceNo} belongs to Patient UHID ${invObj.uhid} (${invObj.patientName}), not ${cnUhid}.`,
      );
      return;
    }

    try {
      const cn = await createCreditNote({
        invoiceId: invObj.id,
        invoiceNo: invObj.invoiceNo,
        uhid: invObj.uhid,
        patientName: invObj.patientName,
        amount: Number(cnAmount),
        reason: cnReason,
        authorizedBy: "Dr. Admin",
      });

      toast.success(
        "Credit Note Issued",
        `Credit Note ${cn.creditNoteNo} of ₹${cn.amount} applied to ${cn.invoiceNo}!`,
      );
      setCnInvoiceNo("");
      setCnUhid("");
      loadAllBillingData();
    } catch (err: any) {
      toast.error(
        "Credit Note Failed",
        err.message || "Failed to issue credit note.",
      );
    }
  };

  // 10. Process Refund
  const handleSaveRefund = async () => {
    if (!refUhid.trim() || Number(refAmount) <= 0 || !refReason.trim()) {
      toast.error(
        "Required Fields",
        "Please enter UHID, refund amount, and reason.",
      );
      return;
    }

    // Verify UHID Availability
    const patientObj = findPatientByUhid(refUhid);
    if (!patientObj) {
      toast.error(
        "UHID Not Available",
        `Patient UHID "${refUhid}" was not found in the system database.`,
      );
      return;
    }

    // Verify Invoice Availability & Match if provided
    if (refInvoiceNo.trim()) {
      const invObj = findInvoiceByNo(refInvoiceNo);
      if (!invObj) {
        toast.error(
          "Invoice Not Available",
          `Invoice Number "${refInvoiceNo}" was not found in the system database.`,
        );
        return;
      }
      if (invObj.uhid.trim().toLowerCase() !== refUhid.trim().toLowerCase()) {
        toast.error(
          "Invoice Mismatch",
          `Invoice ${invObj.invoiceNo} belongs to Patient UHID ${invObj.uhid} (${invObj.patientName}), not ${refUhid}.`,
        );
        return;
      }
    }

    try {
      const ref = await createRefund({
        uhid: refUhid.trim(),
        patientName: patientObj.patientName || `Patient ${refUhid}`,
        invoiceNo: refInvoiceNo.trim() || undefined,
        amount: Number(refAmount),
        mode: refMode,
        reason: refReason,
        authorizedBy: "Dr. Admin",
      });

      toast.success(
        "Refund Processed",
        `Refund Voucher ${ref.refundNo} of ₹${ref.amount} generated for ${patientObj.patientName}.`,
      );
      setRefUhid("");
      setRefInvoiceNo("");
      loadAllBillingData();
    } catch (err: any) {
      toast.error("Refund Failed", err.message || "Failed to process refund.");
    }
  };

  // 11. Create / Update Intimation
  const handleSaveIntimation = async () => {
    if (!intUhid.trim() || !intTpa.trim() || !intClaimNo.trim()) {
      toast.error(
        "Required Fields",
        "Please enter UHID, TPA Name, and Claim Number.",
      );
      return;
    }
    try {
      const patient = findPatientByUhid(intUhid);
      const intObj = await createIntimation({
        uhid: intUhid.trim(),
        patientName: patient?.patientName || `Patient ${intUhid}`,
        tpaName: intTpa,
        policyNo: intPolicyNo,
        claimNo: intClaimNo,
        requestedAmt: Number(intReqAmt),
        approvedAmt: Number(intApprAmt),
        coPayAmt: Number(intCoPay),
        status: "Approved",
        remarks: "Pre-authorization approved by TPA portal",
      });

      toast.success(
        "TPA Claim Registered",
        `Claim Intimation ${intObj.claimNo} saved with approved limit ₹${intObj.approvedAmt}.`,
      );
      setIntUhid("");
      loadAllBillingData();
    } catch (err: any) {
      toast.error(
        "Intimation Failed",
        err.message || "Failed to save intimation.",
      );
    }
  };

  // 12. Convert Selected Unbilled Orders to Combined Bill
  const handleBillSelectedOrders = async () => {
    if (selectedUnbilledOrders.length === 0) {
      toast.error(
        "No Orders Selected",
        "Please select at least one pending order.",
      );
      return;
    }
    try {
      let billedCount = 0;
      for (const ordId of selectedUnbilledOrders) {
        await billOrder(ordId, { company: "CASH / CASH" });
        billedCount++;
      }
      toast.success(
        "Orders Billed",
        `Successfully converted ${billedCount} orders into invoices!`,
      );
      setSelectedUnbilledOrders([]);
      loadAllBillingData();
      setActiveTab("Master Activity List");
    } catch (err: any) {
      toast.error("Billing Failed", err.message || "Failed to bill orders.");
    }
  };

  // ─── FILTERED DATA ───────────────────────────────────────────────────────────
  const filteredPatients = patients.filter((p) => {
    if (patientTypeFilter && p.type !== patientTypeFilter) return false;
    if (
      patientStatusFilter !== "all" &&
      p.encounterStatus !== patientStatusFilter
    )
      return false;
    if (patientSearch) {
      const term = patientSearch.toLowerCase();
      if (patientSearchOn === "Patient Name")
        return p.patientName.toLowerCase().includes(term);
      if (patientSearchOn === "UHID")
        return p.uhid.toLowerCase().includes(term);
      if (patientSearchOn === "IP No.")
        return p.ipNo.toLowerCase().includes(term);
      if (patientSearchOn === "Mobile #") return p.mobileNo.includes(term);
      if (patientSearchOn === "Bed No")
        return p.bedNo.toLowerCase().includes(term);
      if (patientSearchOn === "Doctor Name")
        return p.doctor.toLowerCase().includes(term);
      if (patientSearchOn === "Company")
        return p.company.toLowerCase().includes(term);
    }
    return true;
  });

  const patientTotalPages = Math.max(
    1,
    Math.ceil(filteredPatients.length / patientPageSize),
  );
  const paginatedPatients = filteredPatients.slice(
    (patientCurrentPage - 1) * patientPageSize,
    patientCurrentPage * patientPageSize,
  );

  // ─── Master Activity List Preset and Reset Handlers ─────────────────────────
  const handleDateRangePresetChange = (preset: string) => {
    setMalDateRangePreset(preset);
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    if (preset === "Today") {
      setMalFromDate(todayStr);
      setMalToDate(todayStr);
    } else if (preset === "Yesterday") {
      const yest = new Date(today);
      yest.setDate(yest.getDate() - 1);
      const yestStr = yest.toISOString().split("T")[0];
      setMalFromDate(yestStr);
      setMalToDate(yestStr);
    } else if (preset === "This Week") {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      setMalFromDate(weekAgo.toISOString().split("T")[0]);
      setMalToDate(todayStr);
    } else if (preset === "This Month") {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      setMalFromDate(monthStart.toISOString().split("T")[0]);
      setMalToDate(todayStr);
    } else if (preset === "Date Range" || preset === "All") {
      setMalFromDate("");
      setMalToDate("");
    }
  };

  const handleResetMalFilters = () => {
    setMalUhid("");
    setMalBillNo("");
    setMalDateRangePreset("Date Range");
    setMalFromDate("");
    setMalToDate("");
    setMalFacility("CMK HEALTHCARE PVT. LTD.");
    setMalPayerType("Select All");
    setMalPayer("Select All");
    setMalSponsor("Select All");
    setMalPatientType("Both");
    setMalPrintAs("Summary");
    setMalPatientRefundableOnly(false);
    setMalSearchFor("All Invoices");
    setColFilterCompany("");
    setColFilterUhid("");
    setColFilterPatient("");
    setColFilterEnc("");
    setColFilterInvoiceNo("");
    setSelectedInvoiceIds([]);
    toast.success(
      "Filters Cleared",
      "All master activity filters have been reset.",
    );
  };

  const toggleSelectAllInvoices = () => {
    if (
      selectedInvoiceIds.length === filteredInvoices.length &&
      filteredInvoices.length > 0
    ) {
      setSelectedInvoiceIds([]);
    } else {
      setSelectedInvoiceIds(filteredInvoices.map((inv) => inv.id));
    }
  };

  const toggleSelectInvoice = (id: string) => {
    if (selectedInvoiceIds.includes(id)) {
      setSelectedInvoiceIds(selectedInvoiceIds.filter((i) => i !== id));
    } else {
      setSelectedInvoiceIds([...selectedInvoiceIds, id]);
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Top Filter Panel criteria
      if (
        malUhid.trim() &&
        !inv.uhid.toLowerCase().includes(malUhid.trim().toLowerCase())
      )
        return false;
      if (
        malBillNo.trim() &&
        !inv.invoiceNo.toLowerCase().includes(malBillNo.trim().toLowerCase())
      )
        return false;
      if (malPatientType !== "Both" && inv.type !== malPatientType)
        return false;

      if (malPayerType !== "Select All") {
        const isIns =
          inv.company.toLowerCase().includes("insurance") ||
          inv.company.toLowerCase().includes("star") ||
          inv.company.toLowerCase().includes("hdfc") ||
          inv.company.toLowerCase().includes("tpa");
        if (malPayerType === "Direct Patient" && isIns) return false;
        if (malPayerType === "Insurance" && !isIns) return false;
        if (
          malPayerType === "Corporate" &&
          !inv.company.toLowerCase().includes("corporate") &&
          !inv.company.toLowerCase().includes("sponsor")
        )
          return false;
      }

      if (
        malPayer !== "Select All" &&
        !inv.company.toLowerCase().includes(malPayer.toLowerCase())
      )
        return false;
      if (
        malSponsor !== "Select All" &&
        !inv.company.toLowerCase().includes(malSponsor.toLowerCase())
      )
        return false;

      if (
        malPatientRefundableOnly &&
        inv.status !== "Refundable" &&
        inv.refund <= 0 &&
        inv.balance >= 0
      )
        return false;

      if (malSearchFor === "UnSettled") {
        if (inv.status !== "Outstanding") return false;
      } else if (malSearchFor === "Settled") {
        if (inv.status !== "Settled") return false;
      } else if (malSearchFor === "Refundable") {
        if (inv.status !== "Refundable") return false;
      } else if (malSearchFor === "Cancelled") {
        if (inv.status !== "Cancelled") return false;
      }

      if (malFromDate) {
        const invDate = new Date(inv.date);
        const fromD = new Date(malFromDate);
        fromD.setHours(0, 0, 0, 0);
        if (invDate < fromD) return false;
      }
      if (malToDate) {
        const invDate = new Date(inv.date);
        const toD = new Date(malToDate);
        toD.setHours(23, 59, 59, 999);
        if (invDate > toD) return false;
      }

      // Column-level search filters
      if (
        colFilterCompany.trim() &&
        !inv.company
          .toLowerCase()
          .includes(colFilterCompany.trim().toLowerCase())
      )
        return false;
      if (
        colFilterUhid.trim() &&
        !inv.uhid.toLowerCase().includes(colFilterUhid.trim().toLowerCase())
      )
        return false;
      if (
        colFilterPatient.trim() &&
        !inv.patientName
          .toLowerCase()
          .includes(colFilterPatient.trim().toLowerCase())
      )
        return false;
      if (
        colFilterEnc.trim() &&
        !String(inv.encNo || "")
          .toLowerCase()
          .includes(colFilterEnc.trim().toLowerCase())
      )
        return false;
      if (
        colFilterInvoiceNo.trim() &&
        !inv.invoiceNo
          .toLowerCase()
          .includes(colFilterInvoiceNo.trim().toLowerCase())
      )
        return false;

      return true;
    });
  }, [
    invoices,
    malUhid,
    malBillNo,
    malPatientType,
    malPayerType,
    malPayer,
    malSponsor,
    malPatientRefundableOnly,
    malSearchFor,
    malFromDate,
    malToDate,
    colFilterCompany,
    colFilterUhid,
    colFilterPatient,
    colFilterEnc,
    colFilterInvoiceNo,
  ]);

  const selectedInvoicesList = useMemo(() => {
    return filteredInvoices.filter((inv) =>
      selectedInvoiceIds.includes(inv.id),
    );
  }, [filteredInvoices, selectedInvoiceIds]);

  const selectedTotalAmount = useMemo(() => {
    return selectedInvoicesList.reduce((sum, inv) => sum + inv.netAmt, 0);
  }, [selectedInvoicesList]);

  const totalAdvanceAvailable = useMemo(() => {
    return advances
      .filter((a) => a.status === "Active")
      .reduce((sum, a) => sum + a.balanceAmount, 0);
  }, [advances]);

  const opPatientOutstandingInvoices = useMemo(() => {
    if (!opBillingUhid.trim()) return [];
    const termUhid = opBillingUhid.trim().toLowerCase();
    const patName = opBillingPatientInfo?.name?.trim().toLowerCase() || "";
    return invoices.filter((inv) => {
      const matchesUhid = termUhid && inv.uhid.toLowerCase().includes(termUhid);
      const matchesName =
        patName && inv.patientName.toLowerCase().includes(patName);
      return (
        (matchesUhid || matchesName) &&
        inv.balance > 0 &&
        inv.status === "Outstanding"
      );
    });
  }, [invoices, opBillingUhid, opBillingPatientInfo]);

  const filteredAdvances = useMemo(() => {
    if (!advUhid.trim()) return advances;
    const term = advUhid.trim().toLowerCase();
    return advances.filter(
      (a) =>
        a.uhid.toLowerCase().includes(term) ||
        a.patientName.toLowerCase().includes(term) ||
        a.advanceNo.toLowerCase().includes(term),
    );
  }, [advances, advUhid]);

  const ledgerAdvances = useMemo(() => {
    return advances.filter((adv) => {
      if (
        malUhid.trim() &&
        !adv.uhid.toLowerCase().includes(malUhid.trim().toLowerCase())
      )
        return false;
      if (
        malBillNo.trim() &&
        !adv.advanceNo.toLowerCase().includes(malBillNo.trim().toLowerCase())
      )
        return false;
      if (malFromDate) {
        const advDate = new Date(adv.createdAt);
        const fromD = new Date(malFromDate);
        fromD.setHours(0, 0, 0, 0);
        if (advDate < fromD) return false;
      }
      if (malToDate) {
        const advDate = new Date(adv.createdAt);
        const toD = new Date(malToDate);
        toD.setHours(23, 59, 59, 999);
        if (advDate > toD) return false;
      }
      return true;
    });
  }, [advances, malUhid, malBillNo, malFromDate, malToDate]);

  const opActiveAdvanceBalance = useMemo(() => {
    if (!opBillingUhid.trim()) return 0;
    const term = opBillingUhid.trim().toLowerCase();
    const patientAdvs = advances.filter(
      (a) => a.uhid.trim().toLowerCase() === term,
    );
    return patientAdvs.reduce(
      (sum, a) => sum + Number(a.balanceAmount ?? a.amount ?? 0),
      0,
    );
  }, [opBillingUhid, advances]);

  useEffect(() => {
    setOpBillingAvailableDeposit(opActiveAdvanceBalance);
    setOpBillingAppliedDeposit(0);
  }, [opActiveAdvanceBalance]);

  const ipActiveAdvanceBalance = useMemo(() => {
    if (!ipBillingUhid) return 0;
    const patientAdvs = advances.filter(
      (a) => a.uhid.trim().toLowerCase() === ipBillingUhid.trim().toLowerCase(),
    );
    return patientAdvs.reduce(
      (sum, a) => sum + Number(a.balanceAmount || 0),
      0,
    );
  }, [ipBillingUhid, advances]);

  const allReceiptsList = useMemo(() => {
    if (receiptsList && receiptsList.length > 0) return receiptsList;
    const list: Array<{
      id: string;
      receiptNo: string;
      invoiceNo: string;
      uhid: string;
      patientName: string;
      company: string;
      encNo: string;
      date: string;
      mode: string;
      bankName?: string;
      refNo?: string;
      amount: number;
      type: string;
      notes?: string;
    }> = [];

    invoices.forEach((inv) => {
      if (inv.receipts && Array.isArray(inv.receipts)) {
        inv.receipts.forEach((rc: any, idx: number) => {
          list.push({
            id: rc.id || `${inv.id}-${idx}`,
            receiptNo: rc.receiptNo || `RCT-${inv.invoiceNo}-${idx + 1}`,
            invoiceNo: inv.invoiceNo,
            uhid: inv.uhid,
            patientName: inv.patientName,
            company: inv.company,
            encNo: inv.encNo || "1",
            date: rc.createdAt || inv.date,
            mode: rc.mode || "Cash",
            bankName: rc.bankName,
            refNo: rc.refNo,
            amount: rc.amount || 0,
            type: rc.type || "Settlement",
            notes: rc.notes || rc.remarks,
          });
        });
      }
    });

    return list;
  }, [receiptsList, invoices]);

  const unbilledOrders = orders.filter((o) => o.status === "Unbilled");

  // ─── RENDER UI ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-slate-50/70 p-4 space-y-3.5 overflow-y-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              Billing & Payments
            </h2>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold"
            >
              CMK CareSuite Core
            </Badge>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Comprehensive hospital accounting, OPD/IPD invoices, split receipts,
            deposits & TPA claims
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={loadAllBillingData}
            className="h-8 gap-1 text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border-slate-300 shadow-2xs"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-blue-600" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* 11 Horizontal Navigation Tabs */}
      <div className="border-b border-slate-200 bg-white px-3 pt-2 rounded-t-xl flex-shrink-0 flex items-center overflow-x-auto gap-1 shadow-2xs scrollbar-none">
        {[
          { id: "OP Billing", label: "OP Billing", icon: FileText },
          { id: "IP Billing", label: "IP Billing", icon: Building2 },
          { id: "Patient Lists", label: "Patient Lists", icon: User },
          {
            id: "Master Activity List",
            label: "Master Activity List",
            icon: ReceiptText,
          },
          // { id: "Refund", label: "Refund", icon: RotateCcw },
          /*
          { id: "Create OP Visit", label: "Create OP Visit", icon: Calendar },
          {
            id: "Advance Collection",
            label: "Advance Collection",
            icon: Wallet,
          },
          { id: "Credit Note", label: "Credit Note", icon: CreditCard },
          { id: "Intimation", label: "Intimation", icon: ShieldCheck },
          {
            id: "UnBilled Orders",
            label: "Unbilled Orders",
            icon: FileCheck,
            count: unbilledOrders.length,
          },
          */
        ].map((tab: { id: string; label: string; icon: any; count?: number }) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`h-8 border-b-2 px-3 pb-1 text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? "border-[#051A7C] text-[#051A7C] bg-blue-50/80 rounded-t-md"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${isSelected ? "text-[#051A7C]" : "text-slate-400"}`}
              />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 text-[9px] bg-red-500 text-white rounded-full font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Dynamic View Content */}
      <div className="flex-1 min-h-0 flex flex-col">
        {/* ─── TAB 1: PATIENT LISTS ────────────────────────────────────────── */}
        {activeTab === "Patient Lists" && (
          <Card className="flex-1 flex flex-col overflow-hidden border-slate-200/80 shadow-2xs">
            {/* Header / Actions Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 flex-shrink-0">
              <span className="font-extrabold text-slate-800">
                Inpatient & Outpatient Census List
              </span>
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="text-red-500 font-bold">
                  Total Found: {filteredPatients.length}
                </span>
                <div className="flex items-center gap-1.5 ml-2">
                  <Button
                    size="xs"
                    className="h-6 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    onClick={() => {}}
                  >
                    Filter
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    className="h-6 px-3 bg-white text-slate-700 border-slate-300 font-bold hover:bg-slate-100"
                    onClick={() => {
                      setPatientSearch("");
                      setPatientStatusFilter("all");
                      setPatientTypeFilter("Admission");
                    }}
                  >
                    Clear Filter
                  </Button>
                </div>
              </div>
            </div>

            {/* Filters Sub-bar */}
            <div className="p-3 border-b border-slate-100 bg-white flex-shrink-0 flex items-center justify-between flex-wrap gap-4 text-xs font-medium text-slate-700">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold">
                    Encounter Status:
                  </span>
                  <Select
                    value={patientStatusFilter}
                    onValueChange={setPatientStatusFilter}
                  >
                    <SelectTrigger className="h-7 text-xs w-44 bg-white border-slate-200">
                      <SelectValue placeholder="Select All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Select All</SelectItem>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="Marked For Discharged">
                        Marked for Discharge
                      </SelectItem>
                      <SelectItem value="Sent For Billing">
                        Sent For Billing
                      </SelectItem>
                      <SelectItem value="Pharmacy Clearance">
                        Pharmacy Clearance
                      </SelectItem>
                      <SelectItem value="File Received">
                        File Received
                      </SelectItem>
                      <SelectItem value="Bill Prepared">
                        Bill Prepared
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold">Search On:</span>
                  <Select
                    value={patientSearchOn}
                    onValueChange={setPatientSearchOn}
                  >
                    <SelectTrigger className="h-7 text-xs w-36 bg-white border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Patient Name">Patient Name</SelectItem>
                      <SelectItem value="UHID">UHID</SelectItem>
                      <SelectItem value="IP No.">IP No.</SelectItem>
                      <SelectItem value="Mobile #">Mobile #</SelectItem>
                      <SelectItem value="Bed No">Bed No</SelectItem>
                      <SelectItem value="Doctor Name">Doctor Name</SelectItem>
                      <SelectItem value="Company">Company</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    className="h-7 text-xs w-44 bg-white border-slate-200 px-2"
                    placeholder="Search keywords..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Patient Category Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg overflow-x-auto scrollbar-none max-w-full">
                {[
                  "Registration",
                  "Admission",
                  "Discharge But Not Bill",
                  "Discharge",
                ].map((t) => (
                  <button
                    key={t}
                    onClick={() => setPatientTypeFilter(t)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${
                      patientTypeFilter === t
                        ? "bg-white text-blue-700 shadow-2xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {t === "Discharge But Not Bill"
                      ? "Discharged - Bill Pending"
                      : t === "Discharge"
                        ? "Discharged"
                        : t}
                  </button>
                ))}
              </div>
            </div>

            {/* Patients Table */}
            <div className="flex-1 overflow-auto bg-white">
              <table className="w-full text-xs text-left">
                <thead className="bg-gradient-to-r from-teal-600 to-teal-700 text-white uppercase text-[10px] font-bold sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2.5 tracking-wider">UHID</th>
                    <th className="px-3 py-2.5 tracking-wider">
                      IP / Visit No
                    </th>
                    <th className="px-3 py-2.5 tracking-wider">Patient Name</th>
                    <th className="px-3 py-2.5 tracking-wider">Gender / Age</th>
                    <th className="px-3 py-2.5 tracking-wider">Bed / Room</th>
                    <th className="px-3 py-2.5 tracking-wider">Category</th>
                    <th className="px-3 py-2.5 tracking-wider">Doctor</th>
                    <th className="px-3 py-2.5 tracking-wider">Status</th>
                    <th className="px-3 py-2.5 tracking-wider">
                      Company / Payer
                    </th>
                    <th className="px-3 py-2.5 tracking-wider">Mobile</th>
                    <th className="px-3 py-2.5 text-center tracking-wider">
                      Fast Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {paginatedPatients.map((p) => (
                    <tr key={p.uhid} className="hover:bg-blue-50/40 group">
                      <td
                        className="px-3 py-2.5 font-mono font-bold text-blue-600 whitespace-nowrap"
                        title={p.uhid}
                      >
                        {p.uhid}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-slate-600">
                        {p.ipNo}
                      </td>
                      <td className="px-3 py-2.5 font-bold text-slate-800">
                        {p.patientName}
                        {p.isVip && (
                          <Badge className="ml-1.5 bg-amber-500 text-[9px] h-4">
                            VIP
                          </Badge>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-slate-500">
                        {p.genderAge}
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-slate-700">
                        {p.bedNo}
                      </td>
                      <td className="px-3 py-2.5 text-[10px] text-slate-500 font-bold">
                        {p.billingCategory}
                      </td>
                      <td className="px-3 py-2.5 text-slate-700 font-semibold">
                        {p.doctor}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.encounterStatus === "Open"
                              ? "bg-blue-50 text-blue-700"
                              : p.encounterStatus === "Bill Prepared"
                                ? "bg-purple-50 text-purple-700"
                                : p.encounterStatus === "Marked For Discharged"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {p.encounterStatus}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">
                        {p.company}
                      </td>
                      <td className="px-3 py-2.5 text-slate-500 font-mono">
                        {p.mobileNo}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-90 group-hover:opacity-100">
                          <Button
                            size="xs"
                            variant="outline"
                            className="h-6 text-[10px] font-bold bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => {
                              setOpBillingUhid(p.uhid);
                              setActiveTab("OP Billing");
                            }}
                          >
                            OP Bill
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            className="h-6 text-[10px] font-bold bg-white text-purple-600 border-purple-200 hover:bg-purple-50"
                            onClick={() => {
                              setIpBillingUhid(p.uhid);
                              setActiveTab("IP Billing");
                            }}
                          >
                            IP Bill
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredPatients.length === 0 && (
                    <tr>
                      <td
                        colSpan={11}
                        className="px-3 py-10 text-center text-slate-400 font-bold"
                      >
                        No patients matching filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination Footer ─────────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-200 bg-slate-50 flex-shrink-0">
              {/* Rows per page selector */}
              <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                <span>Rows per page:</span>
                <select
                  value={patientPageSize}
                  onChange={(e) => {
                    setPatientPageSize(Number(e.target.value));
                    setPatientCurrentPage(1);
                  }}
                  className="h-7 px-2 text-xs border border-slate-200 rounded-md bg-white text-slate-700 font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {[5, 10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              {/* Right side: Page info + Pagination buttons */}
              <div className="flex items-center gap-3">
                {/* Showing text */}
                <span className="text-xs text-slate-500 font-semibold">
                  Showing{" "}
                  <span className="font-bold text-slate-800">
                    {filteredPatients.length === 0
                      ? 0
                      : (patientCurrentPage - 1) * patientPageSize + 1}
                  </span>{" "}
                  –{" "}
                  <span className="font-bold text-slate-800">
                    {Math.min(
                      patientCurrentPage * patientPageSize,
                      filteredPatients.length,
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-slate-800">
                    {filteredPatients.length}
                  </span>{" "}
                  results
                </span>

                {/* Pagination buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPatientCurrentPage(1)}
                    disabled={patientCurrentPage === 1}
                    className="h-7 w-7 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-teal-600 hover:text-white hover:border-teal-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-bold"
                    title="First page"
                  >
                    «
                  </button>
                  <button
                    onClick={() =>
                      setPatientCurrentPage((p) => Math.max(1, p - 1))
                    }
                    disabled={patientCurrentPage === 1}
                    className="h-7 w-7 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-teal-600 hover:text-white hover:border-teal-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-bold"
                    title="Previous page"
                  >
                    ‹
                  </button>

                  {Array.from({ length: patientTotalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === patientTotalPages ||
                        Math.abs(page - patientCurrentPage) <= 1,
                    )
                    .reduce((acc: (number | string)[], page, idx, arr) => {
                      if (
                        idx > 0 &&
                        (page as number) - (arr[idx - 1] as number) > 1
                      )
                        acc.push("…");
                      acc.push(page);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === "…" ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="h-7 w-7 flex items-center justify-center text-slate-400 text-xs"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setPatientCurrentPage(item as number)}
                          className={`h-7 w-7 flex items-center justify-center rounded-md border text-xs font-bold transition-colors ${
                            patientCurrentPage === item
                              ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-teal-600 hover:text-white hover:border-teal-600"
                          }`}
                        >
                          {item}
                        </button>
                      ),
                    )}

                  <button
                    onClick={() =>
                      setPatientCurrentPage((p) =>
                        Math.min(patientTotalPages, p + 1),
                      )
                    }
                    disabled={patientCurrentPage === patientTotalPages}
                    className="h-7 w-7 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-teal-600 hover:text-white hover:border-teal-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-bold"
                    title="Next page"
                  >
                    ›
                  </button>
                  <button
                    onClick={() => setPatientCurrentPage(patientTotalPages)}
                    disabled={patientCurrentPage === patientTotalPages}
                    className="h-7 w-7 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-teal-600 hover:text-white hover:border-teal-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-bold"
                    title="Last page"
                  >
                    »
                  </button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* ─── TAB 2: MASTER ACTIVITY LIST (INVOICES & RECEIPTS) ───────────── */}
        {activeTab === "Master Activity List" && (
          <Card className="flex-1 flex flex-col overflow-hidden border-slate-200/80 shadow-2xs">
            {/* Header Title & Top Quick Action */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-[#cee6f8] text-xs font-bold text-slate-700 flex-shrink-0">
              <span className="text-sm font-bold text-slate-800">
                Master Activity List
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="xs"
                  variant="outline"
                  className="h-6 text-[11px] bg-white text-slate-700 hover:bg-slate-50 border-slate-300 font-bold cursor-pointer"
                  onClick={handleResetMalFilters}
                >
                  <RotateCcw className="w-3 h-3 mr-1" /> Reset All Filters
                </Button>
                <Button
                  size="xs"
                  className="h-6 text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs cursor-pointer"
                  onClick={() => {
                    setOpBillingUhid("2710");
                    setActiveTab("OP Billing");
                  }}
                >
                  <Plus className="w-3 h-3 mr-1" /> + Generate New Bill
                </Button>
              </div>
            </div>

            {/* Filter Panel (Matching EMR Reference Layout) */}
            <div className="p-3 border-b border-slate-200 bg-white flex-shrink-0 text-xs font-medium text-slate-700 space-y-2.5">
              {/* Row 1: UHID, Bill No, Date Range, From, To */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
                {/* UHID */}
                <div className="md:col-span-3 flex items-center gap-1.5">
                  <span className="w-12 text-slate-500 font-bold text-[11px] flex-shrink-0">
                    UHID
                  </span>
                  <div className="flex items-center gap-1 flex-1">
                    <Input
                      placeholder="Enter UHID..."
                      className="h-7 text-xs bg-white border-slate-300 font-mono font-bold"
                      value={malUhid}
                      onChange={(e) => setMalUhid(e.target.value)}
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7 text-blue-600 border-blue-200 hover:bg-blue-50 font-bold flex-shrink-0 cursor-pointer"
                      title="Quick Patient Search (Q)"
                      onClick={() => setIsPatientSearchModalOpen(true)}
                    >
                      <Search className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7 text-slate-500 border-slate-300 hover:bg-slate-100 font-bold flex-shrink-0 text-[11px] cursor-pointer"
                      title="Reset UHID (R)"
                      onClick={() => setMalUhid("")}
                    >
                      R
                    </Button>
                  </div>
                </div>

                {/* Bill No */}
                <div className="md:col-span-3 flex items-center gap-1.5">
                  <span className="w-14 text-slate-500 font-bold text-[11px] flex-shrink-0">
                    Bill No
                  </span>
                  <Input
                    placeholder="Invoice / Bill No..."
                    className="h-7 text-xs bg-white border-slate-300 font-mono"
                    value={malBillNo}
                    onChange={(e) => setMalBillNo(e.target.value)}
                  />
                </div>

                {/* Date Range Preset */}
                <div className="md:col-span-2 flex items-center gap-1.5">
                  <span className="w-20 text-slate-500 font-bold text-[11px] flex-shrink-0">
                    Date Range
                  </span>
                  <Select
                    value={malDateRangePreset}
                    onValueChange={handleDateRangePresetChange}
                  >
                    <SelectTrigger className="h-7 text-xs flex-1 bg-white border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Date Range">Date Range</SelectItem>
                      <SelectItem value="Today">Today</SelectItem>
                      <SelectItem value="Yesterday">Yesterday</SelectItem>
                      <SelectItem value="This Week">This Week</SelectItem>
                      <SelectItem value="This Month">This Month</SelectItem>
                      <SelectItem value="All">All Dates</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* From Date */}
                <div className="md:col-span-2 flex items-center gap-1.5">
                  <span className="w-10 text-slate-500 font-bold text-[11px] flex-shrink-0">
                    From
                  </span>
                  <Input
                    type="date"
                    className="h-7 text-xs bg-white border-slate-300 font-mono"
                    value={malFromDate}
                    onChange={(e) => {
                      setMalFromDate(e.target.value);
                      setMalDateRangePreset("Custom");
                    }}
                  />
                </div>

                {/* To Date */}
                <div className="md:col-span-2 flex items-center gap-1.5">
                  <span className="w-6 text-slate-500 font-bold text-[11px] flex-shrink-0">
                    To
                  </span>
                  <Input
                    type="date"
                    className="h-7 text-xs bg-white border-slate-300 font-mono"
                    value={malToDate}
                    onChange={(e) => {
                      setMalToDate(e.target.value);
                      setMalDateRangePreset("Custom");
                    }}
                  />
                </div>
              </div>

              {/* Row 2: Facility, Payer Type, Payer, Sponsor */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
                {/* Facility */}
                <div className="md:col-span-3 flex items-center gap-1.5">
                  <span className="w-12 text-slate-500 font-bold text-[11px] flex-shrink-0">
                    Facility
                  </span>
                  <Select value={malFacility} onValueChange={setMalFacility}>
                    <SelectTrigger className="h-7 text-xs flex-1 bg-white border-slate-300 font-bold text-slate-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CMK HEALTHCARE PVT. LTD.">
                        CMK HEALTHCARE PVT. LTD.
                      </SelectItem>
                      <SelectItem value="Main Branch Hospital">
                        Main Branch Hospital
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Payer Type */}
                <div className="md:col-span-3 flex items-center gap-1.5">
                  <span className="w-16 text-slate-500 font-bold text-[11px] flex-shrink-0">
                    Payer Type
                  </span>
                  <Select value={malPayerType} onValueChange={setMalPayerType}>
                    <SelectTrigger className="h-7 text-xs flex-1 bg-white border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Select All">Select All</SelectItem>
                      <SelectItem value="Direct Patient">
                        Direct Patient (Cash)
                      </SelectItem>
                      <SelectItem value="Insurance">Insurance / TPA</SelectItem>
                      <SelectItem value="Corporate">Corporate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Payer */}
                <div className="md:col-span-3 flex items-center gap-1.5">
                  <span className="w-12 text-slate-500 font-bold text-[11px] flex-shrink-0">
                    Payer
                  </span>
                  <Select value={malPayer} onValueChange={setMalPayer}>
                    <SelectTrigger className="h-7 text-xs flex-1 bg-white border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Select All">Select All</SelectItem>
                      <SelectItem value="CASH">CASH</SelectItem>
                      <SelectItem value="Star Health">
                        Star Health & Allied Insurance
                      </SelectItem>
                      <SelectItem value="HDFC ERGO">
                        HDFC ERGO General Insurance
                      </SelectItem>
                      <SelectItem value="ICICI Lombard">
                        ICICI Lombard
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sponsor */}
                <div className="md:col-span-3 flex items-center gap-1.5">
                  <span className="w-14 text-slate-500 font-bold text-[11px] flex-shrink-0">
                    Sponsor
                  </span>
                  <Select value={malSponsor} onValueChange={setMalSponsor}>
                    <SelectTrigger className="h-7 text-xs flex-1 bg-white border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Select All">Select All</SelectItem>
                      <SelectItem value="CASH">CASH</SelectItem>
                      <SelectItem value="Star Health">Star Health</SelectItem>
                      <SelectItem value="Corporate">Corporate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 3: Patient Type, Print As, Patient Refundable, Search For, Search Button */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
                {/* Patient Type */}
                <div className="md:col-span-3 flex items-center gap-1.5">
                  <span className="w-20 text-slate-500 font-bold text-[11px] flex-shrink-0">
                    Patient Type
                  </span>
                  <Select
                    value={malPatientType}
                    onValueChange={setMalPatientType}
                  >
                    <SelectTrigger className="h-7 text-xs flex-1 bg-white border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Both">Both (OP + IP)</SelectItem>
                      <SelectItem value="OP">Outpatient (OP)</SelectItem>
                      <SelectItem value="IP">Inpatient (IP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Print As Radio Buttons */}
                <div className="md:col-span-2 flex items-center gap-3 text-xs font-semibold text-slate-700">
                  <span className="text-slate-500 font-bold text-[11px]">
                    Print As
                  </span>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="malPrintAs"
                      value="Summary"
                      checked={malPrintAs === "Summary"}
                      onChange={() => setMalPrintAs("Summary")}
                      className="h-3.5 w-3.5 text-blue-600"
                    />
                    <span>Summary</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="malPrintAs"
                      value="Detail"
                      checked={malPrintAs === "Detail"}
                      onChange={() => setMalPrintAs("Detail")}
                      className="h-3.5 w-3.5 text-blue-600"
                    />
                    <span>Detail</span>
                  </label>
                </div>

                {/* Patient Refundable Checkbox */}
                <div className="md:col-span-2 flex items-center gap-1.5">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={malPatientRefundableOnly}
                      onChange={(e) =>
                        setMalPatientRefundableOnly(e.target.checked)
                      }
                      className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600"
                    />
                    <span>Patient Refundable</span>
                  </label>
                </div>

                {/* Search For */}
                <div className="md:col-span-3 flex items-center gap-1.5">
                  <span className="w-18 text-slate-500 font-bold text-[11px] flex-shrink-0">
                    Search For
                  </span>
                  <Select value={malSearchFor} onValueChange={setMalSearchFor}>
                    <SelectTrigger className="h-7 text-xs flex-1 bg-white border-slate-300 font-bold text-blue-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Invoices">All Invoices</SelectItem>
                      <SelectItem value="UnSettled">
                        Unsettled / Pending
                      </SelectItem>
                      <SelectItem value="Settled">Settled</SelectItem>
                      <SelectItem value="Refundable">Refundable</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Search Action Button */}
                <div className="md:col-span-2 flex items-center justify-end gap-1.5">
                  <Button
                    size="sm"
                    className="h-7 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs w-full cursor-pointer"
                    onClick={loadAllBillingData}
                  >
                    <Search className="w-3.5 h-3.5 mr-1" /> Search
                  </Button>
                </div>
              </div>
            </div>

            {/* Sub-tabs & Real-time Live Summary Bar */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-1 flex-shrink-0">
              <div className="flex items-center gap-1">
                {[
                  "Invoice Details",
                  "Receipt Details",
                  "Advance Details",
                  "Selected Invoice",
                ].map((st) => (
                  <button
                    key={st}
                    onClick={() => setActiveSubTab(st)}
                    className={`h-7 px-3 text-xs font-bold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                      activeSubTab === st
                        ? "bg-blue-600 text-white font-bold shadow-2xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>{st}</span>
                    {st === "Selected Invoice" &&
                      selectedInvoiceIds.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.2 bg-white text-blue-700 rounded-full text-[10px] font-black">
                          {selectedInvoiceIds.length}
                        </span>
                      )}
                  </button>
                ))}
              </div>

              {/* Right Side Live Totals (Matching Reference Screenshot) */}
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
                <div>
                  <span className="text-slate-500 font-bold">
                    Total Advance Available:{" "}
                  </span>
                  <span className="font-mono font-black text-emerald-600">
                    ₹{totalAdvanceAvailable.toFixed(2)}
                  </span>
                </div>
                <div className="border-l pl-3 border-slate-300">
                  <span className="text-slate-500 font-bold">
                    Selected Invoice Amount:{" "}
                  </span>
                  <span className="font-mono font-black text-blue-700">
                    ₹{selectedTotalAmount.toFixed(2)} (
                    {selectedInvoiceIds.length})
                  </span>
                </div>
              </div>
            </div>

            {/* Data Table with In-Table Column Filters */}
            <div className="flex-1 overflow-auto bg-white flex flex-col justify-between">
              {/* SUBTAB 1: INVOICE DETAILS */}
              {activeSubTab === "Invoice Details" && (
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    {/* Header Row 1: Titles */}
                    <thead className="bg-[#eef5fc] border-b border-slate-300 text-slate-600 uppercase text-[9px] font-extrabold sticky top-0 z-10">
                      <tr>
                        <th className="px-2 py-2 text-center w-8">
                          <input
                            type="checkbox"
                            checked={
                              selectedInvoiceIds.length ===
                                filteredInvoices.length &&
                              filteredInvoices.length > 0
                            }
                            onChange={toggleSelectAllInvoices}
                            className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 cursor-pointer"
                          />
                        </th>
                        <th className="px-2.5 py-2">Company</th>
                        <th className="px-2.5 py-2">UHID</th>
                        <th className="px-2.5 py-2">Patient</th>
                        <th className="px-2.5 py-2">Enc. #</th>
                        <th className="px-2.5 py-2 text-center">Type</th>
                        <th className="px-2.5 py-2">Invoice#</th>
                        <th className="px-2.5 py-2">Date</th>
                        <th className="px-2.5 py-2 text-right">NetAmt</th>
                        <th className="px-2.5 py-2 text-right">Patient</th>
                        <th className="px-2.5 py-2 text-right">Payer</th>
                        <th className="px-2.5 py-2 text-right">Adjusted</th>
                        <th className="px-2.5 py-2 text-right">Refund</th>
                        <th className="px-2.5 py-2 text-right">Cr. Note</th>
                        <th className="px-2.5 py-2 text-right">Balance</th>
                        <th className="px-2.5 py-2 text-center">Status</th>
                        <th className="px-2.5 py-2 text-center">
                          Cancel / Actions
                        </th>
                      </tr>

                      {/* Header Row 2: In-Table Search Inputs (as in legacy reference screenshot) */}
                      <tr className="bg-white border-b border-slate-200">
                        <th className="px-1 py-1"></th>
                        <th className="px-1 py-1">
                          <Input
                            value={colFilterCompany}
                            onChange={(e) =>
                              setColFilterCompany(e.target.value)
                            }
                            placeholder="Filter..."
                            className="h-5 text-[10px] px-1 py-0 w-full bg-slate-50 border-slate-200"
                          />
                        </th>
                        <th className="px-1 py-1">
                          <Input
                            value={colFilterUhid}
                            onChange={(e) => setColFilterUhid(e.target.value)}
                            placeholder="Filter..."
                            className="h-5 text-[10px] px-1 py-0 w-full bg-slate-50 border-slate-200 font-mono"
                          />
                        </th>
                        <th className="px-1 py-1">
                          <Input
                            value={colFilterPatient}
                            onChange={(e) =>
                              setColFilterPatient(e.target.value)
                            }
                            placeholder="Filter..."
                            className="h-5 text-[10px] px-1 py-0 w-full bg-slate-50 border-slate-200"
                          />
                        </th>
                        <th className="px-1 py-1">
                          <Input
                            value={colFilterEnc}
                            onChange={(e) => setColFilterEnc(e.target.value)}
                            placeholder="Filter..."
                            className="h-5 text-[10px] px-1 py-0 w-full bg-slate-50 border-slate-200 font-mono"
                          />
                        </th>
                        <th className="px-1 py-1"></th>
                        <th className="px-1 py-1">
                          <Input
                            value={colFilterInvoiceNo}
                            onChange={(e) =>
                              setColFilterInvoiceNo(e.target.value)
                            }
                            placeholder="Filter..."
                            className="h-5 text-[10px] px-1 py-0 w-full bg-slate-50 border-slate-200 font-mono"
                          />
                        </th>
                        <th className="px-1 py-1"></th>
                        <th className="px-1 py-1"></th>
                        <th className="px-1 py-1"></th>
                        <th className="px-1 py-1"></th>
                        <th className="px-1 py-1"></th>
                        <th className="px-1 py-1"></th>
                        <th className="px-1 py-1"></th>
                        <th className="px-1 py-1"></th>
                        <th className="px-1 py-1"></th>
                        <th className="px-1 py-1"></th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {filteredInvoices.map((inv) => {
                        const isChecked = selectedInvoiceIds.includes(inv.id);
                        return (
                          <tr
                            key={inv.id}
                            className={`hover:bg-blue-50/40 transition-colors ${isChecked ? "bg-blue-50/60" : ""}`}
                          >
                            <td
                              className="px-2 py-2 text-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleSelectInvoice(inv.id)}
                                className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 cursor-pointer"
                              />
                            </td>
                            <td className="px-2.5 py-2 text-[10px] font-bold text-slate-600">
                              {inv.company}
                            </td>
                            <td className="px-2.5 py-2 font-mono text-blue-600 font-bold whitespace-nowrap">
                              <button
                                type="button"
                                className="hover:underline cursor-pointer"
                                title={inv.uhid}
                                onClick={() => {
                                  setOpBillingUhid(inv.uhid);
                                  setActiveTab("OP Billing");
                                }}
                              >
                                {inv.uhid}
                              </button>
                            </td>
                            <td className="px-2.5 py-2 font-bold text-slate-800">
                              {inv.patientName}
                            </td>
                            <td className="px-2.5 py-2 font-mono text-slate-500">
                              {inv.encNo || "-"}
                            </td>
                            <td className="px-2.5 py-2 text-center">
                              <Badge
                                variant="outline"
                                className={
                                  inv.type === "IP"
                                    ? "bg-purple-50 text-purple-700 border-purple-200 text-[10px]"
                                    : "bg-blue-50 text-blue-700 border-blue-200 text-[10px]"
                                }
                              >
                                {inv.type}
                              </Badge>
                            </td>
                            <td className="px-2.5 py-2 font-mono font-bold text-slate-800">
                              {inv.invoiceNo}
                            </td>
                            <td className="px-2.5 py-2 text-slate-500 font-mono">
                              {new Date(inv.date).toLocaleDateString("en-GB")}
                            </td>
                            <td className="px-2.5 py-2 text-right font-mono font-bold text-slate-900">
                              ₹{inv.netAmt.toFixed(2)}
                            </td>
                            <td className="px-2.5 py-2 text-right font-mono text-slate-700">
                              ₹
                              {(inv as any).patientPayable
                                ? (inv as any).patientPayable.toFixed(2)
                                : inv.company.includes("Insurance")
                                  ? "0.00"
                                  : inv.netAmt.toFixed(2)}
                            </td>
                            <td className="px-2.5 py-2 text-right font-mono text-slate-700">
                              ₹
                              {(inv as any).companyPayable
                                ? (inv as any).companyPayable.toFixed(2)
                                : inv.company.includes("Insurance")
                                  ? inv.netAmt.toFixed(2)
                                  : "0.00"}
                            </td>
                            <td className="px-2.5 py-2 text-right font-mono text-emerald-600 font-semibold">
                              ₹{inv.adjusted.toFixed(2)}
                            </td>
                            <td className="px-2.5 py-2 text-right font-mono text-amber-600 font-semibold">
                              ₹{inv.refund.toFixed(2)}
                            </td>
                            <td className="px-2.5 py-2 text-right font-mono text-purple-600 font-semibold">
                              ₹{inv.creditNote.toFixed(2)}
                            </td>
                            <td className="px-2.5 py-2 text-right font-mono font-black text-slate-900">
                              ₹{Math.abs(inv.balance).toFixed(2)}
                            </td>
                            <td className="px-2.5 py-2 text-center">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black ${
                                  inv.status === "Settled"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : inv.status === "Refundable"
                                      ? "bg-amber-100 text-amber-800"
                                      : inv.status === "Cancelled"
                                        ? "bg-slate-100 text-slate-600"
                                        : "bg-red-100 text-red-800"
                                }`}
                              >
                                {inv.status}
                              </span>
                            </td>
                            <td className="px-2.5 py-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                {inv.status !== "Settled" &&
                                  inv.status !== "Cancelled" && (
                                    <Button
                                      size="xs"
                                      className="h-5 px-1.5 text-[9px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                                      onClick={() => handleOpenSettlement(inv)}
                                    >
                                      Settle
                                    </Button>
                                  )}
                                <Button
                                  size="xs"
                                  variant="outline"
                                  className="h-5 w-5 p-0 text-slate-700 hover:bg-slate-100 border-slate-300 cursor-pointer"
                                  title="Print Invoice"
                                  onClick={() => setPrintInvoiceData(inv)}
                                >
                                  <Printer className="w-2.5 h-2.5" />
                                </Button>
                                {inv.status !== "Cancelled" && (
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    className="h-5 w-5 p-0 text-red-600 hover:bg-red-50 border-red-200 cursor-pointer"
                                    title="Cancel Invoice"
                                    onClick={() => handleCancelInvoice(inv.id)}
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {filteredInvoices.length === 0 && (
                        <tr>
                          <td
                            colSpan={17}
                            className="px-3 py-16 text-center text-red-600 font-bold text-xs"
                          >
                            No Record Found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SUBTAB 2: RECEIPT DETAILS */}
              {activeSubTab === "Receipt Details" && (
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#eef5fc] border-b border-slate-300 text-slate-600 uppercase text-[9px] font-extrabold sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-2.5">Receipt#</th>
                        <th className="px-3 py-2.5">Invoice#</th>
                        <th className="px-3 py-2.5">UHID</th>
                        <th className="px-3 py-2.5">Patient Name</th>
                        <th className="px-3 py-2.5">Enc#</th>
                        <th className="px-3 py-2.5">Date</th>
                        <th className="px-3 py-2.5">Mode</th>
                        <th className="px-3 py-2.5">Bank / Ref#</th>
                        <th className="px-3 py-2.5 text-right">Amount Paid</th>
                        <th className="px-3 py-2.5 text-center">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {allReceiptsList.map((rc) => (
                        <tr key={rc.id} className="hover:bg-slate-50">
                          <td className="px-3 py-2.5 font-mono font-bold text-blue-700">
                            {rc.receiptNo}
                          </td>
                          <td className="px-3 py-2.5 font-mono font-bold text-slate-800">
                            {rc.invoiceNo}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-blue-600">
                            {rc.uhid}
                          </td>
                          <td className="px-3 py-2.5 font-bold text-slate-800">
                            {rc.patientName}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-slate-500">
                            {rc.encNo}
                          </td>
                          <td className="px-3 py-2.5 text-slate-500 font-mono">
                            {new Date(rc.date).toLocaleDateString("en-GB")}
                          </td>
                          <td className="px-3 py-2.5 font-semibold text-slate-700">
                            {rc.mode}
                          </td>
                          <td className="px-3 py-2.5 text-slate-500 font-mono">
                            {rc.bankName || rc.refNo || "-"}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-black text-emerald-600">
                            ₹{rc.amount.toFixed(2)}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]"
                            >
                              {rc.type}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                      {allReceiptsList.length === 0 && (
                        <tr>
                          <td
                            colSpan={10}
                            className="px-3 py-16 text-center text-red-600 font-bold text-xs"
                          >
                            No Record Found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SUBTAB 3: ADVANCE DETAILS */}
              {activeSubTab === "Advance Details" && (
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#eef5fc] border-b border-slate-300 text-slate-600 uppercase text-[9px] font-extrabold sticky top-0 z-10">
                      <tr>
                        <th className="px-3 py-2.5">Advance Voucher#</th>
                        <th className="px-3 py-2.5">UHID</th>
                        <th className="px-3 py-2.5">Patient Name</th>
                        <th className="px-3 py-2.5">Enc#</th>
                        <th className="px-3 py-2.5">Date</th>
                        <th className="px-3 py-2.5 text-right">
                          Advance Amount
                        </th>
                        <th className="px-3 py-2.5 text-right">Adjusted</th>
                        <th className="px-3 py-2.5 text-right">Refund</th>
                        <th className="px-3 py-2.5 text-right">Balance</th>
                        <th className="px-3 py-2.5">Purpose</th>
                        <th className="px-3 py-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {ledgerAdvances.map((adv) => (
                        <tr key={adv.id} className="hover:bg-slate-50/50">
                          <td className="px-3 py-2.5 font-mono font-bold text-blue-700">
                            {adv.advanceNo}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-slate-600">
                            {adv.uhid}
                          </td>
                          <td className="px-3 py-2.5 font-bold text-slate-800">
                            {adv.patientName}
                          </td>
                          <td className="px-3 py-2.5 font-mono">
                            {adv.encNo || "-"}
                          </td>
                          <td className="px-3 py-2.5 text-slate-500">
                            {new Date(adv.createdAt).toLocaleDateString(
                              "en-GB",
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-bold">
                            ₹{adv.amount.toFixed(2)}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono text-emerald-600">
                            ₹{adv.adjustedAmount.toFixed(2)}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono text-amber-600">
                            ₹{adv.refundAmount.toFixed(2)}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-black text-slate-800">
                            ₹{adv.balanceAmount.toFixed(2)}
                          </td>
                          <td className="px-3 py-2.5 text-slate-600">
                            {adv.purpose}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <Badge
                              variant="outline"
                              className={
                                adv.status === "Active"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-slate-50 text-slate-600"
                              }
                            >
                              {adv.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                      {ledgerAdvances.length === 0 && (
                        <tr>
                          <td
                            colSpan={11}
                            className="px-3 py-16 text-center text-red-600 font-bold text-xs"
                          >
                            No Record Found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SUBTAB 4: SELECTED INVOICE */}
              {activeSubTab === "Selected Invoice" && (
                <div className="flex-1 overflow-auto p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">
                        Selected Invoices Summary
                      </h4>
                      <p className="text-xs text-slate-500">
                        Showing {selectedInvoicesList.length} checked invoice(s)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        disabled={selectedInvoicesList.length === 0}
                        onClick={() => {
                          if (selectedInvoicesList.length > 0) {
                            setPrintInvoiceData(selectedInvoicesList[0]);
                          }
                        }}
                        className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 mr-1" /> Print Selected
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedInvoiceIds([])}
                        className="h-7 text-xs cursor-pointer"
                      >
                        Deselect All
                      </Button>
                    </div>
                  </div>

                  <table className="w-full text-xs text-left border rounded-lg overflow-hidden">
                    <thead className="bg-slate-50 border-b text-slate-600 uppercase text-[9px] font-bold">
                      <tr>
                        <th className="px-3 py-2">Invoice#</th>
                        <th className="px-3 py-2">UHID</th>
                        <th className="px-3 py-2">Patient Name</th>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2 text-right">Net Amount</th>
                        <th className="px-3 py-2 text-right">Adjusted</th>
                        <th className="px-3 py-2 text-right">Balance</th>
                        <th className="px-3 py-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {selectedInvoicesList.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-mono font-bold text-blue-700">
                            {inv.invoiceNo}
                          </td>
                          <td className="px-3 py-2 font-mono">{inv.uhid}</td>
                          <td className="px-3 py-2 font-bold text-slate-800">
                            {inv.patientName}
                          </td>
                          <td className="px-3 py-2 font-mono text-slate-500">
                            {new Date(inv.date).toLocaleDateString("en-GB")}
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-bold">
                            ₹{inv.netAmt.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-emerald-600">
                            ₹{inv.adjusted.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-black text-slate-900">
                            ₹{Math.abs(inv.balance).toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-50 text-blue-700">
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {selectedInvoicesList.length === 0 && (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-3 py-12 text-center text-slate-400 font-bold"
                          >
                            No invoices currently selected. Check boxes in the
                            "Invoice Details" tab to select.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Table Footer & Legend Bar (Matching Legacy Bottom Right Badges) */}
              <div className="border-t border-slate-200 bg-slate-50/80 px-4 py-2 flex items-center justify-between text-xs flex-shrink-0">
                <div className="text-slate-500 font-semibold text-[11px]">
                  Showing{" "}
                  <span className="font-bold text-slate-800">
                    {filteredInvoices.length}
                  </span>{" "}
                  record(s)
                </div>
                <div className="flex items-center gap-2 font-bold text-[10px]">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-600 text-white font-bold tracking-wide shadow-2xs">
                    Settled
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-red-600 text-white font-bold tracking-wide shadow-2xs">
                    Outstanding
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-amber-500 text-white font-bold tracking-wide shadow-2xs">
                    Refundable
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* ─── TAB 3: CREATE OP VISIT ──────────────────────────────────────── */}
        {activeTab === "Create OP Visit" && (
          <Card className="flex-1 flex flex-col overflow-hidden border-slate-200/80 shadow-2xs">
            {/* Header bar */}
            <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-200 bg-[#cee6f8] text-xs font-bold text-slate-700 flex-shrink-0">
              <span className="text-sm font-bold text-slate-800">
                Create Outpatient (OP) Visit
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPatientSearchModalOpen(true)}
                  className="font-bold text-blue-800 hover:text-blue-950 hover:underline cursor-pointer text-xs flex items-center gap-1 bg-blue-100/80 hover:bg-blue-100 px-2.5 py-1 rounded-md border border-blue-300 shadow-2xs transition-all"
                  title="Click to search patient census"
                >
                  <Search className="w-3 h-3 text-blue-600" />
                  <span>Patient UHID:</span>
                </button>
                <div className="flex items-center gap-1 bg-white rounded-md border border-slate-300 px-2 py-0.5 shadow-2xs hover:border-blue-400 focus-within:border-blue-500">
                  <Input
                    type="text"
                    value={opUhid}
                    onChange={(e) => setOpUhid(e.target.value)}
                    onClick={() => {
                      if (!opUhid) setIsPatientSearchModalOpen(true);
                    }}
                    className="h-6 text-xs w-36 border-0 p-0 shadow-none font-mono font-bold cursor-pointer"
                    placeholder="Enter or select UHID..."
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 cursor-pointer"
                    onClick={() => setIsPatientSearchModalOpen(true)}
                    title="Open Patient Lookup Dialog"
                  >
                    <Search className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setOpUhid("");
                    setOpPatientName("");
                  }}
                  className="h-7 text-xs bg-white text-slate-700 border-slate-300 font-bold px-3"
                >
                  New
                </Button>
                <Button
                  onClick={handleSaveOpVisit}
                  size="sm"
                  className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-4"
                >
                  Save & Proceed to OP Bill
                </Button>
              </div>
            </div>

            {/* Form grid */}
            <div className="p-6 bg-white grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-y-auto">
              {/* Patient Details */}
              <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-white shadow-2xs">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wide flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" /> Patient
                    Details
                  </h4>
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    onClick={() => setIsPatientSearchModalOpen(true)}
                    className="h-6 px-2 text-[10px] font-bold text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
                  >
                    <Search className="w-3 h-3 mr-1" /> Select Patient
                  </Button>
                </div>

                <div className="flex flex-col items-center justify-center py-2 space-y-4">
                  <div
                    className={`w-24 h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center shadow-inner overflow-hidden p-2 text-center ${opVisitPatientInfo ? "border-blue-400 bg-blue-50/50 text-blue-800" : "border-blue-200 bg-blue-50/50 text-blue-500"}`}
                  >
                    {opVisitPatientInfo ? (
                      <>
                        {opVisitPatientInfo.image ? (
                          <img
                            src={opVisitPatientInfo.image}
                            alt={opVisitPatientInfo.name}
                            className="w-16 h-16 rounded-full object-cover shadow-sm"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                              const parent = (e.target as HTMLImageElement)
                                .parentElement!;
                              const nameInitials =
                                parent.querySelector(".initials-fallback");
                              if (nameInitials) {
                                (nameInitials as HTMLElement).style.display =
                                  "flex";
                              }
                            }}
                          />
                        ) : null}
                        <div
                          className="w-11 h-11 rounded-full bg-blue-600 text-white font-bold text-base flex items-center justify-center shadow-xs initials-fallback"
                          style={{
                            display: opVisitPatientInfo.image ? "none" : "flex",
                          }}
                        >
                          {opVisitPatientInfo.name.charAt(0)}
                        </div>
                        <span className="text-[10px] font-mono font-bold text-blue-800 mt-1 truncate max-w-[80px]">
                          {opUhid}
                        </span>
                      </>
                    ) : (
                      <>
                        <User className="w-10 h-10 text-blue-400/80" />
                        <span className="text-[9px] text-slate-400 mt-1">
                          No Patient
                        </span>
                      </>
                    )}
                  </div>

                  <div className="w-full space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">
                        Patient Name:
                      </span>
                      <Input
                        value={opPatientName || opVisitPatientInfo?.name || ""}
                        onChange={(e) => setOpPatientName(e.target.value)}
                        placeholder="Patient Full Name"
                        className="h-7 text-xs w-48 bg-white border-slate-200 font-bold text-right"
                      />
                    </div>

                    {opVisitPatientInfo && (
                      <>
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="text-slate-500 font-medium">
                            Gender / Age:
                          </span>
                          <span className="font-bold text-slate-800">
                            {opVisitPatientInfo.genderAge}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="text-slate-500 font-medium">
                            Mobile:
                          </span>
                          <span className="font-mono font-bold text-slate-800">
                            {opVisitPatientInfo.mobile || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="text-slate-500 font-medium">
                            Address:
                          </span>
                          <span className="font-medium text-slate-700 text-right truncate max-w-[150px]">
                            {opVisitPatientInfo.address}
                          </span>
                        </div>
                      </>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-500 font-medium">
                        Encounter State:
                      </span>
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="op-status"
                            value="Open"
                            checked={opStatus === "Open"}
                            onChange={() => setOpStatus("Open")}
                            className="h-3.5 w-3.5 text-blue-600"
                          />
                          <span>Open</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="op-status"
                            value="Closed"
                            checked={opStatus === "Closed"}
                            onChange={() => setOpStatus("Closed")}
                            className="h-3.5 w-3.5 text-blue-600"
                          />
                          <span>Closed</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payer Details */}
              <div className="border border-slate-200 rounded-xl p-5 space-y-3.5 bg-white shadow-2xs">
                <h4 className="text-xs font-bold text-blue-900 border-b pb-2 uppercase tracking-wide flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" /> Payer
                  Details
                </h4>
                <div className="space-y-3 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="w-20 text-slate-500">Payer Type:</span>
                    <Select value={opPayerType} onValueChange={setOpPayerType}>
                      <SelectTrigger className="h-7 text-xs flex-1 bg-white border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Direct Patient">
                          Direct Patient
                        </SelectItem>
                        <SelectItem value="Insurance">Insurance</SelectItem>
                        <SelectItem value="Corporate">Corporate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20 text-slate-500">Payer Name:</span>
                    <Input
                      value={opPayer}
                      onChange={(e) => setOpPayer(e.target.value)}
                      className="h-7 text-xs flex-1 bg-white border-slate-200"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20 text-slate-500">Sponsor:</span>
                    <Input
                      value={opSponsor}
                      onChange={(e) => setOpSponsor(e.target.value)}
                      className="h-7 text-xs flex-1 bg-white border-slate-200"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20 text-slate-500">Network:</span>
                    <Input
                      value={opNetwork}
                      onChange={(e) => setOpNetwork(e.target.value)}
                      className="h-7 text-xs flex-1 bg-white border-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Doctor Details */}
              <div className="border border-slate-200 rounded-xl p-5 space-y-3.5 bg-white shadow-2xs">
                <h4 className="text-xs font-bold text-blue-900 border-b pb-2 uppercase tracking-wide flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" /> Doctor &
                  Consultation
                </h4>
                <div className="space-y-3 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-slate-500">Doctor*:</span>
                    <Select
                      value={opDoctor}
                      onValueChange={(val) => {
                        if (val === "__CREATE_NEW_DOCTOR__") {
                          setDoctorTargetField("opDoctor");
                          setIsAddDoctorModalOpen(true);
                        } else {
                          setOpDoctor(val);
                        }
                      }}
                    >
                      <SelectTrigger className="h-7 text-xs flex-1 bg-white border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDoctors.map((doc) => (
                          <SelectItem key={doc} value={doc}>
                            {doc}
                          </SelectItem>
                        ))}
                        <SelectItem
                          value="__CREATE_NEW_DOCTOR__"
                          className="font-bold text-blue-600 bg-blue-50 border-t border-slate-100"
                        >
                          + Create New Doctor...
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-slate-500">Department:</span>
                    <Select
                      value={opDepartment}
                      onValueChange={setOpDepartment}
                    >
                      <SelectTrigger className="h-7 text-xs flex-1 bg-white border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General OPD">General OPD</SelectItem>
                        <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-slate-500">Visit Type:</span>
                    <Select
                      value={opVisitType}
                      onValueChange={(val: any) => setOpVisitType(val)}
                    >
                      <SelectTrigger className="h-7 text-xs flex-1 bg-white border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">New Consultation</SelectItem>
                        <SelectItem value="Follow-up">Follow-up</SelectItem>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-24 text-slate-500">Fee (₹):</span>
                    <Input
                      type="number"
                      value={opFee}
                      onChange={(e) => setOpFee(Number(e.target.value))}
                      className="h-7 text-xs flex-1 bg-white border-slate-200 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}



        {/* ─── TAB 5: OP BILLING ───────────────────────────────────────────── */}
        {activeTab === "OP Billing" && (
          <Card className="flex-1 flex flex-col overflow-hidden border-slate-200/80 shadow-2xs">
            {/* Header bar */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-[#cee6f8] text-xs font-bold text-slate-700 flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-800 whitespace-nowrap">
                  OP Invoice
                </span>
                {/* UHID field */}
                <div className="flex items-center gap-1 bg-white rounded border border-slate-300 px-1.5 py-0.5 shadow-2xs hover:border-blue-400 focus-within:border-blue-500">
                  <button
                    type="button"
                    onClick={() => setIsPatientSearchModalOpen(true)}
                    className="text-[10px] text-blue-700 font-bold hover:underline"
                  >
                    UHID
                  </button>
                  <Input
                    type="text"
                    value={opBillingUhid}
                    onChange={(e) => setOpBillingUhid(e.target.value)}
                    className="h-5 text-xs w-24 border-0 p-0 shadow-none font-mono font-bold"
                    placeholder="Enter UHID..."
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 text-slate-400"
                    onClick={() => setIsPatientSearchModalOpen(true)}
                  >
                    <Search className="h-3 w-3" />
                  </Button>
                </div>
                {/* Notes Button matching screenshot */}
                <Button
                  type="button"
                  onClick={() => {
                    if (!opBillingUhid.trim()) {
                      toast.error(
                        "No Patient Selected",
                        "Please select a patient (UHID) first to view or add notes.",
                      );
                      setIsPatientSearchModalOpen(true);
                      return;
                    }
                    setIsNotesModalOpen(true);
                  }}
                  className="h-5 text-[10px] bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 rounded shadow-xs cursor-pointer"
                >
                  Notes
                </Button>
                {/* Visit No */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-600 font-bold">
                    Visit No
                  </span>
                  <select
                    value={opBillingVisitNo}
                    onChange={(e) => setOpBillingVisitNo(e.target.value)}
                    className="h-6 px-1 text-xs border border-slate-300 rounded bg-white font-mono font-semibold text-slate-800 focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    {opBillingVisitOptions.map((vNo) => (
                      <option key={vNo} value={vNo}>
                        {vNo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setOpBillingUhid("");
                    setOpBillingVisitNo("1");
                    setOpBillingInvoiceNo("");
                    setOpBillingType("Cash");
                    setOpBillingPayerType("Direct Patient");
                    setOpBillingPayer("CASH");
                    setOpBillingSponsor("CASH");
                    setOpBillingNetwork("");
                    setOpBillingNarration("");
                    setOpBillingApprovalRequired(false);
                    setOpBillingExcludedService(false);
                    setOpBillingRefundedService(false);
                    setOpBillingAvailableDeposit(3000);
                    setOpBillingAppliedDeposit(0);
                    setOpBillingItems([DEFAULT_OPD_ITEM]);
                    setOpBillingPaymentRows([
                      {
                        mode: "Cash",
                        amount: 0,
                        balance: 0,
                        date: new Date().toLocaleDateString("en-GB"),
                        bankName: "",
                        beneficiaryName: "",
                        refNo: "",
                        description: "",
                        cardSwipingValue: 0,
                      },
                    ]);
                  }}
                  className="h-6 text-[11px] bg-white text-slate-700 border-slate-300 font-bold px-2"
                >
                  New
                </Button>
                <Button
                  onClick={() => handleSaveOpBilling(true)}
                  size="sm"
                  variant="outline"
                  className="h-6 text-[11px] bg-white text-slate-700 border-slate-300 font-bold px-2 gap-1"
                >
                  <Printer className="w-3 h-3" /> Print
                </Button>
                <Button
                  onClick={() => handleSaveOpBilling(false)}
                  size="sm"
                  className="h-6 text-[11px] bg-blue-600 hover:bg-blue-700 text-white font-bold px-3"
                >
                  Save
                </Button>
              </div>
            </div>

            {/* 4-Column Details — matching reference layout */}
            <div className="grid grid-cols-4 border-b border-slate-200 bg-white flex-shrink-0 text-[11px]">
              {/* Col 1: Patient Details (photo) */}
              <div className="border-r border-slate-200 p-2 space-y-1">
                <div className="font-bold text-slate-600 text-[10px] uppercase border-b border-slate-100 pb-0.5 mb-1">
                  Patient Details
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center flex-shrink-0 overflow-hidden ${opBillingPatientInfo ? "border-blue-400 bg-blue-50" : "border-slate-300 bg-slate-100"}`}
                  >
                    {opBillingPatientInfo?.image ? (
                      <img
                        src={opBillingPatientInfo.image}
                        alt={opBillingPatientInfo.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          (
                            e.target as HTMLImageElement
                          ).parentElement!.innerHTML =
                            `<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
                        }}
                      />
                    ) : (
                      // Scrubs hair-cap default placeholder avatar using SVG matching screenshot
                      <svg
                        viewBox="0 0 100 100"
                        className="w-12 h-12 text-slate-400"
                        fill="currentColor"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="#f1f5f9"
                          stroke="#cbd5e1"
                          strokeWidth="2"
                        />
                        {/* Scrubs head cap */}
                        <path
                          d="M25,45 C25,25 75,25 75,45 C75,48 25,48 25,45 Z"
                          fill="#94a3b8"
                        />
                        <circle cx="50" cy="38" r="10" fill="#94a3b8" />
                        {/* Face */}
                        <circle cx="50" cy="53" r="12" fill="#e2e8f0" />
                        <path
                          d="M38,53 C38,53 50,56 62,53"
                          fill="none"
                          stroke="#94a3b8"
                          strokeWidth="1.5"
                        />
                        {/* Neck & Shoulders */}
                        <path
                          d="M45,65 L55,65 L58,80 L42,80 Z"
                          fill="#cbd5e1"
                        />
                        <path
                          d="M30,80 L70,80 L65,95 L35,95 Z"
                          fill="#64748b"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    {opBillingPatientInfo ? (
                      <>
                        <div className="font-extrabold text-slate-800 truncate text-[11px]">
                          {opBillingPatientInfo.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {opBillingPatientInfo.genderAge}
                        </div>
                        <div className="text-[10px] text-blue-600 truncate">
                          {opBillingPatientInfo.address}
                        </div>
                      </>
                    ) : (
                      <div className="text-slate-400 italic text-[10px] py-2">
                        Select patient via UHID
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Col 2: Invoice Details */}
              <div className="border-r border-slate-200 p-2 space-y-1">
                <div className="font-bold text-slate-600 text-[10px] uppercase border-b border-slate-100 pb-0.5 mb-1">
                  Invoice Details
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 w-16 shrink-0 font-bold">
                    Year
                  </span>
                  <select
                    value={opBillingYear}
                    onChange={(e) => setOpBillingYear(e.target.value)}
                    className="flex-1 h-5 text-[10px] border border-slate-200 rounded bg-white px-1"
                  >
                    <option value="26-27">26-27</option>
                    <option value="25-26">25-26</option>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 w-16 shrink-0 font-bold">
                    Type
                  </span>
                  <select
                    value={opBillingType}
                    onChange={(e) => setOpBillingType(e.target.value)}
                    className="flex-1 h-5 text-[10px] border border-slate-200 rounded bg-white px-1"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Credit">Credit</option>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 w-16 shrink-0 text-blue-600 font-bold">
                    Invoice#
                  </span>
                  <Input
                    value={opBillingInvoiceNo}
                    onChange={(e) => setOpBillingInvoiceNo(e.target.value)}
                    placeholder=""
                    className="flex-1 h-5 text-[10px] px-1"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 w-16 shrink-0 font-bold">
                    Date
                  </span>
                  <Input
                    type="text"
                    value="22/08/2026 13:36"
                    readOnly
                    className="flex-1 h-5 text-[10px] px-1 bg-white cursor-not-allowed border-slate-200"
                  />
                </div>
              </div>

              {/* Col 3: Payer Details */}
              <div className="border-r border-slate-200 p-2 space-y-1">
                <div className="font-bold text-slate-600 text-[10px] uppercase border-b border-slate-100 pb-0.5 mb-1 flex justify-between items-center">
                  <span>Payer Details</span>
                  <span className="text-[9.5px] text-red-600 font-extrabold uppercase tracking-tight">
                    Payer validity : 31/12/2099
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 w-16 shrink-0 font-bold">
                    Type *
                  </span>
                  <select
                    value={opBillingPayerType}
                    onChange={(e) => setOpBillingPayerType(e.target.value)}
                    className="flex-1 h-5 text-[10px] border border-slate-200 rounded bg-white px-1"
                  >
                    <option>Direct Patient</option>
                    <option>Company</option>
                    <option>Insurance</option>
                    <option>TPA</option>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 w-16 shrink-0 font-bold">
                    Payer *
                  </span>
                  <select
                    value={opBillingPayer}
                    onChange={(e) => setOpBillingPayer(e.target.value)}
                    className="flex-1 h-5 text-[10px] border border-slate-200 rounded bg-white px-1"
                  >
                    <option>CASH</option>
                    <option>Star Health Insurance</option>
                    <option>HDFC ERGO Health</option>
                    <option>Niva Bupa</option>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 w-16 shrink-0 font-bold">
                    Sponsor *
                  </span>
                  <select
                    value={opBillingSponsor}
                    onChange={(e) => setOpBillingSponsor(e.target.value)}
                    className="flex-1 h-5 text-[10px] border border-slate-200 rounded bg-white px-1"
                  >
                    <option>CASH</option>
                    <option>Star Health</option>
                    <option>HDFC ERGO</option>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 w-16 shrink-0 font-bold">
                    Network
                  </span>
                  <select
                    value={opBillingNetwork}
                    onChange={(e) => setOpBillingNetwork(e.target.value)}
                    className="flex-1 h-5 text-[10px] border border-slate-200 rounded bg-white px-1"
                  >
                    <option value="">Select Network</option>
                    <option value="TPA Network">TPA Network</option>
                    <option value="Corporate Direct">Corporate Direct</option>
                  </select>
                </div>
              </div>

              {/* Col 4: Other Details */}
              <div className="p-2 space-y-1">
                <div className="font-bold text-slate-600 text-[10px] uppercase border-b border-slate-100 pb-0.5 mb-1 flex justify-between items-center">
                  <span>Other Details</span>
                  <div className="flex items-center gap-1">
                    {/* Render exact icons from screenshot */}
                    <svg
                      className="w-3.5 h-3.5 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <svg
                      className="w-3.5 h-3.5 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                      />
                    </svg>
                    <svg
                      className="w-3.5 h-3.5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 w-24 shrink-0 font-bold">
                    Prescribing Doctor *
                  </span>
                  <div className="flex-1 flex items-center gap-1">
                    <select
                      value={opBillingPrescribingDoctor}
                      onChange={(e) => {
                        if (e.target.value === "__CREATE_NEW_DOCTOR__") {
                          setDoctorTargetField("prescribing");
                          setIsAddDoctorModalOpen(true);
                        } else {
                          const doc = e.target.value;
                          setOpBillingPrescribingDoctor(doc);
                          setConsultationProvider(doc);
                          setOpBillingDoctor(doc);
                        }
                      }}
                      className="w-full h-5 text-[10px] border border-slate-200 rounded bg-white px-1 font-medium cursor-pointer"
                    >
                      <option value="">Select Doctor</option>
                      {availableDoctors.map((doc) => (
                        <option key={doc} value={doc}>
                          {doc}
                        </option>
                      ))}
                      <option
                        value="__CREATE_NEW_DOCTOR__"
                        className="font-bold text-blue-600 bg-blue-50"
                      >
                        + Create New Doctor...
                      </option>
                    </select>
                    <button
                      type="button"
                      title="Add New Doctor"
                      onClick={() => {
                        setDoctorTargetField("prescribing");
                        setIsAddDoctorModalOpen(true);
                      }}
                      className="h-5 w-5 shrink-0 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded flex items-center justify-center font-bold text-xs cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 w-24 shrink-0 font-bold">
                    Referred Type
                  </span>
                  <select
                    value={opBillingReferredType}
                    onChange={(e) => setOpBillingReferredType(e.target.value)}
                    className="flex-1 h-5 text-[10px] border border-slate-200 rounded bg-white px-1"
                  >
                    <option>SELF</option>
                    <option>Doctor</option>
                    <option>Hospital</option>
                    <option>Corporate</option>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 w-24 shrink-0 font-bold">
                    Referred by Name
                  </span>
                  <select
                    value={opBillingReferredName}
                    onChange={(e) => {
                      if (e.target.value === "__CREATE_NEW_DOCTOR__") {
                        setDoctorTargetField("prescribing");
                        setIsAddDoctorModalOpen(true);
                      } else {
                        setOpBillingReferredName(e.target.value);
                      }
                    }}
                    className="flex-1 h-5 text-[10px] border border-slate-200 rounded bg-white px-1 font-medium"
                  >
                    <option value="">Select</option>
                    {availableDoctors.map((doc) => (
                      <option key={doc} value={doc}>
                        {doc}
                      </option>
                    ))}
                    <option
                      value="__CREATE_NEW_DOCTOR__"
                      className="font-bold text-blue-600 bg-blue-50"
                    >
                      + Create New Doctor...
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sub-tab navigation */}
            <div className="flex items-center justify-between px-2 bg-[#cee6f8] border-b border-slate-200 flex-shrink-0">
              <div className="flex items-center gap-0.5 pt-1.5">
                {["Service", "Payment"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOpBillingSubTab(st)}
                    className={`h-7 px-3.5 text-[11px] font-bold border border-b-0 rounded-t transition-colors ${
                      opBillingSubTab === st
                        ? "bg-white text-blue-700 border-slate-300 font-extrabold"
                        : "bg-[#cee6f8]/60 text-slate-600 border-transparent hover:text-slate-800 hover:bg-[#cee6f8]"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5 py-1 flex-wrap">
                {/* Specialisation Select */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-600">Spec:</span>
                  <SearchableDropdown
                    value={consultationSpecialisation}
                    options={MEDICAL_SPECIALISATIONS}
                    onSelect={(spec) => {
                      setConsultationSpecialisation(spec);
                      if (spec === "All" || spec === "General" || spec === "General OPD") {
                        setConsultationVisitType("GENERAL OPD CONSULTATION");
                      } else {
                        setConsultationVisitType(`${spec.toUpperCase()} CONSULTATION`);
                      }
                    }}
                    placeholder="Select Specialisation..."
                    width="w-40"
                  />
                </div>

                {/* Provider Select */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-600">Provider:</span>
                  <SearchableDropdown
                    value={consultationProvider}
                    options={availableDoctors}
                    onSelect={(doc) => {
                      setConsultationProvider(doc);
                      setOpBillingPrescribingDoctor(doc);
                      setOpBillingDoctor(doc);
                    }}
                    placeholder="Select Provider..."
                    width="w-44"
                  />
                </div>
              </div>
            </div>

            {/* Sub-tab Content */}
            <div className="flex-1 overflow-auto bg-white">
              {opBillingSubTab === "Service" && (
                <div className="flex flex-col h-full">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gradient-to-r from-teal-600 to-teal-700 text-white font-bold uppercase text-[10px] sticky top-0 z-10">
                      <tr>
                        <th className="px-2 py-2 tracking-wider w-40">Dept</th>
                        <th className="px-2 py-2 tracking-wider">
                          Service Description
                        </th>
                        <th className="px-2 py-2 text-right tracking-wider w-24">
                          Rate (₹)
                        </th>
                        <th className="px-2 py-2 text-center tracking-wider w-16">
                          Qty
                        </th>
                        <th className="px-2 py-2 text-right tracking-wider w-28">
                          Net Amt (₹)
                        </th>
                        <th className="px-2 py-2 text-center w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {opBillingItems.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-10 text-center text-slate-500 bg-slate-50/40"
                          >
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <span className="text-xs font-semibold text-slate-600">
                                No service items added yet. Click below to add
                                OPD Consultation or choose from catalog.
                              </span>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() =>
                                  handleAddOpItem(SERVICE_CATALOG[0])
                                }
                                className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 gap-1 shadow-2xs"
                              >
                                + Add OPD Consultation Service
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        opBillingItems.map((it, idx) => {
                          const baseServices = it.dept
                            ? SERVICE_CATALOG.filter((s) => s.dept === it.dept)
                            : SERVICE_CATALOG;
                          const hasOthersOption = baseServices.some(
                            (s) => s.name === "Others" || s.name === "Other"
                          );
                          const filteredServices = hasOthersOption
                            ? baseServices
                            : [
                                ...baseServices,
                                {
                                  code: `OTH-${it.dept ? it.dept.replace(/\s+/g, "").toUpperCase().slice(0, 4) : "999"}`,
                                  name: "Others",
                                  dept: it.dept || "General OPD",
                                  rate: 0,
                                },
                              ];
                          const isOtherSelected =
                            it.name === "Others" ||
                            it.name === "Other" ||
                            (it.code && it.code.startsWith("OTH-"));

                          return (
                          <tr key={idx} className="hover:bg-teal-50/20">
                            <td className="px-2 py-1.5">
                              <SearchableDropdown
                                value={it.dept || ""}
                                options={ALL_DEPARTMENTS}
                                placeholder="Dept..."
                                width="w-36"
                                onSelect={(newDept) => {
                                  const updated = [...opBillingItems];
                                  const matchingServices = SERVICE_CATALOG.filter(
                                    (s) => s.dept === newDept
                                  );
                                  const firstService = matchingServices[0] || {
                                    code: `OTH-${newDept.replace(/\s+/g, "").toUpperCase().slice(0, 4)}`,
                                    name: "Others",
                                    dept: newDept,
                                    rate: 0,
                                  };
                                  const qty = updated[idx].qty || 1;
                                  const discPct =
                                    updated[idx].discountPercent || 0;
                                  const gross = firstService.rate * qty;
                                  const discAmt = (gross * discPct) / 100;
                                  updated[idx] = {
                                    ...updated[idx],
                                    code: firstService.code,
                                    name: firstService.name,
                                    dept: newDept,
                                    rate: firstService.rate,
                                    discountAmt: discAmt,
                                    netAmt: Math.max(0, gross - discAmt),
                                    remark: (firstService.name === "Others" || firstService.name === "Other") ? (updated[idx].remark || "") : undefined,
                                  };
                                  setOpBillingItems(updated);
                                }}
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <div className="space-y-1">
                                <SearchableServiceSelect
                                  value={it.name}
                                  options={filteredServices}
                                  onSelect={(found) => {
                                    const updated = [...opBillingItems];
                                    const qty = updated[idx].qty || 1;
                                    const discPct =
                                      updated[idx].discountPercent || 0;
                                    const rate = found.rate || 0;
                                    const gross = rate * qty;
                                    const discAmt = (gross * discPct) / 100;
                                    updated[idx] = {
                                      ...updated[idx],
                                      code: found.code,
                                      name: found.name,
                                      dept: found.dept || updated[idx].dept,
                                      rate: rate,
                                      discountAmt: discAmt,
                                      netAmt: Math.max(0, gross - discAmt),
                                      remark: (found.name === "Others" || found.name === "Other") ? (updated[idx].remark || "") : undefined,
                                    };
                                    // Auto-append a blank row if this was the last row
                                    if (idx === updated.length - 1) {
                                      updated.push({
                                        code: "",
                                        name: "",
                                        dept: "",
                                        rate: 0,
                                        qty: 1,
                                        discountPercent: 0,
                                        discountAmt: 0,
                                        netAmt: 0,
                                      });
                                    }
                                    setOpBillingItems(updated);
                                  }}
                                />
                                {isOtherSelected && (
                                  <Input
                                    type="text"
                                    placeholder="Type Custom / Other Service Details..."
                                    value={it.remark || ""}
                                    onChange={(e) => {
                                      const updated = [...opBillingItems];
                                      updated[idx].remark = e.target.value;
                                      setOpBillingItems(updated);
                                    }}
                                    className="h-6.5 text-[11px] bg-amber-50/90 border-amber-400 font-semibold text-amber-950 placeholder:text-amber-700/60 focus:bg-white focus:border-amber-600 shadow-2xs transition-colors"
                                  />
                                )}
                              </div>
                            </td>
                            <td className="px-2 py-1.5 text-right">
                              <Input
                                type="number"
                                value={it.rate}
                                onChange={(e) =>
                                  handleUpdateOpItem(
                                    idx,
                                    "rate",
                                    Number(e.target.value),
                                  )
                                }
                                className={`h-6 w-full text-xs text-right font-mono font-bold transition-colors ${
                                  isOtherSelected
                                    ? "bg-amber-50/90 border-amber-400 text-amber-950 focus:bg-white focus:border-amber-600 ring-1 ring-amber-200"
                                    : "bg-white text-slate-900 border-slate-200"
                                }`}
                              />
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              <Input
                                type="number"
                                value={it.qty}
                                onChange={(e) =>
                                  handleUpdateOpItem(
                                    idx,
                                    "qty",
                                    Number(e.target.value),
                                  )
                                }
                                className="h-6 w-full text-xs text-center bg-white font-mono"
                              />
                            </td>
                            <td className="px-2 py-1.5 text-right font-mono font-bold text-slate-900">
                              ₹{it.netAmt?.toFixed(2)}
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              <button
                                onClick={() => handleRemoveOpItem(idx)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                      )}
                    </tbody>
                  </table>
                  <div className="p-2 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddOpItem(SERVICE_CATALOG[0])}
                      className="h-6 text-[10px] font-bold text-blue-700 border-blue-300 hover:bg-blue-50 gap-1"
                    >
                      + Add New Service Row
                    </Button>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {opBillingItems.length} service item(s) selected
                    </span>
                  </div>
                </div>
              )}

              {opBillingSubTab === "Payment" && (
                <div className="p-3 space-y-3">
                  {/* Payment Table */}
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-gradient-to-r from-teal-600 to-teal-700 text-white font-bold uppercase text-[10px]">
                        <tr>
                          <th className="px-2 py-2 tracking-wider">Mode</th>
                          <th className="px-2 py-2 text-right tracking-wider">
                            Amount
                          </th>
                          <th className="px-2 py-2 text-right tracking-wider">
                            Balance
                          </th>
                          <th className="px-2 py-2 tracking-wider">
                            Date (dd/MM/YYYY)
                          </th>
                          <th className="px-2 py-2 tracking-wider">
                            Bank Name
                          </th>
                          <th className="px-2 py-2 tracking-wider">
                            Beneficiary Name
                          </th>
                          <th className="px-2 py-2 tracking-wider">
                            Reference No
                          </th>
                          <th className="px-2 py-2 tracking-wider">
                            Card Holder / Description
                          </th>
                          <th className="px-2 py-2 text-right tracking-wider">
                            Card Swiping Value
                          </th>
                          <th className="px-2 py-2 w-8"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {opBillingPaymentRows.map((r, idx) => {
                          const cumulativePaid = opBillingPaymentRows
                            .slice(0, idx + 1)
                            .reduce(
                              (sum, row) => sum + Number(row.amount || 0),
                              0,
                            );
                          const rawBalance = opNetPayable - cumulativePaid;
                          const rowBalance = rawBalance.toFixed(2);
                          const isCash = r.mode === "Cash";
                          const isCard =
                            r.mode === "Credit Card" || r.mode === "Debit Card";
                          return (
                            <tr key={idx} className="hover:bg-teal-50/20">
                              <td className="px-2 py-1.5">
                                <select
                                  value={r.mode}
                                  onChange={(e) => {
                                    const u = [...opBillingPaymentRows];
                                    const newMode = e.target.value;
                                    u[idx].mode = newMode;
                                    if (newMode === "Cash") {
                                      u[idx].bankName = "";
                                      u[idx].beneficiaryName = "";
                                      u[idx].refNo = "";
                                      u[idx].description = "";
                                      u[idx].cardSwipingValue = 0;
                                    } else if (
                                      newMode === "Credit Card" ||
                                      newMode === "Debit Card"
                                    ) {
                                      u[idx].cardSwipingValue = u[idx].amount;
                                    }
                                    setOpBillingPaymentRows(u);
                                  }}
                                  className="h-6 w-28 text-[11px] border border-slate-200 rounded bg-white px-1 font-medium text-slate-800"
                                >
                                  <option value="Cash">Cash</option>
                                  <option value="Cheque/DD">Cheque/DD</option>
                                  <option value="Credit Card">
                                    Credit Card
                                  </option>
                                  <option value="Debit Card">Debit Card</option>
                                  <option value="NEFT/RTGS">NEFT/RTGS</option>
                                  <option value="Foreign Receipt">
                                    Foreign Receipt
                                  </option>
                                  <option value="Paytm">Paytm</option>
                                  <option value="On Line Payment">
                                    On Line Payment
                                  </option>
                                </select>
                              </td>
                              <td className="px-2 py-1.5 text-right">
                                <Input
                                  type="number"
                                  min="0"
                                  value={r.amount}
                                  onChange={(e) => {
                                    const u = [...opBillingPaymentRows];
                                    const val = Number(e.target.value);
                                    const cleanVal =
                                      isNaN(val) || val < 0 ? 0 : val;
                                    u[idx].amount = cleanVal;
                                    if (
                                      u[idx].mode === "Credit Card" ||
                                      u[idx].mode === "Debit Card"
                                    ) {
                                      u[idx].cardSwipingValue = cleanVal;
                                    }
                                    setOpBillingPaymentRows(u);
                                  }}
                                  className="h-6 w-20 text-[11px] text-right font-mono font-bold"
                                />
                              </td>
                              <td className="px-2 py-1.5 text-right">
                                <Input
                                  type="text"
                                  readOnly
                                  tabIndex={-1}
                                  value={rowBalance}
                                  className="h-6 w-20 text-[11px] text-right font-mono bg-slate-100/80 cursor-not-allowed text-slate-600 font-semibold border-slate-200 select-none focus-visible:ring-0"
                                />
                              </td>
                              <td className="px-2 py-1.5">
                                <Input
                                  type="date"
                                  value={
                                    r.date && r.date.includes("/")
                                      ? r.date.split("/").reverse().join("-")
                                      : r.date ||
                                        new Date().toISOString().split("T")[0]
                                  }
                                  onChange={(e) => {
                                    const u = [...opBillingPaymentRows];
                                    u[idx].date = e.target.value;
                                    setOpBillingPaymentRows(u);
                                  }}
                                  className="h-6 w-28 text-[10px] font-mono cursor-pointer bg-white"
                                />
                              </td>
                              <td className="px-2 py-1.5">
                                <select
                                  disabled={isCash}
                                  value={isCash ? "" : r.bankName}
                                  onChange={(e) => {
                                    const u = [...opBillingPaymentRows];
                                    u[idx].bankName = e.target.value;
                                    setOpBillingPaymentRows(u);
                                  }}
                                  className={`h-6 w-28 text-[11px] border border-slate-200 rounded px-1 transition-colors ${
                                    isCash
                                      ? "bg-slate-100/80 text-slate-400 cursor-not-allowed border-slate-200 select-none"
                                      : "bg-white text-slate-800 font-medium focus:ring-1 focus:ring-teal-500"
                                  }`}
                                >
                                  <option value="">{isCash ? "-" : "-Select-"}</option>
                                  <option value="SBI">SBI</option>
                                  <option value="HDFC">HDFC</option>
                                  <option value="ICICI">ICICI</option>
                                  <option value="Axis">Axis</option>
                                  <option value="Kotak">Kotak</option>
                                  <option value="PNB">PNB</option>
                                  <option value="BOB">BOB</option>
                                  <option value="Other Bank">Other Bank</option>
                                </select>
                              </td>
                              <td className="px-2 py-1.5">
                                <select
                                  disabled={isCash}
                                  value={isCash ? "" : r.beneficiaryName}
                                  onChange={(e) => {
                                    const u = [...opBillingPaymentRows];
                                    u[idx].beneficiaryName = e.target.value;
                                    setOpBillingPaymentRows(u);
                                  }}
                                  className={`h-6 w-28 text-[11px] border border-slate-200 rounded px-1 transition-colors ${
                                    isCash
                                      ? "bg-slate-100/80 text-slate-400 cursor-not-allowed border-slate-200 select-none"
                                      : "bg-white text-slate-800 font-medium focus:ring-1 focus:ring-teal-500"
                                  }`}
                                >
                                  <option value="">{isCash ? "-" : "-Select-"}</option>
                                  <option value="Self">Self</option>
                                  <option value="Relative">Relative</option>
                                  <option value="Corporate">Corporate</option>
                                  <option value="Hospital Account">Hospital Account</option>
                                </select>
                              </td>
                              <td className="px-2 py-1.5">
                                <Input
                                  disabled={isCash}
                                  value={isCash ? "" : r.refNo}
                                  onChange={(e) => {
                                    const u = [...opBillingPaymentRows];
                                    u[idx].refNo = e.target.value;
                                    setOpBillingPaymentRows(u);
                                  }}
                                  placeholder={isCash ? "-" : "Ref# / Txn ID"}
                                  className={`h-6 w-24 text-[11px] font-mono transition-colors ${
                                    isCash
                                      ? "bg-slate-100/80 text-slate-400 cursor-not-allowed border-slate-200 select-none"
                                      : "bg-white text-slate-800 font-medium"
                                  }`}
                                />
                              </td>
                              <td className="px-2 py-1.5">
                                <Input
                                  disabled={isCash}
                                  value={isCash ? "" : r.description}
                                  onChange={(e) => {
                                    const u = [...opBillingPaymentRows];
                                    u[idx].description = e.target.value;
                                    setOpBillingPaymentRows(u);
                                  }}
                                  placeholder={isCash ? "-" : "Holder / Description..."}
                                  className={`h-6 w-32 text-[11px] transition-colors ${
                                    isCash
                                      ? "bg-slate-100/80 text-slate-400 cursor-not-allowed border-slate-200 select-none"
                                      : "bg-white text-slate-800 font-medium"
                                  }`}
                                />
                              </td>
                              <td className="px-2 py-1.5 text-right">
                                <Input
                                  type="number"
                                  min="0"
                                  disabled={!isCard}
                                  value={!isCard ? 0 : r.cardSwipingValue}
                                  onChange={(e) => {
                                    const u = [...opBillingPaymentRows];
                                    const val = Number(e.target.value);
                                    u[idx].cardSwipingValue =
                                      isNaN(val) || val < 0 ? 0 : val;
                                    setOpBillingPaymentRows(u);
                                  }}
                                  className={`h-6 w-16 text-[11px] text-right font-mono transition-colors ${
                                    !isCard
                                      ? "bg-slate-100/80 text-slate-400 cursor-not-allowed border-slate-200 select-none"
                                      : "bg-white text-slate-800 font-bold"
                                  }`}
                                />
                              </td>
                              <td className="px-2 py-1.5">
                                <button
                                  onClick={() =>
                                    setOpBillingPaymentRows(
                                      opBillingPaymentRows.filter(
                                        (_, i) => i !== idx,
                                      ),
                                    )
                                  }
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Add Row */}
                  <button
                    onClick={() =>
                      setOpBillingPaymentRows([
                        ...opBillingPaymentRows,
                        {
                          mode: "Cash",
                          amount: 0,
                          balance: 0,
                          date: new Date().toLocaleDateString("en-GB"),
                          bankName: "",
                          beneficiaryName: "",
                          refNo: "",
                          description: "",
                          cardSwipingValue: 0,
                        },
                      ])
                    }
                    className="text-[11px] text-blue-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Row
                  </button>

                  {/* Consultant Change Remarks */}
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                    <span className="whitespace-nowrap">
                      Consultant Change Remarks
                    </span>
                    <Input
                      placeholder="Enter remarks..."
                      className="flex-1 h-6 text-[11px]"
                    />
                  </div>
                </div>
              )}

              {opBillingSubTab === "Checklist" && (
                <div className="p-4 text-xs text-slate-500 italic">
                  Checklist items will appear here once configured.
                </div>
              )}

              {opBillingSubTab === "Patient Diagnosis Entry" && (
                <div className="p-4 space-y-3">
                  <div className="text-xs font-bold text-slate-700">
                    Patient Diagnosis Entry
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">
                        Primary Diagnosis (ICD-10)
                      </label>
                      <Input
                        placeholder="Enter diagnosis code or description..."
                        className="text-xs h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">
                        Secondary Diagnosis
                      </label>
                      <Input
                        placeholder="Secondary diagnosis..."
                        className="text-xs h-8"
                      />
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className="text-[11px] font-semibold text-slate-600">
                        Clinical Notes
                      </label>
                      <textarea
                        placeholder="Clinical findings and notes..."
                        className="w-full h-20 text-xs p-2 border border-slate-200 rounded-lg resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {opBillingSubTab === "Adjustment" && (
                <div className="p-4 space-y-3">
                  <div className="text-xs font-bold text-slate-700">
                    Patient Deposit Adjustments
                  </div>
                  <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-3">
                    <div className="flex items-center justify-between font-bold text-blue-900">
                      <span>
                        Available Deposit for UHID {opBillingUhid || "—"}:
                      </span>
                      <span
                        className={`font-mono text-base ${opBillingAvailableDeposit === 0 ? "text-slate-400 font-normal" : "text-blue-900 font-bold"}`}
                      >
                        ₹{opBillingAvailableDeposit.toFixed(2)}
                      </span>
                    </div>

                    {opBillingAppliedDeposit > 0 && (
                      <div className="flex items-center justify-between font-semibold text-emerald-800 text-[11px] bg-emerald-50 border border-emerald-200 rounded px-2.5 py-1.5">
                        <span>Applied Credit on Current Invoice:</span>
                        <span className="font-mono font-bold">
                          ₹{opBillingAppliedDeposit.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        disabled={
                          opBillingAvailableDeposit <= 0 || opNetPayable <= 0
                        }
                        onClick={() => {
                          if (opBillingAvailableDeposit <= 0) {
                            toast.error(
                              "No Available Deposit",
                              "Patient has no available deposit balance.",
                            );
                            return;
                          }
                          const amountToApply = Math.min(
                            opBillingAvailableDeposit,
                            opNetPayable,
                          );
                          const remaining =
                            opBillingAvailableDeposit - amountToApply;
                          setOpBillingAvailableDeposit(remaining);
                          setOpBillingAppliedDeposit(
                            (prev) => prev + amountToApply,
                          );
                          setOpBillingPaymentRows([
                            {
                              mode: "Advance Deposit",
                              amount: amountToApply,
                              balance: 0,
                              date: new Date().toLocaleDateString("en-GB"),
                              bankName: "",
                              beneficiaryName: "",
                              refNo: "ADJUST-DEP",
                              description: `Adjusted from Advance Deposit (Remaining: ₹${remaining.toFixed(2)})`,
                              cardSwipingValue: 0,
                            },
                          ]);
                          toast.success(
                            "Deposit Adjusted",
                            `Applied ₹${amountToApply.toFixed(2)} credit to bill. Remaining Deposit: ₹${remaining.toFixed(2)}.`,
                          );
                        }}
                        className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-300 disabled:text-slate-500"
                      >
                        Apply Available Deposit to Bill
                      </Button>

                      {opBillingAppliedDeposit > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setOpBillingAvailableDeposit(
                              (prev) => prev + opBillingAppliedDeposit,
                            );
                            setOpBillingAppliedDeposit(0);
                            setOpBillingPaymentRows([
                              {
                                mode: "Cash",
                                amount: 0,
                                balance: 0,
                                date: new Date().toLocaleDateString("en-GB"),
                                bankName: "",
                                beneficiaryName: "",
                                refNo: "",
                                description: "",
                                cardSwipingValue: 0,
                              },
                            ]);
                            toast.info(
                              "Deposit Reverted",
                              "Restored patient's advance deposit balance.",
                            );
                          }}
                          className="text-xs font-bold border-slate-300 text-slate-700 hover:bg-slate-100"
                        >
                          Revert / Reset Adjustment
                        </Button>
                      )}
                    </div>

                    {opBillingAvailableDeposit === 0 &&
                      opBillingAppliedDeposit === 0 && (
                        <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded p-2.5 flex items-center justify-between">
                          <span>
                            No active advance deposit collected for this
                            patient.
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (opBillingUhid) setAdvUhid(opBillingUhid);
                              setActiveTab("Advance Collection");
                            }}
                            className="h-5 text-[10px] font-bold border-amber-300 text-amber-800 hover:bg-amber-100"
                          >
                            + Collect Deposit
                          </Button>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {opBillingSubTab === "Outstanding" && (
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-700">
                      Previous Invoices & Balance History
                    </div>
                    {opPatientOutstandingInvoices.length > 0 && (
                      <Badge className="bg-red-100 text-red-700 border-red-200">
                        {opPatientOutstandingInvoices.length} Outstanding
                        Bill(s) Found
                      </Badge>
                    )}
                  </div>

                  {opPatientOutstandingInvoices.length === 0 ? (
                    <div className="border rounded-lg p-4 bg-slate-50 text-xs text-slate-600">
                      No overdue unpaid invoices for this patient. Account is
                      clean.
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden bg-white shadow-2xs">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="px-3 py-2">Invoice #</th>
                            <th className="px-3 py-2">Date</th>
                            <th className="px-3 py-2">Company / Payer</th>
                            <th className="px-3 py-2 text-right">Net Amount</th>
                            <th className="px-3 py-2 text-right">
                              Paid Amount
                            </th>
                            <th className="px-3 py-2 text-right text-red-600">
                              Outstanding Balance
                            </th>
                            <th className="px-3 py-2 text-center">Status</th>
                            <th className="px-3 py-2 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {opPatientOutstandingInvoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-slate-50">
                              <td className="px-3 py-2 font-mono font-bold text-blue-600">
                                {inv.invoiceNo}
                              </td>
                              <td className="px-3 py-2 text-slate-500">
                                {new Date(inv.date).toLocaleDateString("en-GB")}
                              </td>
                              <td className="px-3 py-2">{inv.company}</td>
                              <td className="px-3 py-2 text-right font-mono">
                                ₹{inv.netAmt.toFixed(2)}
                              </td>
                              <td className="px-3 py-2 text-right font-mono text-emerald-600">
                                ₹{(inv.netAmt - inv.balance).toFixed(2)}
                              </td>
                              <td className="px-3 py-2 text-right font-mono font-bold text-red-600">
                                ₹{inv.balance.toFixed(2)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">
                                  {inv.status}
                                </Badge>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <Button
                                  size="sm"
                                  onClick={() => handleOpenSettlement(inv)}
                                  className="h-6 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white px-2 font-bold"
                                >
                                  Settle Bill
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Summary Bar — matching reference layout exactly */}
            <div className="border-t border-slate-200 bg-[#cee6f8] flex-shrink-0 text-[11px]">
              {/* Row 1: Treatment/Available Limit and Advance/Outstanding */}
              <div className="flex items-center gap-4 bg-[#cee6f8] px-3 py-1 text-slate-700 font-bold border-b border-slate-300 text-[11.5px]">
                <div className="flex items-center justify-between w-[48%] border-r border-slate-300 pr-4">
                  <span>Treatment / Available Limit</span>
                  <span className="font-mono">: 0.00 / 0.00</span>
                </div>
                <div className="flex items-center justify-between w-[48%]">
                  <span>Advance / Outstanding</span>
                  <span className="font-mono">: 0.00 / 0.00</span>
                </div>
              </div>

              {/* Row 2: Narration, Actions and Inputs aligned to match screenshot */}
              <div className="flex bg-[#cee6f8] border-b border-slate-200">
                {/* Left side: Narration + Buttons + Reporting + PAN */}
                <div className="w-[65%] p-2.5 flex flex-col justify-between space-y-2 border-r border-slate-300">
                  <div className="space-y-1">
                    <span className="text-slate-700 font-bold text-[10px]">
                      Narration
                    </span>
                    <textarea
                      value={opBillingNarration}
                      onChange={(e) => setOpBillingNarration(e.target.value)}
                      placeholder=""
                      className="w-full h-11 text-[11px] p-1.5 bg-white border border-slate-300 rounded resize-none focus:outline-none focus:border-blue-400 shadow-inner"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    {/* Buttons styling matches screenshot */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setOpBillingApprovalRequired(
                            !opBillingApprovalRequired,
                          )
                        }
                        className={`px-2 py-0.5 text-[10px] font-bold rounded border transition-colors ${
                          opBillingApprovalRequired
                            ? "bg-red-500 text-white border-red-600"
                            : "bg-red-100/80 border border-red-400 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        Approval Required
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setOpBillingExcludedService(!opBillingExcludedService)
                        }
                        className={`px-2 py-0.5 text-[10px] font-bold rounded border transition-colors ${
                          opBillingExcludedService
                            ? "bg-amber-500 text-white border-amber-600"
                            : "bg-amber-50 border border-amber-400 text-blue-800 hover:bg-amber-100"
                        }`}
                      >
                        Excluded Service
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setOpBillingRefundedService(!opBillingRefundedService)
                        }
                        className={`px-2 py-0.5 text-[10px] font-bold rounded border transition-colors ${
                          opBillingRefundedService
                            ? "bg-teal-500 text-white border-teal-600"
                            : "bg-emerald-50 border border-emerald-400 text-blue-800 hover:bg-emerald-100"
                        }`}
                      >
                        Refunded Service
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-700 font-bold text-[10px]">
                        Reporting DateTime
                      </span>
                      <div className="flex items-center bg-white border border-slate-300 rounded px-1.5 h-5 hover:border-blue-400">
                        <input
                          type="text"
                          value={
                            opBillingReportingDateTime || "22/08/2026 00:00"
                          }
                          onChange={(e) =>
                            setOpBillingReportingDateTime(e.target.value)
                          }
                          className="h-4 text-[10px] w-28 border-0 p-0 shadow-none focus:ring-0 font-mono"
                        />
                        <span
                          className="text-slate-400 text-[10px] cursor-pointer"
                          title="Select date-time"
                        >
                          🕒
                        </span>
                      </div>

                      <span className="text-slate-700 font-bold text-[10px]">
                        PAN No.
                      </span>
                      <input
                        type="text"
                        value={opBillingPanNo}
                        onChange={(e) => setOpBillingPanNo(e.target.value)}
                        className="w-16 h-5 text-[10px] px-1 border border-slate-300 rounded bg-white font-mono text-center"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-1 text-[10px] font-bold text-slate-700 cursor-pointer w-fit">
                    <input
                      type="checkbox"
                      checked={opBillingEmailResult}
                      onChange={(e) =>
                        setOpBillingEmailResult(e.target.checked)
                      }
                      className="mr-1 accent-blue-600 w-3 h-3"
                    />
                    E-mail Result
                  </label>
                </div>

                {/* Right side: Two columns of input fields matching screenshot exactly */}
                <div className="w-[35%] grid grid-cols-2 gap-x-4 gap-y-1.5 p-2.5 bg-[#cee6f8]">
                  {/* Left Column (Currency, Received, Rate, Conv.Amt, Charge, Discount) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 text-[10px] font-bold">
                        Currency
                      </span>
                      <select className="h-5 w-20 text-[10px] border border-slate-300 rounded bg-white px-1 text-right">
                        <option>INR</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 text-[10px] font-bold">
                        Received
                      </span>
                      <input
                        type="text"
                        value={opTotalPaid.toFixed(2)}
                        readOnly
                        className="h-5 w-20 text-[10px] text-right border border-slate-300 bg-white px-1 rounded font-mono"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 text-[10px] font-bold">
                        Rate
                      </span>
                      <input
                        type="text"
                        value="1.00"
                        readOnly
                        className="h-5 w-20 text-[10px] text-right border border-slate-300 bg-white px-1 rounded font-mono"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 text-[10px] font-bold">
                        Conv.Amt
                      </span>
                      <input
                        type="text"
                        value="0.00"
                        readOnly
                        className="h-5 w-20 text-[10px] text-right border border-slate-300 bg-white px-1 rounded font-mono"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 text-[10px] font-bold">
                        Charge
                      </span>
                      <input
                        type="text"
                        value="0.00"
                        readOnly
                        className="h-5 w-20 text-[10px] text-right border border-slate-300 bg-white px-1 rounded font-mono"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 text-[10px] font-bold">
                        Discount
                      </span>
                      <input
                        type="text"
                        value={opDiscountTotal.toFixed(2)}
                        readOnly
                        className="h-5 w-20 text-[10px] text-right border border-slate-300 bg-white px-1 rounded font-mono"
                      />
                    </div>
                  </div>

                  {/* Right Column (Net Amt, Deductable Amt, Received, Advance, Balance) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 text-[10px] font-bold">
                        Net Amt
                      </span>
                      <input
                        type="text"
                        value={opNetPayable.toFixed(2)}
                        readOnly
                        className="h-5 w-20 text-[10px] text-right border border-slate-300 bg-white px-1 rounded font-mono font-bold"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 text-[10px] font-bold">
                        Deductable Amt
                      </span>
                      <input
                        type="text"
                        value="0.00"
                        readOnly
                        className="h-5 w-20 text-[10px] text-right border border-slate-300 bg-white px-1 rounded font-mono"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 text-[10px] font-bold">
                        Received
                      </span>
                      <input
                        type="text"
                        value={opTotalPaid.toFixed(2)}
                        readOnly
                        className="h-5 w-20 text-[10px] text-right border border-slate-300 bg-white px-1 rounded font-mono"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 text-[10px] font-bold">
                        Advance
                      </span>
                      <input
                        type="text"
                        value="0.00"
                        readOnly
                        className="h-5 w-20 text-[10px] text-right border border-slate-300 bg-white px-1 rounded font-mono"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 text-[10px] font-bold">
                        Balance
                      </span>
                      <input
                        type="text"
                        value={opBalance.toFixed(2)}
                        readOnly
                        className={`h-5 w-20 text-[10px] text-right border border-slate-300 bg-white px-1 rounded font-mono font-bold ${opBalance > 0 ? "text-red-600" : "text-emerald-600"}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* ─── TAB 6: IP BILLING (EXCEL SHEET MODE - BILL FOR SURGERY) ───────────── */}
        {activeTab === "IP Billing" && (
          <Card className="flex-1 flex flex-col overflow-hidden border-slate-200/80 shadow-2xs">
            {/* Top Action Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-[#cee6f8] text-xs font-bold text-slate-700 flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-slate-900">
                  IP Billing & Surgery Bill
                </span>
                {/* Search Bar */}
                <div className="flex items-center gap-1 bg-white rounded-md border border-slate-300 px-2 py-0.5 shadow-2xs">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-blue-600 hover:text-blue-800"
                    onClick={() => setIsPatientSearchModalOpen(true)}
                  >
                    <Search className="h-3.5 w-3.5" />
                  </Button>
                  <Input
                    type="text"
                    value={ipBillingUhid}
                    onChange={(e) => {
                      const val = e.target.value;
                      setIpBillingUhid(val);
                      const pat = findPatientByUhid(val);
                      if (pat) {
                        setIpPatientNameInput(pat.patientName);
                        if (pat.genderAge) setIpAgeSexInput(pat.genderAge);
                        if (pat.address) setIpAddressInput(pat.address);
                      }
                    }}
                    className="h-5 text-xs w-36 border-0 p-0 shadow-none font-mono font-bold focus-visible:ring-0"
                    placeholder="Enter UHID / Patient..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <Button
                  onClick={() => {
                    setIpBillingUhid("");
                    setIpPatientNameInput("");
                    setIpAgeSexInput("61/FEMALE");
                    setIpAddressInput("");
                    setIpCrNoInput("");
                    setIpAdmissionDateInput("13/04/2026");
                    setIpDischargeDateInput("18/04/2026");
                    setIpDischargeTimeInput("03:00 PM");
                    setIpRoomNoInput("311");
                    setIpConsultantDrInput("Dr. D K DAS");
                    setIpBillingPayer("CASH");
                    setIpDiscountAmtInput("");
                    setIpRemarks("");
                    setIpSurgeryItems([
                      { sNo: 1, name: "Registration Fee", qtyDesc: "", amount: "" },
                      { sNo: 2, name: "Room / Bed Charges (Per Day)", qtyDesc: "", amount: "" },
                      { sNo: 3, name: "Hospital Consumables Charges", qtyDesc: "", amount: "" },
                      { sNo: 4, name: "OT/Ward Consumable Charges", qtyDesc: "", amount: "" },
                      { sNo: 5, name: "Pathology Investigation", qtyDesc: "", amount: "" },
                      { sNo: 6, name: "Radiology Investigation", qtyDesc: "", amount: "" },
                      { sNo: 7, name: "Cardiology Investigation", qtyDesc: "", amount: "" },
                      { sNo: 8, name: "OT Charges", qtyDesc: "", amount: "" },
                      { sNo: 9, name: "ICU Charges", qtyDesc: "", amount: "" },
                      { sNo: 10, name: "Implant / Instrument Charges", qtyDesc: "", amount: "" },
                      { sNo: 11, name: "Surgeon's Fee", qtyDesc: "", amount: "" },
                      { sNo: 12, name: "Assistant Surgeon's Fee", qtyDesc: "", amount: "" },
                      { sNo: 13, name: "Anesthetist Charges", qtyDesc: "", amount: "" },
                      { sNo: 14, name: "Physiotherapy Charges", qtyDesc: "", amount: "" },
                      { sNo: 15, name: "Consultation Fee Different Speciality", qtyDesc: "", amount: "" },
                      { sNo: 16, name: "Miscellaneous /Other Charges", qtyDesc: "", amount: "" },
                    ]);
                  }}
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px] bg-white border-blue-200 text-blue-800 font-bold px-3 hover:bg-blue-50"
                >
                  New Bill
                </Button>
                <Button
                  onClick={() => handleSaveIpBilling(false)}
                  size="sm"
                  className="h-6 text-[10px] bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 shadow-sm"
                >
                  Save Bill
                </Button>
                <Button
                  onClick={() => handleSaveIpBilling(true)}
                  size="sm"
                  className="h-6 text-[10px] bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 shadow-sm flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Bill
                </Button>
              </div>
            </div>

            {/* Main Sheet Container */}
            <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-5">
              <div className="bg-white rounded-xl shadow-sm border border-slate-300 w-full p-5 space-y-5 text-xs">
                
                {/* Sheet Title */}
                <div className="text-center border-b pb-2">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                    BILL FOR SURGERY (INPATIENT EXCEL SHEET MODE)
                  </h2>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Pre-populated with standard 16 hospital surgery charges. Enter quantity details and amounts directly.
                  </p>
                </div>

                {/* Patient & Admission Info Metadata Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 bg-slate-50/90 p-4 rounded-lg border border-slate-200 text-[11px]">
                  {/* Column 1 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 w-28 shrink-0">Patient Name:</span>
                      <input
                        type="text"
                        value={ipPatientNameInput}
                        onChange={(e) => setIpPatientNameInput(e.target.value)}
                        className="flex-1 h-7 bg-white border border-slate-300 rounded px-2.5 font-bold text-slate-900 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
                        placeholder="e.g. MRS SUMITRA DAS"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 w-28 shrink-0">Age / Sex:</span>
                      <input
                        type="text"
                        value={ipAgeSexInput}
                        onChange={(e) => setIpAgeSexInput(e.target.value)}
                        className="flex-1 h-7 bg-white border border-slate-300 rounded px-2.5 font-semibold text-slate-800 text-xs shadow-2xs"
                        placeholder="e.g. 61/FEMALE"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 w-28 shrink-0">C.R. No / UHID:</span>
                      <input
                        type="text"
                        value={ipCrNoInput || ipBillingUhid}
                        onChange={(e) => {
                          setIpCrNoInput(e.target.value);
                          setIpBillingUhid(e.target.value);
                        }}
                        className="flex-1 h-7 bg-white border border-slate-300 rounded px-2.5 font-mono font-bold text-blue-700 text-xs shadow-2xs"
                        placeholder="e.g. 26/543"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 w-28 shrink-0">Payer Category:</span>
                      <input
                        type="text"
                        value={ipBillingPayer}
                        onChange={(e) => setIpBillingPayer(e.target.value)}
                        className="flex-1 h-7 bg-white border border-slate-300 rounded px-2.5 font-semibold text-slate-800 text-xs shadow-2xs"
                        placeholder="e.g. CASH"
                      />
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 w-32 shrink-0">Admission Date:</span>
                      <input
                        type="text"
                        value={ipAdmissionDateInput}
                        onChange={(e) => setIpAdmissionDateInput(e.target.value)}
                        className="flex-1 h-7 bg-white border border-slate-300 rounded px-2.5 font-mono text-slate-800 text-xs shadow-2xs"
                        placeholder="e.g. 13/04/2026 11:00 AM"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 w-32 shrink-0">Discharge Date:</span>
                      <input
                        type="text"
                        value={ipDischargeDateInput}
                        onChange={(e) => setIpDischargeDateInput(e.target.value)}
                        className="flex-1 h-7 bg-white border border-slate-300 rounded px-2.5 font-mono text-slate-800 text-xs shadow-2xs"
                        placeholder="e.g. 18/04/2026"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 w-32 shrink-0">Discharge Time:</span>
                      <input
                        type="text"
                        value={ipDischargeTimeInput}
                        onChange={(e) => setIpDischargeTimeInput(e.target.value)}
                        className="flex-1 h-7 bg-white border border-slate-300 rounded px-2.5 font-mono text-slate-800 text-xs shadow-2xs"
                        placeholder="03:00 PM"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 w-32 shrink-0">Room / Bed No:</span>
                      <input
                        type="text"
                        value={ipRoomNoInput}
                        onChange={(e) => setIpRoomNoInput(e.target.value)}
                        className="flex-1 h-7 bg-white border border-slate-300 rounded px-2.5 font-bold text-slate-800 text-xs shadow-2xs"
                        placeholder="e.g. 311"
                      />
                    </div>
                  </div>

                  {/* Column 3 */}
                  <div className="space-y-2 md:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 w-28 shrink-0">Consultant Dr:</span>
                      <div className="flex-1">
                        <SearchableDropdown
                          value={ipConsultantDrInput}
                          options={availableDoctors}
                          onSelect={(doc) => setIpConsultantDrInput(doc)}
                          placeholder="Select Doctor..."
                          width="w-full"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 w-28 shrink-0">Address:</span>
                      <input
                        type="text"
                        value={ipAddressInput}
                        onChange={(e) => setIpAddressInput(e.target.value)}
                        className="flex-1 h-7 bg-white border border-slate-300 rounded px-2.5 font-medium text-slate-800 text-xs shadow-2xs"
                        placeholder="Enter patient address..."
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 w-28 shrink-0">Remarks / Note:</span>
                      <input
                        type="text"
                        value={ipRemarks}
                        onChange={(e) => setIpRemarks(e.target.value)}
                        className="flex-1 h-7 bg-white border border-slate-300 rounded px-2.5 font-medium text-slate-800 text-xs shadow-2xs"
                        placeholder="e.g. Bill For Surgery"
                      />
                    </div>
                  </div>
                </div>

                {/* 16 Standard Itemized Excel Form Table */}
                <div className="border border-slate-300 rounded-lg overflow-hidden shadow-2xs">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-teal-700 to-teal-800 text-white font-bold uppercase text-[10.5px]">
                        <th className="py-2.5 px-3 text-center w-14 border-r border-teal-600">S. No.</th>
                        <th className="py-2.5 px-4 border-r border-teal-600 w-3/12">NAME OF THE SERVICE</th>
                        <th className="py-2.5 px-3 border-r border-teal-600 w-24 text-center">QTY</th>
                        <th className="py-2.5 px-4 border-r border-teal-600 flex-1">DESCRIPTION / NOTES</th>
                        <th className="py-2.5 px-4 text-right w-44">AMOUNT (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white font-medium">
                      {ipSurgeryItems.map((item, index) => (
                        <tr key={item.sNo} className="hover:bg-slate-50/90 transition-colors">
                          <td className="py-1.5 px-3 text-center font-mono font-bold text-slate-700 border-r border-slate-200">
                            {item.sNo}
                          </td>
                          <td className="py-1.5 px-4 font-bold text-slate-900 border-r border-slate-200 text-xs">
                            {item.name}
                          </td>
                          <td className="py-1 px-2 border-r border-slate-200">
                            <input
                              type="text"
                              value={item.qty ?? ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = [...ipSurgeryItems];
                                const currentDesc = updated[index].desc || "";
                                updated[index] = {
                                  ...updated[index],
                                  qty: val,
                                  qtyDesc: val ? (currentDesc ? `${val} (${currentDesc})` : val) : currentDesc,
                                };
                                setIpSurgeryItems(updated);
                              }}
                              className="w-full h-7 px-2 text-center text-xs bg-white border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono text-slate-800 font-bold shadow-2xs"
                              placeholder="1"
                            />
                          </td>
                          <td className="py-1 px-3 border-r border-slate-200">
                            <input
                              type="text"
                              value={item.desc ?? item.qtyDesc ?? ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = [...ipSurgeryItems];
                                const currentQty = updated[index].qty || "";
                                updated[index] = {
                                  ...updated[index],
                                  desc: val,
                                  qtyDesc: currentQty ? `${currentQty} (${val})` : val,
                                };
                                setIpSurgeryItems(updated);
                              }}
                              className="w-full h-7 px-2.5 text-xs bg-white border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono text-slate-800 shadow-2xs"
                              placeholder={
                                item.sNo === 2
                                  ? "e.g. 8000 X5 (SINGLE ROOM)"
                                  : item.sNo === 5
                                  ? "e.g. Blood test"
                                  : item.sNo === 6
                                  ? "e.g. Xray"
                                  : item.sNo === 11
                                  ? "e.g. Dr. D K Das"
                                  : "Write description / details if needed..."
                              }
                            />
                          </td>
                          <td className="py-1 px-3 text-right">
                            <div className="relative flex items-center">
                              <span className="absolute left-2.5 text-slate-400 font-mono text-xs">₹</span>
                              <input
                                type="number"
                                value={item.amount}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const updated = [...ipSurgeryItems];
                                  updated[index] = {
                                    ...updated[index],
                                    amount: val === "" ? "" : Number(val),
                                  };
                                  setIpSurgeryItems(updated);
                                }}
                                className="w-full h-7 pl-6 pr-2.5 text-right font-mono font-black text-slate-900 bg-white border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-xs shadow-2xs"
                                placeholder="0"
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bottom Summary (Sub Total, Discount, Grand Total) */}
                <div className="flex justify-end pt-2">
                  <div className="w-80 bg-slate-50 border border-slate-300 rounded p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>Sub Total:</span>
                      <span className="font-mono text-sm">
                        ₹
                        {ipSurgeryItems
                          .reduce((sum, it) => sum + (Number(it.amount) || 0), 0)
                          .toFixed(0)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between font-medium text-slate-700">
                      <span>Discount (₹):</span>
                      <input
                        type="number"
                        value={ipDiscountAmtInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          setIpDiscountAmtInput(val === "" ? "" : Number(val));
                        }}
                        className="w-28 h-6 text-right font-mono font-bold bg-white border border-slate-300 rounded px-2"
                        placeholder="0"
                      />
                    </div>

                    <div className="flex items-center justify-between font-black text-sm text-blue-700 pt-2 border-t border-slate-400 uppercase">
                      <span>Grand Total:</span>
                      <span className="font-mono text-base">
                        ₹
                        {Math.max(
                          0,
                          ipSurgeryItems.reduce((sum, it) => sum + (Number(it.amount) || 0), 0) -
                            Number(ipDiscountAmtInput || 0)
                        ).toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </Card>
        )}

        {/* ─── TAB 7: REFUND (CURRENTLY COMMENTED OUT) ──────────────────────────────── */}
        {/* activeTab === "Refund" && (
          <Card className="flex-1 flex flex-col overflow-hidden border-slate-200/80 shadow-2xs">
            <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  Patient Refund Management
                </h3>
                <p className="text-xs text-slate-500">
                  Process overpayment returns, cancelled order refunds, and
                  deposit payouts
                </p>
              </div>
            </div>

            <div className="p-4 bg-white border-b grid grid-cols-1 md:grid-cols-5 gap-3 items-start">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-bold uppercase text-slate-500">
                    Patient UHID*
                  </Label>
                  {refPatientMatch.status === "found" && (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Available
                    </span>
                  )}
                  {refPatientMatch.status === "not_found" && (
                    <span className="text-[10px] font-bold text-rose-600 flex items-center gap-0.5">
                      <AlertCircle className="w-3 h-3" /> Not Available
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 bg-white rounded-md border border-slate-300 px-2 py-0.5 shadow-2xs hover:border-blue-400 focus-within:border-blue-500">
                  <Input
                    type="text"
                    value={refUhid}
                    onChange={(e) => setRefUhid(e.target.value)}
                    placeholder="UHID..."
                    className={`h-6 text-xs border-0 p-0 shadow-none font-mono font-bold ${
                      refPatientMatch.status === "found"
                        ? "text-emerald-700"
                        : refPatientMatch.status === "not_found"
                          ? "text-rose-700"
                          : "text-slate-800"
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 cursor-pointer flex-shrink-0"
                    onClick={() => setIsPatientSearchModalOpen(true)}
                    title="Open Patient Search Directory"
                  >
                    <Search className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {refPatientMatch.status === "found" &&
                  refPatientMatch.patient && (
                    <div className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5 font-medium truncate">
                      👤{" "}
                      <span className="font-bold">
                        {refPatientMatch.patient.patientName}
                      </span>{" "}
                      ({refPatientMatch.patient.genderAge || "Patient"})
                    </div>
                  )}
                {refPatientMatch.status === "not_found" && (
                  <div className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 rounded px-1.5 py-0.5 font-medium">
                    ⚠️ UHID not found in database
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-bold uppercase text-slate-500">
                    Invoice No
                  </Label>
                  {refInvoiceMatch.status === "found" &&
                    refInvoiceMatch.uhidMatch && (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Available
                      </span>
                    )}
                  {refInvoiceMatch.status === "found" &&
                    !refInvoiceMatch.uhidMatch && (
                      <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                        <AlertCircle className="w-3 h-3" /> UHID Mismatch
                      </span>
                    )}
                  {refInvoiceMatch.status === "not_found" && (
                    <span className="text-[10px] font-bold text-rose-600 flex items-center gap-0.5">
                      <AlertCircle className="w-3 h-3" /> Not Available
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 bg-white rounded-md border border-slate-300 px-2 py-0.5 shadow-2xs hover:border-blue-400 focus-within:border-blue-500">
                  <Input
                    type="text"
                    value={refInvoiceNo}
                    onChange={(e) => handleSelectRefundInvoice(e.target.value)}
                    placeholder="e.g. OPCA26/104"
                    className={`h-6 text-xs border-0 p-0 shadow-none font-mono font-bold ${
                      refInvoiceMatch.status === "found" &&
                      refInvoiceMatch.uhidMatch
                        ? "text-emerald-700"
                        : refInvoiceMatch.status === "found" &&
                            !refInvoiceMatch.uhidMatch
                          ? "text-amber-700"
                          : refInvoiceMatch.status === "not_found"
                            ? "text-rose-700"
                            : "text-slate-800"
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 cursor-pointer flex-shrink-0"
                    onClick={() => setIsInvoiceSearchModalOpen(true)}
                    title="Open Invoice Search Directory"
                  >
                    <Search className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {refInvoiceMatch.status === "found" &&
                  refInvoiceMatch.invoice && (
                    <div
                      className={`text-[10px] rounded px-1.5 py-0.5 font-medium border truncate ${
                        refInvoiceMatch.uhidMatch
                          ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                          : "text-amber-700 bg-amber-50 border-amber-200"
                      }`}
                    >
                      📄{" "}
                      <span className="font-bold">
                        ₹{refInvoiceMatch.invoice.netAmt}
                      </span>{" "}
                      ({refInvoiceMatch.invoice.status})
                      {!refInvoiceMatch.uhidMatch &&
                        ` • Belongs to ${refInvoiceMatch.invoice.uhid}`}
                    </div>
                  )}
                {refInvoiceMatch.status === "not_found" && (
                  <div className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 rounded px-1.5 py-0.5 font-medium">
                    ⚠️ Invoice No not found
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase text-slate-500">
                  Refund Amount (₹)*
                </Label>
                <Input
                  type="number"
                  value={refAmount}
                  onChange={(e) => setRefAmount(Number(e.target.value))}
                  className="h-7 text-xs bg-white font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase text-slate-500">
                  Refund Mode
                </Label>
                <Select value={refMode} onValueChange={setRefMode}>
                  <SelectTrigger className="h-7 text-xs bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">
                      Bank Transfer / UPI
                    </SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col justify-end pt-5">
                <Button
                  onClick={handleSaveRefund}
                  className="h-7 text-xs w-full font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                >
                  Process Refund
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-white p-4">
              <table className="w-full text-xs text-left border rounded-lg overflow-hidden">
                <thead className="bg-slate-50 border-b text-slate-500 uppercase text-[9px] font-bold">
                  <tr>
                    <th className="px-3 py-2">Refund Voucher#</th>
                    <th className="px-3 py-2">UHID</th>
                    <th className="px-3 py-2">Patient Name</th>
                    <th className="px-3 py-2">Invoice#</th>
                    <th className="px-3 py-2 text-right">Amount (₹)</th>
                    <th className="px-3 py-2">Mode</th>
                    <th className="px-3 py-2">Reason</th>
                    <th className="px-3 py-2">Authorized By</th>
                    <th className="px-3 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {refunds.map((r) => (
                    <tr key={r.id}>
                      <td className="px-3 py-2.5 font-mono font-bold text-amber-700">
                        {r.refundNo}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-slate-600">
                        {r.uhid}
                      </td>
                      <td className="px-3 py-2.5 font-bold text-slate-800">
                        {r.patientName}
                      </td>
                      <td className="px-3 py-2.5 font-mono">
                        {r.invoiceNo || "-"}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-amber-600">
                        ₹{r.amount.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5">{r.mode}</td>
                      <td className="px-3 py-2.5 text-slate-600">{r.reason}</td>
                      <td className="px-3 py-2.5">{r.authorizedBy}</td>
                      <td className="px-3 py-2.5 text-center">
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200"
                        >
                          {r.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {refunds.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-3 py-8 text-center text-slate-400 font-bold"
                      >
                        No refund records yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )} */}

        {/* ─── TAB 8: ADVANCE COLLECTION ──────────────────────────────────── */}
        {activeTab === "Advance Collection" && (
          <Card className="flex-1 flex flex-col overflow-hidden border-slate-200/80 shadow-2xs">
            <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  Advance & Patient Deposit Collection
                </h3>
                <p className="text-xs text-slate-500">
                  Collect pre-admission deposits and surgery advances with
                  official receipt vouchers
                </p>
              </div>
            </div>

            <div className="p-4 bg-white border-b grid grid-cols-1 md:grid-cols-5 gap-3 items-start">
              {/* Patient UHID Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-bold uppercase text-slate-500">
                    Patient UHID*
                  </Label>
                  {advPatientMatch.status === "found" && (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Available
                    </span>
                  )}
                  {advPatientMatch.status === "not_found" && (
                    <span className="text-[10px] font-bold text-rose-600 flex items-center gap-0.5">
                      <AlertCircle className="w-3 h-3" /> Not Available
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 bg-white rounded-md border border-slate-300 px-2 py-0.5 shadow-2xs hover:border-blue-400 focus-within:border-blue-500">
                  <Input
                    type="text"
                    value={advUhid}
                    onChange={(e) => setAdvUhid(e.target.value)}
                    placeholder="UHID..."
                    className={`h-6 text-xs border-0 p-0 shadow-none font-mono font-bold ${
                      advPatientMatch.status === "found"
                        ? "text-emerald-700"
                        : advPatientMatch.status === "not_found"
                          ? "text-rose-700"
                          : "text-slate-800"
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 cursor-pointer flex-shrink-0"
                    onClick={() => setIsPatientSearchModalOpen(true)}
                    title="Open Patient Search Directory"
                  >
                    <Search className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {advPatientMatch.status === "found" &&
                  advPatientMatch.patient && (
                    <div className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5 font-medium truncate">
                      👤{" "}
                      <span className="font-bold">
                        {advPatientMatch.patient.patientName}
                      </span>{" "}
                      ({advPatientMatch.patient.genderAge || "Patient"})
                    </div>
                  )}
                {advPatientMatch.status === "not_found" && (
                  <div className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 rounded px-1.5 py-0.5 font-medium">
                    ⚠️ UHID not found in database
                  </div>
                )}
              </div>

              {/* Deposit Amount */}
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase text-slate-500">
                  Deposit Amount (₹)*
                </Label>
                <Input
                  type="number"
                  value={advAmount}
                  onChange={(e) => setAdvAmount(Number(e.target.value))}
                  className="h-7 text-xs bg-white font-mono font-bold"
                />
              </div>

              {/* Payment Mode */}
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase text-slate-500">
                  Payment Mode
                </Label>
                <Select value={advMode} onValueChange={setAdvMode}>
                  <SelectTrigger className="h-7 text-xs bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="UPI">UPI / QR Code</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Bank Transfer">
                      Bank Transfer (NEFT)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Purpose */}
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase text-slate-500">
                  Purpose
                </Label>
                <Input
                  value={advPurpose}
                  onChange={(e) => setAdvPurpose(e.target.value)}
                  placeholder="e.g. Admission Deposit"
                  className="h-7 text-xs bg-white"
                />
              </div>

              {/* Action Button */}
              <div className="flex flex-col justify-end pt-5">
                <Button
                  onClick={handleSaveAdvance}
                  className="h-7 text-xs w-full font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
                >
                  + Collect Deposit
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-white p-4">
              <table className="w-full text-xs text-left border rounded-lg overflow-hidden">
                <thead className="bg-slate-50 border-b text-slate-500 uppercase text-[9px] font-bold">
                  <tr>
                    <th className="px-3 py-2">Advance Voucher#</th>
                    <th className="px-3 py-2">UHID</th>
                    <th className="px-3 py-2">Patient Name</th>
                    <th className="px-3 py-2 text-right">Deposited (₹)</th>
                    <th className="px-3 py-2 text-right">Adjusted (₹)</th>
                    <th className="px-3 py-2 text-right">
                      Balance Available (₹)
                    </th>
                    <th className="px-3 py-2">Mode</th>
                    <th className="px-3 py-2">Purpose</th>
                    <th className="px-3 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredAdvances.map((a) => (
                    <tr key={a.id}>
                      <td className="px-3 py-2.5 font-mono font-bold text-teal-700">
                        {a.advanceNo}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-slate-600">
                        {a.uhid}
                      </td>
                      <td className="px-3 py-2.5 font-bold text-slate-800">
                        {a.patientName}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold">
                        ₹{a.amount.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-emerald-600">
                        ₹{a.adjustedAmount.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-black text-teal-700">
                        ₹{a.balanceAmount.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5">{a.mode}</td>
                      <td className="px-3 py-2.5 text-slate-600">
                        {a.purpose}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <Badge
                          variant="outline"
                          className={
                            a.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-50 text-slate-600"
                          }
                        >
                          {a.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* ─── TAB 9: CREDIT NOTE ─────────────────────────────────────────── */}
        {activeTab === "Credit Note" && (
          <Card className="flex-1 flex flex-col overflow-hidden border-slate-200/80 shadow-2xs">
            <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  Credit Note & Bill Concessions
                </h3>
                <p className="text-xs text-slate-500">
                  Issue authorized bill waivers, discount adjustments, and
                  post-billing credits
                </p>
              </div>
            </div>

            <div className="p-4 bg-white border-b grid grid-cols-1 md:grid-cols-5 gap-3 items-start">
              {/* Invoice No Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-bold uppercase text-slate-500">
                    Invoice No*
                  </Label>
                  {cnInvoiceMatch.status === "found" &&
                    cnInvoiceMatch.uhidMatch && (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Available
                      </span>
                    )}
                  {cnInvoiceMatch.status === "found" &&
                    !cnInvoiceMatch.uhidMatch && (
                      <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                        <AlertCircle className="w-3 h-3" /> Mismatch
                      </span>
                    )}
                  {cnInvoiceMatch.status === "not_found" && (
                    <span className="text-[10px] font-bold text-rose-600 flex items-center gap-0.5">
                      <AlertCircle className="w-3 h-3" /> Not Available
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 bg-white rounded-md border border-slate-300 px-2 py-0.5 shadow-2xs hover:border-blue-400 focus-within:border-blue-500">
                  <Input
                    type="text"
                    value={cnInvoiceNo}
                    onChange={(e) =>
                      handleSelectCreditNoteInvoice(e.target.value)
                    }
                    placeholder="e.g. IPCA26/102"
                    className={`h-6 text-xs border-0 p-0 shadow-none font-mono font-bold ${
                      cnInvoiceMatch.status === "found" &&
                      cnInvoiceMatch.uhidMatch
                        ? "text-emerald-700"
                        : cnInvoiceMatch.status === "found" &&
                            !cnInvoiceMatch.uhidMatch
                          ? "text-amber-700"
                          : cnInvoiceMatch.status === "not_found"
                            ? "text-rose-700"
                            : "text-slate-800"
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 cursor-pointer flex-shrink-0"
                    onClick={() => setIsInvoiceSearchModalOpen(true)}
                    title="Open Invoice Search Directory"
                  >
                    <Search className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {cnInvoiceMatch.status === "found" &&
                  cnInvoiceMatch.invoice && (
                    <div className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5 font-medium truncate">
                      📄{" "}
                      <span className="font-bold">
                        ₹{cnInvoiceMatch.invoice.netAmt}
                      </span>{" "}
                      ({cnInvoiceMatch.invoice.patientName})
                    </div>
                  )}
                {cnInvoiceMatch.status === "not_found" && (
                  <div className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 rounded px-1.5 py-0.5 font-medium">
                    ⚠️ Invoice No not found
                  </div>
                )}
              </div>

              {/* Patient UHID Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-bold uppercase text-slate-500">
                    Patient UHID
                  </Label>
                  {cnPatientMatch.status === "found" && (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Available
                    </span>
                  )}
                  {cnPatientMatch.status === "not_found" && (
                    <span className="text-[10px] font-bold text-rose-600 flex items-center gap-0.5">
                      <AlertCircle className="w-3 h-3" /> Not Available
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 bg-white rounded-md border border-slate-300 px-2 py-0.5 shadow-2xs hover:border-blue-400 focus-within:border-blue-500">
                  <Input
                    type="text"
                    value={cnUhid}
                    onChange={(e) => setCnUhid(e.target.value)}
                    placeholder="UHID..."
                    className={`h-6 text-xs border-0 p-0 shadow-none font-mono font-bold ${
                      cnPatientMatch.status === "found"
                        ? "text-emerald-700"
                        : cnPatientMatch.status === "not_found"
                          ? "text-rose-700"
                          : "text-slate-800"
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 cursor-pointer flex-shrink-0"
                    onClick={() => setIsPatientSearchModalOpen(true)}
                    title="Open Patient Search Directory"
                  >
                    <Search className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {cnPatientMatch.status === "found" &&
                  cnPatientMatch.patient && (
                    <div className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5 font-medium truncate">
                      👤{" "}
                      <span className="font-bold">
                        {cnPatientMatch.patient.patientName}
                      </span>
                    </div>
                  )}
                {cnPatientMatch.status === "not_found" && (
                  <div className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 rounded px-1.5 py-0.5 font-medium">
                    ⚠️ UHID not found
                  </div>
                )}
              </div>

              {/* Waiver Amount */}
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase text-slate-500">
                  Waiver Amount (₹)*
                </Label>
                <Input
                  type="number"
                  value={cnAmount}
                  onChange={(e) => setCnAmount(Number(e.target.value))}
                  className="h-7 text-xs bg-white font-mono font-bold"
                />
              </div>

              {/* Reason */}
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase text-slate-500">
                  Reason*
                </Label>
                <Input
                  value={cnReason}
                  onChange={(e) => setCnReason(e.target.value)}
                  placeholder="e.g. Courtesy Waiver"
                  className="h-7 text-xs bg-white"
                />
              </div>

              {/* Action Button */}
              <div className="flex flex-col justify-end pt-5">
                <Button
                  onClick={handleSaveCreditNote}
                  className="h-7 text-xs w-full font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                >
                  Issue Credit Note
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-white p-4">
              <table className="w-full text-xs text-left border rounded-lg overflow-hidden">
                <thead className="bg-slate-50 border-b text-slate-500 uppercase text-[9px] font-bold">
                  <tr>
                    <th className="px-3 py-2">Credit Note#</th>
                    <th className="px-3 py-2">Invoice#</th>
                    <th className="px-3 py-2">UHID</th>
                    <th className="px-3 py-2">Patient Name</th>
                    <th className="px-3 py-2 text-right">Credit Amount (₹)</th>
                    <th className="px-3 py-2">Reason</th>
                    <th className="px-3 py-2">Authorized By</th>
                    <th className="px-3 py-2">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {creditNotes.map((cn) => (
                    <tr key={cn.id}>
                      <td className="px-3 py-2.5 font-mono font-bold text-purple-700">
                        {cn.creditNoteNo}
                      </td>
                      <td className="px-3 py-2.5 font-mono font-bold text-slate-800">
                        {cn.invoiceNo}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-slate-600">
                        {cn.uhid}
                      </td>
                      <td className="px-3 py-2.5 font-bold text-slate-800">
                        {cn.patientName}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-black text-purple-600">
                        ₹{cn.amount.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">
                        {cn.reason}
                      </td>
                      <td className="px-3 py-2.5">{cn.authorizedBy}</td>
                      <td className="px-3 py-2.5 text-slate-500">
                        {new Date(cn.createdAt).toLocaleDateString("en-GB")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* ─── TAB 10: INTIMATION ─────────────────────────────────────────── */}
        {activeTab === "Intimation" && (
          <Card className="flex-1 flex flex-col overflow-hidden border-slate-200/80 shadow-2xs">
            <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  TPA & Insurance Claims Intimation
                </h3>
                <p className="text-xs text-slate-500">
                  Track cashless pre-authorization, TPA query resolution, and
                  insurance settlements
                </p>
              </div>
            </div>

            <div className="p-4 bg-white border-b grid grid-cols-1 md:grid-cols-6 gap-3 items-start">
              {/* Patient UHID Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-bold uppercase text-slate-500">
                    Patient UHID*
                  </Label>
                  {intPatientMatch.status === "found" && (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Available
                    </span>
                  )}
                  {intPatientMatch.status === "not_found" && (
                    <span className="text-[10px] font-bold text-rose-600 flex items-center gap-0.5">
                      <AlertCircle className="w-3 h-3" /> Not Available
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 bg-white rounded-md border border-slate-300 px-2 py-0.5 shadow-2xs hover:border-blue-400 focus-within:border-blue-500">
                  <Input
                    type="text"
                    value={intUhid}
                    onChange={(e) => setIntUhid(e.target.value)}
                    placeholder="UHID..."
                    className={`h-6 text-xs border-0 p-0 shadow-none font-mono font-bold ${
                      intPatientMatch.status === "found"
                        ? "text-emerald-700"
                        : intPatientMatch.status === "not_found"
                          ? "text-rose-700"
                          : "text-slate-800"
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 cursor-pointer flex-shrink-0"
                    onClick={() => setIsPatientSearchModalOpen(true)}
                    title="Open Patient Search Directory"
                  >
                    <Search className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {intPatientMatch.status === "found" &&
                  intPatientMatch.patient && (
                    <div className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5 font-medium truncate">
                      👤{" "}
                      <span className="font-bold">
                        {intPatientMatch.patient.patientName}
                      </span>
                    </div>
                  )}
                {intPatientMatch.status === "not_found" && (
                  <div className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 rounded px-1.5 py-0.5 font-medium">
                    ⚠️ UHID not found
                  </div>
                )}
              </div>

              {/* TPA Name */}
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase text-slate-500">
                  TPA Name*
                </Label>
                <Input
                  value={intTpa}
                  onChange={(e) => setIntTpa(e.target.value)}
                  placeholder="e.g. Star Health"
                  className="h-7 text-xs bg-white"
                />
              </div>

              {/* Claim Ref */}
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase text-slate-500">
                  Claim Ref#*
                </Label>
                <Input
                  value={intClaimNo}
                  onChange={(e) => setIntClaimNo(e.target.value)}
                  placeholder="Claim Number..."
                  className="h-7 text-xs bg-white font-mono"
                />
              </div>

              {/* Requested Amount */}
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase text-slate-500">
                  Requested (₹)
                </Label>
                <Input
                  type="number"
                  value={intReqAmt}
                  onChange={(e) => setIntReqAmt(Number(e.target.value))}
                  className="h-7 text-xs bg-white font-mono"
                />
              </div>

              {/* Approved Limit */}
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase text-slate-500">
                  Approved Limit (₹)
                </Label>
                <Input
                  type="number"
                  value={intApprAmt}
                  onChange={(e) => setIntApprAmt(Number(e.target.value))}
                  className="h-7 text-xs bg-white font-mono font-bold"
                />
              </div>

              {/* Action Button */}
              <div className="flex flex-col justify-end pt-5">
                <Button
                  onClick={handleSaveIntimation}
                  className="h-7 text-xs w-full font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                >
                  + Add Intimation
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-white p-4">
              <table className="w-full text-xs text-left border rounded-lg overflow-hidden">
                <thead className="bg-slate-50 border-b text-slate-500 uppercase text-[9px] font-bold">
                  <tr>
                    <th className="px-3 py-2">Claim No</th>
                    <th className="px-3 py-2">UHID</th>
                    <th className="px-3 py-2">Patient Name</th>
                    <th className="px-3 py-2">TPA / Insurance Company</th>
                    <th className="px-3 py-2 text-right">Requested (₹)</th>
                    <th className="px-3 py-2 text-right">Approved Limit (₹)</th>
                    <th className="px-3 py-2 text-right">Patient Co-Pay (₹)</th>
                    <th className="px-3 py-2 text-center">Status</th>
                    <th className="px-3 py-2">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {intimations.map((it) => (
                    <tr key={it.id}>
                      <td className="px-3 py-2.5 font-mono font-bold text-blue-700">
                        {it.claimNo}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-slate-600">
                        {it.uhid}
                      </td>
                      <td className="px-3 py-2.5 font-bold text-slate-800">
                        {it.patientName}
                      </td>
                      <td className="px-3 py-2.5 text-slate-700 font-semibold">
                        {it.tpaName}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono">
                        ₹{it.requestedAmt.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-600">
                        ₹{it.approvedAmt.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-amber-600">
                        ₹{it.coPayAmt.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <Badge
                          variant="outline"
                          className={
                            it.status === "Approved"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }
                        >
                          {it.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 text-slate-500">
                        {it.remarks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* ─── TAB 11: UNBILLED ORDERS ────────────────────────────────────── */}
        {activeTab === "UnBilled Orders" && (
          <Card className="flex-1 flex flex-col overflow-hidden border-slate-200/80 shadow-2xs">
            <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  Unbilled Doctor & Service Orders Queue
                </h3>
                <p className="text-xs text-slate-500">
                  Pending investigations and procedures waiting for invoicing &
                  settlement
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleBillSelectedOrders}
                  disabled={selectedUnbilledOrders.length === 0}
                  className="h-7 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                  Generate Combined Invoice ({selectedUnbilledOrders.length})
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-white p-4">
              <table className="w-full text-xs text-left border rounded-lg overflow-hidden">
                <thead className="bg-slate-50 border-b text-slate-500 uppercase text-[9px] font-bold">
                  <tr>
                    <th className="px-3 py-2 text-center w-10">Select</th>
                    <th className="px-3 py-2">Order No</th>
                    <th className="px-3 py-2">UHID</th>
                    <th className="px-3 py-2">Patient Name</th>
                    <th className="px-3 py-2">Ordering Doctor</th>
                    <th className="px-3 py-2">Department / Category</th>
                    <th className="px-3 py-2 text-right">Net Value (₹)</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {unbilledOrders.map((ord) => {
                    const isChecked = selectedUnbilledOrders.includes(ord.id);
                    return (
                      <tr key={ord.id} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedUnbilledOrders(
                                  selectedUnbilledOrders.filter(
                                    (id) => id !== ord.id,
                                  ),
                                );
                              } else {
                                setSelectedUnbilledOrders([
                                  ...selectedUnbilledOrders,
                                  ord.id,
                                ]);
                              }
                            }}
                            className="h-3.5 w-3.5 rounded text-blue-600"
                          />
                        </td>
                        <td className="px-3 py-2.5 font-mono font-bold text-blue-700">
                          {ord.orderNo}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-slate-600">
                          {ord.uhid}
                        </td>
                        <td className="px-3 py-2.5 font-bold text-slate-800">
                          {ord.patientName}
                        </td>
                        <td className="px-3 py-2.5 text-slate-700 font-semibold">
                          {ord.doctorName}
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge
                            variant="outline"
                            className="bg-slate-50 text-slate-700"
                          >
                            {ord.orderType}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900">
                          ₹{ord.netAmount.toFixed(2)}
                        </td>
                        <td className="px-3 py-2.5 text-slate-500">
                          {new Date(ord.createdAt).toLocaleDateString("en-GB")}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <Button
                            size="xs"
                            onClick={async () => {
                              try {
                                const inv = await billOrder(ord.id);
                                toast.success(
                                  "Order Billed",
                                  `Invoice ${inv.invoiceNo} generated!`,
                                );
                                loadAllBillingData();
                                setActiveTab("Master Activity List");
                              } catch (err: any) {
                                toast.error("Billing Failed", err.message);
                              }
                            }}
                            className="h-6 px-3 text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Bill Order
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {unbilledOrders.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-3 py-12 text-center text-slate-400 font-bold"
                      >
                        All doctor orders have been billed. No pending items in
                        queue.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* ─── MODAL 0: PATIENT NOTES & BILLING FLAGS ────────────────────────── */}
      {isNotesModalOpen &&
        activePatientNotesUhid &&
        (() => {
          const currentPatientName =
            (activeTab === "IP Billing"
              ? findPatientByUhid(activePatientNotesUhid)?.fullName
              : opBillingPatientInfo?.name) || "";
          const notesList = patientNotesMap[activePatientNotesUhid] || [];

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
              <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-[#cee6f8]">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-white text-blue-700 shadow-2xs">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">
                        Patient Notes & Billing Flags
                      </h3>
                      <p className="text-[11px] text-slate-600 font-medium">
                        UHID:{" "}
                        <span className="font-mono font-bold text-blue-700">
                          {activePatientNotesUhid}
                        </span>{" "}
                        {currentPatientName ? `(${currentPatientName})` : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsNotesModalOpen(false)}
                    className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Form to Add Note */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Add New Patient Note / Flag
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <Label className="text-[10px] font-bold text-slate-500 uppercase">
                        Category
                      </Label>
                      <Select
                        value={newNoteCategory}
                        onValueChange={(val: any) => setNewNoteCategory(val)}
                      >
                        <SelectTrigger className="h-7 text-xs bg-white border-slate-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Billing Flag">
                            Billing Flag
                          </SelectItem>
                          <SelectItem value="Clinical Alert">
                            Clinical Alert
                          </SelectItem>
                          <SelectItem value="General Note">
                            General Note
                          </SelectItem>
                          <SelectItem value="Special Instruction">
                            Special Instruction
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-[10px] font-bold text-slate-500 uppercase">
                        Note Description
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          value={newNoteText}
                          onChange={(e) => setNewNoteText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && newNoteText.trim()) {
                              handleAddNote();
                            }
                          }}
                          placeholder="Enter billing flag or clinical note..."
                          className="h-7 text-xs bg-white border-slate-300 flex-1"
                        />
                        <Button
                          size="sm"
                          onClick={handleAddNote}
                          className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 shrink-0"
                        >
                          + Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes List */}
                <div className="p-4 overflow-y-auto flex-1 space-y-2 max-h-[350px]">
                  {notesList.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500 font-medium">
                      No notes created for this patient yet. Use the input box
                      above to add a new note.
                    </div>
                  ) : (
                    notesList.map((note) => (
                      <div
                        key={note.id}
                        className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1.5 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <Badge
                            className={`text-[10px] px-2 py-0.5 font-bold ${
                              note.category === "Billing Flag"
                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                : note.category === "Clinical Alert"
                                  ? "bg-red-100 text-red-800 border-red-300"
                                  : note.category === "Special Instruction"
                                    ? "bg-purple-100 text-purple-800 border-purple-300"
                                    : "bg-blue-100 text-blue-800 border-blue-300"
                            }`}
                          >
                            {note.category}
                          </Badge>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span>By {note.author}</span>
                            <span>•</span>
                            <span>{note.createdAt}</span>
                            <button
                              onClick={() =>
                                handleRemoveNote(
                                  activePatientNotesUhid,
                                  note.id,
                                )
                              }
                              className="text-slate-400 hover:text-red-600 p-0.5 rounded cursor-pointer transition-colors"
                              title="Delete note"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed">
                          {note.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsNotesModalOpen(false)}
                    className="h-7 text-xs font-bold px-4"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* ─── MODAL 1: SETTLEMENT / SPLIT RECEIPT DIALOG ────────────────────── */}
      {isSettleModalOpen &&
        selectedInvoice &&
        (() => {
          const isRefund =
            selectedInvoice.status === "Refundable" ||
            selectedInvoice.balance < 0;
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
              <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-[#cee6f8] flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white text-blue-600 shadow-2xs">
                      <ReceiptText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">
                        {isRefund
                          ? "Refund Settlement"
                          : "Invoice Payment Settlement"}
                      </h3>
                      <p className="text-xs text-slate-600 font-mono">
                        Invoice No: {selectedInvoice.invoiceNo}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsSettleModalOpen(false)}
                    className="p-1 rounded-md text-slate-500 hover:text-slate-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                  <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border rounded-xl">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        Patient
                      </span>
                      <div className="font-bold text-slate-800">
                        {selectedInvoice.patientName} (UHID:{" "}
                        {selectedInvoice.uhid})
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        Invoice Total
                      </span>
                      <div className="font-bold text-slate-800 font-mono">
                        ₹{selectedInvoice.netAmt.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        Pending Balance
                      </span>
                      <div className="font-black text-red-600 font-mono text-sm">
                        ₹{Math.abs(selectedInvoice.balance).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                        Payment Split Modes
                      </span>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() =>
                          setPaymentRows([
                            ...paymentRows,
                            {
                              mode: "Cash",
                              amount: 0,
                              balance: 0,
                              date: new Date().toLocaleDateString("en-GB"),
                              bankName: "",
                              beneficiaryName: "",
                              refNo: "",
                              description: "",
                              cardSwipingValue: 0,
                            },
                          ])
                        }
                        className="h-6 text-[10px] font-bold text-blue-600"
                      >
                        + Add Payment Mode
                      </Button>
                    </div>

                    <table className="w-full text-xs text-left border rounded-lg overflow-hidden">
                      <thead className="bg-slate-50 border-b text-slate-500 uppercase text-[9px] font-bold">
                        <tr>
                          <th className="px-2 py-2">Mode</th>
                          <th className="px-2 py-2 text-right">Amount (₹)</th>
                          <th className="px-2 py-2">Bank</th>
                          <th className="px-2 py-2">Reference No</th>
                          <th className="px-2 py-2">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paymentRows.map((row, idx) => {
                          const isCashRow = row.mode === "Cash";
                          return (
                            <tr key={idx}>
                              <td className="p-2">
                                <Select
                                  value={row.mode}
                                  onValueChange={(val) => {
                                    const updated = [...paymentRows];
                                    updated[idx].mode = val;
                                    if (val === "Cash") {
                                      updated[idx].bankName = "";
                                      updated[idx].refNo = "";
                                      updated[idx].description = "";
                                    }
                                    setPaymentRows(updated);
                                  }}
                                >
                                  <SelectTrigger className="h-7 text-xs bg-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Cash">Cash</SelectItem>
                                    <SelectItem value="Cheque/DD">
                                      Cheque/DD
                                    </SelectItem>
                                    <SelectItem value="Credit Card">
                                      Credit Card
                                    </SelectItem>
                                    <SelectItem value="Debit Card">
                                      Debit Card
                                    </SelectItem>
                                    <SelectItem value="NEFT/RTGS">
                                      NEFT/RTGS
                                    </SelectItem>
                                    <SelectItem value="Foreign Receipt">
                                      Foreign Receipt
                                    </SelectItem>
                                    <SelectItem value="Paytm">Paytm</SelectItem>
                                    <SelectItem value="On Line Payment">
                                      On Line Payment
                                    </SelectItem>
                                    <SelectItem value="CreditNote">
                                      Credit Note
                                    </SelectItem>
                                    <SelectItem value="TDS">TDS</SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="p-2 text-right">
                                <Input
                                  type="number"
                                  value={row.amount}
                                  onChange={(e) => {
                                    const updated = [...paymentRows];
                                    updated[idx].amount = Number(e.target.value);
                                    setPaymentRows(updated);
                                  }}
                                  className="h-7 text-xs text-right bg-white font-mono font-bold"
                                />
                              </td>
                              <td className="p-2">
                                <Input
                                  disabled={isCashRow}
                                  placeholder={isCashRow ? "-" : "Bank name"}
                                  value={isCashRow ? "" : row.bankName}
                                  onChange={(e) => {
                                    const updated = [...paymentRows];
                                    updated[idx].bankName = e.target.value;
                                    setPaymentRows(updated);
                                  }}
                                  className={`h-7 text-xs ${
                                    isCashRow
                                      ? "bg-slate-100/80 text-slate-400 cursor-not-allowed border-slate-200 select-none"
                                      : "bg-white"
                                  }`}
                                />
                              </td>
                              <td className="p-2">
                                <Input
                                  disabled={isCashRow}
                                  placeholder={isCashRow ? "-" : "Transaction / Ref#"}
                                  value={isCashRow ? "" : row.refNo}
                                  onChange={(e) => {
                                    const updated = [...paymentRows];
                                    updated[idx].refNo = e.target.value;
                                    setPaymentRows(updated);
                                  }}
                                  className={`h-7 text-xs font-mono ${
                                    isCashRow
                                      ? "bg-slate-100/80 text-slate-400 cursor-not-allowed border-slate-200 select-none"
                                      : "bg-white"
                                  }`}
                                />
                              </td>
                              <td className="p-2">
                                <Input
                                  disabled={isCashRow}
                                  placeholder={isCashRow ? "-" : "Remarks"}
                                  value={isCashRow ? "" : row.description}
                                  onChange={(e) => {
                                    const updated = [...paymentRows];
                                    updated[idx].description = e.target.value;
                                    setPaymentRows(updated);
                                  }}
                                  className={`h-7 text-xs ${
                                    isCashRow
                                      ? "bg-slate-100/80 text-slate-400 cursor-not-allowed border-slate-200 select-none"
                                      : "bg-white"
                                  }`}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {isRefund && (
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-500">
                        Refund Reason / Remarks*
                      </Label>
                      <textarea
                        value={settlementNotes}
                        onChange={(e) => setSettlementNotes(e.target.value)}
                        className="w-full h-16 text-xs p-2 border rounded-lg"
                        placeholder="Reason for processing refund..."
                      />
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-3 border-t bg-slate-50 flex-shrink-0">
                  <div className="font-bold text-slate-700">
                    Total Settlement Amount:{" "}
                    <span className="font-mono text-sm text-emerald-600">
                      ₹
                      {paymentRows
                        .reduce((sum, r) => sum + Number(r.amount || 0), 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSettleModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveSettlement}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1"
                    >
                      <ShieldCheck className="w-4 h-4" /> Save Receipt
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {/* ─── MODAL 2: PRINTABLE HOSPITAL INVOICE / RECEIPT ─────────────────── */}
      {printInvoiceData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-2.5 border-b bg-slate-50 flex-shrink-0">
              <span className="font-bold text-slate-800 text-sm">
                Official Invoice & Settlement Receipt
              </span>
              <button
                onClick={() => setPrintInvoiceData(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto bg-slate-100 flex-1">
              <div className="bg-white shadow-md border rounded p-4 mx-auto max-w-[8.27in]">
                <BillingInvoicePrint invoice={printInvoiceData} />
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t bg-slate-50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPrintInvoiceData(null)}
              >
                Close
              </Button>
              <Button
                size="sm"
                className="gap-1 font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                onClick={() => handlePrintInvoice?.()}
              >
                <Printer className="h-4 w-4" /> Print Document
              </Button>
            </div>
          </div>

          {/* Hidden Printable Invoice Element for Clean Printing */}
          <div className="hidden">
            <BillingInvoicePrint
              ref={printInvoiceRef}
              invoice={printInvoiceData}
            />
          </div>
        </div>
      )}

      {/* ─── MODAL 2.4: AUDIT BILL MODAL ───────────── */}
      {isAuditBillModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-[#ebf8fa] border-[3px] border-[#3bc6db] w-[550px] rounded shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-[#c2eff5] py-2 text-center text-[#1c6a78] font-semibold text-sm border-b border-[#3bc6db]">
              Bill Audit (Audit Details)
            </div>
            <div className="p-6 pb-5 flex flex-col gap-4">
              <div className="flex gap-4">
                <span className="text-xs font-semibold text-slate-700 w-16 pt-2">
                  Remarks
                </span>
                <textarea
                  className="flex-1 h-32 border border-slate-300 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#3bc6db] focus:border-[#3bc6db] bg-white shadow-sm resize-none"
                  value={auditBillRemarks}
                  onChange={(e) => setAuditBillRemarks(e.target.value)}
                ></textarea>
              </div>
              <div className="flex justify-center gap-2.5 mt-2">
                <button
                  className="bg-[#2c65b5] hover:bg-[#1a4a8c] text-white px-7 py-1.5 rounded shadow-sm text-xs font-semibold transition-colors"
                  onClick={() => {
                    setIpStatus("Audit Bill");
                    setIsAuditBillModalOpen(false);
                    toast.success(
                      "Audit Details Saved",
                      "The bill audit remarks have been recorded successfully.",
                    );
                  }}
                >
                  Save
                </button>
                <button
                  className="bg-[#3e566b] hover:bg-[#2a3c4c] text-white px-7 py-1.5 rounded shadow-sm text-xs font-semibold transition-colors"
                  onClick={() => setIsAuditBillModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 2.5: IP DISCHARGE & FINANCIAL CLEARANCE MODAL ───────────── */}
      {isIpDischargeModalOpen &&
        ipBillingUhid.trim() &&
        (() => {
          const patientName =
            ipBillingPatientInfo?.name || `IP Patient ${ipBillingUhid}`;
          const netPayable = ipNetPayable;

          // Calculate sum of split payments entered
          const totalSplitAmount = ipDischargeSplitRows.reduce(
            (sum, r) => sum + (Number(r.amount) || 0),
            0,
          );
          const remainingDue = Math.max(0, netPayable - totalSplitAmount);

          const handleAddSplitRow = () => {
            setIpDischargeSplitRows([
              ...ipDischargeSplitRows,
              {
                mode: "UPI / QR",
                amount: remainingDue > 0 ? remainingDue : 0,
                refNo: "",
              },
            ]);
          };

          const handleRemoveSplitRow = (index: number) => {
            if (ipDischargeSplitRows.length <= 1) return;
            setIpDischargeSplitRows(
              ipDischargeSplitRows.filter((_, i) => i !== index),
            );
          };

          const handleSplitRowChange = (
            index: number,
            field: "mode" | "amount" | "refNo",
            val: any,
          ) => {
            const updated = [...ipDischargeSplitRows];
            updated[index] = { ...updated[index], [field]: val };
            setIpDischargeSplitRows(updated);
          };

          const handleConfirmDischarge = async () => {
            try {
              if (ipDischargeMode === "pay_now" && netPayable > 0) {
                if (totalSplitAmount < netPayable) {
                  toast.error(
                    "Incomplete Settlement",
                    `Total collected payments (₹${totalSplitAmount}) is less than net bill payable (₹${netPayable}). Please add remaining ₹${remainingDue.toFixed(2)}.`,
                  );
                  return;
                }
                // Save all split payment rows
                const formattedRows = ipDischargeSplitRows.map((r) => ({
                  mode: r.mode,
                  amount: Number(r.amount) || 0,
                  balance: 0,
                  date: new Date().toLocaleDateString("en-GB"),
                  bankName: "",
                  beneficiaryName: "",
                  refNo: r.refNo,
                  description: `Discharge Settlement (${r.mode})`,
                  cardSwipingValue: 0,
                }));
                await handleSaveIpBilling(false);
              } else if (
                ipDischargeMode === "tpa_credit" &&
                !ipDischargeRefNo.trim()
              ) {
                toast.error(
                  "TPA Claim Ref Required",
                  "Please enter TPA Pre-authorization / Claim Clearance Ref No.",
                );
                return;
              } else if (
                ipDischargeMode === "credit_approval" &&
                !ipDischargeNotes.trim()
              ) {
                toast.error(
                  "Override Notes Required",
                  "Please enter Admin / Medical Director authorization notes.",
                );
                return;
              }

              setIpStatus("Discharged");
              setIsIpDischargeModalOpen(false);
              toast.success(
                "Discharge Cleared Successfully",
                `${patientName} (IP: ${ipBillingUhid}) has been marked as Discharged.`,
              );
            } catch (err: any) {
              toast.error(
                "Discharge Failed",
                err.message || "Something went wrong.",
              );
            }
          };

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
              <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                      <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white tracking-wide uppercase">
                        IP Patient Discharge & Financial Clearance
                      </h3>
                      <p className="text-xs text-slate-300 font-mono">
                        Patient:{" "}
                        <span className="font-bold text-white">
                          {patientName}
                        </span>{" "}
                        | UHID:{" "}
                        <span className="font-bold text-blue-300">
                          {ipBillingUhid}
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsIpDischargeModalOpen(false)}
                    className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5 overflow-y-auto bg-slate-50 flex-1 text-xs">
                  {/* Financial Summary Card */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wide flex justify-between items-center">
                      <span className="flex items-center gap-1.5">
                        <ReceiptText className="w-4 h-4 text-blue-600" />{" "}
                        Financial Settlement Breakdown
                      </span>
                      <Badge
                        className={
                          netPayable <= 0
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300 font-mono"
                            : "bg-red-100 text-red-800 border-red-300 font-mono text-xs px-2.5 py-0.5"
                        }
                      >
                        {netPayable <= 0
                          ? "Balance Settled (₹0.00)"
                          : `Net Payable: ₹${netPayable.toFixed(2)}`}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center font-mono">
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="block text-[10px] text-slate-500 font-sans uppercase font-bold">
                          Gross Inpatient Bill
                        </span>
                        <span className="font-bold text-sm text-slate-900">
                          ₹{ipGrossTotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="p-2.5 bg-amber-50/50 rounded-lg border border-amber-200">
                        <span className="block text-[10px] text-amber-700 font-sans uppercase font-bold">
                          Less Discount
                        </span>
                        <span className="font-bold text-sm text-amber-800">
                          ₹{(Number(ipDiscountAmt) || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-200">
                        <span className="block text-[10px] text-emerald-700 font-sans uppercase font-bold">
                          Advance Deposit
                        </span>
                        <span className="font-bold text-sm text-emerald-800">
                          ₹0.00
                        </span>
                      </div>
                      <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-300">
                        <span className="block text-[10px] text-blue-700 font-sans uppercase font-extrabold">
                          Net Payable Balance
                        </span>
                        <span className="font-extrabold text-sm text-blue-900">
                          ₹{netPayable.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Clearance Mode Selection */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Select Discharge Clearance Method
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div
                        onClick={() => setIpDischargeMode("pay_now")}
                        className={`p-3 rounded-xl border cursor-pointer transition-all space-y-1 ${ipDischargeMode === "pay_now" ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-2xs" : "bg-slate-50 border-slate-200 hover:bg-slate-100"}`}
                      >
                        <div className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-emerald-600" />{" "}
                          Full Settlement
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight">
                          Collect cash/card/UPI payments & settle bill
                        </p>
                      </div>

                      <div
                        onClick={() => setIpDischargeMode("tpa_credit")}
                        className={`p-3 rounded-xl border cursor-pointer transition-all space-y-1 ${ipDischargeMode === "tpa_credit" ? "bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-2xs" : "bg-slate-50 border-slate-200 hover:bg-slate-100"}`}
                      >
                        <div className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-blue-600" /> TPA
                          / Insurance Claim
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight">
                          Mark balance as TPA corporate receivable
                        </p>
                      </div>

                      <div
                        onClick={() => setIpDischargeMode("credit_approval")}
                        className={`p-3 rounded-xl border cursor-pointer transition-all space-y-1 ${ipDischargeMode === "credit_approval" ? "bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20 shadow-2xs" : "bg-slate-50 border-slate-200 hover:bg-slate-100"}`}
                      >
                        <div className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-600" />{" "}
                          Credit Approval
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight">
                          Promissory note / Admin override
                        </p>
                      </div>
                    </div>

                    {/* Mode Form Fields: Split Payments */}
                    {ipDischargeMode === "pay_now" && (
                      <div className="pt-2 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 text-xs uppercase tracking-wide">
                            Multi-Mode Payment Collection
                          </span>
                          <Button
                            type="button"
                            onClick={handleAddSplitRow}
                            size="xs"
                            className="h-6 text-[11px] bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" /> Add Payment Mode
                          </Button>
                        </div>

                        {/* Payment Rows Table */}
                        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-100 border-b border-slate-200 font-bold text-[10px] uppercase text-slate-600">
                              <tr>
                                <th className="px-3 py-2">Payment Mode</th>
                                <th className="px-3 py-2 w-44">
                                  Collection Amount (₹)
                                </th>
                                <th className="px-3 py-2">
                                  Ref / Transaction No.
                                </th>
                                <th className="px-3 py-2 w-10 text-center">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {ipDischargeSplitRows.map((row, idx) => (
                                <tr key={idx} className="bg-white">
                                  <td className="p-2">
                                    <Select
                                      value={row.mode}
                                      onValueChange={(val) =>
                                        handleSplitRowChange(idx, "mode", val)
                                      }
                                    >
                                      <SelectTrigger className="h-8 text-xs bg-white border-slate-300">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Cash">
                                          Cash
                                        </SelectItem>
                                        <SelectItem value="UPI / QR">
                                          UPI / QR Code
                                        </SelectItem>
                                        <SelectItem value="Credit Card">
                                          Credit Card
                                        </SelectItem>
                                        <SelectItem value="Debit Card">
                                          Debit Card
                                        </SelectItem>
                                        <SelectItem value="Net Banking">
                                          Net Banking
                                        </SelectItem>
                                        <SelectItem value="Cheque">
                                          Cheque
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </td>
                                  <td className="p-2">
                                    <Input
                                      type="number"
                                      value={row.amount}
                                      onChange={(e) =>
                                        handleSplitRowChange(
                                          idx,
                                          "amount",
                                          Number(e.target.value),
                                        )
                                      }
                                      className="h-8 text-xs font-mono font-bold bg-white border-slate-300 text-right"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <Input
                                      type="text"
                                      value={row.refNo}
                                      onChange={(e) =>
                                        handleSplitRowChange(
                                          idx,
                                          "refNo",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Optional Ref / Txn No..."
                                      className="h-8 text-xs bg-white border-slate-300"
                                    />
                                  </td>
                                  <td className="p-2 text-center">
                                    <button
                                      type="button"
                                      disabled={
                                        ipDischargeSplitRows.length <= 1
                                      }
                                      onClick={() => handleRemoveSplitRow(idx)}
                                      className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-30 cursor-pointer"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Payment Total Status Bar */}
                        <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg border border-slate-200 font-mono text-xs">
                          <div className="flex items-center gap-4">
                            <span>
                              Total Collected:{" "}
                              <strong className="text-emerald-700 font-bold">
                                ₹{totalSplitAmount.toFixed(2)}
                              </strong>
                            </span>
                            <span>
                              Net Bill Payable:{" "}
                              <strong>₹{netPayable.toFixed(2)}</strong>
                            </span>
                          </div>
                          <div>
                            {remainingDue <= 0 ? (
                              <Badge className="bg-emerald-600 text-white font-bold">
                                Fully Settled (100%)
                              </Badge>
                            ) : (
                              <Badge className="bg-red-600 text-white font-bold">
                                Remaining Due: ₹{remainingDue.toFixed(2)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {ipDischargeMode === "tpa_credit" && (
                      <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-[10px] font-bold text-blue-900 uppercase">
                            TPA Pre-authorization Claim Ref No. *
                          </Label>
                          <Input
                            type="text"
                            value={ipDischargeRefNo}
                            onChange={(e) =>
                              setIpDischargeRefNo(e.target.value)
                            }
                            placeholder="Enter TPA approval letter ref no..."
                            className="h-8 text-xs bg-white border-blue-300 font-mono"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] font-bold text-blue-900 uppercase">
                            Insurance Provider / TPA Name
                          </Label>
                          <Input
                            type="text"
                            value={ipBillingPayer || "Star Health Insurance"}
                            readOnly
                            className="h-8 text-xs bg-slate-100 border-blue-200 font-semibold"
                          />
                        </div>
                      </div>
                    )}

                    {ipDischargeMode === "credit_approval" && (
                      <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200 space-y-2">
                        <div>
                          <Label className="text-[10px] font-bold text-amber-900 uppercase">
                            Admin / Manager Authorization Notes *
                          </Label>
                          <Input
                            type="text"
                            value={ipDischargeNotes}
                            onChange={(e) =>
                              setIpDischargeNotes(e.target.value)
                            }
                            placeholder="Enter credit waiver reason or promissory note ref..."
                            className="h-8 text-xs bg-white border-amber-300"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Department Clearance Badges */}
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 text-[11px] font-bold text-slate-700">
                    <span>Department Clearance Status:</span>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]">
                        Doctor Summary: Cleared
                      </Badge>
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]">
                        Nursing Bed: Cleared
                      </Badge>
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]">
                        Pharmacy: Cleared
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsIpDischargeModalOpen(false)}
                    className="h-8 text-xs font-bold px-4"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmDischarge}
                    className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-5 shadow-sm gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Confirm & Complete
                    Discharge Clearance
                  </Button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* ─── MODAL 3: PATIENT SEARCH MODAL ─────────────────────────────────── */}
      {isPatientSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-xs overflow-y-auto p-4">
          <div className="w-full max-w-[1380px] bg-white shadow-2xl border border-slate-200 flex flex-col rounded-xl overflow-hidden h-[90vh] my-4">
            {/* Header */}
            <div className="flex items-center gap-1 bg-slate-900 text-white px-4 py-2.5 text-xs font-bold flex-shrink-0">
              <span className="flex-1 font-bold text-sm tracking-wide">
                Patient Search Directory
              </span>
              <Button
                size="sm"
                onClick={() => setIsPatientSearchModalOpen(false)}
                className="h-7 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                Close
              </Button>
            </div>

            {/* Advanced Search Form */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex-shrink-0">
              {/* Top Filters & Actions */}
              <div className="flex items-center gap-3 bg-[#e2f0fd] p-3 border border-blue-100 text-blue-900 font-semibold rounded-lg mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">
                    Facility
                  </span>
                  <Select
                    value={advSearchFields.facility}
                    onValueChange={(v) =>
                      setAdvSearchFields({ ...advSearchFields, facility: v })
                    }
                  >
                    <SelectTrigger className="h-8 w-64 text-xs bg-white border-blue-300 shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CMK HEALTHCARE PVT. LTD.">
                        CMK HEALTHCARE PVT. LTD.
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">
                    Entry Site
                  </span>
                  <Select
                    value={advSearchFields.entrySite}
                    onValueChange={(v) =>
                      setAdvSearchFields({ ...advSearchFields, entrySite: v })
                    }
                  >
                    <SelectTrigger className="h-8 w-44 text-xs bg-white border-blue-300 shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-- ALL --">-- ALL --</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1"></div>
                <Button
                  onClick={() => fetchAdvancedPatients(1)}
                  className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
                >
                  Filter
                </Button>
                <Button
                  onClick={() =>
                    setAdvSearchFields({
                      uhid: "",
                      bedNo: "",
                      motherName: "",
                      ipNo: "",
                      email: "",
                      fatherName: "",
                      patientName: "",
                      company: "",
                      privilegeCard: "",
                      dob: "",
                      passportNo: "",
                      address: "",
                      phone: "",
                      identityNo: "",
                      mobileNo: "",
                      oldRegNo: "",
                      facility: "CMK HEALTHCARE PVT. LTD.",
                      entrySite: "-- ALL --",
                      searchType: "Search All (Date Range)",
                      typeFilter: "all",
                    })
                  }
                  variant="outline"
                  className="h-8 px-4 bg-white hover:bg-slate-100 text-slate-700 border-slate-300 font-bold text-xs"
                >
                  Clear Filter
                </Button>
              </div>

              {/* Radio options */}
              <div className="flex items-center justify-between px-2 mb-3 text-xs">
                <div className="flex items-center gap-4 font-semibold text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      id="s_criteria"
                      name="searchType"
                      checked={advSearchFields.searchType === "Criteria"}
                      onChange={() =>
                        setAdvSearchFields({
                          ...advSearchFields,
                          searchType: "Criteria",
                        })
                      }
                      className="h-3.5 w-3.5 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <label htmlFor="s_criteria" className="cursor-pointer">
                      Search on Criteria
                    </label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      id="s_all"
                      name="searchType"
                      checked={
                        advSearchFields.searchType === "Search All (Date Range)"
                      }
                      onChange={() =>
                        setAdvSearchFields({
                          ...advSearchFields,
                          searchType: "Search All (Date Range)",
                        })
                      }
                      className="h-3.5 w-3.5 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <label htmlFor="s_all" className="cursor-pointer">
                      Search All (Date Range)
                    </label>
                  </div>
                </div>
                <div className="flex items-center gap-4 font-semibold text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      id="t_all"
                      name="typeFilter"
                      checked={advSearchFields.typeFilter === "all"}
                      onChange={() =>
                        setAdvSearchFields({
                          ...advSearchFields,
                          typeFilter: "all",
                        })
                      }
                      className="h-3.5 w-3.5 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <label htmlFor="t_all" className="cursor-pointer">
                      All
                    </label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      id="t_reg"
                      name="typeFilter"
                      checked={advSearchFields.typeFilter === "Registration"}
                      onChange={() =>
                        setAdvSearchFields({
                          ...advSearchFields,
                          typeFilter: "Registration",
                        })
                      }
                      className="h-3.5 w-3.5 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <label htmlFor="t_reg" className="cursor-pointer">
                      Registration
                    </label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      id="t_enc"
                      name="typeFilter"
                      checked={advSearchFields.typeFilter === "Admission"}
                      onChange={() =>
                        setAdvSearchFields({
                          ...advSearchFields,
                          typeFilter: "Admission",
                        })
                      }
                      className="h-3.5 w-3.5 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <label htmlFor="t_enc" className="cursor-pointer">
                      Encounter
                    </label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      id="t_dis"
                      name="typeFilter"
                      checked={advSearchFields.typeFilter === "Discharge"}
                      onChange={() =>
                        setAdvSearchFields({
                          ...advSearchFields,
                          typeFilter: "Discharge",
                        })
                      }
                      className="h-3.5 w-3.5 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <label htmlFor="t_dis" className="cursor-pointer">
                      Discharge
                    </label>
                  </div>
                </div>
              </div>

              {/* Grid Form */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                <div className="flex flex-col gap-0.5">
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">
                    UHID
                  </Label>
                  <Input
                    className="h-7 text-xs bg-white border-slate-200 font-mono"
                    value={advSearchFields.uhid}
                    onChange={(e) =>
                      setAdvSearchFields({
                        ...advSearchFields,
                        uhid: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">
                    IP No.
                  </Label>
                  <Input
                    className="h-7 text-xs bg-white border-slate-200 font-mono"
                    value={advSearchFields.ipNo}
                    onChange={(e) =>
                      setAdvSearchFields({
                        ...advSearchFields,
                        ipNo: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">
                    Patient Name
                  </Label>
                  <Input
                    className="h-7 text-xs bg-white border-slate-200"
                    value={advSearchFields.patientName}
                    onChange={(e) =>
                      setAdvSearchFields({
                        ...advSearchFields,
                        patientName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">
                    Date of Birth
                  </Label>
                  <Input
                    type="date"
                    className="h-7 text-xs bg-white border-slate-200 font-mono"
                    value={advSearchFields.dob}
                    onChange={(e) =>
                      setAdvSearchFields({
                        ...advSearchFields,
                        dob: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">
                    Phone
                  </Label>
                  <Input
                    className="h-7 text-xs bg-white border-slate-200 font-mono"
                    value={advSearchFields.phone}
                    onChange={(e) =>
                      setAdvSearchFields({
                        ...advSearchFields,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">
                    Mobile #
                  </Label>
                  <Input
                    className="h-7 text-xs bg-white border-slate-200 font-mono"
                    value={advSearchFields.mobileNo}
                    onChange={(e) =>
                      setAdvSearchFields({
                        ...advSearchFields,
                        mobileNo: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">
                    Bed No
                  </Label>
                  <Input
                    className="h-7 text-xs bg-white border-slate-200 font-mono"
                    value={advSearchFields.bedNo}
                    onChange={(e) =>
                      setAdvSearchFields({
                        ...advSearchFields,
                        bedNo: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">
                    E-Mail Id
                  </Label>
                  <Input
                    className="h-7 text-xs bg-white border-slate-200 font-mono"
                    value={advSearchFields.email}
                    onChange={(e) =>
                      setAdvSearchFields({
                        ...advSearchFields,
                        email: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex flex-col gap-0.5">
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">
                    Company
                  </Label>
                  <Input
                    className="h-7 text-xs bg-white border-slate-200"
                    value={advSearchFields.company}
                    onChange={(e) =>
                      setAdvSearchFields({
                        ...advSearchFields,
                        company: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">
                    Passport No
                  </Label>
                  <Input
                    className="h-7 text-xs bg-white border-slate-200 font-mono"
                    value={advSearchFields.passportNo}
                    onChange={(e) =>
                      setAdvSearchFields({
                        ...advSearchFields,
                        passportNo: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">
                    Identity No
                  </Label>
                  <Input
                    className="h-7 text-xs bg-white border-slate-200 font-mono"
                    value={advSearchFields.identityNo}
                    onChange={(e) =>
                      setAdvSearchFields({
                        ...advSearchFields,
                        identityNo: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">
                    Old Reg No
                  </Label>
                  <Input
                    className="h-7 text-xs bg-white border-slate-200 font-mono"
                    value={advSearchFields.oldRegNo}
                    onChange={(e) =>
                      setAdvSearchFields({
                        ...advSearchFields,
                        oldRegNo: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">
                    Mother Name
                  </Label>
                  <Input
                    className="h-7 text-xs bg-white border-slate-200"
                    value={advSearchFields.motherName}
                    onChange={(e) =>
                      setAdvSearchFields({
                        ...advSearchFields,
                        motherName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">
                    Father Name
                  </Label>
                  <Input
                    className="h-7 text-xs bg-white border-slate-200"
                    value={advSearchFields.fatherName}
                    onChange={(e) =>
                      setAdvSearchFields({
                        ...advSearchFields,
                        fatherName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">
                    Privilege Card
                  </Label>
                  <Input
                    className="h-7 text-xs bg-white border-slate-200"
                    value={advSearchFields.privilegeCard}
                    onChange={(e) =>
                      setAdvSearchFields({
                        ...advSearchFields,
                        privilegeCard: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-0.5 col-span-2 lg:col-span-1">
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">
                    Address
                  </Label>
                  <Input
                    className="h-7 text-xs bg-white border-slate-200"
                    value={advSearchFields.address}
                    onChange={(e) =>
                      setAdvSearchFields({
                        ...advSearchFields,
                        address: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Data Table Container */}
            <div className="flex-1 overflow-auto bg-white">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200 uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2 text-center w-14 border-r border-slate-200">
                      Select
                    </th>
                    <th className="px-3 py-2 border-r border-slate-200">
                      UHID
                    </th>
                    <th className="px-3 py-2 border-r border-slate-200">
                      Patient Name
                    </th>
                    <th className="px-3 py-2 border-r border-slate-200">
                      Gender/Age
                    </th>
                    <th className="px-3 py-2 border-r border-slate-200">
                      Registration Date
                    </th>
                    <th className="px-3 py-2 border-r border-slate-200">
                      Company
                    </th>
                    <th className="px-3 py-2 border-r border-slate-200">
                      MobileNo
                    </th>
                    <th className="px-3 py-2 border-r border-slate-200">DOB</th>
                    <th className="px-3 py-2 border-r border-slate-200 w-72">
                      Patient Address
                    </th>
                    <th className="px-3 py-2 border-r border-slate-200">
                      Old Reg No
                    </th>
                    <th className="px-3 py-2">Father Name</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {advIsLoading ? (
                    <tr>
                      <td
                        colSpan={11}
                        className="p-8 text-center text-slate-500 font-bold"
                      >
                        Loading patients...
                      </td>
                    </tr>
                  ) : displayAdvPatients.length === 0 ? (
                    <tr>
                      <td
                        colSpan={11}
                        className="p-8 text-center text-slate-500 font-bold"
                      >
                        No matching patients found.
                      </td>
                    </tr>
                  ) : (
                    displayAdvPatients.map((p, idx) => {
                      const selectThisPatient = () => {
                        if (activeTab === "OP Billing")
                          setOpBillingUhid(p.uhid);
                        else if (activeTab === "IP Billing")
                          setIpBillingUhid(p.uhid);
                        else if (activeTab === "Master Activity List")
                          setMalUhid(p.uhid);
                        else if (activeTab === "Create OP Visit") {
                          setOpUhid(p.uhid);
                          setOpPatientName(p.patientName);
                          setOpDoctor(p.doctor || "Dr. Abhishek Bansal 2273");
                          setOpPayerType(
                            p.company.includes("Insurance") ||
                              p.company.includes("Star")
                              ? "Insurance"
                              : "Direct Patient",
                          );
                          setOpPayer(p.company || "CASH");
                          setOpSponsor(p.company || "CASH");
                        } else if (activeTab === "Advance Collection")
                          setAdvUhid(p.uhid);
                        else if (activeTab === "Credit Note") {
                          setCnUhid(p.uhid);
                          setCnInvoiceNo(`IPCA26/${p.uhid}`);
                        } else if (activeTab === "Refund") {
                          setRefUhid(p.uhid);
                          setRefInvoiceNo(`OPCA26/${p.uhid}`);
                        } else if (activeTab === "Intimation") {
                          setIntUhid(p.uhid);
                          if (p.company && !p.company.includes("CASH"))
                            setIntTpa(p.company);
                        } else {
                          setMalUhid(p.uhid);
                          setInvoiceSearch(p.uhid);
                        }

                        setIsPatientSearchModalOpen(false);
                        toast.success(
                          "Patient Selected",
                          `${p.patientName} (UHID: ${p.uhid}) loaded.`,
                        );
                      };

                      return (
                        <tr
                          key={p.uhid}
                          onClick={selectThisPatient}
                          className={`hover:bg-blue-50/50 cursor-pointer ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}
                        >
                          <td
                            className="px-3 py-2 text-center border-r border-slate-100 text-blue-600 font-bold hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              selectThisPatient();
                            }}
                          >
                            Select
                          </td>
                          <td className="px-3 py-2 border-r border-slate-100 font-mono text-blue-700 font-bold">
                            {p.uhid}
                          </td>
                          <td className="px-3 py-2 border-r border-slate-100 font-bold text-slate-900">
                            {p.patientName}
                          </td>
                          <td className="px-3 py-2 border-r border-slate-100">
                            {p.genderAge}
                          </td>
                          <td className="px-3 py-2 border-r border-slate-100 font-mono">
                            {p.admissionDate
                              ? new Date(p.admissionDate).toLocaleString(
                                  "en-GB",
                                )
                              : ""}
                          </td>
                          <td className="px-3 py-2 border-r border-slate-100">
                            {p.company}
                          </td>
                          <td className="px-3 py-2 border-r border-slate-100 font-mono">
                            {p.mobileNo}
                          </td>
                          <td className="px-3 py-2 border-r border-slate-100 font-mono">
                            {p.dateOfBirth
                              ? new Date(p.dateOfBirth).toLocaleDateString(
                                  "en-GB",
                                )
                              : ""}
                          </td>
                          <td
                            className="px-3 py-2 border-r border-slate-100 truncate max-w-[300px]"
                            title={p.address}
                          >
                            {p.address}
                          </td>
                          <td className="px-3 py-2 border-r border-slate-100 font-mono">
                            -
                          </td>
                          <td className="px-3 py-2">{p.fatherName}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-2 bg-slate-50 text-xs font-bold text-slate-700 flex-shrink-0">
              <div className="flex items-center gap-1">
                <Button
                  disabled={advPage === 1}
                  onClick={() => fetchAdvancedPatients(1)}
                  variant="outline"
                  size="xs"
                  className="h-6 w-8 font-extrabold"
                >
                  &lt;&lt;
                </Button>
                <Button
                  disabled={advPage === 1}
                  onClick={() => fetchAdvancedPatients(advPage - 1)}
                  variant="outline"
                  size="xs"
                  className="h-6 w-8 font-extrabold"
                >
                  &lt;
                </Button>
                <span className="px-2 font-bold text-slate-600">
                  Page {advPage} of {Math.max(1, Math.ceil(advTotalCount / 10))}
                </span>
                <Button
                  disabled={advPage >= Math.ceil(advTotalCount / 10)}
                  onClick={() => fetchAdvancedPatients(advPage + 1)}
                  variant="outline"
                  size="xs"
                  className="h-6 w-8 font-extrabold"
                >
                  &gt;
                </Button>
                <Button
                  disabled={advPage >= Math.ceil(advTotalCount / 10)}
                  onClick={() =>
                    fetchAdvancedPatients(Math.ceil(advTotalCount / 10))
                  }
                  variant="outline"
                  size="xs"
                  className="h-6 w-8 font-extrabold"
                >
                  &gt;&gt;
                </Button>
              </div>
              <div className="text-slate-600 font-bold">
                Total Patients:{" "}
                <span className="text-blue-600">
                  {displayAdvPatients.length}
                </span>
              </div>
            </div>

            {/* Patient Selection Details Banner */}
            <div className="bg-slate-900 text-white px-4 py-2.5 text-xs flex items-center justify-between flex-shrink-0">
              <span className="font-extrabold uppercase tracking-wide text-slate-400">
                Patient Selection Details
              </span>
              <div className="flex gap-8 font-semibold">
                <span>
                  Name: <span className="text-blue-400 font-bold">-</span>
                </span>
                <span>
                  Address: <span className="text-slate-300">-</span>
                </span>
                <span>
                  Kin Name: <span className="text-slate-300">-</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 4: INVOICE SEARCH DIRECTORY MODAL ───────────────────────── */}
      {isInvoiceSearchModalOpen &&
        (() => {
          const filteredInvoices = invoices.filter((inv) => {
            if (!invoiceModalSearchTerm.trim()) return true;
            const term = invoiceModalSearchTerm.trim().toLowerCase();
            return (
              inv.invoiceNo.toLowerCase().includes(term) ||
              inv.uhid.toLowerCase().includes(term) ||
              inv.patientName.toLowerCase().includes(term) ||
              inv.company.toLowerCase().includes(term) ||
              (inv.encNo && inv.encNo.toLowerCase().includes(term))
            );
          });

          return (
            <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-xs overflow-y-auto p-4">
              <div className="w-full max-w-[1200px] bg-white shadow-2xl border border-slate-200 flex flex-col rounded-xl overflow-hidden h-[85vh] my-4">
                {/* Header */}
                <div className="flex items-center gap-1 bg-slate-900 text-white px-4 py-2.5 text-xs font-bold flex-shrink-0">
                  <span className="flex-1 font-bold text-sm tracking-wide">
                    Invoice Search Directory
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setIsInvoiceSearchModalOpen(false)}
                    className="h-7 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                  >
                    Close
                  </Button>
                </div>

                {/* Filter Bar */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 flex-shrink-0">
                  <div className="flex items-center gap-2 flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400" />
                    <Input
                      type="text"
                      value={invoiceModalSearchTerm}
                      onChange={(e) =>
                        setInvoiceModalSearchTerm(e.target.value)
                      }
                      placeholder="Search by Invoice No, UHID, Patient Name, or Enc No..."
                      className="h-8 text-xs bg-white border-slate-300 font-medium"
                      autoFocus
                    />
                    {invoiceModalSearchTerm && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setInvoiceModalSearchTerm("")}
                        className="h-6 text-xs text-slate-500"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 font-bold">
                    Found{" "}
                    <span className="text-blue-600 font-black">
                      {filteredInvoices.length}
                    </span>{" "}
                    Invoices
                  </div>
                </div>

                {/* Table Body */}
                <div className="flex-1 overflow-auto bg-white p-4">
                  <table className="w-full text-xs text-left border rounded-lg overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200 uppercase text-[10px]">
                      <tr>
                        <th className="px-3 py-2 text-center w-16 border-r border-slate-200">
                          Action
                        </th>
                        <th className="px-3 py-2 border-r border-slate-200">
                          Invoice No
                        </th>
                        <th className="px-3 py-2 border-r border-slate-200">
                          UHID
                        </th>
                        <th className="px-3 py-2 border-r border-slate-200">
                          Patient Name
                        </th>
                        <th className="px-3 py-2 border-r border-slate-200">
                          Type
                        </th>
                        <th className="px-3 py-2 border-r border-slate-200">
                          Company
                        </th>
                        <th className="px-3 py-2 border-r border-slate-200 text-right">
                          Gross (₹)
                        </th>
                        <th className="px-3 py-2 border-r border-slate-200 text-right">
                          Net Amount (₹)
                        </th>
                        <th className="px-3 py-2 border-r border-slate-200 text-right">
                          Paid (₹)
                        </th>
                        <th className="px-3 py-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      {filteredInvoices.length === 0 ? (
                        <tr>
                          <td
                            colSpan={10}
                            className="p-8 text-center text-slate-400 font-bold"
                          >
                            No matching invoices found in database.
                          </td>
                        </tr>
                      ) : (
                        filteredInvoices.map((inv, idx) => {
                          const handleApplyInvoice = () => {
                            if (activeTab === "Refund") {
                              handleSelectRefundInvoice(inv.invoiceNo);
                            } else if (activeTab === "Credit Note") {
                              handleSelectCreditNoteInvoice(inv.invoiceNo);
                            } else if (activeTab === "OP Billing") {
                              setOpBillingInvoiceNo(inv.invoiceNo);
                              setOpBillingUhid(inv.uhid);
                            } else {
                              setMalBillNo(inv.invoiceNo);
                            }
                            setIsInvoiceSearchModalOpen(false);
                            toast.success(
                              "Invoice Selected",
                              `Invoice ${inv.invoiceNo} (${inv.patientName}) loaded.`,
                            );
                          };

                          return (
                            <tr
                              key={inv.id || inv.invoiceNo}
                              onClick={handleApplyInvoice}
                              className={`hover:bg-blue-50/50 cursor-pointer ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}
                            >
                              <td className="px-3 py-2 text-center border-r border-slate-100">
                                <Button
                                  size="xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApplyInvoice();
                                  }}
                                  className="h-5 text-[10px] px-2 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                                >
                                  Select
                                </Button>
                              </td>
                              <td className="px-3 py-2 border-r border-slate-100 font-mono font-bold text-blue-700">
                                {inv.invoiceNo}
                              </td>
                              <td className="px-3 py-2 border-r border-slate-100 font-mono text-slate-600">
                                {inv.uhid}
                              </td>
                              <td className="px-3 py-2 border-r border-slate-100 font-bold text-slate-900">
                                {inv.patientName}
                              </td>
                              <td className="px-3 py-2 border-r border-slate-100">
                                {inv.type}
                              </td>
                              <td className="px-3 py-2 border-r border-slate-100 text-slate-600">
                                {inv.company}
                              </td>
                              <td className="px-3 py-2 border-r border-slate-100 text-right font-mono text-slate-500">
                                ₹{inv.grossAmt.toFixed(2)}
                              </td>
                              <td className="px-3 py-2 border-r border-slate-100 text-right font-mono font-bold text-slate-800">
                                ₹{inv.netAmt.toFixed(2)}
                              </td>
                              <td className="px-3 py-2 border-r border-slate-100 text-right font-mono text-emerald-600 font-bold">
                                ₹{inv.paidPatient.toFixed(2)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <Badge
                                  variant="outline"
                                  className={
                                    inv.status === "Settled"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : inv.status === "Refundable"
                                        ? "bg-amber-50 text-amber-700 border-amber-200"
                                        : inv.status === "Cancelled"
                                          ? "bg-rose-50 text-rose-700 border-rose-200"
                                          : "bg-blue-50 text-blue-700 border-blue-200"
                                  }
                                >
                                  {inv.status}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Visit/Consultation Order Modal matching screenshot */}
      {isConsultationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-300 flex flex-col">
            {/* Modal Title Bar */}
            <div className="bg-gradient-to-r from-teal-700 to-teal-800 text-white px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs">
                <Stethoscope className="w-4 h-4 text-emerald-300" />
                <span>Visit/Consultation Order</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsConsultationModalOpen(false)}
                  className="h-6 text-[11px] px-3 bg-white text-slate-700 hover:bg-slate-100 border-slate-300 font-bold cursor-pointer"
                >
                  Close
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (consultationGrid.length === 0) {
                      toast.error("Grid is empty", "Please add at least one consultation to grid.");
                      return;
                    }
                    // Update prescribing doctor in OP Billing to the consultant doctor
                    const primaryDoc = consultationGrid[0].provider;
                    if (primaryDoc) {
                      setOpBillingPrescribingDoctor(primaryDoc);
                    }
                    // Add grid items to OP billing items
                    const newItems = consultationGrid.map((item, idx) => ({
                      code: `CONS-0${idx + 1}`,
                      name: item.visitType,
                      dept: item.dept || "General OPD",
                      rate: item.rate,
                      qty: 1,
                      discountPercent: 0,
                      discountAmt: 0,
                      netAmt: item.rate,
                    }));
                    setOpBillingItems((prev) => [...prev, ...newItems]);
                    setIsConsultationModalOpen(false);
                    toast.success(
                      "Consultation Added",
                      `Added ${consultationGrid.length} consultation line item(s) for Doctor ${primaryDoc}.`
                    );
                  }}
                  className="h-6 text-[11px] px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Proceed
                </Button>
              </div>
            </div>

            {/* Patient Details Header Box (Pinkish / Light Red Box matching screenshot) */}
            <div className="bg-rose-50/70 border-b border-rose-100 px-4 py-2 text-xs flex items-center justify-between font-medium text-slate-700">
              <div>
                <span className="text-slate-500 font-bold">Reg.# </span>
                <span className="font-bold text-rose-700 font-mono">
                  {opBillingUhid || "2727"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-bold">Patient: </span>
                <span className="font-bold text-rose-700">
                  {opBillingPatientInfo?.name || "Mr. Jafar"}, {opBillingPatientInfo?.genderAge || "Male/36 Yr"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-bold">DOB: </span>
                <span className="font-semibold text-slate-700">07/09/1990</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold">Mobile No: </span>
                <span className="font-bold text-rose-700 font-mono">
                  {opBillingPatientInfo?.mobile || "7053099066"}
                </span>
              </div>
            </div>

            {/* Controls Form Area */}
            <div className="p-4 space-y-3 bg-white">
              <div className="grid grid-cols-12 gap-3 items-center text-xs">
                {/* Specialisation */}
                <div className="col-span-6 flex items-center gap-2">
                  <label className="w-28 text-slate-600 font-bold text-right">
                    Specialisation
                  </label>
                  <SearchableDropdown
                    value={consultationSpecialisation}
                    options={MEDICAL_SPECIALISATIONS}
                    onSelect={(spec) => {
                      setConsultationSpecialisation(spec);
                      if (spec === "All" || spec === "General" || spec === "General OPD") {
                        setConsultationVisitType("GENERAL OPD CONSULTATION");
                      } else {
                        setConsultationVisitType(`${spec.toUpperCase()} CONSULTATION`);
                      }
                    }}
                    placeholder="Search Specialisation..."
                    width="w-full"
                  />
                </div>

                {/* Provider * (Consultant Doctor) */}
                <div className="col-span-6 flex items-center gap-2">
                  <label className="w-24 text-slate-600 font-bold text-right">
                    Provider <span className="text-rose-500">*</span>
                  </label>
                  <SearchableDropdown
                    value={consultationProvider}
                    options={availableDoctors}
                    onSelect={(doc) => setConsultationProvider(doc)}
                    placeholder="Search Provider..."
                    width="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-3 items-center text-xs">
                {/* Op Visit Type */}
                <div className="col-span-9 flex items-center gap-2">
                  <label className="w-28 text-slate-600 font-bold text-right">
                    Op Visit Type
                  </label>
                  <select
                    value={consultationVisitType}
                    onChange={(e) => setConsultationVisitType(e.target.value)}
                    className="flex-1 h-7 text-xs border border-slate-300 rounded px-2 bg-white text-slate-800 font-semibold uppercase focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="ORTHOPAEDIC CONSULTATION">ORTHOPAEDIC CONSULTATION</option>
                    <option value="GENERAL OPD CONSULTATION">GENERAL OPD CONSULTATION</option>
                    <option value="CARDIOLOGY CONSULTATION">CARDIOLOGY CONSULTATION</option>
                    <option value="FOLLOW-UP CONSULTATION">FOLLOW-UP CONSULTATION</option>
                    <option value="EMERGENCY CONSULTATION">EMERGENCY CONSULTATION</option>
                    <option value="SENIOR CONSULTANT VISIT">SENIOR CONSULTANT VISIT</option>
                  </select>
                </div>

                {/* Add To Grid Button */}
                <div className="col-span-3 flex justify-end">
                  <Button
                    type="button"
                    onClick={() => {
                      const newRow = {
                        id: String(Date.now()),
                        provider: consultationProvider,
                        visitType: consultationVisitType,
                        dept: consultationSpecialisation,
                        rate: 700,
                      };
                      setConsultationGrid((prev) => [...prev, newRow]);
                      toast.success("Added to Grid", `${consultationVisitType} for ${consultationProvider}`);
                    }}
                    className="h-7 text-xs px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer"
                  >
                    Add To Grid
                  </Button>
                </div>
              </div>

              {/* Consultation Grid Table */}
              <div className="border border-slate-200 rounded overflow-hidden mt-2">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2 w-1/3">Provider</th>
                      <th className="px-3 py-2 w-1/2">Visit Type</th>
                      <th className="px-3 py-2 text-right">Rate</th>
                      <th className="px-3 py-2 text-center w-16">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {consultationGrid.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400 italic">
                          No consultation visits added to grid yet.
                        </td>
                      </tr>
                    ) : (
                      consultationGrid.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-semibold text-slate-800">
                            {row.provider}
                          </td>
                          <td className="px-3 py-2 text-slate-700 uppercase">
                            {row.visitType}
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-slate-800">
                            {row.rate.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setConsultationGrid((prev) =>
                                  prev.filter((item) => item.id !== row.id)
                                );
                              }}
                              className="text-rose-500 hover:text-rose-700 p-0.5 rounded cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Footer Info Bar matching screenshot */}
            <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 text-[11px] font-semibold text-slate-600 flex items-center justify-between">
              <div>
                Last Visited : <span className="font-bold text-slate-800">07/09/2026 3.09PM (2 Days)</span>
              </div>
              <div>
                For : <span className="font-bold text-blue-700 uppercase">{consultationVisitType}</span>
              </div>
              <div>
                By Doctor : <span className="font-bold text-teal-700">{consultationProvider}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Doctor Modal */}
      <AddDoctorModal
        isOpen={isAddDoctorModalOpen}
        onClose={() => setIsAddDoctorModalOpen(false)}
        onDoctorCreated={(newDoc) => {
          if (doctorTargetField === "prescribing") {
            setOpBillingPrescribingDoctor(newDoc);
          } else if (doctorTargetField === "opDoctor") {
            setOpDoctor(newDoc);
          } else if (doctorTargetField === "orderDoctor") {
            setOrderDoctor(newDoc);
          }
        }}
      />
    </div>
  );
}
