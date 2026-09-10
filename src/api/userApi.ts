import { API_BASE_URL } from "@/config/env";

export interface UserData {
  id: string;
  name: string;
  password?: string;
  email: string;
  role: 'Admin' | 'Doctor' | 'Nurse' | 'Receptionist';
  status: 'Active' | 'Inactive';
  lastLogin: string | null;
  createdAt: string;
}

// Helper to get auth token from local storage
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("cmk_auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const authenticateUser = async (email: string, password?: string): Promise<UserData> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Invalid username or password");
  }

  const data = await response.json();
  
  // Store the auth token if returned by the API
  if (data.token) {
    localStorage.setItem("cmk_auth_token", data.token);
  }

  // Return the user data (assuming it's in data.user or the root response)
  return data.user || data;
};

export const getUsers = async (): Promise<UserData[]> => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
};

export const createUser = async (
  userData: Omit<UserData, "id" | "createdAt" | "lastLogin">
): Promise<UserData> => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Failed to create user");
  }

  return response.json();
};

export const updateUser = async (
  id: string,
  updates: Partial<Omit<UserData, "id" | "createdAt">>
): Promise<UserData> => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Failed to update user");
  }

  return response.json();
};

export const deleteUser = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Failed to delete user");
  }
};
