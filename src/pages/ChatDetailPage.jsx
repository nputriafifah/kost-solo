import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Send, Phone, MoreVertical, 
  Image as ImageIcon, MapPin, CheckCheck, Smile 
} from "lucide-react";

export default function ChatDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef(null);

  // Data Dummy Pesan (Bisa kamu kembangkan dengan API nantinya)
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Halo kak, saya mau tanya untuk Griya Sruni apakah masih ada kamar kosong?", 
      sender: "me", 
      time: "10:00",
      status: "read"
    },
    { 
      id: 2, 
      text: "Halo! Masih ada 2 kamar kosong kak untuk lantai 2. Fasilitas lengkap AC dan kamar mandi dalam.", 
      sender: "other", 
      time: "10:05",
      status: "read"
    },
    { 
      id: 3, 
      text: "Boleh survei lokasi besok sore jam 4?", 
      sender: "me", 
      time: "10:10",
      status: "sent"
    },
  ]);

  // Efek auto-scroll ke pesan paling bawah
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: inputText,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "sent"
    };

    setMessages([...messages, newMessage]);
    setInputText("");
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC]">
      
      {/* --- TOP HEADER --- */}
      <div className="bg-white px-4 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-slate-50 rounded-full transition-colors"
          >
            <ArrowLeft size={22} className="text-slate-600" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 overflow-hidden border border-slate-100">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150" 
                  alt="avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h3 className="font-black text-[14px] text-slate-900 leading-none">Ririen Setyowati</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">Pemilik Kost</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
            <Phone size={18} />
          </button>
          <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* --- CHAT AREA --- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Date Divider */}
        <div className="flex justify-center">
          <span className="bg-slate-200/50 text-slate-500 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
            Hari Ini
          </span>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`relative max-w-[80%] group`}>
              <div className={`px-4 py-3 rounded-[1.8rem] text-sm font-medium shadow-sm border ${
                msg.sender === "me" 
                ? "bg-indigo-600 text-white border-indigo-500 rounded-tr-none" 
                : "bg-white text-slate-700 border-slate-100 rounded-tl-none"
              }`}>
                {msg.text}
              </div>
              
              <div className={`flex items-center gap-1 mt-1 px-1 ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                <span className="text-[9px] text-slate-400 font-bold uppercase">{msg.time}</span>
                {msg.sender === "me" && (
                   <CheckCheck size={12} className={msg.status === "read" ? "text-indigo-500" : "text-slate-300"} />
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* --- INPUT AREA --- */}
      <div className="p-4 bg-white border-t border-slate-50">
        <form 
          onSubmit={handleSendMessage}
          className="flex items-center gap-2 bg-slate-50 p-2 rounded-[2rem] border border-slate-100 focus-within:border-indigo-200 focus-within:ring-4 focus-within:ring-indigo-50 transition-all"
        >
          <button type="button" className="p-2 text-slate-400 hover:text-indigo-600">
            <Smile size={20} />
          </button>
          
          <input 
            type="text" 
            placeholder="Tulis pesan..." 
            className="flex-1 bg-transparent border-none focus:ring-0 px-2 text-sm font-bold text-slate-700 placeholder:text-slate-300"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />

          <div className="flex items-center gap-1">
            <button type="button" className="p-2 text-slate-400 hover:text-indigo-600">
              <ImageIcon size={18} />
            </button>
            <button 
              type="submit"
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
                inputText.trim() 
                ? "bg-indigo-600 text-white shadow-indigo-200 scale-100" 
                : "bg-slate-200 text-white scale-90"
              }`}
              disabled={!inputText.trim()}
            >
              <Send size={18} fill={inputText.trim() ? "currentColor" : "none"} />
            </button>
          </div>
        </form>
        
        {/* Safety Warning Mini */}
        <p className="text-center text-[9px] text-slate-300 mt-3 font-medium flex items-center justify-center gap-1">
           <MapPin size={8} /> Tips: Jangan bagikan nomor WA pribadi untuk keamanan.
        </p>
      </div>
    </div>
  );
}