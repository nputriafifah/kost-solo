#!/usr/bin/env bash
# Setup server Linux (VM Proxmox) — nginx, Node.js, Tailscale
# Jalankan sebagai root: bash setup-server.sh

set -euo pipefail

APP_NAME="kost-solo"
WEB_ROOT="/var/www/${APP_NAME}"
NGINX_SITE="/etc/nginx/sites-available/${APP_NAME}"

echo "==> Update paket..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y curl git nginx ufw

echo "==> Install Node.js 20 LTS..."
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
node -v
npm -v

echo "==> Siapkan direktori web..."
mkdir -p "${WEB_ROOT}"
chown -R www-data:www-data "${WEB_ROOT}"

echo "==> Konfigurasi nginx..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cp "${SCRIPT_DIR}/nginx-kost-solo.conf" "${NGINX_SITE}"
ln -sf "${NGINX_SITE}" "/etc/nginx/sites-enabled/${APP_NAME}"
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl restart nginx

echo "==> Firewall (SSH + HTTP + Tailscale)..."
ufw allow OpenSSH || true
ufw allow 80/tcp || true
ufw allow 443/tcp || true
ufw allow 41641/udp || true
echo "y" | ufw enable || true

echo "==> Install Tailscale..."
if ! command -v tailscale &>/dev/null; then
  curl -fsSL https://tailscale.com/install.sh | sh
fi

echo ""
echo "============================================"
echo " Setup dasar selesai."
echo "============================================"
echo ""
echo "Langkah berikutnya:"
echo "  1. Aktifkan Tailscale:"
echo "       tailscale up"
echo "     (buka link auth di browser, login akun Tailscale)"
echo ""
echo "  2. Cek IP Tailscale:"
echo "       tailscale ip -4"
echo ""
echo "  3. Upload & deploy frontend dari laptop:"
echo "       .\\deploy\\deploy-from-windows.ps1"
echo ""
echo "  4. Deploy backend API (port 8080) terpisah — repo Atap backend."
echo "     Pastikan backend listen di 127.0.0.1:8080"
echo ""
echo "  Web lokal: http://$(hostname -I | awk '{print $1}')"
echo "  Web via Tailscale: http://\$(tailscale ip -4)"
echo ""
