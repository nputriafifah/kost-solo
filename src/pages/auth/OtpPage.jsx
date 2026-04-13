import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import OtpForm from "../../components/auth/OtpForm";
import { requestOwnerOtp } from "../../services/authService";

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

  // 🔒 kalau akses langsung tanpa data
  if (!role || !phone) {
    return <Navigate to="/auth" replace />;
  }

  // ================= VERIFY OTP =================
  const handleVerify = async (otp) => {
    try {
      setLoading(true);
      setError("");

      const cleanOtp = String(otp).trim();

      if (cleanOtp.length !== 6) {
        throw new Error("OTP harus 6 digit");
      }

      if (role === "pemilik") {
        const res = await fetch("http://localhost:3000/auth/owner/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    phone: formatPhone(phone),
    otp: cleanOtp, // <- tetap kirim OTP
  }),
});

const text = await res.text();

console.log("RAW RESPONSE:", text); // 🔍 debug

let data;
try {
  data = JSON.parse(text);
} catch {
  data = { message: text };
}

if (!res.ok) {
  throw new Error(data.message || "OTP salah");
}

        console.log("LOGIN RESPONSE:", res);

        // 🔥 AMAN UNTUK SEMUA FORMAT BACKEND
        const token =
  data?.token ||
  data?.data?.token;

const user =
  data?.user ||
  data?.data?.user;

        console.log("TOKEN:", token);
        console.log("USER:", user);

        if (!token) {
          throw new Error("Token tidak ditemukan dari backend");
        }

        // ✅ simpan ke localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      }

      setSuccess("Login berhasil...");

      // redirect
      setTimeout(() => {
        navigate("/owner/dashboard");
      }, 1000);

    } catch (err) {
      setError(err.message || "OTP salah");
    } finally {
      setLoading(false);
    }
  };

  // ================= RESEND OTP =================
  const handleResend = async () => {
  console.log("RESEND DIKLIK"); // 👈 tambah ini
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await requestOwnerOtp({
        phone: formatPhone(phone),
      });

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
  identifier={phone}
  type="phone"
  onSubmit={handleVerify}
  onResend={handleResend}
  isLoading={loading}
  errorMsg={error}
  successMsg={success}
/>
    </AuthLayout>
  );
}