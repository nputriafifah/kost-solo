import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, MapPin, User, Plus, Trash2, CheckCircle, ChevronRight } from "lucide-react";

const DUMMY_LISTINGS = [
  { id: "1", name: "Kost Melati Indah", address: "Jl. Mawar No. 12, Surakarta" },
  { id: "2", name: "Kost Putra Mandiri", address: "Jl. Kenanga No. 5, Surakarta" },
  { id: "3", name: "Kost Bunda Asri",    address: "Jl. Dahlia No. 8, Surakarta"  },
];

const TIME_SLOTS = ["08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00"];

const STATUS_MAP = {
  confirmed: { label: "Dikonfirmasi", bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-400" },
  pending:   { label: "Menunggu",     bg: "bg-amber-50",   text: "text-amber-600",   dot: "bg-amber-400"   },
  done:      { label: "Selesai",      bg: "bg-slate-100",  text: "text-slate-400",   dot: "bg-slate-300"   },
};

const DUMMY_SCHEDULES = [
  { id: "s1", name: "Budi Santoso",   kost: "Kost Melati Indah",  date: "2025-07-20", time: "10:00", status: "confirmed" },
  { id: "s2", name: "Siti Rahayu",    kost: "Kost Putra Mandiri", date: "2025-07-21", time: "14:00", status: "pending"   },
  { id: "s3", name: "Ahmad Fauzi",    kost: "Kost Bunda Asri",    date: "2025-07-15", time: "09:00", status: "done"      },
];

export default function SurveyPage() {
  const navigate = useNavigate();
  const [tab, setTab]           = useState("jadwal"); // jadwal | tambah
  const [schedules, setSchedules] = useState(DUMMY_SCHEDULES);
  const [form, setForm]         = useState({ listingId: "", date: "", time: "", name: "", phone: "" });
  const [saved, setSaved]       = useState(false);

  const handleAdd = () => {
    if (!form.listingId || !form.date || !form.time || !form.name) return;
    const listing = DUMMY_LISTINGS.find(l => l.id === form.listingId);
    setSchedules(prev => [{
      id:     Date.now().toString(),
      name:   form.name,
      kost:   listing?.name || "-",
      date:   form.date,
      time:   form.time,
      status: "pending",
    }, ...prev]);
    setForm({ listingId: "", date: "", time: "", name: "", phone: "" });
    setSaved(true);
    setTimeout(() => { setSaved(false); setTab("jadwal"); }, 1500);
  };

  const handleDelete = (id) => setSchedules(prev => prev.filter(s => s.id !== id));

  const formatDate = (d) => new Date(d).toLocaleDateString("id-ID", { weekday:"short", day:"2-digit", month:"short", year:"numeric" });

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Outfit','Inter',sans-serif" }}>
      {/* Header */}
      <div className="relative rounded-b-3xl px-5 pt-12 pb-6 overflow-hidden"
        style={{ background: "linear-gradient(135deg,#1E1B4B 0%,#3730A3 45%,#4F46E5 100%)" }}>
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-indigo-600/30" />
        <div className="relative z-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-indigo-200 text-sm font-semibold mb-4">
            <ArrowLeft size={16} /> Kembali
          </button>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Calendar size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-black text-xl">Jadwal Survey</h1>
              <p className="text-indigo-200 text-xs">{schedules.length} jadwal terdaftar</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab */}
      <div className="px-5 mt-5">
        <div className="flex bg-white rounded-2xl border border-slate-100 p-1 shadow-sm">
          {[{ id:"jadwal", label:"Daftar Jadwal" }, { id:"tambah", label:"+ Tambah Baru" }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all ${tab === t.id ? "bg-indigo-600 text-white shadow" : "text-slate-400"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-5 pb-24 space-y-3">
        {/* ── Tab Jadwal ── */}
        {tab === "jadwal" && (
          schedules.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
              <Calendar size={28} className="text-slate-200 mx-auto mb-2" />
              <p className="text-sm font-black text-slate-500">Belum ada jadwal survey</p>
              <button onClick={() => setTab("tambah")}
                className="mt-3 bg-indigo-600 text-white text-xs font-black px-4 py-2 rounded-xl">
                Tambah Jadwal
              </button>
            </div>
          ) : schedules.map(s => {
            const st = STATUS_MAP[s.status];
            return (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{s.name}</p>
                      <p className="text-[11px] text-indigo-600 font-bold">{s.kost}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${st.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                    <span className={`text-[9px] font-black ${st.text}`}>{st.label}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Calendar size={12} />
                    <span className="text-xs font-semibold">{formatDate(s.date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock size={12} />
                    <span className="text-xs font-semibold">{s.time} WIB</span>
                  </div>
                  <button onClick={() => handleDelete(s.id)} className="ml-auto text-red-400 active:scale-90 transition-transform">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* ── Tab Tambah ── */}
        {tab === "tambah" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            {saved && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                <CheckCircle size={16} className="text-emerald-500" />
                <span className="text-sm font-black text-emerald-600">Jadwal berhasil ditambahkan!</span>
              </div>
            )}

            {/* Nama calon penyewa */}
            <div>
              <label className="text-xs font-black text-slate-500 mb-1.5 block">Nama Calon Penyewa</label>
              <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
                placeholder="Contoh: Budi Santoso"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all" />
            </div>

            {/* Nomor HP */}
            <div>
              <label className="text-xs font-black text-slate-500 mb-1.5 block">Nomor HP (opsional)</label>
              <input value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))}
                placeholder="08xx-xxxx-xxxx" type="tel"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all" />
            </div>

            {/* Pilih properti */}
            <div>
              <label className="text-xs font-black text-slate-500 mb-1.5 block">Properti</label>
              <select value={form.listingId} onChange={e => setForm(p => ({...p, listingId: e.target.value}))}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 bg-white transition-all">
                <option value="">Pilih properti...</option>
                {DUMMY_LISTINGS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>

            {/* Tanggal */}
            <div>
              <label className="text-xs font-black text-slate-500 mb-1.5 block">Tanggal Survey</label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({...p, date: e.target.value}))}
                min={new Date().toISOString().split("T")[0]}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all" />
            </div>

            {/* Jam */}
            <div>
              <label className="text-xs font-black text-slate-500 mb-1.5 block">Jam Survey</label>
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.map(t => (
                  <button key={t} onClick={() => setForm(p => ({...p, time: t}))}
                    className={`py-2.5 rounded-xl text-xs font-black border transition-all ${form.time === t ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-500 hover:border-indigo-300"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleAdd}
              disabled={!form.listingId || !form.date || !form.time || !form.name}
              className="w-full bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black py-3.5 rounded-xl text-sm shadow-lg shadow-indigo-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              <Plus size={16} /> Tambah Jadwal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}