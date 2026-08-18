import React, { forwardRef } from "react";
import Barcode from "react-barcode";
import { format } from "date-fns";

export interface PatientPrintData {
  name: string;
  uhid: string;
  dob?: string | null;
}

interface Props {
  patient: PatientPrintData;
}

export const RegistrationLabelPrint = forwardRef<HTMLDivElement, Props>(
  ({ patient }, ref) => {
    const formattedDob = patient.dob ? format(new Date(patient.dob), "dd/MM/yyyy") : "-";

    const LabelBox = () => (
      <div className="w-[3.5in] h-[1.5in] border border-slate-300 p-3 font-sans text-black bg-white flex flex-col overflow-hidden">
        {/* Text Details Stack */}
        <div className="flex flex-col gap-1 min-w-0 px-1">
          <div className="flex text-[13px] font-extrabold leading-tight tracking-tight">
            <span className="w-14 shrink-0">Name</span>
            <span className="truncate">: {patient.name}</span>
          </div>
          <div className="flex text-[13px] font-extrabold leading-tight tracking-tight">
            <span className="w-14 shrink-0">PatID</span>
            <span className="break-words" style={{ wordBreak: 'break-word' }}>: {patient.uhid}</span>
          </div>
          <div className="flex text-[13px] font-extrabold leading-tight tracking-tight">
            <span className="w-14 shrink-0">D.O.B</span>
            <span>: {formattedDob}</span>
          </div>
        </div>

        {/* Barcode Container at Bottom */}
        <div className="w-full flex justify-center items-end mt-auto pt-1">
          <Barcode 
            value={patient.uhid} 
            width={1.1} 
            height={40} 
            displayValue={false} 
            margin={0}
            background="transparent"
          />
        </div>
      </div>
    );

    return (
      <div ref={ref} className="p-8 bg-white" style={{ width: '8.5in' }}>
        <div className="flex gap-4">
          <LabelBox />
          <LabelBox />
        </div>
      </div>
    );
  }
);

RegistrationLabelPrint.displayName = "RegistrationLabelPrint";
