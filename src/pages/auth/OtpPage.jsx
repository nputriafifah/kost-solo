import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import OtpForm from "../../components/auth/OtpForm";
import { requestOwnerOtp } from "../../services/authService";
import { getApiBase } from "../../config/apiBase";

function formatPhone(phone) {
  return phone.startsWith("0") ? "+62" + phone.slice(1) : phone;
}

export default function OtpPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const role = location.state?.role;
  const phone = location.state?.phone;
  const email = location.state?.email;

  if (!role || (!phone && !email)) {
    return <Navigate to="/auth" replace />;
  }

  const handleVerify = async (otp) => {
    try {
      setLoading(true);
      setError("");

      const cleanOtp = String(otp).trim();
      if (cleanOtp.length !== 6) throw new Error("OTP harus 6 digit");

      if (role === "pencari") {
        const res = await fetch(`${getApiBase()}/auth/user/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp: cleanOtp }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.message || "OTP salah");
        setSuccess("Email terverifikasi! Silakan login...");
        setTimeout(() => navigate("/auth"), 1000);
        return;
      }

      if (role === "pemilik") {
        const res = await fetch(`${getApiBase()}/auth/owner/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: formatPhone(phone), otp: cleanOtp }),
        });

        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text };
        }

        if (!res.ok) throw new Error(data.error || data.message || "OTP salah");

        const token = data?.token || data?.data?.token;
        const user = data?.user || data?.data?.user;

        if (!token) throw new Error("Token tidak ditemukan dari backend");

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        setSuccess("Login berhasil...");
        setTimeout(() => navigate("/owner/dashboard"), 1000);
        return;
      }

    } catch (err) {
      setError(err.message || "OTP salah");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (role === "pencari") {
        const res = await fetch(`${getApiBase()}/auth/user/resend-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.message || "Gagal kirim OTP");
      }

      if (role === "pemilik") {
        await requestOwnerOtp({ phone: formatPhone(phone) });
      }

      setSuccess("OTP baru berhasil dikirim");
    } catch (err) {
      setError(err.message || "Gagal kirim OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <OtpForm
        identifier={role === "pencari" ? email : phone}
        type={role === "pencari" ? "email" : "phone"}
        onSubmit={handleVerify}
        onResend={handleResend}
        isLoading={loading}
        errorMsg={error}
        successMsg={success}
      />
    </AuthLayout>
  );
}