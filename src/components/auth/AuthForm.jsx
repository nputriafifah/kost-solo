import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Mail,
  Lock,
  Phone,
  User,
  ChevronLeft,
  Shield,
} from "lucide-react";
import Field from "../ui/Field";
import { getAuthAction } from "../../utils/authAction";

export default function AuthForm({
  role,
  isLogin,
  setIsLogin,
  onBack,
}) {
  const navigate = useNavigate();

  const [showPassword] = useState(false);
  const [showConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
     kostName: "",
  location: "",
  contact: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputClass =
    "w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm text-slate-700 placeholder-slate-400";

  const formatPhone = (phone) =>
    phone?.startsWith("0") ? "+62" + phone.slice(1) : phone;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const formattedPhone = formatPhone(form.phone);

      if (!isLogin) {
        if (!form.name) throw new Error("Nama wajib diisi");
        if (role === "pemilik") {
  if (!form.phone) throw new Error("Nomor HP wajib diisi");
  if (!form.email) throw new Error("Email wajib diisi");
  if (!form.kostName) throw new Error("Nama kost wajib diisi");
  if (!form.location) throw new Error("Lokasi wajib diisi");
  if (!form.contact) throw new Error("Kontak wajib diisi");
}else {
          if (!form.email) throw new Error("Email wajib diisi");
          if (!form.password) throw new Error("Password wajib diisi");
          if (form.password !== form.confirmPassword)
            throw new Error("Password tidak sama");
        }
        if (!agreed)
          throw new Error("Setujui syarat & ketentuan");
      }

      setLoading(true);

      // LOGIN OWNER (OTP)
      if (isLogin && role === "pemilik") {
        const res = await fetch(
          "http://localhost:3000/auth/owner/request-otp",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: formattedPhone }),
          }
        );

        const json = await res.json();
        if (!res.ok) throw new Error(json.error);

        setSuccess("OTP dikirim...");
        setTimeout(() => {
          navigate("/verify-otp", {
            state: { role: "pemilik", phone: formattedPhone },
          });
        }, 800);

        return;
      }

      // LOGIN USER
      if (isLogin) {
        const action = getAuthAction(role, true);
        const result = await action({
          email: form.email,
          password: form.password,
        });

        const token = result.token || result?.data?.token;
        const user = result.user || result?.data?.user;

        if (token) localStorage.setItem("token", token);
        if (user) localStorage.setItem("user", JSON.stringify(user));

        setSuccess("Login berhasil...");
        setTimeout(() => navigate("/dashboard"), 800);
        return;
      }

      // REGISTER USER
      if (role === "pencari") {
        const res = await fetch(
          "http://localhost:3000/auth/user/register",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: form.name,
              email: form.email,
              password: form.password,
            }),
          }
        );

        const json = await res.json();
        if (!res.ok) throw new Error(json.error);

        setSuccess("OTP dikirim ke email...");
        setTimeout(() => {
          navigate("/verify-otp", {
            state: { role: "pencari", email: form.email },
          });
        }, 800);

        return;
      }

      // REGISTER OWNER
      if (role === "pemilik") {
  const res = await fetch(
    "http://localhost:3000/auth/owner/register",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        phone: formattedPhone,
        kostName: form.kostName,
        location: form.location,
        contact: form.contact,
      }),
    }
  );

  const json = await res.json();
  if (!res.ok) throw new Error(json.error);

  setSuccess("OTP dikirim...");
  setTimeout(() => {
    navigate("/verify-otp", {
      state: { role: "pemilik", phone: formattedPhone },
    });
  }, 800);

  return;
}
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fade-in">
      {/* BACK */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-blue-600 mb-7"
      >
        <ChevronLeft size={16} /> Ganti Peran
      </button>

      {/* HEADER */}
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-8 h-8 flex items-center justify-center bg-blue-50 border border-blue-100 rounded-xl">
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

      {/* FORM */}
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

        {role === "pencari" && (
          <Field label="Email" icon={<Mail size={15} />}>
            <input
              name="email"
              className={inputClass}
              value={form.email}
              onChange={handleChange}
            />
          </Field>
        )}

        {role === "pemilik" && isLogin && (
  <Field label="Nomor HP" icon={<Phone size={15} />}>
    <input
      name="phone"
      className={inputClass}
      value={form.phone}
      onChange={handleChange}
    />
  </Field>
)}

{role === "pemilik" && !isLogin && (
  <>
    <Field label="Email" icon={<Mail size={15} />}>
      <input
        name="email"
        className={inputClass}
        value={form.email}
        onChange={handleChange}
      />
    </Field>

    <Field label="Nomor HP" icon={<Phone size={15} />}>
      <input
        name="phone"
        className={inputClass}
        value={form.phone}
        onChange={handleChange}
      />
    </Field>

    <Field label="Nama Kost">
      <input
        name="kostName"
        className={inputClass}
        value={form.kostName}
        onChange={handleChange}
      />
    </Field>

    <Field label="Lokasi">
      <input
        name="location"
        className={inputClass}
        value={form.location}
        onChange={handleChange}
      />
    </Field>

    <Field label="Kontak">
      <input
        name="contact"
        className={inputClass}
        value={form.contact}
        onChange={handleChange}
      />
    </Field>
  </>
)}

        {role === "pencari" && (
          <Field label="Password" icon={<Lock size={15} />}>
            <input
              type="password"
              name="password"
              className={inputClass}
              value={form.password}
              onChange={handleChange}
            />
          </Field>
        )}

        {role === "pencari" && !isLogin && (
          <Field label="Konfirmasi Password" icon={<Lock size={15} />}>
            <input
              type="password"
              name="confirmPassword"
              className={inputClass}
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </Field>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-white bg-blue-600 rounded-xl font-semibold"
        >
          {loading ? "Memproses..." : isLogin ? "Masuk" : "Daftar"}
        </button>

        {!isLogin && (
          <div className="flex items-start gap-2 text-xs text-slate-500">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1"
            />
            <p>
              Saya menyetujui{" "}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="text-blue-600 font-semibold hover:underline"
              >
                syarat dan ketentuan
              </button>
            </p>
          </div>
        )}
      </form>

      {/* MODAL */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-md rounded-xl p-5">
            <h2 className="text-lg font-bold mb-2">Syarat & Ketentuan</h2>
            <div className="text-sm text-slate-600 space-y-2 max-h-60 overflow-y-auto">
              <p>1. Data harus benar.</p>
              <p>2. Tidak boleh fake account.</p>
              <p>3. Tanggung jawab user.</p>
              <p>4. Bisa berubah sewaktu-waktu.</p>
            </div>
            <button
              onClick={() => setShowTerms(false)}
              className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="flex items-center justify-center gap-2 pt-4 mt-6">
        <Shield size={12} />
        <p className="text-xs text-slate-400">Data aman & terenkripsi</p>
      </div>
    </div>
  );
}