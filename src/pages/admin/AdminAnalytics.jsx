import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  CheckCircle,
  Users,
  KeyRound,
  UserPlus,
  Eye,
  TrendingUp,
  Building2,
  MessageSquare,
  Heart,
  Clock,
  Star,
} from "lucide-react";
import { adminApiFetch, handleAdminAuthError } from "./adminApi";
import { AdminError, AdminLoading, PageHeader, StatCard } from "./adminUi";

function groupLeadsByDay(leads) {
  const map = new Map();
  for (const lead of leads) {
    if (!lead.createdAt) continue;
    const key = new Date(lead.createdAt).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()]
    .slice(-7)
    .map(([label, count]) => ({ label, count }));
}

function TopListingBars({ listings }) {
  if (!listings?.length) {
    return (
      <p style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 13, margin: 0 }}>
        Belum ada data listing.
      </p>
    );
  }

  const maxViews = Math.max(...listings.map((l) => l.totalViews ?? 0), 1);

  return (
    <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
      {listings.map((l, i) => (
        <div key={l.id}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 6,
              gap: 8,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", flex: 1, minWidth: 0 }}>
              <span style={{ color: "#94a3b8", marginRight: 6 }}>{i + 1}.</span>
              {l.name}
            </span>
            <span style={{ fontSize: 12, color: "#64748b", flexShrink: 0 }}>
              {l.totalViews ?? 0} views
            </span>
          </div>
          <div style={{ height: 8, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${((l.totalViews ?? 0) / maxViews) * 100}%`,
                background: "linear-gradient(90deg, #6366f1, #818cf8)",
                borderRadius: 99,
                transition: "width 0.4s ease",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 4, fontSize: 11, color: "#94a3b8" }}>
            <span>Chat: {l.totalLeads ?? 0}</span>
            <span>Favorit: {l.totalFavorites ?? 0}</span>
            <span>{l.owner?.name ? `Pemilik: ${l.owner.name}` : ""}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function LeadsTrend({ days }) {
  if (!days.length) {
    return (
      <p style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 13, margin: 0 }}>
        Belum ada leads 7 hari terakhir.
      </p>
    );
  }

  const max = Math.max(...days.map((d) => d.count), 1);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 10,
        padding: "16px 20px 24px",
        minHeight: 160,
      }}
    >
      {days.map((d) => (
        <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#6366f1" }}>{d.count}</span>
          <div
            style={{
              width: "100%",
              maxWidth: 48,
              height: `${Math.max(12, (d.count / max) * 100)}px`,
              background: "linear-gradient(180deg, #818cf8, #6366f1)",
              borderRadius: "6px 6px 2px 2px",
            }}
          />
          <span style={{ fontSize: 10, color: "#94a3b8", textAlign: "center" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [topListings, setTopListings] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [leads, setLeads] = useState([]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [dashRes, topRes, pendingRes, leadsRes] = await Promise.all([
        adminApiFetch("/admin/dashboard"),
        adminApiFetch("/admin/analytics/top-listings?limit=12"),
        adminApiFetch("/admin/listings/pending"),
        adminApiFetch("/leads?limit=200"),
      ]);

      setStats(dashRes.data ?? null);
      setTopListings(Array.isArray(topRes.data) ? topRes.data : []);
      const pending = pendingRes?.data ?? pendingRes;
      setPendingCount(Array.isArray(pending) ? pending.length : 0);
      setLeads(Array.isArray(leadsRes.data) ? leadsRes.data : []);
    } catch (err) {
      if (handleAdminAuthError(err, navigate)) return;
      setError(err.message || "Gagal memuat analitik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const leadsByDay = useMemo(() => groupLeadsByDay(leads), [leads]);

  const engagementTotal = useMemo(
    () =>
      topListings.reduce(
        (sum, l) => sum + (l.totalViews ?? 0) + (l.totalLeads ?? 0) + (l.totalFavorites ?? 0),
        0
      ),
    [topListings]
  );

  if (loading) return <AdminLoading />;
  if (error) return <AdminError message={error} onRetry={load} />;

  const statCards = [
    { label: "Total Listing", value: (stats?.totalListings ?? 0).toLocaleString("id-ID"), icon: Home, accent: "#6366f1" },
    { label: "Listing Aktif", value: (stats?.activeListings ?? 0).toLocaleString("id-ID"), icon: CheckCircle, accent: "#10b981" },
    { label: "Mahasiswa (USER)", value: (stats?.totalStudents ?? 0).toLocaleString("id-ID"), icon: Users, accent: "#3b82f6" },
    { label: "Pemilik (OWNER)", value: (stats?.totalOwners ?? 0).toLocaleString("id-ID"), icon: KeyRound, accent: "#f59e0b" },
    { label: "User Baru (7 hari)", value: (stats?.newUsersThisWeek ?? 0).toLocaleString("id-ID"), icon: UserPlus, accent: "#8b5cf6" },
    { label: "Views Hari Ini", value: (stats?.totalViewsToday ?? 0).toLocaleString("id-ID"), icon: Eye, accent: "#ec4899" },
  ];

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: "#0f172a" }}>
      <PageHeader
        title="Analitik"
        subtitle="Metrik platform, performa listing, dan tren leads Saya Minat"
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
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            background: "#fff",
            border: "1px solid #f1f5f9",
            borderRadius: 14,
            padding: "18px 20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <TrendingUp size={16} color="#6366f1" />
            <span style={{ fontWeight: 700, fontSize: 14 }}>Ringkasan Engagement</span>
          </div>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>{engagementTotal.toLocaleString("id-ID")}</p>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "#94a3b8" }}>
            Jumlah views + chat + favorit (top {topListings.length} listing)
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #f1f5f9",
            borderRadius: 14,
            padding: "18px 20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Clock size={16} color="#d97706" />
            <span style={{ fontWeight: 700, fontSize: 14 }}>Listing Menunggu Review</span>
          </div>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#d97706" }}>{pendingCount}</p>
          <Link
            to="/admin/listings"
            style={{ marginTop: 8, display: "inline-block", fontSize: 12, color: "#6366f1", fontWeight: 600, textDecoration: "none" }}
          >
            Kelola listing pending →
          </Link>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #f1f5f9",
            borderRadius: 14,
            padding: "18px 20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Star size={16} color="#f59e0b" />
            <span style={{ fontWeight: 700, fontSize: 14 }}>Total Leads (Saya Minat)</span>
          </div>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>{leads.length.toLocaleString("id-ID")}</p>
          <Link
            to="/admin/minat-leads"
            style={{ marginTop: 8, display: "inline-block", fontSize: 12, color: "#6366f1", fontWeight: 600, textDecoration: "none" }}
          >
            Lihat daftar leads →
          </Link>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 14,
        }}
      >
        <section
          style={{
            background: "#fff",
            border: "1px solid #f1f5f9",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Building2 size={16} color="#6366f1" />
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Top Listing (Views)</h2>
            </div>
          </div>
          <TopListingBars listings={topListings} />
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
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Star size={16} color="#f59e0b" />
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Leads per Hari (7 hari)</h2>
            </div>
          </div>
          <LeadsTrend days={leadsByDay} />
        </section>
      </div>

      <section
        style={{
          marginTop: 14,
          background: "#fff",
          border: "1px solid #f1f5f9",
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Tabel Top Listing</h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Kost", "Pemilik", "Status", "Views", "Chat", "Favorit"].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      textAlign: i >= 3 ? "center" : "left",
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
              {topListings.map((l) => (
                <tr key={l.id}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, borderBottom: "1px solid #f8fafc" }}>
                    {l.name}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#475569", borderBottom: "1px solid #f8fafc" }}>
                    {l.owner?.name ?? "-"}
                  </td>
                  <td style={{ padding: "12px 16px", borderBottom: "1px solid #f8fafc" }}>{l.status}</td>
                  <td style={{ padding: "12px 16px", textAlign: "center", borderBottom: "1px solid #f8fafc" }}>
                    <Eye size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />
                    {l.totalViews ?? 0}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center", borderBottom: "1px solid #f8fafc" }}>
                    <MessageSquare size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />
                    {l.totalLeads ?? 0}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center", borderBottom: "1px solid #f8fafc" }}>
                    <Heart size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />
                    {l.totalFavorites ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
