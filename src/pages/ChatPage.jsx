import React, { useState } from "react";
import { MessageCircle, Search, CheckCheck, Clock, ShieldCheck } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom"; // ← tambah useLocation
import BottomNav from "../components/auth/BottomNav";

// --- DATA DUMMY PERCAKAPAN ---
const CHAT_SESSIONS = [
  {
    id: 1,
    name: "Ririen Setyowati",
    kost: "Griya Sruni Exclusive",
    lastMessage: "Halo, untuk kamar tipe AC masih tersedia 2 unit ya kak.",
    time: "10:24",
    unread: 2,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150",
    isOnline: true,
  },
  {
    id: 2,
    name: "Bapak Haji Slamet",
    kost: "Kost Melati Indah",
    lastMessage: "Sama-sama kak, ditunggu kedatangannya untuk survei.",
    time: "Kemarin",
    unread: 0,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150",
    isOnline: false,
  },
  {
    id: 3,
    name: "Admin Mansion Jebres",
    kost: "Mansion Jebres",
    lastMessage: "Baik, saya kirimkan titik lokasinya via Maps ya.",
    time: "Senin",
    unread: 0,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150",
    isOnline: true,
  },
];

export default function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation(); // ← TAMBAHAN
  const [searchQuery, setSearchQuery] = useState("");

  // ── TAMBAHAN: ambil info kost dari DetailPage (kalau ada) ──
  const { kostName, ownerName } = location.state || {};
  // ──────────────────────────────────────────────────────────

  // Filter chat berdasarkan input pencarian
  const filteredChats = CHAT_SESSIONS.filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || chat.kost.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-32">
      {/* --- STICKY HEADER --- */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-xl z-30 px-6 pt-8 pb-4 border-b border-slate-50">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
              Pesan<span className="text-indigo-600">.</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Chat Aktif</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
            <MessageCircle size={22} />
          </div>
        </div>

        {/* Search Input */}
        <div className="relative group">
          <Search className="absolute left-4 top-3.5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Cari pemilik atau nama kos..."
            className="w-full h-12 pl-12 pr-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ── TAMBAHAN: Banner info kost dari DetailPage ── */}
      {kostName && (
        <div className="mx-4 mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <MessageCircle size={18} className="text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Mulai chat dengan</p>
            <p className="text-sm font-black text-slate-800 truncate">{ownerName}</p>
            <p className="text-xs text-slate-400 truncate">Tentang: {kostName}</p>
          </div>
        </div>
      )}
      {/* ─────────────────────────────────────────────── */}

      {/* --- LIST PERCAKAPAN --- */}
      <div className="px-4 mt-6 space-y-1">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <div key={chat.id} onClick={() => navigate(`/chat/${chat.id}`)} className="flex items-center gap-4 p-4 rounded-[2.5rem] hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer group">
              {/* Avatar & Online Indicator */}
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-[1.5rem] overflow-hidden border-2 border-white shadow-sm transition-transform group-hover:scale-105">
                  <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
                </div>
                {chat.isOnline && <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full"></div>}
              </div>

              {/* Chat Text Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <h3 className="font-black text-slate-900 truncate tracking-tight text-base">{chat.name}</h3>
                  <span className="text-[10px] font-bold text-slate-400 mt-1">{chat.time}</span>
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                  <p className="text-[10px] text-indigo-600 font-black uppercase tracking-tighter truncate">{chat.kost}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className={`text-sm truncate pr-6 ${chat.unread > 0 ? "font-bold text-slate-800" : "font-medium text-slate-400"}`}>{chat.lastMessage}</p>

                  {chat.unread > 0 ? (
                    <div className="bg-indigo-600 text-white text-[10px] font-black w-6 h-6 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 animate-bounce">{chat.unread}</div>
                  ) : (
                    <CheckCheck size={16} className="text-slate-300" />
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          /* Empty Search State */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Search size={32} className="text-slate-200" />
            </div>
            <h3 className="font-bold text-slate-900">Tidak ditemukan</h3>
            <p className="text-xs text-slate-400 mt-1">Coba cari dengan kata kunci lain.</p>
          </div>
        )}
      </div>

      {/* --- SAFETY INFO CARD --- */}
      <div className="mx-6 mt-8 p-6 bg-slate-900 rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-slate-200">
        <div className="relative z-10 flex gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
            <ShieldCheck className="text-emerald-400" size={24} />
          </div>
          <div>
            <h4 className="text-white font-black text-sm mb-1 uppercase tracking-tight">Bertransaksi Aman</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              Gunakan fitur <span className="text-indigo-400 font-bold">Bayar di Atap</span> untuk perlindungan 100% dari penipuan.
            </p>
          </div>
        </div>
        {/* Background Decorative Graphic */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* --- BOTTOM NAV --- */}
      <BottomNav />
    </div>
  );
}
