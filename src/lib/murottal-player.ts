import Constants from 'expo-constants';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

const isExpoGo = Constants.executionEnvironment === 'storeClient';

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

export function activateMurottalLockScreen(
  target: AudioPlayer,
  metadata: { title: string; artist?: string; albumTitle?: string },
): void {
  if (isExpoGo) return;
  target.setActiveForLockScreen(true, metadata, {
    showSeekForward: false,
    showSeekBackward: false,
  });
}

export function deactivateMurottalLockScreen(target: AudioPlayer): void {
  if (isExpoGo) return;
  target.setActiveForLockScreen(false);
}

export function replaceMurottalSource(target: AudioPlayer, url: string): void {
  if (currentUrl === url) return;
  deactivateMurottalLockScreen(target);
  currentUrl = url;
  target.replace({ uri: url });
}

export function getMurottalCurrentUrl(): string | null {
  return currentUrl;
}

let activeSurah: number | null = null;

export function setActiveSurah(value: number | null): void {
  activeSurah = value;
}

export function getActiveSurah(): number | null {
  return activeSurah;
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
