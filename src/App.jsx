import { Routes, Route, Navigate } from "react-router-dom";
import { useDarkMode } from "./hooks/useDarkMode";
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
import AllListingsPage from "./pages/user/AllListingsPage";

// OWNER
import DashboardOwnerPage from "./pages/owner/DashboardOwnerPage";
import CreateListingPage from "./pages/owner/CreateListingPage";
import EditListingPage from "./pages/owner/EditListingPage";
import DetailListingPage from "./pages/owner/DetailListingPage";
import PropertiPage from "./pages/owner/PropertiPage";
import PromosiPage from "./pages/owner/PromosiPage";
import SurveyPage from "./pages/owner/SurveyPage";
import StatistikPage from "./pages/owner/Statisctic";
import PendapatanPage from "./pages/owner/PendapatanPage";
import OwnerProfilPage from "./pages/owner/ProfilPage";
import OwnerChatPage from "./pages/owner/OwnerChatPage";


// ADMIN
// ✅ Yang baru
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminListings from "./pages/admin/AdminListings";
import AdminReports from "./pages/admin/AdminReports";
import AdminMinatLeads from "./pages/admin/AdminMinatLeads";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminProfile from "./pages/admin/AdminProfile";

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
  useDarkMode();
  return (
    <>
      <QueryRedirect />

      <Routes>
        {/* ROOT TANPA LOGIN */}
        <Route path="/" element={<DashboardPage />} />

        {/* AUTH */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/verify-otp" element={<OtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* USER */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/semua" element={<AllListingsPage />} />
        {/* DETAIL BOLEH TANPA LOGIN */}
        <Route path="/detail/:id" element={<DetailPage />} />

        {/* HARUS LOGIN */}
        <Route path="/map" element={<MapPage />} />

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

        {/* SEARCH BOLEH TANPA LOGIN */}
        <Route path="/search" element={<SearchPage />} />

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

        <Route
          path="/owner/chat"
          element={
            <ProtectedRoute role="pemilik">
              <OwnerChatPage />
            </ProtectedRoute>
          }
        />

        {/* ✅ TAMBAHKAN DI SINI, sebelum fallback */}
        <Route
          path="/owner/properti"
          element={
            <ProtectedRoute role="pemilik">
              <PropertiPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/promosi"
          element={
            <ProtectedRoute role="pemilik">
              <PromosiPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/survey"
          element={
            <ProtectedRoute role="pemilik">
              <SurveyPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/statistik"
          element={
            <ProtectedRoute role="pemilik">
              <StatistikPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/pendapatan"
          element={
            <ProtectedRoute role="pemilik">
              <PendapatanPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/profil"
          element={
            <ProtectedRoute role="pemilik">
              <OwnerProfilPage />
            </ProtectedRoute>
          }
        />

        {/* FALLBACK */}
        {/* ADMIN */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="listings" element={<AdminListings />} />
          <Route path="minat-leads" element={<AdminMinatLeads />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="profil" element={<AdminProfile />} />
        </Route>

        {/* FALLBACK — satu saja, paling bawah */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
