import React, { useState } from "react";
import { User, Mail, ChevronRight, LogOut, Settings, Bell, Shield, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/auth/BottomNav";

const menuItems = [
  { icon: Settings, label: "Pengaturan Akun", color: "text-indigo-500", bg: "bg-indigo-50" },
  { icon: Bell, label: "Notifikasi", color: "text-amber-500", bg: "bg-amber-50" },
  { icon: Shield, label: "Privasi & Keamanan", color: "text-green-500", bg: "bg-green-50" },
  { icon: HelpCircle, label: "Bantuan & FAQ", color: "text-sky-500", bg: "bg-sky-50" },
];

export default function ProfilPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.fullname || "User";
  const userEmail = user.email || "email@example.com";

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* HEADER */}
      <div className="px-6 pt-6 mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Atap<span className="text-indigo-600">.</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1 font-medium">Profil Saya</p>
      </div>

      {/* PROFILE CARD */}
      <div className="mx-6 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-indigo-100 flex-shrink-0">{initials}</div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-extrabold text-slate-900 truncate">{userName}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Mail size={13} className="text-slate-400 flex-shrink-0" />
              <p className="text-sm text-slate-400 truncate">{userEmail}</p>
            </div>
          </div>
          <button className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 flex-shrink-0">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* MENU */}
      <div className="mx-6 mb-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-50">
          {menuItems.map(({ icon: Icon, label, color, bg }) => (
            <button key={label} className="w-full flex items-center gap-4 px-5 py-4 active:bg-slate-50 transition-colors text-left">
              <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon size={18} className={color} />
              </div>
              <span className="flex-1 text-sm font-semibold text-slate-700">{label}</span>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
          ))}
        </div>
      </div>

      {/* LOGOUT BUTTON */}
      <div className="mx-6">
        <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center justify-center gap-3 py-4 bg-red-50 rounded-3xl border border-red-100 text-red-500 font-bold text-sm active:scale-95 transition-transform">
          <LogOut size={18} />
          Keluar dari Akun
        </button>
      </div>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-t-[32px] p-8 animate-slide-up">
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6" />
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogOut size={26} className="text-red-400" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 text-center mb-2">Keluar?</h3>
            <p className="text-sm text-slate-400 text-center mb-8 leading-relaxed">
              Kamu yakin ingin keluar dari akun <span className="font-semibold text-slate-600">{userName}</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3.5 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm active:scale-95 transition-transform">
                Batal
              </button>
              <button onClick={handleLogout} className="flex-1 py-3.5 rounded-2xl bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-100 active:scale-95 transition-transform">
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
