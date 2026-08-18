import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  BedDouble,
  Building2,
  Users,
  Search,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRightLeft,
  LogOut,
  Sparkles,
  DollarSign,
  UserPlus,
  ShieldCheck,
  ChevronRight,
  Filter,
  FileText,
  Phone,
  Calendar,
  Stethoscope,
  Activity,
  Layers,
  Upload,
  Trash2,
  Save,
  CheckSquare,
  HelpCircle,
  MapPin,
  Mail,
  UserCheck,
  Maximize2,
  Plus
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
  getBeds,
  admitPatientToBed,
  transferPatientBed,
  initiateBedDischarge,
  completeBedDischarge,
  updateBedStatus,
  createBed,
  deleteBed,
  BedItem,
  BedCounts
} from "@/api/atdApi";
import { getPatients, PatientData } from "@/api/patientApi";
import { getBedCategories, type BedCategoryData } from "@/api/bedCategoryApi";
import { useNavigate } from "react-router-dom";

// ─── BED STATUS METRIC BADGE DEFINITIONS ─────────────────────────────────────
const STATUS_CONFIGS = [
  { key: "Vacant", label: "Vacant", bgClass: "bg-[#5cb85c] hover:bg-[#4cae4c] text-white", borderClass: "border-[#4cae4c]" },
  { key: "Occupied", label: "Occupied", bgClass: "bg-[#d9534f] hover:bg-[#c9302c] text-white", borderClass: "border-[#d43f3a]" },
  { key: "House Keeping", label: "House Keeping", bgClass: "bg-[#f0ad4e] hover:bg-[#ec971f] text-white", borderClass: "border-[#eea236]" },
  { key: "Retain", label: "Retain", bgClass: "bg-[#6f42c1] hover:bg-[#5a32a3] text-white", borderClass: "border-[#5a32a3]" },
  { key: "Blocked", label: "Blocked", bgClass: "bg-[#6c757d] hover:bg-[#5a6268] text-white", borderClass: "border-[#545b62]" },
  { key: "Under Repair", label: "Under Repair", bgClass: "bg-[#5bc0de] hover:bg-[#31b0d5] text-white", borderClass: "border-[#46b8da]" },
  { key: "Still On Bed/Discharge Approval", label: "Still On Bed/Discharge Approval", bgClass: "bg-[#c9302c] hover:bg-[#ac2925] text-white", borderClass: "border-[#ac2925]" },
];

export default function AtdPage() {
  const navigate = useNavigate();

  // ─── Filter & State ──────────────────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [patientSearch, setPatientSearch] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [beds, setBeds] = useState<BedItem[]>([]);
  const [wardCategories, setWardCategories] = useState<BedCategoryData[]>([]);
  const [counts, setCounts] = useState<BedCounts>({
    vacant: 27,
    occupied: 2,
    houseKeeping: 1,
    retain: 0,
    blocked: 0,
    underRepair: 0,
    stillOnBed: 0,
    total: 30,
  });

  // ─── Bed Context Menu State (Floating Popup on Bed Click) ─────────────────────
  const [contextMenuBed, setContextMenuBed] = useState<BedItem | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // ─── Modal States ────────────────────────────────────────────────────────────
  const [selectedBed, setSelectedBed] = useState<BedItem | null>(null);
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [isInpatientDrawerOpen, setIsInpatientDrawerOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isHousekeepingModalOpen, setIsHousekeepingModalOpen] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // ─── Add Bed Modal State ───────────────────────────────────────────────────
  const [isAddBedModalOpen, setIsAddBedModalOpen] = useState(false);
  const [addBedMode, setAddBedMode] = useState<"single" | "bulk">("single");
  const [newBedForm, setNewBedForm] = useState({
    bedNo: "",
    category: "GENERAL",
    ward: "Ground Floor - General Ward",
    tariffRate: 1200,
    status: "Vacant",
    bulkCount: 5,
    prefix: "GEN-",
    startNumber: 11,
  });
  const [isAddingBed, setIsAddingBed] = useState(false);

  // ─── Patient Lookup Modal State (When clicking UHID) ─────────────────────────
  const [isPatientLookupOpen, setIsPatientLookupOpen] = useState(false);
  const [lookupSearchTerm, setLookupSearchTerm] = useState("");
  const [censusPatients, setCensusPatients] = useState<PatientData[]>([]);
  const [isCensusLoading, setIsCensusLoading] = useState(false);

  // ─── Fetch Census Patients dynamically from Backend API ───────────────────────
  const fetchCensusPatients = useCallback(async (search: string = "") => {
    setIsCensusLoading(true);
    try {
      const data = await getPatients({ search, limit: 50 });
      setCensusPatients(data.patients || []);
    } catch (err) {
      console.error("Failed to load census patients from API:", err);
      setCensusPatients([]);
    } finally {
      setIsCensusLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isPatientLookupOpen) {
      const timer = setTimeout(() => {
        fetchCensusPatients(lookupSearchTerm);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isPatientLookupOpen, lookupSearchTerm, fetchCensusPatients]);

  // ─── Bottom Tab in Admission Modal ───────────────────────────────────────────
  const [admissionBottomTab, setAdmissionBottomTab] = useState<"kin" | "outstanding" | "address" | "custom">("kin");

  // ─── Comprehensive Admission Form State (Exact match to Screenshot 2) ────────
  const [admitForm, setAdmitForm] = useState({
    // Top Bar
    uhid: "",
    bookingNo: "",
    ipNo: "",
    photoUrl: "",
    
    // Admission Detail (Section 1)
    dateTime: `${new Date().toLocaleDateString("en-GB")} ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
    admittingTeam: "General Medicine Team A",
    treatingConsultant: "Dr. Abhishek Bansal 2273",
    admittingDoctor: "Dr. Abhishek Bansal 2273",
    secondaryDoctor: "Select",
    referType: "Internal Provider",
    referBy: "Direct / OPD Desk",
    admissionType: "Elective",

    ward: "TWIN SHARING",
    bedCategory: "TWIN SHARING",
    billingCategory: "DELUXE ROOM",
    bedNo: "TWIN-S-05",
    expectedDischargeDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB"),
    minAdvRequire: 0,
    estimatedAmt: 15000,
    mlc: false,
    handleWithCare: false,

    source: "Direct Patient",
    payerType: "Direct Patient",
    payer: "CASH / CASH",
    sponsor: ".Select..",
    insuranceCompany: "Please Select Sub Company",

    // Section 2: Kin Details Tab
    kinPrevious: "",
    kinNoOfAttendant: "1",
    kinName: "",
    kinRelationship: "Spouse",
    kinGender: "Male",
    kinDob: "1990-05-15",

    kinAddress: "Flat 402, Block B, Institutional Area",
    kinCountry: "INDIA",
    kinState: "New Delhi",
    kinDistrictCity: "NEW DELHI",
    kinPinCode: "110092",

    kinHomePhone: "",
    kinMobile: "9876543210",
    kinEmail: "",
    kinRemarks: "",
    kinBookingRemarks: "",

    // Permanent Address Tab
    permAddress: "Same as Kin Address",
    permCity: "New Delhi",
    permState: "Delhi",
    permPincode: "110092",

    // Custom Fields Tab
    idProofType: "Aadhaar Card",
    idProofNo: "9876 5432 1098",
    bloodGroup: "B+",
    dietPref: "Vegetarian",
    notes: "",
  });

  // Transfer Form State
  const [targetTransferBedNo, setTargetTransferBedNo] = useState("");
  const [transferReason, setTransferReason] = useState("Shifted to higher level care / room upgrade");

  // ─── Custom Photo Upload Handler ─────────────────────────────────────────────
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setAdmitForm((prev) => ({ ...prev, photoUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // ─── Fetch Beds from API ─────────────────────────────────────────────────────
  const fetchBeds = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getBeds({
        category: selectedCategory,
        status: selectedStatus,
        search: patientSearch,
      });
      setBeds(data.beds);
      setCounts(data.counts);

      const cats = await getBedCategories();
      setWardCategories(cats);
    } catch (err) {
      console.error("Failed to load ATD beds:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedStatus, patientSearch]);

  useEffect(() => {
    fetchBeds();
  }, [fetchBeds]);

  // Group beds by Category
  const groupedBeds = useMemo(() => {
    const groups: { [key: string]: BedItem[] } = {};
    
    // Initialize groups based on dynamic categories
    wardCategories.forEach((cat) => {
      groups[cat.name] = [];
    });

    beds.forEach((bed) => {
      if (groups[bed.category]) {
        groups[bed.category].push(bed);
      } else {
        groups[bed.category] = [bed];
      }
    });

    return groups;
  }, [beds, wardCategories]);

  // List of all vacant beds for transfer dropdown
  const vacantBeds = useMemo(() => {
    return beds.filter((b) => b.status === "Vacant");
  }, [beds]);

  // Close context menu on outside click
  useEffect(() => {
    const handleOutside = () => setContextMenuBed(null);
    window.addEventListener("click", handleOutside);
    return () => window.removeEventListener("click", handleOutside);
  }, []);

  // ─── Bed Click Handler (Opens Context Menu matching Screenshot 1) ────────────
  const handleBedClick = (bed: BedItem, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const numItems = (bed.status === "Vacant" || bed.status === "House Keeping") ? 3 : 2;
    const menuHeight = (numItems * 30) + 10; // Dynamic height based on number of options
    let top = rect.bottom + window.scrollY + 4;
    
    // If it goes off the bottom of the screen, flip it above the button
    if (rect.bottom + menuHeight > window.innerHeight) {
      top = rect.top + window.scrollY - menuHeight - 4;
    }

    setMenuPosition({
      top,
      left: Math.max(10, rect.left + window.scrollX - 20),
    });
    setContextMenuBed(bed);
  };

  // ─── Trigger Admission Form (Matching Screenshot 2) ──────────────────────────
  const openAdmissionDialog = (bed: BedItem) => {
    setSelectedBed(bed);
    setContextMenuBed(null);

    const randomUhid = `UHID-2026-0000${Math.floor(Math.random() * 89) + 10}`;
    const randomBooking = `BKG-${Math.floor(Math.random() * 89999) + 10000}`;
    const randomIp = `IP-2026/${(beds.filter((b) => b.patient).length + 145).toString()}`;

    setAdmitForm((prev) => ({
      ...prev,
      uhid: randomUhid,
      bookingNo: randomBooking,
      ipNo: randomIp,
      photoUrl: "",
      ward: bed.ward || bed.category,
      bedCategory: bed.category,
      billingCategory: bed.category === "DELUXE" ? "DELUXE ROOM" : bed.category === "GENERAL" ? "GENERAL WARD" : "TWIN SHARING",
      bedNo: bed.bedNo,
      minAdvRequire: bed.tariffRate,
      estimatedAmt: bed.tariffRate * 3,
      kinName: "Sanjay Sharma",
      kinMobile: "9876543210",
    }));

    setIsAdmitModalOpen(true);
  };

  // ─── Select Patient from Census Lookup (Full Details & Photo from API) ───────
  const handleSelectPatientFromLookup = (patient: PatientData) => {
    const dobFormatted = patient.dob
      ? new Date(patient.dob).toISOString().split("T")[0]
      : "1990-05-15";
    const fullName = patient.fullName || `${patient.firstName || ""} ${patient.lastName || ""}`.trim();
    const address = patient.address || "";
    const city = patient.districtCity || "New Delhi";
    const state = patient.state || "Delhi";
    const pinCode = patient.pinCode || "";
    const payer = patient.payer || (patient.payerType === "insurance" ? "Star Health Insurance" : "CASH / CASH");
    const payerType = patient.payerType === "insurance" ? "TPA / Insurance" : "Direct Patient";
    const doctor = patient.referredBy || "Dr. Abhishek Bansal 2273";

    setAdmitForm((prev) => ({
      ...prev,
      photoUrl: patient.photoUrl || "",
      uhid: patient.uhid || prev.uhid,
      kinName: fullName,
      kinMobile: patient.mobile || prev.kinMobile,
      kinEmail: patient.email || "",
      kinGender: patient.gender || "Male",
      kinDob: dobFormatted,
      kinRelationship: patient.emergencyRelationship || patient.guardianRelation || "Spouse",
      kinAddress: address,
      kinDistrictCity: city,
      kinState: state,
      kinPinCode: pinCode,
      permAddress: address,
      permCity: city,
      permState: state,
      permPincode: pinCode,
      payer: payer,
      payerType: payerType,
      admittingTeam: "General Medicine Team A",
      treatingConsultant: doctor,
      admittingDoctor: doctor,
      idProofType: "Aadhaar Card",
      idProofNo: patient.aadhaarCard || "9876 5432 1098",
      bloodGroup: "B+",
      dietPref: "Vegetarian",
      kinRemarks: patient.remarks || "",
      kinBookingRemarks: patient.registrationType || "Standard Admission",
    }));
    setIsPatientLookupOpen(false);
  };

  // ─── Trigger Patient Details Drawer ──────────────────────────────────────────
  const openPatientDetails = (bed: BedItem) => {
    setSelectedBed(bed);
    setContextMenuBed(null);
    if (bed.status === "Occupied" || bed.status === "Still On Bed/Discharge Approval") {
      setIsInpatientDrawerOpen(true);
    } else if (bed.status === "House Keeping") {
      setIsHousekeepingModalOpen(true);
    } else {
      openAdmissionDialog(bed);
    }
  };

  // ─── Submit Admission ────────────────────────────────────────────────────────
  const handleAdmitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBed) return;

    try {
      await admitPatientToBed({
        bedId: selectedBed.id,
        bedNo: admitForm.bedNo || selectedBed.bedNo,
        uhid: admitForm.uhid,
        patientName: admitForm.kinName ? `${admitForm.kinName} (Patient)` : "Admitted Patient",
        bookingNo: admitForm.bookingNo,
        ipNo: admitForm.ipNo,
        admittingTeam: admitForm.admittingTeam,
        treatingConsultant: admitForm.treatingConsultant,
        admittingDoctor: admitForm.admittingDoctor,
        secondaryDoctor: admitForm.secondaryDoctor,
        referType: admitForm.referType,
        referBy: admitForm.referBy,
        admissionType: admitForm.admissionType,
        ward: admitForm.ward,
        bedCategory: admitForm.bedCategory,
        billingCategory: admitForm.billingCategory,
        expectedDischargeDate: admitForm.expectedDischargeDate,
        minAdvRequire: Number(admitForm.minAdvRequire || 0),
        estimatedAmt: Number(admitForm.estimatedAmt || 0),
        mlc: admitForm.mlc,
        handleWithCare: admitForm.handleWithCare,
        source: admitForm.source,
        payerType: admitForm.payerType,
        payer: admitForm.payer,
        sponsor: admitForm.sponsor,
        insuranceCompany: admitForm.insuranceCompany,
        kinDetails: {
          previousKin: admitForm.kinPrevious,
          noOfAttendant: admitForm.kinNoOfAttendant,
          name: admitForm.kinName,
          relationship: admitForm.kinRelationship,
          gender: admitForm.kinGender,
          dob: admitForm.kinDob,
          address: admitForm.kinAddress,
          country: admitForm.kinCountry,
          state: admitForm.kinState,
          districtCity: admitForm.kinDistrictCity,
          pinCode: admitForm.kinPinCode,
          homePhone: admitForm.kinHomePhone,
          mobile: admitForm.kinMobile,
          email: admitForm.kinEmail,
          remarks: admitForm.kinRemarks,
          bookingRemarks: admitForm.kinBookingRemarks,
        },
        advancePaid: Number(admitForm.minAdvRequire || 0),
      });

      setIsAdmitModalOpen(false);
      fetchBeds();
    } catch (err: any) {
      alert(err.message || "Failed to admit patient");
    }
  };

  // ─── Submit Bed Transfer ─────────────────────────────────────────────────────
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBed || !targetTransferBedNo) return;

    try {
      await transferPatientBed({
        fromBedNo: selectedBed.bedNo,
        toBedNo: targetTransferBedNo,
        reason: transferReason,
      });
      setIsTransferModalOpen(false);
      setIsInpatientDrawerOpen(false);
      fetchBeds();
    } catch (err: any) {
      alert(err.message || "Transfer failed");
    }
  };

  // ─── Initiate Discharge ──────────────────────────────────────────────────────
  const handleInitiateDischarge = async () => {
    if (!selectedBed) return;
    try {
      await initiateBedDischarge(selectedBed.bedNo, "Doctor cleared for discharge. Send clearance to billing.");
      setIsInpatientDrawerOpen(false);
      fetchBeds();
    } catch (err: any) {
      alert(err.message || "Failed to initiate discharge");
    }
  };

  // ─── Complete Discharge ──────────────────────────────────────────────────────
  const handleCompleteDischarge = async () => {
    if (!selectedBed) return;
    try {
      await completeBedDischarge(selectedBed.bedNo);
      setIsInpatientDrawerOpen(false);
      fetchBeds();
    } catch (err: any) {
      alert(err.message || "Failed to complete discharge");
    }
  };

  // ─── Add Bed Form Submit ───────────────────────────────────────────────────
  const handleAddBedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingBed(true);
    try {
      if (addBedMode === "single") {
        if (!newBedForm.bedNo.trim()) {
          alert("Please enter a valid Bed Number (e.g. GEN-11 or DLX-06)");
          setIsAddingBed(false);
          return;
        }
        await createBed({
          bedNo: newBedForm.bedNo.trim(),
          category: newBedForm.category,
          ward: newBedForm.ward,
          tariffRate: Number(newBedForm.tariffRate) || 2000,
          status: newBedForm.status,
        });
      } else {
        await createBed({
          category: newBedForm.category,
          ward: newBedForm.ward,
          tariffRate: Number(newBedForm.tariffRate) || 2000,
          status: newBedForm.status,
          bulkCount: Number(newBedForm.bulkCount) || 5,
          prefix: newBedForm.prefix || "GEN-",
          startNumber: Number(newBedForm.startNumber) || 1,
        });
      }
      setIsAddBedModalOpen(false);
      fetchBeds();
    } catch (err: any) {
      alert(err.message || "Failed to add bed(s)");
    } finally {
      setIsAddingBed(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-slate-100 overflow-hidden font-sans text-slate-800">
      {/* ─── MAIN ATD BED MATRIX VIEW ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {/* Top Controls & Filter Bar (Matching Screenshot) */}
        <div className="p-3 bg-white border-b border-slate-200 shadow-2xs flex-shrink-0">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-800">Bed Status</h1>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[11px] font-bold">
                Live Inpatient Census
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedStatus("All");
                  setPatientSearch("");
                }}
                className="text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
              >
                Show all
              </button>
              <span className="text-slate-300">|</span>
              <span className="text-slate-600 font-medium">Preferred Bed Category (0)</span>
              <Button
                size="sm"
                variant="outline"
                onClick={fetchBeds}
                className="h-7 text-xs font-bold gap-1 ml-2 bg-white"
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const targetCatName = selectedCategory !== "All" ? selectedCategory : wardCategories[0]?.name || "GENERAL";
                  const targetCat = wardCategories.find(c => c.name === targetCatName);
                  
                  const defaultPrefix = targetCat?.prefix || "BED-";
                  const existingCount = beds.filter(b => b.category === targetCatName).length;
                  
                  setNewBedForm({
                    bedNo: `${defaultPrefix}${String(existingCount + 1).padStart(2, "0")}`,
                    category: targetCatName,
                    ward: targetCat?.ward || "General Ward",
                    tariffRate: targetCat?.tariffRate || 2000,
                    status: "Vacant",
                    bulkCount: 5,
                    prefix: defaultPrefix,
                    startNumber: existingCount + 1,
                  });
                  setIsAddBedModalOpen(true);
                }}
                className="h-7 text-xs font-black gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-xs ml-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Bed
              </Button>
            </div>
          </div>

          {/* Filter Inputs Grid (Matching Screenshot) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
            
            {/* Bed Category Dropdown */}
            <div className="md:col-span-4 flex items-center gap-2">
              <Label className="text-[11px] font-bold text-slate-700 whitespace-nowrap">Bed Category:</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-7 text-xs bg-white border-slate-300 flex-1 font-medium">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {wardCategories.map((cat) => (
                    <SelectItem key={cat.name} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bed Status Dropdown */}
            <div className="md:col-span-4 flex items-center gap-2">
              <Label className="text-[11px] font-bold text-slate-700 whitespace-nowrap">Bed Status:</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-7 text-xs bg-white border-slate-300 flex-1 font-medium">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  {STATUS_CONFIGS.map((st) => (
                    <SelectItem key={st.key} value={st.key}>
                      {st.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Patient Search */}
            <div className="md:col-span-4 flex items-center gap-2">
              <Label className="text-[11px] font-bold text-slate-700 whitespace-nowrap">Patient:</Label>
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by regno, ipno, name..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="h-7 text-xs pl-8 pr-6 bg-white border-slate-300"
                />
                {patientSearch && (
                  <button
                    onClick={() => setPatientSearch("")}
                    className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ─── STATUS LEGEND BUTTONS WITH EXACT COUNTS (MATCHING SCREENSHOT) ─── */}
          <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
            {STATUS_CONFIGS.map((cfg) => {
              let count = 0;
              if (cfg.key === "Vacant") count = counts.vacant;
              else if (cfg.key === "Occupied") count = counts.occupied;
              else if (cfg.key === "House Keeping") count = counts.houseKeeping;
              else if (cfg.key === "Retain") count = counts.retain;
              else if (cfg.key === "Blocked") count = counts.blocked;
              else if (cfg.key === "Under Repair") count = counts.underRepair;
              else if (cfg.key === "Still On Bed/Discharge Approval") count = counts.stillOnBed;

              const isSelected = selectedStatus === cfg.key;

              return (
                <button
                  key={cfg.key}
                  onClick={() => setSelectedStatus(isSelected ? "All" : cfg.key)}
                  className={`px-2.5 py-1 rounded text-xs font-bold border transition-all flex items-center gap-1 shadow-2xs cursor-pointer ${
                    cfg.bgClass
                  } ${isSelected ? "ring-2 ring-blue-600 ring-offset-1 scale-105" : "opacity-95"}`}
                >
                  <span>{cfg.label}</span>
                  <span className="font-mono font-black">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── CATEGORIZED BED MATRIX GRID (MATCHING SCREENSHOT) ─────────────── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {Object.entries(groupedBeds).map(([catName, catBeds]) => {
            if (catBeds.length === 0 && selectedCategory !== "All") return null;

            return (
              <div key={catName} className="rounded-lg overflow-hidden border border-slate-200 bg-white shadow-2xs">
                
                {/* Category Header Bar (Matching Screenshot Light Blue Header) */}
                <div className="bg-[#d9edf7] border-b border-[#bce8f1] px-3 py-1.5 flex items-center justify-between text-xs font-extrabold text-[#31708f] uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <BedDouble className="h-4 w-4 text-[#31708f]" />
                    <span>{catName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-semibold">
                    <span>Total: <strong>{catBeds.length}</strong></span>
                    <span className="text-emerald-700">Vacant: <strong>{catBeds.filter((b) => b.status === "Vacant").length}</strong></span>
                    <span className="text-rose-700">Occupied: <strong>{catBeds.filter((b) => b.status === "Occupied").length}</strong></span>
                  </div>
                </div>

                {/* Bed Tiles Grid */}
                <div className="p-3 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-2.5">
                  {catBeds.map((bed) => {
                    let tileColorClass = "bg-[#5cb85c] hover:bg-[#4cae4c] text-white"; // Vacant Green
                    if (bed.status === "Occupied") tileColorClass = "bg-[#d9534f] hover:bg-[#c9302c] text-white"; // Occupied Red
                    else if (bed.status === "House Keeping") tileColorClass = "bg-[#f0ad4e] hover:bg-[#ec971f] text-white"; // Housekeeping Yellow
                    else if (bed.status === "Retain") tileColorClass = "bg-[#6f42c1] hover:bg-[#5a32a3] text-white";
                    else if (bed.status === "Blocked") tileColorClass = "bg-[#6c757d] hover:bg-[#5a6268] text-white";
                    else if (bed.status === "Under Repair") tileColorClass = "bg-[#5bc0de] hover:bg-[#31b0d5] text-white";
                    else if (bed.status === "Still On Bed/Discharge Approval") tileColorClass = "bg-[#c9302c] hover:bg-[#ac2925] text-white";

                    return (
                      <button
                        key={bed.id}
                        onClick={(e) => handleBedClick(bed, e)}
                        className={`h-11 rounded-md flex flex-col items-center justify-center font-mono font-black text-xs transition-all transform hover:scale-105 active:scale-95 shadow-2xs relative group cursor-pointer ${tileColorClass}`}
                      >
                        <span className="tracking-wide text-xs">{bed.bedNo}</span>
                        
                        {bed.status === "Occupied" && bed.patient && (
                          <span className="text-[9px] font-sans font-medium opacity-90 truncate max-w-[80px]">
                            {bed.patient.name.split(" ")[0]}
                          </span>
                        )}
                        {bed.status === "House Keeping" && (
                          <span className="text-[8px] font-sans font-medium opacity-90">
                            Cleaning
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

        </div>
      </div>

      {/* ─── FLOATING CONTEXT MENU (MATCHING SCREENSHOT 1) ─────────────────── */}
      {contextMenuBed && (
        <div
          style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
          className="fixed z-50 bg-white border border-slate-300 rounded-md shadow-xl py-1 text-xs font-semibold text-slate-800 min-w-[130px] animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => openAdmissionDialog(contextMenuBed)}
            className="w-full px-3 py-1.5 text-left hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5 text-blue-600" />
            <span>Admission</span>
          </button>
          
          <button
            onClick={() => openPatientDetails(contextMenuBed)}
            className="w-full px-3 py-1.5 text-left hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5 text-slate-500" />
            <span>Patient Details</span>
          </button>

          {contextMenuBed.status === "House Keeping" && (
            <button
              onClick={() => {
                setSelectedBed(contextMenuBed);
                setContextMenuBed(null);
                setIsHousekeepingModalOpen(true);
              }}
              className="w-full px-3 py-1.5 text-left hover:bg-amber-50 text-amber-700 flex items-center gap-2 cursor-pointer border-t border-slate-100"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>Clean Bed</span>
            </button>
          )}

          {contextMenuBed.status === "Vacant" && (
            <button
              onClick={async () => {
                if (confirm(`Are you sure you want to remove bed ${contextMenuBed.bedNo}?`)) {
                  try {
                    await deleteBed(contextMenuBed.bedNo);
                    setContextMenuBed(null);
                    fetchBeds();
                  } catch (err: any) {
                    alert(err.message || "Failed to remove bed");
                  }
                }
              }}
              className="w-full px-3 py-1.5 text-left hover:bg-rose-50 text-rose-700 flex items-center gap-2 cursor-pointer border-t border-slate-100"
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-600" />
              <span>Delete Bed</span>
            </button>
          )}
        </div>
      )}

      {/* ─── ADD / CONFIGURE HOSPITAL BEDS MODAL ───────────────────────── */}
      {isAddBedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 text-xs">
            {/* Modal Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <BedDouble className="h-5 w-5 text-blue-200" />
                <div>
                  <h3 className="font-black text-sm">Add & Configure Hospital Beds</h3>
                  <p className="text-[11px] text-blue-100 font-medium">Add single bed or generate multiple beds for ATD matrix</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsAddBedModalOpen(false)}
                className="h-7 w-7 p-0 text-blue-100 hover:text-white hover:bg-white/10 rounded-full cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="px-4 pt-3 pb-1 bg-slate-50 border-b border-slate-200 flex gap-2">
              <button
                type="button"
                onClick={() => setAddBedMode("single")}
                className={`flex-1 py-1.5 px-3 rounded text-xs font-bold transition-all cursor-pointer ${
                  addBedMode === "single"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                Single Bed
              </button>
              <button
                type="button"
                onClick={() => setAddBedMode("bulk")}
                className={`flex-1 py-1.5 px-3 rounded text-xs font-bold transition-all cursor-pointer ${
                  addBedMode === "bulk"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                Quick Multi-Bed Generator
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddBedSubmit} className="p-4 space-y-3.5">
              {/* Category Selector */}
              <div>
                <Label className="text-[11px] font-bold text-slate-700 mb-1 block">Bed Category *</Label>
                <Select
                  value={newBedForm.category}
                  onValueChange={(cat) => {
                    const pref = cat === "DELUXE" ? "DLX-" : cat === "ICU" ? "ICU-" : cat === "SINGLE PRIVATE" ? "PRIVATE-" : cat === "TWIN SHARING" ? "TWIN-S-" : "GEN-";
                    const count = beds.filter(b => b.category === cat).length;
                    setNewBedForm({
                      ...newBedForm,
                      category: cat,
                      prefix: pref,
                      startNumber: count + 1,
                      bedNo: `${pref}${String(count + 1).padStart(2, "0")}`,
                      ward: cat === "DELUXE" ? "Floor 2 - Deluxe Wing" : cat === "ICU" ? "Floor 1 - Critical Care Unit" : cat === "SINGLE PRIVATE" ? "Floor 3 - Private Wing" : cat === "TWIN SHARING" ? "Floor 2 - Twin Sharing" : "Ground Floor - General Ward",
                      tariffRate: cat === "DELUXE" ? 3500 : cat === "ICU" ? 6500 : cat === "SINGLE PRIVATE" ? 4500 : cat === "TWIN SHARING" ? 2500 : 1200,
                    });
                  }}
                >
                  <SelectTrigger className="h-8 text-xs bg-white border-slate-300">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {wardCategories.map((cat) => (
                      <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {addBedMode === "single" ? (
                /* Single Bed Inputs */
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[11px] font-bold text-slate-700 mb-1 block">Bed Number / Code *</Label>
                    <Input
                      required
                      value={newBedForm.bedNo}
                      onChange={(e) => setNewBedForm({ ...newBedForm, bedNo: e.target.value })}
                      placeholder="e.g. GEN-11 or DLX-06"
                      className="h-8 text-xs font-mono font-bold uppercase"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] font-bold text-slate-700 mb-1 block">Daily Tariff Rate (₹)</Label>
                    <Input
                      type="number"
                      value={newBedForm.tariffRate}
                      onChange={(e) => setNewBedForm({ ...newBedForm, tariffRate: Number(e.target.value) })}
                      placeholder="e.g. 1200"
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>
              ) : (
                /* Bulk Multi-Bed Generator Inputs */
                <div className="space-y-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <Label className="text-[11px] font-bold text-slate-700 mb-1 block">Prefix Code</Label>
                      <Input
                        value={newBedForm.prefix}
                        onChange={(e) => setNewBedForm({ ...newBedForm, prefix: e.target.value })}
                        placeholder="e.g. GEN-"
                        className="h-8 text-xs font-mono font-bold uppercase"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] font-bold text-slate-700 mb-1 block">Start Number</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newBedForm.startNumber}
                        onChange={(e) => setNewBedForm({ ...newBedForm, startNumber: Number(e.target.value) })}
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] font-bold text-slate-700 mb-1 block">Number of Beds</Label>
                      <Input
                        type="number"
                        min="1"
                        max="50"
                        value={newBedForm.bulkCount}
                        onChange={(e) => setNewBedForm({ ...newBedForm, bulkCount: Number(e.target.value) })}
                        className="h-8 text-xs font-mono font-bold text-blue-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <Label className="text-[11px] font-bold text-slate-700 mb-1 block">Daily Tariff / Bed (₹)</Label>
                      <Input
                        type="number"
                        value={newBedForm.tariffRate}
                        onChange={(e) => setNewBedForm({ ...newBedForm, tariffRate: Number(e.target.value) })}
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                    <div className="flex flex-col justify-end">
                      <div className="bg-white p-2 rounded border border-blue-200 text-[11px] text-blue-900 font-medium">
                        Will generate: <strong className="font-mono text-blue-700">{newBedForm.prefix}{String(newBedForm.startNumber).padStart(2, "0")}</strong> to <strong className="font-mono text-blue-700">{newBedForm.prefix}{String(newBedForm.startNumber + newBedForm.bulkCount - 1).padStart(2, "0")}</strong> ({newBedForm.bulkCount} beds)
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Ward / Location */}
              <div>
                <Label className="text-[11px] font-bold text-slate-700 mb-1 block">Ward / Floor Wing</Label>
                <Input
                  value={newBedForm.ward}
                  onChange={(e) => setNewBedForm({ ...newBedForm, ward: e.target.value })}
                  placeholder="e.g. Ground Floor - General Ward"
                  className="h-8 text-xs"
                />
              </div>

              {/* Initial Status */}
              <div>
                <Label className="text-[11px] font-bold text-slate-700 mb-1 block">Initial Status</Label>
                <Select
                  value={newBedForm.status}
                  onValueChange={(st: any) => setNewBedForm({ ...newBedForm, status: st })}
                >
                  <SelectTrigger className="h-8 text-xs bg-white border-slate-300">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vacant">Vacant (Available)</SelectItem>
                    <SelectItem value="House Keeping">House Keeping (Cleaning)</SelectItem>
                    <SelectItem value="Under Repair">Under Repair / Maintenance</SelectItem>
                    <SelectItem value="Blocked">Blocked / Reserved</SelectItem>
                    <SelectItem value="Retain">Retain</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddBedModalOpen(false)}
                  className="h-8 text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isAddingBed}
                  size="sm"
                  className="h-8 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs cursor-pointer"
                >
                  {isAddingBed ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      {addBedMode === "single" ? "Add Hospital Bed" : `Generate ${newBedForm.bulkCount} Beds`}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── COMPREHENSIVE FULL-SCREEN ADMITTED PATIENT DIALOG (SCREENSHOT 2) ─── */}
      {isAdmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-1 sm:p-2">
          <div className="bg-white rounded-lg shadow-2xl w-[98vw] h-[96vh] flex flex-col overflow-hidden border border-slate-300 text-xs font-sans animate-in fade-in zoom-in-95 duration-150">
            
            {/* Top Green Bar & Patient Identifiers (Matching Screenshot 2) */}
            <div className="bg-[#5cb85c] text-white px-4 py-2 flex items-center justify-between flex-shrink-0 font-bold shadow-xs">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                <span className="text-sm font-black tracking-wide uppercase">Admitted Patient</span>
              </div>

              {/* ID Bar in Header with Clickable UHID Search */}
              <div className="flex items-center gap-3 text-xs">
                
                {/* ─── CLICKABLE U-HID SEARCH BOX (REQUIREMENT 1) ───────────── */}
                <div className="flex items-center gap-1">
                  <span className="text-white text-[11px] font-bold">U-HID:</span>
                  <div
                    onClick={() => setIsPatientLookupOpen(true)}
                    className="h-6 w-44 bg-white hover:bg-blue-50 text-slate-900 px-2 text-xs font-mono font-black rounded border border-emerald-300 flex items-center justify-between cursor-pointer shadow-2xs group transition-colors"
                    title="Click to search and select patient from census"
                  >
                    <span className="truncate">{admitForm.uhid || "Select Patient..."}</span>
                    <Search className="h-3 w-3 text-blue-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPatientLookupOpen(true)}
                    className="h-6 px-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-[10px] font-bold cursor-pointer shadow-2xs"
                  >
                    Notes / Select
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-white text-[11px] font-bold">Booking No.</span>
                  <input
                    type="text"
                    value={admitForm.bookingNo}
                    onChange={(e) => setAdmitForm({ ...admitForm, bookingNo: e.target.value })}
                    className="h-6 w-28 bg-white text-slate-900 px-1.5 text-xs font-mono rounded border-none"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-white text-[11px] font-bold">IP No.</span>
                  <input
                    type="text"
                    value={admitForm.ipNo}
                    onChange={(e) => setAdmitForm({ ...admitForm, ipNo: e.target.value })}
                    className="h-6 w-28 bg-white text-slate-900 px-1.5 text-xs font-mono font-bold rounded border-none"
                  />
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-1.5 ml-3">
                  <button
                    type="button"
                    onClick={() => setIsAdmitModalOpen(false)}
                    className="h-6 px-3 bg-white/90 hover:bg-white text-slate-800 rounded text-[11px] font-bold cursor-pointer shadow-2xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdmitModalOpen(false)}
                    className="h-6 px-3 bg-white/90 hover:bg-white text-slate-800 rounded text-[11px] font-bold cursor-pointer shadow-2xs"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleAdmitSubmit}
                    className="h-6 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded text-[11px] font-black cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <Save className="h-3 w-3" />
                    Save
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Body (Scrollable, Full Sized) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8fafc] text-slate-700">
              
              {/* ─── SECTION 1: ADMISSION DETAIL (MATCHING SCREENSHOT 2) ──────── */}
              <div className="border border-slate-300 rounded-lg p-4 space-y-3 bg-white shadow-2xs">
                <div className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-1.5 flex items-center justify-between">
                  <span className="uppercase tracking-wide font-black text-slate-700">Admission Detail</span>
                  <span className="text-[11px] text-blue-600 font-mono">
                    Patient: <strong className="text-slate-900">{admitForm.kinName || "New Inpatient"}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-12 gap-4 items-start">
                  
                  {/* Photo Avatar & Upload */}
                  <div className="col-span-12 md:col-span-2 flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="w-28 h-32 bg-slate-200 rounded-lg flex items-center justify-center overflow-hidden border border-slate-300 mb-2.5 shadow-inner relative group">
                      {admitForm.photoUrl ? (
                        <img
                          src={admitForm.photoUrl}
                          alt="Patient Photo"
                          className="w-full h-full object-cover animate-in fade-in duration-200"
                        />
                      ) : (
                        <div className="w-20 h-24 bg-blue-100 rounded-full flex items-center justify-center text-slate-500 font-bold">
                          <Users className="h-12 w-12 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 w-full">
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="flex-1 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold text-center shadow-2xs cursor-pointer active:scale-95 transition-transform"
                      >
                        Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdmitForm((prev) => ({ ...prev, photoUrl: "" }))}
                        className="flex-1 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[11px] font-bold text-center cursor-pointer active:scale-95 transition-transform"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Clinical Doctors & Team (Column 1) */}
                  <div className="col-span-12 md:col-span-3 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-28 text-[11px] font-bold text-slate-600 whitespace-nowrap">Date & Time:</span>
                      <input
                        type="text"
                        value={admitForm.dateTime}
                        onChange={(e) => setAdmitForm({ ...admitForm, dateTime: e.target.value })}
                        placeholder="DD/MM/YYYY HH:MM"
                        className="h-7 w-full text-xs px-2 border border-slate-300 rounded font-mono bg-white"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-28 text-[11px] font-bold text-slate-600 whitespace-nowrap">Admitting Team:</span>
                      <select
                        value={admitForm.admittingTeam}
                        onChange={(e) => setAdmitForm({ ...admitForm, admittingTeam: e.target.value })}
                        className="h-7 flex-1 text-xs px-1.5 border border-slate-300 rounded bg-white"
                      >
                        <option value="General Medicine Team A">General Medicine Team A</option>
                        <option value="Surgical Unit 1">Surgical Unit 1</option>
                        <option value="Pediatrics Care">Pediatrics Care</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-28 text-[11px] font-bold text-slate-600 whitespace-nowrap">Treating Consultant:</span>
                      <select
                        value={admitForm.treatingConsultant}
                        onChange={(e) => setAdmitForm({ ...admitForm, treatingConsultant: e.target.value })}
                        className="h-7 flex-1 text-xs px-1.5 border border-slate-300 rounded bg-white font-semibold text-slate-800"
                      >
                        <option value="Dr. Abhishek Bansal 2273">Dr. Abhishek Bansal 2273</option>
                        <option value="Dr. Sameer Sen 3105">Dr. Sameer Sen 3105</option>
                        <option value="Dr. Sania Mirza 2231">Dr. Sania Mirza 2231</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-28 text-[11px] font-bold text-slate-600 whitespace-nowrap">Admitting Doctor:</span>
                      <select
                        value={admitForm.admittingDoctor}
                        onChange={(e) => setAdmitForm({ ...admitForm, admittingDoctor: e.target.value })}
                        className="h-7 flex-1 text-xs px-1.5 border border-slate-300 rounded bg-white font-semibold text-slate-800"
                      >
                        <option value="Dr. Abhishek Bansal 2273">Dr. Abhishek Bansal 2273</option>
                        <option value="Dr. Sameer Sen 3105">Dr. Sameer Sen 3105</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-28 text-[11px] font-bold text-slate-600 whitespace-nowrap">Secondary Doctor:</span>
                      <select
                        value={admitForm.secondaryDoctor}
                        onChange={(e) => setAdmitForm({ ...admitForm, secondaryDoctor: e.target.value })}
                        className="h-7 flex-1 text-xs px-1.5 border border-slate-300 rounded bg-white text-slate-600"
                      >
                        <option value="Select">-- Select Doctor --</option>
                        <option value="Dr. Sameer Sen 3105">Dr. Sameer Sen 3105</option>
                        <option value="Dr. Sania Mirza 2231">Dr. Sania Mirza 2231</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-28 text-[11px] font-bold text-slate-600 whitespace-nowrap">Refer Type:</span>
                      <select
                        value={admitForm.referType}
                        onChange={(e) => setAdmitForm({ ...admitForm, referType: e.target.value })}
                        className="h-7 flex-1 text-xs px-1.5 border border-slate-300 rounded bg-white"
                      >
                        <option value="Internal Provider">Internal Provider</option>
                        <option value="External Provider">External Provider</option>
                        <option value="Direct / Self">Direct / Self</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-28 text-[11px] font-bold text-slate-600 whitespace-nowrap">Refer By:</span>
                      <input
                        type="text"
                        placeholder="Referred by..."
                        value={admitForm.referBy}
                        onChange={(e) => setAdmitForm({ ...admitForm, referBy: e.target.value })}
                        className="h-7 flex-1 text-xs px-2 border border-slate-300 rounded bg-white"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-28 text-[11px] font-bold text-slate-600 whitespace-nowrap">Admission Type:</span>
                      <select
                        value={admitForm.admissionType}
                        onChange={(e) => setAdmitForm({ ...admitForm, admissionType: e.target.value })}
                        className="h-7 flex-1 text-xs px-1.5 border border-slate-300 rounded bg-white"
                      >
                        <option value="Select">-- Select Type --</option>
                        <option value="Elective">Elective</option>
                        <option value="Emergency">Emergency</option>
                        <option value="Daycare">Daycare</option>
                      </select>
                    </div>
                  </div>

                  {/* Ward, Bed & Tariffs (Column 2) */}
                  <div className="col-span-12 md:col-span-4 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-28 text-[11px] font-bold text-slate-600 whitespace-nowrap">Ward:</span>
                      <select
                        value={admitForm.ward}
                        onChange={(e) => setAdmitForm({ ...admitForm, ward: e.target.value })}
                        className="h-7 flex-1 text-xs px-1.5 border border-slate-300 rounded bg-white font-bold"
                      >
                        <option value="TWIN SHARING">TWIN SHARING</option>
                        <option value="DELUXE">DELUXE</option>
                        <option value="GENERAL">GENERAL</option>
                        <option value="ICU">ICU</option>
                        <option value="SINGLE PRIVATE">SINGLE PRIVATE</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-28 text-[11px] font-bold text-slate-600 whitespace-nowrap">Bed Category:</span>
                      <select
                        value={admitForm.bedCategory}
                        onChange={(e) => setAdmitForm({ ...admitForm, bedCategory: e.target.value })}
                        className="h-7 flex-1 text-xs px-1.5 border border-slate-300 rounded bg-white font-bold"
                      >
                        <option value="TWIN SHARING">TWIN SHARING</option>
                        <option value="DELUXE">DELUXE</option>
                        <option value="GENERAL">GENERAL</option>
                        <option value="ICU">ICU</option>
                        <option value="SINGLE PRIVATE">SINGLE PRIVATE</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-28 text-[11px] font-bold text-slate-600 whitespace-nowrap">Billing Category:</span>
                      <select
                        value={admitForm.billingCategory}
                        onChange={(e) => setAdmitForm({ ...admitForm, billingCategory: e.target.value })}
                        className="h-7 flex-1 text-xs px-1.5 border border-slate-300 rounded bg-white font-bold text-blue-700"
                      >
                        <option value="DELUXE ROOM">DELUXE ROOM</option>
                        <option value="TWIN SHARING">TWIN SHARING</option>
                        <option value="GENERAL WARD">GENERAL WARD</option>
                        <option value="ICU">ICU</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-28 text-[11px] font-bold text-slate-600 whitespace-nowrap">Bed No:</span>
                      <select
                        value={admitForm.bedNo}
                        onChange={(e) => setAdmitForm({ ...admitForm, bedNo: e.target.value })}
                        className="h-7 flex-1 text-xs px-1.5 border border-slate-300 rounded bg-slate-100 font-mono font-black text-slate-900"
                      >
                        <option value="">-- Select Bed --</option>
                        {beds.map((bed) => (
                          <option key={bed.bedNo} value={bed.bedNo}>
                            {bed.bedNo} {bed.status !== "Vacant" ? `(${bed.status})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-28 text-[11px] font-bold text-slate-600 whitespace-nowrap">Ex. Discharge:</span>
                      <input
                        type="text"
                        placeholder="DD/MM/YYYY"
                        value={admitForm.expectedDischargeDate}
                        onChange={(e) => setAdmitForm({ ...admitForm, expectedDischargeDate: e.target.value })}
                        className="h-7 flex-1 text-xs px-2 border border-slate-300 rounded font-mono bg-white"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-28 text-[11px] font-bold text-slate-600 whitespace-nowrap">Min Advance (₹):</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={admitForm.minAdvRequire}
                        onChange={(e) => setAdmitForm({ ...admitForm, minAdvRequire: Number(e.target.value) })}
                        className="h-7 flex-1 text-xs px-2 border border-slate-300 rounded font-mono bg-white font-bold"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-28 text-[11px] font-bold text-slate-600 whitespace-nowrap">Estimated (₹):</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={admitForm.estimatedAmt}
                        onChange={(e) => setAdmitForm({ ...admitForm, estimatedAmt: Number(e.target.value) })}
                        className="h-7 flex-1 text-xs px-2 border border-slate-300 rounded font-mono bg-white font-bold"
                      />
                    </div>

                    <div className="flex items-center gap-4 pt-1">
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={admitForm.mlc}
                          onChange={(e) => setAdmitForm({ ...admitForm, mlc: e.target.checked })}
                          className="rounded text-rose-600 focus:ring-rose-500 h-4 w-4"
                        />
                        <span>MLC</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={admitForm.handleWithCare}
                          onChange={(e) => setAdmitForm({ ...admitForm, handleWithCare: e.target.checked })}
                          className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span>Handle With Care</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="w-28 text-[11px] font-bold text-slate-600 whitespace-nowrap">Address Proof:</span>
                      <input
                        type="file"
                        className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Payer, Sponsor & Insurance (Column 3) */}
                  <div className="col-span-12 md:col-span-3 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-28 text-[11px] font-bold text-slate-600 whitespace-nowrap">Source:</span>
                      <select
                        value={admitForm.source}
                        onChange={(e) => setAdmitForm({ ...admitForm, source: e.target.value })}
                        className="h-7 flex-1 text-xs px-1.5 border border-slate-300 rounded bg-white"
                      >
                        <option value="Direct Patient">Direct Patient</option>
                        <option value="OPD Clinic">OPD Clinic</option>
                        <option value="Emergency Room">Emergency Room</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-28 text-[11px] font-bold text-slate-600 whitespace-nowrap">Payer Type:</span>
                      <select
                        value={admitForm.payerType}
                        onChange={(e) => setAdmitForm({ ...admitForm, payerType: e.target.value })}
                        className="h-7 flex-1 text-xs px-1.5 border border-slate-300 rounded bg-white font-medium"
                      >
                        <option value="Direct Patient">Direct Patient</option>
                        <option value="Corporate">Corporate</option>
                        <option value="TPA / Insurance">TPA / Insurance</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-28 text-[11px] font-bold text-slate-600 whitespace-nowrap">Payer:</span>
                      <select
                        value={admitForm.payer}
                        onChange={(e) => setAdmitForm({ ...admitForm, payer: e.target.value })}
                        className="h-7 flex-1 text-xs px-1.5 border border-slate-300 rounded bg-white font-bold text-slate-800"
                      >
                        <option value="CASH / CASH">CASH / CASH</option>
                        <option value="Star Health Insurance">Star Health Insurance</option>
                        <option value="HDFC ERGO">HDFC ERGO</option>
                        <option value="Max Bupa">Max Bupa</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-28 text-[11px] font-bold text-slate-600 whitespace-nowrap">Sponsor:</span>
                      <select
                        value={admitForm.sponsor}
                        onChange={(e) => setAdmitForm({ ...admitForm, sponsor: e.target.value })}
                        className="h-7 flex-1 text-xs px-1.5 border border-slate-300 rounded bg-white text-slate-600"
                      >
                        <option value=".Select..">-- Select Sponsor --</option>
                        <option value="Corporate Sponsor">Corporate Sponsor</option>
                        <option value="TPA Desk">TPA Desk</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-28 text-[11px] font-bold text-slate-600 whitespace-nowrap">Sub Company:</span>
                      <select
                        value={admitForm.insuranceCompany}
                        onChange={(e) => setAdmitForm({ ...admitForm, insuranceCompany: e.target.value })}
                        className="h-7 flex-1 text-xs px-1.5 border border-slate-300 rounded bg-white text-slate-600 truncate"
                      >
                        <option value="Please Select Sub Company">-- Select Sub Company --</option>
                        <option value="Medi Assist India TPA">Medi Assist India TPA</option>
                        <option value="Vidal Health TPA">Vidal Health TPA</option>
                      </select>
                    </div>
                  </div>

                </div>
              </div>

              {/* ─── SECTION 2: TABBED BOTTOM PANEL (MATCHING SCREENSHOT 2) ───── */}
              <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                
                {/* Tabs Bar */}
                <div className="flex items-center bg-[#f0f0f0] border-b border-slate-300 text-xs font-bold text-slate-700">
                  <button
                    type="button"
                    onClick={() => setAdmissionBottomTab("kin")}
                    className={`px-5 py-2 border-r border-slate-300 transition-colors ${
                      admissionBottomTab === "kin" ? "bg-blue-600 text-white font-black" : "hover:bg-slate-200"
                    }`}
                  >
                    Kin Details
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdmissionBottomTab("outstanding")}
                    className={`px-5 py-2 border-r border-slate-300 transition-colors ${
                      admissionBottomTab === "outstanding" ? "bg-blue-600 text-white font-black" : "hover:bg-slate-200"
                    }`}
                  >
                    Outstanding
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdmissionBottomTab("address")}
                    className={`px-5 py-2 border-r border-slate-300 transition-colors ${
                      admissionBottomTab === "address" ? "bg-blue-600 text-white font-black" : "hover:bg-slate-200"
                    }`}
                  >
                    Permanent Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdmissionBottomTab("custom")}
                    className={`px-5 py-2 transition-colors ${
                      admissionBottomTab === "custom" ? "bg-blue-600 text-white font-black" : "hover:bg-slate-200"
                    }`}
                  >
                    Custom Fields
                  </button>
                </div>

                {/* Tab 1: Kin Details */}
                {admissionBottomTab === "kin" && (
                  <div className="p-4 grid grid-cols-12 gap-4 text-xs">
                    
                    {/* Kin Demographics (Left Column) */}
                    <div className="col-span-12 md:col-span-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-28 text-[11px] font-bold text-slate-600 whitespace-nowrap">Previous Kin:</span>
                        <select
                          value={admitForm.kinPrevious}
                          onChange={(e) => setAdmitForm({ ...admitForm, kinPrevious: e.target.value })}
                          className="h-7 flex-1 text-xs px-1.5 border border-slate-300 rounded bg-white"
                        >
                          <option value="">-- None --</option>
                          <option value="Previous Record 1">Previous Record 1</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="w-28 text-[11px] font-bold text-slate-600 whitespace-nowrap">Attendants:</span>
                        <select
                          value={admitForm.kinNoOfAttendant}
                          onChange={(e) => setAdmitForm({ ...admitForm, kinNoOfAttendant: e.target.value })}
                          className="h-7 flex-1 text-xs px-1.5 border border-slate-300 rounded bg-white"
                        >
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="w-28 text-[11px] font-bold text-slate-600 whitespace-nowrap">Name:</span>
                        <input
                          type="text"
                          placeholder="Attendant name"
                          value={admitForm.kinName}
                          onChange={(e) => setAdmitForm({ ...admitForm, kinName: e.target.value })}
                          className="h-7 flex-1 text-xs px-2 border border-slate-300 rounded font-bold text-slate-800 bg-white"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="w-28 text-[11px] font-bold text-slate-600 whitespace-nowrap">Relationship:</span>
                        <select
                          value={admitForm.kinRelationship}
                          onChange={(e) => setAdmitForm({ ...admitForm, kinRelationship: e.target.value })}
                          className="h-7 flex-1 text-xs px-1.5 border border-slate-300 rounded bg-white"
                        >
                          <option value="Spouse">Spouse</option>
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Son/Daughter">Son/Daughter</option>
                          <option value="Brother/Sister">Brother/Sister</option>
                          <option value="Guardian">Guardian</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="w-28 text-[11px] font-bold text-slate-600 whitespace-nowrap">Gender:</span>
                        <select
                          value={admitForm.kinGender}
                          onChange={(e) => setAdmitForm({ ...admitForm, kinGender: e.target.value })}
                          className="h-7 flex-1 text-xs px-1.5 border border-slate-300 rounded bg-white"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="w-28 text-[11px] font-bold text-slate-600 whitespace-nowrap">Date Of Birth:</span>
                        <input
                          type="date"
                          value={admitForm.kinDob}
                          onChange={(e) => setAdmitForm({ ...admitForm, kinDob: e.target.value })}
                          className="h-7 flex-1 text-xs px-2 border border-slate-300 rounded font-mono bg-white"
                        />
                      </div>
                    </div>

                    {/* Kin Address (Middle Column) */}
                    <div className="col-span-12 md:col-span-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="w-20 text-[11px] font-bold text-slate-600 whitespace-nowrap pt-1">Address:</span>
                        <textarea
                          rows={2}
                          placeholder="Street address..."
                          value={admitForm.kinAddress}
                          onChange={(e) => setAdmitForm({ ...admitForm, kinAddress: e.target.value })}
                          className="w-full text-xs p-1.5 border border-slate-300 rounded resize-none bg-white font-medium"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="w-20 text-[11px] font-bold text-slate-600 whitespace-nowrap">Country:</span>
                        <select
                          value={admitForm.kinCountry}
                          onChange={(e) => setAdmitForm({ ...admitForm, kinCountry: e.target.value })}
                          className="h-7 flex-1 text-xs px-1.5 border border-slate-300 rounded bg-white font-semibold"
                        >
                          <option value="INDIA">INDIA</option>
                          <option value="NEPAL">NEPAL</option>
                          <option value="BANGLADESH">BANGLADESH</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="w-20 text-[11px] font-bold text-slate-600 whitespace-nowrap">State:</span>
                        <select
                          value={admitForm.kinState}
                          onChange={(e) => setAdmitForm({ ...admitForm, kinState: e.target.value })}
                          className="h-7 flex-1 text-xs px-1.5 border border-slate-300 rounded bg-white"
                        >
                          <option value="New Delhi">New Delhi</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Uttar Pradesh">Uttar Pradesh</option>
                          <option value="Haryana">Haryana</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="w-20 text-[11px] font-bold text-slate-600 whitespace-nowrap">City:</span>
                        <select
                          value={admitForm.kinDistrictCity}
                          onChange={(e) => setAdmitForm({ ...admitForm, kinDistrictCity: e.target.value })}
                          className="h-7 flex-1 text-xs px-1.5 border border-slate-300 rounded bg-white"
                        >
                          <option value="NEW DELHI">NEW DELHI</option>
                          <option value="NOIDA">NOIDA</option>
                          <option value="GURUGRAM">GURUGRAM</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="w-20 text-[11px] font-bold text-slate-600 whitespace-nowrap">Pin Code:</span>
                        <input
                          type="text"
                          placeholder="Pin code"
                          value={admitForm.kinPinCode}
                          onChange={(e) => setAdmitForm({ ...admitForm, kinPinCode: e.target.value })}
                          className="h-7 flex-1 text-xs px-2 border border-slate-300 rounded font-mono bg-white"
                        />
                      </div>
                    </div>

                    {/* Kin Contact & Remarks (Right Column) */}
                    <div className="col-span-12 md:col-span-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-20 text-[11px] font-bold text-slate-600 whitespace-nowrap">Home #:</span>
                        <input
                          type="text"
                          placeholder="Home phone"
                          value={admitForm.kinHomePhone}
                          onChange={(e) => setAdmitForm({ ...admitForm, kinHomePhone: e.target.value })}
                          className="h-7 flex-1 text-xs px-2 border border-slate-300 rounded font-mono bg-white"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="w-20 text-[11px] font-bold text-slate-600 whitespace-nowrap">Mobile #:</span>
                        <input
                          type="text"
                          placeholder="10-digit mobile"
                          value={admitForm.kinMobile}
                          onChange={(e) => setAdmitForm({ ...admitForm, kinMobile: e.target.value })}
                          className="h-7 flex-1 text-xs px-2 border border-slate-300 rounded font-mono font-black text-slate-900 bg-white"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="w-20 text-[11px] font-bold text-slate-600 whitespace-nowrap">Email:</span>
                        <input
                          type="email"
                          placeholder="name@email.com"
                          value={admitForm.kinEmail}
                          onChange={(e) => setAdmitForm({ ...admitForm, kinEmail: e.target.value })}
                          className="h-7 flex-1 text-xs px-2 border border-slate-300 rounded bg-white"
                        />
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="w-20 text-[11px] font-bold text-slate-600 whitespace-nowrap pt-1">Remarks:</span>
                        <textarea
                          rows={1}
                          placeholder="Admission notes..."
                          value={admitForm.kinRemarks}
                          onChange={(e) => setAdmitForm({ ...admitForm, kinRemarks: e.target.value })}
                          className="w-full text-xs p-1.5 border border-slate-300 rounded resize-none bg-white"
                        />
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="w-20 text-[11px] font-bold text-slate-600 whitespace-nowrap pt-1">Booking:</span>
                        <textarea
                          rows={1}
                          placeholder="Booking notes..."
                          value={admitForm.kinBookingRemarks}
                          onChange={(e) => setAdmitForm({ ...admitForm, kinBookingRemarks: e.target.value })}
                          className="w-full text-xs p-1.5 border border-slate-300 rounded resize-none bg-white"
                        />
                      </div>
                    </div>

                  </div>
                )}

                {/* Tab 2: Outstanding */}
                {admissionBottomTab === "outstanding" && (
                  <div className="p-6 text-center text-slate-500">
                    <p className="font-bold text-sm text-slate-800">No previous unpaid invoices found for this patient.</p>
                    <p className="text-xs text-emerald-600 font-semibold mt-1">Patient ledger is completely clear with ₹0.00 outstanding balance.</p>
                  </div>
                )}

                {/* Tab 3: Permanent Address */}
                {admissionBottomTab === "address" && (
                  <div className="p-4 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <Label className="text-xs font-bold text-slate-700">Permanent Address Line:</Label>
                      <Input
                        value={admitForm.permAddress}
                        onChange={(e) => setAdmitForm({ ...admitForm, permAddress: e.target.value })}
                        className="h-8 text-xs mt-1 bg-white"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-slate-700">City / District:</Label>
                      <Input
                        value={admitForm.permCity}
                        onChange={(e) => setAdmitForm({ ...admitForm, permCity: e.target.value })}
                        className="h-8 text-xs mt-1 bg-white"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-slate-700">State:</Label>
                      <Input
                        value={admitForm.permState}
                        onChange={(e) => setAdmitForm({ ...admitForm, permState: e.target.value })}
                        className="h-8 text-xs mt-1 bg-white"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-slate-700">Pin Code:</Label>
                      <Input
                        value={admitForm.permPincode}
                        onChange={(e) => setAdmitForm({ ...admitForm, permPincode: e.target.value })}
                        className="h-8 text-xs font-mono mt-1 bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* Tab 4: Custom Fields */}
                {admissionBottomTab === "custom" && (
                  <div className="p-4 grid grid-cols-4 gap-4 text-xs">
                    <div>
                      <Label className="text-xs font-bold text-slate-700">ID Proof Type:</Label>
                      <Input
                        value={admitForm.idProofType}
                        onChange={(e) => setAdmitForm({ ...admitForm, idProofType: e.target.value })}
                        className="h-8 text-xs mt-1 bg-white"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-slate-700">ID Proof Number:</Label>
                      <Input
                        value={admitForm.idProofNo}
                        onChange={(e) => setAdmitForm({ ...admitForm, idProofNo: e.target.value })}
                        className="h-8 text-xs font-mono mt-1 bg-white"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-slate-700">Blood Group:</Label>
                      <Input
                        value={admitForm.bloodGroup}
                        onChange={(e) => setAdmitForm({ ...admitForm, bloodGroup: e.target.value })}
                        className="h-8 text-xs font-black text-rose-600 mt-1 bg-white"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-slate-700">Diet Preference:</Label>
                      <Input
                        value={admitForm.dietPref}
                        onChange={(e) => setAdmitForm({ ...admitForm, dietPref: e.target.value })}
                        className="h-8 text-xs mt-1 bg-white"
                      />
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── PATIENT CENSUS LOOKUP MODAL (TRIGGERED BY UHID CLICK) ─────────── */}
      {isPatientLookupOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-3">
          <div className="bg-white rounded-xl shadow-2xl w-[98vw] max-w-[1780px] h-[92vh] flex flex-col overflow-hidden border border-slate-300 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#cee6f8] border-b border-[#bce8f1] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 text-white rounded-lg shadow-xs">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-black text-base text-slate-900">Select Patient for Inpatient Admission</h2>
                  <p className="text-xs text-slate-600 font-medium">Search across hospital patient registry & select to auto-populate admission form</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs font-bold px-3 py-1">
                  {isCensusLoading ? "Searching..." : `${censusPatients.length} Patients Found`}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsPatientLookupOpen(false)}
                  className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-blue-200/50 rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search by UHID, Patient Name, Mobile No, Address..."
                    value={lookupSearchTerm}
                    onChange={(e) => setLookupSearchTerm(e.target.value)}
                    className="h-9 text-xs pl-10 pr-8 bg-white border-slate-300 shadow-2xs font-medium"
                    autoFocus
                  />
                  {lookupSearchTerm && (
                    <button
                      onClick={() => setLookupSearchTerm("")}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setLookupSearchTerm("")}
                  className="h-9 px-4 text-xs font-bold bg-white text-slate-700 hover:bg-slate-100 shadow-2xs"
                >
                  Clear Filter
                </Button>
              </div>
            </div>

            {/* Patient Table (Ultra Spacious Full Width, Live API Data) */}
            <div className="flex-1 overflow-y-auto p-0">
              {isCensusLoading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-500">
                  <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="text-xs font-bold">Fetching patients from hospital database...</span>
                </div>
              ) : censusPatients.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-2 text-slate-500">
                  <Users className="h-10 w-10 text-slate-300" />
                  <span className="text-sm font-bold text-slate-700">No matching patient records found</span>
                  <span className="text-xs text-slate-400">Try refining your search term or register a new patient in Registration desk.</span>
                </div>
              ) : (
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-black tracking-wider sticky top-0 border-b border-slate-200 z-10 shadow-2xs">
                    <tr>
                      <th className="px-5 py-3.5 text-center w-24 whitespace-nowrap">Action</th>
                      <th className="px-5 py-3.5 whitespace-nowrap min-w-[190px]">UHID</th>
                      <th className="px-5 py-3.5 min-w-[240px]">Patient Full Name</th>
                      <th className="px-5 py-3.5 whitespace-nowrap min-w-[130px]">Gender / Age</th>
                      <th className="px-5 py-3.5 whitespace-nowrap min-w-[130px]">Mobile No</th>
                      <th className="px-5 py-3.5 whitespace-nowrap min-w-[160px]">Payer / Insurance</th>
                      <th className="px-5 py-3.5 min-w-[180px]">Attending Doctor</th>
                      <th className="px-5 py-3.5 min-w-[280px]">Residential Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {censusPatients.map((p) => {
                      const patientName = p.fullName || `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Patient";
                      return (
                        <tr
                          key={p.id || p.uhid}
                          onClick={() => handleSelectPatientFromLookup(p)}
                          className="hover:bg-blue-50/80 cursor-pointer transition-colors group"
                        >
                          <td className="px-5 py-3.5 text-center whitespace-nowrap">
                            <Button
                              size="sm"
                              className="h-7 px-4 text-[11px] font-black bg-blue-600 hover:bg-blue-700 text-white shadow-2xs group-hover:scale-105 transition-transform"
                            >
                              Select
                            </Button>
                          </td>
                          <td className="px-5 py-3.5 font-mono font-black text-blue-700 text-xs whitespace-nowrap">{p.uhid}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              {p.photoUrl ? (
                                <img
                                  src={p.photoUrl}
                                  alt={patientName}
                                  className="w-9 h-9 rounded-full object-cover border border-blue-200 shadow-2xs flex-shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                  {patientName.charAt(0)}
                                </div>
                              )}
                              <div>
                                <span className="font-bold text-slate-900 text-xs block leading-tight">{patientName}</span>
                                <span className="text-[10px] text-slate-500 font-mono">{p.email || p.mobile}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 font-medium whitespace-nowrap">{p.gender} / {p.age || "—"} Yr</td>
                          <td className="px-5 py-3.5 font-mono text-slate-800 font-semibold whitespace-nowrap">{p.mobile}</td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-300 font-semibold text-[11px]">
                              {p.payer || "CASH / CASH"}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5 text-slate-700 font-medium">{p.referredBy || "Dr. Abhishek Bansal 2273"}</td>
                          <td className="px-5 py-3.5 text-slate-500">
                            {p.address}{p.districtCity ? `, ${p.districtCity}` : ""}{p.state ? `, ${p.state}` : ""}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                Click <strong className="text-slate-700 font-bold">Select</strong> on any patient to populate demographic, clinical & financial records.
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsPatientLookupOpen(false)}
                className="h-8 px-4 text-xs font-bold bg-white text-slate-700 hover:bg-slate-100 shadow-2xs"
              >
                Cancel / Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── INPATIENT DETAILS & ATD ACTIONS DRAWER ─────────────────────────── */}
      {isInpatientDrawerOpen && selectedBed && selectedBed.patient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Drawer Header */}
            <div className="px-4 py-3 bg-rose-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BedDouble className="h-4 w-4" />
                <span className="font-bold text-sm">
                  Inpatient Profile — Bed {selectedBed.bedNo} ({selectedBed.category})
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsInpatientDrawerOpen(false)}
                className="h-7 w-7 p-0 text-rose-100 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Profile Content */}
            <div className="p-5 space-y-4 text-xs">
              
              {/* Patient Banner */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-800">{selectedBed.patient.name}</h3>
                  <div className="flex items-center gap-3 text-slate-500 text-[11px] mt-0.5">
                    <span>UHID: <strong className="text-slate-700 font-mono">{selectedBed.patient.uhid}</strong></span>
                    <span>IP No: <strong className="text-slate-700 font-mono">{selectedBed.patient.ipNo}</strong></span>
                    <span>Age/Sex: <strong className="text-slate-700">{selectedBed.patient.genderAge}</strong></span>
                  </div>
                </div>
                <Badge className={`${selectedBed.status === "Occupied" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"} font-bold`}>
                  {selectedBed.status}
                </Badge>
              </div>

              {/* Inpatient Medical & Financial Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-slate-700">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Clinical Details</span>
                  <p>Attending Doctor: <strong>{selectedBed.patient.doctor}</strong></p>
                  <p>Department: <strong>{selectedBed.patient.department}</strong></p>
                  <p>Diagnosis: <strong className="text-slate-900">{selectedBed.patient.diagnosis}</strong></p>
                  <p>Admitted On: <strong>{new Date(selectedBed.patient.admissionDate).toLocaleDateString("en-GB")}</strong></p>
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Billing & Sponsor</span>
                  <p>Company / Payer: <strong>{selectedBed.patient.company}</strong></p>
                  <p>Category: <strong>{selectedBed.patient.billingCategory}</strong></p>
                  <p>Advance Deposited: <strong className="text-emerald-600 font-mono">₹{selectedBed.patient.advancePaid.toFixed(2)}</strong></p>
                  <p>Running Total: <strong className="text-rose-600 font-mono">₹{selectedBed.patient.runningBill.toFixed(2)}</strong></p>
                </div>
              </div>

              {/* ATD Operational Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsTransferModalOpen(true)}
                  className="h-8 text-xs font-bold gap-1 text-blue-700 border-blue-200 hover:bg-blue-50"
                >
                  <ArrowRightLeft className="h-3.5 w-3.5 text-blue-600" />
                  Transfer Bed / Ward
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/billing")}
                  className="h-8 text-xs font-bold gap-1 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                >
                  <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                  IP Billing & Advances
                </Button>

                {selectedBed.status === "Occupied" ? (
                  <Button
                    size="sm"
                    onClick={handleInitiateDischarge}
                    className="h-8 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white gap-1"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    Mark for Discharge
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleCompleteDischarge}
                    className="h-8 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white gap-1"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Complete Final Discharge
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TRANSFER BED MODAL ──────────────────────────────────────────── */}
      {isTransferModalOpen && selectedBed && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-3 bg-blue-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4" />
                <span className="font-bold text-sm">Bed Transfer — {selectedBed.patient?.name}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsTransferModalOpen(false)}
                className="h-7 w-7 p-0 text-blue-100 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleTransferSubmit} className="p-4 space-y-3 text-xs">
              <div className="bg-blue-50 border border-blue-200 rounded p-2 flex items-center justify-between text-blue-900 font-semibold">
                <span>From Bed: <strong>{selectedBed.bedNo} ({selectedBed.category})</strong></span>
              </div>

              <div>
                <Label className="text-[11px] font-bold text-slate-700">Select Target Vacant Bed:</Label>
                <Select value={targetTransferBedNo} onValueChange={setTargetTransferBedNo}>
                  <SelectTrigger className="h-8 text-xs mt-1">
                    <SelectValue placeholder="Choose a vacant bed..." />
                  </SelectTrigger>
                  <SelectContent>
                    {vacantBeds.map((vb) => (
                      <SelectItem key={vb.id} value={vb.bedNo}>
                        {vb.bedNo} — {vb.category} (₹{vb.tariffRate}/day)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[11px] font-bold text-slate-700">Transfer Reason:</Label>
                <Input
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="h-8 text-xs mt-1"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="h-8 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!targetTransferBedNo}
                  className="h-8 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Confirm Bed Transfer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── HOUSEKEEPING SANITIZATION COMPLETE MODAL ────────────────────── */}
      {isHousekeepingModalOpen && selectedBed && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-3 bg-amber-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="font-bold text-sm">Housekeeping — Bed {selectedBed.bedNo}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsHousekeepingModalOpen(false)}
                className="h-7 w-7 p-0 text-amber-100 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 space-y-3 text-xs text-slate-700">
              <p>
                Bed <strong>{selectedBed.bedNo}</strong> is currently undergoing sanitation & linen replacement.
              </p>
              <div className="p-2.5 bg-amber-50 rounded border border-amber-200 text-[11px] text-amber-900">
                <span>Sanitization Started: <strong>{new Date(selectedBed.cleaningStartedAt || Date.now()).toLocaleTimeString()}</strong></span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsHousekeepingModalOpen(false)}
                  className="h-8 text-xs"
                >
                  Close
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCompleteHousekeeping}
                  className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Mark Cleaned & Vacant
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
