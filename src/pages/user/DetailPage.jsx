import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getApiBase, postPublicJson, postPublicForm, resolveMediaUrl } from "../../config/apiBase";
import UserNavbar, { USER_NAVBAR_CSS } from "../../components/user/UserNavbar";
import UserBottomNav, { USER_BOTTOM_NAV_CSS } from "../../components/user/UserBottomNav";
import { useUserNavBadges } from "../../hooks/useUserNavBadges";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { GENDER_LABELS_LOWER, extractKostFacilitiesFromRooms, getRoomOnlyFacilities, getRentableRoomTypes, findSharedFacilityRoom, parseElectricityIncluded } from "../../constants/listing";
import { formatPublicLocation, obfuscateCoordinates } from "../../utils/publicLocation";
import FacilityChipList from "../../components/user/FacilityChipList";
import FacilitiesModal from "../../components/user/FacilitiesModal";
import { createPriceIcon } from "../../utils/mapPriceIcon";
import {
  ArrowLeft, MapPin, Heart, Home,
  ShieldCheck, ChevronLeft, ChevronRight, X,
  Clock, UserX, CigaretteOff, VolumeX,
  LayoutGrid, Loader2, Share2, Layers,
  CheckCircle2, AlertCircle, Navigation, Info,
  Flag, Copy, Check, Mail, Ruler, BedDouble, Users, Zap,
  Upload, Landmark, ImageIcon,
} from "lucide-react";

/* ─────────────────────────────────────────────
   GLOBAL CSS
───────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=DM+Serif+Display:ital@0;1&display=swap');

  :root {
    --brand:        #4F46E5;
    --brand-dark:   #4338CA;
    --brand-light:  #EBF1FF;
    --success:      #10B981;
    --danger:       #EF4444;
    --surface:      #FFFFFF;
    --surface-2:    #F7F8FC;
    --surface-3:    #EEF0F7;
    --border:       #E4E7F0;
    --border-strong:#CDD1E0;
    --text-primary: #0D1117;
    --text-secondary:#4B5568;
    --text-muted:   #8B96AB;
    --radius-sm:    10px;
    --radius:       14px;
    --radius-lg:    20px;
    --radius-xl:    28px;
    --shadow-xs:    0 1px 3px rgba(0,0,0,.06);
    --shadow-sm:    0 2px 8px rgba(0,0,0,.08);
    --shadow-brand: 0 6px 20px rgba(26,86,219,.28);
    --ff:           'Outfit', -apple-system, sans-serif;
    --ff-display:   'DM Serif Display', Georgia, serif;
  }

  *, *::before, *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

  @keyframes slideUp  { from { transform:translateY(20px);opacity:0 } to { transform:translateY(0);opacity:1 } }
  @keyframes lbFadeIn { from { opacity:0 } to { opacity:1 } }
  @keyframes lbImgIn  { from { opacity:0;transform:scale(.97) } to { opacity:1;transform:scale(1) } }
  @keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes spin     { to { transform:rotate(360deg) } }
  @keyframes skelPulse{ 0%,100%{opacity:1} 50%{opacity:.5} }

  .scrollbar-hide::-webkit-scrollbar { display:none }
  .scrollbar-hide { scrollbar-width:none }

  .leaflet-container,.leaflet-pane { z-index:0 !important }
  .leaflet-top,.leaflet-bottom     { z-index:1 !important }

  /* ── Fix marker clipping (same as MapPage) ── */
  .leaflet-marker-icon { overflow: visible !important; }
  .leaflet-marker-pane { overflow: visible !important; }
  .leaflet-div-icon { background: transparent !important; border: none !important; overflow: visible !important; }

  .lb-thumb-strip::-webkit-scrollbar { display:none }
  .lb-thumb-strip { scrollbar-width:none }

  .lb-thumb {
    flex-shrink:0; width:72px; height:52px; border-radius:8px;
    overflow:hidden; cursor:pointer; border:2px solid transparent;
    transition:border-color .15s,opacity .15s; opacity:.5;
    background:none; padding:0;
  }
  .lb-thumb.active { border-color:#fff; opacity:1 }
  .lb-thumb:hover  { opacity:.8 }

  .lb-nav-btn {
    width:44px; height:44px; border-radius:50%;
    background:rgba(255,255,255,.14); border:1.5px solid rgba(255,255,255,.22);
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; flex-shrink:0; transition:background .15s;
    backdrop-filter:blur(6px);
  }
  .lb-nav-btn:hover { background:rgba(255,255,255,.28) }

  .lb-close-btn {
    width:40px; height:40px; border-radius:50%;
    background:rgba(255,255,255,.12); border:1.5px solid rgba(255,255,255,.18);
    display:flex; align-items:center; justify-content:center; cursor:pointer;
    transition:background .15s;
  }
  .lb-close-btn:hover { background:rgba(255,255,255,.24) }

  .detail-page { min-height:100vh; background:var(--surface); }
  .detail-shell { max-width:1120px; margin:0 auto; width:100%; }
  .detail-content { padding:20px 48px 0; }
  .detail-bottom-inner { max-width:480px; margin:0 auto; display:flex; align-items:center; gap:10px; }

  .detail-action-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 260;
    background: var(--surface);
    border-top: 1px solid var(--border);
    padding: 12px 16px;
    padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
    backdrop-filter: blur(12px);
  }

  @media (min-width:769px) {
    .detail-page.user-page-shell { padding-bottom: calc(84px + env(safe-area-inset-bottom, 0px)); }
  }
  @media (min-width:900px) {
    .detail-gallery-grid { height:380px !important; border-radius:0 0 var(--radius-xl) var(--radius-xl); overflow:hidden; }
    .detail-gallery-overlay { padding:16px 48px 12px !important; }
  }
  @media (max-width:899px) {
    .detail-content { padding:16px 16px 0; }
    .detail-gallery-overlay { padding:44px 16px 12px !important; }
    .detail-gallery-grid { height:260px !important; grid-template-columns:1fr !important; grid-template-rows:200px 80px !important; }
    .detail-gallery-grid > div:first-child { grid-row:1 !important; grid-column:1 !important; }
    .detail-gallery-grid > div:not(:first-child) { display:none !important; }
  }
  @media (max-width:768px) {
    .detail-page.user-page-shell {
      padding-bottom: calc(148px + env(safe-area-inset-bottom, 0px));
    }
    .detail-action-bar {
      bottom: calc(58px + env(safe-area-inset-bottom, 0px));
      z-index: 310;
    }
  }
`;

function InjectStyles({ css }) {
  useEffect(() => {
    const tag = document.createElement("style");
    tag.textContent = css;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);
  return null;
}

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const SERVICE_FEE          = 250_000;
const WHATSAPP_CONSULTATION = "083160982717";

const REPORT_REASONS = [
  { label:"Informasi tidak akurat", value:"INFORMASI_SALAH"   },
  { label:"Foto menyesatkan",       value:"FOTO_TIDAK_SESUAI" },
  { label:"Penipuan / scam",        value:"PENIPUAN"          },
  { label:"Sudah tidak tersedia",   value:"TIDAK_AKTIF"       },
];

const genderConfig = {
  putra:  { label: GENDER_LABELS_LOWER.putra,  bg:"#F5F3FF", text:"#4F46E5", border:"#DDD6FE" },
  putri:  { label: GENDER_LABELS_LOWER.putri,  bg:"#FDF2F8", text:"#9D174D", border:"#FBCFE8" },
  campur: { label: GENDER_LABELS_LOWER.campur, bg:"#F0FDF4", text:"#166534", border:"#BBF7D0" },
};

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const getApiUrl   = () => getApiBase();
const getToken    = () =>
  localStorage.getItem("token") || localStorage.getItem("accessToken") || "";
const getCurrentUser = () => {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); }
  catch { return {}; }
};
const getLocalFavorites = () => {
  try { return JSON.parse(localStorage.getItem("atap_favorites") || "[]"); }
  catch { return []; }
};
const setLocalFavorites = (arr) => {
  localStorage.setItem("atap_favorites", JSON.stringify(arr));
};
const getFavoriteListingId = (fav) =>
  String(fav?.listingId ?? fav?.listing?.id ?? fav?.id ?? "");

const authFetch = (url, opts = {}) => {
  const token   = getToken();
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(url, { ...opts, headers });
};

const formatPhone = (n) => (n?.startsWith("0") ? "62" + n.slice(1) : n || "");

const fmtRp   = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

const buildMinatWhatsAppUrl = (item, { name, phone, paid } = {}) => {
  const waNum = formatPhone(WHATSAPP_CONSULTATION);
  let waMsg;
  if (paid) {
    waMsg =
      name && phone
        ? `Halo, saya *${name}* (${phone}) sudah melakukan pembayaran DP untuk kost *${item.name}* di ${item.location}. Bukti transfer sudah saya unggah. Mohon dibantu proses pemesanannya ya. Terima kasih!`
        : `Halo, saya sudah melakukan pembayaran DP untuk kost *${item.name}* di ${item.location}. Bukti transfer sudah saya unggah. Mohon dibantu proses pemesanannya ya. Terima kasih!`;
  } else {
    waMsg =
      name && phone
        ? `Halo, saya *${name}* (${phone}) tertarik dengan kost *${item.name}* di ${item.location}. Apakah masih tersedia?`
        : `Halo, saya tertarik dengan kost *${item.name}* di ${item.location}. Apakah masih tersedia?`;
  }
  return `https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}`;
};

/* ─────────────────────────────────────────────
   DATA MAPPER
───────────────────────────────────────────── */
function mapListingDetail(data) {
  const sharedRoom = findSharedFacilityRoom(data.roomTypes);
  const sharedFacilityImages = (sharedRoom?.photos ?? [])
    .map((p) => resolveMediaUrl(p.url))
    .filter(Boolean);

  const rentableRaw = getRentableRoomTypes(data.roomTypes);
  const kostFacilities = extractKostFacilitiesFromRooms(data.roomTypes);

  const roomTypes = rentableRaw.map((room) => ({
    id:             room.id,
    name:           room.name || "Tipe kamar",
    price:          Number(room.price) || 0,
    size:           room.size || "-",
    availableCount: room.availableCount ?? 0,
    electricityIncluded: parseElectricityIncluded(
      Array.isArray(room.facilities) ? room.facilities : [],
    ),
    facilities:     getRoomOnlyFacilities(
      Array.isArray(room.facilities) ? room.facilities : [],
      kostFacilities,
    ),
    image:          resolveMediaUrl(room.photos?.[0]?.url),
    images: (room.photos ?? [])
      .map((p) => resolveMediaUrl(p.url))
      .filter(Boolean),
  }));

  const roomImages = roomTypes.flatMap((r) => r.images);
  const listingImages = (data.photos ?? [])
    .map((p) => resolveMediaUrl(p.url))
    .filter(Boolean);
  const images = roomImages.length > 0 ? roomImages : listingImages;

  const priceValues = rentableRaw.map((r) => Number(r.price)).filter((p) => p > 0);
  const availableRooms = rentableRaw.reduce((s, r) => s + (r.availableCount || 0), 0);

  const mapCoords = obfuscateCoordinates(data.latitude, data.longitude, String(data.id || ""));

  return {
    id:             data.id,
    name:           data.name || "Tanpa nama",
    location:       formatPublicLocation(data.address),
    description:    data.description || "",
    rules:          Array.isArray(data.rules) ? data.rules : [],
    gender:         data.genderType,
    price:          priceValues.length ? Math.min(...priceValues) : Number(data.cheapestPrice ?? 0) || 0,
    images,
    sharedFacilityImages,
    isPremium:      Boolean(data.isPremium),
    availableRooms,
    latitude:       mapCoords?.lat ?? null,
    longitude:      mapCoords?.lng ?? null,
    kostFacilities,
    roomTypes,
    status: data.status,
  };
}

/* ─────────────────────────────────────────────
   RULE ICONS
───────────────────────────────────────────── */

const getRuleIcon = (r = "") => {
  const rl = r.toLowerCase();
  if (rl.includes("jam") || rl.includes("malam"))              return <Clock size={14} />;
  if (rl.includes("tamu") || rl.includes("lawan jenis") || rl.includes("pasangan")) return <UserX size={14} />;
  if (rl.includes("hewan") || rl.includes("peliharaan"))       return <Home size={14} />;
  if (rl.includes("rokok") || rl.includes("merokok"))          return <CigaretteOff size={14} />;
  if (rl.includes("bising") || rl.includes("musik"))           return <VolumeX size={14} />;
  return <ShieldCheck size={14} />;
};

const getRoomPhotoOffset = (roomTypes, roomIndex) =>
  roomTypes.slice(0, roomIndex).reduce((sum, r) => sum + (r.images?.length || 0), 0);

function getSizeSummary(roomTypes = []) {
  const sizes = [...new Set(roomTypes.map((r) => r.size).filter((s) => s && s !== "-"))];
  if (sizes.length === 0) return "—";
  if (sizes.length === 1) return sizes[0];
  return `${sizes.length} ukuran`;
}

function QuickStatsRow({ item, gender }) {
  const stats = [
    { icon: Ruler, label: getSizeSummary(item.roomTypes) },
    { icon: Layers, label: item.roomTypes?.length ? `${item.roomTypes.length} tipe` : "—" },
    { icon: BedDouble, label: `${item.availableRooms} kamar` },
    { icon: Users, label: gender?.label || "—" },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 8,
        marginBottom: 20,
      }}
    >
      {stats.map(({ icon: Icon, label }) => (
        <div
          key={label}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "12px 8px",
            textAlign: "center",
          }}
        >
          <Icon size={16} color="var(--brand)" style={{ marginBottom: 6 }} />
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.35, fontFamily: "var(--ff)" }}>
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}

function SectionHeading({ icon: Icon, title, badge }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        {Icon && (
          <div style={{ width:28, height:28, borderRadius:8, background:"var(--brand-light)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Icon size={14} color="var(--brand)" />
          </div>
        )}
        <h2 style={{ fontSize:15, fontWeight:700, color:"var(--text-primary)", margin:0 }}>{title}</h2>
      </div>
      {badge}
    </div>
  );
}

function RoomTypeCard({ room, index, photoOffset, onPhotoClick, onShowFacilities }) {
  const photos = room.images?.length > 0 ? room.images : room.image ? [room.image] : [];

  return (
    <article
      style={{
        borderRadius:"var(--radius-lg)",
        border:"1px solid var(--border)",
        overflow:"hidden",
        background:"var(--surface)",
      }}
    >
      {photos.length > 0 && (
        <div
          className="scrollbar-hide"
          style={{ display:"flex", gap:8, overflowX:"auto", padding:12, background:"var(--surface-2)", borderBottom:"1px solid var(--border)" }}
        >
          {photos.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onPhotoClick(photoOffset + i)}
              style={{
                flexShrink:0,
                width:120,
                height:88,
                borderRadius:10,
                overflow:"hidden",
                border:"2px solid var(--border)",
                padding:0,
                cursor:"pointer",
                background:"var(--surface-3)",
              }}
            >
              <img src={img} alt={`${room.name} ${i + 1}`} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
            </button>
          ))}
        </div>
      )}

      <div style={{ padding:"16px 18px" }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, marginBottom:10 }}>
          <div style={{ minWidth:0 }}>
            <p style={{ fontSize:11, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:.4, marginBottom:4 }}>
              Tipe kamar {index + 1}
            </p>
            <h3 style={{ fontSize:16, fontWeight:800, color:"var(--text-primary)", margin:0 }}>{room.name}</h3>
          </div>
          <div style={{ textAlign:"right", flexShrink:0 }}>
            <p style={{ fontSize:18, fontWeight:800, color:"var(--brand)", lineHeight:1.2 }}>
              Rp {Number(room.price).toLocaleString("id-ID")}
            </p>
            <p style={{ fontSize:11, color:"var(--text-muted)", marginTop:2 }}>/ bulan</p>
          </div>
        </div>

        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:room.facilities?.length ? 14 : 0 }}>
          <span style={{ fontSize:12, fontWeight:600, padding:"5px 10px", borderRadius:99, background:"#F5F3FF", color:"#7C3AED", border:"1px solid #DDD6FE" }}>
            Ukuran {room.size}
          </span>
          {room.electricityIncluded === true && (
            <span style={{ fontSize:12, fontWeight:600, padding:"5px 10px", borderRadius:99, background:"#FEFCE8", color:"#CA8A04", border:"1px solid #FDE68A", display:"inline-flex", alignItems:"center", gap:4 }}>
              <Zap size={12} /> Listrik termasuk
            </span>
          )}
          {room.electricityIncluded === false && (
            <span style={{ fontSize:12, fontWeight:600, padding:"5px 10px", borderRadius:99, background:"#F5F3FF", color:"#64748B", border:"1px solid #E0E7FF" }}>
              Listrik belum termasuk
            </span>
          )}
          <span style={{ fontSize:12, fontWeight:600, padding:"5px 10px", borderRadius:99, background:room.availableCount > 0 ? "#ECFDF5" : "#FEF2F2", color:room.availableCount > 0 ? "#166534" : "var(--danger)", border:`1px solid ${room.availableCount > 0 ? "#BBF7D0" : "#FECACA"}` }}>
            {room.availableCount} kamar tersedia
          </span>
        </div>

        {room.facilities?.length > 0 && (
          <>
            <p style={{ fontSize:11, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:.4, marginBottom:10 }}>
              Fasilitas kamar
            </p>
            <FacilityChipList
              facilities={room.facilities}
              maxVisible={6}
              showAllLabel="Lihat fasilitas kamar"
              onShowAll={() => onShowFacilities?.(room)}
            />
          </>
        )}
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────
   LEAFLET SETUP
───────────────────────────────────────────── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function MapCenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], 15, { animate: true });
  }, [lat, lng, map]);
  return null;
}

/* ─────────────────────────────────────────────
   SHARED STYLE TOKENS
───────────────────────────────────────────── */
const S = {
  overlay: {
    position: "fixed", inset: 0, zIndex: 99999,
    background: "rgba(0,0,0,.55)", backdropFilter: "blur(4px)",
    display: "flex", alignItems: "flex-end", justifyContent: "center",
  },
  sheet: {
    fontFamily: "var(--ff)", background: "var(--surface)",
    width: "100%", maxWidth: 480, borderRadius: "28px 28px 0 0",
    position: "relative", zIndex: 100000,
    animation: "slideUp .3s cubic-bezier(.22,1,.36,1)", overflow: "hidden",
  },
  handle: {
    width: 40, height: 4, borderRadius: 99,
    background: "var(--border-strong)", margin: "12px auto 0",
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: "50%",
    background: "var(--surface-2)", border: "1px solid var(--border)",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", flexShrink: 0,
  },
};

/* ─────────────────────────────────────────────
   PHOTO LIGHTBOX
───────────────────────────────────────────── */
function PhotoLightbox({ images, startIndex = 0, onClose }) {
  const [current, setCurrent]   = useState(startIndex);
  const thumbsRef               = useRef(null);
  const touchStartX             = useRef(null);
  const total                   = images.length;

  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  useEffect(() => {
    const el = thumbsRef.current?.children[current];
    if (el) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [current]);

  useEffect(() => {
    const h = (e) => {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape")     onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    touchStartX.current = null;
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999,
      background: "rgba(0,0,0,.97)", display: "flex",
      flexDirection: "column", animation: "lbFadeIn .2s ease",
    }}>
      {/* Top bar */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 20px", flexShrink:0 }}>
        <span style={{ color:"rgba(255,255,255,.5)", fontSize:12, fontWeight:700, fontFamily:"var(--ff)", letterSpacing:.5, textTransform:"uppercase" }}>Foto</span>
        <span style={{ color:"white", fontSize:14, fontWeight:700, fontFamily:"var(--ff)" }}>{current + 1} / {total}</span>
        <button className="lb-close-btn" onClick={onClose}><X size={17} color="white" /></button>
      </div>

      {/* Main image */}
      <div
        style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 68px", minHeight:0, position:"relative" }}
        onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
      >
        <button className="lb-nav-btn" onClick={prev} style={{ position:"absolute", left:12, zIndex:2 }}>
          <ChevronLeft size={22} color="white" />
        </button>
        <img
          key={current}
          src={images[current]}
          alt={`Foto ${current + 1}`}
          style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain", borderRadius:12, animation:"lbImgIn .22s ease", userSelect:"none" }}
          draggable={false}
        />
        <button className="lb-nav-btn" onClick={next} style={{ position:"absolute", right:12, zIndex:2 }}>
          <ChevronRight size={22} color="white" />
        </button>
      </div>

      {/* Thumbnail strip */}
      <div style={{ flexShrink:0, padding:"16px 20px 28px" }}>
        <div ref={thumbsRef} className="lb-thumb-strip" style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }}>
          {images.map((img, i) => (
            <button key={i} className={`lb-thumb${i === current ? " active" : ""}`} onClick={() => setCurrent(i)}>
              <img src={img} alt={`thumb ${i + 1}`} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SHARE MODAL
───────────────────────────────────────────── */
function ShareModal({ item, onClose }) {
  const [copied, setCopied] = useState(false);
  const shareUrl  = `${window.location.origin}/detail/${item.id}`;
  const shareText = `Cek kost "${item.name}" di ${item.location}. Harga Rp ${Number(item.price).toLocaleString("id-ID")}/bulan. ${shareUrl}`;

  const copyToClipboard = async () => {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch (err) { console.error(err); }
  };

  const WaIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.555 4.126 1.527 5.858L.057 23.617a.75.75 0 0 0 .92.92l5.818-1.488A11.946 11.946 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
    </svg>
  );
  const TgIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.161.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.328-.373-.115l-6.869 4.332-2.97-.924c-.644-.213-.658-.644.135-.954l11.593-4.47c.537-.196 1.006.128.832.941z"/>
    </svg>
  );
  const FbIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
  const XIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.514l-5.106-6.67-5.829 6.67H2.306l7.644-8.74L.554 2.25h6.696l4.627 6.122 5.361-6.122z"/>
    </svg>
  );

  const shareOptions = [
    { id:"copy",     label:"Salin Link",  Icon: copied ? Check : Copy, color:"#475569", bg:"#F1F5F9",
      action: copyToClipboard },
    { id:"whatsapp", label:"WhatsApp",    Icon: WaIcon, color:"#16A34A", bg:"#DCFCE7",
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank") },
    { id:"telegram", label:"Telegram",    Icon: TgIcon, color:"#0EA5E9", bg:"#E0F2FE",
      action: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, "_blank") },
    { id:"facebook", label:"Facebook",    Icon: FbIcon, color:"#4F46E5", bg:"#E0E7FF",
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank") },
    { id:"twitter",  label:"X / Twitter", Icon: XIcon,  color:"#0D1117", bg:"#F1F5F9",
      action: () => window.open(`https://x.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, "_blank") },
    { id:"email",    label:"Email",       Icon: Mail,   color:"#EA580C", bg:"#FFF7ED",
      action: () => {
        const s = encodeURIComponent(`Lihat kost: ${item.name}`);
        const b = encodeURIComponent(`Halo,\n\nAku menemukan kost menarik:\n\n${shareText}`);
        window.location.href = `mailto:?subject=${s}&body=${b}`;
      }},
  ];

  return (
    <div style={{ ...S.overlay }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ ...S.sheet, paddingBottom: 28 }}>
        <div style={S.handle} />
        <div style={{ padding: "16px 20px 0" }}>
          {/* Header */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <span style={{ fontWeight:700, fontSize:16, color:"var(--text-primary)" }}>Bagikan Listing</span>
            <button style={S.closeBtn} onClick={onClose}><X size={15} color="var(--text-secondary)" /></button>
          </div>

          {/* Preview card */}
          <div style={{ display:"flex", alignItems:"center", gap:12, background:"var(--surface-2)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:12, marginBottom:20 }}>
            {item?.images?.[0]
              ? <img src={item.images[0]} alt={item.name} style={{ width:52, height:52, borderRadius:10, objectFit:"cover", flexShrink:0 }} />
              : <div style={{ width:52, height:52, borderRadius:10, background:"var(--brand-light)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Home size={20} color="var(--brand)" /></div>
            }
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontWeight:700, fontSize:13, color:"var(--text-primary)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginBottom:2 }}>{item?.name}</p>
              <p style={{ fontSize:11, color:"var(--text-muted)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginBottom:4 }}>{item?.location}</p>
              <p style={{ fontSize:12, fontWeight:700, color:"var(--brand)" }}>
                Rp {Number(item?.price || 0).toLocaleString("id-ID")}
                <span style={{ fontWeight:400, color:"var(--text-muted)" }}>/bulan</span>
              </p>
            </div>
          </div>

          {/* Share grid */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:18 }}>
            {shareOptions.map(({ id, label, Icon, color, bg, action }) => (
              <button key={id} onClick={action} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, padding:"14px 8px", borderRadius:"var(--radius)", background:bg, border:"1.5px solid transparent", cursor:"pointer", fontFamily:"var(--ff)" }}>
                <div style={{ width:40, height:40, borderRadius:12, background:"rgba(255,255,255,.8)", display:"flex", alignItems:"center", justifyContent:"center", color }}>
                  <Icon size={20} />
                </div>
                <p style={{ fontSize:11, fontWeight:700, color:"var(--text-primary)", textAlign:"center", lineHeight:1.3 }}>{label}</p>
              </button>
            ))}
          </div>

          {/* URL bar */}
          <div style={{ display:"flex", alignItems:"center", gap:10, background:"var(--surface-2)", border:"1.5px solid var(--border)", borderRadius:"var(--radius-sm)", padding:"10px 14px" }}>
            <span style={{ flex:1, fontSize:12, color:"var(--text-secondary)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{shareUrl}</span>
            <button onClick={copyToClipboard} style={{ flexShrink:0, width:30, height:30, borderRadius:8, background:"var(--surface)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} color="var(--text-muted)" />}
            </button>
          </div>
          {copied && <p style={{ fontSize:12, color:"var(--success)", textAlign:"center", marginTop:10, fontWeight:600 }}>✓ Link berhasil disalin!</p>}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MINAT MODAL
───────────────────────────────────────────── */
const PROOF_MIME = ["image/jpeg", "image/png", "image/webp"];
const PROOF_MAX_BYTES = 5 * 1024 * 1024;

function MinatModal({ item, onClose }) {
  const profile            = getCurrentUser();
  const [step, setStep]    = useState("form"); // form | payment
  const [name, setName]    = useState(profile.name  || "");
  const [phone, setPhone]  = useState(profile.phone || "");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg]   = useState("");

  // payment step state
  const [leadId, setLeadId]         = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [copied, setCopied]         = useState(false);
  const [proofFile, setProofFile]   = useState(null);
  const [uploading, setUploading]   = useState(false);
  const [uploadErr, setUploadErr]   = useState("");
  const [uploadDone, setUploadDone] = useState(false);

  const submittedPhone = useRef("");

  const handleSubmit = async () => {
    const cName  = name.trim();
    const cPhone = phone.trim();
    if (cName.length  < 2) { setErrMsg("Nama minimal 2 karakter"); return; }
    if (cPhone.length < 8) { setErrMsg("Nomor WhatsApp tidak valid"); return; }
    setErrMsg("");
    setLoading(true);
    try {
      const body  = { name: cName, phone: cPhone };
      const email = (profile.email || "").trim();
      if (email) body.email = email;
      const res = await postPublicJson(`/leads/${item.id}`, body);
      submittedPhone.current = cPhone;
      setLeadId(res?.data?.id || null);
      setPaymentInfo(res?.paymentInfo || null);
      setStep("payment");
    } catch (e) {
      const msg = e?.message || "";
      setErrMsg(
        msg === "Failed to fetch" || e instanceof TypeError
          ? "Tidak dapat terhubung ke server."
          : msg || "Terjadi kesalahan"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(String(text || ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_) {}
  };

  const handlePickProof = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!PROOF_MIME.includes(file.type)) {
      setUploadErr("Format harus JPG, PNG, atau WEBP");
      return;
    }
    if (file.size > PROOF_MAX_BYTES) {
      setUploadErr("Ukuran maksimal 5MB");
      return;
    }
    setUploadErr("");
    setUploadDone(false);
    setProofFile(file);
  };

  const handleUploadProof = async () => {
    if (!proofFile || !leadId) return;
    setUploading(true);
    setUploadErr("");
    try {
      const fd = new FormData();
      fd.append("proof", proofFile);
      if (submittedPhone.current) fd.append("phone", submittedPhone.current);
      await postPublicForm(`/leads/records/${leadId}/payment-proof`, fd);
      setUploadDone(true);
    } catch (e) {
      setUploadErr(e?.message || "Gagal mengunggah bukti");
    } finally {
      setUploading(false);
    }
  };

  const openWhatsApp = () => {
    window.open(
      buildMinatWhatsAppUrl(item, { name: name.trim(), phone: phone.trim(), paid: uploadDone }),
      "_blank",
    );
  };

  const fieldLabel = { fontSize:11, fontWeight:700, color:"var(--text-muted)", display:"block", marginBottom:6 };
  const fieldInput = { width:"100%", background:"var(--surface-2)", border:"1.5px solid var(--border)", borderRadius:"var(--radius-sm)", padding:"11px 14px", fontSize:13.5, color:"var(--text-primary)", fontFamily:"var(--ff)", outline:"none" };

  return (
    <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ ...S.sheet, paddingBottom: 28 }}>
        <div style={S.handle} />
        <div style={{ padding: "16px 20px 0", maxHeight: "82vh", overflowY: "auto" }}>
          {step === "payment" ? (
            <>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                <p style={{ fontWeight:700, fontSize:16, color:"var(--text-primary)" }}>Minat Terkirim 🎉</p>
                <button style={S.closeBtn} onClick={onClose}><X size={15} color="var(--text-secondary)" /></button>
              </div>
              <p style={{ fontSize:12, color:"var(--text-muted)", marginBottom:16 }}>
                Selesaikan pembayaran biaya admin, lalu (opsional) unggah bukti transfer.
              </p>

              {/* Payment info card */}
              {paymentInfo && (
                <div style={{ border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:16, marginBottom:16, background:"var(--surface-2)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                    <Landmark size={16} color="var(--brand)" />
                    <p style={{ fontWeight:700, fontSize:13.5, color:"var(--text-primary)" }}>Info Pembayaran</p>
                  </div>

                  {paymentInfo.amount != null && (
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                      <span style={{ fontSize:12, color:"var(--text-muted)" }}>Nominal</span>
                      <span style={{ fontSize:16, fontWeight:800, color:"var(--brand)" }}>{fmtRp(paymentInfo.amount)}</span>
                    </div>
                  )}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <span style={{ fontSize:12, color:"var(--text-muted)" }}>Bank</span>
                    <span style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)" }}>{paymentInfo.bankName || "-"}</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <span style={{ fontSize:12, color:"var(--text-muted)" }}>No. Rekening</span>
                    <span style={{ display:"inline-flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:13.5, fontWeight:800, color:"var(--text-primary)", letterSpacing:0.5 }}>{paymentInfo.accountNumber || "-"}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(paymentInfo.accountNumber)}
                        style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11, fontWeight:700, color: copied ? "var(--success)" : "var(--brand)", background:"none", border:"none", cursor:"pointer", fontFamily:"var(--ff)" }}
                      >
                        {copied ? <Check size={13} /> : <Copy size={13} />}
                        {copied ? "Tersalin" : "Salin"}
                      </button>
                    </span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:12, color:"var(--text-muted)" }}>Atas Nama</span>
                    <span style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)" }}>{paymentInfo.accountHolder || "-"}</span>
                  </div>
                  {paymentInfo.notes && (
                    <p style={{ fontSize:11.5, color:"var(--text-muted)", lineHeight:1.6, marginTop:12, paddingTop:12, borderTop:"1px dashed var(--border)" }}>
                      {paymentInfo.notes}
                    </p>
                  )}
                </div>
              )}

              {/* Upload bukti (opsional) */}
              {leadId && (
                <div style={{ marginBottom:16 }}>
                  <label style={fieldLabel}>Bukti Transfer <span style={{ color:"var(--text-muted)", fontWeight:500 }}>(opsional)</span></label>
                  {uploadDone ? (
                    <div style={{ display:"flex", alignItems:"center", gap:8, background:"#DCFCE7", border:"1px solid #BBF7D0", borderRadius:"var(--radius-sm)", padding:"11px 14px" }}>
                      <CheckCircle2 size={15} color="var(--success)" />
                      <p style={{ fontSize:12.5, color:"#15803D", fontWeight:600 }}>Bukti transfer berhasil diunggah</p>
                    </div>
                  ) : (
                    <>
                      <label style={{ display:"flex", alignItems:"center", gap:10, border:"1.5px dashed var(--border-strong)", borderRadius:"var(--radius-sm)", padding:"12px 14px", cursor:"pointer", background:"var(--surface-2)" }}>
                        {proofFile ? <ImageIcon size={16} color="var(--brand)" /> : <Upload size={16} color="var(--text-muted)" />}
                        <span style={{ fontSize:12.5, color: proofFile ? "var(--text-primary)" : "var(--text-muted)", fontWeight:600, flex:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                          {proofFile ? proofFile.name : "Pilih foto bukti transfer (JPG/PNG/WEBP, maks 5MB)"}
                        </span>
                        <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display:"none" }} onChange={handlePickProof} />
                      </label>
                      {proofFile && (
                        <button
                          onClick={handleUploadProof}
                          disabled={uploading}
                          style={{ width:"100%", marginTop:10, padding:"11px 0", borderRadius:"var(--radius-sm)", color:"white", fontWeight:700, fontSize:13, border:"none", cursor:"pointer", fontFamily:"var(--ff)", display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:"var(--brand)", opacity:uploading ? 0.7 : 1 }}
                        >
                          {uploading && <Loader2 size={15} style={{ animation:"spin 1s linear infinite" }} />}
                          {uploading ? "Mengunggah..." : "Unggah Bukti"}
                        </button>
                      )}
                    </>
                  )}
                  {uploadErr && (
                    <div style={{ display:"flex", alignItems:"center", gap:8, background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:"var(--radius-sm)", padding:"10px 12px", marginTop:10 }}>
                      <AlertCircle size={13} color="var(--danger)" style={{ flexShrink:0 }} />
                      <p style={{ fontSize:12, color:"var(--danger)" }}>{uploadErr}</p>
                    </div>
                  )}
                </div>
              )}

              {/* WhatsApp + selesai */}
              <button
                onClick={openWhatsApp}
                style={{ width:"100%", padding:"14px 0", borderRadius:"var(--radius)", color:"white", fontWeight:700, fontSize:14, border:"none", cursor:"pointer", fontFamily:"var(--ff)", display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:"linear-gradient(135deg,#25D366,#128C7E)", boxShadow:"0 6px 20px rgba(37,211,102,.3)" }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.555 4.126 1.527 5.858L.057 23.617a.75.75 0 0 0 .92.92l5.818-1.488A11.946 11.946 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                </svg>
                {uploadDone ? "Konfirmasi Pembayaran via WhatsApp" : "Lanjut Chat WhatsApp"}
              </button>
              <button onClick={onClose} style={{ width:"100%", marginTop:10, padding:"12px 0", borderRadius:"var(--radius)", background:"none", color:"var(--text-muted)", fontWeight:600, fontSize:13, border:"none", cursor:"pointer", fontFamily:"var(--ff)" }}>
                Selesai
              </button>
            </>
          ) : (
            <>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                <p style={{ fontWeight:700, fontSize:16, color:"var(--text-primary)" }}>Saya Minat</p>
                <button style={S.closeBtn} onClick={onClose}><X size={15} color="var(--text-secondary)" /></button>
              </div>
              <p style={{ fontSize:12, color:"var(--text-muted)", marginBottom:16 }}>Informasi kamu akan diteruskan ke tim kami</p>

              {/* Preview */}
              <div style={{ display:"flex", alignItems:"center", gap:12, background:"var(--surface-2)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:12, marginBottom:16 }}>
                {item?.images?.[0]
                  ? <img src={item.images[0]} alt={item.name} style={{ width:48, height:48, borderRadius:10, objectFit:"cover", flexShrink:0 }} />
                  : <div style={{ width:48, height:48, borderRadius:10, background:"var(--brand-light)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Home size={18} color="var(--brand)" /></div>
                }
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight:700, fontSize:13, color:"var(--text-primary)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginBottom:2 }}>{item?.name}</p>
                  <p style={{ fontSize:11, color:"var(--text-muted)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{item?.location}</p>
                </div>
                <p style={{ fontSize:13, fontWeight:700, color:"var(--brand)", flexShrink:0 }}>
                  Rp {Number(item?.price || 0).toLocaleString("id-ID")}
                </p>
              </div>

              {/* Inputs */}
              {[
                ["Nama Lengkap",  "text", "contoh: Budi Santoso",  name,  setName],
                ["Nomor WhatsApp","tel",  "contoh: 08123456789",   phone, setPhone],
              ].map(([lbl, type, ph, val, setter]) => (
                <div key={lbl} style={{ marginBottom:12 }}>
                  <label style={fieldLabel}>
                    {lbl} <span style={{ color:"var(--danger)" }}>*</span>
                  </label>
                  <input
                    type={type}
                    placeholder={ph}
                    value={val}
                    onChange={(e) => setter(e.target.value)}
                    style={fieldInput}
                  />
                </div>
              ))}

              {/* Error */}
              {errMsg && (
                <div style={{ display:"flex", alignItems:"center", gap:8, background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:"var(--radius-sm)", padding:"10px 12px", marginBottom:12 }}>
                  <AlertCircle size={13} color="var(--danger)" style={{ flexShrink:0 }} />
                  <p style={{ fontSize:12, color:"var(--danger)" }}>{errMsg}</p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{ width:"100%", padding:"14px 0", borderRadius:"var(--radius)", color:"white", fontWeight:700, fontSize:14, border:"none", cursor:"pointer", fontFamily:"var(--ff)", display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:"linear-gradient(135deg,#25D366,#128C7E)", boxShadow:"0 6px 20px rgba(37,211,102,.3)", opacity:loading ? 0.7 : 1, transition:"opacity .2s" }}
              >
                {loading && <Loader2 size={16} style={{ animation:"spin 1s linear infinite" }} />}
                {loading ? "Mengirim..." : "Kirim Minat Saya"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   REPORT MODAL
───────────────────────────────────────────── */
function ReportModal({ item, onClose }) {
  const [reason,  setReason]  = useState("");
  const [note,    setNote]    = useState("");
  const [loading, setLoading] = useState(false);
  const [status,  setStatus]  = useState(null);
  const [errMsg,  setErrMsg]  = useState("");

  const handleClose = () => {
    setStatus(null); setReason(""); setNote(""); setErrMsg(""); onClose();
  };

  const handleSubmit = async () => {
    if (!reason) { setErrMsg("Pilih alasan laporan terlebih dahulu"); return; }
    const token = getToken();
    if (!token) { setErrMsg("Kamu harus login terlebih dahulu."); return; }
    setErrMsg(""); setLoading(true);
    try {
      const API = getApiUrl();
      const res = await authFetch(`${API}/listings/${item.id}/report`, {
        method: "POST",
        body: JSON.stringify({ reason, note: note.trim() || undefined }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || "Gagal mengirim laporan");
      }
      setStatus("success");
    } catch (e) {
      setErrMsg(e.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ ...S.overlay, alignItems:"center", padding:"0 16px" }} onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div style={{ fontFamily:"var(--ff)", background:"var(--surface)", width:"100%", maxWidth:440, borderRadius:"var(--radius-xl)", position:"relative", zIndex:100000, animation:"slideUp .25s cubic-bezier(.22,1,.36,1)", overflow:"hidden", boxShadow:"0 8px 32px rgba(0,0,0,.12)", maxHeight:"90vh", display:"flex", flexDirection:"column" }}>
        {status === "success" ? (
          <div style={{ padding:"36px 24px", textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
            <div style={{ width:64, height:64, borderRadius:"50%", background:"#DCFCE7", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <CheckCircle2 size={32} color="var(--success)" />
            </div>
            <div>
              <p style={{ fontWeight:700, fontSize:17, color:"var(--text-primary)", marginBottom:4 }}>Laporan terkirim!</p>
              <p style={{ fontSize:13, color:"var(--text-muted)", lineHeight:1.6 }}>Tim kami akan meninjau dalam 1×24 jam.</p>
            </div>
            <button onClick={handleClose} style={{ width:"100%", height:48, borderRadius:"var(--radius)", background:"var(--brand)", color:"white", fontWeight:700, fontSize:14, border:"none", cursor:"pointer", fontFamily:"var(--ff)" }}>
              Tutup
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ padding:"20px 20px 16px", borderBottom:"1px solid var(--border)", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <p style={{ fontWeight:700, fontSize:16, color:"var(--text-primary)", marginBottom:2 }}>Laporkan Listing</p>
                <p style={{ fontSize:12, color:"var(--text-muted)" }}>Melaporkan <strong style={{ color:"var(--text-secondary)" }}>{item?.name}</strong></p>
              </div>
              <button style={S.closeBtn} onClick={handleClose}><X size={15} color="var(--text-secondary)" /></button>
            </div>

            {/* Body */}
            <div style={{ padding:"16px 20px", overflowY:"auto", flex:1 }}>
              {/* Listing preview */}
              <div style={{ display:"flex", alignItems:"center", gap:10, background:"var(--surface-2)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:10, marginBottom:16 }}>
                {item?.images?.[0]
                  ? <img src={item.images[0]} alt={item.name} style={{ width:44, height:44, borderRadius:8, objectFit:"cover", flexShrink:0 }} />
                  : <div style={{ width:44, height:44, borderRadius:8, background:"#FEF2F2", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Flag size={16} color="var(--danger)" /></div>
                }
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginBottom:2 }}>{item?.name}</p>
                  <p style={{ fontSize:11, color:"var(--text-muted)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{item?.location}</p>
                </div>
              </div>

              {/* Reasons */}
              <p style={{ fontSize:10, fontWeight:700, letterSpacing:.6, textTransform:"uppercase", color:"var(--text-muted)", marginBottom:10 }}>Alasan Laporan</p>
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
                {REPORT_REASONS.map((r) => (
                  <label key={r.value} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", borderRadius:"var(--radius-sm)", border:`1.5px solid ${reason === r.value ? "#FECACA" : "var(--border)"}`, background:reason === r.value ? "#FEF2F2" : "var(--surface-2)", cursor:"pointer" }}>
                    <input type="radio" name="report_reason" value={r.value} checked={reason === r.value} onChange={() => { setReason(r.value); setErrMsg(""); }} style={{ accentColor:"var(--danger)" }} />
                    <span style={{ fontSize:13, fontWeight:500, color:reason === r.value ? "var(--danger)" : "var(--text-secondary)" }}>{r.label}</span>
                  </label>
                ))}
              </div>

              {/* Additional note */}
              <label style={{ fontSize:10, fontWeight:700, letterSpacing:.6, textTransform:"uppercase", color:"var(--text-muted)", display:"block", marginBottom:8 }}>
                Keterangan Tambahan <span style={{ fontWeight:400, textTransform:"none", letterSpacing:0 }}>(opsional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Jelaskan lebih detail..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{ width:"100%", background:"var(--surface-2)", border:"1.5px solid var(--border)", borderRadius:"var(--radius-sm)", padding:"11px 13px", fontSize:13.5, color:"var(--text-primary)", fontFamily:"var(--ff)", outline:"none", resize:"none", lineHeight:1.6 }}
              />
            </div>

            {/* Footer */}
            <div style={{ padding:"12px 20px 20px", borderTop:"1px solid var(--border)", flexShrink:0 }}>
              {errMsg && (
                <div style={{ display:"flex", alignItems:"center", gap:8, background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:"var(--radius-sm)", padding:"10px 12px", marginBottom:12 }}>
                  <AlertCircle size={13} color="var(--danger)" style={{ flexShrink:0 }} />
                  <p style={{ fontSize:12, color:"var(--danger)" }}>{errMsg}</p>
                </div>
              )}
              <button
                onClick={handleSubmit}
                disabled={!reason || loading}
                style={{ width:"100%", padding:"13px 0", borderRadius:"var(--radius)", background:"var(--danger)", color:"white", fontWeight:700, fontSize:14, border:"none", cursor:"pointer", fontFamily:"var(--ff)", display:"flex", alignItems:"center", justifyContent:"center", gap:8, opacity:(!reason || loading) ? 0.5 : 1, transition:"opacity .2s" }}
              >
                {loading ? <Loader2 size={15} style={{ animation:"spin 1s linear infinite" }} /> : <Flag size={14} />}
                {loading ? "Mengirim..." : "Kirim Laporan"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   LOADING SKELETON
───────────────────────────────────────────── */
function LoadingSkeleton() {
  const skel = (w, h, mb = 0) => ({
    width:`${w}%`, height:h, background:"var(--surface-3)",
    borderRadius:8, marginBottom:mb,
    animation:"skelPulse .9s ease infinite",
  });
  return (
    <div style={{ fontFamily:"var(--ff)", minHeight:"100vh", background:"var(--surface)" }}>
      <div style={{ height:300, background:"var(--surface-3)", animation:"skelPulse .9s ease infinite" }} />
      <div style={{ padding:"20px 20px 0" }}>
        <div style={skel(30, 18, 12)} />
        <div style={skel(75, 26, 8)}  />
        <div style={skel(55, 18, 24)} />
        <div style={{ ...skel(100, 80, 20), borderRadius:14 }} />
        <div style={skel(40, 18, 12)} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {[...Array(4)].map((_, i) => <div key={i} style={skel(100, 48)} />)}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN DETAIL PAGE
───────────────────────────────────────────── */
export default function DetailPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const API       = getApiUrl();
  const navBadges = useUserNavBadges();

  const [item,        setItem]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [fetchError,  setFetchError]  = useState(null);
  const [isLiked,     setIsLiked]     = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [lightbox,    setLightbox]    = useState(null);
  const [showMinat,   setShowMinat]   = useState(false);
  const [showReport,  setShowReport]  = useState(false);
  const [showShare,   setShowShare]   = useState(false);
  const [facilitiesModal, setFacilitiesModal] = useState(null);

  const toggleLocalLike = () => {
    const favs = getLocalFavorites();
    const idStr = String(id);
    const next = favs.includes(idStr)
      ? favs.filter((x) => String(x) !== idStr)
      : [...favs, idStr];
    setLocalFavorites(next);
    setIsLiked(next.includes(idStr));
  };

  useEffect(() => {
    const token = getToken();
    if (!token) { setIsLiked(getLocalFavorites().includes(id)); return; }
    (async () => {
      try {
        const res = await authFetch(`${API}/favorites`);
        if (!res.ok) {
          setIsLiked(getLocalFavorites().includes(id));
          return;
        }
        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data : [];
        const favIds = list.map(getFavoriteListingId).filter(Boolean);
        setLocalFavorites(favIds);
        setIsLiked(favIds.includes(String(id)));
      } catch {
        setIsLiked(getLocalFavorites().includes(id));
      }
    })();
  }, [id, API]);

  const toggleLike = async () => {
    const token = getToken();
    if (!token) {
      navigate("/auth", { state: { from: `/detail/${id}` } });
      return;
    }
    setLikeLoading(true);
    try {
      const method = isLiked ? "DELETE" : "POST";
      const res = await authFetch(`${API}/favorites/${id}`, { method });
      if (!res.ok) {
        toggleLocalLike();
        return;
      }
      const idStr = String(id);
      const local = getLocalFavorites();
      const nextLocal = isLiked
        ? local.filter((x) => String(x) !== idStr)
        : [...new Set([...local, idStr])];
      setLocalFavorites(nextLocal);
      setIsLiked(nextLocal.includes(idStr));
    } catch (err) {
      console.error(err);
      toggleLocalLike();
    } finally {
      setLikeLoading(false);
    }
  };

  // Fetch listing detail
  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setFetchError(null);
    (async () => {
      try {
        const res = await fetch(`${API}/listings/${id}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Kost tidak ditemukan");
        }
        const { data } = await res.json();
        if (!data) throw new Error("Data kost tidak tersedia");
        setItem(mapListingDetail(data));
        fetch(`${API}/listings/${id}/view`, { method: "POST" }).catch(() => {});
      } catch (err) {
        console.error(err);
        setFetchError(err.message || "Gagal memuat detail kost");
        setItem(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, API]);

  /* ── Render states ── */
  if (loading) {
    return (
      <>
        <InjectStyles css={GLOBAL_CSS} />
        <style>{USER_NAVBAR_CSS}</style>
        <style>{USER_BOTTOM_NAV_CSS}</style>
        <div className="detail-page user-page-shell">
          <UserNavbar badges={navBadges} />
          <LoadingSkeleton />
          <UserBottomNav />
        </div>
      </>
    );
  }

  if (!item) {
    return (
      <>
        <InjectStyles css={GLOBAL_CSS} />
        <style>{USER_NAVBAR_CSS}</style>
        <style>{USER_BOTTOM_NAV_CSS}</style>
        <div className="detail-page user-page-shell">
          <UserNavbar badges={navBadges} />
          <div style={{ fontFamily:"var(--ff)", minHeight:"60vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, padding:24 }}>
            <div style={{ width:64, height:64, borderRadius:"var(--radius-lg)", background:"var(--surface-2)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Home size={28} color="var(--text-muted)" />
            </div>
            <p style={{ fontSize:14, color:"var(--text-muted)", fontWeight:500, textAlign:"center" }}>
              {fetchError || "Data tidak ditemukan"}
            </p>
            <button onClick={() => navigate("/search")} style={{ fontSize:13, fontWeight:700, color:"var(--brand)", background:"var(--brand-light)", border:"none", padding:"10px 24px", borderRadius:99, cursor:"pointer", fontFamily:"var(--ff)" }}>
              Cari kost lain
            </button>
          </div>
          <UserBottomNav />
        </div>
      </>
    );
  }

  const images    = item.images ?? [];
  const galleryImages = [...images, ...(item.sharedFacilityImages ?? [])];
  const hasPhotos = galleryImages.length > 0;
  const gender    = genderConfig[(item.gender || "").toLowerCase()];

  return (
    <>
      <InjectStyles css={GLOBAL_CSS} />
      <style>{USER_NAVBAR_CSS}</style>
      <style>{USER_BOTTOM_NAV_CSS}</style>
      <div className="detail-page user-page-shell" style={{ fontFamily:"var(--ff)", color:"var(--text-primary)" }}>

        <UserNavbar badges={navBadges} />

        <div className="detail-shell">
        {/* ══ IMAGE GALLERY ══ */}
        <div style={{ position:"relative", background:"#0D1117" }}>
          <div className="detail-gallery-grid" style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gridTemplateRows:"1fr 1fr", gap:2, height:300 }}>

            {/* Main image */}
            <div
              style={{ gridRow:"1/3", position:"relative", overflow:"hidden", cursor:hasPhotos ? "pointer" : "default", background:"#1A1A2E" }}
              onClick={() => hasPhotos && setLightbox(0)}
            >
              {hasPhotos
                ? <img src={images[0]} alt={item.name} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                : (
                  <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8, color:"#475569" }}>
                    <Home size={32} strokeWidth={1.5} />
                    <span style={{ fontSize:12 }}>Foto tidak tersedia</span>
                  </div>
                )
              }
              {images.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setLightbox(0); }}
                  style={{ position:"absolute", bottom:12, left:12, display:"flex", alignItems:"center", gap:6, background:"rgba(255,255,255,.92)", backdropFilter:"blur(8px)", color:"var(--text-primary)", fontSize:12, fontWeight:700, padding:"7px 12px", borderRadius:99, border:"none", cursor:"pointer", fontFamily:"var(--ff)" }}
                >
                  <LayoutGrid size={13} /> Lihat semua ({images.length})
                </button>
              )}
            </div>

            {/* Thumbnails */}
            {[1, 2].map((i) => (
              <div
                key={i}
                style={{ position:"relative", overflow:"hidden", cursor:images[i] ? "pointer" : "default", background:"#12121F" }}
                onClick={() => images[i] && setLightbox(i)}
              >
                {images[i] && (
                  <img src={images[i]} alt={`foto ${i + 1}`} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                )}
                {i === 2 && images.length > 3 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setLightbox(0); }}
                    style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.6)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4, border:"none", cursor:"pointer" }}
                  >
                    <LayoutGrid size={20} color="white" />
                    <span style={{ color:"white", fontSize:12, fontWeight:700 }}>+{images.length - 3}</span>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Overlay nav */}
          <div className="detail-gallery-overlay" style={{ position:"absolute", top:0, left:0, right:0, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 48px 12px", pointerEvents:"none" }}>
            <button
              onClick={() => navigate(-1)}
              style={{ width:38, height:38, borderRadius:"50%", background:"rgba(255,255,255,.9)", backdropFilter:"blur(8px)", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", pointerEvents:"all" }}
            >
              <ArrowLeft size={17} color="var(--text-primary)" />
            </button>
            <div style={{ display:"flex", gap:8, pointerEvents:"all" }}>
              <button
                onClick={() => setShowShare(true)}
                style={{ width:38, height:38, borderRadius:"50%", background:"rgba(255,255,255,.9)", backdropFilter:"blur(8px)", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}
              >
                <Share2 size={15} color="var(--text-primary)" />
              </button>
              <button
                onClick={toggleLike}
                style={{ width:38, height:38, borderRadius:"50%", background:isLiked ? "var(--danger)" : "rgba(255,255,255,.9)", backdropFilter:"blur(8px)", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"background .2s" }}
              >
                <Heart size={15} fill={isLiked ? "white" : "none"} color={isLiked ? "white" : "var(--text-primary)"} />
              </button>
            </div>
          </div>
        </div>

        {/* ══ CONTENT ══ */}
        <div className="detail-content">

          {/* Badges */}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10, flexWrap:"wrap" }}>
            {gender && (
              <span style={{ fontSize:11, fontWeight:600, padding:"4px 10px", borderRadius:99, background:gender.bg, color:gender.text, border:`1px solid ${gender.border}` }}>
                {gender.label}
              </span>
            )}
            {item.availableRooms === 0 && (
              <span style={{ fontSize:10, fontWeight:700, padding:"4px 10px", borderRadius:99, background:"#FEF2F2", color:"var(--danger)", border:"1px solid #FECACA", letterSpacing:.5, textTransform:"uppercase" }}>
                Penuh
              </span>
            )}
          </div>

          {/* Title & location */}
          <h1 style={{ fontFamily:"var(--ff-display)", fontSize:22, color:"var(--text-primary)", lineHeight:1.25, marginBottom:6 }}>{item.name}</h1>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:16 }}>
            <MapPin size={13} color="var(--text-muted)" style={{ flexShrink:0 }} />
            <span style={{ fontSize:13, color:"var(--text-muted)" }}>{item.location}</span>
          </div>

          <QuickStatsRow item={item} gender={gender} />

          {/* Price banner */}
          <div style={{ borderRadius:"var(--radius-lg)", padding:"16px 20px", marginBottom:24, background:"linear-gradient(135deg,#4338CA 0%,#4F46E5 55%,#A78BFA 100%)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
            <div>
              <p style={{ fontSize:11, color:"rgba(255,255,255,.6)", marginBottom:4, fontWeight:500 }}>Harga mulai dari</p>
              <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
                <span style={{ fontSize:22, fontWeight:800, color:"white" }}>Rp {Number(item.price).toLocaleString("id-ID")}</span>
                <span style={{ fontSize:12, color:"rgba(255,255,255,.6)" }}>/bulan</span>
              </div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              {item.roomTypes?.length > 0 && (
                <div style={{ background:"rgba(255,255,255,.18)", backdropFilter:"blur(6px)", borderRadius:12, padding:"10px 14px", textAlign:"center", minWidth:72 }}>
                  <p style={{ fontSize:20, fontWeight:800, color:"white", lineHeight:1 }}>{item.roomTypes.length}</p>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,.7)", fontWeight:600, marginTop:3, textTransform:"uppercase", letterSpacing:.5 }}>Tipe</p>
                </div>
              )}
              <div style={{ background:"rgba(255,255,255,.18)", backdropFilter:"blur(6px)", borderRadius:12, padding:"10px 14px", textAlign:"center", minWidth:72 }}>
                <p style={{ fontSize:20, fontWeight:800, color:"white", lineHeight:1 }}>{item.availableRooms}</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,.7)", fontWeight:600, marginTop:3, textTransform:"uppercase", letterSpacing:.5 }}>Kamar</p>
              </div>
            </div>
          </div>

          {/* Deskripsi */}
          {item.description && (
            <div style={{ marginBottom:24 }}>
              <SectionHeading icon={Home} title="Deskripsi" />
              <p style={{ fontSize:13.5, color:"var(--text-secondary)", lineHeight:1.75, padding:"14px 16px", borderRadius:"var(--radius-lg)", background:"var(--surface-2)", border:"1px solid var(--border)" }}>
                {item.description}
              </p>
            </div>
          )}

          {/* Peraturan */}
          {item.rules.length > 0 && (
            <div style={{ marginBottom:24 }}>
              <SectionHeading icon={ShieldCheck} title="Peraturan Kos" />
              <div style={{ borderRadius:"var(--radius-lg)", border:"1px solid var(--border)", overflow:"hidden", background:"var(--surface)" }}>
                {item.rules.map((r, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"13px 16px", borderBottom:i < item.rules.length - 1 ? "1px solid var(--surface-2)" : "none" }}>
                    <div style={{ width:28, height:28, borderRadius:8, background:"#FEF2F2", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1, color:"var(--danger)" }}>
                      {getRuleIcon(r)}
                    </div>
                    <span style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.6 }}>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fasilitas kost bersama */}
          {(item.kostFacilities?.length > 0 || item.sharedFacilityImages?.length > 0) && (
            <div style={{ marginBottom:24 }}>
              <SectionHeading icon={Home} title="Fasilitas & Layanan Gedung" />
              <p style={{ fontSize:12, color:"var(--text-muted)", marginBottom:12, lineHeight:1.55 }}>
                Fasilitas area umum untuk seluruh penghuni kost ini.
              </p>
              {item.sharedFacilityImages?.length > 0 && (
                <div style={{ display:"flex", gap:8, overflowX:"auto", marginBottom: item.kostFacilities?.length ? 14 : 0, paddingBottom:4 }}>
                  {item.sharedFacilityImages.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setLightbox(images.length + i)}
                      style={{ flexShrink:0, width:120, height:90, borderRadius:12, overflow:"hidden", border:"1px solid var(--border)", padding:0, cursor:"pointer", background:"#12121F" }}
                    >
                      <img src={img} alt={`Fasilitas bersama ${i + 1}`} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                    </button>
                  ))}
                </div>
              )}
              {item.kostFacilities?.length > 0 && (
                <FacilityChipList
                  facilities={item.kostFacilities}
                  maxVisible={8}
                  showAllLabel="Lihat semua fasilitas gedung"
                  onShowAll={() => setFacilitiesModal({ variant: "gedung", facilities: item.kostFacilities })}
                />
              )}
            </div>
          )}

          {/* Tipe kamar */}
          {item.roomTypes?.length > 0 && (
            <div style={{ marginBottom:24 }}>
              <SectionHeading
                icon={Layers}
                title="Tipe Kamar"
                badge={
                  <span style={{ fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:99, background:"var(--brand-light)", color:"var(--brand)", border:"1px solid #DDD6FE" }}>
                    {item.roomTypes.length} tipe
                  </span>
                }
              />
              <p style={{ fontSize:12, color:"var(--text-muted)", marginBottom:14, lineHeight:1.55 }}>
                Setiap tipe punya fasilitas kamar, ukuran, harga, ketersediaan, dan foto masing-masing.
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {item.roomTypes.map((room, i) => (
                  <RoomTypeCard
                    key={room.id || i}
                    room={room}
                    index={i}
                    photoOffset={getRoomPhotoOffset(item.roomTypes, i)}
                    onPhotoClick={(idx) => setLightbox(idx)}
                    onShowFacilities={(r) =>
                      setFacilitiesModal({
                        variant: "kamar",
                        facilities: r.facilities,
                        roomName: r.name,
                      })
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* ══ LOKASI — CartoDB Positron (sama seperti MapPage) ══ */}
          <div style={{ marginBottom:24 }}>
            <SectionHeading icon={MapPin} title="Lokasi" />
            <p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.65, marginBottom:12, padding:"0 2px" }}>{item.location}</p>
            {item.latitude && item.longitude ? (
              <>
                <div style={{ borderRadius:"var(--radius-lg)", overflow:"hidden", border:"1px solid var(--border)", height:260, position:"relative", zIndex:0 }}>
                  <MapContainer
                    center={[item.latitude, item.longitude]}
                    zoom={15}
                    style={{ width:"100%", height:"100%" }}
                    zoomControl={false}
                  >
                    {/* CartoDB Positron — minimalis, konsisten dengan MapPage */}
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
                      url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                      subdomains="abcd"
                      maxZoom={19}
                    />
                    <Marker
                      position={[item.latitude, item.longitude]}
                      icon={createPriceIcon(item.price, true)}
                    />
                    <MapCenter lat={item.latitude} lng={item.longitude} />
                  </MapContainer>
                </div>
                <div style={{ marginTop:10, padding:"11px 14px", background:"var(--brand-light)", border:"1px solid #DDD6FE", borderRadius:"var(--radius-sm)", display:"flex", alignItems:"flex-start", gap:8 }}>
                  <Navigation size={13} color="var(--brand)" style={{ flexShrink:0, marginTop:1 }} />
                  <p style={{ fontSize:12, fontWeight:600, color:"#4F46E5", margin:0, lineHeight:1.5 }}>
                    Peta menunjukkan area perkiraan saja. Alamat pasti diberikan setelah proses via Atap.
                  </p>
                </div>
              </>
            ) : (
              <div style={{ padding:"12px 14px", borderRadius:"var(--radius-sm)", background:"var(--surface-2)", border:"1px solid var(--border)", fontSize:12, color:"var(--text-muted)" }}>
                Peta lokasi belum tersedia untuk kost ini.
              </div>
            )}
          </div>

          {/* Report link */}
          <div style={{ display:"flex", justifyContent:"center", marginBottom:24 }}>
            <button
              onClick={() => setShowReport(true)}
              style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"var(--text-muted)", background:"none", border:"none", cursor:"pointer", fontFamily:"var(--ff)" }}
            >
              <Flag size={13} /> Laporkan listing ini
            </button>
          </div>
        </div>
        </div>
      </div>

      <UserBottomNav />

      {/* ══ BOTTOM BAR (CTA) ══ */}
      <div className="detail-action-bar">
        <div className="detail-bottom-inner">
          {/* Like */}
          <button
            type="button"
            onClick={toggleLike}
            disabled={likeLoading}
            style={{ width:48, height:48, borderRadius:"var(--radius)", border:`1.5px solid ${isLiked ? "#FECACA" : "var(--border)"}`, background:isLiked ? "#FEF2F2" : "var(--surface-2)", display:"flex", alignItems:"center", justifyContent:"center", cursor:likeLoading ? "wait" : "pointer", flexShrink:0, transition:"all .2s", opacity:likeLoading ? 0.7 : 1 }}
          >
            <Heart size={18} fill={isLiked ? "var(--danger)" : "none"} color={isLiked ? "var(--danger)" : "var(--text-muted)"} />
          </button>

          {/* Minat (WhatsApp Atap) */}
          <button
            type="button"
            onClick={() => setShowMinat(true)}
            style={{ flex:1, height:48, borderRadius:"var(--radius)", color:"white", fontWeight:700, fontSize:13, fontFamily:"var(--ff)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:"linear-gradient(135deg,#25D366,#128C7E)", boxShadow:"0 4px 16px rgba(37,211,102,.3)" }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.555 4.126 1.527 5.858L.057 23.617a.75.75 0 0 0 .92.92l5.818-1.488A11.946 11.946 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
            </svg>
            Saya Minat
          </button>

          {/* Report */}
          <button
            type="button"
            onClick={() => setShowReport(true)}
            style={{ width:48, height:48, borderRadius:"var(--radius)", background:"#FEF2F2", border:"1px solid #FECACA", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}
          >
            <Flag size={17} color="var(--danger)" />
          </button>
        </div>
      </div>

      {/* ══ MODALS ══ */}
      {showMinat  && <MinatModal  item={item} onClose={() => setShowMinat(false)}  />}
      {showReport && <ReportModal item={item} onClose={() => setShowReport(false)} />}
      {showShare  && <ShareModal  item={item} onClose={() => setShowShare(false)}  />}
      {hasPhotos && lightbox !== null && (
        <PhotoLightbox images={galleryImages} startIndex={lightbox} onClose={() => setLightbox(null)} />
      )}

      <FacilitiesModal
        open={Boolean(facilitiesModal)}
        onClose={() => setFacilitiesModal(null)}
        title={
          facilitiesModal?.variant === "kamar"
            ? "Fasilitas Kamar"
            : "Semua Fasilitas Gedung"
        }
        subtitle={
          facilitiesModal?.variant === "kamar" && facilitiesModal?.roomName
            ? facilitiesModal.roomName
            : undefined
        }
        facilities={facilitiesModal?.facilities || []}
        variant={facilitiesModal?.variant || "gedung"}
      />
    </>
  );
}