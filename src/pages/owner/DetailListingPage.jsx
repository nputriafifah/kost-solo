import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Edit3, Trash2, BedDouble,
  Phone, ShieldCheck, Wifi, Camera,
} from "lucide-react";

const API = "http://localhost:3000";
const getToken = () => localStorage.getItem("token") || "";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
  .clp-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
  .clp-root h1, .clp-root h2, .clp-root h3 { font-family: 'Plus Jakarta Sans', sans-serif; }
  .clp-gradient { background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 30%, #2563eb 60%, #3b82f6 100%); }
  .clp-btn-back {
    border: 1px solid #e2e8f4; background: white; color: #475569;
    transition: all 0.2s; font-family: 'DM Sans', sans-serif; font-weight: 500;
    display: flex; align-items: center; gap: 8px;
    padding: 9px 18px; border-radius: 12px; font-size: 14px; cursor: pointer;
  }
  .clp-btn-back:hover { border-color: #3b82f6; color: #1d4ed8; background: #eff6ff; }
  .clp-btn-edit {
    background: linear-gradient(135deg, #1d4ed8, #3b82f6);
    box-shadow: 0 4px 16px rgba(37,99,235,0.3);
    color: white; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600;
    display: flex; align-items: center; gap: 8px;
    padding: 9px 18px; border-radius: 12px; font-size: 14px; cursor: pointer;
    border: none; transition: all 0.2s;
  }
  .clp-btn-edit:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.4); }
  .clp-btn-delete {
    background: white; border: 1px solid #fecaca; color: #ef4444;
    font-family: 'DM Sans', sans-serif; font-weight: 600;
    display: flex; align-items: center; gap: 8px;
    padding: 9px 18px; border-radius: 12px; font-size: 14px; cursor: pointer;
    transition: all 0.2s;
  }
  .clp-btn-delete:hover { background: #fff5f5; border-color: #ef4444; }
  .clp-tag {
    padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 500;
    background: #f1f5f9; color: #475569;
  }
  .clp-room-card {
    background: white; border: 1px solid #e8edf6; border-radius: 18px;
    overflow: hidden; transition: box-shadow 0.2s;
  }
  .clp-room-card:hover { box-shadow: 0 6px 24px rgba(37,99,235,0.10); }
  .clp-fade { animation: clpFade 0.3s ease; }
  @keyframes clpFade { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
`;

export default function DetailListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    try {
      const res = await fetch(`${API}/listings/owner/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const text = await res.text();
      let json;
      try { json = JSON.parse(text); } catch { json = { message: text }; }
      if (!res.ok) throw new Error(json.message || "Data tidak ditemukan");
      setData(json.data || json);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetail(); }, [id]);

  const handleDelete = async () => {
    if (!confirm("Yakin hapus kost ini?")) return;
    try {
      const res = await fetch(`${API}/listings/owner/${id}/deactivate`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const text = await res.text();
      let json;
      try { json = JSON.parse(text); } catch { json = { message: text }; }
      if (!res.ok) throw new Error(json.message || "Gagal menghapus");
      alert("Berhasil dihapus");
      navigate("/owner/dashboard");
    } catch (err) { alert(err.message); }
  };

  const genderLabel = { PUTRA: "Putra", PUTRI: "Putri", CAMPUR: "Campur" };

  if (loading) return (
    <>
      <style>{STYLES}</style>
      <div className="clp-root min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 50%, #f0f4ff 100%)" }}>
        <p style={{ color: "#64748b" }}>Memuat data...</p>
      </div>
    </>
  );

  if (!data) return (
    <>
      <style>{STYLES}</style>
      <div className="clp-root min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 50%, #f0f4ff 100%)" }}>
        <p style={{ color: "#64748b" }}>Data tidak ditemukan.</p>
      </div>
    </>
  );

  return (
    <>
      <style>{STYLES}</style>
      <div
        className="clp-root min-h-screen py-10 px-4"
        style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 50%, #f0f4ff 100%)" }}
      >
        <div className="w-full max-w-2xl mx-auto clp-fade" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Breadcrumb */}
          <div>
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-1">Atap</p>
            <h1 className="text-2xl font-extrabold text-slate-800" style={{ fontFamily: "Plus Jakarta Sans" }}>Detail Kost</h1>
          </div>

          {/* Action Bar */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "white", borderRadius: 18, border: "1px solid #e8edf6",
            padding: "14px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
          }}>
            <button className="clp-btn-back" onClick={() => navigate("/owner/dashboard")}>
              <ArrowLeft size={16} /> Kembali
            </button>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="clp-btn-edit" onClick={() => navigate(`/owner/edit/${id}`)}>
                <Edit3 size={15} /> Edit
              </button>
              <button className="clp-btn-delete" onClick={handleDelete}>
                <Trash2 size={15} /> Hapus
              </button>
            </div>
          </div>

          {/* Main Info Card */}
          <div style={{ background: "white", borderRadius: 20, border: "1px solid #e8edf6", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div className="clp-gradient" style={{ padding: "24px 32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <p style={{ color: "#bfdbfe", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Nama Kost</p>
                  <h2 style={{ color: "white", fontSize: 22, fontWeight: 800, fontFamily: "Plus Jakarta Sans", margin: 0 }}>{data.name}</h2>
                </div>
                <span style={{
                  display: "inline-flex", alignItems: "center",
                  padding: "5px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700,
                  background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.25)"
                }}>
                  {genderLabel[data.genderType] || data.genderType}
                </span>
              </div>
            </div>

            <div style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Alamat */}
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "#f8faff", borderRadius: 12, padding: "14px 16px", border: "1px solid #e2e8f4" }}>
                <MapPin size={16} style={{ color: "#3b82f6", marginTop: 2, flexShrink: 0 }} />
                <p style={{ fontSize: 14, color: "#334155", margin: 0 }}>{data.address}</p>
              </div>

              {/* Kontak */}
              <div style={{ display: "flex", gap: 10, alignItems: "center", background: "#f0fdf4", borderRadius: 12, padding: "12px 16px", border: "1px solid #bbf7d0" }}>
                <Phone size={15} style={{ color: "#16a34a", flexShrink: 0 }} />
                <p style={{ fontSize: 14, color: "#166534", fontWeight: 600, margin: 0 }}>{data.contactNumber}</p>
              </div>

              {/* Deskripsi */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Deskripsi</p>
                <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.65, margin: 0 }}>{data.description}</p>
              </div>

              {/* Rules */}
              {data.rules?.length > 0 && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                    <ShieldCheck size={15} style={{ color: "#3b82f6" }} />
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Peraturan</p>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {data.rules.map((r, i) => <span key={i} className="clp-tag">{r}</span>)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Room Types */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Tipe Kamar</p>
            {data.roomTypes?.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {data.roomTypes.map((room) => (
                  <div key={room.id} className="clp-room-card">
                    <div className="clp-gradient" style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <BedDouble size={16} style={{ color: "#bfdbfe" }} />
                          <span style={{ color: "white", fontWeight: 700, fontSize: 15, fontFamily: "Plus Jakarta Sans" }}>{room.name}</span>
                        </div>
                        <span style={{ color: "white", fontWeight: 800, fontSize: 16, fontFamily: "Plus Jakarta Sans" }}>
                          Rp {room.price?.toLocaleString("id-ID")}
                          <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.8 }}>/bln</span>
                        </span>
                      </div>
                    </div>

                    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "flex", gap: 32 }}>
                        <div>
                          <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 2px" }}>Ukuran</p>
                          <p style={{ fontSize: 14, color: "#334155", fontWeight: 600, margin: 0 }}>{room.size}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 2px" }}>Tersedia</p>
                          <p style={{ fontSize: 14, color: "#334155", fontWeight: 600, margin: 0 }}>{room.availableCount} kamar</p>
                        </div>
                      </div>

                      {room.facilities?.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {room.facilities.map((f, i) => (
                            <span key={i} style={{
                              display: "inline-flex", alignItems: "center", gap: 4,
                              background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8",
                              borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 600
                            }}>
                              <Wifi size={10} /> {f}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Foto kamar */}
                      {room.photos?.length > 0 && (
                        <>
                          <div style={{ height: 1, background: "#f1f5f9" }} />
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                              <Camera size={13} style={{ color: "#3b82f6" }} />
                              <p style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Foto</p>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                              {room.photos.map((p, i) => (
                                <div key={i} style={{ aspectRatio: "1", borderRadius: 10, overflow: "hidden", border: "1px solid #e2e8f4" }}>
                                  <img src={p.url} alt={`foto-${i}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", padding: "24px 0" }}>Belum ada tipe kamar</p>
            )}
          </div>

        </div>
      </div>
    </>
  );
}