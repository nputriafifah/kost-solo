import React, { useState } from "react";
import { Bell, CheckCheck, Tag, Info, Star, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/auth/BottomNav";

const NOTIFICATIONS = [
  {
    id: 1,
    icon: Star,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    title: "Kost Baru di Sekitarmu!",
    desc: "Ada 3 kost baru di Kentingan yang mungkin kamu suka.",
    time: "5 menit lalu",
    unread: true,
  },
  {
    id: 2,
    icon: Tag,
    iconBg: "bg-green-50",
    iconColor: "text-green-500",
    title: "Promo Spesial",
    desc: "Kost Melati Indah sedang diskon 10% untuk bulan ini!",
    time: "1 jam lalu",
    unread: true,
  },
  {
    id: 3,
    icon: Info,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-500",
    title: "Profil Belum Lengkap",
    desc: "Lengkapi profil kamu untuk mendapatkan rekomendasi terbaik.",
    time: "Kemarin",
    unread: false,
  },
  {
    id: 4,
    icon: Bell,
    iconBg: "bg-slate-50",
    iconColor: "text-slate-400",
    title: "Selamat Datang di Atap!",
    desc: "Temukan kost terbaik di Solo dengan mudah bersama kami.",
    time: "2 hari lalu",
    unread: false,
  },
];

export default function NotifikasiPage() {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState(NOTIFICATIONS);

  const tandaiSemua = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const unreadCount = notifs.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28">
      {/* HEADER */}
      <div className="px-6 pt-10 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 active:scale-90 transition-transform">
              <ArrowLeft size={18} className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
                Notifikasi<span className="text-indigo-600">.</span>
              </h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{unreadCount} belum dibaca</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button onClick={tandaiSemua} className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-2 rounded-full active:scale-95 transition-transform">
              <CheckCheck size={14} />
              Tandai semua
            </button>
          )}
        </div>
      </div>

      {/* LIST */}
      <div className="px-6 flex flex-col gap-3">
        {notifs.map((notif) => {
          const Icon = notif.icon;
          return (
            <button
              key={notif.id}
              onClick={() => setNotifs((prev) => prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n)))}
              className={`w-full flex items-start gap-4 p-4 rounded-3xl text-left transition-all active:scale-95 border ${notif.unread ? "bg-white border-indigo-100 shadow-md shadow-indigo-50" : "bg-white border-slate-100 shadow-sm"}`}
            >
              <div className={`w-12 h-12 ${notif.iconBg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                <Icon size={20} className={notif.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className={`text-sm font-black truncate ${notif.unread ? "text-slate-900" : "text-slate-500"}`}>{notif.title}</p>
                  {notif.unread && <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full flex-shrink-0" />}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{notif.desc}</p>
                <p className="text-[10px] text-slate-300 font-bold mt-2 uppercase tracking-widest">{notif.time}</p>
              </div>
            </button>
          );
        })}

        {notifs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-4">
              <Bell size={32} className="text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-400">Belum ada notifikasi</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
