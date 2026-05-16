import React, { useEffect, useState, useRef } from "react";
import {
  Plus, LogOut, Building2, Home,
  Zap, BarChart3, TrendingUp, User, ChevronRight,
  BedDouble, Eye, MessageSquare, Settings,
  Calendar, CheckCheck, Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
// import { useUnreadCount } from "../../hooks/useUnreadCount";

/* =========================
   CONSTANTS
========================= */
const API = "http://localhost:8080";

const STATUS_CONFIG = {
  PENDING: { label: "Menunggu Review" },
  ACTIVE: { label: "Aktif" },
  INACTIVE: { label: "Nonaktif" },
  REJECTED: { label: "Ditolak" },
};

const NAV_ITEMS = [
  { id: "home", label: "Beranda", icon: Home, desktop: true, mobile: true },
  { id: "pesan", label: "Pesan", icon: MessageSquare, desktop: true, mobile: true, badge: true },
  { id: "properti", label: "Properti", icon: Building2, desktop: true, mobile: true },
  { id: "statistik", label: "Statistik", icon: BarChart3, desktop: true, mobile: false },
  { id: "akun", label: "Profil", icon: User, desktop: false, mobile: true },
];

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

/* =========================
   HELPERS
========================= */
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
  if (diffDays === 0) return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Kemarin";
  if (diffDays < 7) return date.toLocaleDateString("id-ID", { weekday: "short" });
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

function fmtNum(n) {
  if (n == null) return "—";
  return Number(n).toLocaleString("id-ID");
}

function Skel({ h = 60, r = 14, style = {} }) {
  return <div className="ow-skel" style={{ height: h, borderRadius: r, ...style }} />;
}

/* =========================
   MAIN
========================= */
export default function DashboardOwnerPage() {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [listings, setListings] = useState([]);
  const [listingLoading, setListingLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);
  const [chats, setChats] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("home");
  const [showMenu, setShowMenu] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  // const { unreadCount } = useUnreadCount(token, user?.id);

  const initials = user.name
    ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "OW";

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (!token) { setSummaryLoading(false); return; }
    (async () => {
      try {
        const res = await fetch(`${API}/owner/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) { setSummaryError(`Gagal memuat statistik (${res.status})`); return; }
        const json = await res.json();
        setSummary(json.data || json);
      } catch { setSummaryError("Tidak dapat terhubung ke server."); }
      finally { setSummaryLoading(false); }
    })();
  }, [token]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/listings/owner`, { headers: { Authorization: `Bearer ${token}` } });
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { data = {}; }
        if (Array.isArray(data)) setListings(data);
        else if (Array.isArray(data?.data)) setListings(data.data);
        else setListings([]);
      } catch { }
      finally { setListingLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (!token) { setChatsLoading(false); return; }
    (async () => {
      try {
        const res = await fetch(`${API}/chats`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const json = await res.json();
        const raw = Array.isArray(json.data) ? json.data : [];
        setChats(raw.map(thread => {
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
      } catch { }
      finally { setChatsLoading(false); }
    })();
  }, [token, user?.id]);

  const handleLogout = () => { localStorage.removeItem("user"); localStorage.removeItem("token"); navigate("/auth"); };
  const handleOpenChat = (chatId) => navigate(`/owner/chat/${chatId}`);

  const totalActive = summary?.activeListings ?? listings.filter(l => l.status === "ACTIVE").length;
  const totalKamar = listings.flatMap(l => l.roomTypes || []).reduce((a, r) => a + (r.availableCount || 0), 0);
  const totalUnread = chats.reduce((acc, c) => acc + c.unread, 0);
  const now = new Date();
  const bulanIni = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;

  /* ── renderHome ── */
  const renderHome = () => (
    <div className="ow-fade">
      <div className="ow-ph">
        <div>
          <h1 className="ow-ph-title">Selamat datang kembali 👋</h1>
          <p className="ow-ph-sub">Pantau performa listing dan kelola properti kamu.</p>
        </div>
        <button className="ow-cta" onClick={() => navigate("/owner/create")}><Plus size={15} /> Tambah Kost</button>
      </div>

      {/* Hero card */}
      <div className="ow-hero">
        <div className="ow-hero-b1" /><div className="ow-hero-b2" />
        <div style={{ position: "relative", zIndex: 2 }}>
          <p className="ow-hero-lbl">Ringkasan — {bulanIni}</p>
          {summaryLoading ? (
            <div className="ow-sg6">{[1, 2, 3, 4, 5, 6].map(i => <Skel key={i} h={88} r={16} />)}</div>
          ) : summaryError ? (
            <p style={{ color: "#FCA5A5", fontSize: 13, marginTop: 8 }}>{summaryError}</p>
          ) : (
            <div className="ow-sg6">
              {[
                { icon: Building2, value: fmtNum(summary?.totalListings), label: "Total Listing" },
                { icon: Eye, value: fmtNum(summary?.todayViews), label: "Tayangan Hari Ini" },
                { icon: MessageSquare, value: summary?.activeChats ?? totalUnread, label: "Chat Aktif" },
                { icon: TrendingUp, value: fmtNum(summary?.weeklyViews), label: "Tayangan Minggu" },
                { icon: BedDouble, value: totalActive, label: "Listing Aktif" },
                { icon: User, value: fmtNum(summary?.totalLeads), label: "Total Leads" },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="ow-spill">
                  <Icon size={14} style={{ color: "rgba(147,197,253,.8)" }} />
                  <span className="ow-sv">{value}</span>
                  <span className="ow-sl">{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ marginBottom: 32 }}>
        <p className="ow-stitle">Aksi Cepat</p>
        <div className="ow-qa-grid">
          {[
            { icon: Plus, label: "Tambah Kamar", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE", action: () => navigate("/owner/create") },
            { icon: Calendar, label: "Atur Jadwal", color: "#059669", bg: "#ECFDF5", border: "#6EE7B7", action: () => navigate("/owner/survey") },
            { icon: TrendingUp, label: "Tarik Dana", color: "#D97706", bg: "#FFFBEB", border: "#FCD34D", action: () => navigate("/owner/pendapatan") },
            { icon: Zap, label: "Tingkatkan", color: "#DC2626", bg: "#FEF2F2", border: "#FCA5A5", action: () => navigate("/owner/promosi") },
          ].map(({ icon: Icon, label, color, bg, border, action }) => (
            <button key={label} className="ow-qa-btn" onClick={action}>
              <div className="ow-qa-ico" style={{ background: bg, border: `1.5px solid ${border}` }}><Icon size={22} color={color} /></div>
              <span className="ow-qa-lbl">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Single column: Pesan lalu Properti di bawahnya */}
      <div>
        {/* Messages */}
        <div style={{ marginBottom: 28 }}>
          <div className="ow-secrow">
            <p className="ow-stitle" style={{ marginBottom: 0 }}>Pesan Masuk</p>
            <button className="ow-slink" onClick={() => setActiveNav("pesan")}>Lihat semua <ChevronRight size={13} /></button>
          </div>
          <div className="ow-card" style={{ marginTop: 14 }}>
            {chatsLoading
              ? [1, 2, 3].map(i => <Skel key={i} h={72} r={0} style={{ margin: "10px 14px", borderRadius: 12 }} />)
              : chats.length === 0
                ? <div className="ow-empty"><MessageSquare size={26} style={{ color: "#CBD5E1", marginBottom: 8 }} /><p className="ow-etxt">Belum ada pesan masuk</p></div>
                : chats.slice(0, 4).map((chat, i) => (
                  <button key={chat.id} className="ow-crow"
                    style={{ borderBottom: i < Math.min(3, chats.length - 1) ? "1px solid #F1F5F9" : "none" }}
                    onClick={() => handleOpenChat(chat.id)}>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <div className="ow-cavatar" style={{ background: avatarGradient(chat.id) }}>{chat.name?.[0]?.toUpperCase() || "?"}</div>
                      {chat.unread > 0 && <span className="ow-udot" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                        <p className="ow-cname" style={{ fontWeight: chat.unread > 0 ? 700 : 500 }}>{chat.name}</p>
                        <span className="ow-ctime">{chat.time}</span>
                      </div>
                      <p className="ow-ckost">{chat.kost}</p>
                      <p className="ow-cmsg" style={{ color: chat.unread > 0 ? "#334155" : "#94A3B8" }}>{chat.lastMessage}</p>
                    </div>
                    {chat.unread > 0
                      ? <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", flexShrink: 0 }} />
                      : chat.isRead ? <CheckCheck size={13} style={{ color: "#3B82F6", flexShrink: 0 }} /> : <Check size={13} style={{ color: "#CBD5E1", flexShrink: 0 }} />}
                  </button>
                ))}
          </div>
        </div>

        {/* Properti — di bawah pesan */}
        <div>
          <div className="ow-secrow">
            <p className="ow-stitle" style={{ marginBottom: 0 }}>Properti Saya</p>
            <button className="ow-slink" onClick={() => navigate("/owner/properti")}>Lihat semua <ChevronRight size={13} /></button>
          </div>
          <div className="ow-card" style={{ marginTop: 14 }}>
            {listingLoading
              ? [1, 2, 3].map(i => <Skel key={i} h={68} r={0} style={{ margin: "10px 14px", borderRadius: 12 }} />)
              : listings.length === 0
                ? <div className="ow-empty"><Building2 size={26} style={{ color: "#CBD5E1", marginBottom: 8 }} /><p className="ow-etxt">Belum ada properti</p><button className="ow-cta" style={{ marginTop: 12 }} onClick={() => navigate("/owner/create")}><Plus size={13} />Tambah</button></div>
                : listings.slice(0, 4).map((item, i) => {
                  const st = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.PENDING;
                  const k = item.roomTypes?.reduce((a, r) => a + (r.availableCount || 0), 0) ?? 0;
                  return (
                    <button key={item.id} className="ow-crow"
                      style={{ borderBottom: i < Math.min(3, listings.length - 1) ? "1px solid #F1F5F9" : "none" }}
                      onClick={() => navigate(`/owner/listing/${item.id}`)}>
                      <div className="ow-pico"><Building2 size={17} style={{ color: "#2563EB" }} /></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="ow-cname" style={{ fontWeight: 700 }}>{item.name}</p>
                        <p className="ow-ckost" style={{ color: "#94A3B8" }}>{item.address}</p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                        <span className={`ow-tag ow-st-${item.status?.toLowerCase() || "pending"}`}><span className="ow-tdot" />{st.label}</span>
                        <span style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600 }}>{k} kamar</span>
                      </div>
                    </button>
                  );
                })}
          </div>
        </div>
      </div>
    </div>
  );

  /* ── renderPesan ── */
  const renderPesan = () => (
    <div className="ow-fade">
      <div className="ow-ph">
        <div>
          <h1 className="ow-ph-title">Pesan</h1>
          <p className="ow-ph-sub">{chatsLoading ? "Memuat..." : `${totalUnread} belum dibaca · ${chats.length} total`}</p>
        </div>
      </div>
      <div className="ow-3col" style={{ marginBottom: 28 }}>
        {[
          { label: "Belum Dibaca", value: totalUnread, color: "#2563EB", bg: "#EFF6FF" },
          { label: "Sudah Dibaca", value: chats.filter(c => c.unread === 0).length, color: "#D97706", bg: "#FFFBEB" },
          { label: "Total Chat", value: chats.length, color: "#059669", bg: "#ECFDF5" },
        ].map(s => (
          <div key={s.label} className="ow-mstat" style={{ background: s.bg }}>
            <p className="ow-msv" style={{ color: s.color }}>{s.value}</p>
            <p className="ow-msl" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>
      <div className="ow-card" style={{ maxWidth: 680 }}>
        {chatsLoading
          ? [1, 2, 3, 4].map(i => <Skel key={i} h={76} r={0} style={{ margin: "10px 14px", borderRadius: 12 }} />)
          : chats.length === 0
            ? <div className="ow-empty" style={{ padding: "56px 20px" }}><MessageSquare size={28} style={{ color: "#CBD5E1", marginBottom: 10 }} /><p className="ow-etxt">Belum ada pesan masuk</p><p style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>Pesan dari calon penyewa akan muncul di sini</p></div>
            : chats.map((chat, i) => (
              <button key={chat.id} className="ow-crow"
                style={{ borderBottom: i < chats.length - 1 ? "1px solid #F1F5F9" : "none", padding: "16px 18px" }}
                onClick={() => handleOpenChat(chat.id)}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div className="ow-cavatar" style={{ background: avatarGradient(chat.id), width: 46, height: 46, borderRadius: 14 }}>{chat.name?.[0]?.toUpperCase() || "?"}</div>
                  {chat.unread > 0 && <span className="ow-udot" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                    <p className="ow-cname" style={{ fontWeight: chat.unread > 0 ? 700 : 500, fontSize: 13.5 }}>{chat.name}</p>
                    <span className="ow-ctime">{chat.time}</span>
                  </div>
                  <p className="ow-ckost">{chat.kost}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <p className="ow-cmsg" style={{ color: chat.unread > 0 ? "#334155" : "#94A3B8", flex: 1 }}>{chat.lastMessage}</p>
                    {chat.unread > 0
                      ? <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", flexShrink: 0 }} />
                      : chat.isRead ? <CheckCheck size={13} style={{ color: "#3B82F6" }} /> : <Check size={13} style={{ color: "#CBD5E1" }} />}
                  </div>
                </div>
              </button>
            ))}
      </div>
    </div>
  );

  /* ── renderProperti ── */
  const renderProperti = () => (
    <div className="ow-fade">
      <div className="ow-ph">
        <div>
          <h1 className="ow-ph-title">Properti Saya</h1>
          <p className="ow-ph-sub">{listings.length} listing terdaftar</p>
        </div>
        <button className="ow-cta" onClick={() => navigate("/owner/create")}><Plus size={15} />Tambah Kost</button>
      </div>
      {listingLoading
        ? <div className="ow-pgrid">{[1, 2, 3, 4].map(i => <Skel key={i} h={200} r={20} />)}</div>
        : listings.length === 0
          ? <div className="ow-card" style={{ padding: "64px 20px" }}><div className="ow-empty"><Building2 size={32} style={{ color: "#CBD5E1", marginBottom: 10 }} /><p className="ow-etxt">Belum ada properti</p><button className="ow-cta" style={{ marginTop: 14 }} onClick={() => navigate("/owner/create")}><Plus size={14} />Tambah Sekarang</button></div></div>
          : <div className="ow-pgrid">
            {listings.map(item => {
              const st = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.PENDING;
              const k = item.roomTypes?.reduce((a, r) => a + (r.availableCount || 0), 0) ?? 0;
              const photo = item.roomTypes?.[0]?.photos?.[0]?.url;
              return (
                <div key={item.id} className="ow-pcard" onClick={() => navigate(`/owner/listing/${item.id}`)}>
                  <div className="ow-pimg">
                    {photo ? <img src={photo} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Building2 size={30} style={{ color: "#CBD5E1" }} />}
                    <span className={`ow-tag ow-st-${item.status?.toLowerCase() || "pending"}`} style={{ position: "absolute", top: 10, left: 10 }}><span className="ow-tdot" />{st.label}</span>
                  </div>
                  <div className="ow-pbody">
                    <p className="ow-pname">{item.name}</p>
                    <p className="ow-paddr">{item.address}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#2563EB" }}>{k} kamar tersedia</span>
                      <ChevronRight size={15} style={{ color: "#CBD5E1" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>}
    </div>
  );

  /* ── renderStatistik ── */
  const renderStatistik = () => (
    <div className="ow-fade">
      <div className="ow-ph"><div><h1 className="ow-ph-title">Statistik</h1><p className="ow-ph-sub">Performa listing dan data tayangan properti kamu.</p></div></div>
      {summaryLoading
        ? <div className="ow-sg6" style={{ marginBottom: 28 }}>{[1, 2, 3, 4, 5, 6].map(i => <Skel key={i} h={96} r={16} />)}</div>
        : summaryError
          ? <div className="ow-ebox">{summaryError}</div>
          : <div className="ow-sg6" style={{ marginBottom: 28 }}>
            {[
              { label: "Total Tayangan", value: fmtNum(summary?.totalViews), color: "#2563EB", bg: "#EFF6FF" },
              { label: "Tayangan Hari Ini", value: fmtNum(summary?.todayViews), color: "#059669", bg: "#ECFDF5" },
              { label: "Tayangan Minggu Ini", value: fmtNum(summary?.weeklyViews), color: "#D97706", bg: "#FFFBEB" },
              { label: "Total Listing", value: fmtNum(summary?.totalListings), color: "#2563EB", bg: "#EFF6FF" },
              { label: "Listing Aktif", value: fmtNum(summary?.activeListings), color: "#059669", bg: "#ECFDF5" },
              { label: "Total Leads", value: fmtNum(summary?.totalLeads), color: "#9333EA", bg: "#FAF5FF" },
            ].map(s => (
              <div key={s.label} className="ow-mstat" style={{ background: s.bg, padding: "20px 12px" }}>
                <p className="ow-msv" style={{ color: s.color, fontSize: 26 }}>{s.value}</p>
                <p className="ow-msl" style={{ color: s.color }}>{s.label}</p>
              </div>
            ))}
          </div>}
      <div className="ow-card" style={{ padding: 28 }}>
        <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 16, color: "#0F172A", margin: "0 0 4px" }}>Pendapatan 6 Bulan Terakhir</p>
        <p style={{ fontSize: 13, color: "#94A3B8", margin: "0 0 28px" }}>Estimasi berdasarkan data booking aktif</p>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 160 }}>
          {[
            { bulan: "Nov", nilai: 60 }, { bulan: "Des", nilai: 75 }, { bulan: "Jan", nilai: 55 },
            { bulan: "Feb", nilai: 90 }, { bulan: "Mar", nilai: 70 }, { bulan: "Apr", nilai: 100 },
          ].map((d, i) => (
            <div key={d.bulan} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
              <div style={{ width: "100%", marginTop: "auto", height: `${d.nilai}%`, background: i === 5 ? "linear-gradient(180deg,#2563EB,#1D4ED8)" : "linear-gradient(180deg,#BFDBFE,#DBEAFE)", borderRadius: "10px 10px 4px 4px", transition: "height .6s cubic-bezier(.34,1.56,.64,1)" }} />
              <span style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700 }}>{d.bulan}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ── renderAkun ── */
  const renderAkun = () => (
    <div className="ow-fade" style={{ maxWidth: 560 }}>
      <div className="ow-ph"><div><h1 className="ow-ph-title">Profil Saya</h1><p className="ow-ph-sub">Kelola akun dan preferensi kamu.</p></div></div>

      <div className="ow-hero" style={{ padding: 28, marginBottom: 20 }}>
        <div className="ow-hero-b1" />
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 70, height: 70, borderRadius: 20, background: "rgba(255,255,255,.15)", backdropFilter: "blur(8px)", border: "1.5px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 24 }}>
            {initials}
          </div>
          <div>
            <h2 style={{ color: "white", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 20, margin: "0 0 4px" }}>{user.name || "Owner"}</h2>
            <p style={{ color: "rgba(147,197,253,.8)", fontSize: 13, margin: 0 }}>{user.email || "-"}</p>
            <span style={{ marginTop: 10, display: "inline-block", fontSize: 10, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", color: "#2563EB", background: "white", padding: "3px 11px", borderRadius: 20 }}>Pemilik Kos</span>
          </div>
        </div>
      </div>

      <div className="ow-3col" style={{ marginBottom: 20 }}>
        {[
          { label: "Listing", value: summary?.totalListings ?? listings.length },
          { label: "Aktif", value: totalActive },
          { label: "Kamar", value: totalKamar },
        ].map(s => (
          <div key={s.label} className="ow-card" style={{ padding: "18px 12px", textAlign: "center" }}>
            <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 28, color: "#0F172A", margin: 0, lineHeight: 1 }}>{summaryLoading ? "—" : s.value}</p>
            <p style={{ fontSize: 11, color: "#64748B", fontWeight: 600, marginTop: 6 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="ow-card">
        {[
          { icon: User, label: "Edit Profil", sub: user.name || "-", action: () => { } },
          { icon: Building2, label: "Properti Saya", sub: `${summary?.totalListings ?? listings.length} listing`, action: () => setActiveNav("properti") },
          { icon: Zap, label: "Fitur Promosi", sub: "Upgrade paket kamu", action: () => { } },
          { icon: BarChart3, label: "Laporan Statistik", sub: "Lihat performa listing", action: () => setActiveNav("statistik") },
          { icon: Settings, label: "Pengaturan", sub: "Notifikasi & preferensi", action: () => { } },
        ].map(({ icon: Icon, label, sub, action }, i, arr) => (
          <button key={label} className="ow-mrow" style={{ borderBottom: i < arr.length - 1 ? "1px solid #F1F5F9" : "none" }} onClick={action}>
            <div className="ow-mico"><Icon size={17} style={{ color: "#2563EB" }} /></div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 700, color: "#0F172A", margin: "0 0 2px" }}>{label}</p>
              <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>{sub}</p>
            </div>
            <ChevronRight size={15} style={{ color: "#CBD5E1" }} />
          </button>
        ))}
      </div>

      <button className="ow-logout" onClick={handleLogout}><LogOut size={15} />Keluar dari Akun</button>
    </div>
  );

  /* ── CSS ── */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
    * { box-sizing: border-box; }
    body { margin: 0; background: #F8FAFC; }
    .ow-root { font-family: 'DM Sans', sans-serif; color: #0F172A; }
    .ow-root h1, .ow-root h2, .ow-root h3 { font-family: 'Plus Jakarta Sans', sans-serif; }

    /* NAVBAR */
  .ow-navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 68px;

  background: rgba(255,255,255,.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);

  border-bottom: 1px solid #EAEFF5;

  display: flex;
  align-items: center;
  padding: 0 40px;

  justify-content: space-between; /* ✅ INI KUNCINYA */
}
    .ow-logo {
      font-family: 'Plus Jakarta Sans', sans-serif; font-size: 22px; font-weight: 800;
      letter-spacing: -0.8px; color: #0F172A; cursor: pointer; white-space: nowrap; flex-shrink: 0;
    }
    .ow-logo span { color: #2563EB; }
    .ow-nav-spacer { flex: 1; }
.ow-nav-links {
  display: flex;
  align-items: center;
  gap: 4px;

  margin-left: auto; /* ⬅️ INI YANG BENERAN DORONG KE KANAN */
}
    @media(max-width: 768px) { .ow-nav-links { display: none; } }
    .ow-nl {
      display: flex; align-items: center; gap: 7px;
      padding: 8px 14px; border-radius: 10px; border: none; background: transparent;
      color: #64748B; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
      cursor: pointer; transition: .15s; white-space: nowrap; position: relative;
    }
    .ow-nl:hover { color: #2563EB; background: #EFF6FF; }
    .ow-nl.active { color: #2563EB; background: #EFF6FF; }
    .ow-nl-badge { position: absolute; top: 5px; right: 7px; width: 7px; height: 7px; background: #EF4444; border-radius: 50%; border: 1.5px solid white; }
    .ow-navdiv { width: 1px; height: 22px; background: #E2E8F0; margin: 0 4px; }

    .ow-cta {
      display: flex; align-items: center; gap: 7px; padding: 10px 20px; border-radius: 12px; border: none;
      background: linear-gradient(135deg, #1D4ED8, #2563EB); color: white;
      font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 700; cursor: pointer; transition: .2s; white-space: nowrap;
    }
    .ow-cta:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(37,99,235,.28); }
    .ow-cta:active { transform: translateY(0); }

    .ow-ddwrap { position: relative; }
    .ow-avatar {
      width: 38px; height: 38px; border-radius: 50%; background: #DBEAFE; color: #1D4ED8;
      font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; border: 2px solid #BFDBFE; transition: .2s;
    }
    .ow-avatar:hover { background: #BFDBFE; transform: scale(1.05); }
    .ow-dd {
      position: absolute; top: calc(100% + 10px); right: 0; background: white; border: 1px solid #E2E8F0;
      border-radius: 16px; padding: 8px; min-width: 180px; box-shadow: 0 8px 32px rgba(0,0,0,.10);
      display: flex; flex-direction: column; gap: 2px; z-index: 200; animation: ddIn .15s ease;
    }
    @keyframes ddIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
    .ow-dd button {
      display: flex; align-items: center; gap: 10px; padding: 10px 13px; border: none; background: none;
      border-radius: 10px; font-size: 13px; font-weight: 600; color: #334155; cursor: pointer;
      width: 100%; text-align: left; transition: .13s; font-family: 'DM Sans', sans-serif;
    }
    .ow-dd button:hover { background: #F1F5F9; }
    .ow-dd .ddiv { height: 1px; background: #E2E8F0; margin: 4px 0; }
    .ow-dd button.danger { color: #EF4444; }
    .ow-dd button.danger:hover { background: #FEF2F2; }

    /* BOTTOM NAV */
    .ow-bnav { display: none; }
    @media(max-width: 640px) {
      .ow-bnav {
        display: flex; position: fixed; bottom: 0; left: 0; right: 0; z-index: 300;
        background: rgba(255,255,255,.97); backdrop-filter: blur(20px);
        border-top: 1px solid #E2E8F0;
        padding: 6px 0 calc(6px + env(safe-area-inset-bottom));
        justify-content: space-around; align-items: center;
        box-shadow: 0 -4px 20px rgba(0,0,0,.07);
      }
    }
    .ow-bni {
      display: flex; flex-direction: column; align-items: center; gap: 3px;
      padding: 6px 10px; border: none; background: none; border-radius: 12px;
      cursor: pointer; color: #94A3B8; transition: color .15s;
      min-width: 52px; font-family: 'DM Sans', sans-serif; position: relative;
    }
    .ow-bni.active { color: #2563EB; }
    .ow-bni > span { font-size: 10px; font-weight: 700; letter-spacing: .1px; }
    .ow-bn-pip { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 24px; height: 3px; background: #2563EB; border-radius: 0 0 4px 4px; }
    .ow-bn-bdg { position: absolute; top: 2px; right: 4px; width: 8px; height: 8px; background: #EF4444; border-radius: 50%; border: 1.5px solid white; }

    /* PAGE */
    .ow-wrap { max-width: 1180px; margin: 0 auto; padding: 36px 40px 100px; }
    @media(max-width:900px) { .ow-wrap { padding: 28px 24px 100px; } }
    @media(max-width:640px) { .ow-wrap { padding: 20px 16px 96px; } }

    /* PAGE HEADER */
    .ow-ph { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 28px; }
    .ow-ph-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 28px; font-weight: 800; letter-spacing: -0.8px; color: #0F172A; margin: 0 0 5px; line-height: 1.15; }
    .ow-ph-sub { font-size: 14px; color: #64748B; margin: 0; font-weight: 400; }

    /* HERO CARD */
    .ow-hero { background: linear-gradient(135deg, #0F172A 0%, #1E3A8A 45%, #2563EB 100%); border-radius: 24px; padding: 32px; position: relative; overflow: hidden; margin-bottom: 32px; }
    .ow-hero-b1 { position: absolute; width: 300px; height: 300px; top: -100px; right: -80px; border-radius: 50%; background: rgba(255,255,255,.05); }
    .ow-hero-b2 { position: absolute; width: 200px; height: 200px; bottom: -80px; left: 20%; border-radius: 50%; background: rgba(37,99,235,.3); filter: blur(40px); }
    .ow-hero-lbl { color: rgba(147,197,253,.75); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 16px; }

    /* STAT GRID 6 — always 3 cols × 2 rows */
    .ow-sg6 { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
    .ow-spill { background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.08); border-radius: 16px; padding: 16px 10px; display: flex; flex-direction: column; align-items: center; gap: 7px; backdrop-filter: blur(8px); }
    .ow-sv { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 22px; color: white; line-height: 1; }
    .ow-sl { font-size: 9px; font-weight: 700; color: rgba(147,197,253,.75); text-align: center; line-height: 1.3; text-transform: uppercase; letter-spacing: .4px; }

    /* SECTION */
    .ow-stitle { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 16px; font-weight: 800; color: #0F172A; margin: 0 0 16px; letter-spacing: -0.3px; }
    .ow-secrow { display: flex; align-items: center; justify-content: space-between; }
    .ow-slink { display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 700; color: #2563EB; border: none; background: transparent; cursor: pointer; font-family: 'DM Sans', sans-serif; }

    /* QUICK ACTIONS */
    .ow-qa-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
    @media(max-width:480px) { .ow-qa-grid { gap: 8px; } }
    .ow-qa-btn { display: flex; flex-direction: column; align-items: center; gap: 10px; border: none; background: transparent; cursor: pointer; transition: transform .15s; }
    .ow-qa-btn:hover .ow-qa-ico { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(37,99,235,.18); }
    .ow-qa-btn:active { transform: scale(.96); }
    .ow-qa-ico { width: 56px; height: 56px; border-radius: 18px; display: flex; align-items: center; justify-content: center; transition: all .2s ease; }
    .ow-qa-lbl { font-family: 'DM Sans', sans-serif; font-size: 11px; color: #475569; font-weight: 700; text-align: center; line-height: 1.3; }

    /* CARD */
    .ow-card { background: white; border: 1px solid #E2E8F0; border-radius: 20px; overflow: hidden; transition: border-color .2s, box-shadow .2s; }
    .ow-card:hover { border-color: #BFDBFE; box-shadow: 0 4px 20px rgba(37,99,235,.07); }

    /* CHAT ROW */
    .ow-crow { width: 100%; display: flex; align-items: center; gap: 12px; padding: 14px 16px; border: none; background: transparent; cursor: pointer; text-align: left; transition: background .15s; }
    .ow-crow:hover { background: #F8FAFC; }
    .ow-crow:active { transform: scale(.99); }
    .ow-cavatar { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 14px; }
    .ow-udot { position: absolute; top: -2px; right: -2px; width: 10px; height: 10px; border-radius: 50%; background: #EF4444; border: 2px solid white; }
    .ow-cname { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; color: #0F172A; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 65%; }
    .ow-ctime { font-size: 10px; color: #94A3B8; flex-shrink: 0; margin-left: 8px; }
    .ow-ckost { font-size: 11px; color: #3B82F6; font-weight: 700; margin: 2px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ow-cmsg { font-size: 11.5px; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* MINI STATS */
    .ow-3col { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
    .ow-mstat { border-radius: 16px; padding: 16px 12px; text-align: center; }
    .ow-msv { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 24px; font-weight: 800; line-height: 1; margin: 0 0 5px; }
    .ow-msl { font-size: 10.5px; font-weight: 700; opacity: .75; margin: 0; }

    /* PROP */
    .ow-pgrid { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; }
    @media(max-width:900px) { .ow-pgrid { grid-template-columns: repeat(2,1fr); } }
    @media(max-width:480px) { .ow-pgrid { grid-template-columns: 1fr; } }
    .ow-pcard { background: white; border: 1px solid #E2E8F0; border-radius: 20px; overflow: hidden; cursor: pointer; transition: .2s; }
    .ow-pcard:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(37,99,235,.12); border-color: #BFDBFE; }
    .ow-pimg { height: 140px; background: #F1F5F9; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
    .ow-pbody { padding: 14px 16px; }
    .ow-pname { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 800; color: #0F172A; margin: 0 0 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ow-paddr { font-size: 12px; color: #94A3B8; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ow-pico { width: 42px; height: 42px; border-radius: 12px; background: #EFF6FF; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

    /* STATUS TAGS */
    .ow-tag { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 999px; font-size: 10px; font-weight: 800; font-family: 'DM Sans', sans-serif; }
    .ow-tdot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
    .ow-st-active   { background: #ECFDF5; color: #059669; } .ow-st-active .ow-tdot   { background: #059669; }
    .ow-st-pending  { background: #FFFBEB; color: #D97706; } .ow-st-pending .ow-tdot  { background: #D97706; }
    .ow-st-inactive { background: #F1F5F9; color: #64748B; } .ow-st-inactive .ow-tdot { background: #94A3B8; }
    .ow-st-rejected { background: #FEF2F2; color: #EF4444; } .ow-st-rejected .ow-tdot { background: #EF4444; }

    /* MENU ROW */
    .ow-mrow { width: 100%; display: flex; align-items: center; gap: 14px; padding: 16px 20px; border: none; background: transparent; cursor: pointer; text-align: left; transition: background .15s; }
    .ow-mrow:hover { background: #F8FAFC; }
    .ow-mico { width: 42px; height: 42px; border-radius: 12px; background: #EFF6FF; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

    /* TWO COL */
    .ow-2col { display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; }
    @media(max-width:860px) { .ow-2col { grid-template-columns: 1fr; } }

    /* MISC */
    .ow-empty { display: flex; flex-direction: column; align-items: center; padding: 48px 20px; }
    .ow-etxt { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 700; color: #64748B; margin: 0; }
    .ow-ebox { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px; padding: 14px 18px; color: #EF4444; font-size: 13px; margin-bottom: 20px; }
    .ow-logout { width: 100%; margin-top: 16px; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 20px; background: #FEF2F2; border: 1.5px solid #FECACA; border-radius: 14px; color: #EF4444; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 14px; cursor: pointer; transition: .2s; }
    .ow-logout:hover { background: #FEE2E2; }
    .ow-skel { background: linear-gradient(90deg, #F1F5F9 0%, #E2E8F0 50%, #F1F5F9 100%); background-size: 200% 100%; animation: skAnim 1.5s infinite; }
    @keyframes skAnim { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .ow-fade { animation: fadeIn .35s ease forwards; }

    @media(max-width:640px) {
      .ow-ph { flex-direction: column; gap: 12px; }
      .ow-ph-title { font-size: 22px; }
      .ow-sv { font-size: 18px; }
      .ow-hero { padding: 22px; }
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="ow-root">

        {/* NAVBAR */}
        <nav className="ow-navbar" >
          <div className="ow-logo" onClick={() => navigate("/owner/dashboard")}>Atap<span>.</span></div>

          <div className="ow-nav-links">
            {NAV_ITEMS.filter(n => n.desktop).map(({ id, icon: Icon, label, badge }) => (
              <button key={id} className={`ow-nl${activeNav === id ? " active" : ""}`} onClick={() => setActiveNav(id)}>
                <Icon size={15} />{label}
                {badge && totalUnread > 0 && <span className="ow-nl-badge" />}
              </button>
            ))}
            <div className="ow-navdiv" />
            <button className="ow-cta" onClick={() => navigate("/owner/create")}><Plus size={14} />Tambah Kost</button>
            <div className="ow-ddwrap" ref={menuRef}>
              <div className="ow-avatar" onClick={() => setShowMenu(p => !p)} title={user.name}>{initials}</div>
              {showMenu && (
                <div className="ow-dd">
                  <button onClick={() => { setActiveNav("akun"); setShowMenu(false); }}><User size={14} />Profil</button>
                  <button onClick={() => { setActiveNav("statistik"); setShowMenu(false); }}><BarChart3 size={14} />Statistik</button>
                  <button onClick={() => { navigate("/owner/promosi"); setShowMenu(false); }}><Zap size={14} />Promosi</button>
                  <div className="ddiv" />
                  <button className="danger" onClick={handleLogout}><LogOut size={14} />Logout</button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
            <div className="ow-avatar" onClick={() => setActiveNav("akun")} style={{ display: "none" }}
              ref={el => { if (el) { const mq = window.matchMedia("(max-width:768px)"); const toggle = () => el.style.display = mq.matches ? "flex" : "none"; toggle(); mq.addEventListener("change", toggle); } }}>
              {initials}
            </div>
          </div>
        </nav>

        {/* PAGE */}
        <div className="ow-wrap">
          {activeNav === "home" && renderHome()}
          {activeNav === "pesan" && renderPesan()}
          {activeNav === "properti" && renderProperti()}
          {activeNav === "statistik" && renderStatistik()}
          {activeNav === "akun" && renderAkun()}
        </div>

        {/* BOTTOM NAV */}
        <nav className="ow-bnav">
          {NAV_ITEMS.filter(n => n.mobile).map(({ id, icon: Icon, label, badge }) => (
            <button key={id} className={`ow-bni${activeNav === id ? " active" : ""}`} onClick={() => setActiveNav(id)}>
              {activeNav === id && <span className="ow-bn-pip" />}
              <div style={{ position: "relative" }}>
                <Icon size={21} strokeWidth={activeNav === id ? 2.5 : 1.8} />
                {badge && totalUnread > 0 && <span className="ow-bn-bdg" />}
              </div>
              <span>{label}</span>
            </button>
          ))}
        </nav>

      </div>
    </>
  );
}