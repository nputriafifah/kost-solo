/** Enum `ListingReportReason` — sama dengan Prisma / BE */
export const REPORT_REASON_LABELS = {
  TIDAK_AKTIF: "Sudah tidak tersedia",
  FOTO_TIDAK_SESUAI: "Foto menyesatkan",
  INFORMASI_SALAH: "Informasi tidak akurat",
  PENIPUAN: "Penipuan / scam",
};

export const reportReasonLabel = (reason) =>
  REPORT_REASON_LABELS[reason] ?? reason ?? "—";

/** `ListingReportStatus` */
export const REPORT_STATUSES = ["PENDING", "RESOLVED", "DISMISSED"];

/** Aksi tinjau laporan — PATCH /admin/reports/:id body.action */
export const REPORT_REVIEW_ACTIONS = ["DISMISS", "DEACTIVATE_LISTING"];
