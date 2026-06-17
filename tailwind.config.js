/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        atap: {
          50: "#F5F3FF",
          100: "#EEF2FF",
          200: "#E0E7FF",
          300: "#C7D2FE",
          400: "#A5B4FC",
          500: "#818CF8",
          600: "#6366F1",
          700: "#4F46E5",
          800: "#4338CA",
          900: "#3730A3",
          950: "#1E1B4B",
        },
        "atap-chat": "#10B981",
        "atap-verified": "#F59E0B",
        "kost-blue-soft": "#E0E7FF",
        "kost-blue-main": "#4F46E5",
      },
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
        display: ["Fraunces", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
