# Persiapan Release Android

## 1. Upload keystore (sudah dibuat)

Lokasi: `credentials/muslim-hub-upload.jks` (tidak akan masuk git).

| Properti | Nilai |
|---|---|
| Format | JKS (RSA 2048, SHA256withRSA) |
| Alias | `muslimhub` |
| Validitas | 21 Agu 2026 – **29 Agu 3026** (1000 tahun) |
| Owner | CN=Muslim Hub, O=RifqiDias, C=ID |
| Password | lihat `credentials/keystore.env` |

## 2. Backup keystore (WAJIB)

Simpan 3 file ini di tempat aman (cloud pribadi + flashdisk):
- `credentials/muslim-hub-upload.jks`
- `credentials/keystore.env` (password)
- SHA256 fingerprint (untuk verifikasi): `05:13:EB:BF:5C:81:51:47:86:95:3A:23:72:A9:A8:1C:39:B9:E7:B0:41:A0:4E:8A:5A:2B:E6:26:AD:21:6D:BC`

> Kehilangan upload keystore = tidak bisa update app dengan package yang sama
> (walau app signing key tetap aman di Google Play App Signing).

## 3. Daftarkan keystore ke EAS

```bash
npx eas login
npx eas credentials -p android
```

Pilih:
1. Android keystore → **Set up a new keystore** → **Upload an existing keystore**
2. Path: `credentials/muslim-hub-upload.jks`
3. Alias: `muslimhub`, password sesuai `credentials/keystore.env` (key password = store password)

Alternatif tanpa CLI: saat `eas build` pertama, jawab "I want to upload my own keystore".

## 4. Build AAB produksi

```bash
npx eas build --platform android --profile production
```

Setelah selesai, download `.aab` atau submit langsung:

```bash
npx eas submit --platform android --latest
```

(butuh Google Service Account key — panduan: https://expo.fyi/creating-google-service-account,
atau upload manual .aab ke Play Console → Internal testing.)

## 5. Checklist Play Console (ringkas)

Lengkap di `docs/PLAYSTORE-CHECKLIST.md`. Poin kritis:
- Akun developer US$25 + verifikasi identitas
- Package name: `rifqi.muslimhub` (permanen)
- Aset: ikon 512×512 (`assets/store/play-icon-512.png`), feature graphic 1024×500
  (`assets/store/feature-graphic.png`), min 2 screenshot (`bash scripts/capture-screenshots.sh 8 4`)
- Akun personal baru: closed test ≥12 tester, 14 hari berturut-turut sebelum production
- Data safety: lokasi ephemeral (jadwal shalat), chat AI = collect; ads = tidak
