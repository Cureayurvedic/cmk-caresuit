import React, { forwardRef } from "react";
import { format } from "date-fns";

export interface BillingInvoicePrintData {
  invoiceNo: string;
  date: string;
  type: string;
  uhid: string;
  patientName: string;
  genderAge?: string;
  guardianName?: string;
  mobile?: string;
  address?: string;
  company?: string;
  doctorName?: string;
  grossAmt?: number;
  discountAmt?: number;
  netAmt: number;
  received?: number;
  adjusted?: number;
  creditNote?: number;
  balance: number;
  itemsJson?: string;
  narration?: string;
  admissionDate?: string;
  dischargeDate?: string;
  dischargeTime?: string;
  roomNo?: string;
  crNo?: string;
  refNo?: string;
}

interface Props {
  invoice: BillingInvoicePrintData;
}

const STANDARD_IP_HEADS = [
  "Registration Fee",
  "Room / Bed Charges (Per Day)",
  "Hospital Consumables Charges",
  "OT/Ward Consumable Charges",
  "Pathology Investigation",
  "Radiology Investigation",
  "Cardiology Investigation",
  "OT Charges",
  "ICU Charges",
  "Implant / Instrument Charges",
  "Surgeon's Fee",
  "Assistant Surgeon's Fee",
  "Anesthetist Charges",
  "Physiotherapy Charges",
  "Consultation Fee Different Speciality",
  "Miscellaneous /Other Charges",
];

export const BillingInvoicePrint = forwardRef<HTMLDivElement, Props>(
  ({ invoice }, ref) => {
    let serviceItems: Array<{
      sNo?: number;
      code?: string;
      name: string;
      qtyDesc?: string;
      dept?: string;
      rate?: number;
      qty?: number;
      amount?: number;
      netAmt?: number;
      remark?: string;
    }> = [];

    try {
      if (invoice.itemsJson) {
        serviceItems = JSON.parse(invoice.itemsJson);
      } else if ((invoice as any).items) {
        serviceItems = (invoice as any).items;
      }
    } catch {
      serviceItems = [];
    }

    let formattedDate = invoice.date;
    try {
      if (invoice.date) {
        formattedDate = format(new Date(invoice.date), "dd/MM/yyyy hh:mm a");
      }
    } catch {
      formattedDate = invoice.date || "";
    }

    const isIpBill = invoice.type === "IP" || invoice.type === "SURGERY" || invoice.type === "Bill For Surgery";

    if (isIpBill) {
      // ─── IP / SURGERY BILL PRINT LAYOUT (EXACT 1-TO-1 MATCH OF HOSPITAL EXCEL RECEIPT) ───
      const gross = invoice.grossAmt ?? invoice.netAmt;
      const discount = invoice.discountAmt ?? 0;
      const grandTotal = invoice.netAmt;

      return (
        <div
          ref={ref}
          className="p-6 bg-white text-slate-900 font-sans text-[11px] leading-snug"
          style={{ width: "8.27in", minHeight: "11.69in", margin: "0 auto" }}
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
            .ip-bill-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 8px;
            }
            .ip-bill-table th, .ip-bill-table td {
              border: 1px solid #475569;
              padding: 3px 5px;
              vertical-align: middle;
            }
          `}</style>

          {/* ─── Header: Centered Hospital Details & Logo on Right ─── */}
          <div className="flex items-start justify-between border-b border-slate-400 pb-2 mb-2 relative">
            <div className="w-24"></div>
            <div className="flex-1 text-center space-y-0.5">
              <h1 className="text-lg font-black text-slate-900 uppercase tracking-wide font-serif">
                CMK HEALTH CARE PVT. LTD.
              </h1>
              <p className="text-xs font-bold text-slate-800 tracking-wide uppercase">
                (ORTHO & JOINT CARE CENTRE)
              </p>
              <p className="text-[10px] text-slate-700 font-medium">
                H-1565 C.R. Park (Near Mela Ground) New Delhi-110019
              </p>
              <p className="text-[10px] text-slate-600 font-semibold underline">
                www.curemyknee.com
              </p>
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider underline decoration-slate-900 underline-offset-4 pt-1">
                BILL FOR SURGERY
              </h2>
            </div>
            <div className="w-28 flex items-center justify-end">
              <img
                src="/cmk-logo.png"
                alt="CMK HealthCare Logo"
                className="h-14 w-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes("cmk_caresuit_logo")) {
                    target.src = "/cmk_caresuit_logo.png";
                  }
                }}
              />
            </div>
          </div>

          {/* ─── Patient & Admission Details 2-Column Section ─── */}
          <div className="grid grid-cols-2 gap-4 text-[10px] mb-3 border-b border-slate-300 pb-2">
            {/* Left Column */}
            <div className="space-y-2">
              <div>
                <div className="font-extrabold uppercase text-slate-900 mb-0.5 tracking-wide">
                  PATIENT DETAILS:
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-x-1 font-medium">
                  <span className="text-slate-600 font-bold">Name:</span>
                  <span className="font-bold text-slate-900 uppercase">{invoice.patientName}</span>
                  <span className="text-slate-600 font-bold">Age/Sex:</span>
                  <span>{invoice.genderAge || "61/FEMALE"}</span>
                  <span className="text-slate-600 font-bold">Payer:</span>
                  <span>{invoice.company || "CASH"}</span>
                  <span className="text-slate-600 font-bold">Remarks:</span>
                  <span>{invoice.narration || "-"}</span>
                  <span className="text-slate-600 font-bold">Address:</span>
                  <span>{invoice.address || "-"}</span>
                </div>
              </div>

              <div>
                <div className="font-extrabold uppercase text-slate-900 mb-0.5 tracking-wide">
                  ADMISSION DETAILS:
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-x-1 font-medium">
                  <span className="text-slate-600 font-bold">C.R. No:</span>
                  <span className="font-mono font-bold">{invoice.crNo || invoice.uhid}</span>
                  <span className="text-slate-600 font-bold">Date/Time:</span>
                  <span>{invoice.admissionDate || formattedDate}</span>
                  <span className="text-slate-600 font-bold">Consultant Dr.:</span>
                  <span className="font-bold">{invoice.doctorName || "Dr. D K DAS"}</span>
                  <span className="text-slate-600 font-bold">Reference No:</span>
                  <span>{invoice.refNo || "-"}</span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-2 text-right">
              <div>
                <div className="font-bold text-slate-700">
                  Bill Number : <span className="font-mono font-bold text-slate-900">{invoice.invoiceNo}</span>
                </div>
                <div className="font-bold text-slate-700">
                  Date : <span>{formattedDate.split(" ")[0]}</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="font-extrabold uppercase text-slate-900 mb-0.5 tracking-wide">
                  DISCHARGE:
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-x-1 text-right font-medium justify-end">
                  <span className="text-slate-600 font-bold">Date:</span>
                  <span>{invoice.dischargeDate || formattedDate.split(" ")[0]}</span>
                  <span className="text-slate-600 font-bold">Time:</span>
                  <span>{invoice.dischargeTime || "03:00 PM"}</span>
                  <span className="text-slate-600 font-bold">Bed:</span>
                  <span>-</span>
                  <span className="text-slate-600 font-bold">Room No.:</span>
                  <span className="font-bold text-slate-900">{invoice.roomNo || "311"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── 16 Standard Itemized Surgery Charges Table ─── */}
          <table className="ip-bill-table text-[10px] mb-3">
            <thead>
              <tr className="bg-slate-100 font-bold text-slate-900 uppercase">
                <th className="w-10 text-center py-1">S. No.</th>
                <th className="text-left py-1 w-2/5">NAME OF THE SERVICE</th>
                <th className="w-16 text-center py-1">QTY</th>
                <th className="text-left py-1">DESCRIPTION / NOTES</th>
                <th className="w-28 text-right py-1">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 font-medium">
              {STANDARD_IP_HEADS.map((headName, index) => {
                const sNo = index + 1;
                // Match items from JSON payload
                const foundItem: any = serviceItems.find(
                  (it: any) => it.sNo === sNo || (it.name && it.name.trim().toLowerCase() === headName.toLowerCase())
                );
                const amt = foundItem ? (foundItem.amount ?? foundItem.netAmt ?? foundItem.rate) : undefined;
                const qtyVal = foundItem ? (foundItem.qty !== undefined && foundItem.qty !== "" ? String(foundItem.qty) : (amt ? "1" : "")) : "";
                const descVal = foundItem ? (foundItem.desc || foundItem.qtyDesc || "") : "";

                return (
                  <tr key={sNo}>
                    <td className="text-center font-mono text-slate-700 py-1">{sNo}</td>
                    <td className="py-1 font-semibold text-slate-900">{headName}</td>
                    <td className="text-center font-mono py-1">{qtyVal}</td>
                    <td className="py-1 font-mono text-slate-800">{descVal}</td>
                    <td className="text-right font-mono font-bold py-1">
                      {amt !== undefined && amt !== null && Number(amt) > 0
                        ? Number(amt).toFixed(0)
                        : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* ─── Totals Summary Box (Sub Total, Discount, Grand Total) ─── */}
          <div className="flex justify-end mb-8">
            <div className="w-64 border border-slate-600 rounded p-2 space-y-1 text-[11px] bg-slate-50/50">
              <div className="flex justify-between font-bold text-slate-800">
                <span>Sub Total</span>
                <span className="font-mono">₹{gross.toFixed(0)}</span>
              </div>
              <div className="flex justify-between font-medium text-slate-600">
                <span>Discount</span>
                <span className="font-mono">₹{discount.toFixed(0)}</span>
              </div>
              <div className="flex justify-between font-black text-xs text-slate-900 pt-1 border-t border-slate-600 uppercase">
                <span>Grand Total</span>
                <span className="font-mono">₹{grandTotal.toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* ─── Bottom Footer: Hospital Seal & Signature Line ─── */}
          <div className="flex justify-between items-end pt-6">
            {/* Hospital Stamp / Seal */}
            <div className="w-32 h-32 rounded-full border-2 border-slate-400 border-dashed flex flex-col items-center justify-center text-center text-[9px] font-bold text-slate-400 p-2 uppercase">
              <div>CMK HEALTHCARE</div>
              <div>PRIVATE LIMITED</div>
              <div className="text-[8px] text-slate-400 mt-1">SEAL</div>
            </div>

            {/* Signature Line */}
            <div className="text-center">
              <div className="w-44 border-b border-slate-500 mb-1"></div>
              <div className="font-bold text-xs text-slate-800">Authorized Signatory</div>
            </div>
          </div>
        </div>
      );
    }

    // ─── STANDARD OP BILL PRINT LAYOUT ───
    return (
      <div
        ref={ref}
        className="p-8 bg-white text-slate-900 font-sans text-[11px] leading-normal"
        style={{ width: "8.27in", minHeight: "11.69in", margin: "0 auto" }}
      >
        <style>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 8mm 10mm;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              background: #fff;
            }
          }
          .bill-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
          }
          .bill-table th, .bill-table td {
            border: 1px solid #64748b;
            padding: 4px 6px;
            vertical-align: middle;
          }
        `}</style>

        {/* ─── 1. Header with Logo on Left & Centered Hospital Details ─── */}
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
              (ORTHO & JOINT CARE CENTRE)
            </p>
            <p className="text-[11px] text-slate-700 font-medium">
              H-1565 C.R. Park (Near Mela Ground) New Delhi-110019
            </p>
            <p className="text-[11px] text-slate-600 font-semibold underline">
              www.curemyknee.com
            </p>
          </div>

          {/* Right Spacer for Page Centering Balance */}
          <div className="w-36 flex-shrink-0"></div>
        </div>

        {/* ─── 2. Centered Document Title ─── */}
        <div className="text-center pb-2 border-b border-slate-300 mb-3">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider underline decoration-slate-900 underline-offset-4 mb-2.5">
            {invoice.type === "IP"
              ? "IP INVOICE & RECEIPT"
              : "OP INVOICE & RECEIPT"}
          </h2>
          <div className="flex justify-between items-center text-[10px] text-slate-600 pt-1 font-medium px-1">
            <span>Invoice #: <strong className="text-slate-900">{invoice.invoiceNo}</strong></span>
            <span>Payer: <strong className="text-slate-900">{invoice.company || "CASH"}</strong></span>
            <span>Date: <strong className="text-slate-900">{formattedDate}</strong></span>
          </div>
        </div>

        {/* ─── 3. Patient & Invoice Details Grid ─── */}
        <table className="bill-table text-[11px] mb-4">
          <tbody>
            <tr>
              <td className="w-1/2 bg-slate-50/50">
                <div className="flex items-center">
                  <span className="font-bold w-32">UHID No.</span>
                  <span className="font-bold mr-2">:</span>
                  <span className="font-bold text-slate-900 font-mono">{invoice.uhid}</span>
                </div>
              </td>
              <td className="w-1/2 bg-slate-50/50">
                <div className="flex items-center">
                  <span className="font-bold w-32">Invoice No.</span>
                  <span className="font-bold mr-2">:</span>
                  <span className="font-bold text-slate-900 font-mono">{invoice.invoiceNo}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div className="flex items-center">
                  <span className="font-bold w-32">Patient's Name</span>
                  <span className="font-bold mr-2">:</span>
                  <span className="font-bold text-slate-900">{invoice.patientName}</span>
                </div>
              </td>
              <td>
                <div className="flex items-center">
                  <span className="font-bold w-32">Date / Time</span>
                  <span className="font-semibold text-slate-800">{formattedDate}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div className="flex items-center">
                  <span className="font-bold w-32">Gender / Age</span>
                  <span className="font-bold mr-2">:</span>
                  <span className="font-semibold text-slate-800">{invoice.genderAge || "Male / 30 Yr"}</span>
                </div>
              </td>
              <td>
                <div className="flex items-center">
                  <span className="font-bold w-32">Consultant Doctor</span>
                  <span className="font-bold mr-2">:</span>
                  <span className="font-semibold text-slate-800">{invoice.doctorName || "Dr. D K DAS"}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div className="flex items-center">
                  <span className="font-bold w-32">Contact / Mobile</span>
                  <span className="font-bold mr-2">:</span>
                  <span className="font-semibold text-slate-800">{invoice.mobile || "-"}</span>
                </div>
              </td>
              <td>
                <div className="flex items-center">
                  <span className="font-bold w-32">Payer / Sponsor</span>
                  <span className="font-bold mr-2">:</span>
                  <span className="font-bold text-slate-900">{invoice.company || "CASH"}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ─── 4. Itemized Charges Table ─── */}
        <h3 className="font-bold text-[11px] uppercase mb-1.5 tracking-wide text-slate-800">
          Itemized Service Charges Breakdown
        </h3>
        <table className="bill-table text-[11px] mb-4">
          <thead>
            <tr className="bg-slate-100 font-bold uppercase text-[10px] text-slate-800">
              <th className="py-1.5 w-12 text-center">S. No.</th>
              <th className="py-1.5 text-left">Service Description</th>
              <th className="py-1.5 text-left w-28">Dept</th>
              <th className="py-1.5 text-right w-20">Rate (₹)</th>
              <th className="py-1.5 text-center w-12">Qty</th>
              <th className="py-1.5 text-right w-28">Net Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300 font-medium">
            {serviceItems.length > 0 ? (
              serviceItems.map((it, idx) => (
                <tr key={idx}>
                  <td className="py-1.5 text-center font-mono text-slate-600">{idx + 1}</td>
                  <td className="py-1.5 font-bold text-slate-900">
                    {it.name === "Others" || it.name === "Other"
                      ? it.remark || "Others"
                      : it.remark
                      ? `${it.name} - ${it.remark}`
                      : it.name}
                  </td>
                  <td className="py-1.5 text-slate-700">{it.dept || "General OPD"}</td>
                  <td className="py-1.5 text-right font-mono">₹{(it.rate || 0).toFixed(2)}</td>
                  <td className="py-1.5 text-center font-mono">{it.qty || 1}</td>
                  <td className="py-1.5 text-right font-mono font-bold text-slate-900">
                    ₹{((it.netAmt || (it.rate || 0) * (it.qty || 1))).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-1.5 text-center font-mono text-slate-600">1</td>
                <td className="py-1.5 font-bold text-slate-900">OPD Consultation - Senior Specialist</td>
                <td className="py-1.5 text-slate-700">General OPD</td>
                <td className="py-1.5 text-right font-mono">₹{invoice.netAmt.toFixed(2)}</td>
                <td className="py-1.5 text-center font-mono">1</td>
                <td className="py-1.5 text-right font-mono font-bold text-slate-900">₹{invoice.netAmt.toFixed(2)}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ─── 5. Settlement & Financial Summary ─── */}
        <div className="border border-slate-700 rounded p-3 mb-4 space-y-1 bg-slate-50/30">
          <div className="flex justify-between font-semibold">
            <span>Gross Bill Amount:</span>
            <span className="font-mono font-bold">₹{invoice.netAmt.toFixed(2)}</span>
          </div>

          {(invoice.received || 0) > 0 && (
            <div className="flex justify-between font-semibold text-emerald-700">
              <span>Amount Paid / Settled:</span>
              <span className="font-mono font-bold">₹{(invoice.received || 0).toFixed(2)}</span>
            </div>
          )}

          {(invoice.adjusted || 0) > 0 && (
            <div className="flex justify-between font-semibold text-blue-700">
              <span>Advance Deposit Adjusted:</span>
              <span className="font-mono font-bold">₹{(invoice.adjusted || 0).toFixed(2)}</span>
            </div>
          )}

          {(invoice.creditNote || 0) > 0 && (
            <div className="flex justify-between font-semibold text-purple-700">
              <span>Credit Note Waiver:</span>
              <span className="font-mono font-bold">₹{(invoice.creditNote || 0).toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between font-extrabold text-[12px] pt-1.5 border-t border-slate-700 uppercase">
            <span>Net Balance Outstanding:</span>
            <span className="font-mono font-bold text-slate-900">
              ₹{Math.abs(invoice.balance).toFixed(2)} {invoice.balance <= 0 ? "(Paid)" : "(Pending)"}
            </span>
          </div>
        </div>

        {/* ─── 6. Remarks / Narration ─── */}
        {invoice.narration && (
          <div className="mb-4 text-[10px] italic text-slate-700 border-l-2 border-slate-400 pl-2 py-0.5">
            <strong>Remarks / Narration:</strong> {invoice.narration}
          </div>
        )}

        {/* Official Authorized Signatory */}
        <div className="mt-14 pt-4 flex justify-end items-center text-center text-xs font-sans text-slate-800">
          <div>
            <div className="w-40 border-b border-slate-400 mb-1 mx-auto"></div>
            <div className="font-bold">Authorized Signatory</div>
          </div>
        </div>
      </div>
    );
  }
);

BillingInvoicePrint.displayName = "BillingInvoicePrint";
