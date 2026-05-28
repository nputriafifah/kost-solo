import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Star, RefreshCw, AlertTriangle, Search,
  Phone, Mail, ExternalLink,
} from "lucide-react";
import { adminApiFetch, handleAdminAuthError } from "./adminApi";

const STATUS_CFG = {
  ACTIVE:   { label: "Aktif",    bg: "#ecfdf5", color: "#059669" },
  PENDING:  { label: "Pending",  bg: "#fffbeb", color: "#d97706" },
  INACTIVE: { label: "Nonaktif", bg: "#f8fafc", color: "#64748b" },
  REJECTED: { label: "Ditolak",  bg: "#fef2f2", color: "#dc2626" },
};

function Badge({ status }) {
  const cfg = STATUS_CFG[status?.toUpperCase()] ?? { label: status ?? "-", bg: "#f3f4f6", color: "#374151" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 600,
      borderRadius: 99, padding: "3px 10px", background: cfg.bg, color: cfg.color,
    }}>
      {cfg.label}
    </span>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #f1f5f9", borderRadius: 12,
      padding: "16px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: accent ?? "#0f172a" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

const thStyle = {
  textAlign: "left", padding: "11px 16px", color: "#64748b",
  fontWeight: 600, fontSize: 11.5, letterSpacing: "0.04em",
  textTransform: "uppercase", borderBottom: "1px solid #f1f5f9", background: "#f8fafc",
};

const tdStyle = {
  padding: "13px 16px", borderBottom: "1px solid #f8fafc", color: "#475569", fontSize: 13,
};

function Empty({ icon: Icon, title, desc }) {
  return (
    <div style={{ padding: "48px 24px", textAlign: "center" }}>
      <Icon size={36} color="#e2e8f0" style={{ margin: "0 auto 12px" }} />
      <p style={{ margin: "0 0 6px", fontWeight: 600, color: "#64748b", fontSize: 14 }}>{title}</p>
      {desc && <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", maxWidth: 420, marginInline: "auto", lineHeight: 1.5 }}>{desc}</p>}
    </div>
  );
}

function formatDt(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

function formatPhone(num) {
  if (!num) return "";
  const digits = String(num).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  return digits;
}

function openWhatsApp(phone, name, listingName) {
  const waNum = formatPhone(phone);
  if (!waNum) return;
  const listing = listingName ? ` *${listingName}*` : "";
  const msg = name
    ? `Halo kak ${name}, terima kasih atas minat Anda pada kost${listing}. Apakah masih tertarik?`
    : `Halo kak, terima kasih atas minat Anda pada kost${listing}. Apakah masih tertarik?`;
  window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
}

const waBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  marginTop: 6,
  padding: "5px 10px",
  fontSize: 11,
  fontWeight: 600,
  color: "#fff",
  background: "linear-gradient(135deg, #25D366, #128C7E)",
  border: "none",
  borderRadius: 7,
  cursor: "pointer",
  fontFamily: "inherit",
};

function MinatTable({ rows }) {
  if (!rows?.length) {
    return <Empty icon={Star} title="Belum ada data minat" desc="Calon penyewa yang menekan Saya Minat akan muncul di sini." />;
  }
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {["Calon Penyewa", "Kontak", "Kost", "Kontak Kost", "Tanggal"].map((h) => (
            <th key={h} style={thStyle}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td style={{ ...tdStyle, fontWeight: 600, color: "#0f172a" }}>{row.user?.name ?? "-"}</td>
            <td style={tdStyle}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {row.user?.phone && (
                  <>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                      <Phone size={12} color="#94a3b8" /> {row.user.phone}
                    </span>
                    <button
                      type="button"
                      onClick={() => openWhatsApp(row.user.phone, row.user?.name, row.listing?.name)}
                      style={waBtnStyle}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.555 4.126 1.527 5.858L.057 23.617a.75.75 0 0 0 .92.92l5.818-1.488A11.946 11.946 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                      </svg>
                      WhatsApp
                    </button>
                  </>
                )}
                {row.user?.email && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748b" }}>
                    <Mail size={12} color="#94a3b8" /> {row.user.email}
                  </span>
                )}
                {!row.user?.phone && !row.user?.email && "—"}
              </div>
            </td>
            <td style={tdStyle}>
              <div style={{ fontWeight: 600, color: "#0f172a" }}>{row.listing?.name ?? "-"}</div>
              {row.listing?.status && <div style={{ marginTop: 4 }}><Badge status={row.listing.status} /></div>}
            </td>
            <td style={tdStyle}>{row.listing?.contactNumber ?? "—"}</td>
            <td style={{ ...tdStyle, color: "#94a3b8" }}>{formatDt(row.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function AdminMinatLeads() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const leadsRes = await adminApiFetch("/leads?limit=100");
      setRows(Array.isArray(leadsRes.data) ? leadsRes.data : []);
    } catch (err) {
      if (handleAdminAuthError(err, navigate)) return;
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const q = search.toLowerCase();

  const filteredRows = useMemo(
    () =>
      rows.filter(
        (r) =>
          (r.user?.name ?? "").toLowerCase().includes(q) ||
          (r.user?.phone ?? "").toLowerCase().includes(q) ||
          (r.user?.email ?? "").toLowerCase().includes(q) ||
          (r.listing?.name ?? "").toLowerCase().includes(q)
      ),
    [rows, search]
  );

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2.5px solid #e2e8f0", borderTop: "2.5px solid #6366f1", animation: "spin 0.8s linear infinite" }} />
        <span style={{ color: "#94a3b8", fontSize: 13 }}>Memuat data...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 12 }}>
        <AlertTriangle size={36} color="#f87171" />
        <p style={{ color: "#ef4444", fontWeight: 600, margin: 0 }}>{error}</p>
        <button onClick={load} style={{ padding: "8px 20px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Coba Lagi</button>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: "#0f172a" }}>
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Leads (Saya Minat)</h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>
            Calon penyewa yang mengisi formulir minat pada listing
          </p>
        </div>
        <button onClick={load} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: 9,
          fontSize: 13, fontWeight: 500, cursor: "pointer", color: "#475569",
        }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
        <StatCard label="Total Leads" value={rows.length.toLocaleString("id-ID")} sub="maks. 100 data terbaru dari API" accent="#6366f1" />
        <StatCard label="Hasil Filter" value={filteredRows.length} sub="pencarian aktif" accent="#f59e0b" />
      </div>

      <div style={{
        background: "#fff", border: "1px solid #f1f5f9", borderRadius: 14,
        overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}>
        <div style={{
          display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between",
          gap: 12, padding: "14px 18px", borderBottom: "1px solid #f1f5f9",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#475569" }}>
            <Star size={14} color="#f59e0b" />
            {rows.length} leads terdaftar
          </div>
          <div style={{ position: "relative", minWidth: 240 }}>
            <Search size={14} color="#94a3b8" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="search"
              placeholder="Cari nama penyewa, kontak, atau nama kost..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px 8px 32px", borderRadius: 9,
                border: "1px solid #e2e8f0", fontSize: 13, outline: "none",
              }}
            />
          </div>
        </div>

        <MinatTable rows={filteredRows} />
      </div>

      <p style={{ marginTop: 14, fontSize: 12, color: "#94a3b8" }}>
        Butuh ringkasan per kost? Lihat juga{" "}
        <Link to="/admin/dashboard" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>
          Dashboard <ExternalLink size={11} style={{ display: "inline", verticalAlign: "middle" }} />
        </Link>
      </p>
    </div>
  );
}
