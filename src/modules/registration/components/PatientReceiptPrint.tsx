import React, { forwardRef } from "react";
import { format } from "date-fns";

export interface ReceiptPrintData {
  receiptNo: string;
  receiptDate: string;
  uhid: string;
  patientName: string;
  genderAge?: string;
  mobile?: string;
  guardianName?: string;
  address?: string;
  hcf?: string;
  receiptType: "SETTLEMENT" | "ADVANCE" | "REFUND";
  invoiceNo?: string;
  mode: string;
  amount: number;
  bankName?: string;
  refNo?: string;
  remarks?: string;
  balanceRemaining?: number;
}

interface Props {
  receipt: ReceiptPrintData;
}

// Convert numbers to Words in INR
function numberToWords(num: number): string {
  if (!num || isNaN(num)) return "Zero Rupees Only";
  const a = [
    "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ",
    "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function inWords(n: number): string {
    if ((n = n.toString() as any).length > 9) return "overflow";
    const nArr = ("000000000" + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!nArr) return "";
    let str = "";
    str += Number(nArr[1]) !== 0 ? (a[Number(nArr[1])] || b[Number(nArr[1][0])] + " " + a[Number(nArr[1][1])]) + "Crore " : "";
    str += Number(nArr[2]) !== 0 ? (a[Number(nArr[2])] || b[Number(nArr[2][0])] + " " + a[Number(nArr[2][1])]) + "Lakh " : "";
    str += Number(nArr[3]) !== 0 ? (a[Number(nArr[3])] || b[Number(nArr[3][0])] + " " + a[Number(nArr[3][1])]) + "Thousand " : "";
    str += Number(nArr[4]) !== 0 ? (a[Number(nArr[4])] || b[Number(nArr[4][0])] + " " + a[Number(nArr[4][1])]) + "Hundred " : "";
    str += Number(nArr[5]) !== 0 ? (str !== "" ? "and " : "") + (a[Number(nArr[5])] || b[Number(nArr[5][0])] + " " + a[Number(nArr[5][1])]) : "";
    return str;
  }

  const words = inWords(Math.floor(num));
  return words ? `Rupees ${words.trim()} Only` : `Rupees ${num} Only`;
}

export const PatientReceiptPrint = forwardRef<HTMLDivElement, Props>(
  ({ receipt }, ref) => {
    let formattedDate = "-";
    try {
      if (receipt.receiptDate) {
        formattedDate = format(new Date(receipt.receiptDate), "dd/MM/yyyy hh:mm a");
      }
    } catch {
      formattedDate = receipt.receiptDate || "-";
    }

    const formatCurrency = (amt: number) => {
      if (!amt && amt !== 0) return "₹0.00";
      return `₹${amt.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
      <div
        ref={ref}
        className="p-6 bg-white text-slate-900 font-sans text-[11px] leading-tight"
        style={{ width: "8.27in", minHeight: "5.8in", margin: "0 auto", boxSizing: "border-box" }}
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
          .rec-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
          }
          .rec-table th, .rec-table td {
            border: 1px solid #64748b;
            padding: 4px 8px;
            vertical-align: middle;
          }
          .rec-header-bg {
            background-color: #f1f5f9;
            font-weight: 700;
            font-size: 11px;
            color: #0f172a;
          }
        `}</style>

        {/* ─── 1. Header with Logo & Centered Hospital Info ─── */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-300">
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

          <div className="w-36 text-right flex-shrink-0 text-[9.5px] text-slate-600">
            <p className="font-bold text-slate-900 uppercase">
              {receipt.receiptType === "ADVANCE" ? "ADVANCE RECEIPT" : "PAYMENT RECEIPT"}
            </p>
            <p className="font-mono text-slate-700 mt-0.5">{receipt.receiptNo}</p>
          </div>
        </div>

        {/* ─── 2. Title Banner ─── */}
        <div className="text-center py-1 bg-slate-100 rounded mb-3 border border-slate-300">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            {receipt.receiptType === "ADVANCE"
              ? "OFFICIAL ADVANCE DEPOSIT RECEIPT"
              : "OFFICIAL MONEY / SETTLEMENT RECEIPT"}
          </h2>
        </div>

        {/* ─── 3. Receipt Info Grid ─── */}
        <table className="rec-table mb-3">
          <tbody>
            <tr>
              <td className="w-1/2">
                <span className="font-bold text-slate-600 w-28 inline-block">Receipt No.</span>
                <span className="font-bold mr-2">:</span>
                <span className="font-bold text-slate-900 font-mono">{receipt.receiptNo}</span>
              </td>
              <td className="w-1/2">
                <span className="font-bold text-slate-600 w-28 inline-block">Date &amp; Time</span>
                <span className="font-bold mr-2">:</span>
                <span className="font-semibold text-slate-800">{formattedDate}</span>
              </td>
            </tr>
            <tr>
              <td className="w-1/2">
                <span className="font-bold text-slate-600 w-28 inline-block">UHID / MRD No.</span>
                <span className="font-bold mr-2">:</span>
                <span className="font-bold text-slate-900 font-mono">{receipt.uhid}</span>
              </td>
              <td className="w-1/2">
                <span className="font-bold text-slate-600 w-28 inline-block">Patient Name</span>
                <span className="font-bold mr-2">:</span>
                <span className="font-bold text-slate-900">{receipt.patientName}</span>
              </td>
            </tr>
            <tr>
              <td className="w-1/2">
                <span className="font-bold text-slate-600 w-28 inline-block">Gender / Age</span>
                <span className="font-bold mr-2">:</span>
                <span className="font-semibold text-slate-800">{receipt.genderAge || "N/A"}</span>
              </td>
              <td className="w-1/2">
                <span className="font-bold text-slate-600 w-28 inline-block">Mobile Number</span>
                <span className="font-bold mr-2">:</span>
                <span className="font-semibold text-slate-800">{receipt.mobile || "N/A"}</span>
              </td>
            </tr>
            {receipt.invoiceNo && (
              <tr>
                <td className="w-1/2">
                  <span className="font-bold text-slate-600 w-28 inline-block">Against Bill No.</span>
                  <span className="font-bold mr-2">:</span>
                  <span className="font-bold text-blue-700 font-mono">{receipt.invoiceNo}</span>
                </td>
                <td className="w-1/2">
                  <span className="font-bold text-slate-600 w-28 inline-block">Branch / HCF</span>
                  <span className="font-bold mr-2">:</span>
                  <span className="font-semibold text-slate-800">{receipt.hcf || "CMK Main"}</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ─── 4. Amount Received Box ─── */}
        <table className="rec-table mb-3">
          <thead>
            <tr className="rec-header-bg">
              <th className="text-left">Payment Mode</th>
              <th className="text-left">Bank / Ref No.</th>
              <th className="text-left">Purpose / Description</th>
              <th className="text-right w-36">Amount Received (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-bold text-slate-900 uppercase">{receipt.mode || "CASH"}</td>
              <td className="font-mono text-slate-700">
                {receipt.refNo ? `${receipt.bankName ? receipt.bankName + " - " : ""}${receipt.refNo}` : "—"}
              </td>
              <td className="font-medium text-slate-800">
                {receipt.remarks ||
                  (receipt.receiptType === "ADVANCE"
                    ? "Advance Deposit collected towards hospital treatment"
                    : `Payment received towards Invoice ${receipt.invoiceNo || ""}`)}
              </td>
              <td className="text-right font-mono font-black text-xs text-slate-900">
                {formatCurrency(receipt.amount)}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 font-bold">
              <td colSpan={3} className="text-right uppercase text-[10px] text-slate-700">
                Total Received Amount:
              </td>
              <td className="text-right font-mono text-sm font-black text-emerald-800">
                {formatCurrency(receipt.amount)}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* ─── 5. Amount in Words ─── */}
        <div className="p-2.5 bg-slate-50 border border-slate-300 rounded mb-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Amount in Words:</span>
            <span className="font-bold text-slate-900 text-xs mt-0.5 block italic">{numberToWords(receipt.amount)}</span>
          </div>
          {receipt.balanceRemaining !== undefined && (
            <div className="text-right">
              <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider block">Balance Remaining:</span>
              <span className="font-bold font-mono text-xs text-rose-700">{formatCurrency(receipt.balanceRemaining)}</span>
            </div>
          )}
        </div>

        {/* ─── 6. Signatures ─── */}
        <div className="mt-6 pt-3 border-t border-slate-300 flex justify-between items-end text-[10px]">
          <div className="space-y-4">
            <p className="text-slate-500 italic">This is an official computer-generated receipt.</p>
            <p className="font-bold text-slate-800">Patient / Payee Signature</p>
          </div>
          <div className="text-center space-y-4">
            <div className="border-b border-slate-400 w-40"></div>
            <p className="font-bold text-slate-900 uppercase tracking-wider">Authorized Signatory / Accounts</p>
          </div>
        </div>
      </div>
    );
  }
);

PatientReceiptPrint.displayName = "PatientReceiptPrint";
