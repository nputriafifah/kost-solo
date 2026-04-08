import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Heart, MessageCircle } from "lucide-react";

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`http://localhost:3000/listings/public/${id}`);
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

          // 🔥 ROOM TYPE
          price: room?.price || 0,
          size: room?.size || "-",
          facilities: room?.facilities || [],

          // 🔥 MULTI IMAGE SUPPORT
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

  if (loading) return <p className="p-6">Loading...</p>;
  if (!item) return <p className="p-6">Data tidak ditemukan</p>;

  return (
    <div className="min-h-screen bg-white">
      
      {/* HEADER */}
      <div className="p-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft />
        </button>
        <h1 className="font-bold">Detail Kost</h1>
      </div>

      {/* IMAGE (pakai foto pertama) */}
      <img
        src={
          item.images[0] ||
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
        }
        className="w-full h-[250px] object-cover"
        alt=""
      />

      <div className="p-6">
        <h2 className="text-2xl font-bold mb-2">{item.name}</h2>

        <div className="flex items-center gap-2 text-gray-500 mb-4">
          <MapPin size={16} />
          <span>{item.location}</span>
        </div>

        <h3 className="text-xl font-bold text-indigo-600 mb-4">
          Rp {item.price}
        </h3>

        <p className="text-gray-600 mb-6">{item.description}</p>

        {/* SIZE */}
        <p className="mb-2">
          <b>Luas kamar:</b> {item.size}
        </p>

        {/* FASILITAS */}
        <div className="mb-6">
          <b>Fasilitas:</b>
          <ul className="list-disc ml-5 mt-2">
            {item.facilities.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>

        {/* RULES */}
        <div className="mb-6">
          <b>Peraturan:</b>
          <ul className="list-disc ml-5 mt-2">
            {item.rules.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>

        {/* BUTTON */}
        <div className="flex gap-3">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="p-3 border rounded-xl"
          >
            <Heart fill={isLiked ? "red" : "none"} />
          </button>

          <button
            className="flex-1 bg-indigo-600 text-white py-3 rounded-xl"
            onClick={() =>
              window.open(
                `https://wa.me/${item.contactNumber || "62xxxx"}?text=Halo saya tertarik ${item.name}`
              )
            }
          >
            <MessageCircle /> Hubungi
          </button>
        </div>
      </div>
    </div>
  );
}