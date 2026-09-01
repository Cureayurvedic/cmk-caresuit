import React, { createContext, useContext, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setActiveBranch as setReduxActiveBranch, fetchBranches } from "@/store/slices/branchSlice";

interface BranchContextType {
  activeBranch: string;
  setActiveBranch: (branch: string) => void;
  branchesList: string[];
  refreshBranches: () => Promise<void>;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const activeBranch = useAppSelector((state) => state.branch.activeBranch);
  const branchesList = useAppSelector((state) => state.branch.branchesList);

  const refreshBranches = async () => {
    await dispatch(fetchBranches());
  };

  useEffect(() => {
    dispatch(fetchBranches());
    const handleUpdate = () => {
      dispatch(fetchBranches());
    };
    window.addEventListener("cmk:branches-updated", handleUpdate);
    return () => window.removeEventListener("cmk:branches-updated", handleUpdate);
  }, [dispatch]);

  const setActiveBranch = (branch: string) => {
    dispatch(setReduxActiveBranch(branch));
  };

  return (
    <BranchContext.Provider value={{ activeBranch, setActiveBranch, branchesList, refreshBranches }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error("useBranch must be used within a BranchProvider");
  }
  return context;
}
