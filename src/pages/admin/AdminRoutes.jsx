// Tambahkan route ini ke file router utama kamu (misalnya App.jsx atau routes.jsx)
// Pastikan sudah install: react-router-dom, lucide-react, tailwindcss

import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout   from "./AdminLayout";
import AdminDashboard from "./AdminDashboard";
import AdminListings  from "./AdminListings";
import AdminReports   from "./AdminReports";
import AdminMinatLeads from "./AdminMinatLeads";

// Contoh penggunaan di dalam <BrowserRouter>:
export function AdminRoutes() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="listings"  element={<AdminListings />} />
        <Route path="minat-leads" element={<AdminMinatLeads />} />
        <Route path="reports"   element={<AdminReports />} />
      </Route>
    </Routes>
  );
}

/*
  STRUKTUR FILE:
  src/
  ├── pages/admin/
  │   ├── AdminLayout.jsx     ← sidebar + topbar wrapper
  │   ├── AdminDashboard.jsx  ← ringkasan + tabel listing terbaru
  │   ├── AdminListings.jsx   ← CRUD listing + modal tambah/edit
  │   └── AdminReports.jsx    ← grafik + top listing + export CSV
  │
  └── router/
      └── AdminRoutes.jsx     ← file ini

  ENDPOINT YANG DIBUTUHKAN (sesuai struktur backend kamu):
  GET  /admin/analytics/summary       → { totalListings, totalUsers, totalViews, activeListings }
  GET  /admin/listings?page&limit&search&status
  POST /admin/listings                → create
  PUT  /admin/listings/:id            → update
  DEL  /admin/listings/:id            → delete
  GET  /admin/report?period=monthly   → { totalListings, totalUsers, newListings, newUsers, listingsByMonth[], usersByMonth[], topListings[] }
  GET  /admin/report/export?period=   → file CSV (download)
*/