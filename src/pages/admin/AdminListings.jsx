import React, { useState, useEffect, useCallback } from "react";
import {
  Search, Eye, CheckCircle, Clock, XCircle,
  ChevronLeft, ChevronRight, Building2,
  ThumbsUp, ThumbsDown, Star, StarOff,
} from "lucide-react";

const API = "http://localhost:3000";
const getToken = () => localStorage.getItem("token") || localStorage.getItem("access_token") || "";
const authFetch = (url, opts = {}) =>
  fetch(url, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...(opts.headers || {}) } });

const STATUS_CFG = {
  APPROVED: { bg: "bg-emerald-50", text: "text-emerald-600", icon: CheckCircle, label: "Approved" },
  PENDING:  { bg: "bg-amber-50",   text: "text-amber-600",   icon: Clock,       label: "Pending"  },
  REJECTED: { bg: "bg-red-50",     text: "text-red-500",     icon: XCircle,     label: "Rejected" },
};

function StatusBadge({ status }) {
  const c = STATUS_CFG[status?.toUpperCase()] || STATUS_CFG.PENDING;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${c.bg} ${c.text}`}>
      <c.icon size={11} /> {c.label}
    </span>
  );
}

/* ── Confirm modal ── */
function ConfirmModal({ title, desc, confirmLabel, confirmClass, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <h3 className="font-bold text-slate-800 mb-1">{title}</h3>
        <p className="text-sm text-slate-500 mb-5">{desc}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 hover:bg-slate-50">
            Batal
          </button>
          <button onClick={onConfirm} className={`flex-1 h-10 rounded-xl text-white text-sm font-semibold transition-colors ${confirmClass}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminListings() {
  const [listings, setListings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [confirm,  setConfirm]  = useState(null); // { type, id, name }
  const [actioning, setActioning] = useState(null); // id sedang diproses
  const LIMIT = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT, ...(search && { search }) });
      const res = await authFetch(`${API}/admin/listings/pending?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();
      setListings(j.data || j || []);
      setTotal(j.total || (j.data?.length ?? 0));
    } catch (e) {
      console.error("Gagal memuat listings:", e);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  /* Action handler */
  const doAction = async (type, id) => {
    setActioning(id);
    try {
      const urlMap = {
        approve: `${API}/admin/listings/${id}/approve`,
        reject:  `${API}/admin/listings/${id}/reject`,
        premium: `${API}/admin/listings/${id}/premium`,
      };
      const res = await authFetch(urlMap[type], { method: "PATCH" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      load();
    } catch (e) {
      alert(`Gagal melakukan aksi: ${e.message}`);
    } finally {
      setActioning(null);
      setConfirm(null);
    }
  };

  const totalPages = Math.ceil(total / LIMIT) || 1;

  const actionBtn = (icon, tooltip, colorClass, onClick) => (
    <button
      onClick={onClick}
      title={tooltip}
      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-slate-400 ${colorClass}`}
    >
      {icon}
    </button>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Kelola Listing</h1>
        <p className="text-sm text-slate-400 mt-0.5">Listing menunggu persetujuan · {total} item</p>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Cari nama kost..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-xl" />)}</div>
        ) : listings.length === 0 ? (
          <div className="py-20 text-center">
            <Building2 size={32} className="mx-auto text-slate-200 mb-3" />
            <p className="text-sm text-slate-400">Tidak ada listing pending</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 font-semibold bg-slate-50/80 border-b border-slate-100">
                  <th className="text-left px-5 py-3">Nama</th>
                  <th className="text-left px-5 py-3 hidden md:table-cell">Pemilik</th>
                  <th className="text-left px-5 py-3 hidden lg:table-cell">Lokasi</th>
                  <th className="text-left px-5 py-3 hidden sm:table-cell">Tipe</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {listings.map((l) => {
                  const isProcessing = actioning === l.id;
                  const isPremium = l.isPremium;
                  return (
                    <tr key={l.id} className={`transition-colors ${isProcessing ? "opacity-50" : "hover:bg-slate-50/60"}`}>
                      <td className="px-5 py-3.5 font-medium text-slate-700 max-w-[160px]">
                        <div className="flex items-center gap-1.5">
                          {isPremium && <Star size={12} className="text-amber-400 fill-amber-400 flex-shrink-0" />}
                          <span className="block truncate">{l.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell text-xs text-slate-400">
                        {l.owner?.name || l.owner?.email || "—"}
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell text-xs text-slate-400 max-w-[150px]">
                        <span className="block truncate">{l.address || "—"}</span>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className="text-xs capitalize bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-medium">
                          {l.genderType || "Umum"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={l.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          {/* Lihat */}
                          {actionBtn(
                            <Eye size={14} />, "Lihat Detail",
                            "hover:bg-blue-50 hover:text-blue-500",
                            () => window.open(`/detail/${l.id}`, "_blank")
                          )}
                          {/* Approve */}
                          {actionBtn(
                            <ThumbsUp size={14} />, "Approve",
                            "hover:bg-emerald-50 hover:text-emerald-500",
                            () => setConfirm({ type: "approve", id: l.id, name: l.name })
                          )}
                          {/* Reject */}
                          {actionBtn(
                            <ThumbsDown size={14} />, "Reject",
                            "hover:bg-red-50 hover:text-red-500",
                            () => setConfirm({ type: "reject", id: l.id, name: l.name })
                          )}
                          {/* Premium toggle */}
                          {actionBtn(
                            isPremium ? <StarOff size={14} /> : <Star size={14} />,
                            isPremium ? "Hapus Premium" : "Set Premium",
                            "hover:bg-amber-50 hover:text-amber-500",
                            () => setConfirm({ type: "premium", id: l.id, name: l.name })
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-50">
            <span className="text-xs text-slate-400">Halaman {page} dari {totalPages}</span>
            <div className="flex gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm modal */}
      {confirm && (
        <ConfirmModal
          title={{
            approve: "Approve Listing?",
            reject:  "Reject Listing?",
            premium: "Ubah Status Premium?",
          }[confirm.type]}
          desc={`Listing: "${confirm.name}"`}
          confirmLabel={{ approve: "Ya, Approve", reject: "Ya, Reject", premium: "Ya, Ubah" }[confirm.type]}
          confirmClass={{
            approve: "bg-emerald-500 hover:bg-emerald-600",
            reject:  "bg-red-500 hover:bg-red-600",
            premium: "bg-amber-500 hover:bg-amber-600",
          }[confirm.type]}
          onConfirm={() => doAction(confirm.type, confirm.id)}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
}