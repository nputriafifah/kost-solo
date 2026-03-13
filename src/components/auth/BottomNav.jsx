import { Home, Map as MapIcon, MessageSquare, Heart, User } from "lucide-react";

const NavIcon = ({ icon, label, active = false }) => (
  <div className="flex flex-col items-center gap-1 cursor-pointer">
    <div className={`${active ? "text-indigo-600" : "text-slate-300"}`}>{icon}</div>
    <span className={`text-[9px] font-extrabold tracking-tighter ${active ? "text-indigo-600" : "text-slate-300"}`}>
      {label}
    </span>
    {active && <div className="w-1 h-1 bg-indigo-600 rounded-full mt-0.5"></div>}
  </div>
);

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-8 py-4 flex justify-between items-center z-50 rounded-t-[32px] shadow-2xl">
      <NavIcon icon={<Home size={22} />} label="BERANDA" active />
      <NavIcon icon={<MapIcon size={22} />} label="PETA" />
      <NavIcon icon={<MessageSquare size={22} />} label="PESAN" />
      <NavIcon icon={<Heart size={22} />} label="SIMPAN" />
      <NavIcon icon={<User size={22} />} label="PROFIL" />
    </nav>
  );
}