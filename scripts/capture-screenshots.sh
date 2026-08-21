#!/usr/bin/env bash
# Ambil screenshot dari device Android terhubung (USB debugging aktif).
# Hasil: PNG di assets/store/screenshot-N.png
# Cara pakai: buka layar yang mau di-screenshot di HP, lalu jalankan:
#   bash scripts/capture-screenshots.sh [jumlah] [jeda-detik]
set -euo pipefail

COUNT="${1:-8}"
DELAY="${2:-4}"
OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/assets/store"
ADB="${ADB:-$(command -v adb || echo "$HOME/Library/Android/sdk/platform-tools/adb")}"

mkdir -p "$OUT_DIR"
"$ADB" wait-for-device

echo "Mengambil $COUNT screenshot (jeda ${DELAY}s). Buka layar yang diinginkan di HP..."
sleep 2

for ((i = 1; i <= COUNT; i++)); do
  echo "[$i/$COUNT] screenshot dalam ${DELAY}s..."
  sleep "$DELAY"
  "$ADB" exec-out screencap -p > "$OUT_DIR/screenshot-$i.png"
  echo "  -> $OUT_DIR/screenshot-$i.png"
done

echo "Selesai. Rekomendasi minimal: beranda, detail surah, jadwal shalat, dzikir, hadits, asmaul husna, AI chat, menu lainnya."
