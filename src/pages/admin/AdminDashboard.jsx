import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  CheckCircle,
  Users,
  KeyRound,
  UserPlus,
  Eye,
  Building2,
  Flag,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { reportReasonLabel } from "../../constants/admin";
import { adminApiFetch, handleAdminAuthError } from "./adminApi";
import { AdminError, AdminLoading, PageHeader, REPORT_STATUS, StatCard, StatusBadge } from "./adminUi";

function TopListingsPreview({ listings }) {
  if (!listings?.length) {
    return (
      <p style={{ padding: 32, textAlign: "center", color: "#94a3b8", fontSize: 13, margin: 0 }}>
        Belum ada listing.
      </p>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#f8fafc" }}>
            {["Kost", "Pemilik", "Views", "Thread chat", "Favorit"].map((h, i) => (
              <th
                key={h}
                style={{
                  textAlign: i >= 2 ? "center" : "left",
                  padding: "11px 16px",
                  color: "#64748b",
                  fontWeight: 600,
                  fontSize: 11,
                  textTransform: "uppercase",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {listings.slice(0, 8).map((l) => (
            <tr key={l.id}>
              <td style={{ padding: "12px 16px", fontWeight: 600, borderBottom: "1px solid #f8fafc" }}>
                {l.name}
              </td>
              <td style={{ padding: "12px 16px", color: "#475569", borderBottom: "1px solid #f8fafc" }}>
                {l.owner?.name ?? "-"}
              </td>
              <td style={{ padding: "12px 16px", textAlign: "center", borderBottom: "1px solid #f8fafc" }}>
                {l.totalViews ?? 0}
              </td>
              <td style={{ padding: "12px 16px", textAlign: "center", borderBottom: "1px solid #f8fafc" }}>
                {l.totalLeads ?? 0}
              </td>
              <td style={{ padding: "12px 16px", textAlign: "center", borderBottom: "1px solid #f8fafc" }}>
                {l.totalFavorites ?? 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReportsPreview({ reports }) {
  if (!reports?.length) {
    return (
      <p style={{ padding: 32, textAlign: "center", color: "#94a3b8", fontSize: 13, margin: 0 }}>
        Tidak ada laporan menunggu tinjauan.
      </p>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#f8fafc" }}>
            {["Pelapor", "Kost", "Alasan", "Status"].map((h) => (
              <th
                key={h}
                style={{
                  textAlign: "left",
                  padding: "11px 16px",
                  color: "#64748b",
                  fontWeight: 600,
                  fontSize: 11,
                  textTransform: "uppercase",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reports.slice(0, 6).map((r) => (
            <tr key={r.id}>
              <td style={{ padding: "12px 16px", fontWeight: 600, borderBottom: "1px solid #f8fafc" }}>
                {r.user?.name ?? "-"}
              </td>
              <td style={{ padding: "12px 16px", color: "#475569", borderBottom: "1px solid #f8fafc" }}>
                {r.listing?.name ?? "-"}
              </td>
              <td style={{ padding: "12px 16px", color: "#475569", borderBottom: "1px solid #f8fafc" }}>
                {reportReasonLabel(r.reason)}
                {r.note ? (
                  <span style={{ display: "block", fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{r.note}</span>
                ) : null}
              </td>
              <td style={{ padding: "12px 16px", borderBottom: "1px solid #f8fafc" }}>
                <StatusBadge status={r.status} map={REPORT_STATUS} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [topListings, setTopListings] = useState([]);
  const [reports, setReports] = useState([]);
  const [pendingListings, setPendingListings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [dashRes, topRes, reportsRes, pendingRes] = await Promise.all([
        adminApiFetch("/admin/dashboard"),
        adminApiFetch("/admin/analytics/top-listings?limit=10"),
        adminApiFetch("/admin/reports?status=PENDING&limit=20"),
        adminApiFetch("/admin/listings/pending"),
      ]);

      setStats(dashRes.data ?? null);
      setTopListings(Array.isArray(topRes.data) ? topRes.data : []);
      setReports(Array.isArray(reportsRes.data) ? reportsRes.data : []);
      const pending = pendingRes?.data ?? pendingRes;
      setPendingListings(Array.isArray(pending) ? pending.length : 0);
    } catch (err) {
      if (handleAdminAuthError(err, navigate)) return;
      setError(err.message || "Gagal memuat dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <AdminLoading />;
  if (error) return <AdminError message={error} onRetry={load} />;

  const pendingReports = reports.length;
  const inactiveListings = Math.max(0, (stats?.totalListings ?? 0) - (stats?.activeListings ?? 0));

  const quickLinks = [
    { to: "/admin/listings", label: "Kelola Listing", desc: `${pendingListings} menunggu review`, icon: Building2, color: "#6366f1" },
    { to: "/admin/reports", label: "Laporan Pengguna", desc: `${pendingReports} belum ditinjau`, icon: Flag, color: "#ef4444" },
    { to: "/admin/analytics", label: "Analitik", desc: "Grafik & performa", icon: Eye, color: "#8b5cf6" },
    { to: "/admin/minat-leads", label: "Leads Minat", desc: "Formulir Saya Minat", icon: MessageSquare, color: "#f59e0b" },
  ];

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: "#0f172a" }}>
      <PageHeader
        title="Dashboard"
        subtitle={new Date().toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
        onRefresh={load}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <StatCard label="Total Listing" value={(stats?.totalListings ?? 0).toLocaleString("id-ID")} icon={Home} accent="#6366f1" />
        <StatCard label="Listing Aktif" value={(stats?.activeListings ?? 0).toLocaleString("id-ID")} icon={CheckCircle} accent="#10b981" />
        <StatCard label="Mahasiswa" value={(stats?.totalStudents ?? 0).toLocaleString("id-ID")} icon={Users} accent="#3b82f6" />
        <StatCard label="Pemilik" value={(stats?.totalOwners ?? 0).toLocaleString("id-ID")} icon={KeyRound} accent="#f59e0b" />
        <StatCard label="User Baru (7 hari)" value={(stats?.newUsersThisWeek ?? 0).toLocaleString("id-ID")} icon={UserPlus} accent="#8b5cf6" />
        <StatCard label="Views Hari Ini" value={(stats?.totalViewsToday ?? 0).toLocaleString("id-ID")} icon={Eye} accent="#ec4899" />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {quickLinks.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 16px",
              background: "#fff",
              border: "1px solid #f1f5f9",
              borderRadius: 12,
              textDecoration: "none",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: `${item.color}12`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <item.icon size={18} color={item.color} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{item.label}</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>{item.desc}</p>
            </div>
            <ChevronRight size={16} color="#cbd5e1" />
          </Link>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 10,
          marginBottom: 20,
          padding: "16px 18px",
          background: "#fff",
          border: "1px solid #f1f5f9",
          borderRadius: 14,
        }}
      >
        {[
          { label: "Listing nonaktif", value: inactiveListings, color: "#64748b" },
          { label: "Laporan pending", value: pendingReports, color: "#ef4444" },
          { label: "Review listing", value: pendingListings, color: "#d97706" },
        ].map((item) => (
          <div key={item.label} style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: item.color }}>{item.value}</p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>{item.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14 }}>
        <section
          style={{
            background: "#fff",
            border: "1px solid #f1f5f9",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 18px",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <Building2 size={16} color="#6366f1" /> Top Listing
            </span>
            <Link to="/admin/analytics" style={{ fontSize: 12, color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>
              Lihat analitik <ChevronRight size={12} style={{ verticalAlign: "middle" }} />
            </Link>
          </div>
          <TopListingsPreview listings={topListings} />
        </section>

        <section
          style={{
            background: "#fff",
            border: "1px solid #f1f5f9",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 18px",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <Flag size={16} color="#ef4444" /> Laporan Pending
            </span>
            <Link to="/admin/reports" style={{ fontSize: 12, color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>
              Kelola laporan <ChevronRight size={12} style={{ verticalAlign: "middle" }} />
            </Link>
          </div>
          <ReportsPreview reports={reports} />
        </section>
      </div>
    </div>
  );
}
