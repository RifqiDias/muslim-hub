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
import { getHadithBooks } from '@/lib/api';
import { HadithBook } from '@/lib/types';
import { font, radius, spacing, useTheme, ThemeColors, ThemeGradients } from '@/theme';

const makeBookGradients = (g: ThemeGradients): readonly (readonly [string, string])[] => [
  g.emerald,
  g.teal,
  g.gold,
  g.night,
  g.plum,
];

function BookCard({ item, index }: { item: HadithBook; index: number }) {
  const { colors, gradients, scheme } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const bookGradients = makeBookGradients(gradients);
  const gradient = bookGradients[index % bookGradients.length];

  return (
    <Animated.View entering={FadeInDown.springify().delay(index * 70)} style={styles.cardWrap}>
      <PressableScale
        onPress={() => router.push({ pathname: '/hadith/[kitab]', params: { kitab: item.id, name: item.name } })}
        style={styles.pressArea}
      >
        <LinearGradient
          colors={[...gradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: scheme === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.55)' },
            ]}
          >
            <Ionicons name="book" size={22} color={colors.gold} />
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.cardCount}>{item.available.toLocaleString('id-ID')} hadits</Text>
        </LinearGradient>
      </PressableScale>
    </Animated.View>
  );
}

export default function HadithIndexScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['hadith-books'],
    queryFn: getHadithBooks,
  });

  return (
    <Screen scroll>
      <PageHeader title="Kitab Hadits" subtitle="9 kitab hadits pilihan" />
      {isPending ? <SkeletonList count={6} height={158} /> : null}
      {isError && !data ? <ErrorState onRetry={() => refetch()} /> : null}
      {data ? (
        <View style={styles.grid}>
          {data.map((item, index) => (
            <BookCard key={item.id} item={item} index={index} />
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    cardWrap: {
      width: '48.5%',
    },
    pressArea: {
      borderRadius: radius.lg,
    },
    card: {
      padding: spacing.base,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      minHeight: 150,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    cardTitle: {
      fontFamily: font.bold,
      fontSize: 15,
      lineHeight: 20,
      color: c.text,
    },
    cardCount: {
      fontFamily: font.regular,
      fontSize: 12,
      color: c.textMuted,
      marginTop: spacing.xs + 1,
    },
  });
