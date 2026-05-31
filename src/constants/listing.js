/** Nilai enum — harus sama dengan Prisma `GenderType` & `listing.schema.js` */
export const GENDER_TYPES = ["PUTRA", "PUTRI", "CAMPUR"];

export const GENDER_OPTIONS = [
  { value: "PUTRA", label: "Putra" },
  { value: "PUTRI", label: "Putri" },
  { value: "CAMPUR", label: "Campur" },
];

/** Label tampilan dari nilai API (uppercase) */
export const GENDER_LABELS = {
  PUTRA: "Putra",
  PUTRI: "Putri",
  CAMPUR: "Campur",
};

/** Label tampilan dari nilai lowercase (kartu user) */
export const GENDER_LABELS_LOWER = {
  putra: "Putra",
  putri: "Putri",
  campur: "Campur",
};

/** Fasilitas area bersama (disimpan di FE, digabung ke setiap RoomType saat save — tanpa field BE terpisah) */
export const KOST_FACILITY_OPTIONS = [
  "Wifi",
  "Parkir",
  "Laundry",
  "Dapur Bersama",
  "Ruang Tamu",
  "CCTV / Security",
  "Tempat Jemur",
];

/** Fasilitas khusus per tipe kamar */
export const ROOM_FACILITY_OPTIONS = [
  "AC",
  "Kamar Mandi Dalam",
  "TV",
  "Lemari",
  "Meja Belajar",
  "Kasur",
  "Kulkas Kamar",
];

/** @deprecated Gabungan lama — pakai KOST_FACILITY_OPTIONS / ROOM_FACILITY_OPTIONS */
export const FACILITY_OPTIONS = [...KOST_FACILITY_OPTIONS, ...ROOM_FACILITY_OPTIONS];

/** Opsi peraturan kost — BE: `rules: string[]` (min 1 item) */
export const RULE_OPTIONS = [
  "Tidak boleh bawa pasangan",
  "Jam malam pukul 22.00",
  "Tidak boleh merokok",
  "Tidak boleh bawa hewan peliharaan",
];

const norm = (s) => String(s || "").trim().toLowerCase();

const KOST_LOOKUP = new Set(KOST_FACILITY_OPTIONS.map(norm));

/** Kata kunci fasilitas kamar — dicek dulu agar tidak salah masuk gedung */
const ROOM_KEYWORD_HINTS = [
  "kamar mandi dalam",
  "kamar mandi",
  "meja belajar",
  "kulkas kamar",
  "kasur",
  "lemari",
  "televisi",
  "water heater",
  "water heter",
  "pemanas air",
  "toilet",
  "kloset",
  "toilet duduk",
  "closet duduk",
  "wastafel",
  "shower head",
  "hand shower",
  "bidet",
];

/** Kata kunci fasilitas gedung / area bersama (termasuk custom owner) */
const BUILDING_KEYWORD_HINTS = [
  "wifi",
  "parkir",
  "laundry",
  "dapur",
  "ruang tamu",
  "cctv",
  "security",
  "jemur",
  "dispenser",
  "pintu utama",
  "door lock",
  "smart lock",
  "smart door",
  "laundry room",
  "jasa laundry",
  "pembersihan",
  "area bersama",
  "ruang bersama",
  "reception",
  "lift",
];

export const isRoomFacility = (name) => {
  const n = norm(name);
  if (ROOM_FACILITY_OPTIONS.some((opt) => norm(opt) === n)) return true;
  if (ROOM_KEYWORD_HINTS.some((k) => n.includes(k))) return true;
  if (n === "ac" || n.startsWith("ac ") || n.endsWith(" ac") || n.includes(" ac ")) return true;
  if (n === "tv" || n.includes("tv ")) return true;
  return false;
};

/** Apakah fasilitas ini milik gedung / area bersama */
export const isKostFacility = (name) => {
  const n = norm(name);
  if (!n) return false;
  if (KOST_LOOKUP.has(n)) return true;
  if (isRoomFacility(name)) return false;
  return BUILDING_KEYWORD_HINTS.some((k) => n.includes(k));
};

/** Ambil fasilitas gedung — dari tipe internal + yang terdeteksi di tipe kamar */
export const extractKostFacilitiesFromRooms = (roomTypes) => {
  const shared = findSharedFacilityRoom(roomTypes);
  const fromShared = shared?.facilities ?? [];
  const fromRooms = (roomTypes ?? [])
    .flatMap((r) => r.facilities || [])
    .filter(isKostFacility);
  return [...new Set([...fromShared, ...fromRooms])];
};

/** Label standar listrik — disimpan di `facilities[]` (FE-only, tanpa field BE) */
export const ELECTRICITY_INCLUDED_LABEL = "Listrik Termasuk";
export const ELECTRICITY_EXCLUDED_LABEL = "Listrik Belum Termasuk";

export const isElectricityMarker = (name) => {
  const n = norm(name);
  return n === norm(ELECTRICITY_INCLUDED_LABEL) || n === norm(ELECTRICITY_EXCLUDED_LABEL);
};

/** @returns {true|false|null} */
export const parseElectricityIncluded = (facilities) => {
  const list = facilities ?? [];
  if (list.some((f) => norm(f) === norm(ELECTRICITY_INCLUDED_LABEL))) return true;
  if (list.some((f) => norm(f) === norm(ELECTRICITY_EXCLUDED_LABEL))) return false;
  return null;
};

export const stripElectricityMarkers = (facilities) =>
  (facilities ?? []).filter((f) => !isElectricityMarker(f));

/** Gabungkan pilihan listrik ke array fasilitas sebelum save ke BE */
export const applyElectricityToFacilities = (facilities, included) => {
  const base = stripElectricityMarkers(facilities);
  if (included === true) return [...base, ELECTRICITY_INCLUDED_LABEL];
  if (included === false) return [...base, ELECTRICITY_EXCLUDED_LABEL];
  return base;
};

/**
 * Fasilitas kamar saja — buang fasilitas gedung (termasuk custom & yang digabung saat save).
 */
export const getRoomOnlyFacilities = (facilities, kostFacilities = []) => {
  const exclude = new Set((kostFacilities ?? []).map(norm));
  return (facilities ?? []).filter((f) => {
    const key = norm(f);
    return key && !exclude.has(key) && !isKostFacility(f) && !isElectricityMarker(f);
  });
};

export const mergeListingFacilities = (sharedFacilities, roomFacilities) => {
  const merged = [...(sharedFacilities ?? []), ...(roomFacilities ?? [])];
  const seen = new Set();
  return merged.filter((f) => {
    const key = norm(f);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/** Tipe kamar internal untuk foto fasilitas bersama (tanpa field BE terpisah) */
export const SHARED_FACILITY_ROOM_NAME = "Fasilitas Bersama";

export const isSharedFacilityRoom = (room) =>
  String(room?.name || "").trim().toLowerCase() === SHARED_FACILITY_ROOM_NAME.toLowerCase();

export const getRentableRoomTypes = (roomTypes) =>
  (roomTypes ?? []).filter((r) => !isSharedFacilityRoom(r));

export const findSharedFacilityRoom = (roomTypes) =>
  (roomTypes ?? []).find((r) => isSharedFacilityRoom(r));

export const buildSharedFacilityRoomPayload = (sharedFacilities, fallbackPrice = 1) => ({
  name: SHARED_FACILITY_ROOM_NAME,
  price: Math.max(1, Math.floor(Number(fallbackPrice)) || 1),
  size: "-",
  facilities: sharedFacilities?.length > 0 ? sharedFacilities : ["Area Bersama"],
  availableCount: 0,
});

export const genderApiToLabel = (genderType) =>
  GENDER_LABELS[genderType] || genderType || "—";

export const genderLowerToApi = (lower) => {
  const map = { putra: "PUTRA", putri: "PUTRI", campur: "CAMPUR" };
  return map[String(lower || "").toLowerCase()] || null;
};
