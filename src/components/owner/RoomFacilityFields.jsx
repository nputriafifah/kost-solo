import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { ROOM_FACILITY_OPTIONS } from "../../constants/listing";
import SelectedFacilityTags from "./SelectedFacilityTags";

/**
 * Checklist fasilitas kamar (standar + custom) dengan chip terpilih yang bisa dihapus.
 */
export default function RoomFacilityFields({
  facilities = [],
  onChange,
  error,
  variant = "create",
}) {
  const [newFacility, setNewFacility] = useState("");

  const toggle = (f) => {
    onChange(
      facilities.includes(f)
        ? facilities.filter((x) => x !== f)
        : [...facilities, f],
    );
  };

  const addCustom = () => {
    const raw = newFacility.trim();
    if (!raw) return;
    if (!facilities.includes(raw)) {
      onChange([...facilities, raw]);
    }
    setNewFacility("");
  };

  return (
    <>
      {variant === "create" ? (
        <>
          <p style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 10 }}>
            Pilihan standar
          </p>
          <div className="clp-toggle-list">
            {ROOM_FACILITY_OPTIONS.map((f) => {
              const checked = facilities.includes(f);
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggle(f)}
                  className={`clp-toggle-row${checked ? " active" : ""}`}
                >
                  <span>{f}</span>
                  {checked && (
                    <span className="clp-toggle-check">
                      <Check size={12} color="white" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {ROOM_FACILITY_OPTIONS.map((f) => (
            <button
              key={f}
              type="button"
              className={`clp-fac-chip${facilities.includes(f) ? " active" : ""}`}
              onClick={() => toggle(f)}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      <div
        style={{
          marginTop: variant === "create" ? 24 : 14,
          paddingTop: variant === "create" ? 24 : 14,
          borderTop: "1px solid #f1f5f9",
        }}
      >
        <p
          className={variant === "edit" ? "text-xs text-slate-500 font-semibold mb-2" : undefined}
          style={
            variant === "create"
              ? { fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 10 }
              : undefined
          }
        >
          Tambah fasilitas kamar custom
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            className="clp-input"
            placeholder="cth. Water heater, Microwave"
            value={newFacility}
            onChange={(e) => setNewFacility(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className={variant === "create" ? "clp-btn clp-btn-primary" : "clp-btn-next px-4 py-2 rounded-xl text-sm"}
            style={variant === "create" ? { padding: "11px 16px", fontSize: 12 } : undefined}
            onClick={addCustom}
          >
            {variant === "create" ? "+ Tambah" : (
              <>
                <Plus size={14} style={{ display: "inline", verticalAlign: "middle" }} /> Tambah
              </>
            )}
          </button>
        </div>
      </div>

      <SelectedFacilityTags
        variant={variant}
        items={facilities}
        label="Fasilitas kamar terpilih"
        onRemove={(fac) => onChange(facilities.filter((x) => x !== fac))}
      />

      {error && (
        <p className={variant === "edit" ? "clp-err" : "clp-error"} style={variant === "create" ? undefined : { marginTop: 8 }}>
          {variant === "create" ? `⚠ ${error}` : error}
        </p>
      )}
    </>
  );
}
