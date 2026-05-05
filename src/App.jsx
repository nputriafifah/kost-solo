import { Routes, Route, Navigate } from "react-router-dom";

// AUTH
import AuthPage from "./pages/auth/AuthPage";
import OtpPage from "./pages/auth/OtpPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// USER
import DashboardPage from "./pages/user/DashboardPage";
import DetailPage from "./pages/user/DetailPage";
import MapPage from "./pages/user/MapPage";
import ChatPage from "./pages/user/ChatPage";
import ChatDetailPage from "./pages/user/ChatDetailPage";
import LikePage from "./pages/user/LikePage";
import ProfilPage from "./pages/user/ProfilPage";
import AccountSettings from "./pages/user/AccountSettingsPage";
import NotificationPage from "./pages/user/NotificationPage";
import FaqPage from "./pages/user/FaqPage";
import PrivacyPage from "./pages/user/PrivacyPage";
import SearchPage from "./pages/user/SearchPage";

// OWNER
import DashboardOwnerPage from "./pages/owner/DashboardOwnerPage";
import CreateListingPage from "./pages/owner/CreateListingPage";
import EditListingPage from "./pages/owner/EditListingPage";
import DetailListingPage from "./pages/owner/DetailListingPage";

// ADMIN
import AdminPage from "./pages/admin/AdminPage";

// COMPONENT
import ProtectedRoute from "./components/common/ProtectedRoute";

function QueryRedirect() {
  const params = new URLSearchParams(window.location.search);
  const page = params.get("page");

  if (page === "reset-password") {
    return (
      <Navigate to={`/reset-password${window.location.search}`} replace />
    );
  }

  if (page === "forgot-password") {
    return <Navigate to="/forgot-password" replace />;
  }

  return null;
}

export default function App() {
  return (
    <>
      <QueryRedirect />

      <Routes>
        {/* ROOT (UBAH DI SINI) */}
        <Route
          path="/"
          element={
            <ProtectedRoute role="pencari">
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* AUTH */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/verify-otp" element={<OtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* USER */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="pencari">
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/detail/:id"
          element={
            <ProtectedRoute role="pencari">
              <DetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/map"
          element={
            <ProtectedRoute role="pencari">
              <MapPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute role="pencari">
              <ChatPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat/:id"
          element={
            <ProtectedRoute role="pencari">
              <ChatDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/like"
          element={
            <ProtectedRoute role="pencari">
              <LikePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profil"
          element={
            <ProtectedRoute role="pencari">
              <ProfilPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/search"
          element={
            <ProtectedRoute role="pencari">
              <SearchPage />
            </ProtectedRoute>
          }
        />

        {/* OWNER */}
        <Route
          path="/owner/dashboard"
          element={
            <ProtectedRoute role="pemilik">
              <DashboardOwnerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/create"
          element={
            <ProtectedRoute role="pemilik">
              <CreateListingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/edit/:id"
          element={
            <ProtectedRoute role="pemilik">
              <EditListingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/listing/:id"
          element={
            <ProtectedRoute role="pemilik">
              <DetailListingPage />
            </ProtectedRoute>
          }
        />

        {/* SETTINGS */}
        <Route
          path="/settings/account"
          element={
            <ProtectedRoute>
              <AccountSettings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings/notifications"
          element={
            <ProtectedRoute>
              <NotificationPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings/privacy"
          element={
            <ProtectedRoute>
              <PrivacyPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings/faq"
          element={
            <ProtectedRoute>
              <FaqPage />
            </ProtectedRoute>
          }
        />

        {/* ADMIN */}
        <Route path="/admin" element={<AdminPage />} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}