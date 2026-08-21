export interface ApiEnvelope<T> {
  status?: number;
  message?: string;
  remainingLimit?: number;
  results: T;
}

/* ---------------------------------- Quran --------------------------------- */

export interface SurahSummary {
  number: number;
  sequence: number;
  numberOfVerses: number;
  name: {
    short: string;
    long: string;
    transliteration: { en: string; id: string };
    translation: { en: string; id: string };
  };
  revelation: { arab: string; en: string; id: string };
  tafsir: { id: string };
}

export interface Verse {
  number: { inQuran: number; inSurah: number };
  text: { arab: string; transliteration?: { en: string; id?: string } };
  translation?: { en: string; id: string };
  tafsir?: { id?: { short?: string; long?: string }; kemenag?: { id?: string; short?: string } };
  audio?: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

export interface SurahDetail extends SurahSummary {
  preBismillah: {
    text: { arab: string; transliteration?: { en?: string } };
    translation?: { en?: string; id?: string };
    audio?: Record<string, unknown>;
  } | null;
  verses: Verse[];
}

export interface AyatKursi {
  arabic?: string;
  latin?: string;
  translation?: string;
  tafsir: string;
}

/* --------------------------------- Hadith --------------------------------- */

export interface HadithBook {
  name: string;
  id: string;
  available: number;
}

export interface HadithContent {
  number: number;
  arab: string;
  id: string;
}

export interface HadithByNumberData {
  name: string;
  id: string;
  available: number;
  contents: HadithContent;
}

export interface HadithRangeData {
  name: string;
  id: string;
  available: number;
  requested: number;
  hadiths: HadithContent[];
}

/* ------------------------------ Prayer times ------------------------------ */

export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
  Firstthird: string;
  Lastthird: string;
}

export interface PrayerTimesData {
  timings: PrayerTimings;
  date?: {
    readable?: string;
    timestamp?: string;
    hijri?: {
      date?: string;
      day?: string;
      weekday?: { en?: string; ar?: string };
      month?: { number?: number; en?: string; ar?: string };
      year?: string;
    };
    gregorian?: Record<string, unknown>;
  };
  meta?: Record<string, unknown>;
}

/* ------------------------------- Simple JSON ------------------------------ */

export interface AsmaulHusnaItem {
  index: string;
  latin: string;
  arabic: string;
  translation_id: string;
  translation_en: string;
}

export interface NiatShalatItem {
  id: number;
  name: string;
  arabic: string;
  latin: string;
  terjemahan: string;
}

export interface DoaItem {
  title: string;
  arabic: string;
  latin: string;
  translation: string;
  notes?: string;
  fawaid?: string;
  source?: string;
}

export interface DoaHarianItem {
  title: string;
  arabic: string;
  latin: string;
  translation: string;
}

export interface TahlilItem {
  id: number;
  title: string;
  arabic: string;
  translation: string;
}

export interface WiridItem {
  id: number;
  times: number;
  arabic: string;
  tnc?: string;
}

export type DzikirKind = 'dzikir-pagi' | 'dzikir-petang' | 'dzikir-setelah-shalat';

export interface DzikirItem {
  title: string;
  arabic: string;
  latin?: string;
  translation: string;
  notes?: string;
  fawaid?: string;
  source?: string;
}

export interface KisahNabiItem {
  name: string;
  thn_kelahiran: string;
  usia: string;
  description: string;
}

export interface BacaanShalatItem {
  id: number;
  name: string;
  arabic: string;
  latin: string;
  terjemahan: string;
}
