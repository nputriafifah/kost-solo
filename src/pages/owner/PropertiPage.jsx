import { useEffect, useState } from "react";
import {
  Building2, Crown, AlertCircle, Edit3, Eye, PowerOff, Power,
  MapPin, Search, ChevronLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/owner/Sidebar";
import { getApiBase, resolveMediaUrl } from "../../config/apiBase";
import { GENDER_LABELS } from "../../constants/listing";
import {
  addReactivationRequest,
  getReactivationRequests,
  hasReactivationRequest,
} from "../../utils/reactivationRequests";

const listingId = (item) => item?.id ?? item?._id;

const STATUS_CONFIG = {
  PENDING:  { label: "Menunggu Review", bg: "bg-amber-50",   text: "text-amber-600",   dot: "bg-amber-400"  },
  ACTIVE:   { label: "Aktif",           bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-400" },
  INACTIVE: { label: "Nonaktif",        bg: "bg-slate-100",  text: "text-slate-400",   dot: "bg-slate-300"  },
  REJECTED: { label: "Ditolak",         bg: "bg-red-50",     text: "text-red-500",     dot: "bg-red-400"    },
};

const GENDER_STYLE = {
  PUTRA:  { label: GENDER_LABELS.PUTRA,  style: "bg-blue-50 text-blue-600"     },
  PUTRI:  { label: GENDER_LABELS.PUTRI,  style: "bg-pink-50 text-pink-600"     },
  CAMPUR: { label: GENDER_LABELS.CAMPUR, style: "bg-violet-50 text-violet-600" },
};

function OwnerCard({ item, onEdit, onDeactivate, onReactivate, reactivationPending, onDetail }) {
  const id = listingId(item);
  const st = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.PENDING;
  const gn = GENDER_STYLE[item.genderType] ?? { label: item.genderType, style: "bg-slate-50 text-slate-500" };
  const hargaMin   = item.roomTypes?.length ? Math.min(...item.roomTypes.map((r) => r.price)) : null;
  const kamarAvail = item.roomTypes?.reduce((a, r) => a + (r.availableCount || 0), 0) ?? 0;
  const coverUrl = resolveMediaUrl(item.roomTypes?.[0]?.photos?.[0]?.url);

  const openDetail = () => {
    if (id) onDetail(id);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <button type="button" onClick={openDetail} className="w-full text-left block active:opacity-95 transition-opacity">
        {coverUrl ? (
          <img src={coverUrl} alt={item.name} className="w-full h-36 object-cover" />
        ) : (
          <div className="w-full h-36 bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center">
            <Building2 size={28} className="text-indigo-200" />
          </div>
        )}

        <div className="px-4 pt-3 pb-3">
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            {item.isPremium && (
              <span className="flex items-center gap-1 text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                <Crown size={9} /> Premium
              </span>
            )}
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${gn.style}`}>{gn.label}</span>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${st.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
              <span className={`text-[10px] font-black ${st.text}`}>{st.label}</span>
            </div>
          </div>

          <h3 className="text-sm font-black text-slate-900 leading-snug mb-1 line-clamp-1">{item.name}</h3>
          <div className="flex items-center gap-1 mb-3">
            <MapPin size={10} className="text-slate-300 flex-shrink-0" />
            <p className="text-[11px] text-slate-400 truncate">{item.address}</p>
          </div>

          {item.status === "INACTIVE" && (
            <div className="flex gap-2 bg-amber-50 rounded-xl px-3 py-2 mb-3 border border-amber-100">
              <AlertCircle size={11} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-700 leading-snug">
                {reactivationPending
                  ? "Pengajuan aktivasi sudah dikirim ke admin. Menunggu Approve."
                  : "Klik Aktifkan lagi — permintaan akan muncul di panel admin untuk di-Approve."}
              </p>
            </div>
          )}

          {item.status === "REJECTED" && item.rejectionReason && (
            <div className="flex gap-2 bg-red-50 rounded-xl px-3 py-2 mb-3 border border-red-100">
              <AlertCircle size={11} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-red-500 leading-snug line-clamp-2">{item.rejectionReason}</p>
            </div>
          )}

          <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2 mb-3">
            <div className="text-center">
              <p className="text-xs font-black text-indigo-600">
                {hargaMin ? `Rp ${(hargaMin / 1000).toFixed(0)}rb` : "-"}
              </p>
              <p className="text-[9px] text-slate-400 font-semibold">Mulai dari</p>
            </div>
            <div className="w-px h-5 bg-slate-200" />
            <div className="text-center">
              <p className={`text-xs font-black ${kamarAvail > 0 ? "text-emerald-600" : "text-red-400"}`}>{kamarAvail}</p>
              <p className="text-[9px] text-slate-400 font-semibold">Tersedia</p>
            </div>
            <div className="w-px h-5 bg-slate-200" />
            <div className="text-center">
              <p className="text-xs font-black text-slate-700">{item.roomTypes?.length ?? 0}</p>
              <p className="text-[9px] text-slate-400 font-semibold">Tipe</p>
            </div>
          </div>
        </div>
      </button>

      <div className="flex border-t border-slate-100">
        <button type="button" onClick={() => id && onEdit(id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-indigo-600 font-black text-xs border-r border-slate-100 hover:bg-indigo-50 transition-colors">
          <Edit3 size={12} /> Edit
        </button>
        <button type="button" onClick={openDetail}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-blue-600 font-black text-xs border-r border-slate-100 hover:bg-blue-50 transition-colors">
          <Eye size={12} /> Detail
        </button>
        {(item.status === "ACTIVE" || item.status === "PENDING") && (
          <button type="button" onClick={() => id && onDeactivate(id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-slate-500 font-black text-xs hover:bg-slate-50 transition-colors">
            <PowerOff size={12} /> Nonaktifkan
          </button>
        )}
        {item.status === "INACTIVE" && !reactivationPending && (
          <button type="button" onClick={() => id && onReactivate(id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-emerald-600 font-black text-xs hover:bg-emerald-50 transition-colors">
            <Power size={12} /> Aktifkan lagi
          </button>
        )}
        {item.status === "INACTIVE" && reactivationPending && (
          <div className="flex-1 flex items-center justify-center py-3 px-2 border-l border-slate-100">
            <p className="text-[10px] font-semibold text-amber-600 text-center leading-snug">Menunggu approve</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PropertiPage() {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deactivateId, setDeactivateId] = useState(null);
  const [reactivateTarget, setReactivateTarget] = useState(null);
  const [deactivating, setDeactivating] = useState(false);
  const [, setPendingRequests] = useState(() => getReactivationRequests());
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  const refreshRequests = () => setPendingRequests(getReactivationRequests());

  const refetchListings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${getApiBase()}/listings/owner`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = {}; }
      if (Array.isArray(data)) setListings(data);
      else if (Array.isArray(data?.data)) setListings(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const onUpdate = () => {
      refreshRequests();
      refetchListings();
    };
    const onStorage = (e) => {
      if (e.key === "atap_reactivation_requests") onUpdate();
    };
    window.addEventListener("atap-reactivation-updated", onUpdate);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("atap-reactivation-updated", onUpdate);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${getApiBase()}/listings/owner`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { data = {}; }
        if (Array.isArray(data)) setListings(data);
        else if (Array.isArray(data?.data)) setListings(data.data);
        else setListings([]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/auth");
  };

  const handleDeactivate = async () => {
    if (!deactivateId) return;
    setDeactivating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${getApiBase()}/listings/owner/${deactivateId}/deactivate`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { message: text }; }
      if (!res.ok) throw new Error(data.message || "Gagal menonaktifkan kost");
      const updated = data.data ?? data;
      setListings((prev) =>
        prev.map((l) =>
          l.id === deactivateId
            ? { ...l, ...updated, status: updated.status ?? "INACTIVE" }
            : l
        )
      );
      setDeactivateId(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeactivating(false);
    }
  };

  const handleSendReactivation = () => {
    if (!reactivateTarget) return;
    addReactivationRequest({
      listingId: reactivateTarget.id,
      listingName: reactivateTarget.name,
      ownerName: user.name || "Owner",
    });
    refreshRequests();
    setReactivateTarget(null);
  };

  const filtered = listings.filter((l) => l.name?.toLowerCase().includes(search.toLowerCase()));
  const totalActive = listings.filter((l) => l.status === "ACTIVE").length;
  const totalPending = listings.filter((l) => l.status === "PENDING").length;

  return (
    <div className="flex min-h-screen bg-slate-50" style={{ fontFamily: "'Plus Jakarta Sans','Inter',sans-serif" }}>
      <Sidebar
        active="properti"
        onChange={(id) => {
          if (id === "home") navigate("/owner/dashboard");
          else if (id === "properti") navigate("/owner/properti");
        }}
        ownerName={user.name || "Owner"}
        initials={initials}
        onLogout={handleLogout}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden md:ml-[255px]">
        <header className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center"
            >
              <ChevronLeft size={18} className="text-slate-500" />
            </button>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">Properti Saya</h2>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Kelola listing kost kamu</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/owner/create")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl flex items-center gap-1.5 text-xs sm:text-sm font-black shadow-lg shadow-indigo-100 active:scale-95 transition-all"
          >
            + Tambah Kost
          </button>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-5 sm:py-6 overflow-y-auto pb-24 md:pb-6 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total", value: listings.length, color: "text-indigo-600 bg-indigo-50" },
              { label: "Aktif", value: totalActive, color: "text-emerald-600 bg-emerald-50" },
              { label: "Pending", value: totalPending, color: "text-amber-600 bg-amber-50" },
            ].map((s) => (
              <div key={s.label} className={`rounded-2xl px-3 py-4 text-center ${s.color}`}>
                <p className="text-2xl font-black">{s.value}</p>
                <p className="text-[10px] font-semibold opacity-70 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 px-4 py-3">
            <Search size={16} className="text-slate-300 flex-shrink-0" />
            <input
              type="text"
              placeholder="Cari nama kost..."
              className="flex-1 outline-none text-sm font-medium text-slate-700 placeholder-slate-300 bg-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-xs text-slate-400 font-bold">Hapus</button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 animate-pulse">
                  <div className="h-36 bg-slate-100 rounded-xl mb-3" />
                  <div className="h-4 bg-slate-100 rounded-full mb-2 w-3/4" />
                  <div className="h-3 bg-slate-100 rounded-full w-1/2" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Building2 size={26} className="text-indigo-200" />
              </div>
              <h3 className="text-base font-black text-slate-700 mb-1">
                {search ? "Tidak ditemukan" : "Belum ada kost"}
              </h3>
              <p className="text-sm text-slate-400 mb-5">
                {search ? `Tidak ada kost "${search}"` : "Tambahkan kost pertama kamu!"}
              </p>
              {!search && (
                <button
                  onClick={() => navigate("/owner/create")}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-sm shadow-lg shadow-indigo-100"
                >
                  Tambah Kost Pertama
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest">
                {filtered.length} Kost Ditemukan
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((item) => (
                  <OwnerCard
                    key={item.id}
                    item={item}
                    reactivationPending={item.status === "INACTIVE" && hasReactivationRequest(item.id)}
                    onEdit={(lid) => navigate(`/owner/edit/${lid}`)}
                    onDetail={(lid) => navigate(`/owner/listing/${lid}`)}
                    onDeactivate={(lid) => setDeactivateId(lid)}
                    onReactivate={(lid) => {
                      const found = listings.find((l) => l.id === lid);
                      setReactivateTarget({ id: lid, name: found?.name ?? "Kost" });
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      {reactivateTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl">
            <div className="w-14 h-14 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Power size={24} className="text-emerald-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900 text-center mb-2">Aktifkan lagi?</h3>
            <p className="text-sm text-slate-400 text-center mb-6 leading-relaxed">
              Permintaan untuk <span className="font-semibold text-slate-600">{reactivateTarget.name}</span> akan dikirim ke admin. Admin akan Approve lewat panel Kelola Listing.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setReactivateTarget(null)}
                className="flex-1 py-3.5 rounded-2xl border border-slate-200 text-slate-500 font-black text-sm hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSendReactivation}
                className="flex-1 py-3.5 rounded-2xl bg-emerald-600 text-white font-black text-sm shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-colors"
              >
                Kirim ke admin
              </button>
            </div>
          </div>
        </div>
      )}

      {deactivateId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl">
            <div className="w-14 h-14 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <PowerOff size={24} className="text-slate-500" />
            </div>
            <h3 className="text-xl font-black text-slate-900 text-center mb-2">Nonaktifkan Kost?</h3>
            <p className="text-sm text-slate-400 text-center mb-6 leading-relaxed">
              Kost tidak akan tampil di pencarian penyewa. Data kamar dan foto tetap tersimpan — bukan hapus permanen.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeactivateId(null)}
                disabled={deactivating}
                className="flex-1 py-3.5 rounded-2xl border border-slate-200 text-slate-500 font-black text-sm hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeactivate}
                disabled={deactivating}
                className="flex-1 py-3.5 rounded-2xl bg-slate-700 text-white font-black text-sm shadow-lg shadow-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-60"
              >
                {deactivating ? "Memproses..." : "Nonaktifkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
