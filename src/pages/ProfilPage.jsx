import React, { useState, useEffect, useRef } from "react";
import { User, Mail, ChevronRight, LogOut, Settings, Bell, Shield, HelpCircle, X, Check, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/auth/BottomNav";

const menuItems = [
  {
    icon: Settings,
    label: "Pengaturan Akun",
    color: "text-indigo-500",
    bg: "bg-indigo-50",
    path: "/settings/account",
  },
  {
    icon: Bell,
    label: "Notifikasi",
    color: "text-amber-500",
    bg: "bg-amber-50",
    path: "/notifikasi", // ← disambungkan ke halaman notifikasi
  },
  {
    icon: Shield,
    label: "Privasi & Keamanan",
    color: "text-green-500",
    bg: "bg-green-50",
    path: "/settings/privacy",
  },
  {
    icon: HelpCircle,
    label: "Bantuan & FAQ",
    color: "text-sky-500",
    bg: "bg-sky-50",
    path: "/settings/faq",
  },
];

export default function ProfilPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // ← gunakan field "name" sesuai AuthForm
  const [userData, setUserData] = useState({ name: "", email: "" });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [photoUrl, setPhotoUrl] = useState(null); // foto profil dari galeri

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUserData(parsed);
      setEditForm(parsed);
    }
    // ambil foto yang sudah disimpan sebelumnya
    const savedPhoto = localStorage.getItem("atap_profile_photo");
    if (savedPhoto) setPhotoUrl(savedPhoto);
  }, []);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    localStorage.setItem("user", JSON.stringify({ ...userData, ...editForm }));
    setUserData({ ...userData, ...editForm });
    setIsEditing(false);
  };

  // upload foto dari galeri
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setPhotoUrl(dataUrl);
      localStorage.setItem("atap_profile_photo", dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("atap_profile_photo");
    navigate("/auth");
  };

  // ← pakai "name" bukan "fullname"
  const userName = userData.name || "User Atap";
  const userEmail = userData.email || "email@example.com";
  const initials =
    userName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 font-sans">
      {/* HEADER */}
      <div className="px-6 pt-10 mb-8">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
          Profil<span className="text-indigo-600">.</span>
        </h1>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Informasi Akun Anda</p>
      </div>

      {/* PROFILE CARD */}
      <div className="mx-6 mb-8">
        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/50 border border-white flex items-center gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50"></div>

          {/* Avatar / Foto */}
          <div className="relative group flex-shrink-0">
            {photoUrl ? (
              <img src={photoUrl} alt="Foto Profil" className="w-20 h-20 rounded-[2rem] object-cover shadow-lg" />
            ) : (
              <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-100 transition-transform group-hover:scale-105">{initials}</div>
            )}
            {/* tombol kamera — buka galeri */}
            <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-slate-100 active:scale-90 transition-transform">
              <Camera size={14} className="text-slate-400" />
            </button>
            {/* input file tersembunyi */}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>

          <div className="flex-1 min-w-0 z-10">
            <h2 className="text-xl font-black text-slate-900 truncate leading-tight">{userName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <p className="text-xs text-slate-400 font-bold truncate tracking-tight">{userEmail}</p>
            </div>
            <button onClick={() => setIsEditing(true)} className="mt-3 px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black rounded-full uppercase tracking-widest hover:bg-indigo-600 transition-colors">
              Ubah Profil
            </button>
          </div>
        </div>
      </div>

      {/* MENU ITEMS */}
      <div className="mx-6 mb-8">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Pengaturan Umum</h3>
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white overflow-hidden p-2">
          {menuItems.map(({ icon: Icon, label, color, bg, path }) => (
            <button key={label} onClick={() => navigate(path)} className="w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-50 transition-all rounded-[1.8rem] group text-left">
              <div className={`w-11 h-11 ${bg} rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110`}>
                <Icon size={20} className={color} />
              </div>
              <span className="flex-1 text-sm font-bold text-slate-700 tracking-tight">{label}</span>
              <ChevronRight size={18} className="text-slate-300 mr-2" />
            </button>
          ))}
        </div>
      </div>

      {/* LOGOUT */}
      <div className="mx-6">
        <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center justify-between px-8 py-5 bg-rose-50 rounded-[2rem] border border-rose-100 group active:scale-95 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
              <LogOut size={20} />
            </div>
            <span className="text-sm font-black text-rose-600 uppercase tracking-widest">Logout Akun</span>
          </div>
          <ChevronRight size={18} className="text-rose-300" />
        </button>
      </div>

      {/* MODAL EDIT PROFIL */}
      {isEditing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-slate-900 tracking-tighter">Edit Profil</h3>
              <button onClick={() => setIsEditing(false)} className="p-2 bg-slate-100 rounded-full text-slate-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                <div className="relative mt-1.5">
                  <User className="absolute left-4 top-3.5 text-slate-300" size={18} />
                  <input
                    type="text"
                    className="w-full h-12 pl-12 pr-4 bg-slate-50 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Email</label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-4 top-3.5 text-slate-300" size={18} />
                  <input
                    type="email"
                    className="w-full h-12 pl-12 pr-4 bg-slate-50 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 mt-4 active:scale-95 transition-all">
                <Check size={18} /> Simpan Perubahan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LOGOUT */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl">
            <div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <LogOut size={32} className="text-rose-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 text-center tracking-tighter mb-2">Keluar Aplikasi?</h3>
            <p className="text-sm text-slate-400 text-center mb-8 font-medium">Sesi kamu akan berakhir dan kamu perlu login kembali.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-4 rounded-2xl border border-slate-100 text-slate-500 font-black text-xs uppercase tracking-widest transition-all">
                Batal
              </button>
              <button onClick={handleLogout} className="flex-1 py-4 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 transition-all">
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
