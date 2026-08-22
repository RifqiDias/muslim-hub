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
