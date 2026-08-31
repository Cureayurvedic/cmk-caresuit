import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getSettingsItems } from "@/api/settingsApi";

interface BranchContextType {
  activeBranch: string;
  setActiveBranch: (branch: string) => void;
  branchesList: string[];
  refreshBranches: () => Promise<void>;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [activeBranch, setActiveBranchState] = useState<string>(() => {
    return localStorage.getItem("cmk_active_branch") || "CMK Main";
  });

  const [branchesList, setBranchesList] = useState<string[]>(["CMK Main", "CMK Branch 1", "CMK Branch 2"]);

  const refreshBranches = useCallback(async () => {
    try {
      const res = await getSettingsItems("branches");
      if (res.items && res.items.length > 0) {
        const fetched = res.items.map((i) => i.value);
        setBranchesList(fetched);
        // If current active branch is not in the list, default to first item
        if (fetched.length > 0 && (!activeBranch || !fetched.includes(activeBranch))) {
          setActiveBranchState(fetched[0]);
          localStorage.setItem("cmk_active_branch", fetched[0]);
        }
      }
    } catch (err) {
      console.warn("Failed to load branches in BranchContext:", err);
    }
  }, [activeBranch]);

  useEffect(() => {
    refreshBranches();
    const handleUpdate = () => {
      refreshBranches();
    };
    window.addEventListener("cmk:branches-updated", handleUpdate);
    return () => window.removeEventListener("cmk:branches-updated", handleUpdate);
  }, [refreshBranches]);

  const setActiveBranch = (branch: string) => {
    setActiveBranchState(branch);
    localStorage.setItem("cmk_active_branch", branch);
    window.dispatchEvent(new CustomEvent("cmk:branch-changed", { detail: branch }));
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
