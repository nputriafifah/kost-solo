import React, { useState, useEffect } from "react";
import {
  FileText, Download, TrendingUp, Building2,
  Users, CalendarDays, ArrowUpRight, Flag,
  CheckCircle, Clock,
} from "lucide-react";

const API = "http://localhost:3000";
const getToken = () => localStorage.getItem("token") || localStorage.getItem("access_token") || "";
const authFetch = (url, opts = {}) =>
  fetch(url, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...(opts.headers || {}) } });

/* ── Bar chart (pure CSS) ── */
function BarChart({ data = [], color = "#3B82F6" }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-28 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <div className="w-full rounded-t-lg transition-all duration-700"
            style={{ height: `${(d.value / max) * 100}%`, background: color, opacity: 0.75 + (i / data.length) * 0.25 }} />
          <span className="text-[9px] text-slate-400 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function SummaryCard({ icon: Icon, iconBg, iconColor, label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon size={17} className={iconColor} />
        </div>
        <ArrowUpRight size={14} className="text-emerald-400" />
      </div>
      <p className="text-xl font-bold text-slate-800">{value ?? "—"}</p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-emerald-500 font-semibold mt-1">{sub}</p>}
    </div>
  );
}

/* ── Report item status badge ── */
function ReportBadge({ status }) {
  const cfg = {
    PENDING:  { bg: "bg-amber-50",   text: "text-amber-600",   icon: Clock,        label: "Pending"  },
    RESOLVED: { bg: "bg-emerald-50", text: "text-emerald-600", icon: CheckCircle,  label: "Resolved" },
  };
  const c = cfg[status?.toUpperCase()] || cfg.PENDING;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${c.bg} ${c.text}`}>
      <c.icon size={11} /> {c.label}
    </span>
  );
}

export default function AdminReports() {
  const [data,    setData]    = useState(null);
  const [reports, setReports] = useState([]);
  const [period,  setPeriod]  = useState("monthly");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // GET /admin/reports — sesuai adminAnalyticsRoutes
        const res = await authFetch(`${API}/admin/reports?period=${period}`);
        if (res.ok) {
          const j = await res.json();
          // Backend mungkin return { data: { summary, reports, charts } } atau flat
          const body = j.data || j;
          setData(body.summary || body);
          setReports(body.reports || []);
        }
      } catch (e) {
        console.error("Gagal load reports:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [period]);

  /* Mock fallback agar UI tetap kelihatan saat BE belum return semua field */
  const summary = data || {
    totalListings: 148, totalUsers: 324,
    newListings: 18,    newUsers: 41,
    pendingReports: 7,
  };

  const chartListings = data?.listingsByMonth || [
    { label: "Nov", value: 10 }, { label: "Des", value: 14 },
    { label: "Jan", value: 9  }, { label: "Feb", value: 22 },
    { label: "Mar", value: 17 }, { label: "Apr", value: 18 },
  ];
  const chartUsers = data?.usersByMonth || [
    { label: "Nov", value: 28 }, { label: "Des", value: 35 },
    { label: "Jan", value: 20 }, { label: "Feb", value: 50 },
    { label: "Mar", value: 42 }, { label: "Apr", value: 41 },
  ];

  const handleExport = () => {
    alert("Fitur export akan memanggil endpoint /admin/reports/export");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Laporan</h1>
          <p className="text-sm text-slate-400 mt-0.5">Ringkasan performa platform</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden">
            {["weekly", "monthly", "yearly"].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`text-xs font-semibold px-3 py-2 transition-colors ${period === p ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}>
                {{ weekly: "Minggu", monthly: "Bulan", yearly: "Tahun" }[p]}
              </button>
            ))}
          </div>
          <button onClick={handleExport}
            className="flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-600 px-3 py-2 rounded-xl transition-colors">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Summary cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-100 animate-pulse rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard icon={Building2}    iconBg="bg-blue-50"    iconColor="text-blue-500"    label="Total Listing"   value={summary.totalListings} sub={`+${summary.newListings} baru`} />
          <SummaryCard icon={Users}        iconBg="bg-violet-50"  iconColor="text-violet-500"  label="Total Pengguna"  value={summary.totalUsers}    sub={`+${summary.newUsers} baru`}    />
          <SummaryCard icon={TrendingUp}   iconBg="bg-emerald-50" iconColor="text-emerald-500" label="Listing Baru"    value={summary.newListings}   />
          <SummaryCard icon={Flag}         iconBg="bg-red-50"     iconColor="text-red-400"     label="Report Pending"  value={summary.pendingReports} />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-700">Listing Baru</h3>
              <p className="text-xs text-slate-400">per bulan</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <Building2 size={15} className="text-blue-500" />
            </div>
          </div>
          {loading ? <div className="h-28 bg-slate-100 animate-pulse rounded-xl" /> : <BarChart data={chartListings} color="#3B82F6" />}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-700">Pengguna Baru</h3>
              <p className="text-xs text-slate-400">per bulan</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
              <Users size={15} className="text-violet-500" />
            </div>
          </div>
          {loading ? <div className="h-28 bg-slate-100 animate-pulse rounded-xl" /> : <BarChart data={chartUsers} color="#8B5CF6" />}
        </div>
      </div>

      {/* Report list dari BE */}
      {reports.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <h3 className="text-sm font-bold text-slate-700">Daftar Laporan Masuk</h3>
            <Flag size={15} className="text-slate-300" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 font-semibold border-b border-slate-50 bg-slate-50/60">
                  <th className="text-left px-5 py-3">Listing</th>
                  <th className="text-left px-5 py-3 hidden md:table-cell">Pelapor</th>
                  <th className="text-left px-5 py-3 hidden lg:table-cell">Alasan</th>
                  <th className="text-left px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {reports.map((r, i) => (
                  <tr key={r.id || i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-700 max-w-[160px]">
                      <span className="block truncate">{r.listing?.name || r.listingId || "—"}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-xs text-slate-400">
                      {r.reporter?.name || r.reporter?.email || "—"}
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell text-xs text-slate-400 max-w-[200px]">
                      <span className="block truncate">{r.reason || "—"}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <ReportBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}