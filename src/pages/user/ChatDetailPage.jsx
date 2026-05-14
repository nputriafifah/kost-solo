import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Send, MoreVertical, CheckCheck, Check,
  MessageCircle, Loader2,
} from "lucide-react";

const API = "http://localhost:8080";

/* ── helpers identik dengan ChatPage ── */
const GRADIENTS = [
  "linear-gradient(135deg,#3B82F6,#22D3EE)",
  "linear-gradient(135deg,#8B5CF6,#22D3EE)",
  "linear-gradient(135deg,#10B981,#3B82F6)",
  "linear-gradient(135deg,#F59E0B,#F97316)",
  "linear-gradient(135deg,#EC4899,#FB7185)",
];
const avatarGradient = (id) =>
  GRADIENTS[parseInt(id?.slice(-4) || "0", 16) % GRADIENTS.length];

function formatTime(date) {
  const now = new Date();
  const diffDays = Math.floor((now - date) / 86_400_000);
  if (diffDays === 0)
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Kemarin";
  if (diffDays < 7) return date.toLocaleDateString("id-ID", { weekday: "short" });
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;700&display=swap');
  * { box-sizing: border-box; } body { margin: 0; background: #F8FAFC; }

  .cd-wrap { display:flex; flex-direction:column; height:100dvh; background:#F8FAFC; }

  .cd-header {
    position:sticky; top:0; z-index:100;
    background:rgba(255,255,255,.95); backdrop-filter:blur(16px);
    border-bottom:1px solid #EAEFF5;
    display:flex; align-items:center; gap:12px;
    padding:0 20px; height:64px; flex-shrink:0;
  }
  .cd-back-btn {
    width:36px; height:36px; border-radius:50%; border:1.5px solid #E2E8F0;
    background:#F8FAFC; display:flex; align-items:center; justify-content:center;
    cursor:pointer; color:#475569; transition:.15s; flex-shrink:0;
  }
  .cd-back-btn:hover { background:#EFF6FF; color:#2563EB; border-color:#BFDBFE; }
  .cd-avatar {
    width:40px; height:40px; border-radius:12px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    color:white; font-weight:800; font-size:15px;
    font-family:'DM Sans',sans-serif;
  }
  .cd-header-info { flex:1; min-width:0; }
  .cd-header-name {
    font-family:'Plus Jakarta Sans',sans-serif; font-size:15px; font-weight:800;
    color:#0F172A; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    letter-spacing:-.3px;
  }
  .cd-header-sub {
    font-size:12px; color:#3B82F6; font-weight:600;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    font-family:'DM Sans',sans-serif; margin-top:1px;
  }
  .cd-menu-btn {
    width:36px; height:36px; border-radius:50%; border:none;
    background:none; display:flex; align-items:center; justify-content:center;
    cursor:pointer; color:#94A3B8; transition:.15s; flex-shrink:0;
  }
  .cd-menu-btn:hover { background:#F1F5F9; color:#475569; }

  .cd-messages {
    flex:1; overflow-y:auto; padding:20px 16px;
    display:flex; flex-direction:column; gap:2px;
  }
  .cd-date-divider { display:flex; justify-content:center; margin:12px 0; }
  .cd-date-pill {
    background:#E2E8F0; color:#64748B; font-size:11px; font-weight:700;
    padding:4px 14px; border-radius:999px; font-family:'DM Sans',sans-serif;
  }

  .cd-bubble-row { display:flex; margin-bottom:4px; }
  .cd-bubble-row.me    { justify-content:flex-end; }
  .cd-bubble-row.other { justify-content:flex-start; }
  .cd-bubble {
    max-width:72%; padding:10px 14px; font-size:14px;
    font-family:'DM Sans',sans-serif; font-weight:500;
    line-height:1.55; word-break:break-word;
  }
  .cd-bubble.me {
    background:linear-gradient(135deg,#1D4ED8,#2563EB);
    color:white; border-radius:18px 18px 4px 18px;
  }
  .cd-bubble.other {
    background:white; color:#0F172A; border:1px solid #F1F5F9;
    border-radius:18px 18px 18px 4px;
    box-shadow:0 1px 4px rgba(0,0,0,.05);
  }
  .cd-meta { display:flex; align-items:center; gap:4px; margin-top:3px; padding:0 2px; }
  .cd-meta.me    { justify-content:flex-end; }
  .cd-meta.other { justify-content:flex-start; }
  .cd-time { font-size:10px; color:#94A3B8; font-family:'DM Sans',sans-serif; }

  .cd-input-wrap {
    background:white; border-top:1px solid #EAEFF5;
    padding:12px 16px calc(12px + env(safe-area-inset-bottom)); flex-shrink:0;
  }
  .cd-input-row {
    display:flex; align-items:center; gap:8px;
    background:#F8FAFC; border:1.5px solid #E2E8F0; border-radius:24px;
    padding:6px 6px 6px 16px; transition:.15s;
  }
  .cd-input-row:focus-within { border-color:#BFDBFE; background:white; }
  .cd-input {
    flex:1; border:none; background:transparent; outline:none;
    font-size:14px; font-family:'DM Sans',sans-serif; font-weight:500; color:#0F172A;
  }
  .cd-input::placeholder { color:#CBD5E1; }
  .cd-send-btn {
    width:36px; height:36px; border-radius:50%; border:none; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    transition:.2s; flex-shrink:0;
  }
  .cd-send-btn.active   { background:linear-gradient(135deg,#1D4ED8,#2563EB); color:white; }
  .cd-send-btn.inactive { background:#E2E8F0; color:#94A3B8; cursor:default; }

  .cd-center { display:flex; justify-content:center; align-items:center; flex:1; gap:8px; color:#94A3B8; font-family:'DM Sans',sans-serif; font-size:14px; }
  .cd-empty-icon { width:52px; height:52px; border-radius:16px; background:#F1F5F9; display:flex; align-items:center; justify-content:center; }

  @keyframes spin { to { transform:rotate(360deg); } }
  @media(max-width:640px) {
    .cd-header { padding:0 12px; height:60px; }
    .cd-messages { padding:16px 12px; }
    .cd-bubble { max-width:82%; }
  }
`;

export default function ChatDetailPage() {
  const { id }    = useParams();        // thread ID dari /chat/:id
  const navigate  = useNavigate();
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const user  = JSON.parse(localStorage.getItem("user")  || "null");
  const token = localStorage.getItem("token");

  const [thread,    setThread]    = useState(null);
  const [messages,  setMessages]  = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading,   setLoading]   = useState(true);
  const [sending,   setSending]   = useState(false);

  /* ────────────────────────────────────────────
     Fetch: GET /chats/:id
     service: getThreadById → formatThreadDetail
     response shape:
     {
       data: {
         id, listing: { id, name },
         student: { id, name },
         owner:   { id, name, kostName },
         messages: [{ id, senderId, message, sentAt, readAt }],
         createdAt, updatedAt
       }
     }
  ──────────────────────────────────────────── */
  const fetchThread = useCallback(async () => {
    if (!token) { navigate("/login"); return; }
    try {
      const res = await fetch(`${API}/chats/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      const json = await res.json();
      const t    = json.data;
      if (!t) return;

      /*
        formatThreadDetail tidak return displayName,
        jadi kita tentukan sendiri berdasarkan role user:
        - user = student  → lawan chat = owner (tampilkan kostName atau nama owner)
        - user = owner    → lawan chat = student (tampilkan nama student)
      */
      const isOwner     = user?.id === t.owner?.id;
      const partnerName = isOwner
        ? t.student?.name
        : (t.owner?.kostName || t.owner?.name);

      setThread({
        id:          t.id,
        partnerName: partnerName || "Pengguna",
        kostName:    t.listing?.name || "",
      });

      /* messages sudah ikut dalam response yang sama — tidak perlu request kedua */
      setMessages(
        (t.messages || []).map((m) => ({
          id:      m.id,
          text:    m.message,
          sender:  m.senderId === user?.id ? "me" : "other",
          time:    m.sentAt ? formatTime(new Date(m.sentAt)) : "",
          rawTime: m.sentAt,
          isRead:  !!m.readAt,
        }))
      );
    } catch (err) {
      console.error("Error fetching thread:", err);
    } finally {
      setLoading(false);
    }
  }, [id, token, navigate, user?.id]);

  useEffect(() => { fetchThread(); }, [fetchThread]);

  /* auto-scroll ke bawah */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ────────────────────────────────────────────
     Kirim: POST /chats/:id/messages
     service: sendMessage → formatThreadDetail
     body:     { message: "..." }
     response: { data: { ...thread, messages: [...semua pesan] } }
     → replace messages dengan yang dari server supaya ID akurat
  ──────────────────────────────────────────── */
  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending) return;

    /* optimistic update */
    const tempId  = `temp-${Date.now()}`;
    const tempMsg = {
      id: tempId, text, sender: "me",
      time: formatTime(new Date()), rawTime: new Date().toISOString(), isRead: false,
    };
    setMessages((prev) => [...prev, tempMsg]);
    setInputText("");
    setSending(true);

    try {
      const res = await fetch(`${API}/chats/${id}/messages`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) throw new Error("send failed");

      const json = await res.json();
      const t    = json.data; // sendMessage return formatThreadDetail (thread + semua pesan)

      /* replace penuh dengan data server — hapus pesan temp */
      setMessages(
        (t.messages || []).map((m) => ({
          id:      m.id,
          text:    m.message,
          sender:  m.senderId === user?.id ? "me" : "other",
          time:    m.sentAt ? formatTime(new Date(m.sentAt)) : "",
          rawTime: m.sentAt,
          isRead:  !!m.readAt,
        }))
      );
    } catch {
      /* rollback optimistic jika gagal */
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInputText(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  /* group messages per tanggal */
  const grouped = messages.reduce((acc, msg) => {
    const key = msg.rawTime
      ? new Date(msg.rawTime).toLocaleDateString("id-ID", {
          day: "2-digit", month: "long", year: "numeric",
        })
      : "Hari ini";
    if (!acc[key]) acc[key] = [];
    acc[key].push(msg);
    return acc;
  }, {});

  const partnerName    = thread?.partnerName || "Memuat...";
  const partnerInitial = partnerName[0]?.toUpperCase() || "?";

  return (
    <>
      <style>{css}</style>
      <div className="cd-wrap">

        {/* Header */}
        <header className="cd-header">
          <button className="cd-back-btn" onClick={() => navigate("/chat")} aria-label="Kembali">
            <ArrowLeft size={18} />
          </button>

          <div className="cd-avatar" style={{ background: avatarGradient(id) }}>
            {partnerInitial}
          </div>

          <div className="cd-header-info">
            <div className="cd-header-name">{partnerName}</div>
            {thread?.kostName && (
              <div className="cd-header-sub">{thread.kostName}</div>
            )}
          </div>

          <button className="cd-menu-btn" aria-label="Opsi lainnya">
            <MoreVertical size={18} />
          </button>
        </header>

        {/* Area pesan */}
        {loading ? (
          <div className="cd-center">
            <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
            <span>Memuat pesan...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="cd-center" style={{ flexDirection: "column", gap: 10 }}>
            <div className="cd-empty-icon">
              <MessageCircle size={24} color="#CBD5E1" />
            </div>
            <span>Belum ada pesan. Mulai percakapan!</span>
          </div>
        ) : (
          <div className="cd-messages">
            {Object.entries(grouped).map(([date, msgs]) => (
              <React.Fragment key={date}>
                <div className="cd-date-divider">
                  <span className="cd-date-pill">{date}</span>
                </div>
                {msgs.map((msg) => (
                  <React.Fragment key={msg.id}>
                    <div className={`cd-bubble-row ${msg.sender}`}>
                      <div className={`cd-bubble ${msg.sender}`}>{msg.text}</div>
                    </div>
                    <div className={`cd-meta ${msg.sender}`}>
                      <span className="cd-time">{msg.time}</span>
                      {msg.sender === "me" && (
                        msg.isRead
                          ? <CheckCheck size={13} color="#60A5FA" />
                          : <Check     size={13} color="#CBD5E1" />
                      )}
                    </div>
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Input */}
        <div className="cd-input-wrap">
          <div className="cd-input-row">
            <input
              ref={inputRef}
              className="cd-input"
              placeholder="Tulis pesan..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
            />
            <button
              className={`cd-send-btn ${inputText.trim() ? "active" : "inactive"}`}
              onClick={handleSend}
              disabled={!inputText.trim() || sending}
              aria-label="Kirim pesan"
            >
              {sending
                ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                : <Send    size={16} />
              }
            </button>
          </div>
        </div>

      </div>
    </>
  );
}