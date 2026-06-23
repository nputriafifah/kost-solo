/** Preset kampus — koordinat pusat untuk filter radius */
export const CAMPUS_PRESETS = [
  { id: "uns", label: "Dekat UNS", lat: -7.5583, lng: 110.8572, radiusKm: 2.5 },
  // UMS ada di Pabelan, Kartasura (~110.773) — koordinat lama keliru ke area timur (dekat UNS)
  { id: "ums", label: "Dekat UMS", lat: -7.5573, lng: 110.7726, radiusKm: 2.5 },
];

/** Kecamatan populer — tap cepat (kabupaten, kecamatan) */
export const QUICK_KECAMATAN = [
  { label: "Laweyan", kabupaten: "Kota Surakarta", kecamatan: "Laweyan" },
  { label: "Jebres", kabupaten: "Kota Surakarta", kecamatan: "Jebres" },
  { label: "Banjarsari", kabupaten: "Kota Surakarta", kecamatan: "Banjarsari" },
  { label: "Kartasura", kabupaten: "Kab. Sukoharjo", kecamatan: "Kartasura" },
  { label: "Grogol", kabupaten: "Kab. Sukoharjo", kecamatan: "Grogol" },
];
