import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// AUTH
import AuthPage from "./pages/AuthPage";
import OtpPage from "./pages/OtpPage";

// USER
import DashboardPage from "./pages/user/DashboardPage";
import DetailPage from "./pages/user/DetailPage";
import MapPage from "./pages/user/MapPage";
import ChatPage from "./pages/user/ChatPage";
import ChatDetailPage from "./pages/ChatDetailPage";
import LikePage from "./pages/user/LikePage";
import ProfilPage from "./pages/ProfilPage";

// OWNER
import DashboardOwnerPage from "./pages/owner/DashboardOwnerPage";

// SETTINGS
import AccountSettings from "./pages/AccountSettings";
import NotificationPage from "./pages/NotificationPage";
import PrivacyPage from "./pages/PrivacyPage";
import FaqPage from "./pages/FaqPage";

// PROTECTED ROUTE
import ProtectedRoute from "./components/ProtectedRoute";


// 🔥 TAMBAHKAN INI
function QueryRedirect() {
  const params = new URLSearchParams(window.location.search);
  const page = params.get("page");

  if (page === "reset-password") {
    return (
      <Navigate
        to={`/reset-password${window.location.search}`}
        replace
      />
    );
  }

  if (page === "forgot-password") {
    return <Navigate to="/forgot-password" replace />;
  }

  return null;
}


export default function App() {
  return (
    <HashRouter>

      {/* 🔥 TAMBAHKAN INI */}
      <QueryRedirect />

      <Routes>

        {/* ROOT */}
        <Route path="/" element={<Navigate to="/auth" replace />} />

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

        {/* OWNER */}
        <Route
          path="/owner/dashboard"
          element={
            <ProtectedRoute role="pemilik">
              <DashboardOwnerPage />
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

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/auth" replace />} />

      </Routes>
    </HashRouter>
  );
}