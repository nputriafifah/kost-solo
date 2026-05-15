import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API = "http://localhost:3000";
const getToken = () => localStorage.getItem("token") || "";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css');

  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --blue-50:#E6F1FB;--blue-100:#B5D4F4;--blue-200:#85B7EB;--blue-400:#378ADD;
    --blue-600:#185FA5;--blue-700:#0E4A84;--blue-800:#0C447C;--blue-900:#042C53;
    --ink:#0B1C35;--ink-2:#2C4A6A;--ink-3:#6B8BA4;
    --surface:#ffffff;--surface-2:#F4F8FD;--surface-3:#EBF3FC;
    --border:#D5E5F5;--border-2:#B5D4F4;
    --green:#0D9660;--green-bg:#E6F7F1;--green-border:#9FE1CB;
    --red:#C0392B;--red-bg:#FCEBEB;
    --r:14px;--r-sm:9px;--r-xs:6px;
  }

  .dl-root{font-family:'Plus Jakarta Sans',sans-serif;background:#EBF3FC;color:var(--ink);min-height:100vh}

  /* TOPBAR */
  .dl-topbar{background:var(--blue-900);padding:0 32px;height:56px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;border-bottom:1px solid rgba(255,255,255,0.07)}
  .dl-topbar-logo{font-size:16px;font-weight:800;color:#fff;letter-spacing:-0.02em;display:flex;align-items:center;gap:8px}
  .dl-topbar-logo i{color:var(--blue-200);font-size:18px}
  .dl-topbar-nav{display:flex;align-items:center;gap:6px}
  .dl-topbar-nav a{color:rgba(255,255,255,0.55);font-size:13px;font-weight:500;padding:6px 12px;border-radius:6px;text-decoration:none;transition:all .15s;cursor:pointer}
  .dl-topbar-nav a:hover{color:#fff;background:rgba(255,255,255,0.08)}
  .dl-topbar-nav a.active{color:#fff;background:rgba(255,255,255,0.12)}

  /* HERO */
  .dl-hero{background:linear-gradient(160deg,var(--blue-900) 0%,var(--blue-800) 50%,var(--blue-600) 100%);position:relative;overflow:hidden}
  .dl-hero-glow{position:absolute;top:-80px;right:-80px;width:400px;height:400px;background:radial-gradient(circle,rgba(55,138,221,0.35) 0%,transparent 70%);pointer-events:none}
  .dl-hero-glow2{position:absolute;bottom:-60px;left:10%;width:300px;height:300px;background:radial-gradient(circle,rgba(181,212,244,0.15) 0%,transparent 70%);pointer-events:none}
  .dl-hero-inner{max-width:1200px;margin:0 auto;padding:36px 32px 48px;position:relative;z-index:1}
  .dl-breadcrumb{display:flex;align-items:center;gap:6px;margin-bottom:20px}
  .dl-breadcrumb span{font-size:12px;color:rgba(255,255,255,0.45);font-weight:500}
  .dl-breadcrumb i{font-size:12px;color:rgba(255,255,255,0.25)}
  .dl-breadcrumb span.cur{color:rgba(255,255,255,0.85)}
  .dl-hero-badges{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
  .dl-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:600;letter-spacing:0.02em}
  .dl-badge-gender{background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);color:#fff}
  .dl-badge-active{background:var(--green-bg);border:1px solid var(--green-border);color:var(--green)}
  .dl-badge-dot{width:6px;height:6px;background:var(--green);border-radius:50%;animation:dlPulse 2s infinite}
  @keyframes dlPulse{0%,100%{opacity:1}50%{opacity:.4}}
  .dl-hero-title{font-size:clamp(24px,4vw,38px);font-weight:800;color:#fff;line-height:1.15;letter-spacing:-0.02em;margin-bottom:12px}
  .dl-hero-address{display:flex;align-items:flex-start;gap:8px;color:rgba(255,255,255,0.6);font-size:13.5px;line-height:1.6;margin-bottom:8px}
  .dl-hero-address i{margin-top:2px;flex-shrink:0;font-size:14px}
  .dl-hero-actions{display:flex;gap:8px;margin-top:18px;flex-wrap:wrap}
  .dl-btn-edit{display:inline-flex;align-items:center;gap:7px;background:#fff;color:var(--blue-800);border:none;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:13px;padding:10px 22px;border-radius:999px;cursor:pointer;transition:all .18s;box-shadow:0 4px 20px rgba(0,0,0,0.25)}
  .dl-btn-edit:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,0.3)}
  .dl-btn-delete{display:inline-flex;align-items:center;gap:7px;background:rgba(192,57,43,0.15);border:1px solid rgba(192,57,43,0.3);color:#ffb3ae;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-size:13px;padding:10px 18px;border-radius:999px;cursor:pointer;transition:all .18s}
  .dl-btn-delete:hover{background:rgba(192,57,43,0.25)}
  .dl-btn-back{display:inline-flex;align-items:center;gap:7px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;font-size:13px;padding:7px 14px;border-radius:999px;cursor:pointer;transition:all .18s;margin-bottom:16px}
  .dl-btn-back:hover{background:rgba(255,255,255,0.18)}

  /* LAYOUT */
  .dl-layout{max-width:1200px;margin:0 auto;padding:28px 32px 60px;display:grid;grid-template-columns:1fr 320px;gap:24px;align-items:start}

  /* CARDS */
  .dl-card{background:var(--surface);border-radius:var(--r);border:1px solid var(--border);overflow:hidden;margin-bottom:18px}
  .dl-card-hd{padding:14px 22px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;background:var(--surface-2)}
  .dl-card-hd-icon{width:34px;height:34px;border-radius:var(--r-sm);background:var(--blue-50);border:1px solid var(--border-2);display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .dl-card-hd-icon i{font-size:16px;color:var(--blue-600)}
  .dl-card-hd-title{font-size:12px;font-weight:700;color:var(--ink-2);letter-spacing:0.05em;text-transform:uppercase}
  .dl-card-bd{padding:20px 22px}

  /* CONTACT */
  .dl-contact-pill{display:inline-flex;align-items:center;gap:10px;background:var(--green-bg);border:1px solid var(--green-border);border-radius:999px;padding:10px 20px}
  .dl-contact-pill i{color:var(--green);font-size:16px}
  .dl-contact-pill span{font-size:14.5px;font-weight:700;color:#085041}

  /* DESC */
  .dl-desc{font-size:14px;color:var(--ink-2);line-height:1.8}

  /* RULES */
  .dl-rules-list{display:flex;flex-wrap:wrap;gap:8px}
  .dl-rule-chip{display:inline-flex;align-items:center;gap:5px;background:var(--surface-2);border:1px solid var(--border);color:var(--ink-2);border-radius:var(--r-xs);padding:6px 12px;font-size:12.5px;font-weight:500}
  .dl-rule-chip i{font-size:13px;color:var(--blue-400)}

  /* SECTION LABEL */
  .dl-section-lbl{display:flex;align-items:center;gap:10px;margin-bottom:16px;margin-top:4px}
  .dl-section-lbl-text{font-size:11.5px;font-weight:700;color:var(--ink-3);text-transform:uppercase;letter-spacing:0.08em;white-space:nowrap;display:flex;align-items:center;gap:6px}
  .dl-section-lbl-line{flex:1;height:1px;background:var(--border)}
  .dl-section-lbl-count{background:var(--blue-50);border:1px solid var(--border-2);color:var(--blue-700);font-size:11px;font-weight:700;padding:2px 9px;border-radius:999px}

  /* ROOM CARD */
  .dl-room{border:1.5px solid var(--border-2);border-radius:var(--r);overflow:hidden;margin-bottom:16px;background:var(--surface);transition:box-shadow .2s,transform .2s}
  .dl-room:hover{box-shadow:0 8px 32px rgba(12,68,124,0.12);transform:translateY(-2px)}
  .dl-room-hd{background:linear-gradient(135deg,var(--blue-900),var(--blue-700));padding:16px 20px;display:flex;align-items:center;justify-content:space-between;gap:10px}
  .dl-room-name{color:#fff;font-weight:700;font-size:15px;display:flex;align-items:center;gap:8px}
  .dl-room-name i{color:var(--blue-200);font-size:16px}
  .dl-room-price-wrap{text-align:right}
  .dl-room-price{color:#fff;font-size:20px;font-weight:800;line-height:1}
  .dl-room-price-unit{color:rgba(255,255,255,0.5);font-size:11px;margin-top:2px;font-weight:500}
  .dl-room-bd{padding:18px 20px}

  /* STATS GRID */
  .dl-stats-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--border);border-radius:var(--r-sm);overflow:hidden;margin-bottom:16px}
  .dl-stat-cell{background:var(--surface-2);padding:13px 16px}
  .dl-stat-label{font-size:10px;font-weight:700;color:var(--ink-3);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:3px}
  .dl-stat-value{font-size:18px;font-weight:800;color:var(--ink);line-height:1}
  .dl-stat-unit{font-size:11px;color:var(--ink-3);font-weight:500;margin-top:2px}

  /* FACILITIES */
  .dl-facilities{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
  .dl-facility-chip{display:inline-flex;align-items:center;gap:5px;background:var(--blue-50);border:1px solid var(--border-2);color:var(--blue-800);border-radius:var(--r-xs);padding:5px 10px;font-size:12px;font-weight:600}
  .dl-facility-chip i{font-size:12px}

  /* PHOTOS */
  .dl-photo-sec{margin-top:16px;padding-top:16px;border-top:1px solid var(--border)}
  .dl-photo-sec-title{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:var(--ink-3);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px}
  .dl-photo-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
  .dl-photo-item{aspect-ratio:1;border-radius:var(--r-sm);overflow:hidden;background:var(--surface-3);border:1px solid var(--border)}
  .dl-photo-item img{width:100%;height:100%;object-fit:cover;transition:transform .3s;display:block}
  .dl-photo-item:hover img{transform:scale(1.07)}

  /* SIDEBAR */
  .dl-sidebar-card{background:var(--surface);border-radius:var(--r);border:1px solid var(--border);padding:20px;margin-bottom:16px}
  .dl-sidebar-card h3{font-size:11.5px;font-weight:700;color:var(--ink-3);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px;display:flex;align-items:center;gap:6px}
  .dl-sidebar-card h3 i{font-size:14px;color:var(--blue-400)}
  .dl-quick-stat{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--border)}
  .dl-quick-stat:last-child{border-bottom:none;padding-bottom:0}
  .dl-qs-label{font-size:13px;color:var(--ink-3);font-weight:500}
  .dl-qs-val{font-size:13.5px;font-weight:700;color:var(--ink)}
  .dl-map-placeholder{background:linear-gradient(135deg,var(--blue-50),var(--surface-3));border-radius:var(--r-sm);height:140px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;border:1px solid var(--border);color:var(--ink-3);font-size:13px;margin-top:4px;cursor:pointer;transition:all .18s}
  .dl-map-placeholder:hover{border-color:var(--border-2);color:var(--blue-600)}
  .dl-map-placeholder i{font-size:28px;color:var(--blue-400)}

  /* EMPTY */
  .dl-empty{text-align:center;padding:36px 20px;color:var(--ink-3)}
  .dl-empty i{font-size:36px;color:var(--border-2);display:block;margin-bottom:10px}

  /* SKELETON */
  .dl-skeleton{background:linear-gradient(90deg,#dce8f5 25%,#eaf3fc 50%,#dce8f5 75%);background-size:200% 100%;animation:dlShimmer 1.4s infinite;border-radius:8px}
  @keyframes dlShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

  /* ANIMATIONS */
  @keyframes dlFadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  .dl-fu{animation:dlFadeUp .4s ease both}
  .dl-fu1{animation-delay:.05s}.dl-fu2{animation-delay:.1s}.dl-fu3{animation-delay:.15s}
  .dl-fu4{animation-delay:.2s}.dl-fu5{animation-delay:.25s}

  /* RESPONSIVE */
  @media(max-width:960px){
    .dl-topbar{padding:0 20px}
    .dl-topbar-nav{display:none}
    .dl-hero-inner{padding:24px 20px 36px}
    .dl-layout{grid-template-columns:1fr;padding:20px 16px 40px}
    .dl-photo-grid{grid-template-columns:repeat(3,1fr)}
  }
  @media(max-width:520px){
    .dl-hero-title{font-size:22px}
    .dl-stats-grid{grid-template-columns:repeat(2,1fr)}
    .dl-photo-grid{grid-template-columns:repeat(2,1fr)}
    .dl-card-bd{padding:16px}
    .dl-room-bd{padding:14px 16px}
    .dl-room-hd{padding:12px 16px}
    .dl-btn-edit,.dl-btn-delete{font-size:12px;padding:9px 14px}
  }
`;

const genderLabel = {
  PUTRA: "Putra",
  PUTRI: "Putri",
  CAMPUR: "Campur",
};

const genderIcon = {
  PUTRA: "ti-man",
  PUTRI: "ti-woman",
  CAMPUR: "ti-users",
};

function SkeletonLoader() {
  return (
    <>
      <style>{STYLES}</style>
      <div className="dl-root">
        {/* Topbar */}
        <nav className="dl-topbar">
          <div className="dl-topbar-logo">
            <i className="ti ti-building" aria-hidden="true" />
            KostManager
          </div>
        </nav>

        {/* Hero skeleton */}
        <div className="dl-hero" style={{ minHeight: 220 }}>
          <div className="dl-hero-inner">
            <div className="dl-skeleton" style={{ height: 12, width: 200, marginBottom: 20, borderRadius: 999 }} />
            <div className="dl-skeleton" style={{ height: 36, width: "60%", marginBottom: 12 }} />
            <div className="dl-skeleton" style={{ height: 14, width: "45%", borderRadius: 999 }} />
          </div>
        </div>

        {/* Body skeleton */}
        <div className="dl-layout">
          <div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="dl-card">
                <div className="dl-card-bd">
                  <div className="dl-skeleton" style={{ height: 14, width: "35%", marginBottom: 12 }} />
                  <div className="dl-skeleton" style={{ height: 12, width: "85%", marginBottom: 6 }} />
                  <div className="dl-skeleton" style={{ height: 12, width: "70%" }} />
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="dl-sidebar-card">
              <div className="dl-skeleton" style={{ height: 12, width: "50%", marginBottom: 14 }} />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="dl-skeleton" style={{ height: 12, width: "100%", marginBottom: 10 }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function DetailListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    try {
      const res = await fetch(`${API}/listings/owner/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const text = await res.text();
      let json;
      try { json = JSON.parse(text); } catch { json = { message: text }; }
      if (!res.ok) throw new Error(json.message || "Data tidak ditemukan");
      setData(json.data || json);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetail(); }, [id]);

  const handleDelete = async () => {
    if (!confirm("Yakin hapus kost ini? Tindakan ini tidak bisa dibatalkan.")) return;
    try {
      const res = await fetch(`${API}/listings/owner/${id}/deactivate`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const text = await res.text();
      let json;
      try { json = JSON.parse(text); } catch { json = { message: text }; }
      if (!res.ok) throw new Error(json.message || "Gagal menghapus");
      alert("Berhasil dihapus");
      navigate("/owner/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <SkeletonLoader />;

  if (!data) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="dl-root" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <i className="ti ti-home-off" style={{ fontSize: 48, color: "var(--border-2)", display: "block", marginBottom: 12 }} />
            <p style={{ color: "var(--ink-3)", fontSize: 15, marginBottom: 16 }}>Data tidak ditemukan.</p>
            <button className="dl-btn-back" style={{ color: "var(--ink)", background: "var(--surface)", border: "1px solid var(--border)" }} onClick={() => navigate("/owner/dashboard")}>
              <i className="ti ti-arrow-left" aria-hidden="true" /> Kembali
            </button>
          </div>
        </div>
      </>
    );
  }

  // Calculate summary stats
  const totalRooms = data.roomTypes?.reduce((sum, r) => sum + (r.availableCount || 0), 0) || 0;
  const minPrice = data.roomTypes?.length
    ? Math.min(...data.roomTypes.map((r) => r.price || 0))
    : 0;

  return (
    <>
      <style>{STYLES}</style>
      <div className="dl-root">

        {/* ── Topbar ── */}
        <nav className="dl-topbar">
          <div className="dl-topbar-logo">
            <i className="ti ti-building" aria-hidden="true" />
            KostManager
          </div>
          <div className="dl-topbar-nav">
            <a onClick={() => navigate("/owner/dashboard")}><i className="ti ti-dashboard" aria-hidden="true" /> Dashboard</a>
            <a className="active"><i className="ti ti-list" aria-hidden="true" /> Listing Saya</a>
          </div>
        </nav>

        {/* ── Hero ── */}
        <div className="dl-hero">
          <div className="dl-hero-glow" />
          <div className="dl-hero-glow2" />
          <div className="dl-hero-inner">

            {/* Breadcrumb */}
            <div className="dl-breadcrumb">
              <i className="ti ti-home" aria-hidden="true" />
              <span>Dashboard</span>
              <i className="ti ti-chevron-right" aria-hidden="true" />
              <span>Listing Saya</span>
              <i className="ti ti-chevron-right" aria-hidden="true" />
              <span className="cur">Detail Kost</span>
            </div>

            {/* Back button */}
            <button className="dl-btn-back" onClick={() => navigate("/owner/dashboard")}>
              <i className="ti ti-arrow-left" aria-hidden="true" /> Kembali
            </button>

            {/* Badges */}
            <div className="dl-hero-badges">
              <span className="dl-badge dl-badge-gender">
                <i className={`ti ${genderIcon[data.genderType] || "ti-users"}`} aria-hidden="true" />
                {genderLabel[data.genderType] || data.genderType}
              </span>
              <span className="dl-badge dl-badge-active">
                <span className="dl-badge-dot" />
                Aktif
              </span>
            </div>

            {/* Title */}
            <h1 className="dl-hero-title">{data.name}</h1>

            {/* Address */}
            <div className="dl-hero-address">
              <i className="ti ti-map-pin" aria-hidden="true" />
              <span>{data.address}</span>
            </div>

            {/* Actions */}
            <div className="dl-hero-actions">
              <button className="dl-btn-edit" onClick={() => navigate(`/owner/edit/${id}`)}>
                <i className="ti ti-edit" aria-hidden="true" /> Edit Kost
              </button>
              <button className="dl-btn-delete" onClick={handleDelete}>
                <i className="ti ti-trash" aria-hidden="true" /> Hapus
              </button>
            </div>

          </div>
        </div>

        {/* ── Layout ── */}
        <div className="dl-layout">

          {/* ── Main Column ── */}
          <div>

            {/* Kontak */}
            <div className="dl-card dl-fu dl-fu1">
              <div className="dl-card-hd">
                <div className="dl-card-hd-icon">
                  <i className="ti ti-phone" aria-hidden="true" />
                </div>
                <span className="dl-card-hd-title">Kontak Pemilik</span>
              </div>
              <div className="dl-card-bd">
                <div className="dl-contact-pill">
                  <i className="ti ti-phone-call" aria-hidden="true" />
                  <span>{data.contactNumber}</span>
                </div>
              </div>
            </div>

            {/* Deskripsi */}
            <div className="dl-card dl-fu dl-fu2">
              <div className="dl-card-hd">
                <div className="dl-card-hd-icon">
                  <i className="ti ti-file-text" aria-hidden="true" />
                </div>
                <span className="dl-card-hd-title">Deskripsi</span>
              </div>
              <div className="dl-card-bd">
                <p className="dl-desc">{data.description}</p>
              </div>
            </div>

            {/* Peraturan */}
            {data.rules?.length > 0 && (
              <div className="dl-card dl-fu dl-fu3">
                <div className="dl-card-hd">
                  <div className="dl-card-hd-icon">
                    <i className="ti ti-shield-check" aria-hidden="true" />
                  </div>
                  <span className="dl-card-hd-title">Peraturan Kost</span>
                </div>
                <div className="dl-card-bd">
                  <div className="dl-rules-list">
                    {data.rules.map((r, i) => (
                      <span key={i} className="dl-rule-chip">
                        <i className="ti ti-check" aria-hidden="true" />
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tipe Kamar */}
            <div className="dl-fu dl-fu4">
              <div className="dl-section-lbl">
                <span className="dl-section-lbl-text">
                  <i className="ti ti-bed" aria-hidden="true" />
                  Tipe Kamar
                </span>
                <div className="dl-section-lbl-line" />
                <span className="dl-section-lbl-count">{data.roomTypes?.length || 0} Tipe</span>
              </div>

              {data.roomTypes?.length > 0 ? (
                data.roomTypes.map((room) => (
                  <div key={room.id} className="dl-room">

                    {/* Room Header */}
                    <div className="dl-room-hd">
                      <div className="dl-room-name">
                        <i className="ti ti-bed" aria-hidden="true" />
                        {room.name}
                      </div>
                      <div className="dl-room-price-wrap">
                        <div className="dl-room-price">
                          Rp {room.price?.toLocaleString("id-ID")}
                        </div>
                        <div className="dl-room-price-unit">per bulan</div>
                      </div>
                    </div>

                    {/* Room Body */}
                    <div className="dl-room-bd">

                      {/* Stats */}
                      <div className="dl-stats-grid">
                        <div className="dl-stat-cell">
                          <div className="dl-stat-label">Ukuran</div>
                          <div className="dl-stat-value">{room.size}</div>
                          <div className="dl-stat-unit">meter</div>
                        </div>
                        <div className="dl-stat-cell">
                          <div className="dl-stat-label">Tersedia</div>
                          <div className="dl-stat-value" style={{ color: "var(--green)" }}>
                            {room.availableCount}
                          </div>
                          <div className="dl-stat-unit">kamar</div>
                        </div>
                      </div>

                      {/* Facilities */}
                      {room.facilities?.length > 0 && (
                        <div className="dl-facilities">
                          {room.facilities.map((f, i) => (
                            <span key={i} className="dl-facility-chip">
                              <i className="ti ti-check" aria-hidden="true" />
                              {f}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Photos */}
                      {room.photos?.length > 0 && (
                        <div className="dl-photo-sec">
                          <div className="dl-photo-sec-title">
                            <i className="ti ti-camera" aria-hidden="true" />
                            Foto ({room.photos.length})
                          </div>
                          <div className="dl-photo-grid">
                            {room.photos.map((p, i) => (
                              <div key={i} className="dl-photo-item">
                                <img src={p.url} alt={`foto-${i + 1}`} loading="lazy" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                ))
              ) : (
                <div className="dl-card">
                  <div className="dl-empty">
                    <i className="ti ti-bed-off" aria-hidden="true" />
                    Belum ada tipe kamar
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* ── Sidebar ── */}
          <div>

            {/* Ringkasan */}
            <div className="dl-sidebar-card dl-fu dl-fu1">
              <h3><i className="ti ti-chart-pie" aria-hidden="true" /> Ringkasan</h3>
              <div className="dl-quick-stat">
                <span className="dl-qs-label">Total Kamar Tersedia</span>
                <span className="dl-qs-val">{totalRooms} Kamar</span>
              </div>
              <div className="dl-quick-stat">
                <span className="dl-qs-label">Tipe Kamar</span>
                <span className="dl-qs-val">{data.roomTypes?.length || 0} Tipe</span>
              </div>
              <div className="dl-quick-stat">
                <span className="dl-qs-label">Harga Mulai</span>
                <span className="dl-qs-val" style={{ color: "var(--blue-600)" }}>
                  Rp {minPrice.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="dl-quick-stat">
                <span className="dl-qs-label">Jenis Kost</span>
                <span className="dl-qs-val">{genderLabel[data.genderType] || data.genderType}</span>
              </div>
              <div className="dl-quick-stat">
                <span className="dl-qs-label">Status</span>
                <span className="dl-qs-val" style={{ color: "var(--green)" }}>● Aktif</span>
              </div>
            </div>

            {/* Lokasi */}
            <div className="dl-sidebar-card dl-fu dl-fu2">
              <h3><i className="ti ti-map-pin" aria-hidden="true" /> Lokasi</h3>
              <p style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.6, marginBottom: 10 }}>
                {data.address}
              </p>
              <div
                className="dl-map-placeholder"
                onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(data.address)}`, "_blank")}
              >
                <i className="ti ti-map" aria-hidden="true" />
                <span>Lihat di Google Maps</span>
              </div>
            </div>

            {/* Kontak Quick */}
            <div className="dl-sidebar-card dl-fu dl-fu3">
              <h3><i className="ti ti-phone" aria-hidden="true" /> Kontak</h3>
              <div className="dl-quick-stat">
                <span className="dl-qs-label">Nomor HP</span>
                <span className="dl-qs-val">{data.contactNumber}</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}