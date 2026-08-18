import { RouterProvider } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider } from "@/components/ui/toast-notification";
import { AuthProvider } from "@/contexts/AuthContext";
import router from "@/router";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <TooltipProvider>
          <RouterProvider router={router} />
        </TooltipProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
