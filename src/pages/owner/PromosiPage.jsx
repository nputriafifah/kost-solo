import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Star, TrendingUp, CheckCircle, Crown, Rocket, Eye, Building2, ChevronRight, Copy, Clock, AlertCircle, QrCode } from "lucide-react";

const PLANS = [
  {
    id: "basic",
    icon: Star,
    name: "Basic Boost",
    price: 29_000,
    duration: "7 hari",
    color: "from-slate-700 to-slate-900",
    accent: "text-slate-400",
    badge: null,
    features: [
      "Tampil di halaman utama 7 hari",
      "Label 'Direkomendasikan'",
      "Hingga 2× lebih banyak tayangan",
    ],
  },
  {
    id: "pro",
    icon: Rocket,
    name: "Pro Boost",
    price: 79_000,
    duration: "30 hari",
    color: "from-blue-600 to-blue-800",
    accent: "text-blue-300",
    badge: "Terpopuler",
    features: [
      "Tampil di halaman utama 30 hari",
      "Label 'Unggulan' + badge khusus",
      "Hingga 5× lebih banyak tayangan",
      "Prioritas muncul di pencarian",
      "Analitik performa mingguan",
    ],
  },
  {
    id: "premium",
    icon: Crown,
    name: "Premium Boost",
    price: 149_000,
    duration: "60 hari",
    color: "from-amber-500 to-orange-600",
    accent: "text-amber-200",
    badge: "Nilai Terbaik",
    features: [
      "Tampil di halaman utama 60 hari",
      "Label 'Premium' + pin teratas",
      "Hingga 10× lebih banyak tayangan",
      "Prioritas tertinggi di pencarian",
      "Analitik performa harian",
      "Dukungan tim dedicated",
    ],
  },
];

const DUMMY_LISTINGS = [
  { id: "1", name: "Kost Melati Indah", status: "ACTIVE", boosted: false },
  { id: "2", name: "Kost Putra Mandiri", status: "ACTIVE", boosted: true, plan: "Pro Boost", daysLeft: 18 },
  { id: "3", name: "Kost Bunda Asri", status: "PENDING", boosted: false },
];

const PAYMENT_METHODS = [
  { id: "qris", name: "QRIS", icon: QrCode, desc: "Scan dengan aplikasi pembayaran" },
];

const fmt = (n) => n.toLocaleString("id-ID");
const generatePaymentCode = () => `INV-${Date.now().toString().slice(-8)}`.toUpperCase();

export default function PromosiPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("pro");
  const [listingId, setListingId] = useState("");
  const [step, setStep] = useState("pilih"); // pilih | confirm | payment | done
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [paymentCode, setPaymentCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 menit dalam detik
  const [copied, setCopied] = useState(false);

  const plan = PLANS.find(p => p.id === selected);
  const listing = DUMMY_LISTINGS.find(l => l.id === listingId);

  // Timer untuk pembayaran
  useEffect(() => {
    if (step !== "payment") return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handlePaymentTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step]);

  const handlePaymentTimeout = () => {
    setError("Waktu pembayaran habis. Silakan coba lagi.");
    setTimeout(() => {
      setStep("pilih");
      setError("");
      setTimeLeft(600);
    }, 3000);
  };

  const handleNext = () => {
    if (!listingId) { setError("Pilih listing yang ingin di-boost."); return; }
    setError("");
    setStep("confirm");
  };

  const handleConfirm = () => {
    const code = generatePaymentCode();
    setPaymentCode(code);
    setTimeLeft(600);
    setStep("payment");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(paymentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaymentSuccess = () => {
    setStep("done");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Plus Jakarta Sans','Inter',sans-serif" }}>
      {/* Header */}
      <div className="relative rounded-b-3xl px-5 pt-12 pb-6 overflow-hidden"
        style={{ background: "linear-gradient(135deg,#0F172A 0%,#1E3A8A 45%,#2563EB 100%)" }}>
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-blue-400/30" />
        <div className="relative z-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-200 text-sm font-semibold mb-4">
            <ArrowLeft size={16} /> Kembali
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-black text-xl">Tingkatkan Listing</h1>
              <p className="text-blue-200 text-xs">Dapatkan lebih banyak penyewa</p>
            </div>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { icon: Eye, value: "5×", label: "Lebih dilihat" },
              { icon: TrendingUp, value: "3×", label: "Lebih banyak lead" },
              { icon: Building2, value: "90%", label: "Kamar terisi" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="bg-white/15 rounded-2xl px-2 py-3 text-center border border-white/10">
                <Icon size={13} className="text-white/70 mx-auto mb-1" />
                <p className="text-white font-black text-base">{value}</p>
                <p className="text-blue-200 text-[9px] font-semibold leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 mt-5 pb-24 space-y-4">

        {step === "pilih" && (
          <>
            {/* Listing yang sedang aktif promosi */}
            {DUMMY_LISTINGS.some(l => l.boosted) && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Sedang Aktif Promosi</p>
                {DUMMY_LISTINGS.filter(l => l.boosted).map(l => (
                  <div key={l.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Zap size={15} className="text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-slate-800">{l.name}</p>
                      <p className="text-[11px] text-blue-500 font-bold">{l.plan} · {l.daysLeft} hari lagi</p>
                    </div>
                    <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">Aktif</span>
                  </div>
                ))}
              </div>
            )}

            {/* Pilih paket */}
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Pilih Paket</p>
            {PLANS.map(p => {
              const Icon = p.icon;
              const isSelected = selected === p.id;
              return (
                <button key={p.id} onClick={() => setSelected(p.id)}
                  className={`w-full text-left rounded-2xl overflow-hidden border-2 transition-all active:scale-[0.98] ${isSelected ? "border-blue-400 shadow-lg shadow-blue-100" : "border-transparent"}`}>
                  <div className={`bg-gradient-to-br ${p.color} p-4`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                          <Icon size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="text-white font-black text-sm">{p.name}</p>
                          <p className={`text-[10px] font-semibold ${p.accent}`}>{p.duration}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {p.badge && (
                          <span className="block text-[9px] font-black text-white bg-white/25 px-2 py-0.5 rounded-full mb-1">{p.badge}</span>
                        )}
                        <p className="text-white font-black text-lg">Rp {fmt(p.price)}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {p.features.map(f => (
                        <div key={f} className="flex items-center gap-2">
                          <CheckCircle size={11} className="text-white/70 flex-shrink-0" />
                          <span className={`text-[11px] font-semibold ${p.accent}`}>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="bg-blue-50 px-4 py-2 flex items-center gap-1.5">
                      <CheckCircle size={13} className="text-blue-500" />
                      <span className="text-xs font-black text-blue-600">Paket dipilih</span>
                    </div>
                  )}
                </button>
              );
            })}

            {/* Pilih listing */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Pilih Listing</p>
              {error && <p className="text-xs font-bold text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}
              {DUMMY_LISTINGS.filter(l => l.status === "ACTIVE").map(l => (
                <button key={l.id} onClick={() => setListingId(l.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${listingId === l.id ? "border-blue-400 bg-blue-50" : "border-slate-100"}`}>
                  <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                    <Building2 size={15} className="text-slate-400" />
                  </div>
                  <p className="flex-1 text-sm font-black text-slate-800 text-left">{l.name}</p>
                  {listingId === l.id && <CheckCircle size={16} className="text-blue-500 flex-shrink-0" />}
                </button>
              ))}
            </div>

            <button onClick={handleNext}
              className="w-full bg-blue-600 text-white font-black py-3.5 rounded-xl text-sm shadow-lg shadow-blue-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              <Zap size={16} /> Boost Sekarang · Rp {fmt(plan?.price ?? 0)}
            </button>
          </>
        )}

        {/* ── Confirm ── */}
        {step === "confirm" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <p className="text-sm font-black text-slate-700">Konfirmasi Promosi</p>
            <div className="bg-slate-50 rounded-xl p-4 space-y-2.5">
              {[
                { label: "Paket", value: plan?.name },
                { label: "Durasi", value: plan?.duration },
                { label: "Listing", value: listing?.name },
                { label: "Total", value: `Rp ${fmt(plan?.price ?? 0)}` },
              ].map(r => (
                <div key={r.label} className="flex justify-between">
                  <span className="text-xs text-slate-400 font-semibold">{r.label}</span>
                  <span className="text-xs font-black text-slate-800">{r.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep("pilih")}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-black text-slate-500">
                Kembali
              </button>
              <button onClick={handleConfirm}
                className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-sm font-black shadow-lg shadow-blue-100 active:scale-[0.98]">
                Lanjut ke Pembayaran
              </button>
            </div>
          </div>
        )}

        {/* ── Payment ── */}
        {step === "payment" && (
          <div className="space-y-4">
            {/* Timer */}
            <div className={`rounded-2xl border-2 p-4 flex items-center gap-3 ${timeLeft < 120 ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"}`}>
              <Clock size={20} className={timeLeft < 120 ? "text-red-500" : "text-blue-500"} />
              <div className="flex-1">
                <p className={`text-xs font-black ${timeLeft < 120 ? "text-red-600" : "text-blue-600"}`}>
                  {timeLeft < 120 ? "Pembayaran segera habis" : "Waktu pembayaran"}
                </p>
                <p className={`text-lg font-black ${timeLeft < 120 ? "text-red-700" : "text-blue-700"}`}>
                  {formatTime(timeLeft)}
                </p>
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-full ${timeLeft < 120 ? "bg-red-200 text-red-700" : "bg-blue-200 text-blue-700"}`}>
                {timeLeft < 120 ? "SEGERA" : "NORMAL"}
              </span>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-600 font-semibold">{error}</p>
              </div>
            )}

            {/* Pilih Metode Pembayaran */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Metode Pembayaran</p>
              {PAYMENT_METHODS.map(method => {
                const Icon = method.icon;
                return (
                  <button key={method.id} onClick={() => setPaymentMethod(method.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${paymentMethod === method.id ? "border-blue-400 bg-blue-50" : "border-slate-100"}`}>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-black text-slate-800">{method.name}</p>
                      <p className="text-[10px] text-slate-400">{method.desc}</p>
                    </div>
                    {paymentMethod === method.id && <CheckCircle size={16} className="text-blue-500 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Detail Pembayaran */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Detail Pembayaran</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Paket</span>
                  <span className="font-black text-slate-800">{plan?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Harga</span>
                  <span className="font-black text-slate-800">Rp {fmt(plan?.price ?? 0)}</span>
                </div>
                <div className="border-t border-slate-100 pt-2 flex justify-between text-base">
                  <span className="font-black text-slate-800">Total</span>
                  <span className="font-black text-blue-600">Rp {fmt(plan?.price ?? 0)}</span>
                </div>
              </div>
            </div>

            {/* QRIS / Kode Pembayaran */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-4">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Kode Pembayaran</p>
                <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between">
                  <span className="font-mono font-black text-slate-800">{paymentCode}</span>
                  <button onClick={handleCopyCode}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-black active:scale-95 transition-transform">
                    <Copy size={12} /> {copied ? "Tersalin" : "Salin"}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">QRIS</p>
                <div className="bg-slate-50 rounded-2xl p-6 flex items-center justify-center aspect-square mb-3">
                  <div className="w-32 h-32 bg-slate-200 rounded-lg flex items-center justify-center border-2 border-slate-300">
                    <QrCode size={48} className="text-slate-400" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 text-center">Scan QR Code dengan aplikasi pembayaran digital kamu</p>
              </div>

              <div className="bg-blue-50 rounded-xl p-3 flex gap-2">
                <div className="flex-shrink-0 pt-0.5">
                  <CheckCircle size={16} className="text-blue-600" />
                </div>
                <p className="text-[11px] text-blue-700 font-semibold">
                  Pembayaran akan otomatis terverifikasi dalam 1-2 menit setelah transfer.
                </p>
              </div>
            </div>

            {/* Tombol */}
            <div className="flex gap-3">
              <button onClick={() => setStep("confirm")}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-black text-slate-500">
                Kembali
              </button>
              <button onClick={handlePaymentSuccess}
                className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-sm font-black shadow-lg shadow-blue-100 active:scale-[0.98] flex items-center justify-center gap-2">
                <CheckCircle size={14} /> Sudah Dibayar
              </button>
            </div>
          </div>
        )}

        {/* ── Done ── */}
        {step === "done" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center space-y-3">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={32} className="text-blue-600" />
            </div>
            <p className="text-base font-black text-slate-800">Listing Berhasil Di-Boost!</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Listing kamu sekarang akan lebih sering muncul di halaman utama dan hasil pencarian.
            </p>
            <button onClick={() => navigate("/owner/dashboard")}
              className="mt-2 bg-blue-600 text-white font-black px-6 py-2.5 rounded-xl text-sm">
              Kembali ke Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}