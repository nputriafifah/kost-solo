import {
  KABUPATEN_OPTIONS,
  getKecamatanOptions,
  getKelurahanOptions,
} from "../../constants/soloRegions";

const selectStyle = {
  width: "100%",
  background: "#FAFAFE",
  border: "1px solid #e2e8f4",
  borderRadius: 10,
  padding: "11px 14px",
  fontSize: 14,
  color: "#1e293b",
  outline: "none",
  fontFamily: "'Outfit', sans-serif",
  cursor: "pointer",
};

const selectErrStyle = {
  ...selectStyle,
  borderColor: "#ef4444",
  background: "#fff5f5",
};

/**
 * Dropdown berjenjang: Kabupaten/Kota → Kecamatan → Kelurahan/Desa.
 * Jika daftar kelurahan kosong, tampilkan input manual.
 */
export default function AreaLocationFields({
  values,
  onChange,
  errors = {},
  variant = "create",
}) {
  const { areaKabupaten, areaKecamatan, areaDesa } = values;
  const kecOptions = getKecamatanOptions(areaKabupaten);
  const desaOptions = getKelurahanOptions(areaKabupaten, areaKecamatan);
  const manualDesa = desaOptions.length === 0 && Boolean(areaKecamatan);

  const setField = (patch) => onChange({ ...values, ...patch });

  const handleKab = (e) => {
    setField({ areaKabupaten: e.target.value, areaKecamatan: "", areaDesa: "" });
  };

  const handleKec = (e) => {
    setField({ areaKecamatan: e.target.value, areaDesa: "" });
  };

  const fieldWrap = (label, errorKey, children) => {
    if (variant === "edit") {
      return (
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            {label}
          </label>
          {children}
          {errors[errorKey] && <p className="clp-err">{errors[errorKey]}</p>}
        </div>
      );
    }
    return (
      <div className="clp-field">
        <label className="clp-label">{label}</label>
        {children}
        {errors[errorKey] && <p className="clp-error">⚠ {errors[errorKey]}</p>}
      </div>
    );
  };

  const selClass = (key) => (errors[key] ? selectErrStyle : selectStyle);

  return (
    <>
      {fieldWrap(
        "Kabupaten / Kota",
        "areaKabupaten",
        <select value={areaKabupaten} onChange={handleKab} style={selClass("areaKabupaten")}>
          <option value="">Pilih kabupaten / kota</option>
          {KABUPATEN_OPTIONS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>,
      )}

      {fieldWrap(
        "Kecamatan",
        "areaKecamatan",
        <select
          value={areaKecamatan}
          onChange={handleKec}
          disabled={!areaKabupaten}
          style={{
            ...selClass("areaKecamatan"),
            opacity: areaKabupaten ? 1 : 0.6,
            cursor: areaKabupaten ? "pointer" : "not-allowed",
          }}
        >
          <option value="">{areaKabupaten ? "Pilih kecamatan" : "Pilih kabupaten dulu"}</option>
          {kecOptions.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>,
      )}

      {manualDesa
        ? fieldWrap(
            "Kelurahan / Desa",
            "areaDesa",
            variant === "create" ? (
              <input
                className={`clp-input${errors.areaDesa ? " err" : ""}`}
                placeholder="Ketik nama kelurahan / desa"
                value={areaDesa}
                onChange={(e) => setField({ areaDesa: e.target.value })}
              />
            ) : (
              <input
                className={`clp-input${errors.areaDesa ? " clp-input-error" : ""}`}
                placeholder="Ketik nama kelurahan / desa"
                value={areaDesa}
                onChange={(e) => setField({ areaDesa: e.target.value })}
              />
            ),
          )
        : fieldWrap(
            "Kelurahan / Desa",
            "areaDesa",
            <select
              value={areaDesa}
              onChange={(e) => setField({ areaDesa: e.target.value })}
              disabled={!areaKecamatan}
              style={{
                ...selClass("areaDesa"),
                opacity: areaKecamatan ? 1 : 0.6,
                cursor: areaKecamatan ? "pointer" : "not-allowed",
              }}
            >
              <option value="">{areaKecamatan ? "Pilih kelurahan / desa" : "Pilih kecamatan dulu"}</option>
              {desaOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>,
          )}
    </>
  );
}
