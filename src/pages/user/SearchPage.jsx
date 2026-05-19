// pages/user/SearchPage.jsx
import React, { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Search, Clock, TrendingUp, X, MapPin, Home,
  ChevronLeft, ChevronDown, Check, Users, ArrowUpDown,
  List, Map as MapIcon, Star, BadgeCheck, Crown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function createPriceIcon(price, active = false) {
  const label = price >= 1_000_000
    ? `Rp ${(price / 1_000_000).toFixed(1).replace(".0", "")}jt`
    : `Rp ${Math.round(price / 1_000)}rb`;
  const bg = active ? "#4F46E5" : "#ffffff";
  const color = active ? "#ffffff" : "#1A1A1A";
  const border = active ? "#4338CA" : "#CBD5E1";
  const shadow = active ? "0 4px 18px rgba(79,70,229,.55)" : "0 2px 10px rgba(0,0,0,.20)";
  const tip = active ? "#4F46E5" : "#ffffff";
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;display:inline-flex;align-items:center;justify-content:center;background:${bg};color:${color};padding:5px 12px;border-radius:999px;font-size:12px;font-weight:800;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;white-space:nowrap;cursor:pointer;box-shadow:${shadow};border:2px solid ${border};line-height:1.2;user-select:none;letter-spacing:-0.2px;">${label}<span style="position:absolute;bottom:-7px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid ${border};display:block;"></span><span style="position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid ${tip};display:block;"></span></div>`,
    iconSize: [90, 32], iconAnchor: [45, 39], popupAnchor: [0, -42],
  });
}

function FitBounds({ results }) {
  const map = useMap();
  useEffect(() => {
    const pts = results.filter((r) => r.latitude && r.longitude);
    if (!pts.length) return;
    if (pts.length === 1) map.setView([pts[0].latitude, pts[0].longitude], 15, { animate: true });
    else map.fitBounds(L.latLngBounds(pts.map((r) => [r.latitude, r.longitude])), { padding: [48, 48], animate: true });
  }, [results, map]);
  return null;
}

const SOLO_CENTER = [-7.5755, 110.8243];

function LeafletMap({ results, activePinId, onPinClick }) {
  return (
    <div style={{ position: "relative", width: "100%", height: 240, flexShrink: 0 }}>
      <MapContainer center={SOLO_CENTER} zoom={13} style={{ width: "100%", height: "100%" }} zoomControl={false}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitBounds results={results} />
        {results.map((item) => item.latitude && item.longitude ? (
          <Marker key={item.id} position={[item.latitude, item.longitude]} icon={createPriceIcon(item.price, activePinId === item.id)} eventHandlers={{ click: () => onPinClick(item.id) }} />
        ) : null)}
      </MapContainer>
    </div>
  );
}

function DropdownPortal({ anchorRef, children, onClose }) {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  useEffect(() => {
    if (!anchorRef?.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + window.scrollY + 8, left: r.left + window.scrollX });
  }, [anchorRef]);
  return createPortal(
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 9998 }} onClick={onClose} />
      <div className="sp-dropdown" style={{ position: "absolute", top: pos.top, left: pos.left, zIndex: 9999 }}>{children}</div>
    </>,
    document.body
  );
}

const BASE_URL = "http://localhost:3000";
const HISTORY_KEY = "atap_search_history";
const TRENDS = ["Kost dekat UNS", "Kost Laweyan murah", "Kost AC wifi", "Kost Nusukan putri"];
const GENDER_FILTERS = [{ value: "PUTRA", label: "Putra" }, { value: "PUTRI", label: "Putri" }, { value: "CAMPUR", label: "Campur" }];
const SORT_OPTIONS = [{ value: "relevance", label: "Terdekat dulu" }, { value: "lowest_price", label: "Harga termurah" }, { value: "highest_price", label: "Harga tertinggi" }, { value: "newest", label: "Terbaru" }];
const UNS_COORDS = { lat: -7.5583, lng: 110.8572 };
const PRICE_PRESETS = [{ label: "< Rp 1jt", min: "", max: "1000000" }, { label: "Rp 1–2jt", min: "1000000", max: "2000000" }, { label: "> Rp 2jt", min: "2000000", max: "" }];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

/* ── DARK MODE VARIABLES ── */
:root {
  --bg-primary: #F8FAFC;
  --bg-secondary: #FFFFFF;
  --bg-tertiary: #F1F5F9;
  --text-primary: #0F172A;
  --text-secondary: #64748B;
  --border-color: #E2E8F0;
  --card-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.dark-mode {
  --bg-primary: #0F172A;
  --bg-secondary: #1E293B;
  --bg-tertiary: #334155;
  --text-primary: #F8FAFC;
  --text-secondary: #CBD5E1;
  --border-color: #334155;
  --card-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

body { font-family:'DM Sans',sans-serif; color:var(--text-primary); background:var(--bg-primary); }

.leaflet-marker-icon { overflow:visible !important; }
.leaflet-marker-pane { overflow:visible !important; }
.leaflet-div-icon    { background:transparent !important; border:none !important; overflow:visible !important; }

.sp-root { min-height:100vh; background:var(--bg-primary); display:flex; flex-direction:column; transition:background 0.3s; }

/* ── HEADER ── */
.sp-header { position:sticky; top:0; z-index:200; background:var(--bg-secondary); border-bottom:1px solid var(--border-color); transition:background 0.3s, border-color 0.3s; }
.sp-header-top { display:flex; align-items:center; gap:10px; padding:12px 16px; }
.sp-back-btn { width:36px; height:36px; border:none; background:none; display:flex; align-items:center; justify-content:center; cursor:pointer; border-radius:50%; color:var(--text-primary); flex-shrink:0; transition:background .15s; }
.sp-back-btn:hover { background:var(--bg-tertiary); }

.sp-search-bar { flex:1; display:flex; align-items:center; gap:10px; height:44px; border:1.5px solid var(--border-color); border-radius:10px; padding:0 14px; background:var(--bg-tertiary); transition:border-color .15s, background .15s; }
.sp-search-bar:focus-within { border-color:#4F46E5; background:var(--bg-secondary); }
.sp-search-input { flex:1; border:none; background:transparent; font-size:14px; font-family:'Plus Jakarta Sans',sans-serif; color:var(--text-primary); outline:none; }
.sp-search-input::placeholder { color:var(--text-secondary); }
.sp-clear-btn { border:none; background:none; cursor:pointer; color:var(--text-secondary); display:flex; align-items:center; transition:color .15s; }
.sp-clear-btn:hover { color:var(--text-primary); }

/* ── FILTER CHIPS ── */
.sp-filter-bar { padding:8px 16px 12px; overflow-x:auto; }
.sp-filter-bar::-webkit-scrollbar { display:none; }
.sp-filter-row { display:flex; gap:8px; min-width:max-content; }
.sp-chip { height:34px; padding:0 14px; border:1.5px solid var(--border-color); border-radius:999px; background:var(--bg-secondary); display:flex; align-items:center; gap:6px; cursor:pointer; white-space:nowrap; font-size:12px; font-weight:600; color:var(--text-secondary); font-family:'Plus Jakarta Sans',sans-serif; transition:all .15s; }
.sp-chip:hover { border-color:var(--text-secondary); }
.sp-chip.active   { border-color:var(--text-primary); background:var(--text-primary); color:var(--bg-secondary); }
.sp-chip.filtered { border-color:#4F46E5; color:#4F46E5; background:#EEF2FF; }
.dark-mode .sp-chip.filtered { background:rgba(79,70,229,0.15); }

/* ── DROPDOWN ── */
.sp-dropdown { min-width:260px; background:var(--bg-secondary); border-radius:14px; border:1px solid var(--border-color); box-shadow:0 8px 32px rgba(0,0,0,.15); overflow:hidden; animation:dropIn .15s ease; }
@keyframes dropIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
.sp-dropdown-body { padding:16px 18px 10px; }
.sp-dropdown-subtitle { font-size:12px; color:var(--text-secondary); margin-bottom:12px; }
.sp-check-list { display:flex; flex-direction:column; }
.sp-check-item { display:flex; align-items:center; gap:12px; padding:11px 0; cursor:pointer; border-bottom:1px solid var(--border-color); }
.sp-check-item:last-child { border-bottom:none; }
.sp-checkbox { width:20px; height:20px; border-radius:5px; border:1.5px solid var(--border-color); display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:.15s; }
.sp-checkbox.checked { background:#4F46E5; border-color:#4F46E5; }
.sp-check-label { font-size:14px; font-weight:500; color:var(--text-primary); }
.sp-price-row { display:flex; gap:8px; }
.sp-price-input { flex:1; height:40px; border-radius:8px; border:1.5px solid var(--border-color); background:var(--bg-tertiary); padding:0 12px; outline:none; font-size:13px; font-family:'Plus Jakarta Sans',sans-serif; color:var(--text-primary); transition:border-color .15s, background .15s; }
.sp-price-input:focus { background:var(--bg-secondary); border-color:#4F46E5; }
.sp-price-input::placeholder { color:var(--text-secondary); }
.sp-sort-list { display:flex; flex-direction:column; }
.sp-sort-item { height:46px; border:none; background:none; display:flex; align-items:center; justify-content:space-between; padding:0 4px; cursor:pointer; font-size:14px; font-weight:500; color:var(--text-primary); font-family:'Plus Jakarta Sans',sans-serif; border-bottom:1px solid var(--border-color); transition:color .15s; }
.sp-sort-item:last-child { border-bottom:none; }
.sp-sort-item:hover { color:#4F46E5; }
.sp-sort-item.active { color:#4F46E5; font-weight:700; }
.sp-dropdown-footer { display:flex; align-items:center; justify-content:space-between; padding:12px 18px; border-top:1px solid var(--border-color); }
.sp-dd-reset { border:none; background:none; font-size:13px; font-weight:600; color:var(--text-secondary); cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; text-decoration:underline; }
.sp-dd-save { border:none; background:#4F46E5; color:#fff; font-size:13px; font-weight:700; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; padding:8px 20px; border-radius:9px; transition:background .15s; }
.sp-dd-save:hover { background:#4338CA; }

/* ── SUGGESTIONS ── */
.sp-suggestions { background:var(--bg-secondary); border-bottom:1px solid var(--border-color); }
.sp-suggest-label { padding:14px 16px 6px; font-size:11px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:var(--text-secondary); }
.sp-suggest-item { padding:11px 16px; display:flex; align-items:center; justify-content:space-between; cursor:pointer; transition:background .12s; }
.sp-suggest-item:hover { background:var(--bg-tertiary); }
.sp-suggest-left { display:flex; align-items:center; gap:10px; font-size:14px; font-weight:500; color:var(--text-primary); }
.sp-suggest-icon { color:var(--text-secondary); flex-shrink:0; }
.sp-suggest-del { border:none; background:none; cursor:pointer; color:var(--text-secondary); display:flex; padding:4px; transition:color .12s; }
.sp-suggest-del:hover { color:var(--text-primary); }

/* ── MAP WRAPPER ── */
.sp-map-wrapper { position:relative; flex-shrink:0; }
.sp-view-toggle { position:absolute; bottom:12px; right:12px; display:flex; background:#1A1A1A; border-radius:999px; overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,.25); }
.sp-view-btn { display:flex; align-items:center; gap:6px; padding:8px 14px; border:none; background:transparent; cursor:pointer; font-size:12px; font-weight:700; color:#fff; opacity:.55; font-family:'Plus Jakarta Sans',sans-serif; transition:all .15s; }
.sp-view-btn.active { opacity:1; background:rgba(255,255,255,.15); }

/* ── CONTENT ── */
.sp-content { flex:1; padding:14px 16px; display:flex; flex-direction:column; gap:10px; }
.sp-result-header { display:flex; align-items:center; justify-content:space-between; }
.sp-result-count { font-size:13px; color:var(--text-secondary); font-weight:500; }
.sp-result-count strong { color:var(--text-primary); }
.sp-sort-label { font-size:12px; color:var(--text-secondary); }

/* loading */
.sp-loading { text-align:center; padding:60px 0; color:var(--text-secondary); font-size:14px; }
.sp-loading-dot { display:inline-block; width:8px; height:8px; border-radius:50%; background:#4F46E5; margin:0 3px; animation:bounce .8s infinite ease-in-out; }
.sp-loading-dot:nth-child(2) { animation-delay:.15s; }
.sp-loading-dot:nth-child(3) { animation-delay:.3s; }
@keyframes bounce { 0%,100%{transform:translateY(0);opacity:.4} 50%{transform:translateY(-6px);opacity:1} }

/* empty */
.sp-empty { padding:60px 0; display:flex; flex-direction:column; align-items:center; gap:8px; color:var(--text-secondary); }
.sp-empty p { font-size:14px; font-weight:600; }
.sp-empty small { font-size:12px; }

/* ── CARD ── */
.sp-card { background:var(--bg-secondary); border-radius:14px; border:1px solid var(--border-color); overflow:hidden; cursor:pointer; transition:box-shadow .15s, transform .15s, border-color .15s; }
.sp-card:hover { box-shadow:0 6px 24px rgba(79,70,229,.1); transform:translateY(-1px); }
.sp-card.highlighted { border-color:#4F46E5; box-shadow:0 0 0 2px #EEF2FF; }
.dark-mode .sp-card.highlighted { box-shadow:0 0 0 2px rgba(79,70,229,.3); }
.sp-card-inner { display:flex; gap:12px; padding:12px; }
.sp-card-img-wrap { position:relative; flex-shrink:0; }
.sp-card-img { width:108px; height:108px; border-radius:10px; object-fit:cover; }
.sp-card-img-placeholder { width:108px; height:108px; border-radius:10px; background:var(--bg-tertiary); display:flex; align-items:center; justify-content:center; color:var(--text-secondary); }
.sp-card-badges { display:flex; align-items:center; gap:6px; margin-bottom:5px; flex-wrap:wrap; }
.sp-badge { display:inline-flex; align-items:center; gap:3px; padding:3px 8px; border-radius:5px; font-size:10px; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; }
.sp-badge-unggulan      { background:#FFF3EB; color:#D4621A; border:1px solid #FCDCC5; }
.sp-badge-verified      { background:#EDFAF3; color:#15803D; border:1px solid #BBF7D0; }
.sp-badge-gender-putri  { background:#FFF0F5; color:#C2185B; border:1px solid #FBCFE8; }
.sp-badge-gender-putra  { background:#EFF6FF; color:#1D4ED8; border:1px solid #BFDBFE; }
.sp-badge-gender-campur { background:#F5F3FF; color:#6D28D9; border:1px solid #DDD6FE; }
.sp-card-body { flex:1; min-width:0; display:flex; flex-direction:column; justify-content:space-between; padding:2px 0; }
.sp-card-name { font-size:15px; font-weight:700; color:var(--text-primary); line-height:1.35; font-family:'Plus Jakarta Sans',sans-serif; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; margin-bottom:3px; }
.sp-card-loc { display:flex; align-items:center; gap:4px; font-size:11px; color:var(--text-secondary); margin-bottom:8px; }
.sp-card-bottom { display:flex; align-items:flex-end; justify-content:space-between; }
.sp-card-price { font-size:17px; font-weight:800; color:#4F46E5; font-family:'Plus Jakarta Sans',sans-serif; }
.sp-card-price span { font-size:11px; color:var(--text-secondary); font-weight:500; }
.sp-card-no-price { font-size:12px; color:var(--text-secondary); }
.sp-card-rating { display:flex; align-items:center; gap:3px; font-size:11px; font-weight:600; color:#F59E0B; font-family:'Plus Jakarta Sans',sans-serif; }
.sp-card-rating span { color:var(--text-secondary); font-weight:400; }

@media(max-width:480px) {
  .sp-card-img, .sp-card-img-placeholder { width:92px; height:92px; }
  .sp-card-price { font-size:15px; }
  .sp-card-name  { font-size:13px; }
}
`;

export default function SearchPage() {
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [view, setView] = useState("map");
  const [activePinId, setActivePinId] = useState(null);

  const [selectedGenders, setSelectedGenders] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("relevance");
  const [pricePreset, setPricePreset] = useState(null);

  const genderAnchorRef = useRef(null);
  const priceAnchorRef = useRef(null);
  const sortAnchorRef = useRef(null);

  const minPriceRef = useRef(minPrice);
  const maxPriceRef = useRef(maxPrice);
  const sortRef = useRef(sort);
  const selectedGendersRef = useRef(selectedGenders);
  const queryRef = useRef(query);

  useEffect(() => { minPriceRef.current = minPrice; }, [minPrice]);
  useEffect(() => { maxPriceRef.current = maxPrice; }, [maxPrice]);
  useEffect(() => { sortRef.current = sort; }, [sort]);
  useEffect(() => { selectedGendersRef.current = selectedGenders; }, [selectedGenders]);
  useEffect(() => { queryRef.current = query; }, [query]);

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

  const toggleGender = (val) =>
    setSelectedGenders((prev) => prev.includes(val) ? prev.filter((g) => g !== val) : [...prev, val]);

  const applyPreset = (p) => {
    if (pricePreset === p.label) {
      setPricePreset(null);
      setMinPrice(""); minPriceRef.current = "";
      setMaxPrice(""); maxPriceRef.current = "";
    } else {
      setPricePreset(p.label);
      setMinPrice(p.min); minPriceRef.current = p.min;
      setMaxPrice(p.max); maxPriceRef.current = p.max;
    }
    doSearch();
  };

  const doSearch = useCallback(async (customQuery, customCoords) => {
    const q = (customQuery ?? queryRef.current).trim();
    if (q) saveHistory(q);
    setLoading(true); setSearched(true); setFocused(false); setActiveDropdown(null);
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    if (minPriceRef.current) params.append("minPrice", minPriceRef.current);
    if (maxPriceRef.current) params.append("maxPrice", maxPriceRef.current);
    params.append("sort", sortRef.current);
    if (selectedGendersRef.current.length >= 1) params.append("genderType", selectedGendersRef.current[0]);
    if (customCoords) { params.append("lat", customCoords.lat); params.append("lng", customCoords.lng); params.append("radiusKm", customCoords.radiusKm ?? 2); }
    try {
      const res = await fetch(`${BASE_URL}/search/listings?${params}`);
      const json = await res.json();
      setResults((json.data || []).map((item) => ({
        id: item.id, name: item.name, price: item.cheapestPrice ?? null,
        location: item.address ?? "", gender: item.genderType ?? "",
        isPremium: item.isPremium ?? false, isVerified: item.isVerified ?? true,
        rating: item.rating ?? null, reviewCount: item.reviewCount ?? null,
        latitude: item.latitude ? Number(item.latitude) : null,
        longitude: item.longitude ? Number(item.longitude) : null,
        image: item.thumbnailUrl ? (item.thumbnailUrl.startsWith("http") ? item.thumbnailUrl : `${BASE_URL}${item.thumbnailUrl}`) : null,
      })));
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (!val.trim()) { setResults([]); setSearched(false); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 400);
  };

  const genderLabel = selectedGenders.length === 0
    ? "Tipe Kos"
    : selectedGenders.map((g) => g.charAt(0) + g.slice(1).toLowerCase()).join(", ");
  const priceFiltered = minPrice || maxPrice;
  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label;
  const hasResults = searched && !loading && results.length > 0;

  return (
    <>
      <style>{css}</style>
      <div className="sp-root">

        {/* HEADER */}
        <div className="sp-header">
          <div className="sp-header-top">
            <button className="sp-back-btn" onClick={() => navigate(-1)}><ChevronLeft size={20} /></button>
            <div className="sp-search-bar">
              <Search size={15} color="#4F46E5" style={{ flexShrink: 0 }} />
              <input
                autoFocus value={query} onChange={handleInput}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 150)}
                onKeyDown={(e) => e.key === "Enter" && doSearch()}
                placeholder="Cari kos dekat UNS, Laweyan…"
                className="sp-search-input"
              />
              {query && (
                <button className="sp-clear-btn" onMouseDown={() => { setQuery(""); setResults([]); setSearched(false); }}>
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* FILTER CHIPS */}
          <div className="sp-filter-bar">
            <div className="sp-filter-row">
              <button className={`sp-chip${(selectedGenders.length > 0 || priceFiltered || sort !== "relevance") ? " filtered" : ""}`} style={{ gap: 6 }}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                Filter
              </button>
              <div ref={genderAnchorRef}>
                <button className={`sp-chip${activeDropdown === "gender" ? " active" : selectedGenders.length > 0 ? " filtered" : ""}`} onClick={() => setActiveDropdown((p) => p === "gender" ? null : "gender")}>
                  <Users size={13} />{genderLabel}<ChevronDown size={13} />
                </button>
              </div>
              {PRICE_PRESETS.map((p) => (
                <button key={p.label} className={`sp-chip${pricePreset === p.label ? " filtered" : ""}`} onClick={() => applyPreset(p)}>{p.label}</button>
              ))}
              <div ref={priceAnchorRef}>
                <button className={`sp-chip${activeDropdown === "price" ? " active" : (priceFiltered && !pricePreset) ? " filtered" : ""}`} onClick={() => setActiveDropdown((p) => p === "price" ? null : "price")}>
                  Harga Lain <ChevronDown size={13} />
                </button>
              </div>
              <div ref={sortAnchorRef}>
                <button className={`sp-chip${activeDropdown === "sort" ? " active" : sort !== "relevance" ? " filtered" : ""}`} onClick={() => setActiveDropdown((p) => p === "sort" ? null : "sort")}>
                  <ArrowUpDown size={13} />{activeSortLabel}<ChevronDown size={13} />
                </button>
              </div>
              <button className="sp-chip" onClick={() => { setQuery(""); doSearch("", { ...UNS_COORDS, radiusKm: 2 }); }}>
                <MapPin size={12} /> Dekat UNS
              </button>
            </div>
          </div>

          {/* DROPDOWNS */}
          {activeDropdown === "gender" && (
            <DropdownPortal anchorRef={genderAnchorRef} onClose={() => setActiveDropdown(null)}>
              <div className="sp-dropdown-body">
                <p className="sp-dropdown-subtitle">Pilih tipe kos berdasarkan gender</p>
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
                <button className="sp-dd-save" onClick={() => { doSearch(); setActiveDropdown(null); }}>Terapkan</button>
              </div>
            </DropdownPortal>
          )}
          {activeDropdown === "price" && (
            <DropdownPortal anchorRef={priceAnchorRef} onClose={() => setActiveDropdown(null)}>
              <div className="sp-dropdown-body">
                <p className="sp-dropdown-subtitle">Rentang harga per bulan</p>
                <div className="sp-price-row">
                  <input type="number" placeholder="Rp Min" value={minPrice} onChange={(e) => { setMinPrice(e.target.value); minPriceRef.current = e.target.value; setPricePreset(null); }} className="sp-price-input" />
                  <input type="number" placeholder="Rp Max" value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); maxPriceRef.current = e.target.value; setPricePreset(null); }} className="sp-price-input" />
                </div>
              </div>
              <div className="sp-dropdown-footer">
                <button className="sp-dd-reset" onClick={() => { setMinPrice(""); minPriceRef.current = ""; setMaxPrice(""); maxPriceRef.current = ""; setPricePreset(null); }}>Hapus</button>
                <button className="sp-dd-save" onClick={() => { doSearch(); setActiveDropdown(null); }}>Terapkan</button>
              </div>
            </DropdownPortal>
          )}
          {activeDropdown === "sort" && (
            <DropdownPortal anchorRef={sortAnchorRef} onClose={() => setActiveDropdown(null)}>
              <div className="sp-dropdown-body">
                <p className="sp-dropdown-subtitle">Urutkan hasil pencarian</p>
                <div className="sp-sort-list">
                  {SORT_OPTIONS.map((o) => (
                    <button key={o.value} className={`sp-sort-item${sort === o.value ? " active" : ""}`} onClick={() => { setSort(o.value); sortRef.current = o.value; doSearch(); setActiveDropdown(null); }}>
                      {o.label}{sort === o.value && <Check size={14} color="#4F46E5" />}
                    </button>
                  ))}
                </div>
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
                      <Clock size={14} className="sp-suggest-icon" /> {h}
                    </div>
                    <button className="sp-suggest-del" onMouseDown={(e) => { e.stopPropagation(); deleteHistory(h); }}><X size={13} /></button>
                  </div>
                ))}
              </>
            )}
            <p className="sp-suggest-label">Trending</p>
            {TRENDS.map((t) => (
              <div key={t} className="sp-suggest-item" onMouseDown={() => { setQuery(t); doSearch(t); }}>
                <div className="sp-suggest-left"><TrendingUp size={14} className="sp-suggest-icon" /> {t}</div>
              </div>
            ))}
          </div>
        )}

        {/* MAP */}
        {hasResults && view === "map" && (
          <div className="sp-map-wrapper">
            <LeafletMap results={results} activePinId={activePinId} onPinClick={(id) => setActivePinId((prev) => prev === id ? null : id)} />
            <div className="sp-view-toggle">
              <button className={`sp-view-btn${view === "map" ? " active" : ""}`} onClick={() => setView("map")}><MapIcon size={13} /> Peta</button>
              <button className={`sp-view-btn${view === "list" ? " active" : ""}`} onClick={() => setView("list")}><List size={13} /> Daftar</button>
            </div>
          </div>
        )}

        {/* RESULTS */}
        <div className="sp-content">
          {loading && (
            <div className="sp-loading">
              <span className="sp-loading-dot" /><span className="sp-loading-dot" /><span className="sp-loading-dot" />
            </div>
          )}
          {searched && !loading && results.length === 0 && (
            <div className="sp-empty"><Search size={36} color="var(--text-secondary)" /><p>Kost tidak ditemukan</p><small>Coba kata kunci atau filter lain</small></div>
          )}
          {hasResults && (
            <div className="sp-result-header">
              <p className="sp-result-count"><strong>{results.length}</strong> hunian ditemukan</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="sp-sort-label">{activeSortLabel}</span>
                {view === "list" && (
                  <div className="sp-view-toggle" style={{ position: "static", boxShadow: "none", background: "var(--bg-tertiary)", borderRadius: 999 }}>
                    <button className={`sp-view-btn${view === "map" ? " active" : ""}`} onClick={() => setView("map")} style={{ color: "var(--text-secondary)", padding: "5px 10px" }}><MapIcon size={12} /> Peta</button>
                    <button className={`sp-view-btn${view === "list" ? " active" : ""}`} onClick={() => setView("list")} style={{ color: "var(--text-secondary)", padding: "5px 10px" }}><List size={12} /> Daftar</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {results.map((item) => {
            const g = (item.gender || "").toLowerCase();
            const genderBadgeClass = g === "putri" ? "sp-badge-gender-putri" : g === "putra" ? "sp-badge-gender-putra" : g === "campur" ? "sp-badge-gender-campur" : "";
            return (
              <div key={item.id} className={`sp-card${activePinId === item.id ? " highlighted" : ""}`} onClick={() => navigate(`/detail/${item.id}`)}>
                <div className="sp-card-inner">
                  <div className="sp-card-img-wrap">
                    {item.image ? <img src={item.image} alt={item.name} className="sp-card-img" /> : <div className="sp-card-img-placeholder"><Home size={28} strokeWidth={1.5} /></div>}
                  </div>
                  <div className="sp-card-body">
                    <div>
                      <div className="sp-card-badges">
                        {item.isPremium && <span className="sp-badge sp-badge-unggulan"><Crown size={9} /> UNGGULAN</span>}
                        {item.isVerified && <span className="sp-badge sp-badge-verified"><BadgeCheck size={9} /> Verified</span>}
                        {item.gender && genderBadgeClass && <span className={`sp-badge ${genderBadgeClass}`}>{item.gender.charAt(0) + item.gender.slice(1).toLowerCase()}</span>}
                      </div>
                      <p className="sp-card-name">{item.name}</p>
                      <p className="sp-card-loc"><MapPin size={10} style={{ flexShrink: 0 }} />{item.location}</p>
                    </div>
                    <div className="sp-card-bottom">
                      {item.price ? <p className="sp-card-price">Rp {Number(item.price).toLocaleString("id-ID")}<span>/bln</span></p> : <p className="sp-card-no-price">Harga belum tersedia</p>}
                      {item.rating && <div className="sp-card-rating"><Star size={11} fill="#F59E0B" stroke="none" />{item.rating}{item.reviewCount && <span>({item.reviewCount})</span>}</div>}
                    </div>
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