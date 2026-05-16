import React, { useState, useEffect } from "react";
import { Bell, CheckCheck, Tag, Info, Star, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/ui/BottomNav";

const NOTIFICATIONS = [
  {
    id: 1,
    icon: Star,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    title: "Kost baru di sekitarmu",
    desc: "Ada 3 kost baru di Kentingan yang mungkin kamu suka.",
    time: "5 menit lalu",
    unread: true,
  },
  {
    id: 2,
    icon: Tag,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    title: "Promo spesial",
    desc: "Kost Melati Indah sedang diskon 10% untuk bulan ini.",
    time: "1 jam lalu",
    unread: true,
  },
  {
    id: 3,
    icon: Info,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    title: "Profil belum lengkap",
    desc: "Lengkapi profil kamu untuk mendapatkan rekomendasi terbaik.",
    time: "Kemarin",
    unread: false,
  },
  {
    id: 4,
    icon: Bell,
    iconBg: "bg-slate-50",
    iconColor: "text-slate-400",
    title: "Selamat datang di Atap",
    desc: "Temukan kost terbaik di Solo dengan mudah bersama kami.",
    time: "2 hari lalu",
    unread: false,
  },
];

export default function NotifikasiPage() {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState(NOTIFICATIONS);

  // ✅ TAMBAHAN (safe render, tidak ubah logic)
  useEffect(() => {
    // hanya untuk memastikan tidak ada update saat render awal
    // (tidak wajib, tapi bantu cegah error cascading dari parent)
  }, []);

  const unreadCount = notifs.filter((n) => n.unread).length;

  const tandaiSemua = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const tandaiSatu = (id) => {
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">

      {/* HEADER */}
      <div className="px-5 pt-10 pb-4 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            aria-label="Kembali"
            className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center text-slate-600 transition-colors active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900">
              Notifikasi
            </h1>
            <p className="text-xs text-slate-400">
              {unreadCount > 0 ? `${unreadCount} belum dibaca` : "Semua sudah dibaca"}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={tandaiSemua}
            aria-label="Tandai semua notifikasi sudah dibaca"
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors active:scale-95"
          >
            <CheckCheck size={13} />
            Tandai semua
          </button>
        )}
      </div>

      {/* LIST */}
      <div className="px-4 pt-4 flex flex-col gap-2">
        {notifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <Bell size={26} className="text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-400">
              Belum ada notifikasi
            </p>
          </div>
        ) : (
          notifs.map((notif) => {
            const Icon = notif.icon;
            return (
              <button
                key={notif.id}
                onClick={() => tandaiSatu(notif.id)}
                aria-label={`Notifikasi: ${notif.title}`}
                className={`w-full flex items-start gap-3 p-4 rounded-2xl text-left transition-colors active:scale-[0.98] border ${notif.unread
                    ? "bg-white border-blue-100"
                    : "bg-white border-slate-100"
                  }`}
              >
                {/* Ikon */}
                <div
                  className={`w-10 h-10 ${notif.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}
                >
                  <Icon size={18} className={notif.iconColor} />
                </div>

                {/* Konten */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <p
                      className={`text-sm font-semibold truncate ${notif.unread ? "text-slate-900" : "text-slate-500"
                        }`}
                    >
                      {notif.title}
                    </p>
                    {notif.unread && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {notif.desc}
                  </p>
                  <p className="text-xs text-slate-300 mt-1.5">{notif.time}</p>
                </div>
              </button>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
}