import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Shield, KeyRound, LogOut, Check, X, Pencil } from "lucide-react";
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

function saveAdminUser(partial) {
  const current = readStoredAdmin() || {};
  const next = { ...current, ...partial };
  localStorage.setItem("user", JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("admin-user-updated", { detail: next }));
  return next;
}

export default function AdminProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    const stored = readStoredAdmin();
    if (!stored) {
      navigate("/auth", { replace: true });
      return;
    }
    setUser(stored);
    setNameDraft(stored.name || "");
  }, [navigate]);

  const handleSaveName = () => {
    const trimmed = nameDraft.trim();
    if (trimmed.length < 2) return;
    const next = saveAdminUser({ name: trimmed });
    setUser(next);
    setEditingName(false);
    setSavedMsg("Nama berhasil diperbarui");
    setTimeout(() => setSavedMsg(""), 2500);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth", { replace: true });
  };

  if (!user) return null;

  const initial = (user.name || user.email || "A").charAt(0).toUpperCase();

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: "#0f172a", maxWidth: 640 }}>
      <PageHeader title="Profil Admin" subtitle="Informasi akun dan keamanan" />

      {savedMsg && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 16,
            padding: "10px 14px",
            background: "#ecfdf5",
            border: "1px solid #bbf7d0",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            color: "#059669",
          }}
        >
          <Check size={16} /> {savedMsg}
        </div>
      )}

      {/* Kartu profil */}
      <section
        style={{
          background: "#fff",
          border: "1px solid #f1f5f9",
          borderRadius: 16,
          padding: 24,
          marginBottom: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
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
          border: "1px solid #f1f5f9",
          borderRadius: 16,
          overflow: "hidden",
          marginBottom: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9" }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Informasi Akun</span>
        </div>

        <div style={{ padding: "14px 18px", borderBottom: "1px solid #f8fafc" }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Nama tampilan
          </label>
          {editingName ? (
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input
                type="text"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1.5px solid #c7d2fe",
                  fontSize: 14,
                  outline: "none",
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={handleSaveName}
                style={{
                  padding: "10px 14px",
                  background: "#6366f1",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                <Check size={16} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingName(false);
                  setNameDraft(user.name || "");
                }}
                style={{
                  padding: "10px 14px",
                  background: "#f1f5f9",
                  color: "#64748b",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>{user.name || "—"}</span>
              <button
                type="button"
                onClick={() => setEditingName(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6366f1",
                  background: "#eef2ff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                <Pencil size={13} /> Ubah
              </button>
            </div>
          )}
          <p style={{ margin: "8px 0 0", fontSize: 11, color: "#94a3b8" }}>
            Disimpan di perangkat ini. Perubahan nama di server memerlukan endpoint profil admin.
          </p>
        </div>

        <div style={{ padding: "14px 18px", borderBottom: "1px solid #f8fafc" }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Email
          </label>
          <p style={{ margin: "6px 0 0", fontSize: 15, fontWeight: 500, color: "#475569" }}>{user.email || "—"}</p>
        </div>

        <div style={{ padding: "14px 18px" }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            ID Akun
          </label>
          <p style={{ margin: "6px 0 0", fontSize: 12, fontFamily: "monospace", color: "#64748b", wordBreak: "break-all" }}>
            {user.id || "—"}
          </p>
        </div>
      </section>

      {/* Keamanan */}
      <section
        style={{
          background: "#fff",
          border: "1px solid #f1f5f9",
          borderRadius: 16,
          padding: 18,
          marginBottom: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <KeyRound size={16} color="#6366f1" />
          <span style={{ fontSize: 14, fontWeight: 700 }}>Keamanan</span>
        </div>
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
          Untuk mengganti kata sandi, gunakan halaman lupa password dengan email admin yang terdaftar.
        </p>
        <button
          type="button"
          onClick={() => navigate("/forgot-password")}
          style={{
            padding: "10px 16px",
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
          padding: "12px 20px",
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
