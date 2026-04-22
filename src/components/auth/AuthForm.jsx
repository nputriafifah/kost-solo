import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Mail, Lock, Phone, User, ChevronLeft, Shield } from "lucide-react";
import Field from "../ui/Field";
import { getAuthAction } from "../../utils/authAction";

export default function AuthForm({ role, isLogin, setIsLogin, onBack }) {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputClass = "w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm text-slate-700 placeholder-slate-400";
  const formatPhone = (phone) => phone?.startsWith("0") ? "+62" + phone.slice(1) : phone;
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const formattedPhone = formatPhone(form.phone);

      if (!isLogin) {
        if (!form.name) throw new Error("Nama lengkap wajib diisi");
        if (role === "pemilik") {
          if (!form.phone) throw new Error("Nomor HP wajib diisi");
        } else {
          if (!form.email) throw new Error("Email wajib diisi");
          if (!form.password) throw new Error("Password wajib diisi");
          if (form.password !== form.confirmPassword) throw new Error("Konfirmasi password tidak cocok");
        }
        if (!agreed) throw new Error("Anda harus menyetujui syarat dan ketentuan");
      }

      setLoading(true);

      // ================= LOGIN =================
      if (isLogin) {
        if (role === "pemilik") {
          await fetch("http://localhost:3000/auth/owner/request-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: formattedPhone }),
          });
          setSuccess("OTP berhasil dikirim...");
          setTimeout(() => navigate("/verify-otp", { state: { role: "pemilik", phone: formattedPhone } }), 800);
          return;
        }

        const action = getAuthAction(role, true);
        const result = await action({ email: form.email, password: form.password });
        const token = result.token || result.data?.token;
        const userData = result.user || result.data?.user;
        if (token) localStorage.setItem("token", token);
        if (userData) localStorage.setItem("user", JSON.stringify(userData));
        setSuccess("Login berhasil! Mengalihkan...");
        setTimeout(() => navigate("/dashboard"), 800);
        return;
      }

      // ================= REGISTER =================
      if (role === "pencari") {
        const res = await fetch("http://localhost:3000/auth/user/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || json.message || "Registrasi gagal");
        setSuccess("Registrasi berhasil! OTP dikirim ke email...");
        setTimeout(() => navigate("/verify-otp", { state: { role: "pencari", email: form.email } }), 800);
      }

      if (role === "pemilik") {
        const res = await fetch("http://localhost:3000/auth/owner/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, phone: formattedPhone }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || json.message || "Registrasi gagal");
        setSuccess("Registrasi berhasil! OTP dikirim...");
        setTimeout(() => navigate("/verify-otp", { state: { role: "pemilik", phone: formattedPhone } }), 800);
      }

    } catch (err) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fade-in">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-blue-600 mb-7">
        <ChevronLeft size={16} /> Ganti Peran
      </button>

      <div className="flex items-center gap-2.5 mb-1">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-50 border border-blue-100 rounded-xl">
          <Search size={15} className="text-blue-600" />
        </div>
        <span className="text-[11px] font-bold text-blue-500 uppercase tracking-widest">
          {role === "pencari" ? "Pencari Kost" : role === "pemilik" ? "Pemilik Kost" : "Admin"} — Kost Solo
        </span>
      </div>

      <h1 className="text-2xl font-extrabold text-slate-800">{isLogin ? "Masuk ke Akun" : "Buat Akun Baru"}</h1>
      <p className="mb-6 text-sm text-slate-400">{isLogin ? "Selamat datang kembali" : "Gratis selamanya daftar dalam 1 menit"}</p>

      <div className="flex p-1 mb-6 bg-slate-100 rounded-xl">
        <button type="button" onClick={() => setIsLogin(true)} className={`flex-1 py-2.5 text-sm font-semibold rounded-lg ${isLogin ? "bg-white shadow-sm" : "text-slate-400"}`}>Masuk</button>
        <button type="button" onClick={() => setIsLogin(false)} className={`flex-1 py-2.5 text-sm font-semibold rounded-lg ${!isLogin ? "bg-white shadow-sm" : "text-slate-400"}`}>Daftar</button>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        {!isLogin && (
          <Field label="Nama Lengkap" icon={<User size={15} />}>
            <input name="name" className={inputClass} value={form.name} onChange={handleChange} />
          </Field>
        )}

        {role === "pencari" && (
          <Field label="Email" icon={<Mail size={15} />}>
            <input name="email" className={inputClass} value={form.email} onChange={handleChange} />
          </Field>
        )}

        {role === "pemilik" && (
          <Field label="Nomor HP" icon={<Phone size={15} />}>
            <input name="phone" className={inputClass} value={form.phone} onChange={handleChange} />
          </Field>
        )}

        {role === "pencari" && (
          <Field label="Password" icon={<Lock size={15} />}>
            <input type={showPassword ? "text" : "password"} name="password" className={inputClass} value={form.password} onChange={handleChange} />
          </Field>
        )}

        {role === "pencari" && !isLogin && (
          <Field label="Konfirmasi Password" icon={<Lock size={15} />}>
            <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" className={inputClass} value={form.confirmPassword} onChange={handleChange} />
          </Field>
        )}

        {!isLogin && (
          <div className="flex items-start gap-3 p-3 border rounded-xl">
            <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)} className="mt-1 accent-blue-600 cursor-pointer scale-110" />
            <p className="text-xs text-slate-500">
              Saya menyetujui{" "}
              <span onClick={() => setShowTerms(true)} className="text-blue-600 cursor-pointer hover:underline font-medium">syarat & ketentuan</span>
            </p>
          </div>
        )}

        {isLogin && role === "pencari" && (
          <div className="text-right -mt-1">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Lupa password?
            </button>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <button className="w-full py-3 text-white bg-blue-600 rounded-xl font-semibold">
          {loading ? "Memproses..." : isLogin ? "Masuk" : "Daftar"}
        </button>
      </form>

      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowTerms(false)}>
          <div className="bg-white w-[90%] max-w-md rounded-2xl p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-3">Syarat & Ketentuan</h2>
            <div className="text-sm text-slate-600 space-y-2 max-h-60 overflow-y-auto">
              <p>1. Data harus valid dan benar.</p>
              <p>2. Dilarang untuk aktivitas ilegal.</p>
              <p>3. Data pengguna dijaga dengan aman.</p>
              <p>4. Pengguna bertanggung jawab atas akun.</p>
            </div>
            <button onClick={() => setShowTerms(false)} className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-xl font-semibold">Tutup</button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 pt-4 mt-6">
        <Shield size={12} />
        <p className="text-xs text-slate-400">Data aman & terenkripsi</p>
      </div>
    </div>
  );
}