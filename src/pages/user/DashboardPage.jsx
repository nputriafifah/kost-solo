import React, { useState, useMemo, useEffect } from "react";
import {
  Bell,
  Filter,
  SearchX,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import KostCard from "../../components/kost/KostCard";
import BottomNav from "../../components/ui/BottomNav";
import NotificationPanel from "../../components/ui/NotificationPanel";
import KampusSection from "../../components/sections/KampusSection";

// Skeleton
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
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotif, setShowNotif] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [favorites, setFavorites] = useState([]);
  const [showMenu, setShowMenu] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = !!user;

  const userName = user?.name || "Guest";

  const initials = isLoggedIn
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "GU";

  const token = localStorage.getItem("token");

  // FETCH FAVORITES
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchFavorites = async () => {
      try {
        const res = await fetch("http://localhost:3000/favorites", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();

        const ids = (json.data || []).map((item) => String(item.id));

        setFavorites(ids);
      } catch (err) {
        console.error("Fetch favorites error:", err);
      }
    };

    fetchFavorites();
  }, [isLoggedIn, token]);

  // TOGGLE LIKE
  const handleToggleLike = async (id) => {
    if (!isLoggedIn) {
      navigate("/auth");
      return;
    }

    const idStr = String(id);
    const isLiked = favorites.includes(idStr);

    try {
      const res = await fetch(`http://localhost:3000/favorites/${idStr}`, {
        method: isLiked ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Request gagal");

      setFavorites((prev) =>
        isLiked
          ? prev.filter((fId) => fId !== idStr)
          : [...prev, idStr]
      );
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  // FETCH LISTINGS
  const fetchListings = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:3000/listings");

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const json = await res.json();

      const rawData = Array.isArray(json)
        ? json
        : Array.isArray(json.data)
        ? json.data
        : [];

      const mapped = rawData.map((item) => {
        const room = item.roomTypes?.[0] || {};

        return {
          id: String(item.id),
          name: item.name || "Tanpa Nama",
          location: item.address || "Lokasi tidak tersedia",
          price: room.price ?? 0,
          gender: (item.genderType || "").toLowerCase(),
          image:
            room.photos?.[0]?.url ||
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
          available: room.availableCount ?? 0,
          isPremium: item.isPremium || false,
        };
      });

      setData(mapped);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // FILTER
  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();

    const normalize = (val) => val?.toLowerCase();

    return data.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q);

      const matchGender =
        activeFilter === "Semua" ||
        normalize(item.gender) === normalize(activeFilter);

      return matchSearch && matchGender;
    });
  }, [data, searchQuery, activeFilter]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .dashboard-root * {
          font-family: 'DM Sans', sans-serif;
          box-sizing: border-box;
        }

        .dashboard-root h1,
        .dashboard-root h2,
        .dashboard-root h3 {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .hero-gradient {
          background: linear-gradient(
            135deg,
            #1e3a8a 0%,
            #1d4ed8 40%,
            #3b82f6 100%
          );
        }

        .search-input {
          color: white;
        }

        .search-input::placeholder {
          color: rgba(255,255,255,0.55);
        }
      `}</style>

      <div className="dashboard-root min-h-screen bg-slate-50 pb-28">

        {/* HEADER */}
        <div className="bg-white px-5 pt-5 pb-4 flex justify-between items-center border-b border-slate-100">

          <h1 className="text-xl font-extrabold tracking-tight text-slate-800">
            Atap<span className="text-blue-600">.</span>
          </h1>

          <div className="flex gap-2.5 items-center">

            {/* NOTIF */}
            {isLoggedIn && (
              <button
                onClick={() => setShowNotif(true)}
                className="relative w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center"
              >
                <Bell size={17} className="text-slate-600" />

                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>
            )}

            {/* PROFILE */}
            <div className="relative">
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    navigate("/auth");
                  } else {
                    setShowMenu(!showMenu);
                  }
                }}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{
                  background:
                    "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                }}
              >
                {initials}
              </button>

              {/* DROPDOWN */}
              {showMenu && isLoggedIn && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">

                  <button
                    onClick={() => navigate("/profil")}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50"
                  >
                    Profil
                  </button>

                  <button
                    onClick={() => navigate("/settings/account")}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50"
                  >
                    Pengaturan
                  </button>

                  <button
                    onClick={() => {
                      localStorage.removeItem("user");
                      localStorage.removeItem("token");

                      navigate("/auth");
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* HERO */}
        <div className="px-4 pt-4 pb-2">
          <div className="hero-gradient rounded-2xl p-5 text-white">

            <p className="text-xs font-medium opacity-75 mb-0.5">
              {isLoggedIn
                ? `Selamat datang, ${userName} 👋`
                : "Temukan kost terbaik di Solo ✨"}
            </p>

            <h2 className="text-lg font-bold mb-4 leading-snug">
              Temukan kost impianmu
            </h2>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Cari kost atau lokasi..."
                readOnly
                onClick={() => navigate("/search")}
                className="search-input flex-1 px-4 py-2.5 rounded-xl text-sm bg-white/15 border border-white/20 cursor-pointer"
              />

              <button className="bg-white/20 border border-white/25 px-3.5 py-2.5 rounded-xl text-white">
                <Filter size={17} />
              </button>
            </div>
          </div>
        </div>

        {/* FILTER */}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto">
          {["Semua", "Putra", "Putri", "Campur"].map((tag) => (
            <span
              key={tag}
              onClick={() => setActiveFilter(tag)}
              className="flex-shrink-0 text-xs font-semibold px-4 py-1.5 rounded-full cursor-pointer"
              style={
                activeFilter === tag
                  ? {
                      background: "#1d4ed8",
                      color: "#fff",
                    }
                  : {
                      background: "#fff",
                      color: "#64748b",
                      border: "1px solid #e2e8f0",
                    }
              }
            >
              {tag}
            </span>
          ))}
        </div>

        {/* LIST */}
        <div className="px-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <KostCardSkeleton key={i} />
            ))
          ) : error ? (
            <div className="col-span-full flex flex-col items-center py-12 gap-3">
              <AlertCircle size={28} className="text-red-400" />

              <p className="text-sm font-medium text-slate-600">
                Gagal memuat listing
              </p>

              <button
                onClick={fetchListings}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 px-4 py-2 rounded-xl"
              >
                <RefreshCw size={13} />
                Coba lagi
              </button>
            </div>
          ) : filteredData.length > 0 ? (
            filteredData.map((item) => (
              <KostCard
                key={item.id}
                item={item}
                isLiked={favorites.includes(item.id)}
                onLike={() => handleToggleLike(item.id)}
                onClick={() => navigate(`/detail/${item.id}`)}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center py-12">
              <SearchX size={28} className="text-slate-300" />
              <p className="text-sm font-medium">
                Kost tidak ditemukan
              </p>
            </div>
          )}
        </div>

        {/* KAMPUS */}
        <div className="mt-5 px-4 mb-2">
          <h3 className="text-sm font-bold text-slate-800 mb-3">
            Dekat kampus
          </h3>
        </div>

        <KampusSection />

        {/* NOTIF PANEL */}
        {showNotif && isLoggedIn && (
          <NotificationPanel
            onClose={() => setShowNotif(false)}
            onUnreadChange={(c) => setUnreadCount(c)}
          />
        )}

        {/* BOTTOM NAV */}
        <BottomNav />
      </div>
    </>
  );
}