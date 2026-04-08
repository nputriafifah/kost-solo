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

  const formatPhone = (phone) =>
    phone?.startsWith("0") ? "+62" + phone.slice(1) : phone;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (!isLogin) {
        if (!form.name) throw new Error("Nama lengkap wajib diisi");

        if (role === "pemilik") {
          if (!form.phone) throw new Error("Nomor HP wajib diisi");
        } else {
          if (!form.email) throw new Error("Email wajib diisi");
          if (!form.password) throw new Error("Password wajib diisi");

          if (form.password !== form.confirmPassword) {
            throw new Error("Konfirmasi password tidak cocok");
          }
        }

        if (!agreed) {
          throw new Error("Anda harus menyetujui syarat dan ketentuan");
        }
      }

      setLoading(true);

      const action = getAuthAction(role, isLogin);
      const formattedPhone = formatPhone(form.phone);

      let payload;

      // ================= LOGIN =================
      if (isLogin) {
        if (!form.phone) throw new Error("Nomor HP wajib diisi");

        // OWNER LOGIN → OTP ONLY
        if (role === "pemilik") {
          await fetch("http://localhost:3000/auth/owner/request-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: formattedPhone }),
          });

          setSuccess("OTP berhasil dikirim...");

          setTimeout(() => {
            navigate("/verify-otp", {
              state: { role: "pemilik", phone: formattedPhone },
            });
          }, 800);

          return;
        }

        payload = { phone: formattedPhone };
      }

      // ================= REGISTER =================
      else {
        if (role === "pencari") {
          payload = {
            name: form.name,
            email: form.email,
            password: form.password,
          };
        }

        if (role === "pemilik") {
          payload = {
            name: form.name.trim(),
            phone: formattedPhone,
            kostName: "Kost " + form.name,
            location: "Indonesia",
            contact: formattedPhone,
          };
        }
      }

      const result = await action(payload);

      // ================= LOGIN SUCCESS =================
      if (isLogin) {
        const token = result.token || result.data?.token;
        const userData = result.user || result.data?.user;

        if (token) localStorage.setItem("token", token);
        if (userData) localStorage.setItem("user", JSON.stringify(userData));

        setSuccess("Login berhasil! Mengalihkan...");

        setTimeout(() => {
          navigate(role === "pemilik" ? "/owner/dashboard" : "/dashboard");
        }, 800);
      }

      // ================= REGISTER SUCCESS =================
      else {
        if (role === "pemilik") {
          setSuccess("Registrasi berhasil! Mengirim OTP...");

          await fetch("http://localhost:3000/auth/owner/request-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: formattedPhone }),
          });

          setTimeout(() => {
            navigate("/verify-otp", {
              state: { role: "pemilik", phone: formattedPhone },
            });
          }, 900);
        } else {
          setSuccess("Registrasi berhasil, silakan verifikasi OTP...");

          setTimeout(() => {
            navigate("/verify-otp", {
              state: { role: "pencari", email: form.email },
            });
          }, 1000);
        }
      }
    } catch (err) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-blue-600 mb-7"
      >
        <ChevronLeft size={16} /> Ganti Peran
      </button>

      <div className="flex items-center gap-2.5 mb-1">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-50 border border-blue-100 rounded-xl">
          <Search size={15} className="text-blue-600" />
        </div>
        <span className="text-[11px] font-bold text-blue-500 uppercase tracking-widest">
          {role === "pencari"
            ? "Pencari Kost"
            : role === "pemilik"
            ? "Pemilik Kost"
            : "Admin"}{" "}
          — Kost Solo
        </span>
      </div>

      <h1 className="text-2xl font-extrabold text-slate-800">
        {isLogin ? "Masuk ke Akun" : "Buat Akun Baru"}
      </h1>

      <p className="mb-6 text-sm text-slate-400">
        {isLogin
          ? "Selamat datang kembali"
          : "Gratis selamanya daftar dalam 1 menit"}
      </p>

      {/* SWITCH */}
      <div className="flex p-1 mb-6 bg-slate-100 rounded-xl">
        <button
          type="button"
          onClick={() => setIsLogin(true)}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg ${
            isLogin ? "bg-white shadow-sm" : "text-slate-400"
          }`}
        >
          Masuk
        </button>
        <button
          type="button"
          onClick={() => setIsLogin(false)}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg ${
            !isLogin ? "bg-white shadow-sm" : "text-slate-400"
          }`}
        >
          Daftar
        </button>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        {!isLogin && (
          <Field label="Nama Lengkap" icon={<User size={15} />}>
            <input
              name="name"
              className={inputClass}
              value={form.name}
              onChange={handleChange}
            />
          </Field>
        )}

        {/* EMAIL (PENCARI ONLY REGISTER) */}
        {role === "pencari" && !isLogin && (
          <Field label="Email" icon={<Mail size={15} />}>
            <input
              name="email"
              className={inputClass}
              value={form.email}
              onChange={handleChange}
            />
          </Field>
        )}

        {/* PHONE */}
        {role === "pemilik" || (!isLogin && role === "pencari") ? (
          <Field label="Nomor HP" icon={<Phone size={15} />}>
            <input
              name="phone"
              className={inputClass}
              value={form.phone}
              onChange={handleChange}
            />
          </Field>
        ) : null}

        {/* PASSWORD (PENCARI ONLY) */}
        {role === "pencari" && (
          <Field label="Password" icon={<Lock size={15} />}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className={inputClass}
              value={form.password}
              onChange={handleChange}
            />
          </Field>
        )}

        {/* CONFIRM PASSWORD */}
        {role === "pencari" && !isLogin && (
          <Field label="Konfirmasi Password" icon={<Lock size={15} />}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              className={inputClass}
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </Field>
        )}

        {/* AGREEMENT */}
        {!isLogin && (
          <div
            className="flex gap-3 p-3 border rounded-xl cursor-pointer"
            onClick={() => setAgreed(!agreed)}
          >
            <CheckCircle2
              className={agreed ? "text-blue-600" : "text-slate-300"}
            />
            <p className="text-xs text-slate-500">
              Saya menyetujui syarat & ketentuan
            </p>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <button className="w-full py-3 text-white bg-blue-600 rounded-xl">
          {loading ? "Memproses..." : isLogin ? "Masuk" : "Daftar"}
        </button>

        {isLogin && role === "pencari" && (
  <p className="pt-1 text-xs text-center text-slate-400">
    <span
      onClick={() => navigate("/forgot-password")}
      className="font-medium text-blue-500 cursor-pointer hover:underline"
    >
      Lupa password?
    </span>
  </p>
)}

      </form>

      <div className="flex items-center justify-center gap-2 pt-4 mt-6">
        <Shield size={12} />
        <p className="text-xs text-slate-400">Data aman & terenkripsi</p>
      </div>
    </div>
  );
}