import { createBrowserRouter, Navigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import LoginPage from "@/modules/auth/pages/LoginPage";
import RegistrationPage from "@/modules/registration/pages/RegistrationPage";
import PatientSearchPage from "@/modules/registration/pages/PatientSearchPage";
import ReportsPage from "@/modules/reports/pages/ReportsPage";
import BillingPage from "@/modules/billing/pages/BillingPage";
import AtdPage from "@/modules/atd/pages/AtdPage";
import WardsPage from "@/modules/wards/pages/WardsPage";
import SettingsPage from "@/modules/settings/pages/SettingsPage";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/registration/demographics" replace />,
          },
          {
            path: "registration",
            children: [
              {
                index: true,
                element: <Navigate to="demographics" replace />,
              },
              {
                path: "demographics",
                element: <RegistrationPage />,
              },
              {
                path: "search",
                element: <PatientSearchPage />,
              }
            ]
          },
          {
            path: "reports",
            element: <ReportsPage />,
          },
          {
            path: "billing",
            element: <BillingPage />,
          },
          {
            path: "atd",
            element: <AtdPage />,
          },
          {
            path: "wards",
            element: <WardsPage />,
          },
          {
            path: "settings",
            element: <SettingsPage />,
          },
        ]
      }
    ],
  },
]);

export default router;
