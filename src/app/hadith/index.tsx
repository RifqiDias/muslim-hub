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
import { getHadithBooks } from '@/lib/api';
import { HadithBook } from '@/lib/types';
import { font, radius, spacing, useTheme, ThemeColors, ThemeGradients } from '@/theme';

registerStrings('hadithList', {
  title: 'Kitab Hadits',
  subtitle: '9 kitab hadits pilihan',
  count: '{count} hadits',
}, {
  title: 'Hadith Books',
  subtitle: '9 curated hadith books',
  count: '{count} hadiths',
});

const makeBookGradients = (g: ThemeGradients): readonly (readonly [string, string])[] => [
  g.emerald,
  g.teal,
  g.gold,
  g.night,
  g.plum,
];

function BookCard({ item, index }: { item: HadithBook; index: number }) {
  const { t, lang } = useLang();
  const { colors, gradients, scheme } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const bookGradients = makeBookGradients(gradients);
  const gradient = bookGradients[index % bookGradients.length];

  return (
    <Animated.View entering={FadeInDown.springify().delay(index * 70)}>
      <PressableScale
        onPress={() => router.push({ pathname: '/hadith/[kitab]', params: { kitab: item.id, name: item.name } })}
        style={styles.pressArea}
        scaleTo={0.975}
      >
        <View style={styles.card}>
          <LinearGradient
            colors={[...gradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.accent}
          />
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: scheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)' },
            ]}
          >
            <Ionicons name="book" size={20} color={colors.gold} />
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.cardCount}>
              {t('hadithList.count', { count: item.available.toLocaleString(lang === 'en' ? 'en-US' : 'id-ID') })}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
        </View>
      </PressableScale>
    </Animated.View>
  );
}

export default function HadithIndexScreen() {
  const { t } = useLang();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['hadith-books'],
    queryFn: getHadithBooks,
  });

  return (
    <Screen scroll>
      <PageHeader title={t('hadithList.title')} subtitle={t('hadithList.subtitle')} />
      {isPending ? <SkeletonList count={9} height={74} /> : null}
      {isError && !data ? <ErrorState onRetry={() => refetch()} /> : null}
      {data ? (
        <View style={styles.list}>
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
    list: {
      gap: spacing.md,
    },
    pressArea: {
      borderRadius: radius.lg,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      paddingLeft: spacing.base + 2,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surface,
      overflow: 'hidden',
    },
    accent: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 5,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: spacing.xs,
    },
    textWrap: {
      flex: 1,
    },
    cardTitle: {
      fontFamily: font.bold,
      fontSize: 15,
      color: c.text,
    },
    cardCount: {
      fontFamily: font.regular,
      fontSize: 12,
      color: c.textMuted,
      marginTop: 2,
    },
  });
