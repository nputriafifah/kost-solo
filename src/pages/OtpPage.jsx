import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import OtpForm from "../components/auth/OtpForm";
import { loginOwner, resendOtp, requestOwnerOtp } from "../services/authService";

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

  if (!role || !phone) {
    return <Navigate to="/auth" replace />;
  }

  // 🔥 VERIFY OTP
  const handleVerify = async (otp) => {
    try {
      setLoading(true);
      setError("");

      const cleanOtp = String(otp).trim();

      if (cleanOtp.length !== 6) {
        throw new Error("OTP harus 6 digit");
      }

      if (role === "pemilik") {
        const res = await loginOwner({
          phone: formatPhone(phone),
          otp: cleanOtp,
        });

        const token = res?.token || res?.data?.token;
        if (token) localStorage.setItem("token", token);

        const user = res?.user || res?.data?.user;
        if (user) localStorage.setItem("user", JSON.stringify(user));
      }

      setSuccess("Login berhasil...");

      setTimeout(() => {
        navigate("/owner/dashboard");
      }, 1000);
    } catch (err) {
      setError(err.message || "OTP salah");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 RESEND OTP
  const handleResend = async () => {
    try {
      setLoading(true);

      await requestOwnerOtp({
        phone: formatPhone(phone),
      });

      setSuccess("OTP baru dikirim");
    } catch (err) {
      setError(err.message || "Gagal kirim OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <OtpForm
        email={phone}
        onSubmit={handleVerify}
        onResend={handleResend}
        isLoading={loading}
        errorMsg={error}
        successMsg={success}
      />
    </AuthLayout>
  );
}