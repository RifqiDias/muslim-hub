import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { PressableScale } from '@/components/ui/pressable-scale';
import { registerStrings, useLang } from '@/i18n';
import {
  activateMurottalLockScreen,
  deactivateMurottalLockScreen,
  getActiveSurah,
  getMurottalCurrentUrl,
  getMurottalPlayer,
  getPlayingSurah,
  setActiveSurah,
  setPlayingSurah,
} from '@/lib/murottal-player';
import { getString, setString } from '@/lib/storage';
import { QuranJsonReciter } from '@/lib/types';
import { ThemeColors, font, radius, shadow, spacing, useTheme } from '@/theme';

registerStrings('audio', {
  reciter: 'Qari',
  changeReciter: 'Ganti Qari',
  murottal: 'Murottal',
  nowPlaying: 'Sedang diputar',
  ready: 'Siap diputar',
  buffering: 'Memuat audio...',
  error: 'Audio gagal dimuat',
  modeSurah: 'Per Surah',
  modeAyah: 'Per Ayat',
  verse: 'Ayat',
  finished: 'Selesai',
}, {
  reciter: 'Reciter',
  changeReciter: 'Change Reciter',
  murottal: 'Murottal',
  nowPlaying: 'Now playing',
  ready: 'Ready to play',
  buffering: 'Loading audio...',
  error: 'Failed to load audio',
  modeSurah: 'Full surah',
  modeAyah: 'Verse by verse',
  verse: 'Verse',
  finished: 'Finished',
});

const RECITER_KEY = 'muslimhub.quran.reciter';

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export type MurottalMode = 'surah' | 'ayah';

interface QuranAudioPlayerProps {
  recitations: QuranJsonReciter[];
  surahLabel: string;
  surahNumber: number;
  totalVerses: number;
  getAyahAudioUrl: (ayah: number) => string;
  onPlayingAyahChange?: (ayah: number | null) => void;
  autoPlay?: boolean;
  autoPlayMode?: MurottalMode;
  style?: ViewStyle;
}

export function QuranAudioPlayer({
  recitations,
  surahLabel,
  surahNumber,
  totalVerses,
  getAyahAudioUrl,
  onPlayingAyahChange,
  autoPlay = false,
  autoPlayMode = 'surah',
  style,
}: QuranAudioPlayerProps) {
  const { t } = useLang();
  const { colors, gradients, scheme } = useTheme();
  const styles = useMemo(() => makeStyles(colors, scheme), [colors, scheme]);

  const [reciterIndex, setReciterIndex] = useState(0);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [mode, setMode] = useState<MurottalMode>(autoPlayMode);
  const [currentAyah, setCurrentAyah] = useState<number | null>(null);
  const currentAyahRef = useRef<number | null>(null);

  const reciter = recitations[reciterIndex] ?? recitations[0];

  const player = getMurottalPlayer();
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    getString(RECITER_KEY)
      .then((value) => {
        const parsed = Number.parseInt(value ?? '', 10);
        if (!Number.isNaN(parsed) && parsed >= 0 && parsed < recitations.length) {
          setReciterIndex(parsed);
        }
      })
      .catch(() => undefined);
  }, [recitations.length]);

  const selectReciter = (index: number) => {
    setReciterIndex(index);
    setPickerVisible(false);
    setString(RECITER_KEY, String(index)).catch(() => undefined);
    const here = getActiveSurah() === surahNumber && status?.playing;
    if (!here) return;
    if (mode === 'ayah') {
      if (currentAyahRef.current !== null) playAyah(currentAyahRef.current, index);
    } else {
      const next = recitations[index];
      if (next) {
        deactivateMurottalLockScreen(player);
        player.replace({ uri: next.audio_url });
        activateMurottalLockScreen(player, {
          title: `${t('audio.murottal')} · ${surahLabel}`,
          artist: next.name,
          albumTitle: 'Muslim Hub',
        });
        player.play();
      }
    }
  };

  const sourceHere = getActiveSurah() === surahNumber;

  const emitAyah = (value: number | null) => {
    currentAyahRef.current = value;
    setCurrentAyah(value);
    onPlayingAyahChange?.(value);
  };

  const playAyah = (ayah: number, reciterIdx = reciterIndex) => {
    const chosen = recitations[reciterIdx] ?? recitations[0];
    emitAyah(ayah);
    setActiveSurah(surahNumber);
    activateMurottalLockScreen(player, {
      title: `${surahLabel} · ${t('audio.verse')} ${ayah}`,
      artist: chosen?.name,
      albumTitle: 'Muslim Hub',
    });
    player.replace({ uri: getAyahAudioUrl(ayah) });
    player.play();
  };

  const playSurahAudio = () => {
    const next = recitations[reciterIndex] ?? recitations[0];
    if (!next) return;
    setActiveSurah(surahNumber);
    if (getMurottalCurrentUrl() !== next.audio_url) {
      deactivateMurottalLockScreen(player);
      player.replace({ uri: next.audio_url });
    }
    activateMurottalLockScreen(player, {
      title: `${t('audio.murottal')} · ${surahLabel}`,
      artist: next.name,
      albumTitle: 'Muslim Hub',
    });
    player.play();
  };

  useEffect(() => {
    if (!status?.didJustFinish || getActiveSurah() !== surahNumber) return;
    if (mode === 'ayah') {
      const at = currentAyahRef.current ?? 1;
      if (at < totalVerses) {
        const delay = setTimeout(() => playAyah(at + 1), 350);
        return () => clearTimeout(delay);
      }
      emitAyah(null);
      setPlayingSurah(null);
      deactivateMurottalLockScreen(player);
    } else {
      setPlayingSurah(null);
      deactivateMurottalLockScreen(player);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.didJustFinish, mode, surahNumber]);

  useEffect(() => {
    if (!status || getActiveSurah() !== surahNumber) return;
    if (status.playing) {
      setPlayingSurah(surahNumber);
    } else if (!status.playing && getPlayingSurah() === surahNumber && status.didJustFinish) {
      setPlayingSurah(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.playing, status?.didJustFinish, surahNumber]);

  useEffect(() => {
    if (!autoPlay) return;
    const id = setTimeout(() => {
      if (mode === 'ayah') {
        playAyah(1);
      } else {
        playSurahAudio();
      }
    }, 1500);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, player]);

  const switchMode = (next: MurottalMode) => {
    if (next === mode) return;
    if (sourceHere && status?.playing) {
      player.pause();
    }
    emitAyah(null);
    setMode(next);
  };

  const togglePlayback = () => {
    if (sourceHere && status?.playing) {
      player.pause();
      return;
    }
    if (mode === 'ayah') {
      playAyah(currentAyahRef.current ?? 1);
      return;
    }
    playSurahAudio();
  };

  const showStatus = sourceHere && status?.isLoaded;
  const duration = showStatus ? (status?.duration ?? 0) : 0;
  const currentTime = showStatus ? (status?.currentTime ?? 0) : 0;
  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;
  const primaryTextColor = scheme === 'dark' ? '#061009' : '#FFFFFF';

  const statusLabel = !sourceHere
    ? t('audio.ready')
    : status?.isLoaded
      ? status.playing
        ? mode === 'ayah' && currentAyah !== null
          ? `${t('audio.nowPlaying')} · ${t('audio.verse')} ${currentAyah}/${totalVerses}`
          : t('audio.nowPlaying')
        : t('audio.ready')
      : status?.error
        ? t('audio.error')
        : t('audio.buffering');

  return (
    <View style={style}>
      <LinearGradient colors={[...gradients.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        <View style={styles.modeSwitchRow}>
          {(['surah', 'ayah'] as MurottalMode[]).map((option) => {
            const active = mode === option;
            return (
              <PressableScale key={option} onPress={() => switchMode(option)} haptic={false} style={styles.modePress}>
                <View style={[styles.modeChip, active && styles.modeChipActive]}>
                  <Text style={[styles.modeChipText, active && styles.modeChipTextActive]}>
                    {option === 'surah' ? t('audio.modeSurah') : t('audio.modeAyah')}
                  </Text>
                </View>
              </PressableScale>
            );
          })}
        </View>
        <View style={styles.headerRow}>
          <View style={styles.titleWrap}>
            <Text style={[styles.kicker, { color: primaryTextColor }]}>
              {t('audio.murottal')} · {surahLabel}
            </Text>
            <PressableScale onPress={() => setPickerVisible(true)} haptic>
              <View style={styles.reciterRow}>
                <Text style={[styles.reciterName, { color: primaryTextColor }]} numberOfLines={1}>
                  {reciter?.name ?? t('audio.reciter')}
                </Text>
                <Ionicons name="chevron-down" size={14} color={primaryTextColor} />
              </View>
            </PressableScale>
            <Text style={[styles.statusLabel, { color: primaryTextColor }]} numberOfLines={1}>
              {statusLabel}
            </Text>
          </View>
          <PressableScale onPress={togglePlayback} style={styles.playBtn}>
            <Ionicons
              key={sourceHere && status?.playing ? 'pause' : 'play'}
              name={sourceHere && status?.playing ? 'pause' : 'play'}
              size={26}
              color={primaryTextColor}
            />
          </PressableScale>
        </View>
        <View style={styles.progressRow}>
          <Text style={[styles.timeText, { color: primaryTextColor }]}>{formatTime(currentTime)}</Text>
          <View style={styles.track}>
            <View style={[styles.trackFill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
          <Text style={[styles.timeText, { color: primaryTextColor }]}>{formatTime(duration)}</Text>
        </View>
      </LinearGradient>

      <Modal visible={pickerVisible} transparent animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPickerVisible(false)}>
          <Pressable onPress={() => undefined} style={styles.sheetHolder}>
            <Animated.View entering={SlideInDown.springify().damping(16)} style={styles.sheet}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>{t('audio.changeReciter')}</Text>
              {recitations.map((item, index) => {
                const active = index === reciterIndex;
                return (
                  <PressableScale key={item.audio_url} onPress={() => selectReciter(index)} style={styles.reciterOption}>
                    <View style={[styles.reciterAvatar, active && styles.reciterAvatarActive]}>
                      <Ionicons name="mic-outline" size={18} color={active ? colors.primary : colors.textMuted} />
                    </View>
                    <Text style={[styles.reciterOptionName, active && styles.reciterOptionNameActive]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {active ? (
                      <Animated.View entering={FadeIn.duration(200)}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                      </Animated.View>
                    ) : null}
                  </PressableScale>
                );
              })}
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const makeStyles = (c: ThemeColors, scheme: 'light' | 'dark') =>
  StyleSheet.create({
    card: {
      borderRadius: radius.xl,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: c.border,
    },
    modeSwitchRow: {
      flexDirection: 'row',
      alignSelf: 'center',
      backgroundColor: 'rgba(0,0,0,0.18)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.22)',
      borderRadius: radius.full,
      padding: 4,
      marginBottom: spacing.md,
      gap: 4,
    },
    modePress: {
      borderRadius: radius.full,
    },
    modeChip: {
      paddingHorizontal: spacing.md + 2,
      paddingVertical: 6,
      borderRadius: radius.full,
    },
    modeChipActive: {
      backgroundColor: '#FFFFFF',
      ...shadow.card,
    },
    modeChipText: {
      fontFamily: font.semibold,
      fontSize: 11.5,
      color: 'rgba(255,255,255,0.78)',
    },
    modeChipTextActive: {
      color: scheme === 'dark' ? '#061009' : '#0B5A45',
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    titleWrap: {
      flex: 1,
    },
    kicker: {
      fontFamily: font.semibold,
      fontSize: 11,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      opacity: 0.85,
    },
    reciterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 3,
    },
    reciterName: {
      fontFamily: font.bold,
      fontSize: 16,
      maxWidth: 200,
    },
    statusLabel: {
      fontFamily: font.regular,
      fontSize: 11.5,
      opacity: 0.75,
      marginTop: 2,
    },
    playBtn: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(255,255,255,0.22)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    progressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    timeText: {
      fontFamily: font.semibold,
      fontSize: 11,
      fontVariant: ['tabular-nums'],
      opacity: 0.9,
    },
    track: {
      flex: 1,
      height: 5,
      borderRadius: radius.full,
      backgroundColor: 'rgba(255,255,255,0.28)',
      overflow: 'hidden',
    },
    trackFill: {
      height: '100%',
      borderRadius: radius.full,
      backgroundColor: '#FFFFFF',
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(4,10,8,0.6)',
      justifyContent: 'flex-end',
    },
    sheetHolder: {
      paddingBottom: spacing.xl,
    },
    sheet: {
      backgroundColor: c.surface,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      paddingTop: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
      borderWidth: 1,
      borderColor: c.border,
      gap: spacing.sm,
    },
    sheetHandle: {
      alignSelf: 'center',
      width: 44,
      height: 5,
      borderRadius: radius.full,
      backgroundColor: c.borderStrong,
      marginBottom: spacing.sm,
    },
    sheetTitle: {
      fontFamily: font.bold,
      fontSize: 16,
      color: c.text,
      marginBottom: spacing.xs,
    },
    reciterOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
    },
    reciterAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    reciterAvatarActive: {
      borderWidth: 1.5,
      borderColor: c.primary,
    },
    reciterOptionName: {
      flex: 1,
      fontFamily: font.semibold,
      fontSize: 14,
      color: c.text,
    },
    reciterOptionNameActive: {
      color: c.primary,
    },
  });
