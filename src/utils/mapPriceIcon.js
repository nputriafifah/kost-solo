import L from "leaflet";

/** Format angka untuk pin peta: 1000000 → 1.000.000 */
export function formatMapPrice(price) {
  const n = Math.round(Number(price));
  if (!Number.isFinite(n) || n <= 0) return "—";
  return n.toLocaleString("id-ID");
}

/** Pin harga di peta — putih default, hitam saat aktif (mirip Airbnb) */
export function createPriceIcon(price, active = false) {
  const label = `Rp ${formatMapPrice(price)}`;
  const width = Math.max(100, Math.min(168, label.length * 6.8 + 22));
  const height = 36;
  const anchorX = width / 2;
  const anchorY = height + 4;

  const bg = active ? "#222222" : "#ffffff";
  const color = active ? "#ffffff" : "#222222";
  const border = active ? "#222222" : "#DDDDDD";
  const shadow = active
    ? "0 4px 14px rgba(0,0,0,.35)"
    : "0 2px 8px rgba(0,0,0,.18)";
  const tip = active ? "#222222" : "#ffffff";
  const tipBorder = active ? "#222222" : "#DDDDDD";

  return L.divIcon({
    className: "",
    html: `
      <div style="
        position:relative;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        background:${bg};
        color:${color};
        padding:6px 10px;
        border-radius:22px;
        font-size:11px;
        font-weight:700;
        font-family:system-ui,-apple-system,'Segoe UI',sans-serif;
        white-space:nowrap;
        cursor:pointer;
        box-shadow:${shadow};
        border:1px solid ${border};
        line-height:1.2;
        user-select:none;
        letter-spacing:-0.2px;
        transition:transform .12s ease, background .12s ease;
        ${active ? "transform:scale(1.06);" : ""}
      ">
        ${label}
        <span style="
          position:absolute;
          bottom:-6px;
          left:50%;
          transform:translateX(-50%);
          width:0;height:0;
          border-left:5px solid transparent;
          border-right:5px solid transparent;
          border-top:6px solid ${tipBorder};
        "></span>
        <span style="
          position:absolute;
          bottom:-4px;
          left:50%;
          transform:translateX(-50%);
          width:0;height:0;
          border-left:4px solid transparent;
          border-right:4px solid transparent;
          border-top:5px solid ${tip};
        "></span>
      </div>
    `,
    iconSize: [width, height],
    iconAnchor: [anchorX, anchorY],
    popupAnchor: [0, -anchorY],
  });
}
