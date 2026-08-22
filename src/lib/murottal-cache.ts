import * as FileSystem from 'expo-file-system/legacy';
import { getJSON, setJSON } from './storage';

const MANIFEST_KEY = 'muslimhub.murottal.cache';

interface CacheEntry {
  url: string;
  file: string;
  size: number;
}

type Manifest = Record<string, CacheEntry>;

function hashUrl(url: string): string {
  let h = 5381;
  for (let i = 0; i < url.length; i++) {
    h = ((h << 5) + h + url.charCodeAt(i)) >>> 0;
  }
  return `${h.toString(36)}-${url.length.toString(36)}`;
}

let dirReady: Promise<string> | null = null;

function ensureDir(): Promise<string> {
  if (!dirReady) {
    const dir = `${FileSystem.documentDirectory ?? ''}murottal/`;
    dirReady = FileSystem.makeDirectoryAsync(dir, { intermediates: true })
      .catch(() => undefined)
      .then(() => dir);
  }
  return dirReady;
}

async function readManifest(): Promise<Manifest> {
  return (await getJSON<Manifest>(MANIFEST_KEY)) ?? {};
}

async function writeManifest(manifest: Manifest): Promise<void> {
  await setJSON(MANIFEST_KEY, manifest);
}

export async function cachedUriFor(url: string): Promise<string | null> {
  try {
    const manifest = await readManifest();
    const entry = manifest[hashUrl(url)];
    if (!entry) return null;
    const info = await FileSystem.getInfoAsync(entry.file);
    return info.exists ? entry.file : null;
  } catch {
    return null;
  }
}

export async function checkCached(
  urls: string[],
): Promise<{ done: number; total: number; cached: boolean }> {
  if (urls.length === 0) return { done: 0, total: 0, cached: true };
  try {
    const manifest = await readManifest();
    let done = 0;
    await Promise.all(
      urls.map(async (url) => {
        const entry = manifest[hashUrl(url)];
        if (!entry) return;
        const info = await FileSystem.getInfoAsync(entry.file);
        if (info.exists) done += 1;
      }),
    );
    return { done, total: urls.length, cached: done === urls.length };
  } catch {
    return { done: 0, total: urls.length, cached: false };
  }
}

export async function downloadAllToCache(
  urls: string[],
  onProgress?: (done: number, total: number) => void,
): Promise<{ ok: number; failed: number }> {
  const dir = await ensureDir();
  const manifest = await readManifest();
  let ok = 0;
  let failed = 0;
  let done = 0;

  for (const url of urls) {
    const key = hashUrl(url);
    const existing = manifest[key];
    if (existing) {
      const info = await FileSystem.getInfoAsync(existing.file).catch(() => null);
      if (info?.exists) {
        done += 1;
        ok += 1;
        onProgress?.(done, urls.length);
        continue;
      }
    }
    try {
      const ext = url.split('.').pop()?.split('?')[0] ?? 'mp3';
      const target = `${dir}${key}.${ext}`;
      const result = await FileSystem.downloadAsync(url, target);
      if (result && result.status < 400) {
        manifest[key] = { url, file: target, size: result.headers?.['Content-Length'] ? Number(result.headers['Content-Length']) : 0 };
        ok += 1;
      } else {
        failed += 1;
      }
    } catch {
      failed += 1;
    }
    done += 1;
    onProgress?.(done, urls.length);
  }

  await writeManifest(manifest);
  return { ok, failed };
}

export async function removeUrlsFromCache(urls: string[]): Promise<void> {
  try {
    const manifest = await readManifest();
    await Promise.all(
      urls.map(async (url) => {
        const key = hashUrl(url);
        const entry = manifest[key];
        if (entry) {
          await FileSystem.deleteAsync(entry.file, { idempotent: true }).catch(() => undefined);
          delete manifest[key];
        }
      }),
    );
    await writeManifest(manifest);
  } catch {
    // ignore
  }
}
