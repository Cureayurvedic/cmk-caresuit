import { configureStore } from "@reduxjs/toolkit";
import branchReducer from "./slices/branchSlice";
import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    branch: branchReducer,
    auth: authReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
