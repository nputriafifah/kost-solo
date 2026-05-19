import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Check, MapPin, Loader2,
  Upload, ImageIcon, Trash2, Home, MapPinIcon, Lightbulb,
  LayoutGrid, Layers, Camera, ArrowLeft,
} from "lucide-react";
import MapPicker from "../../components/owner/MapPicker";

const RULE_OPTIONS = [
  "Tidak boleh bawa pasangan",
  "Jam malam pukul 22.00",
  "Tidak boleh merokok",
  "Tidak boleh bawa hewan peliharaan",
];

const FACILITY_OPTIONS = ["Wifi", "AC", "Kamar Mandi Dalam", "Parkir", "Laundry"];

const STEPS = [
  { label: "Data Kos", desc: "Informasi dasar properti kamu", icon: Home },
  { label: "Lokasi", desc: "Alamat & titik peta", icon: MapPinIcon },
  { label: "Fasilitas", desc: "Fasilitas kamar yang tersedia", icon: Lightbulb },
  { label: "Ketersediaan", desc: "Jumlah kamar yang bisa disewa", icon: LayoutGrid },
  { label: "Detail Kamar", desc: "Tipe, ukuran & harga kamar", icon: Layers },
  { label: "Foto Kamar", desc: "Upload foto untuk menarik penyewa", icon: Camera },
];

const API = "http://localhost:3000";
const getToken = () => localStorage.getItem("token") || "";

export default function CreateListingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: "", address: "", genderType: "PUTRA",
    description: "", contactNumber: "", rules: [],
  });

  const [latLng, setLatLng] = useState(null);
  const [room, setRoom] = useState({
    name: "", price: "", size: "", facilities: [], availableCount: 1,
  });
  const [roomPhotos, setRoomPhotos] = useState([]);

  const toggleItem = (list, item) =>
    list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

  const validateStep = () => {
    const e = {};
    if (step === 1) {
      if (form.name.trim().length < 3) e.name = "Nama minimal 3 karakter";
      if (form.description.trim().length < 10) e.description = "Deskripsi minimal 10 karakter";
      if (form.contactNumber.trim().length < 8) e.contactNumber = "Nomor kontak minimal 8 digit";
      if (form.rules.length === 0) e.rules = "Pilih minimal 1 peraturan";
    }
    if (step === 2) {
      if (form.address.trim().length < 10) e.address = "Alamat minimal 10 karakter";
      if (!latLng) e.latLng = "Tandai lokasi di peta";
    }
    if (step === 5) {
      if (!room.name.trim()) e.roomName = "Nama tipe kamar wajib diisi";
      if (!room.size.trim()) e.roomSize = "Ukuran kamar wajib diisi";
      if (!room.price) e.roomPrice = "Harga wajib diisi";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validateStep()) setStep(step + 1); };
  const handleBack = () => { if (step > 1) setStep(step - 1); };

  const handleSubmit = async () => {
  if (!validateStep()) return;

  console.log("TOKEN:", getToken());

  setLoading(true);

  try {
      const resListing = await fetch(`${API}/listings/owner`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          name: form.name.trim(), address: form.address.trim(),
          genderType: form.genderType, description: form.description.trim(),
          contactNumber: form.contactNumber.trim(), rules: form.rules,
          latitude: Number(latLng.lat), longitude: Number(latLng.lng),
        }),
      });
      const listingJson = await resListing.json();
      if (!resListing.ok) throw new Error(listingJson.message || "Gagal membuat listing");
      const listingId = listingJson.data?.id;

      const resRoom = await fetch(`${API}/owner/listings/${listingId}/room-types`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          name: room.name.trim(), price: Number(room.price),
          size: room.size.trim(), facilities: room.facilities,
          availableCount: Number(room.availableCount),
        }),
      });
      const roomJson = await resRoom.json();
      if (!resRoom.ok) throw new Error(roomJson.message || "Gagal membuat tipe kamar");
      const roomId = roomJson.data?.id;

      if (roomPhotos.length > 0) {
  const fd = new FormData();
  roomPhotos.forEach((f) => fd.append("photos", f));
  
  console.log("Jumlah foto:", roomPhotos.length); // ← tambah
  for (let [k, v] of fd.entries()) console.log(k, v.name); // ← tambah
  
  await fetch(`${API}/owner/room-types/${roomId}/photos`, {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
          body: fd,
        });
      }
      navigate("/owner/properti");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentStepData = STEPS[step - 1];
  const CurrentIcon = currentStepData.icon;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .clp-root {
          font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
          background: #f5f6fa;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* TOP HEADER */
        .clp-topbar {
          background: #1d4ed8;
          padding: 0 32px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(29,78,216,0.18);
        }

        .clp-topbar-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .clp-topbar-brand {
          font-size: 20px;
          font-weight: 800;
          color: white;
          letter-spacing: -0.5px;
        }

        .clp-topbar-divider {
          width: 1px;
          height: 20px;
          background: rgba(255,255,255,0.25);
        }

        .clp-topbar-title {
          font-size: 14px;
          font-weight: 600;
          color: rgba(255,255,255,0.85);
        }

        .clp-back-dashboard {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          color: white;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          font-family: inherit;
        }

        .clp-back-dashboard:hover {
          background: rgba(255,255,255,0.22);
        }

        /* MAIN LAYOUT */
        .clp-body {
          display: flex;
          flex: 1;
          min-height: 0;
        }

        /* SIDEBAR */
        .clp-sidebar {
          width: 280px;
          flex-shrink: 0;
          background: white;
          border-right: 1px solid #e8eaf2;
          display: flex;
          flex-direction: column;
          padding: 32px 0;
        }

        .clp-sidebar-heading {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #94a3b8;
          padding: 0 24px;
          margin-bottom: 16px;
        }

        .clp-sidebar-steps {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 0 12px;
        }

        .clp-sidebar-step {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 14px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
          background: transparent;
          text-align: left;
          font-family: inherit;
          width: 100%;
        }

        .clp-sidebar-step.inactive {
          cursor: default;
          opacity: 0.45;
          pointer-events: none;
        }

        .clp-sidebar-step.done {
          background: #f0fdf4;
          border-color: #bbf7d0;
        }

        .clp-sidebar-step.done:hover {
          background: #dcfce7;
        }

        .clp-sidebar-step.active {
          background: #eff6ff;
          border-color: #bfdbfe;
        }

        .clp-step-num {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 12px;
          font-weight: 700;
          transition: all 0.2s;
        }

        .clp-sidebar-step.todo .clp-step-num {
          background: #f1f5f9;
          color: #94a3b8;
          border: 1.5px solid #e2e8f0;
        }

        .clp-sidebar-step.done .clp-step-num {
          background: #22c55e;
          color: white;
          border: none;
        }

        .clp-sidebar-step.active .clp-step-num {
          background: #1d4ed8;
          color: white;
          border: none;
          box-shadow: 0 0 0 4px rgba(29,78,216,0.15);
        }

        .clp-step-info { flex: 1; min-width: 0; }

        .clp-step-name {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
          line-height: 1.2;
        }

        .clp-sidebar-step.done .clp-step-name { color: #15803d; }
        .clp-sidebar-step.active .clp-step-name { color: #1d4ed8; }

        .clp-step-subdesc {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 2px;
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .clp-sidebar-step.active .clp-step-subdesc { color: #93c5fd; }
        .clp-sidebar-step.done .clp-step-subdesc { color: #86efac; }

        /* Progress bar in sidebar */
        .clp-sidebar-progress {
          padding: 24px 24px 0;
          margin-top: 8px;
          border-top: 1px solid #f1f5f9;
        }

        .clp-sidebar-progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 8px;
        }

        .clp-sidebar-progress-bar {
          height: 4px;
          background: #e8eaf2;
          border-radius: 4px;
          overflow: hidden;
        }

        .clp-sidebar-progress-fill {
          height: 100%;
          background: #1d4ed8;
          border-radius: 4px;
          transition: width 0.4s cubic-bezier(0.4,0,0.2,1);
        }

        /* MAIN CONTENT */
        .clp-content {
          flex: 1;
          overflow-y: auto;
          padding: 40px 48px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        @media (max-width: 900px) {
          .clp-sidebar { width: 220px; }
          .clp-content { padding: 24px 20px; }
        }

        @media (max-width: 640px) {
          .clp-sidebar { display: none; }
          .clp-content { padding: 20px 16px; }
        }

        /* CONTENT HEADER */
        .clp-content-header {
          margin-bottom: 32px;
        }

        .clp-content-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #94a3b8;
          font-weight: 500;
          margin-bottom: 12px;
        }

        .clp-content-breadcrumb span { color: #1d4ed8; font-weight: 600; }

        .clp-content-title-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .clp-content-icon-wrap {
          width: 48px;
          height: 48px;
          background: #eff6ff;
          border: 1.5px solid #bfdbfe;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1d4ed8;
          flex-shrink: 0;
        }

        .clp-content-title {
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.5px;
        }

        .clp-content-subtitle {
          font-size: 13px;
          color: #64748b;
          margin-top: 2px;
          font-weight: 500;
        }

        /* FORM CARD */
        .clp-form-card {
          background: white;
          border: 1px solid #e8eaf2;
          border-radius: 16px;
          padding: 32px;
          flex: 1;
        }

        @media (max-width: 640px) {
          .clp-form-card { padding: 20px; border-radius: 12px; }
        }

        /* FORM FIELDS */
        .clp-field {
          margin-bottom: 24px;
        }

        .clp-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          color: #334155;
          margin-bottom: 8px;
        }

        .clp-input, .clp-textarea {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          color: #0f172a;
          background: #fafbff;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          font-family: inherit;
          font-weight: 500;
        }

        .clp-input:focus, .clp-textarea:focus {
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }

        .clp-input.err, .clp-textarea.err {
          border-color: #ef4444;
          background: #fff5f5;
        }

        .clp-textarea { resize: vertical; min-height: 90px; }
        .clp-input::placeholder, .clp-textarea::placeholder { color: #cbd5e1; }

        .clp-error {
          font-size: 12px;
          color: #ef4444;
          font-weight: 600;
          margin-top: 6px;
        }

        /* CHIPS */
        .clp-chip-group {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .clp-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9px 16px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          background: #fafbff;
          color: #475569;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s;
          font-family: inherit;
        }

        .clp-chip:hover { border-color: #93c5fd; background: #f0f9ff; }

        .clp-chip.active {
          border-color: #1d4ed8;
          background: #eff6ff;
          color: #1d4ed8;
        }

        .clp-chip-check {
          width: 16px;
          height: 16px;
          background: #1d4ed8;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* TOGGLE ROWS */
        .clp-toggle-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .clp-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 16px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          background: #fafbff;
          cursor: pointer;
          transition: all 0.18s;
          font-family: inherit;
          color: #334155;
          font-size: 14px;
          font-weight: 500;
          text-align: left;
        }

        .clp-toggle-row:hover { border-color: #93c5fd; background: #f0f9ff; }

        .clp-toggle-row.active {
          border-color: #1d4ed8;
          background: #eff6ff;
          color: #1d4ed8;
          font-weight: 600;
        }

        .clp-toggle-check {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #1d4ed8;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* GENDER CHIPS */
        .clp-gender-group {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .clp-gender-btn {
          padding: 11px;
          text-align: center;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          background: #fafbff;
          color: #475569;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s;
          font-family: inherit;
        }

        .clp-gender-btn:hover { border-color: #93c5fd; }
        .clp-gender-btn.active {
          border-color: #1d4ed8;
          background: #eff6ff;
          color: #1d4ed8;
        }

        /* MAP */
        .clp-map-container {
          height: 320px;
          border-radius: 12px;
          overflow: hidden;
          border: 1.5px solid #e2e8f0;
        }

        .clp-coord-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 14px;
          background: #eff6ff;
          border: 1.5px solid #bfdbfe;
          border-radius: 10px;
          color: #1d4ed8;
          font-size: 13px;
          font-weight: 600;
          margin-top: 12px;
        }

        /* COUNTER */
        .clp-counter-wrap {
          display: flex;
          align-items: center;
          gap: 20px;
          justify-content: center;
          padding: 40px 0;
        }

        .clp-counter-btn {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          background: #fafbff;
          color: #334155;
          font-size: 24px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: inherit;
        }

        .clp-counter-btn:hover { border-color: #1d4ed8; background: #eff6ff; color: #1d4ed8; }
        .clp-counter-btn:active { transform: scale(0.95); }

        .clp-counter-input {
          width: 80px;
          text-align: center;
          font-size: 36px;
          font-weight: 800;
          color: #0f172a;
          border: none;
          background: transparent;
          font-family: inherit;
          outline: none;
        }

        /* UPLOAD */
        .clp-upload-zone {
          border: 2px dashed #cbd5e1;
          border-radius: 14px;
          padding: 48px 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: #fafbff;
        }

        .clp-upload-zone:hover, .clp-upload-zone.has-files {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .clp-upload-icon-wrap {
          width: 52px;
          height: 52px;
          margin: 0 auto 14px;
          background: #1d4ed8;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .clp-upload-text { font-size: 15px; font-weight: 700; color: #1e293b; }
        .clp-upload-sub { font-size: 12px; color: #94a3b8; margin-top: 6px; }

        .clp-photo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 12px;
          margin-top: 20px;
        }

        .clp-photo-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: 10px;
          overflow: hidden;
          border: 1.5px solid #e2e8f0;
          background: #f8faff;
        }

        .clp-photo-item img { width: 100%; height: 100%; object-fit: cover; }

        .clp-photo-del {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .clp-photo-item:hover .clp-photo-del { opacity: 1; }

        .clp-photo-del button {
          width: 30px; height: 30px;
          border-radius: 8px;
          background: #ef4444;
          border: none;
          color: white;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }

        /* FOOTER NAV */
        .clp-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 32px;
          gap: 12px;
        }

        .clp-nav-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .clp-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 22px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          white-space: nowrap;
        }

        .clp-btn-primary {
          background: #1d4ed8;
          color: white;
          box-shadow: 0 4px 14px rgba(29,78,216,0.25);
        }

        .clp-btn-primary:hover:not(:disabled) {
          background: #1e40af;
          box-shadow: 0 6px 20px rgba(29,78,216,0.3);
          transform: translateY(-1px);
        }

        .clp-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .clp-btn-outline {
          background: white;
          color: #475569;
          border: 1.5px solid #e2e8f0;
        }

        .clp-btn-outline:hover {
          border-color: #1d4ed8;
          color: #1d4ed8;
          background: #eff6ff;
        }

        .clp-btn-ghost {
          background: transparent;
          color: #94a3b8;
          padding: 12px 16px;
        }

        .clp-btn-ghost:hover { color: #475569; background: #f1f5f9; }

        /* PRICE PREFIX */
        .clp-price-wrap { position: relative; }
        .clp-price-prefix {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 13px;
          font-weight: 700;
          color: #64748b;
          pointer-events: none;
        }
        .clp-price-input { padding-left: 42px; }

        /* STEP CONNECTOR in sidebar */
        .clp-sidebar-connector {
          width: 2px;
          height: 12px;
          background: #e8eaf2;
          margin: 2px auto;
          display: block;
        }

        .clp-sidebar-connector.done { background: #bbf7d0; }

        .clp-info-note {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 13px;
          color: #0369a1;
          font-weight: 500;
          margin-bottom: 20px;
        }
      `}</style>

      <div className="clp-root">
        {/* TOP HEADER */}
        <header className="clp-topbar">
          <div className="clp-topbar-left">
            <span className="clp-topbar-brand">Atap</span>
            <div className="clp-topbar-divider" />
            <span className="clp-topbar-title">Daftarkan Kost Baru</span>
          </div>
          <button className="clp-back-dashboard" onClick={() => navigate("/owner/dashboard")}>
            <ArrowLeft size={15} />
            Kembali ke Dashboard
          </button>
        </header>

        <div className="clp-body">
          {/* SIDEBAR */}
          <aside className="clp-sidebar">
            <p className="clp-sidebar-heading">Langkah Pendaftaran</p>

            <div className="clp-sidebar-steps">
              {STEPS.map((s, i) => {
                const num = i + 1;
                const done = num < step;
                const active = num === step;
                const todo = num > step;
                const StepIcon = s.icon;
                const stateClass = done ? "done" : active ? "active" : "todo inactive";

                return (
                  <div key={num}>
                    <button
                      type="button"
                      className={`clp-sidebar-step ${stateClass}`}
                      onClick={() => !todo && setStep(num)}
                    >
                      <div className="clp-step-num">
                        {done ? <Check size={16} /> : active ? <StepIcon size={15} /> : <span>{num}</span>}
                      </div>
                      <div className="clp-step-info">
                        <p className="clp-step-name">{s.label}</p>
                        <p className="clp-step-subdesc">{s.desc}</p>
                      </div>
                    </button>
                    {i < STEPS.length - 1 && (
                      <span className={`clp-sidebar-connector${done ? " done" : ""}`} />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="clp-sidebar-progress">
              <div className="clp-sidebar-progress-label">
                <span>Progres</span>
                <span style={{ color: "#1d4ed8", fontWeight: 700 }}>
                  {step - 1}/{STEPS.length - 1}
                </span>
              </div>
              <div className="clp-sidebar-progress-bar">
                <div
                  className="clp-sidebar-progress-fill"
                  style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="clp-content">
            {/* Content header */}
            <div className="clp-content-header">
              <div className="clp-content-breadcrumb">
                Daftar Kost
                <ChevronRight size={12} />
                <span>{currentStepData.label}</span>
              </div>
              <div className="clp-content-title-row">
                <div className="clp-content-icon-wrap">
                  <CurrentIcon size={22} />
                </div>
                <div>
                  <h1 className="clp-content-title">{currentStepData.label}</h1>
                  <p className="clp-content-subtitle">{currentStepData.desc}</p>
                </div>
              </div>
            </div>

            {/* FORM CARD */}
            <div className="clp-form-card">

              {/* STEP 1 */}
              {step === 1 && (
                <>
                  <div className="clp-field">
                    <label className="clp-label">Nama Kost</label>
                    <input className={`clp-input${errors.name ? " err" : ""}`}
                      placeholder="cth. Kost Melati Indah" value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    {errors.name && <p className="clp-error">⚠ {errors.name}</p>}
                  </div>

                  <div className="clp-field">
                    <label className="clp-label">Tipe Kost</label>
                    <div className="clp-gender-group">
                      {[{ val: "PUTRA", label: "🧑 Putra" }, { val: "PUTRI", label: "👩 Putri" }, { val: "CAMPUR", label: "👥 Campur" }].map(({ val, label }) => (
                        <button key={val} type="button" className={`clp-gender-btn${form.genderType === val ? " active" : ""}`}
                          onClick={() => setForm({ ...form, genderType: val })}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="clp-field">
                    <label className="clp-label">Nomor Kontak (WhatsApp)</label>
                    <input className={`clp-input${errors.contactNumber ? " err" : ""}`}
                      placeholder="cth. 08123456789" value={form.contactNumber}
                      onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} />
                    {errors.contactNumber && <p className="clp-error">⚠ {errors.contactNumber}</p>}
                  </div>

                  <div className="clp-field">
                    <label className="clp-label">Deskripsi</label>
                    <textarea className={`clp-textarea${errors.description ? " err" : ""}`}
                      rows={4} placeholder="Ceritakan tentang kost kamu, lingkungan sekitar, akses transportasi..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    {errors.description && <p className="clp-error">⚠ {errors.description}</p>}
                  </div>

                  <div className="clp-field">
                    <label className="clp-label">Peraturan Kos</label>
                    <p style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, marginBottom: 10 }}>Pilih minimal 1 peraturan yang berlaku</p>
                    <div className="clp-toggle-list">
                      {RULE_OPTIONS.map((rule) => {
                        const checked = form.rules.includes(rule);
                        return (
                          <button key={rule} type="button" onClick={() => setForm({ ...form, rules: toggleItem(form.rules, rule) })}
                            className={`clp-toggle-row${checked ? " active" : ""}`}>
                            <span>{rule}</span>
                            {checked && <span className="clp-toggle-check"><Check size={12} color="white" /></span>}
                          </button>
                        );
                      })}
                    </div>
                    {errors.rules && <p className="clp-error">⚠ {errors.rules}</p>}
                    {form.rules.length > 0 && (
                      <p style={{ fontSize: 12, color: "#22c55e", fontWeight: 600, marginTop: 8 }}>
                        ✓ {form.rules.length} peraturan dipilih
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <>
                  <div className="clp-field">
                    <label className="clp-label">Alamat Lengkap</label>
                    <textarea className={`clp-textarea${errors.address ? " err" : ""}`}
                      rows={3} placeholder="Jl. Contoh No. 12, Kel. ..., Kec. ..., Kota ..."
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })} />
                    {errors.address && <p className="clp-error">⚠ {errors.address}</p>}
                  </div>

                  <div className="clp-field">
                    <label className="clp-label">Tandai Lokasi di Peta</label>
                    <p className="clp-info-note">
                      📍 Klik pada peta untuk menentukan lokasi kost secara akurat. Titik pin bisa digeser kembali setelah ditandai.
                    </p>
                    <div className="clp-map-container">
                      <MapPicker setLatLng={setLatLng} />
                    </div>
                    {latLng && (
                      <div className="clp-coord-badge">
                        <MapPin size={15} />
                        <span>{Number(latLng.lat).toFixed(5)}, {Number(latLng.lng).toFixed(5)}</span>
                        <span style={{ background: "#22c55e", color: "white", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, marginLeft: 4 }}>
                          Tersimpan
                        </span>
                      </div>
                    )}
                    {errors.latLng && <p className="clp-error">⚠ {errors.latLng}</p>}
                  </div>
                </>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <>
                  <p className="clp-info-note">Pilih semua fasilitas yang tersedia di dalam kamar kost kamu.</p>
                  <div className="clp-toggle-list">
                    {FACILITY_OPTIONS.map((f) => {
                      const checked = room.facilities.includes(f);
                      return (
                        <button key={f} type="button" onClick={() => setRoom({ ...room, facilities: toggleItem(room.facilities, f) })}
                          className={`clp-toggle-row${checked ? " active" : ""}`}>
                          <span>{f}</span>
                          {checked && <span className="clp-toggle-check"><Check size={12} color="white" /></span>}
                        </button>
                      );
                    })}
                  </div>
                  {room.facilities.length > 0 && (
                    <p style={{ fontSize: 13, color: "#22c55e", fontWeight: 700, marginTop: 16 }}>
                      ✓ {room.facilities.length} fasilitas dipilih
                    </p>
                  )}
                  {room.facilities.length === 0 && (
                    <p style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, marginTop: 12 }}>
                      Kamu bisa melanjutkan tanpa memilih fasilitas.
                    </p>
                  )}
                </>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <>
                  <p className="clp-info-note">Masukkan jumlah kamar yang bisa disewa saat ini.</p>
                  <div className="clp-counter-wrap">
                    <button type="button" className="clp-counter-btn"
                      onClick={() => setRoom({ ...room, availableCount: Math.max(0, Number(room.availableCount) - 1) })}>
                      −
                    </button>
                    <input type="number" min="0" className="clp-counter-input"
                      value={room.availableCount}
                      onChange={(e) => setRoom({ ...room, availableCount: e.target.value })} />
                    <button type="button" className="clp-counter-btn"
                      onClick={() => setRoom({ ...room, availableCount: Number(room.availableCount) + 1 })}>
                      +
                    </button>
                  </div>
                  <p style={{ textAlign: "center", fontSize: 13, color: "#64748b", fontWeight: 600 }}>kamar tersedia</p>
                </>
              )}

              {/* STEP 5 */}
              {step === 5 && (
                <>
                  <div className="clp-field">
                    <label className="clp-label">Nama Tipe Kamar</label>
                    <input className={`clp-input${errors.roomName ? " err" : ""}`}
                      placeholder="cth. Kamar Standar, Kamar Deluxe"
                      value={room.name}
                      onChange={(e) => setRoom({ ...room, name: e.target.value })} />
                    {errors.roomName && <p className="clp-error">⚠ {errors.roomName}</p>}
                  </div>

                  <div className="clp-field">
                    <label className="clp-label">Ukuran Kamar</label>
                    <input className={`clp-input${errors.roomSize ? " err" : ""}`}
                      placeholder="cth. 3x4 m, 4x5 m"
                      value={room.size}
                      onChange={(e) => setRoom({ ...room, size: e.target.value })} />
                    {errors.roomSize && <p className="clp-error">⚠ {errors.roomSize}</p>}
                  </div>

                  <div className="clp-field">
                    <label className="clp-label">Harga per Bulan</label>
                    <div className="clp-price-wrap">
                      <span className="clp-price-prefix">Rp</span>
                      <input type="number" min="0"
                        className={`clp-input clp-price-input${errors.roomPrice ? " err" : ""}`}
                        placeholder="800000"
                        value={room.price}
                        onChange={(e) => setRoom({ ...room, price: e.target.value })} />
                    </div>
                    {errors.roomPrice && <p className="clp-error">⚠ {errors.roomPrice}</p>}
                    {room.price && (
                      <p style={{ marginTop: 10, fontSize: 13, color: "#1d4ed8", fontWeight: 700 }}>
                        ✓ Rp {Number(room.price).toLocaleString("id-ID")} / bulan
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* STEP 6 */}
              {step === 6 && (
                <>
                  <p className="clp-info-note">Upload foto kamar yang menarik untuk meningkatkan minat penyewa. Bisa lebih dari 1 foto.</p>
                  <label style={{ cursor: "pointer", display: "block" }}>
                    <div className={`clp-upload-zone${roomPhotos.length > 0 ? " has-files" : ""}`}>
                      <div className="clp-upload-icon-wrap">
                        {roomPhotos.length > 0 ? <ImageIcon size={24} /> : <Upload size={24} />}
                      </div>
                      <p className="clp-upload-text">
                        {roomPhotos.length > 0 ? `${roomPhotos.length} foto dipilih — klik untuk tambah lagi` : "Klik untuk upload foto"}
                      </p>
                      <p className="clp-upload-sub">JPG, PNG — bisa pilih beberapa sekaligus</p>
                    </div>
                    <input type="file" multiple accept="image/*" style={{ display: "none" }}
                      onChange={(e) => setRoomPhotos([...roomPhotos, ...Array.from(e.target.files)])} />
                  </label>

                  {roomPhotos.length > 0 && (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.6px", textTransform: "uppercase", color: "#334155" }}>
                          Preview ({roomPhotos.length} foto)
                        </p>
                        <button type="button" onClick={() => setRoomPhotos([])}
                          style={{ fontSize: 12, color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}>
                          Hapus semua
                        </button>
                      </div>
                      <div className="clp-photo-grid">
                        {roomPhotos.map((file, i) => (
                          <div key={i} className="clp-photo-item">
                            <img src={URL.createObjectURL(file)} alt={`preview-${i}`} />
                            <div className="clp-photo-del">
                              <button type="button" onClick={() => setRoomPhotos(roomPhotos.filter((_, idx) => idx !== i))}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* NAVIGATION BUTTONS */}
            <div className="clp-nav">
              <div className="clp-nav-left">
                {step > 1 ? (
                  <button type="button" onClick={handleBack} className="clp-btn clp-btn-outline">
                    <ChevronLeft size={16} /> Kembali
                  </button>
                ) : (
                  <button type="button" onClick={() => navigate("/owner/dashboard")} className="clp-btn clp-btn-outline">
                    <ArrowLeft size={15} /> Dashboard
                  </button>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
                  {step} / {STEPS.length}
                </span>
                {step < STEPS.length ? (
                  <button type="button" onClick={handleNext} className="clp-btn clp-btn-primary">
                    Lanjut <ChevronRight size={16} />
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmit} disabled={loading} className="clp-btn clp-btn-primary">
                    {loading ? (
                      <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Menyimpan...</>
                    ) : (
                      <><Check size={16} /> Simpan Kost</>
                    )}
                  </button>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}