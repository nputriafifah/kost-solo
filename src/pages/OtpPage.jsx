import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import OtpForm from '../components/auth/OtpForm';
import { verifyOtp, resendOtp, loginOwner, requestOwnerOtp } from '../services/authService';

const OtpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ✅ Ambil data dari navigation state
  const role = location.state?.role;
  const email = location.state?.email;
  const phone = location.state?.phone;

  // ✅ Proteksi halaman (biar ga bisa akses langsung)
  if (!role || (!email && !phone)) {
    return <Navigate to="/auth" replace />;
  }

  // ================= VERIFY OTP =================
  const handleVerify = async (otpCode) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // ✅ PENTING: pastikan OTP string & bersih
      const cleanOtp = String(otpCode).trim();

      if (cleanOtp.length !== 6) {
        throw new Error("Kode OTP harus 6 digit");
      }

      if (role === "pemilik") {
  await loginOwner({
    phone: phone,
    otp: cleanOtp
  });
} else {
        // USER (pakai email)
        await verifyOtp({
          email: email,
          otp: cleanOtp
        });
      }

      setSuccess('Verifikasi berhasil! Mengalihkan ke halaman login...');

      setTimeout(() => {
  if (role === "pemilik") {
    navigate('/owner/dashboard'); // ✅ owner route
  } else {
    navigate('/auth'); // ✅ user balik login
  }
}, 1500);

    } catch (err) {
      setError(err.message || 'Kode OTP salah atau telah kadaluarsa.');
    } finally {
      setIsLoading(false);
    }
  };

  // ================= RESEND OTP =================
  const handleResend = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (role === "pemilik") {
  await requestOwnerOtp({ phone: phone });
} else {
  await resendOtp({ email: email });
}

      setSuccess('Kode OTP baru berhasil dikirim.');
    } catch (err) {
      setError(err.message || 'Gagal mengirim ulang OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <OtpForm 
        email={email || phone} // UI tetap sama
        onSubmit={handleVerify}
        onResend={handleResend}
        isLoading={isLoading}
        errorMsg={error}
        successMsg={success}
      />
    </AuthLayout>
  );
};

export default OtpPage;