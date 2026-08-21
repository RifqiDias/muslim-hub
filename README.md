# Muslim Hub

Aplikasi islami modern berbasis **React Native + Expo SDK 57** — animatif, elegan, siap rilis ke Google Play Store.

![platform](https://img.shields.io/badge/platform-Android-34D399) ![expo](https://img.shields.io/badge/Expo-SDK%2057-000000) ![ts](https://img.shields.io/badge/TypeScript-strict-3178C6)

## Fitur

- **Al Qur'an** — 114 surah, terjemahan Indonesia, tafsir, penanda terakhir dibaca
- **Jadwal Shalat** — waktu shalat per kota/kategori otomatis, countdown realtime, tanggal Hijriah
- **Dzikir** — pagi, petang & setelah shalat dengan mode baca per halaman + progress bar
- **Wirid** — daftar wirid + tasbih digital interaktif (haptic feedback)
- **Hadits** — 9 kitab (Bukhari, Muslim, dst), browsing per rentang + pencarian nomor
- **Asmaul Husna** — 99 nama Allah dengan favorit & berbagi
- **Kisah 25 Nabi** — lengkap dengan detail usia & tahun kelahiran
- **Tahlil, Doa Harian, Doa Pilihan, Niat & Bacaan Shalat, Ayat Kursi**
- **Iqra** — unduh & buka PDF Iqra jilid 1–6
- **Wallpaper Islami** — wallpaper acak dengan simpan ke galeri
- **Tanya Qalbun AI** — asisten tanya-jawab seputar Islam

Semua data dari [api.qalbun.my.id](https://api.qalbun.my.id) dengan **cache lokal 24 jam** (React Query + AsyncStorage) untuk menghemat limit API.

## Struktur

```
src/
├── app/                # expo-router (file-based routing)
│   ├── _layout.tsx     # root: fonts, React Query persistence
│   ├── (tabs)/         # 5 tab: Beranda, Qur'an, Shalat, Dzikir, Lainnya
│   └── ...             # layar fitur lainnya
├── components/ui/      # komponen animatif bersama (Reanimated)
├── lib/
│   ├── api.ts          # klien API bertipe
│   ├── types.ts        # kontrak respons API
│   └── storage.ts      # helper AsyncStorage
└── theme.ts            # desain token (warna, font, spacing)
```

## Menjalankan

> Catatan: gunakan **pnpm** (`node-linker=hoisted` via `.npmrc`). `npm install` diketahui crash di mesin ini.

```bash
pnpm install
pnpm start              # Metro bundler
pnpm android            # jalankan di device/emulator Android
```

## Build & Rilis ke Play Store

1. Login EAS: `npx eas login`
2. Build AAB produksi: `npx eas build --platform android --profile production`
3. Submit ke Play Console: `npx eas submit --platform android` (butuh `GOOGLE_SERVICE_ACCOUNT` / upload manual)
4. Isi listing di Play Console (deskripsi, screenshot, rating kuesioner IARC — kategori religi)

Sebelum rilis pertama, pertimbangkan:
- Ganti `extra.apiKey` di `app.json` dengan API key milik Anda sendiri
- Set `android.package` (`com.muslimhub.app`) ke package name unik milik Anda
- Isi `privacyPolicyUrl` di Play Console (app meminta izin lokasi & penyimpanan)

## Konvensi

- TypeScript strict, tanpa komentar kode
- Teks Arab selalu melalui `ArabicText` (font Amiri, RTL)
- Semua tombol melalui `PressableScale` (animasi scale + haptic)
- Query React Query dengan `staleTime` 24 jam — jangan polling (API berlimit)
