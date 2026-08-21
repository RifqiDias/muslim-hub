import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { ArabicText } from '@/components/ui/arabic-text';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingView } from '@/components/ui/loading';
import { PressableScale } from '@/components/ui/pressable-scale';
import { SkeletonBlock } from '@/components/ui/skeleton';
import { registerStrings, useLang } from '@/i18n';
import { getMushaf } from '@/lib/api';
import { getJSON, setJSON } from '@/lib/storage';
import { MushafAyah } from '@/lib/types';
import { ThemeColors, font, radius, spacing, useTheme } from '@/theme';

registerStrings('mushaf', {
  title: 'Mode Mushaf',
  loading: 'Menyiapkan mushaf...',
  page: 'Halaman',
  pageOf: '{current} / {total}',
  openSurah: 'Buka Surah',
  fontSize: 'Ukuran Huruf',
  resume: 'Lanjutkan bacaan',
}, {
  title: 'Mushaf Mode',
  loading: 'Preparing mushaf...',
  page: 'Page',
  pageOf: '{current} / {total}',
  openSurah: 'Open Surah',
  fontSize: 'Font Size',
  resume: 'Continue reading',
});

const LAST_PAGE_KEY = 'muslimhub.mushaf.lastPage';

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

function toArabicNumber(value: number): string {
  return String(value)
    .split('')
    .map((digit) => ARABIC_DIGITS[Number(digit)] ?? digit)
    .join('');
}

const FONT_STEPS = [22, 26, 30, 34];

interface PageBlock {
  type: 'header' | 'ayah';
  ayah?: MushafAyah;
  surahNumber?: number;
  surahName?: string;
}

function buildPageBlocks(items: MushafAyah[], surahNames: Record<number, string>): PageBlock[] {
  const blocks: PageBlock[] = [];
  for (const item of items) {
    if (item.ayah === 1) {
      blocks.push({ type: 'header', surahNumber: item.surah, surahName: surahNames[item.surah] });
    }
    blocks.push({ type: 'ayah', ayah: item });
  }
  return blocks;
}

export default function MushafScreen() {
  const { t } = useLang();
  const { colors, scheme } = useTheme();
  const styles = useMemo(() => makeStyles(colors, scheme), [colors, scheme]);

  const { page: pageParam, surah: surahParam } = useLocalSearchParams<{ page?: string; surah?: string }>();
  const { width, height } = useWindowDimensions();
  const listRef = useRef<FlatList>(null);

  const [currentPage, setCurrentPage] = useState(() => {
    const parsed = Number.parseInt(pageParam ?? '', 10);
    return Number.isNaN(parsed) ? 0 : Math.min(Math.max(parsed - 1, 0), 603);
  });
  const [chromeVisible, setChromeVisible] = useState(true);
  const [fontStep, setFontStep] = useState(1);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['mushaf'],
    queryFn: getMushaf,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
  });

  useEffect(() => {
    if (!data) return;
    let active = true;
    const resolveTarget = async (): Promise<number | null> => {
      const pageParsed = Number.parseInt(pageParam ?? '', 10);
      if (!Number.isNaN(pageParsed)) {
        return Math.min(Math.max(pageParsed - 1, 0), data.pages.length - 1);
      }
      const surahParsed = Number.parseInt(surahParam ?? '', 10);
      if (!Number.isNaN(surahParsed) && data.surahFirstPage[surahParsed]) {
        return data.surahFirstPage[surahParsed] - 1;
      }
      const saved = await getJSON<number>(LAST_PAGE_KEY);
      if (typeof saved === 'number' && saved >= 1 && saved <= data.pages.length) {
        return saved - 1;
      }
      return null;
    };
    resolveTarget().then((target) => {
      if (!active || target === null || target === currentPage) return;
      setCurrentPage(target);
      listRef.current?.scrollToIndex({ index: target, animated: false });
    });
    return () => {
      active = false;
    };
  }, [data, pageParam, surahParam, currentPage]);

  useEffect(() => {
    setJSON(LAST_PAGE_KEY, currentPage + 1);
  }, [currentPage]);

  if (isPending) {
    return (
      <View style={styles.flex}>
        <SafeAreaView style={styles.loadingWrap} edges={['top', 'bottom']}>
          <LoadingView label={t('mushaf.loading')} />
          <View style={styles.loadingPageWrap} pointerEvents="none">
            <SkeletonBlock width="92%" height={height * 0.66} radius={radius.xl} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.flex}>
        <SafeAreaView style={styles.errorWrap} edges={['top', 'bottom']}>
          <ErrorState onRetry={() => refetch()} />
        </SafeAreaView>
      </View>
    );
  }

  const pages = data.pages;
  const arabicSize = FONT_STEPS[Math.min(fontStep, FONT_STEPS.length - 1)];

  const renderItem = ({ index }: { index: number }) => {
    const items = pages[index];
    const blocks = buildPageBlocks(items, data.surahNames);
    const firstAyah = items[0];

    return (
      <Pressable style={[styles.page, { width }]} onPress={() => setChromeVisible((value) => !value)}>
        <View style={styles.pagePaper}>
          {blocks.map((block, blockIndex) => {
            if (block.type === 'header' && block.surahNumber && block.surahName) {
              const showBismillah = block.surahNumber !== 1 && block.surahNumber !== 9;
              return (
                <View key={`h-${blockIndex}`} style={styles.headerBlock}>
                  <View style={styles.surahRule} />
                  <ArabicText size={20} bold center color={colors.primary}>
                    {block.surahName.replace('سُورَةُ ', '')}
                  </ArabicText>
                  <View style={styles.surahRule} />
                  {showBismillah ? (
                    <ArabicText size={arabicSize - 4} center color={colors.textMuted}>
                      بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                    </ArabicText>
                  ) : null}
                </View>
              );
            }
            const ayah = block.ayah;
            if (!ayah) return null;
            return (
              <ArabicText key={`a-${ayah.surah}-${ayah.ayah}`} size={arabicSize} style={styles.ayahFlow}>
                {ayah.text}
                <Text style={styles.ayahMarker}> ﴿{toArabicNumber(ayah.ayah)}﴾</Text>
              </ArabicText>
            );
          })}
        </View>
        <View style={styles.pageFooter}>
          <View style={styles.pageNumberChip}>
            <Text style={styles.pageNumberText}>{toArabicNumber(index + 1)}</Text>
          </View>
        </View>
        {firstAyah ? null : <View />}
      </Pressable>
    );
  };

  const currentSurah = pages[currentPage]?.[0]?.surah ?? 1;

  return (
    <View style={styles.flex}>
      <FlatList
        ref={listRef}
        data={pages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => String(index)}
        renderItem={renderItem}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        initialScrollIndex={Math.min(currentPage, pages.length - 1)}
        onMomentumScrollEnd={(event) => {
          const next = Math.round(event.nativeEvent.contentOffset.x / width);
          if (next !== currentPage && next >= 0 && next < pages.length) {
            setCurrentPage(next);
            setChromeVisible(false);
          }
        }}
        windowSize={2}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
      />

      {chromeVisible ? (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.chrome} pointerEvents="box-none">
          <SafeAreaView style={styles.chromeSafe} edges={['top']}>
            <View style={styles.chromeBar}>
              <PressableScale onPress={() => router.back()} style={styles.chromeBtn} hitSlop={8}>
                <Ionicons name="arrow-back" size={20} color={colors.text} />
              </PressableScale>
              <View style={styles.chromeTitles}>
                <Text style={styles.chromeTitle} numberOfLines={1}>
                  {t('mushaf.title')}
                </Text>
                <Text style={styles.chromeSubtitle} numberOfLines={1}>
                  {t('mushaf.pageOf', { current: currentPage + 1, total: pages.length })}
                </Text>
              </View>
              <PressableScale
                onPress={() => setFontStep((step) => (step + 1) % FONT_STEPS.length)}
                style={styles.chromeBtn}
                hitSlop={8}
              >
                <Ionicons name="text" size={20} color={colors.text} />
              </PressableScale>
              <PressableScale
                onPress={() =>
                  router.push({ pathname: '/quran/[surah]', params: { surah: String(currentSurah) } })
                }
                style={styles.chromeBtn}
                hitSlop={8}
              >
                <Ionicons name="list" size={20} color={colors.text} />
              </PressableScale>
            </View>
          </SafeAreaView>
        </Animated.View>
      ) : null}
    </View>
  );
}

const makeStyles = (c: ThemeColors, scheme: 'light' | 'dark') =>
  StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: c.bg,
    },
    loadingWrap: {
      flex: 1,
      paddingHorizontal: spacing.base,
    },
    loadingPageWrap: {
      alignItems: 'center',
      marginTop: spacing.lg,
    },
    errorWrap: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.base,
    },
    page: {
      flex: 1,
      paddingHorizontal: 10,
      paddingVertical: spacing.base,
    },
    pagePaper: {
      flex: 1,
      backgroundColor: scheme === 'dark' ? c.surface : c.white,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.lg,
      borderLeftWidth: 4,
      borderLeftColor: c.gold,
    },
    headerBlock: {
      alignItems: 'center',
      gap: spacing.sm,
      marginVertical: spacing.md,
      paddingHorizontal: spacing.md,
    },
    surahRule: {
      height: 1,
      alignSelf: 'stretch' as const,
      backgroundColor: c.borderStrong,
    },
    ayahFlow: {
      textAlign: 'justify',
      marginBottom: 2,
    },
    ayahMarker: {
      fontFamily: font.arabic,
      color: c.primary,
      fontSize: 18,
    },
    pageFooter: {
      flexDirection: 'row',
      justifyContent: 'center',
      paddingVertical: spacing.sm,
    },
    pageNumberChip: {
      minWidth: 64,
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: 4,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: c.gold,
      backgroundColor: c.goldSoft,
    },
    pageNumberText: {
      fontFamily: font.arabic,
      fontSize: 15,
      color: c.gold,
    },
    chrome: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
    },
    chromeSafe: {
      alignItems: 'stretch',
    },
    chromeBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginHorizontal: spacing.base,
      marginTop: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: scheme === 'dark' ? 'rgba(10,21,18,0.92)' : 'rgba(255,255,255,0.95)',
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: c.border,
    },
    chromeBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: scheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(23,39,32,0.06)',
    },
    chromeTitles: {
      flex: 1,
      alignItems: 'center',
    },
    chromeTitle: {
      fontFamily: font.bold,
      fontSize: 14,
      color: c.text,
    },
    chromeSubtitle: {
      fontFamily: font.regular,
      fontSize: 11,
      color: c.textMuted,
      marginTop: 1,
    },
  });
