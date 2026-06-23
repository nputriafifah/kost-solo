import {
  Home,
  MapPin,
  Star,
  CheckCircle2,
  Building2,
} from "lucide-react";
import KostIllustration from "../components/kost/KostIllustration";

export default function AuthLayout({ children }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..900;1,9..144,400..900&family=Outfit:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Outfit', sans-serif; box-sizing: border-box; }
        h1, h2, h3, h4 { font-family: 'Fraunces', Georgia, serif; }
        .gradient-bg {
          background: linear-gradient(135deg, #1E1B4B 0%, #4338CA 35%, #4F46E5 70%, #7C3AED 100%);
        }
        .card-glass {
          background: rgba(255,255,255,0.07);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.15);
        }
        .stat-pill {
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          backdrop-filter: blur(4px);
        }
        .tab-active {
          background: white;
          color: #4F46E5;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08), 0 0 0 1px rgba(129,140,248,0.1);
        }
        .role-btn:hover {
          border-color: #A78BFA;
          background: #F5F3FF;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(129,140,248,0.12);
        }
        .submit-btn {
          background: linear-gradient(135deg, #4F46E5, #7C3AED);
          box-shadow: 0 4px 16px rgba(79,70,229,0.35);
          transition: all 0.2s;
        }
        .submit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(79,70,229,0.45);
        }
        .fade-in { animation: fadeIn 0.35s ease; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-100">
        <div className="flex flex-col md:flex-row w-full max-w-[960px] min-h-[640px] bg-white rounded-3xl overflow-hidden shadow-2xl shadow-indigo-900/10">
          <div className="md:w-[420px] gradient-bg p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute w-64 h-64 rounded-full -top-20 -right-20 bg-white/5" />
            <div className="absolute rounded-full -bottom-16 -left-16 w-72 h-72 bg-white/5" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/[0.03]" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 border bg-white/20 rounded-2xl border-white/25">
                  <Home size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold leading-none text-white" style={{ fontFamily: "Outfit" }}>
                    Atap
                  </p>
                  <p className="text-indigo-200 text-[10px] font-medium uppercase tracking-widest">
                    Platform #1 Surakarta
                  </p>
                </div>
              </div>

              <h2 className="mb-3 text-3xl font-extrabold leading-snug text-white" style={{ fontFamily: "Outfit", color: "#fff" }}>
                Temukan Kost
                <br />
                Impian Anda
              </h2>

              <p className="mb-6 text-sm leading-relaxed text-indigo-200">
                Ribuan pilihan kost terbaik di Solo, proses mudah, tanpa biaya tambahan.
              </p>

              <div className="flex items-center gap-2 px-4 py-3 card-glass rounded-2xl w-fit">
                <MapPin size={14} className="text-indigo-300" />
                <span className="text-xs font-medium text-indigo-100">
                  Jl. Slamet Riyadi · UNS · ISI · UMS
                </span>
              </div>
            </div>

            <div className="relative z-10 flex justify-center my-6">
              <KostIllustration />
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-2.5">
              {[
                { icon: <Building2 size={14} />, label: "8.000+ Kost" },
                { icon: <MapPin size={14} />, label: "Seluruh Solo" },
                { icon: <Star size={14} />, label: "4.9 Rating" },
                { icon: <CheckCircle2 size={14} />, label: "100% Gratis" },
              ].map((s) => (
                <div key={s.label} className="stat-pill rounded-xl px-3 py-2.5 flex items-center gap-2">
                  <span className="text-indigo-200">{s.icon}</span>
                  <span className="text-xs font-semibold text-white">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-center flex-1 p-8 md:p-12">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}