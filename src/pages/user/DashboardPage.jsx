import React, { useState, useMemo, useEffect } from "react";
import { Bell, Filter, SearchX, AlertCircle, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import KostCard from "../../components/kost/KostCard";
import BottomNav from "../../components/ui/BottomNav";
import NotificationPanel from "../../components/ui/NotificationPanel";
import KampusSection from "../../components/sections/KampusSection";

// Komponen skeleton untuk 1 card
function KostCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-100 bg-white animate-pulse">
      <div className="w-full h-28 bg-slate-200" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-slate-200 rounded-full w-3/4" />
        <div className="h-3 bg-slate-100 rounded-full w-1/2" />
        <div className="h-3 bg-slate-200 rounded-full w-2/3" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // ← state error baru
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotif, setShowNotif] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const [activeFilter, setActiveFilter] = useState("Semua");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.name || "User";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
      prev.includes(id) ? prev.filter((fId) => fId !== id) : [...prev, id]
    );
  };

  const fetchListings = async () => {
    setLoading(true);
    setError(null); // reset error setiap kali fetch
    try {
      const res = await fetch("http://localhost:3000/listings");
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const json = await res.json();
      const mapped = (json.data || []).map((item) => {
        const room = item.roomTypes?.[0];
        return {
          id: item.id,
          name: item.name,
          price: room?.price || 0,
          location: item.address,
          gender: item.genderType || "",
          image:
            room?.photos?.[0]?.url ||
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
        };
      });
      setData(mapped);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Gagal memuat data. Periksa koneksimu dan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return data.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q);
      const matchGender =
        activeFilter === "Semua" ||
        item.gender?.toLowerCase() === activeFilter.toLowerCase();
      return matchSearch && matchGender;
    });
  }, [data, searchQuery, activeFilter]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .dashboard-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        .dashboard-root h1, .dashboard-root h2, .dashboard-root h3 { font-family: 'Plus Jakarta Sans', sans-serif; }
        .hero-gradient { background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 40%, #3b82f6 100%); }
        .search-input { color: white; }
        .search-input::placeholder { color: rgba(255,255,255,0.55); }
        .search-input:focus { outline: none; background: rgba(255,255,255,0.2); }
        .kost-card-hover { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .kost-card-hover:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(29,78,216,0.13); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="dashboard-root min-h-screen bg-slate-50 pb-28">

        {/* HEADER */}
        <div className="bg-white px-5 pt-5 pb-4 flex justify-between items-center border-b border-slate-100">
          <h1
            className="text-xl font-extrabold tracking-tight text-slate-800"
            style={{ fontFamily: "Plus Jakarta Sans" }}
          >
            Atap<span className="text-blue-600">.</span>
          </h1>
          <div className="flex gap-2.5 items-center">
            <button
              onClick={() => setShowNotif(true)}
              aria-label="Buka notifikasi" // ← aria-label
              className="relative w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <Bell size={17} className="text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              )}
            </button>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "linear-gradient(135deg, #1d4ed8, #3b82f6)" }}
            >
              {initials}
            </div>
          </div>
        </div>

        {/* HERO SEARCH */}
        <div className="px-4 pt-4 pb-2">
          <div className="hero-gradient rounded-2xl p-5 text-white">
            <p className="text-xs font-medium opacity-75 mb-0.5">
              Selamat datang, {userName} 👋
            </p>
            <h2
              className="text-lg font-bold mb-4 leading-snug"
              style={{ fontFamily: "Plus Jakarta Sans" }}
            >
              Temukan kost impianmu
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Cari kost atau lokasi..."
                readOnly
                onClick={() => navigate("/search")}
                aria-label="Cari kost atau lokasi" // ← aria-label
                className="search-input flex-1 px-4 py-2.5 rounded-xl text-sm bg-white/15 border border-white/20 cursor-pointer"
              />
              <button
                aria-label="Buka filter" // ← aria-label
                className="bg-white/20 border border-white/25 hover:bg-white/30 transition-colors px-3.5 py-2.5 rounded-xl text-white"
              >
                <Filter size={17} />
              </button>
            </div>
          </div>
        </div>

        {/* FILTER TAGS */}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
          {["Semua", "Putra", "Putri", "Campur"].map((tag) => (
            <span
              key={tag}
              role="button"
              tabIndex={0}
              onClick={() => setActiveFilter(tag)}
              onKeyDown={(e) => e.key === "Enter" && setActiveFilter(tag)}
              aria-pressed={activeFilter === tag} // ← aria-pressed
              className="flex-shrink-0 text-xs font-semibold px-4 py-1.5 rounded-full cursor-pointer transition-colors"
              style={
                activeFilter === tag
                  ? { background: "#1d4ed8", color: "#fff" }
                  : { background: "#fff", color: "#64748b", border: "1px solid #e2e8f0" }
              }
            >
              {tag}
            </span>
          ))}
        </div>

        {/* SECTION TITLE */}
        <div className="flex justify-between items-center px-4 mb-3">
          <h3
            className="text-sm font-bold text-slate-800"
            style={{ fontFamily: "Plus Jakarta Sans" }}
          >
            Rekomendasi untukmu
          </h3>
          <button
            onClick={() => navigate("/listings")} // ← navigate, bukan span kosong
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors bg-transparent border-none cursor-pointer"
          >
            Lihat semua
          </button>
        </div>

        {/* LISTING GRID */}
        <div className="px-4 grid grid-cols-2 gap-3">
          {loading ? (
            // Skeleton 4 card
            Array.from({ length: 4 }).map((_, i) => (
              <KostCardSkeleton key={i} />
            ))
          ) : error ? (
            // Error state dengan tombol retry
            <div className="col-span-full flex flex-col items-center py-12 text-slate-400 gap-3">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
                <AlertCircle size={28} className="text-red-400" />
              </div>
              <p className="text-sm font-medium text-slate-600">Gagal memuat listing</p>
              <p className="text-xs text-slate-400 text-center px-6">{error}</p>
              <button
                onClick={fetchListings}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-xl"
              >
                <RefreshCw size={13} />
                Coba lagi
              </button>
            </div>
          ) : filteredData.length > 0 ? (
            filteredData.map((item) => (
              <div key={item.id} className="kost-card-hover">
                <KostCard
                  item={item}
                  isLiked={favorites.includes(item.id)}
                  onLike={(e) => handleToggleLike(item.id, e)}
                  onClick={() => navigate(`/detail/${item.id}`)}
                />
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center py-12 text-slate-400 gap-2">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                <SearchX size={28} className="text-slate-300" />
              </div>
              <p className="text-sm font-medium">Kost tidak ditemukan</p>
              <p className="text-xs text-slate-400">Coba kata kunci lain</p>
            </div>
          )}
        </div>

        {/* KAMPUS SECTION */}
        <div className="mt-5 px-4 mb-2">
          <div className="flex justify-between items-center mb-3">
            <h3
              className="text-sm font-bold text-slate-800"
              style={{ fontFamily: "Plus Jakarta Sans" }}
            >
              Dekat kampus
            </h3>
            <button
              onClick={() => navigate("/listings?near=kampus")} // ← navigate
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors bg-transparent border-none cursor-pointer"
            >
              Lihat semua
            </button>
          </div>
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
    </>
  );
}