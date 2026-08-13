import { X, User, Phone, AlertCircle, Shield, CreditCard, Sliders, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PatientData } from "@/api/patientApi";

interface PatientLedgerViewProps {
  patient: PatientData;
  onClose: () => void;
}

export default function PatientLedgerView({ patient, onClose }: PatientLedgerViewProps) {
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getFullName = () => {
    if (patient.fullName) return patient.fullName;
    const parts = [patient.title, patient.firstName, patient.middleName, patient.lastName].filter(Boolean);
    return parts.join(" ");
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm shadow-inner">
            {patient.firstName ? patient.firstName[0].toUpperCase() : "P"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 text-sm leading-tight">{getFullName()}</h3>
              <Badge variant={patient.status === "Active" ? "success" : patient.status === "Inactive" ? "secondary" : "warning"} className="text-[8px] py-0.2 px-1.5">
                {patient.status || "Active"}
              </Badge>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">UHID: {patient.uhid || "N/A"}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Content Area */}
      <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs">
        {/* Quick Summary Grid */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50/60 p-3 rounded-lg border border-slate-100">
          <div>
            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block">Registration Type</span>
            <span className="font-semibold text-slate-700 block mt-0.5">{patient.registrationType || "New Registration"}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block">Gender / Age</span>
            <span className="font-semibold text-slate-700 block mt-0.5">{patient.gender || "N/A"} / {patient.age ? `${patient.age} Y` : "N/A"}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block">Mobile Number</span>
            <span className="font-semibold text-slate-700 block mt-0.5">{patient.mobile || "N/A"}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block">Registration Date</span>
            <span className="font-semibold text-slate-700 block mt-0.5">{formatDate(patient.regDate)}</span>
          </div>
        </div>

        {/* Details Dossier */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Personal Information */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-blue-500" />
              Personal Info
            </h4>
            <Separator />
            <div className="space-y-2">
              <div>
                <span className="text-slate-400 block text-[10px]">Relation & Guardian</span>
                <span className="font-medium text-slate-700">{patient.guardianRelation || "Relation"} — {patient.guardianName || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Date of Birth</span>
                <span className="font-medium text-slate-700">{formatDate(patient.dob)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Marital Status</span>
                <span className="font-medium text-slate-700">{patient.maritalStatus || "Single"}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Email Address</span>
                <span className="font-medium text-slate-700 truncate block">{patient.email || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-emerald-500" />
              Contact Details
            </h4>
            <Separator />
            <div className="space-y-2">
              <div>
                <span className="text-slate-400 block text-[10px]">Address</span>
                <span className="font-medium text-slate-700 block whitespace-pre-wrap">{patient.address || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Country / State</span>
                <span className="font-medium text-slate-700">{patient.country || "India"} / {patient.state || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">City / Area / PIN</span>
                <span className="font-medium text-slate-700">
                  {[patient.districtCity, patient.area, patient.pinCode].filter(Boolean).join(", ") || "N/A"}
                </span>
              </div>
              {patient.altPhone && (
                <div>
                  <span className="text-slate-400 block text-[10px]">Alternative Phone</span>
                  <span className="font-medium text-slate-700">{patient.altPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-red-500" />
              Emergency Contact
            </h4>
            <Separator />
            <div className="space-y-2">
              <div>
                <span className="text-slate-400 block text-[10px]">Contact Name</span>
                <span className="font-medium text-slate-700">{patient.emergencyName || "N/A"} ({patient.emergencyRelationship || "N/A"})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Contact Number</span>
                <span className="font-medium text-slate-700">{patient.emergencyContact || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Patient Identity */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-purple-500" />
              Identity & Flags
            </h4>
            <Separator />
            <div className="space-y-2">
              <div>
                <span className="text-slate-400 block text-[10px]">Aadhaar / PAN / Nationality</span>
                <span className="font-medium text-slate-700">
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
          <div className="space-y-2 sm:col-span-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-amber-500" />
              Payer & Referral Info
            </h4>
            <Separator />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[10px]">Payer / Sponsor</span>
                <span className="font-medium text-slate-700 capitalize">{patient.payerType || "direct"} — {patient.payer || "CASH"} {patient.sponsor ? `(${patient.sponsor})` : ""}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Provider / HCF</span>
                <span className="font-medium text-slate-700">{patient.provider || "Self"} / {patient.hcf || "N/A"}</span>
              </div>
              {patient.leadSource && (
                <div>
                  <span className="text-slate-400 block text-[10px]">Lead Source</span>
                  <span className="font-medium text-slate-700">{patient.leadSource}</span>
                </div>
              )}
              {patient.referredBy && (
                <div>
                  <span className="text-slate-400 block text-[10px]">Referred By</span>
                  <span className="font-medium text-slate-700">{patient.referredType || "Doctor"}: {patient.referredBy}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Custom Fields */}
        {(patient.religion || patient.occupation || patient.voterId || patient.covidStatus || patient.passportNo || patient.visaNo) && (
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-pink-500" />
              Additional Details
            </h4>
            <Separator />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {patient.religion && (
                <div>
                  <span className="text-slate-400 block text-[10px]">Religion</span>
                  <span className="font-medium text-slate-700">{patient.religion}</span>
                </div>
              )}
              {patient.occupation && (
                <div>
                  <span className="text-slate-400 block text-[10px]">Occupation</span>
                  <span className="font-medium text-slate-700">{patient.occupation}</span>
                </div>
              )}
              {patient.voterId && (
                <div>
                  <span className="text-slate-400 block text-[10px]">Voter ID</span>
                  <span className="font-medium text-slate-700">{patient.voterId}</span>
                </div>
              )}
              {patient.covidStatus && (
                <div>
                  <span className="text-slate-400 block text-[10px]">Covid Status</span>
                  <span className="font-medium text-slate-700">{patient.covidStatus}</span>
                </div>
              )}
              {patient.passportNo && (
                <div>
                  <span className="text-slate-400 block text-[10px]">Passport No.</span>
                  <span className="font-medium text-slate-700">{patient.passportNo}</span>
                </div>
              )}
              {patient.visaNo && (
                <div>
                  <span className="text-slate-400 block text-[10px]">Visa No.</span>
                  <span className="font-medium text-slate-700">{patient.visaNo}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end px-5 py-3 border-t border-slate-100 bg-slate-50 flex-shrink-0">
        <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs font-medium">
          Close Ledger
        </Button>
      </div>
    </div>
  );
}
