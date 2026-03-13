import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import OtpPage from "./pages/OtpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage"; // <--- Import Dashboard yang baru

function HomePage() {
  return <div>Home</div>;
}

// Hapus fungsi DashboardPage lama yang cuma return <div>Dashboard</div>

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/verify-otp" element={<OtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} /> 
        <Route path="/reset-password" element={<ResetPasswordPage />} /> 
        
        <Route path="/home" element={<HomePage />} />
        
        {/* Sekarang rute ini akan menampilkan Dashboard keren yang baru kita buat */}
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}