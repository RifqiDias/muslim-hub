import { MyQuranJadwalRaw } from './types';

export interface Timings {
  Imsak: string;
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export const AUTO_CITY_IDS: Record<string, string> = {
  WIB: '1301',
  WITA: '2622',
  WIT: '3329',
};

export function mapTimings(jadwal: MyQuranJadwalRaw): Timings {
  return {
    Imsak: jadwal.imsak,
    Fajr: jadwal.subuh,
    Sunrise: jadwal.terbit,
    Dhuhr: jadwal.dzuhur,
    Asr: jadwal.ashar,
    Maghrib: jadwal.maghrib,
    Isha: jadwal.isya,
  };
}

export function zonaDate(offsetMs: number): Date {
  return new Date(Date.now() + offsetMs);
}

export function zonaDateKey(offsetMs: number): string {
  const shifted = zonaDate(offsetMs);
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const d = String(shifted.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function zonaGregorian(offsetMs: number): string {
  const shifted = zonaDate(offsetMs);
  const asUtc = Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate());
  try {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(asUtc));
  } catch {
    return zonaDateKey(offsetMs);
  }
}

export function zonaHijri(offsetMs: number): string {
  const shifted = zonaDate(offsetMs);
  const asUtc = Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate());
  try {
    return new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(asUtc));
  } catch {
    return '';
  }
}

export function titleCaseWords(value: string): string {
  return value
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
