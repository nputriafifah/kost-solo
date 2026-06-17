import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Send, MoreVertical, CheckCheck, Check,
  MessageCircle, Loader2,
} from "lucide-react";

const API = "http://localhost:8080";

const GRADIENTS = [
  "linear-gradient(135deg,#A78BFA,#7C3AED)",
  "linear-gradient(135deg,#8B5CF6,#7C3AED)",
  "linear-gradient(135deg,#10B981,#A78BFA)",
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
  if (diffDays < 7)  return date.toLocaleDateString("id-ID", { weekday: "short" });
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..900;1,9..144,400..900&family=Outfit:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; } body { margin: 0; background: #F5F3FF; }

  .cd-wrap { display:flex; flex-direction:column; height:100dvh; background:#F5F3FF; }

  .cd-header {
    position:sticky; top:0; z-index:100;
    background:rgba(255,255,255,.95); backdrop-filter:blur(16px);
    border-bottom:1px solid #EAEFF5;
    display:flex; align-items:center; gap:12px;
    padding:0 20px; height:64px; flex-shrink:0;
  }
  .cd-back-btn {
    width:36px; height:36px; border-radius:50%; border:1.5px solid #E0E7FF;
    background:#F5F3FF; display:flex; align-items:center; justify-content:center;
    cursor:pointer; color:#475569; transition:.15s; flex-shrink:0;
  }
  .cd-back-btn:hover { background:#F5F3FF; color:#4F46E5; border-color:#DDD6FE; }
  .cd-avatar {
    width:40px; height:40px; border-radius:12px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    color:white; font-weight:800; font-size:15px;
    font-family:'Outfit',sans-serif;
  }
  .cd-header-info { flex:1; min-width:0; }
  .cd-header-name {
    font-family:'Outfit',sans-serif; font-size:15px; font-weight:800;
    color:#1E1B4B; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    letter-spacing:-.3px;
  }
  .cd-header-sub {
    font-size:12px; color:#4F46E5; font-weight:600;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    font-family:'Outfit',sans-serif; margin-top:1px;
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
    background:#E0E7FF; color:#64748B; font-size:11px; font-weight:700;
    padding:4px 14px; border-radius:999px; font-family:'Outfit',sans-serif;
  }

  .cd-bubble-row { display:flex; margin-bottom:4px; }
  .cd-bubble-row.me    { justify-content:flex-end; }
  .cd-bubble-row.other { justify-content:flex-start; }
  .cd-bubble {
    max-width:72%; padding:10px 14px; font-size:14px;
    font-family:'Outfit',sans-serif; font-weight:500;
    line-height:1.55; word-break:break-word;
  }
  .cd-bubble.me {
    background:linear-gradient(135deg,#4F46E5,#4F46E5);
    color:white; border-radius:18px 18px 4px 18px;
  }
  .cd-bubble.other {
    background:white; color:#1E1B4B; border:1px solid #F1F5F9;
    border-radius:18px 18px 18px 4px;
    box-shadow:0 1px 4px rgba(0,0,0,.05);
  }
  .cd-meta { display:flex; align-items:center; gap:4px; margin-top:3px; padding:0 2px; }
  .cd-meta.me    { justify-content:flex-end; }
  .cd-meta.other { justify-content:flex-start; }
  .cd-time { font-size:10px; color:#94A3B8; font-family:'Outfit',sans-serif; }

  .cd-input-wrap {
    background:white; border-top:1px solid #EAEFF5;
    padding:12px 16px calc(12px + env(safe-area-inset-bottom)); flex-shrink:0;
  }
  .cd-input-row {
    display:flex; align-items:center; gap:8px;
    background:#F5F3FF; border:1.5px solid #E0E7FF; border-radius:24px;
    padding:6px 6px 6px 16px; transition:.15s;
  }
  .cd-input-row:focus-within { border-color:#DDD6FE; background:white; }
  .cd-input {
    flex:1; border:none; background:transparent; outline:none;
    font-size:14px; font-family:'Outfit',sans-serif; font-weight:500; color:#1E1B4B;
  }
  .cd-input::placeholder { color:#CBD5E1; }
  .cd-send-btn {
    width:36px; height:36px; border-radius:50%; border:none; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    transition:.2s; flex-shrink:0;
  }
  .cd-send-btn.active   { background:linear-gradient(135deg,#4F46E5,#4F46E5); color:white; }
  .cd-send-btn.inactive { background:#E0E7FF; color:#94A3B8; cursor:default; }

  .cd-center { display:flex; justify-content:center; align-items:center; flex:1; gap:8px; color:#94A3B8; font-family:'Outfit',sans-serif; font-size:14px; }
  .cd-empty-icon { width:52px; height:52px; border-radius:16px; background:#F1F5F9; display:flex; align-items:center; justify-content:center; }

  @keyframes spin { to { transform:rotate(360deg); } }
  @media(max-width:640px) {
    .cd-header { padding:0 12px; height:60px; }
    .cd-messages { padding:16px 12px; }
    .cd-bubble { max-width:82%; }
  }
`;

export default function OwnerChatDetailPage() {
  const { id }    = useParams();
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

  const fetchThread = useCallback(async () => {
    if (!token) { navigate("/auth"); return; }
    try {
      const res = await fetch(`${API}/chats/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/auth");
        return;
      }

      const json = await res.json();
      const t    = json.data;
      if (!t) return;

      // Owner selalu lihat nama student sebagai partner
      const partnerName = t.student?.name || "Calon Penyewa";

      setThread({
        id:          t.id,
        partnerName,
        kostName:    t.listing?.name || "",
      });

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending) return;

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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ message: text }),
      });

      if (!res.ok) throw new Error("send failed");

      const json = await res.json();
      const t    = json.data;

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

  const grouped = messages.reduce((acc, msg) => {
    const key = msg.rawTime
      ? new Date(msg.rawTime).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
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
          <button className="cd-back-btn"
            onClick={() => navigate("/owner/dashboard")}
            aria-label="Kembali">
            <ArrowLeft size={18} />
          </button>

          <div className="cd-avatar" style={{ background: avatarGradient(id) }}>
            {partnerInitial}
          </div>

          <div className="cd-header-info">
            <div className="cd-header-name">{partnerName}</div>
            {thread?.kostName && <div className="cd-header-sub">{thread.kostName}</div>}
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
                          ? <CheckCheck size={13} color="#A5B4FC" />
                          : <Check      size={13} color="#CBD5E1" />
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