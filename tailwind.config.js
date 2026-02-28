// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kost-blue-soft': '#b2ebf2', // Ini adalah pendekatan warna biru dari coretan Anda
        'kost-blue-main': '#0288d1', // Warna biru yang lebih gelap untuk teks/tombol agar terbaca
      },
    },
  },
  plugins: [],
}