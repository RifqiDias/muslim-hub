# Panduan Rilis Muslim Hub ke Google Play Store

Disusun dari dokumentasi resmi Google Play Console & Expo SDK 57 (diverifikasi 21 Agu 2026). Package ID: **`rifqi.muslimhub`** (valid: 2 segmen, tiap segmen diawali huruf, hanya huruf/angka/underscore; unik & **permanen selamanya** — tidak bisa dihapus/dipakai ulang).

---

## 1. Akun Publisher (developer personal)

| Hal | Ketentuan |
|---|---|
| Biaya | **US$25 sekali bayar** — kartu kredit/debit (MasterCard/Visa/Amex; **prepaid ditolak**), usia ≥18 th |
| Verifikasi | KTP/paspor + kartu atas nama yang sama; verifikasi perangkat Android via app Play Console |
| Syarat akun personal baru (dibuat setelah 13 Nov 2023) | **Closed test ≥12 tester opt-in selama 14 hari berturut-turut** → baru bisa apply production (review ≤7 hari) |

Sumber: [6112435](https://support.google.com/googleplay/android-developer/answer/6112435), [14151465](https://support.google.com/googleplay/android-developer/answer/14151465)

## 2. Build AAB (Expo EAS)

Expo SDK 57 → **compileSdk/targetSdk 36 (Android 16)** — sudah memenuhi syarat Play untuk app baru per 31 Agu 2026 (wajib API 36).

```bash
npx eas login
npx eas build --platform android --profile production   # saat ditanya keystore: "Generate new keystore"
npx eas submit --platform android --auto-submit-with-build=latest  # atau upload manual .aab
```

- App baru **wajib format .aab** (APK tidak diterima) — profil `production` di `eas.json` sudah `aab`.
- Play App Signing otomatis; EAS menyimpan upload keystore.
- Submit via EAS butuh **Google Service Account key JSON** ([panduan](https://expo.fyi/creating-google-service-account), upload via `eas credentials`); atau upload manual .aab ke Play Console.
- **Sebelum build**: app harus sudah dibuat dulu di Play Console ("Create app") dengan package `rifqi.muslimhub`.

Sumber: [AAB](https://support.google.com/googleplay/android-developer/answer/9844279), [App Signing](https://support.google.com/googleplay/android-developer/answer/9842756), [target API](https://support.google.com/googleplay/android-developer/answer/11926878), [Expo build](https://docs.expo.dev/build/setup/), [Expo submit](https://docs.expo.dev/submit/android/)

## 3. Store Listing — field teks

| Field | Limit | Siap diisi (contoh) |
|---|---|---|
| App name | **30 karakter** | `Muslim Hub: Al Qur'an & Jadwal Shalat` (34 — potong: `Muslim Hub — Qur'an & Shalat`) |
| Short description | **80 karakter** | `Al Qur'an, jadwal shalat, dzikir, hadits, & doa harian dalam satu aplikasi` |
| Full description | **4.000 karakter** | Tulis fitur lengkap + kata kunci |
| Bahasa default | en-US | Tambahkan terjemahan `id` + aset per bahasa bila perlu |

Larangan: kata "Free/Best/#1/No Ads" di judul. Sumber: [9859152](https://support.google.com/googleplay/android-developer/answer/9859152), [13393723](https://support.google.com/googleplay/android-developer/answer/13393723)

## 4. Aset grafis (wajib)

| Aset | Spesifikasi | Status project |
|---|---|---|
| Ikon Play Store | **512×512, 32-bit PNG (alpha), ≤1.024 KB** | ✅ `assets/store/play-icon-512.png` |
| Feature graphic | **1024×500, JPEG/24-bit PNG (TANPA alpha)**, visual di tengah, minim teks | ✅ `assets/store/feature-graphic.png` |
| Screenshot phone | **min 2, maks 8**; JPEG/24-bit PNG no alpha; dimensi 320–3840px; sisi terpanjang ≤2× sisi terpendek; rekomendasi ≥4 buah @≥1080px | 📸 `bash scripts/capture-screenshots.sh 8 4` |
| Tablet (7"/10") | Bila diaktifkan distribusinya: min 4 screenshot, 1080–7690px, 16:9 / 9:16 | Opsional (skip dulu) |
| Promo video | Opsional; 1 URL YouTube (public/unlisted, tanpa ads, embeddable) | Opsional |

Sumber: [9866151](https://support.google.com/googleplay/android-developer/answer/9866151)

Rekomendasi 8 screenshot: beranda, detail surah (ayat), jadwal shalat + countdown, dzikir mode baca, tasbih wirid, hadits, asmaul husna, chat AI.

## 5. Kategori, tag & kontak

- **Kategori**: `Lifestyle` (paling umum untuk app islami; alternatif `Books & Reference`) — tidak ada kategori "Religi" di Play.
- **Tag**: maks 5 (pilih yang relevan: Quran, Prayer, dll dari daftar suggested tags).
- **Kontak**: **email wajib**; telepon opsional; website opsional tapi disarankan.

Sumber: [9859673](https://support.google.com/googleplay/android-developer/answer/9859673), [9859152](https://support.google.com/googleplay/android-developer/answer/9859152)

## 6. App content (Policy → App content)

1. **Privacy policy** — WAJIB URL aktif meski app tidak mengumpulkan data.
2. **Data safety** — jawab:
   - Lokasi untuk jadwal shalat yang dikirim ke API → deklarasikan sebagai **ephemeral** (contoh resmi Google persis: app cuaca) → tidak tampil di listing.
   - **Chat AI**: teks user dikirim ke server pihak ketiga → deklarasikan **collect** (tipe "Other user-generated content"); cek apakah vendor AI = service provider (tdk perlu "share").
   - Tanpa akun → tidak ada deklarasi account.
3. **Ads declaration** → **No** (tanpa iklan).
4. **Content rating IARC** — isi kuesioner: tanpa kekerasan/konten sensitif → hasil umumnya PEGI 3 / ESRB Everyone.
5. **Target audience** — pilih 13+ (jangan <13; ada fitur chat AI pihak ketiga).
6. **App access** — semua fitur terbuka tanpa restriksi.
7. **News app / government / financial** — semua No.

Sumber: [Data safety](https://support.google.com/googleplay/android-developer/answer/10787469), [Content rating](https://support.google.com/googleplay/android-developer/answer/9859655), [Prepare review](https://support.google.com/googleplay/android-developer/answer/9859455)

## 7. Urutan rilis (checklist final)

1. Daftar akun developer (US$25, verifikasi ID + perangkat).
2. Play Console → **Create app** (nama "Muslim Hub", package `rifqi.muslimhub`).
3. Lengkapi store listing + aset + app content (bagian 3–6).
4. `npx eas build --platform android --profile production` → AAB.
5. Upload ke **internal testing** → cek di device.
6. Promote ke **closed testing** → kumpul ≥12 tester opt-in selama **14 hari** (akun personal baru).
7. Dashboard → **Apply for production** (3 form) → review ≤7 hari.
8. Production rollout (negara: Indonesia dulu) → tayang.

## 8. Sebelum production (opsional tapi disarankan)

- Ganti `extra.apiKey` di `app.json` dengan API key Anda sendiri (jangan pakai key yang di-hardcode bersama repo publik).
- Siapkan privacy policy (bisa GitHub Pages / Notion publik).
- Screenshot device asli via `scripts/capture-screenshots.sh`.
