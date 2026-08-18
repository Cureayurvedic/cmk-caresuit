import React, { forwardRef } from "react";
import { format } from "date-fns";

export interface PatientRegDetailsData {
  uhid: string;
  regDate: string;
  name: string;
  guardianName: string;
  genderAge: string;
  maritalStatus: string;
  religion: string;
  aadhaarCard: string;
  nationality: string;
  passportNo?: string;
  address: string;
  cityStateZip: string;
  mobile: string;
  altPhone: string;
  emergencyName: string;
  emergencyContact: string;
  sponsor: string;
  referringDoctor: string;
}

interface Props {
  patient: PatientRegDetailsData;
}

export const PatientRegistrationDetailsPrint = forwardRef<HTMLDivElement, Props>(
  ({ patient }, ref) => {
    return (
      <div ref={ref} className="p-8 bg-white text-black font-sans text-[11px]" style={{ width: '8.27in', minHeight: '11.69in' }}>
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          {/* Logo on the left */}
          <div className="h-16 flex items-center justify-center">
            <img 
              src={`${window.location.origin}/cmk-logo.png`} 
              alt="CMK Healthcare" 
              className="h-full object-contain" 
            />
          </div>
          {/* Clinic Details on the right side corner */}
          <div className="leading-tight text-right">
            <h1 className="font-extrabold text-[13px] uppercase">CMK HEALTHCARE PVT. LTD.</h1>
            <p className="text-[10px]">M 158/5, Chittaranjan Park, New Delhi</p>
            <p className="text-[10px]">Phone: 011-41552233, 88000200 | Fax:</p>
            <p className="text-[10px]">Email: info@curemyknee.com | WebSite: www.curemyknee.com</p>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center font-bold text-[13px] mb-2 uppercase tracking-wide">Patient Registration Details</h2>

        <div className="border-t-[1.5px] border-black pt-2 pb-2">
          
          {/* Row 1 */}
          <div className="flex mb-1">
            <div className="w-1/2 flex">
              <div className="w-40 font-bold">UHID No.</div>
              <div className="w-4">:</div>
              <div className="flex-1 font-semibold">{patient.uhid}</div>
            </div>
            <div className="w-1/2 flex">
              <div className="w-24 font-bold">Date/Time</div>
              <div className="w-4">:</div>
              <div className="flex-1 font-semibold">{patient.regDate ? format(new Date(patient.regDate), "dd/MM/yyyy hh:mm a") : "-"}</div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex mb-1">
            <div className="w-full flex">
              <div className="w-40 font-bold">Patient's Name</div>
              <div className="w-4">:</div>
              <div className="flex-1 font-semibold">{patient.name}</div>
            </div>
          </div>

          {/* Row 3 */}
          <div className="flex mb-1">
            <div className="w-full flex">
              <div className="w-40 font-bold">Father/Mother/Spouse Name</div>
              <div className="w-4">:</div>
              <div className="flex-1 font-semibold">{patient.guardianName || "-"}</div>
            </div>
          </div>

          {/* Row 4 */}
          <div className="flex mb-1">
            <div className="w-1/2 flex">
              <div className="w-40 font-bold">Gender/Age</div>
              <div className="w-4">:</div>
              <div className="flex-1 font-semibold">{patient.genderAge}</div>
            </div>
            <div className="w-1/2 flex">
              <div className="w-24 font-bold">Marital Status</div>
              <div className="w-4">:</div>
              <div className="flex-1 font-semibold">{patient.maritalStatus || "-"}</div>
            </div>
          </div>

          {/* Row 5 */}
          <div className="flex mb-1">
            <div className="w-1/2 flex">
              <div className="w-40 font-bold">Religion</div>
              <div className="w-4">:</div>
              <div className="flex-1 font-semibold">{patient.religion || "-"}</div>
            </div>
            <div className="w-1/2 flex">
              <div className="w-24 font-bold">Aadhar No</div>
              <div className="w-4">:</div>
              <div className="flex-1 font-semibold">{patient.aadhaarCard || "-"}</div>
            </div>
          </div>

          {/* Row 6 */}
          <div className="flex mb-1">
            <div className="w-full flex">
              <div className="w-40 font-bold">Nationality</div>
              <div className="w-4">:</div>
              <div className="flex-1 font-semibold">{patient.nationality || "-"}</div>
            </div>
          </div>

          {/* Row 7 */}
          <div className="flex mb-1">
            <div className="w-full flex">
              <div className="w-40 font-bold">For Foreigner Passport No</div>
              <div className="w-4">:</div>
              <div className="flex-1 font-semibold">{patient.passportNo || "-"}</div>
            </div>
          </div>

        </div>

        {/* Addresses */}
        <div className="border-t-[1.5px] border-black pt-2 pb-2 flex">
          <div className="w-1/2 flex flex-col pr-4 border-r border-black/20">
            <div className="font-bold mb-1">Residential Address</div>
            <div className="leading-snug text-[10px]">
              <p>{patient.address || "-"}</p>
              <p className="mt-2">City : {patient.cityStateZip}</p>
              <p>Mobile : <span className="font-semibold">{patient.mobile || "-"}</span></p>
            </div>
          </div>
          <div className="w-1/2 flex flex-col pl-4">
            <div className="font-bold mb-1">Permanent Contact Address</div>
            <div className="leading-snug text-[10px]">
              <p>{patient.address || "-"}</p>
              <p className="mt-2">City : {patient.cityStateZip}</p>
              <p>Mobile : <span className="font-semibold">{patient.altPhone || "-"}</span></p>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="border-t-[1.5px] border-black pt-2 pb-2 flex flex-col">
          <div className="font-bold mb-2">In Emergency person to be notified</div>
          <div className="flex">
            <div className="w-1/2 flex">
              <div className="w-40 font-bold">Contact Person's Name</div>
              <div className="w-4">:</div>
              <div className="flex-1 font-semibold">{patient.emergencyName || "-"}</div>
            </div>
            <div className="w-1/2 flex">
              <div className="w-32 font-bold">Contact Number</div>
              <div className="w-4">:</div>
              <div className="flex-1 font-semibold">{patient.emergencyContact || "-"}</div>
            </div>
          </div>
        </div>

        {/* Corporate Patients */}
        <div className="border-t-[1.5px] border-black pt-2 pb-2 flex flex-col">
          <div className="font-bold mb-2">For Corporate Patients</div>
          <div className="flex">
            <div className="w-1/2 flex">
              <div className="w-40 font-bold">Sponsor</div>
              <div className="w-4">:</div>
              <div className="flex-1 font-semibold">{patient.sponsor || "-"}</div>
            </div>
            <div className="w-1/2 flex">
              <div className="w-32 font-bold">Employee ID No.</div>
              <div className="w-4">:</div>
              <div className="flex-1 font-semibold">-</div>
            </div>
          </div>
        </div>

        {/* Referring Doctor */}
        <div className="border-t-[1.5px] border-black pt-2 pb-2 flex flex-col">
          <div className="font-bold mb-1">Name and Address of the Referring Doctor/Information Centre</div>
          <div className="font-semibold">{patient.referringDoctor || "-"}</div>
        </div>

        {/* Consent */}
        <div className="border-t-[1.5px] border-black pt-2 pb-2 flex flex-col mt-2">
          <div className="font-bold mb-1">General Consent :</div>
          <div className="leading-relaxed text-justify text-[9.5px]">
            I hereby authorize the above hospital, the physicians and its Medical Staff, the members of its hospital and nursing staff, assisted by the employees of the hospital, to provide such care and administer such diagnostic, radiological and/or therapeutic procedures and treatments as in the judgement of the above physician(s) is deemed necessary or advisable in the above patient's care. This includes all routine diagnostic tests and procedures, including diagnosis, X-rays, the administration and/or injection of pharmaceutical products and medications and withdrawal of blood for laboratory or pathology. I acknowledge the fact that the hospital has the authority to dispose off the specimens taken for laboratory examination. In addition, I hereby authorize any and all persons caring for me during the hospitalization.
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-24 flex justify-between pr-10 pl-4">
          <div className="flex flex-col items-center">
            <div className="w-48 border-b border-black"></div>
            <div className="font-bold mt-1">Signature of the patient/Attendant</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-48 border-b border-black"></div>
            <div className="font-bold mt-1">Relationship</div>
          </div>
        </div>

      </div>
    );
  }
);

PatientRegistrationDetailsPrint.displayName = "PatientRegistrationDetailsPrint";
