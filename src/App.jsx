import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import OtpPage from "./pages/OtpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import MapPage from "./pages/MapPage";
import ChatPage from "./pages/ChatPage";
import LikePage from "./pages/LikePage";
import ProfilPage from "./pages/ProfilPage";
import DetailPage from "./pages/DetailPage"; 
import ChatDetailPage from "./pages/ChatDetailPage";

// --- IMPORT HALAMAN SETTINGS (Pastikan file-filenya sudah ada) ---
import AccountSettings from "./pages/AccountSettings";
import NotificationPage from "./pages/NotificationPage";
import PrivacyPage from "./pages/PrivacyPage";
import FaqPage from "./pages/FaqPage";

function HomePage() {
  return <div>Home</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth System */}
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/verify-otp" element={<OtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Main App */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/detail/:id" element={<DetailPage />} />

        {/* Bottom Nav Pages */}
        <Route path="/map" element={<MapPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:id" element={<ChatDetailPage />} />
        <Route path="/like" element={<LikePage />} />
        <Route path="/profil" element={<ProfilPage />} />

        {/* Settings Sub-Pages */}
        <Route path="/settings/account" element={<AccountSettings />} />
        <Route path="/settings/notifications" element={<NotificationPage />} />
        <Route path="/settings/privacy" element={<PrivacyPage />} />
        <Route path="/settings/faq" element={<FaqPage />} />

      </Routes>
    </BrowserRouter>
  );
}