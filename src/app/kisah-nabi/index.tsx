import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen } from '@/components/ui/screen';
import { SkeletonList } from '@/components/ui/skeleton';
import { getKisahNabi } from '@/lib/api';
import { colors, font, gradients, radius, shadow, spacing, typography } from '@/theme';

const AVATAR_GRADIENTS: readonly (readonly [string, string])[] = [
  gradients.emerald,
  gradients.teal,
  gradients.gold,
  gradients.night,
  gradients.plum,
];

function getInitials(name: string): string {
  const clean = name.replace(/^Nabi\s+/i, '').trim();
  return clean.slice(0, 2).toUpperCase();
}

export default function KisahNabiScreen() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['kisah-nabi'],
    queryFn: getKisahNabi,
  });

  return (
    <Screen scroll>
      <PageHeader title="Kisah 25 Nabi" subtitle="Teladan hidup para nabi dan rasul" />
      {isPending ? (
        <SkeletonList count={7} height={84} />
      ) : isError ? (
        <ErrorState message="Gagal memuat kisah nabi." onRetry={() => refetch()} />
      ) : (
        <View style={styles.list}>
          {data.map((item, index) => {
            const gradient = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
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
                    <Text style={styles.name} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <View style={styles.chips}>
                      <View style={styles.chip}>
                        <Ionicons name="time-outline" size={12} color={colors.primary} />
                        <Text style={styles.chipText}>{item.usia}</Text>
                      </View>
                      <View style={styles.chip}>
                        <Ionicons name="calendar-outline" size={12} color={colors.gold} />
                        <Text style={styles.chipText}>{item.thn_kelahiran}</Text>
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

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
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
    borderColor: colors.borderStrong,
  },
  avatarText: {
    fontFamily: font.extrabold,
    fontSize: 18,
    color: colors.gold,
  },
  info: {
    flex: 1,
    gap: spacing.sm,
  },
  name: {
    ...typography.h3,
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
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    fontFamily: font.semibold,
    fontSize: 11,
    color: colors.textMuted,
  },
});
