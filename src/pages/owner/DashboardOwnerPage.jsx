import { useEffect, useState } from "react";
import {
  Plus, LogOut, Building2, Home,
  Zap, BarChart3, TrendingUp, User, ChevronRight,
  BedDouble, Edit3, Eye, Trash2,
  MessageSquare, Settings, ArrowUpRight, Calendar,
  Menu, Search, CheckCheck, Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar, { NAV_ITEMS } from "./Sidebar";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const API = "http://localhost:8080";

const STATUS_CONFIG = {
  PENDING: { label: "Menunggu Review", bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-400" },
  ACTIVE: { label: "Aktif", bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-400" },
  INACTIVE: { label: "Nonaktif", bg: "bg-slate-100", text: "text-slate-400", dot: "bg-slate-300" },
  REJECTED: { label: "Ditolak", bg: "bg-red-50", text: "text-red-500", dot: "bg-red-400" },
};

const BOTTOM_NAV_ITEMS = [
  { id: "home", icon: Home, label: "Beranda", path: "/owner/dashboard" },
  { id: "properti", icon: Building2, label: "Properti", path: "/owner/properti" },
  { id: "pesan", icon: MessageSquare, label: "Pesan", path: null, badge: true },
  { id: "akun", icon: User, label: "Profil", path: null },
];

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const GRADIENTS = [
  "linear-gradient(135deg,#3B82F6,#22D3EE)",
  "linear-gradient(135deg,#8B5CF6,#22D3EE)",
  "linear-gradient(135deg,#10B981,#3B82F6)",
  "linear-gradient(135deg,#F59E0B,#F97316)",
  "linear-gradient(135deg,#EC4899,#FB7185)",
];
const avatarGradient = (id) =>
  GRADIENTS[parseInt(id?.slice(-4) || "0", 16) % GRADIENTS.length];

function formatTime(date) {
  const now = new Date();
  const diffDays = Math.floor((now - date) / 86_400_000);
  if (diffDays === 0)
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Kemarin";
  if (diffDays < 7) return date.toLocaleDateString("id-ID", { weekday: "short" });
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────

function BottomNav({ active, unreadCount }) {
  const navigate = useNavigate();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 flex md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {BOTTOM_NAV_ITEMS.map(({ id, icon: Icon, label, path, badge }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => path && navigate(path)}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 relative active:scale-95 transition-transform"
          >
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-600 rounded-full" />
            )}
            <div className="relative">
              <Icon size={21} strokeWidth={isActive ? 2.5 : 1.8} className={isActive ? "text-indigo-600" : "text-slate-400"} />
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

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function DashboardOwnerPage() {
  const [listings, setListings] = useState([]);
  const [listingLoading, setListingLoading] = useState(true);

  // ── state dashboard summary (dari /owner/dashboard) ──
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);
  // ──────────────────────────────────────────────────────

  const [chats, setChats] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(true);

  const [activeNav, setActiveNav] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  // ── fetch dashboard summary ──────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${API}/owner/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401 || res.status === 403) {
          setSummaryError("Sesi tidak valid. Silakan login ulang.");
          return;
        }
        if (!res.ok) {
          setSummaryError(`Gagal memuat statistik (${res.status})`);
          return;
        }
        const json = await res.json();
        setSummary(json.data || json);
      } catch (err) {
        console.error("summary error:", err);
        setSummaryError("Tidak dapat terhubung ke server.");
      } finally {
        setSummaryLoading(false);
      }
    })();
  }, [token]);

  // ── fetch listings ───────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/listings/owner`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { data = {}; }
        if (Array.isArray(data)) setListings(data);
        else if (Array.isArray(data?.data)) setListings(data.data);
        else setListings([]);
      } catch (err) { console.error(err); }
      finally { setListingLoading(false); }
    })();
  }, []);

  // ── fetch chats ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${API}/chats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const json = await res.json();
        const raw = Array.isArray(json.data) ? json.data : [];
        setChats(raw.map((thread) => {
          const lm = thread.lastMessage;
          return {
            id: thread.id,
            name: thread.displayName || thread.student?.name || "Calon Penyewa",
            kost: thread.listing?.name || "-",
            lastMessage: lm?.message || "Belum ada pesan",
            time: lm?.sentAt ? formatTime(new Date(lm.sentAt)) : "",
            unread: lm && !lm.readAt && lm.senderId !== user?.id ? 1 : 0,
            isRead: lm ? !!lm.readAt : true,
          };
        }));
      } catch (err) {
        console.error("chats error:", err);
      } finally {
        setChatsLoading(false);
      }
    })();
  }, [token, user?.id]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth");
  };

  // ── derived values ───────────────────────────────────────────────────────────
  // Prioritaskan data dari summary BE, fallback ke listing local kalau summary belum ada
  const totalActive = summary?.activeListings ?? listings.filter((l) => l.status === "ACTIVE").length;
  const totalKamar = listings.flatMap((l) => l.roomTypes || []).reduce((a, r) => a + (r.availableCount || 0), 0);
  const totalUnread = chats.reduce((acc, c) => acc + c.unread, 0);
  const now = new Date();
  const bulanIni = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
  const pageTitle = NAV_ITEMS.find((n) => n.id === activeNav)?.label ?? "";

  // ── Tab renderers ────────────────────────────────────────────────────────────

  const renderHome = () => (
    <div className="space-y-6">
      {/* Hero card */}
      <div className="relative bg-indigo-600 rounded-3xl p-6 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-indigo-500/40" />
        <div className="absolute top-4 right-20 w-16 h-16 rounded-full bg-indigo-500/25" />
        <div className="relative z-10">
          <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest mb-1">Ringkasan Bulan Ini</p>
          <p className="text-white font-black text-xl mb-4">{bulanIni}</p>

          {/* Stats grid — dari summary BE */}
          {summaryLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white/10 rounded-2xl h-16 animate-pulse" />
              ))}
            </div>
          ) : summaryError ? (
            <p className="text-red-300 text-xs mb-4">{summaryError}</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[
                { icon: Building2, value: summary?.totalListings ?? "—", label: "Total listing" },
                { icon: Eye, value: summary?.todayViews?.toLocaleString("id-ID") ?? "—", label: "Tayangan hari ini" },
                { icon: MessageSquare, value: summary?.activeChats ?? totalUnread, label: "Chat aktif" },
                { icon: TrendingUp, value: summary?.weeklyViews?.toLocaleString("id-ID") ?? "—", label: "Tayangan minggu ini" },
                { icon: BedDouble, value: totalActive, label: "Listing aktif" },
                { icon: User, value: summary?.totalLeads?.toLocaleString("id-ID") ?? "—", label: "Total leads" },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="bg-white/15 backdrop-blur rounded-2xl px-3 py-3 flex flex-col items-center gap-1 border border-white/10">
                  <Icon size={15} className="text-white/70" />
                  <p className="text-white font-black text-base leading-none">{value}</p>
                  <p className="text-indigo-200 text-[9px] font-semibold text-center leading-tight">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-slate-800 font-black text-sm mb-3">Aksi cepat</h3>
        <div className="grid grid-cols-4 gap-3">
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

      {/* Stats ringkas row — totalViews dari BE */}
      {!summaryLoading && !summaryError && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total tayangan", value: summary?.totalViews?.toLocaleString("id-ID") ?? "—", color: "text-indigo-600 bg-indigo-50" },
            { label: "Listing aktif", value: totalActive, color: "text-emerald-600 bg-emerald-50" },
            { label: "Total leads", value: summary?.totalLeads ?? "—", color: "text-amber-600 bg-amber-50" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl px-3 py-3 text-center ${s.color}`}>
              <p className="text-xl font-black">{s.value}</p>
              <p className="text-[10px] font-semibold opacity-70">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Messages preview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-slate-800 font-black text-sm">Permintaan baru</h3>
            <p className="text-[11px] text-slate-400">
              {chatsLoading ? "Memuat..." : `${totalUnread} pesan belum dibaca`}
            </p>
          </div>
          <button onClick={() => setActiveNav("pesan")} className="text-indigo-600 font-black text-xs flex items-center gap-1">
            Semua pesan <ChevronRight size={12} />
          </button>
        </div>

        {chatsLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white rounded-2xl border border-slate-100 animate-pulse" />
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
            <MessageSquare size={20} className="text-slate-200 mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-semibold">Belum ada pesan masuk</p>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.slice(0, 3).map((chat) => (
              <button
                key={chat.id}
                onClick={() => navigate(`/chat/${chat.id}`)}
                className="w-full flex items-center gap-3 bg-white rounded-2xl border border-slate-100 px-4 py-3.5 active:scale-[0.98] transition-transform text-left shadow-sm hover:border-indigo-100"
              >
                <div
                  className="relative flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm"
                  style={{ background: avatarGradient(chat.id) }}
                >
                  {chat.name?.[0]?.toUpperCase() || "?"}
                  {chat.unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`text-sm ${chat.unread > 0 ? "font-black text-slate-900" : "font-semibold text-slate-600"} truncate`}>
                      {chat.name}
                    </p>
                    <span className="text-[10px] text-slate-400 ml-2 flex-shrink-0">{chat.time}</span>
                  </div>
                  <p className="text-[11px] text-indigo-500 font-bold truncate mb-0.5">{chat.kost}</p>
                  <p className="text-[11px] text-slate-400 truncate">{chat.lastMessage}</p>
                </div>
                {chat.unread > 0 && <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Properti quick */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-slate-800 font-black text-sm">Properti saya</h3>
          <button onClick={() => navigate("/owner/properti")} className="text-indigo-600 font-black text-xs flex items-center gap-1">
            Lihat semua <ChevronRight size={12} />
          </button>
        </div>
        {listingLoading ? (
          <div className="space-y-2">{[1, 2].map((i) => (
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
              const st = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.PENDING;
              const kamarAvail = item.roomTypes?.reduce((a, r) => a + (r.availableCount || 0), 0) ?? 0;
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

  // ── renderPesan ──────────────────────────────────────────────────────────────
  const renderPesan = () => (
    <div className="space-y-3 max-w-2xl">
      <div className="grid grid-cols-3 gap-3 mb-2">
        {[
          { label: "Belum dibaca", value: totalUnread, color: "text-indigo-600 bg-indigo-50" },
          { label: "Sudah dibaca", value: chats.filter(c => c.unread === 0).length, color: "text-amber-600 bg-amber-50" },
          { label: "Total", value: chats.length, color: "text-emerald-600 bg-emerald-50" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl px-3 py-3 text-center ${s.color}`}>
            <p className="text-xl font-black">{s.value}</p>
            <p className="text-[10px] font-semibold opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {chatsLoading && (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-white rounded-2xl border border-slate-100 animate-pulse" />
          ))}
        </div>
      )}

      {!chatsLoading && chats.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
          <MessageSquare size={24} className="text-slate-200 mx-auto mb-2" />
          <p className="text-sm font-black text-slate-500">Belum ada pesan masuk</p>
          <p className="text-xs text-slate-400 mt-1">Pesan dari calon penyewa akan muncul di sini</p>
        </div>
      )}

      {!chatsLoading && chats.map((chat) => (
        <button
          key={chat.id}
          onClick={() => navigate(`/chat/${chat.id}`)}
          className="w-full flex items-center gap-3 bg-white rounded-2xl border border-slate-100 px-4 py-4 active:scale-[0.98] transition-transform text-left shadow-sm hover:border-indigo-100"
        >
          <div className="relative flex-shrink-0">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-sm"
              style={{ background: avatarGradient(chat.id) }}
            >
              {chat.name?.[0]?.toUpperCase() || "?"}
            </div>
            {chat.unread > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <p className={`text-sm ${chat.unread > 0 ? "font-black text-slate-900" : "font-semibold text-slate-600"} truncate`}>
                {chat.name}
              </p>
              <span className="text-[10px] text-slate-400 ml-2 flex-shrink-0">{chat.time}</span>
            </div>
            <p className="text-[11px] text-indigo-500 font-bold truncate mb-0.5">{chat.kost}</p>
            <div className="flex items-center justify-between gap-2">
              <p className={`text-[11px] truncate flex-1 ${chat.unread > 0 ? "text-slate-700 font-medium" : "text-slate-400"}`}>
                {chat.lastMessage}
              </p>
              <div className="flex-shrink-0">
                {chat.unread > 0 ? (
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                ) : chat.isRead ? (
                  <CheckCheck size={13} className="text-blue-400" />
                ) : (
                  <Check size={13} className="text-slate-300" />
                )}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );

  // ── renderStatistik — pakai data dari summary BE ──────────────────────────────
  const renderStatistik = () => (
    <div className="space-y-5 max-w-2xl">
      {summaryLoading ? (
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-2xl" />)}
        </div>
      ) : summaryError ? (
        <div className="bg-red-50 border border-red-100 text-red-500 text-sm px-4 py-3 rounded-xl">{summaryError}</div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total tayangan", value: summary?.totalViews?.toLocaleString("id-ID") ?? "—", color: "text-indigo-600 bg-indigo-50" },
            { label: "Tayangan hari ini", value: summary?.todayViews?.toLocaleString("id-ID") ?? "—", color: "text-emerald-600 bg-emerald-50" },
            { label: "Tayangan minggu ini", value: summary?.weeklyViews?.toLocaleString("id-ID") ?? "—", color: "text-amber-600 bg-amber-50" },
            { label: "Total listing", value: summary?.totalListings ?? "—", color: "text-indigo-600 bg-indigo-50" },
            { label: "Listing aktif", value: summary?.activeListings ?? "—", color: "text-emerald-600 bg-emerald-50" },
            { label: "Total leads", value: summary?.totalLeads?.toLocaleString("id-ID") ?? "—", color: "text-pink-600 bg-pink-50" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl px-3 py-4 text-center ${s.color}`}>
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-[10px] font-semibold opacity-70 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Pendapatan 6 Bulan Terakhir</p>
        <div className="flex items-end gap-2 h-36">
          {[
            { bulan: "Nov", nilai: 60 }, { bulan: "Des", nilai: 75 }, { bulan: "Jan", nilai: 55 },
            { bulan: "Feb", nilai: 90 }, { bulan: "Mar", nilai: 70 }, { bulan: "Apr", nilai: 100 },
          ].map((d) => (
            <div key={d.bulan} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-indigo-600 rounded-t-lg transition-all hover:bg-indigo-500" style={{ height: `${d.nilai}%` }} />
              <span className="text-[9px] text-slate-400 font-bold">{d.bulan}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── renderAkun ───────────────────────────────────────────────────────────────
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
          { label: "Listing", value: summary?.totalListings ?? listings.length },
          { label: "Aktif", value: totalActive },
          { label: "Kamar", value: totalKamar },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-3 py-4 text-center">
            <p className="text-xl font-black text-slate-900">
              {summaryLoading ? <span className="inline-block w-6 h-5 bg-slate-100 animate-pulse rounded" /> : s.value}
            </p>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {[
        { icon: User, label: "Edit Profil", sub: user.name || "-", action: () => { } },
        { icon: Building2, label: "Properti Saya", sub: `${summary?.totalListings ?? listings.length} listing`, action: () => navigate("/owner/properti") },
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

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-slate-50" style={{ fontFamily: "'Plus Jakarta Sans','Inter',sans-serif" }}>
      <Sidebar
        active={activeNav}
        onChange={setActiveNav}
        ownerName={user.name || "Owner"}
        initials={initials}
        onLogout={handleLogout}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
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
            <Plus size={14} /> Tambah Kost
          </button>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-5 sm:py-6 overflow-y-auto pb-24 md:pb-6">
          {activeNav === "home" && renderHome()}
          {activeNav === "pesan" && renderPesan()}
          {activeNav === "statistik" && renderStatistik()}
          {activeNav === "akun" && renderAkun()}
        </main>
      </div>

      <BottomNav active={activeNav} unreadCount={totalUnread} />
    </div>
  );
}