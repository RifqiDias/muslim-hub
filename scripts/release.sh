#!/usr/bin/env bash
# ============================================================
# Muslim Hub — Release Pipeline (AAB + kebutuhan visual)
#
# Paket lengkap siap upload ke Google Play Console.
#
# Pemakaian:
#   bash scripts/release.sh            # semua fase berurutan
#   bash scripts/release.sh preflight  # hanya cek kode & bundel
#   bash scripts/release.sh screenshots
#   bash scripts/release.sh build      # hanya build AAB (EAS)
#   bash scripts/release.sh artifacts  # ringkasan hasil & checklist
#
# Prasyarat:
#   - .env berisi EXPO_PUBLIC_QALBUN_API_KEY
#   - eas login sudah dilakukan (untuk fase build)
#   - HP terhubung USB debugging (untuk fase screenshots)
# ============================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

STORE_DIR="$ROOT/assets/store"
EXPORT_TMP="$(mktemp -d /tmp/muslimhub-export.XXXXXX)"
STEP=0
NOTE_FILE="$(mktemp /tmp/muslimhub-notes.XXXXXX)"

say()  { printf '\n\033[1;32m[%d] %s\033[0m\n' "$((++STEP))" "$*"; }
info() { printf '    %s\n' "$*"; }
die()  { printf '\n\033[1;31mGAGAL: %s\033[0m\n\n' "$*" >&2; exit 1; }
trap 'rm -rf "$EXPORT_TMP" "$NOTE_FILE"' EXIT

# ------------------------------------------------------------
preflight_env() {
  say "Preflight: environment"
  command -v node >/dev/null || die "node tidak ditemukan"
  command -v pnpm >/dev/null || die "pnpm tidak ditemukan (npm diketahui bermasalah di mesin ini)"
  command -v eas >/dev/null || die "eas-cli belum terpasang/PATH — jalankan: pnpm add -g eas-cli (lalu buka ulang terminal)"
  [ -d node_modules ] || die "node_modules hilang — jalankan: pnpm install"
  [ -f .env ] || die ".env tidak ada — salin dari .env.example lalu isi EXPO_PUBLIC_QALBUN_API_KEY"
  grep -q '^EXPO_PUBLIC_QALBUN_API_KEY=..' .env || die "EXPO_PUBLIC_QALBUN_API_KEY kosong di .env"
  grep -q '^credentials/' .gitignore || die "credentials/ tidak di-gitignore!"
  info "node $(node -v) · pnpm $(pnpm -v) · eas $(eas --version 2>/dev/null | cut -d/ -f2) · .env OK"
}

preflight_code() {
  say "Preflight: TypeScript strict"
  npx tsc --noEmit
  info "tsc bersih"

  say "Preflight: ESLint"
  pnpm exec expo lint
  info "lint bersih"

  say "Preflight: smoke test bundel produksi (Hermes)"
  pnpm exec expo export --platform android --output-dir "$EXPORT_TMP" >/dev/null 2>&1
  info "bundel produksi sukses ($(du -sh "$EXPORT_TMP" | cut -f1))"
}

check_store_assets() {
  say "Cek aset visual Play Store"
  local missing=0

  check_img() {
    local file="$1" w="$2" h="$3" label="$4"
    if [ ! -f "$STORE_DIR/$file" ]; then
      info "✗ $label hilang: assets/store/$file"; missing=1; return
    fi
    local dims
    dims=$(sips -g pixelWidth -g pixelHeight "$STORE_DIR/$file" 2>/dev/null \
      | awk '/pixelWidth/{w=$2} /pixelHeight/{h=$2} END{print w"x"h}')
    if [ "$dims" != "$w"x"$h" ]; then
      info "✗ $label salah dimensi: $dims (harus ${w}x${h})"; missing=1
    else
      info "✓ $label ${w}x${h}"
    fi
  }

  check_img play-icon-512.png 512 512 "Ikon Play Store"
  check_img feature-graphic.png 1024 500 "Feature graphic"

  local shots
  shots=$(ls "$STORE_DIR"/screenshot-*.png 2>/dev/null | wc -l | tr -d ' ')
  if [ "${shots:-0}" -lt 2 ]; then
    info "✗ Screenshot phone kurang dari 2 (saat ini: $shots) — jalankan fase screenshots"
    missing=1
  else
    info "✓ Screenshot phone: $shots file"
  fi

  [ "$missing" -eq 0 ] || echo "ASSET_VISUAL_KURANG=1" >> "$NOTE_FILE"
  return 0
}

capture_screenshots() {
  say "Screenshot dari device (8 layar, jeda 5 detik tiap layar)"
  command -v adb >/dev/null || die "adb tidak ditemukan (install platform-tools)"
  adb wait-for-device
  bash scripts/capture-screenshots.sh 8 5
  info "Screenshot tersimpan di assets/store/screenshot-*.png"
  info "Rekomendasi urutan: beranda → jadwal → mushaf → detail surah → dzikir baca → wirid → hadits → tentang"
}

build_aab() {
  say "Login check EAS"
  eas whoami >/dev/null 2>&1 || die "belum login EAS — jalankan: eas login"

  say "Pastikan upload keystore terdaftar (interaktif bila belum)"
  info "Jika diminta keystore: pilih 'I want to upload my own keystore'"
  info "  path   : credentials/muslim-hub-upload.jks"
  info "  alias  : muslimhub  (password di credentials/keystore.env)"
  eas credentials -p android || true

  say "Build AAB produksi (EAS cloud)"
  eas build --platform android --profile production --non-interactive
  info "AAB selesai — URL unduh tampil di output EAS di atas"
}

artifacts_summary() {
  say "Ringkasan artefak & checklist upload"

  echo
  echo "  ┌─ ARTEFAK ────────────────────────────────────────────"
  echo "  │ AAB produksi        : unduh dari dashboard EAS / output build"
  echo "  │ Ikon 512x512       : assets/store/play-icon-512.png"
  echo "  │ Feature graphic    : assets/store/feature-graphic.png"
  echo "  │ Screenshots        : assets/store/screenshot-*.png"
  echo "  └──────────────────────────────────────────────────────"
  echo
  echo "  ┌─ PLAY CONSOLE ───────────────────────────────────────"
  echo "  │ Package name        : rifqi.muslimhub (permanen)"
  echo "  │ Upload              : Play Console → Testing → Internal"
  echo "  │ Akun personal baru  : closed test 12 tester / 14 hari"
  echo "  │                       lalu Apply for production"
  echo "  │ Data safety         : lokasi=ephemeral, chat AI=collect, ads=tidak"
  echo "  │ Panduan lengkap     : docs/PLAYSTORE-CHECKLIST.md"
  echo "  └──────────────────────────────────────────────────────"
  echo

  if grep -q ASSET_VISUAL_KURANG "$NOTE_FILE" 2>/dev/null; then
    echo "  ⚠ Ada aset visual belum lengkap — lihat catatan fase sebelumnya."
  fi
}

run_all() {
  preflight_env
  preflight_code
  check_store_assets
  capture_screenshots
  check_store_assets
  build_aab
  artifacts_summary
}

case "${1:-all}" in
  preflight)   preflight_env; preflight_code ;;
  screenshots) capture_screenshots ;;
  assets)      check_store_assets ;;
  build)       preflight_code; build_aab ;;
  artifacts)   artifacts_summary ;;
  all)         run_all ;;
  *) die "Fase tidak dikenal: $1 (pilihan: preflight|screenshots|assets|build|artifacts|all)" ;;
esac

printf '\n\033[1;32mSelesai tanpa error.\033[0m\n'
