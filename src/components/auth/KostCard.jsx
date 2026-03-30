import { Star, Heart, MapPin } from "lucide-react";

export default function KostCard({ item, onClick, onLike, isLiked }) {
  return (
    <div 
      onClick={() => onClick(item)} 
      className="min-w-[280px] h-fit bg-white rounded-[32px] p-4 border border-slate-100 shadow-sm cursor-pointer group hover:shadow-md transition-all active:scale-[0.98]"
    >
      <div className="h-44 bg-indigo-50/50 rounded-[24px] mb-4 relative overflow-hidden">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
        />
        
        {/* Label Unggulan */}
        <div className="absolute top-3 left-3 bg-indigo-600 text-[10px] text-white font-bold px-3 py-1 rounded-lg flex items-center gap-1 shadow-lg">
          <Star size={10} fill="white" /> UNGGULAN
        </div>
        
        {/* Tombol Heart / Like */}
        <button 
          onClick={(e) => onLike(e)} // Menggunakan fungsi onLike dari props
          className={`absolute top-3 right-3 w-9 h-9 backdrop-blur-md rounded-full flex items-center justify-center transition-all shadow-sm ${
            isLiked 
              ? "bg-red-500 text-white shadow-red-200" 
              : "bg-white/80 text-slate-400 hover:text-red-500"
          }`}
        >
          <Heart 
            size={18} 
            fill={isLiked ? "white" : "none"} 
            className={isLiked ? "scale-110" : ""}
          />
        </button>
      </div>

      <div className="px-1">
        <h4 className="font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
          {item.name}
        </h4>
        
        <div className="flex items-center gap-1 text-slate-400 text-[11px] mb-4">
          <MapPin size={12} className="text-indigo-400" /> 
          {item.location}
        </div>
        
        <div className="flex justify-between items-center">
          <p className="font-extrabold text-slate-900">
            Rp {item.price}
            <span className="text-[10px] text-slate-400 font-medium ml-0.5">/bln</span>
          </p>
          
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
            item.type === "Putri" 
              ? "bg-pink-50 text-pink-600 border-pink-100" 
              : "bg-blue-50 text-blue-600 border-blue-100"
          }`}>
            {item.type}
          </span>
        </div>
      </div>
    </div>
  );
}