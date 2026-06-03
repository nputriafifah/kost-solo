import React, { useState, useEffect, useRef } from "react";
import {
  Search, SearchX, AlertCircle, RefreshCw, Heart, User, ChevronRight,
  LogOut, Settings, Map, SlidersHorizontal, Home, MessageCircle,
  BadgeCheck, Tag, MessageSquare, MapPin, Bookmark, Navigation, Globe,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import KostCard from "../../components/kost/KostCard";
import NotificationPanel from "../../components/ui/NotificationPanel";
import { getApiBase, resolveMediaUrl } from "../../config/apiBase";
import { GENDER_OPTIONS } from "../../constants/listing";
import { formatPublicLocation, countListingAreas } from "../../utils/publicLocation";

const API = getApiBase();
const GENDER_TO_API = Object.fromEntries(GENDER_OPTIONS.map((g) => [g.label, g.value]));

function mapSearchListing(item) {
  return {
    id: String(item.id),
    name: item.name || "Tanpa Nama",
    location: formatPublicLocation(item.address),
    price: item.cheapestPrice ?? 0,
    gender: (item.genderType || "").toLowerCase(),
    image: resolveMediaUrl(item.thumbnailUrl),
    isPremium: Boolean(item.isPremium),
    latitude: item.latitude ?? null,
    longitude: item.longitude ?? null,
    distanceKm: item.distanceKm ?? null,
  };
}

function authHeaders(token) {
  const h = { "Content-Type": "application/json" };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

function KostCardSkeleton() {
  return (
    <div className="atap-skeleton">
      <div className="atap-skeleton-img" />
      <div className="atap-skeleton-body">
        <div className="atap-skeleton-line" style={{ width: "75%" }} />
        <div className="atap-skeleton-line" style={{ width: "50%", height: 10, opacity: 0.6 }} />
        <div className="atap-skeleton-line" style={{ width: "65%" }} />
      </div>
    </div>
  );
}

const FILTERS = ["Semua", "Putra", "Putri", "Campur"];

const NAV_ITEMS = [
  { label: "Home", path: "/", icon: Home, desktop: true, mobile: true, guestMobile: true },
  { label: "Search", path: "/search", icon: Search, desktop: true, mobile: true, guestMobile: true },
  { label: "My List", path: "/like", icon: Heart, desktop: true, mobile: true, guestMobile: false },
  { label: "Profil", path: "/profil", icon: User, desktop: false, mobile: true, guestMobile: false },
];

const DESKTOP_LINKS = NAV_ITEMS.filter((n) => n.desktop);
const MOBILE_NAV = NAV_ITEMS.filter((n) => n.mobile);
const GUEST_MOBILE = NAV_ITEMS.filter((n) => n.guestMobile);

const WHY_ITEMS = [
  { icon: Search, title: "Pencarian Cerdas", desc: "Filter berdasarkan gender, harga, lokasi kampus, dan fasilitas dalam hitungan detik." },
  { icon: Map, title: "Peta Interaktif", desc: "Lihat sebaran kost di peta, bandingkan jarak ke kampus atau tempat kerja kamu." },
  { icon: MessageSquare, title: "Chat Langsung", desc: "Hubungi pemilik kost tanpa perantara, negosiasi harga lebih mudah dan transparan." },
  { icon: Heart, title: "Simpan Favorit", desc: "Tandai kost yang menarik dan bandingkan sebelum memutuskan pilihan terbaik." },
  { icon: BadgeCheck, title: "Listing Terverifikasi", desc: "Setiap kost dicek dan diverifikasi tim Atap agar informasi selalu akurat." },
  { icon: Tag, title: "Harga Transparan", desc: "Tidak ada biaya tersembunyi. Harga yang kamu lihat adalah harga yang kamu bayar." },
];

const FOOTER_COLS = [
  { title: "Platform", links: [{ label: "Cari Kost", path: "/search" }, { label: "Peta Kost", path: "/map" }, { label: "Kost Favorit", path: "/like" }, { label: "Semua Listing", path: "/semua" }] },
  { title: "Untuk Pemilik", links: [{ label: "Daftarkan Kost", path: "/owner/dashboard" }, { label: "Kelola Listing", path: "/owner/dashboard" }, { label: "Panduan Harga", path: null }, { label: "FAQ Pemilik", path: null }] },
  { title: "Perusahaan", links: [{ label: "Tentang Kami", path: null }, { label: "Karir", path: null }, { label: "Blog", path: null }, { label: "Hubungi Kami", path: null }] },
];

// Hitung jarak (km) pakai Haversine
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const currentPath = location.pathname;
  const isNavActive = (path) => {
    if (path === "/") return currentPath === "/" || currentPath === "/dashboard";
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [favorites, setFavorites] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadChat, setUnreadChat] = useState(0);

  const [stats, setStats] = useState({
    listings: 0, premium: 0, disimpan: 0, kecamatan: 0, kabupaten: 0,
  });

  // Lokasi terdekat
  const [userCoords, setUserCoords] = useState(null);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyData, setNearbyData] = useState([]);
  const [nearbyError, setNearbyError] = useState(null);
  const [locationDenied, setLocationDenied] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = !!user;
  const userName = user?.name || "Guest";
  const token = localStorage.getItem("token");
  const initials = isLoggedIn
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
    if (!isLoggedIn || !token) return;
    const fetchUnreadChat = async () => {
      try {
        const res = await fetch(`${API}/chats`, {
          headers: authHeaders(token),
        });
        if (!res.ok) return;
        const json = await res.json();
        const raw = Array.isArray(json.data) ? json.data : [];
        const total = raw.reduce((acc, thread) => {
          const lm = thread.lastMessage;
          return (lm && !lm.readAt && lm.senderId !== user?.id) ? acc + 1 : acc;
        }, 0);
        setUnreadChat(total);
      } catch { }
    };
    fetchUnreadChat();
    const interval = setInterval(fetchUnreadChat, 30_000);
    return () => clearInterval(interval);
  }, [isLoggedIn, token, user?.id]);

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch(`${API}/favorites`, { headers: authHeaders(token) })
      .then((r) => r.json())
      .then((j) => {
        const favIds = (j.data || []).map((x) => String(x.id));
        setFavorites(favIds);
      })
      .catch(console.error);
  }, [isLoggedIn, token]);

  // Update stats.disimpan setiap kali favorites berubah
  useEffect(() => {
    setStats((prev) => ({ ...prev, disimpan: favorites.length }));
  }, [favorites]);

  const handleToggleLike = async (id) => {
    if (!isLoggedIn) { navigate("/auth"); return; }
    const idStr = String(id), isLiked = favorites.includes(idStr);
    try {
      const res = await fetch(`${API}/favorites/${idStr}`, {
        method: isLiked ? "DELETE" : "POST",
        headers: authHeaders(token),
      });
      if (!res.ok) throw new Error();
      setFavorites((p) => isLiked ? p.filter((f) => f !== idStr) : [...p, idStr]);
    } catch { }
  };

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ sort: "newest" });
      const genderType = GENDER_TO_API[activeFilter];
      if (genderType) params.set("genderType", genderType);

      const res = await fetch(`${API}/listings/search?${params}`);
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      const raw = Array.isArray(json.data) ? json.data : [];
      const mappedData = raw.map(mapSearchListing);
      const { kecamatanCount, kabupatenCount } = countListingAreas(raw);

      setData(mappedData);
      setStats((prev) => ({
        ...prev,
        listings: mappedData.length,
        premium: mappedData.filter((item) => item.isPremium).length,
        kecamatan: kecamatanCount,
        kabupaten: kabupatenCount,
      }));
    } catch {
      setError("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [activeFilter]);

  // Fetch nearby: minta izin lokasi lalu sort by distance
  const fetchNearby = () => {
    if (!navigator.geolocation) {
      setLocationDenied(true);
      return;
    }
    setNearbyLoading(true);
    setNearbyError(null);
    setLocationDenied(false);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ latitude, longitude });
        try {
          const params = new URLSearchParams({
            lat: String(latitude),
            lng: String(longitude),
            radiusKm: "15",
            sort: "newest",
          });
          const res = await fetch(`${API}/listings/search?${params}`);
          if (!res.ok) throw new Error();
          const json = await res.json();
          const raw = Array.isArray(json.data) ? json.data : [];
          const mapped = raw
            .map(mapSearchListing)
            .filter((x) => x.distanceKm != null)
            .sort((a, b) => a.distanceKm - b.distanceKm)
            .slice(0, 8);
          setNearbyData(mapped);
        } catch {
          const sorted = data
            .filter((x) => x.latitude != null && x.longitude != null)
            .map((x) => ({
              ...x,
              distanceKm: getDistanceKm(latitude, longitude, x.latitude, x.longitude),
            }))
            .sort((a, b) => a.distanceKm - b.distanceKm)
            .slice(0, 8);
          setNearbyData(sorted);
        }
        setNearbyLoading(false);
      },
      () => {
        setLocationDenied(true);
        setNearbyLoading(false);
      }
    );
  };

  // Auto-fetch nearby saat data sudah ada
  useEffect(() => {
    if (data.length > 0 && !userCoords && !locationDenied) {
      fetchNearby();
    }
  }, [data]);

  const wilayahValue = stats.kecamatan > 0
    ? stats.kecamatan.toLocaleString("id-ID")
    : stats.kabupaten > 0
      ? stats.kabupaten.toLocaleString("id-ID")
      : "0";
  const wilayahLabel = stats.kecamatan > 0
    ? "Kecamatan"
    : stats.kabupaten > 0
      ? "Kabupaten"
      : "Wilayah";

  const STATS = [
    { icon: MapPin, label: "Kost Aktif", value: stats.listings.toLocaleString("id-ID"), color: "#3B82F6", loadingKey: "listings" },
    { icon: Globe, label: wilayahLabel, value: wilayahValue, color: "#10B981", loadingKey: "listings" },
    ...(isLoggedIn
      ? [{ icon: Bookmark, label: "Favorit", value: stats.disimpan.toLocaleString("id-ID"), color: "#EC4899", loadingKey: null }]
      : []),
  ];

  const doLogout = () => { localStorage.removeItem("user"); localStorage.removeItem("token"); navigate("/auth"); };

  const renderCards = (count = 8) => {
    if (loading) return Array.from({ length: count }).map((_, i) => <KostCardSkeleton key={i} />);
    if (error) return (
      <div className="atap-empty" style={{ gridColumn: "1/-1" }}>
        <AlertCircle size={28} color="#F87171" />
        <p>Gagal memuat listing</p>
        <button className="atap-retry-btn" onClick={fetchListings}><RefreshCw size={13} /> Coba lagi</button>
      </div>
    );
    if (!data.length) return (
      <div className="atap-empty" style={{ gridColumn: "1/-1" }}>
        <SearchX size={28} color="#CBD5E1" /><p>Kost tidak ditemukan</p>
      </div>
    );
    return data.slice(0, 8).map((item) => (
      <KostCard
        key={item.id}
        item={item}
        isLiked={favorites.includes(item.id)}
        onLike={() => handleToggleLike(item.id)}
        onClick={() => navigate(`/detail/${item.id}`)}
      />
    ));
  };

  const renderNearbyCards = () => {
    if (nearbyLoading) return Array.from({ length: 4 }).map((_, i) => <KostCardSkeleton key={i} />);

    if (locationDenied) return (
      <div className="atap-empty" style={{ gridColumn: "1/-1" }}>
        <Navigation size={28} color="#CBD5E1" />
        <p>Izin lokasi diperlukan</p>
        <button className="atap-retry-btn" onClick={fetchNearby}>
          <Navigation size={13} /> Izinkan Lokasi
        </button>
      </div>
    );

    if (!nearbyData.length && !nearbyLoading) return (
      <div className="atap-empty" style={{ gridColumn: "1/-1" }}>
        <SearchX size={28} color="#CBD5E1" /><p>Kost terdekat tidak ditemukan</p>
      </div>
    );

    return nearbyData.slice(0, 8).map((item) => (
      <KostCard
        key={item.id}
        item={item}
        isLiked={favorites.includes(item.id)}
        onLike={() => handleToggleLike(item.id)}
        onClick={() => navigate(`/detail/${item.id}`)}
      />
    ));
  };

  const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;700&display=swap');
  * { box-sizing: border-box; } 
  body { margin: 0; background: #F8FAFC; color: #0F172A; transition: background 0.3s, color 0.3s; }
  
  :root { --bg-primary: #F8FAFC; --bg-secondary: #FFFFFF; --bg-tertiary: #F1F5F9; --text-primary: #0F172A; --text-secondary: #64748B; --border-color: #E2E8F0; --card-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .dark-mode { --bg-primary: #0F172A; --bg-secondary: #1E293B; --bg-tertiary: #334155; --text-primary: #F8FAFC; --text-secondary: #CBD5E1; --border-color: #334155; --card-shadow: 0 1px 3px rgba(0,0,0,0.3); }
  
  .atap-root { font-family: 'DM Sans', sans-serif; color: var(--text-primary); background: var(--bg-primary); transition: background 0.3s, color 0.3s; }
  .atap-root h1, .atap-root h2, .atap-root h3 { font-family: 'Plus Jakarta Sans', sans-serif; }

  .atap-navbar { position: sticky; top: 0; z-index: 100; height: 72px; background: rgba(255,255,255,0.92); backdrop-filter: blur(16px); border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; padding: 0 42px; }
  .dark-mode .atap-navbar { background: rgba(30, 41, 59, 0.92); }
  .atap-navbar-logo { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 25px; font-weight: 800; letter-spacing: -1px; color: var(--text-primary); cursor: pointer; }
  .atap-navbar-logo span { color: #2563EB; }
  .atap-navbar-links { display: flex; align-items: center; gap: 4px; }
  .atap-navbar-link { font-size: 14px; font-weight: 600; color: var(--text-secondary); cursor: pointer; padding: 7px 11px; border-radius: 9px; transition: 0.15s; font-family: 'DM Sans', sans-serif; }
  .atap-navbar-link:hover { color: #2563EB; background: #EFF6FF; }
  .dark-mode .atap-navbar-link:hover { background: rgba(59, 130, 246, 0.15); }
  .atap-navbar-link.active { color: #2563EB; background: #EFF6FF; }
  .atap-navbar-divider { width: 1px; height: 22px; background: var(--border-color); margin: 0 6px; }
  .atap-theme-toggle { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; background: var(--bg-tertiary); border: 1.5px solid var(--border-color); cursor: pointer; transition: 0.2s; color: var(--text-primary); margin-left: 2px; }
  .atap-theme-toggle:hover { background: #EFF6FF; color: #2563EB; }
  .dark-mode .atap-theme-toggle:hover { background: rgba(59, 130, 246, 0.15); }
  .atap-navbar-login { font-size: 14px; font-weight: 700; color: var(--text-secondary); cursor: pointer; padding: 8px 14px; border-radius: 10px; transition: 0.15s; font-family: 'DM Sans', sans-serif; }
  .atap-navbar-login:hover { color: var(--text-primary); background: var(--bg-tertiary); }
  .atap-navbar-cta { border: none; cursor: pointer; padding: 11px 22px; border-radius: 12px; background: linear-gradient(135deg, #2563EB, #3B82F6); color: #fff; font-size: 13px; font-weight: 700; transition: 0.2s; font-family: 'DM Sans', sans-serif; }
  .atap-navbar-cta:hover { transform: translateY(-1px); box-shadow: 0 12px 25px rgba(37,99,235,.22); }
  .atap-chat-btn-wrap { position: relative; display: inline-flex; margin-left: 2px; cursor: pointer; }
  .atap-chat-btn { width: 36px; height: 36px; border-radius: 50%; background: var(--bg-tertiary); color: var(--text-secondary); display: flex; align-items: center; justify-content: center; border: 1.5px solid var(--border-color); transition: 0.2s; }
  .atap-chat-btn:hover { background: #EFF6FF; color: #2563EB; border-color: #BFDBFE; }
  .dark-mode .atap-chat-btn:hover { background: rgba(59, 130, 246, 0.15); }
  .atap-chat-badge { position: absolute; top: -3px; right: -3px; min-width: 16px; height: 16px; background: #EF4444; border-radius: 999px; border: 2px solid var(--bg-secondary); display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 800; color: white; padding: 0 3px; line-height: 1; pointer-events: none; box-shadow: 0 0 0 2px rgba(239,68,68,.2); }
  .atap-mobile-chat { display: none; }
  .atap-dropdown-wrap { position: relative; }
  .atap-avatar-wrap { position: relative; display: inline-block; margin-left: 4px; }
  .atap-notif-dot { position: absolute; top: -2px; right: -2px; width: 10px; height: 10px; background: #EF4444; border-radius: 50%; border: 2.5px solid var(--bg-secondary); box-shadow: 0 0 0 2px rgba(239,68,68,.22); pointer-events: none; }
  .atap-navbar-avatar { width: 36px; height: 36px; border-radius: 50%; background: #DBEAFE; color: #1D4ED8; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 2px solid #BFDBFE; transition: 0.2s; font-family: 'DM Sans', sans-serif; }
  .atap-navbar-avatar:hover { background: #BFDBFE; transform: scale(1.05); }
  .atap-navbar-dropdown { position: absolute; top: calc(100% + 10px); right: 0; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 16px; padding: 8px; min-width: 175px; box-shadow: var(--card-shadow); display: flex; flex-direction: column; gap: 2px; z-index: 200; animation: ddFadeIn 0.15s ease; }
  @keyframes ddFadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
  .atap-navbar-dropdown button { display: flex; align-items: center; gap: 10px; padding: 10px 13px; border: none; background: none; border-radius: 10px; font-size: 13px; font-weight: 600; color: var(--text-secondary); cursor: pointer; width: 100%; text-align: left; transition: 0.13s; font-family: 'DM Sans', sans-serif; }
  .atap-navbar-dropdown button:hover { background: var(--bg-tertiary); color: var(--text-primary); }
  .atap-navbar-dropdown .dd-divider { height: 1px; background: var(--border-color); margin: 4px 0; }
  .atap-navbar-dropdown button.danger { color: #EF4444; }
  .atap-navbar-dropdown button.danger:hover { background: #FEF2F2; }
  .dark-mode .atap-navbar-dropdown button.danger:hover { background: rgba(239, 68, 68, 0.15); }

  .atap-hero { position: relative; overflow: hidden; padding: 64px 24px 72px; background: linear-gradient(135deg, #0F172A 0%, #1E3A8A 45%, #2563EB 100%); }
  .atap-blob { position: absolute; border-radius: 50%; background: rgba(255,255,255,.06); filter: blur(2px); }
  .atap-hero-inner { position: relative; z-index: 2; max-width: 760px; margin: auto; text-align: center; }
  .atap-hero h1 { font-size: 46px; line-height: 1.12; font-weight: 800; color: white; margin: 0 0 16px; letter-spacing: -1.5px; }
  .atap-hero h1 em { font-style: normal; color: #93C5FD; }
  .atap-hero p { font-size: 17px; line-height: 1.7; color: rgba(255,255,255,.72); margin: 0 auto 38px; max-width: 620px; }
  .atap-search-wrap { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.18); backdrop-filter: blur(16px); padding: 10px 12px 10px 16px; border-radius: 16px; max-width: 620px; margin: auto; }
  .atap-search-row { flex: 1; display: flex; align-items: center; gap: 10px; }
  .atap-search-input { flex: 1; background: none; border: none; outline: none; color: #fff; font-size: 15px; font-family: 'DM Sans', sans-serif; cursor: pointer; }
  .atap-search-input::placeholder { color: rgba(255,255,255,.55); }
  .atap-search-btn { height: 44px; border: none; cursor: pointer; border-radius: 14px; padding: 0 18px; background: white; color: #2563EB; font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 8px; transition: 0.2s; font-family: 'DM Sans', sans-serif; }
  .atap-search-btn:hover { transform: translateY(-1px); }

  .atap-stats-section { max-width: 1180px; margin: -40px auto 0; position: relative; z-index: 10; padding: 0 28px; }
  .atap-stats-grid {
    display: grid; gap: 18px;
    grid-template-columns: repeat(var(--stat-cols, 1), minmax(0, 1fr));
  }
  .atap-stats-grid.is-single { max-width: 360px; margin: 0 auto; }
  .atap-stat-box {
    background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 18px;
    padding: 22px; display: flex; align-items: center; gap: 16px;
    box-shadow: 0 4px 24px rgba(15, 23, 42, 0.08);
    transition: 0.2s;
  }
  .atap-stat-box:hover { border-color: #93C5FD; box-shadow: 0 8px 28px rgba(37, 99, 235, 0.12); transform: translateY(-2px); }
  .atap-stat-icon {
    width: 52px; height: 52px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .atap-stat-content { flex: 1; min-width: 0; }
  .atap-stat-value { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 22px; font-weight: 800; color: var(--text-primary); margin: 0 0 2px; line-height: 1.1; }
  .atap-stat-label { font-size: 12px; font-weight: 600; color: var(--text-secondary); margin: 0; }
  .atap-stat-value-loading { height: 22px; width: 64px; border-radius: 6px; background: var(--bg-tertiary); animation: pulse 1.4s infinite; }

  .atap-section { max-width: 1180px; margin: auto; padding: 42px 28px; }
  .atap-sec-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .atap-sec-title { font-size: 22px; font-weight: 800; letter-spacing: -0.8px; font-family: 'Plus Jakarta Sans', sans-serif; color: var(--text-primary); }
  .atap-sec-link { display: flex; align-items: center; gap: 5px; font-size: 14px; font-weight: 700; color: #2563EB; cursor: pointer; }
  .atap-filters { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 28px; }
  .atap-chip { padding: 9px 18px; border-radius: 999px; border: 1.5px solid var(--border-color); background: var(--bg-secondary); font-size: 13px; font-weight: 700; color: var(--text-secondary); cursor: pointer; transition: 0.2s; font-family: 'DM Sans', sans-serif; }
  .atap-chip:hover { border-color: #93C5FD; color: #2563EB; }
  .atap-chip.active { background: linear-gradient(135deg, #1D4ED8, #2563EB); border-color: #2563EB; color: white; }
  .atap-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
  .atap-skeleton { background: var(--bg-secondary); border-radius: 18px; overflow: hidden; border: 1px solid var(--border-color); animation: pulse 1.4s infinite; }
  .atap-skeleton-img { height: 170px; background: var(--bg-tertiary); }
  .atap-skeleton-body { padding: 14px; display: flex; flex-direction: column; gap: 10px; }
  .atap-skeleton-line { height: 12px; border-radius: 999px; background: var(--bg-tertiary); }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .55; } }
  .atap-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 0; color: var(--text-secondary); }
  .atap-empty p { font-size: 14px; color: var(--text-secondary); font-weight: 600; }
  .atap-retry-btn { border: none; cursor: pointer; display: flex; align-items: center; gap: 8px; background: #2563EB; color: white; padding: 10px 18px; border-radius: 12px; font-weight: 700; font-family: 'DM Sans', sans-serif; }

  /* Nearby location info bar */
  .atap-nearby-info {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; color: var(--text-secondary);
    margin-bottom: 20px;
  }
  .atap-nearby-info-dot {
    width: 8px; height: 8px; border-radius: 50%; background: #22C55E; flex-shrink: 0;
    box-shadow: 0 0 0 3px rgba(34,197,94,0.2);
  }

  .atap-why-section { background: var(--bg-tertiary); border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); }
  .dark-mode .atap-why-section { background: #1E293B; }
  .atap-why-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
  .atap-why-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 20px; padding: 26px 22px; transition: 0.2s; }
  .atap-why-card:hover { border-color: #BFDBFE; box-shadow: 0 8px 28px rgba(37,99,235,.09); transform: translateY(-2px); }
  .dark-mode .atap-why-card:hover { box-shadow: 0 8px 28px rgba(37,99,235,.2); }
  .atap-why-icon { width: 44px; height: 44px; border-radius: 12px; background: #EFF6FF; color: #2563EB; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
  .dark-mode .atap-why-icon { background: rgba(59, 130, 246, 0.15); }
  .atap-why-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
  .atap-why-desc { font-size: 13px; line-height: 1.65; color: var(--text-secondary); }

  .atap-cta-banner { max-width: 1180px; margin: 0 auto; padding: 0 28px 52px; }
  .atap-cta-inner { background: linear-gradient(135deg, #0F172A 0%, #1E3A8A 60%, #2563EB 100%); border-radius: 24px; padding: 52px 48px; display: flex; align-items: center; justify-content: space-between; gap: 32px; position: relative; overflow: hidden; }
  .atap-cta-inner::before { content: ''; position: absolute; top: -60px; right: -60px; width: 280px; height: 280px; border-radius: 50%; background: rgba(255,255,255,.05); }
  .atap-cta-text h2 { font-size: 26px; font-weight: 800; color: white; margin: 0 0 10px; letter-spacing: -0.8px; font-family: 'Plus Jakarta Sans', sans-serif; }
  .atap-cta-text p { font-size: 14px; color: rgba(255,255,255,.65); margin: 0; line-height: 1.6; }
  .atap-cta-btns { display: flex; gap: 12px; flex-shrink: 0; position: relative; z-index: 1; }
  .atap-cta-btn-primary { border: none; cursor: pointer; background: white; color: #1D4ED8; padding: 13px 26px; border-radius: 14px; font-size: 14px; font-weight: 700; font-family: 'DM Sans', sans-serif; transition: 0.2s; }
  .atap-cta-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(0,0,0,.15); }
  .atap-cta-btn-ghost { border: 1.5px solid rgba(255,255,255,.3); cursor: pointer; background: rgba(255,255,255,.1); color: white; padding: 13px 26px; border-radius: 14px; font-size: 14px; font-weight: 700; font-family: 'DM Sans', sans-serif; transition: 0.2s; backdrop-filter: blur(8px); }
  .atap-cta-btn-ghost:hover { background: rgba(255,255,255,.18); }

  .atap-footer { background: #0F172A; color: #94A3B8; }
  .dark-mode .atap-footer { background: #0F172A; }
  .atap-footer-inner { max-width: 1180px; margin: auto; padding: 52px 28px 44px; display: flex; gap: 60px; }
  .atap-footer-brand { flex: 1.2; }
  .atap-footer-logo { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 24px; font-weight: 800; color: white; letter-spacing: -1px; margin-bottom: 14px; }
  .atap-footer-logo span { color: #3B82F6; }
  .atap-footer-brand p { font-size: 13.5px; line-height: 1.7; color: #64748B; max-width: 270px; margin: 0 0 22px; }
  .atap-footer-socials { display: flex; gap: 10px; }
  .atap-footer-social { font-size: 12px; font-weight: 700; color: #475569; background: #1E293B; border: 1px solid #334155; padding: 6px 14px; border-radius: 999px; cursor: pointer; transition: 0.15s; }
  .atap-footer-social:hover { color: white; border-color: #3B82F6; }
  .atap-footer-links { flex: 2; display: flex; gap: 40px; }
  .atap-footer-col { display: flex; flex-direction: column; gap: 11px; flex: 1; }
  .atap-footer-col-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 700; color: white; margin-bottom: 4px; letter-spacing: 0.3px; }
  .atap-footer-link { font-size: 13px; color: #64748B; cursor: pointer; transition: 0.13s; background: none; border: none; padding: 0; text-align: left; font-family: 'DM Sans', sans-serif; }
  .atap-footer-link:hover { color: #93C5FD; }
  .atap-footer-divider { border: none; border-top: 1px solid #1E293B; margin: 0; }
  .atap-footer-bottom { max-width: 1180px; margin: 0 auto; padding: 20px 28px; display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #475569; }
  .atap-footer-bottom-links { display: flex; gap: 20px; }
  .atap-footer-bottom-links span { cursor: pointer; transition: 0.13px; }
  .atap-footer-bottom-links span:hover { color: #94A3B8; }

  .atap-bottom-nav { display: none; }
  .atap-bn-avatar-wrap { position: relative; display: inline-flex; }
  .atap-bn-notif-dot { position: absolute; top: -2px; right: -2px; width: 7px; height: 7px; background: #EF4444; border-radius: 50%; border: 1.5px solid var(--bg-secondary); }
  .atap-bn-icon-wrap { position: relative; display: inline-flex; }
  .atap-bn-chat-badge { position: absolute; top: -4px; right: -6px; min-width: 14px; height: 14px; background: #EF4444; border-radius: 999px; border: 1.5px solid var(--bg-secondary); display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 800; color: white; padding: 0 3px; line-height: 1; pointer-events: none; }

  @media(max-width: 1100px) { .atap-grid { grid-template-columns: repeat(3, 1fr); } }
  @media(max-width: 900px) {
    .atap-navbar { padding: 0 20px; } .atap-hero { padding: 56px 20px 64px; } .atap-hero p { font-size: 15px; }
    .atap-section { padding: 40px 20px; } .atap-grid { grid-template-columns: repeat(2, 1fr); }
    .atap-why-grid { grid-template-columns: repeat(2, 1fr); } .atap-footer-inner { flex-direction: column; gap: 36px; }
    .atap-footer-brand p { max-width: 100%; } .atap-cta-inner { flex-direction: column; text-align: center; padding: 40px 28px; }
    .atap-cta-btns { justify-content: center; }
    .atap-stats-section { padding: 0 20px; }
  }
  @media(max-width: 768px) { .atap-navbar-links { display: none; } .atap-mobile-chat { display: flex; } }
  @media(max-width: 640px) {
    .atap-navbar { height: 60px; padding: 0 16px; } .atap-hero { padding: 48px 16px 56px; }
    .atap-hero h1 { font-size: 32px; line-height: 1.15; } .atap-hero p { font-size: 14px; }
    .atap-search-wrap { flex-direction: column; align-items: stretch; gap: 8px; padding: 12px; }
    .atap-search-btn { width: 100%; justify-content: center; }
    .atap-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .atap-sec-header { flex-direction: column; align-items: flex-start; gap: 10px; }
    .atap-section { padding-bottom: 96px; }
    .atap-why-grid { grid-template-columns: 1fr; gap: 12px; } .atap-why-card { padding: 20px 16px; }
    .atap-stats-section { margin-top: -32px; padding: 0 16px; }
    .atap-stats-grid { grid-template-columns: 1fr !important; }
    .atap-stats-grid.is-single { max-width: none; }
    .atap-footer-links { flex-wrap: wrap; gap: 28px; }
    .atap-footer-bottom { flex-direction: column; gap: 10px; text-align: center; }
    .atap-footer-bottom-links { flex-wrap: wrap; justify-content: center; gap: 12px; }
    .atap-cta-banner { padding: 0 16px 40px; } .atap-cta-inner { padding: 32px 20px; border-radius: 18px; }
    .atap-cta-text h2 { font-size: 20px; } .atap-cta-btns { flex-direction: column; width: 100%; }
    .atap-cta-btn-primary, .atap-cta-btn-ghost { width: 100%; text-align: center; }
    .atap-bottom-nav {
      display: flex; position: fixed; bottom: 0; left: 0; right: 0; z-index: 300;
      background: rgba(255,255,255,0.97); backdrop-filter: blur(20px);
      border-top: 1px solid var(--border-color); padding: 6px 0 calc(6px + env(safe-area-inset-bottom));
      justify-content: space-around; align-items: center; box-shadow: 0 -4px 20px rgba(0,0,0,.07);
    }
    .dark-mode .atap-bottom-nav { background: rgba(30,41,59,0.97); }
    .atap-bn-item { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 6px 10px; border: none; background: none; border-radius: 12px; cursor: pointer; color: var(--text-secondary); transition: color 0.15s; min-width: 52px; font-family: 'DM Sans', sans-serif; }
    .atap-bn-item.active { color: #2563EB; }
    .atap-bn-item span { font-size: 10px; font-weight: 700; letter-spacing: 0.1px; }
    .atap-bn-item.active::after { content: ''; display: block; width: 4px; height: 4px; background: #2563EB; border-radius: 50%; margin-top: 1px; }
    .atap-bn-avatar { width: 24px; height: 24px; border-radius: 50%; background: #DBEAFE; color: #1D4ED8; font-size: 8px; font-weight: 800; display: flex; align-items: center; justify-content: center; border: 2px solid #BFDBFE; font-family: 'DM Sans', sans-serif; }
    .atap-bn-item.active .atap-bn-avatar { background: #BFDBFE; border-color: #2563EB; }
  }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="atap-root">

        {/* NAVBAR */}
        <nav className="atap-navbar">
          <div className="atap-navbar-logo" onClick={() => navigate("/")}>Atap<span>.</span></div>
          <div className="atap-navbar-links">
            {isLoggedIn ? (
              <>
                {DESKTOP_LINKS.map(({ label, path }) => (
                  <span key={path}
                    className={`atap-navbar-link${isNavActive(path) ? " active" : ""}`}
                    onClick={() => navigate(path)}>
                    {label}
                  </span>
                ))}
                <div className="atap-navbar-divider" />
                <div className="atap-dropdown-wrap" ref={menuRef}>
                  <div className="atap-avatar-wrap">
                    <div className="atap-navbar-avatar" onClick={() => setShowMenu((p) => !p)} title={userName}>{initials}</div>
                    {unreadCount > 0 && <span className="atap-notif-dot" />}
                  </div>
                  {showMenu && (
                    <div className="atap-navbar-dropdown">
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
                <span
                  className={`atap-navbar-link${isNavActive("/") ? " active" : ""}`}
                  onClick={() => navigate("/")}
                >
                  Home
                </span>
                <span
                  className={`atap-navbar-link${isNavActive("/search") ? " active" : ""}`}
                  onClick={() => navigate("/search")}
                >
                  Search
                </span>
                <div className="atap-navbar-divider" />
                <span className="atap-navbar-login" onClick={() => navigate("/auth")}>Masuk</span>
                <button className="atap-navbar-cta" onClick={() => navigate("/auth")}>Daftar Gratis</button>
              </>
            )}
          </div>
        </nav>

        {/* HERO */}
        <div className="atap-hero">
          <div className="atap-blob" style={{ width: 320, height: 320, top: -120, right: -80 }} />
          <div className="atap-blob" style={{ width: 220, height: 220, left: -70, bottom: -80 }} />
          <div className="atap-hero-inner">
            <h1>Temukan kost nyaman<br /><em>tanpa ribet</em></h1>
            <p>Cari kost putra, putri, atau campur dengan lokasi strategis, harga terbaik, dan fasilitas lengkap.</p>
            <div className="atap-search-wrap">
              <div className="atap-search-row">
                <Search size={18} color="rgba(255,255,255,.55)" style={{ flexShrink: 0 }} />
                <input readOnly onClick={() => navigate("/search")} className="atap-search-input" placeholder="Cari kost atau lokasi..." />
              </div>
              <button className="atap-search-btn" onClick={() => navigate("/search")}><SlidersHorizontal size={16} /> Filter</button>
            </div>
          </div>
        </div>

        {/* STATS */}
        {STATS.length > 0 && (
          <div className="atap-stats-section">
            <div
              className={`atap-stats-grid${STATS.length === 1 ? " is-single" : ""}`}
              style={{ "--stat-cols": STATS.length }}
            >
              {STATS.map(({ icon: Icon, label, value, color, loadingKey }) => (
                <div key={label} className="atap-stat-box">
                  <div className="atap-stat-icon" style={{ background: `${color}15`, color }}>
                    <Icon size={24} />
                  </div>
                  <div className="atap-stat-content">
                    {loading && loadingKey === "listings" ? (
                      <div className="atap-stat-value-loading" />
                    ) : (
                      <p className="atap-stat-value">{value}</p>
                    )}
                    <p className="atap-stat-label">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LISTINGS + NEARBY */}
        <div className="atap-section">
          {/* Rekomendasi */}
          <div className="atap-sec-header">
            <div className="atap-sec-title">Rekomendasi kost</div>
            <div className="atap-sec-link" onClick={() => navigate("/semua")}>Lihat semua <ChevronRight size={16} /></div>
          </div>
          <div className="atap-filters">
            {FILTERS.map((f) => (
              <button key={f} className={`atap-chip${activeFilter === f ? " active" : ""}`} onClick={() => setActiveFilter(f)}>{f}</button>
            ))}
          </div>
          <div className="atap-grid">{renderCards(8)}</div>

          {/* Kost Terdekat */}
          <div className="atap-sec-header" style={{ marginTop: 60 }}>
            <div className="atap-sec-title">Kost di sekitar Anda</div>
            <div className="atap-sec-link" onClick={() => navigate("/map")}>
              Lihat di peta <ChevronRight size={16} />
            </div>
          </div>

          {/* Info bar lokasi */}
          {userCoords && !nearbyLoading && nearbyData.length > 0 && (
            <div className="atap-nearby-info">
              <span className="atap-nearby-info-dot" />
              <span>Menampilkan {nearbyData.length} kost terdekat dari lokasi Anda saat ini</span>
            </div>
          )}
          {locationDenied && (
            <div className="atap-nearby-info" style={{ marginBottom: 20 }}>
              <Navigation size={14} color="#F59E0B" />
              <span style={{ color: "#F59E0B" }}>
                Izin lokasi ditolak. &nbsp;
                <span
                  style={{ color: "#2563EB", cursor: "pointer", fontWeight: 700 }}
                  onClick={fetchNearby}
                >
                  Coba lagi
                </span>
              </span>
            </div>
          )}

          <div className="atap-grid">{renderNearbyCards()}</div>
        </div>

        {/* KENAPA ATAP */}
        <div className="atap-why-section">
          <div className="atap-section">
            <div className="atap-sec-header"><div className="atap-sec-title">Kenapa pilih Atap?</div></div>
            <div className="atap-why-grid">
              {WHY_ITEMS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="atap-why-card">
                  <div className="atap-why-icon"><Icon size={20} strokeWidth={1.8} /></div>
                  <div className="atap-why-title">{title}</div>
                  <div className="atap-why-desc">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="atap-cta-banner">
          <div className="atap-cta-inner">
            <div className="atap-cta-text">
              <h2>Punya kost? Daftarkan sekarang.</h2>
              <p>Jangkau ribuan pencari kost aktif setiap hari.<br />Gratis daftar, mudah kelola, cepat dapat penyewa.</p>
            </div>
            <div className="atap-cta-btns">
              <button className="atap-cta-btn-primary" onClick={() => navigate(isLoggedIn ? "/owner/dashboard" : "/auth")}>Daftarkan Kost</button>
              <button className="atap-cta-btn-ghost" onClick={() => navigate("/map")}>Lihat di Peta</button>
            </div>
          </div>
        </div>

        {showNotif && isLoggedIn && (
          <NotificationPanel onClose={() => setShowNotif(false)} onUnreadChange={(c) => setUnreadCount(c)} />
        )}

        {/* FOOTER */}
        <footer className="atap-footer">
          <div className="atap-footer-inner">
            <div className="atap-footer-brand">
              <div className="atap-footer-logo">Atap<span>.</span></div>
              <p>Platform pencarian kost terpercaya untuk mahasiswa dan pekerja di seluruh Indonesia.</p>
              <div className="atap-footer-socials">
                {["Instagram", "Twitter", "TikTok"].map((s) => <span key={s} className="atap-footer-social">{s}</span>)}
              </div>
            </div>
            <div className="atap-footer-links">
              {FOOTER_COLS.map(({ title, links }) => (
                <div key={title} className="atap-footer-col">
                  <div className="atap-footer-col-title">{title}</div>
                  {links.map(({ label, path }) => (
                    <button key={label} className="atap-footer-link" onClick={() => path && navigate(path)}>{label}</button>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <hr className="atap-footer-divider" />
          <div className="atap-footer-bottom">
            <span>© {new Date().getFullYear()} Atap. Hak cipta dilindungi.</span>
            <div className="atap-footer-bottom-links">
              <span>Kebijakan Privasi</span><span>Syarat &amp; Ketentuan</span><span>Cookie</span>
            </div>
          </div>
        </footer>

        {/* MOBILE BOTTOM NAV */}
        <nav className="atap-bottom-nav">
          {(isLoggedIn ? MOBILE_NAV : GUEST_MOBILE).map(({ label, path, icon: Icon }) => {
            const isActive = isNavActive(path);
            const isProfil = path === "/profil";
            const isChat = path === "/chat";
            return (
              <button key={path} className={`atap-bn-item${isActive ? " active" : ""}`} onClick={() => navigate(path)}>
                {isProfil && isLoggedIn ? (
                  <div className="atap-bn-avatar-wrap">
                    <div className="atap-bn-avatar">{initials}</div>
                    {unreadCount > 0 && <span className="atap-bn-notif-dot" />}
                  </div>
                ) : isChat && isLoggedIn ? (
                  <div className="atap-bn-icon-wrap">
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                    {unreadChat > 0 && <span className="atap-bn-chat-badge">{unreadChat > 99 ? "99+" : unreadChat}</span>}
                  </div>
                ) : (
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                )}
                <span>{label}</span>
              </button>
            );
          })}
          {!isLoggedIn && (
            <button className={`atap-bn-item${currentPath === "/auth" ? " active" : ""}`} onClick={() => navigate("/auth")}>
              <User size={20} strokeWidth={currentPath === "/auth" ? 2.5 : 1.8} />
              <span>Masuk</span>
            </button>
          )}
        </nav>

      </div>
    </>
  );
}