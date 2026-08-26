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
  netAmt: number;
  received?: number;
  adjusted?: number;
  creditNote?: number;
  balance: number;
  itemsJson?: string;
  narration?: string;
}

interface Props {
  invoice: BillingInvoicePrintData;
}

export const BillingInvoicePrint = forwardRef<HTMLDivElement, Props>(
  ({ invoice }, ref) => {
    let serviceItems: Array<{ code?: string; name: string; dept?: string; rate?: number; qty?: number; netAmt?: number }> = [];
    try {
      if (invoice.itemsJson) {
        serviceItems = JSON.parse(invoice.itemsJson);
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

    return (
      <div ref={ref} className="p-8 bg-white text-black font-sans text-[11px] leading-normal" style={{ width: '8.27in', minHeight: '11.69in' }}>
        
        {/* Top Header matching Patient Registration Details Print */}
        <div className="flex justify-between items-start mb-4 pb-3 border-b-[1.5px] border-black">
          {/* Logo on Left */}
          <div className="h-16 flex items-center justify-center">
            <img 
              src={`${window.location.origin}/cmk-logo.png`} 
              alt="CMK Healthcare" 
              className="h-full object-contain" 
            />
          </div>

          {/* Clinic Details on Right Corner */}
          <div className="leading-tight text-right text-black">
            <h1 className="font-extrabold text-[13px] uppercase tracking-wide">CMK HEALTHCARE PVT. LTD.</h1>
            <p className="text-[10px]">M 158/5, Chittaranjan Park, New Delhi</p>
            <p className="text-[10px]">Phone: 011-41552233, 88000200 | Fax:</p>
            <p className="text-[10px]">Email: info@curemyknee.com | WebSite: www.curemyknee.com</p>
          </div>
        </div>

        {/* Document Title */}
        <h2 className="text-center font-bold text-[13px] mb-3 uppercase tracking-wide">
          {invoice.type === "IP" ? "INPATIENT (IP) OFFICIAL INVOICE & RECEIPT" : "OUTPATIENT (OP) OFFICIAL INVOICE & RECEIPT"}
        </h2>

        {/* Patient & Invoice Details Grid matching Registration Details layout */}
        <div className="border-t-[1.5px] border-b-[1.5px] border-black pt-2 pb-2 mb-4 space-y-1">
          {/* Row 1 */}
          <div className="flex">
            <div className="w-1/2 flex">
              <div className="w-36 font-bold">UHID No.</div>
              <div className="w-4">:</div>
              <div className="flex-1 font-semibold">{invoice.uhid}</div>
            </div>
            <div className="w-1/2 flex">
              <div className="w-32 font-bold">Invoice No.</div>
              <div className="w-4">:</div>
              <div className="flex-1 font-bold">{invoice.invoiceNo}</div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex">
            <div className="w-1/2 flex">
              <div className="w-36 font-bold">Patient's Name</div>
              <div className="w-4">:</div>
              <div className="flex-1 font-semibold">{invoice.patientName}</div>
            </div>
            <div className="w-1/2 flex">
              <div className="w-32 font-bold">Date / Time</div>
              <div className="w-4">:</div>
              <div className="flex-1 font-semibold">{formattedDate}</div>
            </div>
          </div>

          {/* Row 3 */}
          <div className="flex">
            <div className="w-1/2 flex">
              <div className="w-36 font-bold">Gender / Age</div>
              <div className="w-4">:</div>
              <div className="flex-1 font-semibold">{invoice.genderAge || "Male / 21 Y"}</div>
            </div>
            <div className="w-1/2 flex">
              <div className="w-32 font-bold">Consultant Doctor</div>
              <div className="w-4">:</div>
              <div className="flex-1 font-semibold">{invoice.doctorName || "Dr. Abhishek Bansal"}</div>
            </div>
          </div>

          {/* Row 4 */}
          <div className="flex">
            <div className="w-1/2 flex">
              <div className="w-36 font-bold">Contact / Mobile</div>
              <div className="w-4">:</div>
              <div className="flex-1 font-semibold">{invoice.mobile || "-"}</div>
            </div>
            <div className="w-1/2 flex">
              <div className="w-32 font-bold">Payer / Sponsor</div>
              <div className="w-4">:</div>
              <div className="flex-1 font-semibold">{invoice.company || "CASH"}</div>
            </div>
          </div>
        </div>

        {/* Breakdown Header */}
        <h3 className="font-bold text-[11px] uppercase mb-1 tracking-wide">Itemized Service Charges Breakdown</h3>

        {/* Charges Table */}
        <table className="w-full text-left border-collapse mb-4 border-t border-b border-black text-[11px]">
          <thead>
            <tr className="border-b border-black font-bold uppercase text-[10px]">
              <th className="py-1.5 w-20">Code</th>
              <th className="py-1.5">Service Description</th>
              <th className="py-1.5 w-24">Dept</th>
              <th className="py-1.5 text-right w-20">Rate (₹)</th>
              <th className="py-1.5 text-center w-12">Qty</th>
              <th className="py-1.5 text-right w-28">Net Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300 font-medium">
            {serviceItems.length > 0 ? (
              serviceItems.map((it, idx) => (
                <tr key={idx}>
                  <td className="py-1.5 font-mono">{it.code || `SRV-0${idx+1}`}</td>
                  <td className="py-1.5 font-bold">{it.name}</td>
                  <td className="py-1.5 text-slate-700">{it.dept || "GENERAL"}</td>
                  <td className="py-1.5 text-right font-mono">₹{(it.rate || 0).toFixed(2)}</td>
                  <td className="py-1.5 text-center font-mono">{it.qty || 1}</td>
                  <td className="py-1.5 text-right font-mono font-bold">₹{((it.netAmt || (it.rate || 0) * (it.qty || 1))).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-1.5 font-mono">CON-01</td>
                <td className="py-1.5 font-bold">Hospital Consultation & Healthcare Charges ({invoice.type})</td>
                <td className="py-1.5 text-slate-700">GENERAL</td>
                <td className="py-1.5 text-right font-mono">₹{invoice.netAmt.toFixed(2)}</td>
                <td className="py-1.5 text-center font-mono">1</td>
                <td className="py-1.5 text-right font-mono font-bold">₹{invoice.netAmt.toFixed(2)}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Settlement & Financial Summary */}
        <div className="border-t-[1.5px] border-b-[1.5px] border-black pt-2 pb-2 mb-6 space-y-1">
          <div className="flex justify-between font-semibold">
            <span>Gross Bill Amount:</span>
            <span className="font-mono font-bold">₹{invoice.netAmt.toFixed(2)}</span>
          </div>

          {(invoice.received || 0) > 0 && (
            <div className="flex justify-between font-semibold">
              <span>Amount Paid / Settled:</span>
              <span className="font-mono font-bold">₹{(invoice.received || 0).toFixed(2)}</span>
            </div>
          )}

          {(invoice.adjusted || 0) > 0 && (
            <div className="flex justify-between font-semibold">
              <span>Advance Deposit Adjusted:</span>
              <span className="font-mono font-bold">₹{(invoice.adjusted || 0).toFixed(2)}</span>
            </div>
          )}

          {(invoice.creditNote || 0) > 0 && (
            <div className="flex justify-between font-semibold">
              <span>Credit Note Waiver:</span>
              <span className="font-mono font-bold">₹{(invoice.creditNote || 0).toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between font-extrabold text-[12px] pt-1 border-t border-black uppercase">
            <span>Net Balance Outstanding:</span>
            <span className="font-mono">
              ₹{Math.abs(invoice.balance).toFixed(2)} {invoice.balance <= 0 ? "(Settled)" : "(Pending)"}
            </span>
          </div>
        </div>

        {/* General Terms & Remarks */}
        {invoice.narration && (
          <div className="mb-6 text-[10px] italic text-slate-700">
            <strong>Remarks / Narration:</strong> {invoice.narration}
          </div>
        )}

        {/* Footer Signature Block */}
        <div className="flex justify-end items-end pt-14 text-[11px]">
          <div>
            <div className="border-t border-black w-44 pt-1 text-center font-bold">Authorized Cashier</div>
          </div>
        </div>

      </div>
    );
  }
);

BillingInvoicePrint.displayName = "BillingInvoicePrint";
