import { useEffect, useState } from "react";
import {
  Plus, LogOut, Building2, Clock, CheckCircle, Home,
  Zap, Users, BarChart3, TrendingUp, User, ChevronRight,
  MapPin, BedDouble, Crown, AlertCircle, Edit3, Eye, Trash2,
  MessageSquare, Settings, ArrowUpRight, Calendar,
  X, Menu, Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const STATUS_CONFIG = {
  PENDING: { label: "Menunggu Review", bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-400" },
  ACTIVE: { label: "Aktif", bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-400" },
  INACTIVE: { label: "Nonaktif", bg: "bg-slate-100", text: "text-slate-400", dot: "bg-slate-300" },
  REJECTED: { label: "Ditolak", bg: "bg-red-50", text: "text-red-500", dot: "bg-red-400" },
};
const GENDER_STYLE = {
  PUTRA: { label: "Putra", style: "bg-blue-50 text-blue-600" },
  PUTRI: { label: "Putri", style: "bg-pink-50 text-pink-600" },
  CAMPUR: { label: "Campur", style: "bg-violet-50 text-violet-600" },
};

const NAV_ITEMS = [
  { id: "home", icon: Home, label: "Beranda" },
  { id: "properti", icon: Building2, label: "Properti Saya" },
  { id: "pesan", icon: MessageSquare, label: "Pesan", badge: 3 },
  { id: "statistik", icon: BarChart3, label: "Statistik" },
  { id: "akun", icon: User, label: "Profil" },
];

/* ════════════════════════════════════════════════════════
   SIDEBAR  (visible md+, drawer on mobile)
════════════════════════════════════════════════════════ */
function Sidebar({ active, onChange, ownerName, initials, onLogout, open, onClose }) {
  return (
    <>
      {/* Backdrop – mobile only */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          "fixed top-0 left-0 h-full z-50 bg-white border-r border-slate-100",
          "flex flex-col w-64 transition-transform duration-300 shadow-2xl",
          // md+ always visible, static so it pushes content
          "md:static md:translate-x-0 md:shadow-none md:z-auto",
          // mobile: show/hide via open flag
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {/* Logo */}
        <div className="px-6 pt-8 pb-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <Building2 size={15} className="text-white" />
              </div>
              <span className="text-[17px] font-black text-slate-900 tracking-tight">
                Atap<span className="text-indigo-600">.</span>owner
              </span>
            </div>
            <button onClick={onClose} className="md:hidden w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {NAV_ITEMS.map(({ id, icon: Icon, label, badge }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => { onChange(id); onClose(); }}
                className={[
                  "w-full flex items-center justify-between px-4 py-3 rounded-2xl mb-1",
                  "transition-all text-left group",
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                    : "text-slate-500 hover:bg-slate-50",
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-500"} />
                  <span className={`text-sm font-bold ${isActive ? "text-white" : ""}`}>{label}</span>
                </div>
                {badge ? (
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">
                    {badge}
                  </span>
                ) : (
                  <ChevronRight size={14} className={isActive ? "text-white/50" : "text-slate-300"} />
                )}
              </button>
            );
          })}
        </nav>

        {/* User + logout */}
        <div className="px-4 pb-6 pt-4 border-t border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-900 truncate">{ownerName}</p>
              <p className="text-[10px] text-slate-400 font-semibold">Pemilik Kos</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-500 font-bold text-sm hover:bg-red-100 transition-colors"
          >
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>
    </>
  );
}

/* ════════════════════════════════════════════════════════
   BOTTOM NAV  (mobile only, hidden md+)
════════════════════════════════════════════════════════ */
function BottomNav({ active, onChange }) {
  const tabs = [
    { id: "home", icon: Home, label: "Beranda" },
    { id: "properti", icon: Building2, label: "Properti" },
    { id: "pesan", icon: MessageSquare, label: "Pesan", badge: true },
    { id: "akun", icon: User, label: "Profil" },
  ];
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 flex md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {tabs.map(({ id, icon: Icon, label, badge }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 relative active:scale-95 transition-transform"
          >
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-600 rounded-full" />
            )}
            <div className="relative">
              <Icon
                size={21}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={isActive ? "text-indigo-600" : "text-slate-400"}
              />
              {badge && (
                <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
              )}
            </div>
            <span className={`text-[10px] font-bold ${isActive ? "text-indigo-600" : "text-slate-400"}`}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

/* ════════════════════════════════════════════════════════
   OWNER CARD
════════════════════════════════════════════════════════ */
function OwnerCard({ item, onEdit, onDelete, onDetail }) {
  const st = STATUS_CONFIG[item.status] || STATUS_CONFIG["PENDING"];
  const gn = GENDER_STYLE[item.genderType] || { label: item.genderType, style: "bg-slate-50 text-slate-500" };
  const hargaMin = item.roomTypes?.length
    ? Math.min(...item.roomTypes.map((r) => r.price))
    : null;
  const kamarAvail = item.roomTypes?.reduce((a, r) => a + (r.availableCount || 0), 0) || 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {item.roomTypes?.[0]?.photos?.[0]?.url ? (
        <img src={item.roomTypes[0].photos[0].url} alt={item.name} className="w-full h-36 object-cover" />
      ) : (
        <div className="w-full h-36 bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center">
          <Building2 size={28} className="text-indigo-200" />
        </div>
      )}

      <div className="px-4 pt-3 pb-3">
        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-wrap mb-2">
          {item.isPremium && (
            <span className="flex items-center gap-1 text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
              <Crown size={9} /> Premium
            </span>
          )}
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${gn.style}`}>{gn.label}</span>
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${st.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
            <span className={`text-[10px] font-black ${st.text}`}>{st.label}</span>
          </div>
        </div>

        <h3 className="text-sm font-black text-slate-900 leading-snug mb-1 line-clamp-1">{item.name}</h3>
        <div className="flex items-center gap-1 mb-3">
          <MapPin size={10} className="text-slate-300 flex-shrink-0" />
          <p className="text-[11px] text-slate-400 truncate">{item.address}</p>
        </div>

        {item.status === "REJECTED" && item.rejectionReason && (
          <div className="flex gap-2 bg-red-50 rounded-xl px-3 py-2 mb-3 border border-red-100">
            <AlertCircle size={11} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-red-500 leading-snug line-clamp-2">{item.rejectionReason}</p>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2 mb-3">
          <div className="text-center">
            <p className="text-xs font-black text-indigo-600">
              {hargaMin ? `Rp ${(hargaMin / 1000).toFixed(0)}rb` : "-"}
            </p>
            <p className="text-[9px] text-slate-400 font-semibold">Mulai dari</p>
          </div>
          <div className="w-px h-5 bg-slate-200" />
          <div className="text-center">
            <p className={`text-xs font-black ${kamarAvail > 0 ? "text-emerald-600" : "text-red-400"}`}>{kamarAvail}</p>
            <p className="text-[9px] text-slate-400 font-semibold">Tersedia</p>
          </div>
          <div className="w-px h-5 bg-slate-200" />
          <div className="text-center">
            <p className="text-xs font-black text-slate-700">{item.roomTypes?.length || 0}</p>
            <p className="text-[9px] text-slate-400 font-semibold">Tipe</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex border-t border-slate-100">
        <button onClick={() => onEdit(item.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-indigo-600 font-black text-xs border-r border-slate-100 hover:bg-indigo-50 transition-colors">
          <Edit3 size={12} /> Edit
        </button>
        <button onClick={() => onDetail(item.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-slate-500 font-black text-xs border-r border-slate-100 hover:bg-slate-50 transition-colors">
          <Eye size={12} /> Detail
        </button>
        <button onClick={() => onDelete(item.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-red-400 font-black text-xs hover:bg-red-50 transition-colors">
          <Trash2 size={12} /> Hapus
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════ */
export default function DashboardOwnerPage() {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/listings/owner", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { data = {}; }
        if (Array.isArray(data)) setListings(data);
        else if (Array.isArray(data?.data)) setListings(data.data);
        else setListings([]);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth");
  };

  const filtered = listings.filter((l) => l.name?.toLowerCase().includes(search.toLowerCase()));
  const totalActive = listings.filter((l) => l.status === "ACTIVE").length;
  const totalPending = listings.filter((l) => l.status === "PENDING").length;
  const totalKamar = listings.flatMap((l) => l.roomTypes || [])
    .reduce((a, r) => a + (r.availableCount || 0), 0);

  const now = new Date();
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const bulanIni = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

  /* dummy messages */
  const messages = [
    { id: "m1", avatar: "DS", name: "Dinda Safira", dot: "bg-emerald-400", kost: "Kost Melati Indah", preview: "Halo Bu, saya mahasiswi UNS semester 3...", time: "8m", unread: true },
    { id: "m2", avatar: "RA", name: "Rama Aditya", dot: "bg-slate-300", kost: "Kost Melati Indah", preview: "Bolehkah survey hari Sabtu pukul 10?", time: "1j", unread: false },
    { id: "m3", avatar: "AK", name: "Andi Kusuma", dot: "bg-emerald-400", kost: "Kost Griya Sruni", preview: "Kamar tipe AC masih tersedia nggak ya?", time: "2j", unread: true },
    { id: "m4", avatar: "PR", name: "Putri Rahma", dot: "bg-slate-300", kost: "Kost Griya Sruni", preview: "Terima kasih pak, sudah transfer DP.", time: "1h", unread: false },
    { id: "m5", avatar: "BW", name: "Bima Wicaksono", dot: "bg-slate-300", kost: "Kost Melati Indah", preview: "Boleh minta nomor rekening bulan ini?", time: "2h", unread: false },
  ];

  /* ── Content renderers ─────────────────────────────── */
  const renderHome = () => (
    <div className="space-y-6">
      {/* Hero card */}
      <div className="relative bg-indigo-600 rounded-3xl p-6 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-indigo-500/40" />
        <div className="absolute top-4 right-20 w-16 h-16 rounded-full bg-indigo-500/25" />
        <div className="relative z-10">
          <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest mb-1">Ringkasan Bulan Ini</p>
          <p className="text-white font-black text-xl mb-4">{bulanIni}</p>
          <p className="text-indigo-200 text-[11px] font-semibold uppercase tracking-widest mb-1">Pendapatan Bulan Ini</p>
          <div className="flex items-end gap-3 mb-1">
            <span className="text-white font-black text-3xl tracking-tight">Rp 8,2 jt</span>
            <div className="flex items-center gap-1 mb-1 bg-emerald-400/20 px-2 py-0.5 rounded-full">
              <ArrowUpRight size={11} className="text-emerald-300" />
              <span className="text-emerald-300 text-[11px] font-black">+18%</span>
            </div>
          </div>
          <p className="text-indigo-300 text-[11px] mb-5">dari Rp 6,95 jt bulan lalu · 11 dari 12 kamar terisi</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Building2, value: totalActive || 2, label: "Properti aktif" },
              { icon: MessageSquare, value: 7, label: "Pesan baru" },
              { icon: BedDouble, value: "11/12", label: "Kamar terisi" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="bg-white/15 backdrop-blur rounded-2xl px-3 py-3 flex flex-col items-center gap-1 border border-white/10">
                <Icon size={15} className="text-white/70" />
                <p className="text-white font-black text-base leading-none">{value}</p>
                <p className="text-indigo-200 text-[9px] font-semibold text-center leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-slate-800 font-black text-sm mb-3">Aksi cepat</h3>
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-3">
          {[
            { icon: Plus, label: "Tambah kamar", color: "bg-indigo-50 text-indigo-600", action: () => navigate("/owner/create") },
            { icon: Calendar, label: "Atur jadwal survey", color: "bg-blue-50 text-blue-600", action: () => { } },
            { icon: TrendingUp, label: "Tarik pendapatan", color: "bg-emerald-50 text-emerald-600", action: () => { } },
            { icon: Zap, label: "Tingkatkan listing", color: "bg-amber-50 text-amber-600", action: () => { } },
          ].map(({ icon: Icon, label, color, action }) => (
            <button key={label} onClick={action} className="flex flex-col items-center gap-2 active:scale-95 transition-transform">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${color}`}>
                <Icon size={20} />
              </div>
              <span className="text-[10px] text-slate-500 font-semibold text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages preview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-slate-800 font-black text-sm">Permintaan baru</h3>
            <p className="text-[11px] text-slate-400">3 pesan belum dibaca</p>
          </div>
          <button onClick={() => setActiveNav("pesan")} className="text-indigo-600 font-black text-xs flex items-center gap-1">
            Semua pesan <ChevronRight size={12} />
          </button>
        </div>
        <div className="space-y-2">
          {messages.slice(0, 3).map((m) => (
            <button key={m.id} onClick={() => setActiveNav("pesan")}
              className="w-full flex items-center gap-3 bg-white rounded-2xl border border-slate-100 px-4 py-3.5 active:scale-[0.98] transition-transform text-left shadow-sm">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
                  {m.avatar}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${m.dot}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className={`text-sm ${m.unread ? "font-black text-slate-900" : "font-semibold text-slate-600"} truncate`}>{m.name}</p>
                  <span className="text-[10px] text-slate-400 ml-2 flex-shrink-0">{m.time}</span>
                </div>
                <p className="text-[11px] text-indigo-500 font-bold truncate mb-0.5">{m.kost}</p>
                <p className="text-[11px] text-slate-400 truncate">{m.preview}</p>
              </div>
              {m.unread && <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Properti quick */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-slate-800 font-black text-sm">Properti saya</h3>
          <button onClick={() => setActiveNav("properti")} className="text-indigo-600 font-black text-xs flex items-center gap-1">
            Lihat semua <ChevronRight size={12} />
          </button>
        </div>
        {loading ? (
          <div className="space-y-2">{[1, 2].map(i => (
            <div key={i} className="h-16 bg-white rounded-2xl border border-slate-100 animate-pulse" />
          ))}</div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
            <Building2 size={24} className="text-indigo-200 mx-auto mb-2" />
            <p className="text-sm font-black text-slate-600 mb-3">Belum ada properti</p>
            <button onClick={() => navigate("/owner/create")} className="bg-indigo-600 text-white text-xs font-black px-4 py-2 rounded-xl">
              Tambah Sekarang
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {listings.slice(0, 3).map((item) => {
              const st = STATUS_CONFIG[item.status] || STATUS_CONFIG["PENDING"];
              const kamarAvail = item.roomTypes?.reduce((a, r) => a + (r.availableCount || 0), 0) || 0;
              return (
                <button key={item.id} onClick={() => navigate(`/owner/listing/${item.id}`)}
                  className="w-full flex items-center gap-3 bg-white rounded-2xl border border-slate-100 px-4 py-3 active:scale-[0.98] transition-transform text-left shadow-sm hover:border-indigo-100">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <Building2 size={17} className="text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{item.address}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${st.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      <span className={`text-[9px] font-black ${st.text}`}>{st.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">{kamarAvail} kamar</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderProperti = () => (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: listings.length, color: "text-indigo-600 bg-indigo-50" },
          { label: "Aktif", value: totalActive, color: "text-emerald-600 bg-emerald-50" },
          { label: "Pending", value: totalPending, color: "text-amber-600 bg-amber-50" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl px-3 py-4 text-center ${s.color}`}>
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-[10px] font-semibold opacity-70 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 px-4 py-3">
        <Search size={16} className="text-slate-300 flex-shrink-0" />
        <input
          type="text"
          placeholder="Cari nama kost..."
          className="flex-1 outline-none text-sm font-medium text-slate-700 placeholder-slate-300 bg-transparent"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-xs text-slate-400 font-bold">Hapus</button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 animate-pulse">
              <div className="h-36 bg-slate-100 rounded-xl mb-3" />
              <div className="h-4 bg-slate-100 rounded-full mb-2 w-3/4" />
              <div className="h-3 bg-slate-100 rounded-full w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Building2 size={26} className="text-indigo-200" />
          </div>
          <h3 className="text-base font-black text-slate-700 mb-1">
            {search ? "Tidak ditemukan" : "Belum ada kost"}
          </h3>
          <p className="text-sm text-slate-400 mb-5">
            {search ? `Tidak ada kost "${search}"` : "Tambahkan kost pertama kamu!"}
          </p>
          {!search && (
            <button onClick={() => navigate("/owner/create")}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-sm shadow-lg shadow-indigo-100">
              Tambah Kost Pertama
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-400 font-black uppercase tracking-widest">
            {filtered.length} Kost Ditemukan
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <OwnerCard
                key={item.id}
                item={item}
                onEdit={(id) => navigate(`/owner/edit/${id}`)}
                onDetail={(id) => navigate(`/owner/listing/${id}`)}
                onDelete={(id) => setDeleteId(id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );

  const renderPesan = () => (
    <div className="space-y-3 max-w-2xl">
      <div className="grid grid-cols-3 gap-3 mb-2">
        {[
          { label: "Baru", value: 3, color: "text-indigo-600 bg-indigo-50" },
          { label: "Dihubungi", value: 1, color: "text-amber-600 bg-amber-50" },
          { label: "Sewa", value: 1, color: "text-emerald-600 bg-emerald-50" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl px-3 py-3 text-center ${s.color}`}>
            <p className="text-xl font-black">{s.value}</p>
            <p className="text-[10px] font-semibold opacity-70">{s.label}</p>
          </div>
        ))}
      </div>
      {messages.map((m) => (
        <button key={m.id}
          className="w-full flex items-center gap-3 bg-white rounded-2xl border border-slate-100 px-4 py-4 active:scale-[0.98] transition-transform text-left shadow-sm hover:border-indigo-100">
          <div className="relative flex-shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
              {m.avatar}
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${m.dot}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <p className={`text-sm ${m.unread ? "font-black text-slate-900" : "font-semibold text-slate-600"} truncate`}>{m.name}</p>
              <span className="text-[10px] text-slate-400 ml-2 flex-shrink-0">{m.time}</span>
            </div>
            <p className="text-[11px] text-indigo-500 font-bold truncate mb-0.5">{m.kost}</p>
            <p className={`text-[11px] truncate ${m.unread ? "text-slate-700 font-medium" : "text-slate-400"}`}>{m.preview}</p>
          </div>
          {m.unread && <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />}
        </button>
      ))}
    </div>
  );

  const renderStatistik = () => (
    <div className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Dilihat", value: 128, color: "text-indigo-600 bg-indigo-50" },
          { label: "Penghuni", value: 24, color: "text-emerald-600 bg-emerald-50" },
          { label: "Tingkat Huni", value: "89%", color: "text-amber-600 bg-amber-50" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl px-3 py-4 text-center ${s.color}`}>
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-[10px] font-semibold opacity-70 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Pendapatan 6 Bulan Terakhir</p>
        <div className="flex items-end gap-2 h-36">
          {[
            { bulan: "Nov", nilai: 60 }, { bulan: "Des", nilai: 75 }, { bulan: "Jan", nilai: 55 },
            { bulan: "Feb", nilai: 90 }, { bulan: "Mar", nilai: 70 }, { bulan: "Apr", nilai: 100 },
          ].map((d) => (
            <div key={d.bulan} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-indigo-600 rounded-t-lg transition-all hover:bg-indigo-500"
                style={{ height: `${d.nilai}%` }} />
              <span className="text-[9px] text-slate-400 font-bold">{d.bulan}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAkun = () => (
    <div className="space-y-4 max-w-lg">
      <div className="bg-indigo-600 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-indigo-500/40" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur border border-white/20 flex items-center justify-center text-white font-black text-xl">
            {initials}
          </div>
          <div>
            <h2 className="text-white font-black text-lg">{user.name || "Owner"}</h2>
            <p className="text-indigo-200 text-xs">{user.email || "-"}</p>
            <span className="mt-1 inline-block text-[10px] font-black text-indigo-700 bg-white/90 px-2.5 py-0.5 rounded-full">
              Pemilik Kos
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Listing", value: listings.length },
          { label: "Aktif", value: totalActive },
          { label: "Kamar", value: totalKamar },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-3 py-4 text-center">
            <p className="text-xl font-black text-slate-900">{s.value}</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {[
        { icon: User, label: "Edit Profil", sub: user.name || "-", action: () => { } },
        { icon: Building2, label: "Properti Saya", sub: `${listings.length} listing`, action: () => setActiveNav("properti") },
        { icon: Zap, label: "Fitur Promosi", sub: "Upgrade paket kamu", action: () => { } },
        { icon: BarChart3, label: "Laporan Statistik", sub: "Lihat performa listing", action: () => setActiveNav("statistik") },
        { icon: Settings, label: "Pengaturan", sub: "Notifikasi & preferensi", action: () => { } },
      ].map(({ icon: Icon, label, sub, action }) => (
        <button key={label} onClick={action}
          className="w-full flex items-center gap-4 bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm active:scale-[0.98] transition-transform text-left hover:border-indigo-100">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon size={18} className="text-indigo-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800">{label}</p>
            <p className="text-xs text-slate-400 truncate">{sub}</p>
          </div>
          <ChevronRight size={15} className="text-slate-300" />
        </button>
      ))}

      <button onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 font-black text-sm active:scale-[0.98] hover:bg-red-100 transition-colors">
        <LogOut size={15} /> Keluar dari Akun
      </button>
    </div>
  );

  const pageTitle = NAV_ITEMS.find((n) => n.id === activeNav)?.label || "";

  return (
    <div className="flex min-h-screen bg-slate-50" style={{ fontFamily: "'Plus Jakarta Sans','Inter',sans-serif" }}>

      {/* ── SINGLE SIDEBAR (drawer on mobile, static on md+) ── */}
      <Sidebar
        active={activeNav}
        onChange={setActiveNav}
        ownerName={user.name || "Owner"}
        initials={initials}
        onLogout={handleLogout}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── MAIN ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">

        {/* Top bar */}
        <header className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Hamburger – mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center"
            >
              <Menu size={18} className="text-slate-500" />
            </button>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">{pageTitle}</h2>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Dashboard Pemilik Kos</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/owner/create")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-black shadow-lg shadow-indigo-100 active:scale-95 transition-all"
          >
            <Plus size={14} />
            <span className="hidden xs:inline">Tambah Kost</span>
            <span className="xs:hidden">Tambah</span>
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 sm:px-6 py-5 sm:py-6 overflow-y-auto pb-24 md:pb-6">
          {activeNav === "home" && renderHome()}
          {activeNav === "properti" && renderProperti()}
          {activeNav === "pesan" && renderPesan()}
          {activeNav === "statistik" && renderStatistik()}
          {activeNav === "akun" && renderAkun()}
        </main>
      </div>

      {/* ── BOTTOM NAV (mobile only) ─────────────────────── */}
      <BottomNav active={activeNav} onChange={setActiveNav} />

      {/* ── DELETE MODAL ─────────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl">
            <div className="w-14 h-14 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-400" />
            </div>
            <h3 className="text-xl font-black text-slate-900 text-center mb-2">Hapus Listing?</h3>
            <p className="text-sm text-slate-400 text-center mb-6">Semua data kamar dan foto akan dihapus permanen.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-3.5 rounded-2xl border border-slate-200 text-slate-500 font-black text-sm hover:bg-slate-50 transition-colors">
                Batal
              </button>
              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem("token");
                    const res = await fetch(`http://localhost:3000/listings/owner/${deleteId}/deactivate`, {
                      method: "PATCH",
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    const text = await res.text();
                    let data;
                    try { data = JSON.parse(text); } catch { data = { message: text }; }
                    if (!res.ok) throw new Error(data.message || "Gagal menghapus");
                    setListings((p) => p.filter((l) => l.id !== deleteId));
                    setDeleteId(null);
                  } catch (err) { alert(err.message); }
                }}
                className="flex-1 py-3.5 rounded-2xl bg-red-500 text-white font-black text-sm shadow-lg shadow-red-100 hover:bg-red-600 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}