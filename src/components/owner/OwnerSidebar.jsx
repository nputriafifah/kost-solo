import { Home, Building2, BarChart3, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function OwnerSidebar({ initials, user }) {
  const navigate = useNavigate();

  return (
    <div className="w-64 bg-white border-r p-6 flex flex-col justify-between">
      <div>
        <h1 className="text-2xl font-extrabold text-indigo-600 mb-8">
          Atap<span className="text-slate-900">.</span>
        </h1>

        <nav className="space-y-4 text-sm">
          <div
            onClick={() => navigate("/owner/dashboard")}
            className="flex items-center gap-2 text-indigo-600 font-semibold cursor-pointer"
          >
            <Home size={18} /> Dashboard
          </div>

          <div className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 cursor-pointer">
            <Building2 size={18} /> Properti Saya
          </div>

          <div className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 cursor-pointer">
            <BarChart3 size={18} /> Statistik
          </div>

          <div
            onClick={() => navigate("/profil")}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 cursor-pointer"
          >
            <User size={18} /> Akun
          </div>
        </nav>
      </div>

      {/* USER */}
      <div className="flex items-center gap-3 mt-10">
        <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
          {initials}
        </div>
        <div>
          <p className="text-sm font-semibold">{user.name || "Owner"}</p>
          <p className="text-xs text-slate-400">Owner</p>
        </div>
      </div>
    </div>
  );
}