import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArabicText } from '@/components/ui/arabic-text';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { Screen } from '@/components/ui/screen';
import { SkeletonList } from '@/components/ui/skeleton';
import { getTahlil } from '@/lib/api';
import { font, radius, spacing, useTheme, type ThemeColors } from '@/theme';

export default function TahlilScreen() {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['tahlil'],
    queryFn: getTahlil,
  });

  const items = data ?? [];

  return (
    <Screen scroll>
      <PageHeader title="Tahlil" subtitle="Bacaan tahlil lengkap beserta terjemah" />

      {isPending ? (
        <SkeletonList count={6} height={130} />
      ) : isError ? (
        <ErrorState message={error?.message} onRetry={() => refetch()} />
      ) : (
        <View style={styles.list}>
          {items.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInDown.springify().delay(index * 70)}
              style={styles.card}
            >
              <View style={styles.headRow}>
                <View style={styles.numberCircle}>
                  <Text style={styles.numberText}>{index + 1}</Text>
                </View>
                <Text style={[typography.h3, styles.title]} numberOfLines={2}>
                  {item.title}
                </Text>
              </View>
              <ArabicText size={26} style={styles.arabic}>
                {item.arabic}
              </ArabicText>
              <Text style={[typography.caption, styles.translation]}>{item.translation}</Text>
            </Animated.View>
          ))}
        </View>
      )}
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
      padding: spacing.base,
      gap: spacing.md,
    },
    headRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    numberCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.primarySoft,
      borderWidth: 1,
      borderColor: c.primary,
    },
    numberText: {
      fontFamily: font.bold,
      fontSize: 14,
      color: c.primary,
    },
    title: {
      flex: 1,
    },
    arabic: {
      marginTop: spacing.xs,
    },
    translation: {
      fontSize: 13,
      lineHeight: 19,
    },
  });
