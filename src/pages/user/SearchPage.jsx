// components/search/SearchPage.jsx
import React, { useState, useRef, useCallback } from "react";
import { Search, Clock, TrendingUp, X, SlidersHorizontal } from "lucide-react";
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

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;700&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #F8FAFC; }

.sp-root {
  font-family: 'DM Sans', sans-serif;
  color: #0F172A;
  min-height: 100vh;
  padding-bottom: 40px;
}

.sp-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255,255,255,.95);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid #EAEFF5;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.sp-close-btn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  color: #64748B;
  cursor: pointer;
  flex-shrink: 0;
  transition: .15s;
}
.sp-close-btn:hover { background: #F1F5F9; color: #0F172A; }

.sp-search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #F1F5F9;
  border: 1.5px solid #E2E8F0;
  border-radius: 14px;
  padding: 0 14px;
  height: 44px;
  transition: .15s;
}
.sp-search-bar:focus-within {
  background: white;
  border-color: #93C5FD;
  box-shadow: 0 0 0 3px rgba(147,197,253,.2);
}

.sp-search-input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  color: #0F172A;
}
.sp-search-input::placeholder { color: #94A3B8; }

.sp-clear-btn {
  display: flex;
  align-items: center;
  color: #94A3B8;
  cursor: pointer;
  transition: .15s;
  flex-shrink: 0;
}
.sp-clear-btn:hover { color: #475569; }

.sp-filter-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #E2E8F0;
  background: white;
  color: #475569;
  cursor: pointer;
  flex-shrink: 0;
  transition: .15s;
}
.sp-filter-btn:hover { border-color: #2563EB; color: #2563EB; background: #EFF6FF; }
.sp-filter-btn.active { border-color: #2563EB; color: #2563EB; background: #EFF6FF; }

/* SUGGESTIONS */
.sp-suggestions {
  background: white;
  border-bottom: 1px solid #EAEFF5;
}

.sp-suggest-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .06em;
  color: #94A3B8;
  text-transform: uppercase;
  padding: 14px 16px 6px;
}

.sp-suggest-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 16px;
  cursor: pointer;
  transition: .12s;
}
.sp-suggest-item:hover { background: #F8FAFC; }

.sp-suggest-left {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #334155;
  font-weight: 500;
}

.sp-suggest-icon { color: #94A3B8; flex-shrink: 0; }

.sp-suggest-del {
  color: #CBD5E1;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  transition: .12s;
  border: none;
  background: none;
}
.sp-suggest-del:hover { background: #F1F5F9; color: #94A3B8; }

/* FILTER PANEL */
.sp-filter-panel {
  background: white;
  border-bottom: 1px solid #EAEFF5;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sp-filter-label {
  font-size: 12px;
  font-weight: 700;
  color: #64748B;
  margin-bottom: 8px;
}

.sp-gender-chips { display: flex; gap: 8px; flex-wrap: wrap; }

.sp-gender-chip {
  padding: 7px 16px;
  border-radius: 999px;
  border: 1.5px solid #E2E8F0;
  background: white;
  font-size: 13px;
  font-weight: 700;
  color: #64748B;
  cursor: pointer;
  transition: .15s;
  font-family: 'DM Sans', sans-serif;
}
.sp-gender-chip:hover { border-color: #93C5FD; color: #2563EB; }
.sp-gender-chip.active { background: #2563EB; border-color: #2563EB; color: white; }

.sp-price-row { display: flex; align-items: center; gap: 10px; }

.sp-price-input {
  flex: 1;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  padding: 9px 12px;
  font-size: 13px;
  font-family: 'DM Sans', sans-serif;
  color: #0F172A;
  outline: none;
  transition: .15s;
}
.sp-price-input:focus { border-color: #93C5FD; }

.sp-price-sep { color: #CBD5E1; font-weight: 700; flex-shrink: 0; }

.sp-sort-select {
  width: 100%;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  padding: 9px 12px;
  font-size: 13px;
  font-family: 'DM Sans', sans-serif;
  color: #334155;
  outline: none;
  background: white;
  cursor: pointer;
  transition: .15s;
}
.sp-sort-select:focus { border-color: #93C5FD; }

.sp-apply-btn {
  width: 100%;
  background: linear-gradient(135deg, #1D4ED8, #2563EB);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: .2s;
}
.sp-apply-btn:hover { opacity: .92; }

/* RESULTS */
.sp-content { padding: 16px; display: flex; flex-direction: column; gap: 12px; }

.sp-result-count { font-size: 13px; font-weight: 600; color: #64748B; }
.sp-result-count strong { color: #0F172A; }

.sp-loading {
  text-align: center;
  padding: 48px 0;
  font-size: 14px;
  color: #94A3B8;
  font-weight: 600;
  animation: spPulse 1.4s infinite;
}

@keyframes spPulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: .45; }
}

.sp-empty {
  text-align: center;
  padding: 64px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.sp-empty p { font-size: 14px; color: #94A3B8; font-weight: 600; }

/* CARD */
.sp-card {
  display: flex;
  gap: 14px;
  background: white;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid #EEF2F7;
  cursor: pointer;
  transition: .15s;
}
.sp-card:hover {
  border-color: #BFDBFE;
  box-shadow: 0 4px 16px rgba(37,99,235,.08);
  transform: translateY(-1px);
}

.sp-card-img-wrap { position: relative; flex-shrink: 0; }

.sp-card-img {
  width: 88px;
  height: 88px;
  object-fit: cover;
  border-radius: 12px;
  display: block;
}

.sp-card-img-placeholder {
  width: 88px;
  height: 88px;
  border-radius: 12px;
  background: #EFF6FF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.sp-card-gender {
  position: absolute;
  top: 6px;
  left: 6px;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(255,255,255,.92);
  color: #2563EB;
  backdrop-filter: blur(4px);
  text-transform: capitalize;
}

.sp-card-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.sp-card-name {
  font-size: 14px;
  font-weight: 700;
  color: #0F172A;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.sp-card-loc {
  font-size: 12px;
  color: #94A3B8;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sp-card-price {
  font-size: 15px;
  font-weight: 800;
  color: #2563EB;
  margin-top: 10px;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.sp-card-price span { font-size: 12px; font-weight: 400; color: #94A3B8; }

.sp-card-no-price { font-size: 12px; color: #CBD5E1; margin-top: 10px; }
`;

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
      setFocused(false);

      const params = new URLSearchParams({ q });
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      if (sort) params.append("sort", sort);
      if (activeGender !== "Semua")
        params.append("genderType", activeGender.toLowerCase());

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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") doSearch();
  };

  // ================= RENDER =================
  return (
    <>
      <style>{css}</style>

      <div className="sp-root">

        {/* HEADER */}
        <div className="sp-header">
          <button className="sp-close-btn" onClick={() => navigate(-1)}>
            <X size={20} />
          </button>

          <div className="sp-search-bar">
            <Search size={15} color="#2563EB" style={{ flexShrink: 0 }} />
            <input
              autoFocus
              value={query}
              onChange={handleInput}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              onKeyDown={handleKeyDown}
              placeholder="Cari kost atau lokasi..."
              className="sp-search-input"
            />
            {query && (
              <div
                className="sp-clear-btn"
                onMouseDown={() => {
                  setQuery("");
                  setResults([]);
                  setSearched(false);
                }}
              >
                <X size={14} />
              </div>
            )}
          </div>

          <button
            className={`sp-filter-btn ${showFilter ? "active" : ""}`}
            onClick={() => setShowFilter((p) => !p)}
          >
            <SlidersHorizontal size={17} />
          </button>
        </div>

        {/* HISTORY + TRENDING */}
        {focused && !query && (
          <div className="sp-suggestions">
            {history.length > 0 && (
              <>
                <p className="sp-suggest-label">Pencarian terakhir</p>
                {history.map((h) => (
                  <div key={h} className="sp-suggest-item">
                    <div
                      className="sp-suggest-left"
                      onMouseDown={() => { setQuery(h); doSearch(h); }}
                    >
                      <Clock size={14} className="sp-suggest-icon" />
                      {h}
                    </div>
                    <button
                      className="sp-suggest-del"
                      onMouseDown={(e) => { e.stopPropagation(); deleteHistory(h); }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </>
            )}

            <p className="sp-suggest-label">Trending</p>
            {TRENDS.map((t) => (
              <div
                key={t}
                className="sp-suggest-item"
                onMouseDown={() => { setQuery(t); doSearch(t); }}
              >
                <div className="sp-suggest-left">
                  <TrendingUp size={14} className="sp-suggest-icon" />
                  {t}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FILTER PANEL */}
        {showFilter && (
          <div className="sp-filter-panel">
            <div>
              <p className="sp-filter-label">Tipe kost</p>
              <div className="sp-gender-chips">
                {GENDER_FILTERS.map((g) => (
                  <button
                    key={g}
                    className={`sp-gender-chip ${activeGender === g ? "active" : ""}`}
                    onClick={() => setActiveGender(g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="sp-filter-label">Rentang harga / bulan</p>
              <div className="sp-price-row">
                <input
                  type="number"
                  placeholder="Rp Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="sp-price-input"
                />
                <span className="sp-price-sep">–</span>
                <input
                  type="number"
                  placeholder="Rp Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="sp-price-input"
                />
              </div>
            </div>

            <div>
              <p className="sp-filter-label">Urutkan</p>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="sp-sort-select"
              >
                <option value="">Relevansi</option>
                <option value="lowest_price">Harga Termurah</option>
                <option value="highest_price">Harga Tertinggi</option>
                <option value="newest">Terbaru</option>
              </select>
            </div>

            <button
              className="sp-apply-btn"
              onClick={() => { doSearch(); setShowFilter(false); }}
            >
              Terapkan Filter
            </button>
          </div>
        )}

        {/* RESULTS */}
        <div className="sp-content">
          {loading && <div className="sp-loading">Mencari kost...</div>}

          {searched && !loading && results.length === 0 && (
            <div className="sp-empty">
              <Search size={32} color="#CBD5E1" />
              <p>Kost tidak ditemukan</p>
            </div>
          )}

          {searched && !loading && results.length > 0 && (
            <p className="sp-result-count">
              <strong>{results.length}</strong> kost ditemukan
            </p>
          )}

          {results.map((item) => (
            <div
              key={item.id}
              className="sp-card"
              onClick={() => navigate(`/detail/${item.id}`)}
            >
              <div className="sp-card-img-wrap">
                {item.image ? (
                  <img
                    src={item.image}
                    alt=""
                    className="sp-card-img"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  <div className="sp-card-img-placeholder">🏠</div>
                )}
                {item.gender && (
                  <span className="sp-card-gender">{item.gender}</span>
                )}
              </div>

              <div className="sp-card-body">
                <div>
                  <p className="sp-card-name">{item.name}</p>
                  <p className="sp-card-loc">📍 {item.location}</p>
                </div>
                {item.price ? (
                  <p className="sp-card-price">
                    Rp {Number(item.price).toLocaleString("id-ID")}
                    <span> /bulan</span>
                  </p>
                ) : (
                  <p className="sp-card-no-price">Harga belum tersedia</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}