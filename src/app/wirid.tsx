import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ArabicText } from '@/components/ui/arabic-text';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen } from '@/components/ui/screen';
import { SkeletonList } from '@/components/ui/skeleton';
import { registerStrings, useLang } from '@/i18n';
import { getWirid } from '@/lib/api';
import { WiridItem } from '@/lib/types';
import { font, radius, spacing, useTheme, type ThemeColors } from '@/theme';

registerStrings('wirid', {
  title: 'Wirid & Tasbih',
  subtitle: 'Ketuk wirid untuk mulai menghitung',
  tapToCount: 'Ketuk lingkaran untuk menghitung',
  done: 'Selesai',
  of: 'dari {times}',
  doneLabel: 'Wirid selesai, Alhamdulillah',
  reset: 'Ulangi',
  targetReached: 'Target tercapai',
}, {
  title: 'Wirid & Tasbih',
  subtitle: 'Tap a wirid to start counting',
  tapToCount: 'Tap the circle to count',
  done: 'Done',
  of: 'of {times}',
  doneLabel: 'Wirid complete, Alhamdulillah',
  reset: 'Reset',
  targetReached: 'Target reached',
});

export default function WiridScreen() {
  const { t } = useLang();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['wirid'],
    queryFn: getWirid,
  });

  const items = data ?? [];

  return (
    <Screen scroll>
      <PageHeader title={t('wirid.title')} subtitle={t('wirid.subtitle')} />

      {isPending ? (
        <SkeletonList count={5} height={110} />
      ) : isError ? (
        <ErrorState message={error?.message} onRetry={() => refetch()} />
      ) : (
        <View style={styles.list}>
          {items.map((item, index) => (
            <WiridCard key={item.id} item={item} delay={index * 80} />
          ))}
        </View>
      )}
    </Screen>
  );
}

function WiridCard({ item, delay }: { item: WiridItem; delay: number }) {
  const { t } = useLang();
  const { colors, typography } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [expanded, setExpanded] = useState(false);
  const [count, setCount] = useState(0);
  const done = count >= item.times;

  const pulse = useSharedValue(1);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(item.times > 0 ? count / item.times : 0, { duration: 200 });
  }, [count, item.times, progress]);

  useEffect(() => {
    if (count === 0) return;
    pulse.value = withSequence(withTiming(1.28, { duration: 90 }), withTiming(1, { duration: 170 }));
  }, [count, pulse]);

  useEffect(() => {
    if (!done || !expanded) return;
    const timer = setTimeout(() => {
      setExpanded(false);
      setCount(0);
    }, 1700);
    return () => clearTimeout(timer);
  }, [done, expanded]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const barStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: Math.max(progress.value, 0.02) }],
  }));

  const increment = () => {
    if (done) return;
    const next = count + 1;
    setCount(next);
    if (next >= item.times) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    }
  };

  const reset = () => setCount(0);

  const toggle = () => setExpanded((value) => !value);

  return (
    <Animated.View entering={FadeInDown.springify().delay(delay)}>
      <View style={[styles.card, expanded && styles.cardExpanded]}>
        <PressableScale onPress={toggle} haptic={false} style={styles.cardPress}>
          <View style={styles.cardRow}>
            <View style={styles.timesBadge}>
              <Text style={styles.timesText}>{item.times}x</Text>
            </View>
            <View style={styles.arabicWrap}>
              <ArabicText size={24}>{item.arabic}</ArabicText>
              {item.tnc ? (
                <Text style={[typography.caption, styles.tnc]} numberOfLines={expanded ? undefined : 2}>
                  {item.tnc}
                </Text>
              ) : null}
            </View>
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textMuted}
            />
          </View>
        </PressableScale>

        {expanded ? (
          <Animated.View entering={FadeInDown.duration(250)} style={styles.counterArea}>
            <PressableScale onPress={increment} style={[styles.tapCircle, done && styles.tapCircleDone]} disabled={done}>
              <Animated.Text style={[styles.countText, done && styles.countTextDone, pulseStyle]}>
                {count}
              </Animated.Text>
              <Text style={[styles.circleCaption, done && styles.circleCaptionDone]}>
                {done ? t('wirid.done') : t('wirid.of', { times: item.times })}
              </Text>
            </PressableScale>

            <View style={styles.barMeta}>
              <Text style={[typography.caption, styles.barLabel]}>{done ? t('wirid.doneLabel') : t('wirid.tapToCount')}</Text>
              <PressableScale onPress={reset} haptic={false} hitSlop={8} style={styles.resetBtn}>
                <Ionicons name="refresh" size={16} color={colors.textMuted} />
                <Text style={styles.resetText}>{t('wirid.reset')}</Text>
              </PressableScale>
            </View>
            <View style={[styles.barTrack, done && styles.barTrackDone]}>
              <Animated.View style={[styles.barFill, done && styles.barFillDone, barStyle]} />
            </View>
            {done ? (
              <Animated.View entering={ZoomIn.springify()} style={styles.doneChip}>
                <Ionicons name="checkmark-circle" size={16} color={colors.gold} />
                <Text style={styles.doneText}>{t('wirid.targetReached')}</Text>
              </Animated.View>
            ) : null}
          </Animated.View>
        ) : null}
      </View>
    </Animated.View>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    list: {
      gap: spacing.md,
    },
    card: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.lg,
      overflow: 'hidden',
    },
    cardExpanded: {
      borderColor: c.primary,
    },
    cardPress: {
      padding: spacing.base,
    },
    cardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    timesBadge: {
      minWidth: 44,
      alignItems: 'center',
      backgroundColor: c.goldSoft,
      borderWidth: 1,
      borderColor: c.gold,
      borderRadius: radius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm - 2,
    },
    timesText: {
      fontFamily: font.bold,
      fontSize: 13,
      color: c.gold,
    },
    arabicWrap: {
      flex: 1,
      gap: spacing.xs,
    },
    tnc: {
      fontSize: 11,
      lineHeight: 16,
    },
    counterArea: {
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.base,
      paddingBottom: spacing.base,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    tapCircle: {
      width: 132,
      height: 132,
      borderRadius: 66,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.primarySoft,
      borderWidth: 2,
      borderColor: c.primary,
    },
    tapCircleDone: {
      backgroundColor: c.goldSoft,
      borderColor: c.gold,
    },
    countText: {
      fontFamily: font.extrabold,
      fontSize: 46,
      color: c.primary,
    },
    countTextDone: {
      color: c.gold,
    },
    circleCaption: {
      fontFamily: font.semibold,
      fontSize: 11,
      color: c.textMuted,
      marginTop: 2,
    },
    circleCaptionDone: {
      color: c.gold,
    },
    barMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      alignSelf: 'stretch',
    },
    barLabel: {
      fontSize: 11,
      flex: 1,
    },
    resetBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: c.surfaceAlt,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: 4,
      marginLeft: spacing.sm,
    },
    resetText: {
      fontFamily: font.semibold,
      fontSize: 11,
      color: c.textMuted,
    },
    barTrack: {
      alignSelf: 'stretch',
      height: 8,
      borderRadius: radius.full,
      backgroundColor: c.surfaceAlt,
      overflow: 'hidden',
    },
    barTrackDone: {
      backgroundColor: c.goldSoft,
    },
    barFill: {
      width: '100%',
      height: 8,
      borderRadius: radius.full,
      backgroundColor: c.primary,
      transformOrigin: 'left',
    },
    barFillDone: {
      backgroundColor: c.gold,
    },
    doneChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: c.goldSoft,
      borderRadius: radius.full,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm - 2,
    },
    doneText: {
      fontFamily: font.semibold,
      fontSize: 12,
      color: c.gold,
    },
  });
