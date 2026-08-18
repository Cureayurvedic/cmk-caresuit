const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export type SettingsCategory =
  | "providers"
  | "leadSources"
  | "religions"
  | "occupations"
  | "branches"
  | "companies"
  | "insurances";

export interface MasterOption {
  id: string;
  category: string;
  value: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface SettingsListResponse {
  items: MasterOption[];
  total: number;
  category: string;
}

/**
 * Fetch the auth token from localStorage (set during login).
 */
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("cmk_token");
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

/**
 * GET /api/v1/settings/:category
 * Returns all master options for the given category.
 */
export async function getSettingsItems(category: SettingsCategory): Promise<SettingsListResponse> {
  const response = await fetch(`${API_BASE_URL}/settings/${category}`, {
    headers: getAuthHeaders(),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || `Failed to fetch ${category} settings`);
  }
  return result.data as SettingsListResponse;
}

/**
 * POST /api/v1/settings/:category
 * Body: { value: string }
 * Adds a new item to the category. Returns the created MasterOption.
 */
export async function addSettingsItem(
  category: SettingsCategory,
  value: string
): Promise<MasterOption> {
  const response = await fetch(`${API_BASE_URL}/settings/${category}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ value }),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || `Failed to add item to ${category}`);
  }
  return result.data.item as MasterOption;
}

/**
 * DELETE /api/v1/settings/:category/:id
 * Removes an item by its id.
 */
export async function deleteSettingsItem(
  category: SettingsCategory,
  id: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/settings/${category}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || `Failed to delete item from ${category}`);
  }
}
