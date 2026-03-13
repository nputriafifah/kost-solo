import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  User,
  CheckCircle2,
  ChevronLeft,
  ArrowRight,
  Shield,
} from "lucide-react";
import Field from "./Field";
import { getAuthAction } from "../../utils/authAction";

export default function AuthForm({ role, isLogin, setIsLogin, onBack }) {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputClass =
    "w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm text-slate-700 placeholder-slate-400";

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      // 1. Validasi Input
      if (!form.email || !form.password) {
        throw new Error("Email dan password wajib diisi");
      }

      if (!isLogin) {
        if (!form.name) throw new Error("Nama lengkap wajib diisi");
        if (!form.phone) throw new Error("Nomor HP wajib diisi");
        if (form.password !== form.confirmPassword) {
          throw new Error("Konfirmasi password tidak cocok");
        }
        if (!agreed) {
          throw new Error("Anda harus menyetujui syarat dan ketentuan");
        }
      }

      setLoading(true);
      const action = getAuthAction(role, isLogin);

      // 2. Siapkan Payload
      let payload;
      if (isLogin) {
        payload = {
          email: form.email,
          password: form.password,
        };
      } else {
        payload = {
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        };
      }

      // 3. Eksekusi API
      const result = await action(payload);

      // 4. Tangani Hasil (Simpan ke LocalStorage)
      if (result) {
        // Simpan Token
        const token = result.token || result.accessToken || result.data?.token;
        if (token) {
          localStorage.setItem("token", token);
        }

        // Ambil data user secara lengkap (mengatasi perbedaan struktur response API)
        const userData = result.user || result.data?.user || result;
        if (userData) {
          localStorage.setItem("user", JSON.stringify(userData));
          console.log("Auth Success. Data user tersimpan:", userData);
        }

        if (isLogin) {
          setSuccess("Login berhasil! Mengalihkan...");
          setTimeout(() => {
            navigate("/dashboard");
          }, 800);
        } else {
          setSuccess(result.message || "Registrasi berhasil, silakan verifikasi OTP...");
          setTimeout(() => {
            navigate("/verify-otp", { state: { email: form.email } });
          }, 1200);
        }
      }
    } catch (err) {
      setError(err.message || "Terjadi kesalahan koneksi backend");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-blue-600 mb-7 transition-colors"
      >
        <ChevronLeft size={16} /> Ganti Peran
      </button>

      <div className="flex items-center gap-2.5 mb-1">
        <div className="flex items-center justify-center w-8 h-8 border border-blue-100 bg-blue-50 rounded-xl">
          <Search size={15} className="text-blue-600" />
        </div>
        <span className="text-[11px] font-bold text-blue-500 uppercase tracking-widest">
          {role === "pencari" ? "Pencari Kost" : role === "pemilik" ? "Pemilik Kost" : "Admin"} — Kost Solo
        </span>
      </div>

      <h1 className="mt-1 mb-1 text-2xl font-extrabold text-slate-800">
        {isLogin ? "Masuk ke Akun" : "Buat Akun Baru"}
      </h1>

      <p className="mb-6 text-sm text-slate-400">
        {isLogin ? "Selamat datang kembali" : "Gratis selamanya daftar dalam 1 menit"}
      </p>

      <div className="flex p-1 mb-6 bg-slate-100 rounded-xl">
        <button
          type="button"
          onClick={() => setIsLogin(true)}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            isLogin ? "bg-white shadow-sm" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Masuk
        </button>
        <button
          type="button"
          onClick={() => setIsLogin(false)}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            !isLogin ? "bg-white shadow-sm" : "text-slate-400 hover:text-slate-600"
          }`}
          disabled={role !== "pencari"}
        >
          Daftar Gratis
        </button>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        {!isLogin && (
          <Field label="Nama Lengkap" icon={<User size={15} className="text-slate-400" />}>
            <input
              name="name"
              type="text"
              placeholder="Budi Santoso"
              className={inputClass}
              value={form.name}
              onChange={handleChange}
            />
          </Field>
        )}

        <Field label="Alamat Email" icon={<Mail size={15} className="text-slate-400" />}>
          <input
            name="email"
            type="email"
            placeholder="email@kamu.com"
            className={inputClass}
            value={form.email}
            onChange={handleChange}
          />
        </Field>

        {!isLogin && (
          <Field label="Nomor HP" icon={<Phone size={15} className="text-slate-400" />}>
            <input
              name="phone"
              type="tel"
              placeholder="08xx-xxxx-xxxx"
              className={inputClass}
              value={form.phone}
              onChange={handleChange}
            />
          </Field>
        )}

        <Field
          label="Password"
          icon={<Lock size={15} className="text-slate-400" />}
          rightEl={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute transition-colors -translate-y-1/2 right-3 top-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        >
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Minimal 8 karakter"
            className={inputClass + " pr-10"}
            value={form.password}
            onChange={handleChange}
          />
        </Field>

        {!isLogin && (
          <Field
            label="Konfirmasi Password"
            icon={<Lock size={15} className="text-slate-400" />}
            rightEl={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute transition-colors -translate-y-1/2 right-3 top-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          >
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Ketik ulang password"
              className={inputClass + " pr-10"}
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </Field>
        )}

        {!isLogin && (
          <div
            className={`flex items-start gap-3 p-3.5 rounded-xl cursor-pointer border transition-all ${
              agreed ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200"
            }`}
            onClick={() => setAgreed(!agreed)}
          >
            <div
              className={`w-5 h-5 min-w-[20px] rounded-md border-2 flex items-center justify-center mt-0.5 transition-all ${
                agreed ? "bg-blue-600 border-blue-600" : "bg-white border-slate-300"
              }`}
            >
              {agreed && <CheckCircle2 size={13} className="text-white" strokeWidth={3} />}
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              Saya menyetujui syarat dan ketentuan Kost Solo.
            </p>
          </div>
        )}

        {error && (
          <div className="px-4 py-3 text-sm text-red-600 border border-red-200 rounded-xl bg-red-50">
            {error}
          </div>
        )}

        {success && (
          <div className="px-4 py-3 text-sm text-green-700 border border-green-200 rounded-xl bg-green-50">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 mt-1 disabled:opacity-70 transition-colors"
        >
          {loading ? "Memproses..." : isLogin ? "Masuk ke Akun" : "Daftar Sekarang"}
          <ArrowRight size={16} />
        </button>

        {isLogin && (
          <p className="pt-1 text-xs text-center text-slate-400">
            <span 
              onClick={() => navigate('/forgot-password')}
              className="font-medium text-blue-500 cursor-pointer hover:underline"
            >
              Lupa password?
            </span>
          </p>
        )}
      </form>

      <div className="flex items-center justify-center gap-2 pt-4 mt-6 border-t border-slate-100">
        <Shield size={12} className="text-slate-400" />
        <p className="text-[11px] text-slate-400 text-center">
          Data Anda aman & terenkripsi
        </p>
      </div>
    </div>
  );
}