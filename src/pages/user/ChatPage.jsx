import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle, Search, CheckCheck, Check, ShieldCheck, ChevronRight,
  Home, Map, Heart, User, Settings, LogOut,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const API = "http://localhost:8080";
const FILTERS = ["Semua", "Belum dibaca", "Sudah dibaca"];

const NAV_ITEMS = [
  { label: "Home",    path: "/",       icon: Home,          desktop: true,  mobile: true,  guestMobile: true  },
  { label: "Search",  path: "/search", icon: Search,        desktop: true,  mobile: true,  guestMobile: true  },
  { label: "Peta",    path: "/map",    icon: Map,           desktop: true,  mobile: true,  guestMobile: true  },
  { label: "Favorit", path: "/like",   icon: Heart,         desktop: true,  mobile: true,  guestMobile: false },
  { label: "Chat",    path: "/chat",   icon: MessageCircle, desktop: false, mobile: false, guestMobile: false },
  { label: "Profil",  path: "/profil", icon: User,          desktop: false, mobile: true,  guestMobile: false },
];

const DESKTOP_LINKS = NAV_ITEMS.filter((n) => n.desktop);
const MOBILE_NAV    = NAV_ITEMS.filter((n) => n.mobile);
const GUEST_MOBILE  = NAV_ITEMS.filter((n) => n.guestMobile);

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;700&display=swap');
  * { box-sizing: border-box; } body { margin: 0; background: #F8FAFC; }

  /* ── NAVBAR (identik Dashboard) ── */
  .chat-navbar {
    position: sticky; top: 0; z-index: 100;
    height: 72px;
    background: rgba(255,255,255,.92); backdrop-filter: blur(16px);
    border-bottom: 1px solid #EAEFF5;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 42px;
  }
  .chat-navbar-logo { font-family:'Plus Jakarta Sans',sans-serif; font-size:25px; font-weight:800; letter-spacing:-1px; color:#0F172A; cursor:pointer; }
  .chat-navbar-logo span { color:#2563EB; }
  .chat-navbar-links { display:flex; align-items:center; gap:4px; }
  .chat-navbar-link { font-size:14px; font-weight:600; color:#64748B; cursor:pointer; padding:7px 11px; border-radius:9px; transition:.15s; font-family:'DM Sans',sans-serif; }
  .chat-navbar-link:hover { color:#2563EB; background:#EFF6FF; }
  .chat-navbar-link.active { color:#2563EB; }
  .chat-navbar-divider { width:1px; height:22px; background:#E2E8F0; margin:0 6px; }
  .chat-navbar-login { font-size:14px; font-weight:700; color:#475569; cursor:pointer; padding:8px 14px; border-radius:10px; transition:.15s; font-family:'DM Sans',sans-serif; }
  .chat-navbar-login:hover { color:#0F172A; background:#F1F5F9; }
  .chat-navbar-cta { border:none; cursor:pointer; padding:11px 22px; border-radius:12px; background:linear-gradient(135deg,#2563EB,#3B82F6); color:#fff; font-size:13px; font-weight:700; transition:.2s; font-family:'DM Sans',sans-serif; }
  .chat-navbar-cta:hover { transform:translateY(-1px); box-shadow:0 12px 25px rgba(37,99,235,.22); }

  /* ── Chat button + badge ── */
  .chat-chat-btn-wrap { position:relative; display:inline-flex; margin-left:2px; cursor:pointer; }
  .chat-chat-btn { width:36px; height:36px; border-radius:50%; background:#F1F5F9; color:#475569; display:flex; align-items:center; justify-content:center; border:1.5px solid #E2E8F0; transition:.2s; }
  .chat-chat-btn:hover { background:#EFF6FF; color:#2563EB; border-color:#BFDBFE; }
  .chat-chat-badge {
    position:absolute; top:-3px; right:-3px;
    min-width:16px; height:16px;
    background:#EF4444; border-radius:999px; border:2px solid white;
    display:flex; align-items:center; justify-content:center;
    font-size:9px; font-weight:800; color:white; padding:0 3px; line-height:1;
    pointer-events:none; box-shadow:0 0 0 2px rgba(239,68,68,.2);
  }
  .chat-mobile-chat { display:none; }

  /* ── Avatar + notif dot ── */
  .chat-dropdown-wrap { position:relative; }
  .chat-avatar-wrap { position:relative; display:inline-block; margin-left:4px; }
  .chat-notif-dot { position:absolute; top:-2px; right:-2px; width:10px; height:10px; background:#EF4444; border-radius:50%; border:2.5px solid white; box-shadow:0 0 0 2px rgba(239,68,68,.22); pointer-events:none; }
  .chat-navbar-avatar { width:36px; height:36px; border-radius:50%; background:#DBEAFE; color:#1D4ED8; font-size:12px; font-weight:700; display:flex; align-items:center; justify-content:center; cursor:pointer; border:2px solid #BFDBFE; transition:.2s; font-family:'DM Sans',sans-serif; }
  .chat-navbar-avatar:hover { background:#BFDBFE; transform:scale(1.05); }
  .chat-navbar-dropdown { position:absolute; top:calc(100% + 10px); right:0; background:white; border:1px solid #E2E8F0; border-radius:16px; padding:8px; min-width:175px; box-shadow:0 8px 32px rgba(0,0,0,.10); display:flex; flex-direction:column; gap:2px; z-index:200; animation:ddFadeIn .15s ease; }
  @keyframes ddFadeIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
  .chat-navbar-dropdown button { display:flex; align-items:center; gap:10px; padding:10px 13px; border:none; background:none; border-radius:10px; font-size:13px; font-weight:600; color:#334155; cursor:pointer; width:100%; text-align:left; transition:.13s; font-family:'DM Sans',sans-serif; }
  .chat-navbar-dropdown button:hover { background:#F1F5F9; }
  .chat-navbar-dropdown .dd-divider { height:1px; background:#E2E8F0; margin:4px 0; }
  .chat-navbar-dropdown button.danger { color:#EF4444; }
  .chat-navbar-dropdown button.danger:hover { background:#FEF2F2; }

  /* ── dot & badge di bottom nav ── */
  .chat-bn-avatar-wrap { position:relative; display:inline-flex; }
  .chat-bn-notif-dot { position:absolute; top:-2px; right:-2px; width:7px; height:7px; background:#EF4444; border-radius:50%; border:1.5px solid white; }
  .chat-bn-icon-wrap { position:relative; display:inline-flex; }
  .chat-bn-chat-badge { position:absolute; top:-4px; right:-6px; min-width:14px; height:14px; background:#EF4444; border-radius:999px; border:1.5px solid white; display:flex; align-items:center; justify-content:center; font-size:8px; font-weight:800; color:white; padding:0 3px; line-height:1; pointer-events:none; }

  /* ── BOTTOM NAV ── */
  .chat-bottom-nav { display:none; }

  /* ── RESPONSIVE ── */
  @media(max-width:768px) {
    .chat-navbar-links { display:none; }
    .chat-mobile-chat { display:flex; }
  }
  @media(max-width:640px) {
    .chat-navbar { height:60px; padding:0 16px; }
    .chat-hero { padding:24px 16px !important; }
    .chat-content { padding:20px 16px 96px !important; }

    .chat-bottom-nav {
      display:flex; position:fixed; bottom:0; left:0; right:0; z-index:300;
      background:rgba(255,255,255,.97); backdrop-filter:blur(20px);
      border-top:1px solid #E2E8F0;
      padding:6px 0 calc(6px + env(safe-area-inset-bottom));
      justify-content:space-around; align-items:center;
      box-shadow:0 -4px 20px rgba(0,0,0,.07);
    }
    .chat-bn-item {
      display:flex; flex-direction:column; align-items:center; gap:3px;
      padding:6px 10px; border:none; background:none; border-radius:12px;
      cursor:pointer; color:#94A3B8; transition:color .15s;
      min-width:52px; font-family:'DM Sans',sans-serif;
    }
    .chat-bn-item.active { color:#2563EB; }
    .chat-bn-item span { font-size:10px; font-weight:700; letter-spacing:.1px; }
    .chat-bn-item.active::after { content:''; display:block; width:4px; height:4px; background:#2563EB; border-radius:50%; margin-top:1px; }
    .chat-bn-avatar { width:24px; height:24px; border-radius:50%; background:#DBEAFE; color:#1D4ED8; font-size:8px; font-weight:800; display:flex; align-items:center; justify-content:center; border:2px solid #BFDBFE; font-family:'DM Sans',sans-serif; }
    .chat-bn-item.active .chat-bn-avatar { background:#BFDBFE; border-color:#2563EB; }
  }
`;

const GRADIENTS = [
  "linear-gradient(135deg,#3B82F6,#22D3EE)",
  "linear-gradient(135deg,#8B5CF6,#22D3EE)",
  "linear-gradient(135deg,#10B981,#3B82F6)",
  "linear-gradient(135deg,#F59E0B,#F97316)",
  "linear-gradient(135deg,#EC4899,#FB7185)",
];
const avatarGradient = (id) =>
  GRADIENTS[parseInt(id?.slice(-4) || "0", 16) % GRADIENTS.length];

export default function ChatPage() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const menuRef     = useRef(null);
  const currentPath = location.pathname;

  const [searchQuery,  setSearchQuery]  = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [chatSessions, setChatSessions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showMenu,     setShowMenu]     = useState(false);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [unreadChat,   setUnreadChat]   = useState(0);

  const { kostName, ownerName } = location.state || {};

  const user       = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = !!user;
  const userName   = user?.name || "Guest";
  const token      = localStorage.getItem("token");
  const initials   = isLoggedIn
    ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "GU";

  /* ── Notif profil ── */
  useEffect(() => {
    const saved = localStorage.getItem("atap_notifications");
    if (saved) {
      try { setUnreadCount(JSON.parse(saved).filter((n) => n.unread).length); }
      catch { setUnreadCount(0); }
    } else {
      setUnreadCount(2);
    }
  }, []);

  /* close dropdown on outside click */
  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* ── Fetch chat sessions ── */
  useEffect(() => {
    const fetchChats = async () => {
      try {
        if (!token) { navigate("/login"); return; }

        const res = await fetch(`${API}/chats`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        const json = await res.json();
        const raw  = Array.isArray(json.data) ? json.data : [];

        const chats = raw.map((thread) => {
          const lm = thread.lastMessage;
          return {
            id:          thread.id,
            name:        thread.displayName || thread.owner?.name || "Pemilik Kost",
            kost:        thread.listing?.name || "-",
            lastMessage: lm?.message || "Belum ada pesan",
            time:        lm?.sentAt ? formatTime(new Date(lm.sentAt)) : "",
            unread:      lm && !lm.readAt && lm.senderId !== user?.id ? 1 : 0,
            isRead:      lm ? !!lm.readAt : true,
          };
        });

        // Hitung total unread untuk badge navbar
        const totalUnread = chats.reduce((acc, c) => acc + c.unread, 0);
        setUnreadChat(totalUnread);
        setChatSessions(chats);
      } catch (err) {
        console.error("Error fetching chats:", err);
        setChatSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [navigate, token]);

  function formatTime(date) {
    const now = new Date();
    const diffDays = Math.floor((now - date) / 86_400_000);
    if (diffDays === 0) return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return "Kemarin";
    if (diffDays < 7)  return date.toLocaleDateString("id-ID", { weekday: "short" });
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
  }

  const filtered = chatSessions.filter((chat) => {
    const matchSearch =
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.kost.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter =
      activeFilter === "Semua" ||
      (activeFilter === "Belum dibaca" && chat.unread > 0) ||
      (activeFilter === "Sudah dibaca" && chat.unread === 0);
    return matchSearch && matchFilter;
  });

  const hasChats      = chatSessions.length > 0;
  const noSearchResult = hasChats && filtered.length === 0;

  const doLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth");
  };

  return (
    <>
      <style>{css}</style>
      <div className="min-h-screen bg-[#F8FAFC] pb-16">

        {/* ── NAVBAR ── */}
        <nav className="chat-navbar">
          <div className="chat-navbar-logo" onClick={() => navigate("/")}>Atap<span>.</span></div>

          <div className="chat-navbar-links">
            {isLoggedIn ? (
              <>
                {DESKTOP_LINKS.map(({ label, path }) => (
                  <span key={path}
                    className={`chat-navbar-link${currentPath === path ? " active" : ""}`}
                    onClick={() => navigate(path)}>
                    {label}
                  </span>
                ))}
                <div className="chat-navbar-divider" />

                {/* Chat icon + badge — di halaman chat ini, icon dibuat active */}
                <div className="chat-chat-btn-wrap" onClick={() => navigate("/chat")} title="Chat">
                  <div className="chat-chat-btn" style={{ background: "#EFF6FF", color: "#2563EB", borderColor: "#BFDBFE" }}>
                    <MessageCircle size={16} />
                  </div>
                  {unreadChat > 0 && (
                    <span className="chat-chat-badge">{unreadChat > 99 ? "99+" : unreadChat}</span>
                  )}
                </div>

                {/* Avatar + notif dot */}
                <div className="chat-dropdown-wrap" ref={menuRef}>
                  <div className="chat-avatar-wrap">
                    <div className="chat-navbar-avatar" onClick={() => setShowMenu((p) => !p)} title={userName}>
                      {initials}
                    </div>
                    {unreadCount > 0 && <span className="chat-notif-dot" />}
                  </div>
                  {showMenu && (
                    <div className="chat-navbar-dropdown">
                      <button onClick={() => { navigate("/profil"); setShowMenu(false); }}>
                        <User size={14} /> Profil
                        {unreadCount > 0 && (
                          <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: "#EF4444", background: "#FEF2F2", padding: "2px 7px", borderRadius: 99 }}>
                            {unreadCount} baru
                          </span>
                        )}
                      </button>
                      <button onClick={() => { navigate("/settings/account"); setShowMenu(false); }}>
                        <Settings size={14} /> Pengaturan
                      </button>
                      <div className="dd-divider" />
                      <button className="danger" onClick={doLogout}><LogOut size={14} /> Logout</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <span className="chat-navbar-link" onClick={() => navigate("/search")}>Search</span>
                <span className="chat-navbar-link" onClick={() => navigate("/map")}>Peta</span>
                <div className="chat-navbar-divider" />
                <span className="chat-navbar-login" onClick={() => navigate("/auth")}>Masuk</span>
                <button className="chat-navbar-cta" onClick={() => navigate("/auth")}>Daftar Gratis</button>
              </>
            )}
          </div>

          {/* Mobile: chat icon kanan navbar */}
          {isLoggedIn && (
            <div className="chat-chat-btn-wrap chat-mobile-chat" onClick={() => navigate("/chat")} title="Chat">
              <div className="chat-chat-btn" style={{ background: "#EFF6FF", color: "#2563EB", borderColor: "#BFDBFE" }}>
                <MessageCircle size={16} />
              </div>
              {unreadChat > 0 && (
                <span className="chat-chat-badge">{unreadChat > 99 ? "99+" : unreadChat}</span>
              )}
            </div>
          )}
        </nav>

        {/* ── HERO STRIP ── */}
        <div className="chat-hero" style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 45%, #2563EB 100%)",
          padding: "32px 42px", display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: -0.8, margin: 0 }}>
              Pesan<span style={{ color: "#93C5FD" }}>.</span>
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.6)", margin: "4px 0 0" }}>
              {chatSessions.length} percakapan aktif
            </p>
          </div>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MessageCircle size={24} color="rgba(255,255,255,.8)" />
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="chat-content" style={{ maxWidth: 672, margin: "0 auto", padding: "28px 28px 40px" }}>

          {/* Search */}
          <div style={{ position: "relative", marginBottom: 16 }}>
            <Search style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} size={16} />
            <input
              type="text"
              placeholder="Cari pemilik atau nama kos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%", height: 44, paddingLeft: 42, paddingRight: 16, background: "white", border: "1.5px solid #E2E8F0", borderRadius: 14, fontSize: 14, outline: "none", fontFamily: "'DM Sans', sans-serif", color: "#0F172A" }}
            />
          </div>

          {/* Filter chips */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)} style={{
                padding: "7px 16px", borderRadius: 999,
                border: activeFilter === f ? "1.5px solid #2563EB" : "1.5px solid #E2E8F0",
                background: activeFilter === f ? "linear-gradient(135deg,#1D4ED8,#2563EB)" : "white",
                color: activeFilter === f ? "white" : "#64748B",
                fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}>
                {f}
              </button>
            ))}
          </div>

          {/* Section header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 17, fontWeight: 800, letterSpacing: -0.5, margin: 0 }}>
              Percakapan
            </h2>
            <span style={{ background: "#EFF6FF", color: "#2563EB", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 999 }}>
              {chatSessions.length} aktif
            </span>
          </div>

          {/* New-chat banner */}
          {kostName && (
            <div style={{ marginBottom: 16, padding: 16, background: "#EFF6FF", borderRadius: 16, display: "flex", gap: 12, border: "1px solid #BFDBFE" }}>
              <MessageCircle size={17} color="#2563EB" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontSize: 12, color: "#3B82F6", fontWeight: 600, margin: 0 }}>Mulai chat dengan</p>
                <p style={{ fontSize: 14, fontWeight: 700, margin: "2px 0 0" }}>{ownerName}</p>
                <p style={{ fontSize: 12, color: "#94A3B8", margin: "2px 0 0" }}>Tentang: {kostName}</p>
              </div>
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, background: "white", borderRadius: 16, border: "1px solid #F1F5F9" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: "#F1F5F9", flexShrink: 0 }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ height: 12, background: "#F1F5F9", borderRadius: 999, width: "50%" }} />
                    <div style={{ height: 10, background: "#F1F5F9", borderRadius: 999, width: "33%" }} />
                    <div style={{ height: 10, background: "#F1F5F9", borderRadius: 999, width: "75%" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !hasChats && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: 64, gap: 12 }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MessageCircle size={28} color="#CBD5E1" />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#475569", margin: 0 }}>Belum ada percakapan</p>
              <p style={{ fontSize: 13, color: "#94A3B8", textAlign: "center", maxWidth: 220, lineHeight: 1.6, margin: 0 }}>
                Cari kos yang kamu suka dan mulai chat dengan pemiliknya
              </p>
            </div>
          )}

          {/* No search result */}
          {!loading && noSearchResult && (
            <p style={{ textAlign: "center", color: "#94A3B8", marginTop: 40, fontSize: 14 }}>
              Tidak ditemukan untuk "{searchQuery}"
            </p>
          )}

          {/* Chat list */}
          {!loading && hasChats && !noSearchResult && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map((chat) => (
                <button key={chat.id} onClick={() => navigate(`/chat/${chat.id}`)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: 16, background: "white", borderRadius: 16, border: "1px solid #F1F5F9", cursor: "pointer", textAlign: "left", transition: ".15s", fontFamily: "'DM Sans', sans-serif" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#F8FAFC"; e.currentTarget.style.borderColor = "#BFDBFE"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#F1F5F9"; }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 16, background: avatarGradient(chat.id) }}>
                    {chat.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {chat.name}
                      </span>
                      <span style={{ fontSize: 11, color: "#94A3B8", flexShrink: 0, marginLeft: 8 }}>{chat.time}</span>
                    </div>
                    <p style={{ fontSize: 12, color: "#3B82F6", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: "2px 0" }}>
                      {chat.kost}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ fontSize: 12, color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, margin: 0 }}>
                        {chat.lastMessage}
                      </p>
                      <div style={{ flexShrink: 0, marginLeft: 8 }}>
                        {chat.unread > 0 ? (
                          <span style={{ background: "#2563EB", color: "white", fontSize: 11, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", fontWeight: 700 }}>
                            {chat.unread}
                          </span>
                        ) : chat.isRead ? (
                          <CheckCheck size={15} color="#60A5FA" />
                        ) : (
                          <Check size={15} color="#CBD5E1" />
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={14} color="#CBD5E1" style={{ flexShrink: 0 }} />
                </button>
              ))}
            </div>
          )}

          {/* Safety banner */}
          <div style={{ marginTop: 32, padding: 20, background: "#0F172A", borderRadius: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <ShieldCheck size={20} color="#34D399" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 700, color: "white", margin: 0 }}>
                Bertransaksi aman
              </h4>
              <p style={{ fontSize: 12, color: "#64748B", margin: "4px 0 0" }}>
                Gunakan fitur <span style={{ color: "#60A5FA" }}>Bayar di Atap</span> untuk keamanan transaksimu
              </p>
            </div>
          </div>
        </div>

        {/* ── MOBILE BOTTOM NAV ── */}
        <nav className="chat-bottom-nav">
          {(isLoggedIn ? MOBILE_NAV : GUEST_MOBILE).map(({ label, path, icon: Icon }) => {
            const isActive = currentPath === path;
            const isProfil = path === "/profil";
            const isChat   = path === "/chat";
            return (
              <button key={path} className={`chat-bn-item${isActive ? " active" : ""}`} onClick={() => navigate(path)}>
                {isProfil && isLoggedIn ? (
                  <div className="chat-bn-avatar-wrap">
                    <div className="chat-bn-avatar">{initials}</div>
                    {unreadCount > 0 && <span className="chat-bn-notif-dot" />}
                  </div>
                ) : isChat && isLoggedIn ? (
                  <div className="chat-bn-icon-wrap">
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                    {unreadChat > 0 && (
                      <span className="chat-bn-chat-badge">{unreadChat > 99 ? "99+" : unreadChat}</span>
                    )}
                  </div>
                ) : (
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                )}
                <span>{label}</span>
              </button>
            );
          })}
          {!isLoggedIn && (
            <button className={`chat-bn-item${currentPath === "/auth" ? " active" : ""}`} onClick={() => navigate("/auth")}>
              <User size={20} strokeWidth={currentPath === "/auth" ? 2.5 : 1.8} />
              <span>Masuk</span>
            </button>
          )}
        </nav>

      </div>
    </>
  );
}