import React, { useState, useEffect, useCallback } from "react";
import {
  MapPin, Search, Navigation2, Star, X,
  SlidersHorizontal, Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/ui/BottomNav";

const formatPriceLabel = (price) => {
  if (price >= 1000000) return `${(price / 1000000).toFixed(1)}jt`;
  return `${Math.round(price / 1000)}rb`;
};

export default function MapPage() {
  const navigate = useNavigate();

  const [selectedKost, setSelectedKost] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [maxPrice, setMaxPrice] = useState(2500000);
  const [searchQuery, setSearchQuery] = useState("");
  const [locating, setLocating] = useState(false); // ← state untuk loading GPS
  const [kosData, setKosData] = useState([]);
const [loading, setLoading] = useState(false);

  useEffect(() => {
  fetchKos();
}, [maxPrice, searchQuery]);

const fetchKos = async () => {
  setLoading(true);
  try {
    const res = await fetch(
  `http://localhost:3000/search?q=${searchQuery}&minPrice=0&maxPrice=${maxPrice}`
);
    const json = await res.json();
    setKosData(json.data || []);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};
  // Filter berdasarkan harga DAN search query — sebelumnya search tidak dipakai
 const filteredKos = kosData.filter((kost) => {
  const q = searchQuery.toLowerCase();

  const matchSearch =
    q === "" ||
    kost.name.toLowerCase().includes(q) ||
    kost.address.toLowerCase().includes(q);

  const matchPrice = kost.price <= maxPrice;

  return matchSearch && matchPrice;
});

  // Handler tombol "My Location" dengan Geolocation API
  const handleMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Browser kamu tidak mendukung GPS.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Di production: gunakan koordinat ini untuk re-center peta
        console.log("Lokasi:", pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      (err) => {
        console.error("Geolocation error:", err.message);
        alert("Tidak bisa mengakses lokasi. Pastikan izin GPS diaktifkan.");
        setLocating(false);
      },
      { timeout: 10000 }
    );
  }, []);

  return (
    <div className="h-screen w-full flex flex-col bg-slate-100 overflow-hidden relative font-sans">

      {/* SEARCH & FILTER BAR */}
      <div className="absolute top-6 left-0 right-0 z-50 px-5 flex flex-col gap-3 pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Cari kost di Solo..."
              aria-label="Cari kost berdasarkan nama atau lokasi"
              className="w-full h-11 pl-10 pr-4 bg-white shadow-lg rounded-2xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-slate-800 placeholder:font-normal placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedKost(null); // tutup card jika sedang open
              }}
            />
          </div>
          <button
            onClick={() => setShowFilter(!showFilter)}
            aria-label="Buka filter harga"
            aria-pressed={showFilter}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg border transition-colors ${
              showFilter
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal size={17} />
          </button>
        </div>

        {/* FILTER PANEL */}
        {showFilter && (
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 pointer-events-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Budget maksimal</p>
                <p className="text-xs text-slate-400">Harga per bulan</p>
              </div>
              <span className="text-sm font-bold text-blue-600">
                Rp {(maxPrice / 1000000).toFixed(1)}jt
              </span>
            </div>

            <input
              type="range"
              min="500000"
              max="3000000"
              step="100000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              aria-label="Slider budget maksimal"
              className="w-full mb-4 accent-blue-600"
            />

            <div className="grid grid-cols-3 gap-2">
              {[1000000, 1500000, 2000000].map((p) => (
                <button
                  key={p}
                  onClick={() => setMaxPrice(p)}
                  className={`py-2 rounded-xl text-xs font-semibold transition-colors border ${
                    maxPrice === p
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {formatPriceLabel(p)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MAP AREA */}
      {/* MAP AREA */}
{/* MAP AREA */}
<div
  className="flex-1 relative bg-slate-200 overflow-hidden"
  onClick={() => {
    setSelectedKost(null);
    setShowFilter(false);
  }}
>
  {loading && (
    <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-50">
      <Loader2 className="animate-spin text-blue-500" />
    </div>
  )}
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(#4F46E5 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Watermark teks */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
          <span className="text-[15vw] font-black text-slate-900 tracking-widest select-none">
            SOLO
          </span>
        </div>

        {/* Price pins */}
        {filteredKos.map((kost) => (
          <div
            key={kost.id}
            className="absolute transition-transform hover:scale-110 active:scale-95"
            style={{
  top: `${50 + kost.lat}%`,
  left: `${50 + kost.lng}%`
}}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedKost(kost);
                setShowFilter(false);
              }}
              aria-label={`Pilih ${kost.name}, harga Rp ${kost.price.toLocaleString("id-ID")}`}
              className="flex flex-col items-center"
            >
              <div
                className={`px-3 py-1.5 rounded-2xl shadow-lg border-2 transition-all duration-200 ${
                  selectedKost?.id === kost.id
                    ? "bg-blue-600 border-white text-white scale-125 z-50"
                    : "bg-white border-slate-100 text-slate-800 z-10"
                }`}
              >
                <span className="text-xs font-bold">
                  Rp {formatPriceLabel(kost.price)}
                </span>
              </div>
              <div
                className={`w-2.5 h-2.5 rotate-45 -mt-1.5 transition-colors ${
                  selectedKost?.id === kost.id
                    ? "bg-blue-600"
                    : "bg-white border-b border-r border-slate-100"
                }`}
              />
            </button>
          </div>
        ))}

        {/* Empty state */}
        {filteredKos.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="bg-white px-5 py-2.5 rounded-full text-xs font-semibold text-slate-400 shadow-lg border border-slate-100">
              {searchQuery
                ? `Tidak ada hasil untuk "${searchQuery}"`
                : "Tidak ada kost dalam budget ini"}
            </span>
          </div>
        )}
      </div>

      {/* PREVIEW CARD */}
      {selectedKost && (
        <div className="absolute bottom-24 left-5 right-5 z-50">
          <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 flex h-36 relative">
            <button
              onClick={() => setSelectedKost(null)}
              aria-label="Tutup preview"
              className="absolute top-3 right-3 w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 z-10 transition-colors"
            >
              <X size={14} />
            </button>

            <img
              src={selectedKost.image}
              className="w-32 h-full object-cover"
              alt={`Foto ${selectedKost.name}`}
            />

            <div className="p-4 flex-1 flex flex-col justify-between overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {selectedKost.type}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <Star size={11} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-semibold text-slate-700">
                      {selectedKost.rating}
                    </span>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-slate-900 truncate leading-snug">
                  {selectedKost.name}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin size={10} className="text-rose-400 flex-shrink-0" />
                  {selectedKost.address}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-blue-600">
                  Rp {selectedKost.price.toLocaleString("id-ID")}
                  <span className="text-xs font-normal text-slate-400">/bln</span>
                </span>
                <button
                  onClick={() => navigate(`/detail/${selectedKost.id}`)}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors active:scale-95"
                >
                  Lihat detail
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MY LOCATION BUTTON */}
      <button
        onClick={handleMyLocation}
        disabled={locating}
        aria-label="Gunakan lokasi saya"
        className="absolute bottom-24 right-5 z-40 w-11 h-11 bg-white rounded-2xl shadow-lg flex items-center justify-center text-blue-600 border border-slate-100 hover:bg-slate-50 active:scale-90 transition-all disabled:opacity-60"
      >
        {locating ? (
          <Loader2 size={18} className="animate-spin text-blue-400" />
        ) : (
          <Navigation2 size={18} className="fill-blue-600" />
        )}
      </button>

      <BottomNav />
    </div>
  );
}