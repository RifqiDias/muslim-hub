#!/usr/bin/env bash
# ============================================================
# Muslim Hub — FAST local AAB build (ala `flutter build appbundle`)
#
# Perintah: bash scripts/build-aab-fast.sh
#
# - Menggunakan folder android/ persisten (dibuat otomatis oleh
#   prebuild saat pertama kali, atau jika belum ada).
# - Signing: keystore 1000 tahun Anda, password dibaca dari
#   credentials/keystore.env lewat ENV (tidak ditulis ke file).
# - versionCode: auto-increment lokal (file android/.versioncode)
#   — PENTING: jaga tetap > versi EAS terakhir (cek dashboard).
# - Compile murni Gradle lokal: tanpa EAS, tanpa cloud, tanpa npx.
#
# Setelah mengubah app.json / menambah modul expo:
#   bash scripts/build-aab-fast.sh --sync   (jalankan prebuild ulang)
# ============================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@17}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$HOME/Library/pnpm:$PATH"

GRADLE="$ROOT/android/gradlew"
OUT_DIR="$ROOT/dist"
OUT_AAB="$OUT_DIR/MuslimHub-release.aab"
VC_FILE="$ROOT/android/.versioncode"
LAST_EAS_VC=15

say() { printf '\n\033[1;32m▸ %s\033[0m\n' "$*"; }
die() { printf '\n\033[1;31mGAGAL: %s\033[0m\n\n' "$*" >&2; exit 1; }

# --- env secrets (tidak pernah di-commit) ---
[ -f credentials/keystore.env ] || die "credentials/keystore.env tidak ada"
set -a; . credentials/keystore.env; set +a
: "${MUSLIMHUB_KEYSTORE_PASSWORD:?pass kosong}" "${MUSLIMHUB_KEYSTORE_ALIAS:?alias kosong}"
export MUSLIMHUB_STORE_FILE="$ROOT/credentials/muslim-hub-upload.jks"
export MUSLIMHUB_STORE_PASSWORD="$MUSLIMHUB_KEYSTORE_PASSWORD"
export MUSLIMHUB_KEY_ALIAS="$MUSLIMHUB_KEYSTORE_ALIAS"
export MUSLIMHUB_KEY_PASSWORD="${MUSLIMHUB_KEY_PASSWORD:-$MUSLIMHUB_KEYSTORE_PASSWORD}"
[ -f "$MUSLIMHUB_STORE_FILE" ] || die "keystore tidak ditemukan: $MUSLIMHUB_STORE_FILE"

# --- .env untuk EXPO_PUBLIC_* (dibake ke bundle) ---
if [ -f .env ]; then set -a; . .env; set +a; fi

# --- prebuild bila perlu ---
if [ ! -x "$GRADLE" ] || [ "${1:-}" = "--sync" ]; then
  say "Menyiapkan project android (prebuild)"
  pnpm exec expo prebuild -p android --no-install
fi
[ -x "$GRADLE" ] || die "android/gradlew tidak ada"

# --- inject signingConfig release (idempotent, tanpa secret) ---
GRADLE_FILE="$ROOT/android/app/build.gradle"
if ! grep -q "MUSLIMHUB_RELEASE_SIGNING" "$GRADLE_FILE"; then
  say "Inject signing config release"
  python3 - <<'PY'
import re
p = 'android/app/build.gradle'
src = open(p).read()
block = """signingConfigs {
        // MUSLIMHUB_RELEASE_SIGNING (password via ENV, lihat scripts/build-aab-fast.sh)
        release {
            storeFile file(System.getenv("MUSLIMHUB_STORE_FILE") ?: 'debug.keystore')
            storePassword System.getenv("MUSLIMHUB_STORE_PASSWORD") ?: 'android'
            keyAlias System.getenv("MUSLIMHUB_KEY_ALIAS") ?: 'androiddebugkey'
            keyPassword System.getenv("MUSLIMHUB_KEY_PASSWORD") ?: 'android'
        }
        debug {"""
src = src.replace("signingConfigs {\n        debug {", block, 1)
src = re.sub(r"(release \{[^}]*?)signingConfig signingConfigs\.debug",
             r"\1signingConfig signingConfigs.release", src, count=1, flags=re.S)
open(p, 'w').write(src)
print('  signing config terpasang')
PY
fi

# --- versionCode auto-increment lokal + versionName dari app.json ---
if [ -f "$VC_FILE" ]; then
  VC=$(cat "$VC_FILE")
else
  VC=$((LAST_EAS_VC + 1))
fi
NEXT_VC=$((VC))
VERSION_NAME=$(python3 -c "import json;print(json.load(open('app.json'))['expo']['version'])")
say "versionCode: $NEXT_VC · versionName: $VERSION_NAME"
python3 - "$NEXT_VC" "$VERSION_NAME" <<'PY'
import re, sys
p = 'android/app/build.gradle'
src = open(p).read()
src = re.sub(r"versionCode \d+", f"versionCode {sys.argv[1]}", src, count=1)
src = re.sub(r'versionName "[^"]*"', f'versionName "{sys.argv[2]}"', src, count=1)
open(p, 'w').write(src)
PY

# --- build ---
say "Gradle bundleRelease (incremental)"
"$GRADLE" -p "$ROOT/android" :app:bundleRelease \
  -Pandroid.injected.version.code="$NEXT_VC" \
  -PMYO_ENABLE_RELEASE_COMPILATION_CALLED_FROM_JSI=true

SRC_AAB="$ROOT/android/app/build/outputs/bundle/release/app-release.aab"
[ -f "$SRC_AAB" ] || die "AAB tidak ditemukan di $SRC_AAB"
mkdir -p "$OUT_DIR"
cp "$SRC_AAB" "$OUT_AAB"
echo "$((NEXT_VC + 1))" > "$VC_FILE"

say "Selesai"
ls -lh "$OUT_AAB"
echo "  versionCode: $NEXT_VC  (berikutnya: $((NEXT_VC + 1)))"
