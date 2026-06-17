import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Wallet, ArrowDownCircle, CheckCircle, Clock, ChevronRight, Banknote, Building2 } from "lucide-react";

const DUMMY_BALANCE = 4_750_000;
const DUMMY_TOTAL = 18_200_000;

const DUMMY_HISTORY = [
  { id: "w1", amount: 2_500_000, bank: "BCA", account: "••••3821", date: "2025-06-30", status: "success" },
  { id: "w2", amount: 1_500_000, bank: "Mandiri", account: "••••9912", date: "2025-06-01", status: "success" },
  { id: "w3", amount: 3_000_000, bank: "BNI", account: "••••5544", date: "2025-05-15", status: "success" },
];

const DUMMY_INCOME = [
  { id: "i1", kost: "Kost Melati Indah", penyewa: "Budi S.", bulan: "Juli 2025", amount: 750_000, status: "masuk" },
  { id: "i2", kost: "Kost Putra Mandiri", penyewa: "Siti R.", bulan: "Juli 2025", amount: 1_200_000, status: "masuk" },
  { id: "i3", kost: "Kost Melati Indah", penyewa: "Ahmad F.", bulan: "Juni 2025", amount: 750_000, status: "masuk" },
  { id: "i4", kost: "Kost Bunda Asri", penyewa: "Dewi K.", bulan: "Juni 2025", amount: 900_000, status: "masuk" },
];

const BANKS = ["BCA", "Mandiri", "BNI", "BRI", "CIMB Niaga", "Jago", "SeaBank"];

const fmt = (n) => n.toLocaleString("id-ID");

export default function PendapatanPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("ringkasan"); // ringkasan | tarik | riwayat
  const [balance, setBalance] = useState(DUMMY_BALANCE);
  const [form, setForm] = useState({ bank: "", account: "", amount: "" });
  const [step, setStep] = useState("form"); // form | confirm | done
  const [error, setError] = useState("");

  const handleWithdraw = () => {
    const amt = parseInt(form.amount.replace(/\D/g, ""), 10);
    if (!form.bank) { setError("Pilih bank tujuan."); return; }
    if (!form.account) { setError("Masukkan nomor rekening."); return; }
    if (!amt || amt < 50_000) { setError("Minimal penarikan Rp 50.000."); return; }
    if (amt > balance) { setError("Saldo tidak cukup."); return; }
    setError("");
    setStep("confirm");
  };

  const handleConfirm = () => {
    const amt = parseInt(form.amount.replace(/\D/g, ""), 10);
    setBalance(prev => prev - amt);
    setStep("done");
  };

  const resetForm = () => {
    setForm({ bank: "", account: "", amount: "" });
    setStep("form");
    setTab("riwayat");
  };

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Outfit','Outfit','Inter',sans-serif" }}>
      {/* Header */}
      <div className="relative rounded-b-3xl px-5 pt-12 pb-6 overflow-hidden"
        style={{ background: "linear-gradient(135deg,#1E1B4B 0%,#3730A3 45%,#4F46E5 100%)" }}>
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-indigo-400/30" />
        <div className="relative z-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-indigo-200 text-sm font-semibold mb-4">
            <ArrowLeft size={16} /> Kembali
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Wallet size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-black text-xl">Pendapatan</h1>
              <p className="text-indigo-200 text-xs">Saldo & penarikan kos kamu</p>
            </div>
          </div>
          {/* Balance card */}
          <div className="bg-white/15 backdrop-blur rounded-2xl p-4 border border-white/10">
            <p className="text-indigo-200 text-[11px] font-bold uppercase tracking-widest mb-1">Saldo Tersedia</p>
            <p className="text-white font-black text-3xl">Rp {fmt(balance)}</p>
            <div className="flex items-center justify-between mt-3">
              <div>
                <p className="text-indigo-200 text-[10px] font-semibold">Total pendapatan</p>
                <p className="text-white font-black text-sm">Rp {fmt(DUMMY_TOTAL)}</p>
              </div>
              <button onClick={() => setTab("tarik")}
                className="bg-white text-indigo-700 text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 active:scale-95 transition-transform shadow">
                <ArrowDownCircle size={14} /> Tarik Dana
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab */}
      <div className="px-5 mt-5">
        <div className="flex bg-white rounded-2xl border border-slate-100 p-1 shadow-sm">
          {[
            { id: "ringkasan", label: "Ringkasan" },
            { id: "tarik", label: "Tarik Dana" },
            { id: "riwayat", label: "Riwayat" },
          ].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setStep("form"); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${tab === t.id ? "bg-indigo-600 text-white shadow" : "text-slate-400"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-5 pb-24 space-y-3">

        {/* ── Ringkasan ── */}
        {tab === "ringkasan" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Saldo tersedia", value: `Rp ${fmt(balance)}`, color: "text-indigo-600 bg-indigo-50" },
                { label: "Total pendapatan", value: `Rp ${fmt(DUMMY_TOTAL)}`, color: "text-indigo-600 bg-indigo-50" },
                { label: "Sudah ditarik", value: `Rp ${fmt(DUMMY_TOTAL - balance)}`, color: "text-indigo-600 bg-indigo-50" },
                { label: "Pemasukan bulan ini", value: `Rp ${fmt(1_950_000)}`, color: "text-indigo-500 bg-indigo-50" },
              ].map(s => (
                <div key={s.label} className={`rounded-2xl px-4 py-4 ${s.color}`}>
                  <p className="text-lg font-black leading-tight">{s.value}</p>
                  <p className="text-[10px] font-semibold opacity-70 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Pemasukan Terbaru</p>
              <div className="space-y-3">
                {DUMMY_INCOME.map(inc => (
                  <div key={inc.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <Building2 size={15} className="text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-800 truncate">{inc.kost}</p>
                      <p className="text-[10px] text-slate-400">{inc.penyewa} · {inc.bulan}</p>
                    </div>
                    <p className="text-sm font-black text-indigo-600">+Rp {fmt(inc.amount)}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Tarik Dana ── */}
        {tab === "tarik" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            {step === "form" && (
              <div className="space-y-4">
                <div className="bg-indigo-50 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-600">Saldo tersedia</span>
                  <span className="text-base font-black text-indigo-700">Rp {fmt(balance)}</span>
                </div>

                {error && <p className="text-xs font-bold text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}

                <div>
                  <label className="text-xs font-black text-slate-500 mb-1.5 block">Bank Tujuan</label>
                  <select value={form.bank} onChange={e => setForm(p => ({ ...p, bank: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 bg-white transition-all">
                    <option value="">Pilih bank...</option>
                    {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-500 mb-1.5 block">Nomor Rekening</label>
                  <input value={form.account} onChange={e => setForm(p => ({ ...p, account: e.target.value }))}
                    placeholder="Contoh: 1234567890" type="number"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all" />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-500 mb-1.5 block">Jumlah Penarikan</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">Rp</span>
                    <input
                      value={form.amount}
                      onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                      placeholder="0"
                      type="number"
                      className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all" />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[100_000, 500_000, 1_000_000, 2_000_000].map(v => (
                      <button key={v} onClick={() => setForm(p => ({ ...p, amount: String(v) }))}
                        className="flex-1 py-1.5 rounded-lg border border-slate-200 text-[10px] font-black text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-all">
                        {v >= 1_000_000 ? `${v / 1_000_000}jt` : `${v / 1_000}rb`}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={handleWithdraw}
                  className="w-full bg-indigo-600 text-white font-black py-3.5 rounded-xl text-sm shadow-lg shadow-indigo-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  <ArrowDownCircle size={16} /> Lanjutkan Penarikan
                </button>
              </div>
            )}

            {step === "confirm" && (
              <div className="space-y-4">
                <p className="text-sm font-black text-slate-700">Konfirmasi Penarikan</p>
                <div className="bg-slate-50 rounded-xl p-4 space-y-2.5">
                  {[
                    { label: "Bank", value: form.bank },
                    { label: "Rekening", value: form.account },
                    { label: "Jumlah", value: `Rp ${fmt(parseInt(form.amount))}` },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between">
                      <span className="text-xs text-slate-400 font-semibold">{r.label}</span>
                      <span className="text-xs font-black text-slate-800">{r.value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep("form")}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-black text-slate-500">
                    Batal
                  </button>
                  <button onClick={handleConfirm}
                    className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-black shadow-lg shadow-indigo-100 active:scale-[0.98]">
                    Ya, Tarik
                  </button>
                </div>
              </div>
            )}

            {step === "done" && (
              <div className="py-6 text-center space-y-3">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle size={32} className="text-indigo-600" />
                </div>
                <p className="text-base font-black text-slate-800">Penarikan Berhasil!</p>
                <p className="text-xs text-slate-400">Dana akan masuk ke rekening kamu dalam 1×24 jam kerja.</p>
                <button onClick={resetForm}
                  className="mt-2 bg-indigo-600 text-white font-black px-6 py-2.5 rounded-xl text-sm">
                  Lihat Riwayat
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Riwayat ── */}
        {tab === "riwayat" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Riwayat Penarikan</p>
            {DUMMY_HISTORY.map(h => (
              <div key={h.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <Banknote size={15} className="text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-800">{h.bank} {h.account}</p>
                  <p className="text-[10px] text-slate-400">{new Date(h.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-800">Rp {fmt(h.amount)}</p>
                  <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full">Berhasil</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}