import {
  Home, Building2, TrendingUp, User,
  ChevronRight, X, LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Sidebar.jsx
export const NAV_ITEMS = [
  { id: "home",      icon: Home,          label: "Beranda",           sub: "Ringkasan & aktivitas", path: "/owner/dashboard" },
  { id: "properti",  icon: Building2,     label: "Properti Saya",     sub: "Kelola listing kos",    path: "/owner/properti"  },
  { id: "statistik", icon: TrendingUp,    label: "Laporan Statistik", sub: "Performa & tayangan",   path: "/owner/statistik" },
  { id: "akun",      icon: User,          label: "Akun",              sub: "Profil & pengaturan",   path: "/owner/profil"    },
];

export default function Sidebar({ active, onChange, ownerName, initials, onLogout, open, onClose, unreadCount = 0 }) {
  const navigate = useNavigate();

  const handleNavClick = (item) => {
    if (item.path) {
      navigate(item.path);
    } else {
      onChange(item.id);
    }
    onClose();
  };

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="lg:hidden"
          style={{
            position: "fixed", inset: 0, zIndex: 40,
            background: "rgba(15,23,42,0.5)",
            backdropFilter: "blur(4px)",
          }}
        />
      )}

      <aside
        className={`${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static`}
        style={{
          position: "fixed", top: 0, left: 0, height: "100%", zIndex: 50,
          width: 255,
          display: "flex", flexDirection: "column",
          background: "linear-gradient(160deg, #1E1B4B 0%, #1A2744 55%, #1E1B4B 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          fontFamily: "'Outfit','Inter',sans-serif",
          transition: "transform 0.3s cubic-bezier(.4,0,.2,1)",
          boxShadow: "4px 0 32px rgba(0,0,0,0.35)",
        }}
      >
        {/* ── LOGO ── */}
        <div style={{
          padding: "26px 20px 18px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11, flexShrink: 0,
              background: "linear-gradient(135deg,#4F46E5,#06B6D4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(79,70,229,0.5)",
            }}>
              <Building2 size={18} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, color: "white", letterSpacing: "-0.5px", lineHeight: 1.1 }}>
                Atap<span style={{ color: "#38BDF8" }}>.</span>
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(148,163,184,0.6)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Owner Portal
              </div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden" style={{
            width: 28, height: 28, borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.07)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <X size={14} color="#94A3B8" />
          </button>
        </div>

        {/* ── NAV ── */}
        <nav style={{ flex: 1, padding: "14px 10px", overflowY: "auto" }}>
          <div style={{
            fontSize: 9, fontWeight: 800, color: "rgba(148,163,184,0.4)",
            letterSpacing: "0.14em", textTransform: "uppercase",
            padding: "2px 12px 10px",
          }}>
            Menu Utama
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon      = item.icon;
            const isActive  = active === item.id;
            const showBadge = item.badge && unreadCount > 0;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.055)"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 11,
                  padding: "10px 13px", borderRadius: 13, marginBottom: 2,
                  border: isActive ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
                  cursor: "pointer", textAlign: "left",
                  background: isActive
                    ? "linear-gradient(135deg,rgba(79,70,229,0.85),rgba(6,182,212,0.6))"
                    : "transparent",
                  boxShadow: isActive ? "0 4px 20px rgba(79,70,229,0.25),inset 0 1px 0 rgba(255,255,255,0.1)" : "none",
                  position: "relative", transition: "all 0.17s ease",
                }}
              >
                {isActive && (
                  <div style={{
                    position: "absolute", left: 0, top: "22%", bottom: "22%",
                    width: 3, borderRadius: "0 3px 3px 0", background: "rgba(255,255,255,0.55)",
                  }} />
                )}
                <div style={{
                  width: 33, height: 33, borderRadius: 10, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isActive ? "rgba(255,255,255,0.17)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${isActive ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.05)"}`,
                  transition: "all 0.17s",
                }}>
                  <Icon size={15} color={isActive ? "white" : "#64748B"} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "-0.2px", lineHeight: 1.2, color: isActive ? "white" : "#94A3B8" }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 500, marginTop: 1.5, color: isActive ? "rgba(255,255,255,0.55)" : "rgba(100,116,139,0.65)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.sub}
                  </div>
                </div>
                {showBadge ? (
                  <div style={{
                    minWidth: 20, height: 20, borderRadius: 10,
                    background: "#EF4444", padding: "0 5px", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 800, color: "white",
                    boxShadow: "0 2px 8px rgba(239,68,68,0.5)",
                  }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </div>
                ) : (
                  <ChevronRight size={12} color={isActive ? "rgba(255,255,255,0.45)" : "rgba(100,116,139,0.35)"} />
                )}
              </button>
            );
          })}
        </nav>

        {/* ── USER CARD ── */}
        <div style={{ padding: "14px 10px 20px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 13, marginBottom: 9,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: "linear-gradient(135deg,#4F46E5,#06B6D4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 900, fontSize: 12,
              boxShadow: "0 2px 10px rgba(79,70,229,0.45)",
            }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "white", letterSpacing: "-0.2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {ownerName}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#38BDF8", marginTop: 1 }}>
                Pemilik Kos
              </div>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: "#22C55E", boxShadow: "0 0 8px rgba(34,197,94,0.7)" }} />
          </div>
          <button
            onClick={onLogout}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.16)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.35)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.07)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)"; }}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              padding: "9px", borderRadius: 11,
              border: "1px solid rgba(239,68,68,0.2)",
              background: "rgba(239,68,68,0.07)",
              color: "#F87171", fontSize: 12, fontWeight: 700, cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <LogOut size={13} />
            Keluar dari Akun
          </button>
        </div>
      </aside>
    </>
  );
}