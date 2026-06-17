import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Flag, RefreshCw, AlertTriangle, Search,
  CheckCircle, XCircle, User, Building2,
} from "lucide-react";

import { REPORT_REVIEW_ACTIONS, reportReasonLabel } from "../../constants/admin";
import { adminApiFetch, handleAdminAuthError } from "./adminApi";
import { REPORT_STATUS, StatusBadge } from "./adminUi";

// ─── Action Modal ─────────────────────────────────────────────────────────────
function ActionModal({ report, onConfirm, onClose, loading }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: 28, width: 460,
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Flag size={18} color="#ef4444" />
          </div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Tinjau Laporan</h3>
        </div>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "#64748b" }}>
          Laporan terhadap <strong>{report.listing?.name ?? "-"}</strong> oleh <strong>{report.user?.name ?? "-"}</strong>
        </p>

        {/* Detail laporan */}
        <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 14px", marginBottom: 20, fontSize: 13 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
            <span style={{ color: "#94a3b8", fontWeight: 500, width: 80 }}>Alasan</span>
            <span style={{ color: "#1e1b4b", fontWeight: 600 }}>{reportReasonLabel(report.reason)}</span>
          </div>
          {report.note && (
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ color: "#94a3b8", fontWeight: 500, width: 80 }}>Catatan</span>
              <span style={{ color: "#475569" }}>{report.note}</span>
            </div>
          )}
        </div>

        <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: "#1e1b4b" }}>Pilih tindakan:</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px", border: "1.5px solid #e2e8f0",
              borderRadius: 9, background: "#fff", cursor: "pointer",
              fontWeight: 600, fontSize: 13, color: "#475569", flex: 1,
            }}
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm("DISMISS")}
            disabled={loading}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              flex: 1, padding: "10px", border: "1px solid #e2e8f0",
              borderRadius: 9, background: "#f8fafc", cursor: "pointer",
              fontWeight: 600, fontSize: 13, color: "#475569",
              opacity: loading ? 0.6 : 1,
            }}
          >
            <XCircle size={14} /> Abaikan
          </button>
          <button
            onClick={() => onConfirm("DEACTIVATE_LISTING")}
            disabled={loading}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              flex: 1, padding: "10px", border: "none",
              borderRadius: 9, background: "#ef4444", cursor: "pointer",
              fontWeight: 600, fontSize: 13, color: "#fff",
              opacity: loading ? 0.6 : 1,
            }}
          >
            <CheckCircle size={14} /> Nonaktifkan
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminReports() {
  const navigate = useNavigate();
  const [reports, setReports]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [reviewTarget, setReviewTarget]   = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      // GET /admin/reports?status=&limit=50
      // response: { message, data: [...] }
      const query = filterStatus ? `?status=${filterStatus}&limit=50` : "?limit=50";
      const res = await adminApiFetch(`/admin/reports${query}`);
      setReports(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (handleAdminAuthError(err, navigate)) return;
      setError(err.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterStatus]);

  // PATCH /admin/reports/:id → { action: "DISMISS" | "DEACTIVATE_LISTING" }
  const handleReview = async (action) => {
    if (!reviewTarget) return;
    if (!REPORT_REVIEW_ACTIONS.includes(action)) return;
    setActionLoading(`review-${reviewTarget.id}`);
    try {
      await adminApiFetch(`/admin/reports/${reviewTarget.id}`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      });
      setReviewTarget(null);
      await load();
    } catch (err) { alert(err.message); }
    finally { setActionLoading(null); }
  };

  const filtered = reports.filter(r => {
    const q = search.toLowerCase();
    const reasonLabel = reportReasonLabel(r.reason).toLowerCase();
    return (
      (r.listing?.name ?? "").toLowerCase().includes(q) ||
      (r.user?.name ?? "").toLowerCase().includes(q) ||
      (r.reason ?? "").toLowerCase().includes(q) ||
      reasonLabel.includes(q) ||
      (r.note ?? "").toLowerCase().includes(q)
    );
  });

  // Summary
  const pending   = reports.filter(r => (r.status ?? "").toUpperCase() === "PENDING").length;
  const resolved  = reports.filter(r => (r.status ?? "").toUpperCase() === "RESOLVED").length;
  const dismissed = reports.filter(r => (r.status ?? "").toUpperCase() === "DISMISSED").length;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 12 }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2.5px solid #e2e8f0", borderTop: "2.5px solid #6366f1", animation: "spin 0.8s linear infinite" }} />
      <span style={{ color: "#94a3b8", fontSize: 13 }}>Memuat laporan...</span>
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

  const thStyle = {
    textAlign: "left", padding: "11px 16px", color: "#64748b",
    fontWeight: 600, fontSize: 11.5, letterSpacing: "0.04em",
    textTransform: "uppercase", borderBottom: "1px solid #f1f5f9",
    background: "#f8fafc",
  };
  const tdStyle = {
    padding: "14px 16px", color: "#475569",
    borderBottom: "1px solid #f8fafc", verticalAlign: "middle", fontSize: 13,
  };

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: "#1e1b4b" }}>

      {/* Header */}
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Laporan</h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>
            {pending} laporan menunggu tindakan
          </p>
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

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Menunggu", value: pending,   color: "#f59e0b", bg: "#fffbeb" },
          { label: "Selesai",  value: resolved,  color: "#10b981", bg: "#ecfdf5" },
          { label: "Diabaikan", value: dismissed, color: "#64748b", bg: "#f8fafc" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "#fff", border: "1px solid #f1f5f9", borderRadius: 12,
            padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}>
            <div>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#1e1b4b" }}>{s.value}</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Flag size={18} color={s.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={15} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari listing, pelapor, atau alasan..."
            style={{
              width: "100%", padding: "10px 12px 10px 36px",
              border: "1px solid #e2e8f0", borderRadius: 10,
              fontSize: 13, outline: "none", background: "#fff",
              boxSizing: "border-box", color: "#1e1b4b",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{
            padding: "10px 14px", border: "1px solid #e2e8f0",
            borderRadius: 10, fontSize: 13, background: "#fff",
            color: "#475569", cursor: "pointer", outline: "none",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          <option value="">Semua Status</option>
          <option value="PENDING">Menunggu</option>
          <option value="RESOLVED">Selesai</option>
          <option value="DISMISSED">Diabaikan</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center", color: "#94a3b8" }}>
            <Flag size={40} color="#e2e8f0" style={{ margin: "0 auto 12px" }} />
            <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>
              {search ? "Tidak ada hasil pencarian" : "Tidak ada laporan"}
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Pelapor</th>
                <th style={thStyle}>Target Listing</th>
                <th style={thStyle}>Alasan</th>
                <th style={thStyle}>Tanggal</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Ditinjau Oleh</th>
                <th style={thStyle}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const isPending = (r.status ?? "").toUpperCase() === "PENDING";
                const isLoading = actionLoading === `review-${r.id}`;
                return (
                  <tr key={r.id}
                    style={{ transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <User size={14} color="#94a3b8" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "#1e1b4b" }}>{r.user?.name ?? "-"}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>{r.user?.email ?? ""}</div>
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Building2 size={14} color="#94a3b8" />
                        <div>
                          <div style={{ fontWeight: 500, color: "#1e1b4b" }}>{r.listing?.name ?? "-"}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>{r.listing?.status ?? ""}</div>
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 500, color: "#1e1b4b" }}>{reportReasonLabel(r.reason)}</span>
                      {r.note && (
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {r.note}
                        </div>
                      )}
                    </td>
                    <td style={{ ...tdStyle, color: "#94a3b8", fontSize: 12 }}>
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td style={tdStyle}><StatusBadge status={r.status} map={REPORT_STATUS} /></td>
                    <td style={tdStyle}>
                      {r.reviewedBy
                        ? <span style={{ fontSize: 12, color: "#475569" }}>{r.reviewedBy.name}</span>
                        : <span style={{ fontSize: 12, color: "#cbd5e1" }}>-</span>
                      }
                    </td>
                    <td style={tdStyle}>
                      {isPending && (
                        <button
                          onClick={() => setReviewTarget(r)}
                          disabled={isLoading}
                          style={{
                            display: "flex", alignItems: "center", gap: 5,
                            padding: "6px 12px", fontSize: 12, fontWeight: 600,
                            border: "1px solid #e0e7ff", background: "#eef2ff",
                            color: "#4f46e5", borderRadius: 8, cursor: "pointer",
                            fontFamily: "inherit", opacity: isLoading ? 0.6 : 1,
                          }}
                        >
                          <Flag size={12} /> Tinjau
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Action Modal */}
      {reviewTarget && (
        <ActionModal
          report={reviewTarget}
          onConfirm={handleReview}
          onClose={() => setReviewTarget(null)}
          loading={!!actionLoading?.startsWith("review")}
        />
      )}
    </div>
  );
}