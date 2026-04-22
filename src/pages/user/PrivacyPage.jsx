import React from "react";
import { ArrowLeft, Lock, Smartphone, EyeOff, ShieldCheck, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      <div className="bg-white px-5 pt-12 pb-4 flex items-center gap-3 border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <h1 className="text-xl font-extrabold text-slate-800" style={{ fontFamily: "Plus Jakarta Sans" }}>
          Keamanan
        </h1>
      </div>

      <div className="px-4 py-4 space-y-3">
        {[
          { icon: Lock, title: "Ubah Password", color: "text-rose-500", bg: "bg-rose-50" },
          { icon: Smartphone, title: "Perangkat Terhubung", color: "text-blue-600", bg: "bg-blue-50" },
          { icon: EyeOff, title: "Sembunyikan Status Online", color: "text-slate-500", bg: "bg-slate-100" },
          { icon: ShieldCheck, title: "Autentikasi Dua Faktor", color: "text-green-600", bg: "bg-green-50" },
        ].map((item, i) => (
          <button key={i} className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/20 transition-all">
            <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <item.icon size={18} className={item.color} />
            </div>
            <span className="flex-1 text-sm font-semibold text-slate-700 text-left">{item.title}</span>
            <ChevronRight size={16} className="text-slate-300" />
          </button>
        ))}
      </div>
    </div>
  );
}