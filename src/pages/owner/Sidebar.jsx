import { X, ChevronRight, Building2, LogOut } from "lucide-react";
import { Home, MessageSquare, BarChart3, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ─── NAV ITEMS ────────────────────────────────────────────────────────────────

export const NAV_ITEMS = [
  { id: "home",      icon: Home,          label: "Beranda",       path: "/owner/dashboard" },
  { id: "properti",  icon: Building2,     label: "Properti Saya", path: "/owner/properti"  },
  { id: "pesan",     icon: MessageSquare, label: "Pesan",         path: null, badge: 3     },
  { id: "statistik", icon: BarChart3,     label: "Statistik",     path: null               },
  { id: "akun",      icon: User,          label: "Profil",        path: null               },
];

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────

export default function Sidebar({
  active,
  onChange,
  ownerName,
  initials,
  onLogout,
  open,
  onClose,
}) {
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
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          "fixed top-0 left-0 h-full z-50 bg-white border-r border-slate-100",
          "flex flex-col w-64 transition-transform duration-300 shadow-2xl",
          "md:static md:translate-x-0 md:shadow-none md:z-auto",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {/* Logo */}
        <div className="px-6 pt-8 pb-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <Building2 size={15} className="text-white" />
              </div>
              <span className="text-[17px] font-black text-slate-900 tracking-tight">
                Atap<span className="text-indigo-600">.</span>owner
              </span>
            </div>
            <button
              onClick={onClose}
              className="md:hidden w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const { id, icon: Icon, label, badge } = item;
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => handleNavClick(item)}
                className={[
                  "w-full flex items-center justify-between px-4 py-3 rounded-2xl mb-1",
                  "transition-all text-left group",
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                    : "text-slate-500 hover:bg-slate-50",
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-500"}
                  />
                  <span className={`text-sm font-bold ${isActive ? "text-white" : ""}`}>
                    {label}
                  </span>
                </div>
                {badge ? (
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">
                    {badge}
                  </span>
                ) : (
                  <ChevronRight size={14} className={isActive ? "text-white/50" : "text-slate-300"} />
                )}
              </button>
            );
          })}
        </nav>

        {/* User + logout */}
        <div className="px-4 pb-6 pt-4 border-t border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-900 truncate">{ownerName}</p>
              <p className="text-[10px] text-slate-400 font-semibold">Pemilik Kos</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-500 font-bold text-sm hover:bg-red-100 transition-colors"
          >
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>
    </>
  );
}