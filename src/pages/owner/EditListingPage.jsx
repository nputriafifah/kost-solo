import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Save, Loader2, Camera, X, Check, BedDouble,
  Plus, Trash2, ChevronRight, ChevronDown,
} from "lucide-react";
import { getApiBase, resolveMediaUrl } from "../../config/apiBase";
import {
  KOST_FACILITY_OPTIONS,
  GENDER_OPTIONS,
  RULE_OPTIONS,
  extractKostFacilitiesFromRooms,
  getRoomOnlyFacilities,
  parseElectricityIncluded,
  applyElectricityToFacilities,
  buildSharedFacilityRoomPayload,
  findSharedFacilityRoom,
  getRentableRoomTypes,
  SHARED_FACILITY_ROOM_NAME,
} from "../../constants/listing";
import { buildListingAddress, parseListingAddress } from "../../utils/publicLocation";
import AreaLocationFields from "../../components/owner/AreaLocationFields";
import SharedFacilityPhotos from "../../components/owner/SharedFacilityPhotos";
import SelectedFacilityTags from "../../components/owner/SelectedFacilityTags";
import RoomFacilityFields from "../../components/owner/RoomFacilityFields";
import ElectricityIncludedField from "../../components/owner/ElectricityIncludedField";
import MapPicker from "../../components/owner/MapPicker";
import {
  matchKabupatenOption,
  matchKecamatanOption,
  matchKelurahanOption,
} from "../../constants/soloRegions";

const EMPTY_NEW_ROOM = {
  name: "",
  price: "",
  size: "",
  facilities: [],
  availableCount: 1,
  electricityIncluded: null,
};

const STEPS = [
  { label: "Data Kos", desc: "Perbarui info dasar kost" },
  { label: "Tipe Kamar", desc: "Tambah atau kelola tipe kamar" },
  { label: "Foto Kamar", desc: "Kelola foto tiap tipe kamar" },
];

const PHOTO_MAX = 8;
const PHOTO_MIME = ["image/jpeg", "image/png", "image/webp"];

const SHARED_PHOTO_KEY = "__shared__";

const emptyPhotoEntry = () => ({ newFiles: [], deletedIds: [], uploading: false });

const getPhotoEntry = (state, roomTypeId) => state[roomTypeId] || emptyPhotoEntry();

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
  .clp-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
  .clp-root h1, .clp-root h2, .clp-root h3 { font-family: 'Plus Jakarta Sans', sans-serif; }
  .clp-gradient { background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 30%, #2563eb 60%, #3b82f6 100%); }
  .clp-input {
    width: 100%; background: #f8faff; border: 1px solid #e2e8f4;
    border-radius: 10px; padding: 11px 14px; font-size: 14px; color: #1e293b;
    outline: none; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
  }
  .clp-input::placeholder { color: #94a3b8; }
  .clp-input:focus { border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
  .clp-input-error { border-color: #ef4444 !important; background: #fff5f5 !important; }
  .clp-btn-next {
    background: linear-gradient(135deg, #1d4ed8, #3b82f6);
    box-shadow: 0 4px 16px rgba(37,99,235,0.3); transition: all 0.2s;
    color: white; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600;
    border: none; cursor: pointer;
  }
  .clp-btn-next:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.4); }
  .clp-btn-next:disabled { opacity: 0.6; cursor: not-allowed; }
  .clp-btn-back {
    border: 1px solid #e2e8f4; background: white; color: #475569;
    transition: all 0.2s; font-family: 'DM Sans', sans-serif; font-weight: 500; cursor: pointer;
  }
  .clp-btn-back:hover { border-color: #3b82f6; color: #1d4ed8; background: #eff6ff; }
  .clp-err { color: #ef4444; font-size: 11px; margin-top: 4px; font-weight: 500; }
  .clp-photo-thumb {
    position: relative; aspect-ratio: 1; border-radius: 10px; overflow: hidden;
    border: 1px solid #e2e8f4;
  }
  .clp-photo-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s; }
  .clp-photo-thumb:hover img { transform: scale(1.04); }
  .clp-photo-del {
    position: absolute; top: 5px; right: 5px;
    width: 22px; height: 22px; border-radius: 50%;
    background: rgba(239,68,68,0.88); border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.2s;
  }
  .clp-photo-thumb:hover .clp-photo-del { opacity: 1; }
  .clp-photo-new .clp-photo-del { opacity: 1; }
  .clp-upload-zone {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    border: 2px dashed #cbd5e1; border-radius: 12px; padding: 18px;
    background: #f8faff; cursor: pointer; transition: all 0.2s;
  }
  .clp-upload-zone:hover { border-color: #3b82f6; background: #eff6ff; }
  .clp-room-card { background: white; border: 1px solid #e8edf6; border-radius: 18px; overflow: hidden; }
  .clp-step-fade { animation: clpFade 0.25s ease; }
  .clp-fac-chip {
    padding: 8px 12px; border-radius: 10px; border: 1px solid #e2e8f4;
    background: #f8faff; font-size: 12px; font-weight: 600; color: #475569;
    cursor: pointer; transition: all 0.15s;
  }
  .clp-fac-chip.active { background: #eff6ff; border-color: #3b82f6; color: #1d4ed8; }
  @keyframes clpFade { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
`;

const getToken = () => localStorage.getItem("token") || "";

const parseApiError = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (data?.message) return data.message;
  if (Array.isArray(data?.error)) return data.error.map((e) => e.message).join(", ");
  return "Request gagal";
};

export default function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = getApiBase();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [roomErrors, setRoomErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    areaDesa: "",
    areaKecamatan: "",
    areaKabupaten: "",
    description: "",
    contactNumber: "",
    genderType: "PUTRA",
    rules: [],
    sharedFacilities: [],
    newSharedFacility: "",
  });

  const [latLng, setLatLng] = useState(null);

  const [roomTypes, setRoomTypes] = useState([]);
  const [newRoom, setNewRoom] = useState({ ...EMPTY_NEW_ROOM });
  const [photoState, setPhotoState] = useState({});
  const [photoErrors, setPhotoErrors] = useState({});
  const [sharedPhotoError, setSharedPhotoError] = useState("");
  const [roomFacilityEdits, setRoomFacilityEdits] = useState({});
  const [roomElectricityEdits, setRoomElectricityEdits] = useState({});
  const [expandedRoomFacilitiesId, setExpandedRoomFacilitiesId] = useState(null);
  const [savingRoomFacilitiesId, setSavingRoomFacilitiesId] = useState(null);

  const sharedFacilityRoom = findSharedFacilityRoom(roomTypes);
  const rentableRoomTypes = getRentableRoomTypes(roomTypes);

  const syncPhotoState = useCallback((types) => {
    setPhotoState((prev) => {
      const next = {};
      getRentableRoomTypes(types || []).forEach((rt) => {
        if (!rt?.id) return;
        next[rt.id] = prev[rt.id] || emptyPhotoEntry();
      });
      const shared = findSharedFacilityRoom(types || []);
      if (shared?.id) {
        next[shared.id] = prev[shared.id] || prev[SHARED_PHOTO_KEY] || emptyPhotoEntry();
      } else if (prev[SHARED_PHOTO_KEY]) {
        next[SHARED_PHOTO_KEY] = prev[SHARED_PHOTO_KEY];
      }
      return next;
    });
  }, []);

  const refreshListing = useCallback(async () => {
    const res = await fetch(`${api}/listings/owner/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || "Gagal memuat data");
    const d = json.data || json;
    setRoomTypes(d.roomTypes || []);
    syncPhotoState(d.roomTypes || []);
    return d;
  }, [api, id, syncPhotoState]);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const d = await refreshListing();
        const area = parseListingAddress(d.address);
        const areaKabupaten = matchKabupatenOption(area.kabupaten);
        const areaKecamatan = matchKecamatanOption(areaKabupaten, area.kecamatan);
        const areaDesa = matchKelurahanOption(areaKabupaten, areaKecamatan, area.desa);
        setForm({
          name: d.name || "",
          areaDesa,
          areaKecamatan,
          areaKabupaten,
          description: d.description || "",
          contactNumber: d.contactNumber || "",
          genderType: d.genderType || "PUTRA",
          rules: Array.isArray(d.rules) ? d.rules : [],
          sharedFacilities: extractKostFacilitiesFromRooms(d.roomTypes),
          newSharedFacility: "",
        });
        const lat = Number(d.latitude);
        const lng = Number(d.longitude);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          setLatLng({ lat, lng });
        }
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [refreshListing]);

  useEffect(() => {
    const kostFac = extractKostFacilitiesFromRooms(roomTypes);
    const facNext = {};
    const elecNext = {};
    getRentableRoomTypes(roomTypes).forEach((room) => {
      if (!room?.id) return;
      facNext[room.id] = getRoomOnlyFacilities(room.facilities, kostFac);
      elecNext[room.id] = parseElectricityIncluded(room.facilities);
    });
    setRoomFacilityEdits(facNext);
    setRoomElectricityEdits(elecNext);
  }, [roomTypes]);

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 3) e.name = "Nama minimal 3 karakter";
    if (form.areaDesa.trim().length < 2) e.areaDesa = "Kelurahan/desa minimal 2 karakter";
    if (form.areaKecamatan.trim().length < 2) e.areaKecamatan = "Kecamatan wajib diisi";
    if (form.areaKabupaten.trim().length < 2) e.areaKabupaten = "Kabupaten/kota wajib diisi";
    if (form.description.trim().length < 10) e.description = "Deskripsi minimal 10 karakter";
    if (form.contactNumber.trim().length < 8) e.contactNumber = "Nomor kontak minimal 8 digit";
    if (!GENDER_OPTIONS.some((g) => g.value === form.genderType)) e.genderType = "Pilih tipe kost";
    if (!form.rules?.length) e.rules = "Pilih minimal 1 peraturan";
    if (form.sharedFacilities.length > 0) {
      const photoCount = sharedFacilityRoom?.photos?.length ?? 0;
      if (photoCount === 0) e.sharedFacilityPhotos = "Upload minimal 1 foto fasilitas bersama";
    }
    if ((sharedFacilityRoom?.photos?.length ?? 0) > 0 && form.sharedFacilities.length === 0) {
      e.sharedFacilitiesList = "Pilih minimal 1 fasilitas kost bersama";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
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

  const toggleRule = (rule) => {
    setForm((prev) => ({
      ...prev,
      rules: prev.rules.includes(rule)
        ? prev.rules.filter((r) => r !== rule)
        : [...prev.rules, rule],
    }));
  };

  const validateNewRoom = () => {
    const e = {};
    if (newRoom.name.trim().length < 2) e.name = "Nama tipe minimal 2 karakter";
    if (newRoom.name.trim().toLowerCase() === SHARED_FACILITY_ROOM_NAME.toLowerCase()) {
      e.name = `"${SHARED_FACILITY_ROOM_NAME}" reserved — gunakan upload foto fasilitas bersama`;
    }
    if (!newRoom.size.trim()) e.size = "Ukuran wajib diisi";
    const price = Math.floor(Number(newRoom.price));
    if (!price || price <= 0) e.price = "Harga wajib (angka bulat > 0)";
    if (newRoom.facilities.length === 0) e.facilities = "Pilih minimal 1 fasilitas kamar";
    if (newRoom.electricityIncluded === null) e.electricity = "Pilih apakah listrik termasuk atau belum";
    if (newRoom.availableCount < 0) e.availableCount = "Stok tidak valid";
    setRoomErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSaveRoomFacilities = async (roomTypeId) => {
    const facilities = roomFacilityEdits[roomTypeId] ?? [];
    const electricityIncluded = roomElectricityEdits[roomTypeId] ?? null;
    if (facilities.length === 0) {
      alert("Pilih minimal 1 fasilitas kamar");
      return;
    }
    if (electricityIncluded === null) {
      alert("Pilih apakah listrik termasuk atau belum");
      return;
    }
    setSavingRoomFacilitiesId(roomTypeId);
    try {
      const res = await fetch(`${api}/owner/room-types/${roomTypeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          facilities: applyElectricityToFacilities(facilities, electricityIncluded),
        }),
      });
      if (!res.ok) throw new Error(await parseApiError(res));
      await refreshListing();
      setExpandedRoomFacilitiesId(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingRoomFacilitiesId(null);
    }
  };

  const handleSaveInfo = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await fetch(`${api}/listings/owner/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          address: buildListingAddress(form.areaDesa, form.areaKecamatan, form.areaKabupaten),
          description: form.description.trim(),
          contactNumber: form.contactNumber.trim(),
          genderType: form.genderType,
          rules: form.rules,
          ...(latLng
            ? { latitude: Number(latLng.lat), longitude: Number(latLng.lng) }
            : {}),
        }),
      });
      if (!res.ok) throw new Error(await parseApiError(res));

      const latest = await refreshListing();
      const shared = findSharedFacilityRoom(latest.roomTypes || roomTypes);
      const facilitiesPayload =
        form.sharedFacilities.length > 0 ? form.sharedFacilities : ["Area Bersama"];

      if (shared?.id) {
        const patchRes = await fetch(`${api}/owner/room-types/${shared.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ facilities: facilitiesPayload }),
        });
        if (!patchRes.ok) throw new Error(await parseApiError(patchRes));
      } else if (form.sharedFacilities.length > 0) {
        const minPrice = Math.min(
          ...getRentableRoomTypes(latest.roomTypes || roomTypes)
            .map((r) => Number(r.price))
            .filter((p) => p > 0),
        ) || 1;
        const createRes = await fetch(`${api}/owner/listings/${id}/room-types`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(buildSharedFacilityRoomPayload(form.sharedFacilities, minPrice)),
        });
        if (!createRes.ok) throw new Error(await parseApiError(createRes));
        await refreshListing();
      }

      setStep(2);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const ensureSharedFacilityRoom = async () => {
    const current = findSharedFacilityRoom(roomTypes);
    if (current?.id) return current.id;

    const minPrice = Math.min(
      ...getRentableRoomTypes(roomTypes).map((r) => Number(r.price)).filter((p) => p > 0),
    ) || 1;
    const createRes = await fetch(`${api}/owner/listings/${id}/room-types`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(buildSharedFacilityRoomPayload(form.sharedFacilities, minPrice)),
    });
    if (!createRes.ok) throw new Error(await parseApiError(createRes));
    const json = await createRes.json();
    const latest = await refreshListing();
    return json.data?.id || findSharedFacilityRoom(latest.roomTypes || [])?.id;
  };

  const getSharedPhotoKey = () => sharedFacilityRoom?.id || SHARED_PHOTO_KEY;

  const uploadSharedFacilityPhotos = async (files) => {
    if (form.sharedFacilities.length === 0) {
      setSharedPhotoError("Pilih fasilitas kost bersama dulu");
      return;
    }

    const fileArr = Array.from(files || []).filter((f) => PHOTO_MIME.includes(f.type));
    if (fileArr.length === 0) {
      setSharedPhotoError("Format harus JPG, PNG, atau WEBP");
      return;
    }

    const key = getSharedPhotoKey();
    const room = sharedFacilityRoom;
    const currentCount = room
      ? countVisiblePhotos(room, room.id)
      : 0;

    if (currentCount + fileArr.length > PHOTO_MAX) {
      setSharedPhotoError(`Maksimal ${PHOTO_MAX} foto fasilitas bersama`);
      return;
    }

    setPhotoState((prev) => ({
      ...prev,
      [key]: { ...getPhotoEntry(prev, key), uploading: true },
    }));
    setSharedPhotoError("");

    try {
      const roomId = room?.id || (await ensureSharedFacilityRoom());
      const fd = new FormData();
      fileArr.forEach((f) => fd.append("photos", f));
      const uploadRes = await fetch(`${api}/owner/room-types/${roomId}/photos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      if (!uploadRes.ok) throw new Error(await parseApiError(uploadRes));
      await refreshListing();
      setPhotoState((prev) => ({
        ...prev,
        [roomId]: emptyPhotoEntry(),
      }));
    } catch (err) {
      setSharedPhotoError(err.message || "Gagal upload foto");
      setPhotoState((prev) => ({
        ...prev,
        [key]: { ...getPhotoEntry(prev, key), uploading: false },
      }));
    }
  };

  const markDeleteSharedPhoto = (photoId) => {
    const key = getSharedPhotoKey();
    markDelete(key, photoId);
  };

  const saveSharedPhotos = async () => {
    const key = sharedFacilityRoom?.id;
    if (!key) return;
    await savePhotos(key);
  };

  const handleAddRoomType = async () => {
    if (!validateNewRoom()) return;
    setSaving(true);
    try {
      const price = Math.floor(Number(newRoom.price));
      const res = await fetch(`${api}/owner/listings/${id}/room-types`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: newRoom.name.trim(),
          price,
          size: newRoom.size.trim(),
          facilities: applyElectricityToFacilities(newRoom.facilities, newRoom.electricityIncluded),
          availableCount: Number(newRoom.availableCount),
        }),
      });
      if (!res.ok) throw new Error(await parseApiError(res));
      await refreshListing();
      setNewRoom({ ...EMPTY_NEW_ROOM });
      setRoomErrors({});
      alert("Tipe kamar berhasil ditambahkan. Upload foto di langkah berikutnya.");
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoomType = async (roomTypeId, roomName) => {
    if (!window.confirm(`Hapus tipe kamar "${roomName}"? Foto terkait ikut terhapus.`)) return;
    try {
      const res = await fetch(`${api}/owner/room-types/${roomTypeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error(await parseApiError(res));
      await refreshListing();
    } catch (err) {
      alert(err.message);
    }
  };

  const countVisiblePhotos = (room, roomTypeId, state = photoState) => {
    const ps = getPhotoEntry(state, roomTypeId);
    return (room?.photos || []).filter((p) => !ps.deletedIds.includes(p.id)).length;
  };

  const markDelete = (roomTypeId, photoId) => {
    setPhotoState((prev) => {
      const entry = getPhotoEntry(prev, roomTypeId);
      return {
        ...prev,
        [roomTypeId]: { ...entry, deletedIds: [...entry.deletedIds, photoId] },
      };
    });
  };

  const hasPhotoChanges = (roomTypeId) =>
    getPhotoEntry(photoState, roomTypeId).deletedIds.length > 0;

  const uploadNewPhotos = async (roomTypeId, files) => {
    const room = roomTypes.find((r) => r.id === roomTypeId);
    const fileArr = Array.from(files || []).filter((f) => PHOTO_MIME.includes(f.type));
    if (fileArr.length === 0) {
      setPhotoErrors((prev) => ({ ...prev, [roomTypeId]: "Format harus JPG, PNG, atau WEBP" }));
      return;
    }

    const currentCount = countVisiblePhotos(room, roomTypeId);
    if (currentCount + fileArr.length > PHOTO_MAX) {
      setPhotoErrors((prev) => ({
        ...prev,
        [roomTypeId]: `Maksimal ${PHOTO_MAX} foto per tipe kamar (saat ini ${currentCount})`,
      }));
      return;
    }

    setPhotoState((prev) => ({
      ...prev,
      [roomTypeId]: { ...getPhotoEntry(prev, roomTypeId), uploading: true },
    }));
    setPhotoErrors((prev) => ({ ...prev, [roomTypeId]: "" }));

    try {
      const fd = new FormData();
      fileArr.forEach((f) => fd.append("photos", f));
      const uploadRes = await fetch(`${api}/owner/room-types/${roomTypeId}/photos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      if (!uploadRes.ok) throw new Error(await parseApiError(uploadRes));
      await refreshListing();
      setPhotoState((prev) => ({
        ...prev,
        [roomTypeId]: { newFiles: [], deletedIds: getPhotoEntry(prev, roomTypeId).deletedIds, uploading: false },
      }));
    } catch (err) {
      setPhotoErrors((prev) => ({ ...prev, [roomTypeId]: err.message || "Gagal upload foto" }));
      setPhotoState((prev) => ({
        ...prev,
        [roomTypeId]: { ...getPhotoEntry(prev, roomTypeId), uploading: false },
      }));
    }
  };

  const savePhotos = async (roomTypeId) => {
    const s = getPhotoEntry(photoState, roomTypeId);
    if (s.deletedIds.length === 0) return;

    setPhotoState((prev) => ({
      ...prev,
      [roomTypeId]: { ...getPhotoEntry(prev, roomTypeId), uploading: true },
    }));
    setPhotoErrors((prev) => ({ ...prev, [roomTypeId]: "" }));

    try {
      for (const photoId of s.deletedIds) {
        const deleteRes = await fetch(`${api}/owner/photos/${photoId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!deleteRes.ok) throw new Error(await parseApiError(deleteRes));
      }

      await refreshListing();
      setPhotoState((prev) => ({
        ...prev,
        [roomTypeId]: emptyPhotoEntry(),
      }));
    } catch (err) {
      setPhotoErrors((prev) => ({ ...prev, [roomTypeId]: err.message || "Gagal menyimpan foto" }));
      setPhotoState((prev) => ({
        ...prev,
        [roomTypeId]: { ...getPhotoEntry(prev, roomTypeId), uploading: false },
      }));
    }
  };

  const goToPhotos = () => {
    if (roomTypes.length === 0) {
      alert("Tambahkan minimal 1 tipe kamar terlebih dahulu.");
      return;
    }
    setStep(3);
  };

  const handleFinish = () => navigate("/owner/properti");

  return (
    <>
      <style>{STYLES}</style>
      <div
        className="clp-root min-h-screen flex items-start justify-center py-10 px-4"
        style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 50%, #f0f4ff 100%)" }}
      >
        <div className="w-full max-w-2xl">

          <div className="mb-6">
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-1">Atap</p>
            <h1 className="text-2xl font-extrabold text-slate-800" style={{ fontFamily: "Plus Jakarta Sans" }}>Edit Kost</h1>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-4">
            <div className="flex items-center">
              {STEPS.map((s, i) => {
                const num = i + 1;
                const done = num < step;
                const active = num === step;
                return (
                  <div key={num} className="flex items-center flex-1 min-w-0">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 flex-shrink-0"
                        style={{
                          background: done ? "linear-gradient(135deg,#1d4ed8,#3b82f6)" : active ? "linear-gradient(135deg,#1e3a8a,#1d4ed8)" : "#f1f5f9",
                          color: done || active ? "white" : "#94a3b8",
                          boxShadow: active ? "0 0 0 4px rgba(59,130,246,0.15)" : "none",
                        }}
                      >
                        {done ? <Check size={14} /> : num}
                      </div>
                      <span className="text-[10px] mt-1 font-medium text-center leading-tight hidden sm:block"
                        style={{ color: active ? "#1d4ed8" : done ? "#3b82f6" : "#94a3b8" }}>
                        {s.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="flex-1 h-0.5 mx-2 rounded transition-all duration-500"
                        style={{ background: done ? "linear-gradient(90deg,#3b82f6,#60a5fa)" : "#e2e8f0" }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="clp-gradient px-8 py-5">
              <p className="text-blue-200 text-xs font-medium mb-0.5">{STEPS[step - 1].desc}</p>
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: "Plus Jakarta Sans" }}>{STEPS[step - 1].label}</h2>
            </div>

            <div className="px-8 py-7 clp-step-fade" key={step}>

              {step === 1 && (
                loading ? (
                  <p style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", padding: "24px 0" }}>Memuat data...</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Kost</label>
                      <input className={`clp-input${errors.name ? " clp-input-error" : ""}`} placeholder="cth. Kost Melati Indah"
                        value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                      {errors.name && <p className="clp-err">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Area Lokasi (tampil ke user)</label>
                      <p className="text-xs text-slate-400 mb-3">Tanpa jalan/no rumah — pilih kabupaten, kecamatan, lalu kelurahan/desa.</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <AreaLocationFields
                          variant="edit"
                          values={{
                            areaKabupaten: form.areaKabupaten,
                            areaKecamatan: form.areaKecamatan,
                            areaDesa: form.areaDesa,
                          }}
                          errors={errors}
                          onChange={(area) => setForm({ ...form, ...area })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tandai Lokasi di Peta (rahasia)</label>
                      <p className="text-xs text-slate-400 mb-3">Pin untuk jarak &amp; validasi — tidak ditampilkan persis ke calon penyewa.</p>
                      <MapPicker setLatLng={setLatLng} initialLatLng={latLng} />
                      {latLng && (
                        <p className="clp-err" style={{ color: "#64748b", marginTop: 8, fontSize: 11 }}>
                          Koordinat: {latLng.lat.toFixed(5)}, {latLng.lng.toFixed(5)}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Deskripsi</label>
                      <textarea className={`clp-input${errors.description ? " clp-input-error" : ""}`} style={{ resize: "none" }} rows={4}
                        placeholder="Ceritakan tentang kost kamu..."
                        value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                      {errors.description && <p className="clp-err">{errors.description}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nomor Kontak</label>
                      <input className={`clp-input${errors.contactNumber ? " clp-input-error" : ""}`} placeholder="cth. 08123456789"
                        value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} />
                      {errors.contactNumber && <p className="clp-err">{errors.contactNumber}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tipe Kost</label>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {GENDER_OPTIONS.map(({ value, label }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setForm({ ...form, genderType: value })}
                            style={{
                              padding: "8px 14px",
                              borderRadius: 10,
                              border: `1.5px solid ${form.genderType === value ? "#3b82f6" : "#e2e8f4"}`,
                              background: form.genderType === value ? "#eff6ff" : "#fff",
                              color: form.genderType === value ? "#1d4ed8" : "#64748b",
                              fontWeight: 600,
                              fontSize: 13,
                              cursor: "pointer",
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      {errors.genderType && <p className="clp-err">{errors.genderType}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Peraturan Kost</label>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {RULE_OPTIONS.map((rule) => {
                          const checked = form.rules.includes(rule);
                          return (
                            <button
                              key={rule}
                              type="button"
                              onClick={() => toggleRule(rule)}
                              style={{
                                textAlign: "left",
                                padding: "10px 14px",
                                borderRadius: 10,
                                border: `1.5px solid ${checked ? "#3b82f6" : "#e2e8f4"}`,
                                background: checked ? "#eff6ff" : "#fff",
                                color: checked ? "#1d4ed8" : "#475569",
                                fontSize: 13,
                                fontWeight: checked ? 600 : 500,
                                cursor: "pointer",
                              }}
                            >
                              {checked ? "✓ " : ""}{rule}
                            </button>
                          );
                        })}
                      </div>
                      {errors.rules && <p className="clp-err">{errors.rules}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Fasilitas Kost (bersama)</label>
                      <p className="text-xs text-slate-400 mb-3">
                        Fasilitas area umum gedung — disimpan terpisah dari fasilitas kamar.
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {KOST_FACILITY_OPTIONS.map((f) => (
                          <button
                            key={f}
                            type="button"
                            className={`clp-fac-chip${form.sharedFacilities.includes(f) ? " active" : ""}`}
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                sharedFacilities: prev.sharedFacilities.includes(f)
                                  ? prev.sharedFacilities.filter((x) => x !== f)
                                  : [...prev.sharedFacilities, f],
                              }))
                            }
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                      <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
                        <p className="text-xs text-slate-500 font-semibold mb-2">Tambah fasilitas bersama custom</p>
                        <div style={{ display: "flex", gap: 8 }}>
                          <input
                            className="clp-input"
                            placeholder="cth. Smart Door Lock, Jasa Laundry"
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
                          <button
                            type="button"
                            onClick={addCustomSharedFacility}
                            className="clp-btn-next px-4 py-2 rounded-xl text-sm"
                          >
                            <Plus size={14} style={{ display: "inline", verticalAlign: "middle" }} /> Tambah
                          </button>
                        </div>
                      </div>
                      <SelectedFacilityTags
                        variant="edit"
                        items={form.sharedFacilities}
                        label="Fasilitas gedung terpilih"
                        onRemove={(fac) =>
                          setForm((prev) => ({
                            ...prev,
                            sharedFacilities: prev.sharedFacilities.filter((x) => x !== fac),
                          }))
                        }
                      />
                      {errors.sharedFacilitiesList && (
                        <p className="clp-err">{errors.sharedFacilitiesList}</p>
                      )}
                      <SharedFacilityPhotos
                        variant="edit"
                        existingPhotos={sharedFacilityRoom?.photos || []}
                        deletedIds={getPhotoEntry(photoState, getSharedPhotoKey()).deletedIds}
                        onMarkDelete={markDeleteSharedPhoto}
                        onUploadFiles={uploadSharedFacilityPhotos}
                        uploading={getPhotoEntry(photoState, getSharedPhotoKey()).uploading}
                        error={sharedPhotoError || errors.sharedFacilityPhotos}
                        hasPendingDeletes={sharedFacilityRoom?.id ? hasPhotoChanges(sharedFacilityRoom.id) : false}
                        onSaveDeletes={saveSharedPhotos}
                      />
                    </div>
                  </div>
                )
              )}

              {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <p className="text-sm text-slate-500">
                    Satu kost bisa punya beberapa tipe kamar (mis. Standard & Deluxe). Data kos cukup diisi sekali.
                  </p>

                  {rentableRoomTypes.length === 0 ? (
                    <p style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", padding: "12px 0" }}>Belum ada tipe kamar</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {rentableRoomTypes.map((room) => {
                        const isExpanded = expandedRoomFacilitiesId === room.id;
                        const facilities = roomFacilityEdits[room.id] ?? [];

                        return (
                          <div
                            key={room.id}
                            style={{
                              padding: 14,
                              borderRadius: 14,
                              border: "1px solid #e8edf6",
                              background: "#fafbff",
                            }}
                          >
                            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                              <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <BedDouble size={18} color="white" />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{room.name}</p>
                                <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                                  Rp {Number(room.price).toLocaleString("id-ID")} · {room.size} · {room.availableCount} tersedia
                                  {(room.photos?.length ?? 0) > 0 && ` · ${room.photos.length} foto`}
                                </p>
                                {!isExpanded && facilities.length > 0 && (
                                  <p style={{ fontSize: 11, color: "#1d4ed8", marginTop: 6, fontWeight: 600 }}>
                                    {facilities.length} fasilitas kamar
                                  </p>
                                )}
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                                <button
                                  type="button"
                                  onClick={() => setExpandedRoomFacilitiesId(isExpanded ? null : room.id)}
                                  style={{
                                    border: "1px solid #dbeafe",
                                    background: isExpanded ? "#eff6ff" : "white",
                                    color: "#1d4ed8",
                                    borderRadius: 8,
                                    padding: "8px 10px",
                                    cursor: "pointer",
                                    fontSize: 11,
                                    fontWeight: 700,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                >
                                  Fasilitas
                                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>
                                {rentableRoomTypes.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteRoomType(room.id, room.name)}
                                    style={{ border: "none", background: "#fef2f2", color: "#ef4444", borderRadius: 8, padding: 8, cursor: "pointer" }}
                                    title="Hapus tipe"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            </div>

                            {isExpanded && (
                              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #e8edf6" }}>
                                <RoomFacilityFields
                                  variant="edit"
                                  facilities={facilities}
                                  onChange={(next) =>
                                    setRoomFacilityEdits((prev) => ({ ...prev, [room.id]: next }))
                                  }
                                />
                                <div style={{ marginTop: 16 }}>
                                  <ElectricityIncludedField
                                    variant="edit"
                                    value={roomElectricityEdits[room.id] ?? null}
                                    onChange={(val) =>
                                      setRoomElectricityEdits((prev) => ({ ...prev, [room.id]: val }))
                                    }
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleSaveRoomFacilities(room.id)}
                                  disabled={savingRoomFacilitiesId === room.id}
                                  className="clp-btn-next flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm w-full"
                                  style={{ marginTop: 16, opacity: savingRoomFacilitiesId === room.id ? 0.7 : 1 }}
                                >
                                  {savingRoomFacilitiesId === room.id ? (
                                    <>
                                      <Loader2 size={16} className="animate-spin" /> Menyimpan…
                                    </>
                                  ) : (
                                    "Simpan fasilitas kamar"
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 20 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 14, fontFamily: "Plus Jakarta Sans" }}>
                      <Plus size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
                      Tambah tipe kamar baru
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Tipe</label>
                        <input className={`clp-input${roomErrors.name ? " clp-input-error" : ""}`} placeholder="cth. Kamar Deluxe"
                          value={newRoom.name} onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })} />
                        {roomErrors.name && <p className="clp-err">{roomErrors.name}</p>}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Ukuran</label>
                          <input className={`clp-input${roomErrors.size ? " clp-input-error" : ""}`} placeholder="3x4 m"
                            value={newRoom.size} onChange={(e) => setNewRoom({ ...newRoom, size: e.target.value })} />
                          {roomErrors.size && <p className="clp-err">{roomErrors.size}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Harga / bulan</label>
                          <input type="number" className={`clp-input${roomErrors.price ? " clp-input-error" : ""}`} placeholder="800000"
                            value={newRoom.price} onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })} />
                          {roomErrors.price && <p className="clp-err">{roomErrors.price}</p>}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kamar tersedia</label>
                        <input type="number" min="0" className="clp-input" style={{ maxWidth: 120 }}
                          value={newRoom.availableCount}
                          onChange={(e) => setNewRoom({ ...newRoom, availableCount: Math.max(0, Number(e.target.value)) })} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Fasilitas Kamar (khusus tipe ini)</label>
                        <RoomFacilityFields
                          variant="edit"
                          facilities={newRoom.facilities}
                          onChange={(next) => setNewRoom((prev) => ({ ...prev, facilities: next }))}
                          error={roomErrors.facilities}
                        />
                      </div>
                      <ElectricityIncludedField
                        variant="edit"
                        value={newRoom.electricityIncluded}
                        onChange={(val) => setNewRoom((prev) => ({ ...prev, electricityIncluded: val }))}
                        error={roomErrors.electricity}
                      />
                      <button
                        type="button"
                        onClick={handleAddRoomType}
                        disabled={saving}
                        className="clp-btn-next flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm w-full"
                        style={{ opacity: saving ? 0.7 : 1 }}
                      >
                        {saving ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : <><Plus size={16} /> Simpan tipe kamar</>}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <p className="text-sm text-slate-500">
                    Kelola foto untuk setiap tipe kamar. Pilih foto untuk langsung diunggah (maks. {PHOTO_MAX} per tipe). Hapus foto lalu klik Simpan perubahan.
                  </p>

                  {rentableRoomTypes.length === 0 && (
                    <p style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", padding: "24px 0" }}>Belum ada tipe kamar — kembali ke langkah Tipe Kamar</p>
                  )}

                  {rentableRoomTypes.map((room) => {
                    const ps = getPhotoEntry(photoState, room.id);
                    const visiblePhotos = (room.photos || []).filter((p) => !ps.deletedIds.includes(p.id));
                    const totalPhotos = visiblePhotos.length;
                    const canAddMore = totalPhotos < PHOTO_MAX;

                    return (
                      <div key={room.id} className="clp-room-card">
                        <div className="clp-gradient" style={{ padding: "12px 18px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <BedDouble size={15} style={{ color: "#bfdbfe" }} />
                            <span style={{ color: "white", fontWeight: 700, fontSize: 14, fontFamily: "Plus Jakarta Sans" }}>{room.name}</span>
                            <span style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.75)" }}>
                              {totalPhotos}/{PHOTO_MAX} foto · Rp {Number(room.price).toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>

                        <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
                          {photoErrors[room.id] && (
                            <p style={{ fontSize: 12, color: "#ef4444", fontWeight: 600, margin: 0 }}>{photoErrors[room.id]}</p>
                          )}

                          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                            {visiblePhotos.map((p) => (
                              <div key={p.id} className="clp-photo-thumb">
                                <img src={resolveMediaUrl(p.url)} alt="foto" />
                                <button type="button" className="clp-photo-del" onClick={() => markDelete(room.id, p.id)}>
                                  <X size={12} color="white" />
                                </button>
                              </div>
                            ))}
                          </div>

                          {canAddMore ? (
                            <label className="clp-upload-zone" style={{ opacity: ps.uploading ? 0.6 : 1, pointerEvents: ps.uploading ? "none" : "auto" }}>
                              {ps.uploading ? (
                                <Loader2 size={18} className="animate-spin" style={{ color: "#3b82f6", marginBottom: 5 }} />
                              ) : (
                                <Camera size={18} style={{ color: "#94a3b8", marginBottom: 5 }} />
                              )}
                              <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
                                {ps.uploading ? "Mengunggah..." : "Tambah foto"}
                              </span>
                              <span style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                                JPG, PNG, WEBP — bisa pilih beberapa
                              </span>
                              <input
                                type="file"
                                multiple
                                accept="image/jpeg,image/png,image/webp"
                                style={{ display: "none" }}
                                disabled={ps.uploading}
                                onChange={(e) => {
                                  if (e.target.files?.length) uploadNewPhotos(room.id, e.target.files);
                                  e.target.value = "";
                                }}
                              />
                            </label>
                          ) : (
                            <p style={{ fontSize: 12, color: "#64748b", textAlign: "center", margin: 0 }}>
                              Sudah {PHOTO_MAX} foto — hapus dulu jika ingin mengganti.
                            </p>
                          )}

                          {hasPhotoChanges(room.id) && (
                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                              <button
                                type="button"
                                onClick={() => savePhotos(room.id)}
                                disabled={ps.uploading}
                                className="clp-btn-next flex items-center gap-2 px-5 py-2 rounded-xl text-sm"
                                style={{ opacity: ps.uploading ? 0.7 : 1 }}
                              >
                                {ps.uploading
                                  ? <><Loader2 size={14} className="animate-spin" /> Menyimpan...</>
                                  : <><Check size={14} /> Simpan perubahan</>}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center px-8 py-5" style={{ borderTop: "1px solid #f1f5f9", background: "#fafbff" }}>
              {step > 1 ? (
                <button type="button" onClick={() => setStep(step - 1)} className="clp-btn-back flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm">
                  <ArrowLeft size={16} /> Kembali
                </button>
              ) : (
                <button type="button" onClick={() => navigate(-1)} className="clp-btn-back flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm">
                  <ArrowLeft size={16} /> Batal
                </button>
              )}

              {step === 1 && (
                <button type="button" onClick={handleSaveInfo} disabled={saving || loading}
                  className="clp-btn-next flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm"
                  style={{ opacity: saving || loading ? 0.7 : 1 }}>
                  {saving
                    ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</>
                    : <><Save size={16} /> Simpan & Lanjut</>}
                </button>
              )}
              {step === 2 && (
                <button type="button" onClick={goToPhotos}
                  className="clp-btn-next flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm">
                  Lanjut ke Foto <ChevronRight size={16} />
                </button>
              )}
              {step === 3 && (
                <button type="button" onClick={handleFinish}
                  className="clp-btn-next flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm">
                  <Check size={16} /> Selesai
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
