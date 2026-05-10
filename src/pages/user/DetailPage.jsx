import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Heart, MessageCircle, Home, Ruler,
  ShieldCheck, ChevronLeft, ChevronRight, X, User, Phone,
  Calendar, MessageSquare, Wifi, Wind, ShowerHead, Car,
  DoorOpen, Clock, UserX, CigaretteOff, VolumeX, FileText,
  LayoutGrid, Send, Loader2,
} from "lucide-react";

/* ── Helpers ──────────────────────────────────────────────────────────────── */

const facilityIcon = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("wifi") || n.includes("internet")) return <Wifi size={13} />;
  if (n.includes("ac") || n.includes("kipas")) return <Wind size={13} />;
  if (n.includes("mandi") || n.includes("shower")) return <ShowerHead size={13} />;
  if (n.includes("parkir") || n.includes("motor") || n.includes("mobil")) return <Car size={13} />;
  return null;
};

const ruleIcon = (rule = "") => {
  const r = rule.toLowerCase();
  if (r.includes("jam") || r.includes("malam")) return <Clock size={13} />;
  if (r.includes("tamu") || r.includes("lawan jenis")) return <UserX size={13} />;
  if (r.includes("rokok") || r.includes("merokok")) return <CigaretteOff size={13} />;
  if (r.includes("bising") || r.includes("musik")) return <VolumeX size={13} />;
  return <ShieldCheck size={13} />;
};

const genderConfig = {
  putra: { label: "Putra", bg: "#E6F1FB", text: "#0C447C", border: "#B5D4F4" },
  putri: { label: "Putri", bg: "#FBEAF0", text: "#72243E", border: "#F4C0D1" },
  campur: { label: "Campur", bg: "#EAF3DE", text: "#27500A", border: "#C0DD97" },
};

const formatPhone = (num) => {
  if (!num) return "";
  return num.startsWith("0") ? "62" + num.slice(1) : num;
};

const fmtTime = (iso) => {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, "0")}.${d.getMinutes().toString().padStart(2, "0")}`;
};

const QUICK_REPLIES = [
  { label: "Masih tersedia?", text: "Apakah kamar masih tersedia?" },
  { label: "Mau survey", text: "Boleh survey dulu kak?" },
  { label: "Nego harga?", text: "Apakah bisa nego harga?" },
  { label: "Tanya fasilitas", text: "Fasilitas apa saja yang tersedia?" },
];

/* ── API config ───────────────────────────────────────────────────────────── */

const API = "http://localhost:8080";

const getToken = () => localStorage.getItem("token") || "";

// Baca userId dari key "user" di localStorage (format: { id, name, email, role })
const getCurrentUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.id || "";
  } catch {
    return "";
  }
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

/* ══════════════════════════════════════════════════════════════════════════ */
export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  /* ── Listing state ── */
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  /* ── Interest modal ── */
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", moveInDate: "", message: "" });

  /* ── Chat state ── */
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

  /* ── Auto-scroll ── */
  useEffect(() => {
    if (showChat) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showChat]);

  /* ── Favorites ── */
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

  /* ── Fetch listing ── */
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

  /* ── Chat: buka thread ── */
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

  /* ── Chat: fetch pesan via GET /chats/:threadId ── */
  const fetchMessages = async (tid) => {
    try {
      const res = await authFetch(`${API}/chats/${tid}`);
      if (!res.ok) return;
      const json = await res.json();
      const thread = json.data || json;
      // BE return { ...thread, messages: [...] }
      setMessages(Array.isArray(thread.messages) ? thread.messages : []);
    } catch (e) {
      console.error(e);
    }
  };

  /* ── Polling setiap 3 detik saat chat terbuka ── */
  useEffect(() => {
    if (showChat && threadId) {
      pollRef.current = setInterval(() => fetchMessages(threadId), 3000);
    }
    return () => clearInterval(pollRef.current);
  }, [showChat, threadId]);

  /* ── Kirim pesan ── */
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
    } catch (e) {
      console.error(e);
    } finally {
      setSendLoading(false);
    }
  };

  const handleQuickReply = (q) => {
    setQuickUsed(true);
    sendMessage(q.text);
  };

  /* ── Interest form ── */
  const handleSubmit = () => {
    alert("Minat berhasil dikirim! Pemilik akan segera menghubungi Anda.");
    setShowModal(false);
    setForm({ name: "", phone: "", moveInDate: "", message: "" });
  };

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="h-64 bg-slate-200 animate-pulse rounded-b-3xl" />
        <div className="px-4 py-5 space-y-3">
          <div className="h-6 bg-slate-200 animate-pulse rounded-xl w-3/4" />
          <div className="h-4 bg-slate-200 animate-pulse rounded-xl w-1/2" />
          <div className="h-16 bg-slate-200 animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Home size={28} className="text-slate-300" />
        </div>
        <p className="text-sm font-medium text-slate-500">Data tidak ditemukan</p>
        <button onClick={() => navigate(-1)} className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-5 py-2.5 rounded-full">
          Kembali
        </button>
      </div>
    );
  }

  const images = item.images.length > 0
    ? item.images
    : ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600"];

  const gender = genderConfig[item.gender?.toLowerCase()];

  /* ════════════════════════════════════════════════════════════════════════ */
  return (
    <>
      <div className="min-h-screen bg-slate-50 pb-36">

        {/* ── HERO IMAGE ── */}
        <div className="relative h-64 overflow-hidden rounded-b-3xl">
          <img src={images[activeImg]} alt={item.name} className="w-full h-full object-cover transition-all duration-300" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20 rounded-b-3xl" />

          <button onClick={() => navigate(-1)} className="absolute top-5 left-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm active:scale-95 transition-transform">
            <ArrowLeft size={17} className="text-slate-700" />
          </button>

          <button onClick={toggleLike} className={`absolute top-5 right-4 w-9 h-9 rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-all ${isLiked ? "bg-red-500" : "bg-white/90 backdrop-blur-sm"}`}>
            <Heart size={16} fill={isLiked ? "white" : "none"} className={isLiked ? "text-white" : "text-slate-600"} />
          </button>

          {images.length > 1 && (
            <>
              <button onClick={() => setActiveImg((p) => (p - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center active:scale-95">
                <ChevronLeft size={16} className="text-slate-700" />
              </button>
              <button onClick={() => setActiveImg((p) => (p + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center active:scale-95">
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

          <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-full">
            {activeImg + 1} / {images.length}
          </div>

          <div className="absolute bottom-10 left-4 right-14">
            <h1 className="text-[17px] font-bold text-white leading-tight drop-shadow">{item.name}</h1>
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={11} className="text-white/70 flex-shrink-0" />
              <span className="text-[11px] text-white/80 truncate">{item.location}</span>
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="px-4 pt-4 space-y-5">

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-blue-600">Rp {Number(item.price).toLocaleString("id-ID")}</span>
              <span className="text-xs text-slate-400 font-medium">/bulan</span>
            </div>
            {gender && (
              <span className="text-[11px] font-semibold px-3 py-1.5 rounded-full" style={{ background: gender.bg, color: gender.text, border: `1px solid ${gender.border}` }}>
                {gender.label}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {[
              { icon: <Ruler size={15} className="text-blue-500" />, label: "Luas", value: item.size },
              { icon: <Home size={15} className="text-blue-500" />, label: "Tipe", value: gender?.label || "Umum" },
              { icon: <DoorOpen size={15} className="text-blue-500" />, label: "Kamar", value: "Tersedia" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-3 flex flex-col gap-1.5">
                <div className="w-7 h-7 rounded-xl bg-blue-50 flex items-center justify-center">{s.icon}</div>
                <p className="text-[10px] text-slate-400 leading-none">{s.label}</p>
                <p className="text-xs font-semibold text-slate-700">{s.value}</p>
              </div>
            ))}
          </div>

          {item.description && (
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center"><FileText size={13} className="text-blue-500" /></div>
                <h3 className="text-sm font-semibold text-slate-700">Deskripsi</h3>
              </div>
              <p className="text-[13px] text-slate-500 leading-relaxed">{item.description}</p>
            </div>
          )}

          {item.facilities.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center"><LayoutGrid size={13} className="text-blue-500" /></div>
                <h3 className="text-sm font-semibold text-slate-700">Fasilitas</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.facilities.map((f, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-[12px] font-medium bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-full">
                    {facilityIcon(f)}{f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {item.rules.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center"><ShieldCheck size={13} className="text-blue-500" /></div>
                <h3 className="text-sm font-semibold text-slate-700">Peraturan</h3>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-50">
                {item.rules.map((r, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3">
                    <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-500">{ruleIcon(r)}</span>
                    </div>
                    <span className="text-[13px] text-slate-500 leading-relaxed">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── CTA BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 px-4 py-3 pb-safe">
        <div className="flex gap-2 max-w-xl mx-auto">
          <button onClick={() => setShowModal(true)} className="flex-1 h-12 rounded-2xl border border-blue-100 bg-blue-50 text-blue-600 font-semibold text-[13px] active:scale-[0.97] transition-transform">
            Saya Minat
          </button>

          <button onClick={openChat} className="flex-1 h-12 rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600 font-semibold text-[13px] active:scale-[0.97] transition-transform flex items-center justify-center gap-1.5">
            <MessageSquare size={14} />
            Tanya Pemilik
          </button>

          <button
            onClick={() => window.open(`https://wa.me/${formatPhone(item.contactNumber)}?text=${encodeURIComponent(`Halo, saya tertarik dengan kost ${item.name}`)}`, "_blank")}
            className="flex-[1.2] h-12 rounded-2xl bg-blue-600 text-white font-semibold text-[13px] active:scale-[0.97] transition-transform shadow-md shadow-blue-200 flex items-center justify-center gap-2"
          >
            <MessageCircle size={16} />
            Hubungi
          </button>
        </div>
      </div>

      {/* ── INTEREST MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white w-full max-w-lg rounded-t-3xl px-5 pt-3 pb-8 animate-[slideUp_0.3s_ease]">
            <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-5" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800">Form Minat Kost</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center active:scale-95">
                <X size={16} className="text-slate-500" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
                <User size={15} className="text-slate-400 flex-shrink-0" />
                <input type="text" placeholder="Nama lengkap" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none" />
              </div>
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
                <Phone size={15} className="text-slate-400 flex-shrink-0" />
                <input type="tel" placeholder="Nomor WhatsApp" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none" />
              </div>
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
                <Calendar size={15} className="text-slate-400 flex-shrink-0" />
                <input type="date" value={form.moveInDate} onChange={(e) => setForm({ ...form, moveInDate: e.target.value })} className="flex-1 bg-transparent text-sm text-slate-700 outline-none" />
              </div>
              <div className="flex gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
                <MessageSquare size={15} className="text-slate-400 flex-shrink-0 mt-0.5" />
                <textarea rows={3} placeholder="Pesan tambahan..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none resize-none" />
              </div>
              <button onClick={handleSubmit} className="w-full h-12 rounded-2xl bg-blue-600 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-transform shadow-md shadow-blue-200">
                <Send size={16} />
                Kirim Minat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CHAT MODAL ── */}
      {showChat && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center" onClick={(e) => e.target === e.currentTarget && setShowChat(false)}>
          <div className="bg-white w-full max-w-lg rounded-t-3xl px-5 pt-3 pb-6 animate-[slideUp_0.3s_ease]">

            <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-4" />

            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-800">Tanya Pemilik</h3>
              <button onClick={() => setShowChat(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center active:scale-95">
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            {/* Owner card */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 mb-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                {item.ownerName?.[0]?.toUpperCase() || "P"}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">{item.ownerName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  <span className="text-[11px] text-slate-400">Pemilik Kost</span>
                </div>
              </div>
            </div>

            {/* Error */}
            {chatError && (
              <div className="bg-red-50 border border-red-100 text-red-500 text-xs rounded-2xl px-4 py-3 mb-3">
                {chatError}
              </div>
            )}

            {/* Chat area */}
            <div className="h-52 overflow-y-auto flex flex-col gap-2.5 mb-3 px-0.5">
              {chatLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 size={22} className="text-slate-300 animate-spin" />
                </div>
              ) : messages.length === 0 && !chatError ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-xs text-slate-400">Belum ada pesan. Mulai percakapan! 👋</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.senderId === myId;
                  return (
                    <div key={msg.id || i} className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                      {/* Avatar hanya untuk pesan owner (bukan saya) */}
                      {!isMe && (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {item.ownerName?.[0]?.toUpperCase() || "P"}
                        </div>
                      )}
                      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        <div
                          className={`px-3.5 py-2.5 text-[13px] leading-snug ${isMe
                              ? "bg-blue-600 text-white rounded-[18px_18px_4px_18px]"
                              : "bg-slate-100 text-slate-700 rounded-[4px_18px_18px_18px]"
                            }`}
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

            {/* Quick replies */}
            {!quickUsed && !chatLoading && !chatError && (
              <div className="flex gap-2 flex-wrap mb-3">
                {QUICK_REPLIES.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => handleQuickReply(q)}
                    className="text-[12px] font-medium px-3 py-1.5 rounded-full border border-blue-100 bg-blue-50 text-blue-600 active:scale-95 transition-transform"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5">
              <input
                type="text"
                placeholder="Ketik pesan..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) sendMessage(chatInput); }}
                disabled={chatLoading || !!chatError}
                className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage(chatInput)}
                disabled={!chatInput.trim() || sendLoading || chatLoading || !!chatError}
                className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform shadow-sm shadow-blue-200 disabled:opacity-40 disabled:cursor-not-allowed"
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