// src/App.jsx
import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import CounsellorDashboard from "./pages/Counsellor/CounsellorDashboard";

import ProtectedRoute from "./components/protectedRoute";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import BrandSettings from "./pages/Brands/BrandSettings";
import AdminReports from "./pages/Reports/AdminReports";
import Settings from "./pages/Settings";
import CounsellorLeads from "./pages/Counsellor/CounsellorLeads";
import ConvertedLeads from "./pages/Counsellor/ConvertedLeads";
import ErrorBoundary from "./components/ErrorBoundary";
import ImportLeads from "./pages/Counsellor/ImportLeads";

function AppLayout({ children }) {
const [collapsed, setCollapsed] = useState(() => {
  return localStorage.getItem("sidebar_collapsed") === "true";
});
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="main-content">
        <Header
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <main className="page-content">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* PUBLIC ROUTE */}
      <Route path="/login" element={<Login />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AppLayout>
              <AdminDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/leads"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AppLayout>
              <CounsellorLeads />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/converted"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AppLayout>
              <ConvertedLeads />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/brands"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AppLayout>
              <BrandSettings />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AppLayout>
              <AdminReports />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AppLayout>
              <Settings />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* COUNSELLOR ROUTES */}
      <Route
        path="/counsellor"
        element={
          <ProtectedRoute allowedRoles={["counsellor"]}>
            <AppLayout>
              <CounsellorDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/counsellor/leads"
        element={
          <ProtectedRoute allowedRoles={["counsellor"]}>
            <AppLayout>
              <CounsellorLeads />
            </AppLayout>
          </ProtectedRoute>
        }
      />
     
      <Route
        path="/counsellor/converted"
        element={
          <ProtectedRoute allowedRoles={["counsellor","admin"]}>
            <AppLayout>
              <ConvertedLeads />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/counsellor/import" element={<ProtectedRoute allowedRoles={["counsellor"]}>
        <AppLayout>
          <ImportLeads/>
        </AppLayout>
      </ProtectedRoute>}
      />

      {/* DEFAULT REDIRECT */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* NOT FOUND */}
      <Route
        path="*"
        element={<div style={{ padding: 20 }}>Page Not Found</div>}
      />
    </Routes>
  );
}
