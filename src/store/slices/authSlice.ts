import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  email?: string;
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
}

const storedToken = localStorage.getItem("cmk_token");

const initialState: AuthState = {
  user: {
    id: "usr-01",
    name: "Dr. Admin",
    role: "Administrator",
  },
  token: storedToken || null,
  isAuthenticated: true,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: UserProfile; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem("cmk_token", action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("cmk_token");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
