import { API_BASE_URL } from "@/config/env";

export type SettingsCategory =
  | "providers"
  | "leadSources"
  | "religions"
  | "occupations"
  | "branches"
  | "companies"
  | "insurances"
  | "doctors"
  | "payers";

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

export const DEFAULT_DOCTORS = [
  "Dr. Abhishek Bansal 2273",
  "Dr. Sameer Sen 3105",
  "Dr. Rajesh Malhotra 1104",
  "Dr. D K DAS 2268",
  "Dr. Sania Mirza 2231",
];

const DEFAULT_VALUES_MAP: Record<string, string[]> = {
  doctors: DEFAULT_DOCTORS,
  providers: ["Self", "Referral", "Camp", "OPD", "Emergency"],
  leadSources: ["Walk-in", "Online", "Phone", "Camp", "Doctor Referral", "Insurance"],
  religions: ["Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain", "Other"],
  occupations: [
    "Astrologer", "Banker", "Business", "Carpenter", "Doctor", "Driver",
    "Engineer", "Farmer", "Fisherman", "Hairdresser", "Housewife", "Labor",
    "Lawyer", "Mechanic", "Nil", "Retired", "Service", "Student"
  ],
  branches: ["CMK Main", "CMK Branch 1", "CMK Branch 2"],
  companies: ["TATA Consultancy Services", "Reliance Industries", "Infosys Ltd", "Wipro", "HDFC Bank"],
  insurances: [
    "Star Health Insurance", "Niva Bupa Health Insurance", "Care Health Insurance",
    "HDFC ERGO", "ICICI Lombard", "Aditya Birla Health", "LIC of India"
  ],
  payers: ["CASH", "Star Health Insurance", "HDFC ERGO Health", "Niva Bupa"],
};

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
  try {
    const response = await fetch(`${API_BASE_URL}/settings/${category}`, {
      headers: getAuthHeaders(),
    });
    if (response.ok) {
      const result = await response.json();
      if (result.data && Array.isArray(result.data.items)) {
        const values = result.data.items.map((i: MasterOption) => i.value).filter(Boolean);
        localStorage.setItem(`cmk_settings_${category}`, JSON.stringify(values));
        return result.data as SettingsListResponse;
      }
    }
  } catch (err) {
    console.warn(`API fetch for ${category} settings failed, loading fallback/cache`, err);
  }

  // Fallback to localStorage or default values
  const cached = localStorage.getItem(`cmk_settings_${category}`);
  let listToUse = DEFAULT_VALUES_MAP[category] || [];
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        listToUse = parsed;
      }
    } catch (e) {}
  }

  const items: MasterOption[] = listToUse.map((val, idx) => ({
    id: `local-${idx}-${val}`,
    category,
    value: val,
    sortOrder: idx,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  return { items, total: items.length, category };
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
  let createdItem: MasterOption | null = null;
  try {
    const response = await fetch(`${API_BASE_URL}/settings/${category}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ value }),
    });
    if (response.ok) {
      const result = await response.json();
      createdItem = result.data.item as MasterOption;
    }
  } catch (err) {
    console.warn(`API add item for ${category} failed, saving locally`, err);
  }

  // Update local cache as well
  const cached = localStorage.getItem(`cmk_settings_${category}`);
  let list: string[] = DEFAULT_VALUES_MAP[category] ? [...DEFAULT_VALUES_MAP[category]] : [];
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) list = parsed;
    } catch (e) {}
  }
  if (!list.includes(value.trim())) {
    list.push(value.trim());
    localStorage.setItem(`cmk_settings_${category}`, JSON.stringify(list));
  }

  // Notify components
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cmk_settings_updated", { detail: { category } }));
  }

  return (
    createdItem || {
      id: `local-${Date.now()}`,
      category,
      value: value.trim(),
      sortOrder: list.length - 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );
}

/**
 * DELETE /api/v1/settings/:category/:id
 * Removes an item by its id.
 */
export async function deleteSettingsItem(
  category: SettingsCategory,
  id: string,
  itemValue?: string
): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/settings/${category}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
  } catch (err) {
    console.warn(`API delete item for ${category} failed`, err);
  }

  // Update local cache if itemValue provided or matching id
  const cached = localStorage.getItem(`cmk_settings_${category}`);
  if (cached && itemValue) {
    try {
      const parsed: string[] = JSON.parse(cached);
      const updated = parsed.filter((v) => v !== itemValue);
      localStorage.setItem(`cmk_settings_${category}`, JSON.stringify(updated));
    } catch (e) {}
  }

  // Notify components
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cmk_settings_updated", { detail: { category } }));
  }
}

/**
 * Helper to fetch all doctor options from settings.
 * Combines "doctors" category and doctor entries in "providers" category.
 */
export async function fetchDoctorsFromSettings(): Promise<string[]> {
  try {
    const resDocs = await getSettingsItems("doctors");
    const docValues = (resDocs.items || []).map((item) => item.value).filter(Boolean);

    let provValues: string[] = [];
    try {
      const resProvs = await getSettingsItems("providers");
      provValues = (resProvs.items || [])
        .map((item) => item.value)
        .filter((val) => val && val.toLowerCase().startsWith("dr"));
    } catch (e) {}

    const uniqueDoctors = Array.from(new Set([...docValues, ...provValues]));
    if (uniqueDoctors.length > 0) {
      localStorage.setItem("cmk_doctors_cache", JSON.stringify(uniqueDoctors));
      return uniqueDoctors;
    }
  } catch (err) {
    console.warn("Could not fetch doctors from settings", err);
  }

  const cached = localStorage.getItem("cmk_doctors_cache");
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }

  return DEFAULT_DOCTORS;
}

