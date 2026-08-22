import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

let player: AudioPlayer | null = null;
let currentUrl: string | null = null;

export function getMurottalPlayer(): AudioPlayer {
  if (!player) {
    player = createAudioPlayer();
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    }).catch(() => undefined);
  }
  return player;
}

export function replaceMurottalSource(target: AudioPlayer, url: string): void {
  if (currentUrl === url) return;
  target.setActiveForLockScreen(false);
  currentUrl = url;
  target.replace({ uri: url });
}

export function getMurottalCurrentUrl(): string | null {
  return currentUrl;
}

let playingSurah: number | null = null;
const playingListeners = new Set<() => void>();

export function setPlayingSurah(value: number | null): void {
  playingSurah = value;
  playingListeners.forEach((listener) => listener());
}

export function subscribePlayingSurah(listener: () => void): () => void {
  playingListeners.add(listener);
  return () => {
    playingListeners.delete(listener);
  };
}

export function getPlayingSurah(): number | null {
  return playingSurah;
}
