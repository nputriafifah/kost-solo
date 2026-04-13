import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Building2 } from "lucide-react";

export default function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    name: "",
    address: "",
    description: "",
    contactNumber: "",
  });

  const [loading, setLoading] = useState(true);

  // 🔥 GET DETAIL
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`http://localhost:3000/owner/listings/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();

        setForm({
          name: json.data?.name || "",
          address: json.data?.address || "",
          description: json.data?.description || "",
          contactNumber: json.data?.contactNumber || "",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  // 🔥 HANDLE INPUT
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // 🔥 SUBMIT UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        `http://localhost:3000/owner/listings/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      const json = await res.json();

      if (res.ok) {
        alert("Berhasil update!");
        navigate("/owner/dashboard");
      } else {
        alert(json.message || "Gagal update");
      }
    } catch (err) {
      console.error(err);
      alert("Error update");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-slate-50 border flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-slate-500" />
        </button>

        <div>
          <h2 className="text-lg font-black text-slate-900">
            Edit Listing
          </h2>
          <p className="text-xs text-slate-400">
            Perbarui informasi kost kamu
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-6 max-w-2xl mx-auto">

        {/* CARD */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">

          {/* ICON */}
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-5">
            <Building2 size={24} className="text-indigo-600" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Nama */}
            <div>
              <label className="text-xs font-bold text-slate-500">
                Nama Kost
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>

            {/* Alamat */}
            <div>
              <label className="text-xs font-bold text-slate-500">
                Alamat
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>

            {/* Deskripsi */}
            <div>
              <label className="text-xs font-bold text-slate-500">
                Deskripsi
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Kontak */}
            <div>
              <label className="text-xs font-bold text-slate-500">
                Nomor Kontak
              </label>
              <input
                type="text"
                name="contactNumber"
                value={form.contactNumber}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-black shadow-lg shadow-indigo-100 active:scale-95 transition"
            >
              <Save size={16} />
              Simpan Perubahan
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}