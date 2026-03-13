import { useState, useRef, useEffect } from "react";
import { Mail, ArrowRight, RefreshCw, ShieldCheck } from "lucide-react";

export default function OtpForm({ email, onSubmit, onResend, isLoading, errorMsg, successMsg }) {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);
  
  // State untuk Timer Hitung Mundur (60 detik)
  const [countdown, setCountdown] = useState(60);

  // Efek untuk menjalankan timer
  useEffect(() => {
    if (countdown > 0) {
      const timerId = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [countdown]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (element, index) => {
    const value = element.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    if (/^\d+$/.test(pastedData)) {
      const pastedArray = pastedData.split("").slice(0, 6);
      const newOtp = new Array(6).fill("");
      pastedArray.forEach((char, i) => {
        newOtp[i] = char;
      });
      setOtp(newOtp);
      const focusIndex = Math.min(pastedArray.length, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length === 6) {
      onSubmit(otpValue);
    }
  };

  const handleResendClick = () => {
    onResend();
    setCountdown(60); // Reset timer kembali ke 60 detik
    setOtp(new Array(6).fill("")); // Kosongkan inputan
    inputRefs.current[0]?.focus(); // Fokus kembali ke kotak pertama
  };

  // Format timer menjadi 00:XX
  const formatTime = (seconds) => {
    return `00:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  return (
    <div className="fade-in">
      <div className="flex justify-center mb-6">
        <div className="flex items-center justify-center w-16 h-16 border-4 border-blue-50 bg-blue-100 rounded-full">
          <ShieldCheck size={32} className="text-blue-600" />
        </div>
      </div>

      <h2 className="text-2xl font-extrabold text-center text-slate-800 mb-2" style={{ fontFamily: "Plus Jakarta Sans" }}>
        Verifikasi Email
      </h2>
      
      <p className="text-sm text-center text-slate-500 mb-8">
        Kami telah mengirimkan 6 digit kode OTP ke <br />
        <span className="font-semibold text-slate-700 flex items-center justify-center gap-1.5 mt-1">
          <Mail size={14} className="text-slate-400" /> {email}
        </span>
      </p>

      {/* Alert Error / Success */}
      {errorMsg && (
        <div className="mb-6 px-4 py-3 text-sm text-red-600 border border-red-200 rounded-xl bg-red-50 text-center">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="mb-6 px-4 py-3 text-sm text-green-700 border border-green-200 rounded-xl bg-green-50 text-center">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              name="otp"
              maxLength="1"
              ref={(el) => (inputRefs.current[index] = el)}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-800"
              autoComplete="off"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading || otp.join("").length < 6}
          className="submit-btn bg-blue-600 hover:bg-blue-700 w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <RefreshCw size={16} className="animate-spin" /> Memverifikasi...
            </>
          ) : (
            <>Verifikasi Kode <ArrowRight size={16} /></>
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-sm">
        <p className="text-slate-500">
          Belum menerima kode OTP?
        </p>
        
        {countdown > 0 ? (
          <p className="mt-1 font-semibold text-slate-400">
            Kirim ulang dalam {formatTime(countdown)}
          </p>
        ) : (
          <button
            onClick={handleResendClick}
            disabled={isLoading}
            className="mt-1 font-semibold text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50 transition-colors"
          >
            Kirim Ulang Kode
          </button>
        )}
      </div>
    </div>
  );
}