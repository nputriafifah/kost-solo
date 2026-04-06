import React, { useState, useMemo, useEffect } from "react";
import { Search, Bell, Filter, Home, SearchX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import KostCard from "../../components/auth/KostCard";
import BottomNav from "../../components/auth/BottomNav";
import NotificationPanel from "../../components/auth/NotificationPanel";
import KampusSection from "../../components/auth/KampusSection";

export default function DashboardPage() {
  const navigate = useNavigate();

  // 🔥 DATA BACKEND
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 👤 USER
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.name || "User";

  // ❤️ FAVORITE
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("atap_favorites");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("atap_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const handleToggleLike = (id, e) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id)
        ? prev.filter((favId) => favId !== id)
        : [...prev, id]
    );
  };

  // 🔠 AVATAR
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const [activeTab, setActiveTab] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const categories = ["Semua", "Kost", "Rumah Sewa", "Apartemen"];

  // 🔔 NOTIF
  const [showNotif, setShowNotif] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  // 🚀 FETCH BACKEND
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch("http://localhost:5001/listings");
        const json = await res.json();

        const mapped = json.data.map((item) => ({
          id: item.id,
          name: item.title || item.name,
          price: item.price,
          location: item.address || item.location,
          category: item.category || "Kost",
          image:
            item.image ||
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600",
        }));

        setData(mapped);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  // 🔍 FILTER
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesTab =
        activeTab === "Semua" || item.category === activeTab;

      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [data, activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-white pb-28">
      
      {/* HEADER */}
      <div className="px-6 pt-6 flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Atap<span className="text-indigo-600">.</span>
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowNotif(true)}
            className="relative w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 border border-slate-100"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
            {initials}
          </div>
        </div>
      </div>

      {/* 🔥 SEARCH BANNER (dari UI ke-2) */}
      <div className="px-6 mb-8">
        <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl">
          <p className="text-indigo-100 text-sm mb-1">
            Selamat datang, {userName}
          </p>
          <h2 className="text-2xl font-bold mb-6">
            Cari atap yang tepat untukmu.
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Cari Kost atau Lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 p-3 rounded-xl text-black"
            />
            <button className="bg-white p-3 rounded-xl text-indigo-600">
              <Filter size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* CATEGORY */}
      <div className="flex gap-3 overflow-x-auto px-6 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-4 py-2 rounded-full ${
              activeTab === cat ? "bg-indigo-600 text-white" : "bg-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="px-6 mb-6 flex justify-between">
        <h3 className="font-bold">
          {searchQuery ? "Hasil Pencarian" : "Unggulan"}
        </h3>
        <span>{filteredData.length} ditemukan</span>
      </div>

      <div className="px-6">
        {loading ? (
          <p>Loading...</p>
        ) : filteredData.length > 0 ? (
          filteredData.map((item) => (
            <KostCard
              key={item.id}
              item={item}
              isLiked={favorites.includes(item.id)}
              onLike={(e) => handleToggleLike(item.id, e)}
              onClick={() => navigate(`/detail/${item.id}`)}
            />
          ))
        ) : (
          <div className="text-center text-gray-400">
            <SearchX size={40} />
            <p>Tidak ada data</p>
          </div>
        )}
      </div>

      <KampusSection />

      {showNotif && (
        <NotificationPanel
          onClose={() => setShowNotif(false)}
          onUnreadChange={(c) => setUnreadCount(c)}
        />
      )}

      <BottomNav />
    </div>
  );
}