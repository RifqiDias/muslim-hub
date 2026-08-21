import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getJSON<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function setJSON(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable: ignore
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export const StorageKeys = {
  lastReadSurah: 'muslimhub.lastReadSurah',
  favoriteDoa: 'muslimhub.fav.doa',
  favoriteAsmaul: 'muslimhub.fav.asmaul',
  city: 'muslimhub.city',
  cityV2: 'muslimhub.city.v2',
} as const;

export async function getString(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function setString(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    // ignore
  }
}
