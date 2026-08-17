const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export interface ReportQueryParams {
  fromDate?: string;
  toDate?: string;
  location?: string;
  groupBy?: string;
  companyWise?: boolean;
  type?: string;
  status?: string;
  mode?: string;
}

export interface RevenueReportData {
  reportType: string;
  groupBy: string;
  location: string;
  fromDate: string;
  toDate: string;
  summary: {
    totalBills: number;
    totalGross: number;
    totalDiscount: number;
    totalNet: number;
    totalCollected: number;
    totalOutstanding: number;
  };
  data: Array<{
    name: string;
    billCount: number;
    grossAmt: number;
    discountAmt: number;
    netAmt: number;
    collectedAmt: number;
    outstandingAmt: number;
  }>;
  rawInvoices: any[];
}

export interface CollectionsReportData {
  reportType: string;
  groupBy: string;
  totalCollection: number;
  totalTransactions: number;
  data: Array<{
    name: string;
    count: number;
    amount: number;
    cashAmt: number;
    cardAmt: number;
    upiAmt: number;
    otherAmt: number;
  }>;
  rawReceipts: Array<{
    id: string;
    receiptNo: string;
    date: string;
    uhid: string;
    patientName: string;
    mode: string;
    amount: number;
    type: string;
    invoiceNo: string;
    bankName?: string;
    refNo?: string;
  }>;
}

export interface BillRegisterReportData {
  reportType: string;
  summary: {
    totalBills: number;
    opBills: number;
    ipBills: number;
    settledBills: number;
    outstandingBills: number;
    totalAmount: number;
    totalBalance: number;
  };
  invoices: any[];
}

export interface AtdCensusReportData {
  reportType: string;
  summary: {
    totalPatients: number;
    totalAdmitted: number;
    totalDischarged: number;
    pendingBill: number;
    bedOccupancyRate: string;
  };
  patients: Array<{
    id: string;
    uhid: string;
    ipNo: string;
    name: string;
    genderAge: string;
    bedNo: string;
    doctor: string;
    status: string;
    company: string;
    regDate: string;
  }>;
}

export interface OutstandingReportData {
  reportType: string;
  totalOutstanding: number;
  totalPendingInvoices: number;
  buckets: Array<{
    range: string;
    count: number;
    amount: number;
    invoices: any[];
  }>;
  invoices: any[];
}

export interface RefundsCreditReportData {
  reportType: string;
  summary: {
    totalAdvanceBalance: number;
    totalCreditNotes: number;
    totalRefunds: number;
  };
  advances: any[];
  creditNotes: any[];
  refunds: any[];
}

export async function getRevenueReport(params?: ReportQueryParams): Promise<RevenueReportData> {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") query.append(k, String(v));
    });
  }
  const res = await fetch(`${API_BASE_URL}/reports/revenue?${query.toString()}`);
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to fetch revenue report");
  return result.data;
}

export async function getCollectionsReport(params?: ReportQueryParams): Promise<CollectionsReportData> {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") query.append(k, String(v));
    });
  }
  const res = await fetch(`${API_BASE_URL}/reports/collections?${query.toString()}`);
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to fetch collections report");
  return result.data;
}

export async function getBillRegisterReport(params?: ReportQueryParams): Promise<BillRegisterReportData> {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") query.append(k, String(v));
    });
  }
  const res = await fetch(`${API_BASE_URL}/reports/bill-register?${query.toString()}`);
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to fetch bill register report");
  return result.data;
}

export async function getAtdCensusReport(params?: ReportQueryParams): Promise<AtdCensusReportData> {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") query.append(k, String(v));
    });
  }
  const res = await fetch(`${API_BASE_URL}/reports/atd-census?${query.toString()}`);
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to fetch ATD census report");
  return result.data;
}

export async function getOutstandingReport(params?: ReportQueryParams): Promise<OutstandingReportData> {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") query.append(k, String(v));
    });
  }
  const res = await fetch(`${API_BASE_URL}/reports/outstanding?${query.toString()}`);
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to fetch outstanding report");
  return result.data;
}

export async function getRefundsCreditReport(): Promise<RefundsCreditReportData> {
  const res = await fetch(`${API_BASE_URL}/reports/refunds-credit`);
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to fetch advance & refund report");
  return result.data;
}
