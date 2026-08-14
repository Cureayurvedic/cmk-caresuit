const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export interface ReceiptData {
  id?: string;
  invoiceId: string;
  mode: string;
  amount: number;
  bankName?: string;
  beneficiaryName?: string;
  refNo?: string;
  type?: string;
  notes?: string;
  createdAt?: string;
}

export interface InvoiceData {
  id: string;
  company: string;
  uhid: string;
  patientName: string;
  encNo: string;
  type: "OP" | "IP";
  invoiceNo: string;
  date: string;
  netAmt: number;
  paidPatient: number;
  paidPayer: number;
  adjusted: number;
  refund: number;
  creditNote: number;
  balance: number;
  status: "Outstanding" | "Settled" | "Refundable" | "Cancelled";
  tdsAmt: number;
  isCancelled: boolean;
  createdAt: string;
  updatedAt: string;
  receipts?: ReceiptData[];
}

export interface BillingQueryParams {
  search?: string;
  status?: string;
  type?: string;
  uhid?: string;
  invoiceNo?: string;
  page?: number;
  limit?: number;
}

export async function getInvoices(params?: BillingQueryParams) {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.status) query.append("status", params.status);
  if (params?.type) query.append("type", params.type);
  if (params?.uhid) query.append("uhid", params.uhid);
  if (params?.invoiceNo) query.append("invoiceNo", params.invoiceNo);
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));

  const response = await fetch(`${API_BASE_URL}/billing/invoices?${query.toString()}`);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch invoices");
  }
  return result.data as {
    invoices: InvoiceData[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export async function settleInvoice(data: {
  invoiceId: string;
  payments: Array<{
    mode: string;
    amount: number;
    bankName?: string;
    beneficiaryName?: string;
    refNo?: string;
    type?: string;
    notes?: string;
  }>;
}) {
  const response = await fetch(`${API_BASE_URL}/billing/invoices/settle`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to process settlement");
  }
  return result.data.invoice as InvoiceData;
}

export async function cancelInvoice(id: string) {
  const response = await fetch(`${API_BASE_URL}/billing/invoices/cancel/${id}`, {
    method: "POST",
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to cancel invoice");
  }
  return result.data.invoice as InvoiceData;
}
