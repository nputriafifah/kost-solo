#!/usr/bin/env bash
# Install & aktifkan Tailscale — jalankan sebagai root di VM Linux
set -euo pipefail

if ! command -v tailscale &>/dev/null; then
  echo "==> Menginstall Tailscale..."
  curl -fsSL https://tailscale.com/install.sh | sh
fi

echo "==> Mengaktifkan Tailscale..."
echo "    (Browser akan terbuka untuk login — gunakan akun Google/GitHub/Microsoft)"
tailscale up --accept-routes

echo ""
echo "IP Tailscale (gunakan untuk remote access):"
tailscale ip -4
echo ""
echo "Status:"
tailscale status
