import {
  Home,
  Building2,
  Zap,
  Users,
  BarChart3,
  TrendingUp,
  User,
  ChevronRight,
  X,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "home", icon: Home, label: "Home" },
  { id: "properti", icon: Building2, label: "Properti Saya" },
  { id: "promosi", icon: Zap, label: "Fitur Promosi" },
  { id: "peminat", icon: Users, label: "Cek Peminat" },
  { id: "manajemen", icon: BarChart3, label: "Manajemen Kos" },
  { id: "statistik", icon: TrendingUp, label: "Laporan Statistik" },
  { id: "akun", icon: User, label: "Akun" },
];

export default function Sidebar({
  active,
  onChange,
  ownerName,
  initials,
  onLogout,
  open,
  onClose,
}) {
  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 bg-white border-r border-slate-100 flex flex-col w-64 transition-transform duration-300 shadow-xl lg:translate-x-0 lg:static ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* LOGO */}
        <div className="px-6 pt-8 pb-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Building2 size={16} className="text-white" />
              </div>
              <span className="text-lg font-black text-slate-900">
                Atap<span className="text-indigo-600">.</span>owner
              </span>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden w-8 h-8 flex items-center justify-center text-slate-400"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onChange(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl mb-1 transition-all text-left group ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-indigo-500"
                    }
                  />
                  <span className="text-sm font-bold">
                    {item.label}
                  </span>
                </div>

                <ChevronRight
                  size={14}
                  className={
                    isActive ? "text-white/60" : "text-slate-300"
                  }
                />
              </button>
            );
          })}
        </nav>

        {/* USER */}
        <div className="px-4 pb-6 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs">
              {initials}
            </div>

            <div className="min-w-0">
              <p className="text-sm font-black text-slate-900 truncate">
                {ownerName}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold">
                Pemilik Kos
              </p>
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