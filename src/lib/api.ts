import Constants from 'expo-constants';
import {
  ApiEnvelope,
  AsmaulHusnaItem,
  AyatKursi,
  BacaanShalatItem,
  DoaHarianItem,
  DoaItem,
  DzikirItem,
  DzikirKind,
  HadithBook,
  HadithByNumberData,
  HadithRangeData,
  KisahNabiItem,
  NiatShalatItem,
  PrayerTimesData,
  SurahDetail,
  SurahSummary,
  TahlilItem,
  WiridItem,
} from './types';

const API_BASE = 'https://api.qalbun.my.id';
const API_KEY =
  (Constants.expoConfig?.extra?.apiKey as string | undefined) ??
  '';

interface WallpaerResponse {
  code: number;
  success: boolean;
  url: string;
}

interface QalbunAIResponse {
  message?: string;
  data: { result: string };
}

async function apiGet<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const search = new URLSearchParams({ apikey: API_KEY });
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
    }
  }
  const url = `${API_BASE}${path}?${search.toString()}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Permintaan gagal (${res.status}). Periksa koneksi internet Anda.`);
  }
  const json = (await res.json()) as T;
  return json;
}

/* ---------------------------------- Quran --------------------------------- */

export async function getSurahList(): Promise<SurahSummary[]> {
  const json = await apiGet<ApiEnvelope<{ data: SurahSummary[] }>>('/api/quran/');
  return json.results.data;
}

export async function getSurahDetail(surah: number | string): Promise<SurahDetail> {
  const json = await apiGet<ApiEnvelope<{ data: SurahDetail }>>('/api/quran', { surah });
  return json.results.data;
}

export async function getAyat(surah: number | string, ayat: number | string): Promise<SurahDetail> {
  const json = await apiGet<ApiEnvelope<{ data: SurahDetail }>>('/api/quran', { surah, ayat });
  return json.results.data;
}

export async function getAyatKursi(): Promise<AyatKursi> {
  const json = await apiGet<ApiEnvelope<{ data: AyatKursi }>>('/api-json/ayat-kursi');
  return json.results.data;
}

/* --------------------------------- Hadith --------------------------------- */

export async function getHadithBooks(): Promise<HadithBook[]> {
  const json = await apiGet<ApiEnvelope<{ data: HadithBook[] }>>('/api/hadith/');
  return json.results.data;
}

export async function getHadithByNumber(kitab: string, nomor: number | string): Promise<HadithByNumberData> {
  const json = await apiGet<ApiEnvelope<{ data: HadithByNumberData }>>('/api/hadith', { kitab, nomor });
  return json.results.data;
}

export async function getHadithByRange(kitab: string, range: string): Promise<HadithRangeData> {
  const json = await apiGet<ApiEnvelope<{ data: HadithRangeData }>>('/api/hadith', { kitab, range });
  return json.results.data;
}

/* ------------------------------ Prayer times ------------------------------ */

export async function getPrayerTimes(opts?: { city?: string; date?: string }): Promise<PrayerTimesData> {
  const json = await apiGet<ApiEnvelope<{ data: PrayerTimesData }>>('/api/jadwal-shalat', {
    city: opts?.city,
    date: opts?.date,
  });
  return json.results.data;
}

/* ------------------------------- Simple JSON ------------------------------ */

export async function getAsmaulHusna(): Promise<AsmaulHusnaItem[]> {
  const json = await apiGet<ApiEnvelope<{ data: AsmaulHusnaItem[] }>>('/api-json/asmaul-husna');
  return json.results.data;
}

export async function getNiatShalat(): Promise<NiatShalatItem[]> {
  const json = await apiGet<ApiEnvelope<NiatShalatItem[]>>('/api-json/niat-shalat');
  return json.results;
}

export async function getDoaPilihan(): Promise<DoaItem[]> {
  const json = await apiGet<ApiEnvelope<DoaItem[]>>('/api-json/doa-pilihan');
  return json.results;
}

export async function getDoaHarian(): Promise<DoaHarianItem[]> {
  const json = await apiGet<ApiEnvelope<{ data: DoaHarianItem[] }>>('/api-json/doa-harian');
  return json.results.data;
}

export async function getTahlil(): Promise<TahlilItem[]> {
  const json = await apiGet<ApiEnvelope<{ data: TahlilItem[]; source: string }>>('/api-json/tahlil');
  return json.results.data;
}

export async function getWirid(): Promise<WiridItem[]> {
  const json = await apiGet<ApiEnvelope<{ data: WiridItem[] }>>('/api-json/wirid');
  return json.results.data;
}

export async function getDzikir(kind: DzikirKind): Promise<DzikirItem[]> {
  const json = await apiGet<ApiEnvelope<DzikirItem[]>>(`/api-json/${kind}`);
  return json.results;
}

export async function getKisahNabi(): Promise<KisahNabiItem[]> {
  const json = await apiGet<ApiEnvelope<KisahNabiItem[]>>('/api-json/kisah-nabi');
  return json.results;
}

export async function getBacaanShalat(): Promise<BacaanShalatItem[]> {
  const json = await apiGet<ApiEnvelope<BacaanShalatItem[]>>('/api-json/bacaan-shalat');
  return json.results;
}

/* --------------------------------- Extras --------------------------------- */

export async function getRandomWallpaper(): Promise<string> {
  const json = await apiGet<WallpaerResponse>('/api/random-wallpaper');
  return json.url;
}

export async function askQalbunAI(text: string): Promise<string> {
  const json = await apiGet<QalbunAIResponse>('/api/qalbun-ai', { text });
  return json.data.result;
}

export function getIqraPdfUrl(vol: number | string): string {
  return `${API_BASE}/api/data/pdf/iqra/${vol}?apikey=${API_KEY}`;
}
