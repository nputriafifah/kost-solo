import { useState } from "react";
import { Home, Search, Mail, Lock, Eye, EyeOff, Phone, User, MapPin, Star, CheckCircle2, ChevronLeft, ArrowRight, Building2, Shield } from "lucide-react";

const KostAuth = () => {
  const [view, setView] = useState("role");
  const [role, setRole] = useState("pencari");
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const inputClass =
    "w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm text-slate-700 placeholder-slate-400";
  const labelClass = "block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        h1, h2, h3, h4 { font-family: 'Plus Jakarta Sans', sans-serif; }
        .gradient-bg {
          background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 30%, #2563eb 60%, #3b82f6 100%);
        }
        .card-glass {
          background: rgba(255,255,255,0.07);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.15);
        }
        .stat-pill {
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          backdrop-filter: blur(4px);
        }
        .tab-active {
          background: white;
          color: #1d4ed8;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08), 0 0 0 1px rgba(59,130,246,0.1);
        }
        .role-btn:hover {
          border-color: #3b82f6;
          background: #eff6ff;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(59,130,246,0.12);
        }
        .submit-btn {
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          box-shadow: 0 4px 16px rgba(37,99,235,0.35);
          transition: all 0.2s;
        }
        .submit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(37,99,235,0.45);
        }
        .fade-in { animation: fadeIn 0.35s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 flex items-center justify-center p-4">
        <div className="flex flex-col md:flex-row w-full max-w-[960px] min-h-[640px] bg-white rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/10">

          {/* LEFT PANEL */}
          <div className="md:w-[420px] gradient-bg p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5"></div>
            <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-white/5"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/[0.03]"></div>

            {/* Logo */}
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center border border-white/25">
                  <Home size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg leading-none" style={{fontFamily:'Plus Jakarta Sans'}}>Kost Solo</p>
                  <p className="text-blue-200 text-[10px] font-medium uppercase tracking-widest">Platform #1 Surakarta</p>
                </div>
              </div>

              <h2 className="text-white text-3xl font-extrabold leading-snug mb-3" style={{fontFamily:'Plus Jakarta Sans'}}>
                Temukan Kost<br />Impian Anda
              </h2>
              <p className="text-blue-200 text-sm leading-relaxed mb-6">
                Ribuan pilihan kost terbaik di Solo, proses mudah, tanpa biaya tambahan.
              </p>

              <div className="card-glass rounded-2xl px-4 py-3 flex items-center gap-2 w-fit">
                <MapPin size={14} className="text-blue-300" />
                <span className="text-xs text-blue-100 font-medium">Jl. Slamet Riyadi · UNS · ISI · UMS</span>
              </div>
            </div>

            {/* Illustration */}
            <div className="relative z-10 flex justify-center my-6">
              <KostIllustration />
            </div>

            {/* Stats */}
            <div className="relative z-10 grid grid-cols-2 gap-2.5">
              {[
                { icon: <Building2 size={14}/>, label: "8.000+ Kost" },
                { icon: <MapPin size={14}/>, label: "Seluruh Solo" },
                { icon: <Star size={14}/>, label: "4.9 Rating" },
                { icon: <CheckCircle2 size={14}/>, label: "100% Gratis" },
              ].map((s) => (
                <div key={s.label} className="stat-pill rounded-xl px-3 py-2.5 flex items-center gap-2">
                  <span className="text-blue-200">{s.icon}</span>
                  <span className="text-white text-xs font-semibold">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
            {view === "role" ? (
              <div className="fade-in">
                <span className="inline-flex items-center gap-1.5 text-[11px] bg-blue-50 text-blue-600 font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider border border-blue-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Selamat Datang
                </span>
                <h1 className="text-3xl font-extrabold text-slate-800 mt-4 mb-2 leading-tight" style={{fontFamily:'Plus Jakarta Sans'}}>
                  Saya seorang...
                </h1>
                <p className="text-sm text-slate-400 mb-8">Pilih peran Anda agar Kost Solo dapat memberikan pengalaman terbaik untuk kebutuhan anda.</p>
                <div className="space-y-3">
                  <RoleButton
  title="Pencari Kost"
  desc="Temukan kost ideal di Surakarta"
  icon={<Search size={22} className="text-blue-600" />}
  onClick={() => { 
    setRole("pencari"); 
    setIsLogin(true);      // ⬅ tambahkan ini
    setView("form"); 
  }}
/>

<RoleButton
  title="Pemilik Kost"
  desc="Kelola & pasarkan properti Anda"
  icon={<Home size={22} className="text-blue-600" />}
  onClick={() => { 
    setRole("pemilik"); 
    setIsLogin(true);      // ⬅ tambahkan ini
    setView("form"); 
  }}
/>
                </div>
                
              </div>
            ) : (
              <div className="fade-in">
                <button
                  onClick={() => setView("role")}
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-blue-600 mb-7 transition-colors"
                >
                  <ChevronLeft size={16} /> Ganti Peran
                </button>

                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                    <Search size={15} className="text-blue-600" />
                  </div>
                  <span className="text-[11px] font-bold text-blue-500 uppercase tracking-widest">
                    {role === "pencari" ? "Pencari Kost" : "Pemilik Kost"} — Kost Solo
                  </span>
                </div>
                <h1 className="text-2xl font-extrabold text-slate-800 mb-1 mt-1" style={{fontFamily:'Plus Jakarta Sans'}}>
                  {isLogin ? "Masuk ke Akun" : "Buat Akun Baru"}
                </h1>
                <p className="text-sm text-slate-400 mb-6">
                  {isLogin ? "Selamat datang kembali" : "Gratis selamanya daftar dalam 1 menit"}
                </p>

                {/* Tab */}
                <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                  <button onClick={() => setIsLogin(true)} className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${isLogin ? "tab-active" : "text-slate-400"}`}>
                    Masuk
                  </button>
                  <button onClick={() => setIsLogin(false)} className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${!isLogin ? "tab-active" : "text-slate-400"}`}>
                    Daftar Gratis
                  </button>
                </div>

                <div className="space-y-3">
                  {!isLogin && (
                    <Field label="Nama Lengkap" icon={<User size={15} className="text-slate-400" />}>
                      <input type="text" placeholder="Budi Santoso" className={inputClass} />
                    </Field>
                  )}
                  <Field label="Alamat Email" icon={<Mail size={15} className="text-slate-400" />}>
                    <input type="email" placeholder="email@kamu.com" className={inputClass} />
                  </Field>
                  {!isLogin && (
                    <Field label="Nomor HP" icon={<Phone size={15} className="text-slate-400" />}>
                      <input type="tel" placeholder="08xx-xxxx-xxxx" className={inputClass} />
                    </Field>
                  )}
                  <Field label="Password" icon={<Lock size={15} className="text-slate-400" />} rightEl={
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }>
                    <input type={showPassword ? "text" : "password"} placeholder="Minimal 8 karakter" className={inputClass + " pr-10"} />
                  </Field>
                  {!isLogin && (
                    <Field label="Konfirmasi Password" icon={<Lock size={15} className="text-slate-400" />} rightEl={
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }>
                      <input type={showConfirmPassword ? "text" : "password"} placeholder="Ketik ulang password" className={inputClass + " pr-10"} />
                    </Field>
                  )}

                  {!isLogin && (
                    <div
                      className={`flex items-start gap-3 p-3.5 rounded-xl cursor-pointer border transition-all ${agreed ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200"}`}
                      onClick={() => setAgreed(!agreed)}
                    >
                      <div className={`w-5 h-5 min-w-[20px] rounded-md border-2 flex items-center justify-center mt-0.5 transition-all ${agreed ? "bg-blue-600 border-blue-600" : "bg-white border-slate-300"}`}>
                        {agreed && <CheckCircle2 size={13} className="text-white" strokeWidth={3} />}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Saya menyetujui{" "}
                        <span className="text-blue-600 font-semibold hover:underline">Syarat & Ketentuan</span>{" "}
                        serta{" "}
                        <span className="text-blue-600 font-semibold hover:underline">Kebijakan Privasi</span>{" "}
                        Kost Solo.
                      </p>
                    </div>
                  )}

                  <button type="submit" className="submit-btn w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 mt-1">
                    {isLogin ? "Masuk ke Akun" : "Daftar Sekarang"}
                    <ArrowRight size={16} />
                  </button>

                  {isLogin && (
                    <p className="text-center text-xs text-slate-400 pt-1">
                      <span className="text-blue-500 cursor-pointer hover:underline font-medium">Lupa password?</span>
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 justify-center">
                  <Shield size={12} className="text-slate-400" />
                  <p className="text-[11px] text-slate-400 text-center">
                    Data Anda aman & terenkripsi
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const Field = ({ label, icon, children, rightEl }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">{label}</label>
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2">{icon}</span>
      {children}
      {rightEl}
    </div>
  </div>
);

const RoleButton = ({ title, desc, icon, onClick }) => (
  <button
    onClick={onClick}
    className="role-btn w-full flex items-center p-4 bg-white border-2 border-slate-150 rounded-2xl transition-all text-left group"
    style={{border:'1.5px solid #e2e8f0'}}
  >
    <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center mr-4 border border-blue-100">
      {icon}
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <h4 className="font-bold text-slate-700 text-[15px]" style={{fontFamily:'Plus Jakarta Sans'}}>{title}</h4>
        
      </div>
      <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
    </div>
    <ChevronLeft size={16} className="text-slate-300 group-hover:text-blue-500 rotate-180 transition-colors" />
  </button>
);

const KostIllustration = () => (
  <svg viewBox="0 0 320 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[220px]">
    <ellipse cx="160" cy="220" rx="120" ry="18" fill="rgba(255,255,255,0.12)" />
    {/* Building back */}
    <rect x="20" y="100" width="55" height="125" rx="6" fill="rgba(255,255,255,0.15)" />
    <rect x="245" y="115" width="55" height="110" rx="6" fill="rgba(255,255,255,0.15)" />
    {/* Windows back */}
    {[30,50].map(x => [115,145,175].map(y => (
      <rect key={`${x}${y}`} x={x} y={y} width="14" height="14" rx="3" fill="rgba(255,255,255,0.25)" />
    )))}
    {/* Main building */}
    <rect x="75" y="80" width="170" height="145" rx="8" fill="rgba(255,255,255,0.22)" />
    {/* Roof */}
    <polygon points="65,80 160,30 255,80" fill="rgba(255,255,255,0.3)" />
    {/* Door */}
    <rect x="139" y="175" width="42" height="50" rx="5" fill="rgba(255,255,255,0.35)" />
    <circle cx="174" cy="200" r="3" fill="rgba(255,255,255,0.8)" />
    {/* Windows main */}
    {[90,130,175,215].map((x,i) => [98,140].map((y,j) => (
      <rect key={`m${i}${j}`} x={x} y={y} width="22" height="22" rx="4" fill={j===0 ? "rgba(255,230,100,0.5)" : "rgba(255,255,255,0.25)"} />
    )))}
    {/* Path */}
    <rect x="149" y="225" width="22" height="30" rx="4" fill="rgba(255,255,255,0.2)" />
    <rect x="120" y="248" width="80" height="8" rx="4" fill="rgba(255,255,255,0.15)" />
  </svg>
);

export default KostAuth;