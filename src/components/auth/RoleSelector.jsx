import { Home, Search } from "lucide-react";
import RoleButton from "./RoleButton";

export default function RoleSelector({ onSelectRole }) {
  return (
    <div className="fade-in">
      <span className="inline-flex items-center gap-1.5 text-[11px] bg-blue-50 text-blue-600 font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider border border-blue-100">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        Selamat Datang
      </span>

      <h1
        className="mt-4 mb-2 text-3xl font-extrabold leading-tight text-slate-800"
        style={{ fontFamily: "Plus Jakarta Sans" }}
      >
        Saya seorang...
      </h1>

      <p className="mb-8 text-sm text-slate-400">
        Pilih peran Anda agar Kost Solo dapat memberikan pengalaman terbaik untuk kebutuhan anda.
      </p>

      <div className="space-y-3">
        <RoleButton
          title="Pencari Kost"
          desc="Temukan kost ideal di Surakarta"
          icon={<Search size={22} className="text-blue-600" />}
          onClick={() => onSelectRole("pencari")}
        />

        <RoleButton
          title="Pemilik Kost"
          desc="Kelola & pasarkan properti Anda"
          icon={<Home size={22} className="text-blue-600" />}
          onClick={() => onSelectRole("pemilik")}
        />
      </div>
    </div>
  );
}