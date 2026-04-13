import React, { useState } from "react";
import { ArrowRight, X, MapPin, ChevronRight } from "lucide-react";

// ── Data Kampus — tinggal isi logoUrl setelah download gambar ──
// Taruh file logo di folder: public/logos/
// Contoh: public/logos/uns.png → logoUrl: "/logos/logo-uns.png"

const KAMPUS_SOLO = [
  // ── NEGERI ──────────────────────────────────────────────────
  {
    id: 1,
    status: "Negeri",
    nama: "UNS",
    namaLengkap: "Universitas Sebelas Maret",
    kota: "Surakarta",
    logoUrl: "/logos/logo-uns.png", // → download: https://upload.wikimedia.org/wikipedia/id/0/00/Logo_UNS.png
    cabang: [
      { nama: "UNS Kentingan", lokasi: "Jl. Ir. Sutami No.36A, Kentingan, Jebres" },
      { nama: "UNS Pabelan", lokasi: "Jl. Ahmad Yani, Pabelan, Kartasura" },
      { nama: "UNS Kleco", lokasi: "Jl. Slamet Riyadi, Kleco, Laweyan" },
      { nama: "UNS Mesen", lokasi: "Jl. Mesen No.1, Serengan" },
      { nama: "UNS Ngoresan", lokasi: "Jl. Ngoresan, Jebres" },
    ],
  },
  {
    id: 2,
    status: "Negeri",
    nama: "ISI Solo",
    namaLengkap: "Institut Seni Indonesia Surakarta",
    kota: "Kentingan",
    logoUrl: "/logos/logo-isi.png", // → download: https://upload.wikimedia.org/wikipedia/id/e/e0/Institut_Seni_Indonesia_Surakarta.png
    cabang: [{ nama: "ISI Surakarta", lokasi: "Jl. Ki Hajar Dewantara No.19, Kentingan" }],
  },
  {
    id: 3,
    status: "Negeri",
    nama: "UPBJJ-UT",
    namaLengkap: "UPBJJ - Universitas Terbuka Surakarta",
    kota: "Surakarta",
    logoUrl: "/logos/logo-ut.png", // → download: https://upload.wikimedia.org/wikipedia/id/b/b4/Universitas_Terbuka_logo.png
    cabang: [{ nama: "UPBJJ-UT Surakarta", lokasi: "Jl. Bhayangkara No.2, Surakarta" }],
  },
  {
    id: 4,
    status: "Negeri",
    nama: "UIN Surakarta",
    namaLengkap: "UIN Raden Mas Said Surakarta",
    kota: "Kartasura",
    logoUrl: "/logos/logo-uin.png", // → download: https://upload.wikimedia.org/wikipedia/id/9/9e/Logo_IAIN_Surakarta.png
    cabang: [{ nama: "UIN Raden Mas Said", lokasi: "Jl. Pandawa, Pucangan, Kartasura" }],
  },
  {
    id: 5,
    status: "Negeri",
    nama: "Poltekkes",
    namaLengkap: "Politeknik Kemenkes Surakarta",
    kota: "Surakarta",
    logoUrl: "/logos/logo-poltekes.jpg", // → cari di Google: "logo poltekkes surakarta png"
    cabang: [
      { nama: "Poltekkes Kampus 1", lokasi: "Jl. Letjen Sutoyo, Mojosongo" },
      { nama: "Poltekkes Kampus 2", lokasi: "Jl. Kapt. Tendean No.2, Banyuanyar" },
    ],
  },
  {
    id: 6,
    status: "Negeri",
    nama: "AK Tekstil",
    namaLengkap: "Akademi Komunitas Industri Tekstil Surakarta",
    kota: "Jebres",
    logoUrl: "/logos/logo-aktekstil.png", // → cari di Google: "logo akademi komunitas tekstil surakarta png"
    cabang: [{ nama: "AK Tekstil Surakarta", lokasi: "Jl. Kol. Sutarto No.39, Jebres" }],
  },

  // ── SWASTA ──────────────────────────────────────────────────
  {
    id: 7,
    status: "Swasta",
    nama: "UMS",
    namaLengkap: "Universitas Muhammadiyah Surakarta",
    kota: "Pabelan",
    logoUrl: "/logos/logo-ums.png", // → download: https://upload.wikimedia.org/wikipedia/id/b/b5/Logo_ums.png
    cabang: [
      { nama: "UMS Kampus 1", lokasi: "Jl. Ahmad Yani, Pabelan, Kartasura" },
      { nama: "UMS Kampus 2", lokasi: "Jl. Ahmad Yani, Gonilan, Kartasura" },
    ],
  },
  {
    id: 8,
    status: "Swasta",
    nama: "UMS PKU",
    namaLengkap: "Universitas Muhammadiyah PKU Surakarta",
    kota: "Laweyan",
    logoUrl: "/logos/logo-umpku.png", // → cari di Google: "logo universitas muhammadiyah pku surakarta png"
    cabang: [{ nama: "UMS PKU", lokasi: "Jl. Tulang Bawang, Laweyan" }],
  },
  {
    id: 9,
    status: "Swasta",
    nama: "UDB",
    namaLengkap: "Universitas Duta Bangsa Surakarta",
    kota: "Surakarta",
    logoUrl: "/logos/logo-udb.jpg", // → cari di Google: "logo universitas duta bangsa surakarta png"
    cabang: [{ nama: "UDB Surakarta", lokasi: "Jl. Bhayangkara No.55, Surakarta" }],
  },
  {
    id: 10,
    status: "Swasta",
    nama: "UNISRI",
    namaLengkap: "Universitas Slamet Riyadi",
    kota: "Kadipiro",
    logoUrl: "/logos/logo-unisri.jpeg", // → cari di Google: "logo universitas slamet riyadi surakarta png"
    cabang: [{ nama: "UNISRI Utama", lokasi: "Jl. Sumpah Pemuda No.18, Kadipiro" }],
  },
  {
    id: 11,
    status: "Swasta",
    nama: "UIB",
    namaLengkap: "Universitas Islam Batik",
    kota: "Surakarta",
    logoUrl: "/logos/logo-uniba.png", // → cari di Google: "logo universitas islam batik surakarta png"
    cabang: [{ nama: "UIB Surakarta", lokasi: "Jl. H. Agus Salim No.10, Surakarta" }],
  },
  {
    id: 12,
    status: "Swasta",
    nama: "UKS",
    namaLengkap: "Universitas Kristen Surakarta",
    kota: "Surakarta",
    logoUrl: "/logos/logo-univkristen.jpeg", // → cari di Google: "logo universitas kristen surakarta png"
    cabang: [{ nama: "UKS Surakarta", lokasi: "Jl. Moh. Yamin No.2A, Surakarta" }],
  },
  {
    id: 13,
    status: "Swasta",
    nama: "UKH",
    namaLengkap: "Universitas Kusuma Husada Surakarta",
    kota: "Nusukan",
    logoUrl: "/logos/logo-ukh.jpg", // → cari di Google: "logo universitas kusuma husada surakarta png"
    cabang: [{ nama: "UKH Surakarta", lokasi: "Jl. Jaya Wijaya No.11, Nusukan" }],
  },
  {
    id: 14,
    status: "Swasta",
    nama: "Unsa",
    namaLengkap: "Universitas Sahid Surakarta",
    kota: "Surakarta",
    logoUrl: "/logos/logo-usahid.jpg", // → cari di Google: "logo universitas sahid surakarta png"
    cabang: [{ nama: "Unsa Surakarta", lokasi: "Jl. Adisucipto No.154, Surakarta" }],
  },
  {
    id: 15,
    status: "Swasta",
    nama: "USB",
    namaLengkap: "Universitas Setia Budi",
    kota: "Mojosongo",
    logoUrl: "/logos/logo-usb.jpeg", // → cari di Google: "logo universitas setia budi surakarta png"
    cabang: [{ nama: "USB Surakarta", lokasi: "Jl. Let. Jend. Sutoyo No.6, Mojosongo" }],
  },
  {
    id: 16,
    status: "Swasta",
    nama: "UNSA",
    namaLengkap: "Universitas Surakarta",
    kota: "Surakarta",
    logoUrl: "/logos/logo-unsa.jpg", // → cari di Google: "logo universitas surakarta png"
    cabang: [{ nama: "UNSA", lokasi: "Jl. Raya Palur KM.5, Surakarta" }],
  },
  {
    id: 17,
    status: "Swasta",
    nama: "UTP",
    namaLengkap: "Universitas Tunas Pembangunan",
    kota: "Semanggi",
    logoUrl: "/logos/logo-utp.jpeg", // → cari di Google: "logo universitas tunas pembangunan surakarta png"
    cabang: [{ nama: "UTP Surakarta", lokasi: "Jl. Balekambang Lor No.1, Manahan" }],
  },
  {
    id: 18,
    status: "Swasta",
    nama: "UTS",
    namaLengkap: "Universitas Tiga Serangkai Surakarta",
    kota: "Surakarta",
    logoUrl: "/logos/logo-tsu.png", // → cari di Google: "logo universitas tiga serangkai surakarta png"
    cabang: [{ nama: "UTS Surakarta", lokasi: "Jl. Ir. Sutami No.20, Surakarta" }],
  },
  {
    id: 19,
    status: "Swasta",
    nama: "UDAUB",
    namaLengkap: "Universitas Dharma Adi Unggul Bhirawa",
    kota: "Surakarta",
    logoUrl: "/logos/logo-dharmaadi.png", // → cari di Google: "logo universitas dharma adi unggul bhirawa png"
    cabang: [{ nama: "UDAUB Surakarta", lokasi: "Jl. Veteran No.171, Surakarta" }],
  },
  {
    id: 20,
    status: "Swasta",
    nama: "UNU",
    namaLengkap: "Universitas Nahdlatul Ulama Surakarta",
    kota: "Surakarta",
    logoUrl: "/logos/logo-nahdatululama.png", // → cari di Google: "logo universitas nahdlatul ulama surakarta png"
    cabang: [{ nama: "UNU Surakarta", lokasi: "Jl. Cilosari, Kampung Baru, Surakarta" }],
  },
  {
    id: 21,
    status: "Swasta",
    nama: "Aisyiyah",
    namaLengkap: "Universitas Aisyiyah Surakarta",
    kota: "Surakarta",
    logoUrl: "/logos/logo-aisyiyah.png", // → cari di Google: "logo universitas aisyiyah surakarta png"
    cabang: [{ nama: "Unisa Surakarta", lokasi: "Jl. Ki Hajar Dewantara, Surakarta" }],
  },
  {
    id: 22,
    status: "Swasta",
    nama: "BSI Solo",
    namaLengkap: "Universitas Bina Sarana Informatika Surakarta",
    kota: "Surakarta",
    logoUrl: "/logos/logo-ubsi.png", // → cari di Google: "logo universitas bina sarana informatika png"
    cabang: [{ nama: "BSI Surakarta", lokasi: "Jl. Bhayangkara No.2, Surakarta" }],
  },
  {
    id: 23,
    status: "Swasta",
    nama: "Pignatelli",
    namaLengkap: "Universitas Pignatelli Triputra",
    kota: "Surakarta",
    logoUrl: "/logos/logo-pignatelli.jpg", // → cari di Google: "logo universitas pignatelli triputra png"
    cabang: [{ nama: "Pignatelli Surakarta", lokasi: "Jl. Dr. Radjiman No.670, Surakarta" }],
  },
  {
    id: 24,
    status: "Swasta",
    nama: "AMIKOM",
    namaLengkap: "STMIK AMIKOM Surakarta",
    kota: "Surakarta",
    logoUrl: "/logos/logo-amikom.png", // → cari di Google: "logo amikom surakarta png"
    cabang: [{ nama: "AMIKOM Surakarta", lokasi: "Jl. Ahmad Yani, Surakarta" }],
  },
  {
    id: 25,
    status: "Swasta",
    nama: "ITB AAS",
    namaLengkap: "Institut Teknologi Bisnis AAS Indonesia",
    kota: "Surakarta",
    logoUrl: "/logos/logo-itbaas.jpg", // → cari di Google: "logo ITB AAS indonesia surakarta png"
    cabang: [{ nama: "ITB AAS Solo", lokasi: "Jl. Slamet Riyadi No.361, Surakarta" }],
  },
  {
    id: 26,
    status: "Swasta",
    nama: "STIKES Nas",
    namaLengkap: "STIKES Nasional Surakarta",
    kota: "Surakarta",
    logoUrl: "/logos/logo-stikesnas.jpg", // → cari di Google: "logo stikes nasional surakarta png"
    cabang: [{ nama: "STIKES Nasional", lokasi: "Jl. Raya Pajang, Surakarta" }],
  },
  {
    id: 27,
    status: "Swasta",
    nama: "STIKES PK",
    namaLengkap: "STIKES Panti Kosala Surakarta",
    kota: "Surakarta",
    logoUrl: "/logos/logo-stikespanti.webp", // → cari di Google: "logo stikes panti kosala surakarta png"
    cabang: [{ nama: "STIKES Panti Kosala", lokasi: "Jl. Raya Solo-Baki, Surakarta" }],
  },
  {
    id: 28,
    status: "Swasta",
    nama: "STIKES MU",
    namaLengkap: "STIKES Mamba'ul Ulum Surakarta",
    kota: "Surakarta",
    logoUrl: "/logos/logo-stimukmin.jpg", // → cari di Google: "logo stikes mambaul ulum surakarta png"
    cabang: [{ nama: "STIKES Mamba'ul Ulum", lokasi: "Jl. Ring Road Utara, Surakarta" }],
  },
  {
    id: 29,
    status: "Swasta",
    nama: "STIE AB",
    namaLengkap: "STIE Atma Bhakti Surakarta",
    kota: "Surakarta",
    logoUrl: "/logos/logo-stieatmabhakti.jpg", // → cari di Google: "logo stie atma bhakti surakarta png"
    cabang: [{ nama: "STIE Atma Bhakti", lokasi: "Jl. Sutan Syahrir No.16, Surakarta" }],
  },
  {
    id: 30,
    status: "Swasta",
    nama: "STIE Solo",
    namaLengkap: "STIE Surakarta",
    kota: "Surakarta",
    logoUrl: "/logos/logo-stiesolo.jpeg", // → cari di Google: "logo stie surakarta png"
    cabang: [{ nama: "STIE Surakarta", lokasi: "Jl. Sumpah Pemuda, Surakarta" }],
  },
  {
    id: 31,
    status: "Swasta",
    nama: "STIE WM",
    namaLengkap: "STIE Wijaya Mulya Surakarta",
    kota: "Surakarta",
    logoUrl: "/logos/logo-stiewijaya.png", // → cari di Google: "logo stie wijaya mulya surakarta png"
    cabang: [{ nama: "STIE Wijaya Mulya", lokasi: "Jl. Raya Sukoharjo, Surakarta" }],
  },
  {
    id: 32,
    status: "Swasta",
    nama: "STIE SM",
    namaLengkap: "STIE Swasta Mandiri Surakarta",
    kota: "Surakarta",
    logoUrl: "/logos/logo-stieswasta.jpg", // → cari di Google: "logo stie swasta mandiri surakarta png"
    cabang: [{ nama: "STIE Swasta Mandiri", lokasi: "Jl. Kapt. Mulyadi No.7, Surakarta" }],
  },
  {
    id: 33,
    status: "Swasta",
    nama: "STIA ASMI",
    namaLengkap: "STIA ASMI Surakarta",
    kota: "Surakarta",
    logoUrl: "/logos/logo-stiaasmi.jpeg", // → cari di Google: "logo stia asmi surakarta png"
    cabang: [{ nama: "STIA ASMI", lokasi: "Jl. Letjen Suprapto, Surakarta" }],
  },
  {
    id: 34,
    status: "Swasta",
    nama: "STT Warga",
    namaLengkap: "Sekolah Tinggi Teknologi Warga",
    kota: "Surakarta",
    logoUrl: "/logos/logo-stwarga.png", // → cari di Google: "logo stt warga surakarta png"
    cabang: [{ nama: "STT Warga", lokasi: "Jl. Raya Solo-Baki KM.2, Surakarta" }],
  },
  {
    id: 35,
    status: "Swasta",
    nama: "Pol. ATMI",
    namaLengkap: "Politeknik ATMI Surakarta",
    kota: "Manahan",
    logoUrl: "/logos/logo-atmi.png", // → cari di Google: "logo politeknik atmi surakarta png"
    cabang: [{ nama: "Politeknik ATMI", lokasi: "Jl. Mojo No.1, Manahan" }],
  },
  {
    id: 36,
    status: "Swasta",
    nama: "Indonusa",
    namaLengkap: "Politeknik Indonusa Surakarta",
    kota: "Surakarta",
    logoUrl: "/logos/logo-indonusa.jpg", // → cari di Google: "logo politeknik indonusa surakarta png"
    cabang: [{ nama: "Politeknik Indonusa", lokasi: "Jl. Bhayangkara No.6, Surakarta" }],
  },
  {
    id: 37,
    status: "Swasta",
    nama: "AKBARA",
    namaLengkap: "Politeknik AKBARA Surakarta",
    kota: "Surakarta",
    logoUrl: "/logos/logo-akbara.png", // → cari di Google: "logo politeknik akbara surakarta png"
    cabang: [{ nama: "Politeknik AKBARA", lokasi: "Jl. Raya Palur, Surakarta" }],
  },
  {
    id: 38,
    status: "Swasta",
    nama: "Assalaam",
    namaLengkap: "Politeknik Assalaam Surakarta",
    kota: "Kartasura",
    logoUrl: "/logos/logo-assalam.png", // → cari di Google: "logo politeknik assalaam surakarta png"
    cabang: [{ nama: "Politeknik Assalaam", lokasi: "Pondok Pesantren Assalaam, Kartasura" }],
  },
  {
    id: 39,
    status: "Swasta",
    nama: "Pratama M",
    namaLengkap: "Politeknik Pratama Mulia Surakarta",
    kota: "Surakarta",
    logoUrl: "/logos/logo-pratamamulia.jpg", // → cari di Google: "logo politeknik pratama mulia surakarta png"
    cabang: [{ nama: "Politeknik Pratama Mulia", lokasi: "Jl. Haryo Panular No.18A, Surakarta" }],
  },
  {
    id: 40,
    status: "Swasta",
    nama: "St. Paulus",
    namaLengkap: "Politeknik Santo Paulus Surakarta",
    kota: "Surakarta",
    logoUrl: "/logos/logo-santopaulus.png", // → cari di Google: "logo politeknik santo paulus surakarta png"
    cabang: [{ nama: "Politeknik Santo Paulus", lokasi: "Jl. Veteran No.136, Surakarta" }],
  },
  {
    id: 41,
    status: "Swasta",
    nama: "Insan Hsda",
    namaLengkap: "Politeknik Insan Husada Surakarta",
    kota: "Surakarta",
    logoUrl: "/logos/logo-insanhusada.png", // → cari di Google: "logo politeknik insan husada surakarta png"
    cabang: [{ nama: "Politeknik Insan Husada", lokasi: "Jl. Raya Palur, Surakarta" }],
  },
  {
    id: 42,
    status: "Swasta",
    nama: "IIM",
    namaLengkap: "Institut Islam Mamba'ul Ulum Surakarta",
    kota: "Nusukan",
    logoUrl: "/logos/logo-iim.jpeg", // → cari di Google: "logo institut islam mambaul ulum surakarta png"
    cabang: [{ nama: "IIM Surakarta", lokasi: "Jl. Karya Bakti No.57, Nusukan" }],
  },
  {
    id: 43,
    status: "Swasta",
    nama: "Al-Mukmin",
    namaLengkap: "STAI Al-Mukmin Surakarta",
    kota: "Semanggi",
    logoUrl: "/logos/logo-stimukmin.jpg", // → cari di Google: "logo stai al-mukmin surakarta png"
    cabang: [{ nama: "STAI Al-Mukmin", lokasi: "Jl. Apel No.2, Semanggi, Surakarta" }],
  },
  {
    id: 44,
    status: "Swasta",
    nama: "STP Sahid",
    namaLengkap: "Sekolah Tinggi Pariwisata Sahid",
    kota: "Surakarta",
    logoUrl: "/logos/logo-stpsahid.png", // → cari di Google: "logo sekolah tinggi pariwisata sahid surakarta png"
    cabang: [{ nama: "STP Sahid Solo", lokasi: "Jl. Adi Sucipto No.154, Surakarta" }],
  },
  {
    id: 45,
    status: "Swasta",
    nama: "Ak. Kprwt",
    namaLengkap: "Akademi Keperawatan Patria Husada",
    kota: "Surakarta",
    logoUrl: "/logos/logo-akparmandala.jpeg", // → cari di Google: "logo akademi keperawatan patria husada surakarta png"
    cabang: [{ nama: "Akper Patria Husada", lokasi: "Jl. Yos Sudarso No.283, Surakarta" }],
  },
  {
    id: 46,
    status: "Swasta",
    nama: "Ak. Pariwis",
    namaLengkap: "Akademi Pariwisata Mandala Bhakti",
    kota: "Surakarta",
    logoUrl: "/logos/logo-akper.png", // → cari di Google: "logo akademi pariwisata mandala bhakti surakarta png"
    cabang: [{ nama: "Akpar Mandala Bhakti", lokasi: "Jl. Dr. Wahidin No.33, Surakarta" }],
  },
  {
    id: 47,
    status: "Swasta",
    nama: "Ak. Pelyrn",
    namaLengkap: "Akademi Pelayaran Nasional Surakarta",
    kota: "Surakarta",
    logoUrl: "/logos/logo-apn.png", // → cari di Google: "logo akademi pelayaran nasional surakarta png"
    cabang: [{ nama: "APN Surakarta", lokasi: "Jl. Raya Solo-Baki, Surakarta" }],
  },
  {
    id: 48,
    status: "Swasta",
    nama: "Ak. Seni MN",
    namaLengkap: "Akademi Seni Mangkunegaran Surakarta",
    kota: "Surakarta",
    logoUrl: "/logos/logo-senimangkunegaran.jpeg", // → cari di Google: "logo akademi seni mangkunegaran surakarta png"
    cabang: [{ nama: "ASM Surakarta", lokasi: "Pura Mangkunegaran, Surakarta" }],
  },
  {
    id: 49,
    status: "Swasta",
    nama: "STT Intheos",
    namaLengkap: "STT Intheos Surakarta",
    kota: "Surakarta",
    logoUrl: "/logos/logo-intheos.jpg", // → cari di Google: "logo stt intheos surakarta png"
    cabang: [{ nama: "STT Intheos", lokasi: "Jl. Kapten Tendean No.22, Surakarta" }],
  },
  {
    id: 50,
    status: "Swasta",
    nama: "STT Elshday",
    namaLengkap: "STT El-Shadday Surakarta",
    kota: "Surakarta",
    logoUrl: "/logos/logo-shadday.jpeg", // → cari di Google: "logo stt el-shadday surakarta png"
    cabang: [{ nama: "STT El-Shadday", lokasi: "Jl. Kapten Mulyadi, Surakarta" }],
  },
  {
    id: 51,
    status: "Swasta",
    nama: "STT Gamliel",
    namaLengkap: "STT Gamaliel Surakarta",
    kota: "Surakarta",
    logoUrl: "/logos/logo-gamaliel.png", // → cari di Google: "logo stt gamaliel surakarta png"
    cabang: [{ nama: "STT Gamaliel", lokasi: "Jl. Kol. Sutarto, Surakarta" }],
  },
];

// ── Warna fallback per kampus (kalau logo belum ada) ─────────
const WARNA_LIST = [
  "#003580",
  "#6B1FA2",
  "#005B8E",
  "#007A4C",
  "#B22222",
  "#2D5A27",
  "#003366",
  "#C0183A",
  "#1B4F72",
  "#145A32",
  "#784212",
  "#0E6655",
  "#4A235A",
  "#1A3C40",
  "#2E4057",
  "#6B2D0F",
  "#0A3D62",
  "#1E3799",
  "#4B0082",
  "#006400",
  "#8B4513",
  "#2C3E50",
  "#7D3C98",
  "#D35400",
  "#16A085",
  "#2C3E50",
  "#8E44AD",
  "#C0392B",
  "#27AE60",
  "#2980B9",
];

// ── Logo component dengan fallback ke inisial ────────────────
function KampusLogo({ kampus, size = 44 }) {
  const [err, setErr] = useState(false);
  const warna = WARNA_LIST[kampus.id % WARNA_LIST.length];
  const inisial = kampus.nama.replace(/[^A-Z]/g, "").slice(0, 3) || kampus.nama.slice(0, 3).toUpperCase();

  if (err || !kampus.logoUrl) {
    return (
      <svg viewBox="0 0 80 80" width={size} height={size}>
        <circle cx="40" cy="40" r="38" fill={warna} />
        <text x="40" y="46" textAnchor="middle" fill="white" fontSize={inisial.length > 2 ? 16 : 20} fontWeight="bold" fontFamily="Arial">
          {inisial}
        </text>
      </svg>
    );
  }

  return <img src={kampus.logoUrl} alt={kampus.nama} width={size} height={size} className="object-contain" style={{ width: size, height: size }} onError={() => setErr(true)} />;
}

// ── Modal Cabang ─────────────────────────────────────────────
function CabangModal({ kampus, onClose, onSelectCabang }) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center px-6" onClick={onClose}>
        <div className="relative bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden" style={{ animation: "popIn .22s cubic-bezier(.34,1.56,.64,1)", maxHeight: "80vh" }} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <KampusLogo kampus={kampus} size={40} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">{kampus.namaLengkap}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{kampus.cabang.length} lokasi tersedia</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform">
              <X size={16} className="text-slate-500" />
            </button>
          </div>

          {/* List scrollable */}
          <div className="overflow-y-auto p-4 flex flex-col gap-3" style={{ maxHeight: "55vh" }}>
            {kampus.cabang.map((c, i) => (
              <button
                key={i}
                onClick={() => {
                  onSelectCabang?.(c);
                  onClose();
                }}
                className="w-full flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3.5 active:scale-95 transition-transform text-left border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30"
              >
                <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin size={15} className="text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">{c.nama}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-tight">{c.lokasi}</p>
                </div>
                <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes popIn {
          from { transform: scale(0.85); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
      `}</style>
    </>
  );
}

// ── Kampus Card ───────────────────────────────────────────────
function KampusCard({ kampus, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl px-4 py-4 active:scale-95 transition-all shadow-sm hover:shadow-md hover:border-indigo-100 text-left flex-shrink-0"
      style={{ width: "calc(50vw - 20px)", maxWidth: "220px", minWidth: "160px" }}
    >
      <div className="flex-shrink-0 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center" style={{ width: 56, height: 56 }}>
        <KampusLogo kampus={kampus} size={44} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-slate-800 leading-snug" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {kampus.namaLengkap}
        </p>
        <p className="text-[11px] text-slate-400 mt-1 truncate">{kampus.kota}</p>
      </div>
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function KampusSection({ onSelectCabang }) {
  const [selected, setSelected] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState("Semua");

  const filtered = KAMPUS_SOLO.filter((k) => filter === "Semua" || k.status === filter);
  const displayed = showAll ? filtered : filtered.slice(0, 8);
  const baris1 = displayed.slice(0, Math.ceil(displayed.length / 2));
  const baris2 = displayed.slice(Math.ceil(displayed.length / 2));

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="px-6 flex justify-between items-center mb-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Kos Sekitar Kampus</h3>
          <p className="text-xs text-slate-400 mt-0.5">{KAMPUS_SOLO.length} kampus di Solo</p>
        </div>
        <button onClick={() => setShowAll(!showAll)} className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full active:scale-95 transition-transform">
          {showAll ? "Sembunyikan" : "Lihat semua"} <ArrowRight size={12} className={showAll ? "rotate-180" : ""} />
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 px-6 mb-4">
        {["Semua", "Negeri", "Swasta"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${filter === f ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-200 text-slate-500"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Cards 2 baris */}
      <div className="overflow-x-auto hide-scrollbar px-6">
        <div className="flex flex-col gap-3" style={{ width: "max-content" }}>
          <div className="flex gap-3">
            {baris1.map((k) => (
              <KampusCard key={k.id} kampus={k} onClick={() => setSelected(k)} />
            ))}
          </div>
          {baris2.length > 0 && (
            <div className="flex gap-3">
              {baris2.map((k) => (
                <KampusCard key={k.id} kampus={k} onClick={() => setSelected(k)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {selected && <CabangModal kampus={selected} onClose={() => setSelected(null)} onSelectCabang={(c) => onSelectCabang?.(c)} />}
    </div>
  );
}
