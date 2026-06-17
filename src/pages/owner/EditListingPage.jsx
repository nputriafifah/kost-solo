import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Loader2, Camera, X, Check, BedDouble,
  Plus, Trash2, ChevronRight, ChevronDown, ChevronLeft,
  Home, Layers,
} from "lucide-react";
import { CLP_LAYOUT_STYLES } from "../../styles/clpLayoutStyles";
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

// ─── helpers ───────────────────────────────────────────────────────────────────
// area fields can be either a plain string OR a { value, label } option object
// (from react-select / custom select components). Always extract a plain string.
const toStr = (v) => {
  if (!v) return "";
  if (typeof v === "string") return v;
  // react-select / custom option object
  if (typeof v === "object") return v.value ?? v.label ?? "";
  return String(v);
};

const EMPTY_NEW_ROOM = {
  name: "",
  price: "",
  size: "",
  facilities: [],
  availableCount: 1,
  electricityIncluded: null,
};

const STEPS = [
  { label: "Data Kos", desc: "Perbarui info dasar kost", icon: Home },
  { label: "Tipe Kamar", desc: "Tambah atau kelola tipe kamar", icon: Layers },
  { label: "Foto Kamar", desc: "Kelola foto tiap tipe kamar", icon: Camera },
];

const PHOTO_MAX = 8;
const PHOTO_MIME = ["image/jpeg", "image/png", "image/webp"];

const SHARED_PHOTO_KEY = "__shared__";

const emptyPhotoEntry = () => ({ newFiles: [], deletedIds: [], uploading: false });

const getPhotoEntry = (state, roomTypeId) => state[roomTypeId] || emptyPhotoEntry();

const getToken = () => localStorage.getItem("token") || "";

const parseApiError = async (res) => {
  try {
    const data = await res.json();
    if (data?.message) return data.message;
    if (Array.isArray(data?.error)) return data.error.map((e) => e.message).join(", ");
    if (typeof data?.error === "string") return data.error;
    return `Request gagal (${res.status})`;
  } catch {
    return `Request gagal (${res.status})`;
  }
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
    newRule: "",
  });

  const [latLng, setLatLng] = useState(null);

  const [roomTypes, setRoomTypes] = useState([]);
  const [newRoom, setNewRoom] = useState({ ...EMPTY_NEW_ROOM });
  const [photoState, setPhotoState] = useState({});
  const [photoErrors, setPhotoErrors] = useState({});
  const [sharedPhotoError, setSharedPhotoError] = useState("");
  const [pendingSharedPhotos, setPendingSharedPhotos] = useState([]);
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
          newRule: "",
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

  const countSharedFacilityPhotos = (state = photoState) => {
    if (!sharedFacilityRoom?.id) return pendingSharedPhotos.length;
    const ps = getPhotoEntry(state, sharedFacilityRoom.id);
    const serverCount = (sharedFacilityRoom.photos || []).filter(
      (p) => !ps.deletedIds.includes(p.id),
    ).length;
    return serverCount + pendingSharedPhotos.length;
  };

  const clearSharedPhotoError = () => {
    setSharedPhotoError("");
    setErrors((prev) => {
      if (!prev.sharedFacilityPhotos) return prev;
      const next = { ...prev };
      delete next.sharedFacilityPhotos;
      return next;
    });
  };

  // ─── validate ────────────────────────────────────────────────────────────────
  // Always call toStr() on area fields since they may be option objects
  const validate = () => {
    const e = {};

    const name = form.name?.trim() ?? "";
    const areaDesa = toStr(form.areaDesa).trim();
    const areaKecamatan = toStr(form.areaKecamatan).trim();
    const areaKabupaten = toStr(form.areaKabupaten).trim();
    const description = form.description?.trim() ?? "";
    const contactNumber = form.contactNumber?.trim() ?? "";

    if (name.length < 3) e.name = "Nama minimal 3 karakter";
    if (areaDesa.length < 2) e.areaDesa = "Kelurahan/desa minimal 2 karakter";
    if (areaKecamatan.length < 2) e.areaKecamatan = "Kecamatan wajib diisi";
    if (areaKabupaten.length < 2) e.areaKabupaten = "Kabupaten/kota wajib diisi";
    if (description.length < 20) e.description = "Deskripsi minimal 20 karakter";
    if (contactNumber.length < 8) e.contactNumber = "Nomor kontak minimal 8 digit";
    if (!GENDER_OPTIONS.some((g) => g.value === form.genderType)) e.genderType = "Pilih tipe kost";
    if (!form.rules?.length) e.rules = "Pilih minimal 1 peraturan";
    if (form.sharedFacilities.length > 0 && countSharedFacilityPhotos() === 0) {
      e.sharedFacilityPhotos = "Upload minimal 1 foto fasilitas bersama";
    }
    const visibleSharedPhotos = sharedFacilityRoom?.id
      ? (sharedFacilityRoom.photos || []).filter(
          (p) => !getPhotoEntry(photoState, sharedFacilityRoom.id).deletedIds.includes(p.id),
        ).length
      : 0;
    if (visibleSharedPhotos > 0 && form.sharedFacilities.length === 0) {
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

  const addCustomRule = () => {
    const raw = form.newRule?.trim();
    if (!raw) return;
    const exists = form.rules.some((r) => r.toLowerCase() === raw.toLowerCase());
    if (exists) {
      setForm({ ...form, newRule: "" });
      return;
    }
    setForm({ ...form, rules: [...form.rules, raw], newRule: "" });
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

  const uploadFilesToRoom = async (roomId, fileArr) => {
    if (!fileArr?.length) return;
    for (const file of fileArr) {
      const fd = new FormData();
      fd.append("photos", file);
      const uploadRes = await fetch(`${api}/owner/room-types/${roomId}/photos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      if (!uploadRes.ok) throw new Error(await parseApiError(uploadRes));
    }
  };

  // ─── handleSaveInfo ──────────────────────────────────────────────────────────
  const handleSaveInfo = async () => {
    if (!validate()) {
      document.querySelector(".clp-form-card")?.scrollIntoView?.({ behavior: "smooth", block: "start" });
      return;
    }
    setSaving(true);
    try {
      // Always convert area fields to plain strings before sending to API
      const areaDesa = toStr(form.areaDesa).trim();
      const areaKecamatan = toStr(form.areaKecamatan).trim();
      const areaKabupaten = toStr(form.areaKabupaten).trim();

      const rawAddress = buildListingAddress(areaDesa, areaKecamatan, areaKabupaten);
      const address = rawAddress.length >= 10
        ? rawAddress
        : [areaDesa, areaKecamatan, areaKabupaten].filter(Boolean).join(", ");

      const patchBody = {
        name: form.name.trim(),
        address,
        description: form.description.trim(),
        contactNumber: form.contactNumber.trim(),
        genderType: form.genderType,
        rules: form.rules,
        ...(latLng
          ? { latitude: Number(latLng.lat), longitude: Number(latLng.lng) }
          : {}),
      };

      const res = await fetch(`${api}/listings/owner/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(patchBody),
      });
      if (!res.ok) throw new Error(await parseApiError(res));

      let latest = await refreshListing();
      let shared = findSharedFacilityRoom(latest.roomTypes || roomTypes);
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
        const rentable = getRentableRoomTypes(latest.roomTypes || roomTypes);
        const minPrice =
          rentable.length > 0
            ? Math.min(...rentable.map((r) => Number(r.price)).filter((p) => p > 0)) || 1
            : 1;
        const createRes = await fetch(`${api}/owner/listings/${id}/room-types`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(buildSharedFacilityRoomPayload(form.sharedFacilities, minPrice)),
        });
        if (!createRes.ok) throw new Error(await parseApiError(createRes));
        latest = await refreshListing();
        shared = findSharedFacilityRoom(latest.roomTypes || []);
      }

      if (pendingSharedPhotos.length > 0) {
        const roomId = shared?.id || (await ensureSharedFacilityRoom());
        if (!roomId) throw new Error("Gagal menyiapkan tipe fasilitas bersama untuk upload foto");
        await uploadFilesToRoom(roomId, pendingSharedPhotos);
        setPendingSharedPhotos([]);
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

    if (form.sharedFacilities.length === 0) {
      throw new Error("Pilih minimal 1 fasilitas kost bersama");
    }

    const rentable = getRentableRoomTypes(roomTypes);
    const minPrice =
      rentable.length > 0
        ? Math.min(...rentable.map((r) => Number(r.price)).filter((p) => p > 0)) || 1
        : 1;

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
    const roomId =
      json.data?.id ?? json.data?.roomType?.id ?? json.id ?? json.roomTypeId;
    const latest = await refreshListing();
    const created = findSharedFacilityRoom(latest.roomTypes || []);
    return roomId || created?.id || null;
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
    const currentCount = countSharedFacilityPhotos();

    if (currentCount + fileArr.length > PHOTO_MAX) {
      setSharedPhotoError(`Maksimal ${PHOTO_MAX} foto fasilitas bersama`);
      return;
    }

    setPhotoState((prev) => ({
      ...prev,
      [key]: { ...getPhotoEntry(prev, key), uploading: true },
    }));
    setSharedPhotoError("");

    let roomId = sharedFacilityRoom?.id;
    try {
      roomId = roomId || (await ensureSharedFacilityRoom());
      if (!roomId) throw new Error("Gagal menyiapkan tipe fasilitas bersama");

      await uploadFilesToRoom(roomId, fileArr);
      await refreshListing();
      setPendingSharedPhotos([]);
      setPhotoState((prev) => ({
        ...prev,
        [roomId]: emptyPhotoEntry(),
        [SHARED_PHOTO_KEY]: emptyPhotoEntry(),
      }));
      clearSharedPhotoError();
    } catch (err) {
      if (!roomId) {
        setPendingSharedPhotos((prev) => {
          const merged = [...prev, ...fileArr];
          return merged.slice(0, PHOTO_MAX);
        });
        clearSharedPhotoError();
        setSharedPhotoError(
          "Foto disimpan sementara — akan diunggah saat Anda klik Simpan & Lanjut",
        );
      } else {
        setSharedPhotoError(err.message || "Gagal upload foto");
      }
      setPhotoState((prev) => ({
        ...prev,
        [key]: { ...getPhotoEntry(prev, key), uploading: false },
      }));
    }
  };

  const removePendingSharedPhoto = (index) => {
    setPendingSharedPhotos((prev) => {
      const next = prev.filter((_, i) => i !== index);
      const serverCount = sharedFacilityRoom?.id
        ? (sharedFacilityRoom.photos || []).filter(
            (p) => !getPhotoEntry(photoState, sharedFacilityRoom.id).deletedIds.includes(p.id),
          ).length
        : 0;
      if (serverCount + next.length > 0) clearSharedPhotoError();
      return next;
    });
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
      await uploadFilesToRoom(roomTypeId, fileArr);
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

  const currentStepData = STEPS[step - 1];
  const CurrentIcon = currentStepData.icon;
  const roomTypesLabel =
    rentableRoomTypes.length > 0
      ? `${rentableRoomTypes.length} tipe kamar`
      : "Belum ada tipe";

  return (
    <>
      <style>{CLP_LAYOUT_STYLES}</style>
      <div className="clp-root">
        <header className="clp-topbar">
          <div className="clp-topbar-left">
            <span className="clp-topbar-brand">Atap</span>
            <div className="clp-topbar-divider" />
            <span className="clp-topbar-title">Edit Kost</span>
          </div>
          <button type="button" className="clp-back-dashboard" onClick={() => navigate("/owner/properti")}>
            <ArrowLeft size={15} />
            Kembali ke Properti
          </button>
        </header>

        <div className="clp-body">
          <aside className="clp-sidebar">
            <p className="clp-sidebar-heading">Langkah Edit</p>
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
              {step >= 2 && (
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
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#4F46E5", margin: 0 }}>{roomTypesLabel}</p>
                </div>
              )}
            </div>
          </aside>

          <main className="clp-content">
            <div className="clp-content-header">
              <div className="clp-content-breadcrumb">
                Edit Kost
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

            <div className="clp-form-card clp-step-fade" key={step}>
              {step === 1 && loading && (
                <p style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", padding: "32px 0" }}>
                  <Loader2 size={20} className="clp-spin" style={{ display: "inline", verticalAlign: "middle", marginRight: 8 }} />
                  Memuat data kost...
                </p>
              )}

              {step === 1 && !loading && (
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
                    <label className="clp-label">Area Lokasi (tampil ke user)</label>
                    <p style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, marginBottom: 10 }}>
                      Tanpa jalan/no rumah — pilih kabupaten, kecamatan, lalu kelurahan/desa.
                    </p>
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

                  <div className="clp-field">
                    <label className="clp-label">Tandai Lokasi di Peta (rahasia)</label>
                    <p style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, marginBottom: 10 }}>
                      Pin untuk jarak & validasi — tidak ditampilkan persis ke calon penyewa.
                    </p>
                    <div className="clp-map-container">
                      <MapPicker setLatLng={setLatLng} initialLatLng={latLng} />
                    </div>
                    {latLng && (
                      <div className="clp-coord-badge">
                        Koordinat: {latLng.lat.toFixed(5)}, {latLng.lng.toFixed(5)}
                      </div>
                    )}
                  </div>

                  <div className="clp-field">
                    <label className="clp-label">Deskripsi</label>
                    <textarea
                      className={`clp-textarea${errors.description ? " err" : ""}`}
                      rows={4}
                      placeholder="Ceritakan tentang kost kamu..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                    {errors.description && <p className="clp-error">⚠ {errors.description}</p>}
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
                    {errors.genderType && <p className="clp-error">⚠ {errors.genderType}</p>}
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
                            onClick={() => toggleRule(rule)}
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
                              setForm((prev) => ({
                                ...prev,
                                sharedFacilities: prev.sharedFacilities.includes(f)
                                  ? prev.sharedFacilities.filter((x) => x !== f)
                                  : [...prev.sharedFacilities, f],
                              }))
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
                      <p className="clp-error">⚠ {errors.sharedFacilitiesList}</p>
                    )}
                    <SharedFacilityPhotos
                      variant="edit"
                      existingPhotos={sharedFacilityRoom?.photos || []}
                      deletedIds={getPhotoEntry(photoState, getSharedPhotoKey()).deletedIds}
                      pendingFiles={pendingSharedPhotos}
                      onRemovePending={removePendingSharedPhoto}
                      onMarkDelete={markDeleteSharedPhoto}
                      onUploadFiles={uploadSharedFacilityPhotos}
                      uploading={getPhotoEntry(photoState, getSharedPhotoKey()).uploading}
                      error={sharedPhotoError || errors.sharedFacilityPhotos}
                      hasPendingDeletes={sharedFacilityRoom?.id ? hasPhotoChanges(sharedFacilityRoom.id) : false}
                      onSaveDeletes={saveSharedPhotos}
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <p className="clp-info-note">
                    Satu kost bisa punya beberapa tipe kamar (mis. Standard & Deluxe). Data kos cukup diisi sekali di langkah sebelumnya.
                  </p>

                  {rentableRoomTypes.length === 0 ? (
                    <p style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", padding: "16px 0" }}>
                      Belum ada tipe kamar
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                      {rentableRoomTypes.map((room) => {
                        const isExpanded = expandedRoomFacilitiesId === room.id;
                        const facilities = roomFacilityEdits[room.id] ?? [];
                        return (
                          <div key={room.id} className="clp-edit-room-list-item">
                            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                              <div
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 10,
                                  background: "#4F46E5",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <BedDouble size={18} color="white" />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontWeight: 700, fontSize: 14, color: "#1e1b4b" }}>{room.name}</p>
                                <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                                  Rp {Number(room.price).toLocaleString("id-ID")} · {room.size} · {room.availableCount} tersedia
                                  {(room.photos?.length ?? 0) > 0 && ` · ${room.photos.length} foto`}
                                </p>
                                {!isExpanded && facilities.length > 0 && (
                                  <p style={{ fontSize: 11, color: "#4F46E5", marginTop: 6, fontWeight: 600 }}>
                                    {facilities.length} fasilitas kamar
                                  </p>
                                )}
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                                <button
                                  type="button"
                                  onClick={() => setExpandedRoomFacilitiesId(isExpanded ? null : room.id)}
                                  className="clp-btn clp-btn-outline"
                                  style={{ padding: "8px 10px", fontSize: 11 }}
                                >
                                  Fasilitas
                                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>
                                {rentableRoomTypes.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteRoomType(room.id, room.name)}
                                    style={{
                                      border: "none",
                                      background: "#fef2f2",
                                      color: "#ef4444",
                                      borderRadius: 8,
                                      padding: 8,
                                      cursor: "pointer",
                                    }}
                                    title="Hapus tipe"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            </div>
                            {isExpanded && (
                              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #e8eaf2" }}>
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
                                  className="clp-btn clp-btn-primary"
                                  style={{ marginTop: 16, width: "100%", justifyContent: "center" }}
                                >
                                  {savingRoomFacilitiesId === room.id ? (
                                    <>
                                      <Loader2 size={16} className="clp-spin" /> Menyimpan…
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

                  <div style={{ borderTop: "1px solid #e8eaf2", paddingTop: 24 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#1e1b4b", marginBottom: 16 }}>
                      <Plus size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
                      Tambah tipe kamar baru
                    </p>
                    <div className="clp-field">
                      <label className="clp-label">Nama Tipe</label>
                      <input
                        className={`clp-input${roomErrors.name ? " err" : ""}`}
                        placeholder="cth. Kamar Deluxe"
                        value={newRoom.name}
                        onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                      />
                      {roomErrors.name && <p className="clp-error">⚠ {roomErrors.name}</p>}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div className="clp-field">
                        <label className="clp-label">Ukuran</label>
                        <input
                          className={`clp-input${roomErrors.size ? " err" : ""}`}
                          placeholder="3x4 m"
                          value={newRoom.size}
                          onChange={(e) => setNewRoom({ ...newRoom, size: e.target.value })}
                        />
                        {roomErrors.size && <p className="clp-error">⚠ {roomErrors.size}</p>}
                      </div>
                      <div className="clp-field">
                        <label className="clp-label">Harga / bulan</label>
                        <input
                          type="number"
                          className={`clp-input${roomErrors.price ? " err" : ""}`}
                          placeholder="800000"
                          value={newRoom.price}
                          onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })}
                        />
                        {roomErrors.price && <p className="clp-error">⚠ {roomErrors.price}</p>}
                      </div>
                    </div>
                    <div className="clp-field">
                      <label className="clp-label">Kamar tersedia</label>
                      <input
                        type="number"
                        min="0"
                        className="clp-input"
                        style={{ maxWidth: 120 }}
                        value={newRoom.availableCount}
                        onChange={(e) =>
                          setNewRoom({ ...newRoom, availableCount: Math.max(0, Number(e.target.value)) })
                        }
                      />
                    </div>
                    <div className="clp-field">
                      <label className="clp-label">Fasilitas Kamar (khusus tipe ini)</label>
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
                      className="clp-btn clp-btn-primary"
                      style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
                    >
                      {saving ? (
                        <>
                          <Loader2 size={16} className="clp-spin" /> Menyimpan...
                        </>
                      ) : (
                        <>
                          <Plus size={16} /> Simpan tipe kamar
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <p className="clp-info-note">
                    Kelola foto untuk setiap tipe kamar. Pilih foto untuk langsung diunggah (maks. {PHOTO_MAX} per tipe). Hapus foto lalu klik Simpan perubahan.
                  </p>

                  {rentableRoomTypes.length === 0 && (
                    <p style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", padding: "24px 0" }}>
                      Belum ada tipe kamar — kembali ke langkah Tipe Kamar
                    </p>
                  )}

                  {rentableRoomTypes.map((room) => {
                    const ps = getPhotoEntry(photoState, room.id);
                    const visiblePhotos = (room.photos || []).filter((p) => !ps.deletedIds.includes(p.id));
                    const totalPhotos = visiblePhotos.length;
                    const canAddMore = totalPhotos < PHOTO_MAX;

                    return (
                      <div key={room.id} className="clp-edit-room-card">
                        <div className="clp-edit-room-head">
                          <BedDouble size={16} color="#4F46E5" />
                          <span className="clp-edit-room-head-title">{room.name}</span>
                          <span className="clp-edit-room-head-meta">
                            {totalPhotos}/{PHOTO_MAX} foto · Rp {Number(room.price).toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div className="clp-edit-room-body">
                          {photoErrors[room.id] && (
                            <p className="clp-error" style={{ marginBottom: 12 }}>⚠ {photoErrors[room.id]}</p>
                          )}
                          {visiblePhotos.length > 0 && (
                            <div className="clp-photo-grid" style={{ marginTop: 0, marginBottom: 12 }}>
                              {visiblePhotos.map((p) => (
                                <div key={p.id} className="clp-photo-thumb-inline">
                                  <img src={resolveMediaUrl(p.url)} alt="foto" />
                                  <button
                                    type="button"
                                    className="clp-photo-del-btn"
                                    onClick={() => markDelete(room.id, p.id)}
                                  >
                                    <X size={12} color="white" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          {canAddMore ? (
                            <label className="clp-upload-zone compact" style={{ opacity: ps.uploading ? 0.6 : 1, pointerEvents: ps.uploading ? "none" : "auto" }}>
                              {ps.uploading ? (
                                <Loader2 size={20} className="clp-spin" style={{ color: "#4F46E5", marginBottom: 6 }} />
                              ) : (
                                <Camera size={20} style={{ color: "#94a3b8", marginBottom: 6 }} />
                              )}
                              <p className="clp-upload-text" style={{ fontSize: 13 }}>
                                {ps.uploading ? "Mengunggah..." : "Tambah foto"}
                              </p>
                              <p className="clp-upload-sub">JPG, PNG, WEBP — bisa pilih beberapa</p>
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
                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                              <button
                                type="button"
                                onClick={() => savePhotos(room.id)}
                                disabled={ps.uploading}
                                className="clp-btn clp-btn-primary"
                              >
                                {ps.uploading ? (
                                  <>
                                    <Loader2 size={14} className="clp-spin" /> Menyimpan...
                                  </>
                                ) : (
                                  <>
                                    <Check size={14} /> Simpan perubahan
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            <div className="clp-nav">
              <div className="clp-nav-left">
                {step > 1 ? (
                  <button type="button" onClick={() => setStep(step - 1)} className="clp-btn clp-btn-outline">
                    <ChevronLeft size={16} /> Kembali
                  </button>
                ) : (
                  <button type="button" onClick={() => navigate("/owner/properti")} className="clp-btn clp-btn-outline">
                    <ArrowLeft size={15} /> Properti
                  </button>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
                  {step} / {STEPS.length}
                </span>
                {step === 1 && (
                  <button
                    type="button"
                    onClick={handleSaveInfo}
                    disabled={saving || loading}
                    className="clp-btn clp-btn-primary"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="clp-spin" /> Menyimpan...
                      </>
                    ) : (
                      <>
                        Simpan & Lanjut <ChevronRight size={16} />
                      </>
                    )}
                  </button>
                )}
                {step === 2 && (
                  <button type="button" onClick={goToPhotos} className="clp-btn clp-btn-primary">
                    Lanjut ke Foto <ChevronRight size={16} />
                  </button>
                )}
                {step === 3 && (
                  <button type="button" onClick={handleFinish} className="clp-btn clp-btn-primary">
                    <Check size={16} /> Selesai
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