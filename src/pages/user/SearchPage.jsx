// pages/user/SearchPage.jsx
import React, { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Clock,
  TrendingUp,
  X,
  MapPin,
  Home,
  ChevronLeft,
  ChevronDown,
  Check,
  Users,
  ArrowUpDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ── Portal Dropdown ─────────────────────────────────────────────────────── */
function DropdownPortal({ anchorRef, children, onClose }) {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!anchorRef?.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + window.scrollY + 8, left: rect.left + window.scrollX });
  }, [anchorRef]);

  return createPortal(
    <>
      {/* invisible overlay to close on outside click */}
      <div
        style={{ position: "fixed", inset: 0, zIndex: 9998 }}
        onClick={onClose}
      />
      <div
        className="sp-dropdown"
        style={{ position: "absolute", top: pos.top, left: pos.left, zIndex: 9999 }}
      >
        {children}
      </div>
    </>,
    document.body
  );
}

const BASE_URL = "http://localhost:3000";
const HISTORY_KEY = "atap_search_history";

const TRENDS = [
  "Kost dekat UNS",
  "Kost Laweyan murah",
  "Kost AC wifi",
  "Kost Nusukan putri",
];

const GENDER_FILTERS = [
  { value: "Putra",  label: "Putra" },
  { value: "Putri",  label: "Putri" },
  { value: "Campur", label: "Campur" },
];

const SORT_OPTIONS = [
  { value: "",              label: "Paling direkomendasikan" },
  { value: "lowest_price",  label: "Harga termurah" },
  { value: "highest_price", label: "Harga tertinggi" },
  { value: "newest",        label: "Terbaru" },
];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');

*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

body {
  background: #F8FAFC;
  font-family: 'DM Sans', sans-serif;
  color: #0F172A;
}

.sp-root h1,
.sp-root h2,
.sp-root h3,
.sp-card-name {
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* ROOT */
.sp-root {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 40px;
}

/* ── HEADER ── */
.sp-header {
  position: sticky;
  top: 0;
  z-index: 200;
  background: #fff;
  border-bottom: 1px solid #EBEBEB;
}

.sp-header-top {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
}

.sp-back-btn {
  width: 36px; height: 36px;
  border: none; background: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; border-radius: 50%;
  color: #1A1A1A; flex-shrink: 0;
  transition: background .15s;
}
.sp-back-btn:hover { background: #F8FAFC; }

.sp-search-bar {
  flex: 1;
  display: flex; align-items: center; gap: 10px;
  height: 44px;
  border: 1.5px solid #E0E0E0;
  border-radius: 8px;
  padding: 0 14px;
  background: #FAFAFA;
  transition: border-color .15s, background .15s;
}
.sp-search-bar:focus-within {
  border-color: rgb(25, 62, 155);
  background: #fff;
}

.sp-search-input {
  flex: 1; border: none; background: transparent;
  font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif;
  color: #1A1A1A; outline: none;
}
.sp-search-input::placeholder { color: #ABABAB; }

.sp-clear-btn {
  border: none; background: none; cursor: pointer;
  color: #ABABAB; display: flex; align-items: center;
  transition: color .15s;
}
.sp-clear-btn:hover { color: #555; }

/* ── FILTER BAR ── */
.sp-filter-bar {
  padding: 10px 16px 12px;
  overflow-x: auto;
}
.sp-filter-bar::-webkit-scrollbar { display: none; }

.sp-filter-row {
  display: flex; gap: 8px;
  min-width: max-content;
}

.sp-chip-wrap {
  position: relative;
}

.sp-chip {
  height: 36px; padding: 0 14px;
  border: 1.5px solid #D9D9D9;
  border-radius: 999px;
  background: #fff;
  display: flex; align-items: center; gap: 6px;
  cursor: pointer; white-space: nowrap;
  font-size: 13px; font-weight: 600;
  color: #333;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: border-color .15s, color .15s, background .15s;
}
.sp-chip svg { flex-shrink:0; }
.sp-chip:hover { border-color: #BDBDBD; }
.sp-chip.active {
  border-color: #1A1A1A;
  background: #1A1A1A;
  color: #fff;
}
.sp-chip.filtered {
  border-color: #2563EB;
  color: #2563EB;
  background: #F0FAF1;
}

/* ── DROPDOWN (rendered via Portal to body) ── */
.sp-dropdown {
  min-width: 260px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #EBEBEB;
  box-shadow: 0 8px 32px rgba(0,0,0,.12);
  overflow: hidden;
  animation: dropIn .15s ease;
}
@keyframes dropIn {
  from { opacity:0; transform:translateY(-6px); }
  to   { opacity:1; transform:translateY(0); }
}

.sp-dropdown-body { padding: 18px 18px 12px; }

.sp-dropdown-subtitle {
  font-size: 13px; color: #777; margin-bottom: 14px; line-height: 1.5;
}

/* gender checkbox list */
.sp-check-list { display: flex; flex-direction: column; gap: 0; }

.sp-check-item {
  display: flex; align-items: center; gap: 12px;
  padding: 11px 0;
  cursor: pointer;
  border-bottom: 1px solid #F5F5F5;
}
.sp-check-item:last-child { border-bottom: none; }

.sp-checkbox {
  width: 20px; height: 20px; border-radius: 4px;
  border: 1.5px solid #CACACA;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: .15s;
}
.sp-checkbox.checked { background: #2563EB; border-color: #2563EB; }

.sp-check-label { font-size: 14px; font-weight: 500; color: #1A1A1A; }

/* price inputs */
.sp-price-row { display: flex; gap: 10px; }
.sp-price-input {
  flex: 1; height: 40px; border-radius: 8px;
  border: 1.5px solid #E0E0E0; background: #FAFAFA;
  padding: 0 12px; outline: none;
  font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif;
  color: #1A1A1A;
  transition: border-color .15s, background .15s;
}
.sp-price-input:focus { background: #fff; border-color: #2563EB; }
.sp-price-input::placeholder { color: #ABABAB; }

/* sort list */
.sp-sort-list { display: flex; flex-direction: column; gap: 0; }
.sp-sort-item {
  height: 46px; border: none; background: none;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 4px; cursor: pointer;
  font-size: 14px; font-weight: 500; color: #333;
  font-family: 'Plus Jakarta Sans', sans-serif;
  border-bottom: 1px solid #F5F5F5;
  border-radius: 0; transition: color .15s;
}
.sp-sort-item:last-child { border-bottom: none; }
.sp-sort-item:hover { color: #2563EB; }
.sp-sort-item.active { color: #2563EB; font-weight: 700; }

/* dropdown footer */
.sp-dropdown-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 18px;
  border-top: 1px solid #F0F0F0;
}
.sp-dd-reset {
  border: none; background: none;
  font-size: 13px; font-weight: 600; color: #888;
  cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
  text-decoration: underline;
}
.sp-dd-save {
  border: none; background: #2563EB;
  color: #fff; font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
  padding: 8px 20px; border-radius: 8px;
  transition: background .15s;
}
.sp-dd-save:hover { background: #2563EB; }

/* ── SUGGESTIONS ── */
.sp-suggestions {
  background: #fff;
  border-bottom: 1px solid #EBEBEB;
}

.sp-suggest-label {
  padding: 14px 16px 6px;
  font-size: 11px; font-weight: 700;
  letter-spacing: .06em; text-transform: uppercase;
  color: #ABABAB;
}

.sp-suggest-item {
  padding: 11px 16px;
  display: flex; align-items: center; justify-content: space-between;
  cursor: pointer; transition: background .12s;
}
.sp-suggest-item:hover { background: #FAFAFA; }

.sp-suggest-left {
  display: flex; align-items: center; gap: 10px;
  font-size: 14px; font-weight: 500; color: #333;
}
.sp-suggest-icon { color: #ABABAB; flex-shrink:0; }
.sp-suggest-del {
  border: none; background: none; cursor: pointer;
  color: #CBCBCB; display: flex; padding: 4px;
  transition: color .12s;
}
.sp-suggest-del:hover { color: #888; }

/* ── CONTENT ── */
.sp-content { padding: 14px 16px; display: flex; flex-direction: column; gap: 12px; }

.sp-result-header {
  display: flex; align-items: center; justify-content: space-between;
}

.sp-result-count {
  font-size: 13px; color: #777;
}
.sp-result-count strong { color: #1A1A1A; }

.sp-loading {
  text-align: center; padding: 60px 0;
  color: #ABABAB; font-size: 14px; font-weight: 600;
}

.sp-loading-dot {
  display: inline-block;
  width: 8px; height: 8px; border-radius: 50%;
  background: #2563EB; margin: 0 3px;
  animation: bounce .8s infinite ease-in-out;
}
.sp-loading-dot:nth-child(2) { animation-delay: .15s; }
.sp-loading-dot:nth-child(3) { animation-delay: .3s; }
@keyframes bounce {
  0%, 100% { transform: translateY(0); opacity:.5; }
  50%       { transform: translateY(-6px); opacity:1; }
}

.sp-empty {
  padding: 60px 0; display: flex; flex-direction: column;
  align-items: center; gap: 10px; color: #ABABAB;
}
.sp-empty p { font-size: 14px; font-weight: 600; }
.sp-empty small { font-size: 12px; }

/* ── CARD ── */
.sp-card {
  background: #fff; border-radius: 12px;
  border: 1px solid #E2E8F0; overflow: hidden;
  cursor: pointer; transition: box-shadow .15s, transform .15s;
}
.sp-card:hover {
  box-shadow: 0 8px 28px rgba(37,99,235,.08);
  transform: translateY(-1px);
}

.sp-card-inner { display: flex; gap: 12px; padding: 12px; }

.sp-card-img-wrap { position: relative; flex-shrink: 0; }

.sp-card-img {
  width: 110px; height: 110px; border-radius: 10px; object-fit: cover;
}
.sp-card-img-placeholder {
  width: 110px; height: 110px; border-radius: 10px;
  background: #F0FAF1;
  display: flex; align-items: center; justify-content: center;
  color: #B2DFBA;
}

.sp-card-badge {
  position: absolute; top: 7px; left: 7px;
  padding: 3px 8px; border-radius: 999px;
  font-size: 10px; font-weight: 700;
  background: rgba(255,255,255,.95);
  color: #1A1A1A; border: 1px solid #E0E0E0;
}
.sp-card-badge.putri { color: #D64C7F; border-color: #FADADD; background: #FFF5F7; }
.sp-card-badge.putra { color: #2563EB; border-color: #BFDBFE; background: #EFF6FF; }
.sp-card-badge.campur { color: #6D3FC1; border-color: #DDD6FE; background: #F5F3FF; }

.sp-card-body {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column; justify-content: space-between;
  padding: 2px 0;
}

.sp-card-name {
  font-size: 15px; line-height: 1.4; font-weight: 700; color: #1A1A1A;
  display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
  margin-bottom: 4px;
}

.sp-card-loc {
  display: flex; align-items: center; gap: 4px;
  font-size: 12px; color: #ABABAB; margin-bottom: 8px;
}

.sp-card-price {
  font-size: 18px; font-weight: 800; color: #2563EB;
}
.sp-card-price span { font-size: 12px; color: #ABABAB; font-weight: 500; }

.sp-card-no-price { font-size: 12px; color: #D0D0D0; }

@media(max-width:480px) {
  .sp-card-img, .sp-card-img-placeholder { width: 95px; height: 95px; }
  .sp-card-price { font-size: 16px; }
  .sp-card-name { font-size: 14px; }
}
`;

export default function SearchPage() {
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  const [query,          setQuery]          = useState("");
  const [focused,        setFocused]        = useState(false);
  const [results,        setResults]        = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [searched,       setSearched]       = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Gender: multi-select (empty = semua)
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [minPrice,        setMinPrice]         = useState("");
  const [maxPrice,        setMaxPrice]         = useState("");
  const [sort,            setSort]             = useState("");

  const genderAnchorRef = useRef(null);
  const priceAnchorRef  = useRef(null);
  const sortAnchorRef   = useRef(null);

  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); }
    catch { return []; }
  });

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

  const toggleGender = (val) => {
    setSelectedGenders((prev) =>
      prev.includes(val) ? prev.filter((g) => g !== val) : [...prev, val]
    );
  };

  const doSearch = useCallback(
    async (customQuery) => {
      const q = customQuery ?? query;
      if (!q.trim()) return;

      saveHistory(q);
      setLoading(true);
      setSearched(true);
      setFocused(false);
      setActiveDropdown(null);

      const params = new URLSearchParams({ q });
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      if (sort)     params.append("sort", sort);
      if (selectedGenders.length === 1) params.append("genderType", selectedGenders[0].toLowerCase());

      try {
        const res  = await fetch(`${BASE_URL}/listings/search?${params}`);
        const json = await res.json();
        setResults(
          (json.data || []).map((item) => ({
            id:       item.id,
            name:     item.name,
            price:    item.cheapestPrice ?? null,
            location: item.address ?? "",
            gender:   item.genderType ?? "",
            image:    item.thumbnailUrl
              ? item.thumbnailUrl.startsWith("http")
                ? item.thumbnailUrl
                : `${BASE_URL}${item.thumbnailUrl}`
              : null,
          }))
        );
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [query, minPrice, maxPrice, sort, selectedGenders]
  );

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (!val.trim()) { setResults([]); setSearched(false); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 400);
  };

  const genderLabel = selectedGenders.length === 0
    ? "Semua Tipe Kos"
    : selectedGenders.join(", ");

  const priceFiltered = minPrice || maxPrice;
  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label || "Urutkan";

  return (
    <>
      <style>{css}</style>
      <div className="sp-root">

        {/* HEADER */}
        <div className="sp-header">
          <div className="sp-header-top">
            <button className="sp-back-btn" onClick={() => navigate(-1)}>
              <ChevronLeft size={20} />
            </button>

            <div className="sp-search-bar">
              <Search size={16} color="#2563EB" style={{ flexShrink: 0 }} />
              <input
                autoFocus
                value={query}
                onChange={handleInput}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 150)}
                onKeyDown={(e) => e.key === "Enter" && doSearch()}
                placeholder="Coba Tebet Jakarta Selatan"
                className="sp-search-input"
              />
              {query && (
                <button
                  className="sp-clear-btn"
                  onMouseDown={() => { setQuery(""); setResults([]); setSearched(false); }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* FILTER BAR */}
          <div className="sp-filter-bar">
            <div className="sp-filter-row">

              {/* TIPE KOS / GENDER */}
              <div className="sp-chip-wrap" ref={genderAnchorRef}>
                <button
                  className={`sp-chip${activeDropdown === "gender" ? " active" : selectedGenders.length > 0 ? " filtered" : ""}`}
                  onClick={() => setActiveDropdown((p) => p === "gender" ? null : "gender")}
                >
                  <Users size={14} />
                  {genderLabel}
                  <ChevronDown size={14} />
                </button>
              </div>

              {/* HARGA */}
              <div className="sp-chip-wrap" ref={priceAnchorRef}>
                <button
                  className={`sp-chip${activeDropdown === "price" ? " active" : priceFiltered ? " filtered" : ""}`}
                  onClick={() => setActiveDropdown((p) => p === "price" ? null : "price")}
                >
                  Harga
                  <ChevronDown size={14} />
                </button>
              </div>

              {/* URUTKAN */}
              <div className="sp-chip-wrap" ref={sortAnchorRef}>
                <button
                  className={`sp-chip${activeDropdown === "sort" ? " active" : sort ? " filtered" : ""}`}
                  onClick={() => setActiveDropdown((p) => p === "sort" ? null : "sort")}
                >
                  <ArrowUpDown size={14} />
                  {sort ? SORT_OPTIONS.find((o) => o.value === sort)?.label : "Urutkan"}
                  <ChevronDown size={14} />
                </button>
              </div>

            </div>
          </div>

          {/* PORTALED DROPDOWNS — rendered outside overflow container */}
          {activeDropdown === "gender" && (
            <DropdownPortal anchorRef={genderAnchorRef} onClose={() => setActiveDropdown(null)}>
              <div className="sp-dropdown-body">
                <p className="sp-dropdown-subtitle">Tipe kos yang kamu cari berdasarkan gender.</p>
                <div className="sp-check-list">
                  {GENDER_FILTERS.map((g) => (
                    <div key={g.value} className="sp-check-item" onClick={() => toggleGender(g.value)}>
                      <div className={`sp-checkbox${selectedGenders.includes(g.value) ? " checked" : ""}`}>
                        {selectedGenders.includes(g.value) && <Check size={12} color="#fff" />}
                      </div>
                      <span className="sp-check-label">{g.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="sp-dropdown-footer">
                <button className="sp-dd-reset" onClick={() => setSelectedGenders([])}>Hapus</button>
                <button className="sp-dd-save" onClick={() => { doSearch(); setActiveDropdown(null); }}>Simpan</button>
              </div>
            </DropdownPortal>
          )}

          {activeDropdown === "price" && (
            <DropdownPortal anchorRef={priceAnchorRef} onClose={() => setActiveDropdown(null)}>
              <div className="sp-dropdown-body">
                <p className="sp-dropdown-subtitle">Rentang harga per bulan</p>
                <div className="sp-price-row">
                  <input
                    type="number" placeholder="Rp Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="sp-price-input"
                  />
                  <input
                    type="number" placeholder="Rp Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="sp-price-input"
                  />
                </div>
              </div>
              <div className="sp-dropdown-footer">
                <button className="sp-dd-reset" onClick={() => { setMinPrice(""); setMaxPrice(""); }}>Hapus</button>
                <button className="sp-dd-save" onClick={() => { doSearch(); setActiveDropdown(null); }}>Simpan</button>
              </div>
            </DropdownPortal>
          )}

          {activeDropdown === "sort" && (
            <DropdownPortal anchorRef={sortAnchorRef} onClose={() => setActiveDropdown(null)}>
              <div className="sp-dropdown-body" style={{ paddingBottom: 0 }}>
                <div className="sp-sort-list">
                  {SORT_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      className={`sp-sort-item${sort === o.value ? " active" : ""}`}
                      onClick={() => setSort(o.value)}
                    >
                      {o.label}
                      {sort === o.value && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sp-dropdown-footer">
                <button className="sp-dd-reset" onClick={() => setSort("")}>Hapus</button>
                <button className="sp-dd-save" onClick={() => { doSearch(); setActiveDropdown(null); }}>Simpan</button>
              </div>
            </DropdownPortal>
          )}
        </div>

        {/* SUGGESTIONS */}
        {focused && !query && (
          <div className="sp-suggestions">
            {history.length > 0 && (
              <>
                <p className="sp-suggest-label">Pencarian terakhir</p>
                {history.map((h) => (
                  <div key={h} className="sp-suggest-item">
                    <div className="sp-suggest-left" onMouseDown={() => { setQuery(h); doSearch(h); }}>
                      <Clock size={14} className="sp-suggest-icon" />
                      {h}
                    </div>
                    <button className="sp-suggest-del" onMouseDown={(e) => { e.stopPropagation(); deleteHistory(h); }}>
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </>
            )}

            <p className="sp-suggest-label">Trending</p>
            {TRENDS.map((t) => (
              <div key={t} className="sp-suggest-item" onMouseDown={() => { setQuery(t); doSearch(t); }}>
                <div className="sp-suggest-left">
                  <TrendingUp size={14} className="sp-suggest-icon" />
                  {t}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RESULTS */}
        <div className="sp-content">

          {loading && (
            <div className="sp-loading">
              <span className="sp-loading-dot" />
              <span className="sp-loading-dot" />
              <span className="sp-loading-dot" />
            </div>
          )}

          {searched && !loading && results.length === 0 && (
            <div className="sp-empty">
              <Search size={36} color="#D0D0D0" />
              <p>Kost tidak ditemukan</p>
              <small>Coba kata kunci atau filter lain</small>
            </div>
          )}

          {searched && !loading && results.length > 0 && (
            <p className="sp-result-count">
              Ditemukan <strong>{results.length}</strong> kos-kosan
            </p>
          )}

          {results.map((item) => {
            const g = (item.gender || "").toLowerCase();
            const badgeClass = g === "putri" ? " putri" : g === "putra" ? " putra" : g === "campur" ? " campur" : "";
            return (
              <div
                key={item.id}
                className="sp-card"
                onClick={() => navigate(`/detail/${item.id}`)}
              >
                <div className="sp-card-inner">
                  <div className="sp-card-img-wrap">
                    {item.image ? (
                      <img src={item.image} alt="" className="sp-card-img" />
                    ) : (
                      <div className="sp-card-img-placeholder">
                        <Home size={30} strokeWidth={1.5} />
                      </div>
                    )}
                    {item.gender && (
                      <span className={`sp-card-badge${badgeClass}`}>
                        {item.gender}
                      </span>
                    )}
                  </div>

                  <div className="sp-card-body">
                    <div>
                      <p className="sp-card-name">{item.name}</p>
                      <p className="sp-card-loc">
                        <MapPin size={11} style={{ flexShrink: 0 }} />
                        {item.location}
                      </p>
                    </div>

                    {item.price ? (
                      <p className="sp-card-price">
                        Rp {Number(item.price).toLocaleString("id-ID")}
                        <span>/bulan</span>
                      </p>
                    ) : (
                      <p className="sp-card-no-price">Harga belum tersedia</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

        </div>
      </div>
    </>
  );
}