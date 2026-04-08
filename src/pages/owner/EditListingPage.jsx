import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

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
          name: json.data.name || "",
          address: json.data.address || "",
          description: json.data.description || "",
          contactNumber: json.data.contactNumber || "",
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

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-sm border">

        <h2 className="text-xl font-bold mb-4">
          Edit Kost
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            name="name"
            placeholder="Nama Kost"
            value={form.name}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl"
            required
          />

          <input
            type="text"
            name="address"
            placeholder="Alamat"
            value={form.address}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl"
            required
          />

          <textarea
            name="description"
            placeholder="Deskripsi"
            value={form.description}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl"
          />

          <input
            type="text"
            name="contactNumber"
            placeholder="Nomor Kontak"
            value={form.contactNumber}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl"
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl"
          >
            Simpan Perubahan
          </button>
        </form>
      </div>
    </div>
  );
}