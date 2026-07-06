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
  X,
} from "lucide-react";
import Field from "../ui/Field";
import { getAuthAction } from "../../utils/authAction";
import { getApiBase } from "../../config/apiBase";

export default function AuthForm({ role, isLogin, setIsLogin, onBack }) {
  const navigate = useNavigate();

  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [ownerStep, setOwnerStep] = useState(1);

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
    "w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm text-slate-700 placeholder-slate-400";

  const formatPhone = (phone) =>
    phone?.startsWith("0") ? "+62" + phone.slice(1) : phone;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSwitchMode = (loginMode) => {
    setIsLogin(loginMode);
    setOwnerStep(1);
    setError("");
    setSuccess("");
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
          if (!form.email) throw new Error("Email wajib diisi");
          if (!form.phone) throw new Error("Nomor HP wajib diisi");
          if (!form.kostName) throw new Error("Nama kost wajib diisi");
          if (!form.location) throw new Error("Lokasi wajib diisi");
          if (!form.contact) throw new Error("Kontak wajib diisi");
        } else {
          if (!form.email) throw new Error("Email wajib diisi");
          if (!form.password) throw new Error("Password wajib diisi");
          if (form.password !== form.confirmPassword)
            throw new Error("Password tidak sama");
        }

        if (!agreed) throw new Error("Setujui syarat & ketentuan");
      }

      setLoading(true);

      // ── LOGIN PEMILIK (OTP) ──────────────────────────────────────────────────
      if (isLogin && role === "pemilik") {
        const res = await fetch(`${getApiBase()}/auth/owner/request-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: formattedPhone }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.detail || json.error || "Gagal mendaftar");
        setSuccess("OTP dikirim...");
        setTimeout(() => navigate("/verify-otp", { state: { role: "pemilik", phone: formattedPhone } }), 800);
        return;
      }

      // ── LOGIN PENCARI (+ deteksi admin otomatis) ─────────────────────────────
      if (isLogin) {
        // Coba login sebagai admin dulu lewat /auth/admin/login
        try {
          const adminRes = await fetch(`${getApiBase()}/auth/admin/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: form.email, password: form.password }),
          });
          const adminJson = await adminRes.json();

          if (adminRes.ok) {
            const token = adminJson.token;
            const user = adminJson.user;
            if (token) localStorage.setItem("token", token);
            if (user) localStorage.setItem("user", JSON.stringify(user));
            setSuccess("Login sebagai admin berhasil...");
            setTimeout(() => navigate("/admin/dashboard"), 800);
            return;
          }
        } catch {
          // Bukan admin atau network error → lanjut login biasa
        }

        // Login biasa sebagai pencari
        const action = getAuthAction(role, true);
        const result = await action({ email: form.email, password: form.password });
        const token = result.token || result?.data?.token;
        const user = result.user || result?.data?.user;
        if (token) localStorage.setItem("token", token);
        if (user) localStorage.setItem("user", JSON.stringify(user));
        setSuccess("Login berhasil...");
        setTimeout(() => navigate("/dashboard"), 800);
        return;
      }

      // ── REGISTER PENCARI ─────────────────────────────────────────────────────
      if (role === "pencari") {
        const res = await fetch(`${getApiBase()}/auth/user/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.detail || json.error || "Gagal mendaftar");
        setSuccess("OTP dikirim ke email...");
        setTimeout(() => navigate("/verify-otp", { state: { role: "pencari", email: form.email } }), 800);
        return;
      }

      // ── REGISTER PEMILIK ─────────────────────────────────────────────────────
      if (role === "pemilik") {
        const res = await fetch(`${getApiBase()}/auth/owner/register`, {
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
        });
        const json = await res.json();
        if (!res.ok) {
          const detail = json.details?.fieldErrors
            ? Object.values(json.details.fieldErrors).flat().join(", ")
            : null;
          throw new Error(detail || json.detail || json.error || "Gagal mendaftar");
        }

        // BE: login owner pakai OTP WhatsApp (request-otp), bukan OTP email saat register
        const otpRes = await fetch(`${getApiBase()}/auth/owner/request-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: formattedPhone }),
        });
        const otpJson = await otpRes.json();
        if (!otpRes.ok) {
          throw new Error(
            otpJson.error ||
              "Akun berhasil dibuat, tapi OTP WhatsApp gagal dikirim. Silakan masuk dan minta OTP ulang."
          );
        }

        setSuccess("Akun dibuat. OTP dikirim ke WhatsApp...");
        setTimeout(
          () => navigate("/verify-otp", { state: { role: "pemilik", phone: formattedPhone } }),
          800
        );
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
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-indigo-600 mb-7"
      >
        <ChevronLeft size={16} />
        Ganti Peran
      </button>

      {/* HEADER */}
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-8 h-8 flex items-center justify-center bg-indigo-50 border border-indigo-100 rounded-xl">
          <Search size={15} className="text-indigo-600" />
        </div>
        <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest">
          {role === "pencari" ? "Pencari Kost" : role === "pemilik" ? "Pemilik Kost" : "Admin"} — Atap
        </span>
      </div>

      <h1 className="text-2xl font-extrabold text-slate-800">
        {isLogin ? "Masuk ke Akun" : "Buat Akun Baru"}
      </h1>
      <p className="mb-6 text-sm text-slate-400">
        {isLogin ? "Selamat datang kembali" : "Gratis selamanya daftar dalam 1 menit"}
      </p>

      {/* SWITCH */}
      <div className="flex p-1 mb-6 bg-slate-100 rounded-xl">
        <button
          type="button"
          onClick={() => handleSwitchMode(true)}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg ${isLogin ? "bg-white shadow-sm" : "text-slate-400"}`}
        >
          Masuk
        </button>
        <button
          type="button"
          onClick={() => handleSwitchMode(false)}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg ${!isLogin ? "bg-white shadow-sm" : "text-slate-400"}`}
        >
          Daftar
        </button>
      </div>

      {/* FORM */}
      <form className="space-y-3" onSubmit={handleSubmit}>

        {/* NAMA */}
        {!isLogin && (
          <Field label="Nama Lengkap" icon={<User size={15} />}>
            <input name="name" className={inputClass} value={form.name} onChange={handleChange} />
          </Field>
        )}

        {/* USER EMAIL */}
        {role === "pencari" && (
          <Field label="Email" icon={<Mail size={15} />}>
            <input name="email" className={inputClass} value={form.email} onChange={handleChange} />
          </Field>
        )}

        {/* OWNER LOGIN */}
        {role === "pemilik" && isLogin && (
          <Field label="Nomor HP" icon={<Phone size={15} />}>
            <input name="phone" className={inputClass} value={form.phone} onChange={handleChange} />
          </Field>
        )}

        {/* OWNER REGISTER STEP 1 */}
        {role === "pemilik" && !isLogin && ownerStep === 1 && (
          <>
            <Field label="Email" icon={<Mail size={15} />}>
              <input name="email" className={inputClass} value={form.email} onChange={handleChange} />
            </Field>
            <Field label="Nomor HP" icon={<Phone size={15} />}>
              <input name="phone" className={inputClass} value={form.phone} onChange={handleChange} />
            </Field>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="button"
              onClick={() => {
                if (!form.name) return setError("Nama wajib diisi");
                if (!form.email) return setError("Email wajib diisi");
                if (!form.phone) return setError("Nomor HP wajib diisi");
                setError("");
                setOwnerStep(2);
              }}
              className="w-full py-3 text-white bg-indigo-600 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              Lanjut
            </button>
          </>
        )}

        {/* OWNER REGISTER STEP 2 */}
        {role === "pemilik" && !isLogin && ownerStep === 2 && (
          <>
            <Field label="Nama Kost">
              <input name="kostName" className={inputClass} value={form.kostName} onChange={handleChange} />
            </Field>
            <Field label="Lokasi">
              <input name="location" className={inputClass} value={form.location} onChange={handleChange} />
            </Field>
            <Field label="Kontak">
              <input name="contact" className={inputClass} value={form.contact} onChange={handleChange} />
            </Field>
            <button
              type="button"
              onClick={() => setOwnerStep(1)}
              className="text-sm text-indigo-600 hover:underline"
            >
              ← Kembali
            </button>
          </>
        )}

        {/* USER PASSWORD */}
        {role === "pencari" && (
          <Field label="Password" icon={<Lock size={15} />}>
            <input type="password" name="password" className={inputClass} value={form.password} onChange={handleChange} />
          </Field>
        )}

        {/* USER CONFIRM PASSWORD */}
        {role === "pencari" && !isLogin && (
          <Field label="Konfirmasi Password" icon={<Lock size={15} />}>
            <input type="password" name="confirmPassword" className={inputClass} value={form.confirmPassword} onChange={handleChange} />
          </Field>
        )}

        {/* ERROR */}
        {error && !(role === "pemilik" && !isLogin && ownerStep === 1) && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {/* SUCCESS */}
        {success && <p className="text-sm text-green-600">{success}</p>}

        {/* TERMS */}
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
                className="text-indigo-600 font-semibold hover:underline"
              >
                syarat dan ketentuan
              </button>
            </p>
          </div>
        )}

        {/* SUBMIT */}
        {!(role === "pemilik" && !isLogin && ownerStep === 1) && (
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white bg-indigo-600 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {loading ? "Memproses..." : isLogin ? "Masuk" : "Daftar"}
          </button>
        )}

        {/* FOOTER */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <Shield size={12} className="text-slate-400" />
          <p className="text-xs text-slate-400">Data aman & terenkripsi</p>
        </div>
      </form>

      {/* TERMS MODAL */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">Syarat & Ketentuan</h2>
              <button
                type="button"
                onClick={() => setShowTerms(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X size={16} />
              </button>
            </div>
            <div className="text-sm text-slate-600 space-y-3 max-h-72 overflow-y-auto mb-4 pr-1">
              <p className="text-slate-500">
                Dengan membuat akun dan menggunakan Atap, kamu menyetujui ketentuan berikut.
              </p>

              <div>
                <p className="font-semibold text-slate-700">1. Akun &amp; Data</p>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  <li>Data yang kamu daftarkan harus benar, akurat, dan milikmu sendiri.</li>
                  <li>Dilarang membuat akun palsu, menyamar sebagai orang/pihak lain, atau menyalahgunakan akun orang lain.</li>
                  <li>Kamu bertanggung jawab menjaga kerahasiaan kata sandi dan seluruh aktivitas pada akunmu.</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-slate-700">2. Penggunaan Layanan</p>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  <li>Atap adalah platform yang mempertemukan pencari kost dengan pemilik kost.</li>
                  <li>Dilarang menggunakan layanan untuk tujuan melanggar hukum, menipu, atau merugikan pihak lain.</li>
                  <li>Dilarang mengunggah konten yang menyesatkan, melanggar hak orang lain, atau mengandung SARA/pornografi.</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-slate-700">3. Listing &amp; Transaksi</p>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  <li>Pemilik wajib memastikan informasi kost (foto, harga, fasilitas, ketersediaan) benar dan terkini.</li>
                  <li>Kesepakatan sewa-menyewa terjadi langsung antara pencari dan pemilik. Atap tidak menjadi pihak dalam perjanjian tersebut.</li>
                  <li>Atap tidak bertanggung jawab atas kerugian yang timbul dari transaksi atau komunikasi antar pengguna.</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-slate-700">4. Privasi</p>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  <li>Data pribadimu kami kelola sesuai Kebijakan Privasi.</li>
                  <li>Kami dapat menggunakan email/kontakmu untuk verifikasi akun dan keperluan layanan.</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-slate-700">5. Perubahan Ketentuan</p>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  <li>Atap dapat menonaktifkan akun yang melanggar ketentuan ini.</li>
                  <li>Syarat &amp; ketentuan dapat berubah sewaktu-waktu, dan perubahan berlaku sejak dipublikasikan.</li>
                </ul>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowTerms(false)}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}