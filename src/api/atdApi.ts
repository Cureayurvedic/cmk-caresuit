const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export interface BedPatient {
  uhid: string;
  ipNo: string;
  name: string;
  genderAge: string;
  admissionDate: string;
  doctor: string;
  department: string;
  diagnosis: string;
  billingCategory: string;
  company: string;
  mobile: string;
  advancePaid: number;
  runningBill: number;
}

export interface BedItem {
  id: string;
  bedNo: string;
  category: "DELUXE" | "GENERAL" | "ICU" | "SINGLE PRIVATE" | "TWIN SHARING";
  ward: string;
  status: "Vacant" | "Occupied" | "House Keeping" | "Retain" | "Blocked" | "Under Repair" | "Still On Bed/Discharge Approval";
  patient?: BedPatient | null;
  cleaningStartedAt?: string | null;
  dischargeInitiatedAt?: string | null;
  dischargeNotes?: string | null;
  tariffRate: number;
  notes?: string;
}

export interface BedCounts {
  vacant: number;
  occupied: number;
  houseKeeping: number;
  retain: number;
  blocked: number;
  underRepair: number;
  stillOnBed: number;
  total: number;
}

export interface BedListResponse {
  beds: BedItem[];
  counts: BedCounts;
}

export interface AdmitPatientPayload {
  bedId?: string;
  bedNo: string;
  uhid: string;
  patientName: string;
  bookingNo?: string;
  ipNo?: string;
  admittingTeam?: string;
  treatingConsultant?: string;
  admittingDoctor?: string;
  secondaryDoctor?: string;
  referType?: string;
  referBy?: string;
  admissionType?: string;
  ward?: string;
  bedCategory?: string;
  billingCategory?: string;
  expectedDischargeDate?: string;
  minAdvRequire?: number;
  estimatedAmt?: number;
  mlc?: boolean;
  handleWithCare?: boolean;
  source?: string;
  payerType?: string;
  payer?: string;
  sponsor?: string;
  insuranceCompany?: string;
  kinDetails?: any;
  advancePaid?: number;
  doctor?: string;
  department?: string;
  diagnosis?: string;
  company?: string;
  mobile?: string;
}

export interface TransferPatientPayload {
  fromBedNo: string;
  toBedNo: string;
  reason?: string;
}

export async function getBeds(params?: { category?: string; status?: string; search?: string }): Promise<BedListResponse> {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") query.append(k, String(v));
    });
  }
  const res = await fetch(`${API_BASE_URL}/atd/beds?${query.toString()}`);
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to fetch beds");
  return result.data;
}

export async function admitPatientToBed(payload: AdmitPatientPayload): Promise<BedItem> {
  const res = await fetch(`${API_BASE_URL}/atd/beds/admit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to admit patient");
  return result.data;
}

export async function transferPatientBed(payload: TransferPatientPayload): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/atd/beds/transfer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to transfer patient");
  return result.data;
}

export async function initiateBedDischarge(bedNo: string, dischargeNotes?: string): Promise<BedItem> {
  const res = await fetch(`${API_BASE_URL}/atd/beds/discharge-initiate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bedNo, dischargeNotes }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to initiate discharge");
  return result.data;
}

export async function completeBedDischarge(bedNo: string): Promise<BedItem> {
  const res = await fetch(`${API_BASE_URL}/atd/beds/discharge-complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bedNo }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to complete discharge");
  return result.data;
}

export async function updateBedStatus(bedNo: string, status: string, notes?: string): Promise<BedItem> {
  const res = await fetch(`${API_BASE_URL}/atd/beds/status-update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bedNo, status, notes }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Failed to update bed status");
  return result.data;
}
