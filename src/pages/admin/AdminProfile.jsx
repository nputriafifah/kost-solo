import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Shield, KeyRound, LogOut } from "lucide-react";
import { PageHeader } from "./adminUi";

function readStoredAdmin() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (user?.role !== "ADMIN") return null;
    return user;
  } catch {
    return null;
  }
}

export default function AdminProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = readStoredAdmin();
    if (!stored) {
      navigate("/auth", { replace: true });
      return;
    }
    setUser(stored);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth", { replace: true });
  };

  if (!user) return null;

  const initial = (user.name || user.email || "A").charAt(0).toUpperCase();

  return (
    <div
      style={{
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        color: "#0f172a",
        width: "100%",
        maxWidth: "100%",
        padding: "0 0 40px",
        boxSizing: "border-box",
      }}
    >
      <PageHeader title="Profil Admin" subtitle="Informasi akun dan keamanan" />

      {/* Kartu profil */}
      <section
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          padding: "24px 28px",
          marginBottom: 16,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 28,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {initial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700 }}>{user.name || "Admin"}</h2>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
              <Mail size={14} /> {user.email || "—"}
            </p>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                marginTop: 10,
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                padding: "4px 10px",
                borderRadius: 99,
                background: "#eef2ff",
                color: "#4f46e5",
              }}
            >
              <Shield size={12} /> {user.role || "ADMIN"}
            </span>
          </div>
        </div>
      </section>

      {/* Data akun */}
      <section
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          overflow: "hidden",
          marginBottom: 16,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            padding: "14px 24px",
            borderBottom: "1px solid #f1f5f9",
            background: "#fafafa",
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 700 }}>Informasi Akun</span>
        </div>

        {/* Nama tampilan */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <label
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Nama Tampilan
          </label>
          <div style={{ marginTop: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>{user.name || "—"}</span>
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>
            Read-only. Perubahan profil admin memerlukan endpoint backend khusus profil admin.
          </p>
        </div>

        {/* Email */}
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9" }}>
          <label
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Email
          </label>
          <p style={{ margin: "8px 0 0", fontSize: 15, fontWeight: 500, color: "#475569" }}>{user.email || "—"}</p>
        </div>

        {/* ID Akun */}
        <div style={{ padding: "18px 24px" }}>
          <label
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            ID Akun
          </label>
          <p
            style={{
              margin: "8px 0 0",
              fontSize: 12,
              fontFamily: "monospace",
              color: "#64748b",
              wordBreak: "break-all",
              background: "#f8fafc",
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
            }}
          >
            {user.id || "—"}
          </p>
        </div>
      </section>

      {/* Keamanan */}
      <section
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          padding: "18px 24px",
          marginBottom: 20,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <KeyRound size={16} color="#6366f1" />
          <span style={{ fontSize: 14, fontWeight: 700 }}>Keamanan</span>
        </div>
        <p style={{ margin: "0 0 14px", fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
          Untuk mengganti kata sandi, gunakan halaman lupa password dengan email admin yang terdaftar.
        </p>
        <button
          type="button"
          onClick={() => navigate("/forgot-password")}
          style={{
            padding: "10px 18px",
            fontSize: 13,
            fontWeight: 600,
            color: "#4f46e5",
            background: "#eef2ff",
            border: "1px solid #c7d2fe",
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          Atur ulang kata sandi
        </button>
      </section>

      {/* Keluar */}
      <button
        type="button"
        onClick={handleLogout}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 22px",
          fontSize: 14,
          fontWeight: 600,
          color: "#dc2626",
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: 12,
          cursor: "pointer",
        }}
      >
        <LogOut size={16} /> Keluar dari akun admin
      </button>
    </div>
  );
}