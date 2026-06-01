import { Camera, ImageIcon, Loader2, Trash2, Upload, X } from "lucide-react";
import { resolveMediaUrl } from "../../config/apiBase";

const PHOTO_MAX = 8;

/**
 * Upload foto fasilitas bersama — mode create (File[]) atau edit (foto server).
 */
export default function SharedFacilityPhotos({
  variant = "create",
  files = [],
  onFilesChange,
  existingPhotos = [],
  deletedIds = [],
  onMarkDelete,
  onUploadFiles,
  uploading = false,
  error = "",
  onSaveDeletes,
  hasPendingDeletes = false,
  pendingFiles = [],
  onRemovePending,
}) {
  const visibleExisting = existingPhotos.filter((p) => !deletedIds.includes(p.id));
  const pendingCount = pendingFiles?.length ?? 0;
  const totalCount =
    variant === "create" ? files.length : visibleExisting.length + pendingCount;
  const canAddMore = totalCount < PHOTO_MAX;

  const addCreateFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    const next = [...files];
    for (const file of incoming) {
      if (next.length >= PHOTO_MAX) break;
      if (["image/jpeg", "image/png", "image/webp"].includes(file.type)) next.push(file);
    }
    onFilesChange?.(next);
  };

  if (variant === "create") {
    return (
      <div className="clp-field" style={{ marginTop: 8 }}>
        <label className="clp-label">Foto Fasilitas Bersama</label>
        <p className="clp-info-note">
          Foto dapur, parkir, ruang tamu, laundry, dll. Maks. {PHOTO_MAX} foto — JPG, PNG, WEBP.
        </p>
        {error && <p className="clp-error" style={{ marginBottom: 10 }}>⚠ {error}</p>}
        <label style={{ cursor: canAddMore ? "pointer" : "not-allowed", display: "block" }}>
          <div className={`clp-upload-zone${files.length > 0 ? " has-files" : ""}`} style={{ opacity: canAddMore ? 1 : 0.6 }}>
            <div className="clp-upload-icon-wrap">
              {files.length > 0 ? <ImageIcon size={24} /> : <Upload size={24} />}
            </div>
            <p className="clp-upload-text">
              {files.length > 0
                ? `${files.length} foto dipilih — klik untuk tambah lagi`
                : "Klik untuk upload foto fasilitas bersama"}
            </p>
            <p className="clp-upload-sub">{files.length}/{PHOTO_MAX} foto</p>
          </div>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            style={{ display: "none" }}
            disabled={!canAddMore}
            onChange={(e) => {
              addCreateFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        {files.length > 0 && (
          <div className="clp-photo-grid" style={{ marginTop: 14 }}>
            {files.map((file, i) => (
              <div key={`${file.name}-${i}`} className="clp-photo-item">
                <img src={URL.createObjectURL(file)} alt={file.name} />
                <div className="clp-photo-del">
                  <button type="button" onClick={() => onFilesChange?.(files.filter((_, idx) => idx !== i))}>
                    <Trash2 size={13} color="white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="clp-field" style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #e8eaf2" }}>
      <label className="clp-label">Foto Fasilitas Bersama</label>
      <p className="clp-info-note" style={{ marginBottom: 12 }}>
        Foto dapur, parkir, ruang tamu, laundry, dll. Maks. {PHOTO_MAX} foto — JPG, PNG, WEBP.
      </p>
      {error && <p className="clp-error" style={{ marginBottom: 10 }}>⚠ {error}</p>}

      {(visibleExisting.length > 0 || pendingCount > 0) && (
        <div className="clp-photo-grid" style={{ marginTop: 0, marginBottom: 12 }}>
          {visibleExisting.map((p) => (
            <div key={p.id} className="clp-photo-thumb-inline">
              <img src={resolveMediaUrl(p.url)} alt="fasilitas bersama" />
              <button
                type="button"
                className="clp-photo-del-btn"
                onClick={() => onMarkDelete?.(p.id)}
              >
                <X size={12} color="white" />
              </button>
            </div>
          ))}
          {pendingFiles.map((file, i) => (
            <div key={`pending-${file.name}-${i}`} className="clp-photo-thumb-inline">
              <img src={URL.createObjectURL(file)} alt={file.name} />
              <button
                type="button"
                className="clp-photo-del-btn"
                onClick={() => onRemovePending?.(i)}
              >
                <X size={12} color="white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {canAddMore ? (
        <label style={{ cursor: uploading ? "wait" : "pointer", display: "block" }}>
          <div
            className={`clp-upload-zone compact${totalCount > 0 ? " has-files" : ""}`}
            style={{ opacity: uploading ? 0.6 : 1, pointerEvents: uploading ? "none" : "auto" }}
          >
            <div className="clp-upload-icon-wrap" style={{ width: 44, height: 44, marginBottom: 10 }}>
              {uploading ? (
                <Loader2 size={22} className="clp-spin" />
              ) : (
                <Camera size={22} />
              )}
            </div>
            <p className="clp-upload-text" style={{ fontSize: 13 }}>
              {uploading
                ? "Mengunggah..."
                : totalCount > 0
                  ? `${totalCount} foto — klik untuk tambah lagi`
                  : "Klik untuk upload foto fasilitas bersama"}
            </p>
            <p className="clp-upload-sub">
              {totalCount}/{PHOTO_MAX} foto · JPG, PNG, WEBP
            </p>
          </div>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            style={{ display: "none" }}
            disabled={uploading}
            onChange={(e) => {
              if (e.target.files?.length) onUploadFiles?.(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      ) : (
        <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
          Sudah {PHOTO_MAX} foto — hapus dulu jika ingin mengganti.
        </p>
      )}

      {hasPendingDeletes && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
          <button
            type="button"
            onClick={onSaveDeletes}
            disabled={uploading}
            className="clp-btn clp-btn-primary"
            style={{ opacity: uploading ? 0.7 : 1 }}
          >
            {uploading ? (
              <>
                <Loader2 size={14} className="clp-spin" /> Menyimpan...
              </>
            ) : (
              "Simpan penghapusan foto"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
