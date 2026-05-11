import React, { useState, useEffect, useRef } from "react";
import {
  User, Mail, ChevronRight, LogOut, Settings,
  Bell, Shield, HelpCircle, X, Check, Camera,
  MapPin, Map as MapIcon, Globe, Navigation
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/ui/BottomNav";

const menuItems = [
  { icon: Settings, label: "Pengaturan akun", color: "text-blue-500", bg: "bg-blue-50", path: "/settings/account" },
  { icon: Bell, label: "Notifikasi", color: "text-amber-500", bg: "bg-amber-50", path: "/settings/notifications" },
  { icon: Shield, label: "Privasi & keamanan", color: "text-emerald-500", bg: "bg-emerald-50", path: "/settings/privacy" },
  { icon: HelpCircle, label: "Bantuan & FAQ", color: "text-sky-500", bg: "bg-sky-50", path: "/settings/faq" },
];

export default function ProfilPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // States
  const [userData, setUserData] = useState({
    name: "", email: "", province: "", city: "", district: "", address: ""
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "", email: "", province: "", city: "", district: "", address: ""
  });
  const [photoUrl, setPhotoUrl] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Mock Data Wilayah (Bisa diganti dengan Fetch API dari emsifa/api-wilayah-indonesia)
  const provinces = ["Jawa Tengah", "Jawa Barat", "DKI Jakarta", "Jawa Timur"];
  const cities = {
    "Jawa Tengah": ["Semarang", "Surakarta", "Magelang"],
    "Jawa Barat": ["Bandung", "Bogor", "Bekasi"],
    "DKI Jakarta": ["Jakarta Pusat", "Jakarta Selatan", "Jakarta Barat"]
  };
  const districts = {
    "Semarang": ["Banyumanik", "Tembalang", "Pedurungan"],
    "Bandung": ["Coblong", "Sukajadi", "Andir"]
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUserData(parsed);
      setEditForm(parsed);
    }
    const savedPhoto = localStorage.getItem("atap_profile_photo");
    if (savedPhoto) setPhotoUrl(savedPhoto);
  }, []);

  const handleSaveProfile = () => {
    setIsSaving(true);
    setTimeout(() => {
      const updated = { ...userData, ...editForm };
      localStorage.setItem("user", JSON.stringify(updated));
      setUserData(updated);
      setIsSaving(false);
      setIsEditing(false);
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 font-sans selection:bg-blue-100">

      {/* HEADER DECORATION (Like Dashboard) */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-b-[3rem] shadow-lg shadow-blue-200/50" />

      {/* HEADER CONTENT */}
      <div className="relative px-6 pt-10 pb-6 flex justify-between items-center text-white">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Profil Saya</h1>
          <p className="text-blue-100 text-sm opacity-80">Atur akun dan alamat pengiriman</p>
        </div>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-red-500 transition-all active:scale-90"
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* MAIN CARD */}
      <div className="relative mx-5 -mt-2">
        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/60 border border-white">
          <div className="flex flex-col items-center">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-3xl overflow-hidden ring-4 ring-slate-50 shadow-inner">
                {photoUrl ? (
                  <img src={photoUrl} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
                    {initials}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-9 h-9 bg-white shadow-lg rounded-xl flex items-center justify-center border border-slate-100 text-blue-600 hover:scale-110 transition-transform"
              >
                <Camera size={16} />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>

            {/* User Info */}
            <div className="text-center mt-4">
              <h2 className="text-xl font-bold text-slate-900">{userData.name || "Pengguna Atap"}</h2>
              <div className="flex items-center justify-center gap-2 text-slate-500 text-sm mt-1">
                <Mail size={14} />
                <span>{userData.email}</span>
              </div>

              {userData.province && (
                <div className="flex items-center justify-center gap-1 text-blue-600 font-medium text-xs mt-2 bg-blue-50 px-3 py-1 rounded-full">
                  <MapPin size={12} />
                  <span>{userData.district}, {userData.city}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="mt-6 w-full py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-lg shadow-slate-200 hover:bg-blue-600 transition-all active:scale-[0.98]"
            >
              Ubah Detail Profil
            </button>
          </div>
        </div>
      </div>

      {/* SETTINGS MENU */}
      <div className="mx-6 mt-8">
        <h3 className="text-sm font-bold text-slate-400 mb-4 ml-2 uppercase tracking-widest">Pengaturan Umum</h3>
        <div className="grid grid-cols-1 gap-3">
          {menuItems.map(({ icon: Icon, label, color, bg, path }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="group flex items-center gap-4 p-4 bg-white rounded-3xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all text-left"
            >
              <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                <Icon size={20} className={color} />
              </div>
              <div className="flex-1">
                <span className="text-sm font-bold text-slate-700 block">{label}</span>
                <span className="text-xs text-slate-400">Kelola {label.toLowerCase()} kamu</span>
              </div>
              <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* MODAL EDIT (Full Page Slide up style) */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsEditing(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-t-[3rem] p-8 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />

            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-slate-900">Edit Profil & Lokasi</h3>
              <button onClick={() => setIsEditing(false)} className="p-2 bg-slate-100 rounded-full"><X size={20} /></button>
            </div>

            <div className="space-y-5">
              {/* Basic Info */}
              <div className="grid grid-cols-1 gap-4">
                <InputGroup label="Nama Lengkap" icon={<User size={18} />} value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                <InputGroup label="Email" icon={<Mail size={18} />} value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
              </div>

              <div className="h-px bg-slate-100 my-2" />

              {/* Location Selectors */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Alamat Lengkap</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectGroup label="Provinsi" icon={<Globe size={18} />}
                    options={provinces} value={editForm.province}
                    onChange={e => setEditForm({ ...editForm, province: e.target.value, city: "", district: "" })} />

                  <SelectGroup label="Kota / Kabupaten" icon={<MapIcon size={18} />}
                    options={cities[editForm.province] || []} value={editForm.city}
                    disabled={!editForm.province}
                    onChange={e => setEditForm({ ...editForm, city: e.target.value, district: "" })} />
                </div>

                <SelectGroup label="Kecamatan" icon={<Navigation size={18} />}
                  options={districts[editForm.city] || []} value={editForm.district}
                  disabled={!editForm.city}
                  onChange={e => setEditForm({ ...editForm, district: e.target.value })} />

                <div>
                  <label className="text-xs font-bold text-slate-500 mb-2 block ml-1">Alamat Spesifik (Jalan, No. Rumah)</label>
                  <textarea
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    rows="3"
                    placeholder="Contoh: Jl. Melati No. 12, RT 01/02"
                    value={editForm.address}
                    onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                  />
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:bg-slate-300"
              >
                {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" /> : <Check size={20} />}
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT CONFIRMATION (Minimalist) */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 text-center shadow-2xl">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <LogOut size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Yakin ingin keluar?</h3>
            <p className="text-slate-500 text-sm mb-8">Kamu perlu login kembali untuk mengakses fitur Atap.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3.5 rounded-2xl border border-slate-200 font-bold text-slate-600">Batal</button>
              <button onClick={() => { localStorage.clear(); navigate("/auth"); }} className="flex-1 py-3.5 rounded-2xl bg-red-500 text-white font-bold shadow-lg shadow-red-200">Keluar</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

// Sub-components untuk kerapihan kode
function InputGroup({ label, icon, value, onChange }) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-500 mb-2 block ml-1">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
        <input
          className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          value={value} onChange={onChange}
        />
      </div>
    </div>
  );
}

function SelectGroup({ label, icon, options, value, onChange, disabled }) {
  return (
    <div className={disabled ? "opacity-50" : ""}>
      <label className="text-xs font-bold text-slate-500 mb-2 block ml-1">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
        <select
          disabled={disabled}
          className="w-full h-12 pl-12 pr-10 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none transition-all cursor-pointer"
          value={value} onChange={onChange}
        >
          <option value="">Pilih {label}</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
      </div>
    </div>
  );
}