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
  altPhone?: string;
  emergencyName?: string;
  emergencyContact?: string;
  sponsor?: string;
  referringDoctor?: string;
  pinCode?: string;
  city?: string;
  employeeId?: string;
  relationship?: string;
}

interface Props {
  patient: PatientRegDetailsData;
}

export const PatientRegistrationDetailsPrint = forwardRef<HTMLDivElement, Props>(
  ({ patient }, ref) => {
    let formattedRegDate = "-";
    try {
      if (patient.regDate) {
        formattedRegDate = format(new Date(patient.regDate), "dd/MM/yyyy HH:mm a");
      }
    } catch {
      formattedRegDate = patient.regDate || "-";
    }

    return (
      <div
        ref={ref}
        className="p-6 bg-white text-black font-sans text-[11px] leading-tight"
        style={{ width: "8.27in", boxSizing: "border-box" }}
      >
        <style>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 6mm 8mm;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              background: #fff;
            }
          }
          .reg-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6px;
          }
          .reg-table th, .reg-table td {
            border: 1px solid #71717a;
            padding: 3px 6px;
            vertical-align: middle;
          }
          .reg-header-bg {
            background-color: #f1f5f9;
            font-weight: 700;
            font-size: 11px;
            color: #0f172a;
          }
        `}</style>

        {/* ─── 1. Header: Logo on Left, Hospital Details Centered (matches OP billing print) ─── */}
        <div className="flex items-center justify-between pb-2 mb-2">
          {/* Logo on Left */}
          <div className="w-36 flex-shrink-0 flex items-center justify-start">
            <img
              src="/cmk-logo.png"
              alt="CMK HealthCare Logo"
              className="h-16 w-auto object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes("cmk_caresuit_logo")) {
                  target.src = "/cmk_caresuit_logo.png";
                }
              }}
            />
          </div>

          {/* Centered Hospital Details */}
          <div className="flex-1 text-center space-y-0.5">
            <h1 className="text-lg font-black text-slate-900 uppercase tracking-wide font-serif">
              CMK HEALTH CARE PVT. LTD.
            </h1>
            <p className="text-xs font-bold text-slate-800 tracking-wide uppercase">
              (ORTHO &amp; JOINT CARE CENTRE)
            </p>
            <p className="text-[11px] text-slate-700 font-medium">
              H-1565 C.R. Park (Near Mela Ground) New Delhi-110019
            </p>
            <p className="text-[11px] text-slate-600 font-semibold underline">
              www.curemyknee.com
            </p>
          </div>

          {/* Right Spacer for balance */}
          <div className="w-36 flex-shrink-0"></div>
        </div>

        {/* ─── 2. Centered Document Title (matches OP billing print) ─── */}
        <div className="text-center pb-2 border-b border-slate-300 mb-3">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider underline decoration-slate-900 underline-offset-4 mb-2.5">
            PATIENT REGISTRATION DETAILS
          </h2>
        </div>


        {/* ─── 3. MRDNo. & Date/Time Box ─── */}
        <table className="reg-table">
          <tbody>
            <tr>
              <td className="w-1/2">
                <div className="flex items-center">
                  <span className="font-bold w-24">MRDNo.</span>
                  <span className="font-bold mr-2">:</span>
                  <span className="font-semibold text-black">{patient.uhid}</span>
                </div>
              </td>
              <td className="w-1/2">
                <div className="flex items-center">
                  <span className="font-bold w-24">Date/Time</span>
                  <span className="font-bold mr-2">:</span>
                  <span className="font-semibold text-black">{formattedRegDate}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ─── 4. Demographics Grid Box ─── */}
        <table className="reg-table">
          <tbody>
            <tr>
              <td colSpan={2}>
                <div className="flex items-center">
                  <span className="font-bold w-44">Patient's Name</span>
                  <span className="font-bold mr-2">:</span>
                  <span className="font-semibold text-black">{patient.name}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={2}>
                <div className="flex items-center">
                  <span className="font-bold w-44">Father/Mother/Spouse Name</span>
                  <span className="font-bold mr-2">:</span>
                  <span className="font-semibold text-black">{patient.guardianName || "C/O#SELF"}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td className="w-1/2">
                <div className="flex items-center">
                  <span className="font-bold w-44">Gender/Age</span>
                  <span className="font-bold mr-2">:</span>
                  <span className="font-semibold text-black">{patient.genderAge}</span>
                </div>
              </td>
              <td className="w-1/2">
                <div className="flex items-center">
                  <span className="font-bold w-32">Marital Status</span>
                  <span className="font-bold mr-2">:</span>
                  <span className="font-semibold text-black">{patient.maritalStatus || "Other"}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td className="w-1/2">
                <div className="flex items-center">
                  <span className="font-bold w-44">Religion</span>
                  <span className="font-bold mr-2">:</span>
                  <span className="font-semibold text-black uppercase">{patient.religion || "HINDU"}</span>
                </div>
              </td>
              <td className="w-1/2">
                <div className="flex items-center">
                  <span className="font-bold w-32">AadharNo</span>
                  <span className="font-bold mr-2">:</span>
                  <span className="font-semibold text-black font-mono">{patient.aadhaarCard || ""}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={2}>
                <div className="flex items-center">
                  <span className="font-bold w-44">Nationality</span>
                  <span className="font-bold mr-2">:</span>
                  <span className="font-semibold text-black">{patient.nationality || "Indian"}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={2}>
                <div className="flex items-center">
                  <span className="font-bold w-44">For Foreigners Passport No</span>
                  <span className="font-bold mr-2">:</span>
                  <span className="font-semibold text-black font-mono">{patient.passportNo || ""}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ─── 5. Addresses Box ─── */}
        <table className="reg-table">
          <thead>
            <tr>
              <th className="reg-header-bg text-left w-1/2">Residential Address</th>
              <th className="reg-header-bg text-left w-1/2">Permanent Contact Address</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="w-1/2 align-top h-14">
                <p className="font-bold text-black uppercase">{patient.address || ""}</p>
              </td>
              <td className="w-1/2 align-top h-14">
                <p className="font-bold text-black uppercase">{patient.address || ""}</p>
              </td>
            </tr>
            <tr>
              <td className="w-1/2">
                <span className="font-bold">City : </span>
                <span className="font-semibold">{patient.city || patient.cityStateZip?.split("-")[0]?.trim() || ""}</span>
                <span className="font-bold ml-4">Pin : </span>
                <span className="font-semibold">{patient.pinCode || patient.cityStateZip?.split("-")[1]?.trim() || ""}</span>
              </td>
              <td className="w-1/2">
                <span className="font-bold">City : </span>
                <span className="font-semibold">{patient.city || patient.cityStateZip?.split("-")[0]?.trim() || ""}</span>
                <span className="font-bold ml-4">Pin : </span>
                <span className="font-semibold">{patient.pinCode || patient.cityStateZip?.split("-")[1]?.trim() || ""}</span>
              </td>
            </tr>
            <tr>
              <td className="w-1/2">
                <span className="font-bold">Res : </span>
                <span className="font-bold ml-4">off : </span>
              </td>
              <td className="w-1/2">
                <span className="font-bold">Res : </span>
                <span className="font-bold ml-4">off : </span>
              </td>
            </tr>
            <tr>
              <td className="w-1/2">
                <span className="font-bold">Mobile : </span>
                <span className="font-bold text-black">{patient.mobile || ""}</span>
              </td>
              <td className="w-1/2">
                <span className="font-bold">Mobile : </span>
                <span className="font-bold text-black">{patient.altPhone || patient.mobile || ""}</span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ─── 6. Emergency Contact Person ─── */}
        <table className="reg-table">
          <thead>
            <tr>
              <th colSpan={2} className="reg-header-bg text-left">In Emergency person to be notified</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="w-1/2">
                <span className="font-bold">Contact Person's Name: </span>
                <span className="font-semibold">{patient.emergencyName || ""}</span>
              </td>
              <td className="w-1/2">
                <span className="font-bold">Contact Person's Name: </span>
                <span className="font-semibold">{patient.emergencyContact || ""}</span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ─── 7. For Corporate Patients ─── */}
        <table className="reg-table">
          <thead>
            <tr>
              <th colSpan={2} className="reg-header-bg text-left">For Corporate Patients</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={2}>
                <span className="font-bold">Sponsor : </span>
                <span className="font-semibold">{patient.sponsor || ""}</span>
              </td>
            </tr>
            <tr>
              <td colSpan={2}>
                <span className="font-bold">Employee ID No. </span>
                <span className="font-semibold">{patient.employeeId || ""}</span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ─── 8. Referring Doctor ─── */}
        <table className="reg-table">
          <thead>
            <tr>
              <th className="reg-header-bg text-left">Name and Address of the Referring Doctor/Information Centre</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="h-6">
                <span className="font-semibold">{patient.referringDoctor || ""}</span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ─── 9. General Consent ─── */}
        <table className="reg-table">
          <thead>
            <tr>
              <th className="reg-header-bg text-left">General Consent :</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2">
                <p className="text-[9.5px] leading-tight text-justify font-medium text-black">
                  I hereby authorise the above hospital,the physicians and its Medical Staff,the members of its housestaff and nursing staff,assisted by the employees of the hospitals,to provide such care and administer such diagnostic,radiological and/or therapeutic procedures and treatments as in the judgement of the above physician(s) is deemed necessary or advisable in the above patients Care.This includes all routine diagnostic tests and procedures,including diagnostic X-rays,the administration and /or injection of pharmaceutical products and medications and withdrawal of blood for laboratory or pathology.I acknowledge the fact that the hospital has the authority to dispose off the specimens taken for laboratory examination.In addition,I hereby authorise any and all persons caring for me during the hospitalisation.
                </p>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ─── 10. Signature Row ─── */}
        <div className="flex justify-between items-end pt-8 px-2 text-[11px] font-bold text-black">
          <div>
            <span>Signature of the patient/Attendant</span>
          </div>
          <div>
            <span>Relationship</span>
          </div>
        </div>

      </div>
    );
  }
);

PatientRegistrationDetailsPrint.displayName = "PatientRegistrationDetailsPrint";
