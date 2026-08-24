import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  BedDouble,
  UserCheck,
  AlertCircle,
  Plus,
  Search,
  UserPlus,
  X,
  CheckCircle2,
  Stethoscope,
  DollarSign,
  ShieldCheck,
  ExternalLink,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast-notification";
import { getBeds, admitPatientToBed, BedItem } from "@/api/atdApi";
import { getPatients, PatientData } from "@/api/patientApi";

interface WardStat {
  name: string;
  total: number;
  occupied: number;
  available: number;
  color: string;
  categoryKey: string;
}

const DEFAULT_WARDS: WardStat[] = [
  { name: "General Ward", total: 40, occupied: 31, available: 9, color: "bg-blue-500", categoryKey: "GENERAL" },
  { name: "ICU Ward", total: 10, occupied: 9, available: 1, color: "bg-rose-500", categoryKey: "ICU" },
  { name: "Maternity / Deluxe", total: 20, occupied: 14, available: 6, color: "bg-pink-500", categoryKey: "DELUXE" },
  { name: "Pediatric / Single Private", total: 15, occupied: 10, available: 5, color: "bg-purple-500", categoryKey: "SINGLE PRIVATE" },
  { name: "Surgery / Twin Sharing", total: 12, occupied: 8, available: 4, color: "bg-amber-500", categoryKey: "TWIN SHARING" },
];

export default function WardsPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [allBeds, setAllBeds] = useState<BedItem[]>([]);
  const [registeredPatients, setRegisteredPatients] = useState<PatientData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [isPatientLookupOpen, setIsPatientLookupOpen] = useState<boolean>(false);
  const [patientSearchTerm, setPatientSearchTerm] = useState<string>("");

  // Assign Form State
  const [selectedWardName, setSelectedWardName] = useState<string>("General Ward");
  const [selectedBedNo, setSelectedBedNo] = useState<string>("");
  const [assignForm, setAssignForm] = useState({
    uhid: "",
    patientName: "",
    mobile: "",
    genderAge: "Male/32 Yr",
    doctor: "Dr. Abhishek Bansal 2273",
    billingCategory: "REGULAR",
    advancePaid: 2000,
    diagnosis: "General Inpatient Care"
  });

  // Fetch beds and patients data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const bedsRes = await getBeds();
      setAllBeds(bedsRes.beds || []);
    } catch (err) {
      console.error("Failed to load beds:", err);
    }

    try {
      const patientsRes = await getPatients({ limit: 50 });
      setRegisteredPatients(patientsRes.patients || []);
    } catch (err) {
      console.error("Failed to load patients:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute dynamic Ward statistics based on DB beds
  const wardsData = useMemo(() => {
    if (!allBeds || allBeds.length === 0) return DEFAULT_WARDS;

    // Group beds by category/ward
    const categories = Array.from(new Set(allBeds.map(b => b.category || b.ward || "GENERAL")));
    
    return categories.map((cat, idx) => {
      const catBeds = allBeds.filter(b => (b.category === cat || b.ward === cat));
      const total = catBeds.length;
      const occupied = catBeds.filter(b => b.status === "Occupied" || b.status === "Still On Bed/Discharge Approval").length;
      const available = catBeds.filter(b => b.status === "Vacant").length;
      
      const colors = ["bg-blue-500", "bg-rose-500", "bg-pink-500", "bg-purple-500", "bg-amber-500", "bg-emerald-500"];
      return {
        name: cat.toUpperCase(),
        total: total || 10,
        occupied: occupied || 0,
        available: available !== undefined ? available : total - occupied,
        color: colors[idx % colors.length],
        categoryKey: cat
      };
    });
  }, [allBeds]);

  const totalBeds = useMemo(() => {
    return allBeds.length > 0 ? allBeds.length : wardsData.reduce((a, w) => a + w.total, 0);
  }, [allBeds, wardsData]);

  const totalOccupied = useMemo(() => {
    return allBeds.length > 0
      ? allBeds.filter(b => b.status === "Occupied" || b.status === "Still On Bed/Discharge Approval").length
      : wardsData.reduce((a, w) => a + w.occupied, 0);
  }, [allBeds, wardsData]);

  const totalAvailable = useMemo(() => {
    return allBeds.length > 0
      ? allBeds.filter(b => b.status === "Vacant").length
      : wardsData.reduce((a, w) => a + w.available, 0);
  }, [allBeds, wardsData]);

  // Vacant beds filtered by selected ward in modal
  const availableBedsForSelectedWard = useMemo(() => {
    if (!allBeds || allBeds.length === 0) return [];
    return allBeds.filter(
      b => (b.status === "Vacant") &&
        (b.category?.toLowerCase() === selectedWardName.toLowerCase() ||
         b.ward?.toLowerCase() === selectedWardName.toLowerCase() ||
         selectedWardName === "All")
    );
  }, [allBeds, selectedWardName]);

  // Open Assign Bed modal prefilled for a given ward
  const openAssignModal = (wardName?: string) => {
    const targetWard = wardName || (wardsData[0]?.name || "GENERAL");
    setSelectedWardName(targetWard);

    // Auto select first vacant bed if available
    const vacantInWard = allBeds.filter(
      b => b.status === "Vacant" &&
        (b.category?.toLowerCase() === targetWard.toLowerCase() || b.ward?.toLowerCase() === targetWard.toLowerCase())
    );

    const firstVacantBed = vacantInWard[0]?.bedNo || "";
    setSelectedBedNo(firstVacantBed);

    const randomUhid = `UHID-2026-0000${Math.floor(Math.random() * 89) + 10}`;
    setAssignForm({
      uhid: randomUhid,
      patientName: "",
      mobile: "9876543210",
      genderAge: "Male/30 Yr",
      doctor: "Dr. Abhishek Bansal 2273",
      billingCategory: "REGULAR",
      advancePaid: vacantInWard[0]?.tariffRate || 2000,
      diagnosis: "General Inpatient Care"
    });

    setIsAssignModalOpen(true);
  };

  // Pick patient from census lookup
  const handleSelectPatient = (patient: PatientData) => {
    const fullName = patient.fullName || `${patient.firstName || ""} ${patient.lastName || ""}`.trim();

    // Check if patient is already admitted
    const alreadyAdmitted = allBeds.find(
      b => b.patient &&
        (b.status === "Occupied" || b.status === "Still On Bed/Discharge Approval") &&
        ((b.patient.uhid && patient.uhid && b.patient.uhid.toLowerCase() === patient.uhid.toLowerCase()) ||
         (b.patient.name && b.patient.name.toLowerCase().includes(fullName.toLowerCase())))
    );

    if (alreadyAdmitted) {
      toast.error("Already Admitted", `Patient ${fullName} is currently admitted in Bed ${alreadyAdmitted.bedNo}. Double bed allocation is not allowed!`);
      return;
    }

    setAssignForm(prev => ({
      ...prev,
      uhid: patient.uhid || prev.uhid,
      patientName: fullName,
      mobile: patient.mobile || prev.mobile,
      genderAge: `${patient.gender || "Male"}/${patient.age || "30"} Yr`,
      doctor: patient.referredBy || prev.doctor
    }));

    setIsPatientLookupOpen(false);
    toast.success("Patient Selected", `Loaded details for ${fullName} (${patient.uhid})`);
  };

  // Submit Assign Bed Form
  const handleAssignBedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBedNo) {
      toast.error("Bed Required", "Please select an available vacant bed to assign.");
      return;
    }
    if (!assignForm.patientName.trim()) {
      toast.error("Patient Name Required", "Please enter or select a patient for bed assignment.");
      return;
    }

    const targetBed = allBeds.find(b => b.bedNo === selectedBedNo);

    // Double check patient admission state
    const alreadyAdmitted = allBeds.find(
      b => b.patient &&
        (b.status === "Occupied" || b.status === "Still On Bed/Discharge Approval") &&
        ((b.patient.uhid && assignForm.uhid && b.patient.uhid.toLowerCase() === assignForm.uhid.toLowerCase()) ||
         (b.patient.name && b.patient.name.toLowerCase().includes(assignForm.patientName.trim().toLowerCase())))
    );

    if (alreadyAdmitted) {
      toast.error("Duplicate Admission Blocked", `Patient "${assignForm.patientName}" is already admitted in Bed ${alreadyAdmitted.bedNo}. Single patient cannot occupy 2 beds!`);
      return;
    }

    try {
      setIsSubmitting(true);
      await admitPatientToBed({
        bedId: targetBed?.id,
        bedNo: selectedBedNo,
        uhid: assignForm.uhid,
        patientName: assignForm.patientName,
        bookingNo: `BKG-${Math.floor(Math.random() * 89999) + 10000}`,
        ipNo: `IP-2026/${Math.floor(Math.random() * 899) + 100}`,
        treatingConsultant: assignForm.doctor,
        admittingDoctor: assignForm.doctor,
        ward: selectedWardName,
        bedCategory: targetBed?.category || selectedWardName,
        billingCategory: assignForm.billingCategory,
        advancePaid: Number(assignForm.advancePaid || 0),
        minAdvRequire: targetBed?.tariffRate || 2000,
        estimatedAmt: (targetBed?.tariffRate || 2000) * 3,
        kinDetails: {
          name: assignForm.patientName,
          mobile: assignForm.mobile,
          gender: assignForm.genderAge.split("/")[0] || "Male"
        }
      });

      toast.success(
        "Bed Assigned Successfully!",
        `Patient ${assignForm.patientName} successfully admitted to Bed ${selectedBedNo} (${selectedWardName}).`
      );

      setIsAssignModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error("Bed Assignment Failed", err.message || "Failed to complete bed allocation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered patients for search in lookup modal
  const filteredPatients = useMemo(() => {
    if (!patientSearchTerm.trim()) return registeredPatients;
    const term = patientSearchTerm.toLowerCase();
    return registeredPatients.filter(
      p =>
        (p.fullName && p.fullName.toLowerCase().includes(term)) ||
        (p.firstName && p.firstName.toLowerCase().includes(term)) ||
        (p.uhid && p.uhid.toLowerCase().includes(term)) ||
        (p.mobile && p.mobile.includes(term))
    );
  }, [registeredPatients, patientSearchTerm]);

  return (
    <div className="p-6 space-y-6 animate-fade-in text-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Ward Management
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Monitor bed occupancy and assign vacant inpatient beds across all hospital wards</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/atd")}
            className="gap-1.5 text-slate-700 border-slate-300 hover:bg-slate-50"
          >
            <ExternalLink className="h-4 w-4 text-blue-600" />
            View Full ATD Matrix
          </Button>

          <Button
            size="sm"
            onClick={() => openAssignModal()}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
          >
            <BedDouble className="h-4 w-4" />
            Assign Bed
          </Button>
        </div>
      </div>

      {/* Summary Counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Hospital Beds", value: totalBeds, icon: BedDouble, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Occupied Beds", value: totalOccupied, icon: UserCheck, color: "text-rose-500", bg: "bg-rose-50" },
          { label: "Available Vacant Beds", value: totalAvailable, icon: AlertCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="card-hover border-slate-200 shadow-xs">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{s.label}</CardTitle>
                <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${s.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold text-slate-800">{isLoading ? "..." : s.value}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Ward Occupancy List */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
            <Building2 className="h-4 w-4 text-blue-600" />
            Ward Occupancy Overview
          </CardTitle>
          <span className="text-xs text-slate-500 font-medium">Real-time Census Data</span>
        </CardHeader>

        <CardContent className="pt-4 space-y-5">
          {wardsData.map((ward) => {
            const pct = Math.round((ward.occupied / ward.total) * 100);
            return (
              <div key={ward.name} className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-slate-800">{ward.name}</span>
                    <Badge variant={ward.available === 0 ? "destructive" : ward.available < 3 ? "warning" : "success"} className="text-[10px] px-2 py-0.5 font-bold">
                      {ward.available} Free Beds
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-600">
                      {ward.occupied} / {ward.total} Occupied ({pct}%)
                    </span>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={ward.available === 0}
                      onClick={() => openAssignModal(ward.name)}
                      className="h-7 text-xs font-bold text-blue-700 border-blue-200 hover:bg-blue-50 gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Assign Bed
                    </Button>
                  </div>
                </div>

                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${ward.color}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ─── ASSIGN BED DIALOG / MODAL ────────────────────────────────────────── */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-blue-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BedDouble className="h-5 w-5 text-blue-200" />
                <div>
                  <h3 className="font-bold text-sm">Assign Inpatient Bed</h3>
                  <p className="text-[11px] text-blue-100">Quick bed allocation & inpatient admission</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsAssignModalOpen(false)}
                className="h-7 w-7 p-0 text-white hover:bg-blue-600 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAssignBedSubmit} className="p-5 space-y-4 text-xs">
              {/* Patient Selection Row */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-700">Patient Details *</Label>
                  <button
                    type="button"
                    onClick={() => setIsPatientLookupOpen(true)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Search className="h-3 w-3" />
                    Select Registered Patient
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[11px] text-slate-500">Patient UHID</Label>
                    <Input
                      readOnly
                      value={assignForm.uhid}
                      className="h-8 text-xs bg-slate-50 font-mono font-bold text-blue-900"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-slate-500">Patient Full Name *</Label>
                    <Input
                      required
                      placeholder="Enter patient name..."
                      value={assignForm.patientName}
                      onChange={e => setAssignForm(prev => ({ ...prev, patientName: e.target.value }))}
                      className="h-8 text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Ward & Vacant Bed Selection */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <Label className="text-xs font-bold text-slate-700 mb-1 block">Ward Category *</Label>
                  <Select
                    value={selectedWardName}
                    onValueChange={val => {
                      setSelectedWardName(val);
                      const vacantInVal = allBeds.filter(
                        b => b.status === "Vacant" &&
                          (b.category?.toLowerCase() === val.toLowerCase() || b.ward?.toLowerCase() === val.toLowerCase())
                      );
                      setSelectedBedNo(vacantInVal[0]?.bedNo || "");
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs font-bold">
                      <SelectValue placeholder="Select Ward" />
                    </SelectTrigger>
                    <SelectContent>
                      {wardsData.map(w => (
                        <SelectItem key={w.name} value={w.name}>
                          {w.name} ({w.available} free)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-bold text-slate-700 mb-1 block">Available Vacant Bed *</Label>
                  <Select
                    value={selectedBedNo}
                    onValueChange={val => {
                      setSelectedBedNo(val);
                      const bObj = allBeds.find(b => b.bedNo === val);
                      if (bObj) {
                        setAssignForm(prev => ({ ...prev, advancePaid: bObj.tariffRate || 2000 }));
                      }
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs font-bold bg-emerald-50/50 border-emerald-300 text-emerald-900">
                      <SelectValue placeholder="Select Bed No" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBedsForSelectedWard.length > 0 ? (
                        availableBedsForSelectedWard.map(b => (
                          <SelectItem key={b.bedNo} value={b.bedNo}>
                            Bed {b.bedNo} — ₹{b.tariffRate}/day
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="NO_BED" disabled>
                          No vacant beds in this ward
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Attending Doctor & Billing Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-slate-700 mb-1 block">Attending Consultant</Label>
                  <Select
                    value={assignForm.doctor}
                    onValueChange={val => setAssignForm(prev => ({ ...prev, doctor: val }))}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select Doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dr. Abhishek Bansal 2273">Dr. Abhishek Bansal 2273 (Gen Medicine)</SelectItem>
                      <SelectItem value="Dr. Sameer Sen 3105">Dr. Sameer Sen 3105 (Orthopedics)</SelectItem>
                      <SelectItem value="Dr. Pooja Sharma 1092">Dr. Pooja Sharma 1092 (Gynecologist)</SelectItem>
                      <SelectItem value="Dr. Rajesh Varma 4410">Dr. Rajesh Varma 4410 (Surgery)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-bold text-slate-700 mb-1 block">Billing Category</Label>
                  <Select
                    value={assignForm.billingCategory}
                    onValueChange={val => setAssignForm(prev => ({ ...prev, billingCategory: val }))}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Billing Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REGULAR">REGULAR (Self Pay)</SelectItem>
                      <SelectItem value="TPA / INSURANCE">TPA / Star Health</SelectItem>
                      <SelectItem value="CORPORATE">CORPORATE (CGHS/EHS)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Mobile & Advance Deposit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[11px] font-medium text-slate-600">Contact Number</Label>
                  <Input
                    value={assignForm.mobile}
                    onChange={e => setAssignForm(prev => ({ ...prev, mobile: e.target.value }))}
                    className="h-8 text-xs"
                    placeholder="9876543210"
                  />
                </div>

                <div>
                  <Label className="text-[11px] font-medium text-slate-600">Initial Advance Deposit (₹)</Label>
                  <Input
                    type="number"
                    value={assignForm.advancePaid}
                    onChange={e => setAssignForm(prev => ({ ...prev, advancePaid: Number(e.target.value) }))}
                    className="h-8 text-xs font-bold text-emerald-800 bg-emerald-50/40"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="h-8 text-xs"
                >
                  Cancel
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsAssignModalOpen(false);
                      navigate("/atd");
                    }}
                    className="h-8 text-xs text-blue-600 hover:bg-blue-50 gap-1"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Go to Full Matrix
                  </Button>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting || !selectedBedNo}
                    className="h-8 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 px-4 shadow-xs"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isSubmitting ? "Assigning..." : "Confirm & Assign Bed"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── REGISTERED PATIENT LOOKUP MODAL ──────────────────────────────────── */}
      {isPatientLookupOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-3 bg-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-blue-400" />
                <span className="font-bold text-sm">Select Registered Patient</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsPatientLookupOpen(false)}
                className="h-6 w-6 p-0 text-white hover:bg-slate-700 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search by UHID, patient name, or mobile..."
                  value={patientSearchTerm}
                  onChange={e => setPatientSearchTerm(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map(p => {
                    const pName = p.fullName || `${p.firstName || ""} ${p.lastName || ""}`.trim();
                    return (
                      <div
                        key={p.id || p.uhid}
                        onClick={() => handleSelectPatient(p)}
                        className="p-2.5 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-800">{pName}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{p.uhid} • {p.mobile || "No Mobile"}</p>
                        </div>
                        <Button size="sm" variant="ghost" className="h-6 text-[10px] font-bold text-blue-600 hover:bg-blue-100">
                          Select
                        </Button>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-xs text-slate-400 py-6">No registered patients found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
