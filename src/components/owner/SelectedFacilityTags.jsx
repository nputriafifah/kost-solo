import { X } from "lucide-react";

/**
 * Chip daftar fasilitas terpilih (standar + custom) dengan tombol hapus.
 */
export default function SelectedFacilityTags({
  items = [],
  onRemove,
  label = "Fasilitas terpilih",
  variant = "create",
}) {
  if (!items.length) return null;

  const chipStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    background: "#eff6ff",
    border: "1.5px solid #bfdbfe",
    borderRadius: 10,
    color: "#1d4ed8",
    fontSize: variant === "edit" ? 12 : 13,
    fontWeight: 600,
    fontFamily: variant === "edit" ? "'DM Sans', sans-serif" : undefined,
  };

  return (
    <div style={{ marginTop: 16 }}>
      <p
        style={{
          fontSize: 12,
          color: "#64748b",
          fontWeight: 600,
          marginBottom: 10,
          fontFamily: variant === "edit" ? "'DM Sans', sans-serif" : undefined,
        }}
      >
        {label} ({items.length})
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {items.map((fac) => (
          <div key={fac} style={chipStyle}>
            <span>{fac}</span>
            <button
              type="button"
              onClick={() => onRemove(fac)}
              aria-label={`Hapus ${fac}`}
              style={{
                background: "none",
                border: "none",
                color: "#1d4ed8",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
