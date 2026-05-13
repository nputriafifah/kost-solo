import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Heart, MessageCircle, Home, Ruler,
  ShieldCheck, ChevronLeft, ChevronRight, X, User, Phone,
  Calendar, MessageSquare, Wifi, Wind, ShowerHead, Car,
  DoorOpen, Clock, UserX, CigaretteOff, VolumeX, FileText,
  LayoutGrid, Send, Loader2, Share2, BadgeCheck, Star,
  Zap, Tv, Coffee, Utensils, Dumbbell, Package, Droplets,
  Thermometer, BookOpen, TreePine, WashingMachine, Lock,
  Bookmark, ChevronRight as ChevRight, Timer,
} from "lucide-react";

/* ── Helpers ──────────────────────────────────────────────────────────────── */
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

const QUICK_REPLIES = [
  { label: "Masih tersedia?", text: "Apakah kamar masih tersedia?" },
  { label: "Mau survey", text: "Boleh survey dulu kak?" },
  { label: "Nego harga?", text: "Apakah bisa nego harga?" },
  { label: "Tanya fasilitas", text: "Fasilitas apa saja yang tersedia?" },
];

const API = "http://localhost:8080";
const getToken = () => localStorage.getItem("token") || "";
const getCurrentUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.id || "";
  } catch { return ""; }
};
const authFetch = (url, opts = {}) =>
  fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(opts.headers || {}),
    },
  });

/* ── AjukanSewa Full Page ─────────────────────────────────────────────────── */
function AjukanSewaPage({ item, onBack, onSubmit }) {
  const today = new Date().toISOString().split("T")[0];
  const [masuk, setMasuk] = useState(today);
  const [durasi, setDurasi] = useState(6);
  const [pesan, setPesan] = useState("");
  const [saved, setSaved] = useState(false);

  const keluar = addMonths(masuk, durasi);
  const gender = genderConfig[item?.gender?.toLowerCase()];

  const handleSubmit = () => {
    onSubmit({ masuk, durasi, keluar, pesan });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 pt-12 pb-4 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
            <ArrowLeft size={17} className="text-slate-700" />
          </button>
          <h1 className="text-[16px] font-bold text-slate-900">Ajukan sewa</h1>
          <button
            onClick={() => setSaved(!saved)}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center"
          >
            <Bookmark size={17} className={saved ? "text-blue-600 fill-blue-600" : "text-slate-500"} />
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Kost info card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 shadow-sm">
          {item?.images?.[0] ? (
            <img src={item.images[0]} alt={item.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <Home size={24} className="text-indigo-300" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-[14px] font-bold text-slate-900 truncate">{item?.name}</h2>
            <p className="text-[12px] text-slate-400 truncate mb-1">
              {item?.location}
              {gender && (
                <span
                  className="ml-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                  style={{ background: gender.bg, color: gender.text, borderColor: gender.border }}
                >
                  {gender.label}
                </span>
              )}
            </p>
            <p className="text-[14px] font-bold text-blue-600">
              Rp {Number(item?.price || 0).toLocaleString("id-ID")}
              <span className="text-[11px] text-slate-400 font-medium"> /bulan</span>
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2">
          {item?.isVerified && (
            <div className="flex items-center gap-1.5 bg-white border border-slate-100 rounded-full px-3 py-1.5 shadow-sm">
              <BadgeCheck size={13} className="text-emerald-500" />
              <span className="text-[11px] font-semibold text-slate-600">Verified</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-white border border-slate-100 rounded-full px-3 py-1.5 shadow-sm">
            <Timer size={13} className="text-blue-500" />
            <span className="text-[11px] font-semibold text-slate-600">Respon ~8 m</span>
          </div>
        </div>

        {/* Section 1: Tanggal & Durasi */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">1</div>
            <h3 className="text-[15px] font-bold text-slate-800">Tanggal masuk & durasi</h3>
          </div>

          {/* Date pickers */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <p className="text-[11px] text-slate-400 font-semibold mb-1.5">Masuk</p>
              <div className="relative">
                <input
                  type="date"
                  value={masuk}
                  onChange={(e) => setMasuk(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 appearance-none"
                />
              </div>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-semibold mb-1.5">Keluar (perkiraan)</p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 flex items-center gap-2">
                <Calendar size={13} className="text-slate-400 flex-shrink-0" />
                <span className="text-[13px] font-semibold text-slate-500">{fmtDate(keluar)}</span>
              </div>
            </div>
          </div>

          {/* Durasi buttons */}
          <div>
            <p className="text-[11px] text-slate-400 font-semibold mb-2">Durasi sewa</p>
            <div className="grid grid-cols-4 gap-2">
              {[3, 6, 12, 24].map((bln) => (
                <button
                  key={bln}
                  onClick={() => setDurasi(bln)}
                  className={`py-2.5 rounded-xl text-[13px] font-bold transition-all active:scale-95 ${durasi === bln
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                >
                  {bln} bln
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Pesan ke pemilik */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">2</div>
            <h3 className="text-[15px] font-bold text-slate-800">Pesan ke pemilik</h3>
          </div>
          <textarea
            rows={4}
            placeholder="Perkenalkan diri kamu dan ceritakan kebutuhan kamu..."
            value={pesan}
            onChange={(e) => setPesan(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[13.5px] text-slate-700 placeholder-slate-400 outline-none resize-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
          />
        </div>

        {/* Info note */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 flex items-start gap-3">
          <ShieldCheck size={15} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-blue-600 leading-relaxed">
            Kamu akan dihubungi pemilik setelah permintaan dikirim. Tidak ada pembayaran di muka.
          </p>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-4"
        style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
        <button
          onClick={handleSubmit}
          className="w-full h-14 rounded-2xl bg-blue-600 text-white font-bold text-[15px] flex items-center justify-center gap-2 active:scale-[0.97] transition-transform shadow-lg shadow-blue-200"
        >
          Kirim permintaan sewa
          <ChevRight size={18} />
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [showSewa, setShowSewa] = useState(false);

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

  useEffect(() => {
    if (showChat) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showChat]);

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
        setItem({
          id: data.id,
          name: data.name || "Tanpa nama",
          location: data.address || "Lokasi tidak tersedia",
          description: data.description || "",
          rules: Array.isArray(data.rules) ? data.rules : data.rules ? [data.rules] : [],
          gender: data.genderType,
          contactNumber: data.contactNumber || data.owner?.phone || "",
          ownerId: data.ownerId || data.owner?.id || "",
          ownerName: data.owner?.name || "Pemilik",
          price: room?.price || 0,
          size: room?.size || "-",
          facilities: room?.facilities || [],
          images: room?.photos?.map((p) => p.url) || [],
          rating: data.rating || 4.8,
          reviewCount: data.reviewCount || 32,
          isVerified: data.isVerified !== false,
          isFeatured: data.isFeatured || false,
          availableRooms: data.availableRooms || 3,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
    window.scrollTo(0, 0);
  }, [id]);

  const openChat = async () => {
    setShowChat(true);
    if (threadId) return;
    setChatLoading(true);
    setChatError(null);
    try {
      const res = await authFetch(`${API}/chats/start`, {
        method: "POST",
        body: JSON.stringify({ listingId: id }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Gagal membuat thread");
      }
      const json = await res.json();
      const thread = json.data || json;
      setThreadId(thread.id);
      await fetchMessages(thread.id);
    } catch (e) {
      console.error(e);
      setChatError("Gagal memuat chat. Pastikan kamu sudah login.");
    } finally {
      setChatLoading(false);
    }
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
    if (showChat && threadId) {
      pollRef.current = setInterval(() => fetchMessages(threadId), 3000);
    }
    return () => clearInterval(pollRef.current);
  }, [showChat, threadId]);

  const sendMessage = async (text) => {
    if (!text.trim() || !threadId || sendLoading) return;
    setSendLoading(true);
    setChatInput("");
    try {
      const res = await authFetch(`${API}/chats/${threadId}/messages`, {
        method: "POST",
        body: JSON.stringify({ message: text.trim() }),
      });
      if (!res.ok) throw new Error("Gagal kirim");
      const json = await res.json();
      const newMsg = json.data || json;
      setMessages((prev) => [...prev, newMsg]);
    } catch (e) { console.error(e); } finally { setSendLoading(false); }
  };

  const handleQuickReply = (q) => { setQuickUsed(true); sendMessage(q.text); };

  const handleSewaSubmit = ({ masuk, durasi, keluar, pesan }) => {
    alert(`Permintaan sewa berhasil dikirim!\nMasuk: ${masuk}\nDurasi: ${durasi} bulan\nKeluar: ${keluar}`);
    setShowSewa(false);
  };

  /* ── If showing sewa page ── */
  if (showSewa && item) {
    return (
      <AjukanSewaPage
        item={item}
        onBack={() => setShowSewa(false)}
        onSubmit={handleSewaSubmit}
      />
    );
  }

  /* ── Loading skeleton ── */
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
        <button onClick={() => navigate(-1)} className="text-sm font-semibold text-blue-600 bg-blue-50 px-6 py-2.5 rounded-full">
          Kembali
        </button>
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

        {/* ── HERO IMAGE ── */}
        <div className="relative h-72 overflow-hidden bg-slate-100">
          <img
            src={images[activeImg]}
            alt={item.name}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />

          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-12 pb-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm"
            >
              <ArrowLeft size={17} className="text-slate-800" />
            </button>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
                <Share2 size={15} className="text-slate-700" />
              </button>
              <button
                onClick={toggleLike}
                className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-all ${isLiked ? "bg-red-500" : "bg-white/90 backdrop-blur-sm"}`}
              >
                <Heart size={15} fill={isLiked ? "white" : "none"} className={isLiked ? "text-white" : "text-slate-700"} />
              </button>
            </div>
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={() => setActiveImg((p) => (p - 1 + images.length) % images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center"
              >
                <ChevronLeft size={16} className="text-slate-700" />
              </button>
              <button
                onClick={() => setActiveImg((p) => (p + 1) % images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center"
              >
                <ChevronRight size={16} className="text-slate-700" />
              </button>
            </>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === activeImg ? "w-5 bg-white" : "w-1.5 bg-white/50"}`}
                />
              ))}
            </div>
          )}

          <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-full">
            {activeImg + 1} / {images.length}
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="px-5 pt-5">

          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {item.isFeatured && (
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-400 text-amber-900 tracking-wide">
                UNGGULAN
              </span>
            )}
            {item.isVerified && (
              <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                <BadgeCheck size={12} />
                Terverifikasi
              </span>
            )}
            {gender && (
              <span
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full border"
                style={{ background: gender.bg, color: gender.text, borderColor: gender.border }}
              >
                {gender.label}
              </span>
            )}
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

          <div
            className="rounded-2xl px-5 py-4 mb-5 flex items-center justify-between"
            style={{ background: "linear-gradient(135deg, #1E40AF 0%, #2563EB 50%, #3B82F6 100%)" }}
          >
            <div>
              <p className="text-[11px] text-blue-200 font-medium mb-0.5">Mulai dari</p>
              <div className="flex items-baseline gap-1">
                <span className="text-[22px] font-bold text-white">
                  Rp {Number(item.price).toLocaleString("id-ID")}
                </span>
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

          {item.description && (
            <div className="mb-6">
              <h2 className="text-[16px] font-bold text-slate-800 mb-3">Tentang hunian ini</h2>
              <p className="text-[13.5px] text-slate-500 leading-relaxed">{item.description}</p>
            </div>
          )}

          {item.facilities.length > 0 && (
            <div className="mb-6">
              <h2 className="text-[16px] font-bold text-slate-800 mb-4">Fasilitas</h2>
              <div className="grid grid-cols-2 gap-3">
                {item.facilities.map((f, i) => {
                  const { Icon, color, bg, labelColor } = getFacilityStyle(f);
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-2xl px-4 py-3.5 border"
                      style={{ background: bg, borderColor: `${color}22` }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${color}18` }}
                      >
                        <Icon size={17} style={{ color }} />
                      </div>
                      <span className="text-[13px] font-semibold leading-tight" style={{ color: labelColor }}>
                        {f}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {item.rules.length > 0 && (
            <div className="mb-6">
              <h2 className="text-[16px] font-bold text-slate-800 mb-4">Peraturan Kost</h2>
              <div className="rounded-2xl border border-slate-100 overflow-hidden bg-white divide-y divide-slate-50">
                {item.rules.map((r, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3.5">
                    <div className="w-7 h-7 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5 text-red-400">
                      {ruleIcon(r)}
                    </div>
                    <span className="text-[13px] text-slate-600 leading-relaxed pt-0.5">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 mb-2 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {item.ownerName?.[0]?.toUpperCase() || "P"}
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-slate-800">{item.ownerName}</p>
              <p className="text-[12px] text-slate-400">Pemilik Kost</p>
            </div>
            <button
              onClick={() => window.open(`https://wa.me/${formatPhone(item.contactNumber)}`, "_blank")}
              className="text-[12px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl"
            >
              Hubungi
            </button>
          </div>
        </div>
      </div>

      {/* ── CTA BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 px-4 py-3 pb-safe">
        <div className="flex items-center gap-2.5 max-w-xl mx-auto">
          <button
            onClick={toggleLike}
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 transition-colors ${isLiked ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}
          >
            <Heart size={18} fill={isLiked ? "#EF4444" : "none"} className={isLiked ? "text-red-500" : "text-slate-500"} />
          </button>

          <button
            onClick={openChat}
            className="w-12 h-12 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center flex-shrink-0"
          >
            <MessageCircle size={18} className="text-slate-500" />
          </button>

          <button
            onClick={() => setShowSewa(true)}
            className="flex-1 h-12 rounded-2xl bg-blue-600 text-white font-semibold text-[14px] active:scale-[0.97] transition-transform shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
          >
            <Calendar size={16} />
            Ajukan sewa
          </button>
        </div>
      </div>

      {/* ── CHAT MODAL ── */}
      {showChat && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center"
          onClick={(e) => e.target === e.currentTarget && setShowChat(false)}
        >
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

            {chatError && (
              <div className="bg-red-50 border border-red-100 text-red-500 text-[13px] rounded-2xl px-4 py-3 mb-3">
                {chatError}
              </div>
            )}

            <div className="h-52 overflow-y-auto flex flex-col gap-2.5 mb-3 px-0.5">
              {chatLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 size={22} className="text-slate-300 animate-spin" />
                </div>
              ) : messages.length === 0 && !chatError ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-[13px] text-slate-400">Belum ada pesan. Mulai percakapan! 👋</p>
                </div>
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
                        <div
                          className={`px-3.5 py-2.5 text-[13px] leading-snug ${isMe
                            ? "bg-blue-600 text-white rounded-[18px_18px_4px_18px]"
                            : "bg-slate-100 text-slate-700 rounded-[4px_18px_18px_18px]"}`}
                          style={{ maxWidth: "72%" }}
                        >
                          {msg.message}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 px-1">
                          {msg.sentAt ? fmtTime(msg.sentAt) : ""}
                        </p>
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
                  <button
                    key={q.label}
                    onClick={() => handleQuickReply(q)}
                    className="text-[12px] font-semibold px-3 py-1.5 rounded-full border border-blue-100 bg-blue-50 text-blue-600"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5">
              <input
                type="text"
                placeholder="Ketik pesan..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) sendMessage(chatInput); }}
                disabled={chatLoading || !!chatError}
                className="flex-1 bg-transparent text-[14px] text-slate-700 placeholder-slate-400 outline-none disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage(chatInput)}
                disabled={!chatInput.trim() || sendLoading || chatLoading || !!chatError}
                className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sendLoading
                  ? <Loader2 size={14} className="text-white animate-spin" />
                  : <Send size={14} className="text-white" />
                }
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}