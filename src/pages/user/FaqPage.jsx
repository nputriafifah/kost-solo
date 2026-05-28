import React, { useState } from "react";
import {
  MessageCircle, Mail, ChevronRight, ChevronDown,
  HelpCircle, ExternalLink,
} from "lucide-react";
import UserSettingsLayout from "../../components/user/UserSettingsLayout";

const WA_NUMBER = "6283160982717";
const EMAIL = "adminatap@gmail.com";

const FAQ_ITEMS = [
  {
    q: "Bagaimana cara mencari dan menyimpan kost favorit?",
    a: "Gunakan menu Search atau Peta untuk menjelajah listing. Klik ikon hati pada kost yang kamu suka untuk menyimpannya di menu Favorit.",
  },
  {
    q: "Bagaimana cara chat dengan pemilik kost?",
    a: "Buka detail kost, lalu pilih opsi chat atau hubungi pemilik. Percakapan tersimpan di menu Chat selama kamu login.",
  },
  {
    q: "Bagaimana cara mengubah password?",
    a: "Buka Profil → Privasi & Keamanan → Kirim tautan reset password. Ikuti instruksi di email untuk mengatur password baru.",
  },
  {
    q: "Bagaimana melaporkan listing yang bermasalah?",
    a: "Di halaman detail kost, gunakan fitur laporkan listing. Tim Atap akan meninjau laporanmu.",
  },
  {
    q: "Apakah Atap memungut biaya untuk pencari kost?",
    a: "Pencarian dan fitur dasar gratis. Informasi biaya tambahan (jika ada) akan dijelaskan sebelum kamu berkomitmen ke pemilik.",
  },
];

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        border: "1px solid #E2E8F0",
        borderRadius: 14,
        overflow: "hidden",
        background: open ? "#F8FAFF" : "#fff",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "16px 18px",
          border: "none",
          background: "none",
          cursor: "pointer",
          textAlign: "left",
          fontFamily: "inherit",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", lineHeight: 1.45 }}>
          {question}
        </span>
        {open ? (
          <ChevronDown size={18} style={{ color: "#2563EB", flexShrink: 0 }} />
        ) : (
          <ChevronRight size={18} style={{ color: "#94A3B8", flexShrink: 0 }} />
        )}
      </button>
      {open && (
        <p
          style={{
            margin: 0,
            padding: "0 18px 16px",
            fontSize: 13,
            color: "#64748B",
            lineHeight: 1.65,
          }}
        >
          {answer}
        </p>
      )}
    </div>
  );
}

export default function FaqPage() {
  const waUrl = `https://wa.me/${WA_NUMBER}`;

  return (
    <UserSettingsLayout
      title="Bantuan & FAQ"
      subtitle="Pertanyaan umum dan kontak tim Atap. Kami siap membantu kendala akun, pencarian kost, dan laporan listing."
    >
      <div className="uset-grid">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="uset-card"
          style={{ textDecoration: "none", color: "inherit", transition: "border-color .15s, box-shadow .15s" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#86EFAC";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(34,197,94,.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#E2E8F0";
            e.currentTarget.style.boxShadow = "0 2px 16px rgba(15,23,42,.04)";
          }}
        >
          <div
            className="uset-card-icon-lg"
            style={{ background: "#ECFDF5", marginBottom: 16 }}
          >
            <MessageCircle size={24} style={{ color: "#16A34A" }} />
          </div>
          <h2 className="uset-card-title">WhatsApp</h2>
          <p className="uset-card-desc" style={{ marginBottom: 0 }}>
            Chat langsung dengan tim dukungan Atap.
          </p>
          <span
            className="uset-btn-link"
            style={{ marginTop: 16, display: "inline-flex" }}
          >
            Buka WhatsApp <ExternalLink size={14} />
          </span>
        </a>

        <a
          href={`mailto:${EMAIL}`}
          className="uset-card"
          style={{ textDecoration: "none", color: "inherit", transition: "border-color .15s, box-shadow .15s" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#BFDBFE";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(37,99,235,.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#E2E8F0";
            e.currentTarget.style.boxShadow = "0 2px 16px rgba(15,23,42,.04)";
          }}
        >
          <div
            className="uset-card-icon-lg"
            style={{ background: "#EFF6FF", marginBottom: 16 }}
          >
            <Mail size={24} style={{ color: "#2563EB" }} />
          </div>
          <h2 className="uset-card-title">Email</h2>
          <p className="uset-card-desc" style={{ marginBottom: 0 }}>
            Untuk pertanyaan resmi, kerja sama, atau laporan teknis.
          </p>
          <span
            className="uset-btn-link"
            style={{ marginTop: 16, display: "inline-flex" }}
          >
            Kirim email <ExternalLink size={14} />
          </span>
        </a>

        <div className="uset-card span-2">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div className="uset-card-icon-lg" style={{ background: "#F5F3FF" }}>
              <HelpCircle size={22} style={{ color: "#7C3AED" }} />
            </div>
            <div>
              <h2 className="uset-card-title" style={{ marginBottom: 4 }}>
                Pertanyaan populer
              </h2>
              <p className="uset-card-desc" style={{ margin: 0 }}>
                Klik pertanyaan untuk melihat jawaban.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {FAQ_ITEMS.map((item) => (
              <FaqItem key={item.q} question={item.q} answer={item.a} />
            ))}
          </div>

          <p style={{ fontSize: 13, color: "#64748B", margin: "20px 0 0", lineHeight: 1.6 }}>
            Tidak menemukan jawaban? Gunakan kartu WhatsApp atau Email di atas untuk menghubungi tim Atap.
          </p>
        </div>
      </div>
    </UserSettingsLayout>
  );
}
