// pages/user/SearchPage.jsx
import React, { useState, useRef, useCallback, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import "leaflet/dist/leaflet.css";
import {
  Search, Clock, TrendingUp, X, MapPin, Home,
  ChevronDown, Check, Users, ArrowUpDown,
  List, Map as MapIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getApiBase, resolveMediaUrl } from "../../config/apiBase";
import { buildAreaSearchQuery, formatPublicLocation, obfuscateCoordinates } from "../../utils/publicLocation";
import { GENDER_OPTIONS } from "../../constants/listing";
import { KABUPATEN_OPTIONS, getKecamatanOptions } from "../../constants/soloRegions";
import { CAMPUS_PRESETS, QUICK_KECAMATAN } from "../../constants/searchLocations";
import SearchSplitMap from "../../components/user/SearchSplitMap";
import UserNavbar, { USER_NAVBAR_CSS } from "../../components/user/UserNavbar";
import UserBottomNav, { USER_BOTTOM_NAV_CSS } from "../../components/user/UserBottomNav";

const API = getApiBase();
const GENDER_FILTERS = GENDER_OPTIONS;

const DROPDOWN_MARGIN = 12;
const DROPDOWN_GAP = 8;
const DROPDOWN_MAX_W = 320;
const MOBILE_DROPDOWN_BP = 768;

function DropdownPortal({ anchorRef, children, onClose }) {
  const [style, setStyle] = useState(null);

  const updatePosition = useCallback(() => {
    const anchor = anchorRef?.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const vw = window.innerWidth;
    const bottomReserve = vw <= MOBILE_DROPDOWN_BP ? 88 : 16;

    if (vw <= MOBILE_DROPDOWN_BP) {
      setStyle({
        position: "fixed",
        top: rect.bottom + DROPDOWN_GAP,
        left: DROPDOWN_MARGIN,
        width: vw - DROPDOWN_MARGIN * 2,
        maxHeight: `calc(100dvh - ${rect.bottom + DROPDOWN_GAP + bottomReserve}px)`,
        overflowY: "auto",
        zIndex: 9999,
      });
      return;
    }

    const panelW = Math.min(DROPDOWN_MAX_W, vw - DROPDOWN_MARGIN * 2);
    let left = rect.left;
    if (left + panelW > vw - DROPDOWN_MARGIN) {
      left = vw - DROPDOWN_MARGIN - panelW;
    }
    if (left < DROPDOWN_MARGIN) left = DROPDOWN_MARGIN;

    setStyle({
      position: "fixed",
      top: rect.bottom + DROPDOWN_GAP,
      left,
      width: panelW,
      maxHeight: `calc(100dvh - ${rect.bottom + DROPDOWN_GAP + bottomReserve}px)`,
      overflowY: "auto",
      zIndex: 9999,
    });
  }, [anchorRef]);

  useLayoutEffect(() => {
    updatePosition();
    const onReposition = () => updatePosition();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [updatePosition]);

  if (!style) return null;

  return createPortal(
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 9998 }} onClick={onClose} aria-hidden />
      <div className="sp-dropdown" style={style}>{children}</div>
    </>,
    document.body
  );
}

const HISTORY_KEY = "atap_search_history";
const TRENDS = ["Kost dekat UNS", "Kost dekat UMS", "Kost Laweyan murah", "Kost Kartasura"];
const SORT_OPTIONS = [
  { value: "relevance", label: "Rekomendasi" },
  { value: "lowest_price", label: "Harga termurah" },
  { value: "highest_price", label: "Harga tertinggi" },
  { value: "newest", label: "Terbaru" },
];

function mapSearchResult(item) {
  const obf =
    item.latitude != null && item.longitude != null
      ? obfuscateCoordinates(item.latitude, item.longitude, String(item.id))
      : null;
  return {
    id: item.id,
    name: item.name,
    price: item.cheapestPrice ?? null,
    location: formatPublicLocation(item.address ?? ""),
    gender: (item.genderType || "").toLowerCase(),
    isPremium: Boolean(item.isPremium),
    latitude: obf?.lat ?? item.latitude ?? null,
    longitude: obf?.lng ?? item.longitude ?? null,
    distanceKm: item.distanceKm ?? null,
    image: resolveMediaUrl(item.thumbnailUrl),
    facilities: Array.isArray(item.facilities) ? item.facilities : [],
  };
}
const PRICE_PRESETS = [{ label: "< Rp 1jt", min: "", max: "1000000" }, { label: "Rp 1–2jt", min: "1000000", max: "2000000" }, { label: "> Rp 2jt", min: "2000000", max: "" }];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

:root {
  --bg-primary: #F8FAFC;
  --bg-secondary: #FFFFFF;
  --bg-tertiary: #F1F5F9;
  --text-primary: #0F172A;
  --text-secondary: #64748B;
  --border-color: #E2E8F0;
  --card-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

body { font-family:'DM Sans',sans-serif; color:var(--text-primary); background:var(--bg-primary); }

.leaflet-marker-icon { overflow:visible !important; }
.leaflet-marker-pane { overflow:visible !important; }
.leaflet-div-icon    { background:transparent !important; border:none !important; overflow:visible !important; }

.sp-root { min-height:100vh; height:100vh; background:var(--bg-primary); display:flex; flex-direction:column; transition:background 0.3s; overflow:hidden; }

/* ── TOOLBAR (search + filter) ── */
.sp-toolbar { flex-shrink:0; z-index:50; background:var(--bg-secondary); border-bottom:1px solid var(--border-color); transition:background 0.3s, border-color 0.3s; }
.sp-toolbar-top { display:flex; align-items:center; gap:10px; padding:12px 16px; }

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
/* ── DROPDOWN ── */
.sp-dropdown { min-width:260px; background:var(--bg-secondary); border-radius:14px; border:1px solid var(--border-color); box-shadow:0 8px 32px rgba(0,0,0,.15); overflow:hidden; animation:dropIn .15s ease; -webkit-overflow-scrolling:touch; }
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
.sp-area-field { display:flex; flex-direction:column; gap:6px; margin-bottom:12px; }
.sp-area-label { font-size:11px; font-weight:700; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.06em; }
.sp-area-select { width:100%; height:40px; border-radius:8px; border:1.5px solid var(--border-color); background:var(--bg-tertiary); padding:0 12px; outline:none; font-size:13px; font-family:'DM Sans',sans-serif; color:var(--text-primary); }
.sp-area-select:disabled { opacity:0.5; cursor:not-allowed; }
.sp-area-quick { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px; }
.sp-area-quick .sp-chip { height:30px; padding:0 12px; font-size:11px; }
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

/* ── SPLIT LAYOUT (desktop — mirip Airbnb) ── */
.sp-body { flex:1; min-height:0; display:flex; flex-direction:column; }
.sp-list-panel { flex:1; min-height:0; overflow-y:auto; display:flex; flex-direction:column; }
.sp-map-panel { display:none; }

.sp-map-wrapper { position:relative; flex-shrink:0; height:220px; }
.sp-view-toggle { position:absolute; bottom:12px; right:12px; z-index:500; display:flex; background:#1A1A1A; border-radius:999px; overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,.25); }
.sp-view-btn { display:flex; align-items:center; gap:6px; padding:8px 14px; border:none; background:transparent; cursor:pointer; font-size:12px; font-weight:700; color:#fff; opacity:.55; font-family:'Plus Jakarta Sans',sans-serif; transition:all .15s; }
.sp-view-btn.active { opacity:1; background:rgba(255,255,255,.15); }

.search-split-map .leaflet-container { width:100% !important; height:100% !important; font-family:'DM Sans',sans-serif; }
.search-split-map .leaflet-control-zoom { border:none !important; box-shadow:0 2px 8px rgba(0,0,0,.15) !important; border-radius:10px !important; overflow:hidden; }
.search-split-map .leaflet-control-zoom a { width:36px !important; height:36px !important; line-height:36px !important; font-size:18px !important; color:#222 !important; border-bottom:1px solid #eee !important; }
.search-split-map .leaflet-control-zoom a:last-child { border-bottom:none !important; }

@media (min-width: 900px) {
  .sp-body.has-split { flex-direction:row; }
  .sp-list-panel { width:52%; max-width:760px; flex-shrink:0; border-right:1px solid var(--border-color); }
  .sp-map-panel {
    display:block;
    flex:1;
    min-width:0;
    position:relative;
    height:100%;
    background:#e8edf2;
  }
  .sp-mobile-map { display:none !important; }
  .sp-content { padding:20px 24px 32px; }
  .sp-card { border-radius:16px; }
  .sp-card-inner { flex-direction:row; padding:14px; gap:16px; align-items:stretch; }
  .sp-card-img, .sp-card-img-placeholder { width:280px; height:200px; border-radius:12px; }
  .sp-card-img-wrap { flex-shrink:0; }
  .sp-card-name { font-size:16px; -webkit-line-clamp:1; }
  .sp-card-price { font-size:18px; }
  .sp-mobile-view-toggle { display:none !important; }
}

/* ── CONTENT ── */
.sp-content { flex:1; padding:14px 16px 24px; display:flex; flex-direction:column; gap:10px; }
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

@media (max-width: 768px) {
  .sp-toolbar-top { padding: 10px 12px; }
  .sp-filter-bar { padding: 6px 12px 10px; }
  .sp-dropdown { min-width: 0; box-sizing: border-box; }
  .sp-content { padding: 12px 12px 16px; }
  .sp-map-wrapper { height: 200px; }
  .sp-card-inner { padding: 10px; gap: 10px; }
}
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
  const [campusPreset, setCampusPreset] = useState(null);
  const [areaKabupaten, setAreaKabupaten] = useState("");
  const [areaKecamatan, setAreaKecamatan] = useState("");

  const genderAnchorRef = useRef(null);
  const priceAnchorRef = useRef(null);
  const sortAnchorRef = useRef(null);
  const areaAnchorRef = useRef(null);

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
    setSelectedGenders((prev) => (prev.includes(val) ? [] : [val]));

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

  const clearLocationFilters = () => {
    setCampusPreset(null);
    setAreaKabupaten("");
    setAreaKecamatan("");
  };

  const applyCampusFilter = (preset) => {
    clearLocationFilters();
    setCampusPreset(preset.id);
    setQuery("");
    queryRef.current = "";
    doSearch("", { lat: preset.lat, lng: preset.lng, radiusKm: preset.radiusKm });
  };

  const applyAreaFilter = (kabupaten, kecamatan) => {
    setCampusPreset(null);
    setAreaKabupaten(kabupaten);
    setAreaKecamatan(kecamatan);
    const qArea = buildAreaSearchQuery(kecamatan, kabupaten);
    setQuery(qArea);
    queryRef.current = qArea;
    doSearch(qArea, null);
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
      const res = await fetch(`${API}/search/listings?${params}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setResults((json.data || []).map(mapSearchResult));
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearLocationFilters();
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
  const areaFiltered = Boolean(areaKabupaten || areaKecamatan);
  const areaChipLabel = areaKecamatan
    ? areaKecamatan
    : areaKabupaten
      ? areaKabupaten.replace(/^Kab\.\s*/i, "").replace(/^Kota\s*/i, "Kota ")
      : "Wilayah";
  const kecamatanOptions = getKecamatanOptions(areaKabupaten);
  const isQuickKecamatanActive = (item) =>
    areaKabupaten === item.kabupaten && areaKecamatan === item.kecamatan && !campusPreset;

  return (
    <>
      <style>{USER_NAVBAR_CSS}</style>
      <style>{USER_BOTTOM_NAV_CSS}</style>
      <style>{css}</style>
      <div className="sp-root user-page-shell">
        <UserNavbar activePath="/search" />

        <div className="sp-toolbar">
          <div className="sp-toolbar-top">
            <div className="sp-search-bar">
              <Search size={15} color="#4F46E5" style={{ flexShrink: 0 }} />
              <input
                autoFocus value={query} onChange={handleInput}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 150)}
                onKeyDown={(e) => e.key === "Enter" && doSearch()}
                placeholder="Cari kos, kecamatan, atau kabupaten…"
                className="sp-search-input"
              />
              {query && (
                <button className="sp-clear-btn" onMouseDown={() => { setQuery(""); setResults([]); setSearched(false); }}>
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

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
              {CAMPUS_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={`sp-chip${campusPreset === preset.id ? " filtered" : ""}`}
                  onClick={() => applyCampusFilter(preset)}
                >
                  <MapPin size={12} /> {preset.label}
                </button>
              ))}
              <div ref={areaAnchorRef}>
                <button
                  type="button"
                  className={`sp-chip${activeDropdown === "area" ? " active" : areaFiltered ? " filtered" : ""}`}
                  onClick={() => setActiveDropdown((p) => (p === "area" ? null : "area"))}
                >
                  <MapPin size={12} />
                  {areaChipLabel}
                  <ChevronDown size={13} />
                </button>
              </div>
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
          {activeDropdown === "area" && (
            <DropdownPortal anchorRef={areaAnchorRef} onClose={() => setActiveDropdown(null)}>
              <div className="sp-dropdown-body">
                <p className="sp-dropdown-subtitle">Filter kabupaten / kecamatan</p>
                <div className="sp-area-field" style={{ marginBottom: 8 }}>
                  <span className="sp-area-label">Kecamatan populer</span>
                  <div className="sp-area-quick">
                    {QUICK_KECAMATAN.map((item) => (
                      <button
                        key={`${item.kabupaten}-${item.kecamatan}`}
                        type="button"
                        className={`sp-chip${isQuickKecamatanActive(item) ? " filtered" : ""}`}
                        onClick={() => {
                          setAreaKabupaten(item.kabupaten);
                          setAreaKecamatan(item.kecamatan);
                          setCampusPreset(null);
                          applyAreaFilter(item.kabupaten, item.kecamatan);
                          setActiveDropdown(null);
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="sp-area-field">
                  <span className="sp-area-label">Kabupaten / Kota</span>
                  <select
                    className="sp-area-select"
                    value={areaKabupaten}
                    onChange={(e) => {
                      setAreaKabupaten(e.target.value);
                      setAreaKecamatan("");
                    }}
                  >
                    <option value="">Semua wilayah</option>
                    {KABUPATEN_OPTIONS.map((kab) => (
                      <option key={kab} value={kab}>{kab}</option>
                    ))}
                  </select>
                </div>
                <div className="sp-area-field">
                  <span className="sp-area-label">Kecamatan</span>
                  <select
                    className="sp-area-select"
                    value={areaKecamatan}
                    disabled={!areaKabupaten || kecamatanOptions.length === 0}
                    onChange={(e) => setAreaKecamatan(e.target.value)}
                  >
                    <option value="">
                      {!areaKabupaten
                        ? "Pilih kabupaten dulu"
                        : kecamatanOptions.length === 0
                          ? "Isi lewat kolom cari"
                          : "Semua kecamatan"}
                    </option>
                    {kecamatanOptions.map((kec) => (
                      <option key={kec} value={kec}>{kec}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="sp-dropdown-footer">
                <button
                  type="button"
                  className="sp-dd-reset"
                  onClick={() => {
                    setAreaKabupaten("");
                    setAreaKecamatan("");
                    setCampusPreset(null);
                    setQuery("");
                    queryRef.current = "";
                    setResults([]);
                    setSearched(false);
                    setActiveDropdown(null);
                  }}
                >
                  Hapus
                </button>
                <button
                  type="button"
                  className="sp-dd-save"
                  onClick={() => {
                    if (!areaKabupaten && !areaKecamatan) {
                      setActiveDropdown(null);
                      return;
                    }
                    applyAreaFilter(areaKabupaten, areaKecamatan);
                    setActiveDropdown(null);
                  }}
                >
                  Terapkan
                </button>
              </div>
            </DropdownPortal>
          )}
        </div>

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

        <div className={`sp-body${hasResults ? " has-split" : ""}`}>
          <div className="sp-list-panel">
            {/* Peta strip — mobile saja */}
            {hasResults && view === "map" && (
              <div className="sp-map-wrapper sp-mobile-map">
                <SearchSplitMap
                  results={results}
                  activePinId={activePinId}
                  onPinClick={(id) => setActivePinId((prev) => (prev === id ? null : id))}
                />
                <div className="sp-view-toggle">
                  <button type="button" className={`sp-view-btn${view === "map" ? " active" : ""}`} onClick={() => setView("map")}><MapIcon size={13} /> Peta</button>
                  <button type="button" className={`sp-view-btn${view === "list" ? " active" : ""}`} onClick={() => setView("list")}><List size={13} /> Daftar</button>
                </div>
              </div>
            )}

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
                    <div className="sp-view-toggle sp-mobile-view-toggle" style={{ position: "static", boxShadow: "none", background: "var(--bg-tertiary)", borderRadius: 999 }}>
                      <button type="button" className={`sp-view-btn${view === "map" ? " active" : ""}`} onClick={() => setView("map")} style={{ color: view === "map" ? "#fff" : "var(--text-secondary)", padding: "5px 10px", opacity: view === "map" ? 1 : 0.7 }}><MapIcon size={12} /> Peta</button>
                      <button type="button" className={`sp-view-btn${view === "list" ? " active" : ""}`} onClick={() => setView("list")} style={{ color: view === "list" ? "#fff" : "var(--text-secondary)", padding: "5px 10px", opacity: view === "list" ? 1 : 0.7 }}><List size={12} /> Daftar</button>
                    </div>
                  </div>
                </div>
              )}

              {hasResults && results.map((item) => {
            const g = (item.gender || "").toLowerCase();
            const genderBadgeClass = g === "putri" ? "sp-badge-gender-putri" : g === "putra" ? "sp-badge-gender-putra" : g === "campur" ? "sp-badge-gender-campur" : "";
            return (
              <div
                key={item.id}
                className={`sp-card${activePinId === item.id ? " highlighted" : ""}`}
                onMouseEnter={() => setActivePinId(item.id)}
                onMouseLeave={() => setActivePinId(null)}
                onClick={() => navigate(`/detail/${item.id}`)}
              >
                <div className="sp-card-inner">
                  <div className="sp-card-img-wrap">
                    {item.image ? <img src={item.image} alt={item.name} className="sp-card-img" /> : <div className="sp-card-img-placeholder"><Home size={28} strokeWidth={1.5} /></div>}
                  </div>
                  <div className="sp-card-body">
                    <div>
                      <div className="sp-card-badges">
                        {item.gender && genderBadgeClass && (
                          <span className={`sp-badge ${genderBadgeClass}`}>
                            {item.gender.charAt(0).toUpperCase() + item.gender.slice(1)}
                          </span>
                        )}
                      </div>
                      <p className="sp-card-name">{item.name}</p>
                      <p className="sp-card-loc">
                        <MapPin size={10} style={{ flexShrink: 0 }} />
                        {item.location}
                        {item.distanceKm != null && (
                          <span style={{ marginLeft: 6, color: "#4F46E5", fontWeight: 600 }}>
                            · {item.distanceKm < 1
                              ? `${Math.round(item.distanceKm * 1000)} m`
                              : `${item.distanceKm.toFixed(1)} km`}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="sp-card-bottom">
                      {item.price != null
                        ? <p className="sp-card-price">Rp {Number(item.price).toLocaleString("id-ID")}<span>/bln</span></p>
                        : <p className="sp-card-no-price">Harga belum tersedia</p>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
            </div>
          </div>

          {hasResults && (
            <div className="sp-map-panel">
              <SearchSplitMap
                results={results}
                activePinId={activePinId}
                onPinClick={(id) => setActivePinId((prev) => (prev === id ? null : id))}
              />
            </div>
          )}
        </div>
        <UserBottomNav />
      </div>
    </>
  );
}