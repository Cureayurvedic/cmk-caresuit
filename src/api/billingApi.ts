import { API_BASE_URL } from "@/config/env";

export interface ReceiptData {
  id?: string;
  receiptNo?: string;
  invoiceId?: string;
  uhid?: string;
  patientName?: string;
  mode: string;
  amount: number;
  bankName?: string;
  beneficiaryName?: string;
  refNo?: string;
  cardSwipingValue?: number;
  type?: string;
  notes?: string;
  createdAt?: string;
}

export interface InvoiceItem {
  code: string;
  name: string;
  dept?: string;
  doctor?: string;
  rate: number;
  qty: number;
  discountPercent?: number;
  discountAmt?: number;
  taxPercent?: number;
  net?: number;
  netAmt?: number;
  remark?: string;
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
  doctorName?: string;
  department?: string;
  grossAmt: number;
  discountAmt: number;
  taxAmt: number;
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
  itemsJson?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  receipts?: ReceiptData[];
}

export interface BillingStats {
  todayRevenue: number;
  monthRevenue: number;
  pendingBillsCount: number;
  totalInvoicesCount: number;
  activeAdvanceBalance: number;
}

export interface OpVisitData {
  id: string;
  visitNo: string;
  uhid: string;
  patientName: string;
  doctorName: string;
  department?: string;
  payerType: string;
  payer?: string;
  sponsor?: string;
  network?: string;
  consultationFee: number;
  visitType: "New" | "Follow-up" | "Emergency";
  status: "Open" | "Closed" | "Sent for Billing";
  visitDate: string;
  createdAt: string;
}

export interface BillingOrderData {
  id: string;
  orderNo: string;
  uhid: string;
  visitNo?: string;
  patientName: string;
  doctorName: string;
  orderType: string;
  status: "Unbilled" | "Billed" | "Cancelled";
  itemsJson: string;
  totalAmount: number;
  discountAmount: number;
  netAmount: number;
  remarks?: string;
  createdAt: string;
}

export interface AdvanceData {
  id: string;
  advanceNo: string;
  uhid: string;
  patientName: string;
  encNo?: string;
  amount: number;
  adjustedAmount: number;
  refundAmount: number;
  balanceAmount: number;
  mode: string;
  bankName?: string;
  beneficiaryName?: string;
  refNo?: string;
  purpose?: string;
  status: "Active" | "Fully Adjusted" | "Refunded";
  createdAt: string;
}

export interface CreditNoteData {
  id: string;
  creditNoteNo: string;
  invoiceId?: string;
  invoiceNo: string;
  uhid: string;
  patientName: string;
  reason: string;
  amount: number;
  authorizedBy: string;
  createdAt: string;
}

export interface RefundData {
  id: string;
  refundNo: string;
  uhid: string;
  patientName: string;
  invoiceId?: string;
  invoiceNo?: string;
  receiptId?: string;
  amount: number;
  mode: string;
  bankName?: string;
  refNo?: string;
  reason: string;
  authorizedBy: string;
  status: string;
  createdAt: string;
}

export interface InsuranceIntimationData {
  id: string;
  uhid: string;
  patientName: string;
  encNo?: string;
  tpaName: string;
  policyNo: string;
  claimNo: string;
  requestedAmt: number;
  approvedAmt: number;
  coPayAmt: number;
  status: "Initiated" | "Under Process" | "Query Raised" | "Approved" | "Rejected" | "Settled";
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillingQueryParams {
  search?: string;
  uhid?: string;
  billNo?: string;
  invoiceNo?: string;
  patientName?: string;
  encNo?: string;
  company?: string;
  type?: string;
  facility?: string;
  payerType?: string;
  payer?: string;
  sponsor?: string;
  patientRefundable?: boolean | string;
  status?: string;
  searchFor?: string;
  fromDate?: string;
  toDate?: string;
  colFilterCompany?: string;
  colFilterUhid?: string;
  colFilterPatient?: string;
  colFilterEnc?: string;
  colFilterInvoiceNo?: string;
  page?: number;
  limit?: number;
}

export interface ReceiptQueryParams {
  search?: string;
  uhid?: string;
  invoiceNo?: string;
  patientName?: string;
  mode?: string;
  type?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface BillingPatientQueryParams {
  search?: string;
  searchOn?: string;
  type?: string;
  encounterStatus?: string;
  status?: string;
  doctor?: string;
  gender?: string;
  payerType?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
}

// ─── STATS API ─────────────────────────────────────────────────────────────────
export async function getBillingStats(): Promise<BillingStats> {
  const response = await fetch(`${API_BASE_URL}/billing/stats`);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch stats");
  }
  return result.data;
}

// ─── INVOICES API ──────────────────────────────────────────────────────────────
export async function getInvoices(params?: BillingQueryParams) {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, String(value));
      }
    });
  }

  const response = await fetch(`${API_BASE_URL}/billing/invoices?${query.toString()}`);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch invoices");
  }
  return result.data as {
    invoices: InvoiceData[];
    total: number;
    totalAdvanceAvailable?: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// ─── RECEIPTS & CASHBOOK LEDGER API ────────────────────────────────────────────
export async function getReceipts(params?: ReceiptQueryParams) {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, String(value));
      }
    });
  }

  const response = await fetch(`${API_BASE_URL}/billing/receipts?${query.toString()}`);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch receipts");
  }
  return result.data as {
    receipts: Array<{
      id: string;
      receiptNo: string;
      invoiceNo: string;
      uhid: string;
      patientName: string;
      company: string;
      encNo: string;
      date: string;
      mode: string;
      bankName?: string;
      beneficiaryName?: string;
      refNo?: string;
      amount: number;
      type: string;
      notes?: string;
    }>;
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// ─── BILLING PATIENT CENSUS API ────────────────────────────────────────────────
export async function getBillingPatients(params?: BillingPatientQueryParams) {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, String(value));
      }
    });
  }

  const response = await fetch(`${API_BASE_URL}/billing/patients?${query.toString()}`);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch billing patients");
  }
  return (result.data.patients || []) as Array<{
    id: string;
    uhid: string;
    ipNo: string;
    patientName: string;
    genderAge: string;
    admissionDate: string;
    bedNo: string;
    billingCategory: string;
    doctor: string;
    encounterStatus: string;
    company: string;
    mobileNo: string;
    type: "Registration" | "Admission" | "Discharge But Not Bill" | "Discharge";
    address?: string;
    fatherName?: string;
    isVip?: boolean;
    payerType?: string;
    sponsor?: string;
  }>;
}

export async function getInvoiceById(id: string) {
  const response = await fetch(`${API_BASE_URL}/billing/invoices/${id}`);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch invoice");
  }
  return result.data.invoice as InvoiceData;
}

export async function createInvoice(data: {
  uhid: string;
  patientName: string;
  encNo?: string;
  type?: "OP" | "IP";
  company?: string;
  doctorName?: string;
  department?: string;
  grossAmt?: number;
  discountAmt?: number;
  taxAmt?: number;
  netAmt?: number;
  items?: InvoiceItem[];
  payments?: Array<{
    mode: string;
    amount: number;
    bankName?: string;
    beneficiaryName?: string;
    refNo?: string;
    cardSwipingValue?: number;
    description?: string;
    payerCategory?: string;
  }>;
  remarks?: string;
  advanceAdjusted?: number;
  orderId?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/billing/invoices`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to create invoice");
  }
  return result.data.invoice as InvoiceData;
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
    cardSwipingValue?: number;
  }>;
}) {
  const response = await fetch(`${API_BASE_URL}/billing/invoices/settle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

// ─── OP VISITS API ─────────────────────────────────────────────────────────────
export async function getOpVisits(params?: {
  uhid?: string;
  search?: string;
  status?: string;
  doctorName?: string;
  department?: string;
  payerType?: string;
  payer?: string;
  sponsor?: string;
  visitType?: string;
  fromDate?: string;
  toDate?: string;
}) {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, String(value));
      }
    });
  }

  const response = await fetch(`${API_BASE_URL}/billing/visits?${query.toString()}`);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch OP visits");
  }
  return result.data.visits as OpVisitData[];
}

export async function createOpVisit(data: {
  uhid: string;
  patientName?: string;
  doctorName: string;
  department?: string;
  payerType?: string;
  payer?: string;
  sponsor?: string;
  network?: string;
  consultationFee?: number;
  visitType?: "New" | "Follow-up" | "Emergency";
  status?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/billing/visits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to create OP visit");
  }
  return result.data.visit as OpVisitData;
}

// ─── BILLING ORDERS API ────────────────────────────────────────────────────────
export async function getBillingOrders(params?: {
  uhid?: string;
  status?: string;
  orderType?: string;
  search?: string;
  doctorName?: string;
  fromDate?: string;
  toDate?: string;
}) {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, String(value));
      }
    });
  }

  const response = await fetch(`${API_BASE_URL}/billing/orders?${query.toString()}`);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch billing orders");
  }
  return result.data.orders as BillingOrderData[];
}

export async function createBillingOrder(data: {
  uhid: string;
  visitNo?: string;
  patientName?: string;
  doctorName: string;
  orderType?: string;
  items: InvoiceItem[];
  remarks?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/billing/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to create order");
  }
  return result.data.order as BillingOrderData;
}

export async function billOrder(id: string, billingData?: { company?: string; payments?: any[] }) {
  const response = await fetch(`${API_BASE_URL}/billing/orders/${id}/bill`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(billingData || {}),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to bill order");
  }
  return result.data.invoice as InvoiceData;
}

// ─── ADVANCE COLLECTIONS API ───────────────────────────────────────────────────
export async function getAdvances(params?: {
  uhid?: string;
  status?: string;
  search?: string;
  purpose?: string;
  mode?: string;
  fromDate?: string;
  toDate?: string;
}) {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, String(value));
      }
    });
  }

  const response = await fetch(`${API_BASE_URL}/billing/advances?${query.toString()}`);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch advances");
  }
  return result.data.advances as AdvanceData[];
}

export async function createAdvance(data: {
  uhid: string;
  patientName?: string;
  encNo?: string;
  amount: number;
  mode?: string;
  bankName?: string;
  beneficiaryName?: string;
  refNo?: string;
  purpose?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/billing/advances`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to collect advance");
  }
  return result.data.advance as AdvanceData;
}

// ─── CREDIT NOTES API ──────────────────────────────────────────────────────────
export async function getCreditNotes(params?: {
  uhid?: string;
  invoiceNo?: string;
  search?: string;
  authorizedBy?: string;
  reason?: string;
  fromDate?: string;
  toDate?: string;
}) {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, String(value));
      }
    });
  }

  const response = await fetch(`${API_BASE_URL}/billing/credit-notes?${query.toString()}`);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch credit notes");
  }
  return result.data.creditNotes as CreditNoteData[];
}

export async function createCreditNote(data: {
  invoiceId?: string;
  invoiceNo: string;
  uhid: string;
  patientName: string;
  reason: string;
  amount: number;
  authorizedBy?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/billing/credit-notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to issue credit note");
  }
  return result.data.creditNote as CreditNoteData;
}

// ─── REFUNDS API ───────────────────────────────────────────────────────────────
export async function getRefunds(params?: {
  uhid?: string;
  invoiceNo?: string;
  refundNo?: string;
  status?: string;
  mode?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
}) {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, String(value));
      }
    });
  }

  const response = await fetch(`${API_BASE_URL}/billing/refunds?${query.toString()}`);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch refunds");
  }
  return result.data.refunds as RefundData[];
}

export async function createRefund(data: {
  uhid: string;
  patientName: string;
  invoiceId?: string;
  invoiceNo?: string;
  receiptId?: string;
  amount: number;
  mode?: string;
  bankName?: string;
  refNo?: string;
  reason: string;
  authorizedBy?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/billing/refunds`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to process refund");
  }
  return result.data.refund as RefundData;
}

// ─── INSURANCE INTIMATIONS API ─────────────────────────────────────────────────
export async function getIntimations(params?: {
  uhid?: string;
  claimNo?: string;
  policyNo?: string;
  status?: string;
  tpaName?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
}) {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, String(value));
      }
    });
  }

  const response = await fetch(`${API_BASE_URL}/billing/intimations?${query.toString()}`);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch intimations");
  }
  return result.data.intimations as InsuranceIntimationData[];
}

export async function createIntimation(data: {
  uhid: string;
  patientName?: string;
  encNo?: string;
  tpaName: string;
  policyNo: string;
  claimNo: string;
  requestedAmt: number;
  approvedAmt?: number;
  coPayAmt?: number;
  status?: string;
  remarks?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/billing/intimations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to create intimation");
  }
  return result.data.intimation as InsuranceIntimationData;
}

export async function updateIntimation(id: string, data: Partial<InsuranceIntimationData>) {
  const response = await fetch(`${API_BASE_URL}/billing/intimations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to update intimation");
  }
  return result.data.intimation as InsuranceIntimationData;
}

// ─── SEED DEMO DATA API ────────────────────────────────────────────────────────
export async function seedBillingData() {
  const response = await fetch(`${API_BASE_URL}/billing/seed`, {
    method: "POST",
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to seed demo billing data");
  }
  return result.data;
}
