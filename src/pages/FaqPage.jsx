import React from "react";
import { ArrowLeft, MessageCircle, Mail, PhoneCall } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FaqPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white px-6 pt-12 pb-10 rounded-b-[3rem] shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 bg-slate-50 rounded-xl mb-4"><ArrowLeft size={20} /></button>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Bantuan CS<span className="text-indigo-600">.</span></h1>
        <p className="text-slate-400 text-sm font-medium mt-1">Kami siap membantu kendalamu 24/7</p>
      </div>

      <div className="px-6 -mt-8 grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-3"><MessageCircle size={24} /></div>
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">WhatsApp</h4>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 mb-3"><Mail size={24} /></div>
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Email</h4>
        </div>
      </div>

      <div className="px-6 py-8">
        <h3 className="font-black text-slate-900 mb-4 ml-2 uppercase text-[10px] tracking-widest text-slate-400">Pertanyaan Populer</h3>
        <div className="space-y-3">
          {["Cara booking kos?", "Sistem pengembalian dana", "Cara lapor pemilik nakal"].map((q, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 font-bold text-sm text-slate-700 flex justify-between items-center">
              {q} <ChevronRight size={16} className="text-slate-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}