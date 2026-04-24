import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, AlertCircle, RefreshCw } from "lucide-react";
import KostCard from "../../components/kost/KostCard";
import BottomNav from "../../components/ui/BottomNav";

const BASE_URL = "http://localhost:3000";

export default function LikePage() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  // ================= FETCH FAVORITES =================
  const fetchFavorites = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BASE_URL}/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Gagal fetch favorites");

      const json = await res.json();

      const mapped = (json.data || []).map((item) => ({
        id: String(item.id),
        name: item.name,
        price: item.cheapestPrice ?? null,
        location: item.address ?? "",
        gender: item.genderType ?? "",
        image: item.thumbnailUrl
          ? item.thumbnailUrl.startsWith("http")
            ? item.thumbnailUrl
            : `${BASE_URL}${item.thumbnailUrl}`
          : null,
      }));

      setData(mapped);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat favorit");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  // ================= REMOVE FAVORITE =================
  const handleRemove = async (id, e) => {
    e.stopPropagation();

    try {
      await fetch(`${BASE_URL}/favorites/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // update UI langsung tanpa reload
      setData((prev) => prev.filter((item) => item.id !== String(id)));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">

      {/* HEADER */}
      <div className="px-5 pt-8 pb-5 flex justify-between items-end border-b border-slate-100 bg-white">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">
            Atap<span className="text-blue-600">.</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Kost favorit kamu
          </p>
        </div>

        {!loading && !error && (
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
            {data.length} kost
          </span>
        )}
      </div>

      {/* CONTENT */}
      <div className="px-4 pt-5">

        {loading && (
          <div className="text-center text-sm text-slate-400 py-10">
            Loading favorit...
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center py-16 text-center gap-3">
            <AlertCircle size={26} className="text-red-400" />
            <p className="text-sm text-slate-600">{error}</p>

            <button
              onClick={fetchFavorites}
              className="flex items-center gap-1 text-xs bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              <RefreshCw size={14} />
              Coba lagi
            </button>
          </div>
        )}

        {!loading && !error && data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
            <Heart size={30} className="mb-3 text-red-300" />
            <p className="text-sm font-medium">Belum ada favorit</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-4 text-xs bg-slate-900 text-white px-5 py-2 rounded-xl"
            >
              Cari kost
            </button>
          </div>
        )}

        {!loading && !error && data.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {data.map((item) => (
              <KostCard
                key={item.id}
                item={item}
                isLiked={true}
                onLike={() => handleToggleLike(item.id)}
                onClick={() => navigate(`/detail/${item.id}`)}
              />
            ))}
          </div>
        )}

      </div>

      <BottomNav />
    </div>
  );
}