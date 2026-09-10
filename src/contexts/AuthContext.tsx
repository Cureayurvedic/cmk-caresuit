import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  role: 'Admin' | 'Doctor' | 'Nurse' | 'Receptionist' | null;
  login: (username: string, role: 'Admin' | 'Doctor' | 'Nurse' | 'Receptionist') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Try to load auth state from local storage so it persists across reloads
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem("cmk_auth");
    return saved === "true";
  });

  const [role, setRole] = useState<'Admin' | 'Doctor' | 'Nurse' | 'Receptionist' | null>(() => {
    const savedRole = localStorage.getItem("cmk_role");
    return (savedRole as 'Admin' | 'Doctor' | 'Nurse' | 'Receptionist') || null;
  });

  useEffect(() => {
    localStorage.setItem("cmk_auth", isAuthenticated.toString());
    if (role) {
      localStorage.setItem("cmk_role", role);
    } else {
      localStorage.removeItem("cmk_role");
    }
  }, [isAuthenticated, role]);

  const login = (username: string, selectedRole: 'Admin' | 'Doctor' | 'Nurse' | 'Receptionist') => {
    console.log(`Logged in as: ${username} (Role: ${selectedRole})`);
    setIsAuthenticated(true);
    setRole(selectedRole);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRole(null);
    localStorage.removeItem("cmk_auth_token");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useIsAdmin() {
  const context = useAuth();
  return context.role === 'Admin';
}
