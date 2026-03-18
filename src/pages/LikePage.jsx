import React from "react";
import { Heart } from "lucide-react";
import BottomNav from "../components/auth/BottomNav";

export default function LikePage() {
  return (
    <div className="min-h-screen bg-white pb-28">
      {/* HEADER */}
      <div className="px-6 pt-6 mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Atap<span className="text-indigo-600">.</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1 font-medium">Kost Favorit</p>
      </div>

      {/* EMPTY STATE */}
      <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <Heart size={40} className="text-red-300" />
        </div>
        <h2 className="text-xl font-bold text-slate-700 mb-2">Belum Ada Favorit</h2>
        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">Kost yang kamu suka akan muncul di sini. Yuk, mulai jelajahi dan simpan kost impianmu!</p>
      </div>

      <BottomNav />
    </div>
  );
}
