import { ChevronRight } from "lucide-react";
import { getFacilityStyle } from "../../utils/facilityIcons";

function FacilityChip({ name }) {
  const { Icon, color, bg } = getFacilityStyle(name);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 11px",
        borderRadius: "var(--radius-sm, 10px)",
        background: bg,
        border: `1px solid ${color}20`,
        fontSize: 12,
        fontWeight: 600,
        color: "var(--text-primary)",
        lineHeight: 1.2,
        fontFamily: "var(--ff)",
      }}
    >
      <span
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: `${color}18`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={14} style={{ color }} />
      </span>
      {name}
    </span>
  );
}

export default function FacilityChipList({
  facilities = [],
  maxVisible = 8,
  showAllLabel = "Lihat semua fasilitas",
  onShowAll,
}) {
  if (!facilities.length) return null;

  const visible = facilities.slice(0, maxVisible);
  const hasMore = facilities.length > maxVisible;

  return (
    <div style={{ fontFamily: "var(--ff)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {visible.map((f) => (
          <FacilityChip key={f} name={f} />
        ))}
        {hasMore && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "9px 11px",
              borderRadius: "var(--radius-sm, 10px)",
              background: "var(--surface-2)",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text-muted)",
              fontFamily: "var(--ff)",
            }}
          >
            +{facilities.length - maxVisible} lainnya
          </span>
        )}
      </div>
      {onShowAll && (
        <button
          type="button"
          onClick={onShowAll}
          style={{
            width: "100%",
            marginTop: 14,
            padding: "12px 16px",
            borderRadius: "var(--radius-lg, 12px)",
            border: "1px solid #bfdbfe",
            background: "var(--brand-light, #eff6ff)",
            color: "var(--brand)",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "var(--ff)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          {showAllLabel}
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}
