import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
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
import { getDoaPilihan } from '@/lib/api';
import { DoaItem } from '@/lib/types';
import { font, radius, spacing, useTheme, type ThemeColors } from '@/theme';

export default function DoaPilihanScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['doa-pilihan'],
    queryFn: getDoaPilihan,
  });

  const items = data ?? [];

  return (
    <Screen scroll>
      <PageHeader title="Doa Pilihan" subtitle="Kumpulan doa pilihan beserta keutamaannya" />

      {isPending ? (
        <SkeletonList count={5} height={160} />
      ) : isError ? (
        <ErrorState message={error?.message} onRetry={() => refetch()} />
      ) : (
        <View style={styles.list}>
          {items.map((item, index) => (
            <DoaCard key={`${index}-${item.title}`} item={item} delay={index * 70} />
          ))}
        </View>
      )}
    </Screen>
  );
}

function DoaCard({ item, delay }: { item: DoaItem; delay: number }) {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [open, setOpen] = useState(false);
  const chevron = useSharedValue(0);

  useEffect(() => {
    chevron.value = withTiming(open ? 180 : 0, { duration: 200 });
  }, [open, chevron]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevron.value}deg` }],
  }));

  const toggle = () => setOpen((value) => !value);

  return (
    <Animated.View
      entering={FadeInDown.springify().delay(delay)}
      style={styles.card}
    >
      <View style={styles.titleRow}>
        <Text style={[typography.h3, styles.title]} numberOfLines={2}>
          {item.title}
        </Text>
        {item.notes ? (
          <View style={styles.noteBadge}>
            <Ionicons name="time-outline" size={13} color={colors.gold} />
            <Text style={styles.noteText}>{item.notes}</Text>
          </View>
        ) : null}
      </View>

      <ArabicText size={27} style={styles.arabic}>
        {item.arabic}
      </ArabicText>
      <Text style={styles.latin}>{item.latin}</Text>
      <Text style={[typography.caption, styles.translation]}>{item.translation}</Text>

      {item.fawaid ? (
        <>
          <PressableScale onPress={toggle} haptic={false} style={styles.fawaidToggle}>
            <Ionicons name="sparkles" size={16} color={colors.primary} />
            <Text style={styles.fawaidToggleText}>Keutamaan</Text>
            <Animated.View style={chevronStyle}>
              <Ionicons name="chevron-down" size={16} color={colors.primary} />
            </Animated.View>
          </PressableScale>
          {open ? (
            <Animated.View entering={FadeInDown.duration(220)} style={styles.fawaidCard}>
              <Text style={[typography.body, styles.fawaidText]}>{item.fawaid}</Text>
            </Animated.View>
          ) : null}
        </>
      ) : null}

      {item.source ? <Text style={[typography.caption, styles.source]}>{item.source}</Text> : null}
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
      padding: spacing.base,
      gap: spacing.md,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    title: {
      flex: 1,
    },
    noteBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: c.goldSoft,
      borderWidth: 1,
      borderColor: c.gold,
      borderRadius: radius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: 4,
    },
    noteText: {
      fontFamily: font.semibold,
      fontSize: 11,
      color: c.gold,
    },
    arabic: {
      marginTop: spacing.xs,
    },
    latin: {
      fontFamily: font.regular,
      fontStyle: 'italic',
      fontSize: 13,
      lineHeight: 20,
      color: c.textMuted,
    },
    translation: {
      fontSize: 13,
      lineHeight: 19,
    },
    fawaidToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      alignSelf: 'flex-start',
      backgroundColor: c.primarySoft,
      borderRadius: radius.full,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm - 2,
    },
    fawaidToggleText: {
      fontFamily: font.semibold,
      fontSize: 12,
      color: c.primary,
    },
    fawaidCard: {
      backgroundColor: c.surfaceAlt,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.md,
      padding: spacing.base,
    },
    fawaidText: {
      fontSize: 13,
      lineHeight: 20,
    },
    source: {
      color: c.textFaint,
    },
  });
