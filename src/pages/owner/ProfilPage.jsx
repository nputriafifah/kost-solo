import { useState, useEffect } from "react";
import {
    ArrowLeft, User, Phone, Mail, MapPin, Building2,
    Edit3, Save, X, Camera, ChevronRight, LogOut,
    Shield, Bell, HelpCircle, FileText, Star,
    CheckCircle, Clock, AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const API = "http://localhost:8080";

const GRADIENTS = [
    "linear-gradient(135deg,#A78BFA,#7C3AED)",
    "linear-gradient(135deg,#8B5CF6,#7C3AED)",
    "linear-gradient(135deg,#10B981,#A78BFA)",
    "linear-gradient(135deg,#F59E0B,#F97316)",
    "linear-gradient(135deg,#EC4899,#FB7185)",
];
const avatarGradient = (id = "0") =>
    GRADIENTS[parseInt(id.slice(-4) || "0", 16) % GRADIENTS.length];

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value, verified }) {
    return (
        <div className="flex items-center gap-4 py-3.5 border-b border-slate-50 last:border-0">
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                <Icon size={15} className="text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-400 font-semibold mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-slate-800 truncate">{value || "—"}</p>
            </div>
            {verified !== undefined && (
                verified
                    ? <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex-shrink-0"><CheckCircle size={10} /> Terverifikasi</span>
                    : <span className="flex items-center gap-1 text-[10px] font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full flex-shrink-0"><Clock size={10} /> Belum verifikasi</span>
            )}
        </div>
    );
}

function MenuRow({ icon: Icon, label, sub, iconBg = "bg-indigo-50", iconColor = "text-indigo-500", danger, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-4 px-5 py-4 border-b border-slate-50 last:border-0 active:scale-[0.98] transition-transform text-left ${danger ? "hover:bg-red-50/50" : "hover:bg-slate-50/60"}`}
        >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${danger ? "bg-red-50" : iconBg}`}>
                <Icon size={16} className={danger ? "text-red-400" : iconColor} />
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${danger ? "text-red-500" : "text-slate-800"}`}>{label}</p>
                {sub && <p className="text-[11px] text-slate-400 truncate mt-0.5">{sub}</p>}
            </div>
            {!danger && <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />}
        </button>
    );
}

function EditModal({ field, value, onSave, onClose, loading }) {
    const [val, setVal] = useState(value || "");

    const labels = {
        name: { label: "Nama lengkap", type: "text", placeholder: "Nama kamu" },
        kostName: { label: "Nama kost", type: "text", placeholder: "Nama kost kamu" },
        location: { label: "Lokasi kost", type: "text", placeholder: "Alamat kost" },
        contact: { label: "Kontak bisnis", type: "text", placeholder: "No. HP / email bisnis" },
    };
    const cfg = labels[field] || { label: field, type: "text", placeholder: "" };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-black text-slate-800">Edit {cfg.label}</h3>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                        <X size={15} className="text-slate-500" />
                    </button>
                </div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">{cfg.label}</label>
                <input
                    type={cfg.type}
                    value={val}
                    onChange={(e) => setVal(e.target.value)}
                    placeholder={cfg.placeholder}
                    autoFocus
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                />
                <div className="flex gap-3 mt-5">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-black text-slate-500 active:scale-95 transition-transform"
                    >
                        Batal
                    </button>
                    <button
                        onClick={() => onSave(val)}
                        disabled={loading || !val.trim()}
                        className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-black active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <><Save size={14} /> Simpan</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function ProfilPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [editField, setEditField] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const token = localStorage.getItem("token");
    const initials = user.name
        ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
        : "U";

    // ── FETCH DATA DARI BACKEND ───────────────────────────────────────────────
    useEffect(() => {
        if (!token) { navigate("/auth"); return; }

        const fetchData = async () => {
            try {
                const res = await fetch(`${API}/owner/dashboard`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.status === 401 || res.status === 403) {
                    handleLogout();
                    return;
                }

                if (res.ok) {
                    const data = await res.json();
                    // Sesuaikan dengan key response Hono kamu
                    const profileData = data.ownerProfile || data;
                    setProfile(profileData);
                    localStorage.setItem("ownerProfile", JSON.stringify(profileData));
                } else {
                    setError("Gagal mengambil data profil.");
                }
            } catch (err) {
                console.error(err);
                setError("Koneksi ke server bermasalah.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token, navigate]);

    const showToast = (msg, ok = true) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 2500);
    };

    // ── UPDATE DATA KE BACKEND ────────────────────────────────────────────────
    const handleSave = async (val) => {
        setEditLoading(true);
        try {
            // Note: Pastikan di Hono sudah ada route PUT /owner/profile
            const res = await fetch(`${API}/owner/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ [editField]: val })
            });

            if (!res.ok) throw new Error("Gagal menyimpan ke server");

            // Update UI secara lokal setelah sukses di server
            if (editField === "name") {
                const newUser = { ...user, name: val };
                setUser(newUser);
                localStorage.setItem("user", JSON.stringify(newUser));
            } else {
                const newProfile = { ...profile, [editField]: val };
                setProfile(newProfile);
                localStorage.setItem("ownerProfile", JSON.stringify(newProfile));
            }

            showToast("Profil berhasil diperbarui");
            setEditField(null);
        } catch (err) {
            showToast(err.message || "Gagal menyimpan perubahan", false);
        } finally {
            setEditLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/auth");
    };

    const editValue = () => {
        if (editField === "name") return user.name;
        return profile?.[editField] ?? "";
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-10" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-xl text-sm font-bold transition-all ${toast.ok ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
                    {toast.ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                    {toast.msg}
                </div>
            )}

            {/* Modal */}
            {editField && (
                <EditModal
                    field={editField}
                    value={editValue()}
                    onSave={handleSave}
                    onClose={() => setEditField(null)}
                    loading={editLoading}
                />
            )}

            {/* Header */}
            <div className="bg-white border-b border-slate-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
                <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <ArrowLeft size={16} className="text-slate-600" />
                </button>
                <div>
                    <h1 className="text-base font-black text-slate-900">Profil Saya</h1>
                    <p className="text-[11px] text-slate-400">Kelola informasi akun kamu</p>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 pt-6 space-y-5">
                {/* Avatar Section */}
                <div className="bg-white rounded-3xl p-6 flex flex-col items-center text-center shadow-sm border border-slate-100">
                    <div className="relative mb-4">
                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg"
                            style={{ background: avatarGradient(user.id || "0") }}>
                            {initials}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md border-2 border-white">
                            <Camera size={12} className="text-white" />
                        </div>
                    </div>
                    <h2 className="text-lg font-black text-slate-900">{user.name || "—"}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{user.phone || user.email || "—"}</p>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
                        <Building2 size={10} /> Pemilik Kos
                    </span>
                </div>

                {/* Account Info */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                        <p className="text-sm font-black text-slate-700">Informasi Akun</p>
                        <button onClick={() => setEditField("name")} className="flex items-center gap-1 text-xs font-black text-indigo-600">
                            <Edit3 size={12} /> Edit
                        </button>
                    </div>
                    <div className="px-5">
                        <InfoRow icon={User} label="Nama lengkap" value={user.name} />
                        <InfoRow icon={Phone} label="Nomor HP" value={user.phone} verified={true} />
                        <InfoRow icon={Mail} label="Email" value={user.email} verified={user.isEmailVerified} />
                    </div>
                </div>

                {/* Kost Profile Info */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                        <p className="text-sm font-black text-slate-700">Profil Kost</p>
                    </div>

                    {loading ? (
                        <div className="px-5 py-4 space-y-3">
                            {[1, 2, 3].map(i => <div key={i} className="h-10 bg-slate-100 animate-pulse rounded-xl" />)}
                        </div>
                    ) : error ? (
                        <div className="px-5 py-4 text-sm text-red-400 font-semibold">{error}</div>
                    ) : (
                        <div className="px-5">
                            {[
                                { field: "kostName", icon: Building2, label: "Nama kost", value: profile?.kostName },
                                { field: "location", icon: MapPin, label: "Lokasi", value: profile?.location },
                                { field: "contact", icon: Phone, label: "Kontak bisnis", value: profile?.contact },
                            ].map(({ field, icon, label, value }) => (
                                <div key={field} className="flex items-center gap-4 py-3.5 border-b border-slate-50 last:border-0">
                                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                                        {(() => { const Icon = icon; return <Icon size={15} className="text-slate-400" />; })()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] text-slate-400 font-semibold mb-0.5">{label}</p>
                                        <p className="text-sm font-semibold text-slate-800 truncate">{value || <span className="text-slate-300 italic">Belum diisi</span>}</p>
                                    </div>
                                    <button onClick={() => setEditField(field)} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-indigo-50">
                                        <Edit3 size={12} className="text-slate-400 hover:text-indigo-500" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Other Menus */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <MenuRow icon={Building2} label="Properti Saya" sub="Kelola listing kost" onClick={() => navigate("/owner/properti")} />
                    <MenuRow icon={Star} label="Ulasan" sub="Lihat rating dari penyewa" iconBg="bg-amber-50" iconColor="text-amber-500" />
                    <MenuRow icon={LogOut} label="Keluar dari Akun" danger onClick={handleLogout} />
                </div>

                <p className="text-center text-[11px] text-slate-300 font-semibold pb-2">KostSolo · v1.0.0</p>
            </div>
        </div>
    );
}