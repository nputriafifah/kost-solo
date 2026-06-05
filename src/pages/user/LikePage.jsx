import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, AlertCircle, RefreshCw } from "lucide-react";
import KostCard from "../../components/kost/KostCard";
import UserNavbar, { USER_NAVBAR_CSS } from "../../components/user/UserNavbar";
import UserBottomNav, { USER_BOTTOM_NAV_CSS } from "../../components/user/UserBottomNav";
import { getApiBase, resolveMediaUrl } from "../../config/apiBase";
import { formatPublicLocation } from "../../utils/publicLocation";

const API = getApiBase();
const getToken = () =>
  localStorage.getItem("token") || localStorage.getItem("accessToken") || "";

function authHeaders(token) {
  const h = { "Content-Type": "application/json" };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}
const getLocalFavorites = () => {
  try { return JSON.parse(localStorage.getItem("atap_favorites") || "[]"); }
  catch { return []; }
};
const setLocalFavorites = (arr) => {
  localStorage.setItem("atap_favorites", JSON.stringify(arr));
};
const getFavoriteListingId = (fav) =>
  String(fav?.listingId ?? fav?.listing?.id ?? fav?.id ?? "");

function getListingStatus(item) {
  if (!item) return "";
  return String(item.status ?? item.listing?.status ?? "").toUpperCase();
}

/** Hanya kost aktif yang boleh tampil di My List (publik). */
function isPublicActiveListing(item) {
  const status = getListingStatus(item);
  if (!status) return true;
  return status === "ACTIVE";
}

function toCardItem(item) {
  if (!item || !isPublicActiveListing(item)) return null;
  const roomTypes = Array.isArray(item.roomTypes) ? item.roomTypes : [];
  const cheapestFromRooms = roomTypes.length
    ? Math.min(...roomTypes.map((r) => Number(r?.price) || Infinity))
    : null;
  const cheapestPrice = Number.isFinite(cheapestFromRooms)
    ? cheapestFromRooms
    : (item.cheapestPrice ?? item.price ?? null);
  const thumb =
    item.thumbnailUrl ??
    item.image ??
    roomTypes?.[0]?.photos?.[0]?.url ??
    roomTypes?.[0]?.photos?.[0] ??
    null;
  return {
    id: String(item.id ?? item.listingId ?? ""),
    name: item.name ?? "Kost",
    price: cheapestPrice,
    location: formatPublicLocation(item.address ?? item.location ?? ""),
    gender: (item.genderType ?? item.gender ?? "").toLowerCase(),
    isPremium: Boolean(item.isPremium),
    image: resolveMediaUrl(thumb),
  };
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;700&display=swap');
  * { box-sizing: border-box; }

  :root {
    --bg-primary: #F8FAFC;
    --bg-secondary: #FFFFFF;
    --text-primary: #0F172A;
    --text-secondary: #64748B;
    --border-color: #E2E8F0;
  }

  body { margin: 0; background: var(--bg-primary); }

  .fav-root { min-height: 100vh; background: var(--bg-primary); color: var(--text-primary); }

  .fav-content { max-width: 900px; margin: 0 auto; padding: 28px 28px 40px; }
  .fav-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
  .fav-skeleton { height: 180px; border-radius: 18px; background: var(--bg-secondary); border: 1px solid var(--border-color); }

  @media (max-width: 900px) { .fav-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 640px) {
    .fav-content { padding: 20px 16px 32px; }
    .fav-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  }
`;

export default function LikePage() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = getToken();

  const pruneStaleFavorites = async (staleIds) => {
    const removed = [...new Set(staleIds.map(String).filter(Boolean))];
    if (!removed.length) return;
    setLocalFavorites(getLocalFavorites().filter((id) => !removed.includes(String(id))));
    if (!token) return;
    await Promise.allSettled(
      removed.map((id) =>
        fetch(`${API}/favorites/${id}`, { method: "DELETE", headers: authHeaders(token) })
      )
    );
  };

  const resolveFavoriteCards = async (ids) => {
    const uniqueIds = [...new Set(ids.map(String).filter(Boolean))];
    if (!uniqueIds.length) return { cards: [], staleIds: [] };

    const results = await Promise.allSettled(
      uniqueIds.map(async (favId) => {
        const detailRes = await fetch(`${API}/listings/${favId}`);
        if (!detailRes.ok) return { id: favId, card: null };
        const detailJson = await detailRes.json().catch(() => ({}));
        const listing = detailJson?.data ?? detailJson;
        const card = toCardItem(listing);
        return { id: favId, card };
      })
    );

    const cards = [];
    const staleIds = [];
    for (const result of results) {
      if (result.status !== "fulfilled") continue;
      const { id, card } = result.value;
      if (card) cards.push(card);
      else staleIds.push(String(id));
    }
    return { cards, staleIds };
  };

  const fetchFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      let favoriteIds = [];

      if (token) {
        const res = await fetch(`${API}/favorites`, { headers: authHeaders(token) });
        if (res.status === 401 || res.status === 403) {
          favoriteIds = getLocalFavorites().map(String).filter(Boolean);
        } else if (!res.ok) {
          throw new Error("Gagal fetch favorites");
        } else {
          const json = await res.json();
          const raw = Array.isArray(json.data)
            ? json.data
            : Array.isArray(json.favorites)
              ? json.favorites
              : Array.isArray(json)
                ? json
                : [];
          favoriteIds = raw.map(getFavoriteListingId).filter(Boolean);
        }
      } else {
        favoriteIds = getLocalFavorites().map(String).filter(Boolean);
      }

      if (!favoriteIds.length) {
        setData([]);
        setLocalFavorites([]);
        return;
      }

      const { cards, staleIds } = await resolveFavoriteCards(favoriteIds);
      await pruneStaleFavorites(staleIds);
      setLocalFavorites(cards.map((x) => String(x.id)));
      setData(cards);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat favorit");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFavorites(); }, []);

  const handleRemove = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API}/favorites/${id}`, { method: "DELETE", headers: authHeaders(token) });
      if (res.status === 401 || res.status === 403) {
        const local = getLocalFavorites().filter((x) => String(x) !== String(id));
        setLocalFavorites(local);
        setData((prev) => prev.filter((item) => item.id !== String(id)));
        setError("Tidak bisa menghapus favorit di akun ini.");
        return;
      }
      if (!res.ok) throw new Error("Gagal hapus favorit");
      setLocalFavorites(getLocalFavorites().filter((x) => String(x) !== String(id)));
      setData((prev) => prev.filter((item) => item.id !== String(id)));
    } catch (err) { console.error(err); }
  };

  return (
    <>
      <style>{USER_NAVBAR_CSS}</style>
      <style>{USER_BOTTOM_NAV_CSS}</style>
      <style>{css}</style>
      <div className="fav-root user-page-shell">
        <UserNavbar activePath="/like" />

        <div className="fav-content">
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[...Array(4)].map((_, i) => <div key={i} className="fav-skeleton" />)}
            </div>
          )}

          {error && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "64px 0", gap: 12, textAlign: "center" }}>
              <AlertCircle size={26} color="#F87171" />
              <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>{error}</p>
              <button
                type="button"
                onClick={fetchFavorites}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "#2563EB", color: "white", border: "none", padding: "10px 18px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
              >
                <RefreshCw size={14} /> Coba lagi
              </button>
            </div>
          )}

          {!loading && !error && data.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: 64, gap: 12, textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: "#FFF1F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Heart size={28} color="#FDA4AF" />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Belum ada favorit</p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>Simpan kost yang kamu suka dari halaman pencarian</p>
              <button
                type="button"
                onClick={() => navigate("/search")}
                style={{ marginTop: 4, background: "#0F172A", color: "white", border: "none", padding: "10px 24px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
              >
                Cari kost
              </button>
            </div>
          )}

          {!loading && !error && data.length > 0 && (
            <div className="fav-grid">
              {data.map((item) => (
                <KostCard
                  key={item.id}
                  item={item}
                  isLiked={true}
                  onLike={(e) => handleRemove(item.id, e)}
                  onClick={() => navigate(`/detail/${item.id}`)}
                />
              ))}
            </div>
          )}
        </div>

        <UserBottomNav />
      </div>
    </>
  );
}
