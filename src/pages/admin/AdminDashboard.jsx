import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, CheckCircle, Users, KeyRound, UserPlus, Eye,
  AlertTriangle, Flag, RefreshCw, TrendingUp, Building2,
  MessageSquare, Heart, ChevronRight,
} from "lucide-react";

const BASE_URL = "http://localhost:3000";
function getToken() { return localStorage.getItem("token"); }

async function apiFetch(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message || json.error || "Terjadi kesalahan server");
  }
  return res.json();
}

// ─── Badge ────────────────────────────────────────────────────────────────────
const STATUS_CFG = {
  ACTIVE:    { label: "Aktif",    bg: "#ecfdf5", color: "#059669", dot: "#10b981" },
  PENDING:   { label: "Pending",  bg: "#fffbeb", color: "#d97706", dot: "#f59e0b" },
  INACTIVE:  { label: "Nonaktif", bg: "#f9fafb", color: "#6b7280", dot: "#9ca3af" },
  SUSPENDED: { label: "Suspend",  bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
  OPEN:      { label: "Baru",     bg: "#eff6ff", color: "#2563eb", dot: "#3b82f6" },
  RESOLVED:  { label: "Selesai",  bg: "#ecfdf5", color: "#059669", dot: "#10b981" },
};

function Badge({ status }) {
  const cfg = STATUS_CFG[status?.toUpperCase()] ?? { label: status ?? "-", bg: "#f3f4f6", color: "#374151", dot: "#9ca3af" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 12, fontWeight: 600, borderRadius: 99,
      padding: "3px 10px", background: cfg.bg, color: cfg.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, accent, sub }) {
  const [count, setCount] = useState(0);
  const isNum = typeof value === "number";

  useEffect(() => {
    if (!isNum || value === 0) return;
    let cur = 0;
    const step = Math.ceil(value / 40);
    const t = setInterval(() => {
      cur += step;
      if (cur >= value) { setCount(value); clearInterval(t); }
      else setCount(cur);
    }, 18);
    return () => clearInterval(t);
  }, [value]);

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #f1f5f9",
      borderRadius: 14,
      padding: "20px 22px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
      transition: "box-shadow 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)"}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{label}</span>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: accent + "15",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={18} color={accent} strokeWidth={2} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#0f172a", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
          {isNum ? count.toLocaleString("id-ID") : (value ?? "0")}
        </div>
        {sub && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── Top Listings Table ───────────────────────────────────────────────────────
function TopListingsTable({ listings }) {
  if (!listings?.length) return (
    <div style={{ padding: "40px 24px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
      <Building2 size={32} color="#e2e8f0" style={{ margin: "0 auto 8px" }} />
      <p style={{ margin: 0 }}>Tidak ada data listing</p>
    </div>
  );

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ background: "#f8fafc" }}>
          {["Nama Kost", "Pemilik", "Status", "Views", "Leads", "Favorit"].map((h, i) => (
            <th key={i} style={{
              textAlign: i >= 3 ? "center" : "left",
              padding: "11px 16px", color: "#64748b",
              fontWeight: 600, fontSize: 11.5,
              letterSpacing: "0.04em", textTransform: "uppercase",
              borderBottom: "1px solid #f1f5f9",
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {listings.map((l, i) => (
          <tr key={l.id}
            style={{ transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <td style={{ padding: "13px 16px", fontWeight: 600, color: "#0f172a", borderBottom: "1px solid #f8fafc" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color: "#94a3b8", flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                {l.name ?? "-"}
              </div>
            </td>
            <td style={{ padding: "13px 16px", color: "#475569", borderBottom: "1px solid #f8fafc" }}>{l.owner?.name ?? "-"}</td>
            <td style={{ padding: "13px 16px", borderBottom: "1px solid #f8fafc" }}><Badge status={l.status} /></td>
            <td style={{ padding: "13px 16px", textAlign: "center", color: "#475569", borderBottom: "1px solid #f8fafc", fontVariantNumeric: "tabular-nums" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <Eye size={13} color="#94a3b8" /> {l.totalViews ?? 0}
              </div>
            </td>
            <td style={{ padding: "13px 16px", textAlign: "center", color: "#475569", borderBottom: "1px solid #f8fafc", fontVariantNumeric: "tabular-nums" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <MessageSquare size={13} color="#94a3b8" /> {l.totalLeads ?? 0}
              </div>
            </td>
            <td style={{ padding: "13px 16px", textAlign: "center", color: "#475569", borderBottom: "1px solid #f8fafc", fontVariantNumeric: "tabular-nums" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <Heart size={13} color="#94a3b8" /> {l.totalFavorites ?? 0}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Reports Table ────────────────────────────────────────────────────────────
function ReportsTable({ reports, onResolve, actionLoading }) {
  if (!reports?.length) return (
    <div style={{ padding: "40px 24px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
      <Flag size={32} color="#e2e8f0" style={{ margin: "0 auto 8px" }} />
      <p style={{ margin: 0 }}>Tidak ada laporan masuk</p>
    </div>
  );

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ background: "#f8fafc" }}>
          {["Pelapor", "Target", "Kategori", "Tanggal", "Status", "Aksi"].map((h, i) => (
            <th key={i} style={{
              textAlign: "left", padding: "11px 16px", color: "#64748b",
              fontWeight: 600, fontSize: 11.5, letterSpacing: "0.04em",
              textTransform: "uppercase", borderBottom: "1px solid #f1f5f9",
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {reports.map((r) => {
          const status = (r.status ?? "").toUpperCase();
          const isLoading = actionLoading === `report-${r.id}`;
          return (
            <tr key={r.id}
              style={{ transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <td style={{ padding: "13px 16px", fontWeight: 600, color: "#0f172a", borderBottom: "1px solid #f8fafc" }}>
                {r.reporter?.name ?? r.pelapor ?? "-"}
              </td>
              <td style={{ padding: "13px 16px", color: "#475569", borderBottom: "1px solid #f8fafc" }}>
                {r.listing?.name ?? r.listing?.title ?? r.target ?? "-"}
              </td>
              <td style={{ padding: "13px 16px", color: "#475569", borderBottom: "1px solid #f8fafc" }}>
                {r.category ?? r.kategori ?? "-"}
              </td>
              <td style={{ padding: "13px 16px", color: "#94a3b8", borderBottom: "1px solid #f8fafc" }}>
                {r.createdAt ? new Date(r.createdAt).toLocaleDateString("id-ID") : "-"}
              </td>
              <td style={{ padding: "13px 16px", borderBottom: "1px solid #f8fafc" }}>
                <Badge status={r.status} />
              </td>
              <td style={{ padding: "13px 16px", borderBottom: "1px solid #f8fafc" }}>
                {(status === "OPEN" || status === "PENDING") && (
                  <button
                    disabled={isLoading}
                    onClick={() => onResolve(r.id)}
                    style={{
                      padding: "5px 12px", fontSize: 12, fontWeight: 600,
                      border: "1px solid #e0e7ff", background: "#eef2ff",
                      color: "#4f46e5", borderRadius: 7, cursor: "pointer",
                      fontFamily: "inherit", opacity: isLoading ? 0.6 : 1,
                      transition: "all 0.15s",
                    }}
                  >
                    {isLoading ? "..." : "Selesaikan"}
                  </button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats]             = useState(null);
  const [topListings, setTopListings] = useState([]);
  const [reports, setReports]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [activeTab, setActiveTab]     = useState("listing");
  const [actionLoading, setActionLoading] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [dashRes, topRes, reportsRes] = await Promise.all([
        apiFetch("/admin/dashboard"),
        apiFetch("/admin/analytics/top-listings?limit=10"),
        apiFetch("/admin/reports"),
      ]);
      setStats(dashRes.data);
      setTopListings(Array.isArray(topRes.data) ? topRes.data : []);
      const r = reportsRes;
      setReports(Array.isArray(r) ? r : Array.isArray(r?.data) ? r.data : r?.reports ?? []);
    } catch (err) {
      if (err.message === "UNAUTHORIZED") { localStorage.removeItem("token"); navigate("/auth"); }
      else setError(err.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleResolve = async (id) => {
    setActionLoading(`report-${id}`);
    try {
      const res = await fetch(`${BASE_URL}/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ status: "RESOLVED" }),
      });
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.message || "Gagal"); }
      await load();
    } catch (err) { alert(err.message); }
    finally { setActionLoading(null); }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 12 }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2.5px solid #e2e8f0", borderTop: "2.5px solid #6366f1", animation: "spin 0.8s linear infinite" }} />
      <span style={{ color: "#94a3b8", fontSize: 13 }}>Memuat data...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 12 }}>
      <AlertTriangle size={36} color="#f87171" />
      <p style={{ color: "#ef4444", fontWeight: 600, margin: 0 }}>{error}</p>
      <button onClick={load} style={{ padding: "8px 20px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Coba Lagi</button>
    </div>
  );

  const openReports = reports.filter(r => (r.status ?? "").toUpperCase() === "OPEN").length;
  const inactiveListings = (stats?.totalListings ?? 0) - (stats?.activeListings ?? 0);

  const STAT_CARDS = [
    { label: "Total Listing",     value: stats?.totalListings,   icon: Home,       accent: "#6366f1" },
    { label: "Listing Aktif",     value: stats?.activeListings,  icon: CheckCircle, accent: "#10b981" },
    { label: "Total Mahasiswa",   value: stats?.totalStudents,   icon: Users,       accent: "#3b82f6" },
    { label: "Total Pemilik",     value: stats?.totalOwners,     icon: KeyRound,    accent: "#f59e0b" },
    { label: "User Baru",         value: stats?.newUsersThisWeek, icon: UserPlus,   accent: "#8b5cf6", sub: "7 hari terakhir" },
    { label: "Views Hari Ini",    value: stats?.totalViewsToday, icon: Eye,         accent: "#ec4899", sub: "hari ini" },
  ];

  const ATTENTION = [
    { label: "Listing tidak aktif",      value: inactiveListings,        icon: Home,          color: "#f59e0b" },
    { label: "Laporan belum ditangani",  value: openReports,             icon: Flag,          color: "#ef4444" },
    { label: "Listing aktif",            value: stats?.activeListings ?? 0, icon: CheckCircle, color: "#10b981" },
    { label: "Pemilik terdaftar",        value: stats?.totalOwners ?? 0, icon: KeyRound,      color: "#6366f1" },
  ];

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: "#0f172a" }}>

      {/* Header */}
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#0f172a" }}>Dashboard Admin</h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>Ringkasan aktivitas platform kost</p>
        </div>
        <button onClick={load} style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "7px 14px", background: "#fff",
          border: "1px solid #e2e8f0", borderRadius: 9,
          fontSize: 13, fontWeight: 500, cursor: "pointer", color: "#475569",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))", gap: 14, marginBottom: 20 }}>
        {STAT_CARDS.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* Perlu Perhatian */}
      <div style={{
        background: "#fff", border: "1px solid #f1f5f9", borderRadius: 14,
        padding: "20px 22px", marginBottom: 20,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <TrendingUp size={16} color="#6366f1" />
          <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>Perlu Perhatian</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
          {ATTENTION.map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 14px", borderRadius: 10,
              background: item.color + "08", border: `1px solid ${item.color}20`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: item.color + "15",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <item.icon size={15} color={item.color} />
                </div>
                <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>{item.label}</span>
              </div>
              <span style={{ fontWeight: 700, color: item.color, fontSize: 18, fontVariantNumeric: "tabular-nums" }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabel Tab */}
      <div style={{
        background: "#fff", border: "1px solid #f1f5f9",
        borderRadius: 14, overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}>
        {/* Tab header */}
        <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9", padding: "0 22px", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex" }}>
            {[
              { key: "listing", label: "Top Listing", icon: Building2 },
              { key: "report",  label: "Laporan Terbaru", icon: Flag },
            ].map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "14px 0", marginRight: 24,
                background: "none", border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 600,
                color: activeTab === tab.key ? "#6366f1" : "#94a3b8",
                borderBottom: activeTab === tab.key ? "2px solid #6366f1" : "2px solid transparent",
                transition: "all 0.15s",
              }}>
                <tab.icon size={14} />
                {tab.label}
                {tab.key === "report" && openReports > 0 && (
                  <span style={{
                    background: "#ef4444", color: "#fff",
                    fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "1px 6px",
                  }}>{openReports}</span>
                )}
              </button>
            ))}
          </div>
          <a
            href={activeTab === "listing" ? "/admin/listings" : "/admin/reports"}
            style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#6366f1", fontWeight: 600, textDecoration: "none" }}
          >
            Lihat semua <ChevronRight size={13} />
          </a>
        </div>

        {activeTab === "listing" && <TopListingsTable listings={topListings} />}
        {activeTab === "report" && (
          <ReportsTable reports={reports} onResolve={handleResolve} actionLoading={actionLoading} />
        )}
      </div>
    </div>
  );
}