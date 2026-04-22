import React from "react";
import { ArrowLeft, MessageCircle, Mail, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FaqPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      <div className="bg-white px-6 pt-12 pb-10 rounded-b-3xl shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 bg-slate-50 rounded-xl mb-4"><ArrowLeft size={20} /></button>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: "Plus Jakarta Sans" }}>
          Bantuan CS<span className="text-blue-600">.</span>
        </h1>
        <p className="text-slate-400 text-sm font-medium mt-1">Kami siap membantu kendalamu 24/7</p>
      </div>

      <div className="px-6 -mt-8 grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 mb-3">
            <MessageCircle size={24} />
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">WhatsApp</h4>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-3">
            <Mail size={24} />
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Email</h4>
        </div>
      </div>

      <div className="px-6 py-8">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-4 px-1">Pertanyaan Populer</p>
        <div className="space-y-3">
          {["Cara booking kos?", "Sistem pengembalian dana", "Cara lapor pemilik nakal"].map((q, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 font-semibold text-sm text-slate-700 flex justify-between items-center cursor-pointer hover:border-blue-100 hover:bg-blue-50/30 transition-colors">
              {q} <ChevronRight size={16} className="text-slate-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}