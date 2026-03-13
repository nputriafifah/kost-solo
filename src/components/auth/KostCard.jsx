import { Star, Heart, MapPin } from "lucide-react";

export default function KostCard({ item, onClick }) {
  return (
    <div 
      onClick={() => onClick(item)} 
      className="min-w-[280px] h-fit bg-white rounded-[32px] p-4 border border-slate-100 shadow-sm cursor-pointer group hover:shadow-md transition-all"
    >
      <div className="h-44 bg-indigo-50/50 rounded-[24px] mb-4 relative overflow-hidden">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
        />
        <div className="absolute top-3 left-3 bg-indigo-600 text-[10px] text-white font-bold px-3 py-1 rounded-lg flex items-center gap-1">
          <Star size={10} fill="white" /> UNGGULAN
        </div>
        <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-slate-400">
          <Heart size={16} />
        </button>
      </div>
      <h4 className="font-bold text-slate-800 mb-1 px-1">{item.name}</h4>
      <div className="flex items-center gap-1 text-slate-400 text-xs mb-4 px-1">
        <MapPin size={12} /> {item.location}
      </div>
      <div className="flex justify-between items-center px-1">
        <p className="font-bold text-slate-900">
          Rp {item.price}<span className="text-[10px] text-slate-400 font-medium">/bln</span>
        </p>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
          {item.type}
        </span>
      </div>
    </div>
  );
}