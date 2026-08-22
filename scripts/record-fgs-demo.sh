#!/usr/bin/env bash
# ============================================================
# Muslim Hub — Rekam video demonstrasi FOREGROUND_SERVICE_MEDIA_PLAYBACK
#
# Play Console meminta video yang menunjukkan penggunaan
# foreground service media playback yang NOTICEABLE oleh user:
# murottal tetap bermain di background + notifikasi media.
#
# Cara pakai:
#   1. Colok HP (USB debugging aktif) — app Muslim Hub terpasang (dev build / AAB)
#   2. Jalankan: bash scripts/record-fgs-demo.sh
#   3. Ikuti prompt di layar terminal (setiap adegan ada jeda waktu)
#   4. Hasil: assets/store/fgs-media-playback-demo.mp4
#
# Alur yang direkam (YANG WAJIB TAMPIL DI VIDEO):
#   Adegan 1: Buka app → tab Qur'an → buka surah (mis. Al-Fatiha)
#   Adegan 2: Tekan tombol PLAY murottal → audio terdengar
#   Adegan 3: Minimize app (tombol Home) → buka app lain / layar utama
#             → audio TETAP bermain + notifikasi media terlihat
#   Adegan 4: Buka notification shade → tunjukkan kontrol media (pause/stop)
#   Adegan 5: Pause dari notifikasi → audio berhenti → selesai
# ============================================================
set -euo pipefail

OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/assets/store"
ADB="${ADB:-$(command -v adb || echo "$HOME/Library/Android/sdk/platform-tools/adb")}"
DEVICE_FILE="/sdcard/muslimhub-fgs-demo.mp4"
LOCAL_FILE="$OUT_DIR/fgs-media-playback-demo.mp4"

mkdir -p "$OUT_DIR"
"$ADB" wait-for-device
echo "Device terhubung."
echo
echo "PASTIKAN: volume HP aktif (bukan silent) & app Muslim Hub terbuka."
echo
read -r -p "Tekan ENTER untuk mulai merekam (4 adegan, ±80 detik)... " _ 

# Rekam di device (maks 3 menit, 1080p, bitrate nyaman untuk upload)
"$ADB" shell screenrecord --bit-rate 8000000 --size 1080x2340 "$DEVICE_FILE" &
REC_PID=$!
trap 'kill $REC_PID 2>/dev/null || true' EXIT
echo "● MEREKAM..."

scene() {
  echo
  echo "── ADEGAN $1 ──────────────────────────────────"
  echo "  $2"
  echo "  Anda punya $3 detik."
  sleep "$3"
}

scene 1 "Buka tab Qur'an → tap surah Al-Fatiha (surah pertama) → TUNGGUNG sampai layar detail muncul lengkap dengan kartu Murottal" 15
scene 2 "Tekan tombol PLAY (⏵) di kartu murottal → biarkan audio terdengar jelas 8-10 detik (progress bar berjalan)" 12
scene 3 "Tekan tombol HOME → buka layar utama / app lain → audio HARUS tetap bermain (ini inti demo foreground service)" 12
scene 4 "Tarik notification shade dari atas → tunjukkan notifikasi media Muslim Hub (judul + kontrol pause/play) — tahan 6-8 detik agar terlihat jelas" 10
scene 5 "Tekan PAUSE di notifikasi → audio berhenti → tutup shade" 8

echo
echo "Menghentikan rekaman..."
sleep 2
"$ADB" shell killall -INT screenrecord 2>/dev/null || kill -INT $REC_PID 2>/dev/null || true
sleep 3
kill $REC_PID 2>/dev/null || true

echo "Mengunduh video..."
"$ADB" pull "$DEVICE_FILE" "$LOCAL_FILE"
"$ADB" shell rm -f "$DEVICE_FILE"

echo
echo "✓ Selesai: $LOCAL_FILE"
ls -lh "$LOCAL_FILE"
echo
echo "SEBELUM UPLOAD (opsional, biar kecil):"
echo "  ffmpeg -i \"$LOCAL_FILE\" -vcodec libx264 -crf 28 -preset fast -an \"/tmp/fgs-demo-small.mp4\""
echo "  (tanpa audio pun diperbolehkan — notifikasi media tetap terlihat)"
echo
echo "UPLOAD KE PLAY CONSOLE:"
echo "  App content → Media playback declaration → kolom video → tempel link"
echo "  Saran host: unggah ke YouTube sebagai UNLISTED, lalu tempel URL-nya."
