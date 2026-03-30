import React, { useState } from "react";
import { ArrowLeft, Bell, MessageSquare, Tag, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotificationPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({ chat: true, promo: false, update: true });

  const Toggle = ({ active, onClick }) => (
    <button onClick={onClick} className={`w-12 h-6 rounded-full transition-all relative ${active ? 'bg-indigo-600' : 'bg-slate-200'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'left-7' : 'left-1'}`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 pt-12 pb-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-slate-50 rounded-xl"><ArrowLeft size={20} /></button>
        <h1 className="text-xl font-black text-slate-900">Notifikasi</h1>
      </div>

      <div className="px-6 space-y-4">
        {[
          { key: 'chat', icon: MessageSquare, title: "Pesan Baru", desc: "Beritahu saya saat pemilik kost membalas" },
          { key: 'promo', icon: Tag, title: "Promo & Diskon", desc: "Info harga coret dan cashback" },
          { key: 'update', icon: Info, title: "Update Aplikasi", desc: "Info fitur terbaru Atap." },
        ].map((item) => (
          <div key={item.key} className="flex items-center gap-4 p-5 bg-slate-50 rounded-[2rem]">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm"><item.icon size={20} /></div>
            <div className="flex-1">
              <h4 className="text-sm font-black text-slate-900">{item.title}</h4>
              <p className="text-[10px] text-slate-400 font-medium leading-tight">{item.desc}</p>
            </div>
            <Toggle active={settings[item.key]} onClick={() => setSettings({...settings, [item.key]: !settings[item.key]})} />
          </div>
        ))}
      </div>
    </div>
  );
}