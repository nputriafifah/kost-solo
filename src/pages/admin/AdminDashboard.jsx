import React, { useState, useEffect } from "react";
import {
  Building2, Users, TrendingUp, Eye,
  ArrowUpRight, ArrowDownRight,
  CheckCircle, Clock, XCircle, MoreHorizontal,
} from "lucide-react";

const API = "http://localhost:3000";
const getToken = () => localStorage.getItem("token") || localStorage.getItem("access_token") || "";
const authFetch = (url, opts = {}) =>
  fetch(url, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...(opts.headers || {}) } });

function StatCard({ icon: Icon, iconBg, iconColor, label, value, change, changeUp }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon size={18} className={iconColor} />
        </div>
        {change !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${changeUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
            {changeUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{change}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-800">{value ?? "—"}</p>
      <p className="text-xs text-slate-400 mt-1 font-medium">{label}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    APPROVED: { bg: "bg-emerald-50", text: "text-emerald-600", icon: CheckCircle, label: "Approved" },
    PENDING:  { bg: "bg-amber-50",   text: "text-amber-600",   icon: Clock,       label: "Pending"  },
    REJECTED: { bg: "bg-red-50",     text: "text-red-500",     icon: XCircle,     label: "Rejected" },
  };
  const c = cfg[status?.toUpperCase()] || cfg.PENDING;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${c.bg} ${c.text}`}>
      <c.icon size={11} /> {c.label}
    </span>
  );
}

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [sRes, pRes] = await Promise.all([
          authFetch(`${API}/admin/dashboard`),
          authFetch(`${API}/admin/listings/pending?limit=5`),
        ]);
        if (sRes.ok) { const j = await sRes.json(); setStats(j.data || j); }
        if (pRes.ok) { const j = await pRes.json(); setPending(j.data || j || []); }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const cards = [
    { icon: Building2,  iconBg: "bg-blue-50",    iconColor: "text-blue-500",    label: "Total Listing",  value: stats?.totalListings, change: 12, changeUp: true  },
    { icon: Users,      iconBg: "bg-violet-50",  iconColor: "text-violet-500",  label: "Total Pengguna", value: stats?.totalUsers,    change: 8,  changeUp: true  },
    { icon: Eye,        iconBg: "bg-cyan-50",    iconColor: "text-cyan-500",    label: "Total Tayangan", value: stats?.totalViews?.toLocaleString("id-ID"), change: 3, changeUp: false },
    { icon: TrendingUp, iconBg: "bg-emerald-50", iconColor: "text-emerald-500", label: "Listing Aktif",  value: stats?.activeListings, change: 5, changeUp: true  },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-0.5">Selamat datang kembali, Admin 👋</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) =>
          loading
            ? <div key={i} className="h-28 bg-slate-100 animate-pulse rounded-2xl" />
            : <StatCard key={i} {...c} />
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
          <div>
            <h2 className="text-sm font-bold text-slate-700">Listing Menunggu Persetujuan</h2>
            <p className="text-xs text-slate-400 mt-0.5">Perlu ditinjau segera</p>
          </div>
          <a href="/admin/listings" className="text-xs text-blue-500 font-semibold hover:underline">Lihat semua</a>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-slate-100 animate-pulse rounded-xl" />)}</div>
        ) : pending.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle size={28} className="mx-auto text-slate-200 mb-2" />
            <p className="text-sm text-slate-400">Tidak ada listing pending</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 font-semibold border-b border-slate-50">
                  <th className="text-left px-5 py-3">Nama</th>
                  <th className="text-left px-5 py-3 hidden md:table-cell">Pemilik</th>
                  <th className="text-left px-5 py-3 hidden lg:table-cell">Lokasi</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pending.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-700 max-w-[160px]"><span className="block truncate">{l.name}</span></td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-xs text-slate-400">{l.owner?.name || l.owner?.email || "—"}</td>
                    <td className="px-5 py-3.5 hidden lg:table-cell text-xs text-slate-400 max-w-[150px]"><span className="block truncate">{l.address || "—"}</span></td>
                    <td className="px-5 py-3.5"><StatusBadge status={l.status} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <button className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center ml-auto">
                        <MoreHorizontal size={15} className="text-slate-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}