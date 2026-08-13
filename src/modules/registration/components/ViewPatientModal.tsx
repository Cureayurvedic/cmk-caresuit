import { X, User, Phone, AlertCircle, Shield, CreditCard, Users, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PatientData } from "@/api/patientApi";

interface ViewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientData | null;
}

export default function ViewPatientModal({ isOpen, onClose, patient }: ViewPatientModalProps) {
  if (!isOpen || !patient) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 animate-fade-in">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm shadow-inner">
              {patient.firstName ? patient.firstName[0].toUpperCase() : "P"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-base leading-tight">{getFullName()}</h3>
                <Badge variant={patient.status === "Active" ? "success" : patient.status === "Inactive" ? "secondary" : "warning"} className="text-[9px] py-0.5 px-2">
                  {patient.status || "Active"}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">UHID: {patient.uhid || "N/A"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Top Quick Info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Registration Type</span>
              <span className="text-xs font-semibold text-slate-700 block mt-0.5">{patient.registrationType || "New Registration"}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Gender / Age</span>
              <span className="text-xs font-semibold text-slate-700 block mt-0.5">{patient.gender || "N/A"} / {patient.age ? `${patient.age} Y` : "N/A"}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Mobile Number</span>
              <span className="text-xs font-semibold text-slate-700 block mt-0.5">{patient.mobile || "N/A"}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Registration Date</span>
              <span className="text-xs font-semibold text-slate-700 block mt-0.5">{formatDate(patient.regDate)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1: Personal & Contacts */}
            <div className="space-y-5">
              {/* Personal Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <User className="h-4 w-4 text-blue-500" />
                  Personal Information
                </h4>
                <Separator />
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Relation & Guardian</span>
                    <span className="font-medium text-slate-700">{patient.guardianRelation || "Relation"} — {patient.guardianName || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Date of Birth</span>
                    <span className="font-medium text-slate-700">{formatDate(patient.dob)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Marital Status</span>
                    <span className="font-medium text-slate-700">{patient.maritalStatus || "Single"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Email Address</span>
                    <span className="font-medium text-slate-700 truncate block">{patient.email || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-emerald-500" />
                  Contact Details
                </h4>
                <Separator />
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                  <div className="col-span-2">
                    <span className="text-slate-400 block">Address</span>
                    <span className="font-medium text-slate-700 block whitespace-pre-wrap">{patient.address || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Country / State</span>
                    <span className="font-medium text-slate-700">{patient.country || "India"} / {patient.state || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">District / City</span>
                    <span className="font-medium text-slate-700">{patient.districtCity || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Area / Locality</span>
                    <span className="font-medium text-slate-700">{patient.area || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">PIN Code</span>
                    <span className="font-medium text-slate-700">{patient.pinCode || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Alternative Phone</span>
                    <span className="font-medium text-slate-700">{patient.altPhone || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Emergency, Identity & Payer */}
            <div className="space-y-5">
              {/* Emergency Contact */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  Emergency Contact
                </h4>
                <Separator />
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Contact Name</span>
                    <span className="font-medium text-slate-700">{patient.emergencyName || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Relationship</span>
                    <span className="font-medium text-slate-700">{patient.emergencyRelationship || "N/A"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block">Contact Number</span>
                    <span className="font-medium text-slate-700">{patient.emergencyContact || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Patient Identity */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-purple-500" />
                  Patient Identity & Flags
                </h4>
                <Separator />
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Nationality</span>
                    <span className="font-medium text-slate-700">{patient.nationality || "Indian"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Aadhaar Card</span>
                    <span className="font-medium text-slate-700">{patient.aadhaarCard || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">PAN No.</span>
                    <span className="font-medium text-slate-700">{patient.panNo || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">VIP Status</span>
                    <span className="font-medium text-slate-700">
                      {patient.isVip ? (
                        <Badge variant="destructive" className="text-[9px] py-0 px-1.5">Yes</Badge>
                      ) : "No"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payer & Referral */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-amber-500" />
                  Payer & Referral Info
                </h4>
                <Separator />
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Payer Type / Payer</span>
                    <span className="font-medium text-slate-700 capitalize">{patient.payerType || "direct"} — {patient.payer || "CASH"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Sponsor</span>
                    <span className="font-medium text-slate-700">{patient.sponsor || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Provider / HCF</span>
                    <span className="font-medium text-slate-700">{patient.provider || "Self"} / {patient.hcf || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Lead Source</span>
                    <span className="font-medium text-slate-700">{patient.leadSource || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Fields Row */}
          {(patient.religion || patient.occupation || patient.voterId || patient.covidStatus || patient.passportNo || patient.visaNo) && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-pink-500" />
                Additional & Custom Fields
              </h4>
              <Separator />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                {patient.religion && (
                  <div>
                    <span className="text-slate-400 block">Religion</span>
                    <span className="font-medium text-slate-700">{patient.religion}</span>
                  </div>
                )}
                {patient.occupation && (
                  <div>
                    <span className="text-slate-400 block">Occupation</span>
                    <span className="font-medium text-slate-700">{patient.occupation}</span>
                  </div>
                )}
                {patient.voterId && (
                  <div>
                    <span className="text-slate-400 block">Voter ID</span>
                    <span className="font-medium text-slate-700">{patient.voterId}</span>
                  </div>
                )}
                {patient.covidStatus && (
                  <div>
                    <span className="text-slate-400 block">Covid Status</span>
                    <span className="font-medium text-slate-700">{patient.covidStatus}</span>
                  </div>
                )}
                {patient.passportNo && (
                  <div>
                    <span className="text-slate-400 block">Passport Number</span>
                    <span className="font-medium text-slate-700">{patient.passportNo}</span>
                  </div>
                )}
                {patient.visaNo && (
                  <div>
                    <span className="text-slate-400 block">Visa Number</span>
                    <span className="font-medium text-slate-700">{patient.visaNo}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-100 bg-slate-50 gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs font-medium">
            Close View
          </Button>
        </div>
      </div>
    </div>
  );
}
