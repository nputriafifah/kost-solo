import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, Eye, MessageSquare, Building2,
  Users, BarChart3, Menu, ArrowUpRight, ArrowDownRight,
  Calendar, BedDouble,
} from "lucide-react";
import Sidebar, { NAV_ITEMS } from "../../components/owner/Sidebar";

const API = "http://localhost:8080";

const MONTH_NAMES = [
  "Jan","Feb","Mar","Apr","Mei","Jun",
  "Jul","Agu","Sep","Okt","Nov","Des",
];

function BottomNav({ active, unreadCount, onNavClick }) {
  const navigate = useNavigate();
  const items = [
    { id: "home",      icon: Building2,     label: "Beranda",  path: "/owner/dashboard" },
    { id: "properti",  icon: Building2,     label: "Properti", path: "/owner/properti"  },
    { id: "akun",      icon: Users,         label: "Profil",   path: "/owner/profil"    },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 flex md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      {items.map(({ id, icon: Icon, label, path, badge }) => {
        const isActive = active === id;
        return (
          <button key={id}
            onClick={() => path ? navigate(path) : onNavClick(id)}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 relative active:scale-95 transition-transform">
            {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-600 rounded-full" />}
            <div className="relative">
              <Icon size={21} strokeWidth={isActive ? 2.5 : 1.8}
                className={isActive ? "text-indigo-600" : "text-slate-400"} />
              {badge && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
              )}
            </div>
            <span className={`text-[10px] font-bold ${isActive ? "text-indigo-600" : "text-slate-400"}`}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default function StatistikPage() {
  const [summary, setSummary]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const user     = JSON.parse(localStorage.getItem("user") || "{}");
  const token    = localStorage.getItem("token");
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${API}/owner/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) { setError(`Gagal memuat data (${res.status})`); return; }
        const json = await res.json();
        setSummary(json.data || json);
      } catch {
        setError("Tidak dapat terhubung ke server.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth");
  };

  // Chart bar data — 6 bulan terakhir (dummy bentuk, value dari summary kalau ada)
  const now = new Date();
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return {
      bulan: MONTH_NAMES[d.getMonth()],
      nilai: Math.floor(30 + Math.random() * 70), // placeholder
    };
  });
  const maxNilai = Math.max(...chartData.map((d) => d.nilai));

  const stats = [
    {
      label: "Total Tayangan",
      value: loading ? "—" : summary?.totalViews?.toLocaleString("id-ID") ?? "—",
      icon: Eye,
      color: "text-indigo-600 bg-indigo-50",
      trend: "+12%",
      up: true,
    },
    {
      label: "Tayangan Hari Ini",
      value: loading ? "—" : summary?.todayViews?.toLocaleString("id-ID") ?? "—",
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-50",
      trend: "+5%",
      up: true,
    },
    {
      label: "Tayangan Minggu Ini",
      value: loading ? "—" : summary?.weeklyViews?.toLocaleString("id-ID") ?? "—",
      icon: BarChart3,
      color: "text-amber-600 bg-amber-50",
      trend: "+8%",
      up: true,
    },
    {
      label: "Total Listing",
      value: loading ? "—" : summary?.totalListings ?? "—",
      icon: Building2,
      color: "text-purple-600 bg-purple-50",
      trend: "0%",
      up: null,
    },
    {
      label: "Listing Aktif",
      value: loading ? "—" : summary?.activeListings ?? "—",
      icon: BedDouble,
      color: "text-indigo-600 bg-indigo-50",
      trend: "+1",
      up: true,
    },
    {
      label: "Total Leads",
      value: loading ? "—" : summary?.totalLeads?.toLocaleString("id-ID") ?? "—",
      icon: Users,
      color: "text-pink-600 bg-pink-50",
      trend: "+18%",
      up: true,
    },
    {
      label: "Chat Aktif",
      value: loading ? "—" : summary?.activeChats ?? "—",
      icon: MessageSquare,
      color: "text-indigo-600 bg-indigo-50",
      trend: "+3",
      up: true,
    },
    {
      label: "Bulan Ini",
      value: `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`,
      icon: Calendar,
      color: "text-slate-600 bg-slate-100",
      trend: null,
      up: null,
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50" style={{ fontFamily: "'Outfit','Inter',sans-serif" }}>
      <Sidebar
        active="statistik"
        onChange={(id) => {
          const item = NAV_ITEMS.find((n) => n.id === id);
          if (item?.path) navigate(item.path);
        }}
        ownerName={user.name || "Owner"}
        initials={initials}
        onLogout={handleLogout}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden md:ml-[255px]">
        {/* Header */}
        <header className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)}
              className="md:hidden w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
              <Menu size={18} className="text-slate-500" />
            </button>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">Laporan Statistik</h2>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Performa & Tayangan Listing</p>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-5 sm:py-6 overflow-y-auto pb-24 md:pb-6 space-y-6">

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-500 text-sm px-4 py-3 rounded-xl">{error}</div>
          )}

          {/* Hero */}
          <div className="relative rounded-3xl p-6 overflow-hidden"
            style={{ background: "linear-gradient(135deg,#1E1B4B 0%,#3730A3 45%,#4F46E5 100%)" }}>
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-indigo-600/40" />
            <div className="absolute top-4 right-20 w-16 h-16 rounded-full bg-indigo-600/25" />
            <div className="relative z-10">
              <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest mb-1">Ringkasan Performa</p>
              <p className="text-white font-black text-xl mb-1">{MONTH_NAMES[now.getMonth()]} {now.getFullYear()}</p>
              <p className="text-indigo-300 text-xs mb-5">Data diperbarui secara real-time dari server</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Total Tayangan", value: loading ? "…" : summary?.totalViews?.toLocaleString("id-ID") ?? "—", icon: Eye },
                  { label: "Listing Aktif",  value: loading ? "…" : summary?.activeListings ?? "—",                      icon: Building2 },
                  { label: "Total Leads",    value: loading ? "…" : summary?.totalLeads?.toLocaleString("id-ID") ?? "—", icon: Users },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="bg-white/15 backdrop-blur rounded-2xl px-3 py-3 flex flex-col items-center gap-1 border border-white/10">
                    <Icon size={14} className="text-white/70" />
                    <p className="text-white font-black text-lg leading-none">{value}</p>
                    <p className="text-indigo-200 text-[9px] font-semibold text-center leading-tight">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div>
            <h3 className="text-slate-800 font-black text-sm mb-3">Semua Metrik</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map(({ label, value, icon: Icon, color, trend, up }) => (
                <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                    <Icon size={16} />
                  </div>
                  <p className="text-xl font-black text-slate-900 leading-none mb-1">
                    {loading && label !== "Bulan Ini"
                      ? <span className="inline-block w-10 h-5 bg-slate-100 animate-pulse rounded" />
                      : value}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold mb-2">{label}</p>
                  {trend && (
                    <div className={`flex items-center gap-0.5 text-[10px] font-black ${up === true ? "text-emerald-500" : up === false ? "text-red-400" : "text-slate-400"}`}>
                      {up === true && <ArrowUpRight size={11} />}
                      {up === false && <ArrowDownRight size={11} />}
                      {trend}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-sm font-black text-slate-800">Tayangan 6 Bulan Terakhir</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Tren performa listing kamu</p>
              </div>
              <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-indigo-600" />
                <span className="text-[10px] font-black text-indigo-600">Tayangan</span>
              </div>
            </div>
            <div className="flex items-end gap-2 h-36">
              {chartData.map((d) => {
                const pct = (d.nilai / maxNilai) * 100;
                return (
                  <div key={d.bulan} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="relative w-full flex items-end justify-center" style={{ height: "120px" }}>
                      <div className="w-full rounded-t-lg transition-all duration-500 group-hover:opacity-80"
                        style={{
                          height: `${pct}%`,
                          background: "linear-gradient(180deg,#A78BFA,#4F46E5)",
                        }}
                      />
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold">{d.bulan}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <p className="text-xs font-black text-amber-700 mb-1">💡 Tips Tingkatkan Performa</p>
            <p className="text-[11px] text-amber-600 leading-relaxed">
              Listing dengan foto lengkap dan deskripsi detail mendapatkan 3x lebih banyak tayangan.
              Pastikan harga dan fasilitas selalu up-to-date.
            </p>
          </div>

        </main>
      </div>

      <BottomNav active="statistik" unreadCount={0} onNavClick={() => {}} />
    </div>
  );
}