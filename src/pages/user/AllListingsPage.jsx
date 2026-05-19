// pages/user/AllListingsPage.jsx

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  SearchX,
  AlertCircle,
  RefreshCw,
  Heart,
  User,
  ChevronLeft,
  ChevronDown,
  LogOut,
  Settings,
  Map,
  SlidersHorizontal,
  Home,
  MessageCircle,
  Sparkles,
  Moon,
  Sun,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import KostCard from "../../components/kost/KostCard";

/* =========================================================
   SKELETON
========================================================= */
function KostCardSkeleton() {
  return (
    <div className="al-skeleton">
      <div className="al-skeleton-img" />
      <div className="al-skeleton-body">
        <div className="al-skeleton-line" style={{ width: "75%" }} />
        <div className="al-skeleton-line" style={{ width: "50%", height: 10, opacity: 0.6 }} />
        <div className="al-skeleton-line" style={{ width: "65%" }} />
      </div>
    </div>
  );
}

/* =========================================================
   CONSTANTS
========================================================= */
const GENDER_FILTERS = ["Semua", "Putra", "Putri", "Campur"];

const SORT_OPTIONS = [
  { value: "", label: "Paling Direkomendasikan" },
  { value: "lowest_price", label: "Harga Termurah" },
  { value: "highest_price", label: "Harga Tertinggi" },
  { value: "newest", label: "Terbaru" },
];

const NAV_ITEMS = [
  { label: "Home", path: "/", icon: Home, desktop: true, mobile: true, guestMobile: true },
  { label: "Search", path: "/search", icon: Search, desktop: true, mobile: true, guestMobile: true },
  { label: "Peta", path: "/map", icon: Map, desktop: true, mobile: true, guestMobile: true },
  { label: "Favorit", path: "/like", icon: Heart, desktop: true, mobile: true, guestMobile: false },
  { label: "Chat", path: "/chat", icon: MessageCircle, desktop: false, mobile: false, guestMobile: false },
  { label: "Profil", path: "/profil", icon: User, desktop: false, mobile: true, guestMobile: false },
];

const DESKTOP_LINKS = NAV_ITEMS.filter((n) => n.desktop);
const MOBILE_NAV = NAV_ITEMS.filter((n) => n.mobile);
const GUEST_MOBILE = NAV_ITEMS.filter((n) => n.guestMobile);

/* =========================================================
   COMPONENT
========================================================= */
export default function AllListingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const menuRef = useRef(null);
  const sortRef = useRef(null);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeGender, setActiveGender] = useState("Semua");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [tmpGender, setTmpGender] = useState("Semua");
  const [tmpMin, setTmpMin] = useState("");
  const [tmpMax, setTmpMax] = useState("");
  const [tmpSort, setTmpSort] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [aiTagline, setAiTagline] = useState("");
  const [aiLoading, setAiLoading] = useState(true);
  const [unreadChat, setUnreadChat] = useState(0);

  // ── DARK MODE (sama persis Dashboard) ──
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("atap_theme") === "dark");

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark-mode");
      localStorage.setItem("atap_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark-mode");
      localStorage.setItem("atap_theme", "light");
    }
  }, [darkMode]);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = !!user;
  const userName = user?.name || "Guest";
  const token = localStorage.getItem("token");
  const initials = isLoggedIn
    ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "GU";

  /* close dropdowns on outside click */
  useEffect(() => {
    const h = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
      if (sortRef.current && !sortRef.current.contains(e.target)) setShowSortDropdown(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* lock body scroll when drawer open */
  useEffect(() => {
    document.body.style.overflow = showFilterDrawer ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showFilterDrawer]);

  /* unread chat count (sama persis Dashboard) */
  useEffect(() => {
    if (!isLoggedIn || !token) return;
    const fetchUnreadChat = async () => {
      try {
        const res = await fetch("http://localhost:3000/chats", {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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

  /* AI tagline */
  useEffect(() => {
    const fetchTagline = async () => {
      setAiLoading(true);
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [{
              role: "user",
              content: "Buatkan tagline singkat 1 kalimat (maksimal 12 kata) untuk banner halaman listing kost di aplikasi bernama Atap. Tagline harus menarik, natural berbahasa Indonesia, tidak perlu tanda kutip, tidak perlu nomor. Langsung tulis taglinenya saja.",
            }],
          }),
        });
        const json = await res.json();
        setAiTagline(json?.content?.[0]?.text?.trim() || "");
      } catch {
        setAiTagline("Kost impian kamu ada di sini.");
      } finally {
        setAiLoading(false);
      }
    };
    fetchTagline();
  }, []);

  /* favorites */
  useEffect(() => {
    if (!isLoggedIn) return;
    fetch("http://localhost:3000/favorites", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((j) => setFavorites((j.data || []).map((x) => String(x.id))))
      .catch(console.error);
  }, [isLoggedIn, token]);

  const handleToggleLike = async (id) => {
    if (!isLoggedIn) { navigate("/auth"); return; }
    const idStr = String(id);
    const isLiked = favorites.includes(idStr);
    try {
      const res = await fetch(`http://localhost:3000/favorites/${idStr}`, {
        method: isLiked ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setFavorites((p) => isLiked ? p.filter((f) => f !== idStr) : [...p, idStr]);
    } catch { }
  };

  /* fetch listings */
  const fetchListings = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("http://localhost:3000/listings?sort=newest");
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      const raw = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : [];
      setData(
        raw.map((item) => {
          const room = item.roomTypes?.[0] || {};
          return {
            id: String(item.id),
            name: item.name || "Tanpa Nama",
            location: item.address || "Lokasi tidak tersedia",
            price: room.price ?? 0,
            gender: (item.genderType || "").toLowerCase(),
            image: room.photos?.[0]?.url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
            available: room.availableCount ?? 0,
            isPremium: item.isPremium || false,
            updatedAt: item.updatedAt,
          };
        })
      );
    } catch { setError("Gagal memuat data"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchListings(); }, []);

  /* filter + sort */
  const filteredData = useMemo(() => {
    let list = [...data];
    if (activeGender !== "Semua")
      list = list.filter((item) => item.gender?.toLowerCase() === activeGender.toLowerCase());
    if (minPrice) list = list.filter((item) => item.price >= Number(minPrice));
    if (maxPrice) list = list.filter((item) => item.price <= Number(maxPrice));
    if (sort === "lowest_price") list.sort((a, b) => a.price - b.price);
    if (sort === "highest_price") list.sort((a, b) => b.price - a.price);
    if (sort === "newest") {
      list.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    }
    return list;
  }, [data, activeGender, minPrice, maxPrice, sort]);

  const activeFilterCount = [
    activeGender !== "Semua", !!minPrice, !!maxPrice, !!sort,
  ].filter(Boolean).length;

  const openDrawer = () => {
    setTmpGender(activeGender);
    setTmpMin(minPrice);
    setTmpMax(maxPrice);
    setTmpSort(sort);
    setShowFilterDrawer(true);
  };

  const applyFilter = () => {
    setActiveGender(tmpGender);
    setMinPrice(tmpMin);
    setMaxPrice(tmpMax);
    setSort(tmpSort);
    setShowFilterDrawer(false);
  };

  const doLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth");
  };

  /* render grid */
  const renderGrid = () => {
    if (loading)
      return Array.from({ length: 8 }).map((_, i) => <KostCardSkeleton key={i} />);
    if (error)
      return (
        <div className="al-empty" style={{ gridColumn: "1/-1" }}>
          <AlertCircle size={28} color="#F87171" />
          <p>Gagal memuat listing</p>
          <button className="al-retry-btn" onClick={fetchListings}>
            <RefreshCw size={13} /> Coba lagi
          </button>
        </div>
      );
    if (!filteredData.length)
      return (
        <div className="al-empty" style={{ gridColumn: "1/-1" }}>
          <SearchX size={28} color="#CBD5E1" />
          <p>Kost tidak ditemukan</p>
        </div>
      );
    return filteredData.map((item) => (
      <KostCard
        key={item.id}
        item={item}
        isLiked={favorites.includes(item.id)}
        onLike={(e) => { e?.stopPropagation(); handleToggleLike(item.id); }}
        onClick={() => navigate(`/detail/${item.id}`)}
      />
    ));
  };

  /* =========================================================
     CSS
  ========================================================= */
  const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;700&display=swap');

  * { box-sizing: border-box; }
  body { margin: 0; background: #F8FAFC; transition: background 0.3s, color 0.3s; }

  /* ── CSS VARS (dark mode support) ── */
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

  .al-root {
    font-family: 'DM Sans', sans-serif;
    color: var(--text-primary);
    background: var(--bg-primary);
    min-height: 100vh;
    transition: background 0.3s, color 0.3s;
  }
  .al-root h1, .al-root h2, .al-root h3 {
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  /* ── NAVBAR ── */
  .al-navbar {
    position: sticky; top: 0; z-index: 100;
    height: 72px;
    background: rgba(255,255,255,.92);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border-color);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 42px;
    transition: background 0.3s;
  }
  .dark-mode .al-navbar { background: rgba(30,41,59,.92); }

  .al-navbar-left { display: flex; align-items: center; gap: 14px; }
  .al-back-btn {
    width: 38px; height: 38px; border-radius: 11px;
    border: 1px solid var(--border-color); background: var(--bg-secondary);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--text-primary); transition: .15s; flex-shrink: 0;
  }
  .al-back-btn:hover { background: #EFF6FF; color: #2563EB; border-color: #BFDBFE; }
  .dark-mode .al-back-btn:hover { background: rgba(59,130,246,.15); }

  .al-navbar-logo {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 25px; font-weight: 800; letter-spacing: -1px;
    color: var(--text-primary); cursor: pointer;
  }
  .al-navbar-logo span { color: #2563EB; }

  .al-navbar-links { display: flex; align-items: center; gap: 4px; }
  .al-navbar-link {
    font-size: 14px; font-weight: 600; color: var(--text-secondary);
    cursor: pointer; padding: 7px 11px; border-radius: 9px;
    transition: .15s; font-family: 'DM Sans', sans-serif;
  }
  .al-navbar-link:hover { color: #2563EB; background: #EFF6FF; }
  .dark-mode .al-navbar-link:hover { background: rgba(59,130,246,.15); }
  .al-navbar-link.active { color: #2563EB; }

  .al-navbar-divider { width: 1px; height: 22px; background: var(--border-color); margin: 0 6px; }

  /* Chat button (sama persis Dashboard) */
  .al-chat-btn-wrap {
    position: relative; display: inline-flex; margin-left: 2px; cursor: pointer;
  }
  .al-chat-btn {
    width: 36px; height: 36px; border-radius: 50%;
    background: var(--bg-tertiary); color: var(--text-secondary);
    display: flex; align-items: center; justify-content: center;
    border: 1.5px solid var(--border-color); transition: .2s;
  }
  .al-chat-btn:hover { background: #EFF6FF; color: #2563EB; border-color: #BFDBFE; }
  .dark-mode .al-chat-btn:hover { background: rgba(59,130,246,.15); }
  .al-chat-badge {
    position: absolute; top: -3px; right: -3px;
    min-width: 16px; height: 16px; background: #EF4444;
    border-radius: 999px; border: 2px solid var(--bg-secondary);
    display: flex; align-items: center; justify-content: center;
    font-size: 9px; font-weight: 800; color: white; padding: 0 3px;
    line-height: 1; pointer-events: none;
    box-shadow: 0 0 0 2px rgba(239,68,68,.2);
  }
  .al-mobile-chat { display: none; }

  /* Theme toggle (sama persis Dashboard) */
  .al-theme-toggle {
    display: flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; border-radius: 50%;
    background: var(--bg-tertiary); border: 1.5px solid var(--border-color);
    cursor: pointer; transition: .2s; color: var(--text-primary); margin-left: 2px;
  }
  .al-theme-toggle:hover { background: #EFF6FF; color: #2563EB; }
  .dark-mode .al-theme-toggle:hover { background: rgba(59,130,246,.15); }

  .al-navbar-login {
    font-size: 14px; font-weight: 700; color: var(--text-secondary);
    cursor: pointer; padding: 8px 14px; border-radius: 10px; transition: .15s;
    font-family: 'DM Sans', sans-serif;
  }
  .al-navbar-login:hover { color: var(--text-primary); background: var(--bg-tertiary); }
  .al-navbar-cta {
    border: none; cursor: pointer; padding: 11px 22px; border-radius: 12px;
    background: linear-gradient(135deg, #2563EB, #3B82F6);
    color: #fff; font-size: 13px; font-weight: 700; transition: .2s;
    font-family: 'DM Sans', sans-serif;
  }
  .al-navbar-cta:hover { transform: translateY(-1px); box-shadow: 0 12px 25px rgba(37,99,235,.22); }

  /* Dropdown (sama persis Dashboard) */
  .al-dropdown-wrap { position: relative; }
  .al-navbar-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: #DBEAFE; color: #1D4ED8;
    font-size: 12px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; border: 2px solid #BFDBFE; transition: .2s; margin-left: 4px;
    font-family: 'DM Sans', sans-serif;
  }
  .al-navbar-avatar:hover { background: #BFDBFE; transform: scale(1.05); }
  .al-navbar-dropdown {
    position: absolute; top: calc(100% + 10px); right: 0;
    background: var(--bg-secondary); border: 1px solid var(--border-color);
    border-radius: 16px; padding: 8px; min-width: 175px;
    box-shadow: 0 8px 32px rgba(0,0,0,.10);
    display: flex; flex-direction: column; gap: 2px;
    z-index: 200; animation: ddFadeIn .15s ease;
  }
  @keyframes ddFadeIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .al-navbar-dropdown button {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 13px; border: none; background: none;
    border-radius: 10px; font-size: 13px; font-weight: 600;
    color: var(--text-secondary); cursor: pointer; width: 100%;
    text-align: left; transition: .13s; font-family: 'DM Sans', sans-serif;
  }
  .al-navbar-dropdown button:hover { background: var(--bg-tertiary); color: var(--text-primary); }
  .al-navbar-dropdown .dd-divider { height: 1px; background: var(--border-color); margin: 4px 0; }
  .al-navbar-dropdown button.danger { color: #EF4444; }
  .al-navbar-dropdown button.danger:hover { background: #FEF2F2; }
  .dark-mode .al-navbar-dropdown button.danger:hover { background: rgba(239,68,68,.15); }

  /* ── HERO ── */
  .al-hero {
    position: relative; overflow: hidden; padding: 64px 24px 72px;
    background:
      radial-gradient(circle at top left, rgba(255,255,255,.08), transparent 25%),
      linear-gradient(135deg, #0F172A 0%, #1E3A8A 45%, #2563EB 100%);
  }
  .al-blob { position: absolute; border-radius: 50%; background: rgba(255,255,255,.06); filter: blur(2px); }
  .al-hero-inner { position: relative; z-index: 2; max-width: 680px; margin: auto; text-align: center; }
  .al-hero-badge {
    display: inline-flex; align-items: center; gap: 7px;
    background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.22);
    border-radius: 999px; padding: 6px 18px;
    font-size: 13px; font-weight: 700; color: white; margin-bottom: 20px;
  }
  .al-hero h1 {
    font-size: 42px; font-weight: 800; color: white;
    margin: 0 0 16px; letter-spacing: -1.5px; line-height: 1.12;
  }
  .al-hero h1 em { font-style: normal; color: #93C5FD; }
  .al-hero-sub { font-size: 16px; color: rgba(255,255,255,.72); line-height: 1.7; min-height: 28px; }
  .al-shimmer {
    display: inline-block; width: 300px; height: 20px;
    background: rgba(255,255,255,.12); border-radius: 8px;
    animation: shimmerPulse 1.4s infinite;
  }
  @keyframes shimmerPulse { 0%, 100% { opacity: .5; } 50% { opacity: 1; } }

  /* ── FILTER BAR ── */
  .al-filterbar {
    position: sticky; top: 72px; z-index: 90;
    background: rgba(255,255,255,.97); backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border-color);
    transition: background 0.3s;
  }
  .dark-mode .al-filterbar { background: rgba(30,41,59,.97); }
  .al-filterbar-inner {
    max-width: 1180px; margin: 0 auto;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 28px; height: 56px;
  }
  .al-filter-tabs { display: flex; align-items: center; height: 100%; }
  .al-filter-chip {
    display: flex; align-items: center;
    padding: 0 22px; height: 50px;
    font-size: 13px; font-weight: 700; color: var(--text-secondary);
    cursor: pointer; border: none; background: none;
    border-bottom: 2.5px solid transparent; transition: .15s;
    white-space: nowrap; font-family: 'DM Sans', sans-serif; flex-shrink: 0;
  }
  .al-filter-chip:hover { color: #2563EB; }
  .al-filter-chip.active { color: #2563EB; border-bottom-color: #2563EB; }

  .al-filter-btn {
    display: flex; align-items: center; justify-content: center; gap: 7px;
    padding: 0 18px; height: 40px; margin-left: auto;
    border-radius: 12px; border: 1px solid var(--border-color);
    background: var(--bg-secondary);
    font-size: 13px; font-weight: 700; color: var(--text-secondary);
    cursor: pointer; transition: .15s; font-family: 'DM Sans', sans-serif;
    position: relative; flex-shrink: 0;
  }
  .al-filter-btn:hover { color: #2563EB; background: #EFF6FF; border-color: #BFDBFE; }
  .dark-mode .al-filter-btn:hover { background: rgba(59,130,246,.15); }
  .al-filter-btn.has-active { color: #2563EB; }
  .al-filter-badge {
    min-width: 18px; height: 18px; padding: 0 5px; border-radius: 999px;
    background: #2563EB; color: white;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 700;
  }

  /* ── SORT ROW ── */
  .al-sort-row {
    max-width: 1180px; margin: 0 auto; padding: 18px 28px 0;
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; flex-wrap: wrap;
  }
  .al-sort-label { font-size: 14px; color: var(--text-secondary); font-weight: 600; }
  .al-sort-label strong { color: var(--text-primary); }

  .al-sort-wrap { position: relative; }
  .al-sort-trigger {
    display: flex; align-items: center; gap: 8px;
    background: var(--bg-secondary); border: 1.5px solid var(--border-color);
    border-radius: 12px; padding: 9px 14px;
    font-size: 13px; font-weight: 700; color: var(--text-primary);
    font-family: 'DM Sans', sans-serif; cursor: pointer; transition: .15s; white-space: nowrap;
  }
  .al-sort-trigger:hover { border-color: #BFDBFE; color: #2563EB; background: #EFF6FF; }
  .dark-mode .al-sort-trigger:hover { background: rgba(59,130,246,.15); }
  .al-sort-trigger svg { transition: transform .2s; color: var(--text-secondary); }
  .al-sort-trigger svg.rotated { transform: rotate(180deg); }

  .al-sort-dropdown {
    position: absolute; right: 0; top: calc(100% + 8px); z-index: 200;
    background: var(--bg-secondary); border: 1.5px solid var(--border-color);
    border-radius: 14px; box-shadow: 0 8px 32px rgba(0,0,0,.10);
    padding: 6px; min-width: 210px; animation: dropIn .15s ease;
  }
  @keyframes dropIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .al-sort-dropdown-item {
    display: flex; align-items: center; justify-content: space-between;
    width: 100%; padding: 10px 14px; border-radius: 10px;
    border: none; background: none; font-size: 13px; font-weight: 600;
    color: var(--text-primary); font-family: 'DM Sans', sans-serif;
    cursor: pointer; text-align: left; transition: .12s;
  }
  .al-sort-dropdown-item:hover { background: #EFF6FF; color: #2563EB; }
  .dark-mode .al-sort-dropdown-item:hover { background: rgba(59,130,246,.15); }
  .al-sort-dropdown-item.active { color: #2563EB; background: #EFF6FF; }
  .dark-mode .al-sort-dropdown-item.active { background: rgba(59,130,246,.15); }
  .al-sort-check { font-size: 13px; font-weight: 800; color: #2563EB; }

  /* ── GRID ── */
  .al-content { max-width: 1180px; margin: 0 auto; padding: 20px 28px 60px; }
  .al-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }

  /* ── SKELETON ── */
  .al-skeleton {
    background: var(--bg-secondary); border-radius: 18px; overflow: hidden;
    border: 1px solid var(--border-color); animation: alPulse 1.4s infinite;
  }
  .al-skeleton-img  { height: 170px; background: var(--bg-tertiary); }
  .al-skeleton-body { padding: 14px; display: flex; flex-direction: column; gap: 10px; }
  .al-skeleton-line { height: 12px; border-radius: 999px; background: var(--bg-tertiary); }
  @keyframes alPulse { 0%, 100% { opacity: 1; } 50% { opacity: .55; } }

  /* ── EMPTY ── */
  .al-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 0; }
  .al-empty p { font-size: 14px; color: var(--text-secondary); font-weight: 600; }
  .al-retry-btn {
    border: none; cursor: pointer; display: flex; align-items: center; gap: 8px;
    background: #2563EB; color: white; padding: 10px 18px; border-radius: 12px;
    font-weight: 700; font-family: 'DM Sans', sans-serif;
  }

  /* ── FILTER DRAWER ── */
  .al-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 400;
    backdrop-filter: blur(3px); animation: overlayIn .2s ease;
  }
  @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
  .al-drawer {
    position: fixed; bottom: 0; left: 0; right: 0;
    background: var(--bg-secondary); z-index: 401; border-radius: 24px 24px 0 0;
    padding: 0 0 36px; box-shadow: 0 -4px 40px rgba(0,0,0,.10);
    transform: translateY(100%); transition: transform .3s cubic-bezier(.4,0,.2,1);
    max-height: 88vh; overflow-y: auto;
  }
  .al-drawer.open { transform: translateY(0); }
  .al-drawer-handle {
    width: 40px; height: 4px; background: var(--border-color);
    border-radius: 999px; margin: 14px auto 0;
  }
  .al-drawer-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 22px 16px; border-bottom: 1px solid var(--border-color);
  }
  .al-drawer-title {
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: 16px; font-weight: 700;
    color: var(--text-primary);
  }
  .al-drawer-reset {
    font-size: 13px; font-weight: 700; color: #2563EB; cursor: pointer;
    border: none; background: none; font-family: 'DM Sans', sans-serif;
  }
  .al-drawer-section { padding: 20px 22px 0; }
  .al-drawer-label {
    font-size: 11px; font-weight: 700; color: var(--text-secondary);
    text-transform: uppercase; letter-spacing: .07em; margin-bottom: 12px;
  }
  .al-chips { display: flex; gap: 8px; flex-wrap: wrap; }
  .al-chip {
    padding: 9px 18px; border-radius: 999px; border: 1.5px solid var(--border-color);
    background: var(--bg-secondary); font-size: 13px; font-weight: 700;
    color: var(--text-secondary); cursor: pointer; transition: .2s;
    font-family: 'DM Sans', sans-serif;
  }
  .al-chip:hover { border-color: #93C5FD; color: #2563EB; }
  .al-chip.active { background: linear-gradient(135deg, #1D4ED8, #2563EB); border-color: #2563EB; color: white; }
  .al-price-row { display: flex; align-items: center; gap: 10px; }
  .al-price-input {
    flex: 1; border: 1.5px solid var(--border-color); border-radius: 12px;
    padding: 10px 14px; font-size: 13px; font-family: 'DM Sans', sans-serif;
    color: var(--text-primary); outline: none; transition: .15s;
    background: var(--bg-tertiary);
  }
  .al-price-input:focus { border-color: #93C5FD; background: var(--bg-secondary); }
  .al-price-sep { color: var(--text-secondary); font-weight: 700; font-size: 14px; }
  .al-sort-opts { display: flex; flex-direction: column; gap: 2px; }
  .al-sort-opt {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 14px; border-radius: 12px; font-size: 14px; font-weight: 600;
    color: var(--text-primary); cursor: pointer; transition: .12s;
    border: none; background: none; width: 100%; text-align: left;
    font-family: 'DM Sans', sans-serif;
  }
  .al-sort-opt:hover { background: #EFF6FF; color: #2563EB; }
  .dark-mode .al-sort-opt:hover { background: rgba(59,130,246,.15); }
  .al-sort-opt.active { color: #2563EB; background: #EFF6FF; }
  .dark-mode .al-sort-opt.active { background: rgba(59,130,246,.15); }
  .al-radio {
    width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--border-color);
    flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: .15s;
  }
  .al-sort-opt.active .al-radio { border-color: #2563EB; background: #2563EB; }
  .al-sort-opt.active .al-radio::after {
    content: ''; width: 6px; height: 6px; border-radius: 50%; background: white;
  }
  .al-drawer-footer { padding: 20px 22px 0; }
  .al-apply-btn {
    width: 100%; background: linear-gradient(135deg, #1D4ED8, #2563EB);
    color: white; border: none; border-radius: 12px; padding: 13px;
    font-size: 15px; font-weight: 700; cursor: pointer;
    font-family: 'DM Sans', sans-serif; transition: .2s;
  }
  .al-apply-btn:hover { transform: translateY(-1px); box-shadow: 0 12px 25px rgba(37,99,235,.22); }

  /* ── FOOTER ── */
  .al-footer { background: #0F172A; color: #94A3B8; }
  .al-footer-inner {
    max-width: 1180px; margin: auto; padding: 52px 28px 44px;
    display: flex; gap: 60px;
  }
  .al-footer-brand { flex: 1.2; }
  .al-footer-logo {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 24px; font-weight: 800; color: white;
    letter-spacing: -1px; margin-bottom: 14px;
  }
  .al-footer-logo span { color: #3B82F6; }
  .al-footer-brand p {
    font-size: 13.5px; line-height: 1.7; color: #64748B;
    max-width: 270px; margin: 0 0 22px;
  }
  .al-footer-socials { display: flex; gap: 10px; }
  .al-footer-social {
    font-size: 12px; font-weight: 700; color: #475569;
    background: #1E293B; border: 1px solid #334155;
    padding: 6px 14px; border-radius: 999px; cursor: pointer; transition: .15s;
  }
  .al-footer-social:hover { color: white; border-color: #3B82F6; }
  .al-footer-links { flex: 2; display: flex; gap: 40px; }
  .al-footer-col { display: flex; flex-direction: column; gap: 11px; flex: 1; }
  .al-footer-col-title {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px; font-weight: 700; color: white;
    margin-bottom: 4px; letter-spacing: .3px;
  }
  .al-footer-link {
    font-size: 13px; color: #64748B; cursor: pointer; transition: .13s;
    background: none; border: none; padding: 0; text-align: left;
    font-family: 'DM Sans', sans-serif;
  }
  .al-footer-link:hover { color: #93C5FD; }
  .al-footer-divider { border: none; border-top: 1px solid #1E293B; margin: 0; }
  .al-footer-bottom {
    max-width: 1180px; margin: 0 auto; padding: 20px 28px;
    display: flex; align-items: center; justify-content: space-between;
    font-size: 12px; color: #475569;
  }
  .al-footer-bottom-links { display: flex; gap: 20px; }
  .al-footer-bottom-links span { cursor: pointer; transition: .13s; }
  .al-footer-bottom-links span:hover { color: #94A3B8; }

  /* ── BOTTOM NAV — hidden by default ── */
  .al-bottom-nav { display: none; }

  /* ── RESPONSIVE ── */
  @media(max-width: 1100px) { .al-grid { grid-template-columns: repeat(3, 1fr); } }
  @media(max-width: 900px) {
    .al-navbar { padding: 0 20px; }
    .al-hero   { padding: 56px 20px 64px; }
    .al-hero h1 { font-size: 32px; }
    .al-content { padding: 16px 20px 48px; }
    .al-sort-row { padding: 14px 20px 0; }
    .al-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media(max-width: 768px) {
    .al-navbar-links { display: none; }
    .al-mobile-chat  { display: flex !important; }
  }
  @media(max-width: 640px) {
    .al-navbar { height: 60px; padding: 0 16px; }
    .al-filterbar { top: 60px; }
    .al-filterbar-inner { padding: 0 14px; overflow-x: auto; gap: 12px; }
    .al-filter-tabs { gap: 2px; min-width: max-content; }
    .al-filter-chip { padding: 0 16px; height: 46px; font-size: 12px; }
    .al-filter-btn  { height: 38px; padding: 0 14px; font-size: 12px; flex-shrink: 0; }
    .al-hero { padding: 48px 16px 56px; }
    .al-hero h1 { font-size: 26px; line-height: 1.2; }
    .al-hero-sub { font-size: 14px; }
    .al-sort-row { padding: 14px 16px 0; flex-direction: column; align-items: stretch; }
    .al-sort-wrap { width: 100%; }
    .al-sort-trigger { width: 100%; justify-content: space-between; }
    .al-content { padding: 12px 12px 96px; }
    .al-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .al-skeleton-img { height: 130px; }
    .al-drawer { border-radius: 20px 20px 0 0; }
    .al-price-row { flex-direction: column; align-items: stretch; }
    .al-price-sep { display: none; }
    .al-footer-inner { flex-direction: column; gap: 36px; }
    .al-footer-brand p { max-width: 100%; }
    .al-footer-links { flex-wrap: wrap; gap: 28px; }
    .al-footer-bottom { flex-direction: column; gap: 10px; text-align: center; }
    .al-footer-bottom-links { flex-wrap: wrap; justify-content: center; gap: 12px; }

    /* BOTTOM NAV */
    .al-bottom-nav {
      display: flex;
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 300;
      background: rgba(255,255,255,.97); backdrop-filter: blur(20px);
      border-top: 1px solid var(--border-color);
      padding: 6px 0 calc(6px + env(safe-area-inset-bottom));
      justify-content: space-around; align-items: center;
      box-shadow: 0 -4px 20px rgba(0,0,0,.07);
    }
    .dark-mode .al-bottom-nav { background: rgba(30,41,59,.97); }
    .al-bn-item {
      display: flex; flex-direction: column; align-items: center; gap: 3px;
      padding: 6px 10px; border: none; background: none;
      border-radius: 12px; cursor: pointer;
      color: var(--text-secondary); transition: color .15s;
      min-width: 52px; font-family: 'DM Sans', sans-serif;
    }
    .al-bn-item.active { color: #2563EB; }
    .al-bn-item span   { font-size: 10px; font-weight: 700; letter-spacing: .1px; }
    .al-bn-item.active::after {
      content: ''; display: block; width: 4px; height: 4px;
      background: #2563EB; border-radius: 50%; margin-top: 1px;
    }
    .al-bn-avatar {
      width: 24px; height: 24px; border-radius: 50%;
      background: #DBEAFE; color: #1D4ED8;
      font-size: 8px; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid #BFDBFE; font-family: 'DM Sans', sans-serif;
    }
    .al-bn-item.active .al-bn-avatar { background: #BFDBFE; border-color: #2563EB; }
  }
  `;

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <>
      <style>{css}</style>
      <div className="al-root">

        {/* ── NAVBAR ── */}
        <nav className="al-navbar">
          <div className="al-navbar-left">
            <button className="al-back-btn" onClick={() => navigate(-1)} aria-label="Kembali">
              <ChevronLeft size={20} />
            </button>
            <div className="al-navbar-logo" onClick={() => navigate("/")}>
              Atap<span>.</span>
            </div>
          </div>

          <div className="al-navbar-links">
            {isLoggedIn ? (
              <>
                {DESKTOP_LINKS.map(({ label, path }) => (
                  <span
                    key={path}
                    className={`al-navbar-link${currentPath === path ? " active" : ""}`}
                    onClick={() => navigate(path)}
                  >
                    {label}
                  </span>
                ))}
                <div className="al-navbar-divider" />

                {/* Chat button dengan badge (sama persis Dashboard) */}
                <div
                  className="al-chat-btn-wrap"
                  onClick={() => navigate("/chat")}
                  title="Chat"
                >
                  <div className="al-chat-btn"><MessageCircle size={16} /></div>
                  {unreadChat > 0 && (
                    <span className="al-chat-badge">
                      {unreadChat > 99 ? "99+" : unreadChat}
                    </span>
                  )}
                </div>

                {/* Theme toggle (sama persis Dashboard) */}
                <button
                  className="al-theme-toggle"
                  onClick={() => setDarkMode(!darkMode)}
                  title={darkMode ? "Mode Terang" : "Mode Gelap"}
                >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {/* Avatar dropdown */}
                <div className="al-dropdown-wrap" ref={menuRef}>
                  <div
                    className="al-navbar-avatar"
                    onClick={() => setShowMenu((p) => !p)}
                    title={userName}
                  >
                    {initials}
                  </div>
                  {showMenu && (
                    <div className="al-navbar-dropdown">
                      <button onClick={() => { navigate("/profil"); setShowMenu(false); }}>
                        <User size={14} /> Profil
                      </button>
                      <button onClick={() => { navigate("/settings/account"); setShowMenu(false); }}>
                        <Settings size={14} /> Pengaturan
                      </button>
                      <div className="dd-divider" />
                      <button className="danger" onClick={doLogout}>
                        <LogOut size={14} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <span className="al-navbar-link" onClick={() => navigate("/")}>Home</span>
                <span className="al-navbar-link" onClick={() => navigate("/search")}>Search</span>
                <span className="al-navbar-link" onClick={() => navigate("/map")}>Peta</span>
                <div className="al-navbar-divider" />
                {/* Theme toggle untuk guest juga */}
                <button
                  className="al-theme-toggle"
                  onClick={() => setDarkMode(!darkMode)}
                  title={darkMode ? "Mode Terang" : "Mode Gelap"}
                >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <span className="al-navbar-login" onClick={() => navigate("/auth")}>Masuk</span>
                <button className="al-navbar-cta" onClick={() => navigate("/auth")}>Daftar Gratis</button>
              </>
            )}
          </div>

          {/* Mobile chat button */}
          {isLoggedIn && (
            <div
              className="al-chat-btn-wrap al-mobile-chat"
              style={{ display: "none" }}
              onClick={() => navigate("/chat")}
              title="Chat"
            >
              <div className="al-chat-btn"><MessageCircle size={16} /></div>
              {unreadChat > 0 && (
                <span className="al-chat-badge">
                  {unreadChat > 99 ? "99+" : unreadChat}
                </span>
              )}
            </div>
          )}
        </nav>

        {/* ── HERO ── */}
        <div className="al-hero">
          <div className="al-blob" style={{ width: 320, height: 320, top: -120, right: -80 }} />
          <div className="al-blob" style={{ width: 220, height: 220, left: -70, bottom: -80 }} />
          <div className="al-hero-inner">
            <div className="al-hero-badge">
              <Sparkles size={14} />
              Rekomendasi Kost Terbaik
            </div>
            <h1>Semua kost <em>pilihanmu</em><br />ada di sini</h1>
            <p className="al-hero-sub">
              {aiLoading ? <span className="al-shimmer" /> : aiTagline}
            </p>
          </div>
        </div>

        {/* ── FILTER BAR ── */}
        <div className="al-filterbar">
          <div className="al-filterbar-inner">
            <div className="al-filter-tabs">
              {GENDER_FILTERS.map((f) => (
                <button
                  key={f}
                  className={`al-filter-chip${activeGender === f ? " active" : ""}`}
                  onClick={() => setActiveGender(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            <button
              className={`al-filter-btn${activeFilterCount > 0 ? " has-active" : ""}`}
              onClick={openDrawer}
            >
              <SlidersHorizontal size={15} />
              Filter
              {activeFilterCount > 0 && (
                <span className="al-filter-badge">{activeFilterCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* ── SORT ROW ── */}
        <div className="al-sort-row">
          <p className="al-sort-label">
            {loading
              ? "Memuat kost..."
              : <><strong>{filteredData.length.toLocaleString("id-ID")}</strong> kost ditemukan</>
            }
          </p>
          <div className="al-sort-wrap" ref={sortRef}>
            <button
              className="al-sort-trigger"
              onClick={() => setShowSortDropdown((p) => !p)}
            >
              <span>{SORT_OPTIONS.find((o) => o.value === sort)?.label}</span>
              <ChevronDown size={14} className={showSortDropdown ? "rotated" : ""} />
            </button>
            {showSortDropdown && (
              <div className="al-sort-dropdown">
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    className={`al-sort-dropdown-item${sort === o.value ? " active" : ""}`}
                    onClick={() => { setSort(o.value); setShowSortDropdown(false); }}
                  >
                    {o.label}
                    {sort === o.value && <span className="al-sort-check">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── GRID ── */}
        <div className="al-content">
          <div className="al-grid">{renderGrid()}</div>
        </div>

        {/* ── FILTER DRAWER ── */}
        {showFilterDrawer && (
          <>
            <div className="al-overlay" onClick={() => setShowFilterDrawer(false)} />
            <div className="al-drawer open">
              <div className="al-drawer-handle" />
              <div className="al-drawer-header">
                <span className="al-drawer-title">Filter Kost</span>
                <button
                  className="al-drawer-reset"
                  onClick={() => { setTmpGender("Semua"); setTmpMin(""); setTmpMax(""); setTmpSort(""); }}
                >
                  Reset
                </button>
              </div>

              <div className="al-drawer-section">
                <p className="al-drawer-label">Tipe Kost</p>
                <div className="al-chips">
                  {GENDER_FILTERS.map((g) => (
                    <button
                      key={g}
                      className={`al-chip${tmpGender === g ? " active" : ""}`}
                      onClick={() => setTmpGender(g)}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="al-drawer-section" style={{ marginTop: 20 }}>
                <p className="al-drawer-label">Rentang Harga / Bulan</p>
                <div className="al-price-row">
                  <input
                    type="number" className="al-price-input" placeholder="Rp Min"
                    value={tmpMin} onChange={(e) => setTmpMin(e.target.value)}
                  />
                  <span className="al-price-sep">–</span>
                  <input
                    type="number" className="al-price-input" placeholder="Rp Max"
                    value={tmpMax} onChange={(e) => setTmpMax(e.target.value)}
                  />
                </div>
              </div>

              <div className="al-drawer-section" style={{ marginTop: 20 }}>
                <p className="al-drawer-label">Urutkan</p>
                <div className="al-sort-opts">
                  {SORT_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      className={`al-sort-opt${tmpSort === o.value ? " active" : ""}`}
                      onClick={() => setTmpSort(o.value)}
                    >
                      {o.label}
                      <span className="al-radio" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="al-drawer-footer">
                <button className="al-apply-btn" onClick={applyFilter}>Terapkan Filter</button>
              </div>
            </div>
          </>
        )}

        {/* ── FOOTER ── */}
        <footer className="al-footer">
          <div className="al-footer-inner">
            <div className="al-footer-brand">
              <div className="al-footer-logo">Atap<span>.</span></div>
              <p>Platform pencarian kost terpercaya untuk mahasiswa dan pekerja di seluruh Indonesia.</p>
              <div className="al-footer-socials">
                {["Instagram", "Twitter", "TikTok"].map((s) => (
                  <span key={s} className="al-footer-social">{s}</span>
                ))}
              </div>
            </div>
            <div className="al-footer-links">
              {[
                { title: "Platform", links: [["Cari Kost", "/search"], ["Peta Kost", "/map"], ["Kost Favorit", "/like"], ["Semua Listing", "/semua"]] },
                { title: "Untuk Pemilik", links: [["Daftarkan Kost", "/owner/dashboard"], ["Kelola Listing", "/owner/dashboard"], ["Panduan Harga", null], ["FAQ Pemilik", null]] },
                { title: "Perusahaan", links: [["Tentang Kami", null], ["Karir", null], ["Blog", null], ["Hubungi Kami", null]] },
              ].map(({ title, links }) => (
                <div key={title} className="al-footer-col">
                  <div className="al-footer-col-title">{title}</div>
                  {links.map(([label, path]) => (
                    <button key={label} className="al-footer-link" onClick={() => path && navigate(path)}>
                      {label}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <hr className="al-footer-divider" />
          <div className="al-footer-bottom">
            <span>© {new Date().getFullYear()} Atap. Hak cipta dilindungi.</span>
            <div className="al-footer-bottom-links">
              <span>Kebijakan Privasi</span>
              <span>Syarat &amp; Ketentuan</span>
              <span>Cookie</span>
            </div>
          </div>
        </footer>

        {/* ── MOBILE BOTTOM NAV ── */}
        <nav className="al-bottom-nav">
          {(isLoggedIn ? MOBILE_NAV : GUEST_MOBILE).map(({ label, path, icon: Icon }) => {
            const isActive = currentPath === path;
            const isProfil = path === "/profil";
            return (
              <button
                key={path}
                className={`al-bn-item${isActive ? " active" : ""}`}
                onClick={() => navigate(path)}
              >
                {isProfil && isLoggedIn ? (
                  <div className="al-bn-avatar">{initials}</div>
                ) : (
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                )}
                <span>{label}</span>
              </button>
            );
          })}
          {!isLoggedIn && (
            <button
              className={`al-bn-item${currentPath === "/auth" ? " active" : ""}`}
              onClick={() => navigate("/auth")}
            >
              <User size={20} strokeWidth={currentPath === "/auth" ? 2.5 : 1.8} />
              <span>Masuk</span>
            </button>
          )}
        </nav>

      </div>
    </>
  );
}