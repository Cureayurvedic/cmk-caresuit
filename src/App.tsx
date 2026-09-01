import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "@/store";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider } from "@/components/ui/toast-notification";
import { AuthProvider } from "@/contexts/AuthContext";
import { BranchProvider } from "@/contexts/BranchContext";
import router from "@/router";

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ToastProvider>
          <BranchProvider>
            <TooltipProvider>
              <RouterProvider router={router} />
            </TooltipProvider>
          </BranchProvider>
        </ToastProvider>
      </AuthProvider>
    </Provider>
  );
}
