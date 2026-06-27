# Laporan Deployment Projek KostSolo (Atap)

> **Tanggal deployment:** 23 Juni 2026
> **Disusun oleh:** Tim KostSolo
> **Status:** Live & berhasil diakses publik

---

## 1. Identitas Projek

| Item | Nilai |
|---|---|
| Nama aplikasi | **KostSolo / Atap** |
| Deskripsi | Platform pencarian kost di Surakarta dengan fitur pemilik, calon penyewa, dan admin |
| URL Frontend (publik) | <https://kostsolo.netlify.app> |
| URL Backend (publik) | <https://pbl10.tail410511.ts.net> |
| Repository Frontend | `github.com/rayhannurcholis/kost-solo` |
| Lingkungan server backend | VM Ubuntu 22.04 (Proxmox kampus, IP lokal `10.109.0.137`) |

---

## 2. Arsitektur Sistem

```
                    ┌──────────────────────────────┐
                    │   Browser Pengguna (HTTPS)   │
                    └──────────────┬───────────────┘
                                   │
              ┌────────────────────┴───────────────────────┐
              │                                            │
              ▼                                            ▼
   ┌─────────────────────┐                  ┌─────────────────────────┐
   │  Netlify CDN        │                  │  Tailscale Funnel       │
   │  (Frontend Vite/    │                  │  (HTTPS publik)         │
   │   React SPA)        │                  │                         │
   │  kostsolo.          │                  │  pbl10.tail410511       │
   │  netlify.app        │                  │  .ts.net                │
   └─────────────────────┘                  └────────────┬────────────┘
                                                         │
                                                         ▼
                                            ┌────────────────────────┐
                                            │  Server Ubuntu 22.04   │
                                            │  Backend Hono + Bun    │
                                            │  systemd: kostsolo     │
                                            │  Port 8080             │
                                            └──┬─────────────────┬───┘
                                               │                 │
                              ┌────────────────┘                 └────────────────┐
                              ▼                                                   ▼
                  ┌───────────────────────┐                         ┌─────────────────────────┐
                  │  PostgreSQL 14        │                         │  Cloudflare R2          │
                  │  (lokal server)       │                         │  (Object storage foto)  │
                  │  kostsolo DB          │                         │  pub-...r2.dev          │
                  └───────────────────────┘                         └─────────────────────────┘

                              + Integrasi Fonnte (WhatsApp Gateway) untuk OTP login owner
```

---

## 3. Tech Stack

### Frontend
- **React 19** + **Vite 7**
- **React Router 7** (BrowserRouter / SPA)
- **Tailwind CSS 4**
- **Leaflet** + **react-leaflet** untuk peta
- **Lucide React** untuk ikon
- **Axios** untuk HTTP request

### Backend
- **Hono 4** (web framework)
- **Bun** sebagai runtime JavaScript
- **Prisma 6** sebagai ORM
- **PostgreSQL 14** sebagai database utama
- **Cloudflare R2** untuk object storage foto
- **Fonnte API** untuk gateway WhatsApp (kirim OTP)

### Infrastruktur Deployment
- **Netlify** — hosting frontend (CDN, auto deploy dari GitHub)
- **Tailscale Funnel** — expose backend kampus ke internet via HTTPS
- **systemd** — manajemen process backend di server (`kostsolo.service`)
- **GitHub** — source code & trigger CI/CD Netlify

---

## 4. Langkah-Langkah Deployment

### 4.1. Deployment Frontend ke Netlify

1. **Persiapan konfigurasi SPA**

   Karena React Router pakai `BrowserRouter`, semua route harus diarahkan ke `index.html` agar refresh di route mana pun tidak menghasilkan 404.

   Buat file `public/_redirects`:
   ```
   /*    /index.html   200
   ```

   (Opsional juga membuat `netlify.toml` di root):
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [build.environment]
     NODE_VERSION = "20"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Connect repo GitHub ke Netlify**
   - Login ke <https://app.netlify.com>
   - Klik **Add new site → Import an existing project → GitHub**
   - Pilih repository `kost-solo`

3. **Build settings**
   | Field | Nilai |
   |---|---|
   | Base directory | *(kosong)* |
   | Build command | `npm run build` |
   | Publish directory | `dist` |
   | Branch to deploy | `main` |

4. **Environment variables**
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://pbl10.tail410511.ts.net` |
   | `VITE_R2_PUBLIC_URL` | `https://pub-e084a065ee23482ebd9f95e36322aea4.r2.dev` |

5. **Trigger deploy → status: Published**

### 4.2. Deployment Backend di Server Kampus

1. **Akses server** via Tailscale + SSH:
   ```bash
   ssh root@100.118.86.91
   ```

2. **Struktur projek backend** ada di `~/Atap` dengan file environment:
   - `.env` — Postgres lokal server
   - `.env.campus` — Postgres lokal + URL kampus
   - `.env.cloud` — Database Neon (cloud)

3. **Service systemd** (`kostsolo.service`) mengelola process backend agar otomatis hidup kembali setelah reboot:
   ```bash
   systemctl status kostsolo
   systemctl restart kostsolo
   ```

4. **Variabel environment kunci** di `~/Atap/.env`:
   ```env
   DATABASE_URL=postgresql://kostsolo:atap@127.0.0.1:5432/kostsolo
   API_PUBLIC_URL=https://pbl10.tail410511.ts.net
   FONNTE_TOKEN=<token-fonnte>
   R2_ACCOUNT_ID=...
   R2_ACCESS_KEY_ID=...
   R2_SECRET_ACCESS_KEY=...
   R2_BUCKET_NAME=...
   R2_PUBLIC_URL=https://pub-...r2.dev
   JWT_SECRET=...
   ```

### 4.3. Expose Backend ke Internet (Tailscale Funnel)

Backend hanya jalan di port 8080 di jaringan lokal kampus + IP Tailscale `100.118.86.91` (private CGNAT). Agar bisa diakses publik via HTTPS:

1. **Aktifkan MagicDNS + HTTPS Certificates** di
   <https://login.tailscale.com/admin/dns>

2. **Tambahkan node attribute `funnel`** di Access Controls (JSON editor):
   ```json
   {
     "grants": [
       {"src": ["*"], "dst": ["*"], "ip": ["*"]}
     ],
     "nodeAttrs": [
       {
         "target": ["autogroup:member"],
         "attr": ["funnel"]
       }
     ],
     "ssh": [
       {
         "action": "check",
         "src":    ["autogroup:member"],
         "dst":    ["autogroup:self"],
         "users":  ["autogroup:nonroot", "root"]
       }
     ]
   }
   ```

3. **Jalankan Funnel** (background) di server:
   ```bash
   tailscale funnel --bg 8080
   ```

   Output:
   ```
   Available on the internet:
   https://pbl10.tail410511.ts.net/
   |-- proxy http://127.0.0.1:8080
   ```

### 4.4. Setup CORS di Backend (Hono)

Frontend dari `https://kostsolo.netlify.app` perlu diizinkan mengakses backend. Konfigurasi CORS di `src/index.js`:

```javascript
const allowedOrigins = [
  'https://kostsolo.netlify.app',
  'http://localhost:5173',
  'http://localhost:4173',
]

app.use('*', cors({
  origin: (origin) => {
    if (!origin) return origin
    if (allowedOrigins.includes(origin)) return origin
    if (origin.endsWith('.netlify.app')) return origin
    return null
  },
  allowMethods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowHeaders: ['Content-Type','Authorization'],
  credentials: true,
}))
```

### 4.5. Setup Database

1. **PostgreSQL 14** sudah terinstall di server, dengan 15 tabel yang ter-generate via Prisma migrate (KostListing, RoomType, User, OwnerProfile, RoomPhoto, ChatThread, dll).

2. **Import data dari Neon (cloud) ke lokal server** — karena database lokal awalnya kosong:
   - Install PostgreSQL client 17 (kompatibel dengan Neon):
     ```bash
     curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc \
       | gpg --dearmor -o /usr/share/keyrings/pgdg.gpg
     echo "deb [signed-by=/usr/share/keyrings/pgdg.gpg] http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \
       > /etc/apt/sources.list.d/pgdg.list
     apt update && apt install -y postgresql-client-17
     ```
   - Stop backend (agar tidak mengunci database):
     ```bash
     systemctl stop kostsolo
     ```
   - Dump & restore:
     ```bash
     /usr/lib/postgresql/17/bin/pg_dump \
       "postgresql://...@neon.tech/kost?sslmode=require" \
       --no-owner --no-acl --clean --if-exists \
     | /usr/lib/postgresql/17/bin/psql \
       "postgresql://kostsolo:atap@127.0.0.1:5432/kostsolo"
     ```
   - Start backend kembali:
     ```bash
     systemctl start kostsolo
     ```

### 4.6. Storage Foto (Cloudflare R2)

- Foto kost di-upload ke R2 melalui endpoint backend (`uploadBufferToR2`).
- URL foto yang dikirim ke frontend menggunakan **proxy backend** (`/files/<key>`), bukan URL R2 langsung — untuk menghindari masalah CORS R2 dan timeout `r2.dev`.
- Implementasi proxy ada di `src/modules/files/files.routes.js` dan helper `toProxiedFileUrl`.

---

## 5. Kendala yang Dihadapi dan Solusinya

| No | Kendala | Penyebab | Solusi |
|---:|---|---|---|
| 1 | Frontend tidak bisa konek backend | Default `VITE_API_URL` mengarah ke `localhost:3000` | Set env `VITE_API_URL` di Netlify ke URL publik backend |
| 2 | **Mixed Content** (HTTPS → HTTP diblokir browser) | Netlify HTTPS, backend HTTP | Expose backend via **Tailscale Funnel** (otomatis HTTPS dengan SSL valid) |
| 3 | IP Tailscale `100.x.x.x` tidak bisa diakses pengunjung publik | IP CGNAT — hanya tersedia di anggota Tailnet | Funnel memberi URL `*.ts.net` yang publik & ber-HTTPS |
| 4 | Data kost tampil kosong di FE meski backend OK | Postgres lokal server masih kosong | Migrasi data dari Neon → Postgres lokal pakai `pg_dump \| psql` |
| 5 | `EADDRINUSE: port 8080` saat restart backend manual | systemd auto-restart service `kostsolo` | Restart melalui systemd: `systemctl restart kostsolo` |
| 6 | Foto kost tidak muncul ("Foto tidak tersedia") | `API_PUBLIC_URL` masih `http://localhost:8080` sehingga proxy foto kena Mixed Content | Set `API_PUBLIC_URL=https://pbl10.tail410511.ts.net` di env server |
| 7 | "Failed to send OTP via WhatsApp" saat login owner | `FONNTE_TOKEN` di env server berbeda dengan token Fonnte yang aktif | Samakan `FONNTE_TOKEN` di `.env`, `.env.campus`, dan `.env.cloud` |
| 8 | **Page not found** saat akses route `/verify-otp` dan refresh route lainnya | SPA fallback belum aktif di Netlify | Tambahkan `public/_redirects` dengan rule `/* /index.html 200` |
| 9 | Perubahan di frontend tidak ter-deploy ke Netlify | `git remote origin` mengarah ke repo berbeda dari yang dipantau Netlify (`nputriafifah` vs `rayhannurcholis`) | Sinkronisasi repo: pastikan push ke repo yang sama dengan yang dipantau Netlify |
| 10 | Repository PostgreSQL pgdg gagal GPG error | Repo `apt.postgresql.org` belum ditandai `[signed-by=...]` | Tambah keyring `pgdg.gpg` lalu definisikan repo dengan opsi `signed-by` |

---

## 6. File Konfigurasi Kunci

### 6.1. `public/_redirects` (frontend)
```
/*    /index.html   200
```

### 6.2. `netlify.toml` (frontend)
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 6.3. `src/config/apiBase.js` (frontend)
```javascript
export const getApiBase = () => {
  const fromEnv = import.meta.env.VITE_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (import.meta.env.DEV) return "/api";
  return "http://localhost:3000";
};
```

### 6.4. Environment di Netlify (frontend)
```env
VITE_API_URL=https://pbl10.tail410511.ts.net
VITE_R2_PUBLIC_URL=https://pub-e084a065ee23482ebd9f95e36322aea4.r2.dev
```

### 6.5. Environment di server (backend)
```env
DATABASE_URL=postgresql://kostsolo:atap@127.0.0.1:5432/kostsolo
API_PUBLIC_URL=https://pbl10.tail410511.ts.net
FONNTE_TOKEN=<token>
R2_ACCOUNT_ID=<id>
R2_ACCESS_KEY_ID=<key>
R2_SECRET_ACCESS_KEY=<secret>
R2_BUCKET_NAME=<bucket>
R2_PUBLIC_URL=https://pub-...r2.dev
JWT_SECRET=<secret>
PORT=8080
```

---

## 7. Hasil Akhir

| Komponen | URL | Status |
|---|---|---|
| Frontend | <https://kostsolo.netlify.app> | Live (Netlify) |
| Backend | <https://pbl10.tail410511.ts.net> | Live (Tailscale Funnel) |
| Database | PostgreSQL 14 di `127.0.0.1:5432/kostsolo` | Berisi data (hasil migrasi dari Neon) |
| Storage foto | Cloudflare R2 + proxy backend | Aktif |
| OTP WhatsApp | Fonnte API | Aktif |

### Fitur yang sudah berjalan di produksi
- Menampilkan daftar kost (dengan foto, harga, lokasi)
- Filter kost (Putra/Putri/Campur)
- Pencarian & kost di sekitar lokasi pengguna
- Login owner melalui OTP WhatsApp (via Fonnte)
- Halaman OTP `/verify-otp` (SPA route, sudah tidak 404)

---

## 8. Pelajaran yang Diambil (Learning Outcome)

1. **SPA fallback wajib** untuk single-page app yang pakai `BrowserRouter` — kalau tidak, refresh di route apapun akan menghasilkan 404.
2. **Hindari Mixed Content** dengan memastikan backend ber-HTTPS jika frontend ber-HTTPS. Browser modern memblokir request HTTP dari halaman HTTPS.
3. **IP Tailscale `100.x.x.x` bukan IP publik** — gunakan **Tailscale Funnel** untuk expose service ke internet dengan domain & SSL valid.
4. **Selalu cek `git remote -v`** sebelum push, terutama saat berkolaborasi di repo bersama, agar perubahan tidak nyasar ke repo yang salah.
5. **Sinkronisasi env variables** antara dev (local) dan production (server) — token / URL yang beda akan langsung menyebabkan error misterius.
6. **Pisahkan proxy storage** (lewat backend) jika provider object storage tidak menyediakan custom domain HTTPS yang stabil.
7. **systemd lebih reliable** daripada `nohup` untuk menjalankan backend, karena auto-restart saat crash atau reboot.
8. **Versi `pg_dump` harus ≥ versi server sumber** saat migrasi database antar PostgreSQL.

---

## 9. Lampiran — Daftar Tool / Layanan

| Tool / Layanan | Fungsi |
|---|---|
| Netlify | Hosting frontend, CI/CD otomatis dari GitHub |
| GitHub | Source code repository, trigger build |
| Tailscale | Private VPN antar device + Funnel (HTTPS publik) |
| Proxmox VE | Hypervisor server kampus |
| Ubuntu 22.04 LTS | OS server backend |
| Bun | Runtime JavaScript (replacement Node.js) |
| Hono | Web framework backend |
| Prisma | ORM untuk PostgreSQL |
| PostgreSQL 14 | Database utama (lokal) |
| Neon | PostgreSQL serverless cloud (sumber data awal) |
| Cloudflare R2 | Object storage S3-compatible (foto) |
| Fonnte | WhatsApp gateway untuk OTP |
| systemd | Process manager Linux |

---

*Akhir laporan.*
