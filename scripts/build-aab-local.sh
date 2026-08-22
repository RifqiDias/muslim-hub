#!/usr/bin/env bash
# ============================================================
# Muslim Hub — Build AAB produksi LOKAL (tanpa cloud EAS)
#
# Menghasilkan dist/MuslimHub-release.aab dengan keystore
# 1000 tahun (diambil otomatis dari EAS credentials).
#
# Pakai:
#   bash scripts/build-aab-local.sh
#
# Catatan:
#   - Run PERTAMA mengunduh Gradle + dependensi Android
#     (beberapa GB, 20-40 menit). Run berikutnya jauh lebih cepat.
#   - Tetap butuh EXPO_TOKEN / eas login (untuk mengambil keystore
#     dari server EAS; compile tetap 100% lokal).
# ============================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@17}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$HOME/Library/pnpm:$PATH"

OUT_DIR="$ROOT/dist"
OUT_AAB="$OUT_DIR/MuslimHub-release.aab"

say() { printf '\n\033[1;32m▸ %s\033[0m\n' "$*"; }
die() { printf '\n\033[1;31mGAGAL: %s\033[0m\n\n' "$*" >&2; exit 1; }

say "Preflight"
[ -x "$JAVA_HOME/bin/java" ] || die "JDK 17 tidak ada di $JAVA_HOME (brew install openjdk@17)"
"$JAVA_HOME/bin/java" -version 2>&1 | head -1
[ -d "$ANDROID_HOME" ] || die "Android SDK tidak ada di $ANDROID_HOME"
[ -f .env ] || die ".env tidak ada — salin dari .env.example"
grep -q '^EXPO_PUBLIC_QALBUN_API_KEY=..' .env || die "EXPO_PUBLIC_QALBUN_API_KEY kosong"
command -v eas >/dev/null || die "eas-cli tidak ditemukan (pnpm add -g eas-cli)"
mkdir -p "$OUT_DIR"
printf '  JDK: %s\n  SDK: %s\n' "$JAVA_HOME" "$ANDROID_HOME"

if [ -z "${EXPO_TOKEN:-}" ]; then
  if ! eas whoami >/dev/null 2>&1; then
    say "Login EAS (untuk mengambil keystore)"
    eas login
  fi
  say "Build lokal dimulai"
  eas build --platform android --profile production --local --output "$OUT_AAB" --non-interactive
else
  say "Build lokal dimulai (EXPO_TOKEN tersedia)"
  eas build --platform android --profile production --local --output "$OUT_AAB" --non-interactive
fi

say "Selesai"
ls -lh "$OUT_AAB"
echo
echo "Upload ke Play Console:"
echo "  1. Play Console → Testing → Internal → Upload .aab"
echo "  atau: npx eas submit --platform android (butuh service account)"
