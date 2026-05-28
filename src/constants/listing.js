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

/** Opsi fasilitas kamar — BE: `facilities: string[]` (min 1 item) */
export const FACILITY_OPTIONS = [
  "Wifi",
  "AC",
  "Kamar Mandi Dalam",
  "Parkir",
  "Laundry",
];

/** Opsi peraturan kost — BE: `rules: string[]` (min 1 item) */
export const RULE_OPTIONS = [
  "Tidak boleh bawa pasangan",
  "Jam malam pukul 22.00",
  "Tidak boleh merokok",
  "Tidak boleh bawa hewan peliharaan",
];

export const genderApiToLabel = (genderType) =>
  GENDER_LABELS[genderType] || genderType || "—";

export const genderLowerToApi = (lower) => {
  const map = { putra: "PUTRA", putri: "PUTRI", campur: "CAMPUR" };
  return map[String(lower || "").toLowerCase()] || null;
};
