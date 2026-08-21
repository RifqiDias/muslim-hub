import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { ArabicText } from '@/components/ui/arabic-text';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen } from '@/components/ui/screen';
import { SkeletonList } from '@/components/ui/skeleton';
import { registerStrings, useLang } from '@/i18n';
import { getDzikir } from '@/lib/api';
import { DzikirItem, DzikirKind } from '@/lib/types';
import { font, radius, spacing, useTheme, type ThemeColors } from '@/theme';

registerStrings('dzikirRead', {
  pagiTitle: 'Dzikir Pagi',
  pagiSubtitle: 'Bacaan dzikir waktu pagi',
  petangTitle: 'Dzikir Petang',
  petangSubtitle: 'Bacaan dzikir waktu petang',
  setelahShalatTitle: 'Dzikir Setelah Shalat',
  setelahShalatSubtitle: 'Bacaan dzikir setelah shalat fardhu',
  fawaid: 'Keutamaan',
}, {
  pagiTitle: 'Morning Dhikr',
  pagiSubtitle: 'Morning dhikr recitations',
  petangTitle: 'Evening Dhikr',
  petangSubtitle: 'Evening dhikr recitations',
  setelahShalatTitle: 'After Prayer',
  setelahShalatSubtitle: 'Dhikr recited after obligatory prayers',
  fawaid: 'Virtues',
});

const TYPE_CONFIG: Record<string, { kind: DzikirKind; label: string }> = {
  pagi: { kind: 'dzikir-pagi', label: 'pagi' },
  petang: { kind: 'dzikir-petang', label: 'petang' },
  'setelah-shalat': { kind: 'dzikir-setelah-shalat', label: 'setelahShalat' },
};

export default function DzikirReaderScreen() {
  const { t } = useLang();
  const { colors, gradients, typography } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { type } = useLocalSearchParams<{ type: string }>();
  const config = TYPE_CONFIG[type ?? ''] ?? TYPE_CONFIG.pagi;

  const screenWidth = Dimensions.get('window').width;
  const trackWidth = screenWidth - 40;

  const listRef = useRef<FlatList<DzikirItem>>(null);
  const scrollX = useSharedValue(0);
  const [page, setPage] = useState(0);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['dzikir', type],
    queryFn: () => getDzikir(config.kind),
  });

  const items = useMemo(() => data ?? [], [data]);
  const total = items.length;
  const maxScroll = Math.max(total - 1, 0) * screenWidth;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const fillStyle = useAnimatedStyle(() => ({
    width:
      total > 1
        ? interpolate(scrollX.value, [0, maxScroll], [12, trackWidth], 'clamp')
        : trackWidth,
  }));

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setPage(Math.min(Math.max(next, 0), Math.max(total - 1, 0)));
  };

  const goToPage = (index: number) => {
    listRef.current?.scrollToIndex({ index, animated: true });
    setPage(index);
  };

  return (
    <Screen contentStyle={{ paddingHorizontal: 0, paddingTop: 0 }}>
      <View style={styles.headerWrap}>
        <PageHeader title={t(`dzikirRead.${config.label}Title`)} subtitle={t(`dzikirRead.${config.label}Subtitle`)} />
        {total > 0 ? (
          <Animated.View entering={FadeInDown.duration(400).delay(80)} style={styles.progressRow}>
            <View style={[styles.track, { width: trackWidth }]}>
              <Animated.View style={[styles.fillWrap, fillStyle]}>
                <LinearGradient
                  colors={[...gradients.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.fillGradient, { width: trackWidth }]}
                />
              </Animated.View>
            </View>
            <Text style={[typography.caption, styles.progressText]}>
              <Text style={styles.progressCurrent}>{Math.min(page + 1, total)}</Text>
              {' / '}
              {total}
            </Text>
          </Animated.View>
        ) : null}
      </View>

      {isPending ? (
        <View style={styles.stateWrap}>
          <SkeletonList count={3} height={150} />
        </View>
      ) : isError ? (
        <View style={styles.stateWrap}>
          <ErrorState message={error?.message} onRetry={() => refetch()} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={items}
          keyExtractor={(_, index) => `dzikir-${index}`}
          horizontal
          pagingEnabled
          snapToInterval={screenWidth}
          snapToAlignment="start"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onScroll={scrollHandler}
          onMomentumScrollEnd={handleMomentumEnd}
          getItemLayout={(_, index) => ({ length: screenWidth, offset: screenWidth * index, index })}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <DzikirPage item={item} width={screenWidth} />}
        />
      )}

      {total > 1 ? (
        <View style={styles.dotsRow}>
          {items.map((_, index) => (
            <DzikirDot
              key={`dot-${index}`}
              index={index}
              pageSize={screenWidth}
              scrollX={scrollX}
              onPress={() => goToPage(index)}
            />
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

function DzikirPage({ item, width }: { item: DzikirItem; width: number }) {
  const { t } = useLang();
  const { colors, typography } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <ScrollView
      style={{ width }}
      contentContainerStyle={styles.pageContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={typography.h2}>{item.title}</Text>
      <ArabicText size={34} style={styles.arabic}>
        {item.arabic}
      </ArabicText>
      {item.latin ? <Text style={styles.latin}>{item.latin}</Text> : null}
      <Text style={typography.body}>{item.translation}</Text>
      {item.notes ? (
        <View style={styles.noteChip}>
          <Text style={styles.noteText}>{item.notes}</Text>
        </View>
      ) : null}
      {item.fawaid ? (
        <View style={styles.fawaidCard}>
          <Text style={styles.fawaidLabel}>{t('dzikirRead.fawaid')}</Text>
          <Text style={[typography.body, styles.fawaidText]}>{item.fawaid}</Text>
        </View>
      ) : null}
      {item.source ? <Text style={[typography.caption, styles.source]}>{item.source}</Text> : null}
    </ScrollView>
  );
}

function DzikirDot({
  index,
  pageSize,
  scrollX,
  onPress,
}: {
  index: number;
  pageSize: number;
  scrollX: SharedValue<number>;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const center = index * pageSize;

  const dotStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, [center - pageSize, center, center + pageSize], [0.3, 1, 0.3], 'clamp'),
    transform: [
      { scaleX: interpolate(scrollX.value, [center - pageSize, center, center + pageSize], [1, 2.4, 1], 'clamp') },
    ],
  }));

  return (
    <PressableScale onPress={onPress} haptic={false} hitSlop={6} style={styles.dotPress}>
      <Animated.View style={[styles.dot, dotStyle]} />
    </PressableScale>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    headerWrap: {
      paddingHorizontal: spacing.base + 4,
    },
    progressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    track: {
      height: 8,
      borderRadius: radius.full,
      backgroundColor: c.surfaceAlt,
      overflow: 'hidden',
    },
    fillWrap: {
      height: 8,
      borderRadius: radius.full,
      overflow: 'hidden',
    },
    fillGradient: {
      height: 8,
    },
    progressText: {
      fontFamily: font.semibold,
      color: c.textMuted,
      minWidth: 52,
      textAlign: 'right',
    },
    progressCurrent: {
      fontFamily: font.bold,
      fontSize: 13,
      color: c.primary,
    },
    list: {
      flex: 1,
    },
    listContent: {
      alignItems: 'stretch',
    },
    stateWrap: {
      flex: 1,
      paddingHorizontal: spacing.base + 4,
      paddingTop: spacing.sm,
    },
    pageContent: {
      flexGrow: 1,
      paddingHorizontal: spacing.base + 4,
      paddingVertical: spacing.md,
      paddingBottom: spacing.xxl,
      gap: spacing.md,
    },
    arabic: {
      marginTop: spacing.sm,
    },
    latin: {
      fontFamily: font.regular,
      fontStyle: 'italic',
      fontSize: 14,
      lineHeight: 22,
      color: c.textMuted,
    },
    noteChip: {
      alignSelf: 'flex-start',
      backgroundColor: c.goldSoft,
      borderWidth: 1,
      borderColor: c.gold,
      borderRadius: radius.full,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.sm - 2,
    },
    noteText: {
      fontFamily: font.semibold,
      fontSize: 12,
      color: c.gold,
    },
    fawaidCard: {
      backgroundColor: c.primarySoft,
      borderWidth: 1,
      borderColor: c.primary,
      borderRadius: radius.lg,
      padding: spacing.base,
      gap: spacing.xs,
    },
    fawaidLabel: {
      fontFamily: font.bold,
      fontSize: 12,
      color: c.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    fawaidText: {
      fontSize: 13,
      lineHeight: 20,
    },
    source: {
      color: c.textFaint,
    },
    dotsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.base,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
    },
    dotPress: {
      padding: 3,
    },
    dot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: c.primary,
    },
  });
