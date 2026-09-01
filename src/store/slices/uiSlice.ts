import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UiState {
  sidebarCollapsed: boolean;
  globalSearchQuery: string;
  refreshCounter: number;
}

const initialState: UiState = {
  sidebarCollapsed: false,
  globalSearchQuery: "",
  refreshCounter: 0,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    setGlobalSearchQuery: (state, action: PayloadAction<string>) => {
      state.globalSearchQuery = action.payload;
    },
    triggerRefresh: (state) => {
      state.refreshCounter += 1;
    },
  },
});

export const { toggleSidebar, setSidebarCollapsed, setGlobalSearchQuery, triggerRefresh } = uiSlice.actions;
export default uiSlice.reducer;
