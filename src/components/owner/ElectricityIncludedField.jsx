import { Zap } from "lucide-react";

/**
 * Pilihan listrik termasuk/belum — disimpan sebagai string di facilities[] saat save.
 */
export default function ElectricityIncludedField({
  value = null,
  onChange,
  error,
  variant = "create",
}) {
  const options = [
    { val: true, label: "Listrik termasuk", desc: "Harga sudah termasuk listrik" },
    { val: false, label: "Listrik belum termasuk", desc: "Bayar listrik terpisah / token sendiri" },
  ];

  return (
    <div style={{ marginBottom: variant === "edit" ? 0 : undefined }}>
      <label
        className={variant === "edit" ? "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2" : "clp-label"}
        style={variant === "create" ? { display: "block" } : undefined}
      >
        Listrik
      </label>
      {variant === "create" && (
        <p className="clp-info-note" style={{ marginBottom: 12 }}>
          Penyewa perlu tahu apakah harga sewa sudah termasuk listrik.
        </p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {options.map((opt) => {
          const active = value === opt.val;
          return (
            <button
              key={String(opt.val)}
              type="button"
              onClick={() => onChange(opt.val)}
              className={variant === "create" ? `clp-toggle-row${active ? " active" : ""}` : undefined}
              style={
                variant === "edit"
                  ? {
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: active ? "1.5px solid #DDD6FE" : "1px solid #e2e8f0",
                      background: active ? "#F5F3FF" : "#fff",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                    }
                  : { width: "100%", textAlign: "left" }
              }
            >
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: active ? "#E0E7FF" : "#f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  color: active ? "#4F46E5" : "#64748b",
                }}
              >
                <Zap size={16} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 700,
                    color: active ? "#4F46E5" : "#1e1b4b",
                  }}
                >
                  {opt.label}
                </span>
                <span style={{ display: "block", fontSize: 11, color: "#64748b", marginTop: 2 }}>
                  {opt.desc}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {error && (
        <p className={variant === "edit" ? "clp-err" : "clp-error"} style={{ marginTop: 8 }}>
          {variant === "create" ? `⚠ ${error}` : error}
        </p>
      )}
    </div>
  );
}
