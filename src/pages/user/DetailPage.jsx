import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getApiBase, postPublicJson, resolveMediaUrl } from "../../config/apiBase";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ArrowLeft, MapPin, Heart, MessageCircle, Home, Ruler,
  ShieldCheck, ChevronLeft, ChevronRight, X, Phone,
  Calendar, Wifi, Wind, ShowerHead, Car,
  DoorOpen, Clock, UserX, CigaretteOff, VolumeX,
  LayoutGrid, Send, Loader2, Share2,
  Zap, Tv, Coffee, Utensils, Dumbbell, Package, Droplets,
  Thermometer, BookOpen, TreePine, WashingMachine, Lock,
  ChevronRight as ChevRight, Globe,
  CheckCircle2, AlertCircle, Navigation, Info, HelpCircle,
  Flag, Copy, Check, Mail,
} from "lucide-react";

/* ─── Global styles injected once ───────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=DM+Serif+Display:ital@0;1&display=swap');

  :root {
    --brand: #1A56DB;
    --brand-dark: #1340B0;
    --brand-light: #EBF1FF;
    --accent: #0EA5E9;
    --success: #10B981;
    --danger: #EF4444;
    --warn: #F59E0B;
    --surface: #FFFFFF;
    --surface-2: #F7F8FC;
    --surface-3: #EEF0F7;
    --border: #E4E7F0;
    --border-strong: #CDD1E0;
    --text-primary: #0D1117;
    --text-secondary: #4B5568;
    --text-muted: #8B96AB;
    --radius-sm: 10px;
    --radius: 14px;
    --radius-lg: 20px;
    --radius-xl: 28px;
    --shadow-xs: 0 1px 3px rgba(0,0,0,.06);
    --shadow-sm: 0 2px 8px rgba(0,0,0,.08);
    --shadow-md: 0 4px 18px rgba(0,0,0,.10);
    --shadow-lg: 0 8px 32px rgba(0,0,0,.12);
    --shadow-brand: 0 6px 20px rgba(26,86,219,.28);
    --ff: 'DM Sans', -apple-system, sans-serif;
    --ff-display: 'DM Serif Display', Georgia, serif;
  }

  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

  @keyframes slideUp   { from { transform:translateY(20px); opacity:0 } to { transform:translateY(0); opacity:1 } }
  @keyframes fadeIn    { from { opacity:0 } to { opacity:1 } }
  @keyframes lbFadeIn  { from { opacity:0 } to { opacity:1 } }
  @keyframes lbImgIn   { from { opacity:0; transform:scale(.97) } to { opacity:1; transform:scale(1) } }
  @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes spin      { to { transform:rotate(360deg) } }

  .scrollbar-hide::-webkit-scrollbar { display:none }
  .scrollbar-hide { scrollbar-width:none }

  /* Leaflet z-index fix */
  .leaflet-container { z-index:0 !important }
  .leaflet-pane      { z-index:0 !important }
  .leaflet-top, .leaflet-bottom { z-index:1 !important }

  /* Thumbnail strip */
  .lb-thumb-strip::-webkit-scrollbar { display:none }
  .lb-thumb-strip { scrollbar-width:none }
  .lb-thumb { flex-shrink:0; width:72px; height:52px; border-radius:8px; overflow:hidden; cursor:pointer; border:2px solid transparent; transition:border-color .15s,opacity .15s; opacity:.5; background:none; padding:0 }
  .lb-thumb.active { border-color:#fff; opacity:1 }
  .lb-thumb:hover { opacity:.8 }
  .lb-nav-btn { width:44px; height:44px; border-radius:50%; background:rgba(255,255,255,.14); border:1.5px solid rgba(255,255,255,.22); display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; transition:background .15s; backdrop-filter:blur(6px) }
  .lb-nav-btn:hover { background:rgba(255,255,255,.28) }
  .lb-close-btn { width:40px; height:40px; border-radius:50%; background:rgba(255,255,255,.12); border:1.5px solid rgba(255,255,255,.18); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background .15s }
  .lb-close-btn:hover { background:rgba(255,255,255,.24) }
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

/* ── ShareModal ──────────────────────────────────────────────────────────── */
function ShareModal({ item, onClose }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/detail/${item.id}`;
  const shareText = `Cek kost "${item.name}" di ${item.location}. Harga Rp ${Number(item.price).toLocaleString("id-ID")}/bulan. ${shareUrl}`;

  const copyToClipboard = async () => {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch (err) { console.error(err); }
  };

  const shareOptions = [
    { id:"copy",      label:"Salin Link",  icon: copied ? Check : Copy,
      color:"#475569", bg:"#F1F5F9", action: copyToClipboard, desc:"Copy ke clipboard" },
    { id:"whatsapp",  label:"WhatsApp",
      icon: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.555 4.126 1.527 5.858L.057 23.617a.75.75 0 0 0 .92.92l5.818-1.488A11.946 11.946 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>,
      color:"#16A34A", bg:"#DCFCE7", action: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`,"_blank"), desc:"Bagikan ke WA" },
    { id:"telegram",  label:"Telegram",
      icon: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.161.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.328-.373-.115l-6.869 4.332-2.97-.924c-.644-.213-.658-.644.135-.954l11.593-4.47c.537-.196 1.006.128.832.941z"/></svg>,
      color:"#0EA5E9", bg:"#E0F2FE", action: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,"_blank"), desc:"Bagikan ke TG" },
    { id:"facebook",  label:"Facebook",
      icon: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
      color:"#2563EB", bg:"#DBEAFE", action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,"_blank"), desc:"Bagikan ke FB" },
    { id:"twitter",   label:"X / Twitter",
      icon: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.514l-5.106-6.67-5.829 6.67H2.306l7.644-8.74L.554 2.25h6.696l4.627 6.122 5.361-6.122z"/></svg>,
      color:"#0D1117", bg:"#F1F5F9", action: () => window.open(`https://x.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,"_blank"), desc:"Bagikan ke X" },
    { id:"email",     label:"Email",       icon: Mail,
      color:"#EA580C", bg:"#FFF7ED", action: () => { const s=encodeURIComponent(`Lihat kost: ${item.name}`); const b=encodeURIComponent(`Halo,\n\nAku menemukan kost yang menarik:\n\n${shareText}`); window.location.href=`mailto:?subject=${s}&body=${b}`; }, desc:"Via Email" },
  ];

  return (
    <div className="fixed inset-0 flex items-end justify-center" style={{ zIndex:99999, background:"rgba(0,0,0,.55)", backdropFilter:"blur(4px)" }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ fontFamily:"var(--ff)", background:"var(--surface)", width:"100%", maxWidth:480, borderRadius:"28px 28px 0 0", padding:"12px 20px 32px", position:"relative", zIndex:100000, animation:"slideUp .3s cubic-bezier(.22,1,.36,1)" }}>
        <div style={{ width:40, height:4, borderRadius:99, background:"var(--border-strong)", margin:"0 auto 20px" }} />
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <span style={{ fontWeight:700, fontSize:16, color:"var(--text-primary)" }}>Bagikan Listing</span>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", background:"var(--surface-2)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <X size={15} color="var(--text-secondary)" />
          </button>
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
            <p style={{ fontSize:12, fontWeight:700, color:"var(--brand)" }}>Rp {Number(item?.price||0).toLocaleString("id-ID")}<span style={{ fontWeight:400, color:"var(--text-muted)" }}>/bulan</span></p>
          </div>
        </div>

        {/* Share grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:18 }}>
          {shareOptions.map(opt => {
            const Ico = opt.icon;
            return (
              <button key={opt.id} onClick={opt.action} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, padding:"14px 8px", borderRadius:"var(--radius)", background:opt.bg, border:"1.5px solid transparent", cursor:"pointer", transition:"all .15s", fontFamily:"var(--ff)" }}>
                <div style={{ width:40, height:40, borderRadius:12, background:"rgba(255,255,255,.8)", display:"flex", alignItems:"center", justifyContent:"center", color:opt.color }}>
                  <Ico size={20} />
                </div>
                <p style={{ fontSize:11, fontWeight:700, color:"var(--text-primary)", textAlign:"center", lineHeight:1.3 }}>{opt.label}</p>
              </button>
            );
          })}
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
  );
}

/* ── PhotoLightbox ───────────────────────────────────────────────────────── */
function PhotoLightbox({ images, startIndex = 0, onClose }) {
  const [current, setCurrent] = useState(startIndex);
  const thumbsLbRef = useRef(null);
  const touchStartXRef = useRef(null);
  const total = images.length;
  const prev = () => setCurrent(c => (c - 1 + total) % total);
  const next = () => setCurrent(c => (c + 1) % total);

  useEffect(() => { const el = thumbsLbRef.current?.children[current]; if (el) el.scrollIntoView({ behavior:"smooth", inline:"center", block:"nearest" }); }, [current]);
  useEffect(() => { const h = e => { if (e.key==="ArrowLeft") prev(); else if (e.key==="ArrowRight") next(); else if (e.key==="Escape") onClose(); }; window.addEventListener("keydown",h); return ()=>window.removeEventListener("keydown",h); }, []);
  useEffect(() => { document.body.style.overflow="hidden"; return ()=>{ document.body.style.overflow=""; }; }, []);

  const handleTouchStart = e => { touchStartXRef.current = e.touches[0].clientX; };
  const handleTouchEnd = e => {
    if (touchStartXRef.current===null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff)>40) diff>0 ? next() : prev();
    touchStartXRef.current = null;
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:99999, background:"rgba(0,0,0,.97)", display:"flex", flexDirection:"column", animation:"lbFadeIn .2s ease" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 20px", flexShrink:0 }}>
        <span style={{ color:"rgba(255,255,255,.5)", fontSize:12, fontWeight:700, fontFamily:"var(--ff)", letterSpacing:.5, textTransform:"uppercase" }}>Foto</span>
        <span style={{ color:"white", fontSize:14, fontWeight:700, fontFamily:"var(--ff)" }}>{current+1} / {total}</span>
        <button className="lb-close-btn" onClick={onClose}><X size={17} color="white" /></button>
      </div>
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 68px", minHeight:0, position:"relative" }}
        onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <button className="lb-nav-btn" onClick={prev} style={{ position:"absolute", left:12, zIndex:2 }}><ChevronLeft size={22} color="white" /></button>
        <img key={current} src={images[current]} alt={`Foto ${current+1}`} style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain", borderRadius:12, animation:"lbImgIn .22s ease", userSelect:"none", WebkitUserDrag:"none" }} draggable={false} />
        <button className="lb-nav-btn" onClick={next} style={{ position:"absolute", right:12, zIndex:2 }}><ChevronRight size={22} color="white" /></button>
      </div>
      <div style={{ flexShrink:0, padding:"16px 20px 28px" }}>
        <div ref={thumbsLbRef} className="lb-thumb-strip" style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }}>
          {images.map((img,i) => (
            <button key={i} className={`lb-thumb${i===current?" active":""}`} onClick={()=>setCurrent(i)}>
              <img src={img} alt={`thumb ${i+1}`} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Leaflet helpers ─────────────────────────────────────────────────────── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function createPriceIcon(price, active=false) {
  const label = price>=1_000_000 ? `Rp ${(price/1_000_000).toFixed(1).replace(".0","")}jt` : `Rp ${Math.round(price/1_000)}rb`;
  const bg=active?"#1A56DB":"#fff", color=active?"#fff":"#0D1117", border=active?"#1340B0":"#CDD1E0";
  return L.divIcon({ className:"", html:`<div style="position:relative;display:inline-flex;align-items:center;justify-content:center;background:${bg};color:${color};padding:5px 12px;border-radius:999px;font-size:12px;font-weight:800;font-family:'DM Sans',sans-serif;white-space:nowrap;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.18);border:2px solid ${border};line-height:1.2;user-select:none;">${label}<span style="position:absolute;bottom:-7px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid ${border};"></span><span style="position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid ${bg};"></span></div>`, iconSize:[90,32], iconAnchor:[45,39], popupAnchor:[0,-42] });
}

function MapCenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => { if (lat&&lng) map.setView([lat,lng],15,{animate:true}); }, [lat,lng,map]);
  return null;
}

/* ── Facility helper ─────────────────────────────────────────────────────── */
const facilityMap = [
  { keys:["wifi","internet"],            icon:Wifi,         color:"#2563EB", bg:"#EFF6FF" },
  { keys:["ac","kipas","pendingin"],     icon:Thermometer,  color:"#0EA5E9", bg:"#F0F9FF" },
  { keys:["mandi","shower","kamar mandi"],icon:ShowerHead,  color:"#7C3AED", bg:"#F5F3FF" },
  { keys:["parkir","motor","mobil","garasi"],icon:Car,       color:"#D97706", bg:"#FFFBEB" },
  { keys:["tv","televisi"],              icon:Tv,            color:"#DC2626", bg:"#FEF2F2" },
  { keys:["dapur","masak","kompor"],     icon:Utensils,      color:"#059669", bg:"#ECFDF5" },
  { keys:["gym","olahraga","fitness"],   icon:Dumbbell,      color:"#EA580C", bg:"#FFF7ED" },
  { keys:["laundry","cuci","mesin cuci"],icon:WashingMachine,color:"#4F46E5", bg:"#EEF2FF" },
  { keys:["lemari","kabinet","almari"],  icon:Package,       color:"#65A30D", bg:"#F7FEE7" },
  { keys:["air minum","galon","dispenser"],icon:Droplets,    color:"#0284C7", bg:"#F0F9FF" },
  { keys:["kopi","cafe"],                icon:Coffee,        color:"#92400E", bg:"#FEF3C7" },
  { keys:["listrik","token","pln"],      icon:Zap,           color:"#CA8A04", bg:"#FEFCE8" },
  { keys:["taman","garden","hijau"],     icon:TreePine,      color:"#16A34A", bg:"#F0FDF4" },
  { keys:["buku","perpustakaan"],        icon:BookOpen,      color:"#6D28D9", bg:"#F5F3FF" },
  { keys:["kunci","keamanan","security"],icon:Lock,          color:"#374151", bg:"#F9FAFB" },
];
const getFacilityStyle = (name="") => {
  const n = name.toLowerCase();
  const m = facilityMap.find(f=>f.keys.some(k=>n.includes(k)));
  return m ? { Icon:m.icon, color:m.color, bg:m.bg } : { Icon:Home, color:"#6B7280", bg:"#F9FAFB" };
};

const ruleIcon = (r="") => {
  const rl = r.toLowerCase();
  if (rl.includes("jam")||rl.includes("malam")) return <Clock size={14} />;
  if (rl.includes("tamu")||rl.includes("lawan jenis")) return <UserX size={14} />;
  if (rl.includes("rokok")||rl.includes("merokok")) return <CigaretteOff size={14} />;
  if (rl.includes("bising")||rl.includes("musik")) return <VolumeX size={14} />;
  return <ShieldCheck size={14} />;
};

const genderConfig = {
  putra:  { label:"Putra",  bg:"#EFF6FF", text:"#1D4ED8", border:"#BFDBFE" },
  putri:  { label:"Putri",  bg:"#FDF2F8", text:"#9D174D", border:"#FBCFE8" },
  campur: { label:"Campur", bg:"#F0FDF4", text:"#166534", border:"#BBF7D0" },
};

const formatPhone = n => n?.startsWith("0") ? "62"+n.slice(1) : n||"";
const fmtTime = iso => { const d=new Date(iso); return `${d.getHours().toString().padStart(2,"0")}.${d.getMinutes().toString().padStart(2,"0")}`; };
const addMonths = (dateStr,months) => { const d=new Date(dateStr); d.setMonth(d.getMonth()+months); return d.toISOString().split("T")[0]; };
const fmtDate = iso => { if(!iso) return ""; const d=new Date(iso); return `${d.getDate().toString().padStart(2,"0")}/${(d.getMonth()+1).toString().padStart(2,"0")}/${d.getFullYear()}`; };
const fmtRp = n => `Rp ${Number(n||0).toLocaleString("id-ID")}`;

const QUICK_REPLIES = [
  { label:"Masih tersedia?", text:"Apakah kamar masih tersedia?" },
  { label:"Mau survey",      text:"Boleh survey dulu kak?" },
  { label:"Nego harga?",     text:"Apakah bisa nego harga?" },
  { label:"Tanya fasilitas", text:"Fasilitas apa saja yang tersedia?" },
];
const REPORT_REASONS = [
  { label:"Informasi tidak akurat", value:"INFORMASI_SALAH" },
  { label:"Foto menyesatkan",       value:"FOTO_TIDAK_SESUAI" },
  { label:"Penipuan / scam",        value:"PENIPUAN" },
  { label:"Sudah tidak tersedia",   value:"TIDAK_AKTIF" },
];

const API = getApiBase();
function mapListingDetail(data) {
  const rawUrls = data.photos?.length>0 ? data.photos.map(p=>p.url) : (data.roomTypes??[]).flatMap(rt=>(rt.photos??[]).map(p=>p.url));
  const images = rawUrls.filter(Boolean).map(url=>resolveMediaUrl(url)).filter(Boolean);
  const facilities = data.facilities?.length>0 ? data.facilities : [...new Set((data.roomTypes??[]).flatMap(r=>r.facilities||[]))];
  const primaryRoom = data.roomTypes?.[0];
  const availableRooms = (data.roomTypes??[]).reduce((s,r)=>s+(r.availableCount||0),0);
  return {
    id:data.id, name:data.name||"Tanpa nama", location:data.address||"Lokasi tidak tersedia",
    description:data.description||"", rules:Array.isArray(data.rules)?data.rules:[], gender:data.genderType,
    contactNumber:data.contactNumber||"", ownerId:data.owner?.id||"", ownerName:data.owner?.name||"Pemilik",
    price:data.cheapestPrice??primaryRoom?.price??0, size:primaryRoom?.size||"-", facilities, images,
    isPremium:Boolean(data.isPremium), isFeatured:Boolean(data.isPremium), availableRooms,
    latitude:data.latitude??null, longitude:data.longitude??null,
    roomTypes:(data.roomTypes??[]).map(room=>({
      id:room.id, name:room.name||"Tipe kamar", price:room.price??0, size:room.size||"-",
      availableCount:room.availableCount??0, facilities:Array.isArray(room.facilities)?room.facilities:[],
      image:resolveMediaUrl(room.photos?.[0]?.url),
    })),
    status:data.status,
  };
}

const getToken = () => localStorage.getItem("token")||localStorage.getItem("accessToken")||"";
const getCurrentUser = () => { try { return JSON.parse(localStorage.getItem("user")||"{}"); } catch { return {}; } };
const getCurrentUserId = () => getCurrentUser().id||"";

const buildMinatWhatsAppUrl = (item,{name,phone}={}) => {
  const waNum = formatPhone(WHATSAPP_CONSULTATION);
  const waMsg = name&&phone
    ? `Halo, saya *${name}* (${phone}) tertarik dengan kost *${item.name}* di ${item.location}. Apakah masih tersedia?`
    : `Halo, saya tertarik dengan kost *${item.name}* di ${item.location}. Apakah masih tersedia?`;
  return `https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}`;
};
const authFetch = (url,opts={}) => {
  const token = getToken();
  const headers = { "Content-Type":"application/json",...(opts.headers||{}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(url,{...opts,headers});
};

const SERVICE_FEE = 250_000;
const WHATSAPP_CONSULTATION = "083160982717";

/* ─── Shared UI primitives ───────────────────────────────────────────────── */
const S = {
  /* sheet overlay */
  overlay: { position:"fixed", inset:0, zIndex:99999, background:"rgba(0,0,0,.55)", backdropFilter:"blur(4px)", display:"flex", alignItems:"flex-end", justifyContent:"center" },
  sheet: { fontFamily:"var(--ff)", background:"var(--surface)", width:"100%", maxWidth:480, borderRadius:"28px 28px 0 0", position:"relative", zIndex:100000, animation:"slideUp .3s cubic-bezier(.22,1,.36,1)", overflow:"hidden" },
  handle: { width:40, height:4, borderRadius:99, background:"var(--border-strong)", margin:"12px auto 0" },
  closeBtn: { width:32, height:32, borderRadius:"50%", background:"var(--surface-2)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 },
};

/* ── AjukanSewaPage ──────────────────────────────────────────────────────── */
function AjukanSewaPage({ item, onBack, onSubmit }) {
  const today = new Date().toISOString().split("T")[0];
  const [masuk, setMasuk] = useState(today);
  const [durasi, setDurasi] = useState(6);
  const [pesan, setPesan] = useState("");
  const keluar = addMonths(masuk, durasi);
  const price = Number(item?.price||0);
  const total = price + price + SERVICE_FEE;

  const css = `
    .asw { font-family:'DM Sans',-apple-system,sans-serif; background:var(--surface-2); min-height:100vh; color:var(--text-primary); }
    .asw * { box-sizing:border-box; margin:0; padding:0; }
    .asw-nav { background:var(--surface); border-bottom:1px solid var(--border); padding:0 40px; height:60px; display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; z-index:30; }
    .asw-nav-brand { font-family:var(--ff-display); font-size:22px; color:var(--brand); }
    .asw-nav-links { display:flex; gap:28px; list-style:none; }
    .asw-nav-links a { font-size:13px; font-weight:500; color:var(--text-secondary); text-decoration:none; }
    .asw-nav-links a.active { color:var(--brand); font-weight:700; }
    .asw-page-header { max-width:1100px; margin:0 auto; padding:32px 40px 0; }
    .asw-breadcrumb { display:flex; align-items:center; gap:6px; font-size:12px; color:var(--text-muted); margin-bottom:8px; }
    .asw-breadcrumb a { color:var(--brand); cursor:pointer; font-weight:600; }
    .asw-page-title { font-family:var(--ff-display); font-size:28px; color:var(--text-primary); margin-bottom:4px; }
    .asw-page-sub { font-size:13px; color:var(--text-secondary); }
    .asw-layout { max-width:1100px; margin:0 auto; padding:28px 40px 80px; display:grid; grid-template-columns:1fr 360px; gap:28px; align-items:start; }
    @media(max-width:900px){ .asw-layout{grid-template-columns:1fr;padding:20px} .asw-nav{padding:0 20px} .asw-page-header{padding:20px 20px 0} .asw-sidebar{position:static!important} }
    .asw-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-lg); padding:24px; margin-bottom:0; }
    .asw-left { display:flex; flex-direction:column; gap:18px; }
    .asw-section-title { display:flex; align-items:center; gap:12px; margin-bottom:20px; }
    .asw-step-badge { width:26px; height:26px; border-radius:50%; background:var(--brand); color:#fff; font-size:12px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .asw-section-title h2 { font-size:15px; font-weight:700; color:var(--text-primary); }
    .asw-date-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }
    .asw-field-label { font-size:11px; font-weight:700; letter-spacing:.5px; text-transform:uppercase; color:var(--text-muted); margin-bottom:7px; display:block; }
    .asw-input { width:100%; padding:11px 13px; border:1.5px solid var(--border); border-radius:var(--radius-sm); font-size:14px; color:var(--text-primary); background:var(--surface-2); font-family:inherit; font-weight:500; outline:none; transition:border-color .2s,box-shadow .2s; }
    .asw-input:focus { border-color:var(--brand); background:var(--surface); box-shadow:0 0 0 3px rgba(26,86,219,.1); }
    .asw-input-ro { background:var(--surface-3); color:var(--text-muted); cursor:default; }
    .asw-info-note { display:flex; align-items:flex-start; gap:8px; background:var(--brand-light); border:1px solid #BFDBFE; border-radius:var(--radius-sm); padding:10px 12px; margin-top:14px; font-size:12px; color:#1D4ED8; font-weight:500; line-height:1.5; }
    .asw-durasi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-top:10px; }
    .asw-durasi-pill { padding:12px 6px; border-radius:var(--radius-sm); border:1.5px solid var(--border); background:var(--surface-2); font-size:13px; font-weight:700; color:var(--text-secondary); cursor:pointer; text-align:center; transition:all .18s; font-family:inherit; }
    .asw-durasi-pill.active { background:var(--brand); border-color:var(--brand); color:#fff; box-shadow:var(--shadow-brand); }
    .asw-textarea { width:100%; padding:12px 13px; border:1.5px solid var(--border); border-radius:var(--radius-sm); font-size:14px; color:var(--text-primary); background:var(--surface-2); font-family:inherit; font-weight:400; outline:none; resize:none; transition:border-color .2s; line-height:1.6; }
    .asw-textarea:focus { border-color:var(--brand); background:var(--surface); box-shadow:0 0 0 3px rgba(26,86,219,.1); }
    .asw-textarea::placeholder { color:var(--text-muted); }
    .asw-pay-table { width:100%; border-collapse:collapse; }
    .asw-pay-table thead th { font-size:10px; font-weight:700; letter-spacing:.6px; text-transform:uppercase; color:var(--text-muted); padding:0 0 12px; text-align:left; border-bottom:1px solid var(--border); }
    .asw-pay-table thead th:last-child { text-align:right; }
    .asw-pay-table tbody td { padding:14px 0; border-bottom:1px solid var(--surface-2); vertical-align:top; }
    .asw-pay-table tbody tr:last-child td { border-bottom:none; }
    .asw-pay-name { font-size:13px; font-weight:600; color:var(--text-primary); }
    .asw-pay-sub { font-size:11px; color:var(--text-muted); margin-top:2px; }
    .asw-pay-amt { font-size:13px; font-weight:700; color:var(--text-primary); text-align:right; white-space:nowrap; }
    .asw-pay-total td { padding-top:16px!important; border-top:2px solid var(--border)!important; border-bottom:none!important; }
    .asw-pay-total-label { font-size:14px; font-weight:800; color:var(--text-primary); }
    .asw-pay-total-amt { font-size:16px; font-weight:800; color:var(--brand); text-align:right; }
    .asw-sidebar { position:sticky; top:80px; display:flex; flex-direction:column; gap:14px; }
    .asw-prop-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-lg); overflow:hidden; box-shadow:var(--shadow-sm); }
    .asw-prop-img { width:100%; height:190px; object-fit:cover; display:block; }
    .asw-prop-img-ph { width:100%; height:190px; background:linear-gradient(135deg,#1340B0,#3B82F6); display:flex; align-items:center; justify-content:center; color:white; font-family:var(--ff-display); font-size:48px; }
    .asw-prop-body { padding:18px 20px; }
    .asw-prop-name { font-size:15px; font-weight:800; color:var(--text-primary); margin-bottom:5px; }
    .asw-prop-loc { display:flex; align-items:center; gap:5px; font-size:12px; color:var(--text-muted); margin-bottom:14px; }
    .asw-stat-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--border); border-radius:10px; overflow:hidden; margin-bottom:16px; }
    .asw-stat-cell { background:var(--surface-2); padding:10px 6px; text-align:center; }
    .asw-stat-label { font-size:9px; font-weight:700; letter-spacing:.5px; text-transform:uppercase; color:var(--text-muted); margin-bottom:4px; }
    .asw-stat-val { font-size:13px; font-weight:800; color:var(--text-primary); }
    .asw-detail-row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--surface-2); font-size:13px; }
    .asw-detail-row:last-child { border-bottom:none; }
    .asw-detail-key { color:var(--text-muted); font-weight:500; }
    .asw-detail-val { font-weight:700; color:var(--text-primary); }
    .asw-cta-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-lg); padding:18px; }
    .asw-btn-submit { width:100%; padding:14px; border-radius:var(--radius); background:var(--brand); color:white; font-size:14px; font-weight:700; border:none; cursor:pointer; font-family:inherit; display:flex; align-items:center; justify-content:center; gap:8px; transition:background .2s,transform .15s; box-shadow:var(--shadow-brand); margin-bottom:10px; }
    .asw-btn-submit:hover { background:var(--brand-dark); transform:translateY(-1px); }
    .asw-tos-note { font-size:11px; color:var(--text-muted); text-align:center; line-height:1.6; }
    .asw-tos-note a { color:var(--accent); text-decoration:underline; cursor:pointer; }
    .asw-footer { background:#0D1117; padding:40px; }
    .asw-footer-inner { max-width:1100px; margin:0 auto; }
    .asw-footer-brand { font-family:var(--ff-display); font-size:20px; color:#fff; margin-bottom:8px; }
    .asw-footer-bottom { font-size:12px; color:#475569; padding-top:20px; border-top:1px solid #1E293B; margin-top:24px; }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="asw">
        <nav className="asw-nav">
          <span className="asw-nav-brand">Atap</span>
          <ul className="asw-nav-links">
            <li><a href="#">Beranda</a></li><li><a href="#" className="active">Properti</a></li>
            <li><a href="#">Maps</a></li><li><a href="#">Pesan</a></li>
          </ul>
          <button onClick={onBack} style={{ fontSize:13, fontWeight:700, color:"var(--brand)", background:"var(--brand-light)", border:"1px solid #BFDBFE", borderRadius:"var(--radius-sm)", padding:"8px 16px", cursor:"pointer", fontFamily:"var(--ff)" }}>List Properti</button>
        </nav>

        <div className="asw-page-header">
          <div className="asw-breadcrumb">
            <a onClick={onBack}>Properti</a>
            <ChevronRight size={11} />
            <a onClick={onBack}>{item?.name}</a>
            <ChevronRight size={11} />
            <span>Ajukan Sewa</span>
          </div>
          <h1 className="asw-page-title">Ajukan Sewa</h1>
          <p className="asw-page-sub">Lengkapi detail berikut untuk mengirim permohonan sewa kepada pemilik.</p>
        </div>

        <div className="asw-layout">
          <div className="asw-left">
            <div className="asw-card">
              <div className="asw-section-title"><div className="asw-step-badge">1</div><h2>Detail Sewa</h2></div>
              <div className="asw-date-row">
                <div><label className="asw-field-label">Tanggal Masuk</label><input type="date" className="asw-input" value={masuk} onChange={e=>setMasuk(e.target.value)} /></div>
                <div><label className="asw-field-label">Tanggal Keluar</label><input type="text" className="asw-input asw-input-ro" value={fmtDate(keluar)} readOnly /></div>
              </div>
              <div className="asw-info-note"><Info size={13} style={{ flexShrink:0, marginTop:1 }} /><span>Durasi sewa minimal untuk unit ini adalah 6 bulan.</span></div>
              <label className="asw-field-label" style={{ marginTop:18, display:"block" }}>Durasi Sewa</label>
              <div className="asw-durasi-grid">
                {[3,6,12,24].map(bln=><button key={bln} type="button" className={`asw-durasi-pill${durasi===bln?" active":""}`} onClick={()=>setDurasi(bln)}>{bln} bulan</button>)}
              </div>
            </div>

            <div className="asw-card">
              <div className="asw-section-title"><div className="asw-step-badge">2</div><h2>Pesan untuk Pemilik</h2></div>
              <label className="asw-field-label">Catatan Tambahan</label>
              <textarea className="asw-textarea" rows={5} placeholder="Halo, saya tertarik dengan unit Anda..." value={pesan} onChange={e=>setPesan(e.target.value)} />
              <p style={{ fontSize:11, color:"var(--text-muted)", marginTop:6 }}>Pemilik lebih cenderung menerima pengajuan dengan perkenalan yang sopan.</p>
            </div>

            <div className="asw-card">
              <div className="asw-section-title"><div className="asw-step-badge">3</div><h2>Rincian Pembayaran</h2></div>
              <table className="asw-pay-table">
                <thead><tr><th>Deskripsi</th><th>Jumlah</th></tr></thead>
                <tbody>
                  <tr><td><div className="asw-pay-name">Sewa Bulan Pertama</div><div className="asw-pay-sub">Unit {item?.size||"—"} · {item?.name}</div></td><td className="asw-pay-amt">{fmtRp(price)}</td></tr>
                  <tr><td><div className="asw-pay-name">Deposit Keamanan</div><div className="asw-pay-sub">Dapat dikembalikan di akhir masa sewa</div></td><td className="asw-pay-amt">{fmtRp(price)}</td></tr>
                  <tr><td><div className="asw-pay-name">Biaya Layanan Atap</div><div className="asw-pay-sub">Termasuk perlindungan penyewa</div></td><td className="asw-pay-amt">{fmtRp(SERVICE_FEE)}</td></tr>
                  <tr className="asw-pay-total"><td><span className="asw-pay-total-label">Total Pembayaran Awal</span></td><td><span className="asw-pay-total-amt">{fmtRp(total)}</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="asw-sidebar">
            <div className="asw-prop-card">
              <div style={{ position:"relative" }}>
                {item?.images?.[0] ? <img src={item.images[0]} alt={item.name} className="asw-prop-img" /> : <div className="asw-prop-img-ph">{item?.name?.[0]?.toUpperCase()||"K"}</div>}
                {item?.isPremium && <span style={{ position:"absolute", top:12, left:12, background:"#D97706", color:"white", fontSize:9, fontWeight:800, padding:"4px 10px", borderRadius:99, letterSpacing:.6, textTransform:"uppercase" }}>Premium</span>}
              </div>
              <div className="asw-prop-body">
                <h3 className="asw-prop-name">{item?.name}</h3>
                <div className="asw-prop-loc"><MapPin size={11} /><span>{item?.location}</span></div>
                <div className="asw-stat-grid">
                  <div className="asw-stat-cell"><div className="asw-stat-label">Luas</div><div className="asw-stat-val">{item?.size||"—"}</div></div>
                  <div className="asw-stat-cell"><div className="asw-stat-label">Tipe</div><div className="asw-stat-val">{item?.gender?item.gender[0].toUpperCase()+item.gender.slice(1).toLowerCase():"—"}</div></div>
                  <div className="asw-stat-cell"><div className="asw-stat-label">Kamar</div><div className="asw-stat-val">{item?.availableRooms??"—"}</div></div>
                </div>
                <div>
                  {[["Check-in",fmtDate(masuk)],["Durasi",`${durasi} Bulan`]].map(([k,v])=><div key={k} className="asw-detail-row"><span className="asw-detail-key">{k}</span><span className="asw-detail-val">{v}</span></div>)}
                  <div className="asw-detail-row" style={{ borderBottom:"none" }}><span className="asw-detail-key">Harga/Bulan</span><span className="asw-detail-val" style={{ color:"var(--brand)" }}>{fmtRp(price)}</span></div>
                </div>
              </div>
            </div>
            <div className="asw-cta-card">
              <button className="asw-btn-submit" onClick={()=>onSubmit({masuk,durasi,keluar,pesan})}>
                Kirim Pengajuan <ChevronRight size={17} />
              </button>
              <p className="asw-tos-note">Dengan mengklik, Anda menyetujui <a>Syarat &amp; Ketentuan</a> Atap.</p>
            </div>
          </div>
        </div>

        <footer className="asw-footer">
          <div className="asw-footer-inner">
            <div className="asw-footer-brand">Atap</div>
            <p style={{ fontSize:12, color:"#64748B", lineHeight:1.7 }}>Platform sewa properti modern untuk penyewa generasi baru.</p>
            <p className="asw-footer-bottom">© 2024 Atap Property Group. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}

/* ── MinatModal ──────────────────────────────────────────────────────────── */
function MinatModal({ item, onClose }) {
  const profile = getCurrentUser();
  const [name, setName] = useState(profile.name||"");
  const [phone, setPhone] = useState(profile.phone||"");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [errMsg, setErrMsg] = useState("");

  const handleSubmit = async () => {
    const cName = name.trim(), cPhone = phone.trim();
    if (cName.length<2) { setErrMsg("Nama minimal 2 karakter"); return; }
    if (cPhone.length<8) { setErrMsg("Nomor WhatsApp tidak valid"); return; }
    setErrMsg(""); setLoading(true);
    try {
      const body = { name:cName, phone:cPhone };
      const email=(profile.email||"").trim(); if (email) body.email=email;
      await postPublicJson(`/leads/${item.id}`, body);
      window.open(buildMinatWhatsAppUrl(item,{name:cName,phone:cPhone}),"_blank");
      setStatus("success");
    } catch(e) {
      const msg=e?.message||"";
      setErrMsg(msg==="Failed to fetch"||e instanceof TypeError ? "Tidak dapat terhubung ke server." : msg||"Terjadi kesalahan");
    } finally { setLoading(false); }
  };

  const ff = "var(--ff)";
  return (
    <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ ...S.sheet, paddingBottom:28 }}>
        <div style={S.handle} />
        <div style={{ padding:"16px 20px 0" }}>
          {status==="success" ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"20px 0 8px", gap:16, textAlign:"center" }}>
              <div style={{ width:64, height:64, borderRadius:"50%", background:"#DCFCE7", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <CheckCircle2 size={32} color="var(--success)" />
              </div>
              <div>
                <p style={{ fontWeight:700, fontSize:17, color:"var(--text-primary)", marginBottom:4, fontFamily:ff }}>WhatsApp terbuka!</p>
                <p style={{ fontSize:13, color:"var(--text-muted)", lineHeight:1.6, fontFamily:ff }}>Lanjutkan percakapan di WhatsApp.</p>
              </div>
              <button onClick={onClose} style={{ width:"100%", height:48, borderRadius:"var(--radius)", background:"var(--success)", color:"white", fontWeight:700, fontSize:14, border:"none", cursor:"pointer", fontFamily:ff }}>Tutup</button>
            </div>
          ) : (
            <>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                <p style={{ fontWeight:700, fontSize:16, color:"var(--text-primary)", fontFamily:ff }}>Saya Minat</p>
                <button style={S.closeBtn} onClick={onClose}><X size={15} color="var(--text-secondary)" /></button>
              </div>
              <p style={{ fontSize:12, color:"var(--text-muted)", marginBottom:16, fontFamily:ff }}>Informasi kamu akan diteruskan ke tim kami</p>

              {/* Preview */}
              <div style={{ display:"flex", alignItems:"center", gap:12, background:"var(--surface-2)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:12, marginBottom:16 }}>
                {item?.images?.[0]
                  ? <img src={item.images[0]} alt={item.name} style={{ width:48, height:48, borderRadius:10, objectFit:"cover", flexShrink:0 }} />
                  : <div style={{ width:48, height:48, borderRadius:10, background:"var(--brand-light)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Home size={18} color="var(--brand)" /></div>
                }
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight:700, fontSize:13, color:"var(--text-primary)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginBottom:2, fontFamily:ff }}>{item?.name}</p>
                  <p style={{ fontSize:11, color:"var(--text-muted)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", fontFamily:ff }}>{item?.location}</p>
                </div>
                <p style={{ fontSize:13, fontWeight:700, color:"var(--brand)", flexShrink:0, fontFamily:ff }}>Rp {Number(item?.price||0).toLocaleString("id-ID")}</p>
              </div>

              {/* Inputs */}
              {[["Nama Lengkap","text","contoh: Budi Santoso",name,setName],["Nomor WhatsApp","tel","contoh: 08123456789",phone,setPhone]].map(([lbl,type,ph,val,setter])=>(
                <div key={lbl} style={{ marginBottom:12 }}>
                  <label style={{ fontSize:11, fontWeight:700, color:"var(--text-muted)", display:"block", marginBottom:6, fontFamily:ff }}>{lbl} <span style={{ color:"var(--danger)" }}>*</span></label>
                  <input type={type} placeholder={ph} value={val} onChange={e=>setter(e.target.value)}
                    style={{ width:"100%", background:"var(--surface-2)", border:"1.5px solid var(--border)", borderRadius:"var(--radius-sm)", padding:"11px 14px", fontSize:13.5, color:"var(--text-primary)", fontFamily:ff, outline:"none" }} />
                </div>
              ))}

              {errMsg && (
                <div style={{ display:"flex", alignItems:"center", gap:8, background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:"var(--radius-sm)", padding:"10px 12px", marginBottom:12 }}>
                  <AlertCircle size={13} color="var(--danger)" style={{ flexShrink:0 }} />
                  <p style={{ fontSize:12, color:"var(--danger)", fontFamily:ff }}>{errMsg}</p>
                </div>
              )}

              <button onClick={handleSubmit} disabled={loading}
                style={{ width:"100%", padding:"14px 0", borderRadius:"var(--radius)", color:"white", fontWeight:700, fontSize:14, border:"none", cursor:"pointer", fontFamily:ff, display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:"linear-gradient(135deg,#25D366,#128C7E)", boxShadow:"0 6px 20px rgba(37,211,102,.3)", opacity:loading?0.7:1, transition:"opacity .2s" }}>
                {loading ? <Loader2 size={16} style={{ animation:"spin 1s linear infinite" }} /> : null}
                {loading ? "Mengirim..." : "Kirim Minat Saya"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── ReportModal ─────────────────────────────────────────────────────────── */
function ReportModal({ item, onClose }) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [errMsg, setErrMsg] = useState("");
  const ff = "var(--ff)";

  const handleSubmit = async () => {
    if (!reason) { setErrMsg("Pilih alasan laporan terlebih dahulu"); return; }
    const token = getToken();
    if (!token) { setErrMsg("Kamu harus login terlebih dahulu."); return; }
    setErrMsg(""); setLoading(true);
    try {
      const res = await authFetch(`${API}/listings/${item.id}/report`,{ method:"POST", body:JSON.stringify({reason, note:note.trim()||undefined}) });
      if (!res.ok) { const e=await res.json().catch(()=>({})); throw new Error(e.message||"Gagal mengirim laporan"); }
      setStatus("success");
    } catch(e) { setErrMsg(e.message||"Terjadi kesalahan"); }
    finally { setLoading(false); }
  };
  const handleClose = () => { setStatus(null); setReason(""); setNote(""); setErrMsg(""); onClose(); };

  return (
    <div style={{ ...S.overlay, alignItems:"center", padding:"0 16px" }} onClick={e=>e.target===e.currentTarget&&handleClose()}>
      <div style={{ fontFamily:ff, background:"var(--surface)", width:"100%", maxWidth:440, borderRadius:"var(--radius-xl)", position:"relative", zIndex:100000, animation:"slideUp .25s cubic-bezier(.22,1,.36,1)", overflow:"hidden", boxShadow:"var(--shadow-lg)", maxHeight:"90vh", display:"flex", flexDirection:"column" }}>
        {status==="success" ? (
          <div style={{ padding:"36px 24px", textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
            <div style={{ width:64, height:64, borderRadius:"50%", background:"#DCFCE7", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <CheckCircle2 size={32} color="var(--success)" />
            </div>
            <div>
              <p style={{ fontWeight:700, fontSize:17, color:"var(--text-primary)", marginBottom:4, fontFamily:ff }}>Laporan terkirim!</p>
              <p style={{ fontSize:13, color:"var(--text-muted)", lineHeight:1.6, fontFamily:ff }}>Tim kami akan meninjau laporan ini dalam 1×24 jam.</p>
            </div>
            <button onClick={handleClose} style={{ width:"100%", height:48, borderRadius:"var(--radius)", background:"var(--brand)", color:"white", fontWeight:700, fontSize:14, border:"none", cursor:"pointer", fontFamily:ff }}>Tutup</button>
          </div>
        ) : (
          <>
            <div style={{ padding:"20px 20px 16px", borderBottom:"1px solid var(--border)", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <p style={{ fontWeight:700, fontSize:16, color:"var(--text-primary)", marginBottom:2, fontFamily:ff }}>Laporkan Listing</p>
                <p style={{ fontSize:12, color:"var(--text-muted)", fontFamily:ff }}>Melaporkan <strong style={{ color:"var(--text-secondary)" }}>{item?.name}</strong></p>
              </div>
              <button style={S.closeBtn} onClick={handleClose}><X size={15} color="var(--text-secondary)" /></button>
            </div>
            <div style={{ padding:"16px 20px", overflowY:"auto", flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, background:"var(--surface-2)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:10, marginBottom:16 }}>
                {item?.images?.[0] ? <img src={item.images[0]} alt={item.name} style={{ width:44, height:44, borderRadius:8, objectFit:"cover", flexShrink:0 }} />
                  : <div style={{ width:44, height:44, borderRadius:8, background:"#FEF2F2", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Flag size={16} color="var(--danger)" /></div>}
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginBottom:2, fontFamily:ff }}>{item?.name}</p>
                  <p style={{ fontSize:11, color:"var(--text-muted)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", fontFamily:ff }}>{item?.location}</p>
                </div>
              </div>
              <p style={{ fontSize:10, fontWeight:700, letterSpacing:.6, textTransform:"uppercase", color:"var(--text-muted)", marginBottom:10, fontFamily:ff }}>Alasan Laporan</p>
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
                {REPORT_REASONS.map(r=>(
                  <label key={r.value} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", borderRadius:"var(--radius-sm)", border:`1.5px solid ${reason===r.value?"#FECACA":"var(--border)"}`, background:reason===r.value?"#FEF2F2":"var(--surface-2)", cursor:"pointer" }}>
                    <input type="radio" name="report_reason" value={r.value} checked={reason===r.value} onChange={()=>{setReason(r.value);setErrMsg("");}} style={{ accentColor:"var(--danger)" }} />
                    <span style={{ fontSize:13, fontWeight:500, color:reason===r.value?"var(--danger)":"var(--text-secondary)", fontFamily:ff }}>{r.label}</span>
                  </label>
                ))}
              </div>
              <label style={{ fontSize:10, fontWeight:700, letterSpacing:.6, textTransform:"uppercase", color:"var(--text-muted)", display:"block", marginBottom:8, fontFamily:ff }}>Keterangan Tambahan <span style={{ fontWeight:400, textTransform:"none", letterSpacing:0 }}>(opsional)</span></label>
              <textarea rows={3} placeholder="Jelaskan lebih detail..." value={note} onChange={e=>setNote(e.target.value)}
                style={{ width:"100%", background:"var(--surface-2)", border:"1.5px solid var(--border)", borderRadius:"var(--radius-sm)", padding:"11px 13px", fontSize:13.5, color:"var(--text-primary)", fontFamily:ff, outline:"none", resize:"none", lineHeight:1.6 }} />
            </div>
            <div style={{ padding:"12px 20px 20px", borderTop:"1px solid var(--border)", flexShrink:0 }}>
              {errMsg && (
                <div style={{ display:"flex", alignItems:"center", gap:8, background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:"var(--radius-sm)", padding:"10px 12px", marginBottom:12 }}>
                  <AlertCircle size={13} color="var(--danger)" style={{ flexShrink:0 }} />
                  <p style={{ fontSize:12, color:"var(--danger)", fontFamily:ff }}>{errMsg}</p>
                </div>
              )}
              <button onClick={handleSubmit} disabled={!reason||loading}
                style={{ width:"100%", padding:"13px 0", borderRadius:"var(--radius)", background:"var(--danger)", color:"white", fontWeight:700, fontSize:14, border:"none", cursor:"pointer", fontFamily:ff, display:"flex", alignItems:"center", justifyContent:"center", gap:8, opacity:(!reason||loading)?0.5:1, transition:"opacity .2s" }}>
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

/* ─── DetailPage (main export) ───────────────────────────────────────────── */
export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [showSewa, setShowSewa] = useState(false);
  const [showMinat, setShowMinat] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [quickUsed, setQuickUsed] = useState(false);
  const [chatError, setChatError] = useState(null);
  const chatEndRef = useRef(null);
  const pollRef = useRef(null);
  const myId = getCurrentUserId();

  useEffect(() => { if (showChat) chatEndRef.current?.scrollIntoView({behavior:"smooth"}); }, [messages,showChat]);
  useEffect(() => { const favs=JSON.parse(localStorage.getItem("atap_favorites")||"[]"); setIsLiked(favs.includes(id)); }, [id]);

  const toggleLike = () => {
    const favs=JSON.parse(localStorage.getItem("atap_favorites")||"[]");
    const next=isLiked?favs.filter(f=>f!==id):[...favs,id];
    localStorage.setItem("atap_favorites",JSON.stringify(next)); setIsLiked(!isLiked);
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res=await fetch(`${API}/listings/${id}`);
        if (!res.ok) throw new Error("Gagal fetch");
        const {data}=await res.json();
        if (!data) return;
        setItem(mapListingDetail(data));
        fetch(`${API}/listings/${id}/view`,{method:"POST"}).catch(()=>{});
      } catch(err){ console.error(err); } finally{ setLoading(false); }
    };
    fetchDetail(); window.scrollTo(0,0);
  }, [id]);

  const openChat = async () => {
    setShowChat(true); if (threadId) return;
    setChatLoading(true); setChatError(null);
    try {
      const res=await authFetch(`${API}/chats/start`,{method:"POST",body:JSON.stringify({listingId:id})});
      if (!res.ok){const e=await res.json().catch(()=>({}));throw new Error(e.message||"Gagal membuat thread");}
      const json=await res.json(); const thread=json.data||json;
      setThreadId(thread.id); await fetchMessages(thread.id);
    } catch(e){ console.error(e); setChatError("Gagal memuat chat. Pastikan kamu sudah login."); }
    finally{ setChatLoading(false); }
  };

  const fetchMessages = async tid => {
    try {
      const res=await authFetch(`${API}/chats/${tid}`);
      if (!res.ok) return;
      const json=await res.json(); const thread=json.data||json;
      setMessages(Array.isArray(thread.messages)?thread.messages:[]);
    } catch(e){ console.error(e); }
  };

  useEffect(() => {
    if (showChat&&threadId){ pollRef.current=setInterval(()=>fetchMessages(threadId),3000); }
    return ()=>clearInterval(pollRef.current);
  }, [showChat,threadId]);

  const sendMessage = async text => {
    if (!text.trim()||!threadId||sendLoading) return;
    setSendLoading(true); setChatInput("");
    try {
      const res=await authFetch(`${API}/chats/${threadId}/messages`,{method:"POST",body:JSON.stringify({message:text.trim()})});
      if (!res.ok) throw new Error("Gagal kirim");
      const json=await res.json(); setMessages(prev=>[...prev,json.data||json]);
    } catch(e){ console.error(e); } finally{ setSendLoading(false); }
  };

  const handleSewaSubmit = ({masuk,durasi,keluar,pesan}) => {
    alert(`Permintaan sewa berhasil dikirim!\nMasuk: ${masuk}\nDurasi: ${durasi} bulan\nKeluar: ${keluar}`);
    setShowSewa(false);
  };

  if (showSewa&&item) return <AjukanSewaPage item={item} onBack={()=>setShowSewa(false)} onSubmit={handleSewaSubmit} />;

  /* ── Loading skeleton ── */
  if (loading) return (
    <>
      <InjectStyles css={GLOBAL_CSS} />
      <div style={{ fontFamily:"var(--ff)", minHeight:"100vh", background:"var(--surface)" }}>
        <div style={{ height:280, background:"var(--surface-3)", animation:"pulse .8s ease infinite alternate" }} />
        <div style={{ padding:"20px 20px", display:"flex", flexDirection:"column", gap:12 }}>
          {[80,60,140,100].map((w,i)=><div key={i} style={{ height:i===2?60:20, width:`${w}%`, background:"var(--surface-3)", borderRadius:"var(--radius-sm)", animation:"pulse .8s ease infinite alternate" }} />)}
        </div>
      </div>
    </>
  );

  if (!item) return (
    <>
      <InjectStyles css={GLOBAL_CSS} />
      <div style={{ fontFamily:"var(--ff)", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, padding:24 }}>
        <div style={{ width:64, height:64, borderRadius:"var(--radius-lg)", background:"var(--surface-2)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Home size={28} color="var(--text-muted)" />
        </div>
        <p style={{ fontSize:14, color:"var(--text-muted)", fontWeight:500 }}>Data tidak ditemukan</p>
        <button onClick={()=>navigate(-1)} style={{ fontSize:13, fontWeight:700, color:"var(--brand)", background:"var(--brand-light)", border:"none", padding:"10px 24px", borderRadius:99, cursor:"pointer", fontFamily:"var(--ff)" }}>Kembali</button>
      </div>
    </>
  );

  const images = item.images;
  const hasPhotos = images.length>0;
  const gender = genderConfig[(item.gender||"").toLowerCase()];
  const ff = "var(--ff)";

  return (
    <>
      <InjectStyles css={GLOBAL_CSS} />

      <div style={{ fontFamily:ff, minHeight:"100vh", background:"var(--surface)", color:"var(--text-primary)", paddingBottom:96 }}>

        {/* ── Image gallery ── */}
        <div style={{ position:"relative", background:"#0D1117" }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gridTemplateRows:"1fr 1fr", gap:2, height:300 }}>
            {/* Main image */}
            <div style={{ gridRow:"1/3", position:"relative", overflow:"hidden", cursor:hasPhotos?"pointer":"default", background:"#1A1A2E" }} onClick={()=>hasPhotos&&setLightbox(0)}>
              {hasPhotos
                ? <img src={images[0]} alt={item.name} style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform .4s ease", display:"block" }} />
                : <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8, color:"#475569" }}><Home size={32} strokeWidth={1.5}/><span style={{ fontSize:12 }}>Foto tidak tersedia</span></div>
              }
              {images.length>1 && (
                <button onClick={e=>{e.stopPropagation();setLightbox(0);}}
                  style={{ position:"absolute", bottom:12, left:12, display:"flex", alignItems:"center", gap:6, background:"rgba(255,255,255,.92)", backdropFilter:"blur(8px)", color:"var(--text-primary)", fontSize:12, fontWeight:700, padding:"7px 12px", borderRadius:99, border:"none", cursor:"pointer", fontFamily:ff, boxShadow:"var(--shadow-sm)" }}>
                  <LayoutGrid size={13} /> Lihat semua ({images.length})
                </button>
              )}
            </div>
            {/* Thumbnails */}
            {[1,2].map(i=>(
              <div key={i} style={{ position:"relative", overflow:"hidden", cursor:images[i]?"pointer":"default", background:"#12121F" }} onClick={()=>images[i]&&setLightbox(i)}>
                {images[i] && <img src={images[i]} alt={`foto ${i+1}`} style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform .4s ease", display:"block" }} />}
                {i===2&&images.length>3 && (
                  <button onClick={e=>{e.stopPropagation();setLightbox(0);}}
                    style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.6)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4, border:"none", cursor:"pointer" }}>
                    <LayoutGrid size={20} color="white" />
                    <span style={{ color:"white", fontSize:12, fontWeight:700 }}>+{images.length-3}</span>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Overlay nav buttons */}
          <div style={{ position:"absolute", top:0, left:0, right:0, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"44px 16px 12px", pointerEvents:"none" }}>
            <button onClick={()=>navigate(-1)} style={{ width:38, height:38, borderRadius:"50%", background:"rgba(255,255,255,.9)", backdropFilter:"blur(8px)", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", pointerEvents:"all", boxShadow:"var(--shadow-sm)" }}>
              <ArrowLeft size={17} color="var(--text-primary)" />
            </button>
            <div style={{ display:"flex", gap:8, pointerEvents:"all" }}>
              <button onClick={()=>setShowShare(true)} style={{ width:38, height:38, borderRadius:"50%", background:"rgba(255,255,255,.9)", backdropFilter:"blur(8px)", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:"var(--shadow-sm)" }}>
                <Share2 size={15} color="var(--text-primary)" />
              </button>
              <button onClick={toggleLike} style={{ width:38, height:38, borderRadius:"50%", background:isLiked?"var(--danger)":"rgba(255,255,255,.9)", backdropFilter:"blur(8px)", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:"var(--shadow-sm)", transition:"background .2s" }}>
                <Heart size={15} fill={isLiked?"white":"none"} color={isLiked?"white":"var(--text-primary)"} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ padding:"20px 20px 0" }}>

          {/* Badges */}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10, flexWrap:"wrap" }}>
            {item.isPremium && <span style={{ fontSize:10, fontWeight:800, padding:"4px 10px", borderRadius:99, background:"#FEF3C7", color:"#92400E", border:"1px solid #FDE68A", letterSpacing:.5, textTransform:"uppercase" }}>Premium</span>}
            {gender && <span style={{ fontSize:11, fontWeight:600, padding:"4px 10px", borderRadius:99, background:gender.bg, color:gender.text, border:`1px solid ${gender.border}` }}>{gender.label}</span>}
            {item.availableRooms===0 && <span style={{ fontSize:10, fontWeight:700, padding:"4px 10px", borderRadius:99, background:"#FEF2F2", color:"var(--danger)", border:"1px solid #FECACA", letterSpacing:.5, textTransform:"uppercase" }}>Penuh</span>}
          </div>

          <h1 style={{ fontFamily:"var(--ff-display)", fontSize:22, color:"var(--text-primary)", lineHeight:1.25, marginBottom:6 }}>{item.name}</h1>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:20 }}>
            <MapPin size={13} color="var(--text-muted)" style={{ flexShrink:0 }} />
            <span style={{ fontSize:13, color:"var(--text-muted)", lineHeight:1 }}>{item.location}</span>
          </div>

          {/* Price + availability banner */}
          <div style={{ borderRadius:"var(--radius-lg)", padding:"16px 20px", marginBottom:20, background:"linear-gradient(135deg,#1340B0 0%,#1A56DB 55%,#3B82F6 100%)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <p style={{ fontSize:11, color:"rgba(255,255,255,.6)", marginBottom:4, fontWeight:500 }}>Mulai dari</p>
              <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
                <span style={{ fontSize:22, fontWeight:800, color:"white" }}>Rp {Number(item.price).toLocaleString("id-ID")}</span>
                <span style={{ fontSize:12, color:"rgba(255,255,255,.6)" }}>/bulan</span>
              </div>
            </div>
            <div style={{ background:"rgba(255,255,255,.18)", backdropFilter:"blur(6px)", borderRadius:12, padding:"10px 18px", textAlign:"center" }}>
              <p style={{ fontSize:22, fontWeight:800, color:"white", lineHeight:1 }}>{item.availableRooms}</p>
              <p style={{ fontSize:10, color:"rgba(255,255,255,.7)", fontWeight:600, marginTop:3, textTransform:"uppercase", letterSpacing:.5 }}>Kamar</p>
            </div>
          </div>

          {/* Room types */}
          {item.roomTypes?.length>0 && (
            <div style={{ marginBottom:24 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <h2 style={{ fontSize:15, fontWeight:700, color:"var(--text-primary)" }}>Pilihan Kamar</h2>
                <span style={{ fontSize:11, color:"var(--text-muted)" }}>{item.roomTypes.length} tipe</span>
              </div>
              {item.roomTypes.length===1 ? (
                <div style={{ borderRadius:"var(--radius-lg)", border:"1px solid var(--border)", overflow:"hidden", background:"var(--surface-2)" }}>
                  {item.roomTypes[0].image && <img src={item.roomTypes[0].image} alt={item.roomTypes[0].name} style={{ width:"100%", height:140, objectFit:"cover", display:"block" }} />}
                  <div style={{ padding:16 }}>
                    <p style={{ fontWeight:700, fontSize:15, color:"var(--text-primary)", marginBottom:4 }}>{item.roomTypes[0].name}</p>
                    <p style={{ fontSize:18, fontWeight:800, color:"var(--brand)", marginBottom:6 }}>
                      Rp {Number(item.roomTypes[0].price).toLocaleString("id-ID")}<span style={{ fontSize:12, color:"var(--text-muted)", fontWeight:400 }}>/bulan</span>
                    </p>
                    <p style={{ fontSize:12, color:"var(--text-muted)" }}>{item.roomTypes[0].size} · {item.roomTypes[0].availableCount} kamar tersedia</p>
                  </div>
                </div>
              ) : (
                <div className="scrollbar-hide" style={{ display:"flex", gap:12, overflowX:"auto", paddingBottom:4, margin:"0 -20px", padding:"0 20px" }}>
                  {item.roomTypes.map(room=>(
                    <div key={room.id} style={{ minWidth:160, maxWidth:160, flexShrink:0, borderRadius:"var(--radius-lg)", border:"1px solid var(--border)", overflow:"hidden", background:"var(--surface)", boxShadow:"var(--shadow-xs)" }}>
                      <div style={{ height:96, background:"var(--surface-3)" }}>
                        {room.image ? <img src={room.image} alt={room.name} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                          : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}><Home size={22} color="var(--text-muted)" strokeWidth={1.5} /></div>}
                      </div>
                      <div style={{ padding:"10px 12px" }}>
                        <p style={{ fontWeight:700, fontSize:13, color:"var(--text-primary)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginBottom:4 }}>{room.name}</p>
                        <p style={{ fontSize:14, fontWeight:800, color:"var(--brand)", marginBottom:6 }}>Rp {(room.price/1000).toFixed(0)}k<span style={{ fontSize:10, color:"var(--text-muted)", fontWeight:400 }}>/bln</span></p>
                        <p style={{ fontSize:10, color:"var(--text-muted)", lineHeight:1.5 }}>{room.size}<br/>{room.availableCount} kamar</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {item.description && (
            <div style={{ marginBottom:24 }}>
              <h2 style={{ fontSize:15, fontWeight:700, color:"var(--text-primary)", marginBottom:10 }}>Tentang Hunian Ini</h2>
              <p style={{ fontSize:13.5, color:"var(--text-secondary)", lineHeight:1.75 }}>{item.description}</p>
            </div>
          )}

          {/* Quick stats row */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:24 }}>
            {[
              { label:"Luas Kamar", value:item.size, color:"#7C3AED", bg:"#F5F3FF" },
              { label:"Tersedia", value:`${item.availableRooms} kamar`, color:"var(--success)", bg:"#ECFDF5" },
              { label:"Tipe", value:gender?.label||"—", color:"var(--brand)", bg:"var(--brand-light)" },
            ].map(s=>(
              <div key={s.label} style={{ background:s.bg, borderRadius:"var(--radius)", padding:"12px 10px", textAlign:"center" }}>
                <p style={{ fontSize:10, fontWeight:700, color:s.color, letterSpacing:.4, textTransform:"uppercase", marginBottom:5 }}>{s.label}</p>
                <p style={{ fontSize:14, fontWeight:800, color:"var(--text-primary)" }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height:1, background:"var(--border)", marginBottom:24 }} />

          {/* Facilities */}
          {item.facilities.length>0 && (
            <div style={{ marginBottom:24 }}>
              <h2 style={{ fontSize:15, fontWeight:700, color:"var(--text-primary)", marginBottom:14 }}>Fasilitas</h2>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
                {item.facilities.map((f,i)=>{
                  const { Icon, color, bg } = getFacilityStyle(f);
                  return (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:12, borderRadius:"var(--radius)", padding:"11px 13px", background:bg, border:`1px solid ${color}20` }}>
                      <div style={{ width:34, height:34, borderRadius:9, background:`${color}18`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <Icon size={16} style={{ color }} />
                      </div>
                      <span style={{ fontSize:12.5, fontWeight:600, color:"var(--text-primary)" }}>{f}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Rules */}
          {item.rules.length>0 && (
            <div style={{ marginBottom:24 }}>
              <h2 style={{ fontSize:15, fontWeight:700, color:"var(--text-primary)", marginBottom:12 }}>Peraturan Kost</h2>
              <div style={{ borderRadius:"var(--radius-lg)", border:"1px solid var(--border)", overflow:"hidden", background:"var(--surface)" }}>
                {item.rules.map((r,i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"13px 16px", borderBottom:i<item.rules.length-1?"1px solid var(--surface-2)":"none" }}>
                    <div style={{ width:28, height:28, borderRadius:8, background:"#FEF2F2", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1, color:"var(--danger)" }}>{ruleIcon(r)}</div>
                    <span style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.6 }}>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Map */}
          {item.latitude && item.longitude && (
            <div style={{ marginBottom:24 }}>
              <h2 style={{ fontSize:15, fontWeight:700, color:"var(--text-primary)", marginBottom:12 }}>Lokasi Hunian</h2>
              <div style={{ borderRadius:"var(--radius-lg)", overflow:"hidden", border:"1px solid var(--border)", boxShadow:"var(--shadow-xs)", height:260, position:"relative", zIndex:0 }}>
                <MapContainer center={[item.latitude,item.longitude]} zoom={15} style={{ width:"100%", height:"100%" }} zoomControl={false}>
                  <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[item.latitude,item.longitude]} icon={createPriceIcon(item.price,true)} />
                  <MapCenter lat={item.latitude} lng={item.longitude} />
                </MapContainer>
              </div>
              <div style={{ marginTop:10, padding:"11px 14px", background:"var(--brand-light)", border:"1px solid #BFDBFE", borderRadius:"var(--radius-sm)", display:"flex", alignItems:"flex-start", gap:8 }}>
                <Navigation size={13} color="var(--brand)" style={{ flexShrink:0, marginTop:1 }} />
                <div>
                  <p style={{ fontSize:12, fontWeight:600, color:"#1D4ED8", marginBottom:2 }}>📍 {item.location}</p>
                  <p style={{ fontSize:11, color:"#3B82F6" }}>Tap map untuk petunjuk arah lengkap.</p>
                </div>
              </div>
            </div>
          )}

          {/* Report link */}
          <div style={{ display:"flex", justifyContent:"center", marginBottom:24 }}>
            <button onClick={()=>setShowReport(true)} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"var(--text-muted)", background:"none", border:"none", cursor:"pointer", fontFamily:ff, transition:"color .15s" }}>
              <Flag size={13} /> Laporkan listing ini
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"var(--surface)", borderTop:"1px solid var(--border)", padding:"12px 16px", paddingBottom:"calc(12px + env(safe-area-inset-bottom))", zIndex:50, backdropFilter:"blur(12px)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, maxWidth:480, margin:"0 auto" }}>
          <button onClick={toggleLike} style={{ width:48, height:48, borderRadius:"var(--radius)", border:`1.5px solid ${isLiked?"#FECACA":"var(--border)"}`, background:isLiked?"#FEF2F2":"var(--surface-2)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, transition:"all .2s" }}>
            <Heart size={18} fill={isLiked?"var(--danger)":"none"} color={isLiked?"var(--danger)":"var(--text-muted)"} />
          </button>
          <button onClick={()=>setShowMinat(true)} style={{ flex:1, height:48, borderRadius:"var(--radius)", color:"white", fontWeight:700, fontSize:13, fontFamily:ff, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:"linear-gradient(135deg,#25D366,#128C7E)", boxShadow:"0 4px 16px rgba(37,211,102,.3)", transition:"transform .15s" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.555 4.126 1.527 5.858L.057 23.617a.75.75 0 0 0 .92.92l5.818-1.488A11.946 11.946 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
            Saya Minat
          </button>
          <button onClick={()=>setShowReport(true)} style={{ width:48, height:48, borderRadius:"var(--radius)", background:"#FEF2F2", border:"1px solid #FECACA", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
            <Flag size={17} color="var(--danger)" />
          </button>
        </div>
      </div>

      {/* ── Modals ── */}
      {showMinat && <MinatModal item={item} onClose={()=>setShowMinat(false)} />}
      {showReport && <ReportModal item={item} onClose={()=>setShowReport(false)} />}
      {showShare && <ShareModal item={item} onClose={()=>setShowShare(false)} />}
      {hasPhotos && lightbox!==null && <PhotoLightbox images={images} startIndex={lightbox} onClose={()=>setLightbox(null)} />}

      {/* ── Chat modal ── */}
      {showChat && (
        <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&setShowChat(false)}>
          <div style={{ ...S.sheet, paddingBottom:20 }}>
            <div style={S.handle} />
            <div style={{ padding:"16px 20px 0" }}>
              {/* Header */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <span style={{ fontWeight:700, fontSize:16, color:"var(--text-primary)", fontFamily:ff }}>Tanya Pemilik</span>
                <button style={S.closeBtn} onClick={()=>setShowChat(false)}><X size={15} color="var(--text-secondary)" /></button>
              </div>

              {/* Owner card */}
              <div style={{ display:"flex", alignItems:"center", gap:12, background:"var(--surface-2)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"10px 14px", marginBottom:12 }}>
                <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#3B82F6,#06B6D4)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontSize:15, flexShrink:0 }}>
                  {item.ownerName?.[0]?.toUpperCase()||"P"}
                </div>
                <div>
                  <p style={{ fontSize:14, fontWeight:600, color:"var(--text-primary)", fontFamily:ff, marginBottom:3 }}>{item.ownerName}</p>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ width:7, height:7, borderRadius:"50%", background:"var(--success)", display:"inline-block", animation:"pulse-dot 2s ease infinite" }} />
                    <span style={{ fontSize:11, color:"var(--text-muted)", fontFamily:ff }}>Pemilik Kost</span>
                  </div>
                </div>
              </div>

              {chatError && <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", color:"var(--danger)", fontSize:13, borderRadius:"var(--radius-sm)", padding:"10px 14px", marginBottom:12, fontFamily:ff }}>{chatError}</div>}

              {/* Messages */}
              <div style={{ height:200, overflowY:"auto", display:"flex", flexDirection:"column", gap:10, marginBottom:12 }}>
                {chatLoading ? (
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%" }}>
                    <Loader2 size={22} color="var(--text-muted)" style={{ animation:"spin 1s linear infinite" }} />
                  </div>
                ) : messages.length===0&&!chatError ? (
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%" }}>
                    <p style={{ fontSize:13, color:"var(--text-muted)", fontFamily:ff }}>Belum ada pesan. Mulai percakapan! 👋</p>
                  </div>
                ) : (
                  messages.map((msg,i)=>{
                    const isMe = msg.senderId===myId;
                    return (
                      <div key={msg.id||i} style={{ display:"flex", alignItems:"flex-end", gap:8, justifyContent:isMe?"flex-end":"flex-start" }}>
                        {!isMe && <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#3B82F6,#06B6D4)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:10, fontWeight:700, flexShrink:0 }}>{item.ownerName?.[0]?.toUpperCase()||"P"}</div>}
                        <div style={{ display:"flex", flexDirection:"column", alignItems:isMe?"flex-end":"flex-start" }}>
                          <div style={{ padding:"9px 13px", fontSize:13, lineHeight:1.45, background:isMe?"var(--brand)":"var(--surface-2)", color:isMe?"white":"var(--text-primary)", borderRadius:isMe?"18px 18px 4px 18px":"4px 18px 18px 18px", maxWidth:220, fontFamily:ff }}>
                            {msg.message}
                          </div>
                          <p style={{ fontSize:10, color:"var(--text-muted)", marginTop:4, paddingLeft:2, fontFamily:ff }}>{msg.sentAt?fmtTime(msg.sentAt):""}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick replies */}
              {!quickUsed&&!chatLoading&&!chatError && (
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
                  {QUICK_REPLIES.map(q=>(
                    <button key={q.label} onClick={()=>{setQuickUsed(true);sendMessage(q.text);}}
                      style={{ fontSize:11.5, fontWeight:600, padding:"6px 12px", borderRadius:99, border:"1.5px solid #BFDBFE", background:"var(--brand-light)", color:"var(--brand)", cursor:"pointer", fontFamily:ff }}>
                      {q.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div style={{ display:"flex", alignItems:"center", gap:10, background:"var(--surface-2)", border:"1.5px solid var(--border)", borderRadius:"var(--radius-lg)", padding:"10px 14px" }}>
                <input type="text" placeholder="Ketik pesan..." value={chatInput} onChange={e=>setChatInput(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey)sendMessage(chatInput);}}
                  disabled={chatLoading||!!chatError}
                  style={{ flex:1, background:"transparent", fontSize:14, color:"var(--text-primary)", border:"none", outline:"none", fontFamily:ff }} />
                <button onClick={()=>sendMessage(chatInput)} disabled={!chatInput.trim()||sendLoading||chatLoading||!!chatError}
                  style={{ width:36, height:36, borderRadius:"50%", background:"var(--brand)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, border:"none", cursor:"pointer", boxShadow:"var(--shadow-brand)", opacity:(!chatInput.trim()||sendLoading||chatLoading||!!chatError)?0.4:1, transition:"opacity .2s" }}>
                  {sendLoading ? <Loader2 size={14} color="white" style={{ animation:"spin 1s linear infinite" }} /> : <Send size={14} color="white" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}