import React from "react";
import { ArrowLeft, User, Mail, Phone, MapPin, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AccountSettings() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 pt-12 pb-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-slate-50 rounded-xl text-slate-600"><ArrowLeft size={20} /></button>
        <h1 className="text-xl font-black text-slate-900">Pengaturan Akun</h1>
      </div>

      <div className="px-6 space-y-6">
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Informasi Publik</label>
          <div className="bg-slate-50 rounded-[2rem] p-2">
            {[
              { icon: User, label: "Nama Lengkap", value: user.fullname },
              { icon: Mail, label: "Email", value: user.email },
              { icon: Phone, label: "Nomor WhatsApp", value: "+62 812-xxxx-xxxx" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 hover:bg-white rounded-[1.5rem] transition-all group">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-500 shadow-sm"><item.icon size={18} /></div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">{item.label}</p>
                  <p className="text-sm font-black text-slate-800">{item.value || "Belum diatur"}</p>
                </div>
                <ChevronRight size={16} className="text-slate-300" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}