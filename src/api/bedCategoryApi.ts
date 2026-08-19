import { API_BASE_URL } from "@/config/env";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("cmk_token");
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

export interface BedCategoryData {
  id: string;
  name: string;
  prefix: string;
  ward: string;
  tariffRate: number;
  totalBeds: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // enriched
  bedsVacant?: number;
  bedsOccupied?: number;
  bedsOther?: number;
  beds?: BedData[];
}

export interface BedData {
  id: string;
  bedNo: string;
  categoryId: string;
  status: string;
  patientJson?: string | null;
  notes?: string | null;
  cleaningStartedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBedCategoryPayload {
  name: string;
  prefix: string;
  ward: string;
  tariffRate: number;
  totalBeds: number;
}

export interface UpdateBedCategoryPayload {
  name?: string;
  ward?: string;
  tariffRate?: number;
  totalBeds?: number;
}

/**
 * GET /api/v1/settings/bed-categories
 */
export async function getBedCategories(): Promise<BedCategoryData[]> {
  const res = await fetch(`${API_BASE_URL}/settings/bed-categories`, { headers: getAuthHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch bed categories");
  return json.data.categories as BedCategoryData[];
}

/**
 * POST /api/v1/settings/bed-categories
 */
export async function createBedCategory(payload: CreateBedCategoryPayload): Promise<BedCategoryData> {
  const res = await fetch(`${API_BASE_URL}/settings/bed-categories`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create bed category");
  return json.data.category as BedCategoryData;
}

/**
 * PATCH /api/v1/settings/bed-categories/:id
 */
export async function updateBedCategory(id: string, payload: UpdateBedCategoryPayload): Promise<BedCategoryData> {
  const res = await fetch(`${API_BASE_URL}/settings/bed-categories/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update bed category");
  return json.data.category as BedCategoryData;
}

/**
 * DELETE /api/v1/settings/bed-categories/:id
 */
export async function deleteBedCategory(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/settings/bed-categories/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete bed category");
}
