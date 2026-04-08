import { useState, useRef, useEffect } from "react";
import { Mail, ArrowRight, RefreshCw, ShieldCheck } from "lucide-react";

export default function OtpForm({
  email,
  onSubmit,
  onResend,
  isLoading,
  errorMsg,
  successMsg
}) {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);

  const [countdown, setCountdown] = useState(60);

  // ⏱ Timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 🎯 Auto focus pertama
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // 🔥 AUTO SUBMIT saat 6 digit
  useEffect(() => {
    if (otp.join("").length === 6) {
      onSubmit(otp.join(""));
    }
  }, [otp]);

  // ✏️ Input change
  const handleChange = (el, index) => {
    const value = el.value.replace(/[^0-9]/g, ""); // hanya angka

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // ⌫ Backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // 📋 Paste OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "");

    if (paste) {
      const arr = paste.slice(0, 6).split("");
      const newOtp = new Array(6).fill("");
      arr.forEach((v, i) => (newOtp[i] = v));
      setOtp(newOtp);

      const lastIndex = Math.min(arr.length, 5);
      inputRefs.current[lastIndex]?.focus();
    }
  };

  // 📤 Submit manual (fallback)
  const handleSubmit = (e) => {
    e.preventDefault();
    const value = otp.join("");
    if (value.length === 6) {
      onSubmit(value);
    }
  };

  // 🔁 Resend
  const handleResendClick = () => {
    onResend();
    setCountdown(60);
    setOtp(new Array(6).fill(""));
    inputRefs.current[0]?.focus();
  };

  const formatTime = (sec) => `00:${sec < 10 ? `0${sec}` : sec}`;

  return (
    <div className="fade-in">
      {/* ICON */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 border-4 border-blue-50">
          <ShieldCheck size={32} className="text-blue-600" />
        </div>
      </div>

      {/* TITLE */}
      <h2 className="text-2xl font-extrabold text-center text-slate-800 mb-2">
        Verifikasi Kode OTP
      </h2>

      <p className="text-sm text-center text-slate-500 mb-8">
        Kode dikirim ke
        <br />
        <span className="font-semibold text-slate-700 flex items-center justify-center gap-1 mt-1">
          <Mail size={14} /> {email}
        </span>
      </p>

      {/* ALERT */}
      {errorMsg && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl text-center">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl text-center">
          {successMsg}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          className="flex justify-between gap-2 sm:gap-3"
          onPaste={handlePaste}
        >
          {otp.map((val, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              maxLength="1"
              value={val}
              onChange={(e) => handleChange(e.target, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onFocus={(e) => e.target.select()}
              className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading || otp.join("").length < 6}
          className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              Memverifikasi...
            </>
          ) : (
            <>
              Verifikasi <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* RESEND */}
      <div className="mt-8 text-center text-sm">
        <p className="text-slate-500">Belum menerima kode?</p>

        {countdown > 0 ? (
          <p className="mt-1 text-slate-400 font-semibold">
            Kirim ulang dalam {formatTime(countdown)}
          </p>
        ) : (
          <button
            onClick={handleResendClick}
            disabled={isLoading}
            className="mt-1 text-blue-600 hover:underline font-semibold"
          >
            Kirim Ulang OTP
          </button>
        )}
      </div>
    </div>
  );
}