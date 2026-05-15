import React, { useState, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Search, Navigation2, X, SlidersHorizontal,
  Loader2, User, Settings, LogOut, Heart, MessageCircle, Map, Home,
  MapPin, Star, ChevronRight,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const BASE_URL = "http://localhost:3000";
const SOLO_CENTER = [-7.5755, 110.8243];

const formatPrice = (price) => {
  if (!price) return "—";
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1).replace(".0", "")}jt`;
  return `${Math.round(price / 1_000)}rb`;
};

const NAV_ITEMS = [
  { label: "Home",    path: "/",       icon: Home,          desktop: true,  mobile: true,  guestMobile: true  },
  { label: "Search",  path: "/search", icon: Search,        desktop: true,  mobile: true,  guestMobile: true  },
  { label: "Peta",    path: "/map",    icon: Map,           desktop: true,  mobile: true,  guestMobile: true  },
  { label: "Favorit", path: "/like",   icon: Heart,         desktop: true,  mobile: true,  guestMobile: false },
  { label: "Chat",    path: "/chat",   icon: MessageCircle, desktop: false, mobile: true,  guestMobile: false }, // ← tambah ini
  { label: "Profil",  path: "/profil", icon: User,          desktop: false, mobile: true,  guestMobile: false },
];

const DESKTOP_LINKS = NAV_ITEMS.filter((n) => n.desktop);
const MOBILE_NAV    = NAV_ITEMS.filter((n) => n.mobile);
const GUEST_MOBILE  = NAV_ITEMS.filter((n) => n.guestMobile);

/* ─── Custom Price Marker ───────────────────────────────────────────────── */
function createPriceIcon(price, active = false) {
  const label  = `Rp ${formatPrice(price)}`;
  const bg     = active ? "#4F46E5" : "#ffffff";
  const color  = active ? "#ffffff" : "#1A1A1A";
  const border = active ? "#4338CA" : "#CBD5E1";
  const shadow = active
    ? "0 4px 18px rgba(79,70,229,.55)"
    : "0 2px 10px rgba(0,0,0,.20)";
  const tip = active ? "#4F46E5" : "#ffffff";
  const tipBorder = active ? "#4338CA" : "#CBD5E1";

  return L.divIcon({
    className: "",   // kosong agar Leaflet tidak inject style default
    html: `
      <div style="
        position:relative;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        background:${bg};
        color:${color};
        padding:5px 12px;
        border-radius:999px;
        font-size:12px;
        font-weight:800;
        font-family:system-ui,-apple-system,'Segoe UI',sans-serif;
        white-space:nowrap;
        cursor:pointer;
        box-shadow:${shadow};
        border:2px solid ${border};
        line-height:1.2;
        user-select:none;
        letter-spacing:-0.2px;
      ">
        ${label}
        <span style="
          position:absolute;
          bottom:-7px;
          left:50%;
          transform:translateX(-50%);
          width:0;
          height:0;
          border-left:6px solid transparent;
          border-right:6px solid transparent;
          border-top:7px solid ${border};
          display:block;
        "></span>
        <span style="
          position:absolute;
          bottom:-5px;
          left:50%;
          transform:translateX(-50%);
          width:0;
          height:0;
          border-left:5px solid transparent;
          border-right:5px solid transparent;
          border-top:6px solid ${tip};
          display:block;
        "></span>
      </div>
    `,
    iconSize:    [90, 32],
    iconAnchor:  [45, 39],
    popupAnchor: [0, -42],
  });
}

/* ─── Fly to user location ──────────────────────────────────────────────── */
function FlyToLocation({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 15, { duration: 1.2 });
  }, [coords, map]);
  return null;
}

/* ─── Main Component ────────────────────────────────────────────────────── */
export default function MapPage() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const menuRef     = useRef(null);
  const currentPath = location.pathname;
  const debounceRef = useRef(null);

  const [selectedKost, setSelectedKost] = useState(null);
  const [showFilter,   setShowFilter]   = useState(false);
  const [maxPrice,     setMaxPrice]     = useState("");
  const [searchQuery,  setSearchQuery]  = useState("");
  const [kosData,      setKosData]      = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [userCoords,   setUserCoords]   = useState(null);
  const [locating,     setLocating]     = useState(false);
  const [showMenu,     setShowMenu]     = useState(false);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [unreadChat,   setUnreadChat]   = useState(0);

  const user       = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = !!user;
  const userName   = user?.name || "Guest";
  const token      = localStorage.getItem("token");
  const initials   = isLoggedIn
    ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "GU";

  /* ── Notif ── */
  useEffect(() => {
    const saved = localStorage.getItem("atap_notifications");
    if (saved) {
      try { setUnreadCount(JSON.parse(saved).filter((n) => n.unread).length); }
      catch { setUnreadCount(0); }
    } else {
    setUnreadCount(2); // ← tambah ini, sama seperti dashboard
  }
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !token) return;
    const fetchUnreadChat = async () => {
      try {
        const res = await fetch(`${BASE_URL}/chats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const json = await res.json();
        const raw = Array.isArray(json.data) ? json.data : [];
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

  /* ── Fetch listings dari BE ── */
  const fetchKos = useCallback(async (q = searchQuery) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.append("q", q);
      if (maxPrice) params.append("maxPrice", maxPrice);
      params.append("sort", "relevance");

      const res = await fetch(`${BASE_URL}/search/listings?${params}`);
      if (!res.ok) { setKosData([]); return; }
      const json = await res.json();

      setKosData(
        (json.data || [])
          .filter((item) => item.latitude && item.longitude)
          .map((item) => ({
            id: item.id,
            name: item.name,
            address: item.address ?? "",
            price: item.cheapestPrice ?? null,
            gender: item.genderType ?? "",
            isPremium: item.isPremium ?? false,
            latitude: Number(item.latitude),
            longitude: Number(item.longitude),
            image: item.thumbnailUrl
              ? item.thumbnailUrl.startsWith("http")
                ? item.thumbnailUrl
                : `${BASE_URL}${item.thumbnailUrl}`
              : null,
            rating: item.rating ?? null,
          }))
      );
    } catch {
      setKosData([]);
    } finally {
      setLoading(false);
    }
  }, [maxPrice, searchQuery]);

  useEffect(() => { fetchKos(); }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchKos(searchQuery), 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery, maxPrice]);

  const handleMyLocation = useCallback(() => {
    if (!navigator.geolocation) return alert("GPS tidak support di browser ini");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      () => setLocating(false)
    );
  }, []);

  const doLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth");
  };

  const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;700&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; }

  /* ── Fix Leaflet marker clipping ── */
  .leaflet-marker-icon { overflow: visible !important; }
  .leaflet-marker-pane { overflow: visible !important; }
  .leaflet-div-icon    {
    background: transparent !important;
    border: none !important;
    overflow: visible !important;
  }

  .mp-root { font-family:'DM Sans',sans-serif; color:#0F172A; height:100vh; display:flex; flex-direction:column; overflow:hidden; }
  .mp-root h1,.mp-root h2,.mp-root h3 { font-family:'Plus Jakarta Sans',sans-serif; }

  /* ── NAVBAR ── */
  /* MapPage - cek ini sudah sama dengan dashboard */
.mp-navbar {
  position: sticky;
  top: 0;
  z-index: 500;
  height: 72px;        /* ← sama */
  flex-shrink: 0;      /* ← penting! tanpa ini navbar bisa mengecil */
  background: rgba(255,255,255,.95);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid #EAEFF5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 42px;
}
  .mp-navbar-logo { font-family:'Plus Jakarta Sans',sans-serif; font-size:25px; font-weight:800; letter-spacing:-1px; color:#0F172A; cursor:pointer; }
  .mp-navbar-logo span { color:#4F46E5; }
  .mp-navbar-links { display:flex; align-items:center; gap:4px; }
  .mp-navbar-link { font-size:14px; font-weight:600; color:#64748B; cursor:pointer; padding:7px 11px; border-radius:9px; transition:.15s; }
  .mp-navbar-link:hover { color:#4F46E5; background:#EEF2FF; }
  .mp-navbar-link.active { color:#4F46E5; }
  .mp-navbar-divider { width:1px; height:22px; background:#E2E8F0; margin:0 6px; }
  .mp-navbar-login { font-size:14px; font-weight:700; color:#475569; cursor:pointer; padding:8px 14px; border-radius:10px; transition:.15s; }
  .mp-navbar-login:hover { color:#0F172A; background:#F1F5F9; }
  .mp-navbar-cta { border:none; cursor:pointer; padding:11px 22px; border-radius:12px; background:linear-gradient(135deg,#4F46E5,#6366F1); color:#fff; font-size:13px; font-weight:700; transition:.2s; }
  .mp-navbar-cta:hover { transform:translateY(-1px); box-shadow:0 12px 25px rgba(79,70,229,.25); }

  .mp-chat-btn-wrap { position:relative; display:inline-flex; margin-left:2px; cursor:pointer; }
  .mp-chat-btn { width:36px; height:36px; border-radius:50%; background:#F1F5F9; color:#475569; display:flex; align-items:center; justify-content:center; border:1.5px solid #E2E8F0; transition:.2s; }
  .mp-chat-btn:hover { background:#EEF2FF; color:#4F46E5; border-color:#C7D2FE; }
  .mp-chat-badge { position:absolute; top:-3px; right:-3px; min-width:16px; height:16px; background:#EF4444; border-radius:999px; border:2px solid white; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:800; color:white; padding:0 3px; pointer-events:none; }
  .mp-mobile-chat { display:none; }
  /* ── dot & badge di bottom nav ── */
.mp-bn-avatar-wrap { position: relative; display: inline-flex; }
.mp-bn-notif-dot {
  position: absolute; top: -2px; right: -2px;
  width: 7px; height: 7px;
  background: #EF4444; border-radius: 50%; border: 1.5px solid white;
}
.mp-bn-icon-wrap { position: relative; display: inline-flex; }
.mp-bn-chat-badge {
  position: absolute; top: -4px; right: -6px;
  min-width: 14px; height: 14px;
  background: #EF4444; border-radius: 999px; border: 1.5px solid white;
  display: flex; align-items: center; justify-content: center;
  font-size: 8px; font-weight: 800; color: white; padding: 0 3px;
  line-height: 1; pointer-events: none;
}

  .mp-dropdown-wrap { position:relative; }
  .mp-avatar-wrap { position:relative; display:inline-block; margin-left:4px; }
  .mp-notif-dot { position:absolute; top:-2px; right:-2px; width:10px; height:10px; background:#EF4444; border-radius:50%; border:2.5px solid white; pointer-events:none; }
  .mp-navbar-avatar { width:36px; height:36px; border-radius:50%; background:#EEF2FF; color:#4F46E5; font-size:12px; font-weight:700; display:flex; align-items:center; justify-content:center; cursor:pointer; border:2px solid #C7D2FE; transition:.2s; }
  .mp-navbar-avatar:hover { background:#C7D2FE; transform:scale(1.05); }
  .mp-navbar-dropdown { position:absolute; top:calc(100% + 10px); right:0; background:white; border:1px solid #E2E8F0; border-radius:16px; padding:8px; min-width:175px; box-shadow:0 8px 32px rgba(0,0,0,.10); display:flex; flex-direction:column; gap:2px; z-index:600; animation:ddFadeIn .15s ease; }
  @keyframes ddFadeIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
  .mp-navbar-dropdown button { display:flex; align-items:center; gap:10px; padding:10px 13px; border:none; background:none; border-radius:10px; font-size:13px; font-weight:600; color:#334155; cursor:pointer; width:100%; text-align:left; transition:.13s; font-family:'DM Sans',sans-serif; }
  .mp-navbar-dropdown button:hover { background:#F1F5F9; }
  .mp-navbar-dropdown .dd-divider { height:1px; background:#E2E8F0; margin:4px 0; }
  .mp-navbar-dropdown button.danger { color:#EF4444; }
  .mp-navbar-dropdown button.danger:hover { background:#FEF2F2; }

  /* ── MAP AREA ── */
  .mp-map-area { flex:1; position:relative; overflow:hidden; }
  .mp-map-area .leaflet-container { width:100%; height:100%; }

  /* ── FLOATING UI ── */
  .mp-search-bar { position:absolute; top:16px; left:16px; right:16px; z-index:400; display:flex; gap:10px; }
  .mp-search-input-wrap { flex:1; position:relative; }
  .mp-search-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#94A3B8; pointer-events:none; }
  .mp-search-input { width:100%; height:46px; padding:0 14px 0 42px; border-radius:14px; background:white; border:1px solid #E2E8F0; box-shadow:0 4px 16px rgba(0,0,0,.10); font-size:14px; font-family:'DM Sans',sans-serif; color:#0F172A; outline:none; transition:.15s; }
  .mp-search-input:focus { border-color:#A5B4FC; box-shadow:0 4px 20px rgba(79,70,229,.15); }
  .mp-search-input::placeholder { color:#94A3B8; }
  .mp-filter-btn { width:46px; height:46px; background:white; border:1px solid #E2E8F0; border-radius:14px; box-shadow:0 4px 16px rgba(0,0,0,.10); display:flex; align-items:center; justify-content:center; cursor:pointer; color:#475569; transition:.15s; flex-shrink:0; }
  .mp-filter-btn:hover { background:#EEF2FF; color:#4F46E5; border-color:#C7D2FE; }
  .mp-filter-btn.active { background:#4F46E5; color:white; border-color:#4F46E5; }

  /* ── FILTER PANEL ── */
  .mp-filter-panel { position:absolute; top:74px; left:16px; z-index:400; background:white; border:1px solid #E2E8F0; border-radius:16px; padding:18px 20px; box-shadow:0 8px 32px rgba(0,0,0,.10); animation:dropIn .15s ease; min-width:260px; }
  @keyframes dropIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
  .mp-filter-label { font-size:11px; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:.06em; margin-bottom:10px; font-family:'Plus Jakarta Sans',sans-serif; }
  .mp-filter-value { font-size:18px; font-weight:800; color:#4F46E5; margin-bottom:12px; font-family:'Plus Jakarta Sans',sans-serif; }
  .mp-filter-range { width:100%; accent-color:#4F46E5; cursor:pointer; }
  .mp-filter-clear { margin-top:12px; width:100%; padding:8px; border:none; background:#F5F3FF; color:#4F46E5; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; transition:.15s; }
  .mp-filter-clear:hover { background:#EEF2FF; }

  /* ── LOADING OVERLAY ── */
  .mp-loading { position:absolute; top:74px; left:50%; transform:translateX(-50%); z-index:400; background:white; border-radius:999px; padding:10px 18px; box-shadow:0 4px 16px rgba(0,0,0,.12); display:flex; align-items:center; gap:8px; font-size:13px; font-weight:600; color:#4F46E5; }

  /* ── GPS BUTTON ── */
  .mp-gps-btn { position:absolute; right:16px; z-index:400; width:46px; height:46px; background:white; border:1px solid #E2E8F0; border-radius:14px; box-shadow:0 4px 16px rgba(0,0,0,.10); display:flex; align-items:center; justify-content:center; cursor:pointer; color:#475569; transition:.15s; }
  .mp-gps-btn:hover { background:#EEF2FF; color:#4F46E5; border-color:#C7D2FE; }

  /* ── RESULT COUNT ── */
  .mp-result-count { position:absolute; bottom:16px; left:16px; z-index:400; background:white; border-radius:999px; padding:8px 16px; box-shadow:0 4px 16px rgba(0,0,0,.10); font-size:12px; font-weight:700; color:#475569; border:1px solid #E2E8F0; }
  .mp-result-count strong { color:#4F46E5; }

  /* ── SELECTED CARD ── */
  .mp-card { position:absolute; bottom:16px; left:16px; right:16px; z-index:400; background:white; border-radius:20px; box-shadow:0 8px 40px rgba(0,0,0,.15); border:1px solid #E2E8F0; animation:cardUp .2s ease; overflow:hidden; }
  @keyframes cardUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  .mp-card-inner { display:flex; gap:0; }
  .mp-card-img { width:100px; height:100px; object-fit:cover; flex-shrink:0; }
  .mp-card-img-placeholder { width:100px; height:100px; background:#EEF2FF; display:flex; align-items:center; justify-content:center; color:#A5B4FC; flex-shrink:0; }
  .mp-card-body { flex:1; padding:14px 14px 14px 14px; min-width:0; }
  .mp-card-name { font-size:15px; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; color:#0F172A; margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .mp-card-address { font-size:12px; color:#94A3B8; margin-bottom:8px; display:flex; align-items:center; gap:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .mp-card-bottom { display:flex; align-items:center; justify-content:space-between; }
  .mp-card-price { font-size:16px; font-weight:800; color:#4F46E5; font-family:'Plus Jakarta Sans',sans-serif; }
  .mp-card-price span { font-size:11px; color:#94A3B8; font-weight:500; }
  .mp-card-close { position:absolute; top:10px; right:10px; width:26px; height:26px; border-radius:8px; border:1px solid #E2E8F0; background:#F8FAFC; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#64748B; transition:.13s; }
  .mp-card-close:hover { background:#FEF2F2; color:#EF4444; }
  .mp-card-detail-btn { display:flex; align-items:center; gap:4px; padding:7px 14px; background:#4F46E5; color:white; border:none; border-radius:10px; font-size:12px; font-weight:700; cursor:pointer; transition:.15s; font-family:'DM Sans',sans-serif; }
  .mp-card-detail-btn:hover { background:#4338CA; }

  /* ── BOTTOM NAV ── */
  .mp-bottom-nav { display:none; }

  /* ── RESPONSIVE ── */
  @media(max-width:900px) { .mp-navbar { padding:0 20px; } }
  @media(max-width:768px) {
    .mp-navbar-links { display:none; }
    .mp-mobile-chat { display:flex; }
  }
  @media(max-width:640px) {
    .mp-navbar { height:60px; padding:0 16px; }
    .mp-bottom-nav {
      display:flex; flex-shrink:0; position:relative; z-index:300;
      background:rgba(255,255,255,.97); backdrop-filter:blur(20px);
      border-top:1px solid #E2E8F0;
      padding:6px 0 calc(6px + env(safe-area-inset-bottom));
      justify-content:space-around; align-items:center;
    }
    .mp-bn-item { display:flex; flex-direction:column; align-items:center; gap:3px; padding:6px 10px; border:none; background:none; border-radius:12px; cursor:pointer; color:#94A3B8; transition:color .15s; min-width:52px; font-family:'DM Sans',sans-serif; }
    .mp-bn-item.active { color:#4F46E5; }
    .mp-bn-item span { font-size:10px; font-weight:700; }
    .mp-bn-avatar { width:24px; height:24px; border-radius:50%; background:#EEF2FF; color:#4F46E5; font-size:8px; font-weight:800; display:flex; align-items:center; justify-content:center; border:2px solid #C7D2FE; }
    
    .mp-bn-avatar-wrap { position:relative; display:inline-flex; }
    .mp-bn-notif-dot { position:absolute; top:-2px; right:-2px; width:7px; height:7px; background:#EF4444; border-radius:50%; border:1.5px solid white; }
  }

  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="mp-root">

        {/* ── NAVBAR ── */}
        <nav className="mp-navbar">
          <div className="mp-navbar-logo" onClick={() => navigate("/")}>Atap<span>.</span></div>

          <div className="mp-navbar-links">
            {isLoggedIn ? (
              <>
                {DESKTOP_LINKS.map(({ label, path }) => (
                  <span key={path}
                    className={`mp-navbar-link${currentPath === path ? " active" : ""}`}
                    onClick={() => navigate(path)}>
                    {label}
                  </span>
                ))}
                <div className="mp-navbar-divider" />
                <div className="mp-chat-btn-wrap" onClick={() => navigate("/chat")} title="Chat">
                  <div className="mp-chat-btn"><MessageCircle size={16} /></div>
                  {unreadChat > 0 && <span className="mp-chat-badge">{unreadChat > 99 ? "99+" : unreadChat}</span>}
                </div>
                <div className="mp-dropdown-wrap" ref={menuRef}>
                  <div className="mp-avatar-wrap">
                    <div className="mp-navbar-avatar" onClick={() => setShowMenu((p) => !p)}>{initials}</div>
                    {unreadCount > 0 && <span className="mp-notif-dot" />}
                  </div>
                  {showMenu && (
                    <div className="mp-navbar-dropdown">
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
                <span className="mp-navbar-link" onClick={() => navigate("/search")}>Search</span>
                <span className="mp-navbar-link" onClick={() => navigate("/map")}>Peta</span>
                <div className="mp-navbar-divider" />
                <span className="mp-navbar-login" onClick={() => navigate("/auth")}>Masuk</span>
                <button className="mp-navbar-cta" onClick={() => navigate("/auth")}>Daftar Gratis</button>
              </>
            )}
          </div>

          {isLoggedIn && (
            <div className="mp-chat-btn-wrap mp-mobile-chat" onClick={() => navigate("/chat")}>
              <div className="mp-chat-btn"><MessageCircle size={16} /></div>
              {unreadChat > 0 && <span className="mp-chat-badge">{unreadChat > 99 ? "99+" : unreadChat}</span>}
            </div>
          )}
        </nav>

        {/* ── MAP AREA ── */}
        <div className="mp-map-area">

          {/* Leaflet Map */}
          <MapContainer
            center={SOLO_CENTER}
            zoom={13}
            style={{ width: "100%", height: "100%" }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {userCoords && <FlyToLocation coords={userCoords} />}

            {kosData.map((kost) => (
              <Marker
                key={kost.id}
                position={[kost.latitude, kost.longitude]}
                icon={createPriceIcon(kost.price, selectedKost?.id === kost.id)}
                eventHandlers={{
                  click: () => setSelectedKost((prev) => prev?.id === kost.id ? null : kost),
                }}
              />
            ))}
          </MapContainer>

          {/* Search bar */}
          <div className="mp-search-bar">
            <div className="mp-search-input-wrap">
              <Search size={16} className="mp-search-icon" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kost di Solo..."
                className="mp-search-input"
              />
            </div>
            <button
              className={`mp-filter-btn${showFilter ? " active" : ""}`}
              onClick={() => setShowFilter((p) => !p)}
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>

          {/* Filter panel */}
          {showFilter && (
            <div className="mp-filter-panel">
              <p className="mp-filter-label">Harga Maksimal / Bulan</p>
              <p className="mp-filter-value">
                {maxPrice ? `Rp ${Number(maxPrice).toLocaleString("id-ID")}` : "Semua harga"}
              </p>
              <input
                type="range" min="500000" max="5000000" step="100000"
                value={maxPrice || 5000000}
                onChange={(e) => setMaxPrice(e.target.value === "5000000" ? "" : e.target.value)}
                className="mp-filter-range"
              />
              {maxPrice && (
                <button className="mp-filter-clear" onClick={() => setMaxPrice("")}>
                  Hapus Filter Harga
                </button>
              )}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="mp-loading">
              <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
              Mencari kost...
            </div>
          )}

          {/* Result count */}
          {!loading && kosData.length > 0 && !selectedKost && (
            <div className="mp-result-count">
              <strong>{kosData.length}</strong> kost ditemukan
            </div>
          )}

          {/* GPS button */}
          <button
            className="mp-gps-btn"
            style={{ bottom: selectedKost ? "128px" : "16px" }}
            onClick={handleMyLocation}
          >
            {locating
              ? <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
              : <Navigation2 size={20} />
            }
          </button>

          {/* Selected card */}
          {selectedKost && (
            <div className="mp-card" style={{ position: "absolute" }}>
              <button className="mp-card-close" onClick={() => setSelectedKost(null)}>
                <X size={13} />
              </button>
              <div className="mp-card-inner">
                {selectedKost.image ? (
                  <img src={selectedKost.image} alt={selectedKost.name} className="mp-card-img" />
                ) : (
                  <div className="mp-card-img-placeholder">
                    <Home size={28} strokeWidth={1.5} />
                  </div>
                )}
                <div className="mp-card-body">
                  <p className="mp-card-name">{selectedKost.name}</p>
                  <p className="mp-card-address">
                    <MapPin size={10} style={{ flexShrink: 0 }} />
                    {selectedKost.address}
                  </p>
                  <div className="mp-card-bottom">
                    <p className="mp-card-price">
                      Rp {selectedKost.price ? Number(selectedKost.price).toLocaleString("id-ID") : "—"}
                      <span>/bln</span>
                    </p>
                    <button
                      className="mp-card-detail-btn"
                      onClick={() => navigate(`/detail/${selectedKost.id}`)}
                    >
                      Detail <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── BOTTOM NAV ── */}
        <nav className="mp-bottom-nav">
          {(isLoggedIn ? MOBILE_NAV : GUEST_MOBILE).map(({ label, path, icon: Icon }) => {
            const isActive = currentPath === path;
            const isProfil = path === "/profil";
            const isChat   = path === "/chat";
            return (
              <button key={path} className={`mp-bn-item${isActive ? " active" : ""}`} onClick={() => navigate(path)}>
                {isProfil && isLoggedIn ? (
                  <div className="mp-bn-avatar-wrap">
                    <div className="mp-bn-avatar">{initials}</div>
                    {unreadCount > 0 && <span className="mp-bn-notif-dot" />}
                  </div>
                ) : isChat && isLoggedIn ? (
                  <div className="mp-bn-icon-wrap">
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                    {unreadChat > 0 && <span className="mp-bn-chat-badge">{unreadChat > 99 ? "99+" : unreadChat}</span>}
                  </div>
                ) : (
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                )}
                <span>{label}</span>
              </button>
            );
          })}
          {!isLoggedIn && (
            <button className={`mp-bn-item${currentPath === "/auth" ? " active" : ""}`} onClick={() => navigate("/auth")}>
              <User size={20} />
              <span>Masuk</span>
            </button>
          )}
        </nav>

      </div>
    </>
  );
}