import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddKostPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    price: "",
    address: "",
    image: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5001/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      alert("Kost berhasil ditambahkan!");
      navigate("/owner/dashboard");

    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Tambah Kost</h1>

      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Nama Kost" onChange={handleChange} />
        <br /><br />

        <input name="price" placeholder="Harga" onChange={handleChange} />
        <br /><br />

        <input name="address" placeholder="Alamat" onChange={handleChange} />
        <br /><br />

        <input name="image" placeholder="URL Gambar" onChange={handleChange} />
        <br /><br />

        <button disabled={loading}>
          {loading ? "Loading..." : "Tambah Kost"}
        </button>
      </form>
    </div>
  );
}