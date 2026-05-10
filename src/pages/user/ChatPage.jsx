import React, { useState, useEffect } from "react";
import {
  MessageCircle,
  Search,
  CheckCheck,
  Check,
  ShieldCheck,
  ChevronRight,
  Home,
  Map,
  Heart,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const API = "http://localhost:8080";
const FILTERS = ["Semua", "Belum dibaca", "Sudah dibaca"];

const css = `
  .chat-burger {
    display: none;
    flex-direction: column;
    gap: 5px;
    cursor: pointer;
    padding: 8px;
    border-radius: 10px;
    border: none;
    background: none;
  }

  .chat-burger:hover { background: #F1F5F9; }

  .chat-burger span {
    display: block;
    width: 20px;
    height: 2px;
    background: #475569;
    border-radius: 2px;
  }

  @media(max-width: 640px) {
    .chat-navbar { height: 64px !important; padding: 0 16px !important; }
    .chat-navbar-links { display: none !important; }
    .chat-burger { display: flex !important; }
    .chat-hero { padding: 24px 20px !important; }
    .chat-content { padding: 20px 16px 40px !important; }
  }
`;

export default function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [chatSessions, setChatSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const { kostName, ownerName } = location.state || {};

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const initials = user?.name
    ?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "GU";

  useEffect(() => {
    document.body.style.overflow = showDrawer ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showDrawer]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login"); return; }

        const res = await fetch(`${API}/chats`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        const json = await res.json();
        const raw = Array.isArray(json.data) ? json.data : [];

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

        setChatSessions(chats);
      } catch (err) {
        console.error("Error fetching chats:", err);
        setChatSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [navigate]);

  function formatTime(date) {
    const now = new Date();
    const diffDays = Math.floor((now - date) / 86_400_000);
    if (diffDays === 0)
      return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return "Kemarin";
    if (diffDays < 7)
      return date.toLocaleDateString("id-ID", { weekday: "short" });
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

  const hasChats = chatSessions.length > 0;
  const noSearchResult = hasChats && filtered.length === 0;

  const GRADIENTS = [
    "from-blue-500 to-cyan-400",
    "from-violet-500 to-cyan-400",
    "from-emerald-500 to-blue-500",
    "from-amber-500 to-orange-500",
    "from-pink-500 to-rose-400",
  ];
  const avatarGradient = (id) =>
    GRADIENTS[parseInt(id?.slice(-4) || "0", 16) % GRADIENTS.length];

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
          className="chat-navbar sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100"
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
          <div className="chat-navbar-links"
               style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {NAV_ITEMS.map(({ label, path }) => (
              <span
                key={label}
                onClick={() => navigate(path)}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14, fontWeight: 600,
                  padding: "6px 10px", borderRadius: 8, cursor: "pointer",
                  color: path === "/chat" ? "#2563EB" : "#64748B",
                }}
              >
                {label}
              </span>
            ))}

            <div style={{ width: 1, height: 22, background: "#E2E8F0", margin: "0 8px" }} />

            {/* Avatar + dropdown */}
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
            className="chat-burger"
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
                    background: path === "/chat" ? "#EFF6FF" : "none",
                    color: path === "/chat" ? "#2563EB" : "#334155",
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
          className="chat-hero"
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
              Pesan<span style={{ color: "#93C5FD" }}>.</span>
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.6)", marginTop: 4, margin: "4px 0 0" }}>
              {chatSessions.length} percakapan aktif
            </p>
          </div>
          <div style={{ width: 52, height: 52, borderRadius: 16,
                        background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.18)",
                        display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MessageCircle size={24} color="rgba(255,255,255,.8)" />
          </div>
        </div>

        {/* CONTENT */}
        <div
          className="chat-content"
          style={{ maxWidth: 672, margin: "0 auto", padding: "28px 28px 40px" }}
        >
          {/* Search */}
          <div style={{ position: "relative", marginBottom: 16 }}>
            <Search style={{ position: "absolute", left: 14, top: "50%",
                             transform: "translateY(-50%)", color: "#94A3B8" }} size={16} />
            <input
              type="text"
              placeholder="Cari pemilik atau nama kos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%", height: 44, paddingLeft: 42, paddingRight: 16,
                background: "white", border: "1.5px solid #E2E8F0",
                borderRadius: 14, fontSize: 14, outline: "none",
                fontFamily: "'DM Sans', sans-serif", color: "#0F172A",
              }}
            />
          </div>

          {/* Filter chips */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  padding: "7px 16px", borderRadius: 999,
                  border: activeFilter === f ? "1.5px solid #2563EB" : "1.5px solid #E2E8F0",
                  background: activeFilter === f
                    ? "linear-gradient(135deg, #1D4ED8, #2563EB)" : "white",
                  color: activeFilter === f ? "white" : "#64748B",
                  fontSize: 12, fontWeight: 700, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Section header */}
          <div style={{ display: "flex", alignItems: "center",
                        justifyContent: "space-between", marginBottom: 12 }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif",
                         fontSize: 17, fontWeight: 800, letterSpacing: -0.5, margin: 0 }}>
              Percakapan
            </h2>
            <span style={{ background: "#EFF6FF", color: "#2563EB",
                           fontSize: 12, fontWeight: 700, padding: "4px 12px",
                           borderRadius: 999 }}>
              {chatSessions.length} aktif
            </span>
          </div>

          {/* New-chat banner */}
          {kostName && (
            <div style={{ marginBottom: 16, padding: 16, background: "#EFF6FF",
                          borderRadius: 16, display: "flex", gap: 12,
                          border: "1px solid #BFDBFE" }}>
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
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12,
                                      padding: 16, background: "white", borderRadius: 16,
                                      border: "1px solid #F1F5F9" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14,
                                background: "#F1F5F9", flexShrink: 0 }} />
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
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
                          justifyContent: "center", marginTop: 64, gap: 12 }}>
              <div style={{ width: 64, height: 64, borderRadius: 20,
                            background: "#F1F5F9", display: "flex",
                            alignItems: "center", justifyContent: "center" }}>
                <MessageCircle size={28} color="#CBD5E1" />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#475569", margin: 0 }}>
                Belum ada percakapan
              </p>
              <p style={{ fontSize: 13, color: "#94A3B8", textAlign: "center",
                          maxWidth: 220, lineHeight: 1.6, margin: 0 }}>
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
                <button
                  key={chat.id}
                  onClick={() => navigate(`/chat/${chat.id}`)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12,
                    padding: 16, background: "white", borderRadius: 16,
                    border: "1px solid #F1F5F9", cursor: "pointer",
                    textAlign: "left", transition: ".15s",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#F8FAFC";
                    e.currentTarget.style.borderColor = "#BFDBFE";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "white";
                    e.currentTarget.style.borderColor = "#F1F5F9";
                  }}
                >
                  <div
                    className={`bg-gradient-to-br ${avatarGradient(chat.id)}`}
                    style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                             display: "flex", alignItems: "center", justifyContent: "center",
                             color: "white", fontWeight: 800, fontSize: 16 }}
                  >
                    {chat.name?.[0]?.toUpperCase() || "?"}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between",
                                  alignItems: "flex-start" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A",
                                     overflow: "hidden", textOverflow: "ellipsis",
                                     whiteSpace: "nowrap" }}>
                        {chat.name}
                      </span>
                      <span style={{ fontSize: 11, color: "#94A3B8", flexShrink: 0, marginLeft: 8 }}>
                        {chat.time}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: "#3B82F6", fontWeight: 600,
                                overflow: "hidden", textOverflow: "ellipsis",
                                whiteSpace: "nowrap", margin: "2px 0" }}>
                      {chat.kost}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ fontSize: 12, color: "#94A3B8", overflow: "hidden",
                                  textOverflow: "ellipsis", whiteSpace: "nowrap",
                                  flex: 1, margin: 0 }}>
                        {chat.lastMessage}
                      </p>
                      <div style={{ flexShrink: 0, marginLeft: 8 }}>
                        {chat.unread > 0 ? (
                          <span style={{ background: "#2563EB", color: "white",
                                         fontSize: 11, width: 20, height: 20,
                                         display: "flex", alignItems: "center",
                                         justifyContent: "center", borderRadius: "50%",
                                         fontWeight: 700 }}>
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
          <div style={{ marginTop: 32, padding: 20, background: "#0F172A",
                        borderRadius: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <ShieldCheck size={20} color="#34D399" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif",
                           fontSize: 14, fontWeight: 700, color: "white", margin: 0 }}>
                Bertransaksi aman
              </h4>
              <p style={{ fontSize: 12, color: "#64748B", margin: "4px 0 0" }}>
                Gunakan fitur{" "}
                <span style={{ color: "#60A5FA" }}>Bayar di Atap</span>{" "}
                untuk keamanan transaksimu
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}