import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Plus, Home, MapPin } from "lucide-react";

export default function DashboardOwnerPage() {
  const navigate = useNavigate();

  const [kostList, setKostList] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const ownerName = user.name || "Owner";

  // 🔥 Fetch data kost milik owner
  useEffect(() => {
    const fetchKost = async () => {
      try {
        const res = await fetch("http://localhost:5001/owner/listings");
        const json = await res.json();

        setKostList(json.data || []);
      } catch (err) {
        console.error("Fetch owner kost error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchKost();
  }, []);

  return (
    <div className="min-h-screen bg-white p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">
            Dashboard Owner
          </h1>
          <p className="text-sm text-slate-400">
            Halo, {ownerName}
          </p>
        </div>

        <button
          onClick={() => navigate("/owner/add")}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow hover:bg-indigo-700 transition"
        >
          <Plus size={16} />
          Tambah Kost
        </button>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-indigo-50 border">
          <p className="text-xs text-slate-500">Total Kost</p>
          <h2 className="text-xl font-bold text-indigo-600">
            {kostList.length}
          </h2>
        </div>

        <div className="p-4 rounded-xl bg-green-50 border">
          <p className="text-xs text-slate-500">Aktif</p>
          <h2 className="text-xl font-bold text-green-600">
            {kostList.filter(k => k.status === "active").length}
          </h2>
        </div>
      </div>

      {/* LIST KOST */}
      <div>
        <h3 className="font-bold mb-4 text-slate-700">
          Kost Anda
        </h3>

        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : kostList.length > 0 ? (
          <div className="space-y-3">
            {kostList.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/owner/detail/${item.id}`)}
                className="p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition cursor-pointer"
              >
                <h4 className="font-semibold text-slate-800">
                  {item.title || item.name}
                </h4>

                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin size={12} />
                  {item.address || item.location}
                </p>

                <p className="text-sm font-bold text-indigo-600 mt-2">
                  Rp {item.price}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-400 py-10">
            <Home size={40} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">
              Belum ada kost, yuk tambah dulu!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}