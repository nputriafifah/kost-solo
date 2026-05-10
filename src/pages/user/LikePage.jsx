import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart, AlertCircle, RefreshCw,
  Home, Map, MessageCircle, User, Settings, LogOut,
} from "lucide-react";
import KostCard from "../../components/kost/KostCard";

const BASE_URL = "http://localhost:3000";

const css = `
  .fav-burger {
    display: none;
    flex-direction: column;
    gap: 5px;
    cursor: pointer;
    padding: 8px;
    border-radius: 10px;
    border: none;
    background: none;
  }

  .fav-burger:hover { background: #F1F5F9; }

  .fav-burger span {
    display: block;
    width: 20px;
    height: 2px;
    background: #475569;
    border-radius: 2px;
  }

  @media(max-width: 640px) {
    .fav-navbar { height: 64px !important; padding: 0 16px !important; }
    .fav-navbar-links { display: none !important; }
    .fav-burger { display: flex !important; }
    .fav-hero { padding: 24px 20px !important; }
    .fav-content { padding: 20px 16px 40px !important; }
    .fav-grid { grid-template-columns: repeat(2, 1fr) !important; }
  }
`;

export default function LikePage() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const initials = user?.name
    ?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "GU";

  useEffect(() => {
    document.body.style.overflow = showDrawer ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showDrawer]);

  const fetchFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal fetch favorites");
      const json = await res.json();
      const mapped = (json.data || []).map((item) => ({
        id: String(item.id),
        name: item.name,
        price: item.cheapestPrice ?? null,
        location: item.address ?? "",
        gender: item.genderType ?? "",
        image: item.thumbnailUrl
          ? item.thumbnailUrl.startsWith("http")
            ? item.thumbnailUrl
            : `${BASE_URL}${item.thumbnailUrl}`
          : null,
      }));
      setData(mapped);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat favorit");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFavorites(); }, []);

  const handleRemove = async (id, e) => {
    e.stopPropagation();
    try {
      await fetch(`${BASE_URL}/favorites/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setData((prev) => prev.filter((item) => item.id !== String(id)));
    } catch (err) {
      console.error(err);
    }
  };

  const doLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth");
  };

  const NAV_ITEMS = [
    { label: "Home",    path: "/",        icon: <Home size={18} /> },
    { label: "Peta",    path: "/map",     icon: <Map size={18} /> },
    { label: "Chat",    path: "/chat",    icon: <MessageCircle size={18} /> },
    { label: "Favorit", path: "/favorit", icon: <Heart size={18} /> },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="min-h-screen bg-[#F8FAFC] pb-16">

        {/* NAVBAR */}
        <nav
          className="fav-navbar sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100"
          style={{ height: 72, display: "flex", alignItems: "center",
                   justifyContent: "space-between", padding: "0 42px" }}
        >
          <div
            onClick={() => navigate("/")}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif",
                     fontSize: 25, fontWeight: 800, letterSpacing: -1, cursor: "pointer" }}
          >
            Atap<span style={{ color: "#2563EB" }}>.</span>
          </div>

          {/* Desktop links */}
          <div className="fav-navbar-links"
               style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {NAV_ITEMS.map(({ label, path }) => (
              <span
                key={label}
                onClick={() => navigate(path)}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14, fontWeight: 600,
                  padding: "6px 10px", borderRadius: 8, cursor: "pointer",
                  color: path === "/favorit" ? "#2563EB" : "#64748B",
                }}
              >
                {label}
              </span>
            ))}

            <div style={{ width: 1, height: 22, background: "#E2E8F0", margin: "0 8px" }} />

            <div style={{ position: "relative" }}>
              <div
                onClick={() => setShowMenu((p) => !p)}
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "#DBEAFE", color: "#1D4ED8",
                  fontSize: 12, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", border: "2px solid #BFDBFE",
                }}
              >
                {initials}
              </div>

              {showMenu && (
                <div style={{
                  position: "absolute", top: "calc(100% + 10px)", right: 0,
                  background: "white", border: "1px solid #E2E8F0",
                  borderRadius: 16, padding: 8, minWidth: 170,
                  boxShadow: "0 8px 32px rgba(0,0,0,.10)",
                  display: "flex", flexDirection: "column", gap: 2, zIndex: 200,
                }}>
                  {[
                    { label: "Profil",     path: "/profil",           icon: <User size={14} /> },
                    { label: "Pengaturan", path: "/settings/account", icon: <Settings size={14} /> },
                  ].map(({ label, path, icon }) => (
                    <button key={label}
                      onClick={() => { navigate(path); setShowMenu(false); }}
                      style={{ display: "flex", alignItems: "center", gap: 10,
                               padding: "10px 13px", border: "none", background: "none",
                               borderRadius: 10, fontSize: 13, fontWeight: 600,
                               color: "#334155", cursor: "pointer", width: "100%",
                               textAlign: "left", fontFamily: "'DM Sans', sans-serif" }}>
                      {icon} {label}
                    </button>
                  ))}
                  <div style={{ height: 1, background: "#E2E8F0", margin: "4px 0" }} />
                  <button onClick={doLogout}
                    style={{ display: "flex", alignItems: "center", gap: 10,
                             padding: "10px 13px", border: "none", background: "none",
                             borderRadius: 10, fontSize: 13, fontWeight: 600,
                             color: "#EF4444", cursor: "pointer", width: "100%",
                             textAlign: "left", fontFamily: "'DM Sans', sans-serif" }}>
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Burger mobile */}
          <button
            className="fav-burger"
            onClick={() => setShowDrawer(true)}
            aria-label="Buka menu"
          >
            <span /><span /><span />
          </button>
        </nav>

        {/* MOBILE DRAWER */}
        {showDrawer && (
          <>
            <div
              onClick={() => setShowDrawer(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)",
                       zIndex: 400, backdropFilter: "blur(3px)" }}
            />
            <div style={{
              position: "fixed", top: 0, right: 0, bottom: 0, width: 280,
              background: "white", zIndex: 401, padding: "28px 16px 24px",
              display: "flex", flexDirection: "column", gap: 4,
              boxShadow: "-4px 0 32px rgba(0,0,0,.12)",
            }}>
              <div style={{ display: "flex", alignItems: "center",
                            justifyContent: "space-between", marginBottom: 20, padding: "0 8px" }}>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif",
                              fontSize: 22, fontWeight: 800, letterSpacing: -1 }}>
                  Atap<span style={{ color: "#2563EB" }}>.</span>
                </div>
                <button onClick={() => setShowDrawer(false)}
                  style={{ width: 32, height: 32, borderRadius: 8, border: "none",
                           background: "none", cursor: "pointer", color: "#64748B",
                           display: "flex", alignItems: "center", justifyContent: "center" }}>
                  ✕
                </button>
              </div>

              {NAV_ITEMS.map(({ label, path, icon }) => (
                <button key={label}
                  onClick={() => { navigate(path); setShowDrawer(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "13px 16px", borderRadius: 12,
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                    border: "none", width: "100%", textAlign: "left",
                    fontFamily: "'DM Sans', sans-serif",
                    background: path === "/favorit" ? "#EFF6FF" : "none",
                    color: path === "/favorit" ? "#2563EB" : "#334155",
                  }}>
                  {icon} {label}
                </button>
              ))}

              <div style={{ height: 1, background: "#E2E8F0", margin: "6px 8px" }} />

              <button onClick={() => { navigate("/profil"); setShowDrawer(false); }}
                style={{ display: "flex", alignItems: "center", gap: 12,
                         padding: "13px 16px", borderRadius: 12, fontSize: 14,
                         fontWeight: 600, cursor: "pointer", border: "none",
                         width: "100%", textAlign: "left", background: "none",
                         color: "#334155", fontFamily: "'DM Sans', sans-serif" }}>
                <User size={18} /> Profil
              </button>

              <button onClick={() => { navigate("/settings/account"); setShowDrawer(false); }}
                style={{ display: "flex", alignItems: "center", gap: 12,
                         padding: "13px 16px", borderRadius: 12, fontSize: 14,
                         fontWeight: 600, cursor: "pointer", border: "none",
                         width: "100%", textAlign: "left", background: "none",
                         color: "#334155", fontFamily: "'DM Sans', sans-serif" }}>
                <Settings size={18} /> Pengaturan
              </button>

              <div style={{ height: 1, background: "#E2E8F0", margin: "6px 8px" }} />

              <button onClick={doLogout}
                style={{ display: "flex", alignItems: "center", gap: 12,
                         padding: "13px 16px", borderRadius: 12, fontSize: 14,
                         fontWeight: 600, cursor: "pointer", border: "none",
                         width: "100%", textAlign: "left", background: "none",
                         color: "#EF4444", fontFamily: "'DM Sans', sans-serif" }}>
                <LogOut size={18} /> Logout
              </button>
            </div>
          </>
        )}

        {/* HERO STRIP */}
        <div
          className="fav-hero"
          style={{
            background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 45%, #2563EB 100%)",
            padding: "32px 42px", display: "flex", alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif",
                         fontSize: 26, fontWeight: 800, color: "#fff",
                         letterSpacing: -0.8, margin: 0 }}>
              Favorit<span style={{ color: "#93C5FD" }}>.</span>
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.6)", margin: "4px 0 0" }}>
              {!loading && !error ? `${data.length} kost tersimpan` : "Kost favorit kamu"}
            </p>
          </div>
          <div style={{ width: 52, height: 52, borderRadius: 16,
                        background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.18)",
                        display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Heart size={24} color="rgba(255,255,255,.8)" />
          </div>
        </div>

        {/* CONTENT */}
        <div
          className="fav-content"
          style={{ maxWidth: 900, margin: "0 auto", padding: "28px 28px 40px" }}
        >

          {/* Loading */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ height: 180, borderRadius: 18,
                                      background: "white", border: "1px solid #F1F5F9" }} />
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
                          padding: "64px 0", gap: 12, textAlign: "center" }}>
              <AlertCircle size={26} color="#F87171" />
              <p style={{ fontSize: 14, color: "#475569", margin: 0 }}>{error}</p>
              <button
                onClick={fetchFavorites}
                style={{ display: "flex", alignItems: "center", gap: 8,
                         background: "#2563EB", color: "white", border: "none",
                         padding: "10px 18px", borderRadius: 12, fontSize: 13,
                         fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
              >
                <RefreshCw size={14} /> Coba lagi
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && data.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
                          justifyContent: "center", marginTop: 64, gap: 12, textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: 20,
                            background: "#FFF1F2", display: "flex",
                            alignItems: "center", justifyContent: "center" }}>
                <Heart size={28} color="#FDA4AF" />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#475569", margin: 0 }}>
                Belum ada favorit
              </p>
              <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>
                Simpan kost yang kamu suka dari halaman pencarian
              </p>
              <button
                onClick={() => navigate("/")}
                style={{ marginTop: 4, background: "#0F172A", color: "white",
                         border: "none", padding: "10px 24px", borderRadius: 12,
                         fontSize: 13, fontWeight: 700, cursor: "pointer",
                         fontFamily: "'DM Sans', sans-serif" }}
              >
                Cari kost
              </button>
            </div>
          )}

          {/* Grid */}
          {!loading && !error && data.length > 0 && (
            <div
              className="fav-grid"
              style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}
            >
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
      </div>
    </>
  );
}