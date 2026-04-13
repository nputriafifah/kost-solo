import { useEffect, useState } from "react";
import { Search, Plus, LogOut, Building2, Clock, CheckCircle, Home, Zap, Users, BarChart3, TrendingUp, User, ChevronRight, X, Menu, MapPin, BedDouble, Crown, AlertCircle, Edit3, Eye, Trash2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ── Status config ──────────────────────────────────────────
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
  { id: "home", icon: Home, label: "Home" },
  { id: "properti", icon: Building2, label: "Properti Saya" },
  { id: "promosi", icon: Zap, label: "Fitur Promosi" },
  { id: "peminat", icon: Users, label: "Cek Peminat" },
  { id: "manajemen", icon: BarChart3, label: "Manajemen Kos" },
  { id: "statistik", icon: TrendingUp, label: "Laporan Statistik" },
  { id: "akun", icon: User, label: "Akun" },
];

// ── Sidebar ────────────────────────────────────────────────
function Sidebar({ active, onChange, ownerName, initials, onLogout, open, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed top-0 left-0 h-full z-50 bg-white border-r border-slate-100 flex flex-col w-64 transition-transform duration-300 shadow-xl lg:translate-x-0 lg:static lg:shadow-none lg:z-auto ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {/* Logo */}
        <div className="px-6 pt-8 pb-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Building2 size={16} className="text-white" />
              </div>
              <span className="text-lg font-black text-slate-900">
                Atap<span className="text-indigo-600">.</span>owner
              </span>
            </div>
            <button onClick={onClose} className="lg:hidden w-8 h-8 flex items-center justify-center text-slate-400">
              <X size={18} />
            </button>
          </div>
        </div>
        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onChange(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl mb-1 transition-all text-left group ${isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-500 hover:bg-slate-50"}`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-500"} />
                  <span className={`text-sm font-bold ${isActive ? "text-white" : ""}`}>{item.label}</span>
                </div>
                <ChevronRight size={14} className={isActive ? "text-white/60" : "text-slate-300"} />
              </button>
            );
          })}
        </nav>
        {/* User + logout */}
        <div className="px-4 pb-6 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs flex-shrink-0">{initials}</div>
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-900 truncate">{ownerName}</p>
              <p className="text-[10px] text-slate-400 font-semibold">Pemilik Kos</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-500 font-bold text-sm hover:bg-red-100 transition-colors">
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>
    </>
  );
}

// ── OwnerCard (built-in, tidak pakai import) ──────────────
function OwnerCard({ item, onEdit, onDelete, onDetail }) {
  const st = STATUS_CONFIG[item.status] || STATUS_CONFIG["PENDING"];
  const gn = GENDER_STYLE[item.genderType] || { label: item.genderType, style: "bg-slate-50 text-slate-500" };
  const hargaMin = item.roomTypes?.length > 0 ? Math.min(...item.roomTypes.map((r) => r.price)) : null;
  const kamarAvail = item.roomTypes?.reduce((a, r) => a + (r.availableCount || 0), 0) || 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Gambar */}
      {item.roomTypes?.[0]?.photos?.[0]?.url ? (
        <img src={item.roomTypes[0].photos[0].url} alt={item.name} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-slate-100 flex items-center justify-center">
          <Building2 size={32} className="text-slate-300" />
        </div>
      )}
      <div className="px-4 pt-4 pb-3">
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

        <h3 className="text-sm font-black text-slate-900 leading-snug mb-1">{item.name}</h3>
        <div className="flex items-center gap-1 mb-3">
          <MapPin size={11} className="text-slate-300 flex-shrink-0" />
          <p className="text-[11px] text-slate-400 truncate">{item.address}</p>
        </div>

        {/* Rejection reason */}
        {item.status === "REJECTED" && item.rejectionReason && (
          <div className="flex gap-2 bg-red-50 rounded-xl px-3 py-2 mb-3 border border-red-100">
            <AlertCircle size={12} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-red-500 leading-snug">{item.rejectionReason}</p>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2.5 mb-3">
          <div className="text-center">
            <p className="text-sm font-black text-indigo-600">{hargaMin ? `Rp ${(hargaMin / 1000).toFixed(0)}rb` : "-"}</p>
            <p className="text-[10px] text-slate-400 font-semibold">Mulai dari</p>
          </div>
          <div className="w-px h-6 bg-slate-200" />
          <div className="text-center">
            <p className={`text-sm font-black ${kamarAvail > 0 ? "text-emerald-600" : "text-red-400"}`}>{kamarAvail}</p>
            <p className="text-[10px] text-slate-400 font-semibold">Kamar</p>
          </div>
          <div className="w-px h-6 bg-slate-200" />
          <div className="text-center">
            <p className="text-sm font-black text-slate-700">{item.roomTypes?.length || 0}</p>
            <p className="text-[10px] text-slate-400 font-semibold">Tipe</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex border-t border-slate-100">
  <button
    onClick={() => onEdit(item.id)}
    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-indigo-600 font-black text-xs border-r border-slate-100 active:bg-indigo-50 transition-colors"
  >
    <Edit3 size={13} /> Edit
  </button>

  <button
    onClick={() => onDetail(item.id)}
    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-slate-600 font-black text-xs border-r border-slate-100 active:bg-slate-100 transition-colors"
  >
    <Eye size={13} /> Detail
  </button>

  <button
    onClick={() => onDelete(item.id)}
    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-red-400 font-black text-xs active:bg-red-50 transition-colors"
  >
    <Trash2 size={13} /> Hapus
  </button>
</div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────
export default function DashboardOwnerPage() {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("properti");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  // ── Fetch listings (tidak diubah) ──────────────────────
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3000/listings/owner", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const text = await res.text();

let data;
try {
  data = JSON.parse(text);
} catch {
  data = { message: text };
}

console.log("LISTINGS:", data);

// 🔥 handle berbagai bentuk response
if (Array.isArray(data)) {
  setListings(data);
} else if (Array.isArray(data?.data)) {
  setListings(data.data);
} else {
  setListings([]);
}
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  // ── Logout ─────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth");
  };

  const filtered = listings.filter((item) =>
  item.name?.toLowerCase().includes(search.toLowerCase())
);
  const totalActive = listings.filter((l) => l.status === "ACTIVE").length;
  const totalPending = listings.filter((l) => l.status === "PENDING").length;
  const totalKamar = listings.flatMap((l) => l.roomTypes || []).reduce((a, r) => a + (r.availableCount || 0), 0);

  return (
    <div className="flex min-h-screen bg-slate-50" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      {/* SIDEBAR */}
      <Sidebar active={activeNav} onChange={setActiveNav} ownerName={user.name || "Owner"} initials={initials} onLogout={handleLogout} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* TOP BAR */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
              <Menu size={18} className="text-slate-500" />
            </button>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">{NAV_ITEMS.find((n) => n.id === activeNav)?.label}</h2>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Dashboard Pemilik Kos</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/owner/create")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-black shadow-lg shadow-indigo-100 active:scale-95 transition-all"
            >
              <Plus size={15} /> Tambah Kost
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 px-6 py-6 overflow-y-auto">
          {/* HOME */}
          {activeNav === "home" && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="bg-indigo-600 rounded-3xl p-6 text-white relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500 rounded-full opacity-40" />
                <div className="relative z-10">
                  <p className="text-indigo-200 text-sm mb-1">👋 Selamat datang,</p>
                  <h2 className="text-xl font-black mb-1">{user.name || "Owner"}!</h2>
                  <p className="text-indigo-200 text-sm mb-4">Kelola kost kamu dengan mudah di sini.</p>
                  <button onClick={() => navigate("/owner/create")} className="flex items-center gap-2 bg-white text-indigo-600 font-black text-sm px-5 py-2.5 rounded-xl shadow-lg active:scale-95 transition-transform">
                    <Plus size={16} /> Pasang Iklan Baru
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-indigo-50 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-indigo-600">{listings.length}</p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Total Listing</p>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-emerald-600">{totalActive}</p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Listing Aktif</p>
                </div>
                <div className="bg-amber-50 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-amber-600">{totalPending}</p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Menunggu Review</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Building2, label: "Properti Saya", sub: `${listings.length} listing`, nav: "properti", color: "text-indigo-600 bg-indigo-50" },
                  { icon: Zap, label: "Fitur Promosi", sub: "Tingkatkan visibilitas", nav: "promosi", color: "text-amber-600 bg-amber-50" },
                  { icon: Users, label: "Cek Peminat", sub: "Lihat yang tertarik", nav: "peminat", color: "text-emerald-600 bg-emerald-50" },
                  { icon: TrendingUp, label: "Laporan Statistik", sub: "Pantau performa", nav: "statistik", color: "text-violet-600 bg-violet-50" },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button key={m.label} onClick={() => setActiveNav(m.nav)} className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-4 shadow-sm active:scale-95 transition-transform text-left">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${m.color}`}>
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-800 truncate">{m.label}</p>
                        <p className="text-[10px] text-slate-400 truncate">{m.sub}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* PROPERTI SAYA */}
          {activeNav === "properti" && (
            <div className="max-w-4xl mx-auto">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 size={18} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-slate-900">{listings.length}</p>
                    <p className="text-xs text-slate-400 font-semibold">Total</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-slate-900">{totalActive}</p>
                    <p className="text-xs text-slate-400 font-semibold">Aktif</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock size={18} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-slate-900">{totalPending}</p>
                    <p className="text-xs text-slate-400 font-semibold">Pending</p>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-6 flex items-center gap-3 px-4 py-3">
                <Search size={18} className="text-slate-300 flex-shrink-0" />
                <input type="text" placeholder="Cari nama kost..." className="flex-1 outline-none text-sm font-medium text-slate-700 placeholder:text-slate-300 bg-transparent" value={search} onChange={(e) => setSearch(e.target.value)} />
                {search && (
                  <button onClick={() => setSearch("")} className="text-xs text-slate-400 font-bold">
                    Hapus
                  </button>
                )}
              </div>

              {/* Grid */}
              {loading ? (
                <div className="grid grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
                      <div className="h-40 bg-slate-100 rounded-xl mb-4" />
                      <div className="h-4 bg-slate-100 rounded-full mb-2 w-3/4" />
                      <div className="h-3 bg-slate-100 rounded-full w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
                  <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Building2 size={28} className="text-indigo-300" />
                  </div>
                  <h3 className="text-base font-black text-slate-700 mb-1">{search ? "Tidak ditemukan" : "Belum ada kost"}</h3>
                  <p className="text-sm text-slate-400 mb-5">{search ? `Tidak ada kost "${search}"` : "Tambahkan kost pertama kamu!"}</p>
                  {!search && (
                    <button onClick={() => navigate("/owner/create")} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-sm shadow-lg shadow-indigo-100 active:scale-95 transition-transform">
                      Tambah Kost Pertama
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-4">{filtered.length} Kost Ditemukan</p>
                  <div className="grid grid-cols-2 gap-6">
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
          )}

          {/* PROMOSI */}
          {activeNav === "promosi" && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-900">Fitur Promosi</h3>
                <p className="text-xs text-slate-400 mt-0.5">Tingkatkan visibilitas kos kamu</p>
              </div>
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl p-5 text-white flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Zap size={22} className="text-white" />
                </div>
                <div>
                  <p className="font-black text-sm">Kamu saat ini: Paket Gratis</p>
                  <p className="text-indigo-200 text-xs mt-0.5">Upgrade untuk tampil lebih banyak penyewa</p>
                </div>
              </div>
              {[
                { nama: "Paket Gratis", harga: 0, fitur: ["Listing dasar", "Foto maks. 3", "Tampil di pencarian"], aktif: true, btn: "Paket Saat Ini", btnStyle: "bg-slate-100 text-slate-400 cursor-not-allowed" },
                {
                  nama: "Paket Unggulan",
                  harga: 99000,
                  fitur: ["Foto maks. 10", "Prioritas pencarian", "Badge Unggulan", "Statistik lengkap"],
                  aktif: false,
                  btn: "Pilih Paket",
                  btnStyle: "bg-indigo-600 text-white shadow-lg shadow-indigo-100",
                  badge: "Populer",
                },
                {
                  nama: "Paket Premium",
                  harga: 199000,
                  fitur: ["Foto unlimited", "Urutan teratas", "Badge Premium", "Analitik premium"],
                  aktif: false,
                  btn: "Pilih Paket",
                  btnStyle: "bg-amber-500 text-white shadow-lg shadow-amber-100",
                  badge: "Terbaik",
                },
              ].map((p) => (
                <div key={p.nama} className={`bg-white rounded-2xl border-2 p-5 relative ${p.badge === "Populer" ? "border-indigo-200" : p.badge === "Terbaik" ? "border-amber-200" : "border-slate-100"}`}>
                  {p.badge && <span className={`absolute -top-2.5 left-5 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg ${p.badge === "Populer" ? "bg-indigo-600" : "bg-amber-500"}`}>{p.badge}</span>}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{p.nama}</h4>
                      <p className="text-xl font-black text-indigo-600 mt-1">
                        {p.harga === 0 ? "Gratis" : `Rp ${p.harga.toLocaleString("id")}`}
                        {p.harga > 0 && <span className="text-xs text-slate-400 font-medium">/bulan</span>}
                      </p>
                    </div>
                    {p.aktif && <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-100">Aktif</span>}
                  </div>
                  <div className="flex flex-col gap-2 mb-4">
                    {p.fitur.map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle size={13} className="text-indigo-500 flex-shrink-0" />
                        <span className="text-xs text-slate-600 font-medium">{f}</span>
                      </div>
                    ))}
                  </div>
                  <button className={`w-full py-3 rounded-xl font-black text-sm active:scale-95 transition-transform ${p.btnStyle}`} disabled={p.aktif}>
                    {p.btn}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* PEMINAT */}
          {activeNav === "peminat" && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-900">Cek Peminat</h3>
                <p className="text-xs text-slate-400 mt-0.5">Calon penyewa yang tertarik dengan kost kamu</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-indigo-50 rounded-2xl p-3 text-center">
                  <p className="text-xl font-black text-indigo-600">3</p>
                  <p className="text-[10px] text-slate-500 font-semibold">Baru</p>
                </div>
                <div className="bg-amber-50 rounded-2xl p-3 text-center">
                  <p className="text-xl font-black text-amber-600">1</p>
                  <p className="text-[10px] text-slate-500 font-semibold">Dihubungi</p>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-3 text-center">
                  <p className="text-xl font-black text-emerald-600">1</p>
                  <p className="text-[10px] text-slate-500 font-semibold">Sewa</p>
                </div>
              </div>
              {[
                { id: "p1", name: "Alya Putri", kost: "Kost Griya Sruni", tipe: "Tipe AC", waktu: "2 jam lalu", status: "Baru", avatar: "AP", statusStyle: "bg-indigo-50 text-indigo-600" },
                { id: "p2", name: "Budi Santoso", kost: "Kost Griya Sruni", tipe: "Tipe Standar", waktu: "5 jam lalu", status: "Dihubungi", avatar: "BS", statusStyle: "bg-amber-50 text-amber-600" },
                { id: "p3", name: "Citra Dewi", kost: "Kost Melati", tipe: "Tipe Deluxe", waktu: "1 hari lalu", status: "Baru", avatar: "CD", statusStyle: "bg-indigo-50 text-indigo-600" },
                { id: "p4", name: "Dimas Rizky", kost: "Kost Griya Sruni", tipe: "Tipe AC", waktu: "2 hari lalu", status: "Sewa", avatar: "DR", statusStyle: "bg-emerald-50 text-emerald-600" },
              ].map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">{p.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-sm font-black text-slate-900 truncate">{p.name}</p>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 ${p.statusStyle}`}>{p.status}</span>
                    </div>
                    <p className="text-[11px] text-indigo-500 font-bold">
                      {p.tipe} · {p.kost}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{p.waktu}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MANAJEMEN */}
          {activeNav === "manajemen" && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-900">Manajemen Kos</h3>
                <p className="text-xs text-slate-400 mt-0.5">Kelola operasional kos kamu</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: BedDouble, label: "Kelola Kamar", sub: "Atur tipe & harga", color: "bg-indigo-50 text-indigo-600" },
                  { icon: Clock, label: "Jadwal Survei", sub: "Kelola kunjungan", color: "bg-blue-50 text-blue-600" },
                  { icon: CheckCircle, label: "Tagihan & Sewa", sub: "Rekap pembayaran", color: "bg-emerald-50 text-emerald-600" },
                  { icon: BarChart3, label: "Status Kamar", sub: "Pantau ketersediaan", color: "bg-amber-50 text-amber-600" },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button key={m.label} className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-4 shadow-sm active:scale-95 transition-transform text-left hover:border-indigo-100">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${m.color}`}>
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-800">{m.label}</p>
                        <p className="text-[10px] text-slate-400">{m.sub}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STATISTIK */}
          {activeNav === "statistik" && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-900">Laporan Statistik</h3>
                <p className="text-xs text-slate-400 mt-0.5">Pantau performa listing kamu</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-indigo-50 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-indigo-600">128</p>
                  <p className="text-[10px] text-slate-500 font-semibold">Total Dilihat</p>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-emerald-600">24</p>
                  <p className="text-[10px] text-slate-500 font-semibold">Penghuni</p>
                </div>
                <div className="bg-amber-50 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-amber-600">89%</p>
                  <p className="text-[10px] text-slate-500 font-semibold">Tingkat Huni</p>
                </div>
              </div>
              {/* Chart bar sederhana */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Pendapatan 6 Bulan Terakhir</p>
                <div className="flex items-end gap-2 h-32">
                  {[
                    { bulan: "Nov", nilai: 60 },
                    { bulan: "Des", nilai: 75 },
                    { bulan: "Jan", nilai: 55 },
                    { bulan: "Feb", nilai: 90 },
                    { bulan: "Mar", nilai: 70 },
                    { bulan: "Apr", nilai: 100 },
                  ].map((d) => (
                    <div key={d.bulan} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-indigo-600 rounded-t-lg transition-all" style={{ height: `${d.nilai}%` }} />
                      <span className="text-[9px] text-slate-400 font-bold">{d.bulan}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AKUN */}
          {activeNav === "akun" && (
            <div className="max-w-lg mx-auto space-y-4">
              {/* Profile card */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100 flex-shrink-0">{initials}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black text-slate-900 truncate">{user.name || "Owner"}</h3>
                  <p className="text-sm text-slate-400 truncate">{user.email || "-"}</p>
                  <span className="mt-1 inline-block text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">Pemilik Kos</span>
                </div>
              </div>
              {/* Menu */}
              {[
                { icon: User, label: "Edit Profil", sub: user.name || "-", action: () => {} },
                { icon: Building2, label: "Properti Saya", sub: `${listings.length} listing`, action: () => setActiveNav("properti") },
                { icon: Zap, label: "Fitur Promosi", sub: "Upgrade paket kamu", action: () => setActiveNav("promosi") },
                { icon: BarChart3, label: "Laporan Statistik", sub: "Lihat performa listing", action: () => setActiveNav("statistik") },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full flex items-center gap-4 bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm active:scale-95 transition-transform text-left hover:border-indigo-100"
                  >
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800">{item.label}</p>
                      <p className="text-xs text-slate-400 truncate">{item.sub}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                  </button>
                );
              })}
              {/* Logout */}
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 font-black text-sm active:scale-95 transition-transform hover:bg-red-100">
                <LogOut size={16} /> Keluar dari Akun
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Modal hapus */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl">
            <div className="w-14 h-14 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-400" />
            </div>
            <h3 className="text-xl font-black text-slate-900 text-center mb-2">Hapus Listing?</h3>
            <p className="text-sm text-slate-400 text-center mb-6">Semua data kamar dan foto akan dihapus permanen.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3.5 rounded-2xl border border-slate-200 text-slate-500 font-black text-sm">
                Batal
              </button>
              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem("token");

                    const res = await fetch(`http://localhost:3000/listings/owner/${deleteId}/deactivate`, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const text = await res.text();

let data;
try {
  data = JSON.parse(text);
} catch {
  data = { message: text };
}

if (!res.ok) {
  throw new Error(data.message || "Gagal menghapus listing");
}

                    // update UI setelah sukses
                    setListings((p) => p.filter((l) => l.id !== deleteId));
                    setDeleteId(null);
                  } catch (err) {
                    alert(err.message);
                  }
                }}
                className="flex-1 py-3.5 rounded-2xl bg-red-500 text-white font-black text-sm shadow-lg shadow-red-100"
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