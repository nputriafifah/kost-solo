/**
 * Wilayah operasional Atap — Solo & sekitarnya.
 */

export const KABUPATEN_OPTIONS = [
  "Kota Surakarta",
  "Kab. Sukoharjo",
  "Kab. Karanganyar",
  "Kab. Boyolali",
  "Kab. Sragen",
  "Kab. Wonogiri",
  "Kab. Klaten",
];

/** kabupaten → kecamatan → kelurahan/desa (kosong = isi manual) */
export const REGION_TREE = {
  "Kota Surakarta": {
    Banjarsari: [
      "Banyuanyar", "Banjarsari", "Kadipiro", "Kestalan", "Mangkubumen",
      "Ngoresan", "Nusukan", "Pepelegi", "Pucangsawit", "Rejosari", "Singosaren",
    ],
    Jebres: [
      "Jebres", "Kedungmundu", "Kentingan", "Kepatihan Wetan", "Mondorakan",
      "Mojosongo", "Pulisen", "Tegalsari",
    ],
    Laweyan: [
      "Bumi", "Jayengan", "Kepatihan Kulon", "Kemlayan", "Panularan",
      "Penumping", "Purwosari", "Sondakan", "Timuran",
    ],
    "Pasar Kliwon": [
      "Ampel", "Baluwarti", "Bugisan", "Gandekan", "Jagalan", "Kauman",
      "Kratonan", "Pasar Kliwon", "Sangkrah", "Tipes",
    ],
    Serengan: [
      "Danukusuman", "Jayingsaran", "Kratonan", "Manggaesan", "Panular",
      "Pasar Kliwon", "Serengan", "Tipes",
    ],
  },
  "Kab. Sukoharjo": {
    Sukoharjo: ["Beji", "Banyuanyar", "Banmati", "Gadingan", "Grogol", "Mojoroto", "Ngabeyan"],
    Kartasura: ["Deles", "Dusun", "Gonilan", "Gumpang", "Kartasura", "Makamhaji", "Ngabeyan", "Pabelan", "Pucangan", "Singopuran", "Wirogunan"],
    Grogol: ["Bakung", "Bulakrejo", "Duyungan", "Grogol", "Karangpandan", "Plesungan", "Sumber", "Tawangsari"],
    Baki: ["Baki", "Blumbang", "Dukuh", "Gedangan", "Grumbuh", "Karangturi", "Mojosuro", "Pranan", "Sawit", "Singosari", "Trasan"],
    Bendosari: ["Bendosari", "Bulurejo", "Gombang", "Karangtalun", "Kemiri", "Pengkok", "Pilangsari", "Pringapus", "Sidorejo", "Tanjungtejo", "Wonokarto"],
    Mojolaban: ["Cemani", "Grogol", "Jetis", "Kemiri", "Krebet", "Mojolaban", "Pucangan", "Sanggrahan", "Tegalrejo"],
    Nguter: ["Bener", "Caruban", "Dawung", "Gedangan", "Nguter", "Pondok", "Pranan", "Sawit", "Sidorejo"],
    Polokarto: ["Bulu", "Cangkol", "Dawung", "Gedangan", "Kemiri", "Polokarto", "Pranan", "Sawit", "Sidorejo"],
    Tulung: ["Bakung", "Bulurejo", "Duyungan", "Grogol", "Karangpandan", "Plesungan", "Sumber", "Tawangsari", "Tulung"],
  },
  "Kab. Karanganyar": {
    Karanganyar: ["Bejen", "Boloyudan", "Colomadu", "Gedong", "Jonggrangan", "Kebon", "Manggeh", "Menjangan", "Popongan", "Selogabe", "Tegalgede", "Wonorejo"],
    Colomadu: ["Colomadu", "Gondangrejo", "Jati", "Made", "Palur", "Pucangan", "Wonorejo"],
    Jaten: ["Boto", "Dawung", "Gedong", "Jaten", "Juwiring", "Kebon", "Made", "Palur", "Pucangan", "Wonorejo"],
    Karangpandan: ["Boto", "Dawung", "Gedong", "Jaten", "Juwiring", "Karangpandan", "Kebon", "Made", "Palur", "Pucangan"],
    Mojogedang: ["Boto", "Dawung", "Gedong", "Jaten", "Juwiring", "Kebon", "Made", "Mojogedang", "Palur", "Pucangan"],
    Ngargoyoso: ["Boto", "Dawung", "Gedong", "Jaten", "Juwiring", "Kebon", "Made", "Ngargoyoso", "Palur", "Pucangan"],
    Tawangmangu: ["Boto", "Dawung", "Gedong", "Jaten", "Juwiring", "Kebon", "Made", "Palur", "Pucangan", "Tawangmangu"],
    Gondangrejo: ["Colomadu", "Gondangrejo", "Jati", "Kebon", "Made", "Palur", "Pucangan", "Sumber"],
    Kebakkramat: ["Bejen", "Boloyudan", "Colomadu", "Gedong", "Jonggrangan", "Kebakkramat", "Kebon", "Manggeh", "Menjangan", "Popongan"],
    Matesih: ["Bejen", "Boloyudan", "Colomadu", "Gedong", "Jonggrangan", "Kebon", "Manggeh", "Matesih", "Menjangan", "Popongan"],
  },
  "Kab. Boyolali": {
    Boyolali: [],
    Simo: [],
    Teras: [],
    Ampel: [],
    Cepogo: [],
    Musuk: [],
    Mojosongo: [],
    Selo: [],
    Andong: [],
    Candi: [],
    Gladagsari: [],
    Kemusu: [],
    Klego: [],
    Ngemplak: [],
    Nogosari: [],
    Sambi: [],
    Sawit: [],
    "Taman Sari": [],
    Wonosegoro: [],
  },
  "Kab. Sragen": {
    Sragen: [],
    Karangmalang: [],
    Sambungmacan: [],
    Gondang: [],
    Sumberlawang: [],
    Mondokan: [],
    Sukodono: [],
    Jenar: [],
    Gemolong: [],
    Kalijambe: [],
    Kedawung: [],
    Masaran: [],
    Miri: [],
    Plupuh: [],
    Sidoharjo: [],
    Tanon: [],
  },
  "Kab. Wonogiri": {
    Wonogiri: [],
    Baturetno: [],
    Eromoko: [],
    Girimarto: [],
    Ngadirojo: [],
    Nguntoronadi: [],
    Paranggupito: [],
    Pracimantoro: [],
    Puhpelem: [],
    Purwantoro: [],
    Selogiri: [],
    Slogohimo: [],
    Tirtomoyo: [],
  },
  "Kab. Klaten": {
    Klaten: [],
    Delanggu: [],
    Wedi: [],
    Bayat: [],
    Ceper: [],
    Karangnongko: [],
    Kebonarum: [],
    Kemalang: [],
    Manisrenggo: [],
    Ngawen: [],
    Pedan: [],
    Polanharjo: [],
    Prambanan: [],
    Trucuk: [],
    Tulung: [],
    Wonosari: [],
  },
};

export function getKecamatanOptions(kabupaten) {
  if (!kabupaten || !REGION_TREE[kabupaten]) return [];
  return Object.keys(REGION_TREE[kabupaten]).sort((a, b) => a.localeCompare(b, "id"));
}

export function getKelurahanOptions(kabupaten, kecamatan) {
  if (!kabupaten || !kecamatan) return [];
  const list = REGION_TREE[kabupaten]?.[kecamatan];
  return list ? [...list].sort((a, b) => a.localeCompare(b, "id")) : [];
}

export function matchKabupatenOption(parsedKab) {
  const raw = String(parsedKab || "").trim();
  if (!raw) return "";
  const hit = KABUPATEN_OPTIONS.find((k) => {
    const label = k.replace(/^(Kab\.|Kota)\s*/i, "").trim();
    return k === raw || label.toLowerCase() === raw.toLowerCase();
  });
  return hit || "";
}

export function matchKecamatanOption(kabupaten, parsedKec) {
  const raw = String(parsedKec || "").trim();
  if (!raw || !kabupaten) return "";
  const opts = getKecamatanOptions(kabupaten);
  return opts.find((k) => k.toLowerCase() === raw.toLowerCase()) || "";
}

export function matchKelurahanOption(kabupaten, kecamatan, parsedDesa) {
  const raw = String(parsedDesa || "").trim();
  if (!raw || !kabupaten || !kecamatan) return "";
  const opts = getKelurahanOptions(kabupaten, kecamatan);
  const hit = opts.find((k) => k.toLowerCase() === raw.toLowerCase());
  return hit || raw;
}
