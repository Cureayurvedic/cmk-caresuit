import React, { useState } from "react";
import { Stethoscope, X, Plus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast-notification";
import { addSettingsItem } from "@/api/settingsApi";

interface AddDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDoctorCreated?: (doctorName: string) => void;
}

export default function AddDoctorModal({
  isOpen,
  onClose,
  onDoctorCreated,
}: AddDoctorModalProps) {
  const toast = useToast();
  const [doctorName, setDoctorName] = useState("");
  const [specialty, setSpecialty] = useState("General Medicine");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let nameTrimmed = doctorName.trim();
    if (!nameTrimmed) {
      toast.error("Validation Error", "Please enter a Doctor Name.");
      return;
    }

    // Auto-prefix Dr. if not provided
    if (!nameTrimmed.toLowerCase().startsWith("dr")) {
      nameTrimmed = `Dr. ${nameTrimmed}`;
    }

    const fullDoctorString = nameTrimmed;

    setLoading(true);
    try {
      await addSettingsItem("doctors", fullDoctorString);
      toast.success(
        "Doctor Created",
        `"${fullDoctorString}" has been added to Settings & Doctor Master List.`,
      );

      if (onDoctorCreated) {
        onDoctorCreated(fullDoctorString);
      }

      // Reset form and close
      setDoctorName("");
      setSpecialty("General Medicine");
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to create doctor";
      toast.error("Creation Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-slate-200">
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-white/20 rounded-lg">
              <Stethoscope className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">
                Create New Doctor
              </h3>
              <p className="text-[10px] text-blue-100 font-medium">
                Add doctor to master settings list
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="h-7 w-7 p-0 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              Doctor Name <span className="text-red-500">*</span>
            </Label>
            <Input
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder="e.g. Dr. Jane Doe or Jane Doe"
              className="mt-1 h-9 text-xs border-slate-300 focus:border-blue-500 font-medium"
              autoFocus
              required
            />
            <p className="text-[10px] text-slate-500 mt-0.5">
              Prefix "Dr." will be added automatically if omitted.
            </p>
          </div>

          <div>
            <Label className="text-xs font-bold text-slate-700">
              Specialty
            </Label>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="mt-1 w-full h-9 text-xs px-2 border border-slate-300 rounded-md bg-white font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="General Medicine">General Medicine</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Gynecology">Gynecology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Neurology">Neurology</option>
              <option value="General Surgery">General Surgery</option>
              <option value="Dermatology">Dermatology</option>
              <option value="ENT">ENT</option>
              <option value="Ophthalmology">Ophthalmology</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 text-xs font-semibold"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-8 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-sm"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-1">Saving...</span>
              ) : (
                <>
                  <UserCheck className="h-3.5 w-3.5" />
                  Save & Select Doctor
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
