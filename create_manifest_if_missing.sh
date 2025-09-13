#!/usr/bin/env bash
set -euo pipefail

mkdir -p public

if [ ! -f public/manifest.json ]; then
  cat > public/manifest.json <<'JSON'
{
  "name": "Maestros FC",
  "short_name": "Maestros",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FAFAFA",
  "theme_color": "#16A34A",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
JSON
  echo "��� Criado public/manifest.json básico."
else
  echo "ℹ️  public/manifest.json já existe — não alterei."
fi

# Ícones básicos dummy (opcional). Se já tiver, mantemos os seus.
mkdir -p public/icons
if [ ! -f public/icons/icon-192.png ]; then
  # ícones vazios placeholder (PNG de 1px) só para não quebrar. Troque depois por ícones reais.
  printf '\211PNG\r\n\032\n\0\0\0\rIHDR\0\0\0\1\0\0\0\1\010\006\0\0\0\031\365\216\233\0\0\0\012IDATx\234c\0\001\0\0\005\0\001\r\n\036\263\0\0\0\0IEND\256B`\202' > public/icons/icon-192.png
fi
if [ ! -f public/icons/icon-512.png ]; then
  printf '\211PNG\r\n\032\n\0\0\0\rIHDR\0\0\0\1\0\0\0\1\010\006\0\0\0\031\365\216\233\0\0\0\012IDATx\234c\0\001\0\0\005\0\001\r\n\036\263\0\0\0\0IEND\256B`\202' > public/icons/icon-512.png
fi

git add public/manifest.json public/icons/icon-192.png public/icons/icon-512.png || true
git commit -m "chore(pwa): garantir public/manifest.json e ícones placeholder" || true
git push origin feature/supabase-setup || true
