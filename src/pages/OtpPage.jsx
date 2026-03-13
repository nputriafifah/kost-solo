import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import OtpForm from '../components/auth/OtpForm';
import { verifyOtp, resendOtp } from '../services/authService';

const OtpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const email = location.state?.email;

  if (!email) {
    return <Navigate to="/register" replace />;
  }

  const handleVerify = async (otpCode) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await verifyOtp({ email: email, otp: otpCode });
      
      // 1. Ubah pesannya agar lebih pas
      setSuccess('Verifikasi berhasil! Mengalihkan ke halaman login...');
      
      setTimeout(() => {
        // 2. Ubah tujuannya dari '/dashboard' menjadi rute login kamu
        navigate('/auth'); 
      }, 1500);

    } catch (err) {
      setError(err.message || 'Kode OTP salah atau telah kadaluarsa. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // PERBAIKAN: Kirim data sebagai object { email }
      await resendOtp({ email: email });
      setSuccess('Kode OTP baru telah dikirim ke email Anda.');
    } catch (err) {
      setError(err.message || 'Gagal mengirim ulang kode OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <OtpForm 
        email={email} 
        onSubmit={handleVerify} 
        onResend={handleResend}
        isLoading={isLoading}
        errorMsg={error}       // Props baru untuk pesan error
        successMsg={success}   // Props baru untuk pesan sukses
      />
    </AuthLayout>
  );
};

export default OtpPage;