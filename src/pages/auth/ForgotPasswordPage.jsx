import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, KeyRound, RefreshCw } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import { forgotPassword } from '../../services/authService';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Silakan masukkan alamat email Anda.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await forgotPassword({ email });
      setSuccess('Jika email terdaftar, instruksi reset password telah dikirim ke email Anda.');
      
      // Opsional: Kosongkan input setelah berhasil
      setEmail('');
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="fade-in">
        {/* Icon / Ilustrasi Kecil */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center justify-center w-16 h-16 border-4 border-indigo-50 bg-indigo-100 rounded-full">
            <KeyRound size={32} className="text-indigo-600" />
          </div>
        </div>

        <h2 className="text-2xl font-extrabold text-center text-slate-800 mb-2" style={{ fontFamily: "Outfit" }}>
          Lupa Password?
        </h2>
        
        <p className="text-sm text-center text-slate-500 mb-8 px-4">
          Masukkan email yang terdaftar. Kami akan mengirimkan instruksi untuk mengatur ulang kata sandi Anda.
        </p>

        {/* Notifikasi Error / Success */}
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
          {/* Input Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail size={18} className="text-slate-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email Anda"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm text-slate-700"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full bg-indigo-600 hover:bg-indigo-700 py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <RefreshCw size={16} className="animate-spin" /> Mengirim...
              </>
            ) : (
              <>Kirim Instruksi <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/auth')}
            className="text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-2 mx-auto transition-colors"
          >
            <ArrowLeft size={16} /> Kembali ke Login
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}