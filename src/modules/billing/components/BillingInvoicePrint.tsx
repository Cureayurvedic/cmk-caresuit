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
      <div ref={ref} className="p-8 bg-white text-slate-900 font-sans text-[11px] leading-normal" style={{ width: '8.27in', minHeight: '11.69in' }}>
        
        {/* Hospital Header Matching Report Template */}
        <div className="text-center space-y-0.5 pb-2">
          <h1 className="text-xl font-black tracking-wide font-serif text-slate-900 uppercase">
            CMK HEALTHCARE PVT. LTD.
          </h1>
          <p className="text-[11px] text-slate-600 font-medium">
            Plot No. 12-A, Institutional Area, Sector 62, New Delhi, Delhi 110092
          </p>
          <p className="text-[10px] text-slate-500 font-medium">
            NABH & NABL Accredited | GSTIN: 07AAAAC1234F1Z8 | Tel: +91 11 4988 5000
          </p>
        </div>
        <hr className="border-t-2 border-slate-900 my-2" />

        {/* Report Metadata Sub-Header */}
        <div className="flex items-center justify-between text-xs font-sans pb-2 border-b border-slate-300 mb-4">
          <div>
            <h2 className="text-sm font-bold uppercase text-slate-900 tracking-wide">
              {invoice.type === "IP" ? "INPATIENT (IP) OFFICIAL INVOICE & RECEIPT" : "OUTPATIENT (OP) OFFICIAL INVOICE & RECEIPT"}
            </h2>
            <p className="text-slate-500 text-[10px] mt-0.5">
              Invoice #: <strong>{invoice.invoiceNo}</strong> | Payer: <strong>{invoice.company || "CASH"}</strong>
            </p>
          </div>
          <div className="text-right text-slate-600 text-[10px]">
            <p>Invoice Date: <strong>{formattedDate}</strong></p>
            <p>Generated: <strong>{format(new Date(), "dd/MM/yyyy, HH:mm:ss")}</strong></p>
          </div>
        </div>

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

        {/* Official 3-Column Signatures Matching Report Template */}
        <div className="mt-14 pt-6 flex justify-between items-center text-center text-xs font-sans text-slate-800">
          <div>
            <div className="w-40 border-b border-slate-400 mb-1 mx-auto"></div>
            <div className="font-bold">Prepared By</div>
            <div className="text-[10px] text-slate-500">Billing Executive</div>
          </div>
          <div>
            <div className="w-40 border-b border-slate-400 mb-1 mx-auto"></div>
            <div className="font-bold">Verified By</div>
            <div className="text-[10px] text-slate-500">Accounts Manager</div>
          </div>
          <div>
            <div className="w-40 border-b border-slate-400 mb-1 mx-auto"></div>
            <div className="font-bold">Authorized Signatory</div>
            <div className="text-[10px] text-slate-500">Medical Superintendent</div>
          </div>
        </div>

      </div>
    );
  }
);

BillingInvoicePrint.displayName = "BillingInvoicePrint";
