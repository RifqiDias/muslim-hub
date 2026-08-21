import { useQuery } from '@tanstack/react-query';
import { getMyQuranTime } from './api';
import { AUTO_CITY_IDS } from './jadwal';

const ZONA_FALLBACK_HOURS: Record<string, number> = {
  WIB: 7,
  WITA: 8,
  WIT: 9,
};

function parseZonaOffsetMs(zona: string, bagian: string): number {
  const match = /UTC([+-])(\d{1,2})/.exec(zona);
  if (match) {
    const sign = match[1] === '-' ? -1 : 1;
    return sign * Number(match[2]) * 3600000;
  }
  return (ZONA_FALLBACK_HOURS[bagian] ?? 7) * 3600000;
}

export function useZonaTime() {
  const query = useQuery({
    queryKey: ['server-time'],
    queryFn: getMyQuranTime,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    retry: 1,
  });

  const bagian = query.data?.bagian ?? 'WIB';
  const zonaOffsetMs = parseZonaOffsetMs(query.data?.zona ?? '', bagian);
  const zonaCityId = AUTO_CITY_IDS[bagian] ?? AUTO_CITY_IDS.WIB;

  return { bagian, zonaOffsetMs, zonaCityId };
}

export function zonaSecondsOfDay(offsetMs: number): number {
  const shifted = new Date(Date.now() + offsetMs);
  return shifted.getUTCHours() * 3600 + shifted.getUTCMinutes() * 60 + shifted.getUTCSeconds();
}

export function zonaMinutesOfDay(offsetMs: number): number {
  return Math.floor(zonaSecondsOfDay(offsetMs) / 60);
}
