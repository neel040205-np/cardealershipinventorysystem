import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@adapters/context/auth-context";
import { Car } from "lucide-react";

// Auth Layout wrapper centering login/signup credentials panels
export const AuthLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Redirect users who are already logged in away from authentication screens
  if (isAuthenticated) {
    return <Navigate to="/vehicles" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-950 transition-colors duration-200">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl border border-gray-200 dark:border-gray-800 dark:bg-gray-900 shadow-xl transition-all">
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 text-white shadow-lg">
            <Car className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight">Motors CRM</h2>
          <p className="mt-2 text-center text-sm text-gray-500">Dealership Inventory Dashboard</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};
