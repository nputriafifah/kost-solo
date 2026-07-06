import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Check, MapPin, Loader2,
  Upload, ImageIcon, Trash2, Home, MapPinIcon, Lightbulb,
  LayoutGrid, Layers, Camera, ArrowLeft, Plus,
} from "lucide-react";
import MapPicker from "../../components/owner/MapPicker";
import AreaLocationFields from "../../components/owner/AreaLocationFields";
import SharedFacilityPhotos from "../../components/owner/SharedFacilityPhotos";
import SelectedFacilityTags from "../../components/owner/SelectedFacilityTags";
import RoomFacilityFields from "../../components/owner/RoomFacilityFields";
import ElectricityIncludedField from "../../components/owner/ElectricityIncludedField";
import { getApiBase } from "../../config/apiBase";
import { buildListingAddress } from "../../utils/publicLocation";
import {
  KOST_FACILITY_OPTIONS,
  GENDER_OPTIONS,
  RULE_OPTIONS,
  buildSharedFacilityRoomPayload,
  SHARED_FACILITY_ROOM_NAME,
  applyElectricityToFacilities,
} from "../../constants/listing";

const EMPTY_ROOM = {
  name: "",
  price: "",
  size: "",
  facilities: [],
  availableCount: 1,
  electricityIncluded: null,
};

const PHOTO_MAX = 8;
const PHOTO_MIME = ["image/jpeg", "image/png", "image/webp"];

const STEPS = [
  { label: "Data Kos", desc: "Informasi dasar properti kamu", icon: Home },
  { label: "Lokasi", desc: "Alamat & titik peta", icon: MapPinIcon },
  { label: "Fasilitas Kamar", desc: "Fasilitas & jumlah kamar per tipe", icon: Lightbulb },
  { label: "Detail Tipe Kamar", desc: "Nama, ukuran & harga tipe kamar", icon: Layers },
  { label: "Foto & Tipe Lain", desc: "Upload foto, lalu tambah tipe kamar jika perlu", icon: Camera },
];

const getToken = () => localStorage.getItem("token") || "";

const authHeaders = (json = false) => {
  const headers = new Headers();
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (json) headers.set("Content-Type", "application/json");
  return headers;
};

const parseApiError = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (data?.message) return data.message;
  if (Array.isArray(data?.error)) return data.error.map((e) => e.message).join(", ");
  return "Request gagal";
};

export default function CreateListingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  // Listing data (untuk KostListing model)
  const [form, setForm] = useState({
    name: "",
    areaDesa: "",
    areaKecamatan: "",
    areaKabupaten: "",
    genderType: "PUTRA",
    description: "",
    contactNumber: "",
    rules: [],
    newRule: "",
    sharedFacilities: [],
    newSharedFacility: "",
  });

  // Koordinat dari map picker
  const [latLng, setLatLng] = useState(null);

  // Room type data (untuk RoomType model)
  const [room, setRoom] = useState({
    name: "",
    price: "",
    size: "",
    facilities: [],
    availableCount: 1,
  });

  // Room photos dengan sortOrder
  const [roomPhotos, setRoomPhotos] = useState([]); // Array of File objects
  const [sharedFacilityPhotos, setSharedFacilityPhotos] = useState([]);
  // Tipe kamar yang sudah diisi (sebelum submit akhir)
  const [savedRoomDrafts, setSavedRoomDrafts] = useState([]);

  const toggleItem = (list, item) =>
    list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

  const addCustomRule = () => {
    const raw = form.newRule?.trim();
    if (!raw) return;
    const exists = form.rules.some((r) => r.toLowerCase() === raw.toLowerCase());
    if (exists) {
      setForm({ ...form, newRule: "" });
      return;
    }
    setForm({
      ...form,
      rules: [...form.rules, raw],
      newRule: "",
    });
  };

  const addCustomSharedFacility = () => {
    const raw = form.newSharedFacility?.trim();
    if (!raw) return;
    const exists = form.sharedFacilities.some((f) => f.toLowerCase() === raw.toLowerCase());
    if (exists) {
      setForm({ ...form, newSharedFacility: "" });
      return;
    }
    setForm({
      ...form,
      sharedFacilities: [...form.sharedFacilities, raw],
      newSharedFacility: "",
    });
  };

  const validateStep = () => {
    const e = {};
    
    if (step === 1) {
      if (form.name.trim().length < 3) e.name = "Nama minimal 3 karakter";
      if (form.description.trim().length < 10) e.description = "Deskripsi minimal 10 karakter";
      if (form.contactNumber.trim().length < 8) e.contactNumber = "Nomor kontak minimal 8 digit";
      if (form.rules.length === 0) e.rules = "Pilih minimal 1 peraturan";
      if (form.sharedFacilities.length > 0 && sharedFacilityPhotos.length === 0) {
        e.sharedFacilityPhotos = "Upload minimal 1 foto fasilitas bersama";
      }
      if (sharedFacilityPhotos.length > 0 && form.sharedFacilities.length === 0) {
        e.sharedFacilitiesList = "Pilih minimal 1 fasilitas kost bersama";
      }
    }
    
    if (step === 2) {
      if (form.areaDesa.trim().length < 2) e.areaDesa = "Kelurahan/desa minimal 2 karakter";
      if (form.areaKecamatan.trim().length < 2) e.areaKecamatan = "Kecamatan wajib diisi";
      if (form.areaKabupaten.trim().length < 2) e.areaKabupaten = "Kabupaten/kota wajib diisi";
      if (!latLng) e.latLng = "Tandai lokasi di peta";
    }
    
    if (step === 3) {
      if (room.facilities.length === 0) e.facilities = "Pilih minimal 1 fasilitas kamar";
      if (room.electricityIncluded === null) e.electricity = "Pilih apakah listrik termasuk atau belum";
      if (room.availableCount < 1) e.availableCount = "Minimal 1 kamar harus tersedia";
    }

    if (step === 4) {
      if (room.name.trim().toLowerCase() === SHARED_FACILITY_ROOM_NAME.toLowerCase()) {
        e.roomName = `"${SHARED_FACILITY_ROOM_NAME}" reserved — gunakan step Foto Fasilitas Bersama`;
      }
      if (room.name.trim().length < 2) e.roomName = "Nama tipe kamar minimal 2 karakter";
      if (!room.size.trim()) e.roomSize = "Ukuran kamar wajib diisi";
      const price = Math.floor(Number(room.price));
      if (!price || price <= 0) e.roomPrice = "Harga wajib diisi (angka bulat, lebih dari 0)";
    }

    if (step === 5) {
      if (roomPhotos.length === 0) e.photos = "Upload minimal 1 foto kamar";
      if (roomPhotos.length > PHOTO_MAX) e.photos = `Maksimal ${PHOTO_MAX} foto`;
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const addPhotos = (fileList) => {
    const incoming = Array.from(fileList || []);
    const next = [...roomPhotos];
    for (const file of incoming) {
      if (next.length >= PHOTO_MAX) break;
      if (PHOTO_MIME.includes(file.type)) next.push(file);
    }
    setRoomPhotos(next);
  };

  const validateRoomDraft = () => {
    const e = {};
    if (room.facilities.length === 0) e.facilities = "Pilih minimal 1 fasilitas kamar";
    if (room.electricityIncluded === null) e.electricity = "Pilih apakah listrik termasuk atau belum";
    if (room.availableCount < 1) e.availableCount = "Minimal 1 kamar harus tersedia";
    if (room.name.trim().length < 2) e.roomName = "Nama tipe kamar minimal 2 karakter";
    if (!room.size.trim()) e.roomSize = "Ukuran kamar wajib diisi";
    const price = Math.floor(Number(room.price));
    if (!price || price <= 0) e.roomPrice = "Harga wajib diisi (angka bulat, lebih dari 0)";
    if (roomPhotos.length === 0) e.photos = "Upload minimal 1 foto kamar";
    if (roomPhotos.length > PHOTO_MAX) e.photos = `Maksimal ${PHOTO_MAX} foto`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildCurrentRoomDraft = () => ({
    room: {
      name: room.name.trim(),
      price: Math.floor(Number(room.price)),
      size: room.size.trim(),
      facilities: applyElectricityToFacilities(room.facilities, room.electricityIncluded),
      availableCount: Number(room.availableCount),
    },
    photos: [...roomPhotos],
  });

  const handleAddAnotherRoomType = () => {
    if (!validateRoomDraft()) return;
    setSavedRoomDrafts((prev) => [...prev, buildCurrentRoomDraft()]);
    setRoom({ ...EMPTY_ROOM });
    setRoomPhotos([]);
    setErrors({});
    setSubmitError("");
    setStep(3);
  };

  const removeSavedDraft = (index) => {
    setSavedRoomDrafts((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadPhotosToRoom = async (api, roomId, photos) => {
    if (!photos?.length) return;
    for (const file of photos) {
      const formData = new FormData();
      formData.append("photos", file);
      const resPhotos = await fetch(`${api}/owner/room-types/${roomId}/photos`, {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });
      if (!resPhotos.ok) throw new Error(await parseApiError(resPhotos));
    }
  };

  const createSharedFacilityRoomWithPhotos = async (api, listingId, fallbackPrice) => {
    if (form.sharedFacilities.length === 0 && sharedFacilityPhotos.length === 0) return;

    const payload = buildSharedFacilityRoomPayload(form.sharedFacilities, fallbackPrice);
    const resRoom = await fetch(`${api}/owner/listings/${listingId}/room-types`, {
      method: "POST",
      headers: authHeaders(true),
      body: JSON.stringify(payload),
    });
    if (!resRoom.ok) throw new Error(await parseApiError(resRoom));
    const roomJson = await resRoom.json();
    const roomId = roomJson.data?.id;
    if (!roomId) throw new Error("ID fasilitas bersama tidak diterima dari server");
    await uploadPhotosToRoom(api, roomId, sharedFacilityPhotos);
  };

  const createRoomTypeWithPhotos = async (api, listingId, draft) => {
    const payload = {
      ...draft.room,
      facilities: draft.room.facilities,
    };
    const resRoom = await fetch(`${api}/owner/listings/${listingId}/room-types`, {
      method: "POST",
      headers: authHeaders(true),
      body: JSON.stringify(payload),
    });
    if (!resRoom.ok) throw new Error(await parseApiError(resRoom));
    const roomJson = await resRoom.json();
    const roomId = roomJson.data?.id;
    if (!roomId) throw new Error("Room Type ID tidak diterima dari server");

    if (draft.photos.length > 0) {
      await uploadPhotosToRoom(api, roomId, draft.photos);
    }
  };

  const handleSubmit = async () => {
    if (!validateRoomDraft()) return;
    if (!getToken()) {
      setSubmitError("Sesi habis. Silakan login ulang sebagai pemilik.");
      return;
    }

    const allRoomDrafts = [...savedRoomDrafts, buildCurrentRoomDraft()];

    setLoading(true);
    setSubmitError("");

    const api = getApiBase();

    try {
      const resListing = await fetch(`${api}/listings/owner`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify({
          name: form.name.trim(),
          address: buildListingAddress(form.areaDesa, form.areaKecamatan, form.areaKabupaten),
          genderType: form.genderType,
          description: form.description.trim(),
          contactNumber: form.contactNumber.trim(),
          rules: form.rules,
          latitude: Number(latLng.lat),
          longitude: Number(latLng.lng),
        }),
      });

      if (!resListing.ok) throw new Error(await parseApiError(resListing));
      const listingJson = await resListing.json();
      const listingId = listingJson.data?.id;
      if (!listingId) throw new Error("Listing ID tidak diterima dari server");

      for (const draft of allRoomDrafts) {
        await createRoomTypeWithPhotos(api, listingId, draft);
      }

      const minPrice = Math.min(...allRoomDrafts.map((d) => d.room.price));
      await createSharedFacilityRoomWithPhotos(api, listingId, minPrice);

      navigate("/owner/properti");
    } catch (err) {
      console.error("Create listing:", err);
      setSubmitError(err.message || "Gagal menyimpan kost");
    } finally {
      setLoading(false);
    }
  };

  const SavedDraftsList = () =>
    savedRoomDrafts.length === 0 ? null : (
      <div
        style={{
          marginBottom: 20,
          padding: 14,
          borderRadius: 12,
          background: "#F5F3FF",
          border: "1px solid #DDD6FE",
        }}
      >
        <p style={{ fontSize: 12, fontWeight: 700, color: "#4F46E5", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.4 }}>
          Tipe kamar tersimpan ({savedRoomDrafts.length})
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {savedRoomDrafts.map((d, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                padding: "10px 12px",
                background: "white",
                borderRadius: 10,
                border: "1px solid #E0E7FF",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#1e1b4b" }}>{d.room.name}</p>
                <p style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                  Rp {d.room.price.toLocaleString("id-ID")} · {d.room.size} · {d.photos.length} foto
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeSavedDraft(i)}
                style={{
                  flexShrink: 0,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#ef4444",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: 8,
                  padding: "6px 10px",
                  cursor: "pointer",
                }}
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      </div>
    );

  const currentRoomIndex = savedRoomDrafts.length + 1;
  const totalRoomTypesLabel =
    savedRoomDrafts.length > 0
      ? `${savedRoomDrafts.length + 1} tipe kamar`
      : "1 tipe kamar (bisa ditambah)";

  const RoomTypeBanner = () => (
    <div
      style={{
        marginBottom: 20,
        padding: "14px 16px",
        borderRadius: 12,
        background: "linear-gradient(135deg, #F5F3FF 0%, #f0fdf4 100%)",
        border: "1px solid #DDD6FE",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "#4F46E5",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        {currentRoomIndex}
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: "#1e1b4b", marginBottom: 4 }}>
          Tipe kamar ke-{currentRoomIndex}
          {room.name.trim() ? `: ${room.name.trim()}` : ""}
        </p>
        <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.5, margin: 0 }}>
          Satu kost bisa punya beberapa tipe kamar (Standar, Deluxe, VIP, dll.). Isi tipe ini dulu —
          setelah upload foto di langkah terakhir, klik <strong>Tipe kamar lain</strong> untuk menambah.
        </p>
      </div>
    </div>
  );

  const currentStepData = STEPS[step - 1];
  const CurrentIcon = currentStepData.icon;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .clp-root {
          font-family: 'Outfit', -apple-system, sans-serif;
          background: #f5f6fa;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* TOP HEADER */
        .clp-topbar {
          background: #4F46E5;
          padding: 0 32px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(79,70,229,0.18);
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
          background: #F5F3FF;
          border-color: #DDD6FE;
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
          background: #4F46E5;
          color: white;
          border: none;
          box-shadow: 0 0 0 4px rgba(79,70,229,0.15);
        }

        .clp-step-info { flex: 1; min-width: 0; }

        .clp-step-name {
          font-size: 13px;
          font-weight: 600;
          color: #1e1b4b;
          line-height: 1.2;
        }

        .clp-sidebar-step.done .clp-step-name { color: #15803d; }
        .clp-sidebar-step.active .clp-step-name { color: #4F46E5; }

        .clp-step-subdesc {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 2px;
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .clp-sidebar-step.active .clp-step-subdesc { color: #C7D2FE; }
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
          background: #4F46E5;
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

        .clp-content-breadcrumb span { color: #4F46E5; font-weight: 600; }

        .clp-content-title-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .clp-content-icon-wrap {
          width: 48px;
          height: 48px;
          background: #F5F3FF;
          border: 1.5px solid #DDD6FE;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4F46E5;
          flex-shrink: 0;
        }

        .clp-content-title {
          font-size: 24px;
          font-weight: 800;
          color: #1e1b4b;
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
          color: #1e1b4b;
          background: #FAFAFE;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          font-family: inherit;
          font-weight: 500;
        }

        .clp-input:focus, .clp-textarea:focus {
          border-color: #A78BFA;
          background: white;
          box-shadow: 0 0 0 3px rgba(129,140,248,0.1);
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
          background: #FAFAFE;
          color: #475569;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s;
          font-family: inherit;
        }

        .clp-chip:hover { border-color: #C7D2FE; background: #EEF2FF; }

        .clp-chip.active {
          border-color: #4F46E5;
          background: #F5F3FF;
          color: #4F46E5;
        }

        .clp-chip-check {
          width: 16px;
          height: 16px;
          background: #4F46E5;
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
          background: #FAFAFE;
          cursor: pointer;
          transition: all 0.18s;
          font-family: inherit;
          color: #334155;
          font-size: 14px;
          font-weight: 500;
          text-align: left;
        }

        .clp-toggle-row:hover { border-color: #C7D2FE; background: #EEF2FF; }

        .clp-toggle-row.active {
          border-color: #4F46E5;
          background: #F5F3FF;
          color: #4F46E5;
          font-weight: 600;
        }

        .clp-toggle-check {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #4F46E5;
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
          background: #FAFAFE;
          color: #475569;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s;
          font-family: inherit;
        }

        .clp-gender-btn:hover { border-color: #C7D2FE; }
        .clp-gender-btn.active {
          border-color: #4F46E5;
          background: #F5F3FF;
          color: #4F46E5;
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
          background: #F5F3FF;
          border: 1.5px solid #DDD6FE;
          border-radius: 10px;
          color: #4F46E5;
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
          background: #FAFAFE;
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

        .clp-counter-btn:hover { border-color: #4F46E5; background: #F5F3FF; color: #4F46E5; }
        .clp-counter-btn:active { transform: scale(0.95); }

        .clp-counter-input {
          width: 80px;
          text-align: center;
          font-size: 36px;
          font-weight: 800;
          color: #1e1b4b;
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
          background: #FAFAFE;
        }

        .clp-upload-zone:hover, .clp-upload-zone.has-files {
          border-color: #A78BFA;
          background: #F5F3FF;
        }

        .clp-upload-icon-wrap {
          width: 52px;
          height: 52px;
          margin: 0 auto 14px;
          background: #4F46E5;
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
          background: #FAFAFE;
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
          background: #4F46E5;
          color: white;
          box-shadow: 0 4px 14px rgba(79,70,229,0.25);
        }

        .clp-btn-primary:hover:not(:disabled) {
          background: #4338CA;
          box-shadow: 0 6px 20px rgba(79,70,229,0.3);
          transform: translateY(-1px);
        }

        .clp-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .clp-btn-outline {
          background: white;
          color: #475569;
          border: 1.5px solid #e2e8f0;
        }

        .clp-btn-outline:hover {
          border-color: #4F46E5;
          color: #4F46E5;
          background: #F5F3FF;
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
          background: #EEF2FF;
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
                <span style={{ color: "#4F46E5", fontWeight: 700 }}>
                  {step - 1}/{STEPS.length - 1}
                </span>
              </div>
              <div className="clp-sidebar-progress-bar">
                <div
                  className="clp-sidebar-progress-fill"
                  style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
                />
              </div>
              {(step >= 3 || savedRoomDrafts.length > 0) && (
                <div
                  style={{
                    marginTop: 14,
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: "#F5F3FF",
                    border: "1px solid #DDD6FE",
                  }}
                >
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>
                    Tipe kamar
                  </p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#4F46E5", margin: 0 }}>
                    {totalRoomTypesLabel}
                  </p>
                </div>
              )}
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
              {submitError && (
                <div
                  style={{
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: 10,
                    padding: "12px 16px",
                    fontSize: 13,
                    color: "#b91c1c",
                    fontWeight: 600,
                    marginBottom: 20,
                  }}
                >
                  {submitError}
                </div>
              )}

              {/* STEP 1: Data Kos */}
              {step === 1 && (
                <>
                  <div className="clp-field">
                    <label className="clp-label">Nama Kost</label>
                    <input
                      className={`clp-input${errors.name ? " err" : ""}`}
                      placeholder="cth. Kost Melati Indah"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                    {errors.name && <p className="clp-error">⚠ {errors.name}</p>}
                  </div>

                  <div className="clp-field">
                    <label className="clp-label">Tipe Kost</label>
                    <div className="clp-gender-group">
                      {GENDER_OPTIONS.map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          className={`clp-gender-btn${form.genderType === value ? " active" : ""}`}
                          onClick={() => setForm({ ...form, genderType: value })}
                        >
                          {value === "PUTRA" ? "🧑" : value === "PUTRI" ? "👩" : "👥"} {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="clp-field">
                    <label className="clp-label">Nomor Kontak (WhatsApp)</label>
                    <input
                      className={`clp-input${errors.contactNumber ? " err" : ""}`}
                      placeholder="cth. 08123456789"
                      value={form.contactNumber}
                      onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                    />
                    {errors.contactNumber && <p className="clp-error">⚠ {errors.contactNumber}</p>}
                  </div>

                  <div className="clp-field">
                    <label className="clp-label">Deskripsi</label>
                    <textarea
                      className={`clp-textarea${errors.description ? " err" : ""}`}
                      rows={4}
                      placeholder="Ceritakan tentang kost kamu, lingkungan sekitar, akses transportasi..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                    {errors.description && <p className="clp-error">⚠ {errors.description}</p>}
                  </div>

                  <div className="clp-field">
                    <label className="clp-label">Peraturan Kos</label>
                    <p style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, marginBottom: 10 }}>
                      Pilih minimal 1 peraturan yang berlaku
                    </p>
                    <div className="clp-toggle-list">
                      {RULE_OPTIONS.map((rule) => {
                        const checked = form.rules.includes(rule);
                        return (
                          <button
                            key={rule}
                            type="button"
                            onClick={() =>
                              setForm({ ...form, rules: toggleItem(form.rules, rule) })
                            }
                            className={`clp-toggle-row${checked ? " active" : ""}`}
                          >
                            <span>{rule}</span>
                            {checked && (
                              <span className="clp-toggle-check">
                                <Check size={12} color="white" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #e8eaf2" }}>
                      <p style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 10 }}>
                        Tambah Peraturan Custom
                      </p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          type="text"
                          className="clp-input"
                          placeholder="cth. Tidak menerima tamu setelah jam 22.00"
                          value={form.newRule || ""}
                          onChange={(e) => setForm({ ...form, newRule: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addCustomRule();
                            }
                          }}
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={addCustomRule}
                          style={{
                            padding: "11px 16px",
                            background: "#4F46E5",
                            color: "white",
                            border: "none",
                            borderRadius: 10,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Plus size={14} />
                          Tambah
                        </button>
                      </div>
                    </div>

                    {errors.rules && <p className="clp-error">⚠ {errors.rules}</p>}
                    {form.rules.length > 0 && (
                      <p style={{ fontSize: 12, color: "#22c55e", fontWeight: 600, marginTop: 8 }}>
                        ✓ {form.rules.length} peraturan dipilih
                      </p>
                    )}
                  </div>

                  <div className="clp-field">
                    <label className="clp-label">Fasilitas Kost (bersama)</label>
                    <p className="clp-info-note">
                      Fasilitas area umum gedung — disimpan terpisah dari fasilitas kamar.
                    </p>
                    <div className="clp-toggle-list">
                      {KOST_FACILITY_OPTIONS.map((f) => {
                        const checked = form.sharedFacilities.includes(f);
                        return (
                          <button
                            key={f}
                            type="button"
                            onClick={() =>
                              setForm({
                                ...form,
                                sharedFacilities: toggleItem(form.sharedFacilities, f),
                              })
                            }
                            className={`clp-toggle-row${checked ? " active" : ""}`}
                          >
                            <span>{f}</span>
                            {checked && (
                              <span className="clp-toggle-check">
                                <Check size={12} color="white" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #e8eaf2" }}>
                      <p style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 10 }}>
                        Tambah fasilitas bersama custom
                      </p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          type="text"
                          className="clp-input"
                          placeholder="cth. Mushola, Jemuran atap"
                          value={form.newSharedFacility || ""}
                          onChange={(e) => setForm({ ...form, newSharedFacility: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addCustomSharedFacility();
                            }
                          }}
                          style={{ flex: 1 }}
                        />
                        <button type="button" onClick={addCustomSharedFacility} className="clp-btn clp-btn-primary" style={{ padding: "11px 16px", fontSize: 12 }}>
                          <Plus size={14} /> Tambah
                        </button>
                      </div>
                    </div>
                    <SelectedFacilityTags
                      items={form.sharedFacilities}
                      label="Fasilitas gedung terpilih"
                      onRemove={(fac) =>
                        setForm({
                          ...form,
                          sharedFacilities: form.sharedFacilities.filter((x) => x !== fac),
                        })
                      }
                    />
                    {errors.sharedFacilitiesList && (
                      <p className="clp-error" style={{ marginTop: 8 }}>⚠ {errors.sharedFacilitiesList}</p>
                    )}
                  </div>

                  <SharedFacilityPhotos
                    variant="create"
                    files={sharedFacilityPhotos}
                    onFilesChange={setSharedFacilityPhotos}
                    error={errors.sharedFacilityPhotos || errors.sharedFacilitiesList}
                  />
                </>
              )}

              {/* STEP 2: Lokasi */}
              {step === 2 && (
                <>
                  <div className="clp-field">
                    <label className="clp-label">Area Lokasi (tampil ke user)</label>
                    <p className="clp-info-note">
                      Hanya kelurahan/desa, kecamatan, dan kabupaten — tanpa nama jalan atau nomor rumah.
                      Koordinat pasti hanya untuk pemilik &amp; admin; user melihat area perkiraan di peta.
                    </p>
                  </div>
                  <AreaLocationFields
                    variant="create"
                    values={{
                      areaKabupaten: form.areaKabupaten,
                      areaKecamatan: form.areaKecamatan,
                      areaDesa: form.areaDesa,
                    }}
                    errors={errors}
                    onChange={(area) => setForm({ ...form, ...area })}
                  />
                  {(form.areaDesa || form.areaKecamatan || form.areaKabupaten) && (
                    <div style={{ marginBottom: 16, padding: "12px 14px", borderRadius: 10, background: "#F5F3FF", border: "1px solid #DDD6FE", fontSize: 12, color: "#4338CA" }}>
                      <strong>Preview publik:</strong>{" "}
                      {buildListingAddress(form.areaDesa, form.areaKecamatan, form.areaKabupaten) || "—"}
                    </div>
                  )}

                  <div className="clp-field">
                    <label className="clp-label">Tandai Lokasi di Peta (rahasia)</label>
                    <p className="clp-info-note">
                      📍 Pin untuk jarak &amp; validasi — tidak ditampilkan persis ke calon penyewa.
                    </p>
                    <div className="clp-map-container">
                      <MapPicker setLatLng={setLatLng} />
                    </div>
                    {latLng && (
                      <div className="clp-coord-badge">
                        <MapPin size={15} />
                        <span>
                          {Number(latLng.lat).toFixed(5)}, {Number(latLng.lng).toFixed(5)}
                        </span>
                        <span
                          style={{
                            background: "#22c55e",
                            color: "white",
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 6,
                            marginLeft: 4,
                          }}
                        >
                          Tersimpan
                        </span>
                      </div>
                    )}
                    {errors.latLng && <p className="clp-error">⚠ {errors.latLng}</p>}
                  </div>
                </>
              )}

              {/* STEP 3: Fasilitas & Ketersediaan */}
              {step === 3 && (
                <>
                  <RoomTypeBanner />
                  <SavedDraftsList />
                  <div className="clp-field">
                    <label className="clp-label">Fasilitas Kamar (khusus tipe ini)</label>
                    <p className="clp-info-note">
                      Fasilitas di dalam kamar untuk tipe ini saja. Fasilitas kost bersama sudah diisi di langkah Data Kos.
                    </p>
                    <RoomFacilityFields
                      facilities={room.facilities}
                      onChange={(next) => setRoom({ ...room, facilities: next })}
                      error={errors.facilities}
                    />
                  </div>

                  <div className="clp-field">
                    <ElectricityIncludedField
                      value={room.electricityIncluded}
                      onChange={(val) => setRoom({ ...room, electricityIncluded: val })}
                      error={errors.electricity}
                    />
                  </div>

                  <div className="clp-field">
                    <label className="clp-label">Jumlah Kamar Tersedia</label>
                    <p className="clp-info-note">Masukkan jumlah kamar yang bisa disewa saat ini.</p>
                    <div className="clp-counter-wrap">
                      <button
                        type="button"
                        className="clp-counter-btn"
                        onClick={() =>
                          setRoom({
                            ...room,
                            availableCount: Math.max(1, Number(room.availableCount) - 1),
                          })
                        }
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        className="clp-counter-input"
                        value={room.availableCount}
                        onChange={(e) =>
                          setRoom({
                            ...room,
                            availableCount: Math.max(1, Number(e.target.value)),
                          })
                        }
                      />
                      <button
                        type="button"
                        className="clp-counter-btn"
                        onClick={() =>
                          setRoom({
                            ...room,
                            availableCount: Number(room.availableCount) + 1,
                          })
                        }
                      >
                        +
                      </button>
                    </div>
                    <p style={{ textAlign: "center", fontSize: 13, color: "#64748b", fontWeight: 600 }}>
                      kamar tersedia
                    </p>
                  </div>
                </>
              )}

              {/* STEP 4: Detail Kamar */}
              {step === 4 && (
                <>
                  <RoomTypeBanner />
                  <SavedDraftsList />
                  <div className="clp-field">
                    <label className="clp-label">Nama Tipe Kamar</label>
                    <input
                      className={`clp-input${errors.roomName ? " err" : ""}`}
                      placeholder="cth. Kamar Standar, Kamar Deluxe"
                      value={room.name}
                      onChange={(e) => setRoom({ ...room, name: e.target.value })}
                    />
                    {errors.roomName && <p className="clp-error">⚠ {errors.roomName}</p>}
                  </div>

                  <div className="clp-field">
                    <label className="clp-label">Ukuran Kamar</label>
                    <input
                      className={`clp-input${errors.roomSize ? " err" : ""}`}
                      placeholder="cth. 3x4 m, 4x5 m"
                      value={room.size}
                      onChange={(e) => setRoom({ ...room, size: e.target.value })}
                    />
                    {errors.roomSize && <p className="clp-error">⚠ {errors.roomSize}</p>}
                  </div>

                  <div className="clp-field">
                    <label className="clp-label">Harga per Bulan</label>
                    <div className="clp-price-wrap">
                      <span className="clp-price-prefix">Rp</span>
                      <input
                        type="number"
                        min="0"
                        className={`clp-input clp-price-input${errors.roomPrice ? " err" : ""}`}
                        placeholder="800000"
                        value={room.price}
                        onChange={(e) => setRoom({ ...room, price: e.target.value })}
                      />
                    </div>
                    {errors.roomPrice && <p className="clp-error">⚠ {errors.roomPrice}</p>}
                    {room.price && (
                      <p style={{ marginTop: 10, fontSize: 13, color: "#4F46E5", fontWeight: 700 }}>
                        ✓ Rp {Number(room.price).toLocaleString("id-ID")} / bulan
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* STEP 5: Foto Kamar */}
              {step === 5 && (
                <>
                  <RoomTypeBanner />
                  <SavedDraftsList />
                  <div
                    style={{
                      marginBottom: 16,
                      padding: "12px 14px",
                      borderRadius: 10,
                      background: "#fefce8",
                      border: "1px solid #fde047",
                      fontSize: 12,
                      color: "#713f12",
                      lineHeight: 1.55,
                    }}
                  >
                    <strong>Tip:</strong> Setelah upload foto tipe ini, klik tombol{" "}
                    <strong>Tipe kamar lain</strong> di bawah untuk menambah tipe berikutnya.
                    Baru klik <strong>Simpan Kost</strong> jika semua tipe sudah lengkap.
                  </div>
                  <p className="clp-info-note">
                    Upload minimal 1 foto (maks. {PHOTO_MAX}). Format JPG, PNG, atau WEBP — maks. 5MB
                    per file.
                  </p>
                  {errors.photos && <p className="clp-error" style={{ marginBottom: 12 }}>⚠ {errors.photos}</p>}
                  <label style={{ cursor: "pointer", display: "block" }}>
                    <div className={`clp-upload-zone${roomPhotos.length > 0 ? " has-files" : ""}`}>
                      <div className="clp-upload-icon-wrap">
                        {roomPhotos.length > 0 ? (
                          <ImageIcon size={24} />
                        ) : (
                          <Upload size={24} />
                        )}
                      </div>
                      <p className="clp-upload-text">
                        {roomPhotos.length > 0
                          ? `${roomPhotos.length} foto dipilih — klik untuk tambah lagi`
                          : "Klik untuk upload foto"}
                      </p>
                      <p className="clp-upload-sub">
                        JPG, PNG, WEBP — {roomPhotos.length}/{PHOTO_MAX} foto
                      </p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        addPhotos(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>

                  {roomPhotos.length > 0 && (
                    <>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: 24,
                        }}
                      >
                        <p
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            letterSpacing: "0.6px",
                            textTransform: "uppercase",
                            color: "#334155",
                          }}
                        >
                          Preview ({roomPhotos.length} foto)
                        </p>
                        <button
                          type="button"
                          onClick={() => setRoomPhotos([])}
                          style={{
                            fontSize: 12,
                            color: "#ef4444",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: 700,
                            fontFamily: "inherit",
                          }}
                        >
                          Hapus semua
                        </button>
                      </div>
                      <div className="clp-photo-grid">
                        {roomPhotos.map((file, i) => (
                          <div key={i} className="clp-photo-item">
                            <img src={URL.createObjectURL(file)} alt={`preview-${i}`} />
                            <div className="clp-photo-del">
                              <button
                                type="button"
                                onClick={() =>
                                  setRoomPhotos(roomPhotos.filter((_, idx) => idx !== i))
                                }
                              >
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
                  <button
                    type="button"
                    onClick={() => navigate("/owner/dashboard")}
                    className="clp-btn clp-btn-outline"
                  >
                    <ArrowLeft size={15} /> Dashboard
                  </button>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                {submitError && step === STEPS.length && (
                  <p style={{ fontSize: 12, color: "#ef4444", fontWeight: 600, textAlign: "right", maxWidth: 280 }}>
                    {submitError}
                  </p>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
                    {step} / {STEPS.length}
                  </span>
                  {step < STEPS.length ? (
                    <button type="button" onClick={handleNext} className="clp-btn clp-btn-primary">
                      Lanjut <ChevronRight size={16} />
                    </button>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                      <p style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textAlign: "right", maxWidth: 320, lineHeight: 1.45 }}>
                        Punya tipe kamar lain? Klik <strong>Tipe kamar lain</strong> dulu sebelum Simpan Kost.
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        onClick={handleAddAnotherRoomType}
                        disabled={loading}
                        className="clp-btn clp-btn-outline"
                        style={{ borderColor: "#4F46E5", color: "#4F46E5", fontWeight: 700 }}
                      >
                        <Plus size={16} /> Tipe kamar lain
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="clp-btn clp-btn-primary"
                      >
                        {loading ? (
                          <>
                            <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Check size={16} /> Simpan Kost
                            {savedRoomDrafts.length > 0 && ` (${savedRoomDrafts.length + 1} tipe)`}
                          </>
                        )}
                      </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}