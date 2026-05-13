import React, { useState, useEffect, useRef } from "react";
import {
  User, Mail, ChevronRight, LogOut, Settings,
  Bell, Shield, HelpCircle, X, Check, Camera,
  MapPin, Map as MapIcon, Globe, Navigation,
  ChevronLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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

// ─── NOTIFICATION DATA (sama persis dari NotifikasiPage) ──────────────────────
const NOTIFICATIONS = [
  { id: 1, unread: true },
  { id: 2, unread: true },
  { id: 3, unread: false },
  { id: 4, unread: false },
];

// ─── MENU ITEMS ────────────────────────────────────────────────────────────────
const menuItems = [
  { icon: Settings, label: "Pengaturan Akun", sub: "Kelola informasi & keamanan", color: "#2563EB", bg: "#EFF6FF", path: "/settings/account" },
  { icon: Bell, label: "Notifikasi", sub: "Atur preferensi notifikasi", color: "#D97706", bg: "#FFFBEB", path: "/notifikasi", showBadge: true },
  { icon: Shield, label: "Privasi & Keamanan", sub: "Jaga keamanan akunmu", color: "#059669", bg: "#ECFDF5", path: "/settings/privacy" },
  { icon: HelpCircle, label: "Bantuan & FAQ", sub: "Butuh bantuan? Kami siap", color: "#7C3AED", bg: "#F5F3FF", path: "/settings/faq" },
];

// ─── INPUT GROUP ───────────────────────────────────────────────────────────────
function InputGroup({ label, icon, value, onChange, placeholder }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", display: "flex" }}>{icon}</span>
        <input
          style={{
            width: "100%", height: 48, paddingLeft: 44, paddingRight: 16,
            background: "#F8FAFC", border: "1.5px solid #E2E8F0",
            borderRadius: 14, fontSize: 14, color: "#0F172A",
            outline: "none", boxSizing: "border-box",
            transition: "border-color 0.2s",
          }}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={e => e.target.style.borderColor = "#2563EB"}
          onBlur={e => e.target.style.borderColor = "#E2E8F0"}
        />
      </div>
    </div>
  );
}

// ─── SELECT GROUP ─────────────────────────────────────────────────────────────
function SelectGroup({ label, icon, options, value, onChange, disabled, placeholder }) {
  return (
    <div style={{ opacity: disabled ? 0.45 : 1, transition: "opacity 0.2s" }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", display: "flex", zIndex: 1 }}>{icon}</span>
        <select
          disabled={disabled}
          style={{
            width: "100%", height: 48, paddingLeft: 44, paddingRight: 40,
            background: "#F8FAFC", border: "1.5px solid #E2E8F0",
            borderRadius: 14, fontSize: 14, color: value ? "#0F172A" : "#94A3B8",
            outline: "none", appearance: "none", boxSizing: "border-box",
            cursor: disabled ? "not-allowed" : "pointer",
          }}
          value={value}
          onChange={onChange}
        >
          <option value="">{placeholder || `Pilih ${label}`}</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <ChevronRight size={14} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%) rotate(90deg)", color: "#94A3B8", pointerEvents: "none" }} />
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ProfilPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [userData, setUserData] = useState({ name: "", email: "", province: "", city: "", district: "", address: "" });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", province: "", city: "", district: "", address: "" });
  const [photoUrl, setPhotoUrl] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── Hitung unread notifikasi dari localStorage (atau fallback ke data statis) ──
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUserData(parsed);
      setEditForm(parsed);
    }
    const savedPhoto = localStorage.getItem("atap_profile_photo");
    if (savedPhoto) setPhotoUrl(savedPhoto);

    // Baca state notifikasi dari localStorage, fallback ke data default
    const savedNotifs = localStorage.getItem("atap_notifications");
    if (savedNotifs) {
      const parsed = JSON.parse(savedNotifs);
      setUnreadCount(parsed.filter(n => n.unread).length);
    } else {
      setUnreadCount(NOTIFICATIONS.filter(n => n.unread).length);
    }
  }, []);

  const handleSaveProfile = () => {
    setIsSaving(true);
    setTimeout(() => {
      const updated = { ...userData, ...editForm };
      localStorage.setItem("user", JSON.stringify(updated));
      setUserData(updated);
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditing(false);
      }, 1000);
    }, 800);
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

  const initials = userData.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";
  const cityOptions = CITIES[editForm.province] || [];

  return (
    <div style={{ minHeight: "100vh", background: "#F1F5F9", paddingBottom: 40, fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif" }}>

      {/* HERO HEADER */}
      <div style={{
        background: "linear-gradient(135deg, #1D4ED8 0%, #1E40AF 50%, #312E81 100%)",
        padding: "56px 24px 80px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", bottom: -20, left: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 14, padding: "8px 14px 8px 10px",
              cursor: "pointer", color: "#fff", fontSize: 14, fontWeight: 600,
              transition: "background 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.22)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
          >
            <ChevronLeft size={18} />
            Kembali
          </button>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Akun Saya</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.5px" }}>Profil</h1>
          </div>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            style={{
              width: 42, height: 42,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#fff", transition: "background 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.7)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* PROFILE CARD */}
      <div style={{ margin: "0 20px", marginTop: -52, position: "relative", zIndex: 10 }}>
        <div style={{ background: "#fff", borderRadius: 28, padding: "28px 24px 24px", boxShadow: "0 8px 40px rgba(15,23,42,0.12)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: 80, height: 80, borderRadius: 22, overflow: "hidden", border: "3px solid #EFF6FF", boxShadow: "0 4px 12px rgba(37,99,235,0.15)" }}>
                {photoUrl ? (
                  <img src={photoUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Profile" />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #2563EB, #4F46E5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, color: "#fff" }}>
                    {initials}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{ position: "absolute", bottom: -4, right: -4, width: 30, height: 30, background: "#2563EB", border: "2.5px solid #fff", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}
              >
                <Camera size={14} />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: 0, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {userData.name || "Pengguna Atap"}
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#64748B", fontSize: 13 }}>
                <Mail size={13} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userData.email || "—"}</span>
              </div>
              {userData.province && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#EFF6FF", color: "#1D4ED8", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8, marginTop: 8 }}>
                  <MapPin size={10} />
                  <span>{userData.district ? `${userData.district}, ` : ""}{userData.city || userData.province}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            style={{ marginTop: 20, width: "100%", padding: "14px 0", background: "#0F172A", color: "#fff", border: "none", borderRadius: 16, fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: "0.01em", transition: "background 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#2563EB"}
            onMouseLeave={e => e.currentTarget.style.background = "#0F172A"}
          >
            Ubah Detail Profil
          </button>
        </div>
      </div>

      {/* STATS ROW */}
      <div style={{ margin: "20px 20px 0", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {[{ label: "Pesanan", value: "12" }, { label: "Tersimpan", value: "5" }, { label: "Ulasan", value: "8" }].map(({ label, value }) => (
          <div key={label} style={{ background: "#fff", borderRadius: 18, padding: "16px 12px", textAlign: "center", boxShadow: "0 2px 12px rgba(15,23,42,0.06)" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0F172A" }}>{value}</div>
            <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* SETTINGS MENU */}
      <div style={{ margin: "28px 20px 0" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#94A3B8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12, paddingLeft: 4 }}>Pengaturan Umum</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {menuItems.map(({ icon: Icon, label, sub, color, bg, path, showBadge }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", background: "#fff", border: "1.5px solid #F1F5F9", borderRadius: 20, cursor: "pointer", textAlign: "left", transition: "border-color 0.2s, box-shadow 0.2s", boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 4px 20px ${color}22`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#F1F5F9"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(15,23,42,0.04)"; }}
            >
              {/* Icon dengan badge merah untuk Notifikasi */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{ width: 46, height: 46, background: bg, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={20} color={color} />
                </div>
                {/* Badge merah unread count */}
                {showBadge && unreadCount > 0 && (
                  <div style={{
                    position: "absolute",
                    top: -5,
                    right: -5,
                    minWidth: 18,
                    height: 18,
                    background: "#EF4444",
                    borderRadius: 99,
                    border: "2px solid #fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#fff",
                    padding: "0 4px",
                    boxShadow: "0 2px 6px rgba(239,68,68,0.4)",
                    lineHeight: 1,
                  }}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </div>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{label}</span>
                  {/* Teks "N baru" di samping label jika ada unread */}
                  {showBadge && unreadCount > 0 && (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#EF4444",
                      background: "#FEF2F2",
                      padding: "2px 7px",
                      borderRadius: 99,
                    }}>
                      {unreadCount} baru
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 1 }}>{sub}</div>
              </div>
              <ChevronRight size={16} color="#CBD5E1" />
            </button>
          ))}
        </div>
      </div>

      {/* EDIT MODAL */}
      {isEditing && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-end" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)" }} onClick={() => setIsEditing(false)} />
          <div style={{ position: "relative", background: "#fff", width: "100%", borderRadius: "28px 28px 0 0", padding: "28px 24px 40px", maxHeight: "92vh", overflowY: "auto", animation: "slideUp 0.3s cubic-bezier(0.32,0.72,0,1)" }}>
            <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ width: 40, height: 4, background: "#E2E8F0", borderRadius: 2, margin: "0 auto 20px" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: 0 }}>Edit Profil & Lokasi</h3>
              <button onClick={() => setIsEditing(false)} style={{ width: 36, height: 36, background: "#F1F5F9", border: "none", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={18} color="#64748B" />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <InputGroup label="Nama Lengkap" icon={<User size={16} />} value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })} placeholder="Masukkan nama lengkap" />
              <InputGroup label="Email" icon={<Mail size={16} />} value={editForm.email}
                onChange={e => setEditForm({ ...editForm, email: e.target.value })} placeholder="email@contoh.com" />

              <div style={{ height: 1, background: "#F1F5F9" }} />
              <div style={{ fontSize: 11, fontWeight: 800, color: "#2563EB", letterSpacing: "0.1em", textTransform: "uppercase" }}>Alamat Lengkap</div>

              <SelectGroup label="Provinsi" icon={<Globe size={16} />}
                options={PROVINCES} value={editForm.province}
                placeholder="Pilih Provinsi"
                onChange={e => setEditForm({ ...editForm, province: e.target.value, city: "", district: "" })} />

              <SelectGroup label="Kota / Kabupaten" icon={<MapIcon size={16} />}
                options={cityOptions} value={editForm.city}
                disabled={!editForm.province}
                placeholder="Pilih Kota/Kabupaten"
                onChange={e => setEditForm({ ...editForm, city: e.target.value, district: "" })} />

              <InputGroup
                label="Kecamatan"
                icon={<Navigation size={16} />}
                value={editForm.district}
                onChange={e => setEditForm({ ...editForm, district: e.target.value })}
                placeholder="Ketik nama kecamatan"
              />

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Alamat Spesifik</label>
                <textarea
                  style={{ width: "100%", padding: "14px 16px", background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 14, fontSize: 14, color: "#0F172A", resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                  rows={3}
                  placeholder="Contoh: Jl. Melati No. 12, RT 01/02, Blok A"
                  value={editForm.address}
                  onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                  onFocus={e => e.target.style.borderColor = "#2563EB"}
                  onBlur={e => e.target.style.borderColor = "#E2E8F0"}
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                style={{ width: "100%", padding: "15px 0", background: saveSuccess ? "#059669" : "#2563EB", color: "#fff", border: "none", borderRadius: 16, fontSize: 15, fontWeight: 700, cursor: isSaving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.3s", opacity: isSaving ? 0.8 : 1 }}
              >
                {isSaving ? (
                  <div style={{ width: 20, height: 20, border: "2.5px solid rgba(255,255,255,0.4)", borderTop: "2.5px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
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

      {/* LOGOUT CONFIRM */}
      {showLogoutConfirm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 110, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)" }} />
          <div style={{ position: "relative", background: "#fff", width: "100%", maxWidth: 340, borderRadius: 28, padding: "36px 28px 28px", boxShadow: "0 20px 60px rgba(15,23,42,0.2)", textAlign: "center" }}>
            <div style={{ width: 72, height: 72, background: "#FEF2F2", borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <LogOut size={32} color="#EF4444" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: "0 0 8px" }}>Yakin ingin keluar?</h3>
            <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 28px", lineHeight: 1.6 }}>Kamu perlu login kembali untuk mengakses fitur Atap.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowLogoutConfirm(false)} style={{ flex: 1, padding: "13px 0", border: "1.5px solid #E2E8F0", borderRadius: 14, fontWeight: 700, fontSize: 14, color: "#64748B", background: "#fff", cursor: "pointer" }}>
                Batal
              </button>
              <button onClick={() => { localStorage.clear(); navigate("/auth"); }} style={{ flex: 1, padding: "13px 0", border: "none", borderRadius: 14, fontWeight: 700, fontSize: 14, color: "#fff", background: "#EF4444", cursor: "pointer", boxShadow: "0 4px 16px rgba(239,68,68,0.3)" }}>
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}