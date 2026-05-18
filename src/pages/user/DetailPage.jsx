import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ArrowLeft, MapPin, Heart, MessageCircle, Home, Ruler,
  ShieldCheck, ChevronLeft, ChevronRight, X, Phone,
  Calendar, Wifi, Wind, ShowerHead, Car,
  DoorOpen, Clock, UserX, CigaretteOff, VolumeX,
  LayoutGrid, Send, Loader2, Share2, BadgeCheck, Star,
  Zap, Tv, Coffee, Utensils, Dumbbell, Package, Droplets,
  Thermometer, BookOpen, TreePine, WashingMachine, Lock,
  ChevronRight as ChevRight, Globe,
  CheckCircle2, AlertCircle, Navigation, Info, HelpCircle,
  Flag, Copy, Check, Mail,
} from "lucide-react";

/* ── ShareModal Component ─────────────────────────────────────────────── */
function ShareModal({ item, onClose }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/listing/${item.id}`;
  const shareText = `Cek kost "${item.name}" di ${item.location}. Harga Rp ${Number(item.price).toLocaleString("id-ID")}/bulan. Tersedia ${item.availableRooms} kamar. ${shareUrl}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Gagal copy:", err);
    }
  };

  const shareOptions = [
    {
      id: "copy",
      label: "Salin Link",
      icon: copied ? Check : Copy,
      color: "text-slate-600",
      bg: "bg-slate-50",
      action: copyToClipboard,
      description: "Copy ke clipboard",
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.555 4.126 1.527 5.858L.057 23.617a.75.75 0 0 0 .92.92l5.818-1.488A11.946 11.946 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
        </svg>
      ),
      color: "text-green-600",
      bg: "bg-green-50",
      action: () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
      },
      description: "Bagikan ke WA",
    },
    {
      id: "telegram",
      label: "Telegram",
      icon: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.161.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.328-.373-.115l-6.869 4.332-2.97-.924c-.644-.213-.658-.644.135-.954l11.593-4.47c.537-.196 1.006.128.832.941z" />
        </svg>
      ),
      color: "text-blue-500",
      bg: "bg-blue-50",
      action: () => {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, "_blank");
      },
      description: "Bagikan ke TG",
    },
    {
      id: "facebook",
      label: "Facebook",
      icon: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      color: "text-blue-600",
      bg: "bg-blue-50",
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
      },
      description: "Bagikan ke FB",
    },
    {
      id: "twitter",
      label: "X / Twitter",
      icon: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.514l-5.106-6.67-5.829 6.67H2.306l7.644-8.74L.554 2.25h6.696l4.627 6.122 5.361-6.122z" />
        </svg>
      ),
      color: "text-black",
      bg: "bg-gray-100",
      action: () => {
        window.open(`https://x.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, "_blank");
      },
      description: "Bagikan ke X",
    },
    {
      id: "instagram",
      label: "Instagram",
      icon: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.117.63c-.794.306-1.459.717-2.126 1.384S.935 3.323.63 4.117C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.863.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.009 4.849.07 1.171.054 1.805.244 2.227.408.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.355 1.056.408 2.227.061 1.264.07 1.646.07 4.849s-.009 3.585-.07 4.849c-.054 1.171-.244 1.805-.408 2.227-.217.562-.477.96-.896 1.382-.42.419-.819.679-1.381.896-.422.164-1.056.355-2.227.408-1.264.061-1.646.07-4.849.07s-3.585-.009-4.849-.07c-1.171-.054-1.805-.244-2.227-.408-.562-.217-.96-.477-1.382-.896-.419-.42-.679-.819-.896-1.381-.164-.422-.355-1.056-.408-2.227-.061-1.264-.07-1.646-.07-4.849s.009-3.585.07-4.849c.054-1.171.244-1.805.408-2.227.217-.562.477-.96.896-1.382.42-.419.819-.679 1.381-.896.422-.164 1.056-.355 2.227-.408 1.264-.061 1.646-.07 4.849-.07z" />
        </svg>
      ),
      color: "text-pink-600",
      bg: "bg-pink-50",
      action: () => {
        copyToClipboard();
        alert("Link sudah disalin! Paste di Instagram Stories atau DM.");
      },
      description: "Bagikan ke IG",
    },
    {
      id: "email",
      label: "Email",
      icon: Mail,
      color: "text-orange-600",
      bg: "bg-orange-50",
      action: () => {
        const subject = `Lihat kost: ${item.name}`;
        const body = `Halo,\n\nAku menemukan kost yang menarik untuk kamu:\n\n${shareText}\n\nBest regards`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      },
      description: "Bagikan via Email",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-lg rounded-t-3xl px-5 pt-3 pb-8 animate-[slideUp_0.3s_ease]">
        <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-5" />

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-bold text-slate-800">Bagikan Listing</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-3 mb-5">
          {item?.images?.[0] ? (
            <img src={item.images[0]} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Share2 size={20} className="text-blue-300" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-slate-800 truncate">{item?.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{item?.location}</p>
            <p className="text-[12px] font-semibold text-blue-600 mt-1">Rp {Number(item?.price || 0).toLocaleString("id-ID")}/bulan</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-5">
          {shareOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <button
                key={option.id}
                onClick={option.action}
                className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-slate-100 transition-all hover:border-slate-200 active:scale-[0.97] ${option.bg}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${option.bg} border border-slate-100`}>
                  <IconComponent size={20} className={option.color} />
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-semibold text-slate-700">{option.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{option.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent text-[12px] text-slate-600 outline-none truncate"
          />
          <button
            onClick={copyToClipboard}
            className="flex-shrink-0 w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center transition-all hover:bg-slate-50"
          >
            {copied ? (
              <Check size={16} className="text-emerald-500" />
            ) : (
              <Copy size={16} className="text-slate-400" />
            )}
          </button>
        </div>

        {copied && (
          <p className="text-[12px] text-emerald-600 text-center mt-3 font-medium">✓ Link sudah disalin!</p>
        )}
      </div>
    </div>
  );
}

/* ── Fix Leaflet default icon ──────────────────────────────────────────── */
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

function MapCenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => { if (lat && lng) map.setView([lat, lng], 15, { animate: true }); }, [lat, lng, map]);
  return null;
}

const facilityMap = [
  { keys: ["wifi", "internet"], icon: Wifi, color: "#3B82F6", bg: "#EFF6FF", label_color: "#1D4ED8" },
  { keys: ["ac", "kipas", "pendingin"], icon: Thermometer, color: "#06B6D4", bg: "#ECFEFF", label_color: "#0E7490" },
  { keys: ["mandi", "shower", "kamar mandi"], icon: ShowerHead, color: "#8B5CF6", bg: "#F5F3FF", label_color: "#6D28D9" },
  { keys: ["parkir", "motor", "mobil", "garasi"], icon: Car, color: "#F59E0B", bg: "#FFFBEB", label_color: "#B45309" },
  { keys: ["tv", "televisi"], icon: Tv, color: "#EF4444", bg: "#FEF2F2", label_color: "#B91C1C" },
  { keys: ["dapur", "masak", "kompor"], icon: Utensils, color: "#10B981", bg: "#ECFDF5", label_color: "#047857" },
  { keys: ["gym", "olahraga", "fitness"], icon: Dumbbell, color: "#F97316", bg: "#FFF7ED", label_color: "#C2410C" },
  { keys: ["laundry", "cuci", "mesin cuci"], icon: WashingMachine, color: "#6366F1", bg: "#EEF2FF", label_color: "#4338CA" },
  { keys: ["lemari", "kabinet", "almari"], icon: Package, color: "#84CC16", bg: "#F7FEE7", label_color: "#4D7C0F" },
  { keys: ["air minum", "galon", "dispenser"], icon: Droplets, color: "#0EA5E9", bg: "#F0F9FF", label_color: "#0369A1" },
  { keys: ["kopi", "cafe"], icon: Coffee, color: "#92400E", bg: "#FEF3C7", label_color: "#78350F" },
  { keys: ["listrik", "token", "pln"], icon: Zap, color: "#EAB308", bg: "#FEFCE8", label_color: "#A16207" },
  { keys: ["taman", "garden", "hijau"], icon: TreePine, color: "#22C55E", bg: "#F0FDF4", label_color: "#15803D" },
  { keys: ["buku", "perpustakaan"], icon: BookOpen, color: "#7C3AED", bg: "#F5F3FF", label_color: "#5B21B6" },
  { keys: ["kunci", "keamanan", "security"], icon: Lock, color: "#374151", bg: "#F9FAFB", label_color: "#111827" },
];

const getFacilityStyle = (name = "") => {
  const n = name.toLowerCase();
  const match = facilityMap.find((f) => f.keys.some((k) => n.includes(k)));
  if (match) return { Icon: match.icon, color: match.color, bg: match.bg, labelColor: match.label_color };
  return { Icon: Home, color: "#6B7280", bg: "#F9FAFB", labelColor: "#374151" };
};

const ruleIcon = (rule = "") => {
  const r = rule.toLowerCase();
  if (r.includes("jam") || r.includes("malam")) return <Clock size={14} />;
  if (r.includes("tamu") || r.includes("lawan jenis")) return <UserX size={14} />;
  if (r.includes("rokok") || r.includes("merokok")) return <CigaretteOff size={14} />;
  if (r.includes("bising") || r.includes("musik")) return <VolumeX size={14} />;
  return <ShieldCheck size={14} />;
};

const genderConfig = {
  putra: { label: "Putra", bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", dot: "#3B82F6" },
  putri: { label: "Putri", bg: "#FDF2F8", text: "#9D174D", border: "#FBCFE8", dot: "#EC4899" },
  campur: { label: "Campur", bg: "#F0FDF4", text: "#166534", border: "#BBF7D0", dot: "#22C55E" },
};

const formatPhone = (num) => {
  if (!num) return "";
  return num.startsWith("0") ? "62" + num.slice(1) : num;
};

const fmtTime = (iso) => {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, "0")}.${d.getMinutes().toString().padStart(2, "0")}`;
};

const addMonths = (dateStr, months) => {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0];
};

const fmtDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
};

const fmtRp = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

const QUICK_REPLIES = [
  { label: "Masih tersedia?", text: "Apakah kamar masih tersedia?" },
  { label: "Mau survey", text: "Boleh survey dulu kak?" },
  { label: "Nego harga?", text: "Apakah bisa nego harga?" },
  { label: "Tanya fasilitas", text: "Fasilitas apa saja yang tersedia?" },
];

const REPORT_REASONS = [
  "Informasi tidak akurat",
  "Foto menyesatkan",
  "Penipuan / scam",
  "Sudah tidak tersedia",
  "Lainnya",
];

const API = "http://localhost:3000";
const getToken = () => localStorage.getItem("token") || "";
const getCurrentUserId = () => {
  try { const user = JSON.parse(localStorage.getItem("user") || "{}"); return user.id || ""; }
  catch { return ""; }
};
const authFetch = (url, opts = {}) =>
  fetch(url, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...(opts.headers || {}) } });

const SERVICE_FEE = 250_000;

/* ─────────────────────────────────────────────────────────────────────────
   AjukanSewaPage
───────────────────────────────────────────────────────────────────────── */
function AjukanSewaPage({ item, onBack, onSubmit }) {
  const today = new Date().toISOString().split("T")[0];
  const [masuk, setMasuk] = useState(today);
  const [durasi, setDurasi] = useState(6);
  const [pesan, setPesan] = useState("");

  const keluar = addMonths(masuk, durasi);
  const price = Number(item?.price || 0);
  const deposit = price;
  const total = price + deposit + SERVICE_FEE;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .asw * { box-sizing: border-box; margin: 0; padding: 0; }
        .asw { font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; background: #f8f9fb; min-height: 100vh; color: #0f172a; }
        .asw-nav { background: white; border-bottom: 1px solid #e8eaf2; padding: 0 48px; height: 60px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 30; }
        .asw-nav-brand { font-size: 18px; font-weight: 800; color: #1d4ed8; letter-spacing: -0.5px; }
        .asw-nav-links { display: flex; gap: 32px; list-style: none; }
        .asw-nav-links a { font-size: 13px; font-weight: 600; color: #64748b; text-decoration: none; }
        .asw-nav-links a.active { color: #1d4ed8; border-bottom: 2px solid #1d4ed8; padding-bottom: 2px; }
        .asw-btn-list { font-size: 13px; font-weight: 700; color: #1d4ed8; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 8px 16px; cursor: pointer; font-family: inherit; }
        .asw-btn-list:hover { background: #dbeafe; }
        .asw-page-header { max-width: 1120px; margin: 0 auto; padding: 36px 48px 0; }
        .asw-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #94a3b8; font-weight: 500; margin-bottom: 10px; }
        .asw-breadcrumb a { color: #1d4ed8; text-decoration: none; cursor: pointer; font-weight: 600; }
        .asw-page-title { font-size: 28px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; margin-bottom: 6px; }
        .asw-page-sub { font-size: 14px; color: #64748b; font-weight: 500; }
        .asw-layout { max-width: 1120px; margin: 0 auto; padding: 32px 48px 80px; display: grid; grid-template-columns: 1fr 380px; gap: 32px; align-items: start; }
        @media (max-width: 900px) { .asw-layout { grid-template-columns: 1fr; padding: 24px 20px; } .asw-nav { padding: 0 20px; } .asw-page-header { padding: 24px 20px 0; } .asw-sidebar { position: static !important; } }
        .asw-left { display: flex; flex-direction: column; gap: 20px; }
        .asw-card { background: white; border: 1px solid #e8eaf2; border-radius: 16px; padding: 28px; }
        .asw-section-title { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
        .asw-step-badge { width: 28px; height: 28px; border-radius: 50%; background: #1d4ed8; color: white; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .asw-section-title h2 { font-size: 16px; font-weight: 700; color: #0f172a; }
        .asw-date-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .asw-field-label { font-size: 11px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; color: #64748b; margin-bottom: 8px; display: block; }
        .asw-input { width: 100%; padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; color: #0f172a; background: #fafbff; font-family: inherit; font-weight: 500; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .asw-input:focus { border-color: #3b82f6; background: white; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .asw-input-ro { background: #f1f5f9; color: #64748b; cursor: default; }
        .asw-info-note { display: flex; align-items: flex-start; gap: 10px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 12px 14px; margin-top: 16px; font-size: 12.5px; color: #0369a1; font-weight: 500; line-height: 1.5; }
        .asw-durasi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 12px; }
        .asw-durasi-pill { padding: 12px 8px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: #fafbff; font-size: 13px; font-weight: 700; color: #475569; cursor: pointer; text-align: center; transition: all 0.18s; font-family: inherit; }
        .asw-durasi-pill:hover { border-color: #93c5fd; }
        .asw-durasi-pill.active { background: #1d4ed8; border-color: #1d4ed8; color: white; box-shadow: 0 4px 12px rgba(29,78,216,0.25); }
        .asw-textarea { width: 100%; padding: 13px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; color: #0f172a; background: #fafbff; font-family: inherit; font-weight: 500; outline: none; resize: none; transition: border-color 0.2s, box-shadow 0.2s; line-height: 1.6; }
        .asw-textarea:focus { border-color: #3b82f6; background: white; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .asw-textarea::placeholder { color: #cbd5e1; }
        .asw-textarea-hint { font-size: 12px; color: #94a3b8; margin-top: 8px; font-weight: 500; }
        .asw-pay-table { width: 100%; border-collapse: collapse; margin-top: 4px; }
        .asw-pay-table thead th { font-size: 11px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; color: #94a3b8; padding: 0 0 12px; text-align: left; border-bottom: 1px solid #f1f5f9; }
        .asw-pay-table thead th:last-child { text-align: right; }
        .asw-pay-table tbody td { padding: 14px 0; border-bottom: 1px solid #f8faff; vertical-align: top; }
        .asw-pay-table tbody tr:last-child td { border-bottom: none; }
        .asw-pay-name { font-size: 14px; font-weight: 600; color: #1e293b; }
        .asw-pay-sub { font-size: 12px; color: #94a3b8; margin-top: 2px; }
        .asw-pay-amt { font-size: 14px; font-weight: 700; color: #1e293b; text-align: right; white-space: nowrap; }
        .asw-pay-total td { padding-top: 18px !important; border-top: 2px solid #e8eaf2 !important; border-bottom: none !important; }
        .asw-pay-total-label { font-size: 15px; font-weight: 800; color: #0f172a; }
        .asw-pay-total-amt { font-size: 17px; font-weight: 800; color: #1d4ed8; text-align: right; }
        .asw-sidebar { position: sticky; top: 80px; display: flex; flex-direction: column; gap: 16px; }
        .asw-prop-card { background: white; border: 1px solid #e8eaf2; border-radius: 16px; overflow: hidden; }
        .asw-prop-img-wrap { position: relative; }
        .asw-prop-img { width: 100%; height: 200px; object-fit: cover; display: block; }
        .asw-prop-img-ph { width: 100%; height: 200px; background: linear-gradient(135deg, #1d4ed8, #3b82f6); display: flex; align-items: center; justify-content: center; color: white; font-size: 48px; font-weight: 800; }
        .asw-verified-badge { position: absolute; top: 12px; left: 12px; background: #1d4ed8; color: white; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 20px; }
        .asw-prop-body { padding: 20px; }
        .asw-prop-name { font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 6px; letter-spacing: -0.3px; }
        .asw-prop-loc { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #64748b; margin-bottom: 16px; }
        .asw-stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #e8eaf2; border-radius: 10px; overflow: hidden; margin-bottom: 20px; }
        .asw-stat-cell { background: #f8f9fb; padding: 12px 8px; text-align: center; }
        .asw-stat-label { font-size: 10px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px; }
        .asw-stat-val { font-size: 14px; font-weight: 800; color: #0f172a; }
        .asw-detail-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
        .asw-detail-row:last-child { border-bottom: none; }
        .asw-detail-key { color: #64748b; font-weight: 500; }
        .asw-detail-val { font-weight: 700; color: #0f172a; }
        .asw-cta-card { background: white; border: 1px solid #e8eaf2; border-radius: 16px; padding: 20px; }
        .asw-btn-submit { width: 100%; padding: 15px; border-radius: 12px; background: #1d4ed8; color: white; font-size: 15px; font-weight: 700; border: none; cursor: pointer; font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s, transform 0.15s; box-shadow: 0 6px 20px rgba(29,78,216,0.3); margin-bottom: 12px; }
        .asw-btn-submit:hover { background: #1e40af; transform: translateY(-1px); }
        .asw-tos-note { font-size: 11.5px; color: #94a3b8; text-align: center; line-height: 1.6; }
        .asw-tos-note a { color: #3b82f6; text-decoration: underline; cursor: pointer; }
        .asw-help-card { background: white; border: 1px solid #e8eaf2; border-radius: 16px; padding: 18px 20px; display: flex; align-items: flex-start; gap: 14px; }
        .asw-help-icon { width: 40px; height: 40px; border-radius: 12px; background: #eff6ff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #1d4ed8; }
        .asw-help-title { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
        .asw-help-sub { font-size: 12px; color: #64748b; line-height: 1.5; font-weight: 500; }
        .asw-footer { background: #0f172a; padding: 48px; }
        .asw-footer-inner { max-width: 1120px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; }
        @media (max-width: 900px) { .asw-footer-inner { grid-template-columns: 1fr 1fr; gap: 24px; } .asw-footer { padding: 32px 20px; } }
        .asw-footer-brand { font-size: 20px; font-weight: 800; color: white; margin-bottom: 12px; letter-spacing: -0.5px; }
        .asw-footer-tagline { font-size: 13px; color: #64748b; line-height: 1.6; font-weight: 500; }
        .asw-footer-col h4 { font-size: 12px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #94a3b8; margin-bottom: 14px; }
        .asw-footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
        .asw-footer-col ul li a { font-size: 13px; color: #475569; text-decoration: none; font-weight: 500; }
        .asw-footer-col ul li a:hover { color: white; }
        .asw-footer-divider { max-width: 1120px; margin: 32px auto 0; border: none; border-top: 1px solid #1e293b; }
        .asw-footer-bottom { max-width: 1120px; margin: 0 auto; padding-top: 20px; font-size: 12px; color: #475569; font-weight: 500; }
      `}</style>

      <div className="asw">
        <nav className="asw-nav">
          <span className="asw-nav-brand">Atap</span>
          <ul className="asw-nav-links">
            <li><a href="#">Beranda</a></li>
            <li><a href="#" className="active">Properti</a></li>
            <li><a href="#">Maps</a></li>
            <li><a href="#">Pesan</a></li>
          </ul>
          <button className="asw-btn-list">List Properti</button>
        </nav>

        <div className="asw-page-header">
          <div className="asw-breadcrumb">
            <a onClick={onBack}>Properti</a>
            <ChevronRight size={12} />
            <a onClick={onBack}>{item?.name}</a>
            <ChevronRight size={12} />
            <span>Ajukan Sewa</span>
          </div>
          <h1 className="asw-page-title">Ajukan Sewa</h1>
          <p className="asw-page-sub">Lengkapi detail berikut untuk mengirim permohonan sewa kepada pemilik.</p>
        </div>

        <div className="asw-layout">
          <div className="asw-left">
            <div className="asw-card">
              <div className="asw-section-title">
                <div className="asw-step-badge">1</div>
                <h2>Detail Sewa</h2>
              </div>
              <div className="asw-date-row">
                <div>
                  <label className="asw-field-label">Tanggal Masuk</label>
                  <input type="date" className="asw-input" value={masuk} onChange={(e) => setMasuk(e.target.value)} />
                </div>
                <div>
                  <label className="asw-field-label">Tanggal Keluar</label>
                  <input type="text" className="asw-input asw-input-ro" value={fmtDate(keluar)} readOnly />
                </div>
              </div>
              <div className="asw-info-note">
                <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>Durasi sewa minimal untuk unit ini adalah 6 bulan.</span>
              </div>
              <label className="asw-field-label" style={{ marginTop: 20, display: "block" }}>Durasi Sewa</label>
              <div className="asw-durasi-grid">
                {[3, 6, 12, 24].map((bln) => (
                  <button key={bln} type="button" className={`asw-durasi-pill${durasi === bln ? " active" : ""}`} onClick={() => setDurasi(bln)}>
                    {bln} bulan
                  </button>
                ))}
              </div>
            </div>

            <div className="asw-card">
              <div className="asw-section-title">
                <div className="asw-step-badge">2</div>
                <h2>Pesan untuk Pemilik</h2>
              </div>
              <label className="asw-field-label">Catatan Tambahan</label>
              <textarea className="asw-textarea" rows={5} placeholder="Halo, saya tertarik dengan unit Anda..." value={pesan} onChange={(e) => setPesan(e.target.value)} />
              <p className="asw-textarea-hint">Pemilik lebih cenderung menerima pengajuan dengan perkenalan yang sopan.</p>
            </div>

            <div className="asw-card">
              <div className="asw-section-title">
                <div className="asw-step-badge">3</div>
                <h2>Rincian Pembayaran</h2>
              </div>
              <table className="asw-pay-table">
                <thead><tr><th>Deskripsi</th><th>Jumlah</th></tr></thead>
                <tbody>
                  <tr>
                    <td><div className="asw-pay-name">Sewa Bulan Pertama</div><div className="asw-pay-sub">Unit {item?.size || "—"} · {item?.name}</div></td>
                    <td className="asw-pay-amt">{fmtRp(price)}</td>
                  </tr>
                  <tr>
                    <td><div className="asw-pay-name">Deposit Keamanan</div><div className="asw-pay-sub">Dapat dikembalikan di akhir masa sewa</div></td>
                    <td className="asw-pay-amt">{fmtRp(deposit)}</td>
                  </tr>
                  <tr>
                    <td><div className="asw-pay-name">Biaya Layanan Atap</div><div className="asw-pay-sub">Termasuk perlindungan penyewa</div></td>
                    <td className="asw-pay-amt">{fmtRp(SERVICE_FEE)}</td>
                  </tr>
                  <tr className="asw-pay-total">
                    <td><span className="asw-pay-total-label">Total Pembayaran Awal</span></td>
                    <td><span className="asw-pay-total-amt">{fmtRp(total)}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="asw-sidebar">
            <div className="asw-prop-card">
              <div className="asw-prop-img-wrap">
                {item?.images?.[0]
                  ? <img src={item.images[0]} alt={item.name} className="asw-prop-img" />
                  : <div className="asw-prop-img-ph">{item?.name?.[0]?.toUpperCase() || "K"}</div>
                }
                {item?.isVerified && <span className="asw-verified-badge">✓ Verified Unit</span>}
              </div>
              <div className="asw-prop-body">
                <h3 className="asw-prop-name">{item?.name}</h3>
                <div className="asw-prop-loc"><MapPin size={12} style={{ flexShrink: 0 }} /><span>{item?.location}</span></div>
                <div className="asw-stat-grid">
                  <div className="asw-stat-cell"><div className="asw-stat-label">Luas</div><div className="asw-stat-val">{item?.size || "—"}</div></div>
                  <div className="asw-stat-cell"><div className="asw-stat-label">Tipe</div><div className="asw-stat-val">{item?.gender ? item.gender[0].toUpperCase() + item.gender.slice(1).toLowerCase() : "—"}</div></div>
                  <div className="asw-stat-cell"><div className="asw-stat-label">Kamar</div><div className="asw-stat-val">{item?.availableRooms ?? "—"}</div></div>
                </div>
                <div>
                  <div className="asw-detail-row"><span className="asw-detail-key">Check-in</span><span className="asw-detail-val">{fmtDate(masuk)}</span></div>
                  <div className="asw-detail-row"><span className="asw-detail-key">Durasi</span><span className="asw-detail-val">{durasi} Bulan</span></div>
                  <div className="asw-detail-row" style={{ borderBottom: "none" }}><span className="asw-detail-key">Harga/Bulan</span><span className="asw-detail-val" style={{ color: "#1d4ed8" }}>{fmtRp(price)}</span></div>
                </div>
              </div>
            </div>
            <div className="asw-cta-card">
              <button className="asw-btn-submit" onClick={() => onSubmit({ masuk, durasi, keluar, pesan })}>
                Kirim Pengajuan <ChevronRight size={18} />
              </button>
              <p className="asw-tos-note">Dengan mengklik tombol di atas, Anda menyetujui <a>Syarat &amp; Ketentuan</a> Atap.</p>
            </div>
            <div className="asw-help-card">
              <div className="asw-help-icon"><HelpCircle size={20} /></div>
              <div>
                <p className="asw-help-title">Butuh bantuan?</p>
                <p className="asw-help-sub">Tim sukses penyewa kami siap membantu proses pengajuan Anda.</p>
              </div>
            </div>
          </div>
        </div>

        <footer className="asw-footer">
          <div className="asw-footer-inner">
            <div><div className="asw-footer-brand">Atap</div><p className="asw-footer-tagline">Platform sewa properti modern untuk penyewa generasi baru.</p></div>
            <div className="asw-footer-col"><h4>Product</h4><ul><li><a href="#">About Us</a></li></ul></div>
            <div className="asw-footer-col"><h4>Support</h4><ul><li><a href="#">Help Center</a></li></ul></div>
            <div className="asw-footer-col"><h4>Legal</h4><ul><li><a href="#">Privacy Policy</a></li></ul></div>
          </div>
          <hr className="asw-footer-divider" />
          <div className="asw-footer-inner"><p className="asw-footer-bottom">© 2024 Atap Property Group.</p></div>
        </footer>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   MinatModal
───────────────────────────────────────────────────────────────────────── */
function MinatModal({ item, onClose }) {
  const token = getToken();
  const userId = getCurrentUserId();
  const isLoggedIn = !!token && !!userId;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [errMsg, setErrMsg] = useState("");

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      if (name.trim().length < 2) { setErrMsg("Nama minimal 2 karakter"); return; }
      if (phone.trim().length < 8) { setErrMsg("Nomor HP tidak valid"); return; }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErrMsg("Format email tidak valid"); return; }
    }
    setErrMsg(""); setLoading(true);
    try {
      const waNum = formatPhone(item.contactNumber);
      const waMsg = isLoggedIn
        ? `Halo kak, saya tertarik dengan kost *${item.name}* di ${item.location}. Apakah masih tersedia?`
        : `Halo kak, saya *${name.trim()}* tertarik dengan kost *${item.name}* di ${item.location}. Apakah masih tersedia?`;
      window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}`, "_blank");
      setStatus("success");
    } catch (e) { setErrMsg(e.message || "Terjadi kesalahan"); setStatus("error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full max-w-lg rounded-t-3xl px-5 pt-3 pb-8 animate-[slideUp_0.3s_ease]">
        <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-5" />
        {status === "success" ? (
          <div className="flex flex-col items-center py-6 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-slate-800 mb-1">WhatsApp terbuka!</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed">Lanjutkan percakapan di WhatsApp.</p>
            </div>
            <button onClick={onClose} className="w-full h-12 rounded-2xl bg-blue-600 text-white font-semibold text-[14px]">Tutup</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[16px] font-bold text-slate-800">Saya Minat</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <X size={16} className="text-slate-500" />
              </button>
            </div>
            <p className="text-[12px] text-slate-400 mb-5">Informasi kamu akan diteruskan ke pemilik kost</p>
            <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3 mb-5 border border-slate-100">
              {item?.images?.[0] ? (
                <img src={item.images[0]} alt={item.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Home size={18} className="text-blue-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-slate-800 truncate">{item?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{item?.location}</p>
              </div>
              <p className="text-[13px] font-bold text-blue-600 flex-shrink-0">Rp {Number(item?.price || 0).toLocaleString("id-ID")}</p>
            </div>
            {isLoggedIn ? (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 flex items-start gap-3 mb-5">
                <ShieldCheck size={15} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-blue-600 leading-relaxed">Kamu sudah login. Data profilmu akan digunakan sebagai informasi kontak.</p>
              </div>
            ) : (
              <div className="space-y-3 mb-5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1.5">Nama Lengkap <span className="text-red-400">*</span></label>
                  <input type="text" placeholder="contoh: Budi Santoso" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[13.5px] text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1.5">Nomor HP (WhatsApp) <span className="text-red-400">*</span></label>
                  <input type="tel" placeholder="contoh: 08123456789" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[13.5px] text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1.5">Email <span className="text-slate-400 font-normal">(opsional)</span></label>
                  <input type="email" placeholder="contoh: budi@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[13.5px] text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" />
                </div>
              </div>
            )}
            {errMsg && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 mb-4">
                <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                <p className="text-[12px] text-red-500">{errMsg}</p>
              </div>
            )}
            <button onClick={handleSubmit} disabled={loading}
              className="w-full h-13 py-3.5 rounded-2xl bg-blue-600 text-white font-bold text-[14px] flex items-center justify-center gap-2 active:scale-[0.97] transition-transform shadow-lg shadow-blue-200 disabled:opacity-60">
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? "Mengirim..." : "Kirim Minat Saya"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   ReportModal
───────────────────────────────────────────────────────────────────────── */
function ReportModal({ item, onClose }) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [errMsg, setErrMsg] = useState("");

  const handleSubmit = async () => {
    if (!reason) { setErrMsg("Pilih alasan laporan terlebih dahulu"); return; }
    setErrMsg(""); setLoading(true);
    try {
      const res = await authFetch(`${API}/reports`, {
        method: "POST",
        body: JSON.stringify({
          listingId: item.id,
          reason,
          note: note.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || "Gagal mengirim laporan");
      }
      setStatus("success");
    } catch (e) {
      setErrMsg(e.message || "Terjadi kesalahan, coba lagi");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStatus(null); setReason(""); setNote(""); setErrMsg("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden animate-[slideUp_0.25s_ease] shadow-xl" style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}>

        {status === "success" ? (
          <div className="flex flex-col items-center px-5 py-8 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-slate-800 mb-1">Laporan terkirim!</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed">Tim kami akan meninjau laporan ini dalam 1x24 jam.</p>
            </div>
            <button onClick={handleClose} className="w-full h-12 rounded-2xl bg-blue-600 text-white font-semibold text-[14px]">
              Tutup
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-slate-100 flex-shrink-0 flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-slate-800">Laporkan Listing</h3>
                <p className="text-[12px] text-slate-400 mt-0.5">
                  Melaporkan <span className="font-semibold text-slate-600">{item?.name}</span>
                </p>
              </div>
              <button onClick={handleClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="px-5 py-4 overflow-y-auto" style={{ flex: 1 }}>
              <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3 mb-5 border border-slate-100">
                {item?.images?.[0] ? (
                  <img src={item.images[0]} alt={item.name} className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                    <Flag size={16} className="text-red-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-slate-800 truncate">{item?.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{item?.location}</p>
                </div>
              </div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Alasan Laporan</p>
              <div className="space-y-2 mb-4">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${reason === r ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-100"
                      }`}
                  >
                    <input
                      type="radio"
                      name="report_reason"
                      value={r}
                      checked={reason === r}
                      onChange={() => { setReason(r); setErrMsg(""); }}
                      className="accent-red-500"
                    />
                    <span className={`text-[13px] font-medium ${reason === r ? "text-red-700" : "text-slate-600"}`}>
                      {r}
                    </span>
                  </label>
                ))}
              </div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block mb-2">
                Keterangan Tambahan <span className="text-slate-300 font-normal normal-case">(opsional)</span>
              </label>
              <textarea
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[13.5px] text-slate-700 placeholder-slate-400 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-50 resize-none"
                rows={3}
                placeholder="Jelaskan lebih detail..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {/* Footer */}
            <div className="px-5 pt-3 pb-5 border-t border-slate-100 flex-shrink-0">
              {errMsg && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 mb-3">
                  <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                  <p className="text-[12px] text-red-500">{errMsg}</p>
                </div>
              )}
              <button
                onClick={handleSubmit}
                disabled={!reason || loading}
                className="w-full py-3.5 rounded-2xl bg-red-500 text-white font-bold text-[14px] flex items-center justify-center gap-2 active:scale-[0.97] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Flag size={15} />}
                {loading ? "Mengirim..." : "Kirim Laporan"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   DetailPage (main export)
───────────────────────────────────────────────────────────────────────── */
export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
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
  const thumbsRef = useRef(null);
  const pollRef = useRef(null);

  const myId = getCurrentUserId();

  useEffect(() => {
    if (showChat) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showChat]);

  useEffect(() => {
    if (!thumbsRef.current) return;
    const el = thumbsRef.current.children[activeImg];
    if (el) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeImg]);

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("atap_favorites") || "[]");
    setIsLiked(favs.includes(id));
  }, [id]);

  const toggleLike = () => {
    const favs = JSON.parse(localStorage.getItem("atap_favorites") || "[]");
    const next = isLiked ? favs.filter((f) => f !== id) : [...favs, id];
    localStorage.setItem("atap_favorites", JSON.stringify(next));
    setIsLiked(!isLiked);
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`${API}/listings/${id}`);
        if (!res.ok) throw new Error("Gagal fetch");
        const { data } = await res.json();
        if (!data) return;
        const room = data.roomTypes?.[0];

        const allPhotos = (data.roomTypes ?? [])
          .flatMap((rt) => rt.photos ?? [])
          .map((p) => p.url)
          .filter(Boolean);

        setItem({
          id: data.id,
          name: data.name || "Tanpa nama",
          location: data.address || "Lokasi tidak tersedia",
          description: data.description || "",
          rules: Array.isArray(data.rules) ? data.rules : data.rules ? [data.rules] : [],
          gender: data.genderType,
          contactNumber: data.contactNumber || "",
          ownerId: data.owner?.id || "",
          ownerName: data.owner?.name || "Pemilik",
          price: room?.price || data.cheapestPrice || 0,
          size: room?.size || "-",
          facilities: room?.facilities || data.facilities || [],
          images: allPhotos,
          rating: data.rating || 4.8,
          reviewCount: data.reviewCount || 32,
          isVerified: data.isVerified !== false,
          isFeatured: data.isPremium || false,
          availableRooms: data.roomTypes?.reduce((sum, r) => sum + (r.availableCount || 0), 0) || 0,
          latitude: data.latitude ? Number(data.latitude) : null,
          longitude: data.longitude ? Number(data.longitude) : null,
        });
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchDetail();
    window.scrollTo(0, 0);
  }, [id]);

  const openChat = async () => {
    setShowChat(true);
    if (threadId) return;
    setChatLoading(true); setChatError(null);
    try {
      const res = await authFetch(`${API}/chats/start`, { method: "POST", body: JSON.stringify({ listingId: id }) });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || "Gagal membuat thread"); }
      const json = await res.json();
      const thread = json.data || json;
      setThreadId(thread.id);
      await fetchMessages(thread.id);
    } catch (e) { console.error(e); setChatError("Gagal memuat chat. Pastikan kamu sudah login."); }
    finally { setChatLoading(false); }
  };

  const fetchMessages = async (tid) => {
    try {
      const res = await authFetch(`${API}/chats/${tid}`);
      if (!res.ok) return;
      const json = await res.json();
      const thread = json.data || json;
      setMessages(Array.isArray(thread.messages) ? thread.messages : []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (showChat && threadId) { pollRef.current = setInterval(() => fetchMessages(threadId), 3000); }
    return () => clearInterval(pollRef.current);
  }, [showChat, threadId]);

  const sendMessage = async (text) => {
    if (!text.trim() || !threadId || sendLoading) return;
    setSendLoading(true); setChatInput("");
    try {
      const res = await authFetch(`${API}/chats/${threadId}/messages`, { method: "POST", body: JSON.stringify({ message: text.trim() }) });
      if (!res.ok) throw new Error("Gagal kirim");
      const json = await res.json();
      setMessages((prev) => [...prev, json.data || json]);
    } catch (e) { console.error(e); }
    finally { setSendLoading(false); }
  };

  const handleQuickReply = (q) => { setQuickUsed(true); sendMessage(q.text); };
  const handleSewaSubmit = ({ masuk, durasi, keluar, pesan }) => {
    alert(`Permintaan sewa berhasil dikirim!\nMasuk: ${masuk}\nDurasi: ${durasi} bulan\nKeluar: ${keluar}`);
    setShowSewa(false);
  };

  const touchStartX = useRef(null);
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      const len = images?.length || 1;
      setActiveImg((p) => diff > 0 ? (p + 1) % len : (p - 1 + len) % len);
    }
    touchStartX.current = null;
  };

  if (showSewa && item) {
    return <AjukanSewaPage item={item} onBack={() => setShowSewa(false)} onSubmit={handleSewaSubmit} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="h-72 bg-slate-100 animate-pulse" />
        <div className="px-5 py-5 space-y-4">
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-slate-100 animate-pulse rounded-full" />
            <div className="h-6 w-24 bg-slate-100 animate-pulse rounded-full" />
          </div>
          <div className="h-7 bg-slate-100 animate-pulse rounded-lg w-4/5" />
          <div className="h-4 bg-slate-100 animate-pulse rounded-lg w-3/5" />
          <div className="h-24 bg-slate-100 animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-6">
        <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center border border-slate-100">
          <Home size={28} className="text-slate-300" />
        </div>
        <p className="text-sm font-medium text-slate-400">Data tidak ditemukan</p>
        <button onClick={() => navigate(-1)} className="text-sm font-semibold text-blue-600 bg-blue-50 px-6 py-2.5 rounded-full">Kembali</button>
      </div>
    );
  }

  const images = item.images.length > 0
    ? item.images
    : ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600"];

  const gender = genderConfig[item.gender?.toLowerCase()];

  return (
    <>
      <div className="min-h-screen bg-white pb-36">
        {/* ── Image gallery ── */}
        <div className="relative overflow-hidden bg-slate-100">
          <div className="relative h-72" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <img src={images[activeImg]} alt={item.name} className="w-full h-full object-cover transition-opacity duration-300" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-12 pb-3">
              <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
                <ArrowLeft size={17} className="text-slate-800" />
              </button>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowShare(true)} className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
                  <Share2 size={15} className="text-slate-700" />
                </button>
                <button onClick={toggleLike} className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-all ${isLiked ? "bg-red-500" : "bg-white/90 backdrop-blur-sm"}`}>
                  <Heart size={15} fill={isLiked ? "white" : "none"} className={isLiked ? "text-white" : "text-slate-700"} />
                </button>
              </div>
            </div>
            {images.length > 1 && (
              <>
                <button onClick={() => setActiveImg((p) => (p - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center">
                  <ChevronLeft size={16} className="text-slate-700" />
                </button>
                <button onClick={() => setActiveImg((p) => (p + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center">
                  <ChevronRight size={16} className="text-slate-700" />
                </button>
              </>
            )}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === activeImg ? "w-5 bg-white" : "w-1.5 bg-white/50"}`} />
                ))}
              </div>
            )}
            <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-full">{activeImg + 1} / {images.length}</div>
          </div>

          {images.length > 1 && (
            <div ref={thumbsRef} className="flex gap-2 overflow-x-auto px-4 py-3 bg-white border-b border-slate-100 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
              {images.map((src, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`flex-shrink-0 w-16 h-14 rounded-xl overflow-hidden border-2 transition-all ${i === activeImg ? "border-blue-500 shadow-md shadow-blue-100" : "border-transparent opacity-60"}`}>
                  <img src={src} alt={`foto ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Main content ── */}
        <div className="px-5 pt-5">
          {/* Badges + rating */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {item.isFeatured && <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-400 text-amber-900 tracking-wide">UNGGULAN</span>}
            {item.isVerified && (
              <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                <BadgeCheck size={12} /> Terverifikasi
              </span>
            )}
            {gender && <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full border" style={{ background: gender.bg, color: gender.text, borderColor: gender.border }}>{gender.label}</span>}
            <div className="flex items-center gap-1 ml-auto">
              <Star size={12} className="text-amber-400 fill-amber-400" />
              <span className="text-[12px] font-semibold text-slate-700">{item.rating}</span>
              <span className="text-[11px] text-slate-400">· {item.reviewCount} ulasan</span>
            </div>
          </div>

          <h1 className="text-[20px] font-bold text-slate-900 leading-snug mb-1.5">{item.name}</h1>
          <div className="flex items-center gap-1.5 mb-5">
            <MapPin size={13} className="text-slate-400 flex-shrink-0" />
            <span className="text-[13px] text-slate-500 leading-none">{item.location}</span>
          </div>

          {/* Price banner */}
          <div className="rounded-2xl px-5 py-4 mb-5 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #1E40AF 0%, #2563EB 50%, #3B82F6 100%)" }}>
            <div>
              <p className="text-[11px] text-blue-200 font-medium mb-0.5">Mulai dari</p>
              <div className="flex items-baseline gap-1">
                <span className="text-[22px] font-bold text-white">Rp {Number(item.price).toLocaleString("id-ID")}</span>
                <span className="text-[12px] text-blue-200 font-medium">/bulan</span>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
                <p className="text-[20px] font-bold text-white leading-none">{item.availableRooms}</p>
                <p className="text-[10px] text-blue-100 font-medium mt-0.5 uppercase tracking-wide">Kamar</p>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2.5 mb-6">
            {[
              { icon: <Ruler size={14} className="text-blue-500" />, label: "Luas Kamar", value: item.size, bg: "#EFF6FF" },
              { icon: <Home size={14} className="text-purple-500" />, label: "Tipe Kost", value: gender?.label || "Umum", bg: "#F5F3FF" },
              { icon: <DoorOpen size={14} className="text-emerald-500" />, label: "Status", value: "Tersedia", bg: "#F0FDF4" },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl p-3.5" style={{ background: s.bg }}>
                <div className="mb-2">{s.icon}</div>
                <p className="text-[10px] text-slate-400 font-medium mb-0.5">{s.label}</p>
                <p className="text-[12px] font-bold text-slate-700">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          {item.description && (
            <div className="mb-6">
              <h2 className="text-[16px] font-bold text-slate-800 mb-3">Tentang hunian ini</h2>
              <p className="text-[13.5px] text-slate-500 leading-relaxed">{item.description}</p>
            </div>
          )}

          {/* Facilities */}
          {item.facilities.length > 0 && (
            <div className="mb-6">
              <h2 className="text-[16px] font-bold text-slate-800 mb-4">Fasilitas</h2>
              <div className="grid grid-cols-2 gap-3">
                {item.facilities.map((f, i) => {
                  const { Icon, color, bg, labelColor } = getFacilityStyle(f);
                  return (
                    <div key={i} className="flex items-center gap-3 rounded-2xl px-4 py-3.5 border" style={{ background: bg, borderColor: `${color}22` }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
                        <Icon size={17} style={{ color }} />
                      </div>
                      <span className="text-[13px] font-semibold leading-tight" style={{ color: labelColor }}>{f}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Map */}
          {item.latitude && item.longitude && (
            <div className="mb-6">
              <h2 className="text-[16px] font-bold text-slate-800 mb-4">Lokasi Hunian</h2>
              <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm" style={{ height: 280 }}>
                <MapContainer center={[item.latitude, item.longitude]} zoom={15} style={{ width: "100%", height: "100%" }} zoomControl={false}>
                  <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[item.latitude, item.longitude]} icon={createPriceIcon(item.price, true)} />
                  <MapCenter lat={item.latitude} lng={item.longitude} />
                </MapContainer>
              </div>
              <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2">
                <Navigation size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[12px] font-semibold text-blue-700">📍 {item.location}</p>
                  <p className="text-[11px] text-blue-600 mt-1">Tap map untuk melihat petunjuk arah lengkap.</p>
                </div>
              </div>
            </div>
          )}

          {/* Rules */}
          {item.rules.length > 0 && (
            <div className="mb-6">
              <h2 className="text-[16px] font-bold text-slate-800 mb-4">Peraturan Kost</h2>
              <div className="rounded-2xl border border-slate-100 overflow-hidden bg-white divide-y divide-slate-50">
                {item.rules.map((r, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3.5">
                    <div className="w-7 h-7 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5 text-red-400">{ruleIcon(r)}</div>
                    <span className="text-[13px] text-slate-600 leading-relaxed pt-0.5">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Owner section */}
          <div className="mb-6">
            <h2 className="text-[16px] font-bold text-slate-800 mb-3">Pemilik Kost</h2>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {item.ownerName?.[0]?.toUpperCase() || "P"}
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-slate-800">{item.ownerName}</p>
                  <p className="text-[12px] text-slate-400">Pemilik Kost</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  <span className="text-[11px] text-emerald-600 font-medium">Online</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => window.open(`https://wa.me/${formatPhone(item.contactNumber)}?text=Halo kak, saya tertarik dengan kost ${encodeURIComponent(item.name)}`, "_blank")}
                  className="flex items-center justify-center gap-2 h-11 rounded-xl font-semibold text-[13px] text-white active:scale-[0.97] transition-transform"
                  style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.555 4.126 1.527 5.858L.057 23.617a.75.75 0 0 0 .92.92l5.818-1.488A11.946 11.946 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                  </svg>
                  WhatsApp
                </button>
                <button onClick={openChat} className="flex items-center justify-center gap-2 h-11 rounded-xl font-semibold text-[13px] text-blue-700 bg-blue-50 border border-blue-100 active:scale-[0.97] transition-transform">
                  <MessageCircle size={16} className="text-blue-500" />
                  Chat di App
                </button>
              </div>
            </div>
          </div>

          {/* Report link */}
          <div className="mb-6 flex justify-center">
            <button
              onClick={() => setShowReport(true)}
              className="flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-red-400 transition-colors"
            >
              <Flag size={13} />
              Laporkan listing ini
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 px-4 py-3" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}>
        <div className="flex items-center gap-2.5 max-w-xl mx-auto">
          <button onClick={toggleLike} className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 transition-colors ${isLiked ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}>
            <Heart size={18} fill={isLiked ? "#EF4444" : "none"} className={isLiked ? "text-red-500" : "text-slate-500"} />
          </button>
          <button onClick={() => setShowMinat(true)} className="flex-1 h-12 rounded-2xl border border-blue-200 bg-blue-50 text-blue-700 font-semibold text-[13px] active:scale-[0.97] transition-transform flex items-center justify-center gap-2">
            <Star size={15} className="text-blue-500" /> Saya Minat
          </button>
          <button onClick={() => setShowSewa(true)} className="flex-1 h-12 rounded-2xl bg-blue-600 text-white font-semibold text-[13px] active:scale-[0.97] transition-transform shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
            <Calendar size={15} /> Ajukan Sewa
          </button>
          <button
            onClick={() => setShowReport(true)}
            className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0 active:scale-[0.97] transition-transform"
            title="Laporkan listing"
          >
            <Flag size={17} className="text-red-400" />
          </button>
        </div>
      </div>

      {/* ── Modals ── */}
      {showMinat && <MinatModal item={item} onClose={() => setShowMinat(false)} />}
      {showReport && <ReportModal item={item} onClose={() => setShowReport(false)} />}
      {showShare && <ShareModal item={item} onClose={() => setShowShare(false)} />}

      {/* ── Chat modal ── */}
      {showChat && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center" onClick={(e) => e.target === e.currentTarget && setShowChat(false)}>
          <div className="bg-white w-full max-w-lg rounded-t-3xl px-5 pt-3 pb-6 animate-[slideUp_0.3s_ease]">
            <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-4" />
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[16px] font-bold text-slate-800">Tanya Pemilik</h3>
              <button onClick={() => setShowChat(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <X size={16} className="text-slate-500" />
              </button>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 mb-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                {item.ownerName?.[0]?.toUpperCase() || "P"}
              </div>
              <div>
                <p className="text-[14px] font-semibold text-slate-700">{item.ownerName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  <span className="text-[11px] text-slate-400">Pemilik Kost</span>
                </div>
              </div>
            </div>
            {chatError && <div className="bg-red-50 border border-red-100 text-red-500 text-[13px] rounded-2xl px-4 py-3 mb-3">{chatError}</div>}
            <div className="h-52 overflow-y-auto flex flex-col gap-2.5 mb-3 px-0.5">
              {chatLoading ? (
                <div className="flex items-center justify-center h-full"><Loader2 size={22} className="text-slate-300 animate-spin" /></div>
              ) : messages.length === 0 && !chatError ? (
                <div className="flex items-center justify-center h-full"><p className="text-[13px] text-slate-400">Belum ada pesan. Mulai percakapan! 👋</p></div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.senderId === myId;
                  return (
                    <div key={msg.id || i} className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                      {!isMe && (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {item.ownerName?.[0]?.toUpperCase() || "P"}
                        </div>
                      )}
                      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        <div className={`px-3.5 py-2.5 text-[13px] leading-snug ${isMe ? "bg-blue-600 text-white rounded-[18px_18px_4px_18px]" : "bg-slate-100 text-slate-700 rounded-[4px_18px_18px_18px]"}`} style={{ maxWidth: "72%" }}>
                          {msg.message}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 px-1">{msg.sentAt ? fmtTime(msg.sentAt) : ""}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>
            {!quickUsed && !chatLoading && !chatError && (
              <div className="flex gap-2 flex-wrap mb-3">
                {QUICK_REPLIES.map((q) => (
                  <button key={q.label} onClick={() => handleQuickReply(q)} className="text-[12px] font-semibold px-3 py-1.5 rounded-full border border-blue-100 bg-blue-50 text-blue-600">{q.label}</button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5">
              <input type="text" placeholder="Ketik pesan..." value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) sendMessage(chatInput); }}
                disabled={chatLoading || !!chatError}
                className="flex-1 bg-transparent text-[14px] text-slate-700 placeholder-slate-400 outline-none disabled:opacity-50" />
              <button onClick={() => sendMessage(chatInput)} disabled={!chatInput.trim() || sendLoading || chatLoading || !!chatError}
                className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-200 disabled:opacity-40 disabled:cursor-not-allowed">
                {sendLoading ? <Loader2 size={14} className="text-white animate-spin" /> : <Send size={14} className="text-white" />}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
}