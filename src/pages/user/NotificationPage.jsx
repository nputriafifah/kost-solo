import React, { useState, useEffect } from "react";
import { Bell, CheckCheck, Tag, Info, Star, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UserSettingsLayout from "../../components/user/UserSettingsLayout";

const NOTIF_ICONS = { Star, Tag, Info, Bell };

const DEFAULT_NOTIFICATIONS = [
  {
    id: 1,
    icon: "Star",
    iconBg: "#FFFBEB",
    iconColor: "#D97706",
    title: "Kost baru di sekitarmu",
    desc: "Ada 3 kost baru di Kentingan yang mungkin kamu suka.",
    time: "5 menit lalu",
    unread: true,
  },
  {
    id: 2,
    icon: "Tag",
    iconBg: "#ECFDF5",
    iconColor: "#059669",
    title: "Promo spesial",
    desc: "Kost Melati Indah sedang diskon 10% untuk bulan ini.",
    time: "1 jam lalu",
    unread: true,
  },
  {
    id: 3,
    icon: "Info",
    iconBg: "#F5F3FF",
    iconColor: "#4F46E5",
    title: "Profil belum lengkap",
    desc: "Lengkapi profil kamu untuk mendapatkan rekomendasi terbaik.",
    time: "Kemarin",
    unread: false,
  },
  {
    id: 4,
    icon: "Bell",
    iconBg: "#F1F5F9",
    iconColor: "#94A3B8",
    title: "Selamat datang di Atap",
    desc: "Temukan kost terbaik di Solo dengan mudah bersama kami.",
    time: "2 hari lalu",
    unread: false,
  },
];

const PREFS_KEY = "atap_notification_prefs";

function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) {
      return { chat: true, promo: true, listing: true };
    }
    const p = JSON.parse(raw);
    return {
      chat: p.chat !== false,
      promo: p.promo !== false,
      listing: p.listing !== false,
    };
  } catch {
    return { chat: true, promo: true, listing: true };
  }
}

function loadNotifications() {
  try {
    const raw = localStorage.getItem("atap_notifications");
    if (!raw) return DEFAULT_NOTIFICATIONS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_NOTIFICATIONS;
    return parsed.map((n) => ({
      ...n,
      icon: n.icon || "Bell",
      iconBg: n.iconBg || "#F1F5F9",
      iconColor: n.iconColor || "#94A3B8",
    }));
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
}

export default function NotifikasiPage() {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState(loadNotifications);
  const [prefs, setPrefs] = useState(loadPrefs);

  const unreadCount = notifs.filter((n) => n.unread).length;

  useEffect(() => {
    localStorage.setItem("atap_notifications", JSON.stringify(notifs));
  }, [notifs]);

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const tandaiSemua = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const tandaiSatu = (id) => {
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const togglePref = (key) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

  return (
    <UserSettingsLayout
      title="Notifikasi"
      subtitle="Lihat aktivitas terbaru dan atur jenis notifikasi yang ingin kamu terima."
    >
      <div className="uset-grid">
        <div className="uset-card span-2">
          <div className="uset-toolbar">
            <div>
              <h2 className="uset-card-title" style={{ marginBottom: 4 }}>
                Kotak masuk
              </h2>
              <p className="uset-card-desc" style={{ margin: 0 }}>
                {unreadCount > 0 ? `${unreadCount} belum dibaca` : "Semua sudah dibaca"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button type="button" className="uset-toolbar-btn" onClick={tandaiSemua}>
                <CheckCheck size={15} />
                Tandai semua dibaca
              </button>
            )}
          </div>

          {notifs.length === 0 ? (
            <div className="uset-empty">
              <div className="uset-empty-icon">
                <Bell size={24} color="#94A3B8" />
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Belum ada notifikasi</p>
            </div>
          ) : (
            <div className="uset-notif-list">
              {notifs.map((notif) => {
                const Icon = NOTIF_ICONS[notif.icon] || Bell;
                return (
                  <button
                    key={notif.id}
                    type="button"
                    className={`uset-notif-item${notif.unread ? " unread" : ""}`}
                    onClick={() => tandaiSatu(notif.id)}
                  >
                    <div
                      className="uset-notif-icon"
                      style={{ background: notif.iconBg, color: notif.iconColor }}
                    >
                      <Icon size={20} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <p className={`uset-notif-title${notif.unread ? "" : " read"}`}>
                          {notif.title}
                        </p>
                        {notif.unread && <span className="uset-dot" />}
                      </div>
                      <p className="uset-notif-desc">{notif.desc}</p>
                      <p className="uset-notif-time">{notif.time}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="uset-card">
          <h2 className="uset-card-title">Preferensi</h2>
          <p className="uset-card-desc">Disimpan di perangkat (push email belum aktif).</p>

          {[
            { key: "chat", title: "Pesan chat", sub: "Pesan baru dari pemilik kost" },
            { key: "promo", title: "Promo & penawaran", sub: "Diskon dan kost unggulan" },
            { key: "listing", title: "Kost baru", sub: "Rekomendasi kost di area favoritmu" },
          ].map(({ key, title, sub }) => (
            <div key={key} className="uset-row">
              <div className="uset-row-body">
                <p className="uset-row-label" style={{ textTransform: "none", fontSize: 14, color: "#1E1B4B" }}>
                  {title}
                </p>
                <p className="uset-notif-desc" style={{ margin: 0 }}>{sub}</p>
              </div>
              <button
                type="button"
                className={`uset-toggle${prefs[key] ? " on" : ""}`}
                onClick={() => togglePref(key)}
                aria-pressed={prefs[key]}
              >
                <span className="uset-toggle-knob" />
              </button>
            </div>
          ))}
        </div>

        <div className="uset-card">
          <h2 className="uset-card-title">Tips</h2>
          <p className="uset-card-desc" style={{ marginBottom: 0 }}>
            Notifikasi di navbar dan profil mengikuti daftar di kotak masuk ini.
          </p>
          <button type="button" className="uset-btn-link" onClick={() => navigate("/profil")}>
            Kembali ke profil <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </UserSettingsLayout>
  );
}
