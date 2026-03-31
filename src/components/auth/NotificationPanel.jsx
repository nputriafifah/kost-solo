import React from "react";
import { X, Bell, CheckCheck, Tag, Info, Star } from "lucide-react";

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

export default function NotificationPanel({ onClose }) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-sm z-50 bg-white shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Notifikasi</h2>
            <p className="text-xs text-slate-400 mt-0.5">{NOTIFICATIONS.filter((n) => n.unread).length} belum dibaca</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">
              <CheckCheck size={13} />
              Tandai semua
            </button>
            <button onClick={onClose} className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 active:scale-95 transition-transform">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-3">
          {NOTIFICATIONS.map((notif) => {
            const Icon = notif.icon;
            return (
              <button key={notif.id} className={`w-full flex items-start gap-4 px-6 py-4 text-left transition-colors active:bg-slate-50 ${notif.unread ? "bg-indigo-50/40" : "bg-white"}`}>
                <div className={`w-10 h-10 ${notif.iconBg} rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon size={18} className={notif.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={`text-sm font-bold truncate ${notif.unread ? "text-slate-900" : "text-slate-600"}`}>{notif.title}</p>
                    {notif.unread && <span className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{notif.desc}</p>
                  <p className="text-[10px] text-slate-300 font-semibold mt-1.5">{notif.time}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.25s cubic-bezier(0.32, 0.72, 0, 1);
        }
      `}</style>
    </>
  );
}
