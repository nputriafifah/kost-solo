import React, { useState, useEffect, useRef } from "react";
import {
  User, Mail, Phone, ChevronRight, Settings,
  Bell, Shield, HelpCircle, X, Check, Camera,
  MapPin, Map as MapIcon, Globe, Navigation,
  Home, Map, Heart, MessageCircle, Search,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { getApiBase } from "../../config/apiBase";
import UserNavbar, { USER_NAVBAR_CSS } from "../../components/user/UserNavbar";
import { useUserNavBadges } from "../../hooks/useUserNavBadges";

const API = getApiBase();

function authHeaders(token) {
  const h = { "Content-Type": "application/json" };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

function normalizeProfile(parsed) {
  if (!parsed || typeof parsed !== "object") {
    return { name: "", email: "", phone: "", province: "", city: "", district: "", address: "" };
  }
  return {
    id: parsed.id,
    role: parsed.role,
    name: parsed.name || "",
    email: parsed.email || "",
    phone: parsed.phone || "",
    province: parsed.province || "",
    city: parsed.city || "",
    district: parsed.district || "",
    address: parsed.address || "",
  };
}

// ─── INDONESIA REGION DATA ────────────────────────────────────────────────────
const PROVINCES = [
  "Aceh", "Bali", "Banten", "Bengkulu", "DI Yogyakarta", "DKI Jakarta",
  "Gorontalo", "Jambi", "Jawa Barat", "Jawa Tengah", "Jawa Timur",
  "Kalimantan Barat", "Kalimantan Selatan", "Kalimantan Tengah",
  "Kalimantan Timur", "Kalimantan Utara", "Kepulauan Bangka Belitung",
  "Kepulauan Riau", "Lampung", "Maluku", "Maluku Utara",
  "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Papua", "Papua Barat",
  "Papua Barat Daya", "Papua Pegunungan", "Papua Selatan", "Papua Tengah",
  "Riau", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tengah",
  "Sulawesi Tenggara", "Sulawesi Utara", "Sumatera Barat", "Sumatera Selatan",
  "Sumatera Utara"
];

const CITIES = {
  "Aceh": ["Kab. Aceh Barat", "Kab. Aceh Besar", "Kab. Aceh Jaya", "Kab. Aceh Selatan", "Kab. Aceh Tengah", "Kab. Aceh Tenggara", "Kab. Aceh Timur", "Kab. Aceh Utara", "Kab. Bener Meriah", "Kab. Bireuen", "Kota Banda Aceh", "Kota Langsa", "Kota Lhokseumawe", "Kota Sabang"],
  "Bali": ["Kab. Badung", "Kab. Bangli", "Kab. Buleleng", "Kab. Gianyar", "Kab. Jembrana", "Kab. Karangasem", "Kab. Klungkung", "Kab. Tabanan", "Kota Denpasar"],
  "Banten": ["Kab. Lebak", "Kab. Pandeglang", "Kab. Serang", "Kab. Tangerang", "Kota Cilegon", "Kota Serang", "Kota Tangerang", "Kota Tangerang Selatan"],
  "Bengkulu": ["Kab. Bengkulu Selatan", "Kab. Bengkulu Tengah", "Kab. Bengkulu Utara", "Kab. Kaur", "Kab. Kepahiang", "Kab. Lebong", "Kab. Rejang Lebong", "Kota Bengkulu"],
  "DI Yogyakarta": ["Kab. Bantul", "Kab. Gunungkidul", "Kab. Kulon Progo", "Kab. Sleman", "Kota Yogyakarta"],
  "DKI Jakarta": ["Kab. Kepulauan Seribu", "Kota Jakarta Barat", "Kota Jakarta Pusat", "Kota Jakarta Selatan", "Kota Jakarta Timur", "Kota Jakarta Utara"],
  "Gorontalo": ["Kab. Boalemo", "Kab. Bone Bolango", "Kab. Gorontalo", "Kab. Gorontalo Utara", "Kab. Pohuwato", "Kota Gorontalo"],
  "Jambi": ["Kab. Batanghari", "Kab. Bungo", "Kab. Kerinci", "Kab. Merangin", "Kab. Muaro Jambi", "Kab. Sarolangun", "Kab. Tanjung Jabung Barat", "Kab. Tanjung Jabung Timur", "Kab. Tebo", "Kota Jambi", "Kota Sungai Penuh"],
  "Jawa Barat": ["Kab. Bandung", "Kab. Bandung Barat", "Kab. Bekasi", "Kab. Bogor", "Kab. Ciamis", "Kab. Cianjur", "Kab. Cirebon", "Kab. Garut", "Kab. Indramayu", "Kab. Karawang", "Kab. Kuningan", "Kab. Majalengka", "Kab. Pangandaran", "Kab. Purwakarta", "Kab. Subang", "Kab. Sukabumi", "Kab. Sumedang", "Kab. Tasikmalaya", "Kota Bandung", "Kota Banjar", "Kota Bekasi", "Kota Bogor", "Kota Cimahi", "Kota Cirebon", "Kota Depok", "Kota Sukabumi", "Kota Tasikmalaya"],
  "Jawa Tengah": ["Kab. Banjarnegara", "Kab. Banyumas", "Kab. Batang", "Kab. Blora", "Kab. Boyolali", "Kab. Brebes", "Kab. Cilacap", "Kab. Demak", "Kab. Grobogan", "Kab. Jepara", "Kab. Karanganyar", "Kab. Kebumen", "Kab. Kendal", "Kab. Klaten", "Kab. Kudus", "Kab. Magelang", "Kab. Pati", "Kab. Pekalongan", "Kab. Pemalang", "Kab. Purbalingga", "Kab. Purworejo", "Kab. Rembang", "Kab. Semarang", "Kab. Sragen", "Kab. Sukoharjo", "Kab. Tegal", "Kab. Temanggung", "Kab. Wonogiri", "Kab. Wonosobo", "Kota Magelang", "Kota Pekalongan", "Kota Salatiga", "Kota Semarang", "Kota Surakarta", "Kota Tegal"],
  "Jawa Timur": ["Kab. Bangkalan", "Kab. Banyuwangi", "Kab. Blitar", "Kab. Bojonegoro", "Kab. Bondowoso", "Kab. Gresik", "Kab. Jember", "Kab. Jombang", "Kab. Kediri", "Kab. Lamongan", "Kab. Lumajang", "Kab. Madiun", "Kab. Magetan", "Kab. Malang", "Kab. Mojokerto", "Kab. Nganjuk", "Kab. Ngawi", "Kab. Pacitan", "Kab. Pamekasan", "Kab. Pasuruan", "Kab. Ponorogo", "Kab. Probolinggo", "Kab. Sampang", "Kab. Sidoarjo", "Kab. Situbondo", "Kab. Sumenep", "Kab. Trenggalek", "Kab. Tuban", "Kab. Tulungagung", "Kota Batu", "Kota Blitar", "Kota Kediri", "Kota Madiun", "Kota Malang", "Kota Mojokerto", "Kota Pasuruan", "Kota Probolinggo", "Kota Surabaya"],
  "Kalimantan Timur": ["Kab. Berau", "Kab. Kutai Barat", "Kab. Kutai Kartanegara", "Kab. Kutai Timur", "Kab. Mahakam Ulu", "Kab. Paser", "Kab. Penajam Paser Utara", "Kota Balikpapan", "Kota Bontang", "Kota Samarinda"],
  "Riau": ["Kab. Bengkalis", "Kab. Indragiri Hilir", "Kab. Indragiri Hulu", "Kab. Kampar", "Kab. Kepulauan Meranti", "Kab. Kuantan Singingi", "Kab. Pelalawan", "Kab. Rokan Hilir", "Kab. Rokan Hulu", "Kab. Siak", "Kota Dumai", "Kota Pekanbaru"],
  "Sulawesi Selatan": ["Kab. Bantaeng", "Kab. Barru", "Kab. Bone", "Kab. Bulukumba", "Kab. Enrekang", "Kab. Gowa", "Kab. Jeneponto", "Kab. Luwu", "Kab. Luwu Timur", "Kab. Luwu Utara", "Kab. Maros", "Kab. Pangkajene Kepulauan", "Kab. Pinrang", "Kab. Sinjai", "Kab. Soppeng", "Kab. Takalar", "Kab. Tana Toraja", "Kab. Toraja Utara", "Kab. Wajo", "Kota Makassar", "Kota Palopo", "Kota Parepare"],
  "Sumatera Utara": ["Kab. Asahan", "Kab. Batu Bara", "Kab. Dairi", "Kab. Deli Serdang", "Kab. Karo", "Kab. Labuhanbatu", "Kab. Langkat", "Kab. Mandailing Natal", "Kab. Nias", "Kab. Simalungun", "Kab. Tapanuli Selatan", "Kab. Tapanuli Tengah", "Kab. Tapanuli Utara", "Kab. Toba", "Kota Binjai", "Kota Gunungsitoli", "Kota Medan", "Kota Padang Sidempuan", "Kota Pematang Siantar", "Kota Sibolga", "Kota Tanjung Balai", "Kota Tebing Tinggi"],
  "Lampung": ["Kab. Lampung Barat", "Kab. Lampung Selatan", "Kab. Lampung Tengah", "Kab. Lampung Timur", "Kab. Lampung Utara", "Kab. Mesuji", "Kab. Pesawaran", "Kab. Pesisir Barat", "Kab. Pringsewu", "Kab. Tanggamus", "Kab. Tulang Bawang", "Kab. Tulang Bawang Barat", "Kab. Way Kanan", "Kota Bandar Lampung", "Kota Metro"],
  "Nusa Tenggara Barat": ["Kab. Bima", "Kab. Dompu", "Kab. Lombok Barat", "Kab. Lombok Tengah", "Kab. Lombok Timur", "Kab. Lombok Utara", "Kab. Sumbawa", "Kab. Sumbawa Barat", "Kota Bima", "Kota Mataram"],
  "Sulawesi Utara": ["Kab. Bolaang Mongondow", "Kab. Kepulauan Sangihe", "Kab. Kepulauan Talaud", "Kab. Minahasa", "Kab. Minahasa Selatan", "Kab. Minahasa Tenggara", "Kab. Minahasa Utara", "Kota Bitung", "Kota Kotamobagu", "Kota Manado", "Kota Tomohon"],
  "Kalimantan Selatan": ["Kab. Balangan", "Kab. Banjar", "Kab. Barito Kuala", "Kab. Hulu Sungai Selatan", "Kab. Hulu Sungai Tengah", "Kab. Hulu Sungai Utara", "Kab. Kotabaru", "Kab. Tabalong", "Kab. Tanah Bumbu", "Kab. Tanah Laut", "Kab. Tapin", "Kota Banjarbaru", "Kota Banjarmasin"],
  "Sumatera Barat": ["Kab. Agam", "Kab. Dharmasraya", "Kab. Kepulauan Mentawai", "Kab. Lima Puluh Kota", "Kab. Padang Pariaman", "Kab. Pasaman", "Kab. Pasaman Barat", "Kab. Pesisir Selatan", "Kab. Sijunjung", "Kab. Solok", "Kab. Solok Selatan", "Kab. Tanah Datar", "Kota Bukittinggi", "Kota Padang", "Kota Padang Panjang", "Kota Pariaman", "Kota Payakumbuh", "Kota Sawahlunto", "Kota Solok"],
};

const menuItems = [
  { icon: Settings,   label: "Pengaturan Akun",    sub: "Kelola informasi & keamanan",  color: "#2563EB", bg: "#EFF6FF",  darkBg: "#1e3a8a22", path: "/settings/account" },
  { icon: Bell,       label: "Notifikasi",          sub: "Atur preferensi notifikasi",   color: "#D97706", bg: "#FFFBEB",  darkBg: "#92400e22", path: "/settings/notifications", showBadge: true },
  { icon: Shield,     label: "Privasi & Keamanan",  sub: "Jaga keamanan akunmu",         color: "#059669", bg: "#ECFDF5",  darkBg: "#06503622", path: "/settings/privacy" },
  { icon: HelpCircle, label: "Bantuan & FAQ",       sub: "Butuh bantuan? Kami siap",     color: "#7C3AED", bg: "#F5F3FF",  darkBg: "#4c1d9522", path: "/settings/faq" },
];

const NAV_ITEMS = [
  { label: "Home",    path: "/",       icon: Home,          mobile: true,  guestMobile: true  },
  { label: "Search",  path: "/search", icon: Search,        mobile: true,  guestMobile: true  },
  { label: "My List", path: "/like",   icon: Heart,         mobile: true,  guestMobile: false },
  { label: "Profil",  path: "/profil", icon: User,          mobile: true,  guestMobile: false },
];

const MOBILE_NAV   = NAV_ITEMS.filter((n) => n.mobile);
const GUEST_MOBILE = NAV_ITEMS.filter((n) => n.guestMobile);

// ─── INPUT GROUP ───────────────────────────────────────────────────────────────
function InputGroup({ label, icon, value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#64748B", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.08em" }}>{label}</label>
      <div style={{ position:"relative" }}>
        <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#94A3B8", display:"flex" }}>{icon}</span>
        <input
          style={{ width:"100%", height:48, paddingLeft:44, paddingRight:16, background:"#F8FAFC", border:`1.5px solid ${focused ? "#2563EB" : "#E2E8F0"}`, borderRadius:14, fontSize:14, color:"#0F172A", outline:"none", boxSizing:"border-box", transition:"border-color 0.2s", fontFamily:"'DM Sans', sans-serif" }}
          value={value} onChange={onChange} placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
    </div>
  );
}

// ─── SELECT GROUP ─────────────────────────────────────────────────────────────
function SelectGroup({ label, icon, options, value, onChange, disabled, placeholder }) {
  return (
    <div style={{ opacity: disabled ? 0.45 : 1, transition:"opacity 0.2s" }}>
      <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#64748B", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.08em" }}>{label}</label>
      <div style={{ position:"relative" }}>
        <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#94A3B8", display:"flex", zIndex:1 }}>{icon}</span>
        <select disabled={disabled}
          style={{ width:"100%", height:48, paddingLeft:44, paddingRight:40, background:"#F8FAFC", border:"1.5px solid #E2E8F0", borderRadius:14, fontSize:14, color: value ? "#0F172A" : "#94A3B8", outline:"none", appearance:"none", boxSizing:"border-box", cursor: disabled ? "not-allowed" : "pointer", fontFamily:"'DM Sans', sans-serif" }}
          value={value} onChange={onChange}
        >
          <option value="">{placeholder || `Pilih ${label}`}</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <ChevronRight size={14} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%) rotate(90deg)", color:"#94A3B8", pointerEvents:"none" }} />
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ProfilPage() {
  const navigate     = useNavigate();
  const location     = useLocation();
  const fileInputRef = useRef(null);
  const currentPath  = location.pathname;

  const [userData,          setUserData]         = useState({ name:"", email:"", province:"", city:"", district:"", address:"" });
  const [isEditing,         setIsEditing]         = useState(false);
  const [editForm,          setEditForm]          = useState({ name:"", email:"", province:"", city:"", district:"", address:"" });
  const [photoUrl,          setPhotoUrl]          = useState(null);
  const [isSaving,          setIsSaving]          = useState(false);
  const [saveSuccess,       setSaveSuccess]       = useState(false);
  const [stats,             setStats]             = useState({ favorites: 0, chats: 0 });

  const navBadges  = useUserNavBadges();
  const { unreadCount, unreadChat } = navBadges;

  const user       = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = !!user;
  const token      = localStorage.getItem("token");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const profile = normalizeProfile(JSON.parse(savedUser));
        setUserData(profile);
        setEditForm(profile);
      } catch { /* ignore */ }
    }
    const savedPhoto = localStorage.getItem("atap_profile_photo");
    if (savedPhoto) setPhotoUrl(savedPhoto);

  }, []);

  useEffect(() => {
    if (!isLoggedIn || !token) return;

    const fetchActivity = async () => {
      try {
        const [favRes, chatRes] = await Promise.all([
          fetch(`${API}/favorites`, { headers: authHeaders(token) }),
          fetch(`${API}/chats`, { headers: authHeaders(token) }),
        ]);

        if (favRes.ok) {
          const favJson = await favRes.json();
          const favList = Array.isArray(favJson.data) ? favJson.data : [];
          setStats((s) => ({ ...s, favorites: favList.length }));
        }

        if (chatRes.ok) {
          const chatJson = await chatRes.json();
          const raw = Array.isArray(chatJson.data) ? chatJson.data : [];
          setStats((s) => ({ ...s, chats: raw.length }));
        }
      } catch { /* ignore */ }
    };

    fetchActivity();
    const interval = setInterval(fetchActivity, 30_000);
    return () => clearInterval(interval);
  }, [isLoggedIn, token, user?.id]);

  const handleSaveProfile = () => {
    setIsSaving(true);
    const updated = normalizeProfile({
      ...user,
      ...userData,
      name: editForm.name.trim(),
      email: editForm.email.trim(),
      phone: editForm.phone?.trim() || userData.phone || "",
      province: editForm.province,
      city: editForm.city,
      district: editForm.district.trim(),
      address: editForm.address.trim(),
    });
    localStorage.setItem("user", JSON.stringify(updated));
    setUserData(updated);
    setEditForm(updated);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => { setSaveSuccess(false); setIsEditing(false); }, 1000);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file || file.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoUrl(ev.target.result);
      localStorage.setItem("atap_profile_photo", ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const initials   = navBadges.initials || userData.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";
  const cityOptions = CITIES[editForm.province] || [];

  const bg        = "#F1F5F9";
  const cardBg    = "#FFFFFF";
  const cardBg2   = "#FFFFFF";
  const textPri   = "#0F172A";
  const textSec   = "#64748B";
  const textMuted = "#94A3B8";
  const border    = "#F1F5F9";
  const inputBg   = "#F8FAFC";
  const bnBg      = "rgba(255,255,255,.97)";
  const bnBorder  = "#E2E8F0";

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;700&display=swap');
    @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
    @keyframes spin { to { transform: rotate(360deg); } }

    .profil-bottom-nav { display: none; }
    .profil-bn-avatar-wrap { position:relative; display:inline-flex; }
    .profil-bn-notif-dot { position:absolute; top:-2px; right:-2px; width:7px; height:7px; background:#EF4444; border-radius:50%; border:1.5px solid ${cardBg}; }
    .profil-bn-icon-wrap { position:relative; display:inline-flex; }
    .profil-bn-chat-badge { position:absolute; top:-4px; right:-6px; min-width:14px; height:14px; background:#EF4444; border-radius:999px; border:1.5px solid ${cardBg}; display:flex; align-items:center; justify-content:center; font-size:8px; font-weight:800; color:white; padding:0 3px; line-height:1; pointer-events:none; }

    .profil-menu-btn { display:flex; align-items:center; gap:14px; padding:16px 18px; background:${cardBg2}; border:1.5px solid ${border}; border-radius:20px; cursor:pointer; text-align:left; transition:border-color 0.2s, box-shadow 0.2s, background 0.2s; box-shadow: 0 2px 8px rgba(15,23,42,0.04); width:100%; }

    @media(max-width: 640px) {
      .profil-bottom-nav {
        display: flex;
        position: fixed; bottom: 0; left: 0; right: 0; z-index: 300;
        background: ${bnBg}; backdrop-filter: blur(20px);
        border-top: 1px solid ${bnBorder};
        padding: 6px 0 calc(6px + env(safe-area-inset-bottom));
        justify-content: space-around; align-items: center;
        box-shadow: 0 -4px 20px rgba(0,0,0,.07);
        font-family: 'DM Sans', sans-serif;
      }
      .profil-bn-item {
        display: flex; flex-direction: column; align-items: center; gap: 3px;
        padding: 6px 10px; border: none; background: none; border-radius: 12px;
        cursor: pointer; color: ${textMuted}; transition: color .15s;
        min-width: 52px; font-family: 'DM Sans', sans-serif;
      }
      .profil-bn-item.active { color: #2563EB; }
      .profil-bn-item span { font-size: 10px; font-weight: 700; letter-spacing: .1px; }
      .profil-bn-item.active::after { content:''; display:block; width:4px; height:4px; background:#2563EB; border-radius:50%; margin-top:1px; }
      .profil-bn-avatar { width:24px; height:24px; border-radius:50%; background:#DBEAFE; color:#1D4ED8; font-size:8px; font-weight:800; display:flex; align-items:center; justify-content:center; border:2px solid #BFDBFE; font-family:'DM Sans',sans-serif; }
      .profil-bn-item.active .profil-bn-avatar { background:#BFDBFE; border-color:#2563EB; }
    }
  `;

  return (
    <>
      <style>{USER_NAVBAR_CSS}</style>
      <style>{css}</style>
      <div style={{ minHeight:"100vh", background: bg, paddingBottom:80, fontFamily:"'DM Sans', sans-serif", transition:"background 0.3s" }}>

        <UserNavbar badges={navBadges} activePath={currentPath} />

        {/* ── HERO HEADER ── */}
        <div style={{
          background:"linear-gradient(135deg, #1D4ED8 0%, #1E40AF 50%, #312E81 100%)",
          padding:"40px 0 80px", position:"relative", overflow:"hidden",
        }}>
          <div style={{ position:"absolute", top:-40, right:-40, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
          <div style={{ position:"absolute", bottom:-20, left:-20, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />

          <div style={{ position:"relative", maxWidth:1120, margin:"0 auto", padding:"0 48px" }}>
            <div style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.6)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>Akun Saya</div>
            <h1 style={{ fontSize:32, fontWeight:800, color:"#fff", margin:0, letterSpacing:"-0.5px", fontFamily:"'Plus Jakarta Sans', sans-serif" }}>Profil</h1>
            <p style={{ margin:"8px 0 0", fontSize:15, color:"rgba(255,255,255,0.75)", maxWidth:480, lineHeight:1.55 }}>
              Kelola informasi akun, favorit, dan pengaturan keamananmu.
            </p>
          </div>
        </div>

        {/* ── PROFILE CARD ── */}
        <div style={{ margin:"0 auto", marginTop:-52, position:"relative", zIndex:10, maxWidth:1120, padding:"0 48px", width:"100%" }}>
          <div style={{ background: cardBg, borderRadius:28, padding:"28px 24px 24px", boxShadow: "0 8px 40px rgba(15,23,42,0.12)", transition:"background 0.3s" }}>
            <div style={{ display:"flex", alignItems:"center", gap:18 }}>
              <div style={{ position:"relative", flexShrink:0 }}>
                <div style={{ width:80, height:80, borderRadius:22, overflow:"hidden", border: "3px solid #EFF6FF", boxShadow:"0 4px 12px rgba(37,99,235,0.15)" }}>
                  {photoUrl ? (
                    <img src={photoUrl} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="Profile" />
                  ) : (
                    <div style={{ width:"100%", height:"100%", background:"linear-gradient(135deg, #2563EB, #4F46E5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, fontWeight:800, color:"#fff", fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
                      {initials}
                    </div>
                  )}
                </div>
                <button onClick={() => fileInputRef.current?.click()} style={{ position:"absolute", bottom:-4, right:-4, width:30, height:30, background:"#2563EB", border:`2.5px solid ${cardBg}`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#fff" }}>
                  <Camera size={14} />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handlePhotoChange} />
              </div>

              <div style={{ flex:1, minWidth:0 }}>
                <h2 style={{ fontSize:18, fontWeight:800, color: textPri, margin:0, marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
                  {userData.name || "Pengguna Atap"}
                </h2>
                <div style={{ display:"flex", alignItems:"center", gap:5, color: textSec, fontSize:13 }}>
                  <Mail size={13} />
                  <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{userData.email || "—"}</span>
                </div>
                {userData.province && (
                  <div style={{ display:"inline-flex", alignItems:"center", gap:4, background: "#EFF6FF", color:"#1D4ED8", fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:8, marginTop:8 }}>
                    <MapPin size={10} />
                    <span>{userData.district ? `${userData.district}, ` : ""}{userData.city || userData.province}</span>
                  </div>
                )}
              </div>
            </div>

            <button onClick={() => setIsEditing(true)}
              style={{ marginTop:20, width:"100%", padding:"14px 0", background: "#0F172A", color:"#fff", border:"none", borderRadius:16, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans', sans-serif", transition:"background 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#2563EB"}
              onMouseLeave={e => e.currentTarget.style.background = "#0F172A"}>
              Ubah Detail Profil
            </button>
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div style={{ margin:"20px auto 0", maxWidth:1120, padding:"0 48px", width:"100%", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
          {[
            { label: "Favorit", value: stats.favorites, path: "/like" },
            { label: "Chat", value: stats.chats, path: "/chat" },
            { label: "Belum dibaca", value: unreadChat, path: "/chat" },
          ].map(({ label, value, path }) => (
            <button
              key={label}
              type="button"
              onClick={() => navigate(path)}
              style={{ background: cardBg, borderRadius:18, padding:"16px 12px", textAlign:"center", boxShadow: "0 2px 12px rgba(15,23,42,0.06)", transition:"background 0.3s", border:"none", cursor:"pointer", fontFamily:"inherit" }}
            >
              <div style={{ fontSize:22, fontWeight:800, color: textPri, fontFamily:"'Plus Jakarta Sans', sans-serif" }}>{value}</div>
              <div style={{ fontSize:11, color: textMuted, fontWeight:600, marginTop:2 }}>{label}</div>
            </button>
          ))}
        </div>

        {/* ── SETTINGS MENU ── */}
        <div style={{ margin:"28px auto 0", maxWidth:1120, padding:"0 48px", width:"100%" }}>
          <div style={{ fontSize:11, fontWeight:800, color: textMuted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:12, paddingLeft:4 }}>Pengaturan Umum</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {menuItems.map(({ icon:Icon, label, sub, color, bg: iconBg, path, showBadge }) => (
              <button key={label}
                className="profil-menu-btn"
                onClick={() => navigate(path)}
                onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 4px 20px ${color}22`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.boxShadow = "0 2px 8px rgba(15,23,42,0.04)"; }}>
                <div style={{ position:"relative", flexShrink:0 }}>
                  <div style={{ width:46, height:46, background: iconBg, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Icon size={20} color={color} />
                  </div>
                  {showBadge && unreadCount > 0 && (
                    <div style={{ position:"absolute", top:-5, right:-5, minWidth:18, height:18, background:"#EF4444", borderRadius:99, border:`2px solid ${cardBg}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:"#fff", padding:"0 4px", boxShadow:"0 2px 6px rgba(239,68,68,0.4)", lineHeight:1 }}>
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </div>
                  )}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:14, fontWeight:700, color: textPri }}>{label}</span>
                    {showBadge && unreadCount > 0 && (
                      <span style={{ fontSize:10, fontWeight:700, color:"#EF4444", background: "#FEF2F2", padding:"2px 7px", borderRadius:99 }}>
                        {unreadCount} baru
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize:12, color: textMuted, marginTop:1 }}>{sub}</div>
                </div>
                <ChevronRight size={16} color={textMuted} />
              </button>
            ))}
          </div>
        </div>

        {/* ── EDIT MODAL ── */}
        {isEditing && (
          <div style={{ position:"fixed", inset:0, zIndex:100, display:"flex", alignItems:"flex-end" }}>
            <div style={{ position:"absolute", inset:0, background:"rgba(15,23,42,0.6)", backdropFilter:"blur(4px)" }} onClick={() => setIsEditing(false)} />
            <div style={{ position:"relative", background: cardBg, width:"100%", borderRadius:"28px 28px 0 0", padding:"28px 24px 40px", maxHeight:"92vh", overflowY:"auto", animation:"slideUp 0.3s cubic-bezier(0.32,0.72,0,1)", transition:"background 0.3s" }}>
              <div style={{ width:40, height:4, background: "#E2E8F0", borderRadius:2, margin:"0 auto 20px" }} />
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
                <h3 style={{ fontSize:18, fontWeight:800, color: textPri, margin:0, fontFamily:"'Plus Jakarta Sans', sans-serif" }}>Edit Profil & Lokasi</h3>
                <button onClick={() => setIsEditing(false)} style={{ width:36, height:36, background: "#F1F5F9", border:"none", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                  <X size={18} color={textSec} />
                </button>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <InputGroup label="Nama Lengkap" icon={<User size={16} />} value={editForm.name} onChange={e => setEditForm({ ...editForm, name:e.target.value })} placeholder="Masukkan nama lengkap" />
                <InputGroup label="Email" icon={<Mail size={16} />} value={editForm.email} onChange={e => setEditForm({ ...editForm, email:e.target.value })} placeholder="email@contoh.com" />
                <InputGroup label="WhatsApp" icon={<Phone size={16} />} value={editForm.phone || ""} onChange={e => setEditForm({ ...editForm, phone:e.target.value })} placeholder="08xxxxxxxxxx" />
                <p style={{ fontSize:11, color: textMuted, margin:"-4px 0 0", lineHeight:1.5 }}>
                  Nama dan alamat disimpan di perangkat ini. Perubahan email di server belum tersedia.
                </p>
                <div style={{ height:1, background: "#F1F5F9" }} />
                <div style={{ fontSize:11, fontWeight:800, color:"#2563EB", letterSpacing:"0.1em", textTransform:"uppercase" }}>Alamat Lengkap</div>
                <SelectGroup label="Provinsi" icon={<Globe size={16} />} options={PROVINCES} value={editForm.province} placeholder="Pilih Provinsi" onChange={e => setEditForm({ ...editForm, province:e.target.value, city:"", district:"" })} />
                <SelectGroup label="Kota / Kabupaten" icon={<MapIcon size={16} />} options={cityOptions} value={editForm.city} disabled={!editForm.province} placeholder="Pilih Kota/Kabupaten" onChange={e => setEditForm({ ...editForm, city:e.target.value, district:"" })} />
                <InputGroup label="Kecamatan" icon={<Navigation size={16} />} value={editForm.district} onChange={e => setEditForm({ ...editForm, district:e.target.value })} placeholder="Ketik nama kecamatan" />
                <div>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, color: textSec, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.08em" }}>Alamat Spesifik</label>
                  <textarea
                    style={{ width:"100%", padding:"14px 16px", background: "#F8FAFC", border:"1.5px solid #E2E8F0", borderRadius:14, fontSize:14, color: textPri, resize:"none", outline:"none", boxSizing:"border-box", fontFamily:"inherit", transition:"border-color 0.2s" }}
                    rows={3} placeholder="Contoh: Jl. Melati No. 12, RT 01/02, Blok A"
                    value={editForm.address}
                    onChange={e => setEditForm({ ...editForm, address:e.target.value })}
                    onFocus={e => e.target.style.borderColor = "#2563EB"}
                    onBlur={e  => e.target.style.borderColor = "#E2E8F0"}
                  />
                </div>
                <button onClick={handleSaveProfile} disabled={isSaving}
                  style={{ width:"100%", padding:"15px 0", background: saveSuccess ? "#059669" : "#2563EB", color:"#fff", border:"none", borderRadius:16, fontSize:15, fontWeight:700, cursor: isSaving ? "not-allowed" : "pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"background 0.3s", opacity: isSaving ? 0.8 : 1, fontFamily:"'DM Sans', sans-serif" }}>
                  {isSaving ? (
                    <div style={{ width:20, height:20, border:"2.5px solid rgba(255,255,255,0.4)", borderTop:"2.5px solid #fff", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
                  ) : saveSuccess ? (
                    <><Check size={18} /> Tersimpan!</>
                  ) : (
                    <><Check size={18} /> Simpan Perubahan</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MOBILE BOTTOM NAV ── */}
        <nav className="profil-bottom-nav">
          {(isLoggedIn ? MOBILE_NAV : GUEST_MOBILE).map(({ label, path, icon:Icon }) => {
            const isActive = currentPath === path;
            const isProfil = path === "/profil";
            const isChat   = path === "/chat";
            return (
              <button key={path} className={`profil-bn-item${isActive ? " active" : ""}`} onClick={() => navigate(path)}>
                {isProfil && isLoggedIn ? (
                  <div className="profil-bn-avatar-wrap">
                    <div className="profil-bn-avatar">{initials}</div>
                    {unreadCount > 0 && <span className="profil-bn-notif-dot" />}
                  </div>
                ) : isChat && isLoggedIn ? (
                  <div className="profil-bn-icon-wrap">
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                    {unreadChat > 0 && <span className="profil-bn-chat-badge">{unreadChat > 99 ? "99+" : unreadChat}</span>}
                  </div>
                ) : (
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                )}
                <span>{label}</span>
              </button>
            );
          })}
          {!isLoggedIn && (
            <button className={`profil-bn-item${currentPath === "/auth" ? " active" : ""}`} onClick={() => navigate("/auth")}>
              <User size={20} strokeWidth={currentPath === "/auth" ? 2.5 : 1.8} />
              <span>Masuk</span>
            </button>
          )}
        </nav>

      </div>
    </>
  );
}