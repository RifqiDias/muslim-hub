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
import { useCallback, useRef, useState } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ScrollIndicatorEnd } from '@/components/ensiklopedi-scroll-indicator-end';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingView } from '@/components/ui/loading';
import { PageHeader } from '@/components/ui/page-header';
import { Screen } from '@/components/ui/screen';
import { getKisahNabi } from '@/lib/api';
import { colors, font, gradients, radius, shadow, spacing, typography } from '@/theme';

const REMAINING_THRESHOLD = 320;

function getInitials(name: string): string {
  const clean = name.replace(/^Nabi\s+/i, '').trim();
  return clean.slice(0, 2).toUpperCase();
}

export default function KisahNabiDetailScreen() {
  const { index } = useLocalSearchParams<{ index: string }>();
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
      <PageHeader title="Kisah Nabi" subtitle={item?.name} />
      {isPending ? (
        <LoadingView label="Memuat kisah nabi..." />
      ) : isError ? (
        <ErrorState message="Gagal memuat kisah nabi." onRetry={() => refetch()} />
      ) : !item ? (
        <View style={styles.notFound}>
          <Ionicons name="book-outline" size={48} color={colors.textMuted} />
          <Text style={styles.notFoundTitle}>Tidak ditemukan</Text>
          <Text style={styles.notFoundMessage}>
            Kisah yang Anda cari tidak tersedia atau nomor tidak valid.
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
                    <Text style={styles.heroOrder}>Kisah ke-{parsedIndex + 1} dari 25</Text>
                    <Text style={styles.heroName}>{item.name}</Text>
                  </View>
                </View>
                <View style={styles.heroChips}>
                  <View style={styles.chip}>
                    <Ionicons name="time-outline" size={12} color={colors.primary} />
                    <Text style={styles.chipText}>Usia {item.usia}</Text>
                  </View>
                  <View style={styles.chipGold}>
                    <Ionicons name="calendar-outline" size={12} color={colors.gold} />
                    <Text style={styles.chipTextGold}>Lahir {item.thn_kelahiran}</Text>
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
                    style={styles.paragraph}
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

const styles = StyleSheet.create({
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
    borderColor: colors.borderStrong,
  },
  heroAvatarText: {
    fontFamily: font.extrabold,
    fontSize: 24,
    color: colors.bgDeep,
  },
  heroInfo: {
    flex: 1,
    gap: 2,
  },
  heroOrder: {
    fontFamily: font.semibold,
    fontSize: 11,
    color: colors.primary,
  },
  heroName: {
    fontFamily: font.bold,
    fontSize: 20,
    lineHeight: 26,
    color: colors.text,
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
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipGold: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    fontFamily: font.semibold,
    fontSize: 12,
    color: colors.primary,
  },
  chipTextGold: {
    fontFamily: font.semibold,
    fontSize: 12,
    color: colors.gold,
  },
  paragraphs: {
    marginTop: spacing.lg,
    gap: spacing.base,
  },
  paragraph: {
    ...typography.body,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxxl,
  },
  notFoundTitle: {
    ...typography.h2,
    marginTop: spacing.md,
  },
  notFoundMessage: {
    ...typography.caption,
    textAlign: 'center',
    maxWidth: 260,
  },
});
