import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArabicText } from '@/components/ui/arabic-text';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { Screen } from '@/components/ui/screen';
import { SkeletonList } from '@/components/ui/skeleton';
import { getBacaanShalat } from '@/lib/api';
import { font, radius, spacing, ThemeColors, useTheme } from '@/theme';

export default function BacaanShalatScreen() {
  const { colors, gradients } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['bacaan-shalat'],
    queryFn: getBacaanShalat,
  });

  return (
    <Screen scroll>
      <PageHeader title="Bacaan Shalat" subtitle="Bacaan dalam gerakan shalat" />
      {isPending ? <SkeletonList count={6} height={150} /> : null}
      {isError ? <ErrorState onRetry={() => refetch()} /> : null}
      {data ? (
        <View style={styles.timeline}>
          <LinearGradient
            colors={[...gradients.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.timelineLine}
          />
          {data.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInDown.delay(index * 70).duration(450)}
              style={styles.timelineItem}
            >
              <View style={styles.dotWrap}>
                <View style={styles.dot} />
              </View>
              <View style={styles.card}>
                <View style={styles.cardTitleRow}>
                  <Ionicons name="book-outline" size={14} color={colors.gold} />
                  <Text style={styles.cardTitle}>{item.name}</Text>
                </View>
                <ArabicText size={24}>{item.arabic}</ArabicText>
                <Text style={styles.latin}>{item.latin}</Text>
                <Text style={styles.terjemahan}>&quot;{item.terjemahan}&quot;</Text>
              </View>
            </Animated.View>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    timeline: {
      position: 'relative',
      paddingTop: spacing.sm,
    },
    timelineLine: {
      position: 'absolute',
      left: 5,
      top: spacing.sm + 20,
      bottom: spacing.sm,
      width: 2,
      borderRadius: 1,
    },
    timelineItem: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    dotWrap: {
      width: 12,
      alignItems: 'center',
      paddingTop: spacing.lg,
    },
    dot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: c.primary,
      borderWidth: 2,
      borderColor: c.bgDeep,
    },
    card: {
      flex: 1,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.lg,
      padding: spacing.base,
      gap: spacing.md,
    },
    cardTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    cardTitle: {
      fontFamily: font.bold,
      fontSize: 15,
      color: c.gold,
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
