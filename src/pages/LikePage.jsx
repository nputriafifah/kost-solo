import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import KostCard from "../components/auth/KostCard";
import BottomNav from "../components/auth/BottomNav";

const INITIAL_DATA = [
  { id: 1, name: "Kost Melati Indah", type: "Putri", category: "Kost", price: "850k", location: "Kentingan, Surakarta", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600" },
  { id: 2, name: "Rumah Sewa Solo", type: "Campur", category: "Rumah Sewa", price: "3.2jt", location: "Laweyan, Surakarta", image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=600" },
  { id: 3, name: "Apartemen Solo Baru", type: "Campur", category: "Apartemen", price: "4.5jt", location: "Sukoharjo", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=600" },
];

export default function LikePage() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);

  // Ambil Data User (untuk memastikan sinkronisasi nama jika diperlukan)
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.name || user.fullname || "User";

  useEffect(() => {
    const saved = localStorage.getItem("atap_favorites");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  const favoriteItems = INITIAL_DATA.filter((item) => favorites.includes(item.id));

  const handleToggleLike = (id, e) => {
    e.stopPropagation();
    const updatedFavorites = favorites.filter((favId) => favId !== id);
    setFavorites(updatedFavorites);
    localStorage.setItem("atap_favorites", JSON.stringify(updatedFavorites));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-32">
      {/* HEADER */}
      <div className="px-6 pt-8 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Atap<span className="text-indigo-600">.</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-medium italic">Koleksi favorit {userName}</p>
        </div>
        <div className="flex flex-col items-end">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total</span>
           <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-2xl border border-indigo-100">
             {favoriteItems.length} Kost
           </span>
        </div>
      </div>

      {/* LISTING DENGAN GRID PEMBATAS */}
      <div className="px-6">
        {favoriteItems.length > 0 ? (
          /* Grid ini memastikan kartu tidak melebar memenuhi layar (gepeng) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
            {favoriteItems.map((item) => (
              <div key={item.id} className="w-full max-w-[320px]"> 
                <KostCard
                  item={item}
                  isLiked={true}
                  onLike={(e) => handleToggleLike(item.id, e)}
                  onClick={() => navigate(`/detail/${item.id}`)}
                />
              </div>
            ))}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[40px] border border-slate-100 shadow-sm mx-2">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <Heart size={40} className="text-red-400" fill="#f87171" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Belum Ada Favorit</h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-[240px] mb-8">
              Simpan kost yang kamu incar agar tidak hilang dari pantauan!
            </p>
            <button 
              onClick={() => navigate("/dashboard")}
              className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold text-sm hover:bg-indigo-600 transition-all active:scale-95 shadow-xl shadow-slate-200"
            >
              Mulai Cari Kost
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}