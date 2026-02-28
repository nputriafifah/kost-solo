import React, { useState } from "react";

const KostAuth = () => {
  const [role, setRole] = useState("pencari"); // 'pencari' atau 'pemilik'
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // Helper styling agar konsisten
  const inputClass = "w-full px-4 py-2.5 rounded-xl border-[1.5px] border-[#D6E8FF] bg-[#F8FBFF] focus:bg-white focus:border-[#4A8EE0] outline-none transition-all text-[14px] text-[#1A3A6E] placeholder-[#A8C0DC]";
  const labelClass = "block text-[11px] font-black text-[#4A6FA5] mb-1.5 uppercase tracking-wider ml-1";

  return (
    <div className="min-h-screen bg-[#EEF5FF] flex items-center justify-center p-4 font-sans">
      {/* Box Utama */}
      <div className="flex flex-col md:flex-row w-full max-w-[950px] min-h-[620px] bg-white rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(91,143,217,0.15)]">
        
        {/* SISI KIRI: Visual & Branding */}
        <div className="md:w-[40%] bg-[#D6E8FF] p-10 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10 text-center">
            {/* Ilustrasi (Gunakan SVG yang sebelumnya) */}
            <div className="mb-8 opacity-90 scale-110">
               <KostIllustration />
            </div>
            <h2 className="text-2xl font-black text-[#2B5BA8] flex items-center justify-center gap-2">
              🏠 KostKita
            </h2>
            <p className="text-[12px] text-[#5B8FD9] font-bold mt-2 uppercase tracking-[0.2em] leading-relaxed">
              Hunian Nyaman <br /> Sejuta Kemudahan
            </p>
          </div>
        </div>

        {/* SISI KANAN: Form (Login & Register) */}
        <div className="flex-1 p-8 md:p-12 bg-white flex flex-col justify-center">
          
          {/* Pilihan Role (Pencari / Pemilik) */}
          <div className="flex bg-[#EEF5FF] p-1.5 rounded-2xl mb-8 gap-1 shadow-inner">
            <button
              onClick={() => { setRole("pencari"); setIsLogin(true); }}
              className={`flex-1 py-2.5 text-[12px] font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
                role === "pencari" ? "bg-white text-[#2B5BA8] shadow-sm" : "text-[#8AACD4] hover:text-[#5B8FD9]"
              }`}
            >
              🔍 Pencari Kost
            </button>
            <button
              onClick={() => { setRole("pemilik"); setIsLogin(true); }}
              className={`flex-1 py-2.5 text-[12px] font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
                role === "pemilik" ? "bg-white text-[#2B5BA8] shadow-sm" : "text-[#8AACD4] hover:text-[#5B8FD9]"
              }`}
            >
              🏘️ Pemilik Kost
            </button>
          </div>

          {/* Header Teks */}
          <div className="mb-6">
            <h1 className="text-[30px] font-black text-[#1A3A6E] leading-none">
              {isLogin ? "Masuk" : "Buat Akun"}
            </h1>
            <p className="text-[13px] text-[#8AACD4] mt-2 font-medium">
              Akses sebagai <span className="text-[#4A8EE0] font-black underline decoration-2 underline-offset-4 capitalize">{role}</span>
            </p>
          </div>

          {/* Tab Masuk / Daftar */}
          <div className="flex border-b-2 border-[#EEF5FF] mb-6">
            <button
              onClick={() => { setIsLogin(true); setAgreed(false); }}
              className={`flex-1 pb-3 text-[14px] font-black transition-all ${
                isLogin ? "text-[#2B5BA8] border-b-[3px] border-[#4A8EE0] -mb-[2px]" : "text-[#A8C0DC]"
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => { setIsLogin(false); setAgreed(false); }}
              className={`flex-1 pb-3 text-[14px] font-black transition-all ${
                !isLogin ? "text-[#2B5BA8] border-b-[3px] border-[#4A8EE0] -mb-[2px]" : "text-[#A8C0DC]"
              }`}
            >
              Daftar
            </button>
          </div>

          {/* Form Content */}
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            
            {/* Field Nama Lengkap (Hanya Register) */}
            {!isLogin && (
              <div>
                <label className={labelClass}>Nama Lengkap</label>
                <input type="text" placeholder="Masukkan nama lengkap" className={inputClass} required />
              </div>
            )}

            {/* Field Utama (Login: Email/NoHP, Register: Email) */}
            <div>
              <label className={labelClass}>
                {isLogin ? "Email / No. Handphone" : "Email Aktif"}
              </label>
              <input 
                type={isLogin ? "text" : "email"} 
                placeholder={isLogin ? "contoh@email.com atau 08xxxxxxxxxx" : "nama@email.com"} 
                className={inputClass} 
                required 
              />
            </div>

            {/* Field No HP (Hanya Register) */}
            {!isLogin && (
              <div>
                <label className={labelClass}>No. Handphone</label>
                <input type="tel" placeholder="08xxxxxxxxxx" className={inputClass} required />
              </div>
            )}

            {/* Password */}
            <div className="relative">
              <label className={labelClass}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={isLogin ? "Masukkan password" : "Minimal 8 karakter"}
                  className={inputClass}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A8C0DC] hover:text-[#4A8EE0]"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {isLogin && (
                <div className="text-right mt-2">
                  <a href="#" className="text-[12px] text-[#4A8EE0] font-black hover:underline">Lupa password?</a>
                </div>
              )}
            </div>

            {/* Checkbox Persetujuan (Hanya Register) */}
            {!isLogin && (
              <div 
                className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex gap-3 items-start ${
                  agreed ? "bg-[#EEF5FF] border-[#4A8EE0]" : "bg-[#F8FBFF] border-[#D6E8FF]"
                }`}
                onClick={() => setAgreed(!agreed)}
              >
                <div className={`w-5 h-5 min-w-[20px] mt-0.5 rounded-md flex items-center justify-center border-2 transition-all ${
                  agreed ? "bg-[#4A8EE0] border-[#4A8EE0]" : "bg-white border-[#B8D0EE]"
                }`}>
                  {agreed && <span className="text-white text-[10px] font-black">✓</span>}
                </div>
                <p className="text-[11px] text-[#4A6FA5] font-semibold leading-relaxed">
                  Saya menyatakan telah membaca dan menyetujui <span className="text-[#4A8EE0] font-black">Syarat & Ketentuan</span> serta <span className="text-[#4A8EE0] font-black">Kebijakan Privasi</span> KostKita.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isLogin && !agreed}
              className={`w-full py-3.5 rounded-xl font-black text-white text-[15px] uppercase tracking-widest shadow-lg transition-all active:scale-[0.98] mt-4 ${
                !isLogin && !agreed 
                ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-[#3A7ED5] to-[#6AAFF5] shadow-[0_6px_20px_rgba(74,142,224,0.25)] hover:brightness-105"
              }`}
            >
              {isLogin ? "Masuk" : "Daftar Sekarang"}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center">
            <p className="text-[13px] text-[#8AACD4] font-medium">
              {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-[#4A8EE0] font-black hover:underline ml-1"
              >
                {isLogin ? "Daftar sekarang" : "Masuk di sini"}
              </button>
            </p>
            <div className="mt-6 flex items-center justify-center gap-1 text-[11px] text-[#A8C0DC] font-bold">
              <span>Butuh bantuan?</span>
              <a href="#" className="text-[#4A8EE0] hover:underline">💬 Hubungi CS</a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Pastikan komponen ini ada di file yang sama atau diimpor
const KostIllustration = () => (
  <svg viewBox="0 0 380 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[280px]">
    <circle cx="190" cy="210" r="110" fill="#FFF9C4" opacity="0.85" />
    <rect x="5" y="190" width="62" height="210" rx="4" fill="#AFC6EF" />
    <rect x="313" y="210" width="67" height="190" rx="4" fill="#AFC6EF" />
    <rect x="52" y="265" width="88" height="135" rx="4" fill="#C8DAFB" />
    <polygon points="44,265 96,220 148,265" fill="#F4AABE" />
    <rect x="122" y="232" width="136" height="168" rx="5" fill="#DAEAFF" />
    <polygon points="112,232 190,178 268,232" fill="#F4AABE" />
    <rect x="172" y="330" width="36" height="70" rx="5" fill="#89B4F0" opacity="0.8" />
    <circle cx="202" cy="366" r="3" fill="#fff" />
  </svg>
);

export default KostAuth; 