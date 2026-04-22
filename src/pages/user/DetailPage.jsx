import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Heart, MessageCircle, Home, Ruler, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("atap_favorites");
    const favs = saved ? JSON.parse(saved) : [];
    setIsLiked(favs.includes(id));
  }, [id]);

  const toggleLike = () => {
    const saved = localStorage.getItem("atap_favorites");
    const favs = saved ? JSON.parse(saved) : [];
    const next = isLiked ? favs.filter((f) => f !== id) : [...favs, id];
    localStorage.setItem("atap_favorites", JSON.stringify(next));
    setIsLiked(!isLiked);
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`http://localhost:3000/listings/${id}`);
        const json = await res.json();
        const data = json.data;
        const room = data.roomTypes?.[0];
        setItem({
          id: data.id,
          name: data.name,
          location: data.address,
          description: data.description,
          rules: data.rules || [],
          gender: data.genderType,
          contactNumber: data.contactNumber || data.owner?.phone || "",
          price: room?.price || 0,
          size: room?.size || "-",
          facilities: room?.facilities || [],
          images: room?.photos?.map((p) => p.url) || [],
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const genderColor = {
    putra: "bg-blue-50 text-blue-700",
    putri: "bg-pink-50 text-pink-700",
    campur: "bg-green-50 text-green-700",
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="h-64 bg-slate-200 animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-slate-200 animate-pulse rounded-full w-2/3" />
        <div className="h-4 bg-slate-100 animate-pulse rounded-full w-1/2" />
        <div className="h-6 bg-slate-200 animate-pulse rounded-full w-1/3" />
      </div>
    </div>
  );

  if (!item) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3 text-slate-400">
      <Home size={36} className="text-slate-300" />
      <p className="text-sm font-medium text-slate-600">Data tidak ditemukan</p>
      <button onClick={() => navigate(-1)} className="text-xs font-semibold text-blue-600 border border-blue-200 px-4 py-2 rounded-full">
        Kembali
      </button>
    </div>
  );

  const images = item.images.length > 0
    ? item.images
    : ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"];

  return (
    <div className="min-h-screen bg-slate-50 pb-32" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      {/* IMAGE CAROUSEL */}
      <div className="relative h-64 bg-slate-200 overflow-hidden">
        <img
          src={images[activeImg]}
          alt={item.name}
          className="w-full h-full object-cover transition-opacity duration-300"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-5 left-4 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-sm"
        >
          <ArrowLeft size={18} className="text-slate-700" />
        </button>

        {/* Like button */}
        <button
          onClick={toggleLike}
          className={`absolute top-5 right-4 w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-colors ${
            isLiked ? "bg-red-500" : "bg-white/90"
          }`}
        >
          <Heart size={16} fill={isLiked ? "white" : "none"} className={isLiked ? "text-white" : "text-slate-600"} />
        </button>

        {/* Carousel controls */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActiveImg((p) => (p - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center"
            >
              <ChevronLeft size={16} className="text-slate-600" />
            </button>
            <button
              onClick={() => setActiveImg((p) => (p + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center"
            >
              <ChevronRight size={16} className="text-slate-600" />
            </button>
            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`rounded-full transition-all ${i === activeImg ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* CONTENT */}
      <div className="px-4 py-4">

        {/* Name + gender badge */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h1 className="text-xl font-extrabold text-slate-800 leading-tight flex-1" style={{ fontFamily: "Plus Jakarta Sans" }}>
            {item.name}
          </h1>
          {item.gender && (
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${genderColor[item.gender?.toLowerCase()] || "bg-slate-100 text-slate-500"}`}>
              {item.gender.charAt(0).toUpperCase() + item.gender.slice(1)}
            </span>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-slate-400 mb-3">
          <MapPin size={13} className="text-blue-400 flex-shrink-0" />
          <span className="text-xs">{item.location}</span>
        </div>

        {/* Price */}
        <div className="bg-blue-50 rounded-2xl px-4 py-3 mb-4 inline-flex items-baseline gap-1">
          <span className="text-xl font-extrabold text-blue-600" style={{ fontFamily: "Plus Jakarta Sans" }}>
            Rp {Number(item.price).toLocaleString("id-ID")}
          </span>
          <span className="text-xs text-blue-400 font-medium">/bulan</span>
        </div>

        {/* Stats row */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-white rounded-2xl p-3 border border-slate-100 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
              <Ruler size={14} className="text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Luas</p>
              <p className="text-xs font-bold text-slate-700">{item.size}</p>
            </div>
          </div>
          <div className="flex-1 bg-white rounded-2xl p-3 border border-slate-100 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
              <Home size={14} className="text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Tipe</p>
              <p className="text-xs font-bold text-slate-700">{item.gender || "Umum"}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800 mb-2" style={{ fontFamily: "Plus Jakarta Sans" }}>Deskripsi</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
          </div>
        )}

        {/* Facilities */}
        {item.facilities.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800 mb-2" style={{ fontFamily: "Plus Jakarta Sans" }}>Fasilitas</h3>
            <div className="flex flex-wrap gap-2">
              {item.facilities.map((f, i) => (
                <span key={i} className="text-xs font-medium bg-white border border-slate-100 text-slate-600 px-3 py-1.5 rounded-full">
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Rules */}
        {item.rules.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800 mb-2" style={{ fontFamily: "Plus Jakarta Sans" }}>Peraturan</h3>
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              {item.rules.map((r, i) => (
                <div key={i} className={`flex items-start gap-3 px-4 py-3 ${i !== item.rules.length - 1 ? "border-b border-slate-50" : ""}`}>
                  <ShieldCheck size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-600">{r}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-4 flex gap-3">
        <button
          onClick={toggleLike}
          className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 transition-colors ${
            isLiked ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"
          }`}
        >
          <Heart size={18} fill={isLiked ? "red" : "none"} className={isLiked ? "text-red-500" : "text-slate-400"} />
        </button>
        <button
          onClick={() => window.open(`https://wa.me/${item.contactNumber || "62xxxx"}?text=Halo saya tertarik dengan kost ${item.name}`)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <MessageCircle size={16} />
          Hubungi Pemilik
        </button>
      </div>
    </div>
  );
}