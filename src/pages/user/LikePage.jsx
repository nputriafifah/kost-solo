import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, AlertCircle, RefreshCw, MessageCircle } from "lucide-react";
import KostCard from "../../components/kost/KostCard";
import UserNavbar, { USER_NAVBAR_CSS } from "../../components/user/UserNavbar";
import UserBottomNav, { USER_BOTTOM_NAV_CSS } from "../../components/user/UserBottomNav";
import { getApiBase, resolveMediaUrl, postPublicJson } from "../../config/apiBase";
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

/** Kartu "Kos Diminati" dari API (shape: { leadId, id, name, status, address, genderType, thumbnailUrl, cheapestPrice }) */
function toMinatCard(card) {
  if (!card) return null;
  const status = String(card.status ?? "").toUpperCase();
  if (status && status !== "ACTIVE") return null;
  return {
    id: String(card.id ?? ""),
    name: card.name ?? "Kost",
    price: card.cheapestPrice ?? null,
    location: formatPublicLocation(card.address ?? ""),
    gender: (card.genderType ?? "").toLowerCase(),
    image: resolveMediaUrl(card.thumbnailUrl),
  };
}

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
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..900;1,9..144,400..900&family=Outfit:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; }

  :root {
    --bg-primary: #F5F3FF;
    --bg-secondary: #FFFFFF;
    --text-primary: #1E1B4B;
    --text-secondary: #64748B;
    --border-color: #E0E7FF;
  }

  body { margin: 0; background: var(--bg-primary); }

  .fav-root { min-height: 100vh; background: var(--bg-primary); color: var(--text-primary); }

  .fav-content { max-width: 900px; margin: 0 auto; padding: 28px 28px 40px; }
  .fav-tabs { display: inline-flex; gap: 4px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 4px; margin-bottom: 22px; }
  .fav-tab { display: inline-flex; align-items: center; gap: 7px; border: none; background: none; cursor: pointer; font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 700; color: var(--text-secondary); padding: 8px 16px; border-radius: 9px; transition: background .15s, color .15s; }
  .fav-tab.active { background: #4F46E5; color: #fff; }
  .fav-tab-badge { font-size: 11px; font-weight: 800; padding: 1px 7px; border-radius: 999px; background: rgba(255,255,255,.25); }
  .fav-tab:not(.active) .fav-tab-badge { background: var(--bg-primary); color: var(--text-secondary); }
  .fav-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
  .fav-skeleton { height: 180px; border-radius: 18px; background: var(--bg-secondary); border: 1px solid var(--border-color); }

  .minat-auth-card { max-width: 420px; margin: 32px auto 0; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 20px; padding: 28px 24px; text-align: center; box-shadow: 0 8px 32px rgba(79,70,229,.06); }
  .minat-auth-icon { width: 56px; height: 56px; border-radius: 16px; background: #EEF2FF; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
  .minat-auth-title { font-family: 'Fraunces', Georgia, serif; font-size: 19px; font-weight: 700; color: var(--text-primary); margin: 0 0 8px; }
  .minat-auth-sub { font-size: 13px; color: var(--text-secondary); line-height: 1.55; margin: 0 0 20px; }
  .minat-auth-form { display: flex; flex-direction: column; gap: 10px; text-align: left; }
  .minat-input { width: 100%; height: 46px; padding: 0 14px; border-radius: 12px; border: 1px solid var(--border-color); background: var(--bg-primary); font-family: 'Outfit', sans-serif; font-size: 14px; color: var(--text-primary); outline: none; transition: border-color .15s, box-shadow .15s; }
  .minat-input:focus { border-color: #C7D2FE; box-shadow: 0 0 0 3px rgba(79,70,229,.12); }
  .minat-submit { width: 100%; height: 46px; border: none; border-radius: 12px; background: #4F46E5; color: #fff; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; transition: opacity .15s; }
  .minat-submit:disabled { opacity: .6; cursor: default; }
  .minat-link { background: none; border: none; color: #4F46E5; font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 700; cursor: pointer; padding: 4px; align-self: center; }
  .minat-info { font-size: 12px; color: #3730A3; background: #EEF2FF; border: 1px solid #E0E7FF; border-radius: 10px; padding: 9px 12px; margin: 0; line-height: 1.5; }
  .minat-err { font-size: 12px; color: #B91C1C; margin: 0; }

  @media (max-width: 900px) { .fav-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 640px) {
    .fav-content { padding: 20px 16px 32px; }
    .fav-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  }
`;

export default function LikePage() {
  const navigate = useNavigate();

  const isLoggedIn = Boolean(getToken());
  const [tab, setTab] = useState(isLoggedIn ? "favorit" : "minat"); // favorit | minat

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [minatData, setMinatData] = useState([]);
  const [minatLoading, setMinatLoading] = useState(isLoggedIn);
  const [minatError, setMinatError] = useState(null);

  // Alur lookup OTP untuk guest (belum login): phone -> otp -> daftar minat
  const [otpStep, setOtpStep] = useState("phone"); // phone | otp | done
  const [otpPhone, setOtpPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpInfo, setOtpInfo] = useState("");

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

  // Daftar minat untuk user yang LOGIN — langsung dari server (GET /leads/me)
  const fetchMinatMine = async () => {
    setMinatLoading(true);
    setMinatError(null);
    try {
      const res = await fetch(`${API}/leads/me`, { headers: authHeaders(token) });
      if (!res.ok) throw new Error("Gagal memuat daftar minat");
      const json = await res.json();
      const raw = Array.isArray(json.data) ? json.data : [];
      setMinatData(raw.map(toMinatCard).filter(Boolean));
      setOtpStep("done");
    } catch (err) {
      console.error(err);
      setMinatError("Gagal memuat daftar minat");
    } finally {
      setMinatLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchFavorites();
      fetchMinatMine();
    }
  }, []);

  // Guest: minta OTP ke nomor WhatsApp
  const handleRequestOtp = async (e) => {
    e?.preventDefault?.();
    const phone = otpPhone.trim();
    if (phone.replace(/\D/g, "").length < 8) {
      setMinatError("Masukkan nomor WhatsApp yang valid.");
      return;
    }
    setOtpBusy(true);
    setMinatError(null);
    setOtpInfo("");
    try {
      const json = await postPublicJson("/leads/lookup/request-otp", { phone });
      setOtpStep("otp");
      setOtpInfo(json.message || "OTP telah dikirim via WhatsApp.");
    } catch (err) {
      setMinatError(err.message || "Gagal mengirim OTP.");
    } finally {
      setOtpBusy(false);
    }
  };

  // Guest: verifikasi OTP lalu ambil daftar minat
  const handleVerifyOtp = async (e) => {
    e?.preventDefault?.();
    const otp = otpCode.trim();
    if (otp.length < 4) {
      setMinatError("Masukkan kode OTP.");
      return;
    }
    setOtpBusy(true);
    setMinatError(null);
    try {
      const json = await postPublicJson("/leads/lookup", { phone: otpPhone.trim(), otp });
      const raw = Array.isArray(json.data) ? json.data : [];
      setMinatData(raw.map(toMinatCard).filter(Boolean));
      setOtpStep("done");
    } catch (err) {
      setMinatError(err.message || "OTP salah atau kedaluwarsa.");
    } finally {
      setOtpBusy(false);
    }
  };

  const resetOtpFlow = () => {
    setOtpStep("phone");
    setOtpCode("");
    setOtpInfo("");
    setMinatData([]);
    setMinatError(null);
  };

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
          <div className="fav-tabs">
            {isLoggedIn && (
              <button type="button" className={`fav-tab${tab === "favorit" ? " active" : ""}`} onClick={() => setTab("favorit")}>
                <Heart size={14} /> Favorit
                {data.length > 0 && <span className="fav-tab-badge">{data.length}</span>}
              </button>
            )}
            <button type="button" className={`fav-tab${tab === "minat" ? " active" : ""}`} onClick={() => setTab("minat")}>
              <MessageCircle size={14} /> Diminati
              {minatData.length > 0 && <span className="fav-tab-badge">{minatData.length}</span>}
            </button>
          </div>

          {tab === "favorit" && loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[...Array(4)].map((_, i) => <div key={i} className="fav-skeleton" />)}
            </div>
          )}

          {tab === "favorit" && error && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "64px 0", gap: 12, textAlign: "center" }}>
              <AlertCircle size={26} color="#F87171" />
              <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>{error}</p>
              <button
                type="button"
                onClick={fetchFavorites}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "#4F46E5", color: "white", border: "none", padding: "10px 18px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
              >
                <RefreshCw size={14} /> Coba lagi
              </button>
            </div>
          )}

          {tab === "favorit" && !loading && !error && data.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: 64, gap: 12, textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: "#FFF1F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Heart size={28} color="#FDA4AF" />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Belum ada favorit</p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>Simpan kost yang kamu suka dari halaman pencarian</p>
              <button
                type="button"
                onClick={() => navigate("/search")}
                style={{ marginTop: 4, background: "#1E1B4B", color: "white", border: "none", padding: "10px 24px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
              >
                Cari kost
              </button>
            </div>
          )}

          {tab === "favorit" && !loading && !error && data.length > 0 && (
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

          {/* ── DIMINATI: GUEST (belum login) — verifikasi OTP nomor WhatsApp ── */}
          {tab === "minat" && !isLoggedIn && otpStep !== "done" && (
            <div className="minat-auth-card">
              <div className="minat-auth-icon"><MessageCircle size={26} color="#4F46E5" /></div>
              <h3 className="minat-auth-title">Lihat kost yang kamu minati</h3>
              <p className="minat-auth-sub">
                Daftar minat tersimpan di server berdasarkan nomor WhatsApp yang kamu pakai saat klik
                "Saya Minat". Verifikasi nomormu untuk melihatnya.
              </p>

              {otpStep === "phone" && (
                <form onSubmit={handleRequestOtp} className="minat-auth-form">
                  <input
                    type="tel"
                    inputMode="tel"
                    placeholder="Nomor WhatsApp (mis. 0812xxxx)"
                    value={otpPhone}
                    onChange={(e) => setOtpPhone(e.target.value)}
                    className="minat-input"
                  />
                  {minatError && <p className="minat-err">{minatError}</p>}
                  <button type="submit" className="minat-submit" disabled={otpBusy}>
                    {otpBusy ? "Mengirim..." : "Kirim Kode OTP"}
                  </button>
                </form>
              )}

              {otpStep === "otp" && (
                <form onSubmit={handleVerifyOtp} className="minat-auth-form">
                  {otpInfo && <p className="minat-info">{otpInfo}</p>}
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Masukkan kode OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="minat-input"
                  />
                  {minatError && <p className="minat-err">{minatError}</p>}
                  <button type="submit" className="minat-submit" disabled={otpBusy}>
                    {otpBusy ? "Memverifikasi..." : "Lihat Kost Diminati"}
                  </button>
                  <button type="button" className="minat-link" onClick={resetOtpFlow}>
                    Ganti nomor
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ── DIMINATI: USER LOGIN — loading / error ── */}
          {tab === "minat" && isLoggedIn && minatLoading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[...Array(4)].map((_, i) => <div key={i} className="fav-skeleton" />)}
            </div>
          )}

          {tab === "minat" && isLoggedIn && !minatLoading && minatError && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "64px 0", gap: 12, textAlign: "center" }}>
              <AlertCircle size={26} color="#F87171" />
              <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>{minatError}</p>
              <button
                type="button"
                onClick={fetchMinatMine}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "#4F46E5", color: "white", border: "none", padding: "10px 18px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
              >
                <RefreshCw size={14} /> Coba lagi
              </button>
            </div>
          )}

          {/* ── DIMINATI: hasil (login selesai loading, atau guest sudah verifikasi) ── */}
          {tab === "minat" && otpStep === "done" && !minatLoading && !(isLoggedIn && minatError) && minatData.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: 64, gap: 12, textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MessageCircle size={28} color="#A5B4FC" />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Belum ada kost yang diminati</p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>Kost yang kamu kirim "Saya Minat" akan tercatat di sini</p>
              <button
                type="button"
                onClick={() => navigate("/search")}
                style={{ marginTop: 4, background: "#1E1B4B", color: "white", border: "none", padding: "10px 24px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
              >
                Cari kost
              </button>
            </div>
          )}

          {tab === "minat" && otpStep === "done" && !minatLoading && minatData.length > 0 && (
            <>
              {!isLoggedIn && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                  <button type="button" className="minat-link" onClick={resetOtpFlow}>
                    Cek nomor lain
                  </button>
                </div>
              )}
              <div className="fav-grid">
                {minatData.map((item) => (
                  <KostCard
                    key={item.id}
                    item={item}
                    hideLike
                    onClick={() => navigate(`/detail/${item.id}`)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <UserBottomNav />
      </div>
    </>
  );
}
