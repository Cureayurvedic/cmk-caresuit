import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getSettingsItems } from "@/api/settingsApi";

export interface BranchState {
  activeBranch: string;
  branchesList: string[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialActiveBranch = localStorage.getItem("cmk_active_branch") || "CMK Main";

const initialState: BranchState = {
  activeBranch: initialActiveBranch,
  branchesList: ["CMK Main", "CMK Branch 1", "CMK Branch 2"],
  status: "idle",
  error: null,
};

export const fetchBranches = createAsyncThunk("branch/fetchBranches", async () => {
  const res = await getSettingsItems("branches");
  if (res.items && res.items.length > 0) {
    return res.items.map((i) => i.value);
  }
  return ["CMK Main", "CMK Branch 1", "CMK Branch 2"];
});

export const branchSlice = createSlice({
  name: "branch",
  initialState,
  reducers: {
    setActiveBranch: (state, action: PayloadAction<string>) => {
      state.activeBranch = action.payload;
      localStorage.setItem("cmk_active_branch", action.payload);
      window.dispatchEvent(new CustomEvent("cmk:branch-changed", { detail: action.payload }));
    },
    setBranchesList: (state, action: PayloadAction<string[]>) => {
      state.branchesList = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranches.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.branchesList = action.payload;
        if (action.payload.length > 0 && (!state.activeBranch || !action.payload.includes(state.activeBranch))) {
          state.activeBranch = action.payload[0];
          localStorage.setItem("cmk_active_branch", action.payload[0]);
        }
      })
      .addCase(fetchBranches.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch branches";
      });
  },
});

export const { setActiveBranch, setBranchesList } = branchSlice.actions;
export default branchSlice.reducer;
