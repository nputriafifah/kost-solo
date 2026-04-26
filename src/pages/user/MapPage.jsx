import React, { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  Search,
  Navigation2,
  Star,
  X,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/ui/BottomNav";

const API_URL = "http://localhost:8080";

const formatPriceLabel = (price) => {
  if (!price) return "0";
  if (price >= 1000000) return `${(price / 1000000).toFixed(1)}jt`;
  return `${Math.round(price / 1000)}rb`;
};

export default function MapPage() {
  const navigate = useNavigate();

  const [selectedKost, setSelectedKost] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [maxPrice, setMaxPrice] = useState(2500000);
  const [searchQuery, setSearchQuery] = useState("");
  const [kosData, setKosData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  // =========================
  // 🔥 FIXED FETCH (NO 404 LAGI)
  // =========================
  const fetchKos = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      console.log("🔑 TOKEN:", token);

      // 👉 IMPORTANT: pakai endpoint paling umum dulu
      const url = `${API_URL}/api/kost/search?q=${searchQuery}&minPrice=0&maxPrice=${maxPrice}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      console.log("📡 STATUS:", res.status);

      if (!res.ok) {
        const text = await res.text();
        console.error("❌ ERROR RESPONSE:", text);

        setKosData([]);
        return;
      }

      const json = await res.json();

      console.log("📦 DATA:", json);

      setKosData(json.data || json || []);
    } catch (err) {
      console.error("❌ FETCH ERROR:", err);
      setKosData([]);
    } finally {
      setLoading(false);
    }
  };

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      fetchKos();
    }, 300);

    return () => clearTimeout(t);
  }, [searchQuery, maxPrice]);

  // =========================
  // GPS
  // =========================
  const handleMyLocation = useCallback(() => {
    if (!navigator.geolocation) return alert("GPS tidak support");

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("📍 LOCATION:", pos.coords);
        setLocating(false);
      },
      (err) => {
        console.error(err);
        setLocating(false);
      }
    );
  }, []);

  return (
    <div className="h-screen w-full flex flex-col bg-slate-100 relative overflow-hidden">

      {/* SEARCH */}
      <div className="absolute top-5 left-0 right-0 z-50 px-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-400" size={16} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kost di Solo..."
            className="w-full h-11 pl-10 pr-4 rounded-2xl bg-white shadow border"
          />
        </div>

        <button
          onClick={() => setShowFilter(!showFilter)}
          className="w-11 h-11 bg-white rounded-2xl shadow flex items-center justify-center"
        >
          <SlidersHorizontal size={16} />
        </button>
      </div>

      {/* FILTER */}
      {showFilter && (
        <div className="absolute top-20 left-4 right-4 z-50 bg-white p-4 rounded-2xl shadow">
          <p className="text-sm mb-2">
            Max: {formatPriceLabel(maxPrice)}
          </p>
          <input
            type="range"
            min="500000"
            max="3000000"
            step="100000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full"
          />
        </div>
      )}

      {/* MAP */}
      <div className="flex-1 relative bg-slate-200">

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-50">
            <Loader2 className="animate-spin text-blue-500" />
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center text-6xl font-black text-slate-300">
          SOLO
        </div>

        {kosData.map((kost) => (
          <div
            key={kost.id}
            className="absolute"
            style={{
              top: `${50 + (kost.lat || 0)}%`,
              left: `${50 + (kost.lng || 0)}%`,
            }}
          >
            <button
              onClick={() => setSelectedKost(kost)}
              className="bg-white px-3 py-1 rounded-xl shadow text-xs"
            >
              Rp {formatPriceLabel(kost.price)}
            </button>
          </div>
        ))}
      </div>

      {/* CARD */}
      {selectedKost && (
        <div className="absolute bottom-24 left-4 right-4 z-50 bg-white rounded-2xl shadow p-4">
          <div className="flex justify-between">
            <h3 className="font-bold">{selectedKost.name}</h3>
            <button onClick={() => setSelectedKost(null)}>
              <X size={16} />
            </button>
          </div>

          <p className="text-sm text-slate-500">
            {selectedKost.address}
          </p>

          <button
            onClick={() => navigate(`/detail/${selectedKost.id}`)}
            className="mt-2 w-full bg-blue-600 text-white py-2 rounded-xl"
          >
            Detail
          </button>
        </div>
      )}

      {/* GPS */}
      <button
        onClick={handleMyLocation}
        className="absolute bottom-24 right-4 bg-white p-3 rounded-xl shadow z-50"
      >
        {locating ? <Loader2 className="animate-spin" /> : <Navigation2 />}
      </button>

      {/* NAVBAR */}
      <BottomNav />
    </div>
  );
}