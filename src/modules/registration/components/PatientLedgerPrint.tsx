import React, { forwardRef } from "react";
import { format } from "date-fns";

export interface LedgerPrintItem {
  id: string;
  date: string;
  type: "INVOICE" | "RECEIPT" | "ADVANCE" | "CREDIT_NOTE" | "REFUND";
  voucherNo: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  modeOrStatus?: string;
}

export interface PatientLedgerPrintData {
  uhid: string;
  patientName: string;
  genderAge?: string;
  guardianName?: string;
  mobile?: string;
  address?: string;
  hcf?: string;
  regDate?: string;
  payerType?: string;
  payer?: string;
  sponsor?: string;
  totalBilled: number;
  totalPaid: number;
  advanceBalance: number;
  netBalance: number;
  items: LedgerPrintItem[];
  generatedAt?: string;
}

interface Props {
  data: PatientLedgerPrintData;
}

export const PatientLedgerPrint = forwardRef<HTMLDivElement, Props>(
  ({ data }, ref) => {
    let formattedRegDate = "-";
    try {
      if (data.regDate) {
        formattedRegDate = format(new Date(data.regDate), "dd/MM/yyyy");
      }
    } catch {
      formattedRegDate = data.regDate || "-";
    }

    const printTime = data.generatedAt
      ? format(new Date(data.generatedAt), "dd/MM/yyyy hh:mm a")
      : format(new Date(), "dd/MM/yyyy hh:mm a");

    const formatCurrency = (amount: number) => {
      if (!amount && amount !== 0) return "₹0.00";
      return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
      <div
        ref={ref}
        className="p-6 bg-white text-slate-900 font-sans text-[11px] leading-tight"
        style={{ width: "8.27in", minHeight: "11.69in", margin: "0 auto", boxSizing: "border-box" }}
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
          .ledger-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
          }
          .ledger-table th, .ledger-table td {
            border: 1px solid #cbd5e1;
            padding: 5px 8px;
            vertical-align: middle;
          }
          .ledger-header-bg {
            background-color: #f1f5f9;
            font-weight: 700;
            font-size: 10.5px;
            color: #0f172a;
          }
        `}</style>

        {/* ─── 1. Hospital Header ─── */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-300">
          <div className="w-36 flex-shrink-0 flex items-center justify-start">
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

          <div className="flex-1 text-center space-y-0.5">
            <h1 className="text-base font-black text-slate-900 uppercase tracking-wide font-serif">
              CMK HEALTH CARE PVT. LTD.
            </h1>
            <p className="text-[10px] font-bold text-slate-800 tracking-wide uppercase">
              (ORTHO &amp; JOINT CARE CENTRE)
            </p>
            <p className="text-[10px] text-slate-600 font-medium">
              H-1565 C.R. Park (Near Mela Ground) New Delhi-110019
            </p>
            <p className="text-[10px] text-slate-500 font-semibold underline">
              www.curemyknee.com
            </p>
          </div>

          <div className="w-36 text-right flex-shrink-0 text-[9px] text-slate-500">
            <p className="font-bold text-slate-700">STATEMENT OF ACCOUNT</p>
            <p>Printed: {printTime}</p>
          </div>
        </div>

        {/* ─── 2. Title Banner ─── */}
        <div className="text-center py-1.5 bg-slate-100 rounded mb-3 border border-slate-200">
          <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            PATIENT FINANCIAL LEDGER &amp; STATEMENT
          </h2>
        </div>

        {/* ─── 3. Patient Details Box ─── */}
        <table className="ledger-table mb-3">
          <tbody>
            <tr>
              <td className="w-1/2">
                <span className="font-bold text-slate-500 w-28 inline-block">UHID / MRD No.</span>
                <span className="font-bold mr-2">:</span>
                <span className="font-bold text-slate-900 font-mono text-xs">{data.uhid}</span>
              </td>
              <td className="w-1/2">
                <span className="font-bold text-slate-500 w-28 inline-block">Reg. Date</span>
                <span className="font-bold mr-2">:</span>
                <span className="font-semibold text-slate-800">{formattedRegDate}</span>
              </td>
            </tr>
            <tr>
              <td className="w-1/2">
                <span className="font-bold text-slate-500 w-28 inline-block">Patient Name</span>
                <span className="font-bold mr-2">:</span>
                <span className="font-bold text-slate-900">{data.patientName}</span>
              </td>
              <td className="w-1/2">
                <span className="font-bold text-slate-500 w-28 inline-block">Gender / Age</span>
                <span className="font-bold mr-2">:</span>
                <span className="font-semibold text-slate-800">{data.genderAge || "N/A"}</span>
              </td>
            </tr>
            <tr>
              <td className="w-1/2">
                <span className="font-bold text-slate-500 w-28 inline-block">Guardian / C/O</span>
                <span className="font-bold mr-2">:</span>
                <span className="font-semibold text-slate-800">{data.guardianName || "N/A"}</span>
              </td>
              <td className="w-1/2">
                <span className="font-bold text-slate-500 w-28 inline-block">Mobile Number</span>
                <span className="font-bold mr-2">:</span>
                <span className="font-semibold text-slate-800">{data.mobile || "N/A"}</span>
              </td>
            </tr>
            <tr>
              <td className="w-1/2">
                <span className="font-bold text-slate-500 w-28 inline-block">Branch / HCF</span>
                <span className="font-bold mr-2">:</span>
                <span className="font-semibold text-slate-800">{data.hcf || "CMK Main"}</span>
              </td>
              <td className="w-1/2">
                <span className="font-bold text-slate-500 w-28 inline-block">Payer / Sponsor</span>
                <span className="font-bold mr-2">:</span>
                <span className="font-semibold text-slate-800">
                  {data.payer || "CASH"} {data.sponsor ? `(${data.sponsor})` : ""}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ─── 4. Financial KPI Summary ─── */}
        <div className="grid grid-cols-4 gap-2 mb-3 text-center">
          <div className="p-2 bg-blue-50 border border-blue-200 rounded">
            <span className="text-[9px] font-bold text-blue-700 uppercase tracking-wider block">Total Billed</span>
            <span className="text-xs font-black text-blue-900 mt-0.5 block">{formatCurrency(data.totalBilled)}</span>
          </div>
          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded">
            <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider block">Total Paid</span>
            <span className="text-xs font-black text-emerald-900 mt-0.5 block">{formatCurrency(data.totalPaid)}</span>
          </div>
          <div className="p-2 bg-purple-50 border border-purple-200 rounded">
            <span className="text-[9px] font-bold text-purple-700 uppercase tracking-wider block">Advance Available</span>
            <span className="text-xs font-black text-purple-900 mt-0.5 block">{formatCurrency(data.advanceBalance)}</span>
          </div>
          <div className={`p-2 border rounded ${data.netBalance > 0 ? "bg-rose-50 border-rose-200 text-rose-900" : "bg-emerald-50 border-emerald-200 text-emerald-900"}`}>
            <span className="text-[9px] font-bold uppercase tracking-wider block">Net Outstanding</span>
            <span className="text-xs font-black mt-0.5 block">{formatCurrency(data.netBalance)}</span>
          </div>
        </div>

        {/* ─── 5. Ledger Items Table ─── */}
        <table className="ledger-table">
          <thead>
            <tr className="ledger-header-bg">
              <th className="w-8 text-center">#</th>
              <th className="w-20 text-left">Date</th>
              <th className="w-24 text-left">Type</th>
              <th className="w-28 text-left">Voucher / Ref</th>
              <th className="text-left">Particulars / Description</th>
              <th className="w-24 text-right">Debit (₹)</th>
              <th className="w-24 text-right">Credit (₹)</th>
              <th className="w-24 text-right">Balance (₹)</th>
            </tr>
          </thead>
          <tbody>
            {data.items && data.items.length > 0 ? (
              data.items.map((item, idx) => {
                let formattedItemDate = item.date;
                try {
                  if (item.date) {
                    formattedItemDate = format(new Date(item.date), "dd/MM/yyyy");
                  }
                } catch {
                  formattedItemDate = item.date;
                }

                return (
                  <tr key={item.id || idx}>
                    <td className="text-center font-mono text-[9.5px] text-slate-500">{idx + 1}</td>
                    <td className="whitespace-nowrap font-mono text-[9.5px]">{formattedItemDate}</td>
                    <td className="whitespace-nowrap">
                      <span
                        className={`font-bold text-[9px] px-1 py-0.5 rounded uppercase ${
                          item.type === "INVOICE"
                            ? "bg-blue-100 text-blue-800"
                            : item.type === "RECEIPT"
                            ? "bg-emerald-100 text-emerald-800"
                            : item.type === "ADVANCE"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="font-mono text-[9.5px] font-semibold text-slate-800">{item.voucherNo}</td>
                    <td className="text-[10px] font-medium text-slate-700">{item.description}</td>
                    <td className="text-right font-mono font-semibold text-slate-900">
                      {item.debit > 0 ? formatCurrency(item.debit) : "-"}
                    </td>
                    <td className="text-right font-mono font-semibold text-emerald-700">
                      {item.credit > 0 ? formatCurrency(item.credit) : "-"}
                    </td>
                    <td className="text-right font-mono font-bold text-slate-900">
                      {formatCurrency(item.balance)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-6 text-slate-500 italic">
                  No financial ledger entries recorded for this patient.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
              <td colSpan={5} className="text-right uppercase px-2 py-1.5 text-[10px] text-slate-700">
                Totals / Final Statement Balance:
              </td>
              <td className="text-right font-mono text-xs text-slate-900 px-2 py-1.5">
                {formatCurrency(data.totalBilled)}
              </td>
              <td className="text-right font-mono text-xs text-emerald-800 px-2 py-1.5">
                {formatCurrency(data.totalPaid)}
              </td>
              <td className="text-right font-mono text-xs font-black text-slate-900 px-2 py-1.5">
                {formatCurrency(data.netBalance)}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* ─── 6. Terms & Signature Row ─── */}
        <div className="mt-8 pt-4 border-t border-slate-300 flex justify-between items-end">
          <div className="text-[9.5px] text-slate-500 space-y-0.5">
            <p className="font-semibold text-slate-700">Notes &amp; Declarations:</p>
            <p>1. This is a computer-generated official statement of account.</p>
            <p>2. Subject to reconciliation with hospital billing records.</p>
          </div>
          <div className="text-center space-y-6">
            <div className="border-b border-slate-400 w-44"></div>
            <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
              Authorized Signatory / Accounts
            </p>
          </div>
        </div>
      </div>
    );
  }
);

PatientLedgerPrint.displayName = "PatientLedgerPrint";
