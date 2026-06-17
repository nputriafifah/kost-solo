import React, { useState, useEffect } from "react";
import {
  Lock, Smartphone, EyeOff, ShieldCheck,
  Mail, Loader2, Check, AlertCircle, ExternalLink, ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../../services/authService";
import UserSettingsLayout from "../../components/user/UserSettingsLayout";

const PRIVACY_STORAGE_KEY = "atap_privacy_settings";

function loadPrivacySettings() {
  try {
    const raw = localStorage.getItem(PRIVACY_STORAGE_KEY);
    if (!raw) return { hideOnlineStatus: false };
    const parsed = JSON.parse(raw);
    return { hideOnlineStatus: Boolean(parsed.hideOnlineStatus) };
  } catch {
    return { hideOnlineStatus: false };
  }
}

function savePrivacySettings(settings) {
  localStorage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify(settings));
}

export default function PrivacyPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const email = user?.email || "";

  const [privacy, setPrivacy] = useState(loadPrivacySettings);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState(null);
  const [pwdError, setPwdError] = useState(null);
  const [showDevices, setShowDevices] = useState(true);

  useEffect(() => {
    savePrivacySettings(privacy);
  }, [privacy]);

  const handleRequestPasswordReset = async () => {
    if (!email) {
      setPwdError("Email akun tidak ditemukan. Login ulang lalu coba lagi.");
      setPwdMessage(null);
      return;
    }
    setPwdLoading(true);
    setPwdError(null);
    setPwdMessage(null);
    try {
      await forgotPassword({ email });
      setPwdMessage(
        "Jika email terdaftar, kami mengirim tautan reset password. Cek inbox (dan folder spam), lalu buka tautan untuk mengatur password baru."
      );
    } catch (err) {
      setPwdError(err.message || "Gagal mengirim permintaan reset password.");
    } finally {
      setPwdLoading(false);
    }
  };

  const deviceLabel = (() => {
    const ua = navigator.userAgent || "";
    if (/iPhone|iPad|iPod/i.test(ua)) return "Perangkat Apple";
    if (/Android/i.test(ua)) return "Perangkat Android";
    if (/Windows/i.test(ua)) return "Windows";
    if (/Mac/i.test(ua)) return "macOS";
    return "Browser ini";
  })();

  return (
    <UserSettingsLayout
      title="Privasi & Keamanan"
      subtitle="Kelola kata sandi, preferensi privasi, dan ketahui bagaimana data akunmu digunakan di Atap."
    >
      <div className="uset-grid">
        <div className="uset-card span-2">
          <div className="uset-card-head">
            <div className="uset-card-icon-lg" style={{ background: "#FFF1F2" }}>
              <Lock size={22} style={{ color: "#E11D48" }} />
            </div>
            <div>
              <h2 className="uset-card-title">Ubah password</h2>
              <p className="uset-card-desc" style={{ marginBottom: 0 }}>
                Atap mengirim tautan reset ke email terdaftar. Buka tautan dari email, lalu atur password baru di halaman reset.
              </p>
              {email && (
                <div className="uset-email-chip">
                  <Mail size={14} style={{ color: "#94A3B8" }} />
                  {email}
                </div>
              )}
            </div>
          </div>

          {pwdMessage && (
            <div className="uset-alert ok">
              <Check size={16} style={{ flexShrink: 0 }} />
              <span>{pwdMessage}</span>
            </div>
          )}
          {pwdError && (
            <div className="uset-alert err">
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{pwdError}</span>
            </div>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
            <button
              type="button"
              className="uset-btn-primary"
              onClick={handleRequestPasswordReset}
              disabled={pwdLoading || !email}
            >
              {pwdLoading ? (
                <>
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  Mengirim...
                </>
              ) : (
                "Kirim tautan reset password"
              )}
            </button>
            <button
              type="button"
              className="uset-btn-link"
              style={{ marginTop: 0 }}
              onClick={() => navigate(`/reset-password${email ? `?email=${encodeURIComponent(email)}` : ""}`)}
            >
              Sudah punya kode reset? <ExternalLink size={14} />
            </button>
          </div>
        </div>

        <div className="uset-card">
          <h2 className="uset-card-title">Preferensi privasi</h2>
          <p className="uset-card-desc">Disimpan di perangkat ini.</p>

          <div className="uset-row">
            <div className="uset-row-icon">
              <EyeOff size={18} />
            </div>
            <div className="uset-row-body">
              <p className="uset-row-label" style={{ textTransform: "none", fontSize: 14, color: "#1E1B4B" }}>
                Sembunyikan status online
              </p>
              <p className="uset-notif-desc" style={{ margin: 0 }}>Belum disinkron ke server</p>
            </div>
            <button
              type="button"
              className={`uset-toggle${privacy.hideOnlineStatus ? " on" : ""}`}
              onClick={() => setPrivacy((p) => ({ ...p, hideOnlineStatus: !p.hideOnlineStatus }))}
              aria-pressed={privacy.hideOnlineStatus}
            >
              <span className="uset-toggle-knob" />
            </button>
          </div>

          <div className="uset-row">
            <div className="uset-row-icon" style={{ background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" }}>
              <ShieldCheck size={18} />
            </div>
            <div className="uset-row-body">
              <p className="uset-row-label" style={{ textTransform: "none", fontSize: 14, color: "#1E1B4B" }}>
                Autentikasi dua faktor
              </p>
              <p className="uset-notif-desc" style={{ margin: 0 }}>Belum tersedia</p>
            </div>
            <span className="uset-badge-soon">Segera</span>
          </div>
        </div>

        <div className="uset-card">
          <div className="uset-card-head" style={{ marginBottom: 12 }}>
            <div className="uset-card-icon-lg" style={{ background: "#F5F3FF" }}>
              <Smartphone size={22} style={{ color: "#4F46E5" }} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 className="uset-card-title">Perangkat terhubung</h2>
              <p className="uset-card-desc" style={{ margin: 0 }}>Sesi aktif di browser ini</p>
            </div>
            <button
              type="button"
              className="uset-row-edit"
              onClick={() => setShowDevices((v) => !v)}
            >
              {showDevices ? "Sembunyikan" : "Tampilkan"}
            </button>
          </div>

          {showDevices && (
            <>
              <div className="uset-device-box">
                <p style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>{deviceLabel}</p>
                <p style={{ margin: "6px 0 0", fontSize: 12, fontWeight: 700, color: "#059669" }}>
                  ● Sesi aktif sekarang
                </p>
                <p className="uset-device-ua">{navigator.userAgent}</p>
              </div>
              <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6, margin: "16px 0 0" }}>
                Logout jarak jauh belum tersedia. Untuk keamanan,{" "}
                <button
                  type="button"
                  className="uset-btn-link"
                  style={{ margin: 0, display: "inline" }}
                  onClick={handleRequestPasswordReset}
                >
                  ganti password
                </button>{" "}
                lalu keluar dari akun di perangkat yang tidak dipakai.
              </p>
            </>
          )}
        </div>

        <div className="uset-card span-2">
          <h2 className="uset-card-title">Data kamu di Atap</h2>
          <ul className="uset-data-list">
            <li>Nama dan email dipakai untuk login dan komunikasi terkait kost.</li>
            <li>Chat dengan pemilik disimpan agar percakapan bisa dilanjutkan.</li>
            <li>Favorit dan minat kost terkait akunmu di server Atap.</li>
            <li>Kami tidak menjual data pribadi ke pihak ketiga.</li>
          </ul>
          <button type="button" className="uset-btn-link" onClick={() => navigate("/profil")}>
            Kembali ke halaman profil <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </UserSettingsLayout>
  );
}
