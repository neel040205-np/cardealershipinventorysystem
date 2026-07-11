import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@presentation/layouts/MainLayout";
import { AuthLayout } from "@presentation/layouts/AuthLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "@presentation/pages/auth/LoginPage";
import { RegisterPage } from "@presentation/pages/auth/RegisterPage";
import { VehiclesPage } from "@presentation/pages/vehicles/VehiclesPage";
import { SearchPage } from "@presentation/pages/vehicles/SearchPage";

// Dummy Page Stubs to ensure successful compilation without concrete pages implementations
const DummyAdmin = () => <div className="p-4">Admin Inventory Operations (Not Implemented)</div>;
const DummyUnauthorized = () => <div className="p-4 text-red-600 font-bold">Unauthorized Access</div>;

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Authentication routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected Dashboard/App routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/unauthorized" element={<DummyUnauthorized />} />

            {/* Admin-only restricted views */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route path="/admin" element={<DummyAdmin />} />
            </Route>
          </Route>
        </Route>

        {/* Root Fallbacks */}
        <Route path="/" element={<Navigate to="/vehicles" replace />} />
        <Route path="*" element={<Navigate to="/vehicles" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
