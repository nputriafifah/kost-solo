const matchAny = (name, keys) =>
  keys.some((k) => String(name || "").toLowerCase().includes(k));

const KOST_CATEGORIES = [
  { label: "UTILITIES", keys: ["wifi", "internet", "listrik"] },
  { label: "KEAMANAN", keys: ["cctv", "security", "keamanan"] },
  { label: "AREA PARKIR", keys: ["parkir", "garasi", "motor", "mobil"] },
  { label: "LAUNDRY & JEMUR", keys: ["laundry", "cuci", "jemur"] },
  { label: "DAPUR & AREA MAKAN", keys: ["dapur", "masak", "makan"] },
  { label: "RUANG BERSAMA", keys: ["ruang tamu", "tamu", "area bersama"] },
];

const BATHROOM_KEYS = [
  "kamar mandi",
  "mandi",
  "shower",
  "water heater",
  "water heter",
  "pemanas air",
  "toilet",
  "kloset",
  "closet duduk",
  "toilet duduk",
  "wc",
  "wastafel",
  "sink",
  "bathtub",
  "bak mandi",
  "hand shower",
  "shower head",
  "bidet",
];

const ROOM_CATEGORIES = [
  { label: "UTILITIES", keys: ["listrik", "wifi", "ac", "kipas"] },
  { label: "KAMAR MANDI", keys: BATHROOM_KEYS },
  { label: "FURNITUR", keys: ["lemari", "meja", "kasur", "kursi", "tv", "belajar"] },
  { label: "ALAT ELEKTRONIK", keys: ["tv", "ac", "kulkas", "kipas"] },
];

export function groupFacilities(facilities = [], variant = "gedung") {
  const list = [...new Set((facilities || []).filter(Boolean))];
  const categories = variant === "kamar" ? ROOM_CATEGORIES : KOST_CATEGORIES;
  const used = new Set();
  const groups = [];

  categories.forEach(({ label, keys }) => {
    const items = list.filter((f) => !used.has(f) && matchAny(f, keys));
    items.forEach((f) => used.add(f));
    if (items.length) groups.push({ label, items });
  });

  const rest = list.filter((f) => !used.has(f));
  if (rest.length) groups.push({ label: "LAINNYA", items: rest });

  return groups;
}
