import React, { useState } from "react";
import { 
  MapPin, Search, Navigation2, Star, X, 
  Filter, ChevronLeft, SlidersHorizontal, Check 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/auth/BottomNav";

// --- DATA DUMMY SURAKARTA ---
const SOLO_KOST_DATA = [
  { 
    id: 1, 
    name: "Griya Sruni Exclusive Kadipiro", 
    price: 1150000, 
    lat: "35%", lng: "42%", 
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=400",
    type: "Kost Campur",
    address: "Banjarsari, Surakarta"
  },
  { 
    id: 2, 
    name: "Kost Putri Melati", 
    price: 850000, 
    lat: "55%", lng: "58%", 
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=400",
    type: "Kost Putri",
    address: "Jebres, Surakarta"
  },
  { 
    id: 3, 
    name: "Mansion Jebres Smart Room", 
    price: 1600000, 
    lat: "25%", lng: "65%", 
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=400",
    type: "Kost Putra",
    address: "Jebres, Surakarta"
  },
  { 
    id: 4, 
    name: "Omah Solo Homestay", 
    price: 2100000, 
    lat: "45%", lng: "25%", 
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=400",
    type: "Kost Campur",
    address: "Laweyan, Surakarta"
  },
];

export default function MapPage() {
  const navigate = useNavigate();
  
  // States
  const [selectedKost, setSelectedKost] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [maxPrice, setMaxPrice] = useState(2500000);
  const [searchQuery, setSearchQuery] = useState("");

  // Logic: Format Harga (1.150.000 -> 1.1jt)
  const formatPriceLabel = (price) => {
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)}jt`;
    return `${price / 1000}rb`;
  };

  // Logic: Filter Data berdasarkan Harga
  const filteredKos = SOLO_KOST_DATA.filter(kost => kost.price <= maxPrice);

  return (
    <div className="h-screen w-full flex flex-col bg-[#F1F5F9] overflow-hidden relative font-sans">
      
      {/* --- 1. SEARCH & FILTER BAR --- */}
      <div className="absolute top-6 left-0 right-0 z-50 px-6 flex flex-col gap-3 pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari kost di Solo..." 
              className="w-full h-12 pl-12 pr-4 bg-white shadow-2xl rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all ${
              showFilter ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600'
            }`}
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>

        {/* --- 2. PRICE FILTER PANEL (MODAL) --- */}
        {showFilter && (
          <div className="bg-white rounded-[2rem] p-6 shadow-2xl border border-slate-100 pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight">Budget Maksimal</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Harga per bulan</p>
              </div>
              <span className="text-indigo-600 font-black text-lg">Rp {(maxPrice/1000000).toFixed(1)}jt</span>
            </div>
            
            <input 
              type="range" min="500000" max="3000000" step="100000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-6"
            />
            
            <div className="grid grid-cols-3 gap-2">
              {[1000000, 1500000, 2000000].map((p) => (
                <button 
                  key={p} onClick={() => setMaxPrice(p)}
                  className={`py-2 rounded-xl text-[10px] font-black transition-all border ${
                    maxPrice === p ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-transparent text-slate-400'
                  }`}
                >
                  {p >= 1000000 ? `${p/1000000}jt` : `${p/1000}rb`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- 3. INTERACTIVE MAP AREA --- */}
      <div className="flex-1 relative bg-[#E2E8F0] overflow-hidden" onClick={() => {setSelectedKost(null); setShowFilter(false);}}>
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-20" style={{ 
          backgroundImage: 'radial-gradient(#4F46E5 1.2px, transparent 1.2px)', 
          backgroundSize: '30px 30px' 
        }}></div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
          <h2 className="text-[15vw] font-black text-indigo-900 tracking-[0.2em] select-none">SOLO</h2>
        </div>
        
        {/* Render Price Labels */}
        {filteredKos.map((kost) => (
          <div
            key={kost.id}
            className="absolute transition-all transform hover:scale-110 active:scale-95"
            style={{ top: kost.lat, left: kost.lng }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedKost(kost); }}
              className="flex flex-col items-center group"
            >
              <div className={`px-3 py-1.5 rounded-2xl shadow-2xl border-2 transition-all duration-300 ${
                selectedKost?.id === kost.id 
                ? 'bg-indigo-600 border-white text-white scale-125 z-50' 
                : 'bg-white border-indigo-50 text-slate-900 z-10'
              }`}>
                <span className="text-[12px] font-black tracking-tight">
                  Rp {formatPriceLabel(kost.price)}
                </span>
              </div>
              <div className={`w-2.5 h-2.5 rotate-45 -mt-1.5 shadow-xl transition-colors ${
                selectedKost?.id === kost.id ? 'bg-indigo-600' : 'bg-white border-b border-r border-indigo-50'
              }`}></div>
            </button>
          </div>
        ))}

        {/* Empty State if no match */}
        {filteredKos.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <p className="bg-white/80 backdrop-blur px-6 py-3 rounded-full text-xs font-black text-slate-400 uppercase tracking-widest shadow-xl">Budget tidak cocok</p>
          </div>
        )}
      </div>

      {/* --- 4. PREVIEW CARD (Pop up) --- */}
      {selectedKost && (
        <div className="absolute bottom-28 left-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out">
          <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 flex h-36 relative">
            <button 
              onClick={() => setSelectedKost(null)}
              className="absolute top-3 right-3 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 z-10"
            >
              <X size={16} />
            </button>
            
            <img src={selectedKost.image} className="w-32 h-full object-cover" alt="thumb" />
            
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest leading-none bg-indigo-50 px-2 py-1 rounded-full">{selectedKost.type}</span>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    <Star size={12} fill="currentColor" />
                    <span className="text-[11px] font-black text-slate-800">{selectedKost.rating}</span>
                  </div>
                </div>
                <h3 className="text-sm font-black text-slate-900 truncate leading-tight">{selectedKost.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase mt-1">
                  <MapPin size={10} className="text-rose-500" /> {selectedKost.address}
                </p>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-base font-black text-indigo-600">Rp {selectedKost.price.toLocaleString('id-ID')}</span>
                <button 
                  onClick={() => navigate(`/detail/${selectedKost.id}`)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black hover:bg-slate-900 transition-all active:scale-95"
                >
                  DETAIL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 5. MY LOCATION BUTTON --- */}
      <button className="absolute bottom-28 right-6 z-40 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-indigo-600 border border-slate-100 active:scale-90 transition-all">
        <Navigation2 size={22} fill="currentColor" />
      </button>

      {/* --- 6. BOTTOM NAVIGATION --- */}
      <BottomNav />

    </div>
  );
}