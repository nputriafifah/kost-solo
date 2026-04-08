import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "leaflet/dist/leaflet.css";

// 🔥 TAMBAHKAN INI (WAJIB)
if (!window.location.hash) {
  const path = window.location.pathname + window.location.search;
  window.location.replace("/#" + path);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)