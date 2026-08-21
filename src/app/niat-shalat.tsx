import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { ArabicText } from '@/components/ui/arabic-text';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen } from '@/components/ui/screen';
import { SkeletonList } from '@/components/ui/skeleton';
import { getNiatShalat } from '@/lib/api';
import type { NiatShalatItem } from '@/lib/types';
import { registerStrings, useLang } from '@/i18n';
import { font, radius, spacing, ThemeColors, useTheme } from '@/theme';

registerStrings('niat', {
  title: 'Niat Shalat',
  subtitle: 'Lafal niat lima shalat wajib',
  rakaat: '{count} rakaat',
}, {
  title: 'Prayer Intentions',
  subtitle: 'The intentions of the five obligatory prayers',
  rakaat: '{count} rakaat',
});

const RAKAAT_RULES: { keys: string[]; rakaat: number }[] = [
  { keys: ['subuh', 'shubuh', 'fajr', 'subhi'], rakaat: 2 },
  { keys: ['zuhur', 'dzuhur', 'dhuhur', 'lohor', 'dhuhr'], rakaat: 4 },
  { keys: ['ashar', 'asr'], rakaat: 4 },
  { keys: ['maghrib'], rakaat: 3 },
  { keys: ['isya', 'isha'], rakaat: 4 },
];

function inferRakaat(name: string): number | null {
  const lower = name.toLowerCase();
  for (const rule of RAKAAT_RULES) {
    if (rule.keys.some((k) => lower.includes(k))) return rule.rakaat;
  }
  return null;
}

function NiatCard({ item, index }: { item: NiatShalatItem; index: number }) {
  const { colors } = useTheme();
  const { t } = useLang();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [expanded, setExpanded] = useState(index === 0);
  const progress = useSharedValue(index === 0 ? 1 : 0);
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 180}deg` }],
  }));

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    progress.value = withTiming(next ? 1 : 0, { duration: 220 });
  };

  const rakaat = inferRakaat(item.name);

  return (
    <Animated.View entering={FadeInDown.delay(index * 70).duration(450)}>
      <View style={styles.card}>
        <PressableScale onPress={toggle} style={styles.cardHeader}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{index + 1}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.metaRow}>
              {rakaat !== null ? (
                <View style={styles.rakaatChip}>
                  <Text style={styles.rakaatText}>{t('niat.rakaat', { count: rakaat })}</Text>
                </View>
              ) : null}
            </View>
          </View>
          <Animated.View style={[styles.chevronWrap, chevronStyle]}>
            <Ionicons name="chevron-down" size={17} color={expanded ? colors.primary : colors.textMuted} />
          </Animated.View>
        </PressableScale>
        {expanded ? (
          <Animated.View entering={FadeIn.duration(250)} style={styles.cardBody}>
            <ArabicText size={26}>{item.arabic}</ArabicText>
            <Text style={styles.latin}>{item.latin}</Text>
            <Text style={styles.terjemahan}>&quot;{item.terjemahan}&quot;</Text>
          </Animated.View>
        ) : null}
      </View>
    </Animated.View>
  );
}

export default function NiatShalatScreen() {
  const { colors } = useTheme();
  const { t } = useLang();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['niat-shalat'],
    queryFn: getNiatShalat,
  });

  return (
    <Screen scroll>
      <PageHeader title={t('niat.title')} subtitle={t('niat.subtitle')} />
      {isPending ? <SkeletonList count={5} height={92} /> : null}
      {isError ? <ErrorState onRetry={() => refetch()} /> : null}
      {data ? (
        <View style={styles.list}>
          {data.map((item, index) => (
            <NiatCard key={item.id} item={item} index={index} />
          ))}
        </View>
      ) : null}
    </Screen>
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
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.base,
    },
    badge: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.goldSoft,
    },
    badgeText: {
      fontFamily: font.extrabold,
      fontSize: 14,
      color: c.gold,
    },
    headerText: {
      flex: 1,
      gap: 5,
    },
    cardTitle: {
      fontFamily: font.bold,
      fontSize: 16,
      color: c.text,
    },
    metaRow: {
      flexDirection: 'row',
    },
    rakaatChip: {
      backgroundColor: c.primarySoft,
      borderRadius: radius.full,
      paddingHorizontal: 9,
      paddingVertical: 2,
      alignSelf: 'flex-start',
    },
    rakaatText: {
      fontFamily: font.semibold,
      fontSize: 11,
      color: c.primary,
    },
    chevronWrap: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.surfaceAlt,
    },
    cardBody: {
      borderTopWidth: 1,
      borderTopColor: c.border,
      padding: spacing.base,
      gap: spacing.md,
    },
    latin: {
      fontFamily: font.regular,
      fontStyle: 'italic',
      fontSize: 13,
      lineHeight: 20,
      color: c.textMuted,
    },
    terjemahan: {
      fontFamily: font.regular,
      fontSize: 13,
      lineHeight: 20,
      color: c.textFaint,
    },
  });
