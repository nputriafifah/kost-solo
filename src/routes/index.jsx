import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// layouts
import MainLayout from "../layouts/MainLayout";
import OwnerLayout from "../layouts/OwnerLayout";
import AuthLayout from "../layouts/AuthLayout";

// pages
import AuthPage from "../pages/auth/AuthPage";
import OtpPage from "../pages/auth/OtpPage";

import DashboardPage from "../pages/user/DashboardPage";
import DetailPage from "../pages/user/DetailPage";

import DashboardOwnerPage from "../pages/owner/DashboardOwnerPage";
import CreateListingPage from "../pages/owner/CreateListingPage";
import EditListingPage from "../pages/owner/EditListingPage";

import AdminPage from "../pages/admin/AdminPage";

// protected
import ProtectedRoute from "../components/common/ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= AUTH ================= */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/otp" element={<OtpPage />} />
        </Route>

        {/* ================= USER ================= */}
        <Route
          element={
            <ProtectedRoute role="user">
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/detail/:id" element={<DetailPage />} />
        </Route>

        {/* ================= OWNER ================= */}
        <Route
          element={
            <ProtectedRoute role="owner">
              <OwnerLayout />
            </ProtectedRoute>
          }
        >
          {/* DASHBOARD */}
          <Route path="/owner" element={<DashboardOwnerPage />} />

          {/* LISTING */}
          <Route path="/owner/create" element={<CreateListingPage />} />
          <Route path="/owner/edit/:id" element={<EditListingPage />} />
          <Route path="/owner/listing/:id" element={<DetailListingPage />} />

          {/* nanti bisa nambah */}
          {/* <Route path="/owner/peminat" element={<PeminatPage />} /> */}
          {/* <Route path="/owner/promosi" element={<PromosiPage />} /> */}
        </Route>

        {/* ================= ADMIN ================= */}
        <Route
          element={
            <ProtectedRoute role="admin">
              <AdminPage />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}