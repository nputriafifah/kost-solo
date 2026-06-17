import { AlertTriangle, RefreshCw } from "lucide-react";

export const LISTING_STATUS = {
  ACTIVE: { label: "Aktif", bg: "#ecfdf5", color: "#059669", dot: "#10b981" },
  PENDING: { label: "Pending", bg: "#fffbeb", color: "#d97706", dot: "#f59e0b" },
  INACTIVE: { label: "Nonaktif", bg: "#f9fafb", color: "#6b7280", dot: "#9ca3af" },
  REJECTED: { label: "Ditolak", bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
  SUSPENDED: { label: "Suspend", bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
};

export const REPORT_STATUS = {
  PENDING: { label: "Menunggu", bg: "#fffbeb", color: "#d97706", dot: "#f59e0b" },
  RESOLVED: { label: "Selesai", bg: "#ecfdf5", color: "#059669", dot: "#10b981" },
  DISMISSED: { label: "Diabaikan", bg: "#f8fafc", color: "#64748b", dot: "#94a3b8" },
};

export function StatusBadge({ status, map = LISTING_STATUS }) {
  const cfg = map[status?.toUpperCase()] ?? {
    label: status ?? "-",
    bg: "#f3f4f6",
    color: "#374151",
    dot: "#9ca3af",
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 12,
        fontWeight: 600,
        borderRadius: 99,
        padding: "3px 10px",
        background: cfg.bg,
        color: cfg.color,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

export function StatCard({ label, value, icon: Icon, accent, sub }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #f1f5f9",
        borderRadius: 14,
        padding: "18px 20px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{label}</span>
        {Icon && (
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: `${accent}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={17} color={accent} />
          </div>
        )}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: "#1e1b4b", fontVariantNumeric: "tabular-nums" }}>
        {value}
      </div>
      {sub && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#94a3b8" }}>{sub}</p>}
    </div>
  );
}

export function AdminLoading() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "60vh",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "2.5px solid #e2e8f0",
          borderTop: "2.5px solid #6366f1",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <span style={{ color: "#94a3b8", fontSize: 13 }}>Memuat data...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function AdminError({ message, onRetry }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "60vh",
        gap: 12,
      }}
    >
      <AlertTriangle size={36} color="#f87171" />
      <p style={{ color: "#ef4444", fontWeight: 600, margin: 0 }}>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 20px",
            background: "#6366f1",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          <RefreshCw size={14} /> Coba lagi
        </button>
      )}
    </div>
  );
}

export function PageHeader({ title, subtitle, onRefresh }) {
  const now = new Date();
  const greeting =
    now.getHours() < 12 ? "Selamat pagi" : now.getHours() < 17 ? "Selamat siang" : "Selamat sore";

  return (
    <div
      style={{
        marginBottom: 24,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <div>
        {subtitle === false ? null : (
          <p style={{ margin: "0 0 2px", color: "#94a3b8", fontSize: 13 }}>{greeting}, Admin</p>
        )}
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#1e1b4b" }}>{title}</h1>
        {subtitle && typeof subtitle === "string" && (
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>{subtitle}</p>
        )}
      </div>
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            color: "#475569",
          }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      )}
    </div>
  );
}
