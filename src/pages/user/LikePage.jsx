import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Heart, AlertCircle, RefreshCw,
  Home, Map, MessageCircle, User, Settings, LogOut, Search,
} from "lucide-react";
import KostCard from "../../components/kost/KostCard";

const BASE_URL = "http://localhost:3000";

const NAV_ITEMS = [
  { label: "Home", path: "/", icon: Home },
  { label: "Search", path: "/search", icon: Search },
  { label: "Peta", path: "/map", icon: Map },
  { label: "Favorit", path: "/favorit", icon: Heart },
  { label: "Profil", path: "/profil", icon: User },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;700&display=swap');

  /* ── NAVBAR ── */
  .fav-navbar {
    position: sticky; top: 0; z-index: 100;
    height: 72px;
    background: rgba(255,255,255,.88);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid #EAEFF5;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 42px;
  }
  .fav-navbar-logo {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 25px; font-weight: 800; letter-spacing: -1px;
    color: #0F172A; cursor: pointer;
  }
  .fav-navbar-logo span { color: #2563EB; }

  .fav-navbar-links { display: flex; align-items: center; gap: 4px; }
  .fav-navbar-link {
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
    color: #64748B; cursor: pointer; padding: 6px 10px; border-radius: 8px; transition: .2s;
  }
  .fav-navbar-link:hover { color: #2563EB; background: #F1F5F9; }
  .fav-navbar-link.active { color: #2563EB; }
  .fav-navbar-divider { width: 1px; height: 22px; background: #E2E8F0; margin: 0 8px; }

  /* ── AVATAR + DROPDOWN ── */
  .fav-dropdown-wrap { position: relative; }
  .fav-navbar-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: #DBEAFE; color: #1D4ED8;
    font-size: 12px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; border: 2px solid #BFDBFE; transition: .2s; margin-left: 4px;
    font-family: 'DM Sans', sans-serif;
  }
  .fav-navbar-avatar:hover { background: #BFDBFE; transform: scale(1.05); }
  .fav-navbar-dropdown {
    position: absolute; top: calc(100% + 10px); right: 0;
    background: white; border: 1px solid #E2E8F0; border-radius: 16px;
    padding: 8px; min-width: 170px;
    box-shadow: 0 8px 32px rgba(0,0,0,.10);
    display: flex; flex-direction: column; gap: 2px;
    z-index: 200; animation: ddFadeIn .15s ease;
  }
  @keyframes ddFadeIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fav-navbar-dropdown button {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 13px; border: none; background: none;
    border-radius: 10px; font-size: 13px; font-weight: 600;
    color: #334155; cursor: pointer; width: 100%; text-align: left; transition: .13s;
    font-family: 'DM Sans', sans-serif;
  }
  .fav-navbar-dropdown button:hover { background: #F1F5F9; }
  .fav-navbar-dropdown .dd-divider { height: 1px; background: #E2E8F0; margin: 4px 0; }
  .fav-navbar-dropdown button.danger { color: #EF4444; }
  .fav-navbar-dropdown button.danger:hover { background: #FEF2F2; }

  /* ── BURGER ── */
  .fav-burger {
    display: none; flex-direction: column; gap: 5px;
    cursor: pointer; padding: 8px; border-radius: 10px; border: none; background: none; transition: .15s;
  }
  .fav-burger:hover { background: #F1F5F9; }
  .fav-burger span { display: block; width: 20px; height: 2px; background: #475569; border-radius: 2px; }

  /* ── DRAWER (mobile) ── */
  .fav-drawer-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 400;
    backdrop-filter: blur(3px); animation: overlayIn .2s ease;
  }
  @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
  .fav-drawer {
    position: fixed; top: 0; right: 0; bottom: 0; width: 280px;
    background: white; z-index: 401; padding: 28px 16px 24px;
    display: flex; flex-direction: column; gap: 4px;
    box-shadow: -4px 0 32px rgba(0,0,0,.12);
    transform: translateX(100%); transition: transform .28s cubic-bezier(.4,0,.2,1);
  }
  .fav-drawer.open { transform: translateX(0); }
  .fav-drawer-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px; padding: 0 8px;
  }
  .fav-drawer-logo {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 22px; font-weight: 800; letter-spacing: -1px; color: #0F172A;
  }
  .fav-drawer-logo span { color: #2563EB; }
  .fav-drawer-close {
    width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center;
    justify-content: center; cursor: pointer; color: #64748B; border: none; background: none; transition: .15s;
  }
  .fav-drawer-close:hover { background: #F1F5F9; color: #0F172A; }
  .fav-drawer-item {
    display: flex; align-items: center; gap: 12px; padding: 13px 16px; border-radius: 12px;
    font-size: 14px; font-weight: 600; color: #334155; cursor: pointer; border: none; background: none;
    width: 100%; text-align: left; font-family: 'DM Sans', sans-serif; transition: .13s;
  }
  .fav-drawer-item:hover { background: #F1F5F9; }
  .fav-drawer-item.active { color: #2563EB; background: #EFF6FF; }
  .fav-drawer-item.danger { color: #EF4444; }
  .fav-drawer-item.danger:hover { background: #FEF2F2; }
  .fav-drawer-divider { height: 1px; background: #E2E8F0; margin: 6px 8px; }

  /* ── HERO ── */
  .fav-hero {
    background: linear-gradient(135deg, #0F172A 0%, #1E3A8A 45%, #2563EB 100%);
    padding: 32px 42px;
    display: flex; align-items: center; justify-content: space-between;
  }

  /* ── CONTENT ── */
  .fav-content { max-width: 900px; margin: 0 auto; padding: 28px 28px 40px; }
  .fav-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }

  /* ── BOTTOM NAV (hidden by default, shows on mobile) ── */
  .fav-bottom-nav { display: none; }

  /* ── RESPONSIVE ── */
  @media(max-width: 900px) { .fav-grid { grid-template-columns: repeat(2, 1fr); } }

  @media(max-width: 768px) {
    .fav-navbar-links { display: none; }
    .fav-burger { display: flex; }
  }

  @media(max-width: 640px) {
    .fav-navbar { height: 64px; padding: 0 16px; }
    .fav-hero { padding: 24px 20px; }
    .fav-content { padding: 20px 16px 96px; }
    .fav-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }

    /* ── BOTTOM NAV ── */
    .fav-bottom-nav {
      display: flex;
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 300;
      background: rgba(255,255,255,.97);
      backdrop-filter: blur(20px);
      border-top: 1px solid #E2E8F0;
      padding: 6px 0 calc(6px + env(safe-area-inset-bottom));
      justify-content: space-around; align-items: center;
      box-shadow: 0 -4px 20px rgba(0,0,0,.07);
    }
    .fav-bn-item {
      display: flex; flex-direction: column; align-items: center; gap: 3px;
      padding: 6px 10px; border: none; background: none; border-radius: 12px;
      cursor: pointer; color: #94A3B8; transition: color .15s;
      min-width: 52px; font-family: 'DM Sans', sans-serif;
    }
    .fav-bn-item.active { color: #2563EB; }
    .fav-bn-item span { font-size: 10px; font-weight: 700; letter-spacing: .1px; }
    .fav-bn-item.active::after {
      content: ''; display: block;
      width: 4px; height: 4px;
      background: #2563EB; border-radius: 50%; margin-top: 1px;
    }
    .fav-bn-avatar {
      width: 24px; height: 24px; border-radius: 50%;
      background: #DBEAFE; color: #1D4ED8;
      font-size: 8px; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid #BFDBFE; font-family: 'DM Sans', sans-serif;
    }
    .fav-bn-item.active .fav-bn-avatar { background: #BFDBFE; border-color: #2563EB; }
  }
`;

export default function LikePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const currentPath = location.pathname;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const initials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "GU";

  /* close dropdown on outside click */
  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* lock body scroll when drawer open */
  useEffect(() => {
    document.body.style.overflow = showDrawer ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showDrawer]);

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

  const closeDrawer = () => setShowDrawer(false);

  return (
    <>
      <style>{css}</style>
      <div className="min-h-screen bg-[#F8FAFC] pb-16">

        {/* ── NAVBAR ── */}
        <nav className="fav-navbar">
          <div className="fav-navbar-logo" onClick={() => navigate("/")}>Atap<span>.</span></div>

          {/* Desktop links */}
          <div className="fav-navbar-links">
            {NAV_ITEMS.filter(n => ["Home", "Search", "Peta", "Favorit"].includes(n.label)).map(({ label, path }) => (
              <span
                key={label}
                className={`fav-navbar-link${currentPath === path ? " active" : ""}`}
                onClick={() => navigate(path)}
              >
                {label}
              </span>
            ))}
            <div className="fav-navbar-divider" />
            <div className="fav-dropdown-wrap" ref={menuRef}>
              <div className="fav-navbar-avatar" onClick={() => setShowMenu((p) => !p)} title={user?.name || "Guest"}>
                {initials}
              </div>
              {showMenu && (
                <div className="fav-navbar-dropdown">
                  {[{ label: "Profil", path: "/profil", icon: <User size={14} /> }, { label: "Pengaturan", path: "/settings/account", icon: <Settings size={14} /> }].map(({ label, path, icon }) => (
                    <button key={label} onClick={() => { navigate(path); setShowMenu(false); }}>{icon} {label}</button>
                  ))}
                  <div className="dd-divider" />
                  <button className="danger" onClick={doLogout}><LogOut size={14} /> Logout</button>
                </div>
              )}
            </div>
          </div>

          {/* Burger (mobile) */}
          <button className="fav-burger" onClick={() => setShowDrawer(true)} aria-label="Buka menu">
            <span /><span /><span />
          </button>
        </nav>

        {/* ── MOBILE DRAWER ── */}
        {showDrawer && (
          <>
            <div className="fav-drawer-overlay" onClick={closeDrawer} />
            <div className="fav-drawer open">
              <div className="fav-drawer-header">
                <div className="fav-drawer-logo">Atap<span>.</span></div>
                <button className="fav-drawer-close" onClick={closeDrawer}>✕</button>
              </div>
              {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
                <button
                  key={label}
                  className={`fav-drawer-item${currentPath === path ? " active" : ""}`}
                  onClick={() => { navigate(path); closeDrawer(); }}
                >
                  <Icon size={18} /> {label}
                </button>
              ))}
              <div className="fav-drawer-divider" />
              <button className="fav-drawer-item" onClick={() => { navigate("/settings/account"); closeDrawer(); }}>
                <Settings size={18} /> Pengaturan
              </button>
              <div className="fav-drawer-divider" />
              <button className="fav-drawer-item danger" onClick={doLogout}><LogOut size={18} /> Logout</button>
            </div>
          </>
        )}

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
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
            const isActive = currentPath === path;
            const isProfil = path === "/profil";
            return (
              <button
                key={path}
                className={`fav-bn-item${isActive ? " active" : ""}`}
                onClick={() => navigate(path)}
              >
                {isProfil && user ? (
                  <div className="fav-bn-avatar">{initials}</div>
                ) : (
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                )}
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

      </div>
    </>
  );
}