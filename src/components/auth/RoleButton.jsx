import { ChevronLeft } from "lucide-react";

export default function RoleButton({ title, desc, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center w-full p-4 text-left transition-all bg-white border-2 role-btn border-slate-150 rounded-2xl group"
      style={{ border: "1.5px solid #e2e8f0" }}
    >
      <div className="flex items-center justify-center mr-4 border border-indigo-100 w-11 h-11 bg-indigo-50 rounded-xl">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4
            className="font-bold text-slate-700 text-[15px]"
            style={{ fontFamily: "Outfit" }}
          >
            {title}
          </h4>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
      </div>
      <ChevronLeft
        size={16}
        className="transition-colors rotate-180 text-slate-300 group-hover:text-indigo-600"
      />
    </button>
  );
}