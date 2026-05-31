/** Bangun alamat publik yang disimpan ke BE (tanpa Jl/No) */
export function buildListingAddress(desa, kecamatan, kabupaten) {
  const d = String(desa || "").trim();
  const k = String(kecamatan || "").trim();
  const b = String(kabupaten || "").trim();
  const parts = [];
  if (d) parts.push(d);
  if (k) parts.push(/^Kec/i.test(k) ? k : `Kec. ${k}`);
  if (b) parts.push(/^(Kab\.|Kota)/i.test(b) ? b : `Kab. ${b}`);
  return parts.join(", ");
}

/** Parse alamat lama / gabungan untuk form edit */
export function parseListingAddress(address = "") {
  const result = { desa: "", kecamatan: "", kabupaten: "" };
  const raw = String(address || "").trim();
  if (!raw) return result;

  const kecMatch = raw.match(/(?:Kecamatan|Kec\.?)\s*([^,]+)/i);
  if (kecMatch) result.kecamatan = kecMatch[1].trim();

  const kabMatch = raw.match(/(?:Kabupaten|Kab\.?|Kota)\s*([^,]+)/i);
  if (kabMatch) result.kabupaten = kabMatch[1].trim();

  const desaMatch = raw.match(/(?:Desa|Kelurahan|Kel\.?|Ds\.?)\s*([^,]+)/i);
  if (desaMatch) {
    result.desa = desaMatch[1].trim();
  }

  const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (!result.desa && parts[0] && !/^(Jl\.?|Jalan|No\.?\s*\d)/i.test(parts[0])) {
    result.desa = parts[0].replace(/^(Desa|Kel\.?|Kelurahan)\s*/i, "").trim();
  }
  if (!result.kecamatan && parts.length >= 2) {
    const mid = parts.find((p) => /^Kec/i.test(p));
    if (mid) result.kecamatan = mid.replace(/^Kec\.?\s*/i, "").trim();
  }
  if (!result.kabupaten && parts.length >= 2) {
    const last = parts[parts.length - 1];
    if (/^(Kab\.?|Kota)/i.test(last)) {
      result.kabupaten = last.replace(/^(Kabupaten|Kab\.?|Kota)\s*/i, "").trim();
    }
  }

  return result;
}

/** Tampilan lokasi untuk user — tanpa detail jalan/no rumah */
export function formatPublicLocation(address) {
  if (!address || typeof address !== "string") return "Lokasi tidak tersedia";

  const raw = address.trim();
  if (!raw) return "Lokasi tidak tersedia";

  if (!/^(Jl\.?|Jalan)\s/i.test(raw)) {
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length <= 4 && !parts.some((p) => /No\.?\s*\d+/i.test(p))) {
      return raw;
    }
  }

  const { desa, kecamatan, kabupaten } = parseListingAddress(raw);
  const rebuilt = buildListingAddress(desa, kecamatan, kabupaten);
  if (rebuilt.length >= 5) return rebuilt;

  const segments = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s && !/^(Jl\.?|Jalan|No\.?\s*\d)/i.test(s) && !/^\d+[a-z]?$/i.test(s));

  if (segments.length > 0) return segments.slice(-3).join(", ");
  return "Lokasi umum";
}

/** Koordinat perkiraan untuk peta user (~±1 km, konsisten per listing) */
export function obfuscateCoordinates(lat, lng, seed = "") {
  const la = Number(lat);
  const ln = Number(lng);
  if (!Number.isFinite(la) || !Number.isFinite(ln)) return null;

  let hash = 0;
  const key = String(seed || `${la},${ln}`);
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }

  const offLat = ((hash % 17) - 8) * 0.00085;
  const offLng = (((hash >> 4) % 17) - 8) * 0.00085;

  return {
    lat: Math.round((la + offLat) * 100) / 100,
    lng: Math.round((ln + offLng) * 100) / 100,
  };
}
