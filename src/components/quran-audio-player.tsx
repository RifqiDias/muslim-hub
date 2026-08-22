import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { PressableScale } from '@/components/ui/pressable-scale';
import { registerStrings, useLang } from '@/i18n';
import { getMurottalPlayer, replaceMurottalSource } from '@/lib/murottal-player';
import { getString, setString } from '@/lib/storage';
import { QuranJsonReciter } from '@/lib/types';
import { ThemeColors, font, radius, spacing, useTheme } from '@/theme';

registerStrings('audio', {
  reciter: 'Qari',
  changeReciter: 'Ganti Qari',
  murottal: 'Murottal',
  nowPlaying: 'Sedang diputar',
  ready: 'Siap diputar',
  buffering: 'Memuat audio...',
  error: 'Audio gagal dimuat',
}, {
  reciter: 'Reciter',
  changeReciter: 'Change Reciter',
  murottal: 'Murottal',
  nowPlaying: 'Now playing',
  ready: 'Ready to play',
  buffering: 'Loading audio...',
  error: 'Failed to load audio',
});

const RECITER_KEY = 'muslimhub.quran.reciter';

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

interface QuranAudioPlayerProps {
  recitations: QuranJsonReciter[];
  surahLabel: string;
  autoPlay?: boolean;
  style?: ViewStyle;
}

export function QuranAudioPlayer({ recitations, surahLabel, autoPlay = false, style }: QuranAudioPlayerProps) {
  const { t } = useLang();
  const { colors, gradients, scheme } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [reciterIndex, setReciterIndex] = useState(0);
  const [pickerVisible, setPickerVisible] = useState(false);

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
  };

  useEffect(() => {
    const next = recitations[reciterIndex] ?? recitations[0];
    if (next) {
      replaceMurottalSource(player, next.audio_url);
    }
  }, [reciterIndex, player, recitations]);

  const duration = status?.duration ?? 0;
  const currentTime = status?.currentTime ?? 0;
  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;
  const primaryTextColor = scheme === 'dark' ? '#061009' : '#FFFFFF';

  const togglePlayback = () => {
    if (status?.playing) {
      player.pause();
      return;
    }
    player.setActiveForLockScreen(
      true,
      {
        title: `${t('audio.murottal')} · ${surahLabel}`,
        artist: reciter?.name,
        albumTitle: 'Muslim Hub',
      },
      { showSeekForward: false, showSeekBackward: false },
    );
    player.play();
  };

  useEffect(() => {
    if (status?.didJustFinish) {
      player.setActiveForLockScreen(false);
    }
  }, [status?.didJustFinish, player]);

  useEffect(() => {
    if (!autoPlay) return;
    const id = setTimeout(() => {
      player.setActiveForLockScreen(
        true,
        {
          title: `${t('audio.murottal')} · ${surahLabel}`,
          artist: reciter?.name,
          albumTitle: 'Muslim Hub',
        },
        { showSeekForward: false, showSeekBackward: false },
      );
      player.play();
    }, 1500);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, player]);

  const statusLabel = status?.isLoaded
    ? status.playing
      ? t('audio.nowPlaying')
      : t('audio.ready')
    : status?.error
      ? t('audio.error')
      : t('audio.buffering');

  return (
    <View style={style}>
      <LinearGradient colors={[...gradients.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
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
              key={status?.playing ? 'pause' : 'play'}
              name={status?.playing ? 'pause' : 'play'}
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

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    card: {
      borderRadius: radius.xl,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: c.border,
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
