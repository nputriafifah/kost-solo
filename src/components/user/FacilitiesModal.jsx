import { useEffect } from "react";
import { X } from "lucide-react";
import { groupFacilities } from "../../utils/facilityCategories";
import { getFacilityStyle } from "../../utils/facilityIcons";

export default function FacilitiesModal({
  open,
  onClose,
  title = "Semua Fasilitas",
  subtitle,
  facilities = [],
  variant = "gedung",
}) {
  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const groups = groupFacilities(facilities, variant);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99998,
        background: "rgba(0,0,0,.55)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        fontFamily: "var(--ff)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          maxHeight: "85vh",
          background: "var(--surface)",
          borderRadius: "28px 28px 0 0",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "slideUp .3s cubic-bezier(.22,1,.36,1)",
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 99, background: "var(--border-strong)", margin: "12px auto 0" }} />

        <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  fontFamily: "var(--ff)",
                }}
              >
                {title}
              </h2>
              {subtitle && (
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--ff)" }}>
                  {subtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "1px solid var(--border)",
                background: "var(--surface-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <X size={16} color="var(--text-muted)" />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 28px" }}>
          {groups.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "24px 0", fontFamily: "var(--ff)" }}>
              Belum ada fasilitas
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.label} style={{ marginBottom: 20 }}>
                <p
                  style={{
                    margin: "0 0 10px",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 0.4,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    fontFamily: "var(--ff)",
                  }}
                >
                  {group.label}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {group.items.map((name) => {
                    const { Icon, color, bg } = getFacilityStyle(name);
                    return (
                      <div key={name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 9,
                            background: bg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Icon size={16} style={{ color }} />
                        </div>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--ff)" }}>
                          {name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
