import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  // If user is not logged in, kick them out to the login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the children (Outlet handles nested routes)
  return <Outlet />;
}
