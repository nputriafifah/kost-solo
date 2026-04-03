import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Wind,
  MessageCircle,
  Heart,
  ShieldCheck,
  Zap,
  User,
  Star,
  Trash2,
  Car,
  Bath,
  Bed,
  Utensils,
  Train,
  Bus,
  Map as MapIcon,
  Maximize,
  Users,
  Store,
  Church,
  GraduationCap,
  Hospital,
  ShoppingBag,
  Wifi,
  Coffee,
  Navigation2,
  CheckCircle2,
} from "lucide-react";

const INITIAL_DATA = [
  {
    id: 1,
    name: "Kost Griya Sruni Kadipiro Banjarsari Surakarta",
    type: "Kost Campur",
    price: "1.150.000",
    location: "Banjarsari, Kota Surakarta",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200",
    owner: "Ririen Setyowati",
    size: "3 x 4 meter",
    desc: "Kos bebas jam malam, parkir mobil dan motor luas. Lokasi sangat strategis dekat pusat kota, mall, dan area kampus.",
  },
];

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState("terdekat");

  const item = INITIAL_DATA.find((data) => String(data.id) === String(id)) || INITIAL_DATA[0];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // ── TAMBAHAN: handler Tanya Pemilik ──────────────────────────
  const handleTanyaPemilik = () => {
    navigate("/chat", {
      state: {
        kostId: item.id,
        kostName: item.name,
        ownerName: item.owner,
      },
    });
  };
  // ─────────────────────────────────────────────────────────────

  const lokasiSekitar = {
    terdekat: [
      { icon: <Store size={18} />, name: "Rumah Makan Kemuning", dist: "2.3 km" },
      { icon: <Church size={18} />, name: "Masjid Istiqlal", dist: "1.8 km" },
      { icon: <GraduationCap size={18} />, name: "Universitas Tunas Pembangunan (UTP)", dist: "2.2 km" },
      { icon: <Hospital size={18} />, name: "RS Umum Brayat Minulya", dist: "2.4 km" },
      { icon: <ShoppingBag size={18} />, name: "Solo Paragon Mall", dist: "3.1 km" },
    ],
    transportasi: [
      { icon: <Train size={18} />, name: "Stasiun Purwosari", dist: "4.2 km" },
      { icon: <Bus size={18} />, name: "Halte BST Kadipiro", dist: "0.5 km" },
      { icon: <Navigation2 size={18} />, name: "Terminal Tirtonadi", dist: "2.1 km" },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 1. HERO GALLERY */}
      <div className="max-w-[1300px] mx-auto px-4 md:px-10 pt-6">
        <div className="flex gap-2 h-[350px] md:h-[500px] w-full overflow-hidden relative rounded-[24px] md:rounded-[40px]">
          <div className="absolute top-4 left-4 z-20">
            <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-50 transition-all">
              <ArrowLeft size={20} />
            </button>
          </div>
          <div className="w-2/3 h-full overflow-hidden">
            <img src={item.image} className="w-full h-full object-cover" alt="main" />
          </div>
          <div className="w-1/3 flex flex-col gap-2">
            <img src="https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=600" className="h-1/2 w-full object-cover" alt="sub1" />
            <img src="https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=600" className="h-1/2 w-full object-cover" alt="sub2" />
          </div>
        </div>
      </div>

      <div className="max-w-[1300px] mx-auto px-6 md:px-10 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* KOLOM KIRI */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase">Tersedia 2 Kamar</span>
              <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-1 rounded-full">
                <Star size={14} fill="currentColor" />
                <span className="text-xs font-bold text-amber-700">4.8 (12 Review)</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">{item.name}</h1>
            <div className="flex items-center gap-2 text-slate-500 mb-10 pb-8 border-b">
              <MapPin size={18} className="text-rose-500" />
              <span className="text-lg">{item.location}</span>
            </div>

            {/* A. SPESIFIKASI KAMAR */}
            <section className="mb-12">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Spesifikasi Kamar</h3>
              <div className="flex flex-wrap gap-8">
                <div className="flex items-center gap-3">
                  <Maximize className="text-indigo-600" size={24} />
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Luas Kamar</p>
                    <p className="text-sm font-bold text-slate-700">{item.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="text-indigo-600" size={24} />
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Kapasitas</p>
                    <p className="text-sm font-bold text-slate-700">Maks. 2 Orang</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="text-indigo-600" size={24} />
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Listrik</p>
                    <p className="text-sm font-bold text-slate-700">Token Sendiri</p>
                  </div>
                </div>
              </div>
            </section>

            {/* B. SEMUA FASILITAS */}
            <div className="space-y-12 mb-16">
              <section>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Bed size={18} className="text-indigo-600" /> Fasilitas Kamar
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {["AC Inverter", "Springbed 160x200", "Meja Kerja", "Lemari", "Cermin"].map((f, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <CheckCircle2 size={16} className="text-indigo-500" />
                      <span className="text-sm font-bold text-slate-700">{f}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Bath size={18} className="text-indigo-600" /> Fasilitas Kamar Mandi
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {["KM Dalam", "Water Heater", "Kloset Duduk", "Shower"].map((f, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 border border-slate-100 rounded-2xl">
                      <CheckCircle2 size={16} className="text-green-500" />
                      <span className="text-sm font-medium">{f}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Utensils size={18} className="text-indigo-600" /> Fasilitas Bersama & Parkir
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-700 text-sm italic">
                    <Wifi size={18} className="text-indigo-500" /> WiFi 50 Mbps
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-700 text-sm italic">
                    <Car size={18} className="text-indigo-500" /> Parkir Mobil & Motor
                  </div>
                </div>
              </section>
            </div>

            {/* C. LOKASI SEKITAR */}
            <section className="mb-16">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Lokasi dan lingkungan sekitar</h3>
              <div className="flex items-center gap-2 text-slate-500 mb-6 italic">
                <MapPin size={16} />
                <span className="text-sm">Banjarsari, Kota Surakarta, Surakarta</span>
              </div>

              <div className="relative w-full h-[350px] bg-slate-100 rounded-3xl overflow-hidden mb-8 group shadow-inner">
                <iframe
                  title="map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3955.123!2d110.8!3d-7.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwMzAnMDAuMCJTIDExMMKwNDgnMDAuMCJF!5e0!3m2!1sid!2sid!4v123456789"
                  className="w-full h-full grayscale opacity-70"
                ></iframe>
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="bg-white px-6 py-3 rounded-xl shadow-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 border border-slate-100">Tanya alamat lengkap</button>
                </div>
              </div>

              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => setActiveTab("terdekat")}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all border ${activeTab === "terdekat" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
                >
                  Tempat Terdekat
                </button>
                <button
                  onClick={() => setActiveTab("transportasi")}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all border ${activeTab === "transportasi" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
                >
                  Transportasi
                </button>
              </div>

              <div className="space-y-6">
                {lokasiSekitar[activeTab].map((loc, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 border border-slate-100">{loc.icon}</div>
                    <div className="flex-1 border-b border-slate-50 pb-4">
                      <p className="text-base font-medium text-slate-700">{loc.name}</p>
                      <p className="text-sm text-slate-400 font-medium">{loc.dist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* D. PERATURAN */}
            <section className="bg-slate-900 p-8 rounded-[32px] text-white shadow-xl mb-16">
              <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <ShieldCheck size={20} /> Peraturan Kost
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["Maksimal 2 penghuni (ada biaya tambahan)", "Dilarang membawa hewan peliharaan", "Lawan jenis dilarang masuk kamar", "Menjaga ketenangan setelah jam 22.00", "Dilarang merokok di dalam kamar AC"].map((rule, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm text-slate-300">
                    <div className="mt-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0"></div>
                    {rule}
                  </div>
                ))}
              </div>
            </section>

            {/* E. REVIEW */}
            <section className="pt-8 border-t">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Ulasan Penghuni</h3>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="flex gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-slate-600 italic">"Kost paling nyaman di Kadipiro. Dekat UTP dan lokasinya tenang. Parkir mobilnya benar-benar luas."</p>
                <p className="text-xs font-bold text-slate-400 mt-4 uppercase tracking-widest">— Ananda Nur</p>
              </div>
            </section>
          </div>

          {/* KOLOM KANAN (STICKY CARD) */}
          <div className="w-full lg:w-[400px]">
            <div className="sticky top-10 bg-white border border-slate-200 rounded-[40px] p-8 shadow-2xl shadow-slate-100">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Harga Sewa Bulanan</p>
                  <h2 className="text-4xl font-black text-indigo-600">Rp {item.price}</h2>
                </div>
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${isLiked ? "bg-red-50 border-red-100 text-red-500" : "bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100"}`}
                >
                  <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
                </button>
              </div>
              <button
                className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all mb-4 flex items-center justify-center gap-3 text-lg"
                onClick={() => window.open(`https://wa.me/628123456789?text=Halo, saya ingin sewa untuk ${item.name}`, "_blank")}
              >
                <MessageCircle size={22} /> Ajukan Sewa
              </button>

              {/* ── TAMBAHAN: onClick handleTanyaPemilik ── */}
              <button onClick={handleTanyaPemilik} className="w-full bg-white text-slate-600 border-2 border-slate-200 font-bold py-4 rounded-2xl hover:bg-slate-50 transition-all">
                Tanya Pemilik
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
