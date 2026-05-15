import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Check, MapPin, Loader2 } from "lucide-react";
import MapPicker from "../../components/owner/MapPicker";

const RULE_OPTIONS = [
  "Tidak boleh bawa pasangan",
  "Jam malam pukul 22.00",
  "Tidak boleh merokok",
  "Tidak boleh bawa hewan peliharaan",
];

const FACILITY_OPTIONS = [
  "Wifi",
  "AC",
  "Kamar Mandi Dalam",
  "Parkir",
  "Laundry",
];

const STEPS = [
  { label: "Data Kos", desc: "Info dasar kost kamu" },
  { label: "Lokasi", desc: "Alamat & titik peta" },
  { label: "Fasilitas", desc: "Fasilitas kamar" },
  { label: "Ketersediaan", desc: "Jumlah kamar" },
  { label: "Detail Kamar", desc: "Tipe & harga" },
  { label: "Foto Kamar", desc: "Upload foto" },
];

const API = "http://localhost:3000";
const getToken = () => localStorage.getItem("token") || "";

export default function CreateListingPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    address: "",
    genderType: "PUTRA",
    description: "",
    contactNumber: "",
    rules: [],
  });

  const [latLng, setLatLng] = useState(null);

  const [room, setRoom] = useState({
    name: "",
    price: "",
    size: "",
    facilities: [],
    availableCount: 1,
  });

  const [roomPhotos, setRoomPhotos] = useState([]);

  const toggleItem = (list, item) =>
    list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

  // Validate before moving to next step
  const validateStep = () => {
    const e = {};
    if (step === 1) {
      if (form.name.trim().length < 3) e.name = "Nama minimal 3 karakter";
      if (form.description.trim().length < 10) e.description = "Deskripsi minimal 10 karakter";
      if (form.contactNumber.trim().length < 8) e.contactNumber = "Nomor kontak minimal 8 digit";
      if (form.rules.length === 0) e.rules = "Pilih minimal 1 peraturan";
    }
    if (step === 2) {
      if (form.address.trim().length < 10) e.address = "Alamat minimal 10 karakter";
      if (!latLng) e.latLng = "Tandai lokasi di peta";
    }
    if (step === 5) {
      if (!room.name.trim()) e.roomName = "Nama tipe kamar wajib diisi";
      if (!room.size.trim()) e.roomSize = "Ukuran kamar wajib diisi";
      if (!room.price) e.roomPrice = "Harga wajib diisi";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
      // 1. Create listing — POST /listings/owner
      const resListing = await fetch(`${API}/listings/owner`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          address: form.address.trim(),
          genderType: form.genderType,
          description: form.description.trim(),
          contactNumber: form.contactNumber.trim(),
          rules: form.rules,
          latitude: Number(latLng.lat),
          longitude: Number(latLng.lng),
        }),
      });

      const listingJson = await resListing.json();
      if (!resListing.ok) throw new Error(listingJson.message || "Gagal membuat listing");
      const listingId = listingJson.data?.id;

      // 2. Create room type — POST /owner/listings/:id/room-types
      const resRoom = await fetch(`${API}/owner/listings/${listingId}/room-types`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: room.name.trim(),
          price: Number(room.price),
          size: room.size.trim(),
          facilities: room.facilities,
          availableCount: Number(room.availableCount),
        }),
      });

      const roomJson = await resRoom.json();
      if (!resRoom.ok) throw new Error(roomJson.message || "Gagal membuat tipe kamar");
      const roomId = roomJson.data?.id;

      // 3. Upload photos if any — POST /owner/room-types/:id/photos
      if (roomPhotos.length > 0) {
        const fd = new FormData();
        roomPhotos.forEach((f) => fd.append("photos", f));
        await fetch(`${API}/owner/room-types/${roomId}/photos`, {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
          body: fd,
        });
      }

      navigate("/owner/properti");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .clp-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        .clp-root h1, .clp-root h2, .clp-root h3 { font-family: 'Plus Jakarta Sans', sans-serif; }
        .clp-gradient { background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 30%, #2563eb 60%, #3b82f6 100%); }
        .clp-input {
          width: 100%; background: #f8faff; border: 1px solid #e2e8f4;
          border-radius: 10px; padding: 11px 14px; font-size: 14px; color: #1e293b;
          outline: none; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
        }
        .clp-input::placeholder { color: #94a3b8; }
        .clp-input:focus { border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .clp-input-error { border-color: #ef4444 !important; background: #fff5f5 !important; }
        .clp-toggle-off {
          border: 1px solid #e2e8f4; background: #f8faff; color: #475569;
          border-radius: 10px; transition: all 0.2s; cursor: pointer;
        }
        .clp-toggle-off:hover { border-color: #3b82f6; background: #eff6ff; }
        .clp-toggle-on {
          border: 1.5px solid #3b82f6; background: #eff6ff; color: #1d4ed8;
          border-radius: 10px; cursor: pointer;
        }
        .clp-btn-next {
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          box-shadow: 0 4px 16px rgba(37,99,235,0.3); transition: all 0.2s;
          color: white; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600;
        }
        .clp-btn-next:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.4); }
        .clp-btn-back {
          border: 1px solid #e2e8f4; background: white; color: #475569;
          transition: all 0.2s; font-family: 'DM Sans', sans-serif; font-weight: 500;
        }
        .clp-btn-back:hover { border-color: #3b82f6; color: #1d4ed8; background: #eff6ff; }
        .clp-step-fade { animation: clpFade 0.25s ease; }
        @keyframes clpFade {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .clp-err { color: #ef4444; font-size: 11px; margin-top: 4px; font-weight: 500; }
      `}</style>

      <div
        className="clp-root min-h-screen flex items-start justify-center py-10 px-4"
        style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 50%, #f0f4ff 100%)" }}
      >
        <div className="w-full max-w-2xl">

          <div className="mb-6">
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-1">Atap</p>
            <h1 className="text-2xl font-extrabold text-slate-800" style={{ fontFamily: "Plus Jakarta Sans" }}>
              Daftarkan Kost Baru
            </h1>
          </div>

          {/* Progress steps */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-4">
            <div className="flex items-center">
              {STEPS.map((s, i) => {
                const num = i + 1;
                const done = num < step;
                const active = num === step;
                return (
                  <div key={num} className="flex items-center flex-1 min-w-0">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 flex-shrink-0"
                        style={{
                          background: done ? "linear-gradient(135deg, #1d4ed8, #3b82f6)" : active ? "linear-gradient(135deg, #1e3a8a, #1d4ed8)" : "#f1f5f9",
                          color: done || active ? "white" : "#94a3b8",
                          boxShadow: active ? "0 0 0 4px rgba(59,130,246,0.15)" : "none",
                        }}
                      >
                        {done ? <Check size={14} /> : num}
                      </div>
                      <span className="text-[10px] mt-1 font-medium text-center leading-tight hidden sm:block" style={{ color: active ? "#1d4ed8" : done ? "#3b82f6" : "#94a3b8" }}>
                        {s.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="flex-1 h-0.5 mx-2 rounded transition-all duration-500" style={{ background: done ? "linear-gradient(90deg, #3b82f6, #60a5fa)" : "#e2e8f0" }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="clp-gradient px-8 py-5">
              <p className="text-blue-200 text-xs font-medium mb-0.5">{STEPS[step - 1].desc}</p>
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: "Plus Jakarta Sans" }}>{STEPS[step - 1].label}</h2>
            </div>

            <div className="px-8 py-7 clp-step-fade" key={step}>

              {/* STEP 1: Data Kos */}
              {step === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Kost</label>
                    <input className={`clp-input${errors.name ? " clp-input-error" : ""}`} placeholder="cth. Kost Melati Indah" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    {errors.name && <p className="clp-err">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tipe Kost</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[{ val: "PUTRA", label: "Putra" }, { val: "PUTRI", label: "Putri" }, { val: "CAMPUR", label: "Campur" }].map(({ val, label }) => (
                        <button key={val} type="button" onClick={() => setForm({ ...form, genderType: val })} className={form.genderType === val ? "clp-toggle-on" : "clp-toggle-off"} style={{ padding: "10px 0", fontSize: 14, fontWeight: 600, textAlign: "center" }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nomor Kontak</label>
                    <input className={`clp-input${errors.contactNumber ? " clp-input-error" : ""}`} placeholder="cth. 08123456789" value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} />
                    {errors.contactNumber && <p className="clp-err">{errors.contactNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Deskripsi</label>
                    <textarea className={`clp-input${errors.description ? " clp-input-error" : ""}`} style={{ resize: "none" }} rows={4} placeholder="Ceritakan tentang kost kamu, lingkungan sekitar, akses transportasi..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    {errors.description && <p className="clp-err">{errors.description}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Peraturan Kos</label>
                    <div className="grid grid-cols-2 gap-2">
                      {RULE_OPTIONS.map((rule) => {
                        const checked = form.rules.includes(rule);
                        return (
                          <button key={rule} type="button" onClick={() => setForm({ ...form, rules: toggleItem(form.rules, rule) })} className={checked ? "clp-toggle-on" : "clp-toggle-off"} style={{ padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, fontSize: 13, fontWeight: 500, textAlign: "left" }}>
                            <span>{rule}</span>
                            {checked && <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Check size={11} color="white" /></span>}
                          </button>
                        );
                      })}
                    </div>
                    {errors.rules && <p className="clp-err">{errors.rules}</p>}
                  </div>
                </div>
              )}

              {/* STEP 2: Lokasi */}
              {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Alamat Lengkap</label>
                    <textarea className={`clp-input${errors.address ? " clp-input-error" : ""}`} style={{ resize: "none" }} rows={3} placeholder="Jl. Contoh No. 12, Kel. ..., Kec. ..., Kota ..." value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                    {errors.address && <p className="clp-err">{errors.address}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tandai di Peta</label>
                    <p className="text-xs text-slate-400 mb-3">Klik pada peta untuk menentukan lokasi kost secara akurat.</p>
                    <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f4" }}>
                      <MapPicker setLatLng={setLatLng} />
                    </div>
                    {latLng ? (
                      <div className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                        <MapPin size={14} className="text-blue-500" />
                        <span className="text-xs font-medium text-blue-700">Lokasi dipilih: {Number(latLng.lat).toFixed(6)}, {Number(latLng.lng).toFixed(6)}</span>
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-slate-400 text-center">Belum ada lokasi dipilih</p>
                    )}
                    {errors.latLng && <p className="clp-err text-center">{errors.latLng}</p>}
                  </div>
                </div>
              )}

              {/* STEP 3: Fasilitas */}
              {step === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <p className="text-sm text-slate-500">Pilih semua fasilitas yang tersedia di dalam kamar.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {FACILITY_OPTIONS.map((f) => {
                      const checked = room.facilities.includes(f);
                      return (
                        <button key={f} type="button" onClick={() => setRoom({ ...room, facilities: toggleItem(room.facilities, f) })} className={checked ? "clp-toggle-on" : "clp-toggle-off"} style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14, fontWeight: 500 }}>
                          <span>{f}</span>
                          {checked && <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Check size={11} color="white" /></span>}
                        </button>
                      );
                    })}
                  </div>
                  {room.facilities.length > 0 && <p className="text-xs font-semibold text-blue-500">{room.facilities.length} fasilitas dipilih</p>}
                </div>
              )}

              {/* STEP 4: Ketersediaan */}
              {step === 4 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Jumlah Kamar Tersedia</label>
                    <p className="text-xs text-slate-400 mb-4">Berapa kamar yang bisa disewa saat ini?</p>
                    <div className="flex items-center gap-4">
                      <button type="button" onClick={() => setRoom({ ...room, availableCount: Math.max(0, Number(room.availableCount) - 1) })} style={{ width: 44, height: 44, borderRadius: 10, border: "1px solid #e2e8f4", background: "#f8faff", fontSize: 20, fontWeight: 700, color: "#475569", cursor: "pointer", flexShrink: 0 }}>−</button>
                      <input type="number" min="0" className="clp-input" style={{ textAlign: "center", fontSize: 28, fontWeight: 700, padding: "10px" }} value={room.availableCount} onChange={(e) => setRoom({ ...room, availableCount: e.target.value })} />
                      <button type="button" onClick={() => setRoom({ ...room, availableCount: Number(room.availableCount) + 1 })} style={{ width: 44, height: 44, borderRadius: 10, border: "1px solid #e2e8f4", background: "#f8faff", fontSize: 20, fontWeight: 700, color: "#475569", cursor: "pointer", flexShrink: 0 }}>+</button>
                    </div>
                    <p className="text-center text-xs text-slate-400 mt-2">kamar tersedia</p>
                  </div>
                </div>
              )}

              {/* STEP 5: Detail Kamar */}
              {step === 5 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Tipe Kamar</label>
                    <input className={`clp-input${errors.roomName ? " clp-input-error" : ""}`} placeholder="cth. Kamar Standar, Kamar Deluxe" value={room.name} onChange={(e) => setRoom({ ...room, name: e.target.value })} />
                    {errors.roomName && <p className="clp-err">{errors.roomName}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Ukuran Kamar</label>
                    <input className={`clp-input${errors.roomSize ? " clp-input-error" : ""}`} placeholder="cth. 3x4 m" value={room.size} onChange={(e) => setRoom({ ...room, size: e.target.value })} />
                    {errors.roomSize && <p className="clp-err">{errors.roomSize}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Harga per Bulan</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, fontWeight: 600, color: "#64748b", pointerEvents: "none" }}>Rp</span>
                      <input type="number" min="0" className={`clp-input${errors.roomPrice ? " clp-input-error" : ""}`} style={{ paddingLeft: 40 }} placeholder="800000" value={room.price} onChange={(e) => setRoom({ ...room, price: e.target.value })} />
                    </div>
                    {errors.roomPrice && <p className="clp-err">{errors.roomPrice}</p>}
                    {room.price && <p className="mt-1.5 text-xs font-semibold text-blue-500">Rp {Number(room.price).toLocaleString("id-ID")} / bulan</p>}
                  </div>
                </div>
              )}

              {/* STEP 6: Foto Kamar */}
              {step === 6 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <p className="text-sm text-slate-500">Upload foto kamar yang menarik untuk meningkatkan minat penyewa.</p>
                  <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", padding: roomPhotos.length > 0 ? "24px 0" : "48px 0", border: `2px dashed ${roomPhotos.length > 0 ? "#3b82f6" : "#cbd5e1"}`, borderRadius: 14, background: roomPhotos.length > 0 ? "#eff6ff" : "#f8faff", cursor: "pointer", transition: "all 0.2s" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: roomPhotos.length > 0 ? "#1d4ed8" : "#475569" }}>{roomPhotos.length > 0 ? `${roomPhotos.length} foto dipilih` : "Klik untuk upload foto"}</span>
                    <span style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>JPG, PNG — bisa pilih beberapa</span>
                    <input type="file" multiple accept="image/*" style={{ display: "none" }} onChange={(e) => setRoomPhotos([...e.target.files])} />
                  </label>
                  {roomPhotos.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preview</p>
                        <button type="button" onClick={() => setRoomPhotos([])} style={{ fontSize: 12, color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>Hapus semua</button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {roomPhotos.map((file, i) => (
                          <div key={i} style={{ aspectRatio: "1", borderRadius: 10, overflow: "hidden", border: "1px solid #e2e8f4" }}>
                            <img src={URL.createObjectURL(file)} alt={`preview-${i}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer navigasi */}
            <div className="flex justify-between items-center px-8 py-5" style={{ borderTop: "1px solid #f1f5f9", background: "#fafbff" }}>
              {step > 1 ? (
                <button type="button" onClick={() => setStep(step - 1)} className="clp-btn-back flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm">
                  <ChevronLeft size={16} /> Kembali
                </button>
              ) : <div />}

              {step < STEPS.length ? (
                <button type="button" onClick={handleNext} className="clp-btn-next flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm">
                  Lanjut <ChevronRight size={16} />
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} disabled={loading} className="clp-btn-next flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm" style={{ opacity: loading ? 0.7 : 1 }}>
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : <><Check size={16} /> Simpan Kost</>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}