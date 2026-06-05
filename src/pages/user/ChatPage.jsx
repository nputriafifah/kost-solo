import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle, Search, CheckCheck, Check, ShieldCheck, ChevronRight,
  Home, Map, Heart, User, Settings, LogOut,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { getApiBase } from "../../config/apiBase";
import UserBottomNav, { USER_BOTTOM_NAV_CSS } from "../../components/user/UserBottomNav";

const API = getApiBase();

function authHeaders(token) {
  const h = { "Content-Type": "application/json" };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}
const FILTERS = ["Semua", "Belum dibaca", "Sudah dibaca"];

const NAV_ITEMS = [
  { label: "Home",    path: "/",       icon: Home,          desktop: true,  mobile: true,  guestMobile: true  },
  { label: "Search",  path: "/search", icon: Search,        desktop: true,  mobile: true,  guestMobile: true  },
  { label: "Peta",    path: "/map",    icon: Map,           desktop: true,  mobile: true,  guestMobile: true  },
  { label: "My List", path: "/like",   icon: Heart,         desktop: true,  mobile: true,  guestMobile: false },
  { label: "Chat",    path: "/chat",   icon: MessageCircle, desktop: false, mobile: false, guestMobile: false },
  { label: "Profil",  path: "/profil", icon: User,          desktop: false, mobile: true,  guestMobile: false },
];

const DESKTOP_LINKS = NAV_ITEMS.filter((n) => n.desktop);
const MOBILE_NAV    = NAV_ITEMS.filter((n) => n.mobile);
const GUEST_MOBILE  = NAV_ITEMS.filter((n) => n.guestMobile);

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;700&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg-primary); transition: background 0.3s, color 0.3s; }

  /* ── DARK MODE VARIABLES (fallback jika belum di index.css) ── */
  :root {
    --bg-primary: #F8FAFC;
    --bg-secondary: #FFFFFF;
    --bg-tertiary: #F1F5F9;
    --text-primary: #0F172A;
    --text-secondary: #64748B;
    --border-color: #E2E8F0;
    --card-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  .dark-mode {
    --bg-primary: #0F172A;
    --bg-secondary: #1E293B;
    --bg-tertiary: #334155;
    --text-primary: #F8FAFC;
    --text-secondary: #CBD5E1;
    --border-color: #334155;
    --card-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }

  /* ── ROOT ── */
  .chat-root {
    min-height: 100vh;
    background: var(--bg-primary);
    color: var(--text-primary);
    transition: background 0.3s, color 0.3s;
  }

  /* ── NAVBAR ── */
  .chat-navbar {
    position: sticky; top: 0; z-index: 100;
    height: 72px;
    background: rgba(255,255,255,.92); backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border-color);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 42px;
    transition: background 0.3s, border-color 0.3s;
  }
  .dark-mode .chat-navbar { background: rgba(30,41,59,.92); }

  .chat-navbar-logo { font-family:'Plus Jakarta Sans',sans-serif; font-size:25px; font-weight:800; letter-spacing:-1px; color:var(--text-primary); cursor:pointer; }
  .chat-navbar-logo span { color:#2563EB; }
  .chat-navbar-links { display:flex; align-items:center; gap:4px; }
  .chat-navbar-link { font-size:14px; font-weight:600; color:var(--text-secondary); cursor:pointer; padding:7px 11px; border-radius:9px; transition:.15s; font-family:'DM Sans',sans-serif; }
  .chat-navbar-link:hover { color:#2563EB; background:#EFF6FF; }
  .dark-mode .chat-navbar-link:hover { background:rgba(59,130,246,.15); }
  .chat-navbar-link.active { color:#2563EB; }
  .chat-navbar-divider { width:1px; height:22px; background:var(--border-color); margin:0 6px; }
  .chat-navbar-login { font-size:14px; font-weight:700; color:var(--text-secondary); cursor:pointer; padding:8px 14px; border-radius:10px; transition:.15s; font-family:'DM Sans',sans-serif; }
  .chat-navbar-login:hover { color:var(--text-primary); background:var(--bg-tertiary); }
  .chat-navbar-cta { border:none; cursor:pointer; padding:11px 22px; border-radius:12px; background:linear-gradient(135deg,#2563EB,#3B82F6); color:#fff; font-size:13px; font-weight:700; transition:.2s; font-family:'DM Sans',sans-serif; }
  .chat-navbar-cta:hover { transform:translateY(-1px); box-shadow:0 12px 25px rgba(37,99,235,.22); }

  /* ── Chat button + badge ── */
  .chat-chat-btn-wrap { position:relative; display:inline-flex; margin-left:2px; cursor:pointer; }
  .chat-chat-btn { width:36px; height:36px; border-radius:50%; background:var(--bg-tertiary); color:var(--text-secondary); display:flex; align-items:center; justify-content:center; border:1.5px solid var(--border-color); transition:.2s; }
  .chat-chat-btn:hover { background:#EFF6FF; color:#2563EB; border-color:#BFDBFE; }
  .dark-mode .chat-chat-btn:hover { background:rgba(59,130,246,.15); }
  .chat-chat-badge {
    position:absolute; top:-3px; right:-3px;
    min-width:16px; height:16px;
    background:#EF4444; border-radius:999px; border:2px solid var(--bg-secondary);
    display:flex; align-items:center; justify-content:center;
    font-size:9px; font-weight:800; color:white; padding:0 3px; line-height:1;
    pointer-events:none; box-shadow:0 0 0 2px rgba(239,68,68,.2);
  }
  .chat-mobile-chat { display:none; }

  /* ── Avatar + notif dot ── */
  .chat-dropdown-wrap { position:relative; }
  .chat-avatar-wrap { position:relative; display:inline-block; margin-left:4px; }
  .chat-notif-dot { position:absolute; top:-2px; right:-2px; width:10px; height:10px; background:#EF4444; border-radius:50%; border:2.5px solid var(--bg-secondary); box-shadow:0 0 0 2px rgba(239,68,68,.22); pointer-events:none; }
  .chat-navbar-avatar { width:36px; height:36px; border-radius:50%; background:#DBEAFE; color:#1D4ED8; font-size:12px; font-weight:700; display:flex; align-items:center; justify-content:center; cursor:pointer; border:2px solid #BFDBFE; transition:.2s; font-family:'DM Sans',sans-serif; }
  .chat-navbar-avatar:hover { background:#BFDBFE; transform:scale(1.05); }

  /* ── Dropdown ── */
  .chat-navbar-dropdown { position:absolute; top:calc(100% + 10px); right:0; background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:16px; padding:8px; min-width:175px; box-shadow:var(--card-shadow); display:flex; flex-direction:column; gap:2px; z-index:200; animation:ddFadeIn .15s ease; }
  @keyframes ddFadeIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
  .chat-navbar-dropdown button { display:flex; align-items:center; gap:10px; padding:10px 13px; border:none; background:none; border-radius:10px; font-size:13px; font-weight:600; color:var(--text-secondary); cursor:pointer; width:100%; text-align:left; transition:.13s; font-family:'DM Sans',sans-serif; }
  .chat-navbar-dropdown button:hover { background:var(--bg-tertiary); color:var(--text-primary); }
  .chat-navbar-dropdown .dd-divider { height:1px; background:var(--border-color); margin:4px 0; }
  .chat-navbar-dropdown button.danger { color:#EF4444; }
  .chat-navbar-dropdown button.danger:hover { background:#FEF2F2; }
  .dark-mode .chat-navbar-dropdown button.danger:hover { background:rgba(239,68,68,.15); }

  /* ── SEARCH INPUT ── */
  .chat-search-input {
    width:100%; height:44px; padding-left:42px; padding-right:16px;
    background:var(--bg-secondary); border:1.5px solid var(--border-color);
    border-radius:14px; font-size:14px; outline:none;
    font-family:'DM Sans',sans-serif; color:var(--text-primary);
    transition: background 0.3s, border-color 0.3s, color 0.3s;
  }
  .chat-search-input::placeholder { color:var(--text-secondary); }

  /* ── FILTER CHIPS ── */
  .chat-chip {
    padding:7px 16px; border-radius:999px;
    font-size:12px; font-weight:700; cursor:pointer;
    font-family:'DM Sans',sans-serif; transition:.15s;
  }
  .chat-chip-inactive {
    border:1.5px solid var(--border-color);
    background:var(--bg-secondary);
    color:var(--text-secondary);
  }
  .chat-chip-inactive:hover { border-color:#93C5FD; color:#2563EB; }
  .chat-chip-active {
    border:1.5px solid #2563EB;
    background:linear-gradient(135deg,#1D4ED8,#2563EB);
    color:white;
  }

  /* ── CHAT CARD ── */
  .chat-card {
    width:100%; display:flex; align-items:center; gap:12px;
    padding:16px; background:var(--bg-secondary);
    border-radius:16px; border:1px solid var(--border-color);
    cursor:pointer; text-align:left; transition:.15s;
    font-family:'DM Sans',sans-serif;
  }
  .chat-card:hover { background:var(--bg-tertiary); border-color:#BFDBFE; }

  /* ── SKELETON ── */
  .chat-skeleton-wrap { background:var(--bg-secondary); border-radius:16px; border:1px solid var(--border-color); }
  .chat-skeleton-block { background:var(--bg-tertiary); border-radius:999px; }
  .chat-skeleton-avatar { background:var(--bg-tertiary); border-radius:14px; width:48px; height:48px; flex-shrink:0; }

  /* ── SECTION HEADER badge ── */
  .chat-count-badge { background:#EFF6FF; color:#2563EB; font-size:12px; font-weight:700; padding:4px 12px; border-radius:999px; }
  .dark-mode .chat-count-badge { background:rgba(59,130,246,.15); }

  /* ── NEW CHAT BANNER ── */
  .chat-new-banner { margin-bottom:16px; padding:16px; background:#EFF6FF; border-radius:16px; display:flex; gap:12px; border:1px solid #BFDBFE; }
  .dark-mode .chat-new-banner { background:rgba(59,130,246,.1); border-color:rgba(59,130,246,.3); }

  /* ── EMPTY STATE ── */
  .chat-empty-icon { width:64px; height:64px; border-radius:20px; background:var(--bg-tertiary); display:flex; align-items:center; justify-content:center; }

  /* ── SAFETY BANNER ── */
  .chat-safety { margin-top:32px; padding:20px; background:#0F172A; border-radius:20px; display:flex; gap:12px; align-items:flex-start; }
  .dark-mode .chat-safety { background:#0F172A; border:1px solid var(--border-color); }

  /* ── RESPONSIVE ── */
  @media(max-width:768px) {
    .chat-navbar-links { display:none; }
    .chat-mobile-chat { display:flex; }
  }
  @media(max-width:640px) {
    .chat-navbar { height:60px; padding:0 16px; }
    .chat-hero { padding:24px 16px !important; }
    .chat-content { padding:20px 16px 32px !important; }
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

  useEffect(() => {
    const saved = localStorage.getItem("atap_notifications");
    if (saved) {
      try { setUnreadCount(JSON.parse(saved).filter((n) => n.unread).length); }
      catch { setUnreadCount(0); }
    } else {
      setUnreadCount(2);
    }
  }, []);

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        if (!token) { navigate("/auth"); return; }
        const res = await fetch(`${API}/chats`, { headers: authHeaders(token) });
        if (res.status === 401) { localStorage.removeItem("token"); navigate("/auth"); return; }
        if (!res.ok) throw new Error("Gagal memuat chat");
        const json = await res.json();
        const raw  = Array.isArray(json.data) ? json.data : [];
        const chats = raw.map((thread) => {
          const lm = thread.lastMessage;
          return {
            id:          thread.id,
            name:        thread.owner?.name || "Pemilik Kost",
            kost:        thread.listing?.name || thread.owner?.kostName || "-",
            lastMessage: lm?.message || "Belum ada pesan",
            time:        lm?.sentAt ? formatTime(new Date(lm.sentAt)) : "",
            unread:      lm && !lm.readAt && lm.senderId !== user?.id ? 1 : 0,
            isRead:      lm ? !!lm.readAt : true,
          };
        });
        setUnreadChat(chats.reduce((acc, c) => acc + c.unread, 0));
        setChatSessions(chats);
      } catch (err) {
        console.error("Error fetching chats:", err);
        setChatSessions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, [navigate, token, user?.id]);

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

  const hasChats       = chatSessions.length > 0;
  const noSearchResult = hasChats && filtered.length === 0;

  const doLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth");
  };

  return (
    <>
      <style>{css}</style>
      <style>{USER_BOTTOM_NAV_CSS}</style>
      <div className="chat-root user-page-shell">

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

                <div className="chat-chat-btn-wrap" onClick={() => navigate("/chat")} title="Chat">
                  <div className="chat-chat-btn" style={{ background: "#EFF6FF", color: "#2563EB", borderColor: "#BFDBFE" }}>
                    <MessageCircle size={16} />
                  </div>
                  {unreadChat > 0 && <span className="chat-chat-badge">{unreadChat > 99 ? "99+" : unreadChat}</span>}
                </div>

                <div className="chat-dropdown-wrap" ref={menuRef}>
                  <div className="chat-avatar-wrap">
                    <div className="chat-navbar-avatar" onClick={() => setShowMenu((p) => !p)} title={userName}>{initials}</div>
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

          {isLoggedIn && (
            <div className="chat-chat-btn-wrap chat-mobile-chat" onClick={() => navigate("/chat")} title="Chat">
              <div className="chat-chat-btn" style={{ background: "#EFF6FF", color: "#2563EB", borderColor: "#BFDBFE" }}>
                <MessageCircle size={16} />
              </div>
              {unreadChat > 0 && <span className="chat-chat-badge">{unreadChat > 99 ? "99+" : unreadChat}</span>}
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
            <Search style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} size={16} />
            <input
              type="text"
              placeholder="Cari pemilik atau nama kos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="chat-search-input"
            />
          </div>

          {/* Filter chips */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`chat-chip ${activeFilter === f ? "chat-chip-active" : "chat-chip-inactive"}`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Section header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 17, fontWeight: 800, letterSpacing: -0.5, margin: 0, color: "var(--text-primary)" }}>
              Percakapan
            </h2>
            <span className="chat-count-badge">{chatSessions.length} aktif</span>
          </div>

          {/* New-chat banner */}
          {kostName && (
            <div className="chat-new-banner">
              <MessageCircle size={17} color="#2563EB" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontSize: 12, color: "#3B82F6", fontWeight: 600, margin: 0 }}>Mulai chat dengan</p>
                <p style={{ fontSize: 14, fontWeight: 700, margin: "2px 0 0", color: "var(--text-primary)" }}>{ownerName}</p>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>Tentang: {kostName}</p>
              </div>
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="chat-skeleton-wrap" style={{ display: "flex", alignItems: "center", gap: 12, padding: 16 }}>
                  <div className="chat-skeleton-avatar" />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div className="chat-skeleton-block" style={{ height: 12, width: "50%" }} />
                    <div className="chat-skeleton-block" style={{ height: 10, width: "33%" }} />
                    <div className="chat-skeleton-block" style={{ height: 10, width: "75%" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !hasChats && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: 64, gap: 12 }}>
              <div className="chat-empty-icon">
                <MessageCircle size={28} color="var(--text-secondary)" />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Belum ada percakapan</p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", textAlign: "center", maxWidth: 220, lineHeight: 1.6, margin: 0 }}>
                Cari kos yang kamu suka dan mulai chat dengan pemiliknya
              </p>
            </div>
          )}

          {/* No search result */}
          {!loading && noSearchResult && (
            <p style={{ textAlign: "center", color: "var(--text-secondary)", marginTop: 40, fontSize: 14 }}>
              Tidak ditemukan untuk "{searchQuery}"
            </p>
          )}

          {/* Chat list */}
          {!loading && hasChats && !noSearchResult && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map((chat) => (
                <button key={chat.id} onClick={() => navigate(`/chat/${chat.id}`)} className="chat-card">
                  <div style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 16, background: avatarGradient(chat.id) }}>
                    {chat.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {chat.name}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-secondary)", flexShrink: 0, marginLeft: 8 }}>{chat.time}</span>
                    </div>
                    <p style={{ fontSize: 12, color: "#3B82F6", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: "2px 0" }}>
                      {chat.kost}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ fontSize: 12, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, margin: 0 }}>
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
                          <Check size={15} color="var(--text-secondary)" />
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={14} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
                </button>
              ))}
            </div>
          )}

          {/* Safety banner */}
          <div className="chat-safety">
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

        <UserBottomNav />

      </div>
    </>
  );
}