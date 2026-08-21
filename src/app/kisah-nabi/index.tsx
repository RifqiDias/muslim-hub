import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen } from '@/components/ui/screen';
import { SkeletonList } from '@/components/ui/skeleton';
import { registerStrings, useLang } from '@/i18n';
import { getKisahNabi } from '@/lib/api';
import { font, radius, shadow, spacing, ThemeColors, ThemeGradients, useTheme } from '@/theme';

registerStrings('kisahList', {
  title: 'Kisah 25 Nabi',
  subtitle: 'Teladan hidup para nabi dan rasul',
  age: 'usia {years} thn',
  birthYear: 'thn kelahiran {year}',
  error: 'Gagal memuat kisah nabi.',
}, {
  title: 'Stories of 25 Prophets',
  subtitle: 'Life lessons from the prophets and messengers',
  age: 'lived {years} yrs',
  birthYear: 'born {year}',
  error: 'Failed to load prophet stories.',
});

const makeAvatarGradients = (g: ThemeGradients): readonly (readonly [string, string])[] => [
  g.emerald,
  g.teal,
  g.gold,
  g.night,
  g.plum,
];

function getInitials(name: string): string {
  const clean = name.replace(/^Nabi\s+/i, '').trim();
  return clean.slice(0, 2).toUpperCase();
}

export default function KisahNabiScreen() {
  const { t } = useLang();
  const { colors, gradients, typography } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const avatarGradients = makeAvatarGradients(gradients);
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['kisah-nabi'],
    queryFn: getKisahNabi,
  });

  return (
    <Screen scroll>
      <PageHeader title={t('kisahList.title')} subtitle={t('kisahList.subtitle')} />
      {isPending ? (
        <SkeletonList count={7} height={84} />
      ) : isError ? (
        <ErrorState message={t('kisahList.error')} onRetry={() => refetch()} />
      ) : (
        <View style={styles.list}>
          {data.map((item, index) => {
            const gradient = avatarGradients[index % avatarGradients.length];
            return (
              <Animated.View
                key={item.name}
                entering={FadeInDown.duration(400).delay(Math.min(index, 10) * 50)}
                collapsable={false}
              >
                <PressableScale
                  onPress={() =>
                    router.push({
                      pathname: '/kisah-nabi/[index]',
                      params: { index: String(index) },
                    })
                  }
                  style={styles.card}
                >
                  <LinearGradient colors={[...gradient]} style={styles.avatar}>
                    <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
                  </LinearGradient>
                  <View style={styles.info}>
                    <Text style={typography.h3} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <View style={styles.chips}>
                      <View style={styles.chip}>
                        <Ionicons name="time-outline" size={12} color={colors.primary} />
                        <Text style={styles.chipText}>
                          {t('kisahList.age', { years: item.usia })}
                        </Text>
                      </View>
                      <View style={styles.chip}>
                        <Ionicons name="calendar-outline" size={12} color={colors.gold} />
                        <Text style={styles.chipText}>
                          {t('kisahList.birthYear', { year: item.thn_kelahiran })}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
                </PressableScale>
              </Animated.View>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    list: {
      gap: spacing.md,
      paddingBottom: spacing.xl,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.lg,
      padding: spacing.base,
      ...shadow.card,
    },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.borderStrong,
    },
    avatarText: {
      fontFamily: font.extrabold,
      fontSize: 18,
      color: c.gold,
    },
    info: {
      flex: 1,
      gap: spacing.sm,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.md,
      paddingVertical: 3,
      borderRadius: radius.full,
      backgroundColor: c.primarySoft,
      borderWidth: 1,
      borderColor: c.border,
    },
    chipText: {
      fontFamily: font.semibold,
      fontSize: 11,
      color: c.textMuted,
    },
  });
