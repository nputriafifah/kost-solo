import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  FileText,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronRight,
  Star,
  User,
} from "lucide-react";
import { useAdminNotifications } from "../../hooks/useAdminNotifications";
import AdminNotificationPanel from "../../components/admin/AdminNotificationPanel";

const navItems = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analitik" },
  { to: "/admin/reports", icon: FileText, label: "Laporan" },
  { to: "/admin/listings", icon: Building2, label: "Kelola Listing" },
  { to: "/admin/minat-leads", icon: Star, label: "Leads Minat" },
  { to: "/admin/profil", icon: User, label: "Profil" },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [checking, setChecking]       = useState(true);
  const [adminName, setAdminName]     = useState("Admin");
  const [showNotif, setShowNotif]     = useState(false);
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    loading: notifLoading,
    markRead,
    markAllRead,
    refresh: refreshNotifs,
  } = useAdminNotifications({ enabled: !checking, pollMs: 30000 });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");

    // Tidak ada token → ke /auth
    if (!token) {
      navigate("/auth", { replace: true });
      return;
    }

    // Cek role dari localStorage (sudah disimpan saat login)
    try {
      const user = JSON.parse(userRaw || "{}");
      if (user?.role !== "ADMIN") {
        // Bukan admin → jangan hapus token, cukup redirect
        navigate("/auth", { replace: true });
        return;
      }
      if (user?.name) setAdminName(user.name);
    } catch {
      navigate("/auth", { replace: true });
      return;
    }

    setChecking(false);
  }, []);

  useEffect(() => {
    const syncName = () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user?.name) setAdminName(user.name);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("admin-user-updated", syncName);
    return () => window.removeEventListener("admin-user-updated", syncName);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth", { replace: true });
  };

  if (checking) return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100vh", background: "#F0F2F7", flexDirection: "column", gap: 12,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        border: "3px solid #e5e7eb", borderTop: "3px solid #3b82f6",
        animation: "spin 0.8s linear infinite",
      }} />
      <span style={{ color: "#9ca3af", fontSize: 13, fontFamily: "Outfit, sans-serif" }}>
        Memverifikasi akses...
      </span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F0F2F7] font-[Outfit,sans-serif] overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className={`flex flex-col bg-[#0F1729] transition-all duration-300 ${sidebarOpen ? "w-60" : "w-[68px]"} flex-shrink-0`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
            <Building2 size={18} className="text-white" />
          </div>
          {sidebarOpen && (
            <span className="text-white font-bold text-base tracking-tight">
              Atap<span className="text-blue-400">Admin</span>
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-blue-500/20 text-blue-400"
                    : "text-white/50 hover:text-white/90 hover:bg-white/5"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className="flex-shrink-0" />
                  {sidebarOpen && <span className="flex-1">{label}</span>}
                  {sidebarOpen && isActive && (
                    <ChevronRight size={14} className="text-blue-400" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-2 py-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-slate-200/80 flex items-center justify-between px-5 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            {sidebarOpen ? <X size={17} /> : <Menu size={17} />}
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setShowNotif((v) => !v);
                if (!showNotif) refreshNotifs();
              }}
              className="relative w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
              aria-label="Notifikasi admin"
            >
              <Bell size={17} className="text-slate-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <NavLink
              to="/admin/profil"
              className="flex items-center gap-2.5 rounded-lg px-1.5 py-1 hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-700">{adminName}</p>
                <p className="text-[10px] text-slate-400">Superadmin</p>
              </div>
            </NavLink>
          </div>
        </header>

        {showNotif && (
          <AdminNotificationPanel
            notifications={notifications}
            unreadCount={unreadCount}
            loading={notifLoading}
            onClose={() => setShowNotif(false)}
            onMarkRead={markRead}
            onMarkAllRead={markAllRead}
          />
        )}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5">
          <Outlet />
        </main>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');`}</style>
    </div>
  );
}