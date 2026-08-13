const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export interface PatientData {
  id?: string;
  registrationType: string;
  uhid?: string;
  title: string;
  firstName: string;
  middleName?: string;
  lastName?: string;
  fullName?: string;
  gender: string;
  maritalStatus?: string;
  dob?: string | null;
  age?: number | string | null;
  guardianName: string;
  guardianRelation?: string;
  regDate?: string;
  mobile: string;
  address: string;
  country?: string;
  state: string;
  districtCity?: string;
  area?: string;
  pinCode?: string;
  altPhone?: string;
  email?: string;
  emergencyName?: string;
  emergencyRelationship?: string;
  emergencyContact?: string;
  nationality?: string;
  aadhaarCard?: string;
  panNo?: string;
  payerType: string;
  payer?: string;
  sponsor?: string;
  provider?: string;
  leadSource?: string;
  referredType?: string;
  referredBy?: string;
  hcf?: string;
  status?: string;
  remarks?: string;
  religion?: string;
  occupation?: string;
  isVip?: boolean;
  isAnimation?: boolean;
  nameMasking?: boolean;
  handleWithCare?: boolean;
  sendPromoSms?: boolean;
  sendPromoEmail?: boolean;
  createdAt?: string;
}

export interface PatientQueryParams {
  search?: string;
  page?: number;
  limit?: number;
}

export async function createPatient(data: PatientData) {
  const response = await fetch(`${API_BASE_URL}/patients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to register patient");
  }
  return result.data.patient as PatientData;
}

export async function getPatients(params?: PatientQueryParams) {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));

  const response = await fetch(`${API_BASE_URL}/patients?${query.toString()}`);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch patients");
  }
  return result.data as {
    patients: PatientData[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export async function importPatientsBulk(patients: Partial<PatientData>[]) {
  const response = await fetch(`${API_BASE_URL}/patients/import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ patients }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to import patients");
  }
  return result.data as {
    totalRecords: number;
    insertedCount: number;
    skippedCount: number;
    errors: string[];
    insertedPatients: PatientData[];
  };
}

export async function getPatientById(id: string) {
  const response = await fetch(`${API_BASE_URL}/patients/${id}`);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch patient");
  }
  return result.data.patient as PatientData;
}

export async function updatePatient(id: string, data: Partial<PatientData>) {
  const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to update patient");
  }
  return result.data.patient as PatientData;
}

export async function deletePatient(id: string) {
  const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
    method: "DELETE",
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to delete patient");
  }
  return result;
}
