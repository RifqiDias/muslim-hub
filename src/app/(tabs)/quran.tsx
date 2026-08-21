import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArabicText } from '@/components/ui/arabic-text';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen } from '@/components/ui/screen';
import { SearchBar } from '@/components/ui/search-bar';
import { SkeletonList } from '@/components/ui/skeleton';
import { registerStrings, useLang } from '@/i18n';
import { getSurahListJson } from '@/lib/api';
import { getJSON, StorageKeys } from '@/lib/storage';
import { QuranJsonSurah } from '@/lib/types';
import { ThemeColors, font, radius, spacing, useTheme } from '@/theme';

registerStrings('quranList', {
  title: "Al Qur'an",
  subtitle: '114 Surah · Terjemahan & Tafsir',
  lastRead: 'Terakhir dibaca',
  verses: '{count} ayat',
  makkiyah: 'Makkiyah',
  madaniyah: 'Madaniyah',
  notFound: 'Tidak ditemukan',
  notFoundHint: 'Tidak ada surah yang cocok dengan pencarian Anda.',
  mushaf: 'Mode Mushaf',
}, {
  title: "The Qur'an",
  subtitle: '114 Surahs · Translation & Tafsir',
  lastRead: 'Last read',
  verses: '{count} verses',
  makkiyah: 'Makkiyah',
  madaniyah: 'Madaniyah',
  notFound: 'Not found',
  notFoundHint: 'No surah matches your search.',
  mushaf: 'Mushaf Mode',
});

interface LastRead {
  number: number;
  name: string;
  ayat: number;
}

export default function QuranListScreen() {
  const { t, lang } = useLang();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [query, setQuery] = useState('');
  const [lastRead, setLastRead] = useState<LastRead | null>(null);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['quranjson-list'],
    queryFn: getSurahListJson,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  useEffect(() => {
    getJSON<LastRead>(StorageKeys.lastReadSurah).then((value) => setLastRead(value));
  }, []);

  const meaning = useMemo(
    () => (item: QuranJsonSurah) => item.name_translations[lang] ?? item.name_translations.id,
    [lang],
  );

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        meaning(item).toLowerCase().includes(q) ||
        String(item.number_of_surah) === q,
    );
  }, [data, query, meaning]);

  return (
    <Screen scroll={false} contentStyle={styles.screenContent}>
      <PageHeader
        back={false}
        title={t('quranList.title')}
        subtitle={t('quranList.subtitle')}
        right={
          <PressableScale onPress={() => router.push('/quran/mushaf')} style={styles.mushafBtn} hitSlop={8}>
            <Ionicons name="book" size={20} color={colors.gold} />
          </PressableScale>
        }
      />
      <SearchBar value={query} onChangeText={setQuery} placeholder={t('common.search')} />
      {isPending ? (
        <View style={styles.body}>
          <SkeletonList count={7} height={92} />
        </View>
      ) : isError ? (
        <View style={styles.body}>
          <ErrorState onRetry={() => refetch()} />
        </View>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={filtered}
          keyExtractor={(item) => String(item.number_of_surah)}
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            lastRead ? (
              <PressableScale
                onPress={() =>
                  router.push({ pathname: '/quran/[surah]', params: { surah: String(lastRead.number) } })
                }
                style={styles.lastReadPress}
              >
                <View style={styles.lastReadCard}>
                  <View style={styles.lastReadIcon}>
                    <Ionicons name="bookmark" size={16} color={colors.primary} />
                  </View>
                  <View style={styles.lastReadTexts}>
                    <Text style={styles.lastReadLabel}>{t('quranList.lastRead')}</Text>
                    <Text style={styles.lastReadName} numberOfLines={1}>
                      {lastRead.name}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
                </View>
              </PressableScale>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={44} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>{t('quranList.notFound')}</Text>
              <Text style={styles.emptyMessage}>{t('quranList.notFoundHint')}</Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <SurahRow
              item={item}
              index={index}
              meaning={meaning(item)}
              versesLabel={t('quranList.verses', { count: item.number_of_ayah })}
            />
          )}
        />
      )}
    </Screen>
  );
}

function SurahRow({
  item,
  index,
  meaning,
  versesLabel,
}: {
  item: QuranJsonSurah;
  index: number;
  meaning: string;
  versesLabel: string;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Animated.View entering={FadeInDown.springify().delay(Math.min(index, 12) * 40)}>
      <PressableScale
        onPress={() =>
          router.push({ pathname: '/quran/[surah]', params: { surah: String(item.number_of_surah) } })
        }
        style={styles.rowPress}
        scaleTo={0.98}
      >
        <View style={styles.row}>
          <Text style={styles.numberText}>{item.number_of_surah}</Text>
          <View style={styles.rowTexts}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              {meaning} · {versesLabel}
            </Text>
          </View>
          <ArabicText size={18} color={colors.gold} numberOfLines={1}>
            {item.name_translations.ar}
          </ArabicText>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },
    screenContent: {
      flex: 1,
      paddingHorizontal: 8,
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: 0,
      paddingTop: spacing.md,
      paddingBottom: spacing.xxl,
    },
    body: {
      flex: 1,
      paddingTop: spacing.md,
    },
    lastReadPress: {
      borderRadius: radius.lg,
      marginBottom: spacing.md,
    },
    lastReadCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: c.primarySoft,
      borderWidth: 1,
      borderColor: c.primary,
      borderRadius: radius.lg,
      padding: spacing.md,
    },
    lastReadIcon: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    lastReadTexts: {
      flex: 1,
    },
    lastReadLabel: {
      fontFamily: font.semibold,
      fontSize: 11,
      color: c.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    lastReadName: {
      fontFamily: font.bold,
      fontSize: 15,
      color: c.text,
      marginTop: 1,
    },
    empty: {
      alignItems: 'center',
      paddingVertical: spacing.xxxl,
      gap: spacing.xs,
    },
    mushafBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    emptyTitle: {
      fontFamily: font.bold,
      fontSize: 16,
      color: c.text,
      marginTop: spacing.md,
    },
    emptyMessage: {
      fontFamily: font.regular,
      fontSize: 12.5,
      color: c.textMuted,
      maxWidth: 240,
      textAlign: 'center',
    },
    rowPress: {
      borderRadius: radius.md,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: 12,
      paddingHorizontal: 0,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    numberText: {
      width: 26,
      textAlign: 'center',
      fontFamily: font.semibold,
      fontSize: 12.5,
      fontVariant: ['tabular-nums'],
      color: c.textFaint,
    },
    rowTexts: {
      flex: 1,
    },
    name: {
      fontFamily: font.semibold,
      fontSize: 15,
      color: c.text,
    },
    meta: {
      fontFamily: font.regular,
      fontSize: 11.5,
      color: c.textMuted,
      marginTop: 1,
    },
  });
