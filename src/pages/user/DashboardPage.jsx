/* =========================
   IMPORT
========================= */
import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  SearchX,
  AlertCircle,
  RefreshCw,
  Heart,
  User,
  ChevronRight,
  LogOut,
  Settings,
  MessageCircle,
  Map,
  SlidersHorizontal,
  Home,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import KostCard from "../../components/kost/KostCard";
import NotificationPanel from "../../components/ui/NotificationPanel";
import KampusSection from "../../components/sections/KampusSection";

/* =========================
   SKELETON
========================= */
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

export default function DashboardPage() {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeFilter, setActiveFilter] = useState("Semua");

  const [favorites, setFavorites] = useState([]);

  const [showMenu, setShowMenu] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = !!user;
  const userName = user?.name || "Guest";

  const token = localStorage.getItem("token");

  const initials = isLoggedIn
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "GU";

  /* =========================
     CLOSE MENU ON OUTSIDE CLICK
  ========================= */
  useEffect(() => {
    const h = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* =========================
     LOCK BODY SCROLL WHEN DRAWER OPEN
  ========================= */
  useEffect(() => {
    document.body.style.overflow = showDrawer ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showDrawer]);

  /* =========================
     FAVORITES
  ========================= */
  useEffect(() => {
    if (!isLoggedIn) return;
    fetch("http://localhost:3000/favorites", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((j) => setFavorites((j.data || []).map((x) => String(x.id))))
      .catch(console.error);
  }, [isLoggedIn, token]);

  /* =========================
     TOGGLE LIKE
  ========================= */
  const handleToggleLike = async (id) => {
    if (!isLoggedIn) {
      navigate("/auth");
      return;
    }
    const idStr = String(id);
    const isLiked = favorites.includes(idStr);
    try {
      const res = await fetch(`http://localhost:3000/favorites/${idStr}`, {
        method: isLiked ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setFavorites((p) =>
        isLiked ? p.filter((f) => f !== idStr) : [...p, idStr]
      );
    } catch {}
  };

  /* =========================
     FETCH LISTINGS
  ========================= */
  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:3000/listings");
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      const raw = Array.isArray(json)
        ? json
        : Array.isArray(json.data)
        ? json.data
        : [];
      setData(
        raw.map((item) => {
          const room = item.roomTypes?.[0] || {};
          return {
            id: String(item.id),
            name: item.name || "Tanpa Nama",
            location: item.address || "Lokasi tidak tersedia",
            price: room.price ?? 0,
            gender: (item.genderType || "").toLowerCase(),
            image:
              room.photos?.[0]?.url ||
              "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
            available: room.availableCount ?? 0,
            isPremium: item.isPremium || false,
          };
        })
      );
    } catch {
      setError("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  /* =========================
     FILTER
  ========================= */
  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        return (
          activeFilter === "Semua" ||
          item.gender?.toLowerCase() === activeFilter.toLowerCase()
        );
      }),
    [data, activeFilter]
  );

  /* =========================
     LOGOUT
  ========================= */
  const doLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth");
  };

  /* =========================
     RENDER CARDS
  ========================= */
  const renderCards = (count = 6) => {
    if (loading)
      return Array.from({ length: count }).map((_, i) => (
        <KostCardSkeleton key={i} />
      ));

    if (error)
      return (
        <div className="atap-empty" style={{ gridColumn: "1/-1" }}>
          <AlertCircle size={28} color="#F87171" />
          <p>Gagal memuat listing</p>
          <button className="atap-retry-btn" onClick={fetchListings}>
            <RefreshCw size={13} />
            Coba lagi
          </button>
        </div>
      );

    if (!filteredData.length)
      return (
        <div className="atap-empty" style={{ gridColumn: "1/-1" }}>
          <SearchX size={28} color="#CBD5E1" />
          <p>Kost tidak ditemukan</p>
        </div>
      );

    return filteredData.map((item) => (
      <KostCard
        key={item.id}
        item={item}
        isLiked={favorites.includes(item.id)}
        onLike={() => handleToggleLike(item.id)}
        onClick={() => navigate(`/detail/${item.id}`)}
      />
    ));
  };

  /* =========================
     CSS
  ========================= */
  const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;700&display=swap');

  * { box-sizing: border-box; }

  body { margin: 0; background: #F8FAFC; }

  .atap-root {
    font-family: 'DM Sans', sans-serif;
    color: #0F172A;
  }

  .atap-root h1,
  .atap-root h2,
  .atap-root h3 {
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  /* ======================
      NAVBAR
  ====================== */
  .atap-navbar {
    position: sticky;
    top: 0;
    z-index: 100;
    height: 72px;
    background: rgba(255,255,255,.88);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid #EAEFF5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 42px;
  }

  .atap-navbar-logo {
    font-size: 25px;
    font-weight: 800;
    letter-spacing: -1px;
    color: #0F172A;
    cursor: pointer;
  }

  .atap-navbar-logo span { color: #2563EB; }

  .atap-navbar-links {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .atap-navbar-link {
    font-size: 14px;
    font-weight: 600;
    color: #64748B;
    cursor: pointer;
    transition: .2s;
    padding: 6px 10px;
    border-radius: 8px;
  }

  .atap-navbar-link:hover { color: #2563EB; }

  .atap-navbar-link.active { color: #2563EB; }

  .atap-navbar-divider {
    width: 1px;
    height: 22px;
    background: #E2E8F0;
    margin: 0 8px;
  }

  .atap-navbar-login {
    font-size: 14px;
    font-weight: 700;
    color: #475569;
    cursor: pointer;
    padding: 8px 14px;
    border-radius: 10px;
    transition: .15s;
  }

  .atap-navbar-login:hover { color: #0F172A; background: #F1F5F9; }

  .atap-navbar-cta {
    border: none;
    cursor: pointer;
    padding: 11px 22px;
    border-radius: 12px;
    background: linear-gradient(135deg, #2563EB, #3B82F6);
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    transition: .2s;
  }

  .atap-navbar-cta:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 25px rgba(37,99,235,.22);
  }

  /* ======================
      AVATAR + DROPDOWN
  ====================== */
  .atap-dropdown-wrap { position: relative; }

  .atap-navbar-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #DBEAFE;
    color: #1D4ED8;
    font-size: 12px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: 2px solid #BFDBFE;
    transition: .2s;
    margin-left: 4px;
  }

  .atap-navbar-avatar:hover {
    background: #BFDBFE;
    transform: scale(1.05);
  }

  .atap-navbar-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    background: white;
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    padding: 8px;
    min-width: 170px;
    box-shadow: 0 8px 32px rgba(0,0,0,.10);
    display: flex;
    flex-direction: column;
    gap: 2px;
    z-index: 200;
    animation: ddFadeIn .15s ease;
  }

  @keyframes ddFadeIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .atap-navbar-dropdown button {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 13px;
    border: none;
    background: none;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    color: #334155;
    cursor: pointer;
    width: 100%;
    text-align: left;
    transition: .13s;
    font-family: 'DM Sans', sans-serif;
  }

  .atap-navbar-dropdown button:hover { background: #F1F5F9; }

  .atap-navbar-dropdown .dd-divider {
    height: 1px;
    background: #E2E8F0;
    margin: 4px 0;
  }

  .atap-navbar-dropdown button.danger { color: #EF4444; }
  .atap-navbar-dropdown button.danger:hover { background: #FEF2F2; }

  /* ======================
      BURGER
  ====================== */
  .atap-burger {
    display: none;
    flex-direction: column;
    gap: 5px;
    cursor: pointer;
    padding: 8px;
    border-radius: 10px;
    transition: .15s;
  }

  .atap-burger:hover { background: #F1F5F9; }

  .atap-burger span {
    display: block;
    width: 20px;
    height: 2px;
    background: #475569;
    border-radius: 2px;
    transition: .2s;
  }

  /* ======================
      DRAWER (mobile)
  ====================== */
  .atap-drawer-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.4);
    z-index: 400;
    backdrop-filter: blur(3px);
    animation: overlayIn .2s ease;
  }

  @keyframes overlayIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .atap-drawer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 280px;
    background: white;
    z-index: 401;
    padding: 28px 16px 24px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    box-shadow: -4px 0 32px rgba(0,0,0,.12);
    transform: translateX(100%);
    transition: transform .28s cubic-bezier(.4,0,.2,1);
  }

  .atap-drawer.open { transform: translateX(0); }

  .atap-drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding: 0 8px;
  }

  .atap-drawer-logo {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -1px;
    color: #0F172A;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .atap-drawer-logo span { color: #2563EB; }

  .atap-drawer-close {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #64748B;
    transition: .15s;
    border: none;
    background: none;
  }

  .atap-drawer-close:hover { background: #F1F5F9; color: #0F172A; }

  .atap-drawer-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 16px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    color: #334155;
    cursor: pointer;
    transition: .13s;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    font-family: 'DM Sans', sans-serif;
  }

  .atap-drawer-item:hover { background: #F1F5F9; }

  .atap-drawer-item.active {
    color: #2563EB;
    background: #EFF6FF;
  }

  .atap-drawer-item.primary {
    background: linear-gradient(135deg, #2563EB, #3B82F6);
    color: white;
    margin-top: 4px;
  }

  .atap-drawer-item.primary:hover { opacity: .92; }

  .atap-drawer-item.danger { color: #EF4444; }
  .atap-drawer-item.danger:hover { background: #FEF2F2; }

  .atap-drawer-divider {
    height: 1px;
    background: #E2E8F0;
    margin: 6px 8px;
  }

  /* ======================
      HERO
  ====================== */
  .atap-hero {
    position: relative;
    overflow: hidden;
    padding: 64px 24px 72px;
    background:
      radial-gradient(circle at top left, rgba(255,255,255,.08), transparent 25%),
      linear-gradient(135deg, #0F172A 0%, #1E3A8A 45%, #2563EB 100%);
  }

  .atap-blob {
    position: absolute;
    border-radius: 50%;
    background: rgba(255,255,255,.06);
    filter: blur(2px);
  }

  .atap-hero-inner {
    position: relative;
    z-index: 2;
    max-width: 760px;
    margin: auto;
    text-align: center;
  }

  .atap-hero h1 {
    font-size: 46px;
    line-height: 1.12;
    font-weight: 800;
    color: white;
    margin: 0 0 16px;
    letter-spacing: -1.5px;
  }

  .atap-hero h1 em {
    font-style: normal;
    color: #93C5FD;
  }

  .atap-hero p {
    font-size: 17px;
    line-height: 1.7;
    color: rgba(255,255,255,.72);
    margin: 0 auto 38px;
    max-width: 620px;
  }

  .atap-search-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255,255,255,.14);
    border: 1px solid rgba(255,255,255,.18);
    backdrop-filter: blur(16px);
    padding: 10px 12px 10px 16px;
    border-radius: 16px;
    max-width: 620px;
    margin: auto;
  }

  .atap-search-row {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .atap-search-input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: #fff;
    font-size: 15px;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
  }

  .atap-search-input::placeholder { color: rgba(255,255,255,.55); }

  .atap-search-btn {
    height: 44px;
    border: none;
    cursor: pointer;
    border-radius: 14px;
    padding: 0 18px;
    background: white;
    color: #2563EB;
    font-size: 14px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: .2s;
    font-family: 'DM Sans', sans-serif;
  }

  .atap-search-btn:hover { transform: translateY(-1px); }

  /* ======================
      SECTION
  ====================== */
  .atap-section {
    max-width: 1180px;
    margin: auto;
    padding: 42px 28px;
  }

  .atap-sec-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .atap-sec-title {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.8px;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .atap-sec-link {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 14px;
    font-weight: 700;
    color: #2563EB;
    cursor: pointer;
  }

  /* ======================
      FILTER CHIPS
  ====================== */
  .atap-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 28px;
  }

  .atap-chip {
    padding: 9px 18px;
    border-radius: 999px;
    border: 1.5px solid #E2E8F0;
    background: white;
    font-size: 13px;
    font-weight: 700;
    color: #64748B;
    cursor: pointer;
    transition: .2s;
    font-family: 'DM Sans', sans-serif;
  }

  .atap-chip:hover {
    border-color: #93C5FD;
    color: #2563EB;
  }

  .atap-chip.active {
    background: linear-gradient(135deg, #1D4ED8, #2563EB);
    border-color: #2563EB;
    color: white;
  }

  /* ======================
      GRID
  ====================== */
  .atap-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
  }

  /* ======================
      SKELETON
  ====================== */
  .atap-skeleton {
    background: white;
    border-radius: 18px;
    overflow: hidden;
    border: 1px solid #EEF2F7;
    animation: pulse 1.4s infinite;
  }

  .atap-skeleton-img { height: 170px; background: #E2E8F0; }

  .atap-skeleton-body {
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .atap-skeleton-line {
    height: 12px;
    border-radius: 999px;
    background: #E2E8F0;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: .55; }
  }

  /* ======================
      EMPTY STATE
  ====================== */
  .atap-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 60px 0;
  }

  .atap-empty p {
    font-size: 14px;
    color: #64748B;
    font-weight: 600;
  }

  .atap-retry-btn {
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    background: #2563EB;
    color: white;
    padding: 10px 18px;
    border-radius: 12px;
    font-weight: 700;
    font-family: 'DM Sans', sans-serif;
  }

  /* ======================
      RESPONSIVE
  ====================== */
  @media(max-width: 1100px) {
    .atap-grid { grid-template-columns: repeat(3, 1fr); }
  }

  @media(max-width: 900px) {
    .atap-navbar { padding: 0 20px; }
    .atap-hero { padding: 56px 20px 64px; }
    .atap-hero p { font-size: 15px; }
    .atap-section { padding: 40px 20px; }
    .atap-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media(max-width: 640px) {
    .atap-navbar { height: 64px; padding: 0 16px; }
    .atap-navbar-links { display: none; }
    .atap-burger { display: flex; }
    .atap-hero { padding: 52px 16px 60px; }
    .atap-hero h1 { font-size: 34px; line-height: 1.15; }
    .atap-hero p { font-size: 14px; }
    .atap-search-wrap { flex-direction: column; align-items: stretch; gap: 8px; padding: 12px; }
    .atap-search-row { display: flex; align-items: center; gap: 8px; }
    .atap-search-btn { width: 100%; justify-content: center; }
    .atap-grid { grid-template-columns: 1fr; }
    .atap-sec-header { flex-direction: column; align-items: flex-start; gap: 10px; }
  }
  `;

  /* =========================
     RENDER
  ========================= */
  return (
    <>
      <style>{css}</style>

      <div className="atap-root">

        {/* =========================
            NAVBAR
        ========================= */}
        <nav className="atap-navbar">
          <div className="atap-navbar-logo" onClick={() => navigate("/")}>
            Atap<span>.</span>
          </div>

          {/* Desktop */}
          <div className="atap-navbar-links">
            {isLoggedIn ? (
              <>
                <span
                  className="atap-navbar-link active"
                  onClick={() => navigate("/")}
                >
                  Home
                </span>

                <span
                  className="atap-navbar-link"
                  onClick={() => navigate("/map")}
                >
                  Peta
                </span>

                <span
                  className="atap-navbar-link"
                  onClick={() => navigate("/chat")}
                >
                  Chat
                </span>

                <span
                  className="atap-navbar-link"
                  onClick={() => navigate("/favorit")}
                >
                  Favorit
                </span>

                <div className="atap-navbar-divider" />

                <div className="atap-dropdown-wrap" ref={menuRef}>
                  <div
                    className="atap-navbar-avatar"
                    onClick={() => setShowMenu((p) => !p)}
                    title={userName}
                  >
                    {initials}
                  </div>

                  {showMenu && (
                    <div className="atap-navbar-dropdown">
                      <button
                        onClick={() => {
                          navigate("/profil");
                          setShowMenu(false);
                        }}
                      >
                        <User size={14} />
                        Profil
                      </button>

                      <button
                        onClick={() => {
                          navigate("/settings/account");
                          setShowMenu(false);
                        }}
                      >
                        <Settings size={14} />
                        Pengaturan
                      </button>

                      <div className="dd-divider" />

                      <button className="danger" onClick={doLogout}>
                        <LogOut size={14} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <span
                  className="atap-navbar-login"
                  onClick={() => navigate("/auth")}
                >
                  Masuk
                </span>

                <button
                  className="atap-navbar-cta"
                  onClick={() => navigate("/auth")}
                >
                  Daftar Gratis
                </button>
              </>
            )}
          </div>

          {/* Burger (mobile) */}
          <div
            className="atap-burger"
            onClick={() => setShowDrawer(true)}
            aria-label="Buka menu"
          >
            <span />
            <span />
            <span />
          </div>
        </nav>

        {/* =========================
            MOBILE DRAWER
        ========================= */}
        {showDrawer && (
          <>
            <div
              className="atap-drawer-overlay"
              onClick={() => setShowDrawer(false)}
            />
            <div className="atap-drawer open">
              <div className="atap-drawer-header">
                <div className="atap-drawer-logo">
                  Atap<span>.</span>
                </div>
                <button
                  className="atap-drawer-close"
                  onClick={() => setShowDrawer(false)}
                  aria-label="Tutup menu"
                >
                  ✕
                </button>
              </div>

              {isLoggedIn ? (
                <>
                  <button
                    className="atap-drawer-item active"
                    onClick={() => { navigate("/"); setShowDrawer(false); }}
                  >
                    <Home size={18} />
                    Home
                  </button>

                  <button
                    className="atap-drawer-item"
                    onClick={() => { navigate("/map"); setShowDrawer(false); }}
                  >
                    <Map size={18} />
                    Peta
                  </button>

                  <button
                    className="atap-drawer-item"
                    onClick={() => { navigate("/chat"); setShowDrawer(false); }}
                  >
                    <MessageCircle size={18} />
                    Chat
                  </button>

                  <button
                    className="atap-drawer-item"
                    onClick={() => { navigate("/favorit"); setShowDrawer(false); }}
                  >
                    <Heart size={18} />
                    Favorit
                  </button>

                  <div className="atap-drawer-divider" />

                  <button
                    className="atap-drawer-item"
                    onClick={() => { navigate("/profil"); setShowDrawer(false); }}
                  >
                    <User size={18} />
                    Profil
                  </button>

                  <button
                    className="atap-drawer-item"
                    onClick={() => { navigate("/settings/account"); setShowDrawer(false); }}
                  >
                    <Settings size={18} />
                    Pengaturan
                  </button>

                  <div className="atap-drawer-divider" />

                  <button
                    className="atap-drawer-item danger"
                    onClick={doLogout}
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="atap-drawer-item"
                    onClick={() => { navigate("/auth"); setShowDrawer(false); }}
                  >
                    <User size={18} />
                    Masuk
                  </button>

                  <button
                    className="atap-drawer-item primary"
                    onClick={() => { navigate("/auth"); setShowDrawer(false); }}
                  >
                    Daftar Gratis
                  </button>
                </>
              )}
            </div>
          </>
        )}

        {/* =========================
            HERO
        ========================= */}
        <div className="atap-hero">
          <div className="atap-blob" style={{ width: 320, height: 320, top: -120, right: -80 }} />
          <div className="atap-blob" style={{ width: 220, height: 220, left: -70, bottom: -80 }} />

          <div className="atap-hero-inner">
            <h1>
              Temukan kost nyaman
              <br />
              <em>tanpa ribet</em>
            </h1>

            <p>
              Cari kost putra, putri, atau campur dengan lokasi strategis,
              harga terbaik, dan fasilitas lengkap.
            </p>

            <div className="atap-search-wrap">
              <div className="atap-search-row">
                <Search size={18} color="rgba(255,255,255,.55)" style={{ flexShrink: 0 }} />
                <input
                  readOnly
                  onClick={() => navigate("/search")}
                  className="atap-search-input"
                  placeholder="Cari kost atau lokasi..."
                />
              </div>
              <button
                className="atap-search-btn"
                onClick={() => navigate("/search")}
              >
                <SlidersHorizontal size={16} />
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* =========================
            CONTENT
        ========================= */}
        <div className="atap-section">
          <div className="atap-sec-header">
            <div className="atap-sec-title">Rekomendasi kost</div>
            <div className="atap-sec-link" onClick={() => navigate("/semua")}>
              Lihat semua
              <ChevronRight size={16} />
            </div>
          </div>

          <div className="atap-filters">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`atap-chip ${activeFilter === f ? "active" : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="atap-grid">{renderCards(8)}</div>

          <div className="atap-sec-header" style={{ marginTop: 60 }}>
            <div className="atap-sec-title">Dekat kampus</div>
            <div className="atap-sec-link">
              Lihat semua
              <ChevronRight size={16} />
            </div>
          </div>

          <KampusSection />
        </div>

        {showNotif && isLoggedIn && (
          <NotificationPanel
            onClose={() => setShowNotif(false)}
            onUnreadChange={(c) => setUnreadCount(c)}
          />
        )}
      </div>
    </>
  );
}