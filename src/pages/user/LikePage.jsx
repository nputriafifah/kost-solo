import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Heart, AlertCircle, RefreshCw,
  Home, Map, MessageCircle, User, Settings, LogOut, Search,
} from "lucide-react";
import KostCard from "../../components/kost/KostCard";

const BASE_URL = "http://localhost:3000";

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
  .fav-navbar {
    position: sticky; top: 0; z-index: 100;
    height: 72px;
    background: rgba(255,255,255,.92); backdrop-filter: blur(16px);
    border-bottom: 1px solid #EAEFF5;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 42px;
  }
  .fav-navbar-logo { font-family:'Plus Jakarta Sans',sans-serif; font-size:25px; font-weight:800; letter-spacing:-1px; color:#0F172A; cursor:pointer; }
  .fav-navbar-logo span { color:#2563EB; }
  .fav-navbar-links { display:flex; align-items:center; gap:4px; }
  .fav-navbar-link { font-size:14px; font-weight:600; color:#64748B; cursor:pointer; padding:7px 11px; border-radius:9px; transition:.15s; font-family:'DM Sans',sans-serif; }
  .fav-navbar-link:hover { color:#2563EB; background:#EFF6FF; }
  .fav-navbar-link.active { color:#2563EB; }
  .fav-navbar-divider { width:1px; height:22px; background:#E2E8F0; margin:0 6px; }
  .fav-navbar-login { font-size:14px; font-weight:700; color:#475569; cursor:pointer; padding:8px 14px; border-radius:10px; transition:.15s; font-family:'DM Sans',sans-serif; }
  .fav-navbar-login:hover { color:#0F172A; background:#F1F5F9; }
  .fav-navbar-cta { border:none; cursor:pointer; padding:11px 22px; border-radius:12px; background:linear-gradient(135deg,#2563EB,#3B82F6); color:#fff; font-size:13px; font-weight:700; transition:.2s; font-family:'DM Sans',sans-serif; }
  .fav-navbar-cta:hover { transform:translateY(-1px); box-shadow:0 12px 25px rgba(37,99,235,.22); }

  /* ── Chat button + badge ── */
  .fav-chat-btn-wrap { position:relative; display:inline-flex; margin-left:2px; cursor:pointer; }
  .fav-chat-btn { width:36px; height:36px; border-radius:50%; background:#F1F5F9; color:#475569; display:flex; align-items:center; justify-content:center; border:1.5px solid #E2E8F0; transition:.2s; }
  .fav-chat-btn:hover { background:#EFF6FF; color:#2563EB; border-color:#BFDBFE; }
  .fav-chat-badge {
    position:absolute; top:-3px; right:-3px;
    min-width:16px; height:16px;
    background:#EF4444; border-radius:999px; border:2px solid white;
    display:flex; align-items:center; justify-content:center;
    font-size:9px; font-weight:800; color:white; padding:0 3px; line-height:1;
    pointer-events:none; box-shadow:0 0 0 2px rgba(239,68,68,.2);
  }
  .fav-mobile-chat { display:none; }

  /* ── Avatar + notif dot ── */
  .fav-dropdown-wrap { position:relative; }
  .fav-avatar-wrap { position:relative; display:inline-block; margin-left:4px; }
  .fav-notif-dot { position:absolute; top:-2px; right:-2px; width:10px; height:10px; background:#EF4444; border-radius:50%; border:2.5px solid white; box-shadow:0 0 0 2px rgba(239,68,68,.22); pointer-events:none; }
  .fav-navbar-avatar { width:36px; height:36px; border-radius:50%; background:#DBEAFE; color:#1D4ED8; font-size:12px; font-weight:700; display:flex; align-items:center; justify-content:center; cursor:pointer; border:2px solid #BFDBFE; transition:.2s; font-family:'DM Sans',sans-serif; }
  .fav-navbar-avatar:hover { background:#BFDBFE; transform:scale(1.05); }
  .fav-navbar-dropdown { position:absolute; top:calc(100% + 10px); right:0; background:white; border:1px solid #E2E8F0; border-radius:16px; padding:8px; min-width:175px; box-shadow:0 8px 32px rgba(0,0,0,.10); display:flex; flex-direction:column; gap:2px; z-index:200; animation:ddFadeIn .15s ease; }
  @keyframes ddFadeIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
  .fav-navbar-dropdown button { display:flex; align-items:center; gap:10px; padding:10px 13px; border:none; background:none; border-radius:10px; font-size:13px; font-weight:600; color:#334155; cursor:pointer; width:100%; text-align:left; transition:.13s; font-family:'DM Sans',sans-serif; }
  .fav-navbar-dropdown button:hover { background:#F1F5F9; }
  .fav-navbar-dropdown .dd-divider { height:1px; background:#E2E8F0; margin:4px 0; }
  .fav-navbar-dropdown button.danger { color:#EF4444; }
  .fav-navbar-dropdown button.danger:hover { background:#FEF2F2; }

  /* ── HERO ── */
  .fav-hero {
    background: linear-gradient(135deg, #0F172A 0%, #1E3A8A 45%, #2563EB 100%);
    padding: 32px 42px;
    display: flex; align-items: center; justify-content: space-between;
  }

  /* ── CONTENT ── */
  .fav-content { max-width: 900px; margin: 0 auto; padding: 28px 28px 40px; }
  .fav-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }

  /* ── dot & badge di bottom nav ── */
  .fav-bn-avatar-wrap { position:relative; display:inline-flex; }
  .fav-bn-notif-dot { position:absolute; top:-2px; right:-2px; width:7px; height:7px; background:#EF4444; border-radius:50%; border:1.5px solid white; }
  .fav-bn-icon-wrap { position:relative; display:inline-flex; }
  .fav-bn-chat-badge { position:absolute; top:-4px; right:-6px; min-width:14px; height:14px; background:#EF4444; border-radius:999px; border:1.5px solid white; display:flex; align-items:center; justify-content:center; font-size:8px; font-weight:800; color:white; padding:0 3px; line-height:1; pointer-events:none; }

  /* ── BOTTOM NAV ── */
  .fav-bottom-nav { display:none; }

  /* ── RESPONSIVE ── */
  @media(max-width: 900px) { .fav-grid { grid-template-columns: repeat(2, 1fr); } }

  @media(max-width: 768px) {
    .fav-navbar-links { display:none; }
    .fav-mobile-chat { display:flex; }
  }

  @media(max-width: 640px) {
    .fav-navbar { height:60px; padding:0 16px; }
    .fav-hero { padding:24px 16px; }
    .fav-content { padding:20px 16px 96px; }
    .fav-grid { grid-template-columns:repeat(2, 1fr); gap:12px; }

    .fav-bottom-nav {
      display:flex; position:fixed; bottom:0; left:0; right:0; z-index:300;
      background:rgba(255,255,255,.97); backdrop-filter:blur(20px);
      border-top:1px solid #E2E8F0;
      padding:6px 0 calc(6px + env(safe-area-inset-bottom));
      justify-content:space-around; align-items:center;
      box-shadow:0 -4px 20px rgba(0,0,0,.07);
    }
    .fav-bn-item {
      display:flex; flex-direction:column; align-items:center; gap:3px;
      padding:6px 10px; border:none; background:none; border-radius:12px;
      cursor:pointer; color:#94A3B8; transition:color .15s;
      min-width:52px; font-family:'DM Sans',sans-serif;
    }
    .fav-bn-item.active { color:#2563EB; }
    .fav-bn-item span { font-size:10px; font-weight:700; letter-spacing:.1px; }
    .fav-bn-item.active::after { content:''; display:block; width:4px; height:4px; background:#2563EB; border-radius:50%; margin-top:1px; }
    .fav-bn-avatar { width:24px; height:24px; border-radius:50%; background:#DBEAFE; color:#1D4ED8; font-size:8px; font-weight:800; display:flex; align-items:center; justify-content:center; border:2px solid #BFDBFE; font-family:'DM Sans',sans-serif; }
    .fav-bn-item.active .fav-bn-avatar { background:#BFDBFE; border-color:#2563EB; }
  }
`;

export default function LikePage() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const menuRef     = useRef(null);
  const currentPath = location.pathname;

  const [data,        setData]       = useState([]);
  const [loading,     setLoading]    = useState(true);
  const [error,       setError]      = useState(null);
  const [showMenu,    setShowMenu]   = useState(false);
  const [unreadCount, setUnreadCount]= useState(0);
  const [unreadChat,  setUnreadChat] = useState(0);

  const token      = localStorage.getItem("token");
  const user       = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = !!user;
  const userName   = user?.name || "Guest";
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

  /* ── Unread chat ── */
  useEffect(() => {
    if (!isLoggedIn || !token) return;
    const fetchUnreadChat = async () => {
      try {
        const res = await fetch("http://localhost:8080/chats", {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const json = await res.json();
        const raw  = Array.isArray(json.data) ? json.data : [];
        const total = raw.reduce((acc, thread) => {
          const lm = thread.lastMessage;
          return (lm && !lm.readAt && lm.senderId !== user?.id) ? acc + 1 : acc;
        }, 0);
        setUnreadChat(total);
      } catch { /* biarkan 0 */ }
    };
    fetchUnreadChat();
    const interval = setInterval(fetchUnreadChat, 30_000);
    return () => clearInterval(interval);
  }, [isLoggedIn, token, user?.id]);

  /* close dropdown on outside click */
  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const fetchFavorites = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${BASE_URL}/favorites`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Gagal fetch favorites");
      const json = await res.json();
      const mapped = (json.data || []).map((item) => ({
        id: String(item.id),
        name: item.name,
        price: item.cheapestPrice ?? null,
        location: item.address ?? "",
        gender: item.genderType ?? "",
        image: item.thumbnailUrl
          ? item.thumbnailUrl.startsWith("http") ? item.thumbnailUrl : `${BASE_URL}${item.thumbnailUrl}`
          : null,
      }));
      setData(mapped);
    } catch (err) {
      console.error(err); setError("Gagal memuat favorit");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchFavorites(); }, []);

  const handleRemove = async (id, e) => {
    e.stopPropagation();
    try {
      await fetch(`${BASE_URL}/favorites/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setData((prev) => prev.filter((item) => item.id !== String(id)));
    } catch (err) { console.error(err); }
  };

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
        <nav className="fav-navbar">
          <div className="fav-navbar-logo" onClick={() => navigate("/")}>Atap<span>.</span></div>

          <div className="fav-navbar-links">
            {isLoggedIn ? (
              <>
                {DESKTOP_LINKS.map(({ label, path }) => (
                  <span key={path}
                    className={`fav-navbar-link${currentPath === path ? " active" : ""}`}
                    onClick={() => navigate(path)}>
                    {label}
                  </span>
                ))}
                <div className="fav-navbar-divider" />

                {/* Chat icon + badge */}
                <div className="fav-chat-btn-wrap" onClick={() => navigate("/chat")} title="Chat">
                  <div className="fav-chat-btn"><MessageCircle size={16} /></div>
                  {unreadChat > 0 && (
                    <span className="fav-chat-badge">{unreadChat > 99 ? "99+" : unreadChat}</span>
                  )}
                </div>

                {/* Avatar + notif dot */}
                <div className="fav-dropdown-wrap" ref={menuRef}>
                  <div className="fav-avatar-wrap">
                    <div className="fav-navbar-avatar" onClick={() => setShowMenu((p) => !p)} title={userName}>
                      {initials}
                    </div>
                    {unreadCount > 0 && <span className="fav-notif-dot" />}
                  </div>
                  {showMenu && (
                    <div className="fav-navbar-dropdown">
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
                <span className="fav-navbar-link" onClick={() => navigate("/search")}>Search</span>
                <span className="fav-navbar-link" onClick={() => navigate("/map")}>Peta</span>
                <div className="fav-navbar-divider" />
                <span className="fav-navbar-login" onClick={() => navigate("/auth")}>Masuk</span>
                <button className="fav-navbar-cta" onClick={() => navigate("/auth")}>Daftar Gratis</button>
              </>
            )}
          </div>

          {/* Mobile: chat icon kanan navbar */}
          {isLoggedIn && (
            <div className="fav-chat-btn-wrap fav-mobile-chat" onClick={() => navigate("/chat")} title="Chat">
              <div className="fav-chat-btn"><MessageCircle size={16} /></div>
              {unreadChat > 0 && (
                <span className="fav-chat-badge">{unreadChat > 99 ? "99+" : unreadChat}</span>
              )}
            </div>
          )}
        </nav>

        {/* ── HERO STRIP ── */}
        <div className="fav-hero">
          <div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: -0.8, margin: 0 }}>
              Favorit<span style={{ color: "#93C5FD" }}>.</span>
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.6)", margin: "4px 0 0" }}>
              {!loading && !error ? `${data.length} kost tersimpan` : "Kost favorit kamu"}
            </p>
          </div>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Heart size={24} color="rgba(255,255,255,.8)" />
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="fav-content">
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ height: 180, borderRadius: 18, background: "white", border: "1px solid #F1F5F9" }} />
              ))}
            </div>
          )}

          {error && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "64px 0", gap: 12, textAlign: "center" }}>
              <AlertCircle size={26} color="#F87171" />
              <p style={{ fontSize: 14, color: "#475569", margin: 0 }}>{error}</p>
              <button onClick={fetchFavorites} style={{ display: "flex", alignItems: "center", gap: 8, background: "#2563EB", color: "white", border: "none", padding: "10px 18px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                <RefreshCw size={14} /> Coba lagi
              </button>
            </div>
          )}

          {!loading && !error && data.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: 64, gap: 12, textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: "#FFF1F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Heart size={28} color="#FDA4AF" />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#475569", margin: 0 }}>Belum ada favorit</p>
              <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>Simpan kost yang kamu suka dari halaman pencarian</p>
              <button onClick={() => navigate("/")} style={{ marginTop: 4, background: "#0F172A", color: "white", border: "none", padding: "10px 24px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                Cari kost
              </button>
            </div>
          )}

          {!loading && !error && data.length > 0 && (
            <div className="fav-grid">
              {data.map((item) => (
                <KostCard
                  key={item.id}
                  item={item}
                  isLiked={true}
                  onLike={(e) => handleRemove(item.id, e)}
                  onClick={() => navigate(`/detail/${item.id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── MOBILE BOTTOM NAV ── */}
        <nav className="fav-bottom-nav">
          {(isLoggedIn ? MOBILE_NAV : GUEST_MOBILE).map(({ label, path, icon: Icon }) => {
            const isActive = currentPath === path;
            const isProfil = path === "/profil";
            const isChat   = path === "/chat";
            return (
              <button key={path} className={`fav-bn-item${isActive ? " active" : ""}`} onClick={() => navigate(path)}>
                {isProfil && isLoggedIn ? (
                  <div className="fav-bn-avatar-wrap">
                    <div className="fav-bn-avatar">{initials}</div>
                    {unreadCount > 0 && <span className="fav-bn-notif-dot" />}
                  </div>
                ) : isChat && isLoggedIn ? (
                  <div className="fav-bn-icon-wrap">
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                    {unreadChat > 0 && (
                      <span className="fav-bn-chat-badge">{unreadChat > 99 ? "99+" : unreadChat}</span>
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
            <button className={`fav-bn-item${currentPath === "/auth" ? " active" : ""}`} onClick={() => navigate("/auth")}>
              <User size={20} strokeWidth={currentPath === "/auth" ? 2.5 : 1.8} />
              <span>Masuk</span>
            </button>
          )}
        </nav>

      </div>
    </>
  );
}