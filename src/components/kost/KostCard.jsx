import { useState, useEffect, useMemo } from "react";
import { Heart, MapPin, Crown, ImageOff } from "lucide-react";
import { resolveMediaUrl } from "../../config/apiBase";

function buildImageCandidates(rawUrl) {
  const proxied = resolveMediaUrl(rawUrl);
  return proxied ? [proxied] : [];
}

export default function KostCard({ item, onClick, onLike, isLiked }) {
  const candidates = useMemo(
    () => buildImageCandidates(item.image ?? item.thumbnailUrl),
    [item.image, item.thumbnailUrl]
  );

  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  const imgSrc = !failed && candidates.length > 0 ? candidates[attempt] : null;

  useEffect(() => {
    setAttempt(0);
    setFailed(false);
  }, [item.id, candidates.join("|")]);

  const handleImageError = () => {
    if (attempt < candidates.length - 1) {
      setAttempt((n) => n + 1);
      return;
    }
    setFailed(true);
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    onLike();
  };

  return (
    <div
      onClick={() => onClick(item)}
      className="w-full bg-white rounded-xl overflow-hidden border border-slate-100 
                 shadow-sm cursor-pointer group 
                 hover:shadow-md transition-all active:scale-[0.98]"
    >
      <div className="relative h-36 overflow-hidden bg-slate-100">
        {imgSrc ? (
          <img
            key={`${item.id}-${attempt}-${imgSrc}`}
            src={encodeURI(imgSrc)}
            alt={item.name}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-400 bg-slate-100">
            <ImageOff size={22} strokeWidth={1.5} />
            <span className="text-[9px] font-medium">Foto tidak tersedia</span>
          </div>
        )}

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

        {item.isPremium && (
          <span className="absolute top-1.5 left-1.5 flex items-center gap-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm">
            <Crown size={9} strokeWidth={2.5} />
            Premium
          </span>
        )}

        {item.gender && (
          <span
            className={`absolute bottom-1.5 left-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full ${
              item.gender === "putra"
                ? "bg-blue-500 text-white"
                : item.gender === "putri"
                  ? "bg-pink-500 text-white"
                  : "bg-green-500 text-white"
            }`}
          >
            {item.gender.charAt(0).toUpperCase() + item.gender.slice(1)}
          </span>
        )}
      </div>

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
          <span className="text-[9px] text-slate-400 font-medium ml-0.5">/bln</span>
        </p>
      </div>
    </div>
  );
}
