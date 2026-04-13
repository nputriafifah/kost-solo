import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowRight, RefreshCw, KeyRound, Eye, EyeOff, Mail } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import { resetPassword } from '../../services/authService';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  // useSearchParams digunakan untuk mengambil data ?token=...&email=... dari URL
  const [searchParams] = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Saat halaman dimuat, otomatis ambil token dan email dari URL jika ada
  useEffect(() => {
    const urlToken = searchParams.get('token');
    const urlEmail = searchParams.get('email');
    
    if (urlToken) setToken(urlToken);
    if (urlEmail) setEmail(urlEmail);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 1. Validasi Input di Frontend
    if (!email || !token) {
      setError('Link reset password tidak valid atau tidak lengkap. Pastikan Anda membuka link dari email Anda.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password baru minimal harus 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok dengan password baru.');
      return;
    }

    // 2. Kirim ke Backend
    setIsLoading(true);
    try {
      await resetPassword({ 
        email: email, 
        token: token, 
        newPassword: newPassword 
      });
      
      setSuccess('Password berhasil diubah! Mengalihkan ke halaman login...');
      
      setTimeout(() => {
        navigate('/auth'); 
      }, 2000);

    } catch (err) {
      setError(err.message || 'Gagal mengubah password. Token mungkin sudah kadaluarsa.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="fade-in">
        <div className="flex justify-center mb-6">
          <div className="flex items-center justify-center w-16 h-16 border-4 border-blue-50 bg-blue-100 rounded-full">
            <KeyRound size={32} className="text-blue-600" />
          </div>
        </div>

        <h2 className="text-2xl font-extrabold text-center text-slate-800 mb-2" style={{ fontFamily: "Plus Jakarta Sans" }}>
          Buat Password Baru
        </h2>
        
        <p className="text-sm text-center text-slate-500 mb-8 px-4">
          Silakan masukkan password baru Anda. Pastikan password mudah diingat dan aman.
        </p>

        {error && (
          <div className="mb-6 px-4 py-3 text-sm text-red-600 border border-red-200 rounded-xl bg-red-50 text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 px-4 py-3 text-sm text-green-700 border border-green-200 rounded-xl bg-green-50 text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Input Email (Hanya muncul jika di URL tidak ada email) */}
          {!searchParams.get('email') && (
             <div>
               <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                   <Mail size={18} className="text-slate-400" />
                 </div>
                 <input
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="Masukkan email Anda"
                   className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-all text-sm"
                   required
                 />
               </div>
             </div>
          )}

          {/* Input Password Baru */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password Baru</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock size={18} className="text-slate-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm text-slate-700"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Konfirmasi Password Baru */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Konfirmasi Password Baru</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock size={18} className="text-slate-400" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm text-slate-700"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !newPassword || !confirmPassword}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <RefreshCw size={16} className="animate-spin" /> Menyimpan...
              </>
            ) : (
              <>Simpan Password Baru <ArrowRight size={16} /></>
            )}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}