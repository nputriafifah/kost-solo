import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OwnerSidebar from "../../components/owner/OwnerSidebar";
import MapPicker from "../../components/owner/MapPicker";

export default function CreateListingPage() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ===== LISTING =====
  const [form, setForm] = useState({
    name: "",
    address: "",
    genderType: "PUTRA",
    description: "",
    rules: "",
    contactNumber: "",
  });

  // ===== ROOM TYPE =====
  const [room, setRoom] = useState({
    name: "",
    price: "",
    size: "",
    facilities: "",
    availableCount: 1,
  });

  // ===== FOTO =====
  const [photos, setPhotos] = useState([]);

  const [latLng, setLatLng] = useState(null);
  const [loading, setLoading] = useState(false);

  // =============================
  // HANDLE INPUT
  // =============================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoomChange = (e) => {
    setRoom({ ...room, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    setPhotos([...e.target.files]);
  };

  // =============================
  // SUBMIT
  // =============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Kamu belum login!");
      navigate("/auth");
      return;
    }

    if (!latLng) {
      alert("Pilih lokasi dulu!");
      return;
    }

    setLoading(true);

    try {
      // =====================
      // 1. CREATE LISTING
      // =====================
      const resListing = await fetch(
        "http://localhost:3000/listings/owner",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...form,
            latitude: latLng.lat,
            longitude: latLng.lng,
            rules: form.rules
              ? form.rules.split(",").map((r) => r.trim())
              : [],
          }),
        }
      );

      const textListing = await resListing.text();
console.log("LISTING RAW:", textListing);

let listingJson;
try {
  listingJson = JSON.parse(textListing);
} catch (e) {
  throw new Error("Response listing bukan JSON:\n" + textListing);
}

if (!resListing.ok) {
  throw new Error(listingJson.message || "Gagal create listing");
}

const listingId = listingJson.data.id;

      // =====================
      // 2. CREATE ROOM TYPE
      // =====================
      const resRoom = await fetch(
  `http://localhost:3000/owner/listings/${listingId}/room-types`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: room.name,
      price: Number(room.price),
      size: room.size,
      facilities: room.facilities
        ? room.facilities.split(",").map((f) => f.trim())
        : [],
      availableCount: Number(room.availableCount),
    }),
  }
);

     const textRoom = await resRoom.text();
console.log("ROOM RAW:", textRoom);

let roomJson;
try {
  roomJson = JSON.parse(textRoom);
} catch (e) {
  throw new Error("Response room bukan JSON:\n" + textRoom);
}

if (!resRoom.ok) {
  throw new Error(roomJson.message || "Gagal create room");
}

const roomId = roomJson.data.id;

      // =====================
      // 3. UPLOAD FOTO
      // =====================
      if (photos.length > 0) {
        const formData = new FormData();

        photos.forEach((file) => {
          formData.append("photos", file);
        });

        await fetch(
          `http://localhost:3000/room-types/${roomId}/photos`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );
      }

      alert("Kost + kamar + foto berhasil 🚀");
      navigate("/owner/dashboard");

    } catch (err) {
      console.error(err);
      alert("Gagal: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <div className="flex min-h-screen bg-slate-50">
      <OwnerSidebar user={user} initials={initials} />

      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-6">Tambah Kost</h2>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl shadow-sm space-y-4"
        >
          {/* ===== LISTING ===== */}
          <input name="name" placeholder="Nama Kost" className="input" onChange={handleChange} />
          <input name="address" placeholder="Alamat" className="input" onChange={handleChange} />

          <MapPicker setLatLng={setLatLng} />

          <select name="genderType" className="input" onChange={handleChange}>
            <option value="PUTRA">Putra</option>
            <option value="PUTRI">Putri</option>
            <option value="CAMPUR">Campur</option>
          </select>

          <textarea name="description" placeholder="Deskripsi" className="input" onChange={handleChange} />
          <input name="rules" placeholder="Rules (pisahkan koma)" className="input" onChange={handleChange} />
          <input name="contactNumber" placeholder="Nomor Kontak" className="input" onChange={handleChange} />

          {/* ===== ROOM ===== */}
          <h3 className="font-bold mt-6">Room Type</h3>
          <input
  placeholder="Nama Kamar"
  className="input"
  onChange={(e) =>
    setRoom({ ...room, name: e.target.value })
  }
/>
          <input name="price" placeholder="Harga" className="input" onChange={handleRoomChange} />
          <input name="size" placeholder="Ukuran" className="input" onChange={handleRoomChange} />
          <input name="facilities" placeholder="AC, Wifi, dll" className="input" onChange={handleRoomChange} />

          {/* ===== FOTO ===== */}
          <h3 className="font-bold mt-6">Upload Foto</h3>
          <input type="file" multiple onChange={handlePhotoChange} />

          <button
            disabled={loading}
            className="bg-indigo-600 text-white px-5 py-3 rounded-xl w-full"
          >
            {loading ? "Menyimpan..." : "Simpan Kost"}
          </button>
        </form>
      </div>
    </div>
  );
}