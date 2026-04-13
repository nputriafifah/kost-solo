import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Edit3, Trash2 } from "lucide-react";

export default function DetailListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= FETCH DETAIL =================
  const fetchDetail = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/listings/owner/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await res.text();

      let json;
      try {
        json = JSON.parse(text);
      } catch {
        json = { message: text };
      }

      if (!res.ok) throw new Error(json.message || "Data tidak ditemukan");

      setData(json.data || json);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // ================= DELETE =================
  const handleDelete = async () => {
    if (!confirm("Yakin hapus kost ini?")) return;

    try {
      const res = await fetch(
        `http://localhost:3000/listings/owner/${id}/deactivate`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      if (!res.ok) {
        throw new Error(data.message || "Gagal menghapus");
      }

      alert("Berhasil dihapus");
      navigate("/owner/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  // ================= UI =================
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading...
      </div>
    );

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Data tidak ditemukan
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center bg-white px-5 py-4 rounded-2xl shadow-sm border border-slate-100">
          <button
            onClick={() => navigate("/owner/dashboard")}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600"
          >
            <ArrowLeft size={16} /> Kembali
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/owner/edit/${id}`)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow hover:bg-indigo-700"
            >
              <Edit3 size={16} /> Edit
            </button>

            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow hover:bg-red-600"
            >
              <Trash2 size={16} /> Hapus
            </button>
          </div>
        </div>

        {/* FOTO */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {data.photos?.length > 0 ? (
            data.photos.map((p, i) => (
              <img
                key={i}
                src={p.url}
                alt="foto"
                className="rounded-xl object-cover h-48 w-full hover:scale-105 transition-transform"
              />
            ))
          ) : (
            <p className="text-gray-400">Belum ada foto</p>
          )}
        </div>

        {/* INFO */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <h1 className="text-2xl font-black text-slate-900">
            {data.name}
          </h1>

          <p className="flex items-center gap-2 text-gray-500">
            <MapPin size={16} />
            {data.address}
          </p>

          <p className="text-slate-600">{data.description}</p>

          <div className="flex gap-3 flex-wrap">
            <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full">
              {data.genderType}
            </span>

            <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-1 rounded-full">
              📞 {data.contactNumber}
            </span>
          </div>

          <div>
            <p className="font-semibold mb-1">Rules:</p>
            <ul className="list-disc ml-5 text-sm text-slate-600">
              {data.rules?.length > 0 ? (
                data.rules.map((r, i) => <li key={i}>{r}</li>)
              ) : (
                <li>Tidak ada rules</li>
              )}
            </ul>
          </div>
        </div>

        {/* ROOM TYPES */}
        <div className="space-y-4">
          <h2 className="font-black text-lg text-slate-800">
            Room Types
          </h2>

          {data.roomTypes?.length > 0 ? (
            data.roomTypes.map((room) => (
              <div
                key={room.id}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition"
              >
                <h3 className="font-bold text-slate-900">
                  {room.name}
                </h3>

                <p className="text-indigo-600 font-bold text-lg">
                  Rp {room.price?.toLocaleString("id")}
                </p>

                <div className="text-sm text-slate-500 mt-1 space-y-1">
                  <p>Ukuran: {room.size}</p>
                  <p>Stok: {room.availableCount}</p>
                </div>

                <p className="text-sm text-slate-400 mt-2">
                  {room.facilities?.join(", ") || "-"}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-400">Belum ada room</p>
          )}
        </div>
      </div>
    </div>
  );
}