import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Heart,
  MessageCircle,
  Home,
  Ruler,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  // ❤️ FAVORITE
  useEffect(() => {
    const saved = localStorage.getItem("atap_favorites");
    const favs = saved ? JSON.parse(saved) : [];
    setIsLiked(favs.includes(id));
  }, [id]);

  const toggleLike = () => {
    const saved = localStorage.getItem("atap_favorites");
    const favs = saved ? JSON.parse(saved) : [];
    const next = isLiked
      ? favs.filter((f) => f !== id)
      : [...favs, id];

    localStorage.setItem("atap_favorites", JSON.stringify(next));
    setIsLiked(!isLiked);
  };

  // 📞 FORMAT NOMOR WA
  const formatPhone = (num) => {
    if (!num) return "";
    if (num.startsWith("0")) return "62" + num.slice(1);
    return num;
  };

  // 📡 FETCH DATA
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`http://localhost:3000/listings/${id}`);

        if (!res.ok) throw new Error("Gagal fetch");

        const json = await res.json();
        const data = json.data;

        if (!data) return;

        const room = data.roomTypes?.[0];

        setItem({
          id: data.id,
          name: data.name || "Tanpa nama",
          location: data.address || "Lokasi tidak tersedia",
          description: data.description || "",
          rules: Array.isArray(data.rules)
            ? data.rules
            : data.rules
            ? [data.rules]
            : [],
          gender: data.genderType,
          contactNumber:
            data.contactNumber || data.owner?.phone || "",
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
    window.scrollTo(0, 0);
  }, [id]);

  const genderColor = {
    putra: "bg-blue-50 text-blue-700",
    putri: "bg-pink-50 text-pink-700",
    campur: "bg-green-50 text-green-700",
  };

  // ⏳ LOADING
  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="h-64 bg-slate-200 animate-pulse" />
        <div className="p-5 space-y-3">
          <div className="h-5 bg-slate-200 rounded-full w-2/3 animate-pulse" />
          <div className="h-4 bg-slate-100 rounded-full w-1/2 animate-pulse" />
          <div className="h-6 bg-slate-200 rounded-full w-1/3 animate-pulse" />
        </div>
      </div>
    );

  // ❌ NOT FOUND
  if (!item)
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Home size={36} className="text-slate-300" />
        <p className="text-sm font-medium text-slate-600">
          Data tidak ditemukan
        </p>
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-semibold text-blue-600 border border-blue-200 px-4 py-2 rounded-full"
        >
          Kembali
        </button>
      </div>
    );

  const images =
    item.images.length > 0
      ? item.images
      : [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
        ];

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* IMAGE */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={images[activeImg]}
          alt={item.name}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

        {/* back */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-5 left-4 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow"
        >
          <ArrowLeft size={18} />
        </button>

        {/* like */}
        <button
          onClick={toggleLike}
          className={`absolute top-5 right-4 w-9 h-9 rounded-full flex items-center justify-center shadow ${
            isLiked ? "bg-red-500" : "bg-white/90"
          }`}
        >
          <Heart
            size={16}
            fill={isLiked ? "white" : "none"}
            className={isLiked ? "text-white" : "text-slate-600"}
          />
        </button>

        {/* slider */}
        {images.length > 1 && (
          <>
            <button
              onClick={() =>
                setActiveImg((p) => (p - 1 + images.length) % images.length)
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 w-8 h-8 rounded-full flex items-center justify-center"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              onClick={() =>
                setActiveImg((p) => (p + 1) % images.length)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 w-8 h-8 rounded-full flex items-center justify-center"
            >
              <ChevronRight size={16} />
            </button>

            {/* counter */}
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full">
              {activeImg + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* CONTENT */}
      <div className="px-4 py-5">
        <div className="flex justify-between mb-2">
          <h1 className="text-xl font-extrabold text-slate-800">
            {item.name}
          </h1>

          {item.gender && (
            <span
              className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                genderColor[item.gender?.toLowerCase()] ||
                "bg-slate-100 text-slate-500"
              }`}
            >
              {item.gender}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-slate-400 mb-4">
          <MapPin size={13} className="text-blue-500" />
          <span className="text-xs">{item.location}</span>
        </div>

        <div className="bg-blue-50 rounded-2xl px-4 py-3 mb-5 inline-flex gap-1 items-baseline">
          <span className="text-xl font-extrabold text-blue-600">
            Rp {Number(item.price).toLocaleString("id-ID")}
          </span>
          <span className="text-xs text-blue-400">/bulan</span>
        </div>

        {/* stats */}
        <div className="flex gap-3 mb-5">
          <div className="flex-1 bg-white rounded-2xl p-3 border flex gap-2 items-center">
            <Ruler size={14} className="text-blue-500" />
            <div>
              <p className="text-[10px] text-slate-400">Luas</p>
              <p className="text-xs font-bold">{item.size}</p>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-2xl p-3 border flex gap-2 items-center">
            <Home size={14} className="text-blue-500" />
            <div>
              <p className="text-[10px] text-slate-400">Tipe</p>
              <p className="text-xs font-bold">
                {item.gender || "Umum"}
              </p>
            </div>
          </div>
        </div>

        {/* description */}
        {item.description && (
          <div className="mb-5">
            <h3 className="text-sm font-bold mb-2">Deskripsi</h3>
            <p className="text-sm text-slate-500">
              {item.description}
            </p>
          </div>
        )}

        {/* fasilitas */}
        {item.facilities.length > 0 && (
          <div className="mb-5">
            <h3 className="text-sm font-bold mb-2">Fasilitas</h3>
            <div className="flex flex-wrap gap-2">
              {item.facilities.map((f, i) => (
                <span
                  key={i}
                  className="text-xs bg-white border px-3 py-1.5 rounded-full"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* rules */}
        {item.rules.length > 0 && (
          <div>
            <h3 className="text-sm font-bold mb-2">Peraturan</h3>
            <div className="bg-white rounded-2xl border overflow-hidden">
              {item.rules.map((r, i) => (
                <div
                  key={i}
                  className="flex gap-3 px-4 py-3 border-b last:border-none"
                >
                  <ShieldCheck size={14} className="text-blue-500" />
                  <span className="text-xs text-slate-600">
                    {r}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-4 flex gap-3">
        <button
          onClick={toggleLike}
          className="w-12 h-12 rounded-2xl border flex items-center justify-center"
        >
          <Heart
            size={18}
            fill={isLiked ? "red" : "none"}
            className={isLiked ? "text-red-500" : "text-slate-400"}
          />
        </button>

        <button
          onClick={() =>
            window.open(
              `https://wa.me/${formatPhone(
                item.contactNumber
              )}?text=Halo saya tertarik dengan kost ${item.name}`
            )
          }
          className="flex-1 bg-blue-600 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
        >
          <MessageCircle size={16} />
          Hubungi Pemilik
        </button>
      </div>
    </div>
  );
}