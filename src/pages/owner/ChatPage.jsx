import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle, Search, CheckCheck, Check,
  ChevronRight, ArrowLeft, ShieldCheck,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar, { NAV_ITEMS } from "./Sidebar";
import {
  Menu, Plus, Building2, Home, BarChart3,
  User, Settings, LogOut,
} from "lucide-react";

const API = "http://localhost:8080";
const FILTERS = ["Semua", "Belum dibaca", "Sudah dibaca"];

/* ── avatar gradient — identik dengan ChatPage user ── */
const GRADIENTS = [
  "linear-gradient(135deg,#3B82F6,#22D3EE)",
  "linear-gradient(135deg,#8B5CF6,#22D3EE)",
  "linear-gradient(135deg,#10B981,#3B82F6)",
  "linear-gradient(135deg,#F59E0B,#F97316)",
  "linear-gradient(135deg,#EC4899,#FB7185)",
];
const avatarGradient = (id) =>
  GRADIENTS[parseInt(id?.slice(-4) || "0", 16) % GRADIENTS.length];

function formatTime(date) {
  const now = new Date();
  const diffDays = Math.floor((now - date) / 86_400_000);
  if (diffDays === 0)
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Kemarin";
  if (diffDays < 7) return date.toLocaleDateString("id-ID", { weekday: "short" });
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

const BOTTOM_NAV_ITEMS = [
  { id: "home",     icon: Home,          label: "Beranda",  path: "/owner/dashboard" },
  { id: "properti", icon: Building2,     label: "Properti", path: "/owner/properti"  },
  { id: "pesan",    icon: MessageCircle, label: "Pesan",    path: "/owner/chat", badge: true },
  { id: "akun",     icon: User,          label: "Profil",   path: null               },
];

export default function OwnerChatPage() {
  const navigate     = useNavigate();
  const location     = useLocation();
  const menuRef      = useRef(null);

  const user       = JSON.parse(localStorage.getItem("user") || "null");
  const token      = localStorage.getItem("token");
  const initials   = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "OW";

  const [searchQuery,  setSearchQuery]  = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [chats,        setChats]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [activeNav,    setActiveNav]    = useState("pesan");

  /* ────────────────────────────────────────────
     Fetch GET /chats
     service: getMyThreads(user) — karena role OWNER,
     displayName = student.name (calon penyewa)
  ──────────────────────────────────────────── */
  useEffect(() => {
    if (!token) { navigate("/auth"); return; }

    (async () => {
      try {
        const res = await fetch(`${API}/chats`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/auth");
          return;
        }

        const json = await res.json();
        const raw  = Array.isArray(json.data) ? json.data : [];

        setChats(raw.map((thread) => {
          const lm = thread.lastMessage;
          return {
            id:          thread.id,
            /*
              Untuk OWNER: displayName = nama student (calon penyewa)
              sudah dihitung di service getMyThreads:
              displayName = thread.student.name
            */
            name:        thread.displayName || thread.student?.name || "Calon Penyewa",
            kost:        thread.listing?.name || "-",
            lastMessage: lm?.message || "Belum ada pesan",
            time:        lm?.sentAt ? formatTime(new Date(lm.sentAt)) : "",
            unread:      lm && !lm.readAt && lm.senderId !== user?.id ? 1 : 0,
            isRead:      lm ? !!lm.readAt : true,
          };
        }));
      } catch (err) {
        console.error("Error fetching owner chats:", err);
        setChats([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, navigate, user?.id]);

  /* close sidebar on outside click */
  useEffect(() => {
    const h = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) return;
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = chats.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.kost.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter =
      activeFilter === "Semua" ||
      (activeFilter === "Belum dibaca" && c.unread > 0) ||
      (activeFilter === "Sudah dibaca" && c.unread === 0);
    return matchSearch && matchFilter;
  });

  const totalUnread    = chats.reduce((acc, c) => acc + c.unread, 0);
  const hasChats       = chats.length > 0;
  const noSearchResult = hasChats && filtered.length === 0;

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth");
  };

  const pageTitle = NAV_ITEMS.find((n) => n.id === activeNav)?.label ?? "Pesan";

  return (
    <div className="flex min-h-screen bg-slate-50" style={{ fontFamily: "'Plus Jakarta Sans','Inter',sans-serif" }}>

      {/* Sidebar desktop */}
      <Sidebar
        active={activeNav}
        onChange={(id) => {
          setActiveNav(id);
          // navigate ke route lain kalau bukan pesan
          if (id === "home")      navigate("/owner/dashboard");
          if (id === "properti")  navigate("/owner/properti");
          if (id === "statistik") navigate("/owner/statistik");
        }}
        ownerName={user?.name || "Owner"}
        initials={initials}
        onLogout={handleLogout}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">

        {/* ── Header ── */}
        <header className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center"
            >
              <Menu size={18} className="text-slate-500" />
            </button>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">Pesan Masuk</h2>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                {totalUnread > 0 ? `${totalUnread} pesan belum dibaca` : "Semua pesan sudah dibaca"}
              </p>
            </div>
          </div>
          {/* Badge unread total */}
          {totalUnread > 0 && (
            <span className="bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full">
              {totalUnread} baru
            </span>
          )}
        </header>

        {/* ── Hero strip ── */}
        <div style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 45%, #2563EB 100%)",
          padding: "24px 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22,
              fontWeight: 800, color: "#fff", letterSpacing: -0.5, margin: 0,
            }}>
              Pesan<span style={{ color: "#93C5FD" }}>.</span>
            </h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.55)", margin: "4px 0 0" }}>
              {chats.length} percakapan aktif dari calon penyewa
            </p>
          </div>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <MessageCircle size={20} color="rgba(255,255,255,.8)" />
          </div>
        </div>

        {/* ── Content ── */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-6">
          <div style={{ maxWidth: 672, margin: "0 auto", padding: "24px 20px" }}>

            {/* Search */}
            <div style={{ position: "relative", marginBottom: 14 }}>
              <Search style={{
                position: "absolute", left: 13, top: "50%",
                transform: "translateY(-50%)", color: "#94A3B8",
              }} size={15} />
              <input
                type="text"
                placeholder="Cari nama penyewa atau nama kos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%", height: 42, paddingLeft: 40, paddingRight: 14,
                  background: "white", border: "1.5px solid #E2E8F0", borderRadius: 12,
                  fontSize: 13, outline: "none",
                  fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#0F172A",
                }}
              />
            </div>

            {/* Filter chips */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
              {FILTERS.map((f) => (
                <button key={f} onClick={() => setActiveFilter(f)} style={{
                  padding: "6px 14px", borderRadius: 999,
                  border: activeFilter === f ? "1.5px solid #2563EB" : "1.5px solid #E2E8F0",
                  background: activeFilter === f ? "linear-gradient(135deg,#1D4ED8,#2563EB)" : "white",
                  color: activeFilter === f ? "white" : "#64748B",
                  fontSize: 12, fontWeight: 700, cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                  {f}
                </button>
              ))}
            </div>

            {/* Section header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <h2 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15,
                fontWeight: 800, letterSpacing: -0.3, margin: 0,
              }}>
                Percakapan
              </h2>
              <span style={{
                background: "#EFF6FF", color: "#2563EB",
                fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
              }}>
                {chats.length} aktif
              </span>
            </div>

            {/* Loading skeletons */}
            {loading && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: 14, background: "white", borderRadius: 14,
                    border: "1px solid #F1F5F9",
                  }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "#F1F5F9", flexShrink: 0 }} />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
                      <div style={{ height: 11, background: "#F1F5F9", borderRadius: 999, width: "45%" }} />
                      <div style={{ height: 9,  background: "#F1F5F9", borderRadius: 999, width: "30%" }} />
                      <div style={{ height: 9,  background: "#F1F5F9", borderRadius: 999, width: "70%" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && !hasChats && (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", marginTop: 56, gap: 10,
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 18,
                  background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <MessageCircle size={24} color="#CBD5E1" />
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#475569", margin: 0 }}>
                  Belum ada pesan masuk
                </p>
                <p style={{
                  fontSize: 12, color: "#94A3B8", textAlign: "center",
                  maxWidth: 220, lineHeight: 1.6, margin: 0,
                }}>
                  Pesan dari calon penyewa akan muncul di sini
                </p>
              </div>
            )}

            {/* No search result */}
            {!loading && noSearchResult && (
              <p style={{ textAlign: "center", color: "#94A3B8", marginTop: 36, fontSize: 13 }}>
                Tidak ditemukan untuk "{searchQuery}"
              </p>
            )}

            {/* Chat list */}
            {!loading && hasChats && !noSearchResult && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filtered.map((chat) => (
                  <button
                    key={chat.id}
                    /*
                      Navigate ke ChatDetailPage yang shared — /chat/:id
                      ChatDetailPage sudah handle logika isOwner di dalamnya
                    */
                    onClick={() => navigate(`/chat/${chat.id}`)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 12,
                      padding: "14px 16px", background: "white", borderRadius: 14,
                      border: chat.unread > 0 ? "1.5px solid #BFDBFE" : "1px solid #F1F5F9",
                      cursor: "pointer", textAlign: "left", transition: ".15s",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#F8FAFC";
                      e.currentTarget.style.borderColor = "#BFDBFE";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "white";
                      e.currentTarget.style.borderColor = chat.unread > 0 ? "#BFDBFE" : "#F1F5F9";
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white", fontWeight: 800, fontSize: 15,
                      background: avatarGradient(chat.id),
                    }}>
                      {chat.name?.[0]?.toUpperCase() || "?"}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <span style={{
                          fontSize: 13, fontWeight: chat.unread > 0 ? 800 : 700,
                          color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {chat.name}
                        </span>
                        <span style={{ fontSize: 10, color: "#94A3B8", flexShrink: 0, marginLeft: 8 }}>
                          {chat.time}
                        </span>
                      </div>
                      {/* Nama kost — info tambahan untuk owner */}
                      <p style={{
                        fontSize: 11, color: "#3B82F6", fontWeight: 600,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: "2px 0",
                      }}>
                        {chat.kost}
                      </p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p style={{
                          fontSize: 11, color: "#94A3B8",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          flex: 1, margin: 0,
                        }}>
                          {chat.lastMessage}
                        </p>
                        <div style={{ flexShrink: 0, marginLeft: 8 }}>
                          {chat.unread > 0 ? (
                            <span style={{
                              background: "#2563EB", color: "white",
                              fontSize: 10, width: 18, height: 18,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              borderRadius: "50%", fontWeight: 800,
                            }}>
                              {chat.unread}
                            </span>
                          ) : chat.isRead ? (
                            <CheckCheck size={14} color="#60A5FA" />
                          ) : (
                            <Check size={14} color="#CBD5E1" />
                          )}
                        </div>
                      </div>
                    </div>

                    <ChevronRight size={13} color="#CBD5E1" style={{ flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            )}

            {/* Safety note */}
            <div style={{
              marginTop: 28, padding: 18,
              background: "#0F172A", borderRadius: 18,
              display: "flex", gap: 10, alignItems: "flex-start",
            }}>
              <ShieldCheck size={18} color="#34D399" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <h4 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13,
                  fontWeight: 700, color: "white", margin: 0,
                }}>
                  Transaksi aman lewat Atap
                </h4>
                <p style={{ fontSize: 11, color: "#64748B", margin: "3px 0 0" }}>
                  Gunakan fitur <span style={{ color: "#60A5FA" }}>Bayar di Atap</span> — hindari transaksi di luar platform
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 flex md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {BOTTOM_NAV_ITEMS.map(({ id, icon: Icon, label, path, badge }) => {
          const isActive = id === "pesan"; // selalu active di halaman ini
          return (
            <button
              key={id}
              onClick={() => path && navigate(path)}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 relative active:scale-95 transition-transform"
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-600 rounded-full" />
              )}
              <div className="relative">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8}
                  className={isActive ? "text-indigo-600" : "text-slate-400"} />
                {badge && totalUnread > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                )}
              </div>
              <span className={`text-[10px] font-bold ${isActive ? "text-indigo-600" : "text-slate-400"}`}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>

    </div>
  );
} 