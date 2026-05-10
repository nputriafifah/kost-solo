import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  MapPin,
  Search,
  Navigation2,
  X,
  SlidersHorizontal,
  Loader2,
  ChevronLeft,
  User,
  Settings,
  LogOut,
  Heart,
  MessageCircle,
  Map,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8080";

const formatPriceLabel = (price) => {
  if (!price) return "0";
  if (price >= 1000000) return `${(price / 1000000).toFixed(1)}jt`;
  return `${Math.round(price / 1000)}rb`;
};

export default function MapPage() {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [selectedKost, setSelectedKost] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [maxPrice, setMaxPrice] = useState(2500000);
  const [searchQuery, setSearchQuery] = useState("");
  const [kosData, setKosData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const [showMenu, setShowMenu] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = !!user;
  const userName = user?.name || "Guest";
  const token = localStorage.getItem("token");

  const initials = isLoggedIn
    ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "GU";

  /* ---------- close menu on outside click ---------- */
  useEffect(() => {
    const h = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setShowMenu(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* ---------- lock body scroll when drawer open ---------- */
  useEffect(() => {
    document.body.style.overflow = showDrawer ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showDrawer]);

  /* ---------- fetch kos ---------- */
  const fetchKos = async () => {
    setLoading(true);
    try {
      const url = `${API_URL}/api/kost/search?q=${searchQuery}&minPrice=0&maxPrice=${maxPrice}`;
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) { setKosData([]); return; }
      const json = await res.json();
      setKosData(json.data || json || []);
    } catch {
      setKosData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchKos, 300);
    return () => clearTimeout(t);
  }, [searchQuery, maxPrice]);

  /* ---------- GPS ---------- */
  const handleMyLocation = useCallback(() => {
    if (!navigator.geolocation) return alert("GPS tidak support");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      () => setLocating(false),
      () => setLocating(false)
    );
  }, []);

  const doLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth");
  };

  /* =========================================================
     CSS
  ========================================================= */
  const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;700&display=swap');

  * { box-sizing: border-box; }
  body { margin: 0; }

  .mp-root {
    font-family: 'DM Sans', sans-serif;
    color: #0F172A;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* ── NAVBAR ── */
  .mp-navbar {
    height: 72px;
    flex-shrink: 0;
    background: rgba(255,255,255,.95);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid #EAEFF5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 42px;
    z-index: 100;
  }

  .mp-navbar-logo {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -1px;
    color: #0F172A;
    cursor: pointer;
  }

  .mp-navbar-logo span { color: #2563EB; }

  .mp-navbar-links {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .mp-navbar-link {
    font-size: 14px;
    font-weight: 600;
    color: #64748B;
    cursor: pointer;
    padding: 6px 10px;
    border-radius: 8px;
    transition: .2s;
  }

  .mp-navbar-link:hover { color: #2563EB; }
  .mp-navbar-link.active { color: #2563EB; }

  .mp-navbar-divider {
    width: 1px;
    height: 22px;
    background: #E2E8F0;
    margin: 0 8px;
  }

  .mp-navbar-login {
    font-size: 14px;
    font-weight: 700;
    color: #475569;
    cursor: pointer;
    padding: 8px 14px;
    border-radius: 10px;
    transition: .15s;
  }

  .mp-navbar-login:hover { color: #0F172A; background: #F1F5F9; }

  .mp-navbar-cta {
    border: none;
    cursor: pointer;
    padding: 11px 22px;
    border-radius: 12px;
    background: linear-gradient(135deg, #2563EB, #3B82F6);
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    transition: .2s;
    font-family: 'DM Sans', sans-serif;
  }

  .mp-navbar-cta:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 25px rgba(37,99,235,.22);
  }

  /* ── AVATAR + DROPDOWN ── */
  .mp-dropdown-wrap { position: relative; }

  .mp-navbar-avatar {
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

  .mp-navbar-avatar:hover { background: #BFDBFE; transform: scale(1.05); }

  .mp-navbar-dropdown {
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

  .mp-navbar-dropdown button {
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

  .mp-navbar-dropdown button:hover { background: #F1F5F9; }
  .mp-navbar-dropdown .dd-divider { height: 1px; background: #E2E8F0; margin: 4px 0; }
  .mp-navbar-dropdown button.danger { color: #EF4444; }
  .mp-navbar-dropdown button.danger:hover { background: #FEF2F2; }

  /* ── BURGER ── */
  .mp-burger {
    display: none;
    flex-direction: column;
    gap: 5px;
    cursor: pointer;
    padding: 8px;
    border-radius: 10px;
    transition: .15s;
    border: none;
    background: none;
  }

  .mp-burger:hover { background: #F1F5F9; }

  .mp-burger span {
    display: block;
    width: 20px;
    height: 2px;
    background: #475569;
    border-radius: 2px;
  }

  /* ── DRAWER (mobile) ── */
  .mp-drawer-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.4);
    z-index: 400;
    backdrop-filter: blur(3px);
    animation: overlayIn .2s ease;
  }

  @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }

  .mp-drawer {
    position: fixed;
    top: 0; right: 0; bottom: 0;
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

  .mp-drawer.open { transform: translateX(0); }

  .mp-drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding: 0 8px;
  }

  .mp-drawer-logo {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -1px;
    color: #0F172A;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .mp-drawer-logo span { color: #2563EB; }

  .mp-drawer-close {
    width: 32px; height: 32px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #64748B;
    transition: .15s; border: none; background: none;
  }

  .mp-drawer-close:hover { background: #F1F5F9; color: #0F172A; }

  .mp-drawer-item {
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

  .mp-drawer-item:hover { background: #F1F5F9; }
  .mp-drawer-item.active { color: #2563EB; background: #EFF6FF; }
  .mp-drawer-item.primary { background: linear-gradient(135deg, #2563EB, #3B82F6); color: white; margin-top: 4px; }
  .mp-drawer-item.primary:hover { opacity: .92; }
  .mp-drawer-item.danger { color: #EF4444; }
  .mp-drawer-item.danger:hover { background: #FEF2F2; }
  .mp-drawer-divider { height: 1px; background: #E2E8F0; margin: 6px 8px; }

  /* ── MAP AREA ── */
  .mp-map-area {
    flex: 1;
    position: relative;
    background: #E2E8F0;
    overflow: hidden;
  }

  .mp-map-placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 72px;
    font-weight: 900;
    color: #CBD5E1;
    letter-spacing: -3px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    user-select: none;
  }

  /* ── SEARCH BAR (float) ── */
  .mp-search-bar {
    position: absolute;
    top: 16px;
    left: 16px;
    right: 16px;
    z-index: 50;
    display: flex;
    gap: 10px;
  }

  .mp-search-input-wrap {
    flex: 1;
    position: relative;
  }

  .mp-search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #94A3B8;
    pointer-events: none;
  }

  .mp-search-input {
    width: 100%;
    height: 46px;
    padding: 0 14px 0 42px;
    border-radius: 14px;
    background: white;
    border: 1px solid #E2E8F0;
    box-shadow: 0 4px 16px rgba(0,0,0,.08);
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    color: #0F172A;
    outline: none;
    transition: .15s;
  }

  .mp-search-input:focus { border-color: #93C5FD; }
  .mp-search-input::placeholder { color: #94A3B8; }

  .mp-filter-btn {
    width: 46px;
    height: 46px;
    background: white;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    box-shadow: 0 4px 16px rgba(0,0,0,.08);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #475569;
    transition: .15s;
    flex-shrink: 0;
  }

  .mp-filter-btn:hover { background: #EFF6FF; color: #2563EB; border-color: #BFDBFE; }
  .mp-filter-btn.active { background: #2563EB; color: white; border-color: #2563EB; }

  /* ── FILTER PANEL (float) ── */
  .mp-filter-panel {
    position: absolute;
    top: 74px;
    left: 16px;
    right: 16px;
    z-index: 50;
    background: white;
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    padding: 16px 18px;
    box-shadow: 0 8px 32px rgba(0,0,0,.10);
    animation: dropIn .15s ease;
  }

  @keyframes dropIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .mp-filter-label {
    font-size: 12px;
    font-weight: 700;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: .06em;
    margin-bottom: 10px;
  }

  .mp-filter-value {
    font-size: 15px;
    font-weight: 700;
    color: #2563EB;
    margin-bottom: 10px;
  }

  .mp-filter-range {
    width: 100%;
    accent-color: #2563EB;
  }

  /* ── LOADING OVERLAY ── */
  .mp-loading {
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 40;
  }

  /* ── KOST PIN ── */
  .mp-pin {
    position: absolute;
  }

  .mp-pin-btn {
    background: white;
    border: 1.5px solid #E2E8F0;
    border-radius: 12px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 700;
    color: #0F172A;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,.10);
    transition: .15s;
    font-family: 'DM Sans', sans-serif;
    white-space: nowrap;
  }

  .mp-pin-btn:hover { background: #EFF6FF; color: #2563EB; border-color: #BFDBFE; }
  .mp-pin-btn.selected { background: #2563EB; color: white; border-color: #2563EB; }

  /* ── SELECTED CARD ── */
  .mp-card {
    position: absolute;
    bottom: 24px;
    left: 16px;
    right: 16px;
    z-index: 50;
    background: white;
    border-radius: 20px;
    padding: 18px;
    box-shadow: 0 8px 40px rgba(0,0,0,.14);
    border: 1px solid #E2E8F0;
    animation: cardUp .2s ease;
  }

  @keyframes cardUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .mp-card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 6px;
  }

  .mp-card-name {
    font-size: 16px;
    font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #0F172A;
  }

  .mp-card-close {
    width: 28px; height: 28px;
    border-radius: 8px;
    border: 1px solid #E2E8F0;
    background: #F8FAFC;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #64748B; flex-shrink: 0;
    transition: .13s;
  }

  .mp-card-close:hover { background: #FEF2F2; color: #EF4444; border-color: #FECACA; }

  .mp-card-address {
    font-size: 13px;
    color: #64748B;
    margin-bottom: 14px;
  }

  .mp-card-detail-btn {
    width: 100%;
    height: 44px;
    background: linear-gradient(135deg, #1D4ED8, #2563EB);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: .2s;
    font-family: 'DM Sans', sans-serif;
  }

  .mp-card-detail-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(37,99,235,.25);
  }

  /* ── GPS BUTTON ── */
  .mp-gps-btn {
    position: absolute;
    right: 16px;
    bottom: ${/* if card open offset */ "96px"};
    z-index: 50;
    width: 46px;
    height: 46px;
    background: white;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    box-shadow: 0 4px 16px rgba(0,0,0,.10);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #475569;
    transition: .15s;
  }

  .mp-gps-btn:hover { background: #EFF6FF; color: #2563EB; border-color: #BFDBFE; }

  /* ── RESPONSIVE ── */
  @media(max-width: 640px) {
    .mp-navbar { height: 64px; padding: 0 16px; }
    .mp-navbar-links { display: none; }
    .mp-burger { display: flex; }
  }
  `;

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <>
      <style>{css}</style>
      <div className="mp-root">

        {/* ── NAVBAR ── */}
        <nav className="mp-navbar">
          <div className="mp-navbar-logo" onClick={() => navigate("/")}>
            Atap<span>.</span>
          </div>

          {/* Desktop links */}
          <div className="mp-navbar-links">
            {isLoggedIn ? (
              <>
                <span className="mp-navbar-link" onClick={() => navigate("/")}>Home</span>
                <span className="mp-navbar-link active" onClick={() => navigate("/map")}>Peta</span>
                <span className="mp-navbar-link" onClick={() => navigate("/chat")}>Chat</span>
                <span className="mp-navbar-link" onClick={() => navigate("/favorit")}>Favorit</span>

                <div className="mp-navbar-divider" />

                <div className="mp-dropdown-wrap" ref={menuRef}>
                  <div
                    className="mp-navbar-avatar"
                    onClick={() => setShowMenu((p) => !p)}
                    title={userName}
                  >
                    {initials}
                  </div>

                  {showMenu && (
                    <div className="mp-navbar-dropdown">
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
                <span className="mp-navbar-login" onClick={() => navigate("/auth")}>Masuk</span>
                <button className="mp-navbar-cta" onClick={() => navigate("/auth")}>Daftar Gratis</button>
              </>
            )}
          </div>

          {/* Burger mobile */}
          <button className="mp-burger" onClick={() => setShowDrawer(true)} aria-label="Buka menu">
            <span /><span /><span />
          </button>
        </nav>

        {/* ── MOBILE DRAWER ── */}
        {showDrawer && (
          <>
            <div className="mp-drawer-overlay" onClick={() => setShowDrawer(false)} />
            <div className="mp-drawer open">
              <div className="mp-drawer-header">
                <div className="mp-drawer-logo">Atap<span>.</span></div>
                <button className="mp-drawer-close" onClick={() => setShowDrawer(false)}>✕</button>
              </div>

              {isLoggedIn ? (
                <>
                  <button className="mp-drawer-item" onClick={() => { navigate("/"); setShowDrawer(false); }}>
                    <MapPin size={18} /> Home
                  </button>
                  <button className="mp-drawer-item active" onClick={() => { navigate("/map"); setShowDrawer(false); }}>
                    <Map size={18} /> Peta
                  </button>
                  <button className="mp-drawer-item" onClick={() => { navigate("/chat"); setShowDrawer(false); }}>
                    <MessageCircle size={18} /> Chat
                  </button>
                  <button className="mp-drawer-item" onClick={() => { navigate("/favorit"); setShowDrawer(false); }}>
                    <Heart size={18} /> Favorit
                  </button>
                  <div className="mp-drawer-divider" />
                  <button className="mp-drawer-item" onClick={() => { navigate("/profil"); setShowDrawer(false); }}>
                    <User size={18} /> Profil
                  </button>
                  <button className="mp-drawer-item" onClick={() => { navigate("/settings/account"); setShowDrawer(false); }}>
                    <Settings size={18} /> Pengaturan
                  </button>
                  <div className="mp-drawer-divider" />
                  <button className="mp-drawer-item danger" onClick={doLogout}>
                    <LogOut size={18} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <button className="mp-drawer-item" onClick={() => { navigate("/auth"); setShowDrawer(false); }}>
                    <User size={18} /> Masuk
                  </button>
                  <button className="mp-drawer-item primary" onClick={() => { navigate("/auth"); setShowDrawer(false); }}>
                    Daftar Gratis
                  </button>
                </>
              )}
            </div>
          </>
        )}

        {/* ── MAP AREA ── */}
        <div className="mp-map-area">

          {/* Map placeholder */}
          <div className="mp-map-placeholder">SOLO</div>

          {/* Loading */}
          {loading && (
            <div className="mp-loading">
              <Loader2 size={32} color="#2563EB" style={{ animation: "spin 1s linear infinite" }} />
            </div>
          )}

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
              className={`mp-filter-btn ${showFilter ? "active" : ""}`}
              onClick={() => setShowFilter((p) => !p)}
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>

          {/* Filter panel */}
          {showFilter && (
            <div className="mp-filter-panel">
              <p className="mp-filter-label">Harga Maksimal / Bulan</p>
              <p className="mp-filter-value">Rp {formatPriceLabel(maxPrice)}</p>
              <input
                type="range"
                min="500000"
                max="3000000"
                step="100000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="mp-filter-range"
              />
            </div>
          )}

          {/* Kost pins */}
          {kosData.map((kost) => (
            <div
              key={kost.id}
              className="mp-pin"
              style={{
                top: `${50 + (kost.lat || 0)}%`,
                left: `${50 + (kost.lng || 0)}%`,
              }}
            >
              <button
                className={`mp-pin-btn ${selectedKost?.id === kost.id ? "selected" : ""}`}
                onClick={() => setSelectedKost(kost)}
              >
                Rp {formatPriceLabel(kost.price)}
              </button>
            </div>
          ))}

          {/* Selected kost card */}
          {selectedKost && (
            <div className="mp-card">
              <div className="mp-card-header">
                <div className="mp-card-name">{selectedKost.name}</div>
                <button className="mp-card-close" onClick={() => setSelectedKost(null)}>
                  <X size={14} />
                </button>
              </div>
              <p className="mp-card-address">{selectedKost.address}</p>
              <button
                className="mp-card-detail-btn"
                onClick={() => navigate(`/detail/${selectedKost.id}`)}
              >
                Lihat Detail
              </button>
            </div>
          )}

          {/* GPS button */}
          <button
            className="mp-gps-btn"
            style={{ bottom: selectedKost ? "160px" : "24px" }}
            onClick={handleMyLocation}
          >
            {locating
              ? <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
              : <Navigation2 size={20} />
            }
          </button>
        </div>

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </>
  );
}