import React, { useState } from "react";
import { MessageCircle, Search, CheckCheck, Check, ShieldCheck } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import BottomNav from "../../components/ui/BottomNav";

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
    isRead: false,
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
    isRead: true,
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
    isRead: true,
  },
];

export default function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { kostName, ownerName } = location.state || {};

  const filteredChats = CHAT_SESSIONS.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.kost.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pisahkan dua kondisi empty state: no chats vs no search result
  const hasAnyChatAtAll = CHAT_SESSIONS.length > 0;
  const noSearchResult = hasAnyChatAtAll && filteredChats.length === 0;

  return (
    <div className="min-h-screen bg-white pb-32">

      {/* HEADER */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-30 px-5 pt-8 pb-4 border-b border-slate-100">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Pesan<span className="text-blue-600">.</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {CHAT_SESSIONS.length} percakapan aktif
            </p>
          </div>
          <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100">
            <MessageCircle size={19} />
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Cari pemilik atau nama kos..."
            aria-label="Cari percakapan"
            className="w-full h-11 pl-10 pr-4 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 placeholder:text-slate-400 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* BANNER: info kost dari DetailPage */}
      {kostName && (
        <div className="mx-4 mt-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <MessageCircle size={17} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-blue-500 font-semibold mb-0.5">Mulai chat dengan</p>
            <p className="text-sm font-bold text-slate-800 truncate">{ownerName}</p>
            <p className="text-xs text-slate-400 truncate">Tentang: {kostName}</p>
          </div>
        </div>
      )}

      {/* CHAT LIST */}
      <div className="px-4 mt-4 divide-y divide-slate-50">
        {!hasAnyChatAtAll ? (
          // Empty state: belum ada chat sama sekali
          <div className="flex flex-col items-center justify-center py-20 text-center px-8">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <MessageCircle size={28} className="text-blue-300" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 mb-1">Belum ada percakapan</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mulai chat dengan pemilik kost dari halaman detail listing.
            </p>
          </div>
        ) : noSearchResult ? (
          // Empty state: search tidak ketemu
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <Search size={26} className="text-slate-300" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 mb-1">Tidak ditemukan</h3>
            <p className="text-xs text-slate-400">
              Coba cari dengan kata kunci lain.
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => navigate(`/chat/${chat.id}`)}
              aria-label={`Buka chat dengan ${chat.name} tentang ${chat.kost}`}
              className="w-full flex items-center gap-3 py-4 px-1 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer text-left rounded-2xl"
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-100">
                  <img
                    src={chat.avatar}
                    alt={`Foto profil ${chat.name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {chat.isOnline && (
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"
                    aria-label="Online"
                  />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3
                    className={`text-sm truncate ${
                      chat.unread > 0
                        ? "font-bold text-slate-900"
                        : "font-semibold text-slate-800"
                    }`}
                  >
                    {chat.name}
                  </h3>
                  <span className="text-xs text-slate-400 ml-2 shrink-0">{chat.time}</span>
                </div>

                <p className="text-xs text-blue-500 font-semibold mb-1 truncate">
                  {chat.kost}
                </p>

                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`text-xs truncate flex-1 ${
                      chat.unread > 0
                        ? "font-semibold text-slate-700"
                        : "text-slate-400"
                    }`}
                  >
                    {chat.lastMessage}
                  </p>

                  {chat.unread > 0 ? (
                    // Badge unread — tanpa animate-bounce
                    <span className="bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                      {chat.unread}
                    </span>
                  ) : chat.isRead ? (
                    // Sudah dibaca — biru
                    <CheckCheck size={15} className="text-blue-400 shrink-0" />
                  ) : (
                    // Terkirim belum dibaca — abu
                    <Check size={15} className="text-slate-300 shrink-0" />
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* SAFETY CARD */}
      <div className="mx-5 mt-8 p-5 bg-slate-900 rounded-2xl">
        <div className="flex gap-3 items-start">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
            <ShieldCheck size={20} className="text-emerald-400" />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-1">Bertransaksi aman</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gunakan fitur{" "}
              <span className="text-blue-400 font-semibold">Bayar di Atap</span>{" "}
              untuk perlindungan penuh dari penipuan.
            </p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}