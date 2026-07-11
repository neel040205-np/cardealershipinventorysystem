import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@presentation/layouts/MainLayout";
import { AuthLayout } from "@presentation/layouts/AuthLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "@presentation/pages/auth/LoginPage";

// Dummy Page Stubs to ensure successful compilation without concrete pages implementations
const DummyRegister = () => <div className="p-4">Register Page (Not Implemented)</div>;
const DummyVehicles = () => <div className="p-4">Vehicles Catalog (Not Implemented)</div>;
const DummySearch = () => <div className="p-4">Search Catalog (Not Implemented)</div>;
const DummyAdmin = () => <div className="p-4">Admin Inventory Operations (Not Implemented)</div>;
const DummyUnauthorized = () => <div className="p-4 text-red-600 font-bold">Unauthorized Access</div>;

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Authentication routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<DummyRegister />} />
        </Route>

        {/* Protected Dashboard/App routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/vehicles" element={<DummyVehicles />} />
            <Route path="/search" element={<DummySearch />} />
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
