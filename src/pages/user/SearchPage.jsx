// components/search/SearchPage.jsx
import React, { useState, useRef, useCallback } from "react";
import { Search, Filter, Clock, TrendingUp, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:3000";
const HISTORY_KEY = "atap_search_history";

const TRENDS = [
  "Kost dekat UNS",
  "Kost Laweyan murah",
  "Kost AC wifi",
  "Kost Nusukan putri",
];

const GENDER_FILTERS = ["Semua", "Putra", "Putri", "Campur"];

export default function SearchPage() {
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [showFilter, setShowFilter] = useState(false);
  const [activeGender, setActiveGender] = useState("Semua");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("");

  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    } catch {
      return [];
    }
  });

  // ================= HISTORY =================
  const saveHistory = (q) => {
    setHistory((prev) => {
      const next = [q, ...prev.filter((x) => x !== q)].slice(0, 5);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  };

  const deleteHistory = (q) => {
    setHistory((prev) => {
      const next = prev.filter((x) => x !== q);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  };

  // ================= SEARCH =================
  const doSearch = useCallback(
    async (customQuery) => {
      const q = customQuery || query;
      if (!q.trim()) return;

      saveHistory(q);
      setLoading(true);
      setSearched(true);

      const params = new URLSearchParams({ q });

      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      if (sort) params.append("sort", sort);
      if (activeGender !== "Semua") {
        params.append("genderType", activeGender.toLowerCase());
      }

      try {
        const res = await fetch(`${BASE_URL}/listings/search?${params}`);
        const json = await res.json();

        const mapped = (json.data || []).map((item) => ({
          id: item.id,
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

        setResults(mapped);
      } catch (err) {
        console.error(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [query, minPrice, maxPrice, sort, activeGender]
  );

  // ================= INPUT =================
  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);

    if (!val.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">

      {/* HEADER */}
      <div className="bg-white px-4 py-3 flex items-center gap-3 sticky top-0 z-30 border-b">
        <button onClick={() => navigate(-1)}>
          <X size={20} />
        </button>

        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" />
          <input
            value={query}
            onChange={handleInput}
            onFocus={() => setFocused(true)}
            placeholder="Cari kost atau lokasi..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <button onClick={() => setShowFilter(!showFilter)}>
          <Filter size={18} />
        </button>
      </div>

      {/* HISTORY + TREND */}
      {focused && !query && (
        <div className="bg-white shadow-sm border-b">

          {history.length > 0 && (
            <>
              <p className="px-4 pt-3 text-xs text-slate-400">Pencarian terakhir</p>

              {history.map((h) => (
                <div key={h} className="flex justify-between items-center px-4 py-2 hover:bg-slate-50">
                  <div
                    onMouseDown={() => doSearch(h)}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <Clock size={14} />
                    {h}
                  </div>

                  <button
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      deleteHistory(h);
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </>
          )}

          <p className="px-4 pt-3 text-xs text-slate-400">Trending</p>

          {TRENDS.map((t) => (
            <div
              key={t}
              onMouseDown={() => doSearch(t)}
              className="px-4 py-2 hover:bg-slate-50 cursor-pointer flex gap-2 text-sm"
            >
              <TrendingUp size={14} />
              {t}
            </div>
          ))}
        </div>
      )}

      {/* FILTER */}
      {showFilter && (
        <div className="bg-white p-4 border-b space-y-3">

          <div className="flex gap-2 flex-wrap">
            {GENDER_FILTERS.map((g) => (
              <button
                key={g}
                onClick={() => setActiveGender(g)}
                className={`px-3 py-1 text-xs rounded-full border ${
                  activeGender === g
                    ? "bg-blue-600 text-white"
                    : "text-slate-500"
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="border px-2 py-1 w-full text-sm rounded"
            />
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="border px-2 py-1 w-full text-sm rounded"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full border px-2 py-1 text-sm rounded"
          >
            <option value="">Relevansi</option>
            <option value="lowest_price">Harga Termurah</option>
            <option value="highest_price">Harga Tertinggi</option>
            <option value="newest">Terbaru</option>
          </select>

          <button
            onClick={() => doSearch()}
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold"
          >
            Terapkan Filter
          </button>
        </div>
      )}

      {/* RESULTS */}
      <div className="p-4 space-y-3">

        {loading && (
          <div className="text-center text-sm text-slate-400 animate-pulse">
            Mencari kost...
          </div>
        )}

        {searched && !loading && results.length === 0 && (
          <div className="text-center text-slate-400 text-sm py-10">
            🔍 Kost tidak ditemukan
          </div>
        )}

        {searched && !loading && results.length > 0 && (
          <p className="text-xs text-slate-400 mb-2">
            {results.length} kost ditemukan
          </p>
        )}

        {results.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(`/detail/${item.id}`)}
            className="flex gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition cursor-pointer"
          >
            {/* IMAGE */}
            <div className="relative">
              {item.image ? (
                <img
                  src={item.image}
                  alt=""
                  onError={(e) => (e.target.style.display = "none")}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-blue-100 flex items-center justify-center text-xl">
                  🏠
                </div>
              )}

              {item.gender && (
                <span className="absolute top-1 left-1 text-[10px] px-2 py-0.5 rounded-full bg-white/90 text-blue-600">
                  {item.gender}
                </span>
              )}
            </div>

            {/* CONTENT */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {item.name}
              </p>

              <p className="text-xs text-slate-400 mt-1 truncate">
                📍 {item.location}
              </p>

              <div className="mt-2">
                {item.price ? (
                  <p className="text-blue-600 font-bold text-sm">
                    Rp {Number(item.price).toLocaleString("id-ID")}
                    <span className="text-xs text-slate-400 font-normal">
                      {" "} /bulan
                    </span>
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">
                    Harga belum tersedia
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}