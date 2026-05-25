import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Phone, Edit3, BedDouble, Crown, AlertCircle,
  ChevronLeft, ChevronRight, Wifi, Users, Wind, Zap, Droplets,
  ImageOff, Shield, Ruler, Building2, Sparkles,
} from "lucide-react";
import { getApiBase, resolveMediaUrl } from "../../config/apiBase";

const STATUS = {
  PENDING:  { label: "Menunggu Review", pill: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-400" },
  ACTIVE:   { label: "Aktif",           pill: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-400" },
  INACTIVE: { label: "Nonaktif",        pill: "bg-slate-100 text-slate-500 border-slate-200", dot: "bg-slate-400" },
  REJECTED: { label: "Ditolak",         pill: "bg-red-100 text-red-600 border-red-200", dot: "bg-red-400" },
};

const GENDER = {
  PUTRA:  { label: "Putra",  cls: "bg-blue-100 text-blue-700 border-blue-200" },
  PUTRI:  { label: "Putri",  cls: "bg-pink-100 text-pink-700 border-pink-200" },
  CAMPUR: { label: "Campur", cls: "bg-violet-100 text-violet-700 border-violet-200" },
};

const facIcon = (f) => {
  const k = String(f).toLowerCase();
  if (k.includes("wifi")) return <Wifi size={13} />;
  if (k.includes("ac")) return <Wind size={13} />;
  if (k.includes("listrik")) return <Zap size={13} />;
  if (k.includes("air")) return <Droplets size={13} />;
  return <Sparkles size={13} />;
};

const fmtPrice = (n) =>
  n != null && !isNaN(Number(n)) ? `Rp ${Number(n).toLocaleString("id-ID")}` : "—";

function Section({ icon: Icon, title, children, badge }) {
  return (
    <section className="bg-white rounded-3xl border border-blue-100/80 shadow-sm shadow-blue-100/40 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-blue-50 bg-gradient-to-r from-blue-50/80 to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-200">
            <Icon size={18} />
          </div>
          <h2 className="text-sm sm:text-base font-black text-slate-900">{title}</h2>
        </div>
        {badge}
      </div>
      <div className="px-5 sm:px-6 py-5">{children}</div>
    </section>
  );
}

export default function DetailListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgIdx, setImgIdx] = useState(0);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) { navigate("/auth"); return; }
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${getApiBase()}/listings/owner/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.message || "Gagal memuat detail properti");
        const raw = json.data ?? json;
        setListing(raw?.listing ?? raw);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, token, navigate]);

  const data = listing ?? {};
  const has = Boolean(listing && (listing.id || listing._id));
  const st = STATUS[data.status] ?? STATUS.PENDING;
  const gn = GENDER[data.genderType] ?? { label: data.genderType || "—", cls: "bg-slate-100 text-slate-600 border-slate-200" };

  const allImages = [
    ...(data.photos || []),
    ...(data.roomTypes?.flatMap((r) => r?.photos || []) || []),
  ].filter((p) => p?.url);

  const coverUrl = allImages[imgIdx]?.url ? resolveMediaUrl(allImages[imgIdx].url) : null;
  const totalRooms = data.roomTypes?.reduce((s, r) => s + (r?.availableCount || 0), 0) || 0;
  const allFac = [...new Set(data.roomTypes?.flatMap((r) => r?.facilities || []) || [])];
  const minPrice = data.roomTypes?.length
    ? Math.min(...data.roomTypes.map((r) => Number(r.price)).filter((p) => !isNaN(p)))
    : null;

  const prevImg = () => setImgIdx((i) => (i - 1 + allImages.length) % allImages.length);
  const nextImg = () => setImgIdx((i) => (i + 1) % allImages.length);

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-blue-50 via-slate-50 to-white pb-12"
      style={{ fontFamily: "'Plus Jakarta Sans','Inter',sans-serif" }}
    >
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigate("/owner/properti")}
              className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-100 active:scale-95 transition-all flex-shrink-0"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Properti</p>
              <p className="text-sm font-black text-slate-900 truncate">Detail Listing</p>
            </div>
          </div>
          {has && (
            <button
              type="button"
              onClick={() => navigate(`/owner/edit/${id}`)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white text-xs sm:text-sm font-black px-4 py-2.5 rounded-2xl shadow-lg shadow-blue-200 active:scale-95 transition-all flex-shrink-0"
            >
              <Edit3 size={16} /> Edit
            </button>
          )}
        </div>
      </header>

      {loading && (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
          <p className="text-sm font-bold text-slate-500">Memuat detail properti...</p>
        </div>
      )}

      {!loading && error && (
        <div className="max-w-md mx-auto mt-16 px-4">
          <div className="bg-white rounded-3xl border border-red-100 p-8 text-center shadow-lg">
            <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
            <p className="text-sm font-black text-red-600 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => navigate("/owner/properti")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black"
            >
              <ArrowLeft size={14} /> Kembali ke Properti
            </button>
          </div>
        </div>
      )}

      {!loading && has && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 sm:pt-8 space-y-6 sm:space-y-8">
          {/* Hero */}
          <div className="relative rounded-[2rem] overflow-hidden shadow-xl shadow-blue-200/50 border border-blue-100">
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(135deg,#0F172A 0%,#1E3A8A 40%,#2563EB 70%,#38BDF8 100%)" }}
            />
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-sky-400/20 blur-2xl" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-blue-300/20 blur-2xl" />

            <div className="relative z-10 grid lg:grid-cols-2 gap-6 lg:gap-8 p-6 sm:p-8 lg:p-10">
              {/* Info */}
              <div className="flex flex-col justify-center order-2 lg:order-1">
                <p className="text-blue-200 text-[11px] font-black uppercase tracking-[0.2em] mb-2">
                  Detail Properti
                </p>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight mb-3">
                  {data.name}
                </h1>
                <div className="flex items-start gap-2 text-blue-100 mb-4">
                  <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                  <p className="text-sm leading-relaxed">{data.address || "—"}</p>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black border ${st.pill}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                    {st.label}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black border ${gn.cls}`}>
                    {gn.label}
                  </span>
                  {data.isPremium && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black bg-amber-400/20 text-amber-200 border border-amber-300/40">
                      <Crown size={12} /> Premium
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Kamar", value: totalRooms, sub: "tersedia" },
                    { label: "Tipe", value: data.roomTypes?.length || 0, sub: "kamar" },
                    { label: "Mulai", value: minPrice ? `${(minPrice / 1000).toFixed(0)}rb` : "—", sub: "/ bulan" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="bg-white/15 backdrop-blur rounded-2xl px-3 py-4 border border-white/20 text-center"
                    >
                      <p className="text-xl sm:text-2xl font-black text-white leading-none">{s.value}</p>
                      <p className="text-[10px] text-blue-200 font-bold mt-1">{s.label}</p>
                      <p className="text-[9px] text-blue-300/80">{s.sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gallery */}
              <div className="order-1 lg:order-2">
                <div className="relative rounded-2xl overflow-hidden bg-blue-900/40 border-2 border-white/25 shadow-2xl aspect-[4/3] sm:aspect-[5/4] min-h-[220px] sm:min-h-[280px]">
                  {coverUrl ? (
                    <img src={coverUrl} alt={data.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-blue-200/60 gap-2">
                      <ImageOff size={48} strokeWidth={1.5} />
                      <span className="text-sm font-semibold">Belum ada foto</span>
                    </div>
                  )}

                  {allImages.length > 1 && (
                    <>
                      <span className="absolute top-3 right-3 bg-black/50 backdrop-blur text-white text-xs font-black px-3 py-1 rounded-full">
                        {imgIdx + 1} / {allImages.length}
                      </span>
                      <button
                        type="button"
                        onClick={prevImg}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 text-slate-800 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        type="button"
                        onClick={nextImg}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 text-slate-800 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
                      >
                        <ChevronRight size={20} />
                      </button>
                      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 px-4">
                        {allImages.slice(0, 8).map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setImgIdx(i)}
                            className={`h-1.5 rounded-full transition-all ${
                              imgIdx === i ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {allImages.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                    {allImages.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setImgIdx(i)}
                        className={`flex-shrink-0 w-16 h-14 sm:w-20 sm:h-16 rounded-xl overflow-hidden border-2 transition-all ${
                          imgIdx === i ? "border-white scale-105 shadow-lg" : "border-white/30 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={resolveMediaUrl(img.url)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Body grid */}
          <div className="grid lg:grid-cols-[1fr_300px] gap-6 lg:gap-8 items-start">
            <div className="space-y-5 sm:space-y-6">
              {data.description && (
                <Section icon={Building2} title="Deskripsi">
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed bg-blue-50/60 rounded-2xl p-4 sm:p-5 border border-blue-100">
                    {data.description}
                  </p>
                </Section>
              )}

              <Section icon={Phone} title="Informasi Kost">
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { label: "Kontak", value: data.contactNumber, icon: Phone, highlight: false },
                    { label: "Tipe Kost", value: gn.label, icon: Users, highlight: false },
                    { label: "Kamar Tersedia", value: `${totalRooms} kamar`, icon: BedDouble, highlight: true },
                    { label: "Jumlah Tipe", value: `${data.roomTypes?.length || 0} tipe`, icon: Ruler, highlight: true },
                  ].map(({ label, value, icon: Icon, highlight }) => (
                    <div
                      key={label}
                      className={`rounded-2xl p-4 border ${
                        highlight
                          ? "bg-gradient-to-br from-blue-600 to-sky-500 border-transparent text-white shadow-md shadow-blue-200"
                          : "bg-white border-blue-100"
                      }`}
                    >
                      <div className={`flex items-center gap-2 mb-2 ${highlight ? "text-blue-100" : "text-slate-400"}`}>
                        <Icon size={14} />
                        <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
                      </div>
                      <p className={`text-base font-black ${highlight ? "text-white" : "text-slate-900"}`}>
                        {value || "—"}
                      </p>
                    </div>
                  ))}
                </div>
                {data.status === "REJECTED" && data.rejectionReason && (
                  <div className="mt-4 flex gap-3 p-4 rounded-2xl bg-red-50 border border-red-100">
                    <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-black text-red-700 mb-1">Alasan penolakan</p>
                      <p className="text-sm text-red-600 leading-relaxed">{data.rejectionReason}</p>
                    </div>
                  </div>
                )}
              </Section>

              <Section icon={MapPin} title="Lokasi">
                <p className="text-sm text-slate-600 leading-relaxed mb-3">{data.address}</p>
                {(data.latitude != null || data.longitude != null) && (
                  <div className="rounded-2xl bg-gradient-to-br from-blue-100 to-sky-50 border border-blue-200 p-6 text-center">
                    <MapPin size={28} className="text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-black text-blue-800">Titik lokasi terdaftar</p>
                    <p className="text-xs text-blue-600/80 mt-1 font-mono">
                      {Number(data.latitude).toFixed(5)}, {Number(data.longitude).toFixed(5)}
                    </p>
                  </div>
                )}
              </Section>

              {allFac.length > 0 && (
                <Section icon={Sparkles} title="Fasilitas">
                  <div className="flex flex-wrap gap-2">
                    {allFac.map((f, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold"
                      >
                        {facIcon(f)}
                        {f}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {data.rules?.length > 0 && (
                <Section icon={Shield} title="Peraturan Penghuni">
                  <ul className="space-y-2">
                    {data.rules.map((rule, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-sm text-slate-700 bg-blue-50/50 rounded-xl px-4 py-3 border border-blue-100"
                      >
                        <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                          <svg width="10" height="8" viewBox="0 0 9 7" fill="none">
                            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              <Section
                icon={BedDouble}
                title="Tipe Kamar"
                badge={
                  <span className="text-[11px] font-black text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full">
                    {data.roomTypes?.length || 0} tipe
                  </span>
                }
              >
                {!data.roomTypes?.length ? (
                  <div className="text-center py-12 text-slate-400">
                    <BedDouble size={36} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-bold">Belum ada tipe kamar</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.roomTypes.map((room) => {
                      const thumb = room?.photos?.[0]?.url ? resolveMediaUrl(room.photos[0].url) : null;
                      const facs = (room?.facilities || []).filter(Boolean);
                      return (
                        <article
                          key={room?.id}
                          className="rounded-2xl border border-blue-100 overflow-hidden hover:border-blue-300 hover:shadow-md hover:shadow-blue-100/50 transition-all bg-white"
                        >
                          <div className="flex gap-4 p-4 sm:p-5">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-blue-50 border border-blue-100 flex-shrink-0 flex items-center justify-center">
                              {thumb ? (
                                <img src={thumb} alt={room?.name} className="w-full h-full object-cover" />
                              ) : (
                                <BedDouble size={28} className="text-blue-200" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-black text-slate-900 mb-1">{room?.name || "Kamar"}</h3>
                              <p className="text-xs text-slate-500 mb-2">
                                {room?.size ? `${room.size} · ` : ""}
                                <span className="text-blue-600 font-black">{fmtPrice(room?.price)}</span>
                                <span className="text-slate-400"> / bulan</span>
                              </p>
                              {facs.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {facs.slice(0, 5).map((f, i) => (
                                    <span
                                      key={i}
                                      className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100"
                                    >
                                      {facIcon(f)} {f}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-gradient-to-r from-blue-50 to-sky-50 border-t border-blue-100">
                            <span className="text-xs font-black text-emerald-600 flex items-center gap-1.5">
                              <Users size={14} /> {room?.availableCount ?? 0} kamar tersedia
                            </span>
                            <span className="text-base font-black text-blue-700">{fmtPrice(room?.price)}</span>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </Section>
            </div>

            {/* Sidebar */}
            <aside className="lg:sticky lg:top-20 space-y-4">
              <div
                className="rounded-3xl overflow-hidden shadow-xl shadow-blue-200/60 border border-blue-200"
                style={{ background: "linear-gradient(160deg,#1E3A8A 0%,#2563EB 50%,#0EA5E9 100%)" }}
              >
                <div className="p-5 sm:p-6 border-b border-white/15">
                  <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Ringkasan</p>
                  <p className="text-lg font-black text-white leading-snug line-clamp-2">{data.name}</p>
                </div>
                <div className="p-5 sm:p-6 space-y-3">
                  {[
                    { label: "Status", value: st.label },
                    { label: "Kontak", value: data.contactNumber },
                    { label: "Kamar", value: `${totalRooms} tersedia · ${data.roomTypes?.length || 0} tipe` },
                    ...(minPrice ? [{ label: "Harga mulai", value: fmtPrice(minPrice) }] : []),
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3 backdrop-blur-sm"
                    >
                      <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wide mb-0.5">{row.label}</p>
                      <p className="text-sm font-black text-white">{row.value || "—"}</p>
                    </div>
                  ))}
                </div>
                <div className="p-5 sm:p-6 pt-0">
                  <button
                    type="button"
                    onClick={() => navigate(`/owner/edit/${id}`)}
                    className="w-full py-3.5 rounded-2xl bg-white text-blue-700 font-black text-sm shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2 hover:bg-blue-50"
                  >
                    <Edit3 size={16} /> Edit Properti
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/owner/properti")}
                    className="w-full mt-2 py-3 rounded-2xl border border-white/30 text-white/90 font-bold text-sm hover:bg-white/10 transition-colors"
                  >
                    Kembali ke daftar
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}
