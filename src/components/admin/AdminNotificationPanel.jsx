import { useNavigate } from "react-router-dom";
import {
  X, Bell, CheckCheck, Building2, Flag, UserPlus,
} from "lucide-react";

const TYPE_META = {
  LISTING_PENDING: {
    icon: Building2,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    path: "/admin/listings",
  },
  REACTIVATION_REQUEST: {
    icon: Building2,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    path: "/admin/listings",
  },
  REPORT_NEW: {
    icon: Flag,
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    path: "/admin/reports",
  },
  OWNER_REGISTERED: {
    icon: UserPlus,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    path: "/admin/listings",
  },
};

function formatTimeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Kemarin";
  if (days < 7) return `${days} hari lalu`;
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

export default function AdminNotificationPanel({
  notifications,
  unreadCount,
  loading,
  onClose,
  onMarkRead,
  onMarkAllRead,
}) {
  const navigate = useNavigate();

  const handleClick = async (notif) => {
    if (!notif.readAt) {
      await onMarkRead(notif.id);
    }
    const meta = TYPE_META[notif.type] ?? TYPE_META.LISTING_PENDING;
    onClose();
    navigate(meta.path);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
        aria-hidden
      />

      <div className="fixed top-14 right-4 z-50 w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200/80 flex flex-col max-h-[min(520px,calc(100vh-5rem))] overflow-hidden animate-[fadeIn_0.2s_ease]">
        <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Notifikasi Admin</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {unreadCount} belum dibaca
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <CheckCheck size={12} />
                Tandai semua
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">Memuat...</div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-slate-300">
              <Bell size={36} className="mb-2 opacity-40" />
              <p className="text-sm font-semibold text-slate-400">Tidak ada notifikasi</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const meta = TYPE_META[notif.type] ?? TYPE_META.LISTING_PENDING;
              const Icon = meta.icon;
              const isUnread = !notif.readAt;

              return (
                <button
                  key={notif.id}
                  type="button"
                  onClick={() => handleClick(notif)}
                  className={`w-full flex items-start gap-3 px-4 py-3.5 text-left border-b border-slate-50 transition-colors hover:bg-slate-50 ${
                    isUnread ? "bg-indigo-50/50" : "bg-white"
                  }`}
                >
                  <div
                    className={`w-9 h-9 ${meta.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon size={16} className={meta.iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-[13px] font-semibold leading-snug ${
                          isUnread ? "text-slate-900" : "text-slate-600"
                        }`}
                      >
                        {notif.title}
                      </p>
                      {isUnread && (
                        <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-[12px] text-slate-500 leading-relaxed mt-0.5 line-clamp-2">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-slate-300 font-medium mt-1">
                      {formatTimeAgo(notif.createdAt)}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
