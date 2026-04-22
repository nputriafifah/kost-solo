// components/search/SearchPage.jsx
import React, { useState, useRef, useCallback } from "react";
import { Search, Filter, Clock, TrendingUp, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HISTORY_KEY = "atap_search_history";
const TRENDS = ["Kost dekat UNS", "Kost Laweyan murah", "Kost AC wifi", "Kost Nusukan putri"];
const GENDER_FILTERS = ["Semua", "Putra", "Putri", "Campur"];

export default function SearchPage() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const minPriceRef = useRef("");
  const maxPriceRef = useRef("");
  const sortRef = useRef("");
  const activeGenderRef = useRef("Semua");

  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeGender, setActiveGender] = useState("Semua");
  const [showFilter, setShowFilter] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("");
  const [searched, setSearched] = useState(false);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
  });

  const saveHistory = useCallback((q) => {
    setHistory((prev) => {
      const next = [q, ...prev.filter((x) => x !== q)].slice(0, 5);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteHistory = (q) => {
    setHistory((prev) => {
      const next = prev.filter((x) => x !== q);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleMinPrice = (v) => { setMinPrice(v); minPriceRef.current = v; };
  const handleMaxPrice = (v) => { setMaxPrice(v); maxPriceRef.current = v; };
  const handleSort = (v) => { setSort(v); sortRef.current = v; };
  const handleGender = (v) => { setActiveGender(v); activeGenderRef.current = v; };

  const doSearch = useCallback(async (q = query) => {
    if (!q.trim()) return;
    saveHistory(q.trim());
    setFocused(false);
    setLoading(true);
    setSearched(true);

    const params = new URLSearchParams({ q: q.trim() });
    if (minPriceRef.current) params.append("minPrice", minPriceRef.current);
    if (maxPriceRef.current) params.append("maxPrice", maxPriceRef.current);
    if (sortRef.current) params.append("sort", sortRef.current);
    if (activeGenderRef.current !== "Semua") params.append("genderType", activeGenderRef.current.toLowerCase());

    try {
      const res = await fetch(`http://localhost:3000/listings/search?${params}`);
      const json = await res.json();
      const mapped = (json.data || []).map((item) => {
        const room = item.roomTypes?.[0];
        return {
          id: item.id,
          name: item.name,
          price: room?.price || item.price || 0,
          location: item.address || item.location || "",
          gender: item.genderType || "",
          image: room?.photos?.[0]?.url || "",
        };
      });
      setResults(mapped);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, saveHistory]);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (!val.trim()) { setResults([]); setSearched(false); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 450);
  };

  const handleSuggestionClick = (q) => {
    setQuery(q);
    doSearch(q);
  };

  const genderColor = {
    putra: "bg-blue-50 text-blue-700",
    putri: "bg-pink-50 text-pink-700",
    campur: "bg-green-50 text-green-700",
  };

  const showDropdown = focused && !query.trim();

  return (
    <div className="min-h-screen bg-slate-50 pb-28" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div className="bg-white px-4 pt-5 pb-3 border-b border-slate-100 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="text-slate-500 p-1">
          <X size={20} />
        </button>
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" />
          <input
            ref={inputRef}
            autoFocus
            value={query}
            onChange={handleInput}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="Cari kost atau lokasi..."
            className="w-full pl-9 pr-8 py-2.5 rounded-xl text-sm border border-blue-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setResults([]); setSearched(false); inputRef.current?.focus(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilter((p) => !p)}
          className={`p-2 rounded-xl border transition-colors ${showFilter ? "bg-blue-600 border-blue-600 text-white" : "border-slate-200 text-slate-500"}`}
        >
          <Filter size={16} />
        </button>
      </div>

      {/* Dropdown history / trending */}
      {showDropdown && (
        <div className="bg-white border-b border-slate-100 shadow-sm">
          {history.length > 0 && (
            <>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 pt-3 pb-1">
                Pencarian terakhir
              </p>
              {history.map((h) => (
                <div
                  key={h}
                  onClick={() => handleSuggestionClick(h)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Clock size={13} className="text-slate-400" />
                  </div>
                  <span className="text-sm flex-1 text-slate-700">{h}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteHistory(h); }}
                    className="text-xs text-slate-400 hover:text-slate-600 px-1"
                  >
                    hapus
                  </button>
                </div>
              ))}
            </>
          )}
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 pt-3 pb-1">
            Trending
          </p>
          {TRENDS.map((t) => (
            <div
              key={t}
              onClick={() => handleSuggestionClick(t)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <TrendingUp size={13} className="text-blue-500" />
              </div>
              <span className="text-sm text-slate-700">{t}</span>
            </div>
          ))}
        </div>
      )}

      {/* Filter Panel */}
      {showFilter && (
        <div className="bg-white border-b border-slate-100 px-4 py-4">
          <div className="flex gap-2 mb-3 flex-wrap">
            {GENDER_FILTERS.map((g) => (
              <span
                key={g}
                onClick={() => handleGender(g)}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full cursor-pointer border transition-colors ${
                  activeGender === g ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-500 border-slate-200"
                }`}
              >
                {g}
              </span>
            ))}
          </div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Harga per bulan</p>
          <div className="flex gap-2 mb-3 items-center">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => handleMinPrice(e.target.value)}
              placeholder="Min (Rp)"
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
            />
            <span className="text-slate-300 text-sm">—</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => handleMaxPrice(e.target.value)}
              placeholder="Max (Rp)"
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
            />
          </div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Urutkan</p>
          <select
            value={sort}
            onChange={(e) => handleSort(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 mb-3"
          >
            <option value="">Relevansi</option>
            <option value="price_asc">Harga: Terendah</option>
            <option value="price_desc">Harga: Tertinggi</option>
            <option value="newest">Terbaru</option>
          </select>
          <button
            onClick={() => { setShowFilter(false); if (query.trim()) doSearch(); }}
            className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Terapkan Filter
          </button>
        </div>
      )}

      {/* Results */}
      <div className="px-4 mt-3">
        {loading ? (
          <div className="flex flex-col items-center py-12 gap-2">
            <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
            <p className="text-xs text-slate-400">Mencari kost...</p>
          </div>
        ) : searched && results.length === 0 ? (
          <div className="flex flex-col items-center py-14 gap-2 text-slate-400">
            <div className="text-4xl mb-1">🔍</div>
            <p className="text-sm font-medium text-slate-600">Kost tidak ditemukan</p>
            <p className="text-xs">Coba kata kunci lain</p>
          </div>
        ) : (
          <>
            {searched && (
              <p className="text-xs text-slate-400 mb-3">{results.length} kost ditemukan</p>
            )}
            <div className="flex flex-col gap-3">
              {results.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/detail/${item.id}`)}
                  className="flex gap-3 bg-white border border-slate-100 rounded-2xl p-3 cursor-pointer active:scale-[0.99] transition-transform"
                >
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center text-2xl flex-shrink-0">🏠</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{item.location}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <p className="text-sm font-bold text-blue-600">
                        Rp {Number(item.price).toLocaleString("id-ID")}
                        <span className="text-xs font-normal text-slate-400">/bln</span>
                      </p>
                      {item.gender && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${genderColor[item.gender] || "bg-slate-100 text-slate-500"}`}>
                          {item.gender.charAt(0).toUpperCase() + item.gender.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}