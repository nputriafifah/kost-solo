import React, { useState, useMemo, useEffect } from "react";
import { Search, Bell, Filter, Home, SearchX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import KostCard from "../components/auth/KostCard";
import BottomNav from "../components/auth/BottomNav";
import NotificationPanel from "../components/auth/NotificationPanel";
import KampusSection from "../components/auth/KampusSection";

const INITIAL_DATA = [
  { id: 1, name: "Kost Melati Indah", type: "Putri", category: "Kost", price: "850k", location: "Kentingan, Surakarta", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600" },
  { id: 2, name: "Rumah Sewa Solo", type: "Campur", category: "Rumah Sewa", price: "3.2jt", location: "Laweyan, Surakarta", image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=600" },
  { id: 3, name: "Apartemen Solo Baru", type: "Campur", category: "Apartemen", price: "4.5jt", location: "Sukoharjo", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=600" },
];

export default function DashboardPage() {
  const navigate = useNavigate();

  // 1. Ambil Data User
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.name || "User";

  // 2. Fitur Like (Persistent di LocalStorage)
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("atap_favorites");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("atap_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const handleToggleLike = (id, e) => {
    e.stopPropagation();
    setFavorites((prev) => (prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]));
  };

  // 3. Inisial Nama untuk Avatar
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const [activeTab, setActiveTab] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const categories = ["Semua", "Kost", "Rumah Sewa", "Apartemen"];

  // 4. State Notifikasi
  const [showNotif, setShowNotif] = useState(false);
  const UNREAD_COUNT = 2;

  // 5. Logika Filter & Search
  const filteredData = useMemo(() => {
    return INITIAL_DATA.filter((item) => {
      const matchesTab = activeTab === "Semua" || item.category === activeTab;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-white pb-28">
      {/* HEADER */}
      <div className="px-6 pt-6 flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Atap<span className="text-indigo-600">.</span>
        </h1>
        <div className="flex gap-3">
          <button onClick={() => setShowNotif(true)} className="relative w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 border border-slate-100 active:scale-95 transition-transform">
            <Bell size={20} />
            {UNREAD_COUNT > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />}
          </button>
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg">{initials}</div>
        </div>
      </div>

      {/* SEARCH BANNER */}
      <div className="px-6 mb-8">
        <div className="bg-indigo-600 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-100">
          <p className="text-indigo-100 text-sm mb-1 opacity-90">Selamat pagi, {userName}</p>
          <h2 className="text-2xl font-bold leading-tight mb-6 tracking-tight">
            Cari <span className="italic font-light opacity-80">atap</span> yang tepat untukmu.
          </h2>
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
              <input
                type="text"
                placeholder="Cari Kost atau Lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none outline-none bg-white text-slate-800 text-sm shadow-md placeholder:text-slate-400"
              />
            </div>
            <button className="bg-white p-3.5 rounded-2xl text-indigo-600 shadow-lg active:scale-95 transition-transform">
              <Filter size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="flex gap-3 overflow-x-auto hide-scrollbar px-6 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold border transition-all whitespace-nowrap ${activeTab === cat ? "bg-indigo-50 border-indigo-600 text-indigo-600" : "bg-white border-slate-100 text-slate-400"}`}
          >
            {cat === "Semua" && <Home size={14} className="inline mr-2 -mt-1" />}
            {cat}
          </button>
        ))}
      </div>

      {/* LISTING UNGGULAN */}
      <div className="px-6 mb-6 flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-900">{searchQuery ? "Hasil Pencarian" : "Unggulan"}</h3>
        <span className="text-xs font-bold text-slate-400">{filteredData.length} Ditemukan</span>
      </div>

      {/* Kost Cards Container */}
      <div className="flex gap-6 overflow-x-auto hide-scrollbar px-6 min-h-[300px] mb-8">
        {filteredData.length > 0 ? (
          filteredData.map((item) => <KostCard key={item.id} item={item} isLiked={favorites.includes(item.id)} onLike={(e) => handleToggleLike(item.id, e)} onClick={() => navigate(`/detail/${item.id}`)} />)
        ) : (
          <div className="w-full flex flex-col items-center justify-center py-10 text-slate-300">
            <SearchX size={48} className="mb-2 opacity-20" />
            <p className="text-sm font-bold">Yah, tidak ada yang cocok...</p>
          </div>
        )}
      </div>

      {/* KAMPUS SECTION — di bawah Unggulan */}
      <KampusSection onKampusClick={(kampus) => console.log("Cari kos dekat:", kampus.nama)} />

      {/* NOTIFICATION PANEL */}
      {showNotif && <NotificationPanel onClose={() => setShowNotif(false)} />}

      <BottomNav />
    </div>
  );
}
