import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ScrollIndicatorEnd } from '@/components/ensiklopedi-scroll-indicator-end';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingView } from '@/components/ui/loading';
import { PageHeader } from '@/components/ui/page-header';
import { Screen } from '@/components/ui/screen';
import { registerStrings, useLang } from '@/i18n';
import { getKisahNabi } from '@/lib/api';
import { font, radius, shadow, spacing, ThemeColors, useTheme } from '@/theme';

registerStrings('kisahDetail', {
  title: 'Kisah Nabi',
  loading: 'Memuat kisah nabi...',
  error: 'Gagal memuat kisah nabi.',
  notFoundTitle: 'Tidak ditemukan',
  notFoundMessage: 'Kisah yang Anda cari tidak tersedia atau nomor tidak valid.',
  order: 'Kisah ke-{n} dari 25',
  age: 'Usia {years} thn',
  birthYear: 'Lahir {year}',
}, {
  title: 'Prophet Stories',
  loading: 'Loading prophet stories...',
  error: 'Failed to load prophet stories.',
  notFoundTitle: 'Not found',
  notFoundMessage: 'The story you are looking for is unavailable or the number is invalid.',
  order: 'Story {n} of 25',
  age: 'Lived {years} yrs',
  birthYear: 'Born {year}',
});

const REMAINING_THRESHOLD = 320;

function getInitials(name: string): string {
  const clean = name.replace(/^Nabi\s+/i, '').trim();
  return clean.slice(0, 2).toUpperCase();
}

export default function KisahNabiDetailScreen() {
  const { t } = useLang();
  const { index } = useLocalSearchParams<{ index: string }>();
  const { colors, gradients, typography } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['kisah-nabi'],
    queryFn: getKisahNabi,
  });

  const scrollRef = useRef<ScrollView | null>(null);
  const offset = useRef(0);
  const contentHeight = useRef(0);
  const viewHeight = useRef(0);
  const [showEnd, setShowEnd] = useState(false);

  const evaluate = useCallback(() => {
    const remaining = contentHeight.current - viewHeight.current - offset.current;
    setShowEnd(remaining > REMAINING_THRESHOLD);
  }, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      offset.current = event.nativeEvent.contentOffset.y;
      contentHeight.current = event.nativeEvent.contentSize.height;
      viewHeight.current = event.nativeEvent.layoutMeasurement.height;
      evaluate();
    },
    [evaluate],
  );

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      viewHeight.current = event.nativeEvent.layout.height;
      evaluate();
    },
    [evaluate],
  );

  const handleContentSizeChange = useCallback(
    (_width: number, height: number) => {
      contentHeight.current = height;
      evaluate();
    },
    [evaluate],
  );

  const handleScrollToEnd = useCallback(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, []);

  const parsedIndex = Number.parseInt(index ?? '', 10);
  const item =
    data !== undefined && !Number.isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < data.length
      ? data[parsedIndex]
      : undefined;

  return (
    <Screen contentStyle={styles.screenContent}>
      <PageHeader title={t('kisahDetail.title')} subtitle={item?.name} />
      {isPending ? (
        <LoadingView label={t('kisahDetail.loading')} />
      ) : isError ? (
        <ErrorState message={t('kisahDetail.error')} onRetry={() => refetch()} />
      ) : !item ? (
        <View style={styles.notFound}>
          <Ionicons name="book-outline" size={48} color={colors.textMuted} />
          <Text style={[typography.h2, styles.notFoundTitle]}>{t('kisahDetail.notFoundTitle')}</Text>
          <Text style={[typography.caption, styles.notFoundMessage]}>
            {t('kisahDetail.notFoundMessage')}
          </Text>
        </View>
      ) : (
        <View style={styles.reader}>
          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onLayout={handleLayout}
            onContentSizeChange={handleContentSizeChange}
          >
            <Animated.View
              entering={FadeInDown.duration(450)}
              collapsable={false}
              style={styles.heroWrap}
            >
              <LinearGradient
                colors={[...gradients.emerald]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.hero}
              >
                <View style={styles.heroTop}>
                  <LinearGradient
                    colors={[...gradients.gold]}
                    style={styles.heroAvatar}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.heroAvatarText}>{getInitials(item.name)}</Text>
                  </LinearGradient>
                  <View style={styles.heroInfo}>
                    <Text style={styles.heroOrder}>{t('kisahDetail.order', { n: parsedIndex + 1 })}</Text>
                    <Text style={styles.heroName}>{item.name}</Text>
                  </View>
                </View>
                <View style={styles.heroChips}>
                   <View style={styles.chip}>
                     <Ionicons name="time-outline" size={12} color={colors.primary} />
                     <Text style={styles.chipText}>{t('kisahDetail.age', { years: item.usia })}</Text>
                   </View>
                   <View style={styles.chipGold}>
                     <Ionicons name="calendar-outline" size={12} color={colors.gold} />
                     <Text style={styles.chipTextGold}>{t('kisahDetail.birthYear', { year: item.thn_kelahiran })}</Text>
                   </View>
                </View>
              </LinearGradient>
            </Animated.View>
            <View style={styles.paragraphs}>
              {item.description
                .split('\n\n')
                .filter((paragraph) => paragraph.trim().length > 0)
                .map((paragraph, i) => (
                  <Animated.Text
                    key={`${parsedIndex}-${i}`}
                    entering={FadeInDown.duration(400).delay(i * 80)}
                    style={typography.body}
                  >
                    {paragraph.trim()}
                  </Animated.Text>
                ))}
            </View>
          </ScrollView>
          <ScrollIndicatorEnd visible={showEnd} onPress={handleScrollToEnd} />
        </View>
      )}
    </Screen>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    screenContent: {
      paddingBottom: 0,
    },
    flex: {
      flex: 1,
    },
    reader: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: spacing.xxxl,
    },
    heroWrap: {
      borderRadius: radius.xl,
      overflow: 'hidden',
      ...shadow.card,
    },
    hero: {
      padding: spacing.lg,
      gap: spacing.lg,
    },
    heroTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    heroAvatar: {
      width: 68,
      height: 68,
      borderRadius: 34,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.borderStrong,
    },
    heroAvatarText: {
      fontFamily: font.extrabold,
      fontSize: 24,
      color: c.gold,
    },
    heroInfo: {
      flex: 1,
      gap: 2,
    },
    heroOrder: {
      fontFamily: font.semibold,
      fontSize: 11,
      color: c.primary,
    },
    heroName: {
      fontFamily: font.bold,
      fontSize: 20,
      lineHeight: 26,
      color: c.text,
    },
    heroChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.md,
      paddingVertical: 4,
      borderRadius: radius.full,
      backgroundColor: c.primarySoft,
      borderWidth: 1,
      borderColor: c.border,
    },
    chipGold: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.md,
      paddingVertical: 4,
      borderRadius: radius.full,
      backgroundColor: c.goldSoft,
      borderWidth: 1,
      borderColor: c.border,
    },
    chipText: {
      fontFamily: font.semibold,
      fontSize: 12,
      color: c.primary,
    },
    chipTextGold: {
      fontFamily: font.semibold,
      fontSize: 12,
      color: c.gold,
    },
    paragraphs: {
      marginTop: spacing.lg,
      gap: spacing.base,
    },
    notFound: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.xxxl,
    },
    notFoundTitle: {
      marginTop: spacing.md,
    },
    notFoundMessage: {
      textAlign: 'center',
      maxWidth: 260,
    },
  });
