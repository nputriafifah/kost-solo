// pages/user/AllListingsPage.jsx
// Route: <Route path="/semua" element={<AllListingsPage />} />

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  ChevronLeft,
  SlidersHorizontal,
  Search,
  AlertCircle,
  RefreshCw,
  SearchX,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import KostCard from "../../components/kost/KostCard";

/* =========================================================
   SKELETON
========================================================= */
function KostCardSkeleton() {
  return (
    <div className="al-skeleton">
      <div className="al-skeleton-img" />
      <div className="al-skeleton-body">
        <div className="al-skeleton-line" style={{ width: "75%" }} />
        <div className="al-skeleton-line" style={{ width: "50%", height: 10, opacity: 0.6 }} />
        <div className="al-skeleton-line" style={{ width: "65%" }} />
      </div>
    </div>
  );
}

/* =========================================================
   CONSTANTS
========================================================= */
const GENDER_FILTERS = ["Semua", "Putra", "Putri", "Campur"];

const SORT_OPTIONS = [
  { value: "", label: "Paling Direkomendasikan" },
  { value: "lowest_price", label: "Harga Termurah" },
  { value: "highest_price", label: "Harga Tertinggi" },
  { value: "newest", label: "Terbaru" },
];

/* =========================================================
   COMPONENT
========================================================= */
export default function AllListingsPage() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeGender, setActiveGender] = useState("Semua");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortRef = useRef(null);

  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [tmpGender, setTmpGender] = useState("Semua");
  const [tmpMin, setTmpMin] = useState("");
  const [tmpMax, setTmpMax] = useState("");
  const [tmpSort, setTmpSort] = useState("");

  const [favorites, setFavorites] = useState([]);

  // AI tagline
  const [aiTagline, setAiTagline] = useState("");
  const [aiLoading, setAiLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = !!user;
  const token = localStorage.getItem("token");

  /* ---------- close sort dropdown on outside click ---------- */
  useEffect(() => {
    const handler = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target))
        setShowSortDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ---------- AI tagline via Anthropic API ---------- */
  useEffect(() => {
    const fetchTagline = async () => {
      setAiLoading(true);
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [
              {
                role: "user",
                content:
                  "Buatkan tagline singkat 1 kalimat (maksimal 12 kata) untuk banner halaman listing kost di aplikasi bernama Atap. Tagline harus menarik, natural berbahasa Indonesia, tidak perlu tanda kutip, tidak perlu nomor. Langsung tulis taglinenya saja.",
              },
            ],
          }),
        });
        const json = await res.json();
        const text = json?.content?.[0]?.text?.trim() || "";
        setAiTagline(text);
      } catch {
        setAiTagline("Kost impian kamu ada di sini.");
      } finally {
        setAiLoading(false);
      }
    };
    fetchTagline();
  }, []);

  /* ---------- lock body scroll ---------- */
  useEffect(() => {
    document.body.style.overflow = showFilterDrawer ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showFilterDrawer]);

  const openDrawer = () => {
    setTmpGender(activeGender);
    setTmpMin(minPrice);
    setTmpMax(maxPrice);
    setTmpSort(sort);
    setShowFilterDrawer(true);
  };

  const applyFilter = () => {
    setActiveGender(tmpGender);
    setMinPrice(tmpMin);
    setMaxPrice(tmpMax);
    setSort(tmpSort);
    setShowFilterDrawer(false);
  };

  /* ---------- favorites ---------- */
  useEffect(() => {
    if (!isLoggedIn) return;
    fetch("http://localhost:3000/favorites", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((j) => setFavorites((j.data || []).map((x) => String(x.id))))
      .catch(console.error);
  }, [isLoggedIn, token]);

  const handleToggleLike = async (id) => {
    if (!isLoggedIn) { navigate("/auth"); return; }
    const idStr = String(id);
    const isLiked = favorites.includes(idStr);
    try {
      const res = await fetch(`http://localhost:3000/favorites/${idStr}`, {
        method: isLiked ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setFavorites((p) =>
        isLiked ? p.filter((f) => f !== idStr) : [...p, idStr]
      );
    } catch { }
  };

  /* ---------- fetch listings ---------- */
  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:3000/listings");
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      const raw = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : [];
      setData(
        raw.map((item) => {
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
        })
      );
    } catch {
      setError("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, []);

  /* ---------- filter + sort ---------- */
  const filteredData = useMemo(() => {
    let list = [...data];
    if (activeGender !== "Semua")
      list = list.filter((item) => item.gender?.toLowerCase() === activeGender.toLowerCase());
    if (minPrice) list = list.filter((item) => item.price >= Number(minPrice));
    if (maxPrice) list = list.filter((item) => item.price <= Number(maxPrice));
    if (sort === "lowest_price") list.sort((a, b) => a.price - b.price);
    else if (sort === "highest_price") list.sort((a, b) => b.price - a.price);
    return list;
  }, [data, activeGender, minPrice, maxPrice, sort]);

  const activeFilterCount = [
    activeGender !== "Semua",
    !!minPrice,
    !!maxPrice,
    !!sort,
  ].filter(Boolean).length;

  /* ---------- render grid ---------- */
  const renderGrid = () => {
    if (loading)
      return Array.from({ length: 8 }).map((_, i) => <KostCardSkeleton key={i} />);

    if (error)
      return (
        <div className="al-empty" style={{ gridColumn: "1/-1" }}>
          <AlertCircle size={28} color="#F87171" />
          <p>Gagal memuat listing</p>
          <button className="al-retry-btn" onClick={fetchListings}>
            <RefreshCw size={13} /> Coba lagi
          </button>
        </div>
      );

    if (!filteredData.length)
      return (
        <div className="al-empty" style={{ gridColumn: "1/-1" }}>
          <SearchX size={28} color="#CBD5E1" />
          <p>Kost tidak ditemukan</p>
        </div>
      );

    return filteredData.map((item) => (
      <KostCard
        key={item.id}
        item={item}
        isLiked={favorites.includes(item.id)}
        onLike={() => handleToggleLike(item.id)}
        onClick={() => navigate(`/detail/${item.id}`)}
      />
    ));
  };

  /* =========================================================
      CSS
  ========================================================= */
  const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;700&display=swap');

  * { box-sizing: border-box; }
  body { margin: 0; background: #F8FAFC; }

  .al-root {
    font-family: 'DM Sans', sans-serif;
    color: #0F172A;
    min-height: 100vh;
  }

  /* ── NAVBAR ── */
  .al-navbar {
    position: sticky;
    top: 0;
    z-index: 100;
    height: 72px;
    background: rgba(255,255,255,.88);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid #EAEFF5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 42px;
  }

  .al-navbar-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .al-navbar-logo {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -1px;
    color: #0F172A;
    cursor: pointer;
  }

  .al-navbar-logo span { color: #2563EB; }

  .al-search-pill {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 220px;
    height: 46px;
    background: #F1F5F9;
    border: 1px solid #E2E8F0;
    border-radius: 999px;
    cursor: pointer;
    font-size: 14px;
    color: #64748B;
    font-weight: 700;
    transition: .15s;
  }

  .al-search-pill:hover {
    background: #E8EEF6;
    border-color: #CBD5E1;
    color: #2563EB;
  }

  /* ── HERO ── */
  .al-hero {
    position: relative; overflow: hidden;
    padding: 64px 24px 72px;
    background:
      radial-gradient(circle at top left, rgba(255,255,255,.08), transparent 25%),
      linear-gradient(135deg, #0F172A 0%, #1E3A8A 45%, #2563EB 100%);
  }

  .al-blob {
    position: absolute; border-radius: 50%;
    background: rgba(255,255,255,.06); filter: blur(2px);
  }

  .al-hero-inner {
    position: relative; z-index: 2;
    max-width: 680px; margin: auto; text-align: center;
  }

  .al-hero-badge {
    display: inline-flex; align-items: center; gap: 7px;
    background: rgba(255,255,255,.14);
    border: 1px solid rgba(255,255,255,.22);
    border-radius: 999px; padding: 6px 18px;
    font-size: 13px; font-weight: 700; color: white;
    margin-bottom: 20px;
  }

  .al-hero h1 {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 42px; font-weight: 800;
    color: white; margin: 0 0 16px;
    letter-spacing: -1.5px; line-height: 1.12;
  }

  .al-hero h1 em { font-style: normal; color: #93C5FD; }

  .al-hero-sub {
    font-size: 16px; color: rgba(255,255,255,.72);
    line-height: 1.7; min-height: 28px;
  }

  .al-shimmer {
    display: inline-block;
    width: 300px; height: 20px;
    background: rgba(255,255,255,.12);
    border-radius: 8px;
    animation: shimmerPulse 1.4s infinite;
  }
  @keyframes shimmerPulse {
    0%, 100% { opacity: .5; }
    50% { opacity: 1; }
  }

  /* ── FILTER BAR ── */
  .al-filterbar {
    position: sticky;
    top: 72px;
    z-index: 90;
    background: rgba(255,255,255,.97);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid #EAEFF5;
  }

  .al-filterbar-inner {
    max-width: 1180px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28px;
    height: 56px;
  }

  .al-filterbar-inner::-webkit-scrollbar { display: none; }
  .al-filterbar::-webkit-scrollbar { display: none; }

  .al-filter-tabs {
    display: flex;
    align-items: center;
    height: 100%;
  }

  .al-filter-chip {
    display: flex;
    align-items: center;
    padding: 0 22px;
    height: 50px;
    font-size: 13px;
    font-weight: 700;
    color: #64748B;
    cursor: pointer;
    border: none;
    background: none;
    border-bottom: 2.5px solid transparent;
    transition: .15s;
    white-space: nowrap;
    font-family: 'DM Sans', sans-serif;
    flex-shrink: 0;
  }

  .al-filter-chip:hover { color: #2563EB; }
  .al-filter-chip.active { color: #2563EB; border-bottom-color: #2563EB; }

  .al-filter-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 0 18px;
    height: 40px;
    margin-left: auto;
    border-radius: 12px;
    border: 1px solid #E2E8F0;
    background: white;
    font-size: 13px;
    font-weight: 700;
    color: #475569;
    cursor: pointer;
    transition: .15s;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    flex-shrink: 0;
  }

  .al-filter-btn:hover {
    color: #2563EB;
    background: #EFF6FF;
    border-color: #BFDBFE;
  }

  .al-filter-btn.has-active { color: #2563EB; }

  /* ── SORT ROW ── */
  .al-sort-row {
    max-width: 1180px; margin: 0 auto;
    padding: 18px 28px 0;
    display: flex; align-items: center;
    justify-content: space-between; gap: 12px; flex-wrap: wrap;
  }

  .al-sort-label { font-size: 14px; color: #64748B; font-weight: 600; }
  .al-sort-label strong { color: #0F172A; }

  /* ── CUSTOM SORT DROPDOWN ── */
  .al-sort-wrap {
    position: relative;
  }

  .al-sort-trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    background: white;
    border: 1.5px solid #E2E8F0;
    border-radius: 12px;
    padding: 9px 14px;
    font-size: 13px;
    font-weight: 700;
    color: #334155;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: .15s;
    white-space: nowrap;
  }

  .al-sort-trigger:hover {
    border-color: #BFDBFE;
    color: #2563EB;
    background: #EFF6FF;
  }

  .al-sort-trigger svg {
    transition: transform .2s;
    color: #64748B;
  }

  .al-sort-trigger svg.rotated {
    transform: rotate(180deg);
  }

  .al-sort-dropdown {
    position: absolute;
    right: 0;
    top: calc(100% + 8px);
    z-index: 200;
    background: white;
    border: 1.5px solid #E2E8F0;
    border-radius: 14px;
    box-shadow: 0 8px 32px rgba(0,0,0,.10);
    padding: 6px;
    min-width: 210px;
    animation: dropIn .15s ease;
  }

  @keyframes dropIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .al-sort-dropdown-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 10px 14px;
    border-radius: 10px;
    border: none;
    background: none;
    font-size: 13px;
    font-weight: 600;
    color: #334155;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    text-align: left;
    transition: .12s;
  }

  .al-sort-dropdown-item:hover {
    background: #EFF6FF;
    color: #2563EB;
  }

  .al-sort-dropdown-item.active {
    color: #2563EB;
    background: #EFF6FF;
  }

  .al-sort-check {
    font-size: 13px;
    font-weight: 800;
    color: #2563EB;
  }

  /* ── GRID ── */
  .al-content {
    max-width: 1180px; margin: 0 auto;
    padding: 20px 28px 60px;
  }

  .al-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
  }

  /* ── SKELETON ── */
  .al-skeleton {
    background: white; border-radius: 18px;
    overflow: hidden; border: 1px solid #EEF2F7;
    animation: alPulse 1.4s infinite;
  }
  .al-skeleton-img { height: 170px; background: #E2E8F0; }
  .al-skeleton-body { padding: 14px; display: flex; flex-direction: column; gap: 10px; }
  .al-skeleton-line { height: 12px; border-radius: 999px; background: #E2E8F0; }
  @keyframes alPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .55; }
  }

  /* ── EMPTY ── */
  .al-empty {
    display: flex; flex-direction: column;
    align-items: center; gap: 12px; padding: 60px 0;
  }
  .al-empty p { font-size: 14px; color: #64748B; font-weight: 600; }

  .al-retry-btn {
    border: none; cursor: pointer;
    display: flex; align-items: center; gap: 8px;
    background: #2563EB; color: white;
    padding: 10px 18px; border-radius: 12px;
    font-weight: 700; font-family: 'DM Sans', sans-serif;
  }

  /* ── FILTER DRAWER ── */
  .al-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,.4); z-index: 400;
    backdrop-filter: blur(3px);
    animation: overlayIn .2s ease;
  }
  @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }

  .al-drawer {
    position: fixed; bottom: 0; left: 0; right: 0;
    background: white; z-index: 401;
    border-radius: 24px 24px 0 0;
    padding: 0 0 36px;
    box-shadow: 0 -4px 40px rgba(0,0,0,.10);
    transform: translateY(100%);
    transition: transform .3s cubic-bezier(.4,0,.2,1);
    max-height: 88vh; overflow-y: auto;
  }
  .al-drawer.open { transform: translateY(0); }

  .al-drawer-handle {
    width: 40px; height: 4px;
    background: #E2E8F0; border-radius: 999px;
    margin: 14px auto 0;
  }

  .al-drawer-header {
    display: flex; align-items: center;
    justify-content: space-between;
    padding: 20px 22px 16px;
    border-bottom: 1px solid #F1F5F9;
  }

  .al-drawer-title {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 16px; font-weight: 700;
  }

  .al-drawer-reset {
    font-size: 13px; font-weight: 700;
    color: #2563EB; cursor: pointer;
    border: none; background: none;
    font-family: 'DM Sans', sans-serif;
  }

  .al-drawer-section { padding: 20px 22px 0; }

  .al-drawer-label {
    font-size: 11px; font-weight: 700;
    color: #94A3B8; text-transform: uppercase;
    letter-spacing: .07em; margin-bottom: 12px;
  }

  .al-chips { display: flex; gap: 8px; flex-wrap: wrap; }

  .al-chip {
    padding: 9px 18px; border-radius: 999px;
    border: 1.5px solid #E2E8F0; background: white;
    font-size: 13px; font-weight: 700;
    color: #64748B; cursor: pointer; transition: .2s;
    font-family: 'DM Sans', sans-serif;
  }
  .al-chip:hover { border-color: #93C5FD; color: #2563EB; }
  .al-chip.active {
    background: linear-gradient(135deg, #1D4ED8, #2563EB);
    border-color: #2563EB; color: white;
  }

  .al-price-row { display: flex; align-items: center; gap: 10px; }

  .al-price-input {
    flex: 1; border: 1.5px solid #E2E8F0;
    border-radius: 12px; padding: 10px 14px;
    font-size: 13px; font-family: 'DM Sans', sans-serif;
    color: #0F172A; outline: none; transition: .15s;
    background: #FAFAFA;
  }
  .al-price-input:focus { border-color: #93C5FD; background: white; }
  .al-price-sep { color: #CBD5E1; font-weight: 700; font-size: 14px; }

  .al-sort-opts { display: flex; flex-direction: column; gap: 2px; }

  .al-sort-opt {
    display: flex; align-items: center;
    justify-content: space-between;
    padding: 12px 14px; border-radius: 12px;
    font-size: 14px; font-weight: 600;
    color: #334155; cursor: pointer; transition: .12s;
    border: none; background: none;
    width: 100%; text-align: left;
    font-family: 'DM Sans', sans-serif;
  }
  .al-sort-opt:hover { background: #EFF6FF; color: #2563EB; }
  .al-sort-opt.active { color: #2563EB; background: #EFF6FF; }

  .al-radio {
    width: 18px; height: 18px; border-radius: 50%;
    border: 2px solid #CBD5E1; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    transition: .15s;
  }
  .al-sort-opt.active .al-radio { border-color: #2563EB; background: #2563EB; }
  .al-sort-opt.active .al-radio::after {
    content: ''; width: 6px; height: 6px;
    border-radius: 50%; background: white;
  }

  .al-drawer-footer { padding: 20px 22px 0; }

  .al-apply-btn {
    width: 100%;
    background: linear-gradient(135deg, #1D4ED8, #2563EB);
    color: white; border: none; border-radius: 12px;
    padding: 13px; font-size: 15px; font-weight: 700;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: .2s;
  }
  .al-apply-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 25px rgba(37,99,235,.22);
  }

  .al-back-btn {
    width: 42px;
    height: 42px;
    border: 1px solid #E2E8F0;
    background: white;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #0F172A;
    transition: .15s;
  }

  .al-back-btn:hover {
    background: #EFF6FF;
    color: #2563EB;
    border-color: #BFDBFE;
  }

  .al-filter-badge {
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 999px;
    background: #2563EB;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
  }

  /* ── RESPONSIVE ── */
  @media(max-width: 1100px) { .al-grid { grid-template-columns: repeat(3, 1fr); } }
  @media(max-width: 900px) {
    .al-navbar { padding: 0 20px; }
    .al-hero { padding: 56px 20px 64px; }
    .al-hero h1 { font-size: 32px; }
    .al-content { padding: 16px 20px 48px; }
    .al-sort-row { padding: 14px 20px 0; }
    .al-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media(max-width: 640px) {
    .al-navbar { height: 64px; padding: 0 16px; gap: 12px; }
    .al-navbar-left { gap: 10px; }
    .al-navbar-logo { font-size: 20px; }
    .al-search-pill { width: auto; flex: 1; min-width: 0; height: 40px; font-size: 13px; padding: 0 14px; }
    .al-filterbar { top: 64px; }
    .al-filterbar-inner { padding: 0 14px; overflow-x: auto; gap: 12px; }
    .al-filter-tabs { gap: 2px; min-width: max-content; }
    .al-filter-chip { padding: 0 16px; height: 46px; font-size: 12px; }
    .al-filter-btn { height: 38px; padding: 0 14px; font-size: 12px; flex-shrink: 0; }
    .al-hero { padding: 52px 16px 60px; }
    .al-hero h1 { font-size: 26px; line-height: 1.2; }
    .al-hero-sub { font-size: 14px; }
    .al-sort-row { padding: 14px 16px 0; flex-direction: column; align-items: stretch; }
    .al-sort-wrap { width: 100%; }
    .al-sort-trigger { width: 100%; justify-content: space-between; }
    .al-sort-dropdown { right: 0; left: auto; min-width: 190px; }
    
    /* MODIFIED: Tampilan 2 kolom di mobile */
    .al-content { padding: 12px; }
    .al-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .al-skeleton-img { height: 130px; }
    /* ------------------------------------ */

    .al-drawer { border-radius: 20px 20px 0 0; }
    .al-price-row { flex-direction: column; align-items: stretch; }
    .al-price-sep { display: none; }
  }
  `;

  /* =========================================================
      RENDER
  ========================================================= */
  return (
    <>
      <style>{css}</style>
      <div className="al-root">

        {/* ── NAVBAR ── */}
        <nav className="al-navbar">
          <div className="al-navbar-left">
            <button
              className="al-back-btn"
              onClick={() => navigate(-1)}
              aria-label="Kembali"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="al-navbar-logo" onClick={() => navigate("/")}>
              Atap<span>.</span>
            </div>
          </div>
          <div className="al-search-pill" onClick={() => navigate("/search")}>
            <Search size={16} />
            Cari kost...
          </div>
        </nav>

        {/* ── HERO ── */}
        <div className="al-hero">
          <div className="al-blob" style={{ width: 320, height: 320, top: -120, right: -80 }} />
          <div className="al-blob" style={{ width: 220, height: 220, left: -70, bottom: -80 }} />
          <div className="al-hero-inner">
            <div className="al-hero-badge">
              <Sparkles size={14} />
              Rekomendasi Kost Terbaik
            </div>
            <h1>
              Semua kost <em>pilihanmu</em>
              <br />ada di sini
            </h1>
            <p className="al-hero-sub">
              {aiLoading ? <span className="al-shimmer" /> : aiTagline}
            </p>
          </div>
        </div>

        {/* ── FILTER BAR ── */}
        <div className="al-filterbar">
          <div className="al-filterbar-inner">
            <div className="al-filter-tabs">
              {GENDER_FILTERS.map((f) => (
                <button
                  key={f}
                  className={`al-filter-chip ${activeGender === f ? "active" : ""}`}
                  onClick={() => setActiveGender(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            <button
              className={`al-filter-btn ${activeFilterCount > 0 ? "has-active" : ""}`}
              onClick={openDrawer}
            >
              <SlidersHorizontal size={15} />
              Filter
              {activeFilterCount > 0 && (
                <span className="al-filter-badge">{activeFilterCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* ── SORT ROW ── */}
        <div className="al-sort-row">
          <p className="al-sort-label">
            {loading
              ? "Memuat kost..."
              : <><strong>{filteredData.length.toLocaleString("id-ID")}</strong> kost ditemukan</>}
          </p>

          <div className="al-sort-wrap" ref={sortRef}>
            <button
              className="al-sort-trigger"
              onClick={() => setShowSortDropdown((p) => !p)}
            >
              <span>{SORT_OPTIONS.find((o) => o.value === sort)?.label}</span>
              <ChevronDown size={14} className={showSortDropdown ? "rotated" : ""} />
            </button>

            {showSortDropdown && (
              <div className="al-sort-dropdown">
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    className={`al-sort-dropdown-item ${sort === o.value ? "active" : ""}`}
                    onClick={() => { setSort(o.value); setShowSortDropdown(false); }}
                  >
                    {o.label}
                    {sort === o.value && <span className="al-sort-check">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── GRID ── */}
        <div className="al-content">
          <div className="al-grid">{renderGrid()}</div>
        </div>

        {/* ── FILTER DRAWER ── */}
        {showFilterDrawer && (
          <>
            <div className="al-overlay" onClick={() => setShowFilterDrawer(false)} />
            <div className="al-drawer open">
              <div className="al-drawer-handle" />

              <div className="al-drawer-header">
                <span className="al-drawer-title">Filter Kost</span>
                <button
                  className="al-drawer-reset"
                  onClick={() => {
                    setTmpGender("Semua");
                    setTmpMin("");
                    setTmpMax("");
                    setTmpSort("");
                  }}
                >
                  Reset
                </button>
              </div>

              <div className="al-drawer-section">
                <p className="al-drawer-label">Tipe Kost</p>
                <div className="al-chips">
                  {GENDER_FILTERS.map((g) => (
                    <button
                      key={g}
                      className={`al-chip ${tmpGender === g ? "active" : ""}`}
                      onClick={() => setTmpGender(g)}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="al-drawer-section" style={{ marginTop: 20 }}>
                <p className="al-drawer-label">Rentang Harga / Bulan</p>
                <div className="al-price-row">
                  <input
                    type="number"
                    className="al-price-input"
                    placeholder="Rp Min"
                    value={tmpMin}
                    onChange={(e) => setTmpMin(e.target.value)}
                  />
                  <span className="al-price-sep">–</span>
                  <input
                    type="number"
                    className="al-price-input"
                    placeholder="Rp Max"
                    value={tmpMax}
                    onChange={(e) => setTmpMax(e.target.value)}
                  />
                </div>
              </div>

              <div className="al-drawer-section" style={{ marginTop: 20 }}>
                <p className="al-drawer-label">Urutkan</p>
                <div className="al-sort-opts">
                  {SORT_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      className={`al-sort-opt ${tmpSort === o.value ? "active" : ""}`}
                      onClick={() => setTmpSort(o.value)}
                    >
                      {o.label}
                      <span className="al-radio" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="al-drawer-footer">
                <button className="al-apply-btn" onClick={applyFilter}>
                  Terapkan Filter
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </>
  );
}