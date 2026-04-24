import { Heart, MapPin } from "lucide-react";

export default function KostCard({ item, onClick, onLike, isLiked }) {

  const handleLikeClick = (e) => {
  e.stopPropagation(); // tetap di sini ✅
  onLike(); // ✅ jangan kirim apa-apa
};

  return (
    <div
      onClick={() => onClick(item)}
      className="w-full bg-white rounded-xl overflow-hidden border border-slate-100 
                 shadow-sm cursor-pointer group 
                 hover:shadow-md transition-all active:scale-[0.98]"
    >
      {/* IMAGE */}
<div className="relative h-36 overflow-hidden">
  <img
    src={item.image}
    alt={item.name}
    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
  />

  {/* LIKE BUTTON */}
  <button
    onClick={handleLikeClick}
    className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center transition shadow-sm ${
      isLiked
        ? "bg-red-500 text-white"
        : "bg-white/80 text-slate-400 hover:text-red-500"
    }`}
  >
    <Heart
      size={11}
      className="transition-transform duration-200 group-active:scale-90"
      fill={isLiked ? "white" : "none"}
    />
  </button>

  {/* BADGE GENDER — harus di dalam div relative ini */}
  {item.gender && (
    <span className={`absolute bottom-1.5 left-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full ${
      item.gender === "putra" ? "bg-blue-500 text-white" :
      item.gender === "putri" ? "bg-pink-500 text-white" :
      "bg-green-500 text-white"
    }`}>
      {item.gender.charAt(0).toUpperCase() + item.gender.slice(1)}
    </span>
  )}
</div>
      {/* CONTENT */}
      <div className="p-2.5">
        <h4 className="text-[11px] font-semibold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition mb-0.5">
          {item.name}
        </h4>

        <div className="flex items-center gap-0.5 text-[10px] text-slate-400 mb-1.5">
          <MapPin size={9} className="text-indigo-400 flex-shrink-0" />
          <span className="line-clamp-1">{item.location}</span>
        </div>

        <p className="text-[11px] font-bold text-indigo-600">
  Rp {(item.price ?? 0).toLocaleString("id-ID")}
  <span className="text-[9px] text-slate-400 font-medium ml-0.5">
    /bln
  </span>
</p>
      </div>
    </div>
  );
}