import React, { useState, useEffect, useRef } from "react";
import {
  User, Mail, ChevronRight, LogOut, Settings,
  Bell, Shield, HelpCircle, X, Check, Camera
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/ui/BottomNav";

const menuItems = [
  {
    icon: Settings,
    label: "Pengaturan akun",
    color: "text-blue-500",
    bg: "bg-blue-50",
    path: "/settings/account",
  },
  {
    icon: Bell,
    label: "Notifikasi",
    color: "text-amber-500",
    bg: "bg-amber-50",
    path: "/settings/notifications",
  },
  {
    icon: Shield,
    label: "Privasi & keamanan",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
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

  const [userData, setUserData] = useState({ name: "", email: "" });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [photoUrl, setPhotoUrl] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUserData(parsed);
      setEditForm(parsed);
    }
    const savedPhoto = localStorage.getItem("atap_profile_photo");
    if (savedPhoto) setPhotoUrl(savedPhoto);
  }, []);

  const handleSaveProfile = () => {
    // Validasi sederhana sebelum simpan
    if (!editForm.name.trim() || !editForm.email.trim()) return;
    const updated = { ...userData, ...editForm };
    localStorage.setItem("user", JSON.stringify(updated));
    setUserData(updated);
    setIsEditing(false);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Batasi ukuran file — max 2MB
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran foto maksimal 2MB.");
      return;
    }
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
    localStorage.removeItem("atap_favorites");
    navigate("/auth");
  };

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
    <div className="min-h-screen bg-slate-50 pb-32 font-sans">

      {/* HEADER */}
      <div className="px-5 pt-8 pb-5 bg-white border-b border-slate-100">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Profil<span className="text-blue-600">.</span>
        </h1>
        <p className="text-slate-400 text-xs mt-0.5">Informasi akun kamu</p>
      </div>

      {/* PROFILE CARD */}
      <div className="mx-4 mt-5 mb-5">
        <div className="bg-white rounded-3xl p-5 border border-slate-100 flex items-center gap-4">

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Foto profil"
                className="w-18 h-18 rounded-2xl object-cover border border-slate-100"
                style={{ width: 72, height: 72 }}
              />
            ) : (
              <div
                className="rounded-2xl flex items-center justify-center text-white font-bold text-xl bg-blue-600"
                style={{ width: 72, height: 72 }}
              >
                {initials}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              aria-label="Ganti foto profil"
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center border border-slate-200 hover:bg-slate-50 transition-colors active:scale-90"
            >
              <Camera size={13} className="text-slate-500" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-slate-900 truncate">
              {userName}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
              <p className="text-xs text-slate-400 truncate">{userEmail}</p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="mt-3 px-4 py-1.5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold rounded-full transition-colors active:scale-95"
            >
              Ubah profil
            </button>
          </div>
        </div>
      </div>

      {/* MENU */}
      <div className="mx-4 mb-5">
        <p className="text-xs font-semibold text-slate-400 mb-3 ml-1">
          Pengaturan umum
        </p>
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
          {menuItems.map(({ icon: Icon, label, color, bg, path }, idx) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              aria-label={label}
              className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors text-left ${
                idx !== menuItems.length - 1
                  ? "border-b border-slate-50"
                  : ""
              }`}
            >
              <div
                className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}
              >
                <Icon size={17} className={color} />
              </div>
              <span className="flex-1 text-sm font-semibold text-slate-700">
                {label}
              </span>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
          ))}
        </div>
      </div>

      {/* LOGOUT */}
      <div className="mx-4">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          aria-label="Keluar dari akun"
          className="w-full flex items-center gap-3 px-4 py-3.5 bg-red-50 border border-red-100 rounded-2xl hover:bg-red-100 transition-colors active:scale-95"
        >
          <div className="w-9 h-9 bg-red-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
            <LogOut size={17} />
          </div>
          <span className="flex-1 text-sm font-semibold text-red-600 text-left">
            Keluar akun
          </span>
          <ChevronRight size={16} className="text-red-300" />
        </button>
      </div>

      {/* MODAL EDIT PROFIL */}
      {isEditing && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/40 p-4"
          onClick={(e) => {
            // tutup modal kalau klik di luar
            if (e.target === e.currentTarget) setIsEditing(false);
          }}
        >
          <div className="bg-white w-full max-w-md rounded-3xl p-6 mb-2">
            {/* Modal header */}
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-slate-900">Edit profil</h3>
              <button
                onClick={() => setIsEditing(false)}
                aria-label="Tutup modal edit profil"
                className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Input nama */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
                Nama lengkap
              </label>
              <div className="relative">
                <User
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={15}
                />
                <input
                  type="text"
                  aria-label="Nama lengkap"
                  className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Input email */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
                Alamat email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={15}
                />
                <input
                  type="email"
                  aria-label="Alamat email"
                  className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Tombol simpan — pakai onClick bukan form submit */}
            <button
              onClick={handleSaveProfile}
              disabled={!editForm.name.trim() || !editForm.email.trim()}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors active:scale-95"
            >
              <Check size={16} />
              Simpan perubahan
            </button>
          </div>
        </div>
      )}

      {/* MODAL LOGOUT */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowLogoutConfirm(false);
          }}
        >
          <div className="bg-white w-full max-w-sm rounded-3xl p-7 mb-2">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogOut size={24} className="text-red-500" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center mb-1">
              Keluar dari aplikasi?
            </h3>
            <p className="text-xs text-slate-400 text-center mb-6 leading-relaxed">
              Sesi kamu akan berakhir dan kamu perlu login kembali.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 rounded-2xl bg-slate-900 hover:bg-red-600 text-white text-sm font-semibold transition-colors active:scale-95"
              >
                Ya, keluar
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}