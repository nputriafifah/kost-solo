import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, AlertCircle, RefreshCw } from "lucide-react";
import KostCard from "../../components/kost/KostCard";
import BottomNav from "../../components/ui/BottomNav";

// Skeleton card — konsisten dengan DashboardPage
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

export default function LikePage() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Normalisasi semua ID sebagai string sejak awal
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("atap_favorites");
    return saved ? JSON.parse(saved).map(String) : [];
  });

  // Sync favorites ke localStorage setiap kali berubah
  useEffect(() => {
    localStorage.setItem("atap_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.name || user.fullname || "User";

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:3000/listings");
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const json = await res.json();
      const mapped = (json.data || []).map((item) => {
        const room = item.roomTypes?.[0];
        return {
          id: String(item.id), // normalisasi ke string
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

  // Karena ID sudah dinormalisasi string semua, tidak perlu konversi lagi
  const favoriteItems = data.filter((item) => favorites.includes(item.id));

  const handleToggleLike = (id, e) => {
    e.stopPropagation();
    setFavorites((prev) => prev.filter((favId) => favId !== String(id)));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">

      {/* HEADER */}
      <div className="px-5 pt-8 pb-5 flex justify-between items-end border-b border-slate-100 bg-white">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Atap<span className="text-blue-600">.</span>
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Favorit kamu, {userName}
          </p>
        </div>

        {/* Counter badge — hanya tampil jika ada data */}
        {!loading && !error && (
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
            {favoriteItems.length} kost tersimpan
          </span>
        )}
      </div>

      {/* KONTEN */}
      <div className="px-4 pt-5">
        {loading ? (
          // Skeleton grid — 4 card
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <KostCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className="flex flex-col items-center py-16 text-center gap-3">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
              <AlertCircle size={26} className="text-red-400" />
            </div>
            <p className="text-sm font-semibold text-slate-600">
              Gagal memuat favorit
            </p>
            <p className="text-xs text-slate-400 px-8">{error}</p>
            <button
              onClick={fetchListings}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-xl"
            >
              <RefreshCw size={13} />
              Coba lagi
            </button>
          </div>
        ) : favoriteItems.length > 0 ? (
          // Grid favorit
          <div className="px-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {favoriteItems.map((item) => (
              <KostCard
                key={item.id}
                item={item}
                isLiked={true}
                onLike={(e) => handleToggleLike(item.id, e)}
                onClick={() => navigate(`/detail/${item.id}`)}
              />
            ))}
          </div>
        ) : (
          // Empty state — tanpa animate-pulse yang menyesatkan
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-slate-100 mx-1 mt-4">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
              <Heart size={28} className="text-red-300 fill-red-200" />
            </div>
            <h2 className="text-base font-bold text-slate-800 mb-1">
              Belum ada favorit
            </h2>
            <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed mb-6">
              Simpan kost yang kamu incar agar mudah ditemukan lagi.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              aria-label="Kembali ke dashboard untuk mencari kost"
              className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-xs font-semibold hover:bg-blue-600 transition-colors active:scale-95"
            >
              Mulai cari kost
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}