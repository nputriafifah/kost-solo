import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Save, Loader2, Camera, X, Check, BedDouble, Wifi,
} from "lucide-react";

const API = "http://localhost:3000";
const getToken = () => localStorage.getItem("token") || "";

const STEPS = [
  { label: "Data Kos",   desc: "Perbarui info dasar kost" },
  { label: "Foto Kamar", desc: "Kelola foto tiap tipe kamar" },
];

const STYLES = `
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
  .clp-btn-next {
    background: linear-gradient(135deg, #1d4ed8, #3b82f6);
    box-shadow: 0 4px 16px rgba(37,99,235,0.3); transition: all 0.2s;
    color: white; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600;
    border: none; cursor: pointer;
  }
  .clp-btn-next:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.4); }
  .clp-btn-next:disabled { opacity: 0.6; cursor: not-allowed; }
  .clp-btn-back {
    border: 1px solid #e2e8f4; background: white; color: #475569;
    transition: all 0.2s; font-family: 'DM Sans', sans-serif; font-weight: 500; cursor: pointer;
  }
  .clp-btn-back:hover { border-color: #3b82f6; color: #1d4ed8; background: #eff6ff; }
  .clp-err { color: #ef4444; font-size: 11px; margin-top: 4px; font-weight: 500; }
  .clp-photo-thumb {
    position: relative; aspect-ratio: 1; border-radius: 10px; overflow: hidden;
    border: 1px solid #e2e8f4;
  }
  .clp-photo-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s; }
  .clp-photo-thumb:hover img { transform: scale(1.04); }
  .clp-photo-del {
    position: absolute; top: 5px; right: 5px;
    width: 22px; height: 22px; border-radius: 50%;
    background: rgba(239,68,68,0.88); border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.2s;
  }
  .clp-photo-thumb:hover .clp-photo-del { opacity: 1; }
  .clp-photo-new .clp-photo-del { opacity: 1; }
  .clp-upload-zone {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    border: 2px dashed #cbd5e1; border-radius: 12px; padding: 18px;
    background: #f8faff; cursor: pointer; transition: all 0.2s;
  }
  .clp-upload-zone:hover { border-color: #3b82f6; background: #eff6ff; }
  .clp-room-card { background: white; border: 1px solid #e8edf6; border-radius: 18px; overflow: hidden; }
  .clp-step-fade { animation: clpFade 0.25s ease; }
  @keyframes clpFade { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
`;

export default function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: "", address: "", description: "", contactNumber: "",
  });

  const [roomTypes, setRoomTypes] = useState([]);

  // photoState: { [roomTypeId]: { newFiles: [], deletedIds: [], uploading: false } }
  const [photoState, setPhotoState] = useState({});

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`${API}/listings/owner/${id}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const text = await res.text();
        let json;
        try { json = JSON.parse(text); } catch { json = { message: text }; }
        if (!res.ok) throw new Error(json.message || "Gagal memuat data");

        const d = json.data || json;
        setForm({
          name: d.name || "",
          address: d.address || "",
          description: d.description || "",
          contactNumber: d.contactNumber || "",
        });
        setRoomTypes(d.roomTypes || []);

        const init = {};
        (d.roomTypes || []).forEach((rt) => {
          init[rt.id] = { newFiles: [], deletedIds: [], uploading: false };
        });
        setPhotoState(init);
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [id]);

  // ---- Validasi step 1 ----
  const validate = () => {
    const e = {};
    if (form.name.trim().length < 3)          e.name = "Nama minimal 3 karakter";
    if (form.address.trim().length < 10)      e.address = "Alamat minimal 10 karakter";
    if (form.description.trim().length < 10)  e.description = "Deskripsi minimal 10 karakter";
    if (form.contactNumber.trim().length < 8) e.contactNumber = "Nomor kontak minimal 8 digit";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ---- Submit data kost ----
  const handleSaveInfo = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
  const res = await fetch(`${API}/owner/listings/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(form),
  });

  const text = await res.text();

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { message: text };
  }

  if (!res.ok) {
    throw new Error(json.message || "Gagal update");
  }

  setStep(2);
} catch (err) {
  alert(err.message);
} finally {
  setSaving(false);
}
  };

  // ---- Photo helpers ----
  const markDelete = (roomTypeId, photoId) => {
    setPhotoState((prev) => ({
      ...prev,
      [roomTypeId]: { ...prev[roomTypeId], deletedIds: [...prev[roomTypeId].deletedIds, photoId] },
    }));
  };

  const addFiles = (roomTypeId, files) => {
    setPhotoState((prev) => ({
      ...prev,
      [roomTypeId]: { ...prev[roomTypeId], newFiles: [...prev[roomTypeId].newFiles, ...Array.from(files)] },
    }));
  };

  const removeNewFile = (roomTypeId, idx) => {
    setPhotoState((prev) => {
      const files = [...prev[roomTypeId].newFiles];
      files.splice(idx, 1);
      return { ...prev, [roomTypeId]: { ...prev[roomTypeId], newFiles: files } };
    });
  };

  const hasPhotoChanges = (roomTypeId) => {
    const s = photoState[roomTypeId];
    return s && (s.deletedIds.length > 0 || s.newFiles.length > 0);
  };

  const savePhotos = async (roomTypeId) => {
    const s = photoState[roomTypeId];
    setPhotoState((prev) => ({ ...prev, [roomTypeId]: { ...prev[roomTypeId], uploading: true } }));
    try {
      for (const photoId of s.deletedIds) {
        const deleteRes = await fetch(
  `${API}/owner/room-types/${roomTypeId}/photos/${photoId}`,
  {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  }
);

if (!deleteRes.ok) {
  const text = await deleteRes.text();
  throw new Error(text || "Gagal hapus foto");
}
      }
      if (s.newFiles.length > 0) {
        const fd = new FormData();
        s.newFiles.forEach((f) => fd.append("photos", f));
        const uploadRes = await fetch(
  `${API}/owner/room-types/${roomTypeId}/photos`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: fd,
  }
);

if (!uploadRes.ok) {
  const text = await uploadRes.text();
  throw new Error(text || "Gagal upload foto");
}
      }
      // Refresh room types
      const res = await fetch(`${API}/listings/owner/${id}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const text = await res.text();

let json;
try {
  json = JSON.parse(text);
} catch {
  json = { message: text };
}

const d = json.data || json;
      setRoomTypes(d.roomTypes || []);
      setPhotoState((prev) => ({
        ...prev,
        [roomTypeId]: { newFiles: [], deletedIds: [], uploading: false },
      }));
      alert("Foto berhasil diperbarui!");
    } catch (err) {
      alert(err.message);
      setPhotoState((prev) => ({ ...prev, [roomTypeId]: { ...prev[roomTypeId], uploading: false } }));
    }
  };

  const handleFinish = () => navigate(`/owner/detail/${id}`);

  return (
    <>
      <style>{STYLES}</style>
      <div
        className="clp-root min-h-screen flex items-start justify-center py-10 px-4"
        style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 50%, #f0f4ff 100%)" }}
      >
        <div className="w-full max-w-2xl">

          {/* Breadcrumb */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-1">Atap</p>
            <h1 className="text-2xl font-extrabold text-slate-800" style={{ fontFamily: "Plus Jakarta Sans" }}>Edit Kost</h1>
          </div>

          {/* Step indicator — mirip CreateListingPage */}
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
                          background: done ? "linear-gradient(135deg,#1d4ed8,#3b82f6)" : active ? "linear-gradient(135deg,#1e3a8a,#1d4ed8)" : "#f1f5f9",
                          color: done || active ? "white" : "#94a3b8",
                          boxShadow: active ? "0 0 0 4px rgba(59,130,246,0.15)" : "none",
                        }}
                      >
                        {done ? <Check size={14} /> : num}
                      </div>
                      <span className="text-[10px] mt-1 font-medium text-center leading-tight hidden sm:block"
                        style={{ color: active ? "#1d4ed8" : done ? "#3b82f6" : "#94a3b8" }}>
                        {s.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="flex-1 h-0.5 mx-2 rounded transition-all duration-500"
                        style={{ background: done ? "linear-gradient(90deg,#3b82f6,#60a5fa)" : "#e2e8f0" }} />
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

              {/* ===== STEP 1: Data Kos ===== */}
              {step === 1 && (
                loading ? (
                  <p style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", padding: "24px 0" }}>Memuat data...</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Kost</label>
                      <input className={`clp-input${errors.name ? " clp-input-error" : ""}`} placeholder="cth. Kost Melati Indah"
                        value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                      {errors.name && <p className="clp-err">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Alamat Lengkap</label>
                      <textarea className={`clp-input${errors.address ? " clp-input-error" : ""}`} style={{ resize: "none" }} rows={3}
                        placeholder="Jl. Contoh No. 12, Kel. ..., Kec. ..., Kota ..."
                        value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                      {errors.address && <p className="clp-err">{errors.address}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Deskripsi</label>
                      <textarea className={`clp-input${errors.description ? " clp-input-error" : ""}`} style={{ resize: "none" }} rows={4}
                        placeholder="Ceritakan tentang kost kamu..."
                        value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                      {errors.description && <p className="clp-err">{errors.description}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nomor Kontak</label>
                      <input className={`clp-input${errors.contactNumber ? " clp-input-error" : ""}`} placeholder="cth. 08123456789"
                        value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} />
                      {errors.contactNumber && <p className="clp-err">{errors.contactNumber}</p>}
                    </div>
                  </div>
                )
              )}

              {/* ===== STEP 2: Foto Kamar ===== */}
              {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <p className="text-sm text-slate-500">Kelola foto untuk setiap tipe kamar. Hover foto untuk menghapus, atau tambah foto baru.</p>

                  {roomTypes.length === 0 && (
                    <p style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", padding: "24px 0" }}>Belum ada tipe kamar</p>
                  )}

                  {roomTypes.map((room) => {
                    const ps = photoState[room.id] || { newFiles: [], deletedIds: [], uploading: false };
                    const visiblePhotos = (room.photos || []).filter((p) => !ps.deletedIds.includes(p.id));

                    return (
                      <div key={room.id} className="clp-room-card">
                        {/* Room header */}
                        <div className="clp-gradient" style={{ padding: "12px 18px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <BedDouble size={15} style={{ color: "#bfdbfe" }} />
                              <span style={{ color: "white", fontWeight: 700, fontSize: 14, fontFamily: "Plus Jakarta Sans" }}>{room.name}</span>
                            </div>
                            {room.facilities?.length > 0 && (
                              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "flex-end" }}>
                                {room.facilities.slice(0, 3).map((f, i) => (
                                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "rgba(255,255,255,0.15)", color: "white", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
                                    <Wifi size={9} /> {f}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Photo grid */}
                        <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                            {/* Existing photos */}
                            {visiblePhotos.map((p) => (
                              <div key={p.id} className="clp-photo-thumb">
                                <img src={p.url} alt="foto" />
                                <button className="clp-photo-del" onClick={() => markDelete(room.id, p.id)}>
                                  <X size={12} color="white" />
                                </button>
                              </div>
                            ))}

                            {/* New file previews */}
                            {ps.newFiles.map((file, idx) => (
                              <div key={`new-${idx}`} className="clp-photo-thumb clp-photo-new">
                                <img src={URL.createObjectURL(file)} alt={`baru-${idx}`} />
                                <button className="clp-photo-del" style={{ opacity: 1 }} onClick={() => removeNewFile(room.id, idx)}>
                                  <X size={12} color="white" />
                                </button>
                                {/* "Baru" badge */}
                                <span style={{ position: "absolute", bottom: 5, left: 5, background: "#3b82f6", color: "white", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>BARU</span>
                              </div>
                            ))}
                          </div>

                          {/* Upload zone */}
                          <label className="clp-upload-zone">
                            <Camera size={18} style={{ color: "#94a3b8", marginBottom: 5 }} />
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>Tambah foto</span>
                            <span style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>JPG, PNG — bisa pilih beberapa</span>
                            <input type="file" multiple accept="image/*" style={{ display: "none" }}
                              onChange={(e) => {
  if (e.target.files?.length) {
    addFiles(room.id, e.target.files);
  }
}} />
                          </label>

                          {/* Save button — muncul jika ada perubahan */}
                          {hasPhotoChanges(room.id) && (
                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                              <button
                                onClick={() => savePhotos(room.id)}
                                disabled={ps.uploading}
                                className="clp-btn-next flex items-center gap-2 px-5 py-2 rounded-xl text-sm"
                                style={{ opacity: ps.uploading ? 0.7 : 1 }}
                              >
                                {ps.uploading
                                  ? <><Loader2 size={14} className="animate-spin" /> Menyimpan...</>
                                  : <><Check size={14} /> Simpan Foto</>}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer navigasi — sama persis dengan CreateListingPage */}
            <div className="flex justify-between items-center px-8 py-5" style={{ borderTop: "1px solid #f1f5f9", background: "#fafbff" }}>
              {step > 1 ? (
                <button type="button" onClick={() => setStep(step - 1)} className="clp-btn-back flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm">
                  <ArrowLeft size={16} /> Kembali
                </button>
              ) : (
                <button type="button" onClick={() => navigate(-1)} className="clp-btn-back flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm">
                  <ArrowLeft size={16} /> Batal
                </button>
              )}

              {step === 1 ? (
                <button type="button" onClick={handleSaveInfo} disabled={saving || loading}
                  className="clp-btn-next flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm"
                  style={{ opacity: saving || loading ? 0.7 : 1 }}>
                  {saving
                    ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</>
                    : <><Save size={16} /> Simpan & Lanjut</>}
                </button>
              ) : (
                <button type="button" onClick={handleFinish}
                  className="clp-btn-next flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm">
                  <Check size={16} /> Selesai
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}