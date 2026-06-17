import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Building2, CheckCircle, XCircle,
  RefreshCw, AlertTriangle, Search, X, ChevronLeft,
  ChevronRight, MapPin, User, Mail, Phone, Home,
  Calendar, Image as ImageIcon, Layers,
} from "lucide-react";

import { adminApiFetch, handleAdminAuthError } from "./adminApi";
import { resolveMediaUrl } from "../../config/apiBase";
/** Tanpa endpoint admin “semua status” — aktif dari GET /listings (publik), nonaktif dari analytics */
const STATUS_TABS = [
  { key: "ACTIVE", label: "Disetujui (Aktif)" },
  { key: "PENDING", label: "Menunggu" },
  { key: "INACTIVE", label: "Nonaktif" },
  { key: "ALL", label: "Semua" },
];

async function fetchPendingListings() {
  const res = await apiFetch("/admin/listings/pending");
  return Array.isArray(res.data) ? res.data : [];
}

async function fetchActiveListings() {
  const res = await apiFetch("/listings");
  const rows = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
  return rows.map((l) => ({ ...l, status: l.status || "ACTIVE" }));
}

/** Semua listing nonaktif — dari GET /admin/analytics/top-listings (BE tidak filter status) */
async function fetchInactiveListings() {
  const res = await apiFetch("/admin/analytics/top-listings?limit=10000");
  const rows = Array.isArray(res.data) ? res.data : [];
  return rows.filter((l) => (l.status ?? "").toUpperCase() === "INACTIVE");
}

async function apiFetch(path, options = {}) {
  return adminApiFetch(path, options);
}

// ─── Badge ─────────────────────────────────────────────────────────────────
const STATUS_CFG = {
  ACTIVE:   { label: "Aktif",    bg: "#ecfdf5", color: "#059669", dot: "#10b981" },
  PENDING:  { label: "Pending",  bg: "#fffbeb", color: "#d97706", dot: "#f59e0b" },
  INACTIVE: { label: "Nonaktif", bg: "#f8fafc", color: "#64748b", dot: "#94a3b8" },
  REJECTED: { label: "Ditolak", bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
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

// ─── Reject Modal ───────────────────────────────────────────────────────────
function RejectModal({ listing, onConfirm, onClose, loading }) {
  const [reason, setReason] = useState("");
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60,
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: 28, width: 440,
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }}>
        <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700 }}>Tolak Listing</h3>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>
          Berikan alasan penolakan untuk <strong>{listing.name}</strong>
        </p>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Contoh: Foto tidak jelas, informasi tidak lengkap..."
          rows={3}
          style={{
            width: "100%", padding: "10px 12px", borderRadius: 10,
            border: "1.5px solid #e2e8f0", fontSize: 13, resize: "none",
            outline: "none", fontFamily: "inherit", boxSizing: "border-box", color: "#1e1b4b",
          }}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "10px", border: "1.5px solid #e2e8f0",
            borderRadius: 9, background: "#fff", cursor: "pointer",
            fontWeight: 600, fontSize: 13, color: "#475569",
          }}>Batal</button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading || !reason.trim()}
            style={{
              flex: 1, padding: "10px", border: "none",
              borderRadius: 9, background: "#ef4444", cursor: "pointer",
              fontWeight: 600, fontSize: 13, color: "#fff",
              opacity: loading || !reason.trim() ? 0.6 : 1,
            }}
          >
            {loading ? "Memproses..." : "Tolak Listing"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Photo Carousel ─────────────────────────────────────────────────────────
function PhotoCarousel({ photos }) {
  const [idx, setIdx] = useState(0);
  if (!photos?.length) return (
    <div style={{
      width: "100%", height: 200, background: "#f1f5f9", borderRadius: 12,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
    }}>
      <ImageIcon size={32} color="#cbd5e1" />
      <span style={{ fontSize: 13, color: "#94a3b8" }}>Tidak ada foto</span>
    </div>
  );
  return (
    <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", background: "#1e1b4b" }}>
      <img
        src={resolveMediaUrl(photos[idx]?.url ?? photos[idx])}
        alt={`foto-${idx}`}
        style={{ width: "100%", height: 220, objectFit: "cover", display: "block", opacity: 0.95 }}
        onError={e => { e.target.style.display = "none"; }}
      />
      {photos.length > 1 && (
        <>
          <button onClick={() => setIdx(i => (i - 1 + photos.length) % photos.length)} style={{
            position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
            background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%",
            width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#fff",
          }}><ChevronLeft size={16} /></button>
          <button onClick={() => setIdx(i => (i + 1) % photos.length)} style={{
            position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
            background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%",
            width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#fff",
          }}><ChevronRight size={16} /></button>
          <div style={{
            position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)",
            display: "flex", gap: 4,
          }}>
            {photos.map((_, i) => (
              <div key={i} onClick={() => setIdx(i)} style={{
                width: i === idx ? 16 : 6, height: 6, borderRadius: 99,
                background: i === idx ? "#fff" : "rgba(255,255,255,0.5)",
                cursor: "pointer", transition: "all 0.2s",
              }} />
            ))}
          </div>
        </>
      )}
      <div style={{
        position: "absolute", top: 8, right: 8,
        background: "rgba(0,0,0,0.55)", borderRadius: 99,
        padding: "2px 8px", fontSize: 11, color: "#fff", fontWeight: 600,
      }}>
        {idx + 1} / {photos.length}
      </div>
    </div>
  );
}

// ─── Detail Modal ───────────────────────────────────────────────────────────
function DetailModal({ listing, onClose, onApprove, onReject, actionLoading }) {
  // Collect all photos across all room types
  const allPhotos = (listing.roomTypes ?? []).flatMap(rt =>
    (rt.photos ?? []).map(p => p.url ?? p)
  );

  const infoRow = (icon, label, value) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
      <div style={{ color: "#94a3b8", flexShrink: 0, marginTop: 1 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
        <div style={{ fontSize: 13, color: "#1e1b4b", fontWeight: 500, marginTop: 2 }}>{value || "-"}</div>
      </div>
    </div>
  );

  const isAppLoading = actionLoading === `approve-${listing.id}`;
  const isRejLoading = actionLoading?.startsWith(`reject-${listing.id}`);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 50, padding: 16,
    }}>
      <div style={{
        background: "#fff", borderRadius: 18, width: "100%", maxWidth: 580,
        maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
      }}>
        {/* Modal Header */}
        <div style={{
          padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          position: "sticky", top: 0, background: "#fff", zIndex: 1, borderRadius: "18px 18px 0 0",
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e1b4b" }}>{listing.name ?? "-"}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <Badge status={listing.status} />
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "#f1f5f9", border: "none", borderRadius: "50%",
            width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#64748b",
          }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {/* Photos */}
          <PhotoCarousel photos={allPhotos} />

          {/* Info */}
          <div style={{ marginTop: 20 }}>
            {infoRow(<MapPin size={15} />, "Alamat", listing.address ?? listing.location)}
            {infoRow(<User size={15} />, "Pemilik", listing.owner?.name)}
            {infoRow(<Mail size={15} />, "Email Pemilik", listing.owner?.email)}
            {listing.owner?.phone && infoRow(<Phone size={15} />, "No. HP Pemilik", listing.owner.phone)}
            {infoRow(<Calendar size={15} />, "Terdaftar", listing.createdAt ? new Date(listing.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-")}
            {listing.rejectionReason && infoRow(<AlertTriangle size={15} />, "Alasan Penolakan", listing.rejectionReason)}
          </div>

          {/* Room Types */}
          {listing.roomTypes?.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                Tipe Kamar ({listing.roomTypes.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {listing.roomTypes.map((rt, i) => (
                  <div key={rt.id ?? i} style={{
                    background: "#f8fafc", borderRadius: 10, padding: "12px 14px",
                    border: "1px solid #f1f5f9",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#1e1b4b" }}>
                        {rt.name ?? `Tipe ${i + 1}`}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#6366f1" }}>
                        {rt.price ? `Rp ${Number(rt.price).toLocaleString("id-ID")}` : "-"}
                        <span style={{ fontSize: 11, fontWeight: 400, color: "#94a3b8" }}>/bulan</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 12, color: "#64748b" }}>
                      {rt.size && <span><Home size={11} style={{ marginRight: 3 }} />{rt.size}</span>}
                      {rt.availableCount !== undefined && <span><Layers size={11} style={{ marginRight: 3 }} />{rt.availableCount} kamar</span>}
                      <span><ImageIcon size={11} style={{ marginRight: 3 }} />{rt.photos?.length ?? 0} foto</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ marginTop: 24, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(listing.status ?? "").toUpperCase() === "PENDING" && (
              <>
                <button
                  onClick={() => onApprove(listing.id)}
                  disabled={isAppLoading}
                  style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "9px 16px", fontSize: 13, fontWeight: 600,
                    border: "1.5px solid #bbf7d0", background: "#f0fdf4",
                    color: "#16a34a", borderRadius: 9, cursor: "pointer",
                    opacity: isAppLoading ? 0.6 : 1,
                  }}
                >
                  <CheckCircle size={14} />
                  {isAppLoading ? "Memproses..." : "Approve"}
                </button>

                <button
                  onClick={() => { onClose(); onReject(listing); }}
                  disabled={isRejLoading}
                  style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "9px 16px", fontSize: 13, fontWeight: 600,
                    border: "1.5px solid #fecaca", background: "#fef2f2",
                    color: "#dc2626", borderRadius: 9, cursor: "pointer",
                    opacity: isRejLoading ? 0.6 : 1,
                  }}
                >
                  <XCircle size={14} />
                  Tolak
                </button>
              </>
            )}

            {(listing.status ?? "").toUpperCase() === "INACTIVE" && (
              <p style={{ flex: 1, margin: 0, fontSize: 12, color: "#64748b", textAlign: "center", lineHeight: 1.5 }}>
                Nonaktif — setelah owner ajukan aktifkan, listing muncul di tab Menunggu untuk di-approve.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────
export default function AdminListings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [listings, setListings]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [search, setSearch]               = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectTarget, setRejectTarget]   = useState(null);
  const [detailTarget, setDetailTarget]   = useState(null);
  const [statusTab, setStatusTab]         = useState(() => {
    const tab = searchParams.get("tab")?.toUpperCase();
    return ["ACTIVE", "PENDING", "INACTIVE", "ALL"].includes(tab) ? tab : "ACTIVE";
  });
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      let rows = [];

      if (statusTab === "PENDING") {
        rows = await fetchPendingListings();
      } else if (statusTab === "ACTIVE") {
        rows = await fetchActiveListings();
      } else if (statusTab === "INACTIVE") {
        rows = await fetchInactiveListings();
      } else if (statusTab === "ALL") {
        const [pending, active, inactive] = await Promise.all([
          fetchPendingListings(),
          fetchActiveListings(),
          fetchInactiveListings(),
        ]);
        const seen = new Set();
        rows = [...pending, ...active, ...inactive].filter((l) => {
          if (!l?.id || seen.has(l.id)) return false;
          seen.add(l.id);
          return true;
        });
      }

      setListings(rows);
    } catch (err) {
      if (handleAdminAuthError(err, navigate)) return;
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusTab]);

  const handleApprove = async (id) => {
    setActionLoading(`approve-${id}`);
    try {
      await apiFetch(`/admin/listings/${id}/approve`, { method: "PATCH" });
      setListings((prev) =>
        statusTab === "INACTIVE" || statusTab === "ALL"
          ? prev.filter((l) => l.id !== id)
          : prev.map((l) => (l.id === id ? { ...l, status: "ACTIVE" } : l))
      );
      if (statusTab === "ACTIVE") await load();
    } catch (err) {
      alert(err.message || "Gagal mengaktifkan listing");
    } finally {
      setActionLoading(null);
      setDetailTarget(null);
    }
  };

  const handleReject = async (reason) => {
    if (!rejectTarget) return;
    setActionLoading(`reject-${rejectTarget.id}`);
    try {
      await apiFetch(`/admin/listings/${rejectTarget.id}/reject`, {
        method: "PATCH", body: JSON.stringify({ rejectionReason: reason }),
      });
      setRejectTarget(null); await load();
    } catch (err) { alert(err.message); }
    finally { setActionLoading(null); }
  };

  const q = search.toLowerCase();
  const filtered = listings.filter(
    (l) =>
      (l.name ?? "").toLowerCase().includes(q) ||
      (l.owner?.name ?? "").toLowerCase().includes(q) ||
      (l.address ?? "").toLowerCase().includes(q)
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

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 12 }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2.5px solid #e2e8f0", borderTop: "2.5px solid #6366f1", animation: "spin 0.8s linear infinite" }} />
      <span style={{ color: "#94a3b8", fontSize: 13 }}>Memuat listing...</span>
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

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: "#1e1b4b" }}>

      {/* Header */}
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Kelola Listing</h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>
            {listings.length} listing
            {statusTab === "ACTIVE" && " disetujui & aktif (dari katalog publik)"}
            {statusTab === "PENDING" && " menunggu persetujuan"}
            {statusTab === "INACTIVE" && " nonaktif (owner/admin)"}
            {statusTab === "ALL" && " (pending + aktif + nonaktif)"}
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

      {/* Filter status */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusTab(tab.key)}
            style={{
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 9,
              border: statusTab === tab.key ? "1.5px solid #6366f1" : "1px solid #e2e8f0",
              background: statusTab === tab.key ? "#eef2ff" : "#fff",
              color: statusTab === tab.key ? "#4f46e5" : "#64748b",
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <Search size={15} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama kost atau pemilik..."
          style={{
            width: "100%", padding: "10px 12px 10px 36px",
            border: "1px solid #e2e8f0", borderRadius: 10,
            fontSize: 13, outline: "none", background: "#fff",
            boxSizing: "border-box", color: "#1e1b4b",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          }}
        />
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center", color: "#94a3b8" }}>
            <Building2 size={40} color="#e2e8f0" style={{ margin: "0 auto 12px" }} />
            <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>
              {search ? "Tidak ada hasil pencarian" : "Tidak ada listing di tab ini"}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 13 }}>
              {statusTab === "ACTIVE" && "Belum ada listing aktif di katalog"}
              {statusTab === "PENDING" && "Semua listing sudah ditinjau"}
              {statusTab === "INACTIVE" && "Tidak ada listing nonaktif"}
              {statusTab === "ALL" && "Tidak ada data listing"}
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Nama Kost</th>
                <th style={thStyle}>Pemilik</th>
                <th style={thStyle}>Lokasi</th>
                <th style={thStyle}>Tipe Kamar</th>
                <th style={thStyle}>Foto</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Terdaftar</th>
                <th style={thStyle}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => {
                const allPhotos = (l.roomTypes ?? []).flatMap(rt => rt.photos ?? []);
                const firstPhoto = resolveMediaUrl(allPhotos[0]?.url);
                const statusUpper = (l.status ?? "").toUpperCase();
                const isPending = statusUpper === "PENDING";
                const isInactive = statusUpper === "INACTIVE";
                const isAppLoading = actionLoading === `approve-${l.id}`;
                const isRejLoading = actionLoading === `reject-${l.id}`;

                return (
                  <tr key={l.id}
                    style={{ transition: "background 0.15s", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    onClick={() => setDetailTarget(l)}
                  >
                    <td style={{ ...tdStyle, fontWeight: 600, color: "#1e1b4b" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {/* Thumbnail */}
                        <div style={{
                          width: 36, height: 36, borderRadius: 10, background: "#f1f5f9",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0, overflow: "hidden",
                        }}>
                          {firstPhoto
                            ? <img src={firstPhoto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
                            : <Building2 size={16} color="#94a3b8" />
                          }
                        </div>
                        <div>{l.name ?? "-"}</div>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 500, color: "#1e1b4b" }}>{l.owner?.name ?? "-"}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>{l.owner?.email ?? ""}</div>
                    </td>
                    <td style={{ ...tdStyle, maxWidth: 160 }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {l.address ?? l.location ?? "-"}
                      </div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      <span style={{ background: "#f1f5f9", color: "#475569", fontSize: 12, fontWeight: 600, borderRadius: 99, padding: "3px 10px" }}>
                        {l.roomTypes?.length ?? 0} tipe
                      </span>
                    </td>
                    {/* Foto count */}
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      <span style={{ background: allPhotos.length > 0 ? "#F5F3FF" : "#f8fafc", color: allPhotos.length > 0 ? "#A78BFA" : "#94a3b8", fontSize: 12, fontWeight: 600, borderRadius: 99, padding: "3px 10px" }}>
                        {allPhotos.length} foto
                      </span>
                    </td>
                    <td style={tdStyle}><Badge status={l.status} /></td>
                    <td style={{ ...tdStyle, color: "#94a3b8", fontSize: 12 }}>
                      {l.createdAt ? new Date(l.createdAt).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                        {isPending ? (
                          <>
                            <button
                              onClick={() => handleApprove(l.id)}
                              disabled={isAppLoading}
                              style={{
                                display: "flex", alignItems: "center", gap: 5,
                                padding: "6px 12px", fontSize: 12, fontWeight: 600,
                                border: "1px solid #bbf7d0", background: "#f0fdf4",
                                color: "#16a34a", borderRadius: 8, cursor: "pointer",
                                fontFamily: "inherit", opacity: isAppLoading ? 0.6 : 1,
                              }}
                            >
                              <CheckCircle size={13} />
                              {isAppLoading ? "..." : "Approve"}
                            </button>
                            <button
                              onClick={() => setRejectTarget(l)}
                              disabled={isRejLoading}
                              style={{
                                display: "flex", alignItems: "center", gap: 5,
                                padding: "6px 12px", fontSize: 12, fontWeight: 600,
                                border: "1px solid #fecaca", background: "#fef2f2",
                                color: "#dc2626", borderRadius: 8, cursor: "pointer",
                                fontFamily: "inherit", opacity: isRejLoading ? 0.6 : 1,
                              }}
                            >
                              <XCircle size={13} /> Tolak
                            </button>
                          </>
                        ) : isInactive ? (
                          <span style={{ fontSize: 12, color: "#94a3b8" }}>Menunggu pengajuan owner</span>
                        ) : (
                          <span style={{ fontSize: 12, color: "#94a3b8" }}>—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {detailTarget && (
        <DetailModal
          listing={detailTarget}
          onClose={() => setDetailTarget(null)}
          onApprove={handleApprove}
          onReject={(l) => setRejectTarget(l)}
          actionLoading={actionLoading}
        />
      )}

      {/* Reject Modal */}
      {rejectTarget && (
        <RejectModal
          listing={rejectTarget}
          onConfirm={handleReject}
          onClose={() => setRejectTarget(null)}
          loading={!!actionLoading?.startsWith("reject")}
        />
      )}
    </div>
  );
}