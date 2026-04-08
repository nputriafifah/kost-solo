import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import OwnerSidebar from "../../components/owner/OwnerSidebar";
import OwnerCard from "../../components/owner/OwnerCard";

export default function DashboardOwnerPage() {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const initials = user.name
    ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  useEffect(() => {
  const fetchListings = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:3000/listings/owner", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

     const data = await res.json();
console.log("LISTINGS:", data);

setListings(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false); // 🔥 INI YANG KURANG
    }
  };

  fetchListings();
}, []);

  const filtered = listings.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* SIDEBAR */}
      <OwnerSidebar initials={initials} user={user} />

      {/* MAIN */}
      <div className="flex-1 p-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Dashboard Owner
            </h2>
            <p className="text-sm text-slate-500">
              Kelola properti kost kamu dengan mudah
            </p>
          </div>

          <button
            onClick={() => navigate("/owner/create")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} /> Tambah Kost
          </button>
        </div>

        {/* SEARCH */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border mb-8 flex gap-2">
          <input
            type="text"
            placeholder="Cari nama kost..."
            className="flex-1 px-4 py-2 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-1">
            <Search size={16} /> Cari
          </button>
        </div>

        {/* LIST */}
        {loading ? (
          <p>Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl text-center shadow-sm border">
            <p className="text-slate-400 mb-3">
              Kamu belum punya data kost 😢
            </p>
            <button
              onClick={() => navigate("/owner/create")}
              className="bg-indigo-600 text-white px-5 py-2 rounded-xl"
            >
              Tambah Kost Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {filtered.map((item) => (
              <OwnerCard
                key={item.id}
                item={item}
                onEdit={(id) => navigate(`/owner/edit/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}