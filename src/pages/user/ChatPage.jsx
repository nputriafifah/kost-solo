import React, { useState, useEffect } from "react";
import {
  MessageCircle,
  Search,
  CheckCheck,
  Check,
  ShieldCheck,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import BottomNav from "../../components/ui/BottomNav";

export default function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [chatSessions, setChatSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const { kostName, ownerName } = location.state || {};

  useEffect(() => {
    const fetchChats = async () => {
      try {
        // 🔥 AMBIL TOKEN
        const token = localStorage.getItem("token");

        console.log("🔥 TOKEN DI CHAT:", token);

        // ❌ kalau ga ada token → login
        if (!token) {
          console.log("❌ Token tidak ditemukan, redirect ke login");
          navigate("/login");
          return;
        }

        const res = await fetch("http://localhost:8080/chats", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("📡 STATUS:", res.status);

        const data = await res.json();
        console.log("📦 RESPONSE:", data);

        // ❌ kalau unauthorized
        if (res.status === 401) {
          console.log("❌ Unauthorized, hapus token");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        // 🔥 FIX: ambil dari data.data
        const chats = data.data || [];

        setChatSessions(Array.isArray(chats) ? chats : []);
      } catch (err) {
        console.error("🔥 ERROR:", err);
        setChatSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [navigate]);

  // 🔍 FILTER
  const filteredChats = chatSessions.filter((chat) => {
    const name = chat?.name || chat?.owner_name || "";
    const kost = chat?.kost || chat?.kost_name || "";

    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kost.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const hasAnyChatAtAll = chatSessions.length > 0;
  const noSearchResult = hasAnyChatAtAll && filteredChats.length === 0;

  return (
    <div className="min-h-screen bg-white pb-32">

      {/* HEADER */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-30 px-5 pt-8 pb-4 border-b border-slate-100">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Pesan<span className="text-blue-600">.</span>
            </h1>
            <p className="text-xs text-slate-400">
              {chatSessions.length} percakapan aktif
            </p>
          </div>
          <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <MessageCircle size={19} />
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Cari pemilik atau nama kos..."
            className="w-full h-11 pl-10 pr-4 bg-slate-50 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-center mt-10 text-slate-400">
          Loading chat...
        </p>
      )}

      {/* BANNER */}
      {!loading && kostName && (
        <div className="mx-4 mt-4 p-4 bg-blue-50 rounded-2xl flex gap-3">
          <MessageCircle size={17} className="text-blue-600" />
          <div>
            <p className="text-xs text-blue-500 font-semibold">
              Mulai chat dengan
            </p>
            <p className="text-sm font-bold">{ownerName}</p>
            <p className="text-xs text-slate-400">
              Tentang: {kostName}
            </p>
          </div>
        </div>
      )}

      {/* CHAT LIST */}
      {!loading && (
        <div className="px-4 mt-4">
          {!hasAnyChatAtAll ? (
            <p className="text-center text-slate-400 mt-10">
              Belum ada chat
            </p>
          ) : noSearchResult ? (
            <p className="text-center text-slate-400 mt-10">
              Tidak ditemukan
            </p>
          ) : (
            filteredChats.map((chat) => {
              const name =
                chat?.name || chat?.owner_name || "User";
              const kost =
                chat?.kost || chat?.kost_name || "-";
              const message =
                chat?.lastMessage ||
                chat?.last_message ||
                "Belum ada pesan";
              const time =
                chat?.time || chat?.created_at || "";
              const unread =
                chat?.unread || chat?.unread_count || 0;
              const isRead = chat?.isRead ?? true;

              return (
                <button
                  key={chat.id}
                  onClick={() =>
                    navigate(`/chat/${chat.id}`)
                  }
                  className="w-full flex items-center gap-3 py-4 hover:bg-slate-50 rounded-xl"
                >
                  {/* AVATAR */}
                  <img
                    src={
                      chat?.avatar ||
                      "https://i.pravatar.cc/150"
                    }
                    className="w-12 h-12 rounded-xl object-cover"
                    alt="avatar"
                  />

                  {/* INFO */}
                  <div className="flex-1 text-left">
                    <div className="flex justify-between">
                      <h3 className="text-sm font-semibold">
                        {name}
                      </h3>
                      <span className="text-xs text-slate-400">
                        {time}
                      </span>
                    </div>

                    <p className="text-xs text-blue-500">
                      {kost}
                    </p>

                    <div className="flex justify-between items-center">
                      <p className="text-xs text-slate-400">
                        {message}
                      </p>

                      {unread > 0 ? (
                        <span className="bg-blue-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                          {unread}
                        </span>
                      ) : isRead ? (
                        <CheckCheck
                          size={15}
                          className="text-blue-400"
                        />
                      ) : (
                        <Check
                          size={15}
                          className="text-slate-300"
                        />
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}

      {/* SAFETY */}
      <div className="mx-5 mt-8 p-5 bg-slate-900 rounded-2xl text-white">
        <div className="flex gap-3">
          <ShieldCheck
            size={20}
            className="text-emerald-400"
          />
          <div>
            <h4 className="font-bold text-sm">
              Bertransaksi aman
            </h4>
            <p className="text-xs text-slate-400">
              Gunakan fitur{" "}
              <span className="text-blue-400">
                Bayar di Atap
              </span>
            </p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}