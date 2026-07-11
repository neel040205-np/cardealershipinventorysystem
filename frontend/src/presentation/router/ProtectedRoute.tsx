import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@adapters/context/auth-context";

interface ProtectedRouteProps {
  allowedRoles?: Array<"ADMIN" | "MANAGER" | "SALES_REP">;
}

// Protected Route Guard restricting access based on session status and user roles
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  // Query session claims and roles from the global Auth Context
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
