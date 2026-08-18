import React, { forwardRef } from "react";
import Barcode from "react-barcode";

export interface PatientCardPrintData {
  name: string;
  uhid: string;
  age?: string | number | null;
  gender?: string | null;
  contact?: string | null;
}

interface Props {
  patient: PatientCardPrintData;
}

export const RegistrationCardPrint = forwardRef<HTMLDivElement, Props>(
  ({ patient }, ref) => {
    // Format Age|Gender string
    const ageStr = patient.age ? `${patient.age} Yrs` : ""; // Simplify for now, or use exactly what we have
    const genderStr = patient.gender || "";
    const ageGender = [ageStr, genderStr].filter(Boolean).join("/");

    return (
      <div ref={ref} className="p-8 bg-white" style={{ width: '8.5in' }}>
        {/* Card Container - slightly larger for perfect readability */}
        <div className="w-[4in] h-[2.5in] border border-slate-300 p-5 font-sans text-black bg-white flex flex-col relative overflow-hidden">
          
          {/* Top Name */}
          <div className="mb-3 pl-2">
            <span className="text-[16px] font-extrabold uppercase tracking-wide">{patient.name}</span>
          </div>

          {/* Details Grid */}
          <div className="flex flex-col gap-2 pl-2 flex-1">
            <div className="flex text-[12px] font-bold leading-tight">
              <span className="w-24 shrink-0 text-slate-700">UHID</span>
              <span className="truncate">: {patient.uhid}</span>
            </div>
            <div className="flex text-[12px] font-bold leading-tight">
              <span className="w-24 shrink-0 text-slate-700">Age|Gender</span>
              <span className="truncate">: {ageGender || "-"}</span>
            </div>
            <div className="flex text-[12px] font-bold leading-tight">
              <span className="w-24 shrink-0 text-slate-700">Contact</span>
              <span className="truncate">: {patient.contact || "-"}</span>
            </div>
          </div>

          {/* Barcode at bottom, centered and large enough to scan perfectly */}
          <div className="w-full flex justify-center mt-auto pb-1">
            <Barcode 
              value={patient.uhid} 
              width={1.2} 
              height={40} 
              displayValue={false} 
              margin={0}
              background="transparent"
            />
          </div>

        </div>
      </div>
    );
  }
);

RegistrationCardPrint.displayName = "RegistrationCardPrint";
