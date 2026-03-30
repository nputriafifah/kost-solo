import React from "react";
import { ArrowLeft, Lock, Smartphone, EyeOff, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 pt-12 pb-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-slate-50 rounded-xl"><ArrowLeft size={20} /></button>
        <h1 className="text-xl font-black text-slate-900">Keamanan</h1>
      </div>

      <div className="px-6 space-y-3">
        {[
          { icon: Lock, title: "Ubah Password", color: "text-rose-500" },
          { icon: Smartphone, title: "Perangkat Terhubung", color: "text-indigo-500" },
          { icon: EyeOff, title: "Sembunyikan Status Online", color: "text-slate-500" },
          { icon: ShieldCheck, title: "Autentikasi Dua Faktor", color: "text-emerald-500" },
        ].map((item, i) => (
          <button key={i} className="w-full flex items-center gap-4 p-5 bg-slate-50 rounded-[2rem] hover:bg-slate-100 transition-all">
            <item.icon size={20} className={item.color} />
            <span className="flex-1 text-sm font-bold text-slate-700">{item.title}</span>
            <ChevronRight size={16} className="text-slate-300" />
          </button>
        ))}
      </div>
    </div>
  );
}